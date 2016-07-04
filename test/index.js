'use strict';

var test = require('ava');
var request = require('supertest');


test('invalid url', () => {
  var server = require('../index').server;
  return request(server)
          .get('/foo')
          .expect(404);

});

test('send invalid secret gogs request', () => {
  var reqJSON = require('./fixtures/request_gogs_valid.json');
  reqJSON.secret = 'foo';
  var server = require('../index').server;
  var app = require('../index').app;
  app.set('secret', 'my little secret');
  return request(server)
          .post('/')
          .send(reqJSON)
          .expect(403);
});

test('send valid secret gogs request should not return forbidden', () => {
  var reqJSON = require('./fixtures/request_gogs_valid.json');
  reqJSON.secret = 'my little secret';
  var server = require('../index').server;
  var app = require('../index').app;
  app.set('secret', 'my little secret');
  return request(server)
          .post('/')
          .send(reqJSON)
          .expect(400);
});

test('send valid gogs request should request "crane-route" file', (t)=> {
  return new Promise((resolve, reject) => {
    var repoUrl = 'http://localhost:3001/user/repo';
    var branch = 'production';
    var expectedUrl = `/user/repo/src/${branch}/crane-route`;

    var reqJSON = require('./fixtures/request_gogs_valid.json');
    reqJSON.repository.url = repoUrl;

    var app = require('../index').app;
    app.set('branch', branch);

    var server = require('../index').server;

    var httpServer = require('http').createServer( (req, res) =>{
        req.addListener('end', () => {
            httpServer.close();
            if(req.url === expectedUrl){
              res.writeHead(200, { 'Content-Type': 'text' });
              var script = '#!/usr/bin/env node \n' +
                           'console.log("hello from node!");';

              res.end(script, 'utf-8');
            }
            else{
              return reject(new Error(`invalid url: ${req.url}`));
            }
            

        }).resume();
    }).listen(3001);

    request(server)
      .post('/')
      .send(reqJSON)
      .expect(200)
      .end((err, res) => {
        if(err){
          return reject(err);
        }
        else{
          t.is(res.text, 'stdout:\nhello from node!\nstderr:\n');
          resolve();
        }
      });


  });
  
});




