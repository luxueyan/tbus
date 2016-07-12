/*jshint multistr: true */

"use strict";
var i18n = require('@ds/i18n')['zh-cn'];

var InvestListService = require('ccc/creditList/js/main/service/list')
    .InvestListService;
var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/jquery.easy-pie-chart.js')

var params = {
    pageSize: 10,
    status: 'SCHEDULED',
    minDuration: 0,
    maxDuration: 100,
    minRate: 0,
    maxRate: 100,
    currentPage: 1
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

//function formateLeftTime(leftTime){
//    var diffmin = leftTime / 1000 / 60;
//    var str = "";
//    if (diffmin > 0) {
//        var _day = Math.ceil(diffmin / 60 / 24);
//        if( _day > 1){
//            str = _day+"天";
//        }else{
//            var _hour = Math.ceil(diffmin / 60);
//            if(_hour > 1){
//                str = _hour+"小时";
//            }else{
//                str = Math.ceil(diffmin)+"分";
//            }
//        }
//    }else {
//        var sec = Math.ceil(leftTime / 1000);
//        str = sec+"秒";
//    }
//    return str;
//}

function formatItem(item) {
//    var purposeMap = {
//        "SHORTTERM" : "短期周转",
//        "PERSONAL" : "个人信贷",
//        "INVESTMENT" : "投资创业",
//        "CAR" : "车辆融资",
//        "HOUSE" : "房产融资",
//        "CORPORATION" : "企业融资",
//        "OTHER" : "其它借款"
//    };
        
//    item.rate = item.rate / 100;
//    item.purpose = purposeMap[item.purpose];
//    if (item.investPercent* 100 > 0 && item.investPercent * 100 < 1) {
//        item.investPercent = 1;
//    } else {
//      item.investPercent = parseInt(item.investPercent * 100, 10);
//    };
//    if (item.duration.days > 0) {
//        if (typeof item.duration.totalDays === "undefined") {
//            item.fduration = item.duration.days;                            
//        } else {
//            item.fduration = item.duration.totalDays;                            
//        }
//        item.fdurunit = "天";
//    } else {                        
//        item.fduration = item.duration.totalMonths;
//        item.fdurunit = "个月";
//    }
//    
//    if (item.amount >= 10000) {
//        item.amountUnit = '万';
//        item.amount = (item.amount / 10000);
//    } else {
//        item.amountUnit = '元';
//    }
    
//    if (item.status == "OPENED") {
//        item.leftTime = formateLeftTime(item.timeLeft);
//        item.open = true;
//    } else if (item.status == "SCHEDULED"){
//        item.scheduled = true;
//    } else {
//        item.finished = true;
//    }
    //格式化序列号
    if( item.providerProjectCode ){
        if( item.providerProjectCode.indexOf('#') > 0 ){
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
       // var methodFmt = i18n.enums.RepaymentMethod[method][0];
        //list[i].methodFmt = methodFmt;
		list[i].titleLength = replaceStr(list[i].title);
    }
    console.log("######");
    console.log(list);
    return list;
}
	
function replaceStr(str){
	return str.replace(/[^\x00-xff]/g,'xx').length;
}
	
InvestListService.getCreditassignData(function (res) {
    var investRactive = new Ractive({
        el:".invest-list-wrapper",
        template: require('ccc/creditList/partials/singleInvest.html'),
        data: {
            list: parseLoanList(res.results),
           // RepaymentMethod: i18n.enums.RepaymentMethod, // 还款方式
            user:CC.user
        }
    });
    //initailEasyPieChart();
    //ininconut();
    renderPager(res);


    $('.sTitou li').click(function () {
        if (!$(this).hasClass("selectTitle")) {
            $(this).addClass("s__is-selected").siblings().removeClass("s__is-selected");
            var minamount = $(this)
                .data('min-amount');
            var maxamount = $(this)
                .data('max-amount');

            params.currentPage = 1;
            params.minInvestAmount = minamount;
            params.maxInvestAmount = maxamount;
            render(params);
        }
    });

    $('.sDuration li').click(function () {
        if (!$(this).hasClass("selectTitle")) {
            $(this).addClass("s__is-selected").siblings().removeClass("s__is-selected");
            var minDuration = $(this)
                .data('min-duration');
            var maxDuration = $(this)
                .data('max-duration');

            params.currentPage = 1;
            params.minDuration = minDuration;
            params.maxDuration = maxDuration;
            render(params);
        }
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
            function (
                res) {
                investRactive.set('list', []);
                setTimeout(function () {
                    investRactive.set('list', parseLoanList(res.results));
					console.log(investRactive.get('list'));
                    //initailEasyPieChart();
                    //ininconut();
                    renderPager(res, params.currentPage);
                }, 1);
            });
    }

    function renderPager(res, current) {
        if (!current) {
            current = 1;
        }
        var pagerRactive = new Ractive({
            el: '#invest-pager',
            template: require('ccc/creditList/partials/pager.html'),
            data: {
                totalPage: createList(res.totalSize, current),
                current: current
            }
        });

        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                params.currentPage = current;
                render(params);
            }
        });

        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            this.set('current', current);
            params.currentPage = current;
            render(params);
        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage')
                .length - 1]) {
                current += 1;
                this.set('current', current);
                params.currentPage = current;
                render(params);
            }
        });
    }
});

function createList(len, current) {
    var arr = [];
    var i=parseInt(len/params.pageSize);
    if(len%params.pageSize>0){i++;}
    for(var m=0;m<i;m++){
         arr[m] =  m + 1;
    }
    return arr;
};