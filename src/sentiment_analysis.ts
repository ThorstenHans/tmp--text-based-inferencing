import { Variables } from "@fermyon/spin-sdk";
import { Ollama } from "@langchain/ollama";
import { extractAndRemoveThoughts } from "./helpers";
import { PromptTemplate } from "@langchain/core/prompts";

interface SentimentAnalysisRequestModel {
  input: string
}

export async function sentiment_analysis(requestBody: ArrayBuffer) {

  const decoder = new TextDecoder();
  const model = Variables.get("model");
  const baseUrl = Variables.get("base_url");
  if (!baseUrl || !model) {
    return new Response("Variables not specified", { status: 500 });
  }
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as SentimentAnalysisRequestModel;
    const llm = new Ollama({
      model: model!,
      temperature: 0,
      baseUrl: baseUrl!,
    });
    let prompt = PromptTemplate.fromTemplate(`<systemPrompt>
- You're an assitant for performing sentiment analysis.
- given a random text input, answer with the emotional tone of the input
- Valid answers are positive, negative, neutral
- Don't share your thought process
- Do not repeat the input
- Do not use control characters like newline, tabs or others
- Answer with a single word only
</systemPrompt>
<samples>
 <sample>
   <input>I love your new glasses.</input>
   <answer>positive</answer>
  </sample>
  <sample>
    <input>I think EVERYONE hates me ON HERE.</input>
    <answer>negative</answer>
  </sample>
  <sample>
    <input>Hi there. I agree! Small children should be running about happy, not breaking down in tears</input>
    <answer>positive</answer>
  </sample>
</samples>
<input>{input}</input>
`);
    const chain = prompt.pipe(llm);
    console.log("Performing sentiment analysis")
    let llmResponse = await chain.invoke({
      input: payload.input
    });
    llmResponse = extractAndRemoveThoughts(llmResponse);

    llmResponse = llmResponse.replace(/\n/g, "").replace(/\t/g, "");
    return new Response(JSON.stringify({ "emotionalTone": llmResponse }), { status: 200, headers: { "content-type": "application/json" } });

  } catch (error) {
    console.log(`Error while generating product description: ${JSON.stringify(error)}`);
    return new Response(null, { status: 500 });
  }
}
