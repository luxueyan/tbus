'use strict';

var loanParam;
var format = require('@ds/format');

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
};

module.exports = function (router) {
    router.get('/:id/:loanId', async function (req, res) {
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
        var creditassign =await req.uest('/api/v2/creditassign/creditAssignDetail/' + creditassignId)
            .then(function (r) {
            if(r.statusCode==200){
                if (r.body.creditassign.timeOpen) {
                    r.body.creditassign.timeOpen1 = moment(r.body.creditassign.timeOpen).format('YYYY-MM-DD');

                    r.body.creditassign.timeOpen = r.body.creditassign.timeOpen;

                    r.body.creditassign.serverDate = new Date().getTime();
                };
                r.body.creditassign.cstatus = assignStatus[r.body.creditassign.status];
                r.body.investPercent = Math.round(r.body.creditassign.bidAmount / r.body.creditassign.creditAmount * 100);
                return r.body;
            }else{
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
        res.expose(serverDate,'serverDate');
        res.expose(res.locals.user,'user');
        res.expose(req.data.path(),'backUrl');
        res.expose(creditassign,'creditassign');

        var LOAN = req.data.loan(loanId);
        _.assign(res.locals, {
            creditassign: creditassign,
            moment: moment,
            loan: LOAN.then(function (r) {
                r.loanRequest.purpose = usage[r.loanRequest.purpose];
                if (r.amount > 10000) {
                    r.amount = r.amount / 10000;
                    r.aunit = '万'
                } else {
                    r.aunit = '元';
                }
                r.loanRequestUser = format.mask(r.loanRequest.user.name);
                r.method = methodZh[r.method];

                r.investPercent = Math.round(r.investPercent * 100);
                switch (r.status) {
                case 'SCHEDULED':
                    r.investPercent = 0;
                    break;
                case 'OPENED':
                    r.investPercent = r.investPercent;
                    break;
                default:
                    r.investPercent = 100;
                }
                return r;
            }),
            FriskInfo: LOAN.then(function (r) {
                return r.loanRequest.riskInfo.replace(/<\/?[^>]*>/g, '');
            }),
            serverDate: serverDate,
            endDate: LOAN.then(function (r) {
                return moment(r.timeOpen).add(r.timeout, 'hours').format('YYYY-MM-DD');
            }),
            finishedDate: LOAN.then(function (r) {
                var now = moment().format('X');
                var dateTime = moment(now * 1000 + r.leftBidTime).format('YYYY-MM-DD');
                return moment(dateTime).add('days', r.duration.totalDays).format('YYYY-MM-DD');
            }),
            fduration: LOAN.then(function (r) {
                var ret = {
                    value: '',
                    ext: '',
                    valueD: '',
                    extD: ''
                };
                if (r.duration.days > 0) {
                    if (typeof r.duration.totalDays === "undefined") {
                        ret.value = r.duration.days;
                        ret.ext = "天";
                    } else if (r.duration.totalMonths != 0) {
                        ret.value = r.duration.totalMonths;
                        ret.ext = "个月";
                        ret.valueD = r.duration.days;
                        ret.extD = "天";
                    } else {
                        ret.valueD = r.duration.days;
                        ret.extD = "天";
                    }
                } else {
                    ret.value = r.duration.totalMonths;
                    ret.ext = "个月";
                }
                return ret;
            }),
            invests: req.data.invests(loanId),
            repayments: req.data.repayments(loanId)
        });

        var loanParam=await LOAN.then(function (loan) {
            return {
                rule: {
                    min: loan.loanRequest.investRule.minAmount,
                    max: loan.loanRequest.investRule.maxAmount,
                    step: loan.loanRequest.investRule.stepAmount,
                    balance: loan.balance
                },
                duration: loan.duration.totalMonths || 0,
                title: loan.title,
                investPercent: loan.investPercent,
                amount: loan.amount,
                investAmount: loan.investAmount,
                timeLeft: loan.timeLeft,
                status: loan.status,
                method: loan.method,
                id: loan.id,
                userId: loan.loanRequest.userId,
                requestId: loan.loanRequest.id,
                timeElapsed: loan.timeElapsed,
                bidNumber: loan.bidNumber,
                timeOpen: loan.timeOpen,
                timeout: loan.timeout,
                dueration: loan.duration,
                rate: loan.rate,
                serverDate: loan.serverDate || 0,
                percent: Fpercent(((loan.amount - loan.balance) / loan.amount) * 100, 1)
            };
        });
        res.expose(loanParam,'loan');

        res.render('creditDetail/detail');
        return false;
    });
}
