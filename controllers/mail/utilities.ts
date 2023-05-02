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