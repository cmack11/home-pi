import { Request, Response } from 'express';
import { start, stop, status } from '../models/matrix';
const stars = (req: Request, res: Response) => {
	console.log('ccm','start stars recieved', status);
	if(!status.running)
		start();
	else 
		stop();
	res.send({});
}

export default {
	stars,
}