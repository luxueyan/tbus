/**
 * @file 公用的数据交互层
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

var cache = {};

exports.CommonService = {
    getCaptcha: function (next) {
        var timestamp = new Date() - 0;
        request('GET', '/api/v2/register/captcha?timestamp=' + timestamp)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    checkCaptcha: function (captcha, next) {
        request('POST', '/api/v2/register/captcha?token=' + captcha.token)
            .type('form')
            .send(captcha)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getSmsCaptcha: function (mobile, next) {
        request('GET', '/api/v2/register/smsCaptcha?mobile=' + mobile)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getUserInfo: function (next) {
        return cache.userInfo ? cache.userInfo :
            (cache.userInfo = request('GET', '/user/info')
            .end()
            .then(function (res) {
                if (typeof next === 'function') {
                    next(res.body);
                }
                return res.body;
            }));
    },
    articles: function (cate, name, next) {
        return request('GET', '/api/v2/cms/'+cate+'/'+name)
            .end()
            .then(function (res) {
                if (typeof next === 'function') {
                    next(res.body);
                }
                return res.body;
            });
    },
    getSmsCaptchaForResetPassword: function (mobile, next) {
        request('GET', '/api/v2/users/smsCaptcha/changePwd?mobile=' + mobile)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getMessage: function (smsType, next) {
        request('POST', '/api/v2/smsCaptcha/MYSELF')
            .type('form')
            .send({smsType: smsType})
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    checkMessage: function (smsType, smsCaptcha, next) {
        request('POST', '/api/v2/checkSMSCaptcha/MYSELF')
            .type('form')
            .send({smsCaptcha: smsCaptcha, smsType: smsType})
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
};