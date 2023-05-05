export interface TokenResponse {
	access_token?: string
}

export interface ArtistObject {
	name?: string;
}

export interface TrackObject {
		album?: {
			name?: string,
		},
		artists: ArtistObject[],
		name?: string,
		id?: string,
		uri?: string,
}

export interface ShowObject {
	name?: string;
}

export interface EpisodeObject {
	name?: string;
	uri?: string;
	show?: ShowObject;
}

export interface QueueResponse {
	currently_playing?: TrackObject | EpisodeObject;
	queue?: TrackObject[] | EpisodeObject[];
}

export interface PlaybackResponse {
	device?: any,
	shuffle_state?: boolean,
	repeat_state?: string,
	item?: TrackObject | EpisodeObject
	currently_playing_type?: string;
}