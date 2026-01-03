import { Agent, tool, run } from "@openai/agents";
import z from "zod";
import "dotenv/config";
import axios from "axios";
import { sendEmail } from "./utils/resend-email.js";

const GetWeatherResultSchema = z.object({
  location: z
    .string()
    .describe("The location for which the weather is provided."),
  temperature: z.string().describe("The current temperature at the location."),
  condition: z
    .string()
    .describe("The current weather condition at the location."),
});

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

const sendEmailTool = new tool({
  name: "send_email",
  description: "Send an email to a specified recipient.",
  parameters: z.object({
    recipient: z.string().describe("The email address of the recipient."),
    subject: z.string().describe("The subject of the email."),
    body: z.string().describe("The body content of the email."),
  }),
  execute: async ({ recipient, subject, body }) => {
    await sendEmail({ to: recipient, subject, html: body });
    return `Email sent to ${recipient} with subject "${subject}".`;
  },
});

const agent = new Agent({
  name: "Weather and Email Agent",
  instructions:
    "You are a helpful assistant that provides weather information and can send emails with the current weather update.",
  tools: [getWeatherTool, sendEmailTool],
  outputType: GetWeatherResultSchema,
});

const main = async (query = "") => {
  return run(agent, query)
    .then((response) => {
      console.log("Full Response:", response.finalOutput);
      console.log("Agent Response:", response.finalOutput.temperature);
    })
    .catch((error) => {
      console.error("Error running agent:", error);
    });
};

main(
  "What's the weather like today in Jaipur? Also, send an email to pankajneeraj541@gmail.com with the subject 'Weather Update'"
);
