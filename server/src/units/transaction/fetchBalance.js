import { dbTransaction } from '../../index.js';

async function fetchBalance(pk) {
    let balance = 0;
    const precision = 1000000; // 10^6, 用于处理小数点后 6 位

    if (pk === '0') {
        return 999.0; // 管理账户余额 999
    }

    const expenditureTransaction = await dbTransaction.fetch({ from_pk: pk });
    expenditureTransaction.forEach((item) => {
        balance -= Math.round(item.amount * precision);
    });
    const incomeTransaction = await dbTransaction.fetch({ to_pk: pk });
    incomeTransaction.forEach((item) => {
        balance += Math.round(item.amount * precision);
    });

    return balance / precision;
}

export default fetchBalance;
