/* eslint-disable no-unused-vars */
import { Deta } from 'deta';
import base from './base.js';

const deta = Deta();

class db extends base {
    constructor(tableName) {
        super(tableName);
        this.db = deta.Base(tableName);
    }

    /* fetch: where's indvidual queries are OR'ed. */
    async fetch(where = {}, { desc, limit, offset } = {}) {
        try {
            const options = {};
            if (limit) options.limit = limit;
            if (offset) {
                // find the last key of the previous page
                const lastKey = await this.db.fetch(where, { limit: offset });
                if (lastKey.items.length > 0) {
                    options.last = lastKey.items[lastKey.items.length - 1].key;
                }
            }
            if (desc) options.sort = { key: desc };
            const result = await this.db.fetch(where, options);
            return result.items;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    /* fetch: where's indvidual queries are AND'ed. */
    async select(where = {}, { desc, limit, offset } = {}) {
        // WIP
    }

    async count(where = {}) {
        try {
            const result = await this.db.fetch(where);
            return result.count;
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    async add(
        data,
        {
            access: { read = true, write = true } = { read: true, write: true },
        } = {},
    ) {
        try {
            const result = await this.db.put(data);
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async update(data, where) {
        try {
            // Assume 'where' contains the key for simplicity
            const key = where.key;
            const result = await this.db.update(data, key);
            return result;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    async delete(where) {
        try {
            // Assume 'where' contains the key for simplicity
            const key = where.key;
            return await this.db.delete(key);
        } catch (err) {
            console.error(err);
            return;
        }
    }
};

export default db;