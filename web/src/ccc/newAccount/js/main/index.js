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
// 待收金额
var dueInAmount = CC.user.dueInAmount || 0;

// 冻结金额
var frozenAmount = CC.user.frozenAmount || 0;

// 总资产
var totalAmount = parseFloat(CC.user.availableAmount + dueInAmount + frozenAmount).toFixed(2);

var homeRactive = new Ractive({
	el: '.account-home-wrapper',
	template: require('ccc/newAccount/partials/home.html'),
	data: {
        user:CC.user,
		avaAmount : avaAmount,
		cAmount : parseFloat(CC.user.availableAmount).toFixed(2),
		investInterestAmount : investInterestAmount,
		outstandingInterest : outstandingInterest,
		totalAmount : totalAmount,
		cTotalAmount : parseFloat(CC.user.availableAmount + dueInAmount + frozenAmount).toFixed(2),
		dueInAmount : parseFloat(dueInAmount).toFixed(2),
		frozenAmount : parseFloat(frozenAmount).toFixed(2),
		isEnterprise : CC.user.enterprise
	},
    parseData:function(){
		var self = this;
        var investInterestAmount = self.get('investInterestAmount') + '';
        var avaAmount = self.get('avaAmount') + '';
		var totalAmount = self.get('totalAmount') + '';
		var check = totalAmount.indexOf('.');
        var check = avaAmount.indexOf('.');
        var check = investInterestAmount.indexOf('.');
		if (check == -1){
			self.set('totalAmount',parseInt(totalAmount));
            self.set('avaAmount',parseInt(avaAmount));
            self.set('investInterestAmount',parseInt(investInterestAmount));
            self.set('outstandingInterest',parseInt(outstandingInterest));
		}else{
			var amoutArray = totalAmount.split('.');
			self.set('totalAmount',parseInt(amoutArray[0]));
			self.set('moreAmount',amoutArray[1] );
            var amoutArray = avaAmount.split('.');
			self.set('avaAmount',parseInt(amoutArray[0]));
			self.set('morAmount',amoutArray[1]);
            var amoutArray = investInterestAmount.split('.');
			self.set('investInterestAmount',parseInt(amoutArray[0]));
			self.set('moAmount',amoutArray[1]);     
            var amoutArray = outstandingInterest.split('.');
			self.set('outstandingInterest',parseInt(amoutArray[0]));
			self.set('moreiAmount',amoutArray[1]);
		}
	}
});
homeRactive.parseData();



var pageSize = 6;
var page = 1;
var moment = require('moment');
var aaa = moment();
var currentTime = aaa._d;
var currentYear = currentTime.getFullYear();
var currentMonth = currentTime.getMonth()+1;
var currentDay = currentTime.getDate()+1;
var startTime = Date.UTC(currentYear,currentTime.getMonth(),1,-8,0,0);
var endTime = Date.UTC(currentYear,currentMonth,1,-8,0,0);
var investRactive = new Ractive({
    el:'.ccc-myinvest-wrap',
    template: require('ccc/newAccount/partials/home/invest.html'),
    api: '/api/v2/user/MYSELF/investRepayments/$page/$pageSize?to='+endTime+'&from='+startTime+'&status=UNDUE',
    data:{
        totalSize:0,
        list:[]
    },
    onrender: function() {
		var self = this;
		this.getData(function(o) {
			self.setData(parseInvestData(o));
    		self.tooltip();
		});
	},
    getData :function(callback){
		var api = this.api;
		api = api.replace('$page', 1).replace('$pageSize', pageSize);
		$.get(api, function(o) {
			callback(o);
		}).error(function(o) {
			console.info('请求出现错误，' + o.statusText);
		});
    },
    setData: function (o) {
		this.set('totalSize', o.totalSize);
		this.set('pageOne', o.results);
		this.set('list', o.results);
		this.renderPager();
    },
    renderPager: function() {
		var self = this;
		
		$(this.el).find(".ccc-paging").cccPaging({
			total: self.get('totalSize'),
			perpage: pageSize,
			api: self.api.replace('$pageSize', pageSize),
			params: {
				pageFromZero: false,
				type: 'GET',
				error: function(o) {
					console.info('请求出现错误，' + o.statusText);
				}
			},
			onSelect: function(p, o) {
				self.set('list', p > 1 ? parseInvestData(o).results : self.get('pageOne'));
			}
		});
	},
	tooltip: function() {
		$('.tips-top').tooltip({
			container: 'body',
			placement: 'bottom'
		});
	}
});


var parseInvestData = function (o) {
	
	var res = o.data.results;
	var methodZh = {
        'MonthlyInterest': '按月付息到期还本',
        'EqualInstallment': '按月等额本息',
        'EqualPrincipal': '按月等额本金',
        'BulletRepayment': '一次性还本付息',
        'EqualInterest': '月平息'
    };
    
    for(var i = 0;i < res.length; i ++) {
		res[i].FavaAmount = utils.format.amount(CC.user.availableAmount, 2);
    	res[i].repayMethod = methodZh[res[i].repayment.invest.repayMethod];
    }

    return o.data;
};


// chart
var Chart = require('chart.js/Chart');
new Ractive({
	el: '.svg_cont1',
	template: require('ccc/newAccount/partials/home/chart.html'),
	data: {
		total: utils.format.amount(totalAmount, 2),
		investInterestAmount: utils.format.amount(investInterestAmount, 2),
		hasMoney: (avaAmount || dueInAmount || frozenAmount),
		avaAmount: utils.format.amount(avaAmount, 2),
		dueInAmount: utils.format.amount(dueInAmount, 2),
		frozenAmount: utils.format.amount(frozenAmount, 2),
		chart: {
			width: 170,
			height: 170
		}
	},
	oncomplete: function() {
		//console.log('isIE', isIE, this.get('isIE'));
		if (this.get('hasMoney')) {
			this.renderChart();
		}
	},
	renderChart: function() {
		var ctx = $("#ccc-chart").get(0).getContext('2d');
		var helpers = Chart.helpers;

		// TODO, get data from backend
		var data = [
			{
				value: avaAmount,
				color: '#46BFBD',
				highlight: '#5AD3D1',
				label: this.setLabel('可用余额(￥)', avaAmount)
			},
			{
				value: dueInAmount,
				color: "#FDB45C",
				highlight: "#FFC870",
				label: this.setLabel('待收本息(￥)', dueInAmount)
			},
			{
				value: frozenAmount,
				color: "#5b90bf",
				highlight: "#6A96BD",
				label: this.setLabel('冻结资金(￥)', frozenAmount)
			}];
		var investChart = new Chart(ctx).Doughnut(data, {
			animation: false,
			tooltipTemplate: '<%= (100*value/'+totalAmount+').toFixed(2) %>%',
			showTooltips: true,
			//legendTemplate: 'xx'
		});

		var legendHolder = document.createElement('div');
		legendHolder.innerHTML = investChart.generateLegend();

		helpers.each(legendHolder.firstChild.childNodes, function (legendNode, index) {
			helpers.addEvent(legendNode, 'mouseover', function () {
				var activeSegment = investChart.segments[index];
				activeSegment.save();
				activeSegment.fillColor = activeSegment.highlightColor;
				investChart.showTooltip([activeSegment]);
				activeSegment.restore();
			});
		});
		helpers.addEvent(legendHolder.firstChild, 'mouseout', function () {
			investChart.draw();
		});

		investChart.chart.canvas.parentNode.parentNode.appendChild(legendHolder.firstChild);
	},
	setLabel: function(text, value) {
		return text + '<em>' + utils.format.amount(value, 2) + '</em>';
	}
});



