/* eslint-disable no-unused-vars */
import pg from 'pg';
import base from './base.js';

const { Pool } = pg;

class db extends base {
    constructor(tableName) {
        super(tableName);
        this.tableName = tableName;

        // 初始化 PostgreSQL 连接池
        console.debug('Connecting to PostgreSQL:', process.env.POSTGRES_URL);
        this.pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        });

        this.pool.connect()
            .then(() => {
                console.debug('Connection has been established successfully.');
            })
            .catch((err) => {
                console.error('Unable to connect to the database:', err);
            });
    }

    async fetch(where = {}, { desc, limit, offset } = {}) {
        try {
            const conditions = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' OR ');
            const values = Object.values(where);

            let query = `SELECT * FROM ${this.tableName}`;
            if (conditions) query += ` WHERE ${conditions}`;
            if (desc) query += ` ORDER BY ${desc} DESC`;
            if (limit) query += ` LIMIT ${limit}`;
            if (offset) query += ` OFFSET ${offset}`;

            const result = await this.pool.query(query, values);
            return result.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async select(where = {}, { desc, limit, offset } = {}) {
        try {
            const conditions = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            const values = Object.values(where);

            let query = `SELECT * FROM ${this.tableName}`;
            if (conditions) query += ` WHERE ${conditions}`;
            if (desc) query += ` ORDER BY ${desc} DESC`;
            if (limit) query += ` LIMIT ${limit}`;
            if (offset) query += ` OFFSET ${offset}`;

            const result = await this.pool.query(query, values);
            return result.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async count(where = {}) {
        try {
            const conditions = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            const values = Object.values(where);

            let query = `SELECT COUNT(*) FROM ${this.tableName}`;
            if (conditions) query += ` WHERE ${conditions}`;

            const result = await this.pool.query(query, values);
            return parseInt(result.rows[0].count, 10);
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    async add(data) {
        try {
            const keys = Object.keys(data).join(', ');
            const values = Object.values(data);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

            const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders}) RETURNING *`;
            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async update(data, where) {
        try {
            const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
            const values = Object.values(data);

            const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + values.length + 1}`).join(' AND ');
            const whereValues = Object.values(where);

            const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
            const result = await this.pool.query(query, [...values, ...whereValues]);
            return result.rowCount;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async delete(where) {
        try {
            const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            const values = Object.values(where);

            const query = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
            const result = await this.pool.query(query, values);
            return result.rowCount;
        } catch (err) {
            console.error(err);
            return;
        }
    }
}

export default db;
