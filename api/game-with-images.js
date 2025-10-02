module.exports = (request, response, next) => {
    response.set({
        'Content-Type': 'application/json'
    });
    response.send({ message: 'Hello, world!' });
}