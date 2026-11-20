from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

PaperSize = Literal["58mm", "80mm", "a4"]


class ReceiptSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    header_text: Optional[str] = None
    footer_text: Optional[str] = None
    address_line: Optional[str] = None
    phone_line: Optional[str] = None
    email_line: Optional[str] = None
    website_line: Optional[str] = None
    logo_path: Optional[str] = None
    logo_url: Optional[str] = None
    logo_width: int = 96
    paper_size: PaperSize = "80mm"
    show_logo: bool = True
    show_header: bool = False
    show_business_name: bool = True
    show_address: bool = True
    show_phone: bool = True
    show_email: bool = False
    show_website: bool = False
    show_reference: bool = True
    show_datetime: bool = True
    show_cashier: bool = True
    show_payment_method: bool = True
    show_customer_phone: bool = True
    show_items: bool = True
    show_subtotal: bool = True
    show_total: bool = True
    show_footer: bool = False
    show_powered_by: bool = False


class ReceiptSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    header_text: Optional[str] = None
    footer_text: Optional[str] = None
    address_line: Optional[str] = None
    phone_line: Optional[str] = None
    email_line: Optional[str] = None
    website_line: Optional[str] = None
    logo_width: int = Field(default=96, ge=48, le=240)
    paper_size: PaperSize = "80mm"
    show_logo: bool = True
    show_header: bool = False
    show_business_name: bool = True
    show_address: bool = True
    show_phone: bool = True
    show_email: bool = False
    show_website: bool = False
    show_reference: bool = True
    show_datetime: bool = True
    show_cashier: bool = True
    show_payment_method: bool = True
    show_customer_phone: bool = True
    show_items: bool = True
    show_subtotal: bool = True
    show_total: bool = True
    show_footer: bool = False
    show_powered_by: bool = False
