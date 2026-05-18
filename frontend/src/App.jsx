import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/Splash';
import AskAI from './pages/AskAI';
import HealthHub from './pages/HealthHub';
import ReachOut from './pages/Reachout';
import ExpertChat from './pages/ExpertChat';
import ExpertPortal from './pages/ExpertPortal';
import MainLayout from './components/MainLayout';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/ai-chat" replace />} />
          <Route path="ai-chat" element={<AskAI />} />
          <Route path="health-hub" element={<HealthHub />} />
          <Route path="reach-out" element={<ReachOut />} />
          <Route path="expert-chat" element={<ExpertChat />} />
        </Route>
        <Route path="/expert-portal" element={<ExpertPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;