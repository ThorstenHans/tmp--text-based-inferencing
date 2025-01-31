import { Variables } from "@fermyon/spin-sdk";
import { PromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";

interface SummarizationRequestModel {
  text: string
}
export async function summarize_text(requestBody: ArrayBuffer) {
  const decoder = new TextDecoder();
  const model = Variables.get("model");
  const baseUrl = Variables.get("base_url");
  if (!baseUrl || !model) {
    return new Response("Variables not specified", { status: 500 });
  }
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as SummarizationRequestModel;
    const llm = new Ollama({
      model: model!,
      temperature: 0,
      baseUrl: baseUrl!
    });

    let prompt = PromptTemplate.fromTemplate(`<context>
- You're an expert in summarizing text without changing the meaning of the text. 
- Summarize as efficient as possible. 
- Use same vocabulary as provided by the user
- You're also not allowed to share your thoughts
</context>
<formatting_rules>
- Summary may not be longer than user provided input
- Answer with Summary only
</formatting_rules>

User: Summarize the following text: {text}
`);
    const chain = prompt.pipe(llm);
    console.log("Ask LLM to summarize text");
    let llm_response = await chain.invoke({
      text: payload.text
    });
    console.log("LLM got back with something");
    llm_response = llm_response.replace(/<think>[\s\S]*?<\/think>\n?/g, "");
    return new Response(JSON.stringify({ "summary": llm_response }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    console.log(`Error while summarizing text: ${JSON.stringify(error)}`);
    return new Response(null, { status: 500 });
  }
}

