

export class MailMenu {
	public static handleInput({ input = "" }: { input: string }) {
		const inputWords = input.split(" ");
		const command = inputWords?.shift()?.toLowerCase();
		const rest = inputWords?.join(" ");
		console.log(`command: ${command}`, `rest: ${rest}`)

		switch(command) {
			case "hi":
				return MailMenu.handleHi({input: rest})
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