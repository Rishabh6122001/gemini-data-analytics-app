import React from "react";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  // ✅ Directly render ChatInterface (no API key prompt, no localStorage)
  return <ChatInterface />;
}

export default App;
