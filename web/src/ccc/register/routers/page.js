'use strict';
var middlewares = require('../middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    router.get('/', function (req, res, next) {
        res.expose('/api/web/register/smsCaptcha', 'registerSmsCaptchaApi');
        res.expose('/api/web/register/voiceCaptcha', 'CC.registerVoiceCaptchaApi');
        res.expose('/api/web/register/submit', 'registerSubmit');
        next();
    }, middlewares.registerPage);
};
