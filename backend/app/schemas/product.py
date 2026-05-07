from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    name: str


class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class VendorInfo(BaseModel):
    id: int
    full_name: str
    email: str
    class Config:
        from_attributes = True


class ReviewOut(BaseModel):
    id: int
    customer_id: int
    rating: int
    comment: Optional[str]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: int
    vendor_id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    is_active: bool
    category_id: Optional[int]
    category_obj: Optional[CategoryOut]
    vendor: Optional[VendorInfo]
    reviews: Optional[List[ReviewOut]] = []
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProductListOut(BaseModel):
    id: int
    vendor_id: int
    name: str
    price: float
    stock: int
    is_active: bool
    category_id: Optional[int]
    category_obj: Optional[CategoryOut]
    vendor: Optional[VendorInfo]
    avg_rating: Optional[float] = None

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None
