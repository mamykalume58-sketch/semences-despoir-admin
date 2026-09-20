function Base({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard() {
  return (
    <Base>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function IconProjects() {
  return (
    <Base>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </Base>
  );
}

export function IconActions() {
  return (
    <Base>
      <path d="M12 21s-6.5-4.4-9-8.6C1.2 9.4 2.6 6 6 6c2 0 3.4 1.2 4 2.5C10.6 7.2 12 6 14 6c3.4 0 4.8 3.4 3 6.4-2.5 4.2-9 8.6-9 8.6z" />
    </Base>
  );
}

export function IconNews() {
  return (
    <Base>
      <path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </Base>
  );
}

export function IconGallery() {
  return (
    <Base>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </Base>
  );
}

export function IconDonations() {
  return (
    <Base>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </Base>
  );
}

export function IconVolunteers() {
  return (
    <Base>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="9" r="2.8" />
      <path d="M15.5 20a5 5 0 0 1 6.5-4.6" />
    </Base>
  );
}

export function IconMessages() {
  return (
    <Base>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.8a8.3 8.3 0 0 1-.9-3.7A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.5 8.5z" />
    </Base>
  );
}

export function IconStats() {
  return (
    <Base>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </Base>
  );
}

export function IconBell() {
  return (
    <Base>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Base>
  );
}

export function IconSettings() {
  return (
    <Base>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8.5" strokeDasharray="2 3" />
    </Base>
  );
}

export function IconProfile() {
  return (
    <Base>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 19.5a5.7 5.7 0 0 1 11 0" />
    </Base>
  );
}

export function IconLogout() {
  return (
    <Base>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Base>
  );
}

export function IconMenu() {
  return (
    <Base>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Base>
  );
}

export function IconEye() {
  return (
    <Base>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function IconEyeOff() {
  return (
    <Base>
      <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 4.2-5.5M9.9 5.2A10.6 10.6 0 0 1 12 5c7 0 11 8 11 8a19.6 19.6 0 0 1-2.2 3.1" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </Base>
  );
}

export function IconEdit() {
  return (
    <Base>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Base>
  );
}

export function IconTrash() {
  return (
    <Base>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Base>
  );
}

export function IconPlus() {
  return (
    <Base>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Base>
  );
}
