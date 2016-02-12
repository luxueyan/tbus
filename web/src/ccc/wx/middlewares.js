'use strict';
var _ = require('lodash');
var url = require('url');
var crypto = require('crypto');
var config = require('config');
var co = require('co');
var conext = require('conext');
var proagent = require('promisingagent');
//var xml2json = require('xml2json');
var wxrequest = require('./wxrequest');
var db = require('@cc/redis');
var log = require('bunyan-hub-logger')({ app: 'web', name: 'wx' })

function randomHex(len) {
    return new Promise(function (resolve, reject) {
        crypto.randomBytes(len, function (err, buf) {
            if (err) {
                return reject(err);
            }
            resolve(buf.toString('hex'));
        });
    });
}

function sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}
var urlPrefix = (config.useHttps?'https://':'http://') + config.domain;
var getSocialId = co.wrap(function *(openid) {
    if (!config.weixinmp.useUnionId) {
        return 'openid:' + openid;
    }
    var wxuser = yield wxrequest('/cgi-bin/user/info', {
        query: {
            openid: payload.FromUserName,
        },
    }).end().get('body');
    log.debug({ type: 'wxunionid', wxuser: wxuser });
    return 'unionid:' + wxuser.unionid;
});
var socialAuth = co.wrap(function *(socialId) {
    var marketPrefix = config.proxy.market.replace(/\/+$/, '');
    var socialAuthResult = yield proagent('POST',
        marketPrefix + '/api/v2/auth/social', {
        body: {
            socialType: 'WEIXIN',
            socialId: socialId,
        },
    }).end().get('body');
    if (socialAuthResult.user && socialAuthResult.user.id) {
        var results = yield [
            proagent(marketPrefix + '/api/v2/user/' + socialAuthResult.user.id + '/payment').end().get('body'),
            proagent(marketPrefix + '/api/v2/user/' + socialAuthResult.user.id + '/userfund').end().get('body'),
            proagent(marketPrefix + '/api/v2/user/' + socialAuthResult.user.id + '/fundaccounts').end().get('body'),
        ];
        _.assign(socialAuthResult.user, results[0], results[1]);
        socialAuthResult.user.bankCards = results[2];
        log.debug({ type: 'wxauth', user: socialAuthResult.user });
    }
    return socialAuthResult;
});
var signInUser = co.wrap(function *(user) {
    var obj = {
        user: user,
        client: {
            name: 'node',
            id: config.oauth2client.id,
        },
        scope: [],
    };
    var ccat = yield randomHex(32);
    yield db.setex('access_token:' + ccat, 24 * 60 * 60, JSON.stringify(obj));
    var ccatkey = yield randomHex(16);
    yield db.setex('weixin/ccatkey:' + ccatkey, 300, ccat);
    return ccatkey;
});
exports.auth =  function (req, res) {
    var options = url.parse('https://open.weixin.qq.com/connect/oauth2/authorize#wechat_redirect');
        options.query = {
            appid: config.weixinmp.appid,
            redirect_uri: urlPrefix + '/wx/auth/redirect',
            state: req.query.url || '/account',
            response_type: 'code',
            scope: 'snsapi_base',
        };
    var redirectUrl = url.format(options);
    log.debug({ type: 'wxauth', req: req, redirectUrl: redirectUrl });
    res.redirect(redirectUrl);
};
exports.authReturn = conext(function *(req, res) {
    var r = yield proagent('https://api.weixin.qq.com/sns/oauth2/access_token', {
        query: {
            appid: config.weixinmp.appid,
            secret: config.weixinmp.secret,
            grant_type: 'authorization_code',
            code: req.query.code,
        },
    });
    if (r.text[0] === '{') {
        res.type('json');
    }
    res.end(r.text);
});

exports.authRedirect = conext(function *(req, res) {
    var ccatkey, socialId;
    log.debug({ type: 'wxredirect', reqQuery: req.query });
    if (req.query.code) {
        var r = yield proagent('https://api.weixin.qq.com/sns/oauth2/access_token', {
            query: {
                appid: config.weixinmp.appid,
                secret: config.weixinmp.secret,
                grant_type: 'authorization_code',
                code: req.query.code,
            },
        });
        log.debug({ type: 'wxredirect', r: r });
        var body;
        if (r.text[0] === '{') {
            res.type('json');
            try {
                body = JSON.parse(r.text);
            } catch (e) {
                log.error(e);
            }
    log.debug({ type: 'wxredirect', body: body });
            if (body.openid) {
                socialId = yield getSocialId(body.openid);
        log.debug({ type: 'wxredirect', socialId: socialId });
                var socialAuthResult = yield socialAuth(socialId);
                log.debug({ type: 'wxredirect', socialAuthResult: socialAuthResult });
                if (socialAuthResult.user && socialAuthResult.user.id) {
                    ccatkey = yield signInUser(socialAuthResult.user);
                }
            }
        }
    }
    var ccat;
    ccatkey = ccatkey || req.query.ccatkey;
    try {
        ccat = yield db.get('weixin/ccatkey:' + ccatkey);
    } catch (e) {}
    log.debug({ type: 'wxredirect', socialAuthResult: socialAuthResult, code: req.query.code, ccatkey: ccatkey, ccat: ccat });
    if (!ccat) {
        return res.redirect('/login' + (socialId ? '?bind_social_weixin='+socialId : ''));
    }
    res.cookie('ccat', ccat, {
        maxAge: config.loginCookieMaxAge || 30 * 60 * 1000,
    });
    res.redirect(req.query.url || req.query.state || '/account');
});

exports.signature = conext(function *(req, res) {

    // API Document - http://t.cn/RUdi0NA

    var REDIS_JS_API_TICKET = 'weixin/jsapi_ticket';

    var jsapi_ticket = {expires_at: Date.now() - 1};

    try {
        jsapi_ticket = _.defaults(JSON.parse((yield db.get(REDIS_JS_API_TICKET)) || '{}'), jsapi_ticket);
    } catch (e) {}

    if (jsapi_ticket.expires_at < Date.now()) {
        var r = yield wxrequest('/cgi-bin/ticket/getticket', {
            query: {
                type: 'jsapi',
            },
        });
        var jsapi_ticket = r.body;
        log.debug(_.assign({ type: 'jsapi_ticket' }, _.pick(r, 'body', 'headers', 'text', 'status')));

        if (!jsapi_ticket || !jsapi_ticket.ticket) {
            return res.status(500).send({error: 'getting jsapi_ticket failed'});
        }

        jsapi_ticket.expires_at = Date.now() + ((jsapi_ticket.expires_in - 300) * 1000);

        db.set(REDIS_JS_API_TICKET, JSON.stringify(jsapi_ticket));
    }

    var query_set = {
        jsapi_ticket: jsapi_ticket.ticket,
        noncestr: req.body.nonceStr,
        timestamp: req.body.timestamp,
        url: req.body.url,
    };

    var query_path =
        _(query_set)
            .pairs()
            .sortBy()
            .map(function (pair) { return pair.join('=') })
            .value()
            .join('&')
    ;

    res.json(_.merge(req.body, {
        signature: sha1(query_path),
        appId: config.weixinmp.appid,
    }));
});
