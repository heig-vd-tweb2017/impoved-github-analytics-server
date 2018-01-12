# Project - Improved Github Analytics
This project is conducted for the course "TWEB-2017", at HEIG-VD, Switzerland.

* Teacher: Olivier Liechti
* Authors: Ludovic Delafontaine & Michela Zucca

## Foreword
This is an improved version of the original Github Analytics project you can find [here](https://heig-vd-tweb2017.github.io/github-analytics-client). The following elements have changed or have been improved:

Client side:

* Use of [Yeoman](http://yeoman.io) to generate the folders structure
* Use of [Grunt](https://gruntjs.com/) to pack and deploy the application
* Use of [socket.io](https://socket.io/) to emit new results to the client
* Use of [AngularJS](https://angularjs.org/) for the frontend

Server side:

* Use of [Javascript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* Use of [GraphQL](http://graphql.org/) with the [GitHub API v4](https://developer.github.com/v4/)
* Use of [socket.io](https://socket.io/) to emit new results to the client
* Use of [MongoDB](https://www.mongodb.com/) to save some results to the database for future usages
* Use of [Docker Compose](https://docs.docker.com/compose/) to test the infrastructure locally

More details can be found in the `How is it` section.

## What is this
This project proposes to analyze a GitHub repository, especially on issues management:

* Time analysis of opened issues.
* Time analysis of closed issues.
* Time analysis of the ratio between opened and closed issues.
* Enhancement of the three most active users on opening issues.
* Enhancement of the three most active users on closing issues.
* Enhancement of the number of opened and closed issues.
	
These aspects are represented through graphics and tables.
	
Some information about the users is deliberately hidden: We only show the 15% of the best users in the tables in parts to avoid any competition. The only objective is mutual help and encouragement.
	
## Why is this
We wanted to create this tool to encourage people to improve their product by the following points.

We think that issues are a good measure to the activity and the progress of a project:

* People who open issues want to see bug fixes and/or new features in the product they use. 
* People who close issues fixe bugs and/or add new features to the product they use.

We think that the number of issues opened and the number of issues closed should be very similar. This proves the activity and continuous integration of the product as people want to see new features and people implement them.

## How is this
For this project, we used several librairies and technologies.

Client side:

* [ESLint](https://eslint.org/) for quality code control.
* [socket.io](https://socket.io/) to receive and send from/to the client datas in real time.
* [Moment.js](https://momentjs.com/) to manipulate times in JavaScript.
* [Chart.js](http://www.chartjs.org/) to generate the charts.

Server side:

* [ESLint](https://eslint.org/) for quality code control.
* [Node.js](https://nodejs.org/) for the server runtime engine.
* [Express](http://expressjs.com/) for the WEB server.
* [GitHub API](https://developer.github.com/v4/) to get the data from GitHub.
* [Node-Github-GraphQL](https://www.npmjs.com/package/node-github-graphql) to query the GitHub API v4 from Node.js.
* [socket.io](https://socket.io/) to receive and send from/to the client datas in real time.
* [Moment.js](https://momentjs.com/) to manipulate times in JavaScript.
* [Mocha](https://mochajs.org/) for the unit tests.
* [Chai](http://chaijs.com/) as an assertion library used with Mocha.
* [Docker Compose](https://docs.docker.com/compose/) to deploy and test the application locally.

## Live testing
You can test the entire application [here](https://heig-vd-tweb2017.github.io/improved-github-analytics-client/). Feel free to test it !

or

If you want to test the server, you can go [here](http://improved-github-analytics-srv.herokuapp.com). Have a look at the source code as well as the console output to watch the results.

## Client's aspects
For client's aspects, we encourage you to visit the associated repository [here](https://github.com/heig-vd-tweb2017/improved-github-analytics-client).

## Server's aspects
The server is in charge of retrieving the information from the desired GitHub repository. The server side is broken down in three big parts, the agent, the database and the server:

* The role of the agent: retrieve data about the repo via the GitHub's API. Processing of received data. The data is processed and transmitted as and when to the client who requested the data.
* The role of the database: when the agent has got everything from the API, a copy of the results is saved in the database to send them in the future to compare different results and relative improvements in time.
* The role of the server: intermediary between the agent, the database and the client. It receives the client's request and uses the agent to retrieve the data to be sent back to the client.

## Install, build and tests
You can install all the Node.js dependencies by using the following command in the cloned directory:

```
npm install
```

You will have the change the variables of the `test/local-development.json` to match your [generated token on GitHub for authentification](https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql) as well as the repository's information you want to use for testing:

```
{
    "port": 5151,
    "token": "CHANGE_THIS",
    "mongodbUri": "mongodb://0.0.0.0:27017/improved-github-analytics",
    "owner": "CHANGE_THIS",
    "repo": "CHANGE_THIS"
}
```

You can then use the following commands to build and test the application after starting all the containers. Look at the `Deployment part`.

```
npm run lint  # Runs the ESLint linter for code quality control
npm run test  # Runs the Mocha framework for testing
npm run build # Runs the 'lint' and 'test' scripts
```

## Deployment

### Local deployment
To test the application locally, you will need [Docker Compose](https://docs.docker.com/compose/). After that, you have to edit the file `docker-compose.yml` and edit the environment variable `TOKEN` corresponding to your [generated token on GitHub for authentification](https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql).

```
[...]
app:
    image: node:latest
    container_name: 'app'
    environment:
      - PORT=5050
      - TOKEN=CHANGE_THIS
      - MONGO_DB_HOSTNAME=mongodb:27017
[...]
```

Then you need to execute the following commands to launch the environment locally:
```
cd 'The local cloned directory of the project'
sudo dockerd # Launch the Docker daemon
sudo docker-compose up # Launch Docker Compose
```

This will launch the server locally. You might need to look at the client's `Local deployment` part for a fully working environment.

### Online deployment (Heroku)
To deploy the application online, on Heroku for example, you need to set the following environment variables:

* `PORT`: The port to use for the application
* `TOKEN`: The [generated token on GitHub for authentification](https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql)

Then you need to launch the application on Heroku. You can find information to deploy an application on Heroku [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

### More informations
You can find more information on GitHub authentication [here](https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql).