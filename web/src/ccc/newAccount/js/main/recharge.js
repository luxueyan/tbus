'use strict';

var NETBANKS = require('ccc/global/js/modules/netBank');
require('ccc/global/js/modules/cccTab');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var banks = _.filter(NETBANKS, function (r) {
    return r.enable === true;
});

var corBanks = _.filter(NETBANKS, function (r) {
    return r.isSupportted === true;
});
var ractive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/recharge/recharge.html'),
    data: {
        loading: true,
        availableAmount: CC.user.availableAmount || 0,
        msg: {
            BANK_NULL: false,
            AMOUNT_NULL: false,
            AMOUNT_INVALID: false
        },
        pointNum:null,
        intNum:null,
        isNormal: false,
        banks: banks,
        corBanks: corBanks,
        isEnterpriseUser: CC.user.enterprise,
        bankCodeEnd: (function () {
            if(CC.user.enterprise) {
                return '-NET-B2B';
            }else {
                return '-NET-B2C';
            }
        })(),
        isBankCard: CC.user.bankCards.length,
        amountValue: 10000000,
        action: '/yeepay/onlineBankDeposit',
        showNum: 9,
        minAmount: 100
    },
    parseData:function(){
        var self = this;
        var availableAmount = self.get('availableAmount').toFixed(2)+'';
        console.log(availableAmount);
        var point = availableAmount.indexOf('.');
        if(point !== -1){
            var num = availableAmount.split('.');
            self.set({
                'intNum':num[0],
                'pointNum':num[1]
            })
        }
        console.log(num);
    },
    oncomplete: function () {
        var self = this;
        this.$help = $(this.el)
            .find('.help-block');
        this.$amount = $(this.el)
            .find('[name=rechargeValue]');
        this.$form = $(this.el)
            .find('form[name=rechargeForm]');

        this.on('changeValue', function (e) {
            self.set('msg', {
                BANK_NULL: false,
                AMOUNT_NULL: false,
                AMOUNT_INVALID: false
            });
            var value = $(e.node)
                .val();

            if (value === '') {
                self.set('msg.AMOUNT_NULL', true);
                return;
            }
//            if (value > 10){
//                self.set('msg.AMOUNT_NOTENOUGH',true);
//                return;
//            }

            if (!self.get('msg.AMOUNT_MULL')) {
                self.set('msg.AMOUNT_NULL', false);
            } else {
                self.set('msg.AMOUNT_NULL', true);
            }

            self.set('msg.AMOUNT_INVALID', !self.match($(e.node)
                .val()));

        });

        $(".bankwrap").delegate('.bankItem', 'click', function () {

            var classMap = ['ICBC','CCB','ABC','CMBCHINA','BOC','CEB','CMBC','ECITIC','GDB','PINGAN','HXB','POST','BCCB'];

            var code = $(this).data('cc');
            if ($.inArray(code,classMap) == -1) {
                ractive.set('showamountInfo', false);
            } else {
                ractive.set('showamountInfo', true);
                $("#" + code).show().siblings().hide();
            }
            $('.bankwrap .bankItem')
                .removeClass('currentBank');
            $(this)
                .addClass('currentBank');
            $('.bankwrap .bankItem')
            	.find('span.check')
            	.hide();
            $(this)
            	.find('span.check')
            	.show()

          	var type = $(this).parent().siblings('.methodwr').data('type');
		    if (type !== 'net') {
        		ractive.set('isNormal', true);
		        ractive.set('action', '/yeepay/deposit');
		    } else {
        		ractive.set('isNormal', false);
		        ractive.set('action', '/yeepay/onlineBankDeposit');
		    }
        });


    },

    match: function (v) {
        return v.match(/^[0-9]\d*(\.\d{0,2})?$/);
    }

});

ractive.parseData();

ractive.on('recharge_submit', function (e){
    var amount = this.get('amount');
    this.set('msg', {
        BANK_NULL: false,
        AMOUNT_NULL: false,
        AMOUNT_INVALID: false,
        BANKCODE_NULL: false,
        AMOUNT_NOTENOUGH : false,
    });

    if (amount === '') {
        console.log(amount=== '');
        e.original.preventDefault();
        this.$amount.focus();
        this.set('msg.AMOUNT_NULL', true);
        return false;
    }
//    else if (amount > 10 ) {
//        e.original.preventDefault();
//        this.set('msg.AMOUNT_NOTENOUGH', true);
//        this.$amount.focus();
//        return false;
//    }
    else if (!this.match(amount) || parseFloat(amount) > parseFloat(this.get('amountValue'))) {
        e.original.preventDefault();
        this.set('msg.AMOUNT_INVALID', true);
        this.$amount.focus();
        return false;
    }
    if (!this.get('isNormal')) {
        var code = this.get('bankCode');
        if (!code) {
            e.original.preventDefault();
            this.set('msg.BANKCODE_NULL', true);
            return false;
        }

    }

    Confirm.create({
        msg: '充值是否成功？',
        okText: '充值成功',
        cancelText: '充值失败',
        ok: function () {
            window.location.href = '/newAccount/fund/loanDeal';
        },
        cancel: function () {
            window.location.reload();
        }
    });
});

ractive.on('changeMethod', function (event) {
    var type = event.node.getAttribute('data-type');
    if (type !== 'net') {
        ractive.set('isNormal', true);
        ractive.set('action', '/yeepay/deposit');
    } else {
        ractive.set('isNormal', false);
        ractive.set('action', '/yeepay/onlineBankDeposit');
    }
});
ractive.on('showAll', function () {
	this.set('showNum', banks.length);
});
ractive.on('selectBank', function (event) {
    var code = event.node.getAttribute('data-cc');
    this.set('bankCode', code);
});
ractive.on('chooseBank', function (event) {
    var code = event.node.getAttribute('data-cc');
    this.set('bankCode', code);
});
