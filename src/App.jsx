import './App.css';
import Debate from './Debate';
import FirebaseStream from './FirebaseStream';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/debate" element={<Debate/>} />
          <Route path="/stream" element={<FirebaseStream/>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
