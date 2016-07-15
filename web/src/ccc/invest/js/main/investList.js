/*jshint multistr: true */

"use strict";

var i18n = require('@ds/i18n')['zh-cn'];

var InvestListService = require('ccc/invest/js/main/service/list')
    .InvestListService;
var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/jquery.easy-pie-chart.js')

var params = {
    pageSize: 8,
    status: '',
    minDuration: 0,
    maxDuration: 100,
    minRate: 0,
    maxRate: 100,
    currentPage: 1,
    minAmount: 0,
    maxAmount: 100000000,
    minInvestAmount: 1,
    maxInvestAmount: 100000000,
    //productKey:'GDSY'
};
//var indexnum = location.search.indexOf('=');
//var currentUrl = location.search.substring(indexnum+1);

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


    var investRactive = new Ractive({
        el: ".invest-list-wrapper",
        template: require('ccc/invest/partials/list.html'),
        data: {
            list: (res.results),
            RepaymentMethod: i18n.enums.RepaymentMethod, // 还款方式
            user: CC.user
        }
    });
    initailEasyPieChart();
    ininconut();


    pageChange(res);


    investRactive.on("mouseover mouseleave", function (e) {
        var hovering = e.name === "mouseover";
        this.set(e.keypath + ".hovering", hovering);
    });

    //标的类型
    //alert(currentUrl)
    //if(currentUrl == 'GDSY'){
    //    params.productKey = currentUrl;
    //    params.currentPage = 1;
    //    render(params);
    //}


    //标的状态
    $('.sStatus li').click(function () {
        $(this).addClass("selected").siblings().removeClass("selected");
        var status = $(this).data("status");
        if (status == 'SCHEDULED') {
            params.minDuration = 0;
            params.maxDuration = 100;
        }
        params.status = status;
        params.currentPage = 1;
        render(params);

    });

    $('.orderbyrules li').click(function () {
        var rules = $(this).data('rules');
        if (rules != 'normal') {
            if ($(this).hasClass('activeLi01')) {
                params.asc = false;
                console.log($(this).hasClass('activeLi01'));
                $(this).addClass('activeLi02').removeClass('activeLi01');
                $(this).siblings().removeClass('activeLi01');
                $(this).siblings().removeClass('activeLi02');
            } else {
                params.asc = true;
                console.log($(this).hasClass('activeLi01'))
                $(this).addClass('activeLi01').removeClass('activeLi02');
                $(this).siblings().removeClass('activeLi01');
                $(this).siblings().removeClass('activeLi02');
            }
            params.currentPage = 1;
            params.orderBy = rules;
        } else {
            params.currentPage = 1;
            delete params.orderBy;
            delete params.asc;
            $(this).addClass('activeLi01');
            $(this).siblings().removeClass('activeLi01');
            $(this).siblings().removeClass('activeLi02');
        }
        render(params);
    });

    function render(params) {
        InvestListService.getLoanListWithCondition(jsonToParams(params),
            function (res) {
                investRactive.set('list', []);
                setTimeout(function () {
                    investRactive.set('list', parseLoanList(res.results));
                    initailEasyPieChart();
                    ininconut();
                }, 1);
                pageChange(res)
            });
    }
});



function pageChange(res){
    $('.pages').createPage({
        pageCount: Math.ceil(res.totalSize / params.pageSize),//总页数
        current: params.currentPage,
        backFn: function (p) {
            params.currentPage = p;
            render(params);
        }
    });
}

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


function initailEasyPieChart() {
    ///////////////////////////////////////////////////////////
    // 初始化饼状图
    ///////////////////////////////////////////////////////////
    $(function () {
        var oldie = /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase());
        $(".easy-pie-chart").each(function () {
            var percentage = $(this).data("percent");
            var status = $(this).data("status");
            // 100%进度条颜色显示为背景色

            //var color = percentage != 100 && (status==='SETTLED'|| status==='CLEARED') ? "#f58220" : '#009ada';
            var color = (status === 'OPENED') ? '#ff6600' : "#ff6600";

            //            var color = percentage === 100 ? "#f58220" : '#f58220';
            $(this).easyPieChart({
                barColor: color,
                trackColor: '#ddd',
                scaleColor: false,
                lineCap: 'butt',
                lineWidth: 4,
                animate: oldie ? false : 1000,
                size: 50,
                onStep: function (from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });
            $(this).find("span.percentageNum").html(percentage + "%");
        });

    });
};


//InvestListService.getProductHot(function (list) {
//
//    var listHOT = [];
//    for (var i = 0; i < list.length; i++) {
//        if (list[i].loanRequest.productKey == 'HOT') {
//            listHOT.push(list[i]);
//        }
//    }
//
//    var investRactive = new Ractive({
//        el: "#s-contentR03",
//        template: require('ccc/invest/partials/hotproduct.html'),
//        data: {
//            list: listHOT,
//        }
//    });
//})

InvestListService.getstatusNum(function (res) {
    var getstatusNum = new Ractive({
        el: ".getstatusNum",
        template: require('ccc/invest/partials/statusNum.html'),
        data: {
            list: res,
        }
    });
});
