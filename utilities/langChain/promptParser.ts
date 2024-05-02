'use server';

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export async function parsePrompt() {
  if (process.env.OPENAI_API_KEY === undefined) {
    throw new Error(`Env Variable ${process.env.OPENAI_API_KEY} undefined.`);
  }

  const prompt = ChatPromptTemplate.fromMessages([
    ['human', 'Tell me a short joke about {topic}']
  ]);
  const model = new ChatOpenAI({});
  const outputParser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const response = await chain.invoke({
    topic: 'ice cream'
  });
  console.log(response);
  return response;
  /**
  Why did the ice cream go to the gym?
  Because it wanted to get a little "cone"ditioning!
   */
}
