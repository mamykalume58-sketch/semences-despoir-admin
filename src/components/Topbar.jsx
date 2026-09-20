import { Link } from 'react-router-dom';
import { IconMenu, IconBell } from '../lib/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ title, onMenuClick }) {
  const { profile, user } = useAuth();
  const displayName = profile?.name || user?.email || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <IconMenu />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <Link to="/notifications" className="topbar-icon-btn" aria-label="Notifications">
          <IconBell />
        </Link>
        <Link to="/profil" className="topbar-profile">
          <span className="topbar-avatar">{initial}</span>
          <span className="topbar-name">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
