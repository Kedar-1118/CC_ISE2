import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import JsonEditor from '../components/JsonEditor';
import { createProject } from '../services/api';
import { HiOutlineLightningBolt } from 'react-icons/hi';

/**
 * CreateProject — Form to create a new mock API project.
 * User enters a project name and pastes/uploads JSON data.
 */
export default function CreateProject() {
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!projectName.trim()) {
            toast.error('Please enter a project name');
            return;
        }

        if (!jsonText.trim()) {
            toast.error('Please paste or upload JSON data');
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            toast.error('Invalid JSON format');
            return;
        }

        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
            toast.error('JSON must be an object with collection keys');
            return;
        }

        // Check at least one collection has an array value
        const hasArrays = Object.values(parsed).some(Array.isArray);
        if (!hasArrays) {
            toast.error('Each collection value must be an array of objects');
            return;
        }

        try {
            setLoading(true);
            const { data } = await createProject(projectName.trim(), parsed);
            toast.success('Project created successfully!');
            navigate(`/project/${data.data.id}`);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create project';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Create New Project</h1>
                    <p className="text-muted">Define your mock data and generate REST APIs instantly</p>
                </div>
            </div>

            <form className="create-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <input
                        id="projectName"
                        type="text"
                        className="form-input"
                        placeholder="e.g. My E-commerce API"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        maxLength={100}
                    />
                    {projectName.trim() && (
                        <p className="form-hint">
                            Base path: <code>/mock/{projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}</code>
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>JSON Data</label>
                    <p className="form-hint">
                        Each top-level key becomes a collection. Values must be arrays of objects.
                    </p>
                    <JsonEditor value={jsonText} onChange={setJsonText} />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                >
                    <HiOutlineLightningBolt />
                    {loading ? 'Creating...' : 'Generate Mock APIs'}
                </button>
            </form>
        </div>
    );
}
