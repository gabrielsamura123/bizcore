from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.deps import BusinessAccess, require_business_roles
from app.core.database import get_db
from app.core.security import hash_password
from app.models import BusinessMember, User
from app.schemas.member import MemberCreate, MemberResponse, MemberRoleUpdate

router = APIRouter(
    prefix="/businesses/{business_id}/members",
    tags=["business-members"],
)


def _member_response(member: BusinessMember, user: User) -> MemberResponse:
    return MemberResponse(
        id=member.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=member.role,
        created_at=member.created_at,
    )


def _get_member_with_user(db: Session, business_id: int, member_id: int):
    row = db.execute(
        select(BusinessMember, User)
        .join(User, BusinessMember.user_id == User.id)
        .where(
            BusinessMember.id == member_id,
            BusinessMember.business_id == business_id,
        )
    ).one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )
    return row


@router.get("", response_model=list[MemberResponse])
@router.get("/", response_model=list[MemberResponse])
def list_members(
    access: BusinessAccess = Depends(require_business_roles(["owner", "manager"])),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(BusinessMember, User)
        .join(User, BusinessMember.user_id == User.id)
        .where(BusinessMember.business_id == access.business.id)
        .order_by(BusinessMember.created_at, BusinessMember.id)
    ).all()
    return [_member_response(member, user) for member, user in rows]


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: MemberCreate,
    access: BusinessAccess = Depends(require_business_roles(["owner", "manager"])),
    db: Session = Depends(get_db),
):
    if payload.role == "manager" and access.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can create managers",
        )

    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    if user is not None:
        existing = db.execute(
            select(BusinessMember.id).where(
                BusinessMember.business_id == access.business.id,
                BusinessMember.user_id == user.id,
            )
        ).scalar_one_or_none()
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this business",
            )
    else:
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            is_active=True,
            is_superadmin=False,
        )
        db.add(user)
        db.flush()

    member = BusinessMember(
        business_id=access.business.id,
        user_id=user.id,
        role=payload.role,
    )
    db.add(member)

    try:
        db.commit()
        db.refresh(member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this business",
        )

    return _member_response(member, user)


@router.patch("/{member_id}/role", response_model=MemberResponse)
def update_member_role(
    member_id: int,
    payload: MemberRoleUpdate,
    access: BusinessAccess = Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    member, user = _get_member_with_user(db, access.business.id, member_id)

    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify the primary owner role",
        )

    member.role = payload.role
    try:
        db.commit()
        db.refresh(member)
    except Exception:
        db.rollback()
        raise

    return _member_response(member, user)


@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    access: BusinessAccess = Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    member, _ = _get_member_with_user(db, access.business.id, member_id)

    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the primary owner",
        )

    db.delete(member)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"message": "Team member removed"}
