import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Favorites from './pages/Favorites'
import BookDetails from './pages/BookDetails'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/books/:bookId" element={<BookDetails />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
