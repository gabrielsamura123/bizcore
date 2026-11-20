from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ReceiptSetting(Base):
    __tablename__ = "receipt_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    business_id: Mapped[int] = mapped_column(
        Integer, unique=True, index=True, nullable=False
    )

    header_text: Mapped[str | None] = mapped_column(String, nullable=True)
    footer_text: Mapped[str | None] = mapped_column(String, nullable=True)
    address_line: Mapped[str | None] = mapped_column(String, nullable=True)
    phone_line: Mapped[str | None] = mapped_column(String, nullable=True)
    email_line: Mapped[str | None] = mapped_column(String, nullable=True)
    website_line: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_path: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_width: Mapped[int] = mapped_column(Integer, default=96, nullable=False)
    paper_size: Mapped[str] = mapped_column(String, default="80mm", nullable=False)

    show_logo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_header: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_business_name: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    show_address: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_phone: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_email: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_website: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_reference: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_datetime: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_cashier: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_payment_method: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    show_customer_phone: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    show_items: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_subtotal: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_total: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_footer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_powered_by: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
    )
