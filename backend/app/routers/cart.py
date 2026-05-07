from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartOut, CartItemOut
from app.core.dependencies import require_customer

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def _get_or_create_cart(customer_id: int, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.customer_id == customer_id).first()
    if not cart:
        cart = Cart(customer_id=customer_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _build_cart_out(cart: Cart, db: Session) -> CartOut:
    items_out = []
    total = 0.0
    for item in cart.items:
        product = db.query(Product).options(joinedload(Product.vendor)).filter(Product.id == item.product_id).first()
        if not product:
            continue
        subtotal = product.price * item.quantity
        total += subtotal
        items_out.append(CartItemOut(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            product_name=product.name,
            product_price=product.price,
            vendor_id=product.vendor_id,
            vendor_name=product.vendor.full_name if product.vendor else "Unknown",
            subtotal=subtotal,
            stock_available=product.stock,
        ))
    return CartOut(id=cart.id, customer_id=cart.customer_id, items=items_out, total=round(total, 2))


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), customer: User = Depends(require_customer)):
    cart = _get_or_create_cart(customer.id, db)
    return _build_cart_out(cart, db)


@router.post("/items", response_model=CartOut, status_code=201)
def add_item(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    customer: User = Depends(require_customer),
):
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or inactive")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} units available")
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    cart = _get_or_create_cart(customer.id, db)
    existing = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id).first()

    if existing:
        new_qty = existing.quantity + payload.quantity
        if product.stock < new_qty:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} units available in stock")
        existing.quantity = new_qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity))

    db.commit()
    db.refresh(cart)
    return _build_cart_out(cart, db)


@router.put("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    customer: User = Depends(require_customer),
):
    cart = _get_or_create_cart(customer.id, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity <= 0:
        db.delete(item)
    else:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.stock < payload.quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} units available")
        item.quantity = payload.quantity

    db.commit()
    db.refresh(cart)
    return _build_cart_out(cart, db)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    db: Session = Depends(get_db),
    customer: User = Depends(require_customer),
):
    cart = _get_or_create_cart(customer.id, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return _build_cart_out(cart, db)


@router.delete("", status_code=204)
def clear_cart(db: Session = Depends(get_db), customer: User = Depends(require_customer)):
    cart = db.query(Cart).filter(Cart.customer_id == customer.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
