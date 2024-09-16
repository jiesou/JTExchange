/* eslint-disable no-unused-vars */
import pg from 'pg';
import { Sequelize, Op, DataTypes } from 'sequelize';
import base from './base.js';

class db extends base {
    constructor(tableName, schema = {}) {
        super(tableName);
        const sequelize = new Sequelize(process.env.POSTGRES_URL, {
          dialect: 'postgres',
          dialectOptions: {
            ssl: {
              require: false,
              rejectUnauthorized: false
            }
          },
        });
        this.table = sequelize.define(tableName, schema, {
            tableName: tableName,
            timestamps: false,
        });
        sequelize.sync().then(() => {
            console.debug(`Table ${tableName} synced.`);
        });
    }

    /**
     * Fetch: Where's individual queries are OR'ed.
     * Multiple conditions are joined with OR logic.
     */
    async fetch(where = {}, { desc, limit, offset } = {}) {
        try {
            // Construct OR conditions using Sequelize's $or operator
            const orConditions = Object.keys(where).map((key) => ({
                [key]: where[key],
            }));

            const options = {
                where: { [Op.or]: orConditions },
                limit,
                offset,
            };

            if (desc) options.order = [[desc, 'DESC']];

            const result = await this.table.findAll(options);
            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    /**
     * Select: Where's individual queries are AND'ed.
     * Multiple conditions are joined with AND logic.
     */
    async select(where = {}, { desc, limit, offset } = {}) {
        try {
            // Construct AND conditions using Sequelize's default behavior
            const options = {
                where,
                limit,
                offset,
            };

            if (desc) options.order = [[desc, 'DESC']];

            const result = await this.table.findAll(options);
            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async count(where = {}) {
        try {
            const count = await this.table.count({ where });
            return count;
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    async add(data) {
        try {
            const result = await this.table.create(data);
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async update(data, where) {
        try {
            const result = await this.table.update(data, { where });
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async delete(where) {
        try {
            const result = await this.table.destroy({ where });
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }
}

export default db;
