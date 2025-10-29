// Script simple para verificar que el servidor está funcionando
import http from 'http';

const options = {
  host: 'localhost',
  port: process.env.PORT || 3001,
  path: '/',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err.message);
  process.exit(1);
});

request.end();
