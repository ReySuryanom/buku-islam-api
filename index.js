import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import booksRoutes from './routes/books.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/books', booksRoutes);

app.listen(PORT, () => {
  console.log(`REST API demo app listening at http://localhost:${PORT}`);
});
