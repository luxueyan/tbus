'use strict';
var middlewares = require('./middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    if ((process.env.NODE_ENV || 'development') === 'development') {
        return; // 这个模块只在 生产环境、测试环境加载
    }
    router.get('/wx/auth', middlewares.auth);
    router.get('/wx/auth/return', middlewares.authReturn);
    router.get('/wx/auth/redirect', middlewares.authRedirect);
    router.post('/wx/signature', ccBody, middlewares.signature);
};
