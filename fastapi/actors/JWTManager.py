from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

# 載入 .env 檔案
load_dotenv()

# 從環境變數中讀取秘密金鑰與加密算法設定
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    生成 JWT Token
    :param data: 要編碼的數據
    :param expires_delta: 過期時間
    :return: 編碼的 JWT
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """
    驗證 JWT Token
    :param token: 待驗證的 JWT
    :return: 解碼後的數據
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise ValueError("Token 中沒有 username")
        return payload
    except JWTError as e:
        raise ValueError(f"無效的 Token: {str(e)}")