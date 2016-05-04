'use strict';

var utils = require('ccc/global/js/lib/utils');
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/cccPaging');

var tpl = {
	loan: require('ccc/newAccount/partials/loan/loan.html'),
	today: require('ccc/newAccount/partials/loan/today.html'),
	undue: require('ccc/newAccount/partials/loan/undue.html'),
	repayed: require('ccc/newAccount/partials/loan/repayed.html'),
	overdue: require('ccc/newAccount/partials/loan/overdue.html')
};

// 还款提示
var repayConfirmTpl = require('ccc/newAccount/partials/loan/repayConfirm.html');

// 还款明细tpl
var repayDetailTpl = require('ccc/newAccount/partials/loan/repayDetail.html');

// 逾期罚息tpl
var overDueFeeTpl = require('ccc/newAccount/partials/loan/overdueFee.html');

function getCurrentType () {
	var location = window.location.pathname.split('/');
	return location[location.length-1];
};

$('ul.tabs li a').on('click', function() {
	var type = $(this).parent().data('type');
	init(type);
});

var RACTIVE = {
	loan: null,
	today: null,
	undue: null,
	repayed: null,
	overdue: null
};

var pageSize = 10;

function init(type) {
	
	if (RACTIVE[type] === null) {
		RACTIVE[type] = new Ractive({
			el: '.panel-loan',
			template: tpl[type],
			size: pageSize,
			api: '/api/v2/user/MYSELF/loans?page=$page&pageSize=$size&type='+type,
			data: {
				loading: true,
				list: [],
				total: 0
			},
			onrender: function() {
				var self = this;
				this.getData(function(o) {
					self.set('total', o.totalSize);
					self.setData(self.parseData(o.results));
				});
			},
			getData: function(callback) {
				var self = this;
				$.get(this.api.replace('$page', 1).replace('$size', this.size), function(o) {
					self.pageOneData = o.results;
					callback(o);
				});
			},
			parseData: function(datas) {
				for (var i=0; i<datas.length; i++) {
					var o = datas[i];
					datas[i].FavaAmount = utils.format.amount(CC.user.availableAmount, 2);
					datas[i].Ftype = type;
					
					switch(type) {
						case 'loan':
							datas[i].Fduration = utils.format.duration(o.duration);
							datas[i].Frate = utils.format.percent((o.rate/100), 2);
							datas[i].Famount = utils.format.amount(o.amount, 2);
							datas[i].Fmethod = utils.i18n.RepaymentMethod[o.method][0];
							datas[i].Fstatus = utils.i18n.LoanStatus[o.status];
							break;
						case 'today':
							datas[i].Famount = utils.format.amount(o.repayment.amount, 2);
							datas[i].Frate = utils.format.percent((o.rate/100), 2);
							break;
						case 'undue':
							datas[i].Famount = utils.format.amount(o.repayment.amount, 2);
							datas[i].Frate = utils.format.percent((o.rate/100), 2);
							break;
						case 'repayed':
							datas[i].Famount = utils.format.amount(o.repayment.amount, 2);
							datas[i].Frate = utils.format.percent((o.rate/100), 2);
							datas[i].FrepayDate = moment(o.repayDate).format('YYYY-MM-DD');
							break;
						case 'overdue':
							datas[i].Famount = utils.format.amount(o.repayment.amount, 2);
							datas[i].Frate = utils.format.percent((o.rate/100), 2);
							break;
					}
						
				}
				return datas;
			},
			setData: function(o) {
				this.set('loading', false);
				this.set('list', o);
				this.renderPager();
			},
			renderPager: function() {
				var self = this;
				$(this.el).find(".ccc-paging").cccPaging({
					total: this.get('total'),
					perpage: self.size,
					api: this.api.replace('$size', this.size),
					params: {
						type: 'GET',
						error: function(o) {
							console.warn('请求出现错误，' + o.statusText);
						}
					},
					onSelect: function(p, o) {
						self.set('list', p > 1 ? self.parseData(o.results) : self.pageOneData);
					}
				});
			},
			oncomplete: function() {
				var self = this;
				
				this.on('repay', function(e) {
					var $this = $(e.node);
					var id = $this.parent().attr('data-id');
					var amount = $this.parent().attr('data-loan-repayment-amount');
					amount = parseFloat(amount);
					
					// repay amount + 0.1 是因为三方支付平台要求账户余额比实际还款金额多出至少0.1元
					// 挺诡异的
					var moneyEnough = (amount + 0.1 > CC.user.availableAmount) ? false : true;
					Tips.create({
						obj: $this,
						width: 270,
						height: moneyEnough ? 150 : 212,
						callback: function(container) {
							new Ractive({
								el: container,
								template: repayConfirmTpl,
								data: {
									moneyEnough: moneyEnough,
									avaAmount: utils.format.amount(CC.user.availableAmount, 2),
									okBtn: '确定'
								},
								oncomplete: function() {
									var self = this;
									this.on('close-detail', Tips.close);
									
									// 确认还款
									this.on('repay', function(e) {
										var $this = $(e.node);
										var $content = $(self.el).find('.repay-confirm');
										if ($this.hasClass('disabled')) {return;}
										$this.addClass('disabled');
										
										var url = '/api/v2/user/MYSELF/repay/'+id;
										self.set('okBtn', '操作中...');
										
										$.post(url, function(o) {
											console.info('repay-callback', o);
											if (o === 'SUCCESS') {
												$content.html('还款成功').addClass('align-center');
												setTimeout(function(){
													Tips.close();
												}, 1500);
											}
										}).error(function(o) {
											console.info('请求出现错误，' + o.statusText);
										});
									});
								}
							});
						}
					});
				});
				
				this.on('repay-detail', function(e) {
					var $this = $(e.node);
					var id = $this.parent().attr('data-id');
					
					self.getDetail(id, function(data){
					Tips.create({
						obj: $this,
						width: 270,
						height: type === 'overdue' ? 305 : 260,
						callback: function (container) {
							new Ractive({
								el: container,
								template: repayDetailTpl,
								data: {
									data: self.parseDetailData(data),
									overDueType: (type === 'overdue' ? true : false)
								},
								oncomplete: function() {
									this.on('close-detail', Tips.close);
								}
							});
						}
					});});
				});
				
				this.on('overdue-fee', function(e){
					var $this = $(e.node);
					var id = $this.parent().attr('data-id');
					
					self.getOverdueFee(id, function(data) {
					Tips.create({
						obj: $this,
						width: 270,
						height: 160,
						callback: function (container) {
							new Ractive({
								el: container,
								template: overDueFeeTpl,
								data: {
									data: self.parseOverDueFeeData(data)
								},
								oncomplete: function() {
									this.on('close-detail', Tips.close);
								}
							});
						}
					});});
				});
			},
			onchange: function() {
				Tips.close();
			},
			getDetail: function(id, callback) {
				var url = '/api/v2/loan/repay/' + id + (type === 'overdue' ? '/'+type: '') + '/detail';
				$.get(url + '?t=' + (new Date()).getTime(), function(o) {
					callback(o);
				});
			},
			parseDetailData: function(data) {
				if (type === 'overdue') {
					data.detail.Finterest = utils.format.amount(data.detail.interest, 2);
					data.detail.FloanFee = utils.format.amount(data.detail.loanFee, 2);
					data.detail.FmanageFee = utils.format.amount(data.detail.manageFee, 2);
					data.detail.Foutstanding = utils.format.amount(data.detail.outstanding, 2);
					data.detail.Fprincipal = utils.format.amount(data.detail.principal, 2);
					data.detail.Ftotal = utils.format.amount(data.detail.total, 2);
					data.penalty.Foverdue = utils.format.amount(data.penalty.overdue, 2);
					data.penalty.Fpenalty = utils.format.amount(data.penalty.penalty, 2);
					data.penalty.Ftotal = utils.format.amount(data.penalty.total, 2);
					data.Ftotal = utils.format.amount(data.total, 2);
				} else {
					data.Finterest = utils.format.amount(data.interest, 2);
					data.FloanFee = utils.format.amount(data.loanFee, 2);
					data.FmanageFee = utils.format.amount(data.manageFee, 2);
					data.Foutstanding = utils.format.amount(data.outstanding, 2);
					data.Fprincipal = utils.format.amount(data.principal, 2);
					data.Ftotal = utils.format.amount(data.total, 2);
				}
				return data;
			},
			getOverdueFee: function(id, callback) {
				var url = '/api/v2/loan/repay/' + id + '/overdue';
				$.get(url + '?t=' + (new Date()).getTime(), function(o) {
					callback(o);
				});
			},
			parseOverDueFeeData: function(data) {
				data.Foverdue = utils.format.amount(data.overdue, 2);
				data.Fpenalty = utils.format.amount(data.penalty, 2);
				data.Ftotal   = utils.format.amount(data.total,   2);
				return data;
			}
		});
	}
	//else { console.log('type of this ractive object has init', type); }
}
init(getCurrentType());
