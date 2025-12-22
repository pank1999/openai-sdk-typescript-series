import { Agent, run } from "@openai/agents";
import "dotenv/config";

const agent = new Agent({
  name: "Hello World Agent",
  model: "gpt-4o",
  instructions: "You are a helpful assistant that greets the world.",
});

run(agent, "Hey there!, My name is Pankaj Pandey.")
  .then((response) => {
    console.log("Agent Response:", response.finalOutput);
  })
  .catch((error) => {
    console.error("Error running agent:", error);
  });
