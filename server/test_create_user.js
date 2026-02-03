const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzY5ODM4MzgyLCJleHAiOjE3NzI0MzAzODJ9.A9HU0YMmDWb00dHjQcD6_RMQaooRTGmX4NvmndwFdas';

const data = JSON.stringify({
    name: 'New Test User',
    email: 'newtest@example.com',
    role: 'User',
    plan: 'Free',
    status: 'Active'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
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

req.write(data);
req.end();
