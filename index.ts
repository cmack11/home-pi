import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { applicationsRouter } from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.static('public'));

app.use('/applications', applicationsRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
