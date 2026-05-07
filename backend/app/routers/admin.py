from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.order import Order, VendorOrder
from app.schemas.user import UserOut
from app.schemas.product import ProductListOut
from app.core.dependencies import require_admin
from app.services.order_service import build_order_out

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserOut])
def all_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).all()


@router.get("/vendors", response_model=List[UserOut])
def all_vendors(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).filter(User.role == UserRole.vendor).all()


@router.put("/vendors/{vendor_id}/approve")
def approve_vendor(vendor_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    vendor = db.query(User).filter(User.id == vendor_id, User.role == UserRole.vendor).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    db.commit()
    return {"message": "Vendor approved"}


@router.put("/vendors/{vendor_id}/reject")
def reject_vendor(vendor_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    vendor = db.query(User).filter(User.id == vendor_id, User.role == UserRole.vendor).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = False
    db.commit()
    return {"message": "Vendor rejected"}


@router.put("/users/{user_id}/toggle-active")
def toggle_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.get("/products", response_model=List[ProductListOut])
def all_products(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Product).options(
        joinedload(Product.vendor), joinedload(Product.category_obj)
    ).all()


@router.get("/orders", response_model=List[dict])
def all_orders(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    orders = db.query(Order).options(
        joinedload(Order.vendor_orders).joinedload(VendorOrder.items)
    ).order_by(Order.created_at.desc()).all()
    return [build_order_out(o, db) for o in orders]


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from app.models.order import OrderStatus
    return {
        "total_users": db.query(User).count(),
        "total_vendors": db.query(User).filter(User.role == UserRole.vendor).count(),
        "pending_vendor_approvals": db.query(User).filter(User.role == UserRole.vendor, User.is_approved == False).count(),
        "total_products": db.query(Product).count(),
        "total_orders": db.query(Order).count(),
        "paid_orders": db.query(Order).filter(Order.status == OrderStatus.paid).count(),
        "revenue": db.query(Order).filter(Order.status.in_([OrderStatus.paid, OrderStatus.shipped, OrderStatus.delivered])).with_entities(
            __import__('sqlalchemy').func.sum(Order.total_amount)
        ).scalar() or 0,
    }
