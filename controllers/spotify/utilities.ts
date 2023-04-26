export const serialize = (obj: any) => {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        }
interface QueueResponseMessageOptions {
	base?: string;
	currentlyPlayingMessage?: string;
	upNextMessage?: string;
	defaultMessagePrefix?: string;
	defaultMessagePostfix?: string;
}
export const getQueueResponseMessage = (position: number, options?: QueueResponseMessageOptions) => {
	console.log(position, options)
	const { 
		base = "",
		currentlyPlayingMessage = "Your request is already playing",
		upNextMessage = "Your request is already up next",
		defaultMessagePrefix = "Your request is already ",
		defaultMessagePostfix = " in the queue",
	} = options ?? {};
	if(position < 0) {
		return "";
	}
	switch(position) {
		case 0:
			console.log(position, `${base} already playing`.trim())
			return `${base} already playing`.trim();
		case 1:
			console.log(position, `${base} ${upNextMessage}`.trim())
			return `${base} ${upNextMessage}`.trim();
		default:
			console.log(position, `${base} ${defaultMessagePrefix}${pluralize(position)}${defaultMessagePostfix}`.trim())
			return `${base} ${defaultMessagePrefix}${pluralize(position)}${defaultMessagePostfix}`.trim()
	}
}

export const pluralize = (num: number) => {
	switch(num) {
		case 1:
			return "1st";
		case 2:
			return "2nd";
		case 3:
			return "3rd";
		default:
			return `${num}th`
	}
}