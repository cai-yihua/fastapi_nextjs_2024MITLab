from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    user_name: str
    user_email: EmailStr
    user_password: str
    
class UserResponse(BaseModel):
    user_id: int
    user_name: str
    user_email: str

    class Config:
        from_attributes = True

# 登入定義
class UserLogin(BaseModel):
    user_name: str
    user_password: str

# 登入返回结果定義
class LoginResponse(BaseModel):
    success: bool
    message: Optional[str] = None  # 錯誤消息
    user: Optional[UserResponse] = None  # 如果登入成功，返回用戶信息
    token: Optional[str] = None  # 如果登入成功，返回 JWT Token