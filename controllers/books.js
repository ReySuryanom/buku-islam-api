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

export const getSpecificContent = (req, res) => {
  const searchQuery = req.query.q;

  console.log(searchQuery);
  res.json({ searchQuery });
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

  fs.readFile(
    new URL(`../books/${category}.json`, import.meta.url),
    'utf8',
    (err, data) => {
      res.end(data);
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
        example:
          'https://buku-islam-api.vercel.app/books?bookId=e75e8fdd-b3de-443e-a17b-be8bbaa72c52&category=hadits',
        description: 'Returns books by keyword.',
      },
    },
  });
};

// if (searchQuery) {
//   response = response.content.filter(({ text }) => text.includes(searchQuery));
// }

// export const getSpecificContent = (req, res) => {
//   fs.readFile(
//     new URL('../books/al-quran-dan-tafsir.json', import.meta.url),
//     'utf8',
//     (err, data) => {
//       const books = JSON.parse(data);
//       const { content } = books.find((book) => book.id === req.params.id);
//       const currentPage = content.find((book) => book.page == req.params.page);
//       if (currentPage) {
//         res.end(JSON.stringify(currentPage));
//       } else {
//         res.end(
//           JSON.stringify({
//             message: 'Maaf, halaman yang anda cari tidak ada pada buku ini.',
//           })
//         );
//       }
//     }
//   );
// };
