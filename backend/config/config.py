import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_SCHEMA = os.getenv("DB_SCHEMA", "mafia-ai")
DB_USER = os.getenv("DB_USER", "mafiadev")
DB_PWD = os.getenv("DB_PWD", "123456")
SECRET_KEY = os.getenv("SECRET_KEY", "mafia123")
