import { Variables } from "@fermyon/spin-sdk";
import { Ollama } from "@langchain/ollama";
import { extractAndRemoveThoughts } from "./helpers";
import { PromptTemplate } from "@langchain/core/prompts";

export interface PersonalizeRequestModel {
  name: string,
  gender: string,
  age: number,
  likes: string[]
  general: string
}

export async function personalize_product(requestBody: ArrayBuffer) {
  const decoder = new TextDecoder();
  const model = Variables.get("model");
  const baseUrl = Variables.get("base_url");
  if (!baseUrl || !model) {
    return new Response("Variables not specified", { status: 500 });
  }
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as PersonalizeRequestModel;
    const llm = new Ollama({
      model: model!,
      temperature: 0.4,
      baseUrl: baseUrl!
    });

    let prompt = PromptTemplate.fromTemplate(`<context>
- You're an expert in creating personalized product descriptions. 
- Given essential information about the customer and a general product description, generate a personalized product description
- Directly address the customer
- You may not use placeholders in your answer
</context>
<personalization>
- Customer Name: {name}
- Customer Gender: {gender}
- Customer Age: {age}
- Customer likes: {likes}
</personalization>

<general_product_description>{general}</general_product_descrition>
`);
    const chain = prompt.pipe(llm);
    console.log("Generating personalized content")
    let llmResponse = await chain.invoke({
      name: payload.name,
      gender: payload.gender,
      age: payload.age,
      likes: payload.likes.join(", "),
      general: payload.general
    });
    llmResponse = extractAndRemoveThoughts(llmResponse);
    return new Response(JSON.stringify({ "personalized": llmResponse }), { status: 200, headers: { "content-type": "application/json" } });

  } catch (error) {
    console.log(`Error while generating product description: ${JSON.stringify(error)}`);
    return new Response(null, { status: 500 });
  }
}

