'use strict';
var middlewares = require('../middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    router.get('/smsCaptcha', middlewares.smsCaptcha);
    router.get('/voiceCaptcha', middlewares.voiceCaptcha);
    router.post('/submit', ccBody, middlewares.captchaRequired, middlewares.doRegister);
};
