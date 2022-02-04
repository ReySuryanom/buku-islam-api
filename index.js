import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`REST API demo app listening at http://localhost:${PORT}`);
});
