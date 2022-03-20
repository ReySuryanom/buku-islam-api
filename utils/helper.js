import fs from 'fs';

export const splitArray = (array) => {
  const newsPerSections = 5;
  const numberOfSections = Math.ceil(array.length / newsPerSections);

  const newArray = Array.from({ length: numberOfSections }, (_, index) => {
    const start = index * newsPerSections;
    return array.slice(start, start + newsPerSections);
  });

  return newArray;
};

export const formattingCategory = (category) =>
  category.toLowerCase().replace(/ /g, '-').replace('&', 'dan');

export const navigatePages = (url, page, dataLength) => {
  let next, prev, base;
  const margin = parseInt(dataLength / 5);
  const pageNumber = parseInt(page);

  base = url.replace(/&page=\d+/, '&page=');
  next = url.concat(`&page=${pageNumber + 1}`);

  if (pageNumber > 1) {
    prev = url.replace(/&page=\d+/, `&page=${pageNumber - 1}`);
  } else {
    prev = null;
  }
  if (pageNumber >= margin) {
    next = null;
  } else {
    next = url.replace(/&page=\d+/, `&page=${pageNumber + 1}`);
  }

  return { base, next, current: url, prev };
};

export const getCategoryFileNames = (fileNames) => {
  const arr = [];
  return new Promise((resolve, _) => {
    fs.readdir(new URL('../books/', import.meta.url), (_, files) => {
      files.forEach((file) => {
        if (fileNames) {
          fileNames.categories.push({ category: file.replace('.json', '') });
        } else {
          arr.push(file.replace('.json', ''));
        }
      });
      if (fileNames) {
        fileNames.totalCategories = files.length;
        resolve(fileNames);
      } else {
        resolve(arr);
      }
    });
  });
};

export const getAllBooks = async () => {
  const allCategories = await getCategoryFileNames();
  const allBookPromises = allCategories.map((category) => {
    return new Promise((resolve, _) => {
      const books = getCategoryBook(category);
      resolve(books);
    });
  });

  return await Promise.allSettled(allBookPromises).then((results) =>
    results.flatMap((result) => {
      return result.value;
    })
  );
};

export const getCategoryBook = (category, isDetail = false) => {
  const books = [];

  return new Promise((resolve, _) => {
    fs.readFile(
      new URL(`../books/${category}.json`, import.meta.url),
      'utf8',
      (_, data) => {
        JSON.parse(data).forEach(({ id, info }) => {
          if (isDetail) {
            books.push({ id, info });
          } else {
            books.push(id);
          }
        });
        resolve(books);
      }
    );
  });
};

export const checkParams = async (params, types) => {
  const data = { book: getAllBooks(), category: getCategoryFileNames() };
  return params === 'all' ? await data[types] : params.split(',');
};

export const highlightedWords = (text, query, regex) => {
  return text.replace(regex, `<span>${query}</span>`).replace(/  +/g, ' ');
};

export const formattingWords = (text, highlightWord, regex) => {
  const targetedQuery = text.indexOf(highlightWord);
  let prefix = 0,
    suffix = 0;

  try {
    // Prefix
    for (; !text[targetedQuery - prefix].match(/<|>|\s/); prefix++);
    // Suffix
    for (; !text[targetedQuery + suffix].match(/</) && suffix < 50; suffix++);

    return (
      highlightedWords(
        text
          .substring(targetedQuery - prefix, targetedQuery + suffix)
          .replace(/<(\/)?(\w)+(\s(\w)+='(\w)*')*>*/gim, ' ')
          .replace(/\w+>/gim, '')
          .replace(/(<?\/?\w+)?>/g, ''),
        highlightWord,
        regex
      ) + '...'
    );
  } catch (error) {
    return typeof error;
  }
};
