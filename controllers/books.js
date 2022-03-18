import fs from 'fs';
import { BASE_URL, FILEPATHS, rootEndpoint } from '../utils/constant.js';
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
    bookParams = await checkParams(req.query.bookId, 'book');
    pageParams = req.query.page;
    matchCaseParams = req.query.matchCase;
    caseInsensitiveParams = req.query.caseInsensitive;

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
            if (text.indexOf(query) !== -1) {
              const highlightWord = formattingWords(text, query);
              if (highlightWord === 'object') {
                res.json({ status: 'error' });
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
    if (!pageParams || pageParams < 1 || isNaN(pageParams)) {
      res.end({ status: 'error' });
    } else {
      res.json({
        links: { base, next, current, prev },
        searchResults: relevantQueries.length,
        relevantQueries: splitArray(relevantQueries)[pageParams - 1],
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
};

export const getBooks = (req, res) => {
  const bookId = req.query.bookId;
  const category = req.query.category;

  if (bookId && category) {
    fs.readFile(
      new URL(`../books/${category}.json`, import.meta.url),
      'utf8',
      (_, data) => {
        const books = JSON.parse(data);
        const book = books.find((book) => book.id === bookId);

        res.json(book);
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

  res.json(categoryFileNames);
};

export const getCategoryBooks = async (req, res) => {
  const { category } = req.params;
  const books = await getCategoryBook(category, true);

  res.json(books);
};

/**
const bookPromises = categoryParams.map((category) => {
      const path = new URL(`../books/${category}.json`, import.meta.url);
      return new Promise(
        function (path, resolve, reject) {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
              reject('');
            } else {
              const categoriesBook = JSON.parse(data).filter(
                ({ id }) => bookParams.indexOf(id) !== -1
              );
              let isRelevantBook = false;
              const markingContent = categoriesBook
                .map((item) => {
                  const markingParaf = item.content.map(({ page, text }) => {
                    if (text.indexOf(query) !== -1) {
                      isRelevantBook = true;
                      const highlightWord = formattingWords(text, query);
                      if (highlightWord === 'object') {
                        res.json({ status: 'error' });
                      }
                      relevantQueries.push({
                        no: startNumber,
                        id: item.id,
                        page,
                        highlightWord,
                        category: formattingCategory(item.info.category),
                        title: item.info.title,
                      });
                      startNumber++;
                      return { page, text: highlightedWords(text, query) };
                    }
                    return { page, text };
                  });

                  if (isRelevantBook) {
                    return { ...item, content: markingParaf };
                  }
                })
                .filter(Boolean);
              resolve(markingContent);
            }
          });
        }.bind(this, path)
      ).catch((err) => console.log(err));
    });



 */

/**
     * {
          const categoriesBook = JSON.parse(data).filter(
            ({ id }) => bookParams.indexOf(id) !== -1
          );
          categoriesBook.forEach((item) => {
            item.content.forEach(({ page, text }) => {
              if (text.indexOf(query) !== -1) {
                const highlightWord = formattingWords(text, query);
                if (highlightWord === 'object') {
                  res.json({ status: 'error' });
                }
                console.log(data);
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
          });
        }
     */
