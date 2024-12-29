from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from tortoise.exceptions import IntegrityError
from models.UserModel import User
from actors.UserManager import init_db, close_db, create_user
from actors.JWTManager import create_access_token, verify_token
from schemas.UserSchema import UserCreate, UserResponse, UserLogin, LoginResponse
from dotenv import load_dotenv  
import os, uvicorn

# 載入 .env 文件
load_dotenv()

app = FastAPI()

# CORS 設定
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源訪問
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 創建新使用者
@app.post("/users/create", response_model=UserResponse)
async def create_user_route(user: UserCreate):
    # 檢查 email 是否已註冊
    db_user = await User.filter(user_email=user.user_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_model = User(
        user_name=user.user_name,
        user_email=user.user_email,
        user_password=user.user_password
    )
    try:
        # 儲存新使用者到資料庫
        created_user = await create_user(user_model)
        return created_user
    except IntegrityError:
        raise HTTPException(status_code=400, detail="資料已存在或其他完整性約束錯誤")

# 登入路由
@app.post("/login", response_model=LoginResponse)
async def login_route(user: UserLogin):
    # 查詢用戶是否存在
    db_user = await User.filter(user_name=user.user_name).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Username not found")

    # 驗證密碼
    if user.user_password != db_user.user_password:  # 直接比對明文密碼
        raise HTTPException(status_code=400, detail="Incorrect password")

    # 生成 JWT Token
    token = create_access_token(data={"sub": db_user.user_name})
    
    # 返回成功的登入信息
    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserResponse.from_orm(db_user),
        token=token
    )

# 根路由
@app.get("/")
async def root(token: str = Security(oauth2_scheme)):
    try:
        payload = verify_token(token)
        return {"message": f"Hello {payload['sub']}, this is a protected route!"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# 啟動 FastAPI 應用時初始化資料庫
@app.on_event("startup")
async def startup():
    await init_db()  # 初始化資料庫連線

# 在關閉 FastAPI 應用時關閉資料庫連線
@app.on_event("shutdown")
async def shutdown():
    await close_db()  # 關閉資料庫連線

# 啟動應用
if __name__ == "__main__":
    port = int(os.getenv("APIPORT"))
    host = os.getenv("APINAME")
    uvicorn.run("main:app", host=host, port=port, reload=True)