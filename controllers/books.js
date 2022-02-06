import fs from 'fs';

export const getBooks = (req, res) => {
  const searchQuery = req.query.search;
  fs.readFile(
    new URL('../books/al-quran-dan-tafsir.json', import.meta.url),
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
    new URL('../books/al-quran-dan-tafsir.json.json', import.meta.url),
    'utf8',
    (err, data) => {
      const users = JSON.parse(data);
      const user = users[`user${req.params.id}`];
      res.end(JSON.stringify(user));
    }
  );
};
