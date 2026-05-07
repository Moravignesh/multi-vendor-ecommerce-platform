from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.routers import auth, products, cart, orders, vendors, admin
from app.models.user import User, UserRole
from app.models.product import Category
from app.core.security import get_password_hash

app = FastAPI(
    title="Multi-Vendor E-Commerce API",
    description="Full-stack multi-vendor platform with order splitting, JWT auth, and role-based access.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(vendors.router)
app.include_router(admin.router)


@app.on_event("startup")
def startup():
    create_tables()
    _seed_initial_data()


def _seed_initial_data():
    """Create admin user and sample categories if DB is fresh."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.role == UserRole.admin).first():
            admin_user = User(
                email="admin@example.com",
                full_name="Platform Admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.admin,
                is_approved=True,
            )
            db.add(admin_user)

        for cat_name in ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Beauty"]:
            if not db.query(Category).filter(Category.name == cat_name).first():
                db.add(Category(name=cat_name))

        db.commit()
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Multi-Vendor E-Commerce API is running"}
