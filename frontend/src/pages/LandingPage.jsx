import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HiOutlineLightningBolt, 
    HiOutlineTerminal, 
    HiOutlineDatabase, 
    HiOutlineShieldCheck, 
    HiOutlineCode, 
    HiOutlineArrowRight, 
    HiOutlineChevronDown, 
    HiOutlineChevronUp,
    HiOutlineCheck,
    HiOutlineDuplicate,
    HiOutlinePlus,
    HiOutlineRefresh
} from 'react-icons/hi';

const DEFAULT_SANDBOX_JSON = `{
  "users": [
    { "id": 1, "name": "Alice Vance", "role": "Lead Architect", "active": true },
    { "id": 2, "name": "Bob Miller", "role": "Frontend Engineer", "active": false },
    { "id": 3, "name": "Charlie Dev", "role": "DevOps Engineer", "active": true }
  ],
  "projects": [
    { "id": 1, "title": "MockAPI PaaS", "status": "completed" },
    { "id": 2, "title": "OAuth Engine", "status": "active" }
  ]
}`;

export default function LandingPage() {
    const { user } = useAuth();
    const [jsonInput, setJsonInput] = useState(DEFAULT_SANDBOX_JSON);
    const [jsonValid, setJsonValid] = useState(true);
    const [collections, setCollections] = useState(['users', 'projects']);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [consoleOutput, setConsoleOutput] = useState(null);
    const [consoleLoading, setConsoleLoading] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [faqOpen, setFaqOpen] = useState({});
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Simulated terminal text
    const terminalCommands = [
        'curl -X GET https://mockapi.dev/api/sk_live_a94b3/users',
        'curl -X POST https://mockapi.dev/api/sk_live_a94b3/users -d \'{"name": "Diana"}\'',
        'curl -X DELETE https://mockapi.dev/api/sk_live_a94b3/projects/2'
    ];
    const [terminalIndex, setTerminalIndex] = useState(0);

    // Auto-typing terminal effect
    useEffect(() => {
        let isCancelled = false;
        let index = 0;
        const currentCommand = terminalCommands[terminalIndex];
        setTypingText('');

        const typeCharacter = () => {
            if (isCancelled) return;
            if (index < currentCommand.length) {
                setTypingText((prev) => prev + currentCommand.charAt(index));
                index++;
                setTimeout(typeCharacter, 60);
            } else {
                // Command fully typed, pause before showing simulated output
                setTimeout(() => {
                    if (isCancelled) return;
                    setTerminalIndex((prev) => (prev + 1) % terminalCommands.length);
                }, 3500);
            }
        };

        typeCharacter();

        return () => {
            isCancelled = true;
        };
    }, [terminalIndex]);

    // Handle Sandbox JSON changes
    const handleJsonChange = (val) => {
        setJsonInput(val);
        try {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                setJsonValid(true);
                const keys = Object.keys(parsed).filter(k => Array.isArray(parsed[k]));
                setCollections(keys);
            } else {
                setJsonValid(false);
            }
        } catch {
            setJsonValid(false);
        }
    };

    // Simulate API request in playground
    const triggerSimulatedRequest = (method, endpoint, collection, id = null) => {
        setSelectedEndpoint(`${method} ${endpoint}`);
        setConsoleLoading(true);

        setTimeout(() => {
            try {
                const data = JSON.parse(jsonInput);
                let responseData = null;
                let status = '200 OK';

                if (!data[collection] || !Array.isArray(data[collection])) {
                    responseData = { error: `Collection '${collection}' not found` };
                    status = '404 Not Found';
                } else {
                    const list = data[collection];
                    if (method === 'GET') {
                        if (id) {
                            const found = list.find(item => item.id == id);
                            if (found) {
                                responseData = found;
                            } else {
                                responseData = { error: `Record with ID ${id} not found` };
                                status = '404 Not Found';
                            }
                        } else {
                            responseData = list;
                        }
                    } else if (method === 'POST') {
                        const newId = list.length > 0 ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
                        responseData = {
                            id: newId,
                            name: collection === 'users' ? 'Diana Prince' : 'Payment Gateway API',
                            role: 'QA Specialist',
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        };
                        status = '201 Created';
                    } else if (method === 'PUT') {
                        const found = list.find(item => item.id == id);
                        if (found) {
                            responseData = {
                                ...found,
                                name: found.name ? found.name + ' (Updated)' : undefined,
                                title: found.title ? found.title + ' (Updated)' : undefined,
                                updatedAt: new Date().toISOString()
                            };
                        } else {
                            responseData = { error: `Record with ID ${id} not found` };
                            status = '404 Not Found';
                        }
                    } else if (method === 'DELETE') {
                        const found = list.find(item => item.id == id);
                        if (found) {
                            responseData = { success: true, message: `Record ${id} deleted successfully` };
                        } else {
                            responseData = { error: `Record with ID ${id} not found` };
                            status = '404 Not Found';
                        }
                    }
                }

                setConsoleOutput({
                    method,
                    url: `https://mockapi.dev/api/sandbox-key${endpoint}`,
                    status,
                    body: responseData
                });
            } catch {
                setConsoleOutput({
                    method,
                    url: `https://mockapi.dev/api/sandbox-key${endpoint}`,
                    status: '500 Internal Server Error',
                    body: { error: 'Invalid local JSON state' }
                });
            } finally {
                setConsoleLoading(false);
            }
        }, 300);
    };

    // Auto-trigger first request on load
    useEffect(() => {
        if (collections.length > 0) {
            triggerSimulatedRequest('GET', `/${collections[0]}`, collections[0]);
        }
    }, []);

    // Colorize JSON syntax helper
    const renderJSONHighlight = (obj) => {
        const str = JSON.stringify(obj, null, 2);
        if (!str) return null;

        return str.split('\n').map((line, idx) => {
            const keyMatch = line.match(/^(\s*)"([^"]+)":/);
            if (keyMatch) {
                const indent = keyMatch[1];
                const key = keyMatch[2];
                const rest = line.substring(keyMatch[0].length);
                return (
                    <div key={idx} className="json-line">
                        {indent}<span className="hl-key">"{key}"</span>:
                        {renderValueHighlight(rest)}
                    </div>
                );
            }
            return <div key={idx} className="json-line">{line}</div>;
        });
    };

    const renderValueHighlight = (valStr) => {
        const trimmed = valStr.trim();
        if (trimmed.startsWith('"')) {
            const hasComma = trimmed.endsWith(',');
            const cleanStr = hasComma ? trimmed.slice(0, -1) : trimmed;
            return (
                <>
                    {' '}<span className="hl-string">{cleanStr}</span>{hasComma && ','}
                </>
            );
        } else if (/^(true|false)/.test(trimmed)) {
            const hasComma = trimmed.endsWith(',');
            const boolVal = trimmed.split(',')[0];
            return (
                <>
                    {' '}<span className="hl-bool">{boolVal}</span>{hasComma && ','}
                </>
            );
        } else if (/^\d+/.test(trimmed)) {
            const hasComma = trimmed.endsWith(',');
            const numVal = trimmed.split(',')[0];
            return (
                <>
                    {' '}<span className="hl-number">{numVal}</span>{hasComma && ','}
                </>
            );
        } else if (trimmed.startsWith('null')) {
            const hasComma = trimmed.endsWith(',');
            return (
                <>
                    {' '}<span className="hl-null">null</span>{hasComma && ','}
                </>
            );
        }
        return valStr;
    };

    // Accordion FAQ toggle
    const toggleFaq = (idx) => {
        setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    const faqs = [
        {
            q: "How does MockAPI generate endpoints automatically?",
            a: "When you upload/paste a JSON object, MockAPI scans its top-level keys. If a key maps to an array of objects, MockAPI creates a fully operational REST collection. It dynamically generates endpoints for listing, details, insertion, updating, and deletion (GET, POST, PUT, DELETE) linked directly to that collection in real time."
        },
        {
            q: "Can I use MockAPI endpoints in my local frontend app?",
            a: "Absolutely! Every mock server is exposed on a public, CORS-enabled cloud URL. You can use standard `fetch`, `axios`, or any API client in React, Vue, Angular, Flutter, or iOS/Android to make requests directly to your mock routes."
        },
        {
            q: "Is there a usage limit for the API keys?",
            a: "The standard free plan allows you to create up to 3 projects, with a limit of 500 requests per project per week. API keys reset their rate usage automatically every 7 days. If you exhaust your limits, you can easily clear request history or reset keys."
        },
        {
            q: "Are the CRUD changes persistent?",
            a: "Yes! When you make a `POST`, `PUT`, or `DELETE` request to your API routes, the changes are stored instantly in our backend MongoDB database. Your mock database will reflect those changes in all subsequent requests until you manually reset the project."
        }
    ];

    const handleCopyTerminal = async (text, idx) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="landing-page page">
            {/* Background Grid Mesh */}
            <div className="landing-grid-overlay" />

            {/* HERO SECTION */}
            <section className="landing-hero">
                <div className="hero-badge">
                    <HiOutlineLightningBolt className="hero-badge-icon" />
                    <span>Instant REST Mocks in the Cloud</span>
                </div>
                
                <h1 className="hero-title">
                    Mock APIs in <span className="gradient-text">Seconds</span>,<br />
                    Develop Without <span className="gradient-text">Blockers</span>.
                </h1>
                
                <p className="hero-subtitle">
                    Paste your JSON schema and instantly generate secure, CORS-enabled, hosted mock REST APIs with full CRUD functionality, analytics logs, and a built-in tester.
                </p>

                <div className="hero-actions">
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary btn-lg glow-effect">
                            Go to Dashboard <HiOutlineArrowRight />
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary btn-lg glow-effect">
                                Get Started Free <HiOutlineArrowRight />
                            </Link>
                            <a href="#playground" className="btn btn-secondary btn-lg">
                                Try Interactive Sandbox
                            </a>
                        </>
                    )}
                </div>

                {/* Animated Terminal Simulator */}
                <div className="hero-terminal-wrapper">
                    <div className="terminal-header">
                        <div className="terminal-dots">
                            <span className="dot dot-red"></span>
                            <span className="dot dot-yellow"></span>
                            <span className="dot dot-green"></span>
                        </div>
                        <span className="terminal-title">bash — curl tester</span>
                        <button 
                            className="terminal-copy-btn"
                            onClick={() => handleCopyTerminal(typingText, 99)}
                            title="Copy command"
                        >
                            {copiedIndex === 99 ? <HiOutlineCheck style={{ color: 'var(--success)' }} /> : <HiOutlineDuplicate />}
                        </button>
                    </div>
                    <div className="terminal-body">
                        <div className="terminal-prompt-line">
                            <span className="terminal-prompt">$</span>{' '}
                            <span className="terminal-input">{typingText}</span>
                            <span className="terminal-cursor">|</span>
                        </div>
                        <div className="terminal-output mt-2">
                            {typingText.includes('GET') && typingText.length === terminalCommands[0].length && (
                                <pre className="text-success-dim">
{`HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

[
  { "id": 1, "name": "Alice Vance", "role": "Lead Architect" },
  { "id": 2, "name": "Bob Miller", "role": "Frontend Engineer" }
]`}
                                </pre>
                            )}
                            {typingText.includes('POST') && typingText.length === terminalCommands[1].length && (
                                <pre className="text-info-dim">
{`HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 3,
  "name": "Diana",
  "role": "Guest User",
  "createdAt": "2026-05-26T23:27:00Z"
}`}
                                </pre>
                            )}
                            {typingText.includes('DELETE') && typingText.length === terminalCommands[2].length && (
                                <pre className="text-warning-dim">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Record 2 deleted successfully"
}`}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST STATISTICS */}
            <section className="landing-stats">
                <div className="stat-card">
                    <h3>500ms</h3>
                    <p>Average API Setup Time</p>
                </div>
                <div className="stat-card">
                    <h3>100%</h3>
                    <p>CORS-Ready Out of the Box</p>
                </div>
                <div className="stat-card">
                    <h3>3 Steps</h3>
                    <p>From Raw JSON to REST URLs</p>
                </div>
            </section>

            {/* PLAYGROUND SANDBOX SECTION */}
            <section id="playground" className="landing-playground">
                <div className="section-header text-center">
                    <span className="pill-badge">Interactive Sandbox</span>
                    <h2>Test Drive the Mock Engine</h2>
                    <p className="section-description">
                        Modify the JSON schema on the left, and watch the available REST endpoints adapt. Click any endpoint route to fire a simulated request and preview the response.
                    </p>
                </div>

                <div className="playground-grid">
                    {/* JSON Editor panel */}
                    <div className="playground-panel json-panel">
                        <div className="panel-header">
                            <HiOutlineCode className="panel-icon text-accent" />
                            <h4>1. Customize Schema (JSON)</h4>
                            <span className={`validation-badge ${jsonValid ? 'valid' : 'invalid'}`}>
                                {jsonValid ? 'Valid JSON' : 'Invalid Syntax'}
                            </span>
                        </div>
                        <textarea
                            className={`playground-textarea ${!jsonValid ? 'invalid' : ''}`}
                            value={jsonInput}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            placeholder="Enter valid database JSON here..."
                        />
                        <div className="panel-footer">
                            <span className="text-muted text-xs">
                                Top-level keys with array values become endpoints.
                            </span>
                        </div>
                    </div>

                    {/* Endpoints and response panel */}
                    <div className="playground-panel api-panel">
                        <div className="panel-header">
                            <HiOutlineTerminal className="panel-icon text-success" />
                            <h4>2. Query Auto-Generated Endpoints</h4>
                        </div>
                        
                        <div className="playground-endpoints">
                            {collections.length === 0 ? (
                                <p className="text-muted text-center py-4 text-sm">
                                    No collection arrays found in JSON structure.
                                </p>
                            ) : (
                                collections.map((col) => (
                                    <div key={col} className="playground-collection-group">
                                        <span className="collection-group-title">/{col}</span>
                                        <div className="endpoint-pills">
                                            <button
                                                className={`ep-pill get ${selectedEndpoint === `GET /${col}` ? 'active' : ''}`}
                                                onClick={() => triggerSimulatedRequest('GET', `/${col}`, col)}
                                            >
                                                <span className="m-badge m-get">GET</span>
                                                <span className="m-path">/{col}</span>
                                            </button>
                                            <button
                                                className={`ep-pill get ${selectedEndpoint === `GET /${col}/1` ? 'active' : ''}`}
                                                onClick={() => triggerSimulatedRequest('GET', `/${col}/1`, col, 1)}
                                            >
                                                <span className="m-badge m-get">GET</span>
                                                <span className="m-path">/{col}/1</span>
                                            </button>
                                            <button
                                                className={`ep-pill post ${selectedEndpoint === `POST /${col}` ? 'active' : ''}`}
                                                onClick={() => triggerSimulatedRequest('POST', `/${col}`, col)}
                                            >
                                                <span className="m-badge m-post">POST</span>
                                                <span className="m-path">/{col}</span>
                                            </button>
                                            <button
                                                className={`ep-pill put ${selectedEndpoint === `PUT /${col}/1` ? 'active' : ''}`}
                                                onClick={() => triggerSimulatedRequest('PUT', `/${col}/1`, col, 1)}
                                            >
                                                <span className="m-badge m-put">PUT</span>
                                                <span className="m-path">/{col}/1</span>
                                            </button>
                                            <button
                                                className={`ep-pill delete ${selectedEndpoint === `DELETE /${col}/1` ? 'active' : ''}`}
                                                onClick={() => triggerSimulatedRequest('DELETE', `/${col}/1`, col, 1)}
                                            >
                                                <span className="m-badge m-delete">DEL</span>
                                                <span className="m-path">/{col}/1</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Console Log Panel */}
                        <div className="playground-console">
                            <div className="console-header">
                                <span>Output Console</span>
                                {consoleOutput && (
                                    <span className={`console-status ${consoleOutput.status.includes('200') || consoleOutput.status.includes('201') ? 'text-success' : 'text-danger'}`}>
                                        {consoleOutput.status}
                                    </span>
                                )}
                            </div>
                            <div className="console-body">
                                {consoleLoading ? (
                                    <div className="console-loader">
                                        <div className="loader sm" />
                                        <span>Fetching mock resources...</span>
                                    </div>
                                ) : consoleOutput ? (
                                    <div className="console-response">
                                        <div className="console-meta text-xs">
                                            <div><span className="text-muted">Request URL:</span> <code className="text-accent">{consoleOutput.url}</code></div>
                                            <div><span className="text-muted">Method:</span> <code className="text-white">{consoleOutput.method}</code></div>
                                        </div>
                                        <pre className="console-json-output">
                                            {renderJSONHighlight(consoleOutput.body)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="console-empty">
                                        <p>Select an endpoint pill above to execute a simulated REST command.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="landing-features">
                <div className="section-header text-center">
                    <span className="pill-badge">Feature Packed</span>
                    <h2>Engineered for Developers</h2>
                    <p className="section-description">
                        Everything you need to speed up backend prototyping, testing suites, and frontend application development.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feat-icon-box text-accent">
                            <HiOutlineLightningBolt />
                        </div>
                        <h3>Instant CRUD Endpoints</h3>
                        <p>No schemas, no setups. Simply upload your raw JSON arrays and immediately obtain RESTful URLs capable of executing lists, filters, additions, and updates.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feat-icon-box text-success">
                            <HiOutlineTerminal />
                        </div>
                        <h3>Interactive Web Tester</h3>
                        <p>Test and debug routes using our integrated dashboard tool. Modify route options, custom request headers, and payloads before integrating them into your client applications.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feat-icon-box text-warning">
                            <HiOutlineDatabase />
                        </div>
                        <h3>Real-time Analytics</h3>
                        <p>Keep track of every single hit to your hosted API. Inspect methods, request headers, payload contents, response status codes, and exact timestamps on our logs panel.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feat-icon-box text-error">
                            <HiOutlineShieldCheck />
                        </div>
                        <h3>API Key Verification</h3>
                        <p>Secure your mock endpoints from unwanted traffic. Every project is secured by a unique, rotatable API key. Reset the keys instantly with one click if leaked.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feat-icon-box text-info">
                            <HiOutlineCode />
                        </div>
                        <h3>Catppuccin styling</h3>
                        <p>Designed with premium dark visual semantics, providing an eye-strain free environment for midnight developers using our hosted developer tooling.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feat-icon-box text-purple">
                            <HiOutlineLightningBolt />
                        </div>
                        <h3>CORS out of the box</h3>
                        <p>Skip local setup issues. Our service automatically resolves CORS headers, making the mock endpoints instantly fetchable from browser hosts or local environments.</p>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="landing-steps">
                <div className="section-header text-center">
                    <span className="pill-badge font-mono">3 Simple Steps</span>
                    <h2>Zero Configuration Required</h2>
                </div>

                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <h3>Define Mock Schema</h3>
                        <p>Input a JSON structure containing lists of items representing users, products, or logs. We process individual tables automatically.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h3>Fetch public endpoint</h3>
                        <p>Copy the secure generated URL using your secure API key. The routing framework supports public endpoints with REST structures.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h3>Integrate and code</h3>
                        <p>Feed endpoints directly into React hooks, postman suites, or test units. Enjoy a fully decoupled backend development cycle.</p>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="landing-pricing">
                <div className="section-header text-center">
                    <span className="pill-badge">SaaS Pricing</span>
                    <h2>Choose Your Tier</h2>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h4 className="tier-name">Hobby Developer</h4>
                        <div className="price">
                            <span className="currency">$</span>
                            <span className="amount">0</span>
                            <span className="period">/ month</span>
                        </div>
                        <p className="tier-description">Perfect for learning, prototyping, and small projects.</p>
                        <ul className="pricing-features">
                            <li><HiOutlineCheck className="feat-check" /> 3 Hosted Projects</li>
                            <li><HiOutlineCheck className="feat-check" /> 500 requests / week limit</li>
                            <li><HiOutlineCheck className="feat-check" /> Full REST CRUD engines</li>
                            <li><HiOutlineCheck className="feat-check" /> Standard request logging (50 entries)</li>
                            <li><HiOutlineCheck className="feat-check" /> API key security</li>
                        </ul>
                        {user ? (
                            <Link to="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary">Sign Up Free</Link>
                        )}
                    </div>

                    <div className="pricing-card premium">
                        <div className="premium-badge">Most Popular</div>
                        <h4 className="tier-name">Professional Developer</h4>
                        <div className="price">
                            <span className="currency">$</span>
                            <span className="amount">9</span>
                            <span className="period">/ month</span>
                        </div>
                        <p className="tier-description">For professional freelancers and fast-paced developer teams.</p>
                        <ul className="pricing-features">
                            <li><HiOutlineCheck className="feat-check" /> Unlimited Projects</li>
                            <li><HiOutlineCheck className="feat-check" /> 50,000 requests / week limit</li>
                            <li><HiOutlineCheck className="feat-check" /> Full REST CRUD engines</li>
                            <li><HiOutlineCheck className="feat-check" /> Extended logs (1,000 entries)</li>
                            <li><HiOutlineCheck className="feat-check" /> Webhooks on CRUD events <span className="badge-new">NEW</span></li>
                            <li><HiOutlineCheck className="feat-check" /> Priority support</li>
                        </ul>
                        <button className="btn btn-primary btn-disabled" disabled>
                            Coming Soon
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="landing-faq">
                <div className="section-header text-center">
                    <span className="pill-badge">Got Questions?</span>
                    <h2>Frequently Asked Questions</h2>
                </div>

                <div className="faq-container">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className={`faq-item ${faqOpen[idx] ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => toggleFaq(idx)}>
                                <span>{faq.q}</span>
                                {faqOpen[idx] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                            </button>
                            <div className="faq-answer">
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CALL TO ACTION BOTTOM */}
            <section className="landing-cta">
                <div className="cta-container">
                    <h2>Stop Waiting for the Backend.</h2>
                    <p>Join developers mock-testing their APIs without writing database models, servers, or routes.</p>
                    <div className="cta-buttons">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg glow-effect">
                                Go to Your Dashboard
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-lg glow-effect">
                                Create Your First Mock Now
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <HiOutlineCode className="brand-icon" />
                        <span>MockAPI</span>
                    </div>
                    <p className="footer-tagline">
                        Instant hosted REST mocks. Accelerate your developer loops.
                    </p>
                    <div className="footer-links">
                        <a href="#features">Features</a>
                        <a href="#playground">Playground</a>
                        <a href="#faq">FAQ</a>
                        <Link to="/login">Sign In</Link>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} MockAPI. All rights reserved. Crafted for modern engineers.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
