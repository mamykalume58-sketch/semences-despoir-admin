import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconProjects,
  IconActions,
  IconNews,
  IconGallery,
  IconDonations,
  IconVolunteers,
  IconMessages,
  IconStats,
  IconBell,
  IconSettings,
  IconProfile,
  IconLogout,
} from '../lib/icons.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: IconDashboard, end: true },
  { to: '/projets', label: 'Projets', icon: IconProjects },
  { to: '/actions', label: 'Actions humanitaires', icon: IconActions },
  { to: '/actualites', label: 'Actualités', icon: IconNews },
  { to: '/galerie', label: 'Galerie', icon: IconGallery },
  { to: '/dons', label: 'Dons', icon: IconDonations },
  { to: '/benevoles', label: 'Bénévoles', icon: IconVolunteers },
  { to: '/messages', label: 'Messages', icon: IconMessages },
  { to: '/statistiques', label: 'Statistiques', icon: IconStats },
  { to: '/notifications', label: 'Notifications', icon: IconBell },
  { to: '/parametres', label: 'Paramètres', icon: IconSettings },
];

export default function Sidebar({ open, onNavigate, onLogoutClick }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-name">Vivre pour les Autres</span>
        <span className="sidebar-brand-tag">Votre amour fait éclairer leur espoir</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/profil"
          onClick={onNavigate}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
        >
          <IconProfile />
          <span>Mon profil</span>
        </NavLink>
        <button type="button" className="sidebar-link sidebar-logout" onClick={onLogoutClick}>
          <IconLogout />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
