import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { BookingPage } from './pages/BookingPage.jsx';
import { SuccessPage } from './pages/SuccessPage.jsx';
import { BookingsListPage } from './pages/BookingsListPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/bookings" element={<BookingsListPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="footer">
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} Codeyoung Trial Class System · Built with React, Express, Prisma &amp; Luxon</p>
          <p className="footer-links">
            <span>Deterministic Mentor Assignment</span> · <span>UTC Internal Storage</span> · <span>DST Aware</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
