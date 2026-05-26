import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlusCircle, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import ProjectCard from '../components/ProjectCard';
import { getProjects, deleteProject } from '../services/api';

const MAX_PROJECTS = 3;

/**
 * Dashboard — Lists all existing mock API projects in a card grid.
 * Supports search filtering, project deletion, and shows project limit indicator.
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

    const atLimit = projects.length >= MAX_PROJECTS;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Your Projects</h1>
                    <p className="text-muted">Manage your mock API projects</p>
                </div>
                <div className="page-header-actions">
                    <span className={`project-limit-badge ${atLimit ? 'at-limit' : ''}`}>
                        {projects.length}/{MAX_PROJECTS} projects
                    </span>
                    {atLimit ? (
                        <span className="btn btn-primary btn-disabled" title="Project limit reached. Delete a project to create a new one.">
                            <HiOutlinePlusCircle /> Limit Reached
                        </span>
                    ) : (
                        <Link to="/create" className="btn btn-primary">
                            <HiOutlinePlusCircle /> New Project
                        </Link>
                    )}
                </div>
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
