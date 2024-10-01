// export default class ReqParamsParser {
//     constructor(request) {
//         let { body } = request;
//         if (body) {
//             this.setParams(body);
//         } else if (request.query) {
//             this.setParams(request.query);
//         }
//     }
//     setParams(params) {
//         Object.keys(params).forEach(key => {
//             this[key] = params[key];
//         });
//     }
// }

function reqParamsParser(request) {
  let params = {};

  // 使用 Object.assign 合并 body 和 query
  Object.assign(params, request.query || {});
  Object.assign(params, request.body || {});

  return params;
}


export default reqParamsParser;
