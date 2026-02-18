import { useState, useRef } from 'react';
import { HiOutlineUpload, HiOutlineCheck, HiOutlineExclamation } from 'react-icons/hi';

/**
 * JsonEditor — Textarea with JSON validation, pretty-print, and file upload.
 *
 * Props:
 *  - value: current JSON string
 *  - onChange: callback when JSON text changes
 */
export default function JsonEditor({ value, onChange }) {
    const [isValid, setIsValid] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const validate = (text) => {
        try {
            if (text.trim() === '') {
                setIsValid(true);
                setErrorMsg('');
                return;
            }
            JSON.parse(text);
            setIsValid(true);
            setErrorMsg('');
        } catch (err) {
            setIsValid(false);
            setErrorMsg(err.message);
        }
    };

    const handleChange = (e) => {
        const text = e.target.value;
        onChange(text);
        validate(text);
    };

    const handlePrettyPrint = () => {
        try {
            const parsed = JSON.parse(value);
            const pretty = JSON.stringify(parsed, null, 2);
            onChange(pretty);
            setIsValid(true);
            setErrorMsg('');
        } catch {
            // Already invalid — do nothing
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            onChange(text);
            validate(text);
        };
        reader.readAsText(file);
    };

    return (
        <div className="json-editor">
            <div className="json-editor-toolbar">
                <div className="json-status">
                    {value.trim() && (
                        isValid ? (
                            <span className="json-valid"><HiOutlineCheck /> Valid JSON</span>
                        ) : (
                            <span className="json-invalid"><HiOutlineExclamation /> {errorMsg}</span>
                        )
                    )}
                </div>
                <div className="json-actions">
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handlePrettyPrint}
                        disabled={!isValid || !value.trim()}
                    >
                        Pretty Print
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <HiOutlineUpload /> Upload JSON
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            <textarea
                className={`json-textarea ${!isValid ? 'invalid' : ''}`}
                value={value}
                onChange={handleChange}
                placeholder={`{
  "users": [
    { "name": "Alice", "email": "alice@example.com" },
    { "name": "Bob", "email": "bob@example.com" }
  ],
  "posts": [
    { "title": "Hello World", "body": "My first post" }
  ]
}`}
                spellCheck={false}
            />
        </div>
    );
}
