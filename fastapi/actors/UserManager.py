from tortoise import Tortoise, fields
from tortoise.models import Model
from dotenv import load_dotenv
import os

# 載入 .env 檔案
load_dotenv()

# 從環境變數中讀取資料庫設定
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")
HOSTNAME = os.getenv("HOSTNAME")
DBPORT = os.getenv("DBPORT")
DBNAME = os.getenv("DBNAME")

# 組合成資料庫連線 URL
DATABASE_URL = f"postgres://{USERNAME}:{PASSWORD}@{HOSTNAME}:{DBPORT}/{DBNAME}"

# 資料庫連線設定
async def init_db():
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={'models': ['models.UserModel']}  # 指定模型的路徑
    )
    await Tortoise.generate_schemas()  # 生成資料表

# 資料庫連線結束
async def close_db():
    await Tortoise.close_connections()

# CRUD
async def create_user(user_model):
    """
    新增使用者資料到資料庫中
    :param user_model: 要新增的使用者模型
    :return: 新增成功的使用者物件
    """
    try:
        await user_model.save()
        return user_model
    except IntegrityError:
        raise ValueError("資料已存在或其他完整性約束錯誤")