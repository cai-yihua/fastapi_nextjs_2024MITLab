from .UserModel import User  # 匯入你的模型

import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# 從環境變數中讀取資料庫連線資訊
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")
HOSTNAME = os.getenv("HOSTNAME")
DBPORT = os.getenv("DBPORT")
DBNAME = os.getenv("DBNAME")

# 定義 TORTOISE_ORM 配置
TORTOISE_ORM = {
    "connections": {
        "default": f"postgres://{USERNAME}:{PASSWORD}@{HOSTNAME}:{DBPORT}/{DBNAME}"
    },
    "apps": {
        "models": {
            "models": ["models.UserModel", "aerich.models"],  # 包含你的模型和 Aerich 的內建模型
            "default_connection": "default",
        },
    },
}