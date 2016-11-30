'use strict';

var loanParam;
var format = require('@ds/format');
require('@ds/data');

function Fpercent(percent, offset) {
    percent = percent.toString();
    if (offset == undefined || offset == null) {
        offset = 2;
    }
    if (percent.indexOf('.') == -1) {
        return percent;
    } else {
        if (offset == 0) {
            return percent.substring(0, percent.indexOf("."));
        } else {
            return percent.substring(0, percent.indexOf(".") + (offset + 1));
        }
    }
}

module.exports = function (router) {
    router.get('/:id/:loanId', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        // 交易密码
        if (res.locals.user) {
            var paymentPasswordHasSet = await req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
            res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;
        }

        var creditassignId = req.params.id;
        var loanId = req.params.loanId;
        var serverDate = moment(new Date()).format('YYYY-MM-DD');
        var assignStatus = {
            "PROPOSED": "已申请",
            "SCHEDULED": "已安排",
            "FINISHED": "转让已满",
            "OPEN": "转让中",
            "FAILED": "转让未满",
            "CANCELED": "已取消"
        };
        var creditassign = await req.uest('/api/v2/creditassign/creditAssignDetail/' + creditassignId)
            .then(function (r) {
                if (r.statusCode == 200) {
                    if (r.body.creditassign.timeOpen) {
                        r.body.creditassign.timeOpen1 = moment(r.body.creditassign.timeOpen).format('YYYY-MM-DD');
                        r.body.creditassign.timeOpen = r.body.creditassign.timeOpen;
                        r.body.creditassign.serverDate = new Date().getTime();
                    }
                    r.body.creditassign.cstatus = assignStatus[r.body.creditassign.status];
                    r.body.investPercent = Math.round(r.body.creditassign.bidAmount / r.body.creditassign.creditAmount * 100);
                    return r.body;
                } else {
                    return null;
                }
            });

        var methodZh = {
            'MonthlyInterest': '按月付息到期还本',
            'EqualInstallment': '按月等额本息',
            'EqualPrincipal': '按月等额本金',
            'BulletRepayment': '一次性还本付息',
            'EqualInterest': '月平息'
        };
        var usage = {
            'SHORTTERM': '短期周转',
            'PERSONAL': '个人信贷',
            'INVESTMENT': '投资创业',
            'CAR': '车辆融资',
            'HOUSE': '房产融资',
            'CORPORATION': '企业融资',
            'OTHER': '其它借款'
        };
        res.expose(serverDate, 'serverDate');
        res.expose(res.locals.user, 'user');
        //res.expose(req.data.path(),'backUrl');
        res.expose(creditassign, 'creditassign');
        res.render('creditDetail/detail');
        return false;
    });

    router.get('/payment', function (req, res) {
        var clientIp = getClientIp(req);
        res.expose(clientIp, 'clientIp');
        res.render('payment');
    });
};

function getClientIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}