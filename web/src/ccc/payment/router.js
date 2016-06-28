'use strict';
var ccBody = require('cc-body');
var config = require('config');
var qs = require('qs');
var log = require('bunyan-hub-logger')({
    app: 'web',
    name: 'payment'
});
var protocol = config.useHttps ? 'https://' : (config.payment && config.payment
    .pnr && config.payment.pnr.protocol || 'http://');
var postUrl = (config.payment && config.payment.pnr && config.payment.pnr.postUrl) ||
    ((process.env.NODE_ENV || 'development') === 'development' || process.env.NODE_APP_INSTANCE === 'uat' ?
    'http://mertest.chinapnr.com/muser/publicRequests' :
    'https://lab.chinapnr.com/muser/publicRequests');
module.exports = function (router) {
    router.get('/payment/return', function (req, res) {
        var layoutHidden = !config.paymentReturnLayout;
        res.locals.layoutHidden = layoutHidden;
        res.layout = !layoutHidden && config.defaultLayout;
        res.render();
    });
    // get
    _.each({
        '/account/open': '/account/open/request',
        '/corp_account/open': '/corp_account/open/request',
        '/account/login': '/account/login/request',
        '/fss': '/fss/account/request',
        '/queryAcctDetails': '/account/detail/request', //三方账户明细查询 TODO: 修改 feurl
        '/acctModify': '/account/modify/request', //三方账户修改 TODO: 修改 feurl
        '/bindCard': '/card/bind/request'
    }, function (api, fe) {
        router.get('/payment' + fe, function (req, res) {
            var body = {
                userId: res.locals.user.id,
                retUrl: protocol + req.headers.host,
            };
            if (req.query.pageType) {
                body.pageType = req.query.pageType;
            }
            log.info({
                type: 'payment' + fe + '/request',
                req: req,
                body: req.body,
            });
            req.uest.post('/api/v2/payment' + api + (fe === '/fss' ?
                '/' + res.locals.user.id : ''), {
                body: body
            }).then(function (r) {
                log.info({
                    type: 'payment' + fe + '/post',
                    req: req,
                    body: r.body,
                });
                renderPostOrReturn(res, r.body);
            });
        });
    });

    function renderPostOrReturn(res, body) {
        console.log('body', body);
        if (body.success) {
            res.render('payment/post', {
                data: body.data,
                postUrl: postUrl,
            });
        } else {
            res.render('payment/return', {
                data: body.data,
                errMsg: getErrMsg(body),
            });
        }
    }

    function getErrMsg(body) {
        var errMap = {
            LOAN_ALREADY_FINISHED: '您下手慢了，此项目已经被抢光。',
            INVALID_USER: '用户无法进行投资',
            LOAN_STATUS_FAILED: '您下手慢了，此项目募集期已到',
            BID_CNT_INVALID_FOR_NEWUSER_BID: '您在本平台已经有投资记录，不能投资新客专享项目',
            INVALID_COUPON: '投资失败，奖券使用非法',
            BID_CNT_EXCEED_LIMIT: '投资失败，用户投资次数超过上限'
        };
        var errKey = body.error && body.error[0] && body.error[0].message;
        return errMap[errKey] || '出错了，请返回刷新重试。';
    }

    // post
    _.each({
        '/netSave': '/deposit/request',
        '/netSaveExpress': '/deposit/express/request',
        '/usrAcctPay': '/account/pay/request',
        '/tender': '/tender/request',
        '/withdraw': '/withdraw/request',
        '/autoBidOpen': '/autotenderOpen/user/MYSELF',
        '/autoBidClose': '/autotenderClose/user/MYSELF',
        '/creditAssign': '/MYSELF/creditassign',
        '/usrAcctPayNew': '/usrAcctPay'
    }, function (api, fe) {
        router.post('/payment' + fe, ccBody, function (req, res) {
            req.body.userId = res.locals.user.id;
            req.body.retUrl = protocol + req.headers.host;
            log.info({
                type: 'payment' + fe + '/request',
                req: req,
            });
            req.uest.post('/api/v2/payment' + api, {
                body: req.body
            }).then(function (r) {
                log.info({
                    type: 'payment' + fe + '/result',
                    req: req,
                    body: r.body,
                });
                renderPostOrReturn(res, r.body);
            });
        });
    });

    // return back
    _.each({
        '/register': '/account/open/return',
        '/corpRegisterReturn': '/corp_account/open/return',
        '/netSaveReturn': '/deposit/return',
        '/usrAcctPayReturn': '/account/pay/return',
        '/withdrawReturn': '/withdraw/return',
        '/fssReturn': '/fss/transfer/return',
        '/tenderReturn': '/tender/return',
        '/userFreezeReturn': '/freeze/return',
        '/userUnFreezeReturn': '/unfreeze/return',
        '/LoanReturn': '/loan/return',
        '/RepayReturn': '/repay/return',
        '/bindCard': '/card/bind/return',
        '/tenderCancelReturn': '/tender/cancel/return',
        '/autotenderOpenReturn': '/autotenderOpenReturn',
        '/autotenderCloseReturn': '/autotenderCloseReturn',
        '/creditAssignReturn': '/creditassign/return',
        '/unbindExpCardReturn': '/expcard/unbind/return'
    }, function (api, fe) {
        router.post('/payment' + fe, ccBody, function (req, res) {
            _.each(req.body, function (value, key) {
                if ((value || '').match(/%\w{2}/)) {
                    req.body[key] = decodeURIComponent(value);
                }
            });
            log.info({
                type: 'payment' + fe + '/request',
                req: req,
                body: req.body,
            });
            var _ID = req.body.OrdId || req.body.TrxId;
            if (fe === '/netSaveReturn') {
                _ID = req.body.TrxId;
            }
            var PAYMENT_RETURN_ORD_ID = '<!-- RECV_ORD_ID_' + _ID +
                ' -->';
            req.uest.post('/api/v2/payment' + api, {
                body: req.body
            }).then(function (r) {
                var return_url = req.cookies.return_url;
                var results = qs.stringify({
                    method: fe,
                    optype: api,
                    success: r.body.success
                });

                if (return_url) {
                    res.redirect(return_url + '?' + results);
                    return;
                }

                log.info({
                    type: 'payment' + fe + '/result',
                    req: req,
                    body: r.body,
                });
                if (config.paymentReturnLayout) { // defaults to hide
                    res.layout = config.defaultLayout;
                } else {
                    res.layoutHidden = false;
                }
                res.render('payment/return', {
                    layoutHidden: !config.paymentReturnLayout,
                    data: r.body,
                    errMsg: r.body.data.respDesc && r.body.data
                        .respDesc !== '成功' ? r.body.data.respDesc : null,
                    PAYMENT_RETURN_ORD_ID: PAYMENT_RETURN_ORD_ID
                });
            });
        });
    });

    router.post('/payment/delCard', ccBody, function (req, res) {
        var sendObj = {
            userId: res.locals.user.id,
            cardId: req.body.cardId
        };

        req.uest.post('/api/v2/payment/card/delete', {
            body: sendObj
        }).then(function (r) {
            res.json(r.body);
        });
    });
};
