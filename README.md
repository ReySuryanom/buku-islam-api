# Buku Islam - API

### Endpoint usage

- [x] `/books` = Returns all books lists.
- [x] `/books/categories` = Returns all book categories.
- [x] `/books/category/{category}` = Returns all books based on the requested category. **Example: [/books/category/akhlak](https://buku-islam-api.vercel.app/books/category/akhlak)**
- [x] `/books?bookId={id}&category={category}` = Returns a book. **Example: [/books?bookId=f95cd462-5c4b-48ce-bae6-76a79a10521e&category=hadits](https://buku-islam-api.vercel.app/books?bookId=f95cd462-5c4b-48ce-bae6-76a79a10521e&category=hadits)**

#### Coming Soon

- [x] `/books?search={query}` = Returns books by keyword. **Example: [/books?search=iman](https://buku-islam-api.vercel.app/books?search=iman)**

### Data Source

- [Rumah Fiqih](https://rumahfiqih.com/) = Buku Islam
