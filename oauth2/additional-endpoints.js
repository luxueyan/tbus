'use strict';
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
    
    //注册
    router.get('/api/v2/users/smsCaptcha', auth.pass());
    
    //账户中心我要投资接口
    router.get('/api/v2/user/MYSELF/invests/list/:page/:size', auth.user());
    
    //根据用户ID获取可用奖券列表
    router.get('/api/v2/rebateCounpon/listUserCouponPlacement/:userId', auth.pass());

    //实名认证
    router.post('/api/v2/user/checkId', auth.user());
    //银行卡验证
    router.post('/api/v2/user/checkBankcard', auth.user());
    //充值
    router.post('/api/v2/baofoo/recharge/:userId', auth.owner());
    //取现
    router.post('/api/v2/baofoo/withdraw/:userId', auth.owner());
};
