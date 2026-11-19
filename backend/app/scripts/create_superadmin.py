import getpass
import re
import sys

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def prompt_email() -> str:
    while True:
        email = input("Email: ").strip().lower()
        if EMAIL_PATTERN.match(email):
            return email
        print("Please enter a valid email address.")


def prompt_password() -> str:
    while True:
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm Password: ")

        if password != confirm:
            print("Passwords do not match. Try again.")
            continue

        if len(password) < 6:
            print("Password must be at least 6 characters. Try again.")
            continue

        return password


def main() -> None:
    print("BizCore Super Admin provisioning\n")

    full_name = input("Full Name: ").strip()
    if not full_name:
        print("Full name is required.")
        return

    email = prompt_email()
    password = prompt_password()

    db = SessionLocal()

    try:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

        if user:
            answer = input(
                f"User {email} exists. Promote to Super Admin? (y/n): "
            ).strip().lower()

            if answer != "y":
                print("No changes made.")
                return

            user.is_superadmin = True
            db.commit()
            print(f"\n[SUCCESS] {email} is now a Super Admin.")
            return

        admin = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_superadmin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(
            f"\n[SUCCESS] Super Admin account created for {email} (ID {admin.id})."
        )
    except SQLAlchemyError as exc:
        db.rollback()
        print(f"\n[ERROR] Could not update the database: {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
