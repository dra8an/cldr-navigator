import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import NumbersPage from './pages/NumbersPage'
import DatesPage from './pages/DatesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="numbers" element={<NumbersPage />} />
          <Route path="dates" element={<DatesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
