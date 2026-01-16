from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, OrderDB, UserDB

app = FastAPI()

# Глобальна змінна для відображення поточного користувача в консолі
current_user = "Гість"

# Налаштування CORS, щоб браузер не блокував запити до сервера
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Схема для замовлення
class Order(BaseModel):
    item: str
    price: int
    user_id: int


# Схема для реєстрації
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


@app.get("/")
def read_root():
    return {"message": "Nexus Cafe API працює стабільно!", "current_session_user": current_user}


# --- АВТОРИЗАЦІЯ ---

@app.post("/login")
async def login(name: str):
    global current_user
    current_user = name

    print("\n" + "=" * 30)
    print(f"👤 КОРИСТУВАЧ УВІЙШОВ: {current_user}")
    print("=" * 30 + "\n")

    return {
        "status": "success",
        "user": {
            "name": current_user,
            "level": 1,
            "xp": 0
        }
    }


@app.post("/api/register")
async def register(user: UserCreate):
    db = SessionLocal()
    new_user = UserDB(
        username=user.username,
        email=user.email,
        hashed_password=user.password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()
    print(f"🆕 Новий користувач зареєстрований: {user.username}")
    return {"status": "success", "id": new_user.id}


# --- ЗАМОВЛЕННЯ ---

@app.post("/api/order")
async def take_order(order: Order):
    db = SessionLocal()

    # Спроба знайти ім'я користувача в базі за його ID
    user = db.query(UserDB).filter(UserDB.id == order.user_id).first()
    user_display = user.username if user else current_user  # Використовуємо поточного юзера, якщо ID не знайдено

    new_order = OrderDB(
        item=order.item,
        price=order.price,
        user_id=order.user_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    db.close()

    # Вивід у PowerShell
    print(f"🚀 ЗАМОВЛЕННЯ: {order.item}")
    print(f"👤 КЛІЄНТ: {user_display}")
    print(f"💰 ЦІНА: {order.price} грн")
    print("-" * 30)

    return {"status": "success", "message": f"Замовлення для {user_display} прийнято!"}


@app.get("/api/orders")
async def get_orders():
    db = SessionLocal()
    orders = db.query(OrderDB).all()
    db.close()
    return orders


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)