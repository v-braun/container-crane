'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pack = require('./package.json');
var crane = require('./lib/crane');

app.locals.ENV = process.env.NODE_ENV;
app.set('env', process.env.NODE_ENV);
app.set('branch', process.env.DEFAULT_BRANCH || 'master');
app.set('debug', process.env.NODE_ENV === 'development');
app.set('port', process.env.PORT || 3000);
app.set('name', pack.name);
app.set('secret', process.env.WEBHOOK_SECRET || '');

app.use(bodyParser.json());

app.post('/gogs/', (req, res) =>{
  if(crane.validate(app, req, res)) return;
  
  var url = crane.url.gogs(app, req);
  return crane.deploy(app, url, req, res);
});


app.use((req, res) => {
  res.status(404).json({error: 'Not Found :('});
});

var server = app.listen(app.get('port'),() => {
  console.log(`${app.get('name')} is running on port: ${app.get('port')}!`);
});

module.exports = {server: server, app: app};

