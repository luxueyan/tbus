'use strict';
// var request = require('cc-superagent-promise');

function isEmail(mail) {
    var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    return re.test(mail);
}

module.exports = {
    checkLoginName: function (loginName, next) {
        request
            .post('/api/v2/users/check/login_name')
            .send('loginName=' + loginName)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    checkMobile: function (mobile, next) {
        request
            .post('/api/v2/register/check_mobile')
            .send('mobile=' + mobile)
            .end()
            .then(function (res) {
                next(res.body.success, res.body.error);
            });
    },
    doRegister: function (user, next) {
        request
            .post('/api/v2/register')
            .type('form')
            .send(user)
            .end()
            .then(function (res) {
                next(res.body, res.body.error);
            });
    },
    autoRegister: function (user, next) {
        request
            .post('/api/v2/users')
            .type('form')
            .send(user)
            .end()
            .then(function (res) {
                next(res.body, res.body.error);
            });
    }
};
