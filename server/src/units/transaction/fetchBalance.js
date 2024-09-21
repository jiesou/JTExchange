import { dbTransaction } from '../../index.js';

async function fetchBalance(pk) {
    let balance = 0;

    const expenditureTransaction = await dbTransaction.fetch({ from_pk: pk });
    expenditureTransaction.forEach((item) => {
        balance -= item.amount;
    });
    const incomeTransaction = await dbTransaction.fetch({ to_pk: pk });
    incomeTransaction.forEach((item) => {
        balance += item.amount;
    });

    return balance;
}

export default fetchBalance;
