const Agent = require('./agent.js');
const Server = require('./server.js');
const Database = require('./database.js');

const port = process.env.PORT;
const token = process.env.TOKEN;
const mongodbUri = process.env.MONGODB_URI;

const agent = new Agent('https://api.github.com/graphql', token);
const database = new Database(mongodbUri);
const server = new Server(port, agent, database);

server.start();
