'use strict';
var utils = require('ccc/global/js/lib/utils');
var Plan = require('ccc/global/js/modules/cccRepayments');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');

// 线上可用余额
var onlineAmount = CC.user.availableAmount,

    // 线上累计收益
    onlineInvestInterestAmount = CC.user.investStatistics.investInterestAmount || 0,
    onlineInvestInterestAmountI = parseInt(onlineInvestInterestAmount),
    onlineInvestInterestAmountF = parseFloatNew(onlineInvestInterestAmount),

    // 线上预计当前收益
    onlineOutstandingInterest = CC.user.investStatistics.outstandingInterest || 0,

    // 线上当前收益
    onlineCurrentIncome = CC.user.investStatistics.uncollectedIncome || 0,
    onlineCurrentIncomeI = parseInt(onlineCurrentIncome),
    onlineCurrentIncomeF = parseFloatNew(onlineCurrentIncome),

    // 线上全部收益
    onlineInterest = CC.user.investStatistics.investStatistics.dueAmount.interest || 0,

    // 线上冻结金额
    onlineFrozenAmount = CC.user.frozenAmount || 0,
    onlineFrozenAmountI = parseInt(onlineFrozenAmount),
    onlineFrozenAmountF = parseFloatNew(onlineFrozenAmount),

    // 线上冻结中的投标金额
    onlineInvestFrozenAmount = CC.user.investStatistics.investFrozenAmount || 0,

    // 线上在投本金(待收本金)
    onlineInvestAmount = CC.user.investStatistics.investStatistics.dueAmount.principal || 0,
    onlineInvestAmountI = parseInt(onlineInvestAmount),
    onlineInvestAmountF = parseFloatNew(onlineInvestAmount),

    // 线上在投本金(待收本金)+冻结金额
    onlineInvestAmountAll = onlineInvestAmount + onlineInvestFrozenAmount,

    // 线上总资产
    onlineAmount = onlineAmount + onlineCurrentIncome + onlineInvestAmount + onlineFrozenAmount,
    onlineAmountI = parseInt(onlineAmount),
    onlineAmountF = parseFloatNew(onlineAmount),

    // 线下投资总额
    offlineDataInvestAmount = CC.user.investStatistics.offlineDataInvestAmount,
    offlineDataInvestAmountI = parseInt(offlineDataInvestAmount),
    offlineDataInvestAmountF = parseFloatNew(offlineDataInvestAmount),

    // 线下资产收益总额
    offlineDataRevenueAmount = CC.user.investStatistics.offlineDataRevenueAmount,
    offlineDataRevenueAmountI = parseInt(offlineDataRevenueAmount),
    offlineDataRevenueAmountF = parseFloatNew(offlineDataRevenueAmount),

    // 线下总额
    offlineAmount = offlineDataInvestAmount + offlineDataRevenueAmount,
    offlineAmountI = parseInt(offlineAmount),
    offlineAmountF = parseFloatNew(offlineAmount),

    // 总本金
    totalInvestAmount = offlineDataInvestAmount + onlineInvestAmount,
    totalInvestAmountI = parseInt(totalInvestAmount),
    totalInvestAmountF = parseFloatNew(totalInvestAmount),

    // 总收益
    totalInvest = offlineDataRevenueAmount + onlineInterest,
    totalInvestI = parseInt(totalInvest),
    totalInvestF = parseFloatNew(totalInvest),

    // 总额
    totalAmount = onlineAmount + offlineAmount,
    totalAmountI = parseInt(totalAmount),
    totalAmountF = parseFloatNew(totalAmount),
    allNone = '0.00';

function parseFloatNew(data) {
    var dataNew = parseFloat(data).toFixed(2);
    return dataNew.split('.')[1];
}

var homeRactive = new Ractive({
    el: '.account-home-wrapper',
    template: require('ccc/newAccount/partials/home/home.html'),
    data: {
        user: CC.user,
        allNone: allNone,
        onlineFrozenAmountI: onlineFrozenAmountI,
        onlineFrozenAmountF: onlineFrozenAmountF,
        onlineInvestAmountI: onlineInvestAmountI,
        onlineInvestAmountF: onlineInvestAmountF,
        onlineInvestInterestAmountI: onlineInvestInterestAmountI,
        onlineInvestInterestAmountF: onlineInvestInterestAmountF,
        onlineCurrentIncomeI: onlineCurrentIncomeI,
        onlineCurrentIncomeF: onlineCurrentIncomeF,
        onlineAmountI: onlineAmountI,
        onlineAmountF: onlineAmountF,
        offlineDataRevenueAmountI: offlineDataRevenueAmountI,
        offlineDataRevenueAmountF: offlineDataRevenueAmountF,
        offlineDataInvestAmountI: offlineDataInvestAmountI,
        offlineDataInvestAmountF: offlineDataInvestAmountF,
        offlineAmountI: offlineAmountI,
        offlineAmountF: offlineAmountF,
        totalCurrentIncomeI: parseInt(onlineCurrentIncome + offlineDataRevenueAmount),
        totalCurrentIncomeF: parseFloatNew(onlineCurrentIncome + offlineDataRevenueAmount),
        totalInvestAmountI: parseInt(onlineInvestAmount + offlineDataInvestAmount),
        totalInvestAmountF: parseFloatNew(onlineInvestAmount + offlineDataInvestAmount),
        totalInvestI: totalInvestI,
        totalInvestF: totalInvestF,
        totalAmountI: totalAmountI,
        totalAmountF: totalAmountF,
        showOther: false
    },
    parseData: function () {
        var self = this;

        $.get('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('我的账户页广告栏'), function (data) {
            self.set('advertisement', data[0].content)
        });

        accountService.getUserInfo(function (res) {
            if (res.surveyScore) {
                self.set('riskBear', res.surveyScore.name);
            }
        });
    }
});
homeRactive.parseData();

homeRactive.on('countToggle', function () {
    if (homeRactive.get('showOther')) {
        homeRactive.set('showOther', false);
    } else {
        homeRactive.set('showOther', true);
    }
});

homeRactive.on({
    'showTip': function (event) {
        $($(event)[0].node.nextElementSibling).fadeIn(200);

    },
    hideTip: function (event) {
        $($(event)[0].node.nextElementSibling).fadeOut(0);
    }
});

var dataHigh = [{
    name: '浮动收益',
    y: 0,
}, {
    name: '固定收益',
    y: totalInvest,
}, {
    name: '精选基金',
    y: 0,
    sliced: true,
    selected: true
}];
var colorHigh = ["#9b8579", "#db0716", "#cea784", "#a40000"];
var statusHigh = true;

if (!totalInvest) {
    dataHigh = [{name: '浮动收益', y: 100,}];
    colorHigh = ["#999"];
    statusHigh = false;
}

$('#svg_cont').highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
    },
    title: {
        text: '当前配置百分比',
        style: {
            color: '#9b8579',
            fontSize: '18px'
        }
    },
    legend: {
        enabled: false
    },
    credits: {
        enabled: false,
    },
    tooltip: {
        enabled: statusHigh,
        headerFormat: '',
        pointFormatter: function () {
            return this.name + ': ' + Math.round(this.percentage) + '%'
        }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            colors: colorHigh,
            dataLabels: {
                enabled: statusHigh,
                distance: 10,
                connectorWidth: 0,
                formatter: function () {
                    return this.point.name + ' ' + Math.round(this.percentage) + '%';
                },
                style: {
                    color: '#7e8c8d',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    textShadow: 'none'
                }
            },
        }
    },
    series: [{
        type: 'pie',
        innerSize: '60%',
        data: dataHigh
    }]
});