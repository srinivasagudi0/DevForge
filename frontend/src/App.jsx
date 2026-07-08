import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ProjectBlueprint from './project_blueprint'


function App() {

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Project Blueprint</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ProjectBlueprint />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;