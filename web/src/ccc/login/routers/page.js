'use strict';
var _ = require('lodash');
var url = require('url');
var crypto = require('crypto');
var config = require('config');
var conext = require('conext');
var proagent = require('promisingagent');
var crypto = require('crypto');
var db = require('@cc/redis');
var log = require('bunyan-hub-logger')({app: 'web', name: 'wx'})
module.exports = function (router) {
    router.get('/', function (req, res) {
        _.assign(res.locals, {
            title: '登录_土巴士平台'
        });
        res.render();
    });
    router.get('/quickLogin/:mobile/:currentTime/:md5key', function *(req, res) {

        var r = yield req.uest('/api/v2/quickLogin/' + req.params.mobile + '/' + req.params.currentTime + '/' + req.params.md5key);
        if (!r.body.success) {
            res.redirect('/');
            return;
        }

        if (!r.body.data.isNewUser) {
            var signInUser = Promise.coroutine(function *(user) {
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
                return ccat;
            });
            var ccat = yield signInUser(r.body.data.user);
            res.cookie('ccat', ccat, {
                maxAge: 24 * 60 * 60
            });
            res.redirect('/');
        }
        if (r.body.data.isNewUser) {
            res.redirect('/newAccount/setpassword?mobile=' + req.params.mobile + '&currentTime=' + req.params.currentTime + '&md5key=' + req.params.md5key);
        }

    })
}
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
