import { Conversation, Message, Truffle } from '../src';

// Create a conversation.
const conversation = new Conversation(
  {
    system: "You are Truffle, a multi-modal large langauge model trained by Deepshard.",
    roles: [
        "user",
        "truffle"
    ]
  }, "8c3be82b-75e8-4e99-975a-1ae451b48ec0"); // This is your API key btw :)

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