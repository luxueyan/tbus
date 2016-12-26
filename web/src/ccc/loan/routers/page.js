'use strict';
module.exports = function (router) {
    var ccBody = require('cc-body');
    var format = require('@ds/format');

    var requestId = '';

    router.get('/payment', function (req, res) {
        var clientIp = getClientIp(req);
        res.expose(clientIp, 'clientIp');

        var user = res.locals.user;
        res.expose(req.query.num, 'investNum')
        res.expose(req.query.loanId, 'loanId')
        res.expose(req.query.placementId, 'placementId')
        res.expose(user, 'user');
        res.render('payment', {
            investNum: req.query.num,
            loanId: req.query.loanId,
            placementId: req.query.placementId
        });
    });

// TODO 对id进行正则匹配
    router.get('/:id', async function (req, res) {
        var user = res.locals.user;
        var buffer = new Buffer(req.path);
        var backUrl = buffer.toString('base64');
        res.expose(backUrl, 'backUrl');
        // 交易密码
        if (res.locals.user) {
            var paymentPasswordHasSet = await req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
            res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;
        }

        var repayments = await req.uest('/api/v2/loan/' + req.params.id + '/repayments')
            .end()
            .then(function (r) {
                if (!!r.body.data) {
                    var repayments = [];
                    if (Array.isArray(r.body.data)) {
                        for (var i = 0; i < r.body.data.length; i++) {
                            repayments.push(r.body.data[i].repayment);
                        }
                        return repayments;
                    } else {
                        var data = r.body.data.repayments;
                        if (data && typeof data === 'object' && Array == data.constructor) {
                            return data;
                        }
                        repayments.push(r.body.data.repayments);
                        return repayments;//r.body.data.repayments;
                    }
                } else {
                    return [];
                }

            });

        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');

        _.assign(res.locals, {
            loans: req.uest(
                '/api/v2/loan/' + req.params.id)
                .end()
                .then(function (r) {
                    var result = parseLoan(r.body);

                    console.log('8888888888888888');
                    console.log(r.body);
                    console.log('8888888888888888');

                    result.userId = result.loanRequest.userId;
                    result.requestId = result.loanRequest.id;

                    res.locals.title = result.loanRequest.title + '-我的理财-汇财富';
                    res.locals.keywords = '汇利精选，固定收益，高收益理财产品，定期理财';
                    res.locals.description = '汇财富-我的理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

                    return result;


                }),
            invests: req.uest('/api/v2/loan/' + req.params.id + '/invests')
                .end()
                .then(function (r) {

                    for (var i = 0, l = r.body.length; i < l; i++) {
                        r.body[i].submitTime = moment(r.body[i].submitTime)
                            .format('YYYY-MM-DD HH:mm:ss');

                        if (/^XYJR_/.test(r.body[i].userLoginName)) {
                            r.body[i].userLoginName = r.body[i].userLoginName.replace('XYJR_', '手机用户');
                        } else if (r.body[i].userLoginName.indexOf('手机用户') === 0) {
                            var _name = r.body[i].userLoginName.substring(4).replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2');
                        } else {
                            if (r.body[i].userLoginName.length === 2) {
                                var _name = mask(r.body[i].userLoginName, 1);
                            } else {
                                var _name = mask(r.body[i].userLoginName, 2);
                            }
                        }

                        r.body[i].userLoginName = _name;
                    }
                    return r.body;
                }),
            //TODO 如何共享 loanRequestId 减少请求次数
            replay: repayments
        });
        res.expose(repayments, 'repayments');
        res.render('index', _.assign(res.locals, {
            totalInterest: repayments.reduce(function (p, r) {
                return p + (r && r.amountInterest || 0);
            }, 0)
        }));
        return false;
    });

    router.get('/loanRequest/:requestId/contract/template', function (req, res, next) {
        res.redirect('/api/v2/loan/loanRequest/' + req.params.requestId + '/contract/template');
        next();
    });

    router.post('/selectOption', ccBody, function (req, res) {
        var amount = parseInt(req.body.amount, 10);
        var months = parseInt(req.body.months, 10);
        var sendObj = {
            amount: amount,
            months: months
        };
        req.uest('post', '/api/v2/coupon/MYSELF/listCoupon')
            .type('form')
            .send(sendObj)
            .end()
            .then(function (r) {
                res.json(r.body);
            })
    });

    function parseLoan(loan) {

        var methodZh = {
            'MonthlyInterest': '按月付息到期还本',
            'EqualInstallment': '按月等额本息',
            'EqualPrincipal': '按月等额本金',
            'BulletRepayment': '一次性还本付息',
            'EqualInterest': '月平息'
        };

        var purposeMap = {
            'SHORTTERM': '短期周转',
            'PERSONAL': '个人信贷',
            'INVESTMENT': '投资创业',
            'CAR': '车辆融资',
            'HOUSE': '房产融资',
            'CORPORATION': '企业融资',
            'OTHER': '其它借款'
        };
        // console.log(loan)
        var SinvestPercent = (loan.investPercent * 100) + '';
        var SinvestPercentString = SinvestPercent.split('.');
        if (loan.status == 'SETTLED' || loan.status === 'FINISHED' || loan.status === 'FAILED') {
            loan.investPercent = "100";
        } else {
            if (SinvestPercentString[1]) {
                if (SinvestPercentString[1].substr(0, 2) == '00') {
                    loan.investPercent = SinvestPercentString[0];
                } else if (SinvestPercentString[1].substr(1, 1) == '0' || SinvestPercentString[1].substr(1, 1) == '') {
                    loan.investPercent = (loan.investPercent * 100).toFixed(1);
                } else {
                    loan.investPercent = (loan.investPercent * 100).toFixed(2);
                }
            } else {
                loan.investPercent = (loan.investPercent * 100);
            }
        }


        loan.rate = loan.rate / 100;
        loan.loanRequest.deductionRate = loan.loanRequest.deductionRate / 100;
        loan.basicRate = loan.rate - loan.loanRequest.deductionRate;
//    loan.dueDate = loan.timeout * 60 * 60 * 1000 + loan.timeOpen;
        if (loan.timeSettled) {
            loan.borrowDueDate = formatBorrowDueDate(loan.timeSettled, loan
                .duration);
            loan.timeSettled = moment(loan.timeSettled)
                .format('YYYY-MM-DD');
        } else {
            // 借款成立日
            loan.timeSettled = loan.dueDate + 1 * 24 * 60 * 60 * 1000;
            loan.borrowDueDate = formatBorrowDueDate(loan.timeSettled, loan
                .duration);
            loan.timeSettled = moment(loan.timeSettled)
                .format('YYYY-MM-DD');
        }
        loan.originalAmount = loan.amount;
        if (loan.amount >= 10000) {
            loan.aUnit = '万';
            loan.amount = (loan.amount / 10000);
        } else {
            loan.aUnit = '元';
        }
        loan.leftAmount = loan.balance;
        if (loan.leftAmount >= 10000) {
            loan.amountUnit = '万';
            loan.leftAmount = (loan.leftAmount / 10000);
        } else {
            loan.amountUnit = '元';
        }

        if (loan.loanRequest.investRule.minAmount >= 10000) {
            loan.minAmountUnit = '万元';
            loan.minAmount = loan.loanRequest.investRule.minAmount / 10000;
        } else {
            loan.minAmount = loan.loanRequest.investRule.minAmount;
            loan.minAmountUnit = '元';
        }

        loan.loanRequest.timeSubmit = moment(loan.loanRequest.timeSubmit)
            .format('YYYY-MM-DD');


        loan.method = methodZh[loan.method];
        loan.timeLeftStamp = loan.timeLeft;

        loan.timeLeft = formatLeftTime(loan.timeLeft);
        loan.purpose = purposeMap[loan.purpose];
        //格式化期限
        loan.months = loan.duration.totalMonths;
        if (loan.duration.days > 0) {
            if (typeof loan.duration.totalDays === "undefined") {
                loan.fduration = loan.duration.days;
            } else {
                loan.fduration = loan.duration.totalDays;
            }
            loan.fdurunit = "天";
        } else {
            loan.fduration = loan.duration.totalMonths;
            loan.fdurunit = "个月";
        }
        loan.timeOpen = moment(loan.timeOpen).format('YYYY-MM-DD');
        loan.timeFinished = moment(loan.timeFinished).format('YYYY-MM-DD');
        loan.timeout = loan.timeout / 24;
        loan.timeEnd = moment(loan.timeOpen).add(loan.timeout, 'days').format('YYYY-MM-DD');
        //console.log( "=====loan.timeFinished" + loan.timeFinished);
        //console.log( "=====loan.timeEnd" + loan.timeEnd);

        loan.valueDate = moment(loan.loanRequest.valueDate).format('YYYY-MM-DD');
        loan.dueDate = moment(loan.loanRequest.dueDate).format('YYYY-MM-DD');
        loan.dueDates = moment(loan.loanRequest.dueDate + 3 * 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
//    起息日
        loan.start1 = moment(loan.timeFinished).add(1, 'days').format('YYYY-MM-DD');
        loan.start2 = moment(loan.timeEnd).add(1, 'days').format('YYYY-MM-DD');
//    到息日
        loan.end1 = moment(loan.start1).add(loan.duration.totalDays, 'days').format('YYYY-MM-DD');
        loan.end2 = moment(loan.start2).add(loan.duration.totalDays, 'days').format('YYYY-MM-DD');

        //格式化序列号
        if (loan.providerProjectCode) {
            if (loan.providerProjectCode.indexOf('#') > 0) {
                var hh_project_code = loan.providerProjectCode.split('#');
                loan.fProjectType = hh_project_code[0];
                loan.fProjectCode = hh_project_code[1];
            } else {
                loan.fProjectType = '';
                loan.fProjectCode = loan.providerProjectCode;
            }
        }

        return loan;
    }

// TODO 支持format
    function formatLeftTime(leftTime) {
        var dd = Math.floor(leftTime / 1000 / 60 / 60 / 24);
        leftTime -= dd * 1000 * 60 * 60 * 24;
        var hh = Math.floor(leftTime / 1000 / 60 / 60);
        leftTime -= hh * 1000 * 60 * 60;
        var mm = Math.floor(leftTime / 1000 / 60);
        leftTime -= mm * 1000 * 60;
        var ss = Math.floor(leftTime / 1000);
        leftTime -= ss * 1000;
        var obj = JSON.stringify({
            dd: dd,
            hh: hh,
            mm: mm,
            ss: ss
        });

        return obj;
    }

    function formatBorrowDueDate(timeSettled, duration) {
        var borrowTime = moment(timeSettled)
            .format('YYYY-MM-DD');
        borrowTime = borrowTime.split('-');
        var year = parseInt(borrowTime[0], 10);
        var month = parseInt(borrowTime[1], 10);
        var day = parseInt(borrowTime[2]);
        var addMonth = month;
        if (duration) {
            addMonth = month + duration.totalMonths;
        }
        if (duration.days > 0) {
            return moment(timeSettled).add('days', duration.totalDays).format('YYYY-MM-DD');
        } else {
            if (!(addMonth % 12)) {
                //console.log(addMonth);
                year = Math.floor(addMonth / 12) - 1 + year;
                month = addMonth - (Math.floor(addMonth / 12) - 1) * 12;
            } else {
                year = Math.floor(addMonth / 12) + year;
                month = addMonth - Math.floor(addMonth / 12) * 12;
            }
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            return year + '-' + month + '-' + day;
        }
    }
}

function mask(str, s, l) {
    if (!str) {
        return '';
    }
    var len = str.length;
    if (!len) {
        return '';
    }
    if (!l || l < 0) {
        l = len === 2 ? 1 : len - 2;
    } else if (l > len - 1) {
        l = len - 1;
        s = !!s ? 1 : 0;
    }
    if (s > len) {
        s = len - 1;
    }
    str = str.substring(0, s) + (new Array(l + 1))
            .join('*') + str.substring(s + l);
    str = str.substring(0, len);
    return str;
}


function getClientIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}