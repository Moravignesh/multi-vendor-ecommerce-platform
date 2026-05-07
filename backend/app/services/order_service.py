"""
Order Service — Core business logic for placing and managing orders.

ORDER SPLITTING LOGIC:
  When a customer checks out, cart items may belong to multiple vendors.
  The algorithm:
    1. Load all cart items with their products.
    2. Group items by product.vendor_id  →  {vendor_id: [items]}
    3. For each vendor group, create one VendorOrder with its OrderItems.
    4. Wrap all VendorOrders under a single master Order for the customer.
    5. Decrement product stock atomically inside a DB transaction.
       If *any* product is out of stock, the whole transaction is rolled back.
"""

import uuid
from collections import defaultdict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from fastapi import HTTPException

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.order import Order, VendorOrder, OrderItem, OrderStatus


def place_order(customer_id: int, db: Session) -> Order:
    # 1. Load cart
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.customer_id == customer_id)
        .first()
    )
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Validate stock and group by vendor (with row-level lock for concurrent safety)
    vendor_groups: dict[int, list] = defaultdict(list)
    for item in cart.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .with_for_update()   # row-level lock prevents overselling
            .first()
        )
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product '{product.name if product else item.product_id}' is no longer available")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}': requested {item.quantity}, available {product.stock}"
            )
        vendor_groups[product.vendor_id].append((item, product))

    # 3. Create master order
    total = sum(p.price * i.quantity for i, p in [pair for pairs in vendor_groups.values() for pair in pairs])
    order = Order(customer_id=customer_id, total_amount=round(total, 2), status=OrderStatus.pending)
    db.add(order)
    db.flush()  # get order.id before adding children

    # 4. Split into vendor sub-orders
    for vendor_id, pairs in vendor_groups.items():
        subtotal = sum(p.price * i.quantity for i, p in pairs)
        vendor_order = VendorOrder(
            order_id=order.id,
            vendor_id=vendor_id,
            subtotal=round(subtotal, 2),
            status=OrderStatus.pending,
        )
        db.add(vendor_order)
        db.flush()

        for item, product in pairs:
            db.add(OrderItem(
                vendor_order_id=vendor_order.id,
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price,
            ))
            # 5. Decrement stock atomically
            product.stock -= item.quantity

    # 6. Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(order)
    return order


def process_payment(order_id: int, simulate_success: bool, db: Session) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.vendor_orders).joinedload(VendorOrder.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail=f"Order already in '{order.status}' state")

    if simulate_success:
        order.status = OrderStatus.paid
        order.payment_ref = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        for vo in order.vendor_orders:
            vo.status = OrderStatus.paid
    else:
        # Simulate payment failure — restore stock
        for vo in order.vendor_orders:
            for oi in vo.items:
                product = db.query(Product).filter(Product.id == oi.product_id).first()
                if product:
                    product.stock += oi.quantity
        order.status = OrderStatus.cancelled
        for vo in order.vendor_orders:
            vo.status = OrderStatus.cancelled

    db.commit()
    db.refresh(order)
    return order


def build_order_out(order: Order, db: Session) -> dict:
    """Serialize an Order with nested VendorOrders, items, and product names."""
    from app.models.user import User
    vendor_orders_out = []
    for vo in order.vendor_orders:
        vendor = db.query(User).filter(User.id == vo.vendor_id).first()
        items_out = []
        for oi in vo.items:
            product = db.query(Product).filter(Product.id == oi.product_id).first()
            items_out.append({
                "id": oi.id,
                "product_id": oi.product_id,
                "product_name": product.name if product else "Deleted Product",
                "quantity": oi.quantity,
                "price_at_purchase": oi.price_at_purchase,
                "subtotal": round(oi.price_at_purchase * oi.quantity, 2),
            })
        vendor_orders_out.append({
            "id": vo.id,
            "vendor_id": vo.vendor_id,
            "vendor_name": vendor.full_name if vendor else "Unknown Vendor",
            "subtotal": vo.subtotal,
            "status": vo.status,
            "items": items_out,
            "created_at": vo.created_at.isoformat() if vo.created_at else None,
        })

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "payment_ref": order.payment_ref,
        "vendor_orders": vendor_orders_out,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }
