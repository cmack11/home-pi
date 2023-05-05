import { SpotifyManager, TrackObject, EpisodeObject } from '..';

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
		const { currently_playing, queue } = await SpotifyManager.getQueue();
		if(!currently_playing) {
			return "No current playback";
		} else {
			const { name } = currently_playing;
			let source = '';
			if((currently_playing as TrackObject)?.artists) {
				source = (currently_playing as TrackObject)?.artists?.reduce((sum, a) => (sum === '' ? `${a?.name}` : `${sum}, ${a?.name}`),"")
			} else {
				source = (currently_playing as EpisodeObject)?.show?.name ?? '';
			}
			const spotOne = queue?.[0]?.name ?? ""
			const spotTwo = queue?.[1]?.name ?? ""
			const spotThree = queue?.[2]?.name ?? ""
			return `STATUS\n\n🎵: ${name}\n🗣: ${source}\nComing Up:\n\t1️⃣: ${spotOne}\n\t2️⃣: ${spotTwo}\n\t3️⃣: ${spotThree}`;
		}
	}
}