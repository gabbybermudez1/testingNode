// ---- NPM fetched packages or node js standard libraries ----
const express = require('express');
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;


// ---- Original code ----
const {db} = require('./config/database');
const {User} = require('./models/users');


const app = express();
const port = process.env.port || 8080;

app.use(bodyParser.json());

db
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.get('/', (req, res) =>{
    res.send('Home page');
});


app.get('/users', (req, res) => {
    User.findAll({attributes: ['email', 'username']})
        .then( allUsers => {
            res.send(allUsers);
        })
        .catch( error => {
            console.log('There was an error \n\n' + error);
        });
});

app.get('/compute', (req, res) => {
    console.log('Reached the compute route');
    let dataString = "";
    let pyScript = spawn('python', ['./pythonScripts/mathModule.py']);

    pyScript.stdin.write(JSON.stringify([[1,0],[0,1]]));
    pyScript.stdin.end();

    //When there is screen output(stdout) add the data
    pyScript.stdout.on('data', (data) =>{
        console.log('received some data')
        dataString += data.toString();
    });
    // upon the end of the standard output, send this as the response
    pyScript.stdout.on('end', () =>{
        console.log(dataString);
        res.send(dataString);
    });
});


app.listen(port, () => {
    console.log('Server listening on port ' + port);
});

