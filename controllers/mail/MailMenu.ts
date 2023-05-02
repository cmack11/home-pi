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
			case "add":
				return await MailMenu.handleAddInput({ input: rest });
			case "health":
				return "✅";
			case "status":
				return await MailMenu.handleStatusInput();
			case "help":
				return `Possible commands:\n - QUEUE\n - ADD`; 
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

	public static async handleAddInput({ input }: { input: string}) {
		if(input?.trim()?.split(" ")?.length != 1) {
			return `Error improper usage\n\nUse "ADD HELP" to view proper usage `;
		} else if(input?.trim()?.toLowerCase() === 'help') {
			return `Possible commands:\n - add <spotify_track_link>`;
		} else if(!input?.match(/https:\/\/open\.spotify\.com\/track\//)) {
			return "Error improper usage\n\nSpotify link must be a track link"
		}

		try {
			const response = await SpotifyManager.parseLinkAndAddToPlaylist(input);
			return response;
		} catch(error: any) {
			return error?.message ?? "Unknown Error. Could not complete request";
		}
	}

	public static async handleStatusInput() {
		const playback = await SpotifyManager.getCurrentPlayback();
		if(!playback) {
			return "No current playback";
		} else {
			return `STATUS\n\nPlayback Type: ${playback?.currently_playing_type}\n`;
		}
	}
}