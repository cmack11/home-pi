import axios from 'axios'
import dotenv from 'dotenv';
import fs from 'fs';
import { Buffer } from 'buffer'
import { serialize } from './utilities';
import { spotifyGet, spotifyPost } from './request';

interface TokenResponse {
	access_token?: string
}

interface TrackObject {
		album?: {
			name?: string,
		},
		artists: any[],
		name?: string,
		id?: string,
		uri?: string,
}
type EpisodeObject = any;

interface QueueResponse {
	currently_playing?: TrackObject | EpisodeObject;
	queue?: TrackObject[] | EpisodeObject[];
}

interface PlaybackResponse {
	device?: any,
	shuffle_state?: boolean,
	repeat_state?: string,
	item?: TrackObject | EpisodeObject
}

dotenv.config();

var client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
var refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

 export class SpotifyManager {

   private static token: string | undefined;
   static async init() {
  		if(!SpotifyManager.token) {
  			await SpotifyManager.refresh();
  			//console.log('got token', SpotifyManager.token);
  		}
  		//console.log('get playback')
  		//SpotifyManager.getCurrentPlayback();
   }

   static getToken() {
   		return SpotifyManager.token;
   }



   static async refresh() {
  		var options = {
      			grant_type: 'refresh_token', 
      			refresh_token
    		}
    	try {
  		const {data, status} = await axios.post<TokenResponse>('https://accounts.spotify.com/api/token', serialize(options), {
  			// @ts-expect-error
  			headers: { 'Authorization': 'Basic ' + (new Buffer.from(`${client_id}:${client_secret}`).toString('base64')) }
  		})
  		SpotifyManager.token = data?.access_token
  		} catch(error) { 
  			console.log(error)
  		}

   	}

   		static async getCurrentPlayback() {
   			try {
   			const { data, status } = await spotifyGet<PlaybackResponse>("https://api.spotify.com/v1/me/player")
   			console.log('playback ',data)
   		} catch(error: any) {
   			console.error("error getting playback",error?.response?.data)
   		}
   		}

   		static async getURI(link: string) {
   				try {
   			const { data, status } = await axios.get<string>(
   				link)
   			const linkWithURI = data.match(/(open.spotify.com\/track\/[\w-]+)/g)?.[0] ?? '';
   			const uri = linkWithURI?.substring(linkWithURI?.search(/\/[\w-]+/))?.replace("/track/","") ?? '';
   			return uri;
   		} catch(error: any) {
   			console.error("error getting uri", error?.response?.data)
   		}
   		}

   		static async getQueue() {
   			const { data, status } = await spotifyGet<QueueResponse>("https://api.spotify.com/v1/me/player/queue")
   			// console.log('#####################')
   			// console.log('queue', data?.queue?.length, data)
   			// console.log('#####################')
   			return data;
   		}

   		static async addToQueue(trackURI: string) {
   			try {
   			const { data, status } = await spotifyPost<any, any>(
   				`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackURI}`,
   				{})
   			//console.log('queue response',data, status)
   		} catch(error: any) {
   			console.error(error.response.data)
   		}
   		}

   		static async parseLinkAndAddToQueue(link: string) {
   			const uri = await SpotifyManager.getURI(link);
   			if(uri) {
   				const { currently_playing, queue: initialQueue } = await SpotifyManager.getQueue();
   				const initialIndex = initialQueue?.findIndex(o =>  o?.uri?.includes(uri)) ?? -1;
   				const isCurrentlyPlaying = currently_playing?.uri.includes(uri)
   				if(isCurrentlyPlaying) {
   					return `Not added. Request is already playing`
   				} else if(initialIndex !== -1) {
   					return `Not added. Request is already ${initialIndex+1} in line`
   				}
   				await SpotifyManager.addToQueue(uri);
   				const { queue } = await SpotifyManager.getQueue();
   				const index = queue?.findIndex(o =>  o?.uri?.includes(uri)) ?? -1;
   				return index !== -1 ? `Added. Your request is ${index+1} in line` : "Error adding";
   			}
   		}

}