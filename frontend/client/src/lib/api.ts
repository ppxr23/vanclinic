import axios from 'axios';

const TECHNICAL_ERROR = /SQLSTATE|UniqueConstraintViolation|Doctrine\\|Symfony\\|Object\(App\\|vendor\/|stack trace|integrity constraint|constraint violation|exception occurred|uncaught|duplicate entry|this value|should not be blank|must be a valid|is not valid|must be of type|undefined array key|undefined method|call to undefined|trying to access|typed property|allowed memory|maximum execution time|\.php:\d+/i;

function friendlyError(status: number | undefined, data: unknown, url = ''): string {
  const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const raw = typeof body.error === 'string' ? body.error : typeof body.message === 'string' ? body.message : '';
  const detail = `${raw} ${typeof body.details === 'string' ? body.details : ''} ${typeof data === 'string' ? data : ''}`;
  const isSignup = url.includes('/auth/register');
  const isLogin = url.includes('/auth/login');

  if (isSignup && /unique|already exists|already used|existe déjà|duplicate|integrity constraint/i.test(detail)) {
    if (/phone|téléphone|mobile/i.test(detail) && !/email|e-mail/i.test(detail)) return 'Ce numéro de téléphone est déjà associé à un compte. Utilisez un autre numéro ou connectez-vous.';
    if (/email|e-mail/i.test(detail) && !/phone|téléphone|mobile/i.test(detail)) return 'Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.';
    return 'Cette adresse e-mail ou ce numéro de téléphone est déjà associé à un compte.';
  }
  if (isLogin && status === 401) return 'Adresse e-mail ou mot de passe incorrect.';
  if (/invalid credentials|bad credentials/i.test(detail)) return 'Adresse e-mail ou mot de passe incorrect.';
  if (/timed? out|timeout/i.test(detail)) return 'La demande prend trop de temps. Réessayez dans quelques instants.';
  if (/failed to fetch|network error|connection refused|could not connect/i.test(detail)) return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
  if (/payment.*declin|insufficient funds/i.test(detail)) return 'Le paiement a été refusé. Vérifiez votre moyen de paiement puis réessayez.';
  if (status && status >= 500) return 'Une erreur inattendue est survenue. Réessayez dans quelques instants.';
  if (TECHNICAL_ERROR.test(detail) || /<html[\s>]/i.test(detail)) {
    if (status === 409) return 'Cette information est déjà utilisée. Vérifiez les champs puis réessayez.';
    if (status === 401) return 'Votre session a expiré. Reconnectez-vous pour continuer.';
    if (status === 403) return 'Vous n’avez pas l’autorisation d’effectuer cette action.';
    if (status === 404) return 'L’élément demandé est introuvable ou n’est plus disponible.';
    if (status === 400 || status === 422) return 'Certaines informations sont invalides. Vérifiez les champs et réessayez.';
    return 'La demande n’a pas pu être traitée. Réessayez dans quelques instants.';
  }

  if (raw) return raw;
  if (status === 400 || status === 422) return 'Certaines informations sont invalides. Vérifiez les champs et réessayez.';
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous pour continuer.';
  if (status === 403) return 'Vous n’avez pas l’autorisation d’effectuer cette action.';
  if (status === 404) return 'L’élément demandé est introuvable ou n’est plus disponible.';
  if (status === 409) return 'Cette information existe déjà. Vérifiez vos données puis réessayez.';
  if (status === 429) return 'Trop de tentatives. Patientez un instant avant de réessayer.';
  if (status === 503) return 'Le service est temporairement indisponible. Réessayez dans quelques instants.';
  return 'La demande n’a pas pu être traitée. Vérifiez votre connexion puis réessayez.';
}

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vanclinic_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vanclinic_token');
      localStorage.removeItem('vanclinic_user');
    }
    if (err.response) {
      const message = friendlyError(err.response.status, err.response.data, err.config?.url ?? '');
      const body = err.response.data && typeof err.response.data === 'object' ? { ...err.response.data } : {};
      body.error = message;
      delete body.details;
      delete body.trace;
      delete body.exception;
      err.response.data = body;
      err.message = message;
    } else {
      err.message = err.code === 'ECONNABORTED'
        ? 'La demande prend trop de temps. Réessayez dans quelques instants.'
        : 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
    }
    return Promise.reject(err);
  }
);
