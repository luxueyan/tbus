'use strict';
var db = require('@cc/redis');
exports = module.exports = [];
exports.push(function (req, res, next) {
    db.rpush(['stats', req.method.toUpperCase(), req.path].join(':'), Date.now());
    next();
});
