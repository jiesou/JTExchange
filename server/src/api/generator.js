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

  const prompt = `Convert the following sentence into a transaction: "${sentence}"\nTransaction:`;

  const chatCompletion = await openaiWrapper.inst.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: sentence }
    ]
  });

  console.log(chatCompletion.choices[0].message)

  const responseMessage = chatCompletion.choices[0].message.content;



  makeResponse(response, 200, "Success", { response: responseMessage });
});

export default router;
