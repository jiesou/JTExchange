/* eslint-disable no-unused-vars */
import { PrismaClient } from '@prisma/client';
import base from './base.js';

class db extends base {
    constructor(tableName) {
        super(tableName);
        this.prisma = new PrismaClient();
        this.table = this.prisma[tableName]; // 动态访问 Prisma 模型

        this.prisma.$connect().then(() => {
            console.debug('Connection has been established successfully.');
        }).catch((err) => {
            console.error('Unable to connect to the database:', err);
        });
    }

    /**
     * Fetch: Where's individual queries are OR'ed.
     * Multiple conditions are joined with OR logic.
     */
    async fetch(where = {}, { desc, limit, offset } = {}) {
        try {
            const orConditions = Object.keys(where).map((key) => ({
                [key]: where[key],
            }));
            console.log(orConditions);

            const options = {
                where: { OR: orConditions },
                take: limit,
                skip: offset,
            };

            if (desc) options.orderBy = { [desc]: 'desc' };

            const result = await this.table.findMany(options);
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
            const options = {
                where,
                take: limit,
                skip: offset,
            };

            if (desc) options.orderBy = { [desc]: 'desc' };

            const result = await this.table.findMany(options);
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
            const result = await this.table.create({ data });
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async update(data, where) {
        try {
            const result = await this.table.updateMany({
                where,
                data,
            });
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async delete(where) {
        try {
            const result = await this.table.deleteMany({ where });
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }
}

export default db;
