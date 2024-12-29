from tortoise import fields
from tortoise.models import Model

class User(Model):
    user_id = fields.IntField(pk=True)  # 主鍵，對應 user_id
    user_name = fields.CharField(max_length=100, null=False)
    user_password = fields.CharField(max_length=100, null=False)
    user_email = fields.CharField(max_length=100, unique=True, null=False)

    class Meta:
        table = "users"  # 指定資料表名稱