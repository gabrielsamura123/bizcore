from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models import User
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        user_id = payload.get("user_id")
        if not email or not user_id or payload.get("type") != "access":
            raise credentials_exception
        token_data = TokenData(email=email, user_id=user_id)
    except (JWTError, ValidationError):
        raise credentials_exception

    user = db.execute(
        select(User).where(User.email == token_data.email)
    ).scalar_one_or_none()
    if user is None or not user.is_active or user.id != token_data.user_id:
        raise credentials_exception
    return user


def get_current_active_superadmin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin privileges required",
        )
    return current_user
