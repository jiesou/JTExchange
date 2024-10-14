import { Router } from 'express';
import OpenAI from "openai";
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import reqParameterParser from "../units/reqParamsParser.js";
import fetchUsers from "../units/user/fetchUsers.js";

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

  const usersTemplate = [];
  const users = await fetchUsers()
  users.forEach(user => {
    usersTemplate.push(`|${user.pk}|${user.nick}|`);
  });

  const prompt = `|用户ID|真实姓名|
|---|---|
${usersTemplate.join("\n")}

你是一个世界级超级智能语言处理模型。你需要总结用户所输入的文本，尝试格式化为一个包含所需一条或多条交易信息的 JSON 响应。要求：
1. 用户ID需要依据以上表格查找对应。如果对应用户不存在，则参照“高优先级条款”返回“找不到目标用户”。
2. 文本可能由于识别错误或其他原因存在不完整或错误的地方，需要根据上下文进行推断。
3. 用户ID、金额和备注的顺序可能不固定，需要根据语义进行推断。
4. 用户ID与金额是必填项，必不为空。如果完全无法识别用户 ID 或金额，则参照“高优先级条款”返回“无法识别用户的输入”。
5. 备注需要尽量依据用户情景推断出一个备注来，最好不为空。但如果没有备注，则填为空字符串，不要使用 null。
6. 备注需要以全知/上帝视角的方式描述，不要使用“我”、“你”等词语。末尾不要附加句号或任何标点符号。

高优先级条款：
对于以下情形
- 用户输入的文本含义根本不可理解/无法识别。或与转账无关。
- 用户根本没有提及目标用户或金额。
- 用户以“这个”、“那个”等代词代替目标用户。
- 用户所提及的目标用户在以上表格中找不到。
则不要返回任何形似 JSON 的内容或关键词！
这种情况你需要直接返回“找不到目标用户”或“无法识别用户的输入”等明确的文本。交易信息没有默认值，不要自行补全默认值！

JSON 内容的具体格式如下，除非完全无法识别用户输入的文本含义（满足以上），否则必须返回 JSON 字段：
- 用户ID：字符串类型。表示目标用户所对应的用户ID，必须可在上表中找到对应
- 金额：数字类型。表示转给目标用户的金额，保留两位小数。必须为正数，不可为0
- 备注：字符串类型。表示转账备注
每个交易用一个 JSON Object（{}）表示，多个交易用 Array（[]）包裹。如果只要求了一个交易，也需要用数组包裹。

示例
>>>
User: 我要给杰出兽转0.6。
Assitant: 找不到目标用户

User: 喂喂喂blah blah blah……
Assitant: 无法识别用户的输入

User: 给7可加嘉转0.5吧，他给我带了瓶水。
Assitant: “7可加嘉”是识别错误，可能指“戚珂嘉”，所以交易信息如下
\`\`\`json
[
  {
    "id": "qi",
    "amount": 0.5,
    "comment": "带水"
  }
]
\`\`\`

User: 给7可加嘉转0.5，他给我带了瓶水。然后再给吴思晨转0.3。
Assitant: “7可加嘉”是识别错误，可能指“戚珂嘉”。“吴思晨”是识别错误，可能指“吴思辰 ”，所以交易信息如下
\`\`\`json
[
  {
    "id": "qi",
    "amount": 0.5,
    "comment": "带水"
  },
  {
    "id": "wu",
    "amount": 0.3,
    "comment": ""
  }
]
\`\`\`
<<<`;
  const chatCompletion = await openaiWrapper.inst.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    temperature: 0.7,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: sentence }
    ]
  });

  try {
    const responseMessage = chatCompletion.choices[0].message.content;
    console.log(responseMessage);
    const startJson = responseMessage.indexOf("```json") + 7;
    const endJson = responseMessage.indexOf("```", startJson);

    const responseJson = responseMessage.substring(startJson, endJson);

    const responseObj = JSON.parse(responseJson);

    responseObj.forEach(transaction => {
      transaction.to_pk = transaction.id;
    });

    makeResponse(response, 200, "Success", responseObj);
  } catch (e) {
    makeResponse(response, 400, "Failed to parse sentence");
  }
});

export default router;
