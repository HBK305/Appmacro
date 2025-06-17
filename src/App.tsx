import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { BoardingProvider, useBoardingContext } from './contexts/BoardingContext';
import { BoardingFlow } from './components/boarding/BoardingFlow';
import { CommandSensor } from './components/CommandSensor';

function AppRouter() {
  const { boardingData } = useBoardingContext();

  // If boarding is not completed, redirect to boarding
  if (!boardingData.completed) {
    return (
      <Routes>
        <Route path="/boarding" element={<BoardingFlow />} />
        <Route path="*" element={<Navigate to="/boarding" replace />} />
      </Routes>
    );
  }

  // If boarding is completed, show the main app
  return (
    <Routes>
      <Route path="/" element={<CommandSensor />} />
      <Route path="/boarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <BoardingProvider>
        <div className="min-h-screen">
          <AppRouter />
        </div>
      </BoardingProvider>
    </Router>
  );
}

export default App; 