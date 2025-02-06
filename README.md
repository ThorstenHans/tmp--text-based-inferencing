# Text-Based Inferencing

The sample application in this repository has been created to illustrate usage of Deepseek from within a Spin application, to perform different text-based inferencing operations.

## How to run that this sample

This sample relies on having access to an server running Ollama with a Deepseek model deployed. As the application is implemented using TypeScript, local installation of Node.js and Spin CLI is required.

### Compile the application

```console
spin build
```

### Run the application

```console
export SPIN_VARIABLE_MODEL="deepseek-r1:latest" 
export SPIN_VARIABLE_BASE_URL="http://173.255.228.190:11434" 

spin up
```

## Exposed Endpoints

- `POST /summarize`:  To summarize a text
- `POST /sentiment_analysis`: To perform a sentiment analysis
- `POST /personalize_product`: To create a personalized variant of a given, general product description
- `POST /extract_facts`: To extract hard facts from a given text

### Request Payloads

All endpoints listed above, share the same request payload structure:

```json
{
  "prompt": "The user prompt that could contain place holders for variables like {foo}",
  "promptVariables": {
    "foo": "bar"
  }
}
```

The `promptVariables` property of the JSON payload above accepts any properties.

### System Prompts

Each endpoints provides the contextual system prompt and incorporates the user provides prompt from the request payload.

