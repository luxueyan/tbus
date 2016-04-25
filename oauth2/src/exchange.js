'use strict';
var path = require('path');
var config = require('config');
var os = require('./oauth-server');
var router = exports = module.exports = require('express').Router();
var ccBody = require('cc-body');
var passport = require('./passport');
var log = require('bunyan-hub-logger')({app: 'oauth2', name: 'exchange'});
var ef = require('./ef');
var token = require('./token');
var db = require('@cc/redis');
var NodeRSA = require('node-rsa');
config.exchanges.forEach(function (exchangeName) {
    var exchange;
    try {
        exchange = require(path.resolve(__dirname, 'exchanges', exchangeName));
        return os.exchange(exchange);
    } catch (e) {
        return console.error(e);
    }
});
router.post('/api/v2/token', function (req, res, next) {
    /*
    这里的 ugly hack 用来保证：
    1. 已登录用户再登录第三方 oauth 帐号时，已登录的 user 保留
    2. 只登录第三方 oauth 帐号但未关联的访客，输入用户名密码后添加 user，保留 socialUser
    因为 oauth2orize 的 exchange 里面不能给 req 对象，只能把信息暂存到 req.user
    另外，这里还不能直接使用 passport.authenticate \bear, ... 否则会导致测试失败，实际应该也会受影响，
    所以只能自己简单处理直接从 redis 取信息
    总之 passport/oauth2orize 这一家满满都是坑啊
    */
    var parts;
    var atoken;
    var scheme;
    var credentials;
    if (req.headers && req.headers.authorization) {
        parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            scheme = parts[0];
            credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                atoken = credentials;
            }
        }
    }
    if (!atoken && req.query && req.query.access_token) {
        atoken = req.query.access_token;
    }
    if (!atoken) {
        return next();
    }
    log.debug({access_token: atoken}, 'bearer token: %s', atoken);
    return token.geta(atoken, function (err, obj) {
        if (err || !obj) {
            return next();
        }
        req.GOD_FORGIVE_ME_BUT_THERE_IS_NO_OTHER_WAY_TO_DO_THIS = {
            socialUser: obj.socialUser,
            scope: obj.scope
        };
        return next();
    });
}, ccBody,  passport.authenticate('oauth2-client-password', {
    session: false,
    failWithError: true
}), function (req, res, next) {
    if (req.body && 'channel' in req.body) {
        req.user.channel = req.body.channel;
    }
    req.user.GOD_FORGIVE_ME_BUT_THERE_IS_NO_OTHER_WAY_TO_DO_THIS =
        req.GOD_FORGIVE_ME_BUT_THERE_IS_NO_OTHER_WAY_TO_DO_THIS;
    return next();
}, os.token());
