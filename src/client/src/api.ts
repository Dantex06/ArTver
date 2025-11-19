import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function getItems() {
  const res = await axios.get(`${BASE}/api/items`);
  return res.data;
}
