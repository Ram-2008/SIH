import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ExtractionPage } from './pages/ExtractionPage';
import { ValidationPage } from './pages/ValidationPage';
import { HumanReviewPage } from './pages/HumanReviewPage';
import { GISMapPage } from './pages/GISMapPage';
import { RecordDetailsPage } from './pages/RecordDetailsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />

        <Route
          path="/upload"
          element={
            <AppLayout>
              <UploadPage />
            </AppLayout>
          }
        />

        <Route
          path="/extraction/:id"
          element={
            <AppLayout>
              <ExtractionPage />
            </AppLayout>
          }
        />

        <Route
          path="/validation/:id"
          element={
            <AppLayout>
              <ValidationPage />
            </AppLayout>
          }
        />

        <Route
          path="/review"
          element={
            <AppLayout>
              <HumanReviewPage />
            </AppLayout>
          }
        />

        <Route
          path="/records"
          element={
            <AppLayout>
              <RecordDetailsPage />
            </AppLayout>
          }
        />

        <Route
          path="/records/:id"
          element={
            <AppLayout>
              <RecordDetailsPage />
            </AppLayout>
          }
        />

        <Route
          path="/map"
          element={
            <AppLayout>
              <GISMapPage />
            </AppLayout>
          }
        />

        <Route
          path="/audit"
          element={
            <AppLayout>
              <AuditLogsPage />
            </AppLayout>
          }
        />

        <Route
          path="/architecture"
          element={
            <AppLayout>
              <ArchitecturePage />
            </AppLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
