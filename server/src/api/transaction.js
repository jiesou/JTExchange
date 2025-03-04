import { Router } from 'express';
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import fetchBalance from "../units/transaction/fetchBalance.js";
import fetchUser from "../units/user/fetchUser.js";
import { dbUser, dbTransaction } from '../index.js';
import reqParameterParser from "../units/reqParamsParser.js";

const router = Router();

router.get('/', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const reqBody = reqParameterParser(request);

    const transactions = await dbTransaction.fetch(
        { from_pk: user.pk, to_pk: user.pk },
        { desc: 'time', limit: reqBody.limit || 10, offset: reqBody.offset || 0 }
    );

    for (const transaction of transactions) {
        const transactionData = transaction.dataValues;
        if (transactionData.from_pk === user.pk) {
            transactionData.type = 'out';
            const toUser = await fetchUser(transactionData.to_pk);
            transactionData.to_nick = toUser ? toUser.dataValues.nick : 'Unknown';
        }
        if (transactionData.to_pk === user.pk) {
            transactionData.type = 'in';
            const fromUser = await fetchUser(transactionData.from_pk);
            transactionData.from_nick = fromUser ? fromUser.dataValues.nick : 'Unknown';
        }
    }
    makeResponse(response, 0, 'Success.', transactions);
});

router.get('/fetch_balance', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const balance = await fetchBalance(user.pk);

    makeResponse(response, 0, 'Success.', { balance });
})

async function addSingleTransaction(transaction, user, transactionTime, response) {
    // 检查目标用户是否存在
    const targetUser = await dbUser.fetch({ pk: transaction.to_pk || "0" }, { limit: 1 });
    if (targetUser.length === 0) {
        makeResponse(response, 400, 'Target user is not exist.');
        return;
    }

    // 系统账户
    if (user.pk === '0') {
        // 构建新交易
        const newTransactionResult = await dbTransaction.add({
            from_pk: user.pk,
            to_pk: transaction.to_pk,
            time: transactionTime,
            amount: Number(transaction.amount),
            comment: transaction.comment || '无备注'
        });

        // 仅供前端显示
        newTransactionResult['to_nick'] = targetUser[0].nick || 'Unknown';
        console.log('Transaction added:', newTransactionResult);
        
        return { newTransactionResult, newBalance: await fetchBalance(user.pk) };
    }

    // 检查交易金额是否合法
    let transactionAmount = 0;
    try {
        transactionAmount = Number(transaction.amount);
        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            throw new Error('Invalid amount.');
        }
    } catch (error) {
        makeResponse(response, 400, 'Invalid amount.');
        return;
    }

    // 检查余额是否足够
    const balance = await fetchBalance(user.pk);
    if (balance < transactionAmount) {
        makeResponse(response, 400, 'Insufficient balance.');
        return;
    }

    // 构建新交易
    const newTransactionResult = await dbTransaction.add({
        from_pk: user.pk,
        to_pk: transaction.to_pk,
        time: transactionTime,
        amount: transactionAmount,
        comment: transaction.comment || '无备注'
    });

    // 再次检查余额，确保没有并发问题
    const newBalance = await fetchBalance(user.pk);
    if (newBalance < 0) {
        // 回滚操作
        await dbTransaction.delete({ key: newTransactionResult.key });
        makeResponse(response, 400, 'Transaction failed due to concurrent modification.');
        return;
    }

    // 仅供前端显示
    newTransactionResult['to_nick'] = targetUser[0].nick || 'Unknown';
    console.log('Transaction added:', newTransactionResult);
    return { newTransactionResult, newBalance };
}

router.post('/new', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    let transactionTime = Date.now();

    const reqBodyTransactions = reqParameterParser(request).transactions;

    const result = [];
    let balance = 0;

    for (const transaction of reqBodyTransactions) {
        const { newTransactionResult, newBalance } = await addSingleTransaction(transaction, user, transactionTime++, response);
        result.push(newTransactionResult);
        balance = newBalance;
    }

    makeResponse(response, 0, 'Created.', {
        transactions: result,
        balance: balance
    });
});

export default router;
