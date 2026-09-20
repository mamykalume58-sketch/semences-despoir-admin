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

          <Route path="actualites" element={<Placeholder title="Actualités" />} />
          <Route path="galerie" element={<Placeholder title="Galerie" />} />
          <Route path="dons" element={<Placeholder title="Gestion des dons" />} />
          <Route path="benevoles" element={<Placeholder title="Bénévoles" />} />
          <Route path="messages" element={<Placeholder title="Messages" />} />
          <Route path="statistiques" element={<Placeholder title="Statistiques" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="parametres" element={<Placeholder title="Paramètres" />} />
          <Route path="profil" element={<Placeholder title="Mon profil" />} />
        </Route>
        <Route path="*" element={<Placeholder title="Page introuvable" />} />
      </Routes>
    </AuthProvider>
  );
}
