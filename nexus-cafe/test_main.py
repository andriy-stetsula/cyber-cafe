from fastapi.testclient import TestClient
from main import app # Переконайся, що твій головний файл називається main.py

client = TestClient(app)

def test_read_root():
    """Тест перевіряє, чи працює головна сторінка"""
    response = client.get("/")
    assert response.status_code == 200

def test_nexus_cafe_title():
    """Тест перевіряє, чи є в базі даних або коді назва вашого кафе"""
    response = client.get("/")
    # Якщо головна сторінка повертає JSON або HTML
    assert "nexus" in response.text.lower()