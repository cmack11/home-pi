import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import {
  MailListener,
} from "mail-listener5";  
import { parse } from "node-html-parser";
import { MailMenu } from './MailMenu';
import { SpotifyManager } from '../spotify';
import { convertInboundToOutboundAddress, createMailListener } from './utilities';

dotenv.config();

export class MailController {
	public mailTransporter: nodemailer.Transporter | undefined;
	public mailListener: any | undefined;

   constructor() {
   	SpotifyManager.init();
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

	const mailListener = createMailListener();
	this.mailListener = mailListener;
	this.mailTransporter = mailTransporter;

	this.attachListenersAndStart();
   }

   private attachListenersAndStart() {
   	if(!this.mailListener) {
   		console.error('no mail listener found');
   	}
   		this.mailListener.on("server:connected", function(){
		console.log("imapConnected");
	});

	// @ts-expect-error
	this.mailListener.on("mailbox", function(mailbox){
		console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
	});

	this.mailListener.on("server:disconnected", () => {
		console.log("imapDisconnected");
		this.mailListener?.stop();
		this.mailListener = createMailListener();
		this.attachListenersAndStart();
	});

	// @ts-expect-error
	this.mailListener.on("error", function(err){
		console.log(err);
	});

	// @ts-expect-error
	this.mailListener.on("mail", (mail, seqno) => {
		const parsed = parse(mail.html);
		const element = parsed.querySelector("td");
		console.log("MAIL", {text: mail?.text, attachments: mail?.attachments, element: element?.textContent?.trim()})
		let message = '';
		if(mail.text)
			message = mail.text.trim();
		else if(mail.attachments.length)
			message = mail.attachments[0].content.toString();
		else if(element)
			message = element.textContent.trim();
		if(message) {
			console.log("Recieved Message:", message)
			MailMenu.handleInput({ input: message }).then((message = 'Error processing return message') => {
				this.sendMail({ to: convertInboundToOutboundAddress({ to: mail.from.text }), message })
			})
		} else {
			console.error("Error Parsing Message:", parsed)
		}
	})

	this.mailListener.start();
   }

   public sendMail({to, message}: {to: string, message: string}) {
   	if(!this.mailTransporter){ 
   		console.error('no instance of mail transporter')
   		return;
   	}
   	console.log('sending email:', to, message)
   	this.mailTransporter.sendMail({
  		to: to,
  		from:"homepireceiver@gmail.com",
  		text: message,
  	})
   }

}