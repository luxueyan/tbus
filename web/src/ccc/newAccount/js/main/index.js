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
		avaAmount : avaAmount,
		cAmount : parseFloat(CC.user.availableAmount).toFixed(2),
		investInterestAmount : investInterestAmount,
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
		}else{
			console.log(investInterestAmount);
			var amoutArray = totalAmount.split('.');
			self.set('totalAmount',parseInt(amoutArray[0]));
			self.set('moreAmount',amoutArray[1] );
            var amoutArray = avaAmount.split('.');
			self.set('avaAmount',parseInt(amoutArray[0]));
			self.set('morAmount',amoutArray[1]);
            var amoutArray = investInterestAmount.split('.');
			self.set('investInterestAmount',parseInt(amoutArray[0]));
			self.set('moreiAmount',amoutArray[1]);
			console.log(amoutArray);
			console.log(this.get('moreiAmount'));
		}
	}
});
homeRactive.parseData();

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var infoRactive = new Ractive({
	el: '#userinfo',
	template: require('ccc/newAccount/partials/home/userinfo.html'),
	data: {
		user: CC.user,
		paymentPasswordHasSet : CC.user.paymentPasswordHasSet,
		isEnterprise : CC.user.enterprise,
		banksabled : banksabled.length? true : false,
		safetyProgress: 25,
		riskText: '中',
		vip:'普通用户',
		showVip: true
	},
	
	oninit: function () {
		var safetyProgress = 25;
		accountService.getVipLevel(function (r) {
			if(r.success && r.data) {
				infoRactive.set('vip', r.data.level.name);
			}
		});
		accountService.checkAuthenticate(function (r) {
			accountService.getUserInfo(function (res) {
				infoRactive.set('user', res.user);
				infoRactive.set('emailAuthenticated', r.emailAuthenticated);

				if (res.user.name) {
					safetyProgress += 25;
				}
				if (r.emailAuthenticated) {
					safetyProgress += 25;
				}
				if (infoRactive.get('paymentPasswordHasSet')) {
					safetyProgress += 25;
				}
				infoRactive.set('safetyProgress', safetyProgress)
				if (safetyProgress > 75) {
					infoRactive.set('riskText', '高');
				}
			});
		});

		accountService.getGroupMedal(function (r) {
			infoRactive.set('groupMedal', r);
		});
	}
});



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



//loan
var type = 'undue';
var undueTpl = require('ccc/newAccount/partials/loan/undue.html');
var loanRactive = new Ractive({
	el: '.ccc-myloan-wrap',
	template: undueTpl,
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
			self.tooltip();
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
	tooltip: function() {
		$('.tips-top').tooltip({
			container: 'body',
			placement: 'bottom'
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



infoRactive.on({
	'showTip':function(event){
		$($(event)[0].node.nextElementSibling).fadeIn(200);
		
	},
	hideTip:function(event){
		$($(event)[0].node.nextElementSibling).fadeOut(0);
	},
	showLevel:function(){
		var p = $('<p>点击查看会员体系详情</p>');
		p.css({backgroundColor:'black',
			   color:'white',
			   lineHeight:'24px',
			   padding:'0 5px 0 5px',
			   borderRadius:'5px',
			   opacity:0.7,
			   position:'absolute',
			   left:'105px',
			   top:0
			  })
		$('.level').after(p);
	},
	hideLevel:function(){
		$('.EdiT p').remove();
	}
})


//window.onload = function(){
//	$('.doCredit li a').mouseover(function(){
//		
//	}).mouseleave(function(){
//		$(this).siblings().fadeOut(0);
//	});
//}


infoRactive.on('guide',function(){
    $('.bankcard-gray').css('display','none');
	$('.account-bg').css('display','none');
}
);

//注册弹框
//弹出框
$('.pop-box').css({
    height:$(window).height(),
    width:$(window).width()
})

var path = location.search.slice(1);
if(path=='register'){
    $('.pop-box').fadeIn(1000);
    $('.register-success').fadeIn(1000);
}

$('.close-img').click(function(){
    $('.register-success').fadeOut(100);
    $('.pop-box').fadeOut(1000);
   
})