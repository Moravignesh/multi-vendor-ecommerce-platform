"""
seed_demo.py — Run ONCE after starting the backend to populate demo users & products.
Usage:  python seed_demo.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.core.security import get_password_hash

create_tables()
db = SessionLocal()

def get_or_create_user(email, full_name, password, role, approved=True):
    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(email=email, full_name=full_name,
                 hashed_password=get_password_hash(password),
                 role=role, is_approved=approved)
        db.add(u)
        db.flush()
        print(f"  ✅ Created {role}: {email}")
    else:
        print(f"  ⏭  Already exists: {email}")
    return u

print("\n📦 Seeding demo data...\n")

# Users
admin  = get_or_create_user("admin@example.com",    "Platform Admin",  "admin123",    UserRole.admin)
v1     = get_or_create_user("vendor@example.com",   "TechZone Store",  "vendor123",   UserRole.vendor)
v2     = get_or_create_user("vendor2@example.com",  "FashionHub",      "vendor123",   UserRole.vendor)
cust   = get_or_create_user("customer@example.com", "John Customer",   "customer123", UserRole.customer)

db.commit()

# Categories
cats = {}
for name in ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Beauty"]:
    c = db.query(Category).filter(Category.name == name).first()
    if not c:
        c = Category(name=name); db.add(c); db.flush()
    cats[name] = c
db.commit()

# Products for vendor 1
v1_products = [
    dict(name="Samsung Galaxy S24", description="Latest Samsung flagship smartphone with AI features", price=79999, stock=15, category_id=cats["Electronics"].id),
    dict(name="Apple AirPods Pro 2", description="Premium wireless earbuds with ANC", price=24999, stock=30, category_id=cats["Electronics"].id),
    dict(name="Sony WH-1000XM5", description="Industry-leading noise cancelling headphones", price=29999, stock=10, category_id=cats["Electronics"].id),
    dict(name="Logitech MX Master 3", description="Advanced wireless mouse for professionals", price=8999, stock=25, category_id=cats["Electronics"].id),
    dict(name="Dell 27\" 4K Monitor", description="Ultra-sharp 4K display for productivity", price=34999, stock=8, category_id=cats["Electronics"].id),
]

# Products for vendor 2
v2_products = [
    dict(name="Nike Air Max 270", description="Lightweight running shoes with Max Air cushioning", price=9999, stock=20, category_id=cats["Sports"].id),
    dict(name="Premium Cotton T-Shirt", description="100% organic cotton, available in 12 colours", price=799, stock=100, category_id=cats["Clothing"].id),
    dict(name="Slim Fit Chinos", description="Modern slim-fit chinos in stretch fabric", price=2499, stock=40, category_id=cats["Clothing"].id),
    dict(name="The Psychology of Money", description="Timeless lessons on wealth, greed, and happiness", price=449, stock=60, category_id=cats["Books"].id),
    dict(name="Yoga Mat Pro", description="Non-slip, eco-friendly 6mm yoga mat", price=1299, stock=35, category_id=cats["Sports"].id),
]

for pd in v1_products:
    if not db.query(Product).filter(Product.name == pd["name"], Product.vendor_id == v1.id).first():
        db.add(Product(**pd, vendor_id=v1.id)); print(f"  📱 {pd['name']}")

for pd in v2_products:
    if not db.query(Product).filter(Product.name == pd["name"], Product.vendor_id == v2.id).first():
        db.add(Product(**pd, vendor_id=v2.id)); print(f"  👗 {pd['name']}")

db.commit()
db.close()

print("""
✅ Demo data seeded successfully!

Demo Accounts:
  👤 Admin:    admin@example.com    / admin123
  🏪 Vendor 1: vendor@example.com   / vendor123  (TechZone Store)
  🏪 Vendor 2: vendor2@example.com  / vendor123  (FashionHub)
  🛍️ Customer: customer@example.com / customer123
""")
