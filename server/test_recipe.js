const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY5ODM0MjY2LCJleHAiOjE3NzI0MjYyNjZ9.41w9bmVPB9-BXL6tiTUL-a0mWJnJP7r5ItCxn3AMnoA';

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/recipes',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
