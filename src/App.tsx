import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import NumbersPage from './pages/NumbersPage'
import DatesPage from './pages/DatesPage'
import CurrencyPage from './pages/CurrencyPage'
import LocaleNamesPage from './pages/LocaleNamesPage'
import PluralRulesPage from './pages/PluralRulesPage'
import SegmentationPage from './pages/SegmentationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="numbers" element={<NumbersPage />} />
          <Route path="dates" element={<DatesPage />} />
          <Route path="currency" element={<CurrencyPage />} />
          <Route path="locale-names" element={<LocaleNamesPage />} />
          <Route path="plural-rules" element={<PluralRulesPage />} />
          <Route path="segmentation" element={<SegmentationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
