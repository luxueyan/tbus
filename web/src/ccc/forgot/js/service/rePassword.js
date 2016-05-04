'use strict';

exports.rePasswordService = {
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
    },
    sendTelCode:function (tel,callback) {
      // request
      //     .get('/api/v2/loans/summary')
      //     .end()
      //     .then(function (res) {
      //         next(res.body);
      //     });
        callback({success:true});
    },
    verifyMobileCaptcha:function (user, next) {
      request
          .post('/api/v2/auth/verify/captcha')
          .type('form')
          .send(user)
          .end()
          .then( function (r) {
              if (r.body.success) {
                  next(true, null);
              } else {
                  next(false, r.body.error[0].message);
              }
          })
    },
    verifyLoginNameAndMobile: function (user, next) {
      request
          .post('/api/v2/auth/verify/loginName/mobile?captcha_token=' +
                user.token + '&captcha_answer='+ user.captcha)
          .type('form')
          .send(user)
          .end()
          .then ( function (r) {
            if (r.body.success) {
                next(true, null);
            } else {
                next(false, r.body.error[0].message);
            }
          })
    },
    doResetPassword: function (user, next) {
      request
          .post('api/v2/auth/reset_password/password')
          .type('form')
          .send(user)
          .end()
          .then ( function (r) {
            if (r.body.success) {
                next(true, null);
            } else {
                next(false, r.body.error[0].message);
            }
          })
    }

};
