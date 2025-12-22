import { Agent, tool, run } from "@openai/agents";
import z from "zod";
import "dotenv/config";
import axios from "axios";

const getWeatherTool = new tool({
  name: "get_weather",
  description: "Get the current weather for a given location.",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for."),
  }),
  execute: async ({ location }) => {
    const url = `https://wttr.in/${location.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The current weather in ${location} is ${response.data}.`;
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are a helpful assistant that provides weather information.",
  tools: [getWeatherTool],
});

const main = async (query = "") => {
  return run(agent, query)
    .then((response) => {
      console.log("Agent Response:", response.finalOutput);
    })
    .catch((error) => {
      console.error("Error running agent:", error);
    });
};

main("What's the weather like today in Jaipur?");
