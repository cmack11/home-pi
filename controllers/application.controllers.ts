import { Request, Response } from 'express';
import { start } from '../models/matrix';
const stars = (req: Request, res: Response) => {
	console.log('ccm','start stars recieved');
	start();
	res.send({});
}

export default {
	stars,
}