import express, { Application } from 'express';
import dotenv from 'dotenv';
import router from './routes/alert-routes'

dotenv.config();

const app: Application = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
