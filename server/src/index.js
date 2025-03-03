import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
configDotenv({
    path: ['.env.development.local', '.env']
});

import makeResponse from './units/makeResponse.js';
import db from './adapter/db.js';
import { DataTypes } from 'sequelize';
import apiRouter from './api/index.js';

const dbUser = new db('Users', {
    innerid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pk: { type: DataTypes.STRING, unique: true, allowNull: false },
    nick: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    cardData: { type: DataTypes.STRING, allowNull: true },
});
const dbTransaction = new db('Transactions', {
    innerid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    from_pk: { type: DataTypes.STRING, allowNull: false },
    to_pk: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    time: { type: DataTypes.BIGINT, unique: true, allowNull: false },
    comment: { type: DataTypes.STRING, allowNull: true },
});
const dbPost = new db('Posts', {
    innerid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    author_nick: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.BIGINT, unique: true, allowNull: false },
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);
app.use(function (request, response) {
    // 如果没有路由回答就返回 404
    makeResponse(response, 404, 'Not Found.');
});


let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.debug('Server listening on port', port);
});

process.on('uncaughtException', err => {
    console.error(err && err.stack)
});

export { dbUser, dbTransaction, dbPost };
export default app;
