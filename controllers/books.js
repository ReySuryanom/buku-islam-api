import fs from 'fs';

export const getBooks = (req, res) => {
  const searchQuery = req.query.search;
  fs.readFile(
    new URL('../books/fiqih-jinayat.json', import.meta.url),
    'utf8',
    (err, data) => {
      const users = JSON.parse(data);
      // console.log(
      //   users.data.filter(({ firstname }) => firstname === searchQuery).length
      // );
      //   const x = data.
      res.end(data);
    }
  );
};

export const getBookDetail = (req, res) => {
  fs.readFile(
    new URL('../books/al-quran-dan-tafsir.json', import.meta.url),
    'utf8',
    (err, data) => {
      const books = JSON.parse(data);
      const book = books.find((book) => book.id === req.params.id);
      res.end(JSON.stringify(book));
    }
  );
};

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
