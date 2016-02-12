'use strict';
var middlewares = require('../middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    router.get('/smsCaptcha', middlewares.captchaRequired, middlewares.smsCaptcha);
    router.get('/voiceCaptcha', middlewares.captchaRequired, middlewares.voiceCaptcha);
    router.post('/submit', ccBody, middlewares.doRegister);
};
