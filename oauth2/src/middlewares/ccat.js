// Generated by LiveScript 1.3.1
var cookieParser, debug, exports;
cookieParser = require('cookie-parser');
debug = require('debug')('ccat');
exports = module.exports = [];
exports.push(cookieParser());
exports.push(function (req, res, next) {
    if (req.cookies && req.cookies.ccat && !req.query.access_token && !req.get('Authorization')) {
        debug('use ccat: %s', req.cookies.ccat);
        req.query.access_token = req.cookies.ccat;
    }
    return next();
});
