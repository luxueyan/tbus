'use strict';
var Promise = require('bluebird');
var request = require('promisingagent');
var marketPrefix = require('config').proxy.market;

module.exports = function (router, auth) {

    router.get('/api/v2/user/:userId/paymentPasswordHasSet', auth.owner());
    router.post('/api/v2/user/:userId/validatePaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/setPaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/updatePaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/resetPaymentPassword', auth.owner());
    router.get('/api/v2/user/:userId/investDynamic/:investId', auth.owner());
    router.get('/api/v2/reward/getReferUserCountAndReward/:userId', auth.owner());

    router.get('/api/v2/hundsun/banks', auth.pass());
    router.get('/api/v2/hundsun/checkCard/sendSmsCaptcha/:mobile', auth.user());
    router.post('/api/v2/hundsun/register/:userId', auth.owner());
    router.post('/api/v2/hundsun/checkCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/bindCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/cancelCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/setDefaultAccount/:userId', auth.owner());

    router.post('/api/v2/coupon/:userId/redeemCouponIgnoreApproval', auth.owner());

    router.get('/api/v2/baofoo/getBankConstraints', auth.pass());

    //注册
    router.get('/api/v2/users/smsCaptcha', auth.pass());

    //账户中心我要投资接口
    router.get('/api/v2/user/MYSELF/invests/list/:page/:size', auth.user());

    //根据用户ID获取可用奖券列表
    router.get('/api/v2/rebateCounpon/listUserCouponPlacement/:userId', auth.pass());

    //实名认证
    router.post('/api/v2/user/:userId/checkId', auth.owner());
    //银行卡验证
    router.post('/api/v2/user/checkBankcard', auth.user());
    //充值
    router.post('/api/v2/baofoo/recharge/:userId', auth.owner());
    router.post('/api/v2/baofoo/charge', auth.user());
    //取现
    router.post('/api/v2/baofoo/withdraw/:userId', auth.owner());
    //好友数目与红包数量
    router.get('/api/v2/reward/getReferUserCountAndReward/:userId', auth.user());
    //邮箱绑定
    router.post('/api/v2/user/bindEmail', auth.user());
    router.post('/api/v2/user/authenticateEmail', auth.pass());

    //问卷调查
    router.post('/api/v2/user/:userId/surveyFilling', auth.user());
    //转让总金额和总笔数
    router.get('/api/v2/creditassign/stat/total', auth.pass());
    //转让成交记录
    router.get('/api/v2/creditassign/stat/list', auth.pass());
    router.get('/api/v2/creditassign/list/allInvests', auth.pass());
    //修改手机号
    router.post('/api/v2/user/:userId/resetMobile', auth.owner());
    //债转列表
    router.get('/api/v2/creditassign/list/filter', auth.pass());
    //债转购买接口
    router.post('/api/v2/creditassign/autoAssign/:userId', auth.owner());
    router.post('/api/v2/invest/user/:userId/creditAssign/invest', auth.owner());
    //发送短信验证码
    router.post('/api/v2/smsCaptcha', auth.user());
    //银行卡预绑卡
    router.post('/api/v2/baofoo/:userId/preBindCard', auth.owner());
    //银行卡绑卡
    router.post('/api/v2/baofoo/:userId/confirmBindCard', auth.owner());
    //银行卡解绑
    router.post('/api/v2/baofoo/cancelBindCard', auth.user());
    //投资支付
    router.post('/api/v2/baofoo/pay', auth.user());
    //债转默认合同模版获取
    router.get('/api/v2/creditassign/template', auth.user());
    //借款合同模版获取
    router.get('/api/v2/loan/loanRequest/:requestId/bind/template', auth.user());
    //债转合同获取
    router.get('/api/v2/creditassign/getCreditAssignContract/:creditAssignId', auth.user());
    //获取标的估值和转让期限
    router.get('/api/v2/creditassign/prepareAssign/step1', auth.user());
    //获取转让折价率
    router.get('/api/v2/creditassign/prepareAssign/step2', auth.user());

    router.post('/api/v2/users/getReferralInfo', auth.pass());

    router.get('/api/v2/statisticsAll', auth.user(), function (req, res) {
        Promise.all([
            request(marketPrefix + '/api/v2/user/' + req.user.id + '/statistics').get('body'),
            request(marketPrefix + '/api/v2/user/' + req.user.id + '/userfund').get('body'),
            request(marketPrefix + '/api/v2/payment/acct/amount/query', {
                query: {
                    userId: req.user.id
                }
            }).get('body')
        ]).then(function (objs) {
            res.send({
                investInterestAmount: objs[0],
                outstandingInterest: objs[1],
                acctAmount: objs[2]
            });
        });
    });
};
