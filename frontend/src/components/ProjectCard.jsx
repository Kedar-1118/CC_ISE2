import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineExternalLink, HiOutlineDatabase } from 'react-icons/hi';

/**
 * ProjectCard — Displays a single project on the dashboard grid.
 *
 * Props:
 *  - project: { id, projectName, basePath, collectionNames, collectionCount, createdAt }
 *  - onDelete: callback when delete button is clicked
 */
export default function ProjectCard({ project, onDelete }) {
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

            {project.collectionNames?.length > 0 && (
                <div className="project-card-collections">
                    {project.collectionNames.map((name) => (
                        <span key={name} className="collection-tag">{name}</span>
                    ))}
                </div>
            )}

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
