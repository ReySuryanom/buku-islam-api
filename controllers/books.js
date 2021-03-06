import fs from 'fs';
import {
  BASE_URL,
  FILEPATHS,
  getRegex,
  listOfCategory,
  rootEndpoint,
} from '../utils/constant.js';
import {
  checkParams,
  formattingCategory,
  formattingWords,
  getCategoryBook,
  getCategoryFileNames,
  highlightedWords,
  navigatePages,
  pagination,
} from '../utils/helper.js';

export const getRootRoutes = (_, res) => {
  res.json(rootEndpoint);
};

export const getSpecificContent = async (req, res) => {
  try {
    let categoryParams,
      bookParams,
      exactMatchParams,
      caseSensitiveParams,
      pageParams;

    const baseURL = BASE_URL + req.url;
    const { query } = req.query;
    let startNumber = 1;
    categoryParams = await checkParams(req.query.category, 'category');
    bookParams = await checkParams(req.query.book_id, 'book');
    pageParams = req.query.page;
    exactMatchParams = req.query.exact_match;
    caseSensitiveParams = req.query.case_sensitive;

    const relevantQueries = categoryParams.flatMap((category) => {
      const data = fs.readFileSync(
        new URL(`../books/${category}.json`, import.meta.url),
        'utf8'
      );
      const categoriesBook = JSON.parse(data).filter(
        ({ id }) => bookParams.indexOf(id) !== -1
      );
      const markingContent = categoriesBook
        .flatMap((item) => {
          const markingParaf = item.content.flatMap(({ page, text }) => {
            const regex = getRegex(
              caseSensitiveParams,
              exactMatchParams,
              query
            );
            if (regex.test(text)) {
              const highlightWord = formattingWords(text, query, regex);
              if (highlightWord === 'object') {
                res.end({ status: 'error' });
              }
              return {
                no: startNumber++,
                id: item.id,
                page,
                highlightWord,
                category: formattingCategory(item.info.category),
                title: item.info.title,
              };
            }
          });
          return markingParaf;
        })
        .filter(Boolean);
      return markingContent;
    });

    const { base, current, next, prev } = navigatePages(
      baseURL,
      pageParams,
      relevantQueries.length
    );
    if (relevantQueries.length === 0) {
      return res.json({
        searchResults: relevantQueries.length,
        relevantQueries: [],
      });
    } else if (
      !pageParams ||
      pageParams <= 0 ||
      isNaN(pageParams) ||
      pageParams > Math.ceil(relevantQueries.length / 5)
    ) {
      return res.end({ status: 'error' });
    } else {
      return res.json({
        links: { base, next, current, prev },
        searchResults: relevantQueries.length,
        relevantQueries: pagination(relevantQueries)[pageParams - 1],
      });
    }
  } catch (error) {
    return res.json({ status: 'error' });
  }
};

export const getBooks = (req, res) => {
  const bookId = req.query.book_id;
  const category = req.query.category;
  const query = req.query.query;
  const exactMatchParams = req.query.exact_match;
  const caseSensitiveParams = req.query.case_sensitive;

  if (bookId && category) {
    fs.readFile(
      new URL(`../books/${category}.json`, import.meta.url),
      'utf8',
      (_, data) => {
        const books = JSON.parse(data);
        const book = books.find((book) => book.id === bookId);

        if (query) {
          const regex = getRegex(caseSensitiveParams, exactMatchParams, query);
          const content = book.content.map(({ page, text }) => {
            return {
              page,
              text: regex.test(text) ? highlightedWords(text, regex) : text,
            };
          });

          res.json({ ...book, content });
        } else {
          res.json(book);
        }
      }
    );
  } else {
    const promises = FILEPATHS.map((_path) => {
      return new Promise(
        function (_path, resolve, reject) {
          fs.readFile(_path, 'utf8', (err, data) => {
            if (err) {
              reject('');
            } else {
              resolve(data);
            }
          });
        }.bind(this, _path)
      ).catch((err) => console.log(err));
    });

    Promise.all(promises)
      .then((results) => {
        const bookId = {
          totalBooks: 0,
          totalCategories: promises.length,
          data: [],
        };
        results.forEach((content) => {
          const books = JSON.parse(content);
          books.forEach(({ id, info }) => {
            let category = formattingCategory(info.category);

            bookId.data.push({
              id,
              category: category,
            });
          });
        });
        bookId.totalBooks = bookId.data.length;
        res.json(bookId);
      })
      .catch((err) => console.log(err));
  }
};

export const getCategories = async (_, res) => {
  const fileNames = { totalCategories: 0, categories: [] };
  const categoryFileNames = await getCategoryFileNames(fileNames);

  res.json({ ...categoryFileNames, listOfCategory });
};

export const getCategoryBooks = async (req, res) => {
  const { category } = req.params;
  const books = await getCategoryBook(category, true);

  res.json(books);
};
