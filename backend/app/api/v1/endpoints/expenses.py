from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_business_roles
from app.core.database import get_db
from app.models import Expense, User
from app.schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(
    prefix="/businesses/{business_id}/expenses",
    tags=["expenses"],
)

FINANCE_ROLES = ["owner", "manager"]


@router.get("", response_model=list[ExpenseResponse])
@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(
    start_date: date | None = None,
    end_date: date | None = None,
    category: str | None = None,
    access=Depends(require_business_roles(FINANCE_ROLES)),
    db: Session = Depends(get_db),
):
    query = (
        select(Expense, User.full_name)
        .join(User, User.id == Expense.user_id)
        .where(Expense.business_id == access.business.id)
    )

    if start_date is not None:
        query = query.where(Expense.date >= start_date)
    if end_date is not None:
        query = query.where(Expense.date <= end_date)
    if category:
        query = query.where(Expense.category == category)

    rows = db.execute(
        query.order_by(Expense.date.desc(), Expense.id.desc())
    ).all()

    return [
        ExpenseResponse(
            id=expense.id,
            business_id=expense.business_id,
            user_id=expense.user_id,
            category=expense.category,
            amount=float(expense.amount),
            description=expense.description,
            date=expense.date,
            created_at=expense.created_at,
            recorded_by=full_name,
        )
        for expense, full_name in rows
    ]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    access=Depends(require_business_roles(FINANCE_ROLES)),
    db: Session = Depends(get_db),
):
    expense = Expense(
        business_id=access.business.id,
        user_id=access.user_id,
        category=payload.category,
        amount=payload.amount,
        description=payload.description.strip(),
        date=payload.date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    user = db.execute(select(User).where(User.id == expense.user_id)).scalar_one()
    return ExpenseResponse(
        id=expense.id,
        business_id=expense.business_id,
        user_id=expense.user_id,
        category=expense.category,
        amount=float(expense.amount),
        description=expense.description,
        date=expense.date,
        created_at=expense.created_at,
        recorded_by=user.full_name,
    )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    access=Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    expense = db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.business_id == access.business.id,
        )
    ).scalar_one_or_none()

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    db.delete(expense)
    db.commit()
