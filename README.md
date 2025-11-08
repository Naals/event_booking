📘 Booking Event API
Простое REST API для бронирования мест на мероприятия.
Один пользователь не может забронировать одно и то же событие дважды.

🚀 Функционал
Добавление пользователей и событий
Бронирование мест на мероприятие
Проверка уникальности бронирования
PostgreSQL база данных
TypeScript и Express

🧩 Технологии
Node.js
Express
TypeScript
PostgreSQL (pg)

⚙️ Установка и запуск
1. Клонируй проект
git clone https://github.com/Naals/event_booking.git
cd Booking_Event

2. Установи зависимости
npm install

3. Создай файл .env в корне проекта
   
4. PostgreSQL - замени (user,database,password) в db.ts
   CREATE DATABASE 'db_name'
   
   -- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_seats INT NOT NULL
);

-- bookings
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

5. 
npm init -y
npm install express pg
npm install -D typescript ts-node @types/express @types/node @types/pg

📡 Примеры запросов
➕ Добавить пользователя
POST /api/users
{
  "username": "nur",
  "email": "nur@mail.com"
}



➕ Добавить событие
POST /api/events
{
  "name": "JavaScript Meetup",
  "total_seats": 3
}



🎟 Забронировать место
POST /api/bookings/reserve
{
  "event_id": 1,
  "user_id": 1
}



Если пользователь уже забронировал место:
{ "message": "Пользователь уже забронировал это мероприятие" }
