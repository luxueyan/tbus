'use strict';

var db = require('@cc/redis');
var co = require('co');
var methods = require('methods');
var config = require('config');
var log = require('bunyan-hub-logger')({ app: 'web', name: 'wx' })
var proagent = require('promisingagent');

module.exports = co.wrap(function *() {
    var args = Array.prototype.slice.call(arguments);
    var mp;
    try {
        mp = JSON.parse((yield db.get('weixin/mp'))||'{}');
    } catch (e) {};
    if (!mp.expires_at || Date.now() > mp.expires_at) {
        var body = yield proagent('https://api.weixin.qq.com/cgi-bin/token', {
            query: {
                appid: config.weixinmp.appid,
                secret: config.weixinmp.secret,
                grant_type: 'client_credential',
            },
        }).end().get('body');
        mp = body;
        mp.expires_at = Date.now() + ((mp.expires_in - 300)*1000);
        log.debug({ type: 'wxrequest', wxmp: body });
        db.set('weixin/mp', JSON.stringify(mp));
    }
    args.splice(methods.indexOf(args[0].toLowerCase()) > -1 ? 1 : 0, 0, 'https://api.weixin.qq.com', {
        type: 'json',
        query: {
            access_token: mp.access_token,
        },
    });
    log.debug({ type: 'wxrequest', args: args });
    return proagent.apply(null, args);
});
