import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
} from '../controller/auth.controller.js';
import { validate } from '../middleware/validate.js';
import {
  registrationSchema,
  loginSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validate({
    body: registrationSchema,
  }),
  register
);

authRouter.post(
  '/login',
  validate({
    body: loginSchema,
  }),
  login
);

authRouter.post(
  '/refresh',
  validate({
    body: refreshTokenSchema,
  }),
  refresh
);

authRouter.post(
  '/logout',
  validate({
    body: refreshTokenSchema,
  }),
  logout
);

export default authRouter;
