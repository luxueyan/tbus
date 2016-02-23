'use strict';
module.exports = function (router, auth) {

    router.get('/api/v2/user/:userId/paymentPasswordHasSet', auth.owner());
    router.get('/api/v2/user/:userId/validatePaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/setPaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/updatePaymentPassword', auth.owner());
    router.post('/api/v2/user/:userId/resetPaymentPassword', auth.owner());

    router.get('/api/v2/hundsun/banks', auth.pass());
    router.post('/api/v2/hundsun/register/:userId', auth.owner());
    router.post('/api/v2/hundsun/checkCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/bindCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/cancelCard/:userId', auth.owner());
    router.post('/api/v2/hundsun/setDefaultAccount/:userId', auth.owner());
    router.post('/api/v2/hundsun/recharge/:userId', auth.owner());
    router.post('/api/v2/hundsun/withdraw/:userId', auth.owner());

};
