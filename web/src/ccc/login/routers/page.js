'use strict';
var middlewares = require('../middlewares');
var bodyParser = require('cc-body');

module.exports = function (router) {
    router.get('/', middlewares.setBackUrl, middlewares.loginPage);

    router.post('/',
        bodyParser,
        middlewares.setBackUrl,
        middlewares.checkCaptcha,
        middlewares.doLogin);

};
