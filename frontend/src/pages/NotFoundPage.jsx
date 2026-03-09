import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card p-10 text-center">
        <h1 className="text-3xl font-bold text-brand-800">Oops!</h1>
        <p className="mt-3 text-gray-600">The page you are looking for does not exist.</p>
        <Link className="button-primary mt-6 inline-block" to="/">
          Go back home
        </Link>
      </div>
    </div>
  );
}
