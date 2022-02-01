import express from 'express';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = 5000;

app.use('/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`REST API demo app listening at http://localhost:${PORT}`);
});
