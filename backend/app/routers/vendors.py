from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductListOut
from app.core.dependencies import require_vendor

router = APIRouter(prefix="/api/vendor", tags=["Vendor"])


@router.get("/products", response_model=List[ProductListOut])
def my_products(db: Session = Depends(get_db), vendor: User = Depends(require_vendor)):
    return (
        db.query(Product)
        .options(joinedload(Product.vendor), joinedload(Product.category_obj))
        .filter(Product.vendor_id == vendor.id)
        .all()
    )
