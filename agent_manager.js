import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import z from "zod";
import fs from "fs";

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

async function main(customerQuery = "") {
  const defaultQuery =
    "Can you provide me with the latest internet broadcasting plans and their pricing?";
  const response = await run(salesAgent, customerQuery || defaultQuery);
  console.log("Agent Response:", response.finalOutput);
}

main(
  "hey there, I have $50 plan ,I need refund right now my customer id is 123 and order id is 456, because I am sifting to a different place."
).catch((error) => {
  console.error("Error running the agent:", error);
});
