from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.product import Product, Category
from app.models.order import Review
from app.models.user import User
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut, ProductListOut,
    CategoryOut, ReviewCreate, ReviewOut
)
from app.core.dependencies import get_current_user, require_vendor, require_customer

router = APIRouter(prefix="/api/products", tags=["Products"])


# ─── Categories ─────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(name: str, db: Session = Depends(get_db), _: User = Depends(require_vendor)):
    cat = db.query(Category).filter(func.lower(Category.name) == name.lower()).first()
    if cat:
        return cat
    cat = Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ─── Browse products (public) ────────────────────────────────────────────────

@router.get("", response_model=List[ProductListOut])
def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Product)
        .options(joinedload(Product.vendor), joinedload(Product.category_obj))
        .filter(Product.is_active == True, Product.stock > 0)
    )
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)

    products = q.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for p in products:
        avg = db.query(func.avg(Review.rating)).filter(Review.product_id == p.id).scalar()
        d = ProductListOut.model_validate(p)
        d.avg_rating = round(avg, 1) if avg else None
        result.append(d)
    return result


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = (
        db.query(Product)
        .options(
            joinedload(Product.vendor),
            joinedload(Product.category_obj),
            joinedload(Product.reviews),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


# ─── Vendor CRUD ─────────────────────────────────────────────────────────────

@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    vendor: User = Depends(require_vendor),
):
    if payload.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be > 0")
    if payload.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    product = Product(**payload.model_dump(), vendor_id=vendor.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return db.query(Product).options(
        joinedload(Product.vendor), joinedload(Product.category_obj)
    ).filter(Product.id == product.id).first()


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    vendor: User = Depends(require_vendor),
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not yours")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, val)
    db.commit()
    db.refresh(product)
    return db.query(Product).options(
        joinedload(Product.vendor), joinedload(Product.category_obj)
    ).filter(Product.id == product.id).first()


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    vendor: User = Depends(require_vendor),
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not yours")
    db.delete(product)
    db.commit()


# ─── Reviews ─────────────────────────────────────────────────────────────────

@router.post("/{product_id}/reviews", response_model=ReviewOut, status_code=201)
def add_review(
    product_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    customer: User = Depends(require_customer),
):
    if not 1 <= payload.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1–5")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.query(Review).filter(Review.customer_id == customer.id, Review.product_id == product_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    review = Review(customer_id=customer.id, product_id=product_id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/{product_id}/reviews", response_model=List[ReviewOut])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).all()
