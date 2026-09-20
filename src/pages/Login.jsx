import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { IconEye, IconEyeOff } from '../lib/icons.jsx';

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/user-disabled': 'Ce compte a été désactivé.',
  'auth/user-not-found': 'Aucun compte ne correspond à cet e-mail.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
};

export default function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { authError } = useAuth();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const email = (emailRef.current?.value || '').trim();
    const password = passwordRef.current?.value || '';

    if (!email || !password) {
      setError('Merci de renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setSubmitting(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || `Connexion impossible : ${err.code || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const currentEmail = emailRef.current?.value || '';
    const target = window.prompt(
      'Entrez votre e-mail administrateur pour recevoir un lien de réinitialisation :',
      currentEmail
    );
    if (!target) return;
    try {
      await sendPasswordResetEmail(auth, target.trim());
      window.alert('E-mail de réinitialisation envoyé si ce compte existe.');
    } catch (err) {
      window.alert("Impossible d’envoyer l’e-mail de réinitialisation.");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-visual" aria-hidden="true" />
      <div className="login-panel">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo-mark">VA</span>
            <div>
              <strong>Vivre pour les Autres</strong>
              <p>Votre amour fait éclairer leur espoir</p>
            </div>
          </div>

          <h1>Espace Administrateur</h1>
          <p className="login-subtitle">Connectez-vous pour accéder à votre tableau de bord</p>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} noValidate>
            <label className="form-field">
              <span>Email ou nom d’utilisateur</span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                defaultValue=""
                required
                autoComplete="username"
                placeholder="admin@semencesdespoir.org"
              />
            </label>

            <label className="form-field">
              <span>Mot de passe</span>
              <div className="form-password">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  defaultValue=""
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  className="form-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="link-btn" onClick={handleForgotPassword}>
                Mot de passe oublié ?
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="login-footer">© 2026 Vivre pour les Autres. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
