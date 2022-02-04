import express from 'express';
import { getBookDetail, getBooks } from '../controllers/books.js';

const router = express.Router();

router.get('/', getBooks);

router.get('/:id', getBookDetail);

export default router;
