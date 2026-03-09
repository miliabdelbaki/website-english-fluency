import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card p-10 text-center">
        <h1 className="text-3xl font-bold text-brand-800">Oups !</h1>
        <p className="mt-3 text-gray-600">La page que tu cherches n’existe pas.</p>
        <Link className="button-primary mt-6 inline-block" to="/">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
