import { Variables } from "@fermyon/spin-sdk";
import { PromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";

interface InferencingResult {
  response: string
  reasoning: string | undefined
}

export interface InferencingRequest {
  prompt: string
  promptVariables: any
}

export async function inference(inference: InferencingRequest, systemPrompt: string): Promise<InferencingResult> {
  const model = Variables.get("model");
  const baseUrl = Variables.get("base_url");
  if (!baseUrl || !model) {
    return Promise.reject("Both Model and BaseURL must be set");
  }
  const llm = new Ollama({
    model: model!,
    temperature: 0.4,
    baseUrl: baseUrl!
  });

  let prompt = PromptTemplate.fromTemplate(systemPrompt);
  const chain = prompt.pipe(llm);
  let llmResponse = await chain.invoke({ ...inference.promptVariables, ...{ userPrompt: inference.prompt } });
  return buildInferencingResult(llmResponse);
}

function buildInferencingResult(plainLlmResponse: string): InferencingResult {
  if (plainLlmResponse.indexOf("<think>") > -1) {
    const match = plainLlmResponse.match(/<think>([\s\S]*?)<\/think>/);
    if (match) {
      console.log(`LLM thoughts: ${match[1].trim()}`);
      return { response: plainLlmResponse.replace(/<think>[\s\S]*?<\/think>\n?/g, ""), reasoning: match[1].trim() } as InferencingResult;
    }
  }
  return { response: plainLlmResponse, reasoning: undefined } as InferencingResult;
}
