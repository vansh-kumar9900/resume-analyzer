import dotenv from 'dotenv';
dotenv.config();
const NVIDIA_API_KEY = (process.env.NVIDIA_API_KEY || "").trim();
const NVIDIA_MODEL   = (process.env.NVIDIA_MODEL   || "meta/llama-3.1-8b-instruct").trim();
const NVIDIA_BASE    = "https://integrate.api.nvidia.com/v1";

async function test() {
  console.log("Key length:", NVIDIA_API_KEY.length);
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: "Hi" }],
      temperature: 0.4,
      max_tokens: 10,
    }),
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
