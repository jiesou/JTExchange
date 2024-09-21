import express from 'express';
import makeResponse from './units/makeResponse.js';
import db from './adapter/db.js';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import apiRouter from './api/index.js';

configDotenv({
    path: ['.env.development.local', '.env']
})
const dbUser = new db('Users');
const dbTransaction = new db('Transactions');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
    'https://*.vercel.app', 'https://jtex.jiexs.top' ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);
app.use(function (request, response) {
    // 如果没有路由回答就返回 404
    makeResponse(response, 404, 'Not Found.');
});


let port = process.env.PORT || 3002;
app.listen(port, function () {
    console.debug('Server listening on port', port);
});

export { dbUser, dbTransaction };
export default app;
