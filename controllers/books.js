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

export const getBooks = (req, res) => {
  const bookId = req.query.bookId;
  const category = req.query.category;
  const searchQuery = req.query.search;

  if (searchQuery) {
    console.log(searchQuery);
    res.json({ searchQuery });
  } else if (bookId && category) {
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
        let bookId = [];
        results.forEach((content) => {
          const books = JSON.parse(content);
          books.forEach(({ id, info }) => {
            let category = info.category
              .toLowerCase()
              .replace(/ /g, '-')
              .replace('&', 'dan');

            bookId.push({
              id,
              category: category,
            });
          });
        });
        res.json(bookId);
      })
      .catch((err) => console.log(err));
  }
};

export const getCategories = (req, res) => {
  const fileNames = [];
  fs.readdir(new URL('../books/', import.meta.url), (err, files) => {
    files.forEach((file) => {
      fileNames.push({ category: file.replace('.json', '') });
    });
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
