const express = require('express');

const teacher = require('../routes/teacher');
const errorMiddleware = require('../middleware/error');
const path = require('path')
module.exports = function (app) {
  app.use(express.json());
  // Hello world
  // app.get('/', (req, res) => {
  //   res.send('Hello World');
  // });
  app.get('/socket-docs', function (req, res) {
    res.sendFile(path.join(__dirname + '/../socket/web/index.html'));
  });
  app.use('/api/teacher', teacher);
  app.use(errorMiddleware);
};
