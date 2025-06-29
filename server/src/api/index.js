import express from 'express';

import sudo from './sudo/index.js';
import userRouter from './user.js';
import transactionRouter from './transaction.js';
import postRouter from './post.js';
import generatorRouter from './generator.js';
import leaderboardRouter from './leaderboard.js';

const router = express.Router();

router.use('/sudo', sudo);
router.use('/user', userRouter);
router.use('/transaction', transactionRouter);
router.use('/post', postRouter);
router.use('/generator', generatorRouter);
router.use('/leaderboard', leaderboardRouter);

export default router;
