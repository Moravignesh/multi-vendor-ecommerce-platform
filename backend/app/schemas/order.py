from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_at_purchase: float
    subtotal: float

    class Config:
        from_attributes = True


class VendorOrderOut(BaseModel):
    id: int
    vendor_id: int
    vendor_name: str
    subtotal: float
    status: OrderStatus
    items: List[OrderItemOut]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: OrderStatus
    payment_ref: Optional[str]
    vendor_orders: List[VendorOrderOut]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaymentRequest(BaseModel):
    simulate_success: bool = True  # True = payment succeeds


class VendorOrderStatusUpdate(BaseModel):
    status: OrderStatus
