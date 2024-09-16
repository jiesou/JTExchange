import { Router } from 'express';
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import fetchBalance from "../units/transaction/fetchBalance.js";
import { dbUser, dbTransaction } from '../index.js';
import reqParameterParser from "../units/reqParamsParser.js";

const router = Router();

router.get('/', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    // 在数据库中查找账单
    const transaction = await dbTransaction.fetch({ from_pk: user.pk, to_pk: user.pk });
    makeResponse(response, 0, 'Success.', transaction);
})

router.get('/fetch_balance', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const balance = await fetchBalance(user.pk);

    makeResponse(response, 0, 'Success.', { balance });
})

router.post('/new', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const transactionTime = Date.now();

    const reqBody = reqParameterParser(request);

    // 检查目标用户是否存在
    const targetUser = await dbUser.fetch({ pk: reqBody.to_pk || 0 }, { limit: 1 });
    if (targetUser.length === 0) {
        makeResponse(response, 400, 'Target user is not exist.');
        return;
    }

    // 检查交易金额是否合法
    let transactionAmount = 0;
    try {
        transactionAmount = Number(reqBody.amount);
        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            throw new Error('Invalid amount.');
        }
    } catch (error) {
        makeResponse(response, 400, 'Invalid amount.');
        return;
    }

    // 检查余额是否足够
    const balance = await fetchBalance(user.pk);
    if (balance < reqBody.amount) {
        makeResponse(response, 400, 'Insufficient balance.');
        return;
    }

    // 构建新交易
    const transaction = {
        from_pk: user.pk,
        to_pk: reqBody.to_pk,
        time: transactionTime,
        amount: transactionAmount,
        comment: reqBody.comment,
    };
    const newTransactionResult = dbTransaction.add(transaction);

    // 再次检查余额，确保没有并发问题
    const newBalance = await fetchBalance(user.pk);
    if (newBalance < 0) {
        // 回滚操作
        await dbTransaction.delete({ key: newTransactionResult.key });
        makeResponse(response, 400, 'Transaction failed due to concurrent modification.');
        return;
    }

    makeResponse(response, 0, 'Created.');
});

export default router;
