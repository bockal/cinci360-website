import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Building = {
  id: string;
  name: string;
  slug: string;
  status: string;
  matterportSid: string;
};

function App() {
  const [building, setBuilding] = React.useState<Building | null>(null);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("Building intelligence is loading…");

  React.useEffect(() => {
    fetch("/api/buildings/BLDG-001")
      .then(r => r.json())
      .then(data => {
        setBuilding(data);
        setAnswer("CRC is Building 001. Ask about its assets, layout, clearances, condition, or space-planning opportunities.");
      })
      .catch(() => setAnswer("Building 001 could not be loaded."));
  }, []);

  async function ask() {
    const text = question.trim();
    if (!text) return;
    setAnswer("Checking building evidence…");
    const response = await fetch("/api/buildings/BLDG-001/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: text }),
    });
    const data = await response.json();
    setAnswer(data.answer || data.error || "No answer returned.");
  }

  return (
    <main className="app-shell">
      <header>
        <span className="brand">Cinci360 Intelligence</span>
        <span className="building-id">{building?.id || "BLDG-001"}</span>
      </header>

      <section className="hero">
        <p className="eyebrow">Your building</p>
        <h1>{building?.name || "Cincinnati Rowing Club"}</h1>
        <p>{answer}</p>
      </section>

      <section className="ask-card">
        <button className="voice" aria-label="Ask by voice">🎤</button>
        <textarea
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder="Ask your building…"
          rows={3}
        />
        <button onClick={ask}>Ask</button>
      </section>

      <section className="quick">
        {[
          "What should I be paying attention to?",
          "Where could I fit more storage?",
          "What is the clearance here?",
          "What assets are in this building?"
        ].map(item => (
          <button key={item} onClick={() => setQuestion(item)}>{item}</button>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
