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

const formattingWords = (text, highlightWord) => {
  const targetedQuery = text.indexOf(highlightWord);

  return (
    highlightedWords(
      text
        .substring(targetedQuery - 5, targetedQuery + 50)
        .replace(/<(\/)?(\w)+(\s(\w)+='(\w)*')*>/gim, ' '),
      highlightWord
    ) + '...'
  );
};

const highlightedWords = (text, query) => {
  const regex = new RegExp(query, 'g');
  return text.replace(regex, `<span>${query}</span>`).replace(/  +/g, ' ');
};

export const getSpecificContent = (req, res) => {
  try {
    const categoryParams = req.query.category.split(',');
    const bookParams = req.query.bookId.split(',');
    const { query } = req.query;

    const bookPromises = categoryParams.map((category) => {
      const path = new URL(`../books/${category}.json`, import.meta.url);
      return new Promise(
        function (path, resolve, reject) {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
              reject('');
            } else {
              const categoriesBook = JSON.parse(data).filter(({ id }) =>
                bookParams.includes(id)
              );
              const specificBooks = categoriesBook.map(
                ({ id, info, content }) => {
                  const specificContent = content
                    .map((item) => {
                      if (item.text.indexOf(query) !== -1) {
                        const sdf = item.text.match(query);
                        // console.log(
                        //   sdf.input.substring(sdf.index - 3, sdf.index + 5)
                        // );
                        return {
                          ...item,
                          text: highlightedWords(item.text, query),
                          highlight: formattingWords(item.text, query),
                          id,
                          info,
                        };
                      }
                    })
                    .filter(Boolean);
                  if (categoriesBook.length !== 0) {
                    return specificContent;
                  }
                }
              );

              resolve(specificBooks);
            }
          });
        }.bind(this, path)
      ).catch((err) => console.log(err));
    });
    Promise.all(bookPromises)
      .then((results) => {
        res.json(results.flat(2));
      })
      .catch(() => res.json({}));
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
