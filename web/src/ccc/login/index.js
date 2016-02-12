'use strict';

exports.setBackUrl = function (req, res, next) {
    var buffer = new Buffer(req.url);
    var backUrl = encodeURIComponent(buffer.toString('base64'));
    res.locals.loginHrefWithUrl = '/login?url=' + backUrl;
    res.expose(res.locals.loginHrefWithUrl, 'loginHrefWithUrl');
    next();
};
