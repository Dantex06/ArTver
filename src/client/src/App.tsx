import { useEffect, useState } from "react";

import "./App.css";
import { createItem, getItems } from "./api";

function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getItems();
    setItems(data);
  }

  async function add() {
    if (!title) return;
    await createItem({ title, description: "" });
    setTitle("");
    load();
  }

  return (
    <>
      <h1>Starter App</h1>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            {it.id}: {it.title} — {it.description}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
