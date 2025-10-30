// Get Express and File System and Path and the Port:
const e = require('express');
const express = require('express');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
//const { readFile } = require('fs').promises;
const path = require('path');
// Get app:
const app = express();

// 404 error function:
function noPage(request, response, next) {
    response.status(404).send('<h1 style="font-family: monospace, sans-serif;">Status: 404. Page not found.</h1>');
}

// Handle subdomains (api.):
var subdomains = [];
app.use((request, response, next) => {
    let subdomain = request.hostname.split('.');
    if (subdomain.at(-1) !== 'localhost') subdomain.pop();
    if (subdomain.length > 1) {
        subdomain = subdomain[0];
    } else {
        subdomain = undefined;
    }
    if (subdomain !== undefined && subdomain !== 'node_modules') {
        let filePath = path.join(__dirname + '/' + subdomain, request.path.substring(1).split('/')[0].split('.')[0] + '.js');
        if (fs.existsSync(filePath)) {
            require(filePath)(request, response, next);
        } else {
            noPage(request, response, next);
        }
    } else {
        next();
    }
});

// Handle static files/the website:
//app.use('/', express.static(path.join(__dirname.slice(0, __dirname.indexOf('.') !== -1 ? __dirname.indexOf('.') : __dirname.length), 'public')));
app.use((request, response, next) => {
    let filePath = path.join(__dirname, 'public', request.path.slice(0, request.path.indexOf('.') !== -1 ? request.path.indexOf('.') : request.path.length), 'index.html');
    if (fs.existsSync(filePath)) {
        let file = fs.readFileSync(filePath, 'utf8');
        response.send(file);
    } else {
        noPage(request, response, next);
    }
});

// Handle page not found:
app.use((request, response, next) => {
    noPage(request, response);
});

// Start listening on port:
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Listening to port: ${PORT}.`);
});