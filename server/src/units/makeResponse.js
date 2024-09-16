function makeResponse(response, code = 200, message, data) {
    if (code === 0) {
        code = 200;
    }
    let result = {
        code: code,
        message: message
    }
    if (data instanceof Array | data instanceof Object) {
        result.data = data;
    }
    response.status(code).json(result);
}
export default makeResponse;