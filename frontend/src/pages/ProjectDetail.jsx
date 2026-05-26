import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineBeaker, HiOutlineArrowLeft, HiOutlineKey, HiOutlineRefresh, HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import EndpointCard from '../components/EndpointCard';
import LogTable from '../components/LogTable';
import { getProject, deleteProject, getProjectLogs, resetApiKey } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ProjectDetail — Shows project info, API key, rate limit, endpoints, and request logs.
 */
export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('endpoints');
    const [keyVisible, setKeyVisible] = useState(false);
    const [keyCopied, setKeyCopied] = useState(false);
    const [resetting, setResetting] = useState(false);

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

    const handleCopyKey = async () => {
        if (!project?.apiKey) return;
        await navigator.clipboard.writeText(project.apiKey);
        setKeyCopied(true);
        toast.success('API key copied!');
        setTimeout(() => setKeyCopied(false), 2000);
    };

    const handleResetKey = async () => {
        if (!window.confirm(
            'Are you sure you want to reset your API key?\n\n' +
            '⚠️ The old key will immediately stop working.\n' +
            '⚠️ Update all applications using this key.\n\n' +
            'Your rate limit usage will be preserved.'
        )) return;

        try {
            setResetting(true);
            const { data } = await resetApiKey(id);
            setProject((prev) => ({
                ...prev,
                apiKey: data.data.apiKey,
                weeklyRateLimit: data.data.weeklyRateLimit,
            }));
            setKeyVisible(true);
            toast.success('API key has been reset!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset API key');
        } finally {
            setResetting(false);
        }
    };

    const maskKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '••••••••••••••••••••' + key.substring(key.length - 4);
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

    // Rate limit calculations
    const rateUsed = project.weeklyRateLimit?.requestCount || 0;
    const rateLimit = project.weeklyRateLimit?.limit || 500;
    const ratePercent = Math.min((rateUsed / rateLimit) * 100, 100);
    const weekStart = project.weeklyRateLimit?.weekStart ? new Date(project.weeklyRateLimit.weekStart) : new Date();
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <Link to="/" className="back-link"><HiOutlineArrowLeft /> Back to Dashboard</Link>
                    <h1>{project.projectName}</h1>
                    <p className="text-muted">Base path: <code>/mock/{project.basePath}</code></p>
                </div>
                <div className="page-header-actions">
                    <Link to={`/tester?apiKey=${project.apiKey}&collection=${collectionNames[0] || ''}`} className="btn btn-secondary">
                        <HiOutlineBeaker /> API Tester
                    </Link>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <HiOutlineTrash /> Delete
                    </button>
                </div>
            </div>

            {/* API Key Card */}
            <div className="api-key-card">
                <div className="api-key-header">
                    <div className="api-key-title">
                        <HiOutlineKey className="api-key-icon" />
                        <h3>API Key</h3>
                    </div>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={handleResetKey}
                        disabled={resetting}
                    >
                        <HiOutlineRefresh className={resetting ? 'spin' : ''} />
                        {resetting ? 'Resetting...' : 'Reset Key'}
                    </button>
                </div>
                <div className="api-key-value">
                    <code className="api-key-text">
                        {keyVisible ? project.apiKey : maskKey(project.apiKey)}
                    </code>
                    <div className="api-key-actions">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setKeyVisible(!keyVisible)}
                            title={keyVisible ? 'Hide' : 'Reveal'}
                        >
                            {keyVisible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={handleCopyKey}
                            title="Copy API key"
                        >
                            {keyCopied ? <HiOutlineCheck /> : <HiOutlineClipboardCopy />}
                        </button>
                    </div>
                </div>
                <p className="api-key-hint">
                    Use this key in your API URL: <code>{API_BASE}/api/{keyVisible ? project.apiKey : '{API_KEY}'}/collection</code>
                </p>
            </div>

            {/* Rate Limit Widget */}
            <div className="rate-limit-card">
                <div className="rate-limit-header">
                    <h3>Weekly Rate Limit</h3>
                    <span className={`rate-limit-count ${ratePercent >= 90 ? 'danger' : ratePercent >= 70 ? 'warning' : ''}`}>
                        {rateUsed.toLocaleString()} / {rateLimit.toLocaleString()} requests
                    </span>
                </div>
                <div className="rate-limit-bar">
                    <div
                        className={`rate-limit-fill ${ratePercent >= 90 ? 'danger' : ratePercent >= 70 ? 'warning' : ''}`}
                        style={{ width: `${ratePercent}%` }}
                    />
                </div>
                <div className="rate-limit-footer">
                    <span className="text-muted">
                        Week started: {weekStart.toLocaleDateString()}
                    </span>
                    <span className="text-muted">
                        Resets: {weekEnd.toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'endpoints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('endpoints')}
                >
                    Endpoints ({collectionNames.length * 5})
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
                                <EndpointCard method="GET" url={`${API_BASE}/api/${project.apiKey}/${col}`} />
                                <EndpointCard method="GET" url={`${API_BASE}/api/${project.apiKey}/${col}/:id`} />
                                <EndpointCard method="POST" url={`${API_BASE}/api/${project.apiKey}/${col}`} />
                                <EndpointCard method="PUT" url={`${API_BASE}/api/${project.apiKey}/${col}/:id`} />
                                <EndpointCard method="DELETE" url={`${API_BASE}/api/${project.apiKey}/${col}/:id`} />
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
