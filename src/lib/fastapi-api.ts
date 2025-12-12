import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000 * 30
});

export type AskResponse = {
  answer?: string;
  response?: string;
};

export async function askFastApi(message: string, model?: string): Promise<string> {
  const { data } = await client.post<AskResponse>("/ask", { message, model });
  return data.answer ?? data.response ?? "";
}

export async function listModels(): Promise<string[]> {
  try {
    const { data } = await client.get<{ models?: string[] }>("/models");
    if (Array.isArray(data?.models)) {
      return data.models;
    }
  } catch (error) {
    return [];
  }
  return [];
}
