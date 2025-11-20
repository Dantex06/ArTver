import axios from "axios";

export async function getItems() {
  const res = await axios.get(`/api/items`);
  return res.data;
}
