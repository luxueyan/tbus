'use strict';
var utils = require('ccc/global/js/lib/utils');
var Plan = require('ccc/global/js/modules/cccRepayments');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');

var repayDetailTpl = require('ccc/newAccount/partials/loan/repayDetail.html');
// 可用余额
var avaAmount = parseFloat(CC.user.availableAmount).toFixed(2);

// 累计收益
var investInterestAmount = parseFloat(CC.user.investStatistics.investInterestAmount || 0).toFixed(2);
// 预计收益
var outstandingInterest = parseFloat(CC.user.investStatistics.outstandingInterest || 0).toFixed(2);
// 当前收益
var currentIncome = parseFloat(CC.user.investStatistics.currentIncome || 0).toFixed(2);
// 待收金额
var dueInAmount = CC.user.dueInAmount || 0;

// 冻结金额
var frozenAmount = CC.user.frozenAmount || 0;
// 冻结金额
var investFrozenAmount = CC.user.investStatistics.investFrozenAmount || 0;
// 在投资金
var investAmount = parseFloat(dueInAmount + investFrozenAmount).toFixed(2);

// 总资产
var totalAmount = parseFloat(CC.user.availableAmount + dueInAmount + frozenAmount).toFixed(2);
//持有本息
var holdTotalAmount = parseFloat(CC.user.investStatistics.investStatistics.dueAmount.totalAmount|| 0).toFixed(2);
var homeRactive = new Ractive({
    el: '.account-home-wrapper',
    template: require('ccc/newAccount/partials/home/home.html'),
    data: {
        user: CC.user,
        avaAmount: avaAmount,
        cAmount: parseFloat(CC.user.availableAmount).toFixed(2),
        currentIncome: currentIncome,
        investInterestAmount: investInterestAmount,
        outstandingInterest: outstandingInterest,
        totalAmount: totalAmount,
        investAmount: investAmount,
        dueInAmount: parseFloat(dueInAmount).toFixed(2),
        frozenAmount: parseFloat(frozenAmount).toFixed(2),
        holdTotalAmount: holdTotalAmount

    },
    parseData: function () {
        var self = this;
        var investInterestAmount = self.get('investInterestAmount') + '';
        var avaAmount = self.get('avaAmount') + '';
        var totalAmount = self.get('totalAmount') + '';;
        var check = investInterestAmount.indexOf('.');
        if (check == -1) {
            self.set('currentIncome', parseInt(currentIncome));
            self.set('totalAmount', parseInt(totalAmount));
            self.set('avaAmount', parseInt(avaAmount));
            self.set('investInterestAmount', parseInt(investInterestAmount));
            self.set('outstandingInterest', parseInt(outstandingInterest));
            self.set('investAmount', parseInt(investAmount));
        } else {
            var amoutArray = holdTotalAmount.split('.');
            self.set('holdTotalAmount', parseInt(amoutArray[0]));
            self.set('hAmount', amoutArray[1]);

            var amoutArray = currentIncome.split('.');
            self.set('currentIncome', parseInt(amoutArray[0]));
            self.set('cMore', amoutArray[1]);

            var amoutArray = totalAmount.split('.');
            self.set('totalAmount', parseInt(amoutArray[0]));
            self.set('tAmount', amoutArray[1]);
            var amoutArray = investAmount.split('.');
            self.set('investAmount', parseInt(amoutArray[0]));
            self.set('iAmount', amoutArray[1]);
            var amoutArray = avaAmount.split('.');
            self.set('avaAmount', parseInt(amoutArray[0]));
            self.set('morAmount', amoutArray[1]);
            var amoutArray = investInterestAmount.split('.');
            self.set('investInterestAmount', parseInt(amoutArray[0]));
            self.set('iMore', amoutArray[1]);
            var amoutArray = outstandingInterest.split('.');
            self.set('outstandingInterest', parseInt(amoutArray[0]));
            self.set('oMore', amoutArray[1]);
        }

        $.get('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('我的账户页广告栏'), function (data) {
            //console.log(data[0].content)
            self.set('advertisement',data[0].content)
        })
        accountService.getUserInfo(function (res) {
            self.set('riskBear', res.surveyScore.name);
        });

    }
});
homeRactive.parseData();


$('#svg_cont').highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
    },
    title: {
        text: '当前配置百分比',
    },
    legend: {
        enabled: false
    },
    credits: {
        enabled: false,
    },
    tooltip: {
        headerFormat: '',
        pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            colors: ["#cea784", "#9b8579", "#a40000", "#db0716"],
            dataLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    fontSize: '16px',
                }
            },

        }
    },
    series: [{
        innerSize: '60%',
        data: [
            ['精选收益', 10.38],
            ['固定收益', 56.33],
            ['高端理财', 24.03],
            ['浮动收益', 4.77],
        ]
    }]
});