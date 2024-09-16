import crypto from 'crypto';

function hash(something) {
    something = crypto.createHash('sha1').update(something).digest('hex');
    something = process.env.PASSWORD_SALT + something;
    something = crypto.createHash('sha1').update(something).digest('hex');
    return something;
}
function hashMD5(something) {
    something = crypto.createHash('md5').update(something).digest('hex');
    return something;
}

export { hash, hashMD5 };
