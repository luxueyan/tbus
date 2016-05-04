/**
 * @file 账户数据对接模块交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

exports.accountService = {
    registerUmpay: function (user, next) {
        request('POST', '/api/v2/upayment/register/MYSELF')
            .type('form')
            .send(user)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    bindAgrement: function(agreementList,next) {
        request('POST', '/api/v2/upayment/bindAgreement/MYSELF')
            .type('form')
            .send({agreementList: agreementList})
            .end()
            .then(function (r) {
                next(r.body);
            });
        
    },
    
    getLoanCount: function(status,next){         
        var api = '/api/v2/user/MYSELF/loan/count';
        api = api+status;
        request('GET', api)                
        .end()
            .then(function (r) {                  
                if( r.body.data > 0 ){                    
                    next(r.body.data);                    
                } else {
                    next(0);
                }
            });
    },
    authenticateUser: function(user, next) {
        request('POST', '/api/v2/lianlianpay/authenticateUser/MYSELF')
            .type('form')
            .send(user)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    checkAuthenticate: function (next) {
        request('GET', '/api/v2/user/MYSELF/authenticates')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getProvince: function (next) {
        request('GET', '/api/v2/lianlianpay/provinceCodes')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getCity: function (provinceName, next) {
        request('GET', '/api/v2/lianlianpay/provinceCityCodes/' + provinceName)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getUserInfo: function (next) {
        request('GET', '/api/v2/user/MYSELF/userinfo')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getAccount: function (next) {
        request('GET', '/api/v2/user/MYSELF/fundaccounts')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    feedback:function(userId,params,next){
          request('POST', '/api/v2/user/'+userId+'/feedback')
            .type('form')
            .send(params)
            .end()
            .then(function (r) {
                next(r.body);
            });
        
    },
    saveAutoBidConfig: function(params, next){
        $.post('/api/v2/user/MYSELF/save_autobid_config', params, function(r){
            next(r);
            return r;
        });
    },
    getTotalInters:function(next){
         request('GET', '/api/v2/points/user/'+CC.user.id+'/getTotalPoints')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    initialPassword: function (password, next) {
        request('POST', '/api/v2/user/MYSELF/setPaymentPassword')
            .type('form')
            .send({password : password})
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    updatePassword: function (oldPassword, newPassword, next) {
        request('POST', '/api/v2/user/MYSELF/updatePaymentPassword')
            .type('form')
            .send({
                oldPassword : oldPassword,
                newPassword : newPassword
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    resetPassword: function (password, next) {
        request('POST', '/api/v2/user/MYSELF/resetPaymentPassword')
            .type('form')
            .send({
                password : password
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    checkPassword: function (password, next) {
        request('GET', '/api/v2/user/MYSELF/validatePaymentPassword?password=' + password)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getNewMessageNum: function (next) {
        request('GET', '/api/v2/message/countNewNotifications/MYSELF')
            .end()
            .then(function(res){
                next(res.body);
        });
    },
    getBranchName: function (params,next) {
        request('GET', encodeURI('/api/v2/lianlianpay/bankBranches/' + params))
          .end()
          .get('body')
          .then(function (r) {
              next(r);
          });
    },
    getAuthentication: function (next) {
        request('GET', '/api/v2/user/MYSELF/userAuthenticate')
          .end()
          .get('body')
          .then(function (r) {
              if (r.success) {
                  next({
                    serviceError: false,
                    data: r.data,
                  });
              } else {
                  next({
                    serviceError: true,
                    error: r.error[0].message || 'SERVER ERROR'
                  })
              }
          });
    }
};
