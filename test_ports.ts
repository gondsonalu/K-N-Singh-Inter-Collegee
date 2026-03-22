import http from 'http';

const port = 3000;

async function testPort(port: number) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`PORT ${port}: STATUS ${res.statusCode}, BODY ${data}`);
        resolve(true);
      });
    });
    req.on('error', (err) => {
      console.log(`PORT ${port}: ERROR ${err.message}`);
      resolve(false);
    });
    req.end();
  });
}

async function run() {
  console.log(`Testing port ${port}...`);
  await testPort(port);
}

run();
