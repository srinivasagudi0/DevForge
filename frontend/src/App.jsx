import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
//import MissionTracker from './mission_tracker'
import About from './About'


function App() {

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<About />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;