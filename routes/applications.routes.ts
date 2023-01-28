import express from 'express';
import { applicationController } from '../controllers';

const router = express.Router();

router.post('/stars', applicationController.stars)

export default router;