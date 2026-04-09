import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TypingTest } from './pages/TypingTest'
import { Mapper } from './pages/Mapper'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TypingTest />} />
          <Route path="mapper" element={<Mapper />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
