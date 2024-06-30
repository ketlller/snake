const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Подключение к базе данных
const db = new sqlite3.Database('./snakegame.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключение к базе данных установлено.');
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT NOT NULL,
            score INTEGER NOT NULL
        )`);
    }
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Сохранение результата игры
app.post('/save-score', (req, res) => {
    const { telegram_id, score } = req.body;
    db.run('INSERT INTO scores (telegram_id, score) VALUES (?, ?)', [telegram_id, score], (err) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка сохранения результата игры.' });
        } else {
            res.status(200).json({ message: 'Результат игры успешно сохранен.' });
        }
    });
});

// Получение общего количества очков
app.get('/get-total-score/:telegram_id', (req, res) => {
    const telegram_id = req.params.telegram_id;
    db.get('SELECT SUM(score) as total_score FROM scores WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка получения общего количества очков.' });
        } else {
            res.status(200).json({ total_score: row.total_score || 0 });
        }
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
