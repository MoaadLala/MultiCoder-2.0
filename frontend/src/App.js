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
import Lobby from "./Components/Lobby/Lobby";

import { createContext, useMemo, useState } from "react";
import { initializeApp } from 'firebase/app';
import Login from "./Components/Login/Login";
const firebaseConfig = {
  apiKey: "AIzaSyCM_vXZ-ZgeHMQ_rqjCRGwMc516purIik8",
  authDomain: "multicoder-900aa.firebaseapp.com",
  projectId: "multicoder-900aa",
  storageBucket: "multicoder-900aa.appspot.com",
  messagingSenderId: "865496587457",
  appId: "1:865496587457:web:41e916c0910a83bc278840",
  measurementId: "G-937Z5NFW9W"
};

const app = initializeApp(firebaseConfig);
export const User = createContext();

const socket = socketClient('http://127.0.0.1:8080');
function App() {
  const [user, setUser] = useState({});
  const value = useMemo(
    () => ({user, setUser}),
    [user]
  );
  return (
    <User.Provider value={value}>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play socket={socket}/>} />
            <Route path="/game" element={<Game socket={socket}/>} />
            <Route path="/login" element={<Login socket={socket} />} />
            <Route path="/lobby" element={<Lobby socket={socket} />} />
            {/* <Redirect to="/" /> */}
          </Routes>
      </Router>
    </User.Provider>
  );
}

export default App;
