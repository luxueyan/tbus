'use strict';
var auth = require('../../auth');
var ef = require('../../ef');
var cache = require('../../cache');
var router = require('express').Router();
module.exports = router;
var config = require('config');
var sn = require('../../sn');
var db = require('@cc/redis');
[
    '/netSaveReturn',
    '/bindCardReturn',
    '/withdrawReturn',
    '/usrAcctPayReturn',
    '/bindAgreementReturn',
    '/unbindAgreementReturn',
    '/replaceCardReturn',
    '/tenderReturn',
    '/tenderRepayReturn',
    '/tenderFeeReturn',
    '/tenderDivestReturn',
    '/tenderLoanReturn',
    '/tenderDisburseReturn',
    '/projectTenderReturn'
].forEach(function(url){
    return router.get('/api/v2/upayment' + url, auth.pass());
});
['/bindCardBgReturn', '/withdrawBgReturn'].forEach(function (url) {
    return router.get('/upayment' + url, auth.pass());
});
router.get('/api/v2/upayment/posNetSaveReturn', auth.pass());
router.get('/upayment/replaceCardBgReturn', sn(function(req){
    return req.url = '/api/v2/upayment/replaceCardBgReturn';
}), auth.pass());
router.post('/api/v2/upayment/replaceCard/:userId', auth.owner());
router.post('/api/v2/upayment/register/:userId', auth.owner());
router.post('/api/v2/upayment/bindCard/:userId', auth.owner());
router.post('/api/v2/upayment/netSave/:userId', auth.owner());
router.post('/api/v2/upayment/corporationNetSave/:userId', auth.owner());
router.post('/api/v2/upayment/withdraw/:userId', auth.owner());
router.post('/api/v2/upayment/bindAgreement/:userId', auth.owner());
router.post('/api/v2/upayment/unbindAgreement/:userId', auth.owner());
router.post('/api/v2/upayment/tender/:userId', auth.owner());
router.get('/api/v2/upayment/sendpassword/:userId', auth.owner());
function getBalanceAndInvesting(now, loan, amount, cb) {
    return ef(cb, bind$(db, 'incrby'), loan.id + "_LOAN_INVESTING_" + now, amount, function (investing) {
        return ef(cb, bind$(db, 'expireat'), loan.id + "_LOAN_INVESTING_" + now, now * 1000 + 2000, function () {
            return ef(cb, bind$(db, 'get'), loan.id + "_LOAN_BALANCE_" + now, function (balance) {
                if (!balance) {
                    ef(cb, bind$(db, 'get'), loan.id + "_LOAN_BALANCE", function (balance) {
                        return ef(cb, bind$(db, 'set'), loan.id + "_LOAN_BALANCE_" + now, function () {
                            return ef(cb, bind$(db, 'expireat'), loan.id + "_LOAN_BALANCE_" + now, now * 1000 + 2000, function () {});
                        });
                    });
                }
                balance = JSON.parse(balance) || loan.amount;
                return cb(null, balance, investing);
            });
        });
    });
}
router.post('/api/v2/upayment/tenderNoPwd/user/:userId/loan/:loanId/amount/:amount', auth.pass(), function (req, res, next) {
    if (!(config.cache.tender && req.authPass)) {
        return next();
    }
    return ef(next, cache, 'loan', req.params.loanId + "_LOAN", 'GET', '/api/v2/loan/' + req.params.loanId, function (cachedLoan) {
        var loan, amount, ref$, ref1$, ref2$, ref3$;
        loan = JSON.parse(cachedLoan.text);
        if (!(loan != null && loan.id)) {
            return res.end('{"data":null,"error":[{"message":"LOAN_NOT_FOUND","type":"loanId","value":"' + req.params.loanId + '","code":0}],"success":false}');
        }
        if ((loan != null ? loan.status : void 8) !== 'OPENED') {
            return res.end('{"data":null,"error":[{"message":"标的已经结束或关闭","type":"loanId","value":"' + req.params.loanId + '","code":0}],"success":false}');
        }
        amount = parseInt(req.params.amount, 10);
        if (amount < (loan != null ? (ref$ = loan.loanRequest) != null ? (ref1$ = ref$.investRule) != null ? ref1$.minAmount.or((loan != null ? (ref2$ = loan.loanRequest) != null ? (ref3$ = ref2$.investRule) != null ? ref3$.stepAmount : void 8 : void 8 : void 8) % amount) : void 8 : void 8 : void 8)) {
            return res.end('{"data":null,"error":[{"message":"AMOUNT_ERROR","type":"loanId","value":"' + req.params.amount + '","code":0}],"success":false}');
        }
        return ef(next, cache, 'user', req.params.userId + "_FUND", 'GET', "/api/v2/user/" + req.params.userId + "/userfund", function (cachedUserfund) {
            var userfund;
            userfund = JSON.parse(cachedUserfund.text);
            if (userfund.availableAmount < amount) {
                return res.end('{"data":null,"error":[{"message":"可用金额不足","type":"userId","value":"' + req.params.userId + '","code":0}],"success":false}');
            }
            return ef(next, getBalanceAndInvesting(Math.round(Date.now() / 1000), loan, amount), function (balance, investing) {
                var ref$, ref1$;
                if (investing > balance * 1) {
                    return res.end('{"data":null,"error":[{"message":"标的余额不足","type":"loanId","value":"' + req.params.loanId + '","code":0}],"success":false}');
                }
                req.investorLimit = Math.round(balance / (loan != null ? (ref$ = loan.loanRequest) != null ? (ref1$ = ref$.investRule) != null ? ref1$.minAmount : void 8 : void 8 : void 8));
                return next();
            });
        });
    });
}, require('../../investor-limit'));
router.post('/api/v2/upayment/prepareProjectTender/:userId', auth.owner());
router.post('/api/v2/upayment/usrAcctPay/:userId', auth.owner());
router.post('/api/v2/upayment/projectTender/:userId', auth.owner());
router.post('/api/v2/upayment/projectTenderNoPwd/user/:userId/project/:projectId/invest/:investId', auth.owner());
function bind$(obj, key, target) {
    return function () { return (target || obj)[key].apply(obj, arguments) };
}
