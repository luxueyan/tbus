'use strict';
var utils = require('ccc/global/js/lib/utils');
var Plan = require('ccc/global/js/modules/cccRepayments');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');

// 可用余额
var avaAmount = CC.user.availableAmount;
// 累计收益
var investInterestAmount = parseFloat(CC.user.investStatistics.investInterestAmount || 0).toFixed(2);
// 预计当前收益
var outstandingInterest = CC.user.investStatistics.outstandingInterest || 0;
// 当前收益(在投的未结息的利息)
var currentIncome = CC.user.investStatistics.investStatistics.dueAmount.interest || 0;
// 冻结金额
var frozenAmount = CC.user.frozenAmount || 0;
// 冻结中的投标金额
var investFrozenAmount = CC.user.investStatistics.investFrozenAmount || 0;
// 在投本金(待收本金)
var investAmount = CC.user.investStatistics.investStatistics.dueAmount.principal || 0;
// 总资产
var totalAmount = parseFloat(avaAmount + currentIncome + investAmount + frozenAmount).toFixed(2);

var homeRactive = new Ractive({
    el: '.account-home-wrapper',
    template: require('ccc/newAccount/partials/home/home.html'),
    data: {
        user: CC.user,
        currentIncome: parseFloat(currentIncome).toFixed(2),
        investInterestAmount: investInterestAmount,
        outstandingInterest: parseFloat(outstandingInterest).toFixed(2),
        totalAmount: totalAmount,
        investAmount: parseFloat(investAmount).toFixed(2),
        frozenAmount: parseFloat(frozenAmount).toFixed(2)
    },
    parseData: function () {
        var self = this;
        var investInterestAmount = self.get('investInterestAmount') + '';
        var totalAmount = self.get('totalAmount') + '';
        var investAmount = self.get('investAmount') + '';
        var outstandingInterest = self.get('outstandingInterest') + '';
        var currentIncome = self.get('currentIncome') + '';

        var check = investInterestAmount.indexOf('.');
        if (check == -1) {
            self.set('currentIncome', parseInt(currentIncome));
            self.set('totalAmount', parseInt(totalAmount));
            self.set('investInterestAmount', parseInt(investInterestAmount));
            self.set('outstandingInterest', parseInt(outstandingInterest));
            self.set('investAmount', parseInt(investAmount));
        } else {
            var amoutArray = currentIncome.split('.');
            self.set('currentIncome', parseInt(amoutArray[0]));
            self.set('cMore', amoutArray[1]);

            var amoutArray = totalAmount.split('.');
            self.set('totalAmount', parseInt(amoutArray[0]));
            self.set('tAmount', amoutArray[1]);
            var amoutArray = investAmount.split('.');
            self.set('investAmount', parseInt(amoutArray[0]));
            self.set('iAmount', amoutArray[1]);
            var amoutArray = investInterestAmount.split('.');
            self.set('investInterestAmount', parseInt(amoutArray[0]));
            self.set('iMore', amoutArray[1]);
            var amoutArray = outstandingInterest.split('.');
            self.set('outstandingInterest', parseInt(amoutArray[0]));
            self.set('oMore', amoutArray[1]);
        }

        $.get('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('我的账户页广告栏'), function (data) {
            //console.log(data[0].content)
            self.set('advertisement', data[0].content)
        })
        accountService.getUserInfo(function (res) {
            if (res.surveyScore) {
                self.set('riskBear', res.surveyScore.name);
            }
        });

    }
});
homeRactive.parseData();


homeRactive.on({
    'showTip': function (event) {
        $($(event)[0].node.nextElementSibling).fadeIn(200);

    },
    hideTip: function (event) {
        $($(event)[0].node.nextElementSibling).fadeOut(0);
    }
})


$('#svg_cont').highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
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
                distance: 15,
                connectorWidth: 0,
                style: {
                    fontWeight: 'bold',
                    fontSize: '16px',
                }
            },
            showInLegend: true,
            point:{
                events:{
                    legendItemClick:function(){
                        this.select();
                        this.show();
                    },
                }
            }
        }
    },
    series: [{
        type: 'pie',
        innerSize: '60%',
        data: [{
            name: '精选基金',
            y: 30,
            //sliced: true,
            //selected: true
        }, {
            name: '固定收益',
            y: 35,
        }, {
            name: '浮动收益',
            y: 15,
        }]
    }]
});