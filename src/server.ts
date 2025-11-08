import express, { Request, Response } from 'express';
import pool from './db';
import { BookingRequest, Event, User } from './types';

const app = express();
app.use(express.json());

app.post('/api/users', async (req: Request, res: Response) => {
    const { username, email }: User = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'username и email обязательны' });
    }

    try {
        // Проверяем, существует ли пользователь
        const exists = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        // @ts-ignore
        if (exists.rowCount > 0) {
            return res.status(400).json({ message: 'Пользователь с таким именем или email уже существует' });
        }

        // Добавляем только если нет дубля
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id',
            [username, email]
        );

        return res.json({ message: 'Пользователь добавлен', user_id: result.rows[0].id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/api/events', async (req: Request, res: Response) => {
    const { name, total_seats }: Event = req.body;

    if (!name || !total_seats) {
        return res.status(400).json({ message: 'name и total_seats обязательны' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO events (name, total_seats) VALUES ($1, $2) RETURNING id',
            [name, total_seats]
        );
        res.json({ message: 'Событие добавлено', event_id: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/api/bookings/reserve', async (req: Request, res: Response) => {
    const { event_id, user_id }: BookingRequest = req.body;

    if (!event_id || !user_id) {
        return res.status(400).json({ message: 'event_id и user_id обязательны' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Проверяем, есть ли пользователь и событие
        const userExists = await client.query('SELECT 1 FROM users WHERE id = $1', [user_id]);
        if (userExists.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const eventRes = await client.query('SELECT total_seats FROM events WHERE id = $1', [event_id]);
        if (eventRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Событие не найдено' });
        }

        // Проверяем, не забронировал ли уже
        const existing = await client.query(
            'SELECT 1 FROM bookings WHERE event_id = $1 AND user_id = $2',
            [event_id, user_id]
        );
        // @ts-ignore
        if (existing.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Вы уже забронировали это событие' });
        }

        // Проверяем количество мест
        const totalSeats = eventRes.rows[0].total_seats;
        const bookedCountRes = await client.query(
            'SELECT COUNT(*) AS count FROM bookings WHERE event_id = $1',
            [event_id]
        );
        const bookedCount = Number.parseInt(bookedCountRes.rows[0].count, 10);

        if (bookedCount >= totalSeats) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Все места уже забронированы' });
        }

        // Создаем бронь
        await client.query(
            'INSERT INTO bookings (event_id, user_id, created_at) VALUES ($1, $2, NOW())',
            [event_id, user_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Место успешно забронировано' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
