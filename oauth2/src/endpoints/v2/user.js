'use strict';

var db = require('@cc/redis');
var ef = require('../../ef');
var auth = require('../../auth');
var sn = require('../../sn');
var router = require('express').Router();
exports = module.exports = router;
var config = require("config");
var cache = require('../../cache');
var cacheUser = function (subfix) {
    return cache.middleware('user', subfix, function(req){
        return req.params.userId;
    });
};
var cacheUserStat = cache.middleware('userstat', '_STAT', function(req){
    return req.params.userId;
});
var request = require('promisingagent');
var setHeaders = require('../../onresponse');
var concat = require('concat-stream');
var marketPrefix = require('config').proxy.market;
var token = require('../../token');
router.get('/api/v2/user', auth.pass());
router.get('/api/v2/user/:userId', auth.pass(), cacheUser('_ACCOUNT'));
router.get('/api/v2/user/:userId/userinfo', auth.pass());
function getAccessToken(req){
    var atoken;
    atoken = '';
    if (req.headers && typeof req.headers.authorization === 'string') {
        atoken = req.headers.authorization.replace(/^Bearer\s+/, '');
    }
    if (!atoken && req.query && typeof req.query.access_token === 'string') {
        atoken = req.query.access_token;
    }
    return atoken;
}
router.post('/api/v2/user/:userId/update/userInfo', auth.user(), function(req, res, next){
    if (!req.authPass) {
        return next();
    }
    req.onProxyResponse = function(response, res){
        response.pipe(concat(function(data){
            function returnResponse(){
                res.writeHead(response.statusCode, response.headers);
                return res.end(data);
            }
            setHeaders(response, res);
            request(marketPrefix + "/api/v2/user/" + req.user.id + "/userinfo").then(function (r) {
                var err = r.error;
                var ref$, atoken;
                if (!(r != null && ((ref$ = r.body) != null && ref$.userId))) {
                    return returnResponse();
                }
                atoken = getAccessToken(req);
                return token.geta(atoken, function(err, obj){
                    var ref$;
                    if (err || (obj != null ? (ref$ = obj.user) != null ? ref$.id : void 8 : void 8) !== r.body.userId) {
                        return returnResponse();
                    }
                    import$(obj.user, r.body.user);
                    if (obj.user && obj.user.idNumber) {
                        delete obj.user.idNumber;
                    }
                    return token.puta('access_token:' + atoken, obj, function(err, token){
                        return returnResponse();
                    });
                });
            }).catch(returnResponse);
        }));
        return true;
    };
    return next();
});
router.patch('/api/v2/user/:userId', auth.owner());
router.get('/api/v2/user/:userId/payment', auth.owner());
router.get('/api/v2/user/:userId/statistics', auth.owner(), cacheUserStat);
router.get('/api/v2/user/:userId/statistics/invest', auth.owner(), cacheUserStat);
router.get('/api/v2/user/:userId/statistics/loan', auth.owner(), cacheUserStat);
router.get('/api/v2/user/:userId/loan/count', auth.owner());
router.get('/api/v2/user/:userId/investRepayments/:pageStart/:pageEnd', auth.owner());
router.get('/api/v2/user/:userId/credit', auth.client());
router.put('/api/v2/user/:userId/credit', auth.client());
router.get('/api/v2/user/:userId/priv', auth.owner());
router.post('/api/v2/user/:userId/send_email_verification', auth.owner());
router.post('/api/v2/user/:userId/change_password', auth.owner(), sn(function(req){
    var userId;
    userId = req.params.userId;
    return req.onProxyResponse = function(response, res){
        if (response.statusCode === 200 && userId) {
            db.set(userId + ":last_change_password", Date.now());
        }
    };
}));
router.put('/api/v2/user/:userId/priv', auth.owner());
router.put('/api/v2/user/:userId/personal', auth.owner());
router.put('/api/v2/user/:userId/finance', auth.owner());
router.put('/api/v2/user/:userId/career', auth.owner());
router.put('/api/v2/user/:userId/contact', auth.owner());
router.put('/api/v2/user/:userId/social', auth.owner());
router.post('/api/v2/user/:userId/modification/password/captcha', auth.owner());
router.post('/api/v2/user/:userId/modification/password', auth.owner());
router.get('/api/v2/user/:userId/funds', auth.owner());
router.get('/api/v2/user/:userId/fundRecords', auth.owner());
router.get('/api/v2/user/:userId/userfund', auth.owner());
router.get('/api/v2/user/:userId/fundaccounts', auth.owner());
router.get('/api/v2/user/:userId/calendar', auth.owner());
router.get('/api/v2/user/:userId/stock_data', auth.owner());
router.get('/api/v2/user/:userId/agreement', auth.owner(), cacheUser('_AGREEMENT'));
router.post('/api/v2/user/:userId/saveAutobidConfig', auth.owner());
router.get('/api/v2/user/:userId/autobidConfig', auth.owner());
router.get('/api/v2/user/:userId/request', auth.user());
router.get('/api/v2/user/:userId/loans', auth.user());
router.get('/api/v2/user/:userId/invests', auth.user());
router.get('/api/v2/user/:userId/invest/list/:page/:pageSize', auth.user());
router.get('/api/v2/user/:userId/invests/purpose/:purpose', auth.user());
router.get('/api/v2/user/:userId/recharge/:orderId', auth.user());
router.get('/api/v2/user/:userId/certificates', auth.pass());
router.get('/api/v2/user/:userId/certificates/proofs', auth.pass());
router.get('/api/v2/user/:userId/authenticates', auth.owner());
router.put('/api/v2/user/:userId/authenticates/id', auth.client());
router.post('/api/v2/user/:userId/authenticates/upload', auth.owner());
router.get('/api/v2/user/:userId/invest/:investId/contract', auth.owner());
router.get('/api/v2/user/:userId/loan/:loanId/contract', auth.owner());
router.post('/api/v2/user/:userId/repay/:repayId', auth.owner());
router.post('/api/v2/user/:userId/feedback', auth.owner());
router.get('/api/v2/user/:userId/mobileGesture', auth.owner());
router.post('/api/v2/user/:userId/mobileGesture', auth.owner());
router.post('/api/v2/auth/social', auth.pass());
router.post('/api/v2/user/:userId/bind_social', auth.pass());
router.get('/api/v2/user/:userId/calculateWithdrawFee/:amount', auth.pass());
router.get('/api/v2/user/:userId/userInvitation/list/:page/:pageSize', auth.owner());
router.get('/api/v2/user/:userId/userInvitation/edit', auth.owner());
router.post('/api/v2/user/:userId/saveAutobidConfig', auth.owner());
router.get('/api/v2/user/:userId/autobidConfig', auth.owner());
router.get('/api/v2/user/:userId/autoBid', auth.owner());
router.get('/api/v2/user/:userId/autoBidHistory', auth.owner());
router.get('/api/v2/user/:userId/cancelAutoBid', auth.owner());
router.post('/api/v2/user/:userId/updateAutobidConfig', auth.owner());
router.get('/api/v2/user/mobile/:mobile', auth.pass());
router.get('/api/v2/user/:userId/cancelDefaultAccount/:accountId', auth.owner());
function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
}

// 活动预约
router.get('/api/v2/user/:userId/appoint/activity', auth.user());
router.get('/api/v2/user/:userId/inviteCode', auth.owner());
router.get('/api/v2/user/:userId/invite', auth.owner());
// 邮箱认证
router.post('/api/v2/user/authenticateEmail', auth.user());
