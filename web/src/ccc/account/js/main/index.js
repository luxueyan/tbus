'use strict';

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/tooltip');

// calendar
var Calendar = require('ccc/global/js/modules/cccCalendar');

// chart
var Chart = require('chart.js/Chart');

// repayments
var Plan = require('ccc/global/js/modules/cccRepayments');

var accountService = require('ccc/account/js/main/service/account').accountService;

// create calendar
var calendar = new Calendar({
    container: '.account-calendar-wrap',
	renderEvents: true
});

// 设置当前日历的title
var setCurrentMonth = function () {
    var $currentMonth = $(".current-month-tit");
    $currentMonth.text(calendar.getDate('YYYY年M月份'));
};
setCurrentMonth();

accountService.getUserInfo(
    
    function(o){
        // console.log(o);
        $(".username").text(o.name);
    }
);

// calendar arrow switch
$('.btn.arrow').on('click', function () {
	var arrow = $(this)
		.data('arrow');
	switch (arrow) {
	case 'prev':
		calendar.prev();
		break;
	case 'next':
		calendar.next();
		break;
	case 'curr':
		calendar.curr();
		break;
	default:
		calendar.curr();
	}
	setCurrentMonth();
});

//投资总额
var totalInvestAmount = CC.user.investStatistics.totalAmount|| 0;

// 可用余额
var avaAmount = CC.user.availableAmount;

// 累计收益
var investInterestAmount = CC.user.investInterestAmount || 0;

// 待收金额
var dueInAmount = CC.user.dueInAmount || 0;

// 冻结金额
var frozenAmount = CC.user.frozenAmount || 0;
if (CC.investStatistics.currentMonthRepay){
var currentMonthInterest = parseFloat(CC.investStatistics.currentMonthRepay.interest).toFixed(2);
var currentMonthPrinipal = parseFloat(CC.investStatistics.currentMonthRepay.principal).toFixed(2);
}

// 总资产
var totalAmount = avaAmount + dueInAmount + frozenAmount;

var isIE = utils.ieCheck();

// chart
new Ractive({
    el: '.ccc-chart-wrap',
    template: require('ccc/account/partials/home/chart.html'),
	data: {
		total: utils.format.amount(totalAmount, 2),
		investInterestAmount: utils.format.amount(investInterestAmount, 2),
		totalInvestAmount: utils.format.amount(totalInvestAmount, 2),
		isIE: (isIE && isIE <=8 && isIE > 0) ? true : false,
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

var pageSize = 5;
var STATUS = ["SETTLED", "CLEARED", "OVERDUE", "BREACH"];

// my invest
new Ractive({
    el: '.ccc-myinvest-wrap',
    template: require('ccc/account/partials/home/invest.html'),
    data: {
        list: []
    },
	onrender: function(){
		var self = this;
		//var api = '/api/v2/user/MYSELF/invests?page=1&pageSize=' + pageSize;
		var status = '?status=SETTLED&status=OVERDUE&status=BREACH&status=FINISHED&status=PROPOSED&status=FROZEN&status=BREACH';
		var api = '/api/v2/user/MYSELF/invest/list/0/' + pageSize + status;
		request('GET', api)
            .end()
            .then(function (r) {
				r.body.results = self.parseData(r.body.results);
                self.set('list', r.body.results);
				self.tooltip();
           });
	},
	oncomplete: function() {
		// init Plan
		var plan = new Plan();
		
		// bind events
		this.on('getPlan', function(e) {
			var $this = $(e.node);
			
			var $tr = $this.parent().parent();
			var $plan = $tr.next();
			var investId = $this.attr('data-id');
			
			$tr.toggleClass('bg-light');
			$plan.toggle ();
			
			plan.render({
				container: $plan.find('td'),
				investId: investId,
				//debug: true,
				complete: function() {
					$this.data('loaded', true);
				}
			});
		});
	},
	parseData: function(datas){
		this.sortBySubmitTime(datas);
		for (var i=0; i<datas.length; i++) {
			var o = datas[i];
			datas[i].Fduration = utils.format.duration(o.duration);
			datas[i].Frate = utils.format.percent(o.rate/100, 2);
			datas[i].Famount = utils.format.amount(o.amount, 2);                 
			datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
            //前台不展示逾期,逾期标的展示给投资者时状态为已结算   
            if( o.status === 'OVERDUE' ){
                datas[i].Fstatus = utils.i18n.InvestStatus.SETTLED;
            }
			datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true:false;
			
			if (datas[i].hasContract) {
				var repay = this.getRepay(o.repayments);
				datas[i].Frepayed = utils.format.amount(repay.repayed, 2);
				datas[i].Funrepay = utils.format.amount(repay.unrepay, 2);
			}
		}
		return datas;
	},
	tooltip: function() {
		$('.tips-top').tooltip({
			container: 'body',
			placement: 'top'
		});
	},
	getRepay: function(datas) {
		// repayed, unrepay
		var repay = {
			repayed: 0,
			unrepay: 0
		};
		if (!datas) {
			return repay;
		}
		//var _repayed = 0, _unrepay = 0;
		for (var i=0; i<datas.length; i++) {
			var o = datas[i];
			var _total = o.repayment.amountPrincipal + o.repayment.amountInterest;
			if (o.status === 'REPAYED') {
				repay.repayed += _total;
			} else {
				repay.unrepay += _total;
			}
		}
		return repay;
	},
	sortBySubmitTime: function(datas) {
		if (datas.length === 0) {
			return datas;
		}
		datas.sort(function compare (a, b) {
			return b.submitTime - a.submitTime;
		});
	},
});
