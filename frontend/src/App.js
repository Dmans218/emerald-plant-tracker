import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import PlantDetail from './pages/PlantDetail';
import Calculator from './pages/Calculator';
import Environment from './pages/Environment';
import Logs from './pages/Logs';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/environment" element={<Environment />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App; 