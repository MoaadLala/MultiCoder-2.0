import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import socketClient from 'socket.io-client';
import Game from "./Components/Game/Game";

import Home from './Components/Home/Home';
import Navbar from "./Components/Navbar/Navbar";
import Play from "./Components/Play/Play";

const socket = socketClient('http://127.0.0.1:8080');
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play socket={socket}/>} />
        <Route path="/game" element={<Game />} />
        {/* <Redirect to="/" /> */}
      </Routes>
    </Router>
  );
}

export default App;
