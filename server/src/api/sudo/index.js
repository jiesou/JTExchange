import { Router } from 'express';
import makeResponse from "../../units/makeResponse.js";
import { dbUser, dbTransaction } from '../../index.js';
import reqParameterParser from "../../units/reqParamsParser.js";

const router = Router();

router.post('/new_system_transaction', async (request, response) => {
    if (request.headers.key !== process.env.SYSTEM_KEY) {
        makeResponse(response, 403, 'Permission denied.');
        return;
    }

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

    // 构建新交易
    const transaction = {
        from_pk: 0,
        to_pk: reqBody.to_pk,
        time: transactionTime,
        amount: transactionAmount,
        comment: reqBody.comment,
    };
    dbTransaction.add(transaction);

    makeResponse(response, 0, 'Created.');
});

export default router;
