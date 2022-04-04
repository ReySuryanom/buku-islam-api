export const BASE_URL =
  process.env.npm_lifecycle_event === 'dev'
    ? 'http://localhost:5000/books'
    : 'https://buku-islam-api.vercel.app/books';

export const FILEPATHS = [
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

export const getRegex = (caseSensitiveParams, exactMatchParams, query) => {
  const flags = caseSensitiveParams === 'true' ? 'gum' : 'gium';
  const pattern = exactMatchParams === 'true' ? `\\b${query}\\b` : query;
  const regex = new RegExp(pattern, flags);

  return regex;
};

export const listOfCategory = [
  { category: 'akhlak' },
  { category: 'al-quran-dan-tafsir' },
  { category: 'aqidah' },
  {
    category: 'fiqih',
    sub: [
      { category: 'fiqih-ibadah' },
      { category: 'fiqih-jinayat' },
      { category: 'fiqih-muamalat' },
      { category: 'fiqih-wanita' },
    ],
  },
  { category: 'hadits' },
  { category: 'kajian-tematik' },
  { category: 'sirah-dan-biografi' },
  { category: 'ushul-fiqih' },
];

export const rootEndpoint = {
  maintaner: 'Muhammad Raihan Suryanom <raihansuryanom@gmail.com>',
  source: 'https://github.com/ReySuryanom/buku-islam-api',
  endpoints: {
    books: {
      pattern: BASE_URL,
      description: 'Returns all books lists.',
    },
    categories: {
      pattern: `${BASE_URL}/categories`,
      description: 'Returns all book categories.',
    },
    spesificCategory: {
      pattern: `${BASE_URL}/category/{category}`,
      example: `${BASE_URL}/category/akhlak`,
      description: 'Returns all books based on the requested category.',
    },
    spesificBook: {
      pattern: `${BASE_URL}?book_id={id}&category={category}`,
      example: `${BASE_URL}?book_id=T0Uzd&category=hadits`,
      description: 'Returns a specific book',
    },
    search: {
      pattern: `${BASE_URL}/search?query={query}&category={categories}&book_id={Ids}&page={page}`,
      example: `${BASE_URL}/search?query=iman&category=all&book_id=all&page=9`,
      description: 'Returns books by keyword.',
    },
  },
};
