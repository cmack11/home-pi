import { Router } from 'express';
import jetValidator from 'jet-validator';



// **** Init **** //

const apiRouter = Router(),
  validate = jetValidator();





// **** Export default **** //

export default apiRouter;
