import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SpotifyManager } from './';

export const spotifyAuthErrorCheck = async <TResponse>({error, refetch}: { error: any, refetch: () => Promise<TResponse> }) => {
		const status = error?.response?.status;
		if(status !== 401) {
			throw error;
		}

		await SpotifyManager.refresh();
		return refetch();
}

const getConfig = () => {
	return {
		headers: { 'Authorization': `Bearer ${SpotifyManager.getToken()}`},
   	}
}

export const spotifyGet = async <TResponse>(path: string) => {
	const config = getConfig();
	const response = axios.get<TResponse>(path, config)
		.catch((error) => spotifyAuthErrorCheck<AxiosResponse<TResponse>>({ error, refetch: () => {
			return axios.get<TResponse>(path, getConfig())
		}}))

	return response;
}

export const spotifyPost = async <TRequest, TResponse>(path: string, data: TRequest) => {
	const config = getConfig();
	const response = axios.post<TRequest, TResponse>(path, data, config)
		.catch((error) => spotifyAuthErrorCheck<TResponse>({ error, refetch: () => {
			return axios.post<TRequest, TResponse>(path, data, getConfig());
		}}))


	return response;
}