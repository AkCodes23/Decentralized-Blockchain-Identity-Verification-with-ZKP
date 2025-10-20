import React, { useEffect, useState } from 'react';
import api from '../api/client';

const SystemStatus = () => {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [h, s] = await Promise.all([
          api.get('/api/health').catch(() => null),
          api.get('/api/status').catch(() => null)
        ]);
        if (!mounted) return;
        setHealth(h?.data || null);
        setStatus(s?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load system status');
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="card" style={{ marginTop: '10px' }}>
      <h3>System Status</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <strong>Backend:</strong> {health ? 'OK' : 'Unavailable'}
        </div>
        {health && (
          <div>
            <strong>Version:</strong> {health.version}
          </div>
        )}
        {status && (
          <>
            <div>
              <strong>Identities:</strong> {status.statistics?.identities ?? '-'}
            </div>
            <div>
              <strong>Credentials:</strong> {status.statistics?.credentials ?? '-'}
            </div>
            <div>
              <strong>Verifications:</strong> {status.statistics?.verificationRequests ?? '-'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;


