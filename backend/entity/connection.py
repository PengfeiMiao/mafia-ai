from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from backend.config.config import DB_USER, DB_PWD, DB_HOST, DB_PORT, DB_SCHEMA

SQLALCHEMY_DATABASE_URL = f'postgresql://{DB_USER}:{DB_PWD}@{DB_HOST}:{DB_PORT}/{DB_SCHEMA}'

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
