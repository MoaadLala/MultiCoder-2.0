import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import socketClient from 'socket.io-client';

import Home from './Components/Home/Home';
import Navbar from "./Components/Navbar/Navbar";
import Play from "./Components/Play/Play";

const socket = socketClient('http://127.0.0.1:8080');
function App() {
  useEffect(() => {
    socket.on('connection', () => {
      console.log('Socket Here, Ready to go!');
    });
  }, []);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play socket={socket}/>} />
        {/* <Redirect to="/" /> */}
      </Routes>
    </Router>
  );
}

export default App;
