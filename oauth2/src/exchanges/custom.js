'use strict';

var marketPrefix, errs, oauth2orize, token, handler, exports;
marketPrefix = require('config').proxy.market;
var request = require('promisingagent');
errs = require('errs');
oauth2orize = require('oauth2orize');
token = require('../token');
handler = function (client, username, password, scope, done) {
    var ref$;
    if (((ref$ = client.name) === 'formax' || ref$ === 'customLogin') && password === 'sudo su' && ~scope.indexOf('su')) {
        request(marketPrefix + "/api/v2/user?credential=" + username).accept('json').end(function (err, r) {
            var user, scope, obj;
            if (err || r.error && r.error.status) {
                return done(errs.create({
                    message: 'invalid username',
                    status: 400,
                    code: 'invalid_request'
                }));
            }
            user = r.body;
            scope = [];
            obj = {
                user: user,
                client: {
                    name: client.name,
                    id: client.id
                },
                scope: scope
            };
            return token.posta(obj, function (err, atoken) {
                if (err) {
                    return done(err);
                } else {
                    return done(null, atoken, null, obj);
                }
            });
        });
    } else {
        return done(null);
    }
};
exports = module.exports = oauth2orize.exchange.password(handler);
exports.handler = handler;
