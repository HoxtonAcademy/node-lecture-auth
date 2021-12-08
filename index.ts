import bcrypt from 'bcryptjs';
import randomstring from 'randomstring';

import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';

dotEnv.config()

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const db = new Database(
    'nukers.db',
    { verbose: console.log }
);

const getNuclearCode = () => randomstring.generate();

const init = db.prepare(`CREATE TABLE IF NOT EXISTS users (
    username  TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL,
    id        INTEGER PRIMARY KEY AUTOINCREMENT
);`)

init.run();

const app = express();
app.use(express.json());
app.use(cors());

const findUserByUsername = db.prepare(`SELECT * FROM users WHERE username=?;`)
const findUserById = db.prepare(`SELECT * FROM users WHERE id=?;`);
const createUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?);`);

app.post('/register', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) return res.status(400).json({ error: "All inputs are required" });

        const existingUser = findUserByUsername.get(username);
        if (existingUser) return res.status(400).json({ error: 'Le user exists already!!!' });

        const encryptedPassword = bcrypt.hashSync(password, 10);
        createUser.run(username, encryptedPassword);

        res.json({ message: `registered ${username} hon hon hon 🍇 vous can log in now` })
    } catch (error) {
        res.status(400).json({ error: "Something went wrong ;/" })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = findUserByUsername.get(username);
        if (!user) return res.status(400).json({ error: "Missing or incorrect details" });

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ error: "Missing or incorrect details" });

        const token = jwt.sign({ user_id: user.id }, process.env.JWT_TOKEN);

        return res.json({ token, code: getNuclearCode() });

    } catch (error) {
        res.status(400).json({ error: "Something went wrong ;/" })
    }
})

app.get('/code', (req, res) => {
    if (!req.headers.authorization) return res.status(400).json({ error: "log in sil te plait" })

    const { authorization } = req.headers;

    const decodedUserObject = jwt.verify(authorization, process.env.JWT_TOKEN);
    if (!decodedUserObject) return res.status(400).json({ error: "Something went wrong, log in again sil vous ples " })

    const user = findUserById.get(decodedUserObject.user_id);
    if (!user) return res.status(400).json({ error: "Something went wrong, log in again sil vous ples " })

    res.json({ code: getNuclearCode() });
});


app.listen(3000, () => {
    console.info('listening on port 3000');
});
