# truffle-ts

The truffle typescript package as a wrapper on top of the REST API

## Getting an API key

To get an API key and try truffle out, please email b@deepshard.org. We're currently only onboarding users with a burning need for an 'unsafe' tunable model, so if you're just trying to try out the package, chances are we wont have spare capacity. Either way - email us to request access

## Installation

`npm i truffle-ts`

## How to use

Here's a simple snippet illustrating how to use the truffle-ts package using our remotely hosted multi-modal model

```
import { Conversation, Message, Truffle } from '../src';

// Create a conversation.
const conversation = new Conversation(
  {
    system: "You are Truffle, a multi-modal large langauge model trained by Deepshard.",
    roles: [
        "user",
        "truffle"
    ]
  }, "8c3be82b-75e8-4e99-975a-1ae451b48ec0");

// Append a message with an image to the conversation.
const user_msg_1 = {
  "role": "user",
  "content": "Tell me what you see in the image provided <image>",
  "image": "/home/srikanth/truffle/truffle/serve/examples/extreme_ironing.jpg"
}
conversation.appendMessage(user_msg_1);

conversation.continue()
.then((response) => {
  console.log(response)
})
```

Replace `<your-api-key>` with your API key and `<model-id>` with the actual model id you want to use.

Note that inference is implemented as a stream, which means that you will continually receive inference outputs on a token by token basis until the model is finished. To wait for the final output, simply use the last json response as the output.

## Contributing

Anyone can contribute to the truffle-ts library. This is a massive WIP, and we want to be the best dev interface for you to use when dealing with language models. Please consider opening a PR or asking for more infromation by opening up an issue.
