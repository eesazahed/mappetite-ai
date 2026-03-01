import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "fs/promises";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateFoodPlan() {
  const city = "NYC";
  const hotel = "Plaza Hotel";
  const transportation = "walking";
  const budgetPerDay = 50;
  const cuisines = "Chinese";

  // Read the prompt template from file
  const promptPath = path.join(process.cwd(), "prompts/mealPlanPrompt.txt");
  let promptTemplate = await readFile(promptPath, "utf-8");

  // Replace placeholders with actual values
  const prompt = promptTemplate
    .replace("{{city}}", city)
    .replace("{{hotel}}", hotel)
    .replace("{{transportation}}", transportation)
    .replace("{{budgetPerDay}}", budgetPerDay.toString())
    .replace("{{cuisines}}", cuisines);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawContent =
    (response?.candidates?.[0].content as any)?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(rawContent);
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const data = await generateFoodPlan();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await generateFoodPlan();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
