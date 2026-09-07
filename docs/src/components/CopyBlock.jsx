import React, {useEffect, useRef, useState} from 'react';

export default function CopyBlock({text, label}) {
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  const request = useRef(0);

  useEffect(() => {
    setStatus('');
    return () => {
      clearTimeout(timer.current);
      request.current += 1;
    };
  }, [text]);

  const copy = async () => {
    clearTimeout(timer.current);
    const currentRequest = ++request.current;
    try {
      await navigator.clipboard.writeText(text);
      if (currentRequest !== request.current) return;
      setStatus('Copied to clipboard.');
      timer.current = setTimeout(() => setStatus(''), 2500);
    } catch {
      if (currentRequest !== request.current) return;
      setStatus('Select the text and copy it manually.');
    }
  };

  return (
    <div className="copy-block">
      <div className="copy-block-head">
        <span>{label}</span>
        <button type="button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
          {status === 'Copied to clipboard.' ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre><code>{text}</code></pre>
      <span className="copy-block-status" role="status">{status}</span>
    </div>
  );
}
