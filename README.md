# Project - Github Analytics
This project is conducted for the course "TWEB-2017", at HEIG-VD, Switzerland.

* Teacher: Olivier Liechti.
* Authors: Ludovic Delafontaine & Michela Zucca.

## What is this
This project proposes to analyze a GitHub repository, especially on issues management.
	
* Time analysis of opened and closed issues.
* Enhancement of the three most active users on closing issues.
* Enhancement of the three most active users on opening isusses.
	
The three aspects are represented throught graphics and tables.
	
The information about the users is deliberately hidden in parts to avoid any competition. The only objective is mutal help and encouragement.
	
## Why is this
We wanted to create this tool to encourage people to improve their product by the following points:

We think that issues are a good measure to the activity and the progress of a project.

* People who open issues want to see new features in the product they use. 
* People who close issues and add new features to the product.

We think that issues should be opened. This proves the activity and contininous integration of the product as people want to see new features and people implement them.

## How is this
For this project, we used several librairies and technologies.
 
Client side:
* [SB Admin 2](https://startbootstrap.com/template-overviews/sb-admin-2/) for the Bootstrap template.
* [Chart.js](http://www.chartjs.org/) to display the infomations with graphics.
* [Oboe.js](http://oboejs.com/) to retreive data from the server and display them as soon as new data are available.

Server side:
* [Node.js](https://nodejs.org/) for the server runtime engine.
* [Express](http://expressjs.com/) for the WEB server.
* [GitHub API](https://developer.github.com/v3/) to get the data from GitHub.
* [SuperAgent](https://github.com/visionmedia/superagent) to query GitHub's API easily.
* [Mocha](https://mochajs.org/) for the unit tests.
* [Chai](http://chaijs.com/) as an assertion library used with Mocha

On both side:
* [ESLint](https://eslint.org/) for quality code control.

## Live testing
You can test the entire application [here](https://heig-vd-tweb2017.github.io/client/). Feel free to test it !

## Client's aspects
For client's aspects, we encourage you to visit the associated repository [here](https://github.com/heig-vd-tweb2017/client).

## Server's aspects
The server is in charge of retrieving the information from the desired GitHub repository. The server side is broken down in two big parts, the agent and the server:

* The role of the agent: retrieve data about the repo via the GitHub's API. Processing of received data. The data is processed and transmitted as and when.

* The role of the server: intermediary between the agent and the client. It receives the client's request and uses the agent to retrieve the data to be sent back to the client.

## Install, build and tests
You can install all the Node.js dependencies by using the following command in the cloned directory:

```
npm install
```

You can then use the following commands to build and test the application:

```
npm run lint  # Runs the ESLint linter for code quality control
npm run test  # Runs the Mocha framework for testing
npm run build # Runs the 'lint' and 'test' scripts
```

## Deployment

### Local deployment
To use the application locally, you need to create the following file in `src/github-credentials.json` containing the username and token:


```
{
     "username": "GitHub's username"
     "token": "generated token from GitHub"
} 
```

Then, you need to un/comment the right part of `src/index.js` to use the application locally. You might want to edit the port to use.

### Online deployment (Heroku)
To deploy the application online, on Heroku for example, you need to set the following enviroment variable:

* `PORT`: The port to use for the application
* `USERNAME`: The GitHub's username
* `TOKEN`: The token associated with the `USERNAME`

Then you need to launch the application on Heroku. You can find information to deploy an application on Heroku [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

### More informations
You can find more information on GitHub authentication [here](https://developer.github.com/v3/auth/).