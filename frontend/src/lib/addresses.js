// frontend/src/lib/addresses.js
export async function loadAddresses() {
  // 1) Try backend file
  try {
    const res = await fetch('http://localhost:5000/contract-addresses.json', { mode: 'cors' });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {
    // ignore and try fallbacks
  }

  // 2) Try a public copy served by the frontend (if you place one in /public)
  try {
    const res = await fetch('/contract-addresses.json');
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {
    // ignore and try local import
  }

  // 3) Fallback: import the local file inside src (you already have it)
  try {
    const mod = await import('../contract-addresses.json');
    // CRA / Vite expose JSON modules under .default
    return mod.default || mod;
  } catch (err) {
    console.error('All address sources failed', err);
    throw new Error('Could not load contract addresses from any source');
  }
}