'use strict';
var ccBody = require('cc-body');
var middlewares = require('./middlewares');

module.exports = function (router) {
    router.get('/register', middlewares.registerPage);
    router.get('/register/ajax/smsCaptcha', middlewares.captchaRequired, middlewares.smsCaptcha);
    router.get('/register/ajax/voiceCaptcha', middlewares.captchaRequired, middlewares.voiceCaptcha);
    router.post('/register/ajax/submit', ccBody, middlewares.doRegister);
};
