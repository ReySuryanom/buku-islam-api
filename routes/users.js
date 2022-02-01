import express from 'express';
import fs from 'fs';

const router = express.Router();

router.get('/', (req, res) => {
  fs.readFile(
    new URL('../books/users.json', import.meta.url),
    'utf8',
    (err, data) => {
      console.log(import.meta.url);
      res.end(data);
    }
  );
});

router.get('/:id', (req, res) => {
  fs.readFile(
    new URL('../books/users.json', import.meta.url),
    'utf8',
    (err, data) => {
      const users = JSON.parse(data);
      const user = users[`user${req.params.id}`];
      res.end(JSON.stringify(user));
    }
  );
});

export default router;
