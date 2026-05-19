export const API_URL = "http://127.0.0.1:8000";

export async function detectAnomaly(data) {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
  }
   return await res.json();
}

  export async function analyzeCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/analyze-csv`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}

export async function uploadCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload-csv`, {
    method: "POST",
    body: form
  });
  if (!res.ok) {
    let msg = "Upload failed";
    try {
      const err = await res.json();
      msg = err?.detail || msg;
    } catch {
      try {
        msg = await res.text();
      } catch {}
    }
    throw new Error(msg);
  }
  return await res.json();
}

 