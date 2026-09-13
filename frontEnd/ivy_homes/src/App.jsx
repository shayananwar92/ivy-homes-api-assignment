import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Search from './components/Search';
import ListingDetail from './components/ListingDetail';
import Footer from './components/footer';
import Login from './components/Login';
import SavedProperties from './components/SavedProperties';
import Rentals from './components/Rentals';
import Projects from './components/Projects';
import Insights from './components/Insights';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route
                path="/listing/:id"
                element={<ListingDetail />}
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/saved"
                element={<SavedProperties />}
              />
              <Route
                path="/rentals"
                element={<Rentals />}
              />
              <Route
                path="/projects"
                element={<Projects />}
              />
              <Route
                path="/insights"
                element={<Insights />}
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;