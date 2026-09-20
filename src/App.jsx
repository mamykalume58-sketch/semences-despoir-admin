import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Placeholder from './pages/Placeholder.jsx';
import ProjectsList from './pages/projects/ProjectsList.jsx';
import ProjectForm from './pages/projects/ProjectForm.jsx';
import ProjectDetail from './pages/projects/ProjectDetail.jsx';
import ActionsList from './pages/actions/ActionsList.jsx';
import ActionForm from './pages/actions/ActionForm.jsx';
import NewsList from './pages/news/NewsList.jsx';
import NewsForm from './pages/news/NewsForm.jsx';
import GalleryList from './pages/gallery/GalleryList.jsx';
import DonationsList from './pages/donations/DonationsList.jsx';
import VolunteersList from './pages/volunteers/VolunteersList.jsx';
import MessagesList from './pages/messages/MessagesList.jsx';
import StatisticsPage from './pages/settings/StatisticsPage.jsx';
import SettingsPage from './pages/settings/SettingsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="projets" element={<ProjectsList />} />
          <Route path="projets/nouveau" element={<ProjectForm />} />
          <Route path="projets/:id" element={<ProjectDetail />} />
          <Route path="projets/:id/modifier" element={<ProjectForm />} />

          <Route path="actions" element={<ActionsList />} />
          <Route path="actions/nouveau" element={<ActionForm />} />
          <Route path="actions/:id/modifier" element={<ActionForm />} />

          <Route path="actualites" element={<NewsList />} />
          <Route path="actualites/nouveau" element={<NewsForm />} />
          <Route path="actualites/:id/modifier" element={<NewsForm />} />
          <Route path="galerie" element={<GalleryList />} />
          <Route path="dons" element={<DonationsList />} />
          <Route path="benevoles" element={<VolunteersList />} />
          <Route path="messages" element={<MessagesList />} />
          <Route path="statistiques" element={<StatisticsPage />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="parametres" element={<SettingsPage />} />
          <Route path="profil" element={<Placeholder title="Mon profil" />} />
        </Route>
        <Route path="*" element={<Placeholder title="Page introuvable" />} />
      </Routes>
    </AuthProvider>
  );
}
