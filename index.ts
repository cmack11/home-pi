import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  MailListener,
} from "mail-listener5"; 
import { applicationsRouter } from './routes';
import { MailController } from './controllers';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mailController = new MailController();;

app.use(express.static('public'));

app.use('/applications', applicationsRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
