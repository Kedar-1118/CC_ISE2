import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { testMockEndpoint } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ApiTester — Minimal API testing console.
 * User selects HTTP method, enters URL, optional body, sends request, and sees response.
 */
export default function ApiTester() {
    const [searchParams] = useSearchParams();
    const basePath = searchParams.get('basePath') || '';
    const collection = searchParams.get('collection') || '';

    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState(
        basePath ? `${API_BASE}/mock/${basePath}/${collection}` : `${API_BASE}/mock/`
    );
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        let parsedBody = null;
        if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                parsedBody = JSON.parse(body);
            } catch {
                toast.error('Invalid JSON body');
                return;
            }
        }

        try {
            setLoading(true);
            setResponse(null);
            setResponseStatus(null);
            const res = await testMockEndpoint(method, url, parsedBody);
            setResponse(JSON.stringify(res.data, null, 2));
            setResponseStatus(res.status);
        } catch (err) {
            if (err.response) {
                setResponse(JSON.stringify(err.response.data, null, 2));
                setResponseStatus(err.response.status);
            } else {
                setResponse(err.message);
                setResponseStatus('ERR');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>API Tester</h1>
                    <p className="text-muted">Test your mock endpoints in real-time</p>
                </div>
            </div>

            <div className="tester-container">
                <div className="tester-request">
                    <div className="tester-bar">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="method-select"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                        <input
                            type="text"
                            className="url-input"
                            placeholder={`${API_BASE}/mock/your-project/collection`}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={loading}
                        >
                            <HiOutlinePaperAirplane />
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>

                    {['POST', 'PUT', 'PATCH'].includes(method) && (
                        <div className="tester-body">
                            <label>Request Body (JSON)</label>
                            <textarea
                                className="json-textarea"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder='{ "name": "Example", "value": 42 }'
                                rows={6}
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>

                {response !== null && (
                    <div className="tester-response">
                        <div className="response-header">
                            <h3>Response</h3>
                            <span className={`status-code ${responseStatus < 400 ? 'success' : 'error'}`}>
                                {responseStatus}
                            </span>
                        </div>
                        <pre className="response-body">{response}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
