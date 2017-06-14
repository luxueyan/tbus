'use strict';
var Promise = require('bluebird');
var request = require('promisingagent');
var ccBody = require('cc-body');
var marketPrefix = require('config').proxy.market;
var sn = require('./src/sn');

module.exports = function (router, auth, middlewares) {

    /**
     * 关于图形验证码的说明
     * 如果有哪个接口需要使用图形验证码校验
     * 只需要在后边加上 middlewares.captchaRequired 即可
     *
     * middlewares.captchaRequired 是校验图形验证码的中间件
     * 接收两个参数：
     *  @captcha_token {String} token
     *  @captcha_answer {String} answer
     *
     * Example:
     *  router.get('/api/v2/some-api-path', auth.user(), middlewares.captchaRequired);
     */

        // image captcha checker test
    router.get('/api/v2/img-captcha-checker-test',
        auth.pass(),
        middlewares.captchaRequired,
        function (req, res) {
            res.send({
                query: req.query
            });
        });

    // 判断是否设置支付密码
    router.get('/api/v2/user/:userId/paymentPasswordHasSet', auth.owner());

    // 验证支付密码
    router.post('/api/v2/user/:userId/validatePaymentPassword', auth.owner());

    // 设置支付密码
    router.post('/api/v2/user/:userId/setPaymentPassword', auth.owner());

    // 修改支付密码
    router.post('/api/v2/user/:userId/updatePaymentPassword', auth.owner());

    // 重置支付密码
    router.post('/api/v2/user/:userId/resetPaymentPassword', auth.owner());

    // (这个应该是投资动态相关的代码里没有用到)
    router.get('/api/v2/user/:userId/investDynamic/:investId', auth.owner());

    // 邀请的好友数量和红包数量
    router.get('/api/v2/reward/getReferUserCountAndReward/:userId', auth.owner());

    // 恒生相关代码()
    router.get('/api/v2/hundsun/banks', auth.pass());
    router.get('/api/v2/hundsun/checkCard/sendSmsCaptcha/:mobile', auth.user());
    router.post('/api/v2/hundsun/register/:userId', auth.owner());
    router.post('/api/v2/hundsun/checkCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/bindCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/cancelCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/setDefaultAccount/:userId', auth.owner());

    // 兑换红包
    router.post('/api/v2/coupon/:userId/redeemCouponIgnoreApproval', auth.owner());

    router.post('/api/v2/coupon/:userId/redeemCouponIgnoreApprovalWithCaptcha',
        sn(function (req) {
            return req.url = req.url.replace('redeemCouponIgnoreApprovalWithCaptcha', 'redeemCouponIgnoreApproval');
        }),
        auth.owner(),
        middlewares.captchaRequired
    );

    // 宝支付银行卡信息列表
    router.get('/api/v2/baofoo/getBankConstraints', auth.pass());

    // 账户中心我要投资接口
    router.get('/api/v2/user/MYSELF/invests/list/:page/:size', auth.user());

    // 根据用户ID获取可用奖券列表
    router.get('/api/v2/rebateCounpon/listUserCouponPlacement/:userId', auth.pass());

    // 实名认证
    router.post('/api/v2/user/:userId/checkId', auth.owner());

    // 银行卡验证
    router.post('/api/v2/user/checkBankcard', auth.user());

    // 宝支付充值
    router.post('/api/v2/baofoo/recharge/:userId', auth.owner());

    // 宝支付充值
    router.post('/api/v2/baofoo/charge', auth.user());

    // 宝支付取现
    router.post('/api/v2/baofoo/withdraw/:userId', auth.owner());

    // 好友数目与红包数量
    router.get('/api/v2/reward/getReferUserCountAndReward/:userId', auth.user());

    // 邮箱绑定
    router.post('/api/v2/user/bindEmail', auth.user());

    router.post('/api/v2/user/authenticateEmail', auth.pass());

    // 问卷调查
    router.post('/api/v2/user/:userId/surveyFilling', auth.user());

    // 转让总金额和总笔数
    router.get('/api/v2/creditassign/stat/total', auth.pass());

    // 转让成交记录
    router.get('/api/v2/creditassign/stat/list', auth.pass());

    router.get('/api/v2/creditassign/list/allInvests', auth.pass());

    // 修改手机号
    router.post('/api/v2/user/:userId/resetMobile', auth.owner());

    // 债转列表
    router.get('/api/v2/creditassign/list/filter', auth.pass());

    // 债转购买接口
    router.post('/api/v2/creditassign/autoAssign/:userId', auth.owner());

    router.post('/api/v2/invest/user/:userId/creditAssign/invest', auth.owner());

    // 发送短信验证码
    router.post('/api/v2/smsCaptcha', auth.user());

    // 大额充值
    router.post('/api/v2/baofoo/:userId/batchDepositSplit', auth.owner());

    // 银行卡预绑卡
    router.post('/api/v2/baofoo/:userId/preBindCard', auth.owner());

    // 银行卡绑卡
    router.post('/api/v2/baofoo/:userId/confirmBindCard', auth.owner());

    // 银行卡解绑
    router.post('/api/v2/baofoo/cancelBindCard', auth.user());

    // 投资支付
    router.post('/api/v2/baofoo/pay', auth.user());

    // 债转默认合同模版获取
    router.get('/api/v2/creditassign/template', auth.user());

    // 借款合同模版获取
    router.get('/api/v2/loan/loanRequest/:requestId/bind/template', auth.user());

    // 债转合同获取
    router.get('/api/v2/creditassign/getCreditAssignContract/:creditAssignId', auth.user());

    // 获取标的估值和转让期限
    router.get('/api/v2/creditassign/prepareAssign/step1', auth.user());

    // 获取转让折价率
    router.get('/api/v2/creditassign/prepareAssign/step2', auth.user());

    router.get('/api/v2/user/:userId/isMMC', auth.owner());

    router.post('/api/v2/users/getReferralInfo', auth.pass());

    router.get('/api/v2/user/:userId/accountStatus', auth.owner());

    // 兑换红包新接口加校验
    router.post('/api/v2/coupon/:userId/redeemCouponIgnoreApprovalWithCaptcha', auth.user(), middlewares.captchaRequired);

    router.get('/api/v2/loans/getLoansForHomePage', auth.pass());

    router.get('/api/v3/loans/getMobileHomepageLoans', auth.pass());

    // 支付路由相关
    // 充值
    router.post('/api/v2/payment/router/charge', auth.user());
    // 提现
    router.post('/api/v2/payment/router/withdraw/:userId', auth.owner());
    // 获取银行卡信息列表
    router.get('/api/v2/payment/router/getBankConstraints', auth.user());
    // 判断用户的银行卡当前支付路由是否绑卡
    router.get('/api/v2/payment/router/hasOpenCurrentChannel/:userId', auth.owner());
    // 根据用户ID调用用户平台上已有的绑卡信息
    router.get('/api/v2/payment/router/:userId/userBindCardInfo', auth.owner());
    // 根据后台取得的绑卡信息，调用新的预绑卡接口
    router.post('/api/v2/payment/router/:userId/preBindCard', auth.owner());
    // 根据用户绑卡信息、手机短信验证码调用新的确认绑卡接口，进行绑卡确认
    router.post('/api/v2/payment/router/:userId/confirmBindCard', auth.owner());
    // 大额充值
    router.post('/api/v2/payment/router/:userId/batchDepositSplit', auth.owner());
    // 解绑银行卡
    router.post('/api/v2/payment/router/cancelBindCard', auth.user());

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

    // 获取线下记录
    router.get('/api/v2/offlineData/offline/:userId', auth.user());

    // 获取理财师验证码
    router.post('/api/v2/user/:userId/sendMMCCaptcha', auth.owner());

    // 验证理财师验证码
    router.post('api/v2/checkSMSCaptcha/:userId', auth.owner());

    // 获取优惠券列表新
    router.post('/api/v2/coupon/:userId/listCouponNew', auth.pass());

    // pos
    router.post('/api/v2/POS/query', auth.pass());
    router.post('/api/v2/POS/notification', auth.pass());

    // pos支付生成订单
    router.post('/api/v2/POS/:userId/deposit', auth.user());

    // pos生成支付条形码
    router.get('/api/v2/POS/generateBarcode/:userId/:orderId', auth.user());

    // 循环产品-赎回
    router.post('/api/v2/invest/redeem', auth.user());

    // 新的银行限额接口地址
    router.get('/api/v2/payment/router/getBankConstraints', auth.user());

    // 新的获取理财师推荐列表
    router.get('/api/v2/user/:userId/inviteNew', auth.pass());

    // 理财师二级推荐列表
    router.get('/api/v2/user/:userId/manager/second', auth.pass());

    router.get('/api/v2/message/user/:userId/notifications', auth.user());

    //更新消息的查看状态
    router.post('/api/v2/message/markAsRead/:messageId', auth.user());
};
