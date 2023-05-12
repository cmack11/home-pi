import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import {
  MailListener,
} from "mail-listener5";  
import { MailMenu } from './MailMenu';
import { SpotifyManager } from '../spotify';
import { convertInboundToOutboundAddress, createMailListener, parseMail } from './utilities';
import { DIRECTORY, MY_ADDRESS} from './constants'

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
		const sender = mail?.from?.text ?? '';

		const message = parseMail(mail);
		console.log('PARSED', parseMail(mail))

		// TODO: IF WE GET A FAILED SEND MESSAGE, HAVE A WAY TO RETRY SENDING
		if([/no-reply@/, /homepi/].some(r => sender.match(r))){
			console.log('ignoring', sender)
			return;
		}

		if(message) {
			console.log("Recieved Message:", message)
			MailMenu.handleInput({ input: message }).then((returnMessage = 'Error processing return message') => {
				this.sendMail({ to: convertInboundToOutboundAddress({ to: mail.from.text }), message: returnMessage, originalMessage: message })
			})
		} else {
			console.error(`Error Parsing Message: "${message}"`)
		}
	})

	this.mailListener.start();
   }

   public sendMail({to, message, originalMessage }: {to: string, message: string, originalMessage?: string}) {
   	if(!this.mailTransporter){ 
   		console.error('no instance of mail transporter')
   		return;
   	}
   	console.log('sending email:', to, message)
   	this.mailTransporter.sendMail({
  		to: to,
  		from:"homepireceiver@gmail.com",
  		subject: "",
  		text: message,
  		html: `<div dir="ltr">${message}</div>`,
  	})
  	// Logging all send mail to my own phone number
  	if(to !== MY_ADDRESS) {
  		this.mailTransporter.sendMail({
  			to: MY_ADDRESS,
  			from:"homepireceiver@gmail.com",
  			text: `FROM: ${DIRECTORY[to]?.full_name ?? to}\n\nINPUT: "${originalMessage ?? ''}"\n\n OUTPUT: "${message}"`
  		})
  	}
   }

}