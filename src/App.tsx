import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProjectPricingPage } from './components/ProjectPricingPage';
import PresentationPage from './components/presentation/PresentationPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">Yazılım Projesi Fiyatlama ve Finansal Planlama Modülü</h1>
                </div>
              </header>
              <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                  <ProjectPricingPage />
                </div>
              </main>
            </div>
          } 
        />
        <Route path="/presentation" element={<PresentationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
