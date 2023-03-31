import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import {
  MailListener,
} from "mail-listener5";  
import { parse } from "node-html-parser";
import { MailMenu } from './MailMenu';

dotenv.config();

export class MailController {
	public mailTransporter: nodemailer.Transporter | undefined;
	public mailListener: any | undefined;

   constructor() {
  	const mailTransporter = nodemailer.createTransport({
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
		attachments: true, // get mail attachments as they are encountered
		attachmentOptions: { directory: "attachments/" }
	});

	mailListener.on("server:connected", function(){
		console.log("imapConnected");
	});

	// @ts-expect-error
	mailListener.on("mailbox", function(mailbox){
		console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
	});

	mailListener.on("server:disconnected", function(){
		console.log("imapDisconnected");
	});

	// @ts-expect-error
	mailListener.on("error", function(err){
		console.log(err);
	});

	// @ts-expect-error
	mailListener.on("mail", (mail, seqno) => {
		const parsed = parse(mail.html);
		const element = parsed.querySelector("td");
		console.log("MAIL", mail.text, mail.attachments, parsed, element)
		let message = '';
		if(mail.text)
			message = mail.text.trim();
		else if(mail.attachments.length)
			message = mail.attachments[0].content.toString();
		else if(element)
			message = element.textContent.trim();
		if(message) {
			console.log("Recieved Message:", message)
			MailMenu.handleInput({ input: message });
			this.sendMail({ to: `${mail.from.text}`, message: MailMenu.handleInput({ input: message })})
		} else {
			console.error("Error Parsing Message:", parsed)
		}
	})
	mailListener.start();

	this.mailListener = mailListener;
	this.mailTransporter = mailTransporter;
   }

   public sendMail({to, message}: {to: string, message: string}) {
   	if(!this.mailTransporter){ 
   		console.error('no instance of mail transporter')
   		return;
   	}

   	this.mailTransporter.sendMail({
  		to: to,
  		from:"homepireceiver@gmail.com",
  		text: message,
  	})
   }

}