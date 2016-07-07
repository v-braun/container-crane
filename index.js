'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pack = require('./package.json');
var request = require('request');
var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');

app.locals.ENV = process.env.NODE_ENV;
app.set('env', process.env.NODE_ENV);
app.set('branch', process.env.DEFAULT_BRANCH || 'master');
app.set('debug', process.env.NODE_ENV === 'development');
app.set('port', process.env.PORT || 3000);
app.set('name', pack.name);
app.set('secret', process.env.WEBHOOK_SECRET || '');


app.use(bodyParser.json());


app.post('/', function(req, res){
  var secret = req.body.secret;
  if(app.get('secret') !== secret){
    return res.status(403).json({error: 'Invalid secret!'});
  }

  if(!req.body.repository){
    return res.status(400).json({error: 'no repository is given'});
  }
  
  var branch = app.get('branch');
  var url = `${req.body.repository.url}/raw/${branch}/crane-route`;

  return request(url, (error, response, body) => {
    if (error || response.statusCode != 200) {
      console.log('error fetching from: ' + url);
      console.log(error);
      return res.status(400).json({error: `error during fetching the file: ${url} error: ${error}`});
    }
    
    var tmpFile = path.resolve(__dirname, '.tmp_script');
    fs.writeFile(tmpFile, body, {mode: 0o777}, (err) => {
      if(err) return res.status(400).json({err: err});
      
      childProcess.execFile(tmpFile, [], (err, stdout, stderr) => {
        if(err) {
          var msg = `Error occurred \n` +
                    `error: ${err} \n` +
                    `stdout: ${stdout} \n` +
                    `stderr: ${stderr}`;

          return res.status(400).json({err: msg});
        }
        else return res.send(`stdout:\n${stdout}stderr:\n${stderr}`);
      });
    });
  });
});


app.use(function (req, res) {
  res.status(404).json({error: 'Not Found :('});
});

var server = app.listen(app.get('port'), function () {
  console.log(`${app.get('name')} is running on port: ${app.get('port')}!`);
});

module.exports = {server: server, app: app};

