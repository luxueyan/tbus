'use strict';
// var request = require('cc-superagent-promise');

module.exports = {
    // user = {loginName: '', password: ''}
    login: function (user, next) {
        request
            .post('/ajaxLogin')
            .type('form')
            .send(user)
            .end()
            .then(function (res) {
                next(res.body, res.body.error);
            });
    }
};
