// Dev: same-origin "/api" via Vite proxy to the backend. Prod: set VITE_API_BASE if API is on another host.
const API_BASE = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

// Reads saved JWT for protected calls
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || "Unexpected error" };
  }
}

export async function signup(payload) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}

export async function login(payload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function analyzeResume({ file, resumeText, jobDescription }) {
  const headers = { ...authHeaders() };

  let body;
  let extraHeaders = {};

  if (file) {
    const fd = new FormData();
    fd.append("resume", file);
    if (jobDescription) fd.append("jobDescription", jobDescription);
    body = fd;
  } else {
    extraHeaders["Content-Type"] = "application/json";
    body = JSON.stringify({ resumeText, jobDescription });
  }

  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: "POST",
    headers: { ...headers, ...extraHeaders },
    body,
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Analyze failed");
  return data;
}

export async function atsScore({ file, resumeText, jobDescription }) {
  const headers = { ...authHeaders() };

  let body;
  let extraHeaders = {};

  if (file) {
    const fd = new FormData();
    fd.append("resume", file);
    fd.append("jobDescription", jobDescription || "");
    body = fd;
  } else {
    extraHeaders["Content-Type"] = "application/json";
    body = JSON.stringify({ resumeText, jobDescription });
  }

  const res = await fetch(`${API_BASE}/resume/ats-score`, {
    method: "POST",
    headers: { ...headers, ...extraHeaders },
    body,
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "ATS request failed");
  return data;
}

export async function chatAI({ message, resumeText, jobDescription }) {
  const res = await fetch(`${API_BASE}/resume/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ message, resumeText, jobDescription }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Chat failed");
  return data;
}
