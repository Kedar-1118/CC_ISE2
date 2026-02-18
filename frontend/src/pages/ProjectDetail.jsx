import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineBeaker, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import EndpointCard from '../components/EndpointCard';
import LogTable from '../components/LogTable';
import { getProject, deleteProject, getProjectLogs } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ProjectDetail — Shows a project's info, generated endpoints, and request logs.
 */
export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('endpoints');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projRes, logRes] = await Promise.all([
                    getProject(id),
                    getProjectLogs(id),
                ]);
                setProject(projRes.data.data);
                setLogs(logRes.data.data);
            } catch {
                toast.error('Failed to load project');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this project permanently?')) return;
        try {
            await deleteProject(id);
            toast.success('Project deleted');
            navigate('/');
        } catch {
            toast.error('Failed to delete project');
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loader-container"><div className="loader" /></div>
            </div>
        );
    }

    if (!project) return null;

    // Build endpoint list for each collection
    const collectionNames = Object.keys(project.collections);
    const endpoints = [];
    collectionNames.forEach((col) => {
        endpoints.push(
            { method: 'GET', url: `${API_BASE}/mock/${project.basePath}/${col}` },
            { method: 'GET', url: `${API_BASE}/mock/${project.basePath}/${col}/:id` },
            { method: 'POST', url: `${API_BASE}/mock/${project.basePath}/${col}` },
            { method: 'PUT', url: `${API_BASE}/mock/${project.basePath}/${col}/:id` },
            { method: 'DELETE', url: `${API_BASE}/mock/${project.basePath}/${col}/:id` },
        );
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <Link to="/" className="back-link"><HiOutlineArrowLeft /> Back to Dashboard</Link>
                    <h1>{project.projectName}</h1>
                    <p className="text-muted">Base path: <code>/mock/{project.basePath}</code></p>
                </div>
                <div className="page-header-actions">
                    <Link to={`/tester?basePath=${project.basePath}&collection=${collectionNames[0] || ''}`} className="btn btn-secondary">
                        <HiOutlineBeaker /> API Tester
                    </Link>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <HiOutlineTrash /> Delete
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'endpoints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('endpoints')}
                >
                    Endpoints ({endpoints.length})
                </button>
                <button
                    className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveTab('data')}
                >
                    Data Preview
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Request Logs ({logs.length})
                </button>
            </div>

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
                <div className="tab-content">
                    {collectionNames.map((col) => (
                        <div key={col} className="collection-section">
                            <h3 className="collection-title">/{col}</h3>
                            <div className="endpoint-list">
                                <EndpointCard method="GET" url={`${API_BASE}/mock/${project.basePath}/${col}`} />
                                <EndpointCard method="GET" url={`${API_BASE}/mock/${project.basePath}/${col}/:id`} />
                                <EndpointCard method="POST" url={`${API_BASE}/mock/${project.basePath}/${col}`} />
                                <EndpointCard method="PUT" url={`${API_BASE}/mock/${project.basePath}/${col}/:id`} />
                                <EndpointCard method="DELETE" url={`${API_BASE}/mock/${project.basePath}/${col}/:id`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Data Preview Tab */}
            {activeTab === 'data' && (
                <div className="tab-content">
                    {collectionNames.map((col) => (
                        <div key={col} className="collection-section">
                            <h3 className="collection-title">
                                /{col}
                                <span className="record-count">
                                    {project.collections[col]?.length || 0} records
                                </span>
                            </h3>
                            <pre className="data-preview">
                                {JSON.stringify(project.collections[col], null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="tab-content">
                    <LogTable logs={logs} />
                </div>
            )}
        </div>
    );
}
