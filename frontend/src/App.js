import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from './Components/Home/Home';
import Navbar from "./Components/Navbar/Navbar";
import Play from "./Components/Play/Play";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        {/* <Redirect to="/" /> */}
      </Routes>
    </Router>
  );
}

export default App;
