/**
 * @file 账户数据对接模块交互逻辑
 * @author xushusheng(jason.xu@creditcloud.com)
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
    bindAgrement: function (agreementList, next) {
        request('POST', '/api/v2/upayment/bindAgreement/MYSELF')
            .type('form')
            .send({agreementList: agreementList})
            .end()
            .then(function (r) {
                next(r.body);
            });

    },

    getLoanCount: function (status, next) {
        var api = '/api/v2/user/MYSELF/loan/count';
        api = api + status;
        request('GET', api)
            .end()
            .then(function (r) {
                if (r.body.data > 0) {
                    next(r.body.data);
                } else {
                    next(0);
                }
            });
    },
    authenticateUser: function (user, next) {
        request('POST', '/api/v2/guozhengtong/authenticateUser/' + CC.user.id)
            .type('form')
            .send(user)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    checkId: function (user, next) {
        request('POST', '/api/v2/user/MYSELF/checkId')
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
        request('GET', '/api/v2/yeepay/provinceCodes')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getCity: function (provinceName, next) {
        request('GET', encodeURI('/api/v2/yeepay/provinceCityCodes/' + provinceName))
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
    feedback: function (userId, params, next) {
        request('POST', '/api/v2/user/' + userId + '/feedback')
            .type('form')
            .send(params)
            .end()
            .then(function (r) {
                next(r.body);
            });

    },
    saveAutoBidConfig: function (params, next) {
        $.post('/api/v2/' + CC.user.id + '/save_autobid_config', params, function (r) {
            next(r);
            return r;
        });
    },
//        saveAutoBidConfig: function(params, next) {
//        request('POST', '/api/v2/'+CC.user.id+'/save_autobid_config')
//            .type('form')
//            .send(params)
//            .end()
//            .then(function (r) {
//                next(r.body);
//            });
//    },
    getTotalInters: function (next) {
        request('GET', '/api/v2/points/user/' + CC.user.id + '/getTotalPoints')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    initialPassword: function (password, next) {
        request('POST', '/api/v2/user/MYSELF/setPaymentPassword')
            .type('form')
            .send({password: password})
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    updatePassword: function (oldPassword, newPassword, next) {
        request('POST', '/api/v2/user/MYSELF/updatePaymentPassword')
            .type('form')
            .send({
                oldPassword: oldPassword,
                newPassword: newPassword
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    resetPassword: function (password, smsCaptcha, next) {
        request('POST', '/api/v2/user/MYSELF/resetPaymentPassword')
            .type('form')
            .send({
                password: password,
                smsCaptcha: smsCaptcha
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getGroupMedal: function (next) {
        request('GET', '/api/v2/users/MYSELF/groupMedal')
            .end()
            .then(function (r) {
                var results = r.body.results;
                if (results) {
                    for (var i = 0; i < results.length; i++) {

                        results[i] = results[i] + "!3";
                    }

                    next(results);
                } else {
                    next([]);
                }
            })
    },
    updatePersonalInfo: function (male, educationLevel, maritalStatus, next) {
        request('PUT', '/api/v2/user/MYSELF/personal')
            .type('form')
            .send({
                male: male,
                educationLevel: educationLevel,
                maritalStatus: maritalStatus
            })
            .end()
            .then(next);
    },
    updateCareerInfo: function (companyIndustry, salary, next) {
        request('PUT', '/api/v2/user/MYSELF/career')
            .type('form')
            .send({
                companyIndustry: companyIndustry,
                salary: salary
            })
            .end()
            .then(next);
    },
    getCurrentMonthLoan: function (to, from, next) {
        request('GET', '/api/v2/user/MYSELF/investRepayments/1/10?to=' + to + '&from=' + from)
            .end().then(function (res) {
                next(res.body);
            });
    },
    getVipLevel: function (next) {
        request('GET', '/api/v2/user/MYSELF/membership')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    createCreditAssign: function (investId, creditDealRate, creditAssignTitle, next) {
        var url = "/api/v2/creditassign/create/MYSELF/$investId/$creditDealRate";
        url = url.replace("$investId", investId);
        url = url.replace("$creditDealRate", creditDealRate);

        request('POST', url)
            .type('form')
            .send({
                'creditAssignTitle': creditAssignTitle
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    createNewCreditAssign: function (investId, creditDealRate, creditDealAmount, creditAssignTitle, next) {
        request('POST', "/api/v2/creditassign/createNew/MYSELF/" + investId)
            .type('form')
            .send({
                'creditDealRate': creditDealRate,
                'creditDealAmount': creditDealAmount,
                'creditAssignTitle': creditAssignTitle,
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    cancelCreditassign: function (creditassignId, next) {
        var url = '/api/v2/creditassign/cancel/$creditassignId';
        url = url.replace("$creditassignId", creditassignId);
        request('POST', url)
            .type('form')
            .send()
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    checkPassword: function (password, next) {
        request('POST', '/api/v2/user/MYSELF/validatePaymentPassword')
            .type('form')
            .send({password: password})
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    fixMobile: function (params, next) {
        request('POST', '/api/v2/user/MYSELF/resetMobile')
            .type('form')
            .send(params)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    sendSmsCaptcha: function (params, next) {
        request('POST', '/api/v2/smsCaptcha')
            .type('form')
            .send(params)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getQuestion: function (next) {
        request('GET', '/api/v2/survey/99F6776A-DE40-4030-9C64-481CDD3E15BA')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    deleteBank: function (params, next) {
        request('POST', '/api/v2/baofoo/cancelBindCard')
            .type('form')
            .send(params)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    getStop1: function (investId, next) {
        request('GET', '/api/v2/creditassign/prepareAssign/step1/?investId=' + investId)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getStop2: function (investId, creditAssignAmount, next) {
        request('GET', '/api/v2/creditassign/prepareAssign/step2?investId=' + investId + "&creditAssignAmount=" + creditAssignAmount)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    // 循环产品赎回
    redeemSure: function (investId, currentPeriod, next) {
        request('POST', '/api/v2/invest/redeem')
            .type('form')
            .send({
                'investId': investId,
                'currentPeriod': currentPeriod,
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // pos生成订单
    posRecord: function (depositAmount, paymentPasswd, next) {
        request('POST', '/api/v2/POS/'+CC.user.id+'/deposit')
            .type('form')
            .send({
                'depositAmount': depositAmount,
                'paymentPasswd': paymentPasswd,
            })
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // pos生成支付条形码
    generateBarcode: function (orderId,next) {
        request('GET', '/api/v2/POS/generateBarcode/'+CC.user.id+'/'+orderId)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // 判断用户的银行卡当前支付路由是否绑卡
    hasOpenCurrentChannel: function (next) {
        request('GET', '/api/v2/payment/router/hasOpenCurrentChannel/'+CC.user.id)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // 根据用户ID调用用户平台上已有的绑卡信息
    userBindCardInfo: function (next) {
        request('GET', '/api/v2/payment/router/'+CC.user.id+'/userBindCardInfo')
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // 根据后台取得的绑卡信息，调用新的预绑卡接口
    preBindCard: function (cardInfo,next) {
        request('POST', '/api/v2/payment/router/'+CC.user.id+'/preBindCard')
            .type('form')
            .send(cardInfo)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
    // 根据用户绑卡信息、手机短信验证码调用新的确认绑卡接口，进行绑卡确认
    confirmBindcard: function (cardInfoAll,next) {
        request('GET', '/api/v2/payment/router/'+CC.user.id+'/confirmBindcard')
            .type('form')
            .send(cardInfoAll)
            .end()
            .then(function (r) {
                next(r.body);
            });
    },
};

