import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SpotifyManager } from './';

export const spotifyRequestWrapper = async <TResponse>(promise: Promise<TResponse | { isRefreshed: boolean }>) => {
	return promise?.catch(async (e) => {
		const status = e?.response?.status;
		console.log('error wrapper status', status)
		if(status !== 401) {
			throw e;
		}

		await SpotifyManager.refresh();
		return { isRefreshed: true};
	})
}

const getConfig = () => {
	return {
		headers: { 'Authorization': `Bearer ${SpotifyManager.getToken()}`},
   	}
}

export const spotifyGet = async <TResponse>(path: string) => {
	const config = getConfig();
	// @ts-expect-error
	const response = spotifyRequestWrapper<TResponse>(axios.get<TResponse>(path, config)).then((res) => {
		// @ts-expect-error
		if(res?.isRefreshed) {
			return axios.get<TResponse>(path, getConfig())
		}
		return res as TResponse; 
	});

	return response;
}

export const spotifyPost = async <TRequest, TResponse>(path: string, data: TRequest) => {
	const config = getConfig();
	const response = spotifyRequestWrapper<TResponse>(axios.post<TRequest, TResponse>(path, data, config)).then((res) => {
		// @ts-expect-error
		if(res?.isRefreshed) {
			return axios.post<TRequest, TResponse>(path, data, getConfig())
		}
		return res; 
	});

	return response;
}