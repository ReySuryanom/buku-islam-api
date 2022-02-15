import express from 'express';
import {
  getBooks,
  getCategories,
  getCategoryBooks,
} from '../controllers/books.js';

const router = express.Router();

router.get('/', getBooks);

router.get('/category', getCategories);

router.get('/category/:category', getCategoryBooks);

export default router;
