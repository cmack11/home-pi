import {
  MailListener,
} from "mail-listener5";  
import { parse } from "node-html-parser";
import { MailMenu } from './MailMenu';

export const convertInboundToOutboundAddress = ({ to }: { to: string }) => {
	/*if(to?.match(/@mms.att.net/)) {
		return `${to?.split("@")?.[0]}@txt.att.net`;
	}*/

	return to;
}

export const parseMail = (mail: any) => {
	const { html, text, attachments, from } = mail; 
	const sender = from?.text ?? '';
	const parsed = parse(mail.html);
	const element = parsed.querySelector("td");
	console.info("RECEIVED MAIL", { sender, text, attachments, attachmentsContent: attachments?.map((e: any) => e?.content?.toString()?.slice(0,100)), html })
	let message = '';
	if(sender?.match(/@mms.att.net/)) {
		message = parsed?.querySelector("td")?.textContent ?? ""
	} else if(sender?.match(/@vzwpix.com/)) {
		message = attachments?.[0]?.content?.toString();
	} else if(sender?.match(/@tmomail.net/)) {
		message = attachments?.some((a: any) => a?.contentType === "text/plain")?.content?.toString();
		console.log(`TMOMAIL 1: "${mail}"`)
		if(!message) {
			console.log(`TMOMAIL 2: "${text}"`)
			message = text?.replaceAll(/\[cid:.*?\]/g, "")?.split("\n").pop() ?? "";
		}
	} else {
		if(text) {
			message = text;
		} else if(attachments.length) {
			message = attachments?.[0]?.content?.toString();
		} else if(element) {
			message = element.textContent;
		}
	}

	return message?.trim() ?? "";

}


export const createMailListener = () => {
	const mailListener = new MailListener({
		username: process.env.EMAIL_USER, // mail
		password: process.env.EMAIL_PASS, // pass
		host: "smtp.gmail.com", // host
		port: 993, // imap port
		tls: true, // tls
		connTimeout: 10000, // Default by node-imap
		authTimeout: 5000, // Default by node-imap,
		// debug: console.log, // Or your custom function with only one incoming argument. Default: null
		tlsOptions: { rejectUnauthorized: false },
		mailbox: "INBOX", // mailbox to monitor
		searchFilter: ["UNSEEN", ["SINCE", new Date().getTime()]], // the search filter being used after an IDLE notification has been retrieved
		markSeen: true, // all fetched email will be marked as seen and not fetched next time
		fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
		attachments: true, // get mail attachments as they are encountered
		attachmentOptions: { directory: "attachments/" }
	});

	return mailListener;
}