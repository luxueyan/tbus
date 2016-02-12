'use strict';
var bodyParser = require('cc-body');
var middlewares = require('../middlewares');
module.exports = function (router) {

    router.post('/',
        bodyParser,
        middlewares.setBackUrl,
        middlewares.checkCaptcha,
        middlewares.doLogin);

};
