'use strict';
var middlewares = require('../middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    router.get('/', function (req, res, next) {
        var user = res.locals.user;
        if (user) {
            res.redirect('/newAccount/home/index');
        }

        _.assign(res.locals, {
            title: '注册_土巴士平台'
        });
        res.expose('/api/web/register/smsCaptcha', 'registerSmsCaptchaApi');
        res.expose('/api/web/register/voiceCaptcha', 'CC.registerVoiceCaptchaApi');
        res.expose('/api/web/register/submit', 'registerSubmit');
        res.expose(req.query.refm, 'registerRel');
        res.expose(req.query.UID, 'channelRel');
        next();
    }, middlewares.registerPage);

};
