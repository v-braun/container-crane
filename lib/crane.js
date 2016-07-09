'use strict';

var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');
var request = require('request');

function validate(app, req, res){
  var secret = req.body.secret;
  if(app.get('secret') !== secret) return res.status(403).json({error: 'Invalid secret!'});

  if(!req.body.repository) return res.status(400).json({error: 'no repository is given'});

  return null;
}

function deploy(app, url, req, res){
  return request(url, (error, response, body) => {
    if (error || response.statusCode != 200) {
      console.log(`error fetching from: ${url} Status: ${response.statusCode} error: ${error}`);
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
}

function gogsUrl(app, req){
  var branch = app.get('branch');
  var url = `${req.body.repository.url}/raw/${branch}/deploy.crane`;
  return url;
}

module.exports.validate = validate;
module.exports.deploy = deploy;
module.exports.url = {
  gogs: gogsUrl,
};

