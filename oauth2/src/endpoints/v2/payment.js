'use strict';

var auth = require('../../auth');
var sn = require('../../sn');
var router = require('express').Router();
module.exports = router;
[
    '/account/open/request',
    '/corp_account/open/request',
    '/account/login/request',
    '/account/detail/request',
    '/account/modify/request',
    '/card/bind/request',
    '/account/open/return',
    '/corp_account/open/return',
    '/deposit/return',
    '/account/pay/return',
    '/withdraw/return',
    '/tender/return',
    '/freeze/return',
    '/unfreeze/return',
    '/loan/return',
    '/repay/return',
    '/card/bind/return',
    '/tender/cancel/return',
    '/autotenderOpenReturn',
    '/autotenderCloseReturn'
].forEach(function (url) {
    return router.post('/api/v2/payment' + url, auth.pass());
});
[
    '/deposit/request',
    '/deposit/express/request',
    '/account/pay/request',
    '/tender/request',
    '/withdraw/request'
].forEach(function (url) {
    return router.post('/api/v2/payment' + url, auth.user());
});
router.post('/api/v2/payment/card/delete', auth.user());
router.post('/api/v2/payment/autotenderOpen/user/:userId', auth.owner());
router.get('/api/v2/payment/autotenderClose/user/:userId', auth.owner());
router.get('/api/v2/payment/autotenderstat/user/:userId', auth.owner());
router.post('/api/v2/payment/fss/account/request/:userId', auth.owner());
router.post('/api/v2/payment/fss/account/:userId', auth.owner());
router.get('/api/v2/payment/fss/account/:userId', sn(function (req) {
    req.method = 'POST';
}), auth.owner());
router.post('/api/v2/payment/fss/transfer/return', sn(function (req) {
    req.url = '/api/v2/payment/fss/account/return';
}), auth.pass());
router.get('/api/v2/payment/tender/cancel', auth(function (req) {
    var ref$;
    return req.query.userId === ((ref$ = req.user) != null ? ref$.id : void 8);
}));
router.get('/fss/info', auth.pass());

router.post('/api/v2/payment/:userId/creditAssign', auth.user());
router.post('/api/v2/payment/creditassign/return', auth.pass());
