import z from "zod";
import { Agent, tool, run } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import "dotenv/config";
import fs from "fs";

const processRefund = new tool({
  name: "processRefund",
  description: "Process a refund request for a customer.",
  parameters: z.object({
    customerId: z.string().describe("The unique identifier for the customer."),
    orderId: z
      .string()
      .describe("The unique identifier for the customer's order."),
    reason: z.string().describe("The reason for the refund request."),
  }),
  execute: async ({ orderId, reason }) => {
    fs.appendFileSync(
      "refunds.txt",
      `Refund for order ${orderId} has been processed due to the following reason: ${reason}`
    );
    return { status: "Refund processed successfully.", orderId };
  },
});

const fetchInternetPlans = new tool({
  name: "fetchInternetPlans",
  description: "Fetch the latest plans and pricing for internet broadcasting.",
  parameters: z.object({}),
  execute: async () => {
    // Simulate fetching data from a website
    return [
      {
        plan: "Basic",
        price: "$20/month",
        features: ["Standard Definition", "50 channels"],
      },
      {
        plan: "Premium",
        price: "$50/month",
        features: ["High Definition", "200 channels", "On-Demand"],
      },
      {
        plan: "Ultimate",
        price: "$80/month",
        features: ["4K Ultra HD", "All channels", "Premium Support"],
      },
    ];
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are an expert in handling refund requests for an internet broadcasting company. Assist customers with their refund queries.",
  tools: [processRefund],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  description:
    "Your are an expert in sales and customer support for an internet broadcasting company. Talk to customers and help them what ever query they have.",
  tools: [
    fetchInternetPlans,
    refundAgent.asTool({
      toolName: "refundExpertAgentTool",
      toolDescription:
        "Use this tool to process refund requests for customers.",
    }),
  ],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX} You are the first point of contact for customers. Greet them and understand their needs then handoff them to the appropriate agent.`,
  handoffDescription:
    "You have two agents to handoff to : Sales Agent (expert in handling queries like plans and pricing) and Refund Agent (expert in handling user queries for existing customer issue refund and help them).",
  handoffs: [salesAgent, refundAgent],
});

async function main(query = "") {
  const response = await run(receptionAgent, query);
  console.log("Final Response:", response.finalOutput);
  console.log("History:", response.history);
}

main("hi i want to know about your internet plans and pricing");
