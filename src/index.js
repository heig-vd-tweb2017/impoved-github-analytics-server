const Agent = require('./agent.js');
const Server = require('./server.js');

// LOCAL DEPLOYMENT
/*const credentials = require('../src/github-credentials.json');

const port = 5050;

const { username, token } = credentials;

// ONLINE DEPLOYMENT
/*
const port = process.env.PORT;

const username = process.env.USERNAME;
const token = process.env.TOKEN;

*/
const agent = new Agent('https://api.github.com/graphql', '68ca8fe767ecb03b81eda1035b5d5ea68114d12b');
agent.getIssues('google', 'WebFundamentals', null, null, null, null);

/*
const server = new Server(port, agent);
server.start();
*/
