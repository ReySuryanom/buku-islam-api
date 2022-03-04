import express from 'express';
import {
  getBooks,
  getCategories,
  getCategoryBooks,
  getSpecificContent,
} from '../controllers/books.js';

const router = express.Router();

router.get('/', getBooks);

router.get('/search', getSpecificContent);

router.get('/categories', getCategories);

router.get('/category/:category', getCategoryBooks);

export default router;
