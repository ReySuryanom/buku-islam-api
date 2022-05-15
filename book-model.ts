type Info = {
  title: string;
  author: string;
  publish: string;
  pages: number;
  price: number;
  category: string;
  desc: string;
};

type TableOfContent = {
  page: number;
  text: string;
  heading?: boolean;
  sub?: TableOfContent;
};

type Content = {
  page: number;
  text: string;
};

type Book = {
  id: string;
  info: Info;
  tableOfContents: TableOfContent[];
  content: Content[];
};

// {
//   "id": "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
//   "info": {
//     "title": "Al-Quran dan Sains",
//     "author": "Ahmad Sarwat, Lc., MA",
//     "publish": "Wed, 17 February 2021",
//     "pages": 61,
//     "price": 0,
//     "category": "Ilmu Al-Quran & Tafsir",
//     "source": "",
//     "desc":""
//   },
//   "tableOfContents": [
//     { "page": 6, "text": "Pendahuluan", "head": true },
//     { "page": 6, "text": "Pendahuluan" }
//   ],
//   "content": [
//     {
//       "page": 6,
//       "text": ""
//     }
//   ]
// }
