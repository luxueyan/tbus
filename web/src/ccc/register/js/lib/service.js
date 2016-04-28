/**
 * @file 注册的数据交互层
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

function isEmail(mail) {
    var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    return re.test(mail);
}

exports.RegisterService = {
    checkLoginName: function (loginName, next) {

        request
            .post('/api/v2/register/check_login_name')
            .type('form')
            .send('loginName=' + loginName)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    checkMobile: function (mobile, next) {
        request
            .post('/api/v2/register/check_mobile')
            .type('form')
            .send('mobile=' + mobile)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    checkEmail: function (email, next) {
        request
            .post('/api/v2/register/check_email')
            .send('email=' + email)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    doRegister: function (user, next) {
        request
            //.post('/api/v2/register')
            .post('/api/v2/users/register')
            .type('form')
            .send(user)
            .end()
            .then(function (res) {
                next(res.body, res.body.error);
            });
    },
    checkInvitation: function (params, next) {
        request
            .get('/register/invitation?' + params)
            .end()
            .then(function (res) {
                next(res);
            });
    },

    // 通过邮箱或组验证码，判断组是否存在(企业码)
    checkGroupExist: function (value, next) {
        var key = 'groupCode';
        if (isEmail(value)) {
            value = '@' + value.split('@')[1];
            key = 'email';
        }
        // groupCode  email
        request
            .get('/api/v2/users/groupExist?' + key + '=' + value)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    // 通过手机号判断用户是否已被邀请
    checkIsIsInvited: function (mobile, next) {
        request
            .get('/api/v2/users/isInvited/' + mobile)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    }
};