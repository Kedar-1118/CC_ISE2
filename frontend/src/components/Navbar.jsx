import { Link, useLocation } from 'react-router-dom';
import { HiOutlineCode, HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Navbar — Top navigation bar with logo, page links, and user menu.
 * Highlights the active route. Shows user email and logout when authenticated.
 */
export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { to: '/', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
        { to: '/create', label: 'New Project', icon: <HiOutlinePlusCircle /> },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
        } catch {
            toast.error('Logout failed');
        }
    };

    // Don't show nav on login page
    if (location.pathname === '/login') return null;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <HiOutlineCode className="brand-icon" />
                <span>MockAPI</span>
            </Link>

            {user && (
                <div className="navbar-links">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
                    <div className="navbar-user">
                        <span className="navbar-email">{user.email}</span>
                        <button className="btn btn-ghost nav-logout" onClick={handleLogout} title="Logout">
                            <HiOutlineLogout />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
