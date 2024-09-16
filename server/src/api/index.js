import express from 'express';

import sudo from './sudo/index.js';
import userRouter from './user.js';
import transactionRouter from './transaction.js';

const router = express.Router();

router.use('/user', userRouter);
router.use('/transaction', transactionRouter);
router.use('/sudo', sudo);

export default router;
