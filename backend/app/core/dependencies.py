from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise credentials_exception
    return user


def require_customer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.customer:
        raise HTTPException(status_code=403, detail="Customers only")
    return current_user


def require_vendor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.vendor:
        raise HTTPException(status_code=403, detail="Vendors only")
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="Vendor not yet approved")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


def require_vendor_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.vendor, UserRole.admin):
        raise HTTPException(status_code=403, detail="Vendors or admins only")
    return current_user
