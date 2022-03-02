# Buku Islam - API

### Endpoint usage

- [x] `/books` = Returns all books lists.
- [x] `/books/categories` = Returns all book categories.
- [x] `/books/category/{category}` = Returns all books based on the requested category. **Example: [/book/categoy/akhlak](https://buku-islam-api.vercel.app/books/category/akhlak)**
- [x] `/books?bookId={id}&category={category}` = Returns a book.**Example: [/books?bookId=e75e8fdd-b3de-443e-a17b-be8bbaa72c52&category=hadits](https://buku-islam-api.vercel.app/books?bookId=e75e8fdd-b3de-443e-a17b-be8bbaa72c52&category=hadits)**

#### Coming Soon

- [x] `/books?search={query}` = Returns books by keyword.**Example: [/books?search=iman](https://buku-islam-api.vercel.app/books?search=iman)**

### Data Source

- [Rumah Fiqih](https://rumahfiqih.com/) = Buku Islam
