import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ChatbotPage from './pages/ChatbotPage';
import EventsPage from './pages/EventsPage';
import MaterialsPage from './pages/MaterialsPage';
import QuestionPapersPage from './pages/QuestionPapersPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageEvents from './pages/Admin/ManageEvents';
import ManageMaterials from './pages/Admin/ManageMaterials';
import ManageQuestionPapers from './pages/Admin/ManageQuestionPapers';
import ManageAnnouncements from './pages/Admin/ManageAnnouncements';
import ManageRegistrations from './pages/Admin/ManageRegistrations';
import PlacementsPage from './pages/PlacementsPage';
import ManagePlacements from './pages/Admin/ManagePlacements';
import EventHistory from './pages/Student/EventHistory';
import ContributePage from './pages/ContributePage';
import ManageContributions from './pages/Admin/ManageContributions';
import AdminScanner from './pages/Admin/AdminScanner';
import StudyRooms from './pages/StudyRooms';
import ChatRoom from './pages/ChatRoom';
import ManageUsers from './pages/Admin/ManageUsers';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

const wrap = (Component, adminOnly = false) => (
    <ProtectedRoute adminOnly={adminOnly}>
        <Layout><Component /></Layout>
    </ProtectedRoute>
);

const AppRoutes = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={wrap(Home)} />
        <Route path="/chat" element={wrap(ChatbotPage)} />
        <Route path="/events" element={wrap(EventsPage)} />
        <Route path="/materials" element={wrap(MaterialsPage)} />
        <Route path="/study-rooms" element={wrap(StudyRooms)} />
        <Route path="/study-room/:roomId" element={wrap(ChatRoom)} />
        <Route path="/question-papers" element={wrap(QuestionPapersPage)} />
        <Route path="/announcements" element={wrap(AnnouncementsPage)} />
        <Route path="/placements" element={wrap(PlacementsPage)} />
        <Route path="/history" element={wrap(EventHistory)} />
        <Route path="/contribute" element={wrap(ContributePage)} />
        <Route path="/admin" element={wrap(AdminDashboard, true)} />
        <Route path="/admin/events" element={wrap(ManageEvents, true)} />
        <Route path="/admin/materials" element={wrap(ManageMaterials, true)} />
        <Route path="/admin/contributions" element={wrap(ManageContributions, true)} />
        <Route path="/admin/scanner" element={wrap(AdminScanner, true)} />
        <Route path="/admin/question-papers" element={wrap(ManageQuestionPapers, true)} />
        <Route path="/admin/announcements" element={wrap(ManageAnnouncements, true)} />
        <Route path="/admin/registrations" element={wrap(ManageRegistrations, true)} />
        <Route path="/admin/placements" element={wrap(ManagePlacements, true)} />
        <Route path="/admin/users" element={wrap(ManageUsers, true)} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
