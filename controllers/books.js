import fs from 'fs';

const FILEPATHS = [
  new URL('../books/akhlak.json', import.meta.url),
  new URL('../books/al-quran-dan-tafsir.json', import.meta.url),
  new URL('../books/aqidah.json', import.meta.url),
  new URL('../books/fiqih-ibadah.json', import.meta.url),
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
    );
  });

  if (bookId && category) {
    let response = [];
    Promise.all(promises).then((results) => {
      for (let i = 0; i < results.length; i++) {
        const content = results[i];

        const books = JSON.parse(content);
        response = books.find((data) => data.id === bookId);

        if (response) break;
      }

      res.end(JSON.stringify(response));
    });
    // fs.readFile(
    //   new URL(`../books/al-quran-dan-tafsir.json`, import.meta.url),
    //   'utf8',
    //   (err, data) => {
    // let response = JSON.parse(data);
    // if (bookId) {
    //   response = response.find((item) => item.id === bookId);
    // }
    // if (searchQuery) {
    //   response = response.content.filter(({ text }) =>
    //     text.includes(searchQuery)
    //   );
    // }
    // res.end(JSON.stringify(response));
    //   }
    // );
  } else {
    Promise.all(promises).then((results) => {
      let bookId = [];
      results.forEach((content) => {
        const books = JSON.parse(content);
        books.forEach(({ id, info }) => {
          const category = info?.category || 'test';
          bookId.push({
            id,
            category: category
              .toLowerCase()
              .replaceAll(' ', '-')
              .replace('&', 'dan'),
          });
        });
      });
      res.end(JSON.stringify(bookId));
    });
  }
};

export const getCategories = (req, res) => {
  const fileNames = [];
  fs.readdir(new URL('../books/', import.meta.url), (err, files) => {
    files.forEach((file) => {
      fileNames.push({ category: file.replace('.json', '') });
    });
    res.end(JSON.stringify(fileNames));
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
