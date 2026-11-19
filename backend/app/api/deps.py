from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models import Business, BusinessMember, User
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
            detail="Platform administrator privileges required",
        )
    return current_user


def get_current_business(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    x_business_id: Optional[int] = Header(default=None, alias="X-Business-Id"),
) -> Business:
    business_id = x_business_id

    if business_id is None:
        raw_business_id = request.path_params.get("business_id")
        if raw_business_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No business workspace selected",
            )
        try:
            business_id = int(raw_business_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid business workspace",
            )

    business = db.execute(
        select(Business).where(Business.id == business_id)
    ).scalar_one_or_none()
    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )

    if not current_user.is_superadmin:
        membership = db.execute(
            select(BusinessMember).where(
                BusinessMember.business_id == business_id,
                BusinessMember.user_id == current_user.id,
            )
        ).scalar_one_or_none()
        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this business workspace",
            )

    return business


@dataclass(frozen=True)
class BusinessAccess:
    business: Business
    role: str
    user_id: int


def require_business_roles(allowed_roles: list[str]):
    def dependency(
        business: Business = Depends(get_current_business),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> BusinessAccess:
        if current_user.is_superadmin:
            return BusinessAccess(
                business=business,
                role="superadmin",
                user_id=current_user.id,
            )

        membership = db.execute(
            select(BusinessMember).where(
                BusinessMember.business_id == business.id,
                BusinessMember.user_id == current_user.id,
            )
        ).scalar_one_or_none()

        if membership is None or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient workspace permissions",
            )

        return BusinessAccess(
            business=business,
            role=membership.role,
            user_id=current_user.id,
        )

    return dependency
