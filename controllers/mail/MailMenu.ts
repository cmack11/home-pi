import { SpotifyManager } from '..';

export class MailMenu {
	public static async handleInput({ input = "" }: { input: string }) {
		const inputWords = input.split(" ");
		const command = inputWords?.shift()?.toLowerCase();
		const rest = inputWords?.join(" ");
		console.log(`command: ${command}`, `rest: ${rest}`)

		switch(command) {
			case "hi":
				return MailMenu.handleHi({input: rest})
			case "queue":
				const message = await SpotifyManager.parseLinkAndAddToQueue(rest);
				return message;
			default:
				return `Possible commands: "HI"`
		}
	}

	public static handleHi({ input }: { input: string}) {
		switch(input?.toLowerCase()) {
			case "nice":
				return "Hello buddy";
			case "mean": 
				return "Hello ya nerd"
			default: 
				return `Possible commands: "nice" | "mean"`
		}
	} 
}