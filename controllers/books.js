import fs from 'fs';

const FILEPATHS = [
  new URL('../books/akhlak.json', import.meta.url),
  new URL('../books/al-quran-dan-tafsir.json', import.meta.url),
  new URL('../books/aqidah.json', import.meta.url),
  new URL('../books/fiqih-ibadah.json', import.meta.url),
  new URL('../books/fiqih-jinayat.json', import.meta.url),
  new URL('../books/fiqih-muamalat.json', import.meta.url),
  new URL('../books/fiqih-wanita.json', import.meta.url),
  new URL('../books/hadits.json', import.meta.url),
  new URL('../books/kajian-tematik.json', import.meta.url),
  new URL('../books/sirah-dan-biografi.json', import.meta.url),
  new URL('../books/ushul-fiqih.json', import.meta.url),
];

const highlightedWords = (text, query) => {
  const regex = new RegExp(query, 'g');
  return text.replace(regex, `<span>${query}</span>`).replace(/  +/g, ' ');
};

const formattingWords = (text, highlightWord) => {
  const targetedQuery = text.indexOf(highlightWord);
  let index = 2;
  try {
    for (; !text[targetedQuery - index].match(/<|>|\s/); index++);

    return (
      highlightedWords(
        text
          .substring(targetedQuery - index, targetedQuery + 50)
          .replace(/<(\/)?(\w)+(\s(\w)+='(\w)*')*>/gim, ' ')
          .replace(/<?\/?(\w+)?(\s(\w)+='(\w)*')*>/, ''),
        highlightWord
      ) + '...'
    );
  } catch (error) {
    return typeof error;
  }
};

export const getSpecificContent = (req, res) => {
  try {
    const { query } = req.query;
    const categoryParams = req.query.category.split(',');
    const bookParams = req.query.bookId.split(',');
    const relevantQueries = [];
    let startNumber = 1;

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
    Promise.all(bookPromises)
      .then((results) => {
        res.json({
          relevantQueries: splitArray(relevantQueries),
          books: results.flat(1),
        });
      })
      .catch(() => res.json({ status: 'error' }));
  } catch (error) {
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
      (err, data) => {
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
            let category = info.category
              .toLowerCase()
              .replace(/ /g, '-')
              .replace('&', 'dan');

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

export const getCategories = (req, res) => {
  const fileNames = { totalCategories: 0, categories: [] };
  fs.readdir(new URL('../books/', import.meta.url), (err, files) => {
    files.forEach((file) => {
      fileNames.categories.push({ category: file.replace('.json', '') });
    });
    fileNames.totalCategories = files.length;
    res.json(fileNames);
  });
};

export const getCategoryBooks = (req, res) => {
  const { category } = req.params;
  const books = [];

  fs.readFile(
    new URL(`../books/${category}.json`, import.meta.url),
    'utf8',
    (err, data) => {
      JSON.parse(data).forEach(({ id, info }) => books.push({ id, info }));

      res.json(books);
    }
  );
};

export const getRootRoutes = (req, res) => {
  res.json({
    maintaner: 'Muhammad Raihan Suryanom <raihansuryanom@gmail.com>',
    source: 'https://github.com/ReySuryanom/buku-islam-api',
    endpoints: {
      books: {
        pattern: 'https://buku-islam-api.vercel.app/books',
        description: 'Returns all books lists.',
      },
      categories: {
        pattern: 'https://buku-islam-api.vercel.app/books/categories',
        description: 'Returns all book categories.',
      },
      spesificCategory: {
        pattern: 'https://buku-islam-api.vercel.app/books/category/{category}',
        example: 'https://buku-islam-api.vercel.app/books/category/akhlak',
        description: 'Returns all books based on the requested category.',
      },
      spesificBook: {
        pattern:
          'https://buku-islam-api.vercel.app/books?bookId={id}&category={category}',
        example:
          'https://buku-islam-api.vercel.app/books?bookId=e75e8fdd-b3de-443e-a17b-be8bbaa72c52&category=hadits',
        description: 'Returns a specific book',
      },
      search: {
        pattern: 'https://buku-islam-api.vercel.app/books?search={query}',
        example: '/books?search=iman',
        description: 'Returns books by keyword.',
      },
    },
  });
};

const splitArray = (array) => {
  const newsPerSections = 5;
  const numberOfSections = Math.ceil(array.length / newsPerSections);

  const newArray = Array.from({ length: numberOfSections }, (_, index) => {
    const start = index * newsPerSections;
    return array.slice(start, start + newsPerSections);
  });

  return newArray;
};
