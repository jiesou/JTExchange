import { Router } from 'express';
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import reqParameterParser from "../units/reqParamsParser.js";
import OpenAI from "openai";

const router = Router();

const openaiWrapper = {
  _inst: null,
  get inst() {
    if (!this._inst) {
      this._inst = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL
      });
    }
    return this._inst;
  }
}

router.post('/transaction', async (request, response) => {
  let user = await authentication(request, response);
  if (!user) {
    return;
  }

  const params = reqParameterParser(request);

  const sentence = params.sentence;
  if (!sentence) {
    makeResponse(response, 400, "Missing sentence parameter");
    return;
  }

  const prompt = `用户ID - 真实姓名
1 - 吴思辰
2 - 戚珂嘉
3 - 李康
4 - 方乐天

请总结用户所输入的文本，格式化为一个包含所需交易信息的 JSON 响应。要求：
1. 用户ID需要依据以上表格查找对应。如果无法找到对应用户ID，则进行说明，不要返回 JSON 字段。
2. 文本可能由于识别错误或其他原因存在不完整或错误的地方，需要根据上下文进行推断。
3. 用户ID、金额和备注的顺序可能不固定，需要根据上下文进行推断。
4. 金额可能为整数或小数，需要保留两位小数。必须为正数，表示转给目标用户的金额。
5. 用户ID与金额是必填项，必不为空。如果完全无法识别用户 ID 或金额，则进行说明，不要返回 JSON 字段。
6. 备注是可选项，可能为空。如果没有备注，则填为空字符串，不要使用 null。
7. 备注需要以全知/上帝视角的方式描述，不要使用“我”、“你”等词语。

JSON 内容的具体要求如下：
- 用户ID：字符串类型。表示目标用户
- 金额：数字类型。表示转给目标用户的金额
- 备注：字符串类型。表示转账备注

示例：请严格按照以下格式返回结果

User: 给7可加嘉转0.5吧，他给我带了瓶水
Assitant: \`\`\`json
{
 "id": "2",
 "amount": 0.5,
 "comment": "带水"
}
\`\`\``;

  const chatCompletion = await openaiWrapper.inst.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: sentence }
    ]
  });

  try {
    const responseMessage = chatCompletion.choices[0].message.content;

    const startJson = responseMessage.indexOf("```json") + 7;
    const endJson = responseMessage.indexOf("```", startJson);

    const responseJson = responseMessage.substring(startJson, endJson);

    const responseObj = JSON.parse(responseJson);

    const transaction = {
      to: responseObj.id,
      amount: responseObj.amount,
      comment: responseObj.comment
    }

    makeResponse(response, 200, "Success", transaction);
  } catch (e) {
    makeResponse(response, 400, "Failed to parse sentence");
  }
});

export default router;
