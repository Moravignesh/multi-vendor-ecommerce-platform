from pydantic import BaseModel
from typing import List, Optional


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: str
    product_price: float
    vendor_id: int
    vendor_name: str
    subtotal: float
    stock_available: int

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    id: int
    customer_id: int
    items: List[CartItemOut]
    total: float
