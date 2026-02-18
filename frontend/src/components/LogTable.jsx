/**
 * LogTable — Displays request log entries in a styled table.
 *
 * Props:
 *  - logs: array of { endpoint, method, body, statusCode, timestamp }
 */
export default function LogTable({ logs }) {
    if (!logs || logs.length === 0) {
        return <p className="text-muted">No request logs yet.</p>;
    }

    const methodClass = (m) => `method-badge method-${m.toLowerCase()}`;

    return (
        <div className="log-table-wrapper">
            <table className="log-table">
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={log._id || i}>
                            <td><span className={methodClass(log.method)}>{log.method}</span></td>
                            <td><code>{log.endpoint}</code></td>
                            <td><span className={`status-code ${log.statusCode < 400 ? 'success' : 'error'}`}>{log.statusCode}</span></td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
