import { SpotifyManager } from '..';

export class MailMenu {
	public static async handleInput({ input = "" }: { input: string }) {
		const inputWords = input?.trim()?.split(" ");
		const command = inputWords?.shift()?.toLowerCase();
		const rest = inputWords?.join(" ");
		console.log(`command: ${command}`, `rest: ${rest}`)

		switch(command) {
			case "queue":
				return await MailMenu.handleQueueInput({ input: rest });
			case "help":
				return `Possible commands:\n - QUEUE`; 
			case "slay":
				return "purr";
			case "purr":
				return "slay";
			default:
				return `Unrecognized command "${command}"\n\n Use HELP to view all possible commands`
		}
	}

	public static async handleQueueInput({ input }: { input: string}) {
		if(input?.trim()?.split(" ")?.length != 1) {
			return `Error improper usage\n\nUse "QUEUE HELP" to view proper usage `;
		} else if(input?.trim()?.toLowerCase() === 'help') {
			return `Possible commands:\n - queue <spotify_track_link>`;
		} else if(!input?.match(/https:\/\/open\.spotify\.com\/track\//)) {
			return "Error improper usage\n\nSpotify link must be a track link"
		}

		try {
			const response = await SpotifyManager.parseLinkAndAddToQueue(input);
			return response;
		} catch(error: any) {
			return error?.message ?? "Unknown Error. Could not complete request";
		}
	}
}