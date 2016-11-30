'use strict';

var utils = require('ccc/global/js/lib/utils');
var CommonService = require('ccc/global/js/modules/common').CommonService;
var UMPBANKS = require('ccc/global/js/modules/cccUmpBanks');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/account/js/main/service/account')
    .accountService;

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var ractive = new Ractive({
	el: '.ccc-recharge-wrap',
	template: require('ccc/account/partials/withdraw.html'),
	data: {
		banks: UMPBANKS,
		loadMessage: null,
		bankcards: banksabled || [],
		availableAmount: 0,
		msg: {
			AMOUNT_NULL: '请输入提现金额',
			AMOUNT_INVALID: '输入的金额有误',
			AMOUNT_POOR: '您的可用余额不足',
			AMOUNT_ALL: '不足100元时请全部提现',
			ERROR: '请求出现错误',

		},
		isSend: false,
		disabled: false,
		submitText: '确认提现',
		submitMessage: null,
		error: false,
		isEnterpriseUser: CC.user.enterprise,
    paymentPasswordHasSet : CC.user.paymentPasswordHasSet || false
	},
	oninit: function(){
		var self = this;
		
		var userInfo = CommonService.getUserInfo();
		userInfo.then(function(){
			self.set('availableAmount', CC.user.availableAmount);
		});
	},
	oncomplete: function(){
		var self = this;
		this.$help = $(this.el).find('.help-block');
		this.$amount = $(this.el).find('[name=amount]');
		this.$form = $(this.el).find('form[name=withdrawForm]');
		this.$pass = $(this.el).find('[name=paymentPassword]');
		this.$amount.focus();

		// set form action
		this.set('active', '/lianlianpay/withdraw');

		this.on('changeValue', function(e){
			var amount = $.trim($(e.node).val());

			if (amount === '') {
				self.set('submitMessage', null);
				self.set('error', false);
				return;
			} else if (!self.match(amount)) {
				self.set('submitMessage', self.get('msg.AMOUNT_INVALID'));
				return;
			} else if (parseFloat(amount) > CC.user.availableAmount) {
				self.set('submitMessage', self.get('msg.AMOUNT_POOR'));
				return;
			} else {
				self.set('submitMessage', null);
			}
		});

		this.on('checkPassword', function () {
			var password = this.get('paymentPassword');

			if (password === '') {
				self.set('submitMessage', '请输入交易密码');
				return;
			} else {
				accountService.checkPassword(password, function (r) {
					if (!r) {
						self.set('submitMessage', '交易密码错误');
						return;
					} else {
						self.set('submitMessage', null);
					}
				});
			}
		});
	},

	parseData: function(datas) {
		// 依据UMPBANKS的code来分组
		var BANKS =  _.groupBy(UMPBANKS, function(b) {
			return b.code;
		});

		// format data
		for (var i=0; i < datas.length; i++) {
			var o = datas[i];
			datas[i].account.imgPos = BANKS[o.account.bank][0].imgPos;
			datas[i].Faccount = utils.bankAccount(o.account.account);
		}
		return datas;
	},

	confirm: function(amount) {
		var self = this;

		if (this.$form.find('.post-btn').hasClass('disabled')) {
			return false;
		}

		this.set('submitText', '操作中...');
		this.set('disabled', true);

		var _FEE = null;
		var url = '/api/v2/user/MYSELF/calculateWithdrawFee/'+amount;
		$.ajax({
			type: 'GET',
			async: false,
			url: url,
			success: function(o){
				_FEE = o;
				self.set('submitText', '确认提现');
				self.set('disabled', false);
			},
			error: function(o){
				console.info('请求出现错误，' + o.statusText);
				self.set('error', true);
				self.set('submitText', '确认提现');
				self.set('disabled', false);
			}
		});

		if (_FEE === null) {
			return false;
		}

		// 实际到账<=0的情况
		if (_FEE.withdrawAmount <= 0) {
			var text = '实际到账金额为'+_FEE.withdrawAmount+'元，请调整取现金额';
			self.set('submitMessage', text);
			return false;
		}

		return confirm(
			'实际到账' + _FEE.withdrawAmount + '元 (收取' + _FEE.totalFee + '元提现手续费)\n确认提现吗？'
		);
	},

	match: function(v){
		return v.toString().match(/^([0-9][\d]{0,7}|0)(\.[\d]{1,2})?$/);
	}
});


ractive.on('sendCode', function (){

	if (!this.get('isSend')) {
		this.set('isSend', true);
		var smsType = 'CONFIRM_CREDITMARKET_WITHDRAW';
		CommonService.getMessage(smsType, function (r) {
			if (r.success) {
	            countDown();
	        }
		});
	}
});

ractive.on('withdrawForm', function (e) {
	e.original.preventDefault();
	this.set('submitMessage', null);
	var isAcess = false;
	var amount = this.get('amount');
	var pass = this.get('paymentPassword');

	if (amount === '') {
		this.set('submitMessage', this.get('msg.AMOUNT_NULL'));
	}

	else if (!this.match(amount)) {
		this.set('submitMessage', this.get('msg.AMOUNT_INVALID'));
		this.$amount.focus();
	}

	else if (parseFloat(amount) > CC.user.availableAmount) {
		this.set('submitMessage', this.get('msg.AMOUNT_POOR'));
		this.$amount.focus();
	}

	else if (this.get('error')) {
		this.set('submitMessage', this.get('msg.ERROR'));
	}

	else if (pass === '') {
		this.set('submitMessage', '请输入交易密码');
	}

	else if (pass !== '') {
		accountService.checkPassword(pass, function (r) {
			if (!r) {
				ractive.set('submitMessage', '交易密码错误');
			} else {
				ractive.set('submitMessage', null);
				if (ractive.confirm(amount)) {
					isAcess = true;
				}

				if (isAcess) {
					$('form').submit();
					Confirm.create({
						msg: '提现是否成功？',
						okText: '提现成功',
						cancelText: '提现失败',
						ok: function() {
							window.location.href = '/account/funds';
						},
						cancel: function() {
							window.location.reload();
						}
					});
				}
			}
		});
	}
});

function countDown() {
    $('.sendCode')
        .addClass('disabled');
    var previousText = '获取验证码';
    var msg = '$秒后重新发送';

    var left = 120;
    var interval = setInterval((function () {
        if (left > 0) {
            $('.sendCode')
                .html(msg.replace('$', left--));
        } else {
        	ractive.set('isSend', true);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
            clearInterval(interval);
        }
    }), 1000);
}
