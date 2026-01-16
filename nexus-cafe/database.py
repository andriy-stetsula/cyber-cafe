from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Налаштування бази даних
SQLALCHEMY_DATABASE_URL = "sqlite:///./cafe.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Таблиця Користувачів
class UserDB(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)

# Таблиця Замовлень
class OrderDB(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    item = Column(String)
    price = Column(Integer)
    user_id = Column(Integer) # Прив'язка до ID користувача

# Створення таблиць у файлі cafe.db
Base.metadata.create_all(bind=engine)