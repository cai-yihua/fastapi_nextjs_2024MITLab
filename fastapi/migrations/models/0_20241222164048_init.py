from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "user_id" SERIAL NOT NULL PRIMARY KEY,
    "user_name" VARCHAR(100) NOT NULL,
    "user_password" VARCHAR(100) NOT NULL,
    "user_email" VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
