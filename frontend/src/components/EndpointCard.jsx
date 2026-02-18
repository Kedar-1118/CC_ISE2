import { useState } from 'react';
import { HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';

/**
 * EndpointCard — Displays a single API endpoint with method badge and copy button.
 *
 * Props:
 *  - method: HTTP method (GET, POST, PUT, DELETE)
 *  - url: full endpoint URL
 */
export default function EndpointCard({ method, url }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const methodClass = `method-badge method-${method.toLowerCase()}`;

    return (
        <div className="endpoint-card">
            <span className={methodClass}>{method}</span>
            <code className="endpoint-url">{url}</code>
            <button className="btn btn-sm btn-ghost" onClick={handleCopy} title="Copy URL">
                {copied ? <HiOutlineCheck /> : <HiOutlineClipboardCopy />}
            </button>
        </div>
    );
}
