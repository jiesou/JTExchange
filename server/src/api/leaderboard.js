import { Router } from "express";
import makeResponse from "../units/makeResponse.js";
import fetchBalance from "../units/transaction/fetchBalance.js";
import fetchUsers from "../units/user/fetchUsers.js";
import reqParameterParser from "../units/reqParamsParser.js";

const router = Router();

router.get('/balance', async (request, response) => {
    const allUsers = await fetchUsers();
    const leaderboard = [];
    for (const user of allUsers) {
        if (user.pk === '0') {
            continue; // Skip admin user
        }
        const balance = await fetchBalance(user.pk);
        leaderboard.push({
            nick: user.nick,
            balance: balance
        });
    }
    leaderboard.sort((a, b) => b.balance - a.balance);
    makeResponse(response, 0, 'Success.', leaderboard);
});

export default router;