import axios from 'axios'
import dotenv from 'dotenv';
import fs from 'fs';
import { Buffer } from 'buffer'
import { serialize, pluralize, getQueueResponseMessage } from './utilities';
import { spotifyGet, spotifyPost } from './request';
import { TokenResponse, PlaybackResponse, QueueResponse } from './types';

dotenv.config();

var client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
var refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

 export class SpotifyManager {

   private static token: string | undefined;
   private static adWatchProcessId: any;
   static async init() {
  		if(!SpotifyManager.token) {
  			await SpotifyManager.refresh();
  			//console.log('got token', SpotifyManager.token);
  		}
   }

   static getToken() {
   		return SpotifyManager.token;
   }



   static async refresh() {
   		console.log('refreshing token')
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
   			return data;
   		} catch(error: any) {
   			console.error("error getting playback",error?.response?.data)
   		}
   		}

   		static async getURI(link: string) {
         console.log(`"${link}"`)
   				try {
   			const { data, status } = await axios.get<string>(
   				link)
   			const linkWithURI = data.match(/(open.spotify.com\/track\/[\w-]+)/g)?.[0] ?? '';
         console.log('uri', "\n\n", linkWithURI)
   			const uri = linkWithURI?.substring(linkWithURI?.search(/\/[\w-]+/))?.replace("/track/","") ?? '';
   			if(!uri) {
   				throw new Error("⚠️ ERROR: Parse error ⚠️\n\nCould not find song id")
   			}
   			return uri;
   		} catch(error: any) {
   			console.error("error getting uri", error?.response?.data)
   			throw new Error("⚠️ ERROR: Unknown link ⚠️\n\nCould not find song id")
   		}
   		}

   		static async getQueue() {
   			try {
	   			const { data, status } = await spotifyGet<QueueResponse>("https://api.spotify.com/v1/me/player/queue")
	   			return data;
	   		} catch(error: any) {
	   			console.error("error getting queue", error?.response?.data)
	   			throw new Error("⚠️ ERROR: Could not fetch queue ⚠️")
	   		}
   		}

   		static async addToQueue(trackURI: string) {
   			try {
   				const { data, status } = await spotifyPost<any, any>(
   					`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackURI}`,
   					{})
   			} catch(error: any) {
	   			const { status, message, reason } = error?.response?.data?.error ?? {};
	   			if(reason === "NO_ACTIVE_DEVICE") {
	   				throw new Error("⚠️ ERROR: Could Not Add ⚠️\n\nNo device is actively playing")
	   			}
	   			console.error('error adding to queue',error?.response?.data)
	   			throw error;
   			}
   		}

   		static async getQueuePosition(uri: string) {
   			try {
   				const { currently_playing, queue: initialQueue } = await SpotifyManager.getQueue();
   				const initialIndex = initialQueue?.findIndex(o =>  o?.uri?.includes(uri)) ?? -1;
   				const isCurrentlyPlaying = currently_playing?.uri?.includes(uri)
   				if(isCurrentlyPlaying) {
   					return 0;
   				} else if(initialIndex !== -1) {
   					return initialIndex+1;
   				}
   			} catch(error) {
   				return -1;
   			}
   		}

   		static async parseLinkAndAddToQueue(link: string) {
   			const uri = await SpotifyManager.getURI(link);
   			if(uri) {
   				const position = await SpotifyManager.getQueuePosition(uri) ?? -1;
   				console.log(`position: ${position}`)
   				if(position > -1) {
   					return getQueueResponseMessage(position, { base: "Not added." })
   				}
   				await SpotifyManager.addToQueue(uri);
   				const addedPosition = await SpotifyManager.getQueuePosition(uri) ?? -1;
   				console.log(`addedPosition: ${addedPosition}`)
   				if(addedPosition > -1)
   					return getQueueResponseMessage(addedPosition, { 
   						base: "Added!",
   						currentlyPlayingMessage: "",
   						upNextMessage: "Your song is up next",
   						defaultMessagePrefix: "Your song is " ,
   						defaultMessagePostfix: " in the queue",
   					})
   				else 
   					throw new Error("⚠️ ERROR: Song not found after adding to queue ⚠️")

   			}
   		}

   		static async parseLinkAndAddToPlaylist(link: string) {
   			const uri = await SpotifyManager.getURI(link);
   			if(uri) {
   				// check playlist to see if it exists first
   				await SpotifyManager.addToPlaylist(uri)
   				// add playlist title to success message
   				return `Success! ✅ Your request is now in the playlist 🎵`;
   			}
   		}

       static async isSpotifyLink(link: string) {
         try {
           const uri = await SpotifyManager.getURI(link);
           return Boolean(uri);
         } catch(e) {
           return false;
         }
       }

   		static async addToPlaylist(trackURI: string, playlistId: string = "5Nk623STRCyYwH7XhX32R6") {
   			try {
   				const { data, status } = await spotifyPost<any, any>(
   					`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
   					{
   						uris:[`spotify:track:${trackURI}`]
   					})
   				return data;
   			} catch(error: any) {
	   			const { status, message, reason } = error?.response?.data?.error ?? {};
	   			console.error('error adding to playlist',error?.response?.data)
	   			throw new Error(message);
   			}
   		}

   		static async skipAhead() {
   			try {
   				const { data, status } = await spotifyPost<any, any>(
   					`https://api.spotify.com/v1/me/player/next`,
   					{})
   			} catch(error: any) {
	   			const { status, message, reason } = error?.response?.data?.error ?? {};
	   			if(reason === "NO_ACTIVE_DEVICE") {
	   				throw new Error("⚠️ ERROR: Could Not Skip ⚠️\n\nNo device is actively playing")
	   			}
	   			console.error('error skipping',error?.response?.data)
	   			throw error;
   			}
   		}
}