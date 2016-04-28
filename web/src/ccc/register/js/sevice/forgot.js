'use strict';
// var request = require('cc-superagent-promise');

exports.forgotService = {
    doReset: function (user, next) {
        request
            .post('/api/v2/auth/reset_password?captcha_token=' +
                user.token + '&captcha_answer='+ user.captcha)
            .type('form')
            .send(user)
            .end()
            .then(function (res) {
                if (res.body.success) {
                    next(true, null);
                } else {
                    next(false, res.body.error[0].message);
                }
            });
    }
};
