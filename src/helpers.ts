
function extractAndRemoveThoughts(llmResponse: string): string {
  const match = llmResponse.match(/<think>([\s\S]*?)<\/think>/);

  if (match) {
    console.log(`LLM thoughts: ${match[1].trim()}`);
  }

  return llmResponse.replace(/<think>[\s\S]*?<\/think>\n?/g, "");
}

export {
  extractAndRemoveThoughts
}
