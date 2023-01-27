import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { start } from './matrix';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
start();
app.get('/', (req: Request, res: Response) => {
  res.send('Hello Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
