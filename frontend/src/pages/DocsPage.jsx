import { useState } from 'react';
import { 
    HiOutlineBookOpen, 
    HiOutlineTerminal, 
    HiOutlineKey, 
    HiOutlineLockClosed, 
    HiOutlineShieldCheck, 
    HiOutlineDocumentText, 
    HiOutlineClipboardCopy,
    HiOutlineCheck,
    HiOutlineChevronRight,
    HiOutlineArrowUp
} from 'react-icons/hi';

export default function DocsPage() {
    // Code generator state
    const [apiKey, setApiKey] = useState('sk_live_a94b3c7d8e9f');
    const [collection, setCollection] = useState('users');
    const [recordId, setRecordId] = useState('1');
    const [activeLang, setActiveLang] = useState('fetch');
    const [activeMethod, setActiveMethod] = useState('GET_LIST');
    const [copied, setCopied] = useState(false);

    // Sidebar active section highlighting helper (simple scroll-to-id handles actual nav)
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 90; // Navbar height + margin
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Code generator snippet builder
    const getCodeSnippet = () => {
        const baseUrl = 'http://localhost:5000/api';
        const cleanApiKey = apiKey.trim() || 'API_KEY';
        const cleanCollection = collection.trim() || 'collection';
        const cleanId = recordId.trim() || 'id';

        const endpoints = {
            GET_LIST: {
                url: `${baseUrl}/${cleanApiKey}/${cleanCollection}`,
                payload: null,
                method: 'GET'
            },
            GET_DETAIL: {
                url: `${baseUrl}/${cleanApiKey}/${cleanCollection}/${cleanId}`,
                payload: null,
                method: 'GET'
            },
            POST: {
                url: `${baseUrl}/${cleanApiKey}/${cleanCollection}`,
                payload: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' }, null, 2),
                method: 'POST'
            },
            PUT: {
                url: `${baseUrl}/${cleanApiKey}/${cleanCollection}/${cleanId}`,
                payload: JSON.stringify({ name: 'Jane Smith' }, null, 2),
                method: 'PUT'
            },
            DELETE: {
                url: `${baseUrl}/${cleanApiKey}/${cleanCollection}/${cleanId}`,
                payload: null,
                method: 'DELETE'
            }
        };

        const current = endpoints[activeMethod];

        if (activeLang === 'curl') {
            if (current.method === 'GET' || current.method === 'DELETE') {
                return `curl -X ${current.method} "${current.url}" \\
  -H "Accept: application/json"`;
            } else {
                return `curl -X ${current.method} "${current.url}" \\
  -H "Content-Type: application/json" \\
  -d '${current.payload.replace(/\n/g, '\n  ')}'`;
            }
        }

        if (activeLang === 'fetch') {
            if (current.method === 'GET' || current.method === 'DELETE') {
                return `fetch("${current.url}", {
  method: "${current.method}",
  headers: {
    "Accept": "application/json"
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));`;
            } else {
                return `fetch("${current.url}", {
  method: "${current.method}",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${current.payload.replace(/\n/g, '\n  ')})
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));`;
            }
        }

        if (activeLang === 'axios') {
            if (current.method === 'GET' || current.method === 'DELETE') {
                return `import axios from 'axios';

axios.${current.method.toLowerCase()}("${current.url}")
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });`;
            } else {
                return `import axios from 'axios';

const payload = ${current.payload.replace(/\n/g, '\n')};

axios.${current.method.toLowerCase()}("${current.url}", payload)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error("Error saving data:", error);
  });`;
            }
        }

        if (activeLang === 'python') {
            if (current.method === 'GET' || current.method === 'DELETE') {
                return `import requests

url = "${current.url}"
response = requests.${current.method.toLowerCase()}(url)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())`;
            } else {
                return `import requests

url = "${current.url}"
payload = ${current.payload.replace(/\n/g, '\n')}

headers = {"Content-Type": "application/json"}
response = requests.${current.method.toLowerCase()}(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())`;
            }
        }

        return '';
    };

    const handleCopyCode = async () => {
        const code = getCodeSnippet();
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="docs-page page">
            <div className="docs-layout">
                {/* STICKY SIDEBAR NAVIGATION */}
                <aside className="docs-sidebar">
                    <nav className="docs-nav-menu">
                        <div className="docs-nav-section">
                            <span className="docs-nav-title">Welcome</span>
                            <button className="docs-nav-item" onClick={() => scrollToSection('intro')}>Introduction</button>
                            <button className="docs-nav-item" onClick={() => scrollToSection('getting-started')}>Getting Started</button>
                        </div>
                        <div className="docs-nav-section">
                            <span className="docs-nav-title">API Reference</span>
                            <button className="docs-nav-item" onClick={() => scrollToSection('api-reference')}>Overview</button>
                            <button className="docs-nav-item indent" onClick={() => scrollToSection('api-list')}>GET List</button>
                            <button className="docs-nav-item indent" onClick={() => scrollToSection('api-detail')}>GET Detail</button>
                            <button className="docs-nav-item indent" onClick={() => scrollToSection('api-create')}>POST Create</button>
                            <button className="docs-nav-item indent" onClick={() => scrollToSection('api-update')}>PUT Update</button>
                            <button className="docs-nav-item indent" onClick={() => scrollToSection('api-delete')}>DELETE Remove</button>
                        </div>
                        <div className="docs-nav-section">
                            <span className="docs-nav-title">Platform Features</span>
                            <button className="docs-nav-item" onClick={() => scrollToSection('feat-keys')}>API Key Management</button>
                            <button className="docs-nav-item" onClick={() => scrollToSection('feat-limits')}>Weekly Rate Limits</button>
                            <button className="docs-nav-item" onClick={() => scrollToSection('feat-logs')}>Request Logging</button>
                        </div>
                        <div className="docs-nav-section">
                            <span className="docs-nav-title">Guides</span>
                            <button className="docs-nav-item" onClick={() => scrollToSection('code-generator')}>Code Integration</button>
                        </div>
                    </nav>
                </aside>

                {/* DOCUMENTATION CONTENT AREA */}
                <main className="docs-content">
                    <header className="docs-header">
                        <div className="docs-badge">
                            <HiOutlineBookOpen className="docs-badge-icon" />
                            <span>Developer Manual</span>
                        </div>
                        <h1>Developer Documentation</h1>
                        <p className="lead">Learn how to create mock REST APIs, authenticate calls, inspect logs, and integrate MockAPI into your client code loops.</p>
                    </header>

                    {/* INTRODUCTION SECTION */}
                    <section id="intro" className="docs-section">
                        <h2>Introduction</h2>
                        <p>
                            MockAPI is a cloud-hosted developer tool (PaaS) designed to eliminate frontend development bottlenecks. Instead of waiting for backend engineering teams to build database models, write routers, and spin up server instances, MockAPI enables you to prototype right away by creating custom, hosted REST APIs instantly.
                        </p>
                        <p>
                            By uploading or pasting your client data schema formatted as standard JSON, our mocking engine immediately establishes secure endpoints with full CRUD (Create, Read, Update, Delete) capability.
                        </p>
                    </section>

                    {/* GETTING STARTED SECTION */}
                    <section id="getting-started" className="docs-section">
                        <h2>Getting Started</h2>
                        <p>Follow these three steps to generate your first mock database endpoint in less than a minute:</p>
                        
                        <div className="docs-steps-grid">
                            <div className="docs-step-card">
                                <div className="step-badge">1</div>
                                <h4>Sign In via OTP</h4>
                                <p>Provide your developer email on our login page. We will dispatch a 6-digit numeric verification code. No password creation or management required.</p>
                            </div>
                            <div className="docs-step-card">
                                <div className="step-badge">2</div>
                                <h4>Define JSON Structure</h4>
                                <p>Click **New Project** on your dashboard. Paste a valid JSON object. Ensure each collection key contains an array of objects (representing table rows).</p>
                            </div>
                            <div className="docs-step-card">
                                <div className="step-badge">3</div>
                                <h4>Fetch Public URL</h4>
                                <p>Your endpoints are hosted instantly on our CORS-ready base server. Read the secure API key and start hitting endpoints in your local codebase.</p>
                            </div>
                        </div>
                    </section>

                    {/* API REFERENCE OVERVIEW */}
                    <section id="api-reference" className="docs-section">
                        <h2>API Specifications</h2>
                        <p>
                            Every key in your JSON input mapping containing an array of records generates five distinct RESTful mock routes. The route syntax is structured as follows:
                        </p>
                        <div className="api-url-info-box">
                            <span className="info-box-label">Base URL Format</span>
                            <code>http://localhost:5000/api/<span className="text-accent">&#123;apiKey&#125;</span>/<span className="text-success">&#123;collection&#125;</span></code>
                        </div>

                        {/* GET LIST ENDPOINT */}
                        <div id="api-list" className="api-route-detail">
                            <div className="route-header">
                                <span className="method-badge method-get">GET</span>
                                <code className="route-path">/api/:apiKey/:collection</code>
                            </div>
                            <p className="route-desc">Fetches all records contained inside the specified collection.</p>
                            <div className="route-meta">
                                <h5>Query Parameters:</h5>
                                <p className="text-muted text-xs">No query filtering supported currently (returns full array list).</p>
                                <h5>Simulated Response (200 OK):</h5>
                                <pre className="code-block">
{`[
  { "id": 1, "name": "Alice Vance", "role": "Lead Architect" },
  { "id": 2, "name": "Bob Miller", "role": "Frontend Engineer" }
]`}
                                </pre>
                            </div>
                        </div>

                        {/* GET DETAIL ENDPOINT */}
                        <div id="api-detail" className="api-route-detail">
                            <div className="route-header">
                                <span className="method-badge method-get">GET</span>
                                <code className="route-path">/api/:apiKey/:collection/:id</code>
                            </div>
                            <p className="route-desc">Locates and fetches a single record based on its unique `id` or `_id` field.</p>
                            <div className="route-meta">
                                <h5>Path parameters:</h5>
                                <ul>
                                    <li><code>id</code> (required): The unique identifier of the target record.</li>
                                </ul>
                                <h5>Response (200 OK):</h5>
                                <pre className="code-block">
{`{ "id": 1, "name": "Alice Vance", "role": "Lead Architect" }`}
                                </pre>
                                <h5>Error Response (404 Not Found):</h5>
                                <pre className="code-block">
{`{ "success": false, "error": "Record with ID 999 not found" }`}
                                </pre>
                            </div>
                        </div>

                        {/* POST CREATE ENDPOINT */}
                        <div id="api-create" className="api-route-detail">
                            <div className="route-header">
                                <span className="method-badge method-post">POST</span>
                                <code className="route-path">/api/:apiKey/:collection</code>
                            </div>
                            <p className="route-desc">Inserts a new record into the collection database. The engine automatically appends a unique ID sequence.</p>
                            <div className="route-meta">
                                <h5>Request Headers:</h5>
                                <code>Content-Type: application/json</code>
                                <h5 className="mt-2">Request Body (JSON object):</h5>
                                <pre className="code-block">
{`{
  "name": "Charlie Dev",
  "role": "DevOps Specialist"
}`}
                                </pre>
                                <h5>Response (201 Created):</h5>
                                <pre className="code-block">
{`{
  "id": 3,
  "name": "Charlie Dev",
  "role": "DevOps Specialist"
}`}
                                </pre>
                            </div>
                        </div>

                        {/* PUT UPDATE ENDPOINT */}
                        <div id="api-update" className="api-route-detail">
                            <div className="route-header">
                                <span className="method-badge method-put">PUT</span>
                                <code className="route-path">/api/:apiKey/:collection/:id</code>
                            </div>
                            <p className="route-desc">Updates specific fields inside an existing record. The existing ID remains locked and unchanged.</p>
                            <div className="route-meta">
                                <h5>Request Headers:</h5>
                                <code>Content-Type: application/json</code>
                                <h5 className="mt-2">Request Body (JSON fields to modify):</h5>
                                <pre className="code-block">
{`{
  "role": "Principal DevOps"
}`}
                                </pre>
                                <h5>Response (200 OK):</h5>
                                <pre className="code-block">
{`{
  "id": 3,
  "name": "Charlie Dev",
  "role": "Principal DevOps"
}`}
                                </pre>
                            </div>
                        </div>

                        {/* DELETE REMOVE ENDPOINT */}
                        <div id="api-delete" className="api-route-detail">
                            <div className="route-header">
                                <span className="method-badge method-delete">DELETE</span>
                                <code className="route-path">/api/:apiKey/:collection/:id</code>
                            </div>
                            <p className="route-desc">Deletes the target record permanently from the collection array list.</p>
                            <div className="route-meta">
                                <h5>Response (200 OK):</h5>
                                <pre className="code-block">
{`{
  "success": true,
  "data": {}
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* PLATFORM FEATURES */}
                    <section id="features-detail" className="docs-section">
                        <h2>Platform Architecture & Features</h2>

                        {/* API KEY SECURITY */}
                        <div id="feat-keys" className="feature-detail-block">
                            <div className="feat-block-title">
                                <HiOutlineKey className="feat-icon text-accent" />
                                <h3>API Key Management</h3>
                            </div>
                            <p>
                                Every MockAPI project contains a distinct UUIDv4 API key which must be included in the URL paths. This key prevents public scanners from hitting or poisoning your mock database collections.
                            </p>
                            <p>
                                If your key is accidentally leaked in a public frontend commit, navigate to your **Project Settings** dashboard, click **Reset Key**, and confirm the warning modal. A new key is generated instantly. The old key will immediately reject incoming calls with a `401 Unauthorized` header while keeping your existing request limits intact.
                            </p>
                        </div>

                        {/* RATE LIMITS */}
                        <div id="feat-limits" className="feature-detail-block">
                            <div className="feat-block-title">
                                <HiOutlineShieldCheck className="feat-icon text-success" />
                                <h3>Weekly Rate Limits</h3>
                            </div>
                            <p>
                                To ensure high availability across all accounts, free developer mock servers are configured with a limit of **500 requests per week**.
                            </p>
                            <p>
                                The request counter tracks usage on a rolling 7-day basis from the project creation or reset timestamps. If you exceed the quota limit, our API servers will return a standard `429 Too Many Requests` status code. You can inspect your current weekly progress bar details on the project dashboard widget.
                            </p>
                        </div>

                        {/* REQUEST LOGGING */}
                        <div id="feat-logs" className="feature-detail-block">
                            <div className="feat-block-title">
                                <HiOutlineTerminal className="feat-icon text-warning" />
                                <h3>Request Logging</h3>
                            </div>
                            <p>
                                MockAPI tracks and logs all requests hitting your endpoints. The project details page displays a tabular log viewer showcasing:
                            </p>
                            <ul>
                                <li><strong>Request Methods</strong>: GET, POST, PUT, DELETE.</li>
                                <li><strong>Target Paths</strong>: e.g. `/users/1`.</li>
                                <li><strong>Status Codes</strong>: e.g. `201 Created` or `404 Not Found`.</li>
                                <li><strong>Incoming Payloads</strong>: Full JSON request body sent by your application.</li>
                                <li><strong>Timestamps</strong>: Exact date and millisecond times.</li>
                            </ul>
                            <p>
                                Logs are capped at the most recent 100 entries per project.
                            </p>
                        </div>
                    </section>

                    {/* CODE GENERATOR & INTEGRATION */}
                    <section id="code-generator" className="docs-section">
                        <h2>Client Code Integration</h2>
                        <p>Use our interactive helper to generate code snippets configured with your exact collection and API key details:</p>

                        <div className="code-gen-widget">
                            {/* Inputs form */}
                            <div className="code-gen-inputs">
                                <div className="form-group flex-1">
                                    <label>1. API Key</label>
                                    <input 
                                        type="text" 
                                        className="form-input text-xs font-mono" 
                                        value={apiKey} 
                                        onChange={(e) => setApiKey(e.target.value)} 
                                        placeholder="e.g. sk_live_a94b3..."
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>2. Collection Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input text-xs font-mono" 
                                        value={collection} 
                                        onChange={(e) => setCollection(e.target.value)}
                                        placeholder="e.g. products"
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>3. Record ID</label>
                                    <input 
                                        type="text" 
                                        className="form-input text-xs font-mono" 
                                        value={recordId} 
                                        onChange={(e) => setRecordId(e.target.value)}
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            {/* Method Selector Tabs */}
                            <div className="code-gen-methods">
                                <button className={`tab-sm ${activeMethod === 'GET_LIST' ? 'active' : ''}`} onClick={() => setActiveMethod('GET_LIST')}>GET List</button>
                                <button className={`tab-sm ${activeMethod === 'GET_DETAIL' ? 'active' : ''}`} onClick={() => setActiveMethod('GET_DETAIL')}>GET Detail</button>
                                <button className={`tab-sm ${activeMethod === 'POST' ? 'active' : ''}`} onClick={() => setActiveMethod('POST')}>POST Insert</button>
                                <button className={`tab-sm ${activeMethod === 'PUT' ? 'active' : ''}`} onClick={() => setActiveMethod('PUT')}>PUT Update</button>
                                <button className={`tab-sm ${activeMethod === 'DELETE' ? 'active' : ''}`} onClick={() => setActiveMethod('DELETE')}>DELETE Remove</button>
                            </div>

                            {/* Languages tabs */}
                            <div className="code-gen-langs">
                                <button className={`lang-tab ${activeLang === 'fetch' ? 'active' : ''}`} onClick={() => setActiveLang('fetch')}>JS Fetch</button>
                                <button className={`lang-tab ${activeLang === 'axios' ? 'active' : ''}`} onClick={() => setActiveLang('axios')}>Axios</button>
                                <button className={`lang-tab ${activeLang === 'python' ? 'active' : ''}`} onClick={() => setActiveLang('python')}>Python Requests</button>
                                <button className={`lang-tab ${activeLang === 'curl' ? 'active' : ''}`} onClick={() => setActiveLang('curl')}>cURL</button>
                            </div>

                            {/* Snippet Code block */}
                            <div className="code-gen-display">
                                <div className="display-header">
                                    <span className="text-muted text-xs font-mono">{activeLang === 'curl' ? 'bash' : activeLang === 'python' ? 'python' : 'javascript'}</span>
                                    <button 
                                        className="btn btn-sm btn-secondary copy-btn-widget" 
                                        onClick={handleCopyCode}
                                        title="Copy code to clipboard"
                                    >
                                        {copied ? (
                                            <>
                                                <HiOutlineCheck className="text-success" />
                                                <span className="text-success">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineClipboardCopy />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <pre className="snippet-block">
                                    <code>{getCodeSnippet()}</code>
                                </pre>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            
            {/* Scroll back to top button */}
            <button 
                className="scroll-top-btn" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Scroll back to top"
            >
                <HiOutlineArrowUp />
            </button>
        </div>
    );
}
