import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlusCircle, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import ProjectCard from '../components/ProjectCard';
import { getProjects, deleteProject } from '../services/api';

/**
 * Dashboard — Lists all existing mock API projects in a card grid.
 * Supports search filtering and project deletion.
 */
export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data } = await getProjects();
            setProjects(data.data);
        } catch (err) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        try {
            await deleteProject(id);
            toast.success('Project deleted');
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error('Failed to delete project');
        }
    };

    const filtered = projects.filter((p) =>
        p.projectName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Your Projects</h1>
                    <p className="text-muted">Manage your mock API projects</p>
                </div>
                <Link to="/create" className="btn btn-primary">
                    <HiOutlinePlusCircle /> New Project
                </Link>
            </div>

            {projects.length > 0 && (
                <div className="search-bar">
                    <HiOutlineSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            {loading ? (
                <div className="loader-container">
                    <div className="loader" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <h2>No projects yet</h2>
                    <p>Create your first mock API project to get started!</p>
                    <Link to="/create" className="btn btn-primary">
                        <HiOutlinePlusCircle /> Create Project
                    </Link>
                </div>
            ) : (
                <div className="project-grid">
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
