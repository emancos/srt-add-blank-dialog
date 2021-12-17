import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

import { AppForm } from './components/AppForm'
import { AppNavbar } from './components/AppNavbar'
import { SubtitleShow } from './components/SubtitleShow'

const { tittle } = require('../package.json')

function App() {
  return (
    <div className='App'>
      <AppNavbar tittle={tittle} />
      <Container>
        <Router>
          <Routes>
            <Route path='/' element={<AppForm />} />
            <Route path='/subtitle-show' element={<SubtitleShow />} />
          </Routes>
        </Router>
      </Container>
    </div>
  )
}

export default App
