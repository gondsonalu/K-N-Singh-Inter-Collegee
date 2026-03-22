import fetch from 'node-fetch';

async function checkHealth() {
  const endpoints = [
    '/api/health',
    '/api/home-highlights',
    '/api/notices',
    '/api/gallery',
    '/api/enquiries'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Checking ${endpoint}...`);
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`SUCCESS: ${endpoint} returned ${Array.isArray(data) ? data.length : 'object'} items.`);
        if (endpoint === '/api/health') {
          console.log('Environment:', JSON.stringify(data.environment, null, 2));
        }
      } else {
        console.error(`FAILED: ${endpoint} returned status ${response.status}`);
        const text = await response.text();
        console.error('Response:', text);
      }
    } catch (error) {
      console.error(`ERROR: ${endpoint} failed:`, error);
    }
    console.log('---');
  }
}

checkHealth();
