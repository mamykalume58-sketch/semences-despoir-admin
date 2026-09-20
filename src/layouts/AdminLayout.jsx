import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TITLES = {
  '/': 'Tableau de bord',
  '/projets': 'Gestion des projets',
  '/actions': 'Actions humanitaires',
  '/actualites': 'Actualités',
  '/galerie': 'Galerie',
  '/dons': 'Gestion des dons',
  '/benevoles': 'Bénévoles',
  '/messages': 'Messages',
  '/statistiques': 'Statistiques',
  '/notifications': 'Notifications',
  '/parametres': 'Paramètres',
  '/profil': 'Mon profil',
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title = TITLES[location.pathname] || 'Vivre pour les Autres';

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {mobileOpen ? <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} /> : null}
      <Sidebar
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onLogoutClick={() => setLogoutOpen(true)}
      />
      <div className="admin-main">
        <Topbar title={title} onMenuClick={() => setMobileOpen((v) => !v)} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Se déconnecter"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmLabel="Se déconnecter"
        danger
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
