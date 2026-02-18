import { Link, useLocation } from 'react-router-dom';
import { HiOutlineCode, HiOutlineViewGrid, HiOutlinePlusCircle } from 'react-icons/hi';

/**
 * Navbar — Top navigation bar with logo and page links.
 * Highlights the active route.
 */
export default function Navbar() {
    const location = useLocation();

    const links = [
        { to: '/', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
        { to: '/create', label: 'New Project', icon: <HiOutlinePlusCircle /> },
    ];

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <HiOutlineCode className="brand-icon" />
                <span>MockAPI</span>
            </Link>

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
            </div>
        </nav>
    );
}
