import fs from 'fs';
import {
  BASE_URL,
  FILEPATHS,
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
  splitArray,
} from '../utils/helper.js';

export const getRootRoutes = (_, res) => {
  res.json(rootEndpoint);
};

export const getSpecificContent = async (req, res) => {
  try {
    let categoryParams,
      bookParams,
      matchCaseParams,
      caseInsensitiveParams,
      pageParams;

    const baseURL = BASE_URL + req.url;
    const { query } = req.query;
    let startNumber = 1;
    categoryParams = await checkParams(req.query.category, 'category');
    bookParams = await checkParams(req.query.book_id, 'book');
    pageParams = req.query.page;
    matchCaseParams = req.query.match_case;
    caseInsensitiveParams = req.query.case_insensitive;

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
            const flags = caseInsensitiveParams ? 'gium' : 'gum';
            const pattern = matchCaseParams ? `\\b${query}\\b` : query;
            const regex = new RegExp(pattern, flags);

            if (regex.test(text)) {
              const highlightWord = formattingWords(text, query, regex);
              if (highlightWord === 'object') {
                res.end({ status: 'error', hihi: 'f' });
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
        relevantQueries: splitArray(relevantQueries)[pageParams - 1],
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: 'error' });
  }
};

export const getBooks = (req, res) => {
  const bookId = req.query.book_id;
  const category = req.query.category;
  const query = req.query.query;
  const page = req.query.page;
  const matchCaseParams = req.query.match_case;
  const caseInsensitiveParams = req.query.case_insensitive;

  if (bookId && category) {
    fs.readFile(
      new URL(`../books/${category}.json`, import.meta.url),
      'utf8',
      (_, data) => {
        const books = JSON.parse(data);
        const book = books.find((book) => book.id === bookId);

        if (query && page !== 'undefined') {
          const { text, page: pageContent } = book.content.find(
            (item) => item.page === +page
          );
          const flags = caseInsensitiveParams ? 'gium' : 'gum';
          const pattern = matchCaseParams ? `\\b${query}\\b` : query;
          const regex = new RegExp(pattern, flags);

          res.json({
            ...book,
            content: {
              page: pageContent,
              text: regex.test(text)
                ? highlightedWords(text, query, regex)
                : text,
            },
          });
        } else if (query) {
          const content = book.content.map(({ page, text }) => {
            const flags = caseInsensitiveParams ? 'gium' : 'gum';
            const pattern = matchCaseParams ? `\\b${query}\\b` : query;
            const regex = new RegExp(pattern, flags);
            const hasQuerySearch = matchCaseParams
              ? regex.test(text)
              : text.indexOf(query) !== -1;
            return {
              page,
              text: hasQuerySearch
                ? highlightedWords(text, query, regex)
                : text,
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
