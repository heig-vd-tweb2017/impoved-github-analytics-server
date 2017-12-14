const Agent = require('./agent.js');
const Server = require('./server.js');

// LOCAL DEPLOYMENT
const credentials = require('../src/github-credentials.json');

const port = 5050;

const { token } = credentials;

// ONLINE DEPLOYMENT
/*
const port = process.env.PORT;

const username = process.env.USERNAME;
const token = process.env.TOKEN;

*/
const agent = new Agent('https://api.github.com/graphql', token);
const server = new Server(port, agent);

server.start();
