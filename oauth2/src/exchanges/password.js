'use strict';

var marketPrefix, errs, ef, oauth2orize, token;
marketPrefix = require('config').proxy.market;
var request = require('promisingagent');
errs = require('errs');
ef = require('../ef');
oauth2orize = require('oauth2orize');
token = require('../token');
var allowSources = 'web mobile back batch ccam'.split(' ');
var allowChannels = 'H5 PC IOS ANDROID'.split(' ');
module.exports = oauth2orize.exchange.password(function (client, username, password, scope, postBody, done) {
    var body = {
        loginName: username,
        password: password
    };
	if (postBody.source && postBody.source != '') {
        body.source = postBody.source.toUpperCase();
    } else {
        if (allowSources.indexOf(client.name) > -1) {
            body.source = client.name.toUpperCase();
        }
    }
    if ('channel' in client && allowChannels.indexOf(client.channel) > -1) {
        body.channel = client.channel;
    }
    return request.post(marketPrefix + "/api/v2/auth/login").type('form').send(body).accept('json').end(function (err, r) {
        var ref$, user, scope, obj;
        if (err || (r.error && r.error.status) || !((ref$ = r.body) != null && ref$.user)) {
            return done(errs.create({
                message: r != null ? r.body : void 8,
                status: 400,
                code: 'invalid_request'
            }));
        }
        user = r.body.user;
        scope = [];
        obj = {
            user: user,
            accountStatus: r.body.accountStatus || null,
            client: {
                name: client.name,
                id: client.id
            },
            scope: scope
        };
        if (obj.user && obj.user.idNumber) {
            delete obj.user.idNumber;
        }
        if ('GOD_FORGIVE_ME_BUT_THERE_IS_NO_OTHER_WAY_TO_DO_THIS' in client) {
            import$(obj, client.GOD_FORGIVE_ME_BUT_THERE_IS_NO_OTHER_WAY_TO_DO_THIS);
        }
        return ef(done, token.posta, obj, function (atoken) {
            return done(null, atoken, null, obj);
        });
    });
});
function import$(obj, src) {
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
}
