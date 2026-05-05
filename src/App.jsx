import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://api.smartlogix.localhost";

export default function App() {
  const [gateway, setGateway] = useState("checking...");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((d) => setGateway(JSON.stringify(d)))
      .catch((e) => setGateway(`error: ${e.message}`));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <h1>SmartLogix</h1>
      <p>Plataforma logistica eCommerce - stub frontend.</p>
      <h3>Estado API Gateway</h3>
      <pre style={{ background: "#f3f4f6", padding: "1rem", borderRadius: 8 }}>
        {gateway}
      </pre>
      <p>API base: <code>{API_BASE}</code></p>
    </main>
  );
}
