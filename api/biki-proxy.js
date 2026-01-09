// Vercel Serverless Function - Proxy for Biki API to bypass CORS
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { endpoint, auth } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    const API_BASE = 'https://valladolid.publicbikesystem.net/ube/mobile';
    const API_KEY = 'QopJK73RwNkwj5hfFk1cInN8BDM0pcaVC9hWYXqU';
    const DEVICE_ID = 'ec968fbf0cb2ceef';

    const headers = {
        'accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive',
        'device-id': DEVICE_ID,
        'Host': 'valladolid.publicbikesystem.net',
        'x-api-key': API_KEY,
        'user-agent': 'biki/5.35.0.8 Mozilla/5.0 (Linux; Android 12; sdk_gphone64_x86_64 Build/SE1A.220826.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36'
    };

    // Add authorization header if provided (for authenticate endpoint)
    if (auth) {
        headers['authorization'] = `Basic ${auth}`;
    }

    // Add auth token if provided (for member endpoint)
    const authToken = req.headers['x-auth-token'];
    if (authToken) {
        headers['x-auth-token'] = authToken;
        headers['accept-language'] = 'en';
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();

        // Forward the status code
        res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', message: error.message });
    }
}
