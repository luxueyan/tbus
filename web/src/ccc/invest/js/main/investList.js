/*jshint multistr: true */

"use strict";

var i18n = require('@ds/i18n')['zh-cn'];

var InvestListService = require('ccc/invest/js/main/service/list')
    .InvestListService;
var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/jquery.easy-pie-chart.js')
require('ccc/global/js/jquery.page.js');

var params = {
    pageSize: 8,
    status: '',
    //minDuration: 0,
    //maxDuration: 100,
    //minRate: 0,
    //maxRate: 100,
    currentPage: 1,
    //minAmount: 0,
    //maxAmount: 100000000,
    //minInvestAmount: 1,
    //maxInvestAmount: 100000000,
};

function jsonToParams(params) {
    var str = '';
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            str += '&' + key + '=' + params[key];
        }
    }
    return str;
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

function formatItem(item) {
    var purposeMap = {
        "SHORTTERM": "短期周转",
        "PERSONAL": "个人信贷",
        "INVESTMENT": "投资创业",
        "CAR": "车辆融资",
        "HOUSE": "房产融资",
        "CORPORATION": "企业融资",
        "OTHER": "其它借款"
    };

    item.rate = item.rate / 100;
    item.deductionRate = item.loanRequest.deductionRate / 100;
    item.basicRate = item.rate - item.deductionRate;
    item.purpose = purposeMap[item.purpose];
    if (item.investPercent * 100 > 0 && item.investPercent * 100 < 1) {
        item.investPercent = 1;
    } else {
        item.investPercent = parseInt(item.investPercent * 100, 10);
    }
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
        item.amountUnit = '万';
        item.amount = (item.amount / 10000);
    } else {
        item.amountUnit = '元';
    }

    if (item.status == "OPENED") {
        item.leftTime = formateLeftTime(item.timeLeft);
        item.open = true;
    } else if (item.status == "SCHEDULED") {
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

function parseLoanList(list) {
    for (var i = 0; i < list.length; i++) {
        list[i] = formatItem(list[i]);
        var method = list[i].method;
        var methodFmt = i18n.enums.RepaymentMethod[method][0];
        list[i].methodFmt = methodFmt;
        list[i].titleLength = replaceStr(list[i].title);
        list[i].FminAmount = utils.format.amount(list[i].loanRequest.investRule.minAmount, 2);
        list[i].balance = utils.format.amount(list[i].balance, 2);

    }
    return list;
}

function replaceStr(str) {
    return str.replace(/[^\x00-xff]/g, 'xx').length;
}


InvestListService.getLoanListWithCondition(jsonToParams(params), function (res) {
    console.log(res)

    parseLoanList(res.results);
    var listFixed = [], listFloat = [];
    for (var i = 0; i < res.results.length; i++) {
        if (res.results[i].loanRequest.productKey == 'GDSY') {
            listFixed.push(res.results[i]);
        } else if (res.results[i].loanRequest.productKey == 'XELC') {
            listFloat.push(res.results[i]);
        }
    }
    // 固定收益
    var listRactive = new Ractive({
        el: ".fixedPro",
        template: require('ccc/invest/partials/fixedPro.html'),
        data: {
            list: (listFixed.slice(0, 3)),
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });
    // 浮动收益
    var listRactive = new Ractive({
        el: ".floatPro",
        template: require('ccc/invest/partials/floatPro.html'),
        data: {
            list: (listFloat.slice(0, 1)),
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });
    ininconut();
});


if (CC.key) {
    params.product = CC.key;
    var investRactive = new Ractive({
        el: ".list_box",
        template: require('ccc/invest/partials/list.html'),
        data: {
            list: [],
            RepaymentMethod: i18n.enums.RepaymentMethod, // 还款方式
            user: CC.user,
            key: CC.key,
            num: CC.num
        },
        onrender: function () {
            var that = this;
            InvestListService.getLoanListWithCondition(jsonToParams(params), function (res) {
                that.set('list', parseLoanList(res.results));
                that.renderPager(res, params.currentPage, that)
            });

        },
        oncomplete: function () {
            var that = this;
            $('.sStatus li').click(function () {
                $(this).addClass("selected").siblings().removeClass("selected");
                var status = $(this).data("status");
                if (status == 'SCHEDULED') {
                    params.minDuration = 0;
                    params.maxDuration = 100;
                }
                params.status = status;
                params.currentPage = 1;
                that.onrender();
            });
        },
        renderPager: function (res, currentPage, obj) {
            if (!currentPage) {
                currentPage = 1;
            }

            function createList(len) {
                var arr = [];
                var i = parseInt(len / params.pageSize);
                if (len % params.pageSize > 0) {
                    i++;
                }
                for (var m = 0; m < i; m++) {
                    arr[m] = m + 1;
                }
                return arr;
            };

            var pagerRactive = new Ractive({
                el: '#invest-pager',
                template: require('ccc/invest/partials/pager.html'),
                data: {
                    totalPage: createList(res.totalSize),
                    current: currentPage
                }
            });
            pagerRactive.on('previous', function (e) {
                e.original.preventDefault();
                var current = this.get('current');
                currentPage = current - 1;
                if (current > 1) {
                    current -= 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender();
                }

            });
            pagerRactive.on('next', function (e) {
                e.original.preventDefault();
                var current = this.get('current');
                currentPage = current + 1;
                if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                    current += 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender();
                }
            });
            pagerRactive.on('page', function (e, page) {
                e.original.preventDefault();
                if (page) {
                    currentPage = page;
                } else {
                    currentPage = e.context;
                }
                this.set('current', currentPage);
                params.currentPage = currentPage;
                obj.onrender();
            });
        },
    });

}


//剩余时间
function ininconut() {

    $(".investbtn-time").each(function () {
        var t = $(this);
        var id = t.data("id");
        var openTime = t.data("open");
        var serverDate = t.data("serv");
        var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
        var textDay = leftTime.day ? leftTime.day + '天' : '';
        var interval = setInterval((function () {
            serverDate += 1000;
            var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
            var textDay = leftTime.day ? leftTime.day + '天' : '';
            if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                clearInterval(interval);
                t.prev().hide();
                //t.replaceWith('<a href="/loan/' + id + '" style="text-decoration:none"><div class="investbtn">立即投资</div></a>');
            } else {
                t.html('<span class="text" style="color:#666">距离结束：' +
                    '<span style="color:#e4262b">' + leftTime.day + '</span>天' +
                    '<span style="color:#e4262b">' + leftTime.hour + '</span>时' +
                    '<span style="color:#e4262b">' + leftTime.min + '</span>分' +
                    '<span style="color:#e4262b">' + leftTime.sec + '</span>秒</span>')
            }
        }), 1000);
    });
};
