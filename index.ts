import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';

require('dotenv').config()

const db = new Database(
    'nukes.db',
    { verbose: console.log }
);

const findUserByUsername = db.prepare(`SELECT * FROM users WHERE username=?;`)
const findUserById = db.prepare(`SELECT * FROM users WHERE id=?;`)
const writeQuery = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?);`)

const app = express();
app.use(express.json());
app.use(cors());

const frenchNukeCodes: string[] = ['12345', 'abcde', 'hello world', 'juan'];

app.get('/codes', (req, res) => {
    const { authorization } = req.headers;

    if (authorization) {
        const decodedUserObject = jwt.verify(authorization, process.env.JWT_TOKEN);

        console.log(decodedUserObject);

        if (decodedUserObject) {
            res.json({ codes: frenchNukeCodes });
        } else {
            res.status(400).json({ error: "Something went wrong, log in again sil vous ples " })
        }
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).json({ error: "All inputs are required" });
        }

        const item = findUserByUsername.get(username);
        if (item) return res.status(400).json({ error: 'Le user exists already!!!' })

        const encryptedPassword = await bcrypt.hash(password, 10);
        const { lastInsertRowid } = writeQuery.run(username, encryptedPassword);

        // console.log(password);
        // console.log(password, ` => `, encryptedPassword, lastInsertRowid);

        res.json({ message: `registered ${username} hon hon hon with id ${lastInsertRowid} 🍇` })
        // token: jwt.sign({ user_id: lastInsertRowid }, process.env.JWT_TOKEN)
        // });
    } catch (error) {
        res.status(400).json({ error })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = findUserByUsername.get(username);
        if (!username || !user || !password) return res.status(400).json({ error: "Missing or incorrect details" });

        const isPasswordCorect = bcrypt.compare(password, user?.password);
        if (!isPasswordCorect) return res.status(400).json({ error: "Incorrect details" });

        const token = jwt.sign({ user_id: user.id }, process.env.JWT_TOKEN);
        res.json({ token, codes: frenchNukeCodes });

    } catch (error) {
        res.status(400).json({ error })
    }
})

app.listen(3000, () => {
    console.info('listening on port 3000');
});