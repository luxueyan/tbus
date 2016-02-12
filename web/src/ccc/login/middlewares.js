'use strict';
var config = require('config');
var log = require('bunyan-hub-logger')({app: 'web', name: 'login'});
var qs = require('qs');
var conext = require('conext');

var errorsMap = {
    'INVALID_REQUIRED': '请填写图片验证码',
    'INVALID_CAPTCHA': '图片验证码错误',
    'LOGIN_NAME_NULL': '请填写用户名或手机号',
    'PASSWORD_NULL': '请填写密码',
    'INVALID_INPUT': '用户名或密码错误',
    'FAILED': '用户名或密码错误',
    'TOO_MANY_ATTEMPT': '密码输入次数过多，该用户已被禁用',
    'USER_DISABLED': '该用户已被禁用，请联系工作人员',
};

exports.loginPage = function (req, res, next) {
    res.locals.error = errorsMap[req.query.error] || '';
    if (req.cookies.ccat) {
        if (res.locals.user && res.locals.user.id) {
            return res.redirect('/account/home');
        } else { // 有 ccat 但过期无法通过验证，重刷
            res.clearCookie('ccat');
            return res.redirect(req.url);
        }
    }
    if (req.query.error) {
        res.locals.errMsg = errorsMap[req.query.error];
    }
    if (req.loginParams.url) {
        res.locals.hasBackUrl = true;
    }
    next();
};

exports.setBackUrl = function setBackUrl(req, res, next) {
    if (req.loginParams) {
        return next();
    }
    req.loginParams = {};
    var backUrl = req.query.url || (req.body && req.body.backUrl) || '';
    if (decodeUrl(backUrl)[0] === '/') {
        req.loginParams.url = backUrl;
    }
    next();
};

function decodeUrl(backUrl) {
    return (new Buffer(backUrl || '', 'base64')).toString('utf8');
}
exports.checkCaptcha = conext(function *(req, res, next) {
    if (!config.login || !config.login.captchaRequired) {
        return next();
    }
    if (!req.body.captcha_answer) {
        return ret(res, {
            data: null,
            error: [{
                "message": "INVALID_REQUIRED",
                "type": "captcha",
                "value": null,
                "code": 0
            }],
            success: false,
        });
    }
    var opts = {
        query: {
            invalidate: 1,
            token: req.body.captcha_token,
        },
        body: {
            captcha: req.body.captcha_answer,
        },
    };
    var body = yield req.uest.post('/api/v2/captcha', opts).end().get('body');
    if (!body.success) {
        return ret(res, body);
    }
    next();
});
exports.doLogin = conext(function *(req, res) {
    if (!req.body.loginName) {
        req.loginParams.error = 'LOGIN_NAME_NULL';
        return res.redirect(buildUrl(req));
    }
    if (!req.body.password) {
        req.loginParams.error = 'PASSWORD_NULL';
        return res.redirect(buildUrl(req));
    }
    var requestOpts = {
        body: {
            username: req.body.loginName,
            password: req.body.password,
            grant_type: 'password',
            client_id: config.oauth2client.id,
            client_secret: config.oauth2client.secret,
        },
    };
    var mobileClient;
    if (req.body.source === 'mobile' &&
        (mobileClient = _.find(config.clients, function (client) {
            return client.name === 'mobile';
        }))
    ) {
        requestOpts.body.client_id = mobileClient.id;
        requestOpts.body.client_secret = mobileClient.secret;
    }
    if (req.body.public_key) {
        requestOpts.query = {
            public_key: req.body.public_key,
        };
    }
    if ('channel' in req.body) {
        requestOpts.body.channel = req.body.channel;
    }
    ret(res, (yield req.uest.post('/api/v2/token', requestOpts).end().get('body')));
});
function ret(res, body) {
    var req = res.req;
    body = body || {};
    body.success = body.success || !!body.access_token;
    if (body.success && !config.cookieFree) {
        res.cookie('ccat', body.access_token, {
            maxAge: config.loginCookieMaxAge || 30 * 60 * 1000,
            path: config.cookieApiOnly ? '/api' : void 0,
        });
    }
    if (req.xhr || req.originalUrl.match(/^\/+api\//) || req.path.match(/\/ajax$/)) {
        if (req.loginParams.url) {
            body.redirect = decodeUrl(req.loginParams.url);
        }
        res.type('json');
        res.send(body);
        return;
    }
    return res.redirect(buildUrl(req, body));
}
function buildUrl(req, body) {
    body = body || {};
    body.success = body.success || !!body.access_token;
    if (body.success) {
        if (req.loginParams.url) {
            return decodeUrl(req.loginParams.url);
        }
        return '/account';
    }
    if (!req.loginParams.error) {
        req.loginParams.error = (body.error && body.error[0] && body.error[0].message) ||
            (body.error_description && body.error_description.result) ||
            'INVALID_INPUT';
    }
    return '/login?' + qs.stringify(req.loginParams);
}
