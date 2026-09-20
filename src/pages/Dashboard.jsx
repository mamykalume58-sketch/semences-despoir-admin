import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/DataState.jsx';
import { IconDonations, IconProjects, IconActions, IconVolunteers } from '../lib/icons.jsx';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function formatFC(amount) {
  return `${Math.round(amount || 0).toLocaleString('fr-FR')} FC`;
}

function timeAgo(date) {
  if (!date) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

function useCollection(name, orderField) {
  const [state, setState] = useState({ status: 'loading', docs: [] });

  useEffect(() => {
    const ref = orderField ? query(collection(db, name), orderBy(orderField, 'desc')) : collection(db, name);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => setState({ status: 'ready', docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }),
      (error) => {
        console.error(`Erreur Firestore (${name}) :`, error);
        setState({ status: 'error', docs: [] });
      }
    );
    return unsubscribe;
  }, [name, orderField]);

  return state;
}

export default function Dashboard() {
  const projects = useCollection('projects');
  const donations = useCollection('donations', 'createdAt');
  const volunteers = useCollection('volunteers');

  const loading = [projects, donations, volunteers].some((s) => s.status === 'loading');
  const hasError = [projects, donations, volunteers].some((s) => s.status === 'error');

  const stats = useMemo(() => {
    const totalDons = donations.docs
      .filter((d) => d.status === 'confirme' || d.status === 'confirmé')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const projetsEnCours = projects.docs.filter((p) => p.status === 'en_cours').length;
    const projetsRealises = projects.docs.filter((p) => p.status === 'termine').length;
    return {
      totalDons,
      projetsEnCours,
      projetsRealises,
      benevoles: volunteers.docs.length,
    };
  }, [projects.docs, donations.docs, volunteers.docs]);

  const monthlyDons = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totals = Array(12).fill(0);
    donations.docs
      .filter((d) => d.status === 'confirme' || d.status === 'confirmé')
      .forEach((d) => {
        const date = toDate(d.createdAt);
        if (date && date.getFullYear() === currentYear) {
          totals[date.getMonth()] += Number(d.amount) || 0;
        }
      });
    return totals;
  }, [donations.docs]);

  const maxMonthly = Math.max(1, ...monthlyDons);

  const recentActivity = useMemo(() => {
    const items = [
      ...donations.docs.slice(0, 5).map((d) => ({
        id: `don-${d.id}`,
        title: 'Nouveau don reçu',
        description: `${formatFC(d.amount)} — ${d.projectTitle || 'Projet non précisé'}`,
        date: toDate(d.createdAt),
      })),
      ...volunteers.docs.slice(0, 5).map((v) => ({
        id: `benevole-${v.id}`,
        title: 'Nouvelle candidature bénévole',
        description: v.fullName || v.name || 'Candidat',
        date: toDate(v.createdAt),
      })),
      ...projects.docs.slice(0, 5).map((p) => ({
        id: `projet-${p.id}`,
        title: 'Projet mis à jour',
        description: p.title || 'Projet',
        date: toDate(p.updatedAt || p.createdAt),
      })),
    ];
    return items
      .filter((item) => item.date)
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);
  }, [donations.docs, volunteers.docs, projects.docs]);

  if (loading) return <LoadingState label="Chargement du tableau de bord..." />;
  if (hasError) return <ErrorState />;

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatCard icon={IconDonations} label="Total des dons" value={formatFC(stats.totalDons)} accent="gold" />
        <StatCard icon={IconProjects} label="Projets en cours" value={stats.projetsEnCours} accent="green" />
        <StatCard icon={IconActions} label="Projets réalisés" value={stats.projetsRealises} accent="green-dark" />
        <StatCard icon={IconVolunteers} label="Bénévoles" value={stats.benevoles} accent="green" />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <h2>Évolution des dons</h2>
          {monthlyDons.every((v) => v === 0) ? (
            <EmptyState label="Aucun don enregistré cette année." />
          ) : (
            <div className="bar-chart">
              {monthlyDons.map((value, index) => (
                <div key={MONTHS[index]} className="bar-chart-col">
                  <div
                    className="bar-chart-bar"
                    style={{ height: `${(value / maxMonthly) * 100}%` }}
                    title={formatFC(value)}
                  />
                  <span>{MONTHS[index]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card activity-card">
          <h2>Activité récente</h2>
          {recentActivity.length === 0 ? (
            <EmptyState label="Aucune activité pour le moment." />
          ) : (
            <ul className="activity-list">
              {recentActivity.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <span>{timeAgo(item.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
