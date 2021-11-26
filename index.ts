import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const db = new Database(
    'nukes.db',
    { verbose: console.log }
);


const app = express();
app.use(express.json());
app.use(cors());

const frenchNukeCodes: string[] = [
    '12345',
    'abcde',
    'hello world',
    'juan'
];

app.post('/', (req, res) => {
    res.send(frenchNukeCodes);
});

app.listen(3000, () => {
    console.info('listening on port 3000')
});