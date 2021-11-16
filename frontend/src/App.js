import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from './Components/Home/Home';
import Navbar from "./Components/Navbar/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* <Redirect to="/" /> */}
      </Routes>
    </Router>
  );
}

export default App;
