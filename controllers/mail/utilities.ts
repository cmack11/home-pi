export const convertInboundToOutboundAddress = ({ to }: { to: string }) => {
	/*if(to?.match(/@mms.att.net/)) {
		return `${to?.split("@")?.[0]}@txt.att.net`;
	}*/

	return to;
}