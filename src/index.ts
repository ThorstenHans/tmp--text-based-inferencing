import { AutoRouter } from 'itty-router';
import { inference, InferencingRequest } from './inference';
import { getReadme } from './readme';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

const decoder = new TextDecoder();
let router = AutoRouter();

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});

router
  .get("/", () => getReadme())
  .post("/summarize", async (req) => summarizeText(await req.arrayBuffer()))
  .post("/sentiment_analysis", async (req) => performSentimentAnalysis(await req.arrayBuffer()))
  .post("/personalize_product", async (req) => personalizeContent(await req.arrayBuffer()))
  .post("/extract_facts", async (req) => extractFacts(await req.arrayBuffer()));

async function performSentimentAnalysis(requestBody: ArrayBuffer): Promise<Response> {
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as InferencingRequest;
    const res = await inference(payload, `<context>
You're an assitant for performing sentiment analysis.
Given a random text input, answer with the emotional tone of the input
Valid answers are positive, negative, neutral
Don't share your thought process
Do not repeat the input
Do not use control characters like newline, tabs or others
Answer with a single word only
</context>
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
<user>{userPrompt}</user>`);
    return new Response(JSON.stringify(res), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    return new Response("Error while inferencing", { status: 500 });
  }
}

async function personalizeContent(requestBody: ArrayBuffer): Promise<Response> {
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as InferencingRequest;
    const res = await inference(payload, `<context>
You're an expert in creating personalized product descriptions. 
Given essential information about the potential customer and a general text, generate a personalized variation of the text provided by the user
- Directly address the customer
- You may not use placeholders in your answer
</context>
<personalization>
- Customer Name: {name}
- Customer Gender: {gender}
- Customer Age: {age}
- Customer likes: {likes}
</personalization>

<user>Personalize the following test:
{userPrompt}
</user>`);
    return new Response(JSON.stringify(res), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    return new Response("Error while inferencing", { status: 500 });
  }
}

async function extractFacts(requestBody: ArrayBuffer): Promise<Response> {
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as InferencingRequest;
    const res = await inference(payload, `<context>
You're an expert in extracting hard facts from text provided by users.
You're not allowed to generate new facts
</context>
<user>Extract facts from the following text:
{userPrompt}
</user>`);
    return new Response(JSON.stringify(res), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    return new Response("Error while inferencing", { status: 500 });
  }
}

async function summarizeText(requestBody: ArrayBuffer): Promise<Response> {
  try {
    const payload = JSON.parse(decoder.decode(requestBody)) as InferencingRequest;
    const res = await inference(payload, `<context>
- You're an expert in summarizing text without changing the meaning of the text. 
- Summarize as efficient as possible. 
- Use same vocabulary as provided by the user
- You're also not allowed to share your thoughts
<formatting_rules>
- Summary may not be longer than user provided input
- Answer with Summary only
</formatting_rules>
</context>
<user>
Summarize the following text
{userPrompt}
</user>`);
    return new Response(JSON.stringify(res), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    return new Response("Error while inferencing", { status: 500 });
  }
}

