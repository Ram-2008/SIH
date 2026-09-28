from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, Token, UserSchema
from app.utils.auth_utils import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # For prototype convenience, if demo login button clicked with non-existent user, auto-return revenue officer
        user = db.query(User).filter(User.email == "officer@bhurishti.gov.in").first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserSchema.model_validate(user)
    }

@router.get("/me", response_model=UserSchema)
def get_me(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "officer@bhurishti.gov.in").first()
    return UserSchema.model_validate(user)
