import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineExternalLink, HiOutlineDatabase } from 'react-icons/hi';

/**
 * ProjectCard — Displays a single project on the dashboard grid.
 * Shows rate limit usage bar and truncated API key.
 *
 * Props:
 *  - project: { id, projectName, basePath, apiKey, collectionNames, collectionCount, weeklyRateLimit, createdAt }
 *  - onDelete: callback when delete button is clicked
 */
export default function ProjectCard({ project, onDelete }) {
    const rateUsed = project.weeklyRateLimit?.requestCount || 0;
    const rateLimit = project.weeklyRateLimit?.limit || 500;
    const ratePercent = Math.min((rateUsed / rateLimit) * 100, 100);

    return (
        <div className="project-card">
            <div className="project-card-header">
                <div className="project-card-icon">
                    <HiOutlineDatabase />
                </div>
                <h3 className="project-card-title">{project.projectName}</h3>
            </div>

            <div className="project-card-meta">
                <span className="project-card-path">/{project.basePath}</span>
                <span className="project-card-count">
                    {project.collectionCount} collection{project.collectionCount !== 1 ? 's' : ''}
                </span>
            </div>

            {/* API Key Snippet */}
            <div className="project-card-key">
                <code className="key-snippet">
                    {project.apiKey?.substring(0, 8)}••••
                </code>
            </div>

            {project.collectionNames?.length > 0 && (
                <div className="project-card-collections">
                    {project.collectionNames.map((name) => (
                        <span key={name} className="collection-tag">{name}</span>
                    ))}
                </div>
            )}

            {/* Rate Limit Mini Bar */}
            <div className="project-card-rate">
                <div className="rate-mini-bar">
                    <div
                        className={`rate-mini-fill ${ratePercent >= 90 ? 'danger' : ratePercent >= 70 ? 'warning' : ''}`}
                        style={{ width: `${ratePercent}%` }}
                    />
                </div>
                <span className="rate-mini-label">{rateUsed}/{rateLimit} req/week</span>
            </div>

            <div className="project-card-footer">
                <span className="project-card-date">
                    {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <div className="project-card-actions">
                    <Link to={`/project/${project.id}`} className="btn btn-sm btn-primary">
                        <HiOutlineExternalLink /> View
                    </Link>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(project.id)}>
                        <HiOutlineTrash />
                    </button>
                </div>
            </div>
        </div>
    );
}
