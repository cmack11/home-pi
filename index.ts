import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import {
  MailListener,
} from "mail-listener5";  
import { parse } from "node-html-parser";
import { applicationsRouter } from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const transporter = nodemailer.createTransport(
{
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER, // mail
  	  pass: process.env.EMAIL_PASS, // pass
    },
    logger: true
  })

const mailListener = new MailListener({
  username: process.env.EMAIL_USER, // mail
  password: process.env.EMAIL_PASS, // pass
  host: "smtp.gmail.com", // host
  port: 993, // imap port
  tls: true, // tls
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN", ["SINCE", new Date().getTime()]], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email will be marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  attachments: false, // get mail attachments as they are encountered
});

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("mailbox", function(mailbox){
  console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail, seqno) {
  const parsed = parse(mail.html);
  const element = parsed.querySelector("td");
  console.log("MAIL",mail, parsed, element)
  let message = '';
  if(element)
  	message = element.textContent.trim();
  if(message) {
  	console.log("Recieved Message:", message)
  	transporter.sendMail({
  		to:`${mail.from.text}`,
  		from:"homepireceiver@gmail.com",
  		text: `Received: "${message}"`
  })
  } else {
  	console.log("Error Parsing Message:", parsed)
  }
})

app.use(express.static('public'));

app.use('/applications', applicationsRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  mailListener.start();
});
