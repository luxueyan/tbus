'use strict';
var middlewares = require('../middlewares');
var ccBody = require('cc-body');

module.exports = function (router) {
    if ((process.env.NODE_ENV || 'development') === 'development') {
        return; // 这个模块只在 生产环境、测试环境加载
    }
    router.post('/signature', ccBody, middlewares.signature);
};
