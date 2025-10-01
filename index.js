const express = require('express');
const { readFile } = require('fs').promises;
const path = require('path');
const app = express();
app.get('/', async (request, response) => {
    response.send(await readFile(path.join(__dirname + '/home.html'), 'utf8'));
});
app.listen(process.env.PORT || 3000, (err) => {
    if (err) {
        console.log(err);
    }
});