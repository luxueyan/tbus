'use strict';
var debug = require('debug')('encpass');
var conext = require('conext');
var ccBody = require('cc-body');
var db = require('@cc/redis');
var Key = require('bignumber').Key;
function pt(N, E){
    if (!E && typeof N === 'string') {
        return 'public_key_to_private_key:' + N;
    } else {
        return 'public_key_to_private_key:' + N + ',' + E;
    }
}

exports = module.exports = [];
exports.push(conext(function *(req, res, next) {
    if (req.method !== 'GET' || req.path !== '/api/v2/get_public_key') {
        return next();
    }
    var key = new Key;
    key.generate(512, '10001');
    var N = key.n.toString(16);
    var E = key.e.toString(16);
    var D = key.d.toString(16);
    var pk = pt(N, E);
    yield db.setex(pk, 300, JSON.stringify([N, E, D]));
    res.json([N, E]);
}));
exports.push(conext(function *(req, res, next) {
    if (!req.query.public_key) {
        return next();
    }
    yield conext.run(ccBody, req, res);
    try {
        var NE = req.query.public_key.split(',').slice(0, 2);
        var pk = pt(NE[0], NE[1]);
        var json = yield db.get(pk);
        db.del(pk);
        var NED = JSON.parse(json);
        var key = new Key;
        key.setPrivate.apply(key, NED);
        if (req.body.password) {
            req.body.password = key.decrypt(req.body.password);
        }
        if (req.body.newPassword) {
            req.body.newPassword = key.decrypt(req.body.newPassword);
        }
        if (req.body.currentPassword) {
            req.body.currentPassword = key.decrypt(req.body.currentPassword);
        }
    } finally {
        next();
    }
}));
