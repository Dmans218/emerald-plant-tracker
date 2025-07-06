import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Header from './components/Header';
import MobileNavigation from './components/mobile/MobileNavigation';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Plants = React.lazy(() => import('./pages/Plants'));
const PlantDetail = React.lazy(() => import('./pages/PlantDetail'));
const Environment = React.lazy(() => import('./pages/Environment'));
const Logs = React.lazy(() => import('./pages/Logs'));
const Calculator = React.lazy(() => import('./pages/Calculator'));
const ArchivedTents = React.lazy(() => import('./pages/ArchivedTents'));
const AnalyticsDashboard = React.lazy(() => import('./pages/AnalyticsDashboard'));

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <MobileNavigation />
        <Suspense fallback={<div>Loading...</div>}>
          <main className="container mx-auto py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/plants/:id" element={<PlantDetail />} />
              <Route path="/analytics/:plantId" element={<AnalyticsDashboard />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/archived" element={<ArchivedTents />} />
            </Routes>
          </main>
        </Suspense>
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
