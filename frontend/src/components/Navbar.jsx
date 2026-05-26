import { Link, useLocation } from 'react-router-dom';
import { HiOutlineCode, HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineLogout, HiOutlineLogin, HiOutlineBookOpen } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Navbar — Top navigation bar with logo, page links, and user menu.
 * Highlights the active route. Shows user email and logout when authenticated.
 * For guests, shows links to landing page sections and a Sign In button.
 */
export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
        { to: '/create', label: 'New Project', icon: <HiOutlinePlusCircle /> },
        { to: '/docs', label: 'Docs', icon: <HiOutlineBookOpen /> },
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

            <div className="navbar-links">
                {user ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <a href="/#features" className="nav-link">Features</a>
                        <a href="/#playground" className="nav-link">Playground</a>
                        <Link to="/docs" className={`nav-link ${location.pathname === '/docs' ? 'active' : ''}`}>Docs</Link>
                        <Link to="/login" className="btn btn-primary btn-sm login-nav-btn">
                            <HiOutlineLogin />
                            <span>Sign In</span>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
