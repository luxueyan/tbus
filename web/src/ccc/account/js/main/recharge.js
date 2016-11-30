'use strict';
var NETBANKS = require('ccc/global/js/modules/netBank');
require('ccc/global/js/modules/cccTab');

var Confirm = require('ccc/global/js/modules/cccConfirm');

var accountService = require('ccc/account/js/main/service/account')
    .accountService;
var banks = _.filter(NETBANKS, function (r) {
    return r.enable === true;
});

var corBanks = _.filter(NETBANKS, function (r) {
    return r.isSupportted === true;
});

var ractive = new Ractive({
    el: '.ccc-tab-panels',
    template: require('ccc/account/partials/recharge.html'),
    data: {
        loading: true,
        availableAmount: CC.user.availableAmount || 0,
        msg: {
            BANK_NULL: false,
            AMOUNT_NULL: false,
            AMOUNT_INVALID: false
        },
        isNormal: false,
        banks: banks,
        corBanks: corBanks,
        isEnterpriseUser: CC.user.enterprise,
        amountValue: 10000000,
        action: '/lianlianpay/onlineBankDeposit'
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

            if (!self.get('msg.AMOUNT_MULL')) {
                self.set('msg.AMOUNT_NULL', false);
            } else {
                self.set('msg.AMOUNT_NULL', true);
            }

            self.set('msg.AMOUNT_INVALID', !self.match($(e.node)
                .val()));

        });

        $(".bankwrap .bankItem").click(function () {
            $(this)
                .addClass('currentBank')
                .siblings('.bankItem')
                .removeClass('currentBank');
        });

    },

    match: function (v) {
        return v.match(/^[0-9]\d*(\.\d{0,2})?$/);
    }

});

ractive.on('recharge_submit', function (e){
    var amount = this.get('amount');
    this.set('msg', {
        BANK_NULL: false,
        AMOUNT_NULL: false,
        AMOUNT_INVALID: false,
        BANKCODE_NULL: false
    });

    if (amount === '') {
        e.original.preventDefault();
        this.$amount.focus();
        this.set('msg.AMOUNT_NULL', true);
        return false;
    } else if (!this.match(amount) || parseFloat(amount) > parseFloat(this.get('amountValue'))) {
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
            window.location.href = '/account/funds';
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
        ractive.set('action', '/lianlianpay/deposit');
    } else {
        ractive.set('isNormal', false);
        ractive.set('action', '/lianlianpay/onlineBankDeposit');
    }
});

ractive.on('selectBank', function (event) {
    var code = event.node.getAttribute('data-code');
    this.set('bankCode', code);
});
