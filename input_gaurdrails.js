import { Agent, run } from "@openai/agents";
import "dotenv/config";
import z from "zod";

const mathInputAgent = new Agent({
  name: "Math query checker",
  model: "gpt-4o-mini",
  instructions:
    "You are an expert at identifying mathematical queries. Determine if the input contains a mathematical question or problem.",
  outputSchema: z.object({
    isValidMathQuery: z
      .boolean()
      .describe("Indicates if the input is a mathematical query"),
  }),
});

const mathInputGuardrail = {
  name: "Math Guardrail",
  instructions:
    "Ensure that all mathematical calculations are accurate and provide step-by-step reasoning for complex problems.",
  execute: async ({ input }) => {
    console.log("Executing Math Guardrail on input:", input);
    const result = await run(mathInputAgent, input);
    return {
      tripwireTrigger: !result.finalOutput.isValidMathQuery,
    };
  },
};

const mathAgent = new Agent({
  name: "Math Agent",
  instructions:
    "You are a math expert. Answer the questions using precise calculations.",
  inputGuardrails: [mathInputGuardrail],
});

async function main(q = "") {
  const response = await run(mathAgent, q);
  console.log("Response:", response.finalOutput);
}

main("What is the square root of 256?");
