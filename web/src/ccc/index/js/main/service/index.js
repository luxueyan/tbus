/**
 * @file 首页数据交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

exports.IndexService = {
    getSummaryData: function (next) {
         request.get('/api/web/index/loans').then(function (res) {
            next(res.body);
        });
    },
    getLoanSummary: function (next) {
        this.getSummaryData(function (res) {
            next(parseLoanList(res));
        });
    },
    getLatestScheduled: function (next) {
        this.getSummaryData(function (res) {
            var list = [];
            for(var p in res){
                for(var i=0; i<res[p].length; i++){
                    if(res[p].status == 'SCHEDULED'){
                        list.push(res[p][i]);
                    }  
                }
            }
            if (list) {
                var scheduled = list;
                if (scheduled.length) {
                    for (var i = 0; i < scheduled.length; i++) {
                        for (var j = i + 1; j < scheduled.length; j++) {
                            if (scheduled[j].timeOpen <
                                scheduled[i].timeOpen) {
                                var temp = scheduled[i];
                                scheduled[i] = scheduled[j];
                                scheduled[j] = temp;
                            }
                        }
                    }
                    next(scheduled[0]);
                }
            }
        });
    },
};

function parseLoanList(loans) {
//    var max = 6;
    var loanList = [];
//    var openLoanLen = loans.open.length;
//    loans.open.sort(function compare(a, b) {
//            return b.timeOpen - a.timeOpen;
//        });
//    var scheduledLoanLen = loans.scheduled.length;
//    var finishedLoanLen = loans.finished.length;
//    
//    if (scheduledLoanLen >= max) {
//        addItem(loans.scheduled.slice(0, max));
//    } else {
//        addItem(loans.scheduled.slice(0, scheduledLoanLen));
//        if ((max - openLoanLen) <= scheduledLoanLen) {
//            addItem(loans.open.slice(0, max - scheduledLoanLen));
//        } else {
//            addItem(loans.open.slice(0, openLoanLen));
//            addItem(loans.finished.slice(0, max - openLoanLen -
//                scheduledLoanLen));
//            addItem(loans.settled.slice(0, max - openLoanLen -
//                scheduledLoanLen - finishedLoanLen));
//        }
//    }

    for(var p in loans){
        addItem(loans[p]);
    }

    function addItem(items) {
        if (!items.length) {
            return;
        }
        for (var i = 0, l = items.length; i < l; i++) {
            loanList.push(formatItem(items[i]));
        }
    }

    function formatItem(item) {
        item.rate = item.rate / 100;
        item.deductionRate = item.loanRequest.deductionRate / 100;
        item.basicRate = item.rate - item.deductionRate;
        item.investPercent =parseInt(item.investPercent * 100, 10);

        //格式化期限
        if (item.duration.days > 0) {
            if (typeof item.duration.totalDays === "undefined") {
                item.fduration = item.duration.days;
            } else {
                item.fduration = item.duration.totalDays;
            }
            item.fdurunit = "天";
        } else {
            item.fduration = item.duration.totalMonths;
            item.fdurunit = "个月";
        }
        if (item.amount >= 10000) {
            item.TamountUnit = '万';
            item.amount = (item.amount / 10000);
        } else {
            item.TamountUnit = '元';
        }
        if (item.balance >= 10000) {
            item.amountUnit = '万';
            item.balance = (item.balance / 10000);
        } else {
            item.amountUnit = '元';
        }
        if (item.loanRequest.investRule.minAmount >= 10000) {
            item.minAmountUnit = '万';
            item.minAmount = (item.loanRequest.investRule.minAmount / 10000);
        } else {
            item.minAmount = item.loanRequest.investRule.minAmount;
            item.minAmountUnit = '元';
        }
        if (item.status === "OPENED") {
            item.leftTime = formateLeftTime(item.timeLeft);
            item.open = true;
        } else if (item.status === "SCHEDULED") {
            item.scheduled = true;
        } else {
            item.finished = true;
        }
        //格式化序列号
        if (item.providerProjectCode) {
            if (item.providerProjectCode.indexOf('#') > 0) {
                var hh_project_code = item.providerProjectCode.split('#');
                item.fProjectType = hh_project_code[0];
                item.fProjectCode = hh_project_code[1];
            } else {
                item.fProjectType = '';
                item.fProjectCode = item.providerProjectCode;
            }
        }
        return item;
    }
    return loanList;
}

function formateLeftTime(leftTime) {
    var diffmin = leftTime / 1000 / 60;
    var str = "";
    if (diffmin > 0) {
        var _day = Math.ceil(diffmin / 60 / 24);
        if (_day > 1) {
            str = _day + "天";
        } else {
            var _hour = Math.ceil(diffmin / 60);
            if (_hour > 1) {
                str = _hour + "小时";
            } else {
                str = Math.ceil(diffmin) + "分";
            }
        }
    } else {
        var sec = Math.ceil(leftTime / 1000);
        str = sec + "秒";
    }
    return str;
}




