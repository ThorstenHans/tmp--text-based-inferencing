// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { Variables } from '@fermyon/spin-sdk';
import { Ollama } from '@langchain/ollama';
import { AutoRouter } from 'itty-router';
import { personalize_product } from './personalization';
import { sentiment_analysis } from './sentiment_analysis';
import { summarize_text } from './summarization';

let router = AutoRouter();
const decoder = new TextDecoder();

// @ts-ignore
globalThis.AbortController = class {
  constructor() {
    //@ts-ignore
    this.signal = { aborted: false, addEventListener: () => { }, removeEventListener: () => { } };
  }
  abort() {
    //@ts-ignore
    this.signal.aborted = true;
  }
}

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});

router
  .get("/", getIndex)
  .post("/summarize", async (req) => summarize_text(await req.arrayBuffer()))
  .post("/sentiment_analysis", async (req) => sentiment_analysis(await req.arrayBuffer()))
  .post("/personalize_product", async (req) => personalize_product(await req.arrayBuffer()));

function getIndex() {
  const index_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instructions</title>
    <style>
        body {
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            font-size: 18px;
            line-height: 1.4;
        }
        pre {
            font-family: 'Courier New', Courier, monospace;
            font-weight: 500;
            font-size: 14px;
            line-height: 1.1;
            background-color: lightgray;
            border: 1px solid darkgray;
            border-radius: 5px;
            padding: 10px;
            text-wrap: wrap;
        }
    </style>
</head>
<body>
    <h2>Text Summarization</h2>
    <pre>export APP_URL=&lt;SET_YOUR_APP_URL&gt;

curl -X POST $APP_URL/summarize \
  -H 'Content-Type: application/json' \
  --data '{"text": "Azure Kubernetes Service (AKS) is a managed Kubernetes service that you can use to deploy and manage containerized applications. You need minimal container orchestration expertise to use AKS. AKS reduces the complexity and operational overhead of managing Kubernetes by offloading much of that responsibility to Azure. AKS is an ideal platform for deploying and managing containerized applications that require high availability, scalability, and portability, and for deploying applications to multiple regions, using open-source tools, and integrating with existing DevOps tools.\n\nThis article is intended for platform administrators or developers who are looking for a scalable, automated, managed Kubernetes solution.\n\nOverview of AKS\n\nAKS reduces the complexity and operational overhead of managing Kubernetes by shifting that responsibility to Azure. When you create an AKS cluster, Azure automatically creates and configures a control plane for you at no cost. The Azure platform manages the AKS control plane, which is responsible for the Kubernetes objects and worker nodes that you deploy to run your applications. Azure takes care of critical operations like health monitoring and maintenance, and you only pay for the AKS nodes that run your applications." }'
    </pre>
    <hr />
    
    <h2>Sentiment Analysis</h2>
    <pre>export APP_URL=&lt;SET_YOUR_APP_URL&gt;

curl -X POST $APP_URL/sentiment_analysis \
-H 'Content-Type: application/json' \
--data '{ "input": "tuna sashimi is great!" }'
    </pre>
    <hr />
    
    <h2>Personalized Product Descriptions</h2>
    <pre>export APP_URL=&lt;SET_YOUR_APP_URL&gt;

curl -X POST $APP_URL/personalize_product \
-H 'Content-Type: application/json' \
--data '{ "general": "Nebula SoundPod – 360° Immersive Audio Speaker\n\nExperience studio-quality sound wherever you go with the Nebula SoundPod. This portable, waterproof Bluetooth speaker delivers deep bass and crisp treble with 360° surround sound technology. Perfect for parties, outdoor adventures, or relaxing at home.", "name": "Thorsten", "gender": "male", "age": 41, "likes": ["running", "mountain biking"] }'
    </pre>
</body>
</html>`;
  return new Response(index_html, { status: 200, headers: { "content-type": "text/html" } });
}
