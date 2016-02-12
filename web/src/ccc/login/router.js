'use strict';
var bodyParser = require('cc-body');
var middlewares = require('./middlewares');
module.exports = function (router) {

    router.get('/login',
        middlewares.setBackUrl,
        middlewares.loginPage);

    router.post('/login',
        bodyParser,
        middlewares.setBackUrl,
        middlewares.checkCaptcha,
        middlewares.doLogin);

    router.post('/login/ajax',
        bodyParser,
        middlewares.setBackUrl,
        middlewares.checkCaptcha,
        middlewares.doLogin);

};
