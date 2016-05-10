'use strict';

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/cccPaging');
require('ccc/global/js/modules/tooltip');

// repayments lib
var Plan = require('ccc/global/js/modules/cccRepayments');

var Tab = {
	// 回款中 (SETTLED/OVERDUE/BREACH)
	HOLDING: {
		ractive: null,
		api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=SETTLED&status=OVERDUE&status=BREACH',
		template: require('ccc/newAccount/partials/invest/holding.html')
	},
	// 投资中 (FINISHED/PROPOSED/FROZEN) 
	INHAND: {
		ractive: null,
		api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=FINISHED&status=PROPOSED&status=FROZEN',
		template: require('ccc/newAccount/partials/invest/inhand.html')
	},
	// 已结束 (BREACH)
	CLEARED: {
		ractive: null,
		api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=CLEARED',
		template: require('ccc/newAccount/partials/invest/cleared.html')
	}
	// REALIZATION (可变现)
};

var STATUS = ["SETTLED", "CLEARED", "OVERDUE", "BREACH"];

function getCurrentType () {
	var location = window.location.pathname.split('/');
	return location[location.length-1];
};


function init (type) {
var tab = Tab[type];

if (tab.ractive === null) {
	tab.ractive = new Ractive({
		el: '.panel-invest',
		template: tab.template,
		size: 10, // pageSize
		data: {
			loading: true,
			total: 0,
			list: [],
			pageOne: null // 第一次加载的数据
		},
		getData: function(callback) {
			var api = tab.api.replace('$page', 0).replace('$size', this.size);
			$.get(api, function(o) {
				callback(o);
			}).error(function(o) {
				console.info('请求出现错误，' + o.statusText);
			});
		},
		setData: function(o) {
			this.set('loading', false);
			this.set('total', o.totalSize);
			this.set('pageOne', o.results);
			this.set('list', o.results);
			this.renderPager();
		},
		parseData: function(res) {
			var datas = res.results;
			// console.log('parse-data', datas);
			for (var i=0; i<datas.length; i++) {
				var o = datas[i];
				switch(type) {
					case 'HOLDING':
						datas[i].Fduration = utils.format.duration(o.duration);
						datas[i].Frate = utils.format.percent(o.rate/100, 2);
						datas[i].Famount = utils.format.amount(o.amount, 2);
						datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
            datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true:false;
						break;
					case 'INHAND':
						datas[i].Fduration = utils.format.duration(o.duration);
						datas[i].Frate = utils.format.percent(o.rate/100, 2);
						datas[i].Famount = utils.format.amount(o.amount, 2);
						datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
						datas[i].FrepayMethod = utils.i18n.RepaymentMethod[o.repayMethod][0];
						datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true:false;
						break;
					case 'CLEARED':
						datas[i].Fduration = utils.format.duration(o.duration);
						datas[i].Frate = utils.format.percent(o.rate/100, 2);
						datas[i].Famount = utils.format.amount(o.amount, 2);
						datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
						datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true:false;
						break;
				}

                //前台不展示逾期,逾期标的展示给投资者时状态为已结算
                if( o.status === 'OVERDUE' ){
                    datas[i].Fstatus = utils.i18n.InvestStatus.SETTLED;
                }

				if (datas[i].hasContract) {
					var repay = this.getRepay(o.repayments);
					datas[i].Frepayed = utils.format.amount(repay.repayed, 2);
					datas[i].Funrepay = utils.format.amount(repay.unrepay, 2);
				}
			}
			return res;
		},
		renderPager: function() {
			var self = this;
			this.tooltip();
			$(this.el).find(".ccc-paging").cccPaging({
				total: this.get('total'),
				perpage: self.size,
				api: tab.api.replace('$size', this.size),
				params: {
					pageFromZero: true,
					type: 'GET',
					error: function(o) {
						console.info('请求出现错误，' + o.statusText);
					}
				},
				onSelect: function(p, o) {

                    $('.repay-btn').each(function () {
                        $(this).parents("tr").next().hide();
                    });
					self.set('list', p > 0 ? self.parseData(o).results : self.get('pageOne'));
					self.tooltip();
				}
			});
		},
		onrender: function() {
			var self = this;
			this.getData(function(o) {
				self.setData(self.parseData(o));
			});
		},
		oncomplete: function() {
			// init plan
			var plan = new Plan();

			this.on('show-repayments', function(e) {
				var $this = $(e.node);
				var $tr = $this.parents("tr");
				var investId = $this.attr('data-id');

				$tr.toggleClass('bg-light');
				$this.parents("tr").next().toggle();

				plan.render({
					container: $this.parents("tr").next().find('td'),
					investId: investId
				});
			});
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
		}
	});
}
//else {}
}
init(getCurrentType());
