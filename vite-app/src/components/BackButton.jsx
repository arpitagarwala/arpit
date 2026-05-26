import { Link } from 'react-router-dom';

export default function BackButton({ to = '/' }) {
  return (
    <Link to={to} className="back-btn" aria-label="Go back">
      <i className="ri-arrow-left-line" style={{ fontSize: '1.125rem' }}></i>
    </Link>
  );
}
