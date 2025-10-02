// Get Express and ReadFile and Path:
const express = require('express');
const { readFile } = require('fs').promises;
const path = require('path');
// Get app:
const app = express();

// Handle subdomains:
var subdomains = [];
app.use((request, response, next) => {
    let parts = request.hostname.split('.');
    response.send(`<p>${JSON.stringify(parts)}</p>`);
    next();
});

// Handle static files:
app.use('/', express.static(path.join(__dirname + '/public')));

// Handle page not found:
app.use((request, response) => {
    response.status(404).send('<h1 style="font-family: monospace, sans-serif;">Status: 404. Page not found.</h1>');
});

// Start listening on port:
app.listen(process.env.PORT || 3000, (err) => {
    if (err) {
        console.log(err);
    }
});