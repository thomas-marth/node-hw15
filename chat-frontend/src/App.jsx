import "./App.css";
import Chat from "./modules/Chat/Chat.jsx";

function App() {
  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Socket.io Chat</h1>
        <Chat />
      </div>
    </div>
  );
}

export default App;
