from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.order import Order, VendorOrder, OrderStatus
from app.models.user import User
from app.schemas.order import PaymentRequest, VendorOrderStatusUpdate
from app.core.dependencies import get_current_user, require_customer, require_vendor
from app.services.order_service import place_order, process_payment, build_order_out

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", status_code=201)
def checkout(db: Session = Depends(get_db), customer: User = Depends(require_customer)):
    """Place an order from the current cart. Performs order splitting by vendor."""
    order = place_order(customer.id, db)
    order = (
        db.query(Order)
        .options(joinedload(Order.vendor_orders).joinedload(VendorOrder.items))
        .filter(Order.id == order.id)
        .first()
    )
    return build_order_out(order, db)


@router.get("/my", response_model=List[dict])
def my_orders(db: Session = Depends(get_db), customer: User = Depends(require_customer)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.vendor_orders).joinedload(VendorOrder.items))
        .filter(Order.customer_id == customer.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [build_order_out(o, db) for o in orders]


@router.get("/my/{order_id}")
def get_my_order(order_id: int, db: Session = Depends(get_db), customer: User = Depends(require_customer)):
    order = (
        db.query(Order)
        .options(joinedload(Order.vendor_orders).joinedload(VendorOrder.items))
        .filter(Order.id == order_id, Order.customer_id == customer.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return build_order_out(order, db)


@router.post("/{order_id}/pay")
def pay_order(
    order_id: int,
    payload: PaymentRequest,
    db: Session = Depends(get_db),
    customer: User = Depends(require_customer),
):
    """Simulate payment. Set simulate_success=true for success, false for failure."""
    order = db.query(Order).filter(Order.id == order_id, Order.customer_id == customer.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = process_payment(order_id, payload.simulate_success, db)
    order = (
        db.query(Order)
        .options(joinedload(Order.vendor_orders).joinedload(VendorOrder.items))
        .filter(Order.id == order.id)
        .first()
    )
    return build_order_out(order, db)


# ─── Vendor views their sub-orders ───────────────────────────────────────────

@router.get("/vendor/my-orders", response_model=List[dict])
def vendor_orders(db: Session = Depends(get_db), vendor: User = Depends(require_vendor)):
    """Vendors see only their own sub-orders."""
    vos = (
        db.query(VendorOrder)
        .options(joinedload(VendorOrder.items), joinedload(VendorOrder.order))
        .filter(VendorOrder.vendor_id == vendor.id)
        .order_by(VendorOrder.created_at.desc())
        .all()
    )
    result = []
    for vo in vos:
        from app.models.product import Product
        items_out = []
        for oi in vo.items:
            product = db.query(Product).filter(Product.id == oi.product_id).first()
            items_out.append({
                "id": oi.id,
                "product_id": oi.product_id,
                "product_name": product.name if product else "Deleted",
                "quantity": oi.quantity,
                "price_at_purchase": oi.price_at_purchase,
                "subtotal": round(oi.price_at_purchase * oi.quantity, 2),
            })
        result.append({
            "id": vo.id,
            "order_id": vo.order_id,
            "subtotal": vo.subtotal,
            "status": vo.status,
            "items": items_out,
            "customer_id": vo.order.customer_id if vo.order else None,
            "created_at": vo.created_at.isoformat() if vo.created_at else None,
        })
    return result


@router.put("/vendor/{vendor_order_id}/status")
def update_vendor_order_status(
    vendor_order_id: int,
    payload: VendorOrderStatusUpdate,
    db: Session = Depends(get_db),
    vendor: User = Depends(require_vendor),
):
    """Vendor updates their sub-order status (shipped, delivered)."""
    vo = db.query(VendorOrder).filter(VendorOrder.id == vendor_order_id, VendorOrder.vendor_id == vendor.id).first()
    if not vo:
        raise HTTPException(status_code=404, detail="Vendor order not found")
    if vo.status == OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Cannot update a cancelled order")

    allowed_transitions = {
        OrderStatus.paid: [OrderStatus.shipped],
        OrderStatus.shipped: [OrderStatus.delivered],
    }
    if vo.status in allowed_transitions and payload.status not in allowed_transitions.get(vo.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{vo.status}' to '{payload.status}'"
        )

    vo.status = payload.status

    # If ALL vendor sub-orders of the master order are delivered, mark master as delivered
    master = db.query(Order).filter(Order.id == vo.order_id).first()
    if master:
        all_vos = db.query(VendorOrder).filter(VendorOrder.order_id == master.id).all()
        if all(v.status == OrderStatus.delivered for v in all_vos):
            master.status = OrderStatus.delivered

    db.commit()
    return {"message": "Status updated", "status": vo.status}
