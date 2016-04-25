'use strict';

var auth, passport, cacheMiddleware, router, Promise, marketPrefix;
auth = require('../../auth');
passport = require('../../passport');
cacheMiddleware = require('../../cache').middleware;
router = require('express').Router();
module.exports = router;
Promise = require('bluebird');
var request = require('promisingagent');
marketPrefix = require('config').proxy.market;
router.get('/api/v2/whoami', passport.authenticate('bearer', {
    session: false,
    failWithError: true
}), function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send({
        user: req.user,
        authInfo: req.authInfo
    });
});
router.get('/api/v2/whoami_e', passport.authenticate('bearer', {
    session: false,
    failWithError: true
}), function (req, res, next) {
    var ref$;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!((ref$ = req.user) != null && ref$.id)) {
        return res.send({
            authInfo: req.authInfo
        });
    }
    return res.send({
        user: req.user,
        authInfo: req.authInfo
    });
}, function (err, req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    return res.send({});
});
router.get('/api/v2/whoamiplz', passport.authenticate('bearer', {
    session: false,
    failWithError: true
}), function (req, res, next) {
    var ref$;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!((ref$ = req.user) != null && ref$.id)) {
        return res.send({
            authInfo: req.authInfo
        });
    }
    return Promise.all([
        request(marketPrefix + "/api/v2/user/" + req.user.id + "/payment").get('body'),
        request(marketPrefix + "/api/v2/user/" + req.user.id + "/userfund").get('body'),
        request(marketPrefix + "/api/v2/user/" + req.user.id + "/fundaccounts").get('body')
    ]).then(function (objs) {
        import$(import$(req.user, objs[0]), objs[1]);
        req.user.bankCards = objs[2];
        return res.send({
            user: req.user,
            authInfo: req.authInfo
        });
    })['catch'](function () {
        if (!res.headersSent) {
            return res.send({
                user: req.user,
                authInfo: req.authInfo
            });
        }
    });
}, function (err, req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    return res.send({});
});
router.get('/api/v2/context', function (req, res, next) {
    req.url = '/api/v1/context';
    return next();
}, auth.pass(), cacheMiddleware('context', '', function () {
    return 'CONTEXT';
}));
router.get('/api/v2/confirm_email', auth.pass());
function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
}
