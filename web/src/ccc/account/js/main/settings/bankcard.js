"use strict";

var utils = require('ccc/global/js/lib/utils');
var LLPBANKS = require('ccc/global/js/modules/cccllpBanks');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('../service/account').accountService;
// 过滤银行卡，只显示enabled=true的
var banks = _.filter(LLPBANKS, function (r) {
    return r.enable === true;
});

if (CC.user.account) {
    CC.user.account.Faccount = utils.bankAccount(CC.user.account.account);
}

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/bankcard.html'),

    data: {
        status: banksabled.length ? 1 : 0,
        payment: CC.user.name ? true : false,
        banks: banks,
        msg: {
            BANK_NULL: false,
            CARD_NULL: false,
            CARD_INVALID: false
        },
        bank: '',
        bankAccount: banksabled || [],
        province: '',
        city: '',
        ifDel: false,
        authenticated: CC.user.authenticates.idauthenticated || false
    },
    oncomplete: function () {
        accountService.getProvince(function (res) {
            ractive.set('province', changeToList(res));
            var fProvince = ractive.get('myProvince') || '新疆';
            accountService.getCity(fProvince, function (res) {
                ractive.set('city', changeToList(res));
            });
        });
    }
});

ractive.on("validateCardNo", function () {
    var no = this.get("cardNo");
    if (!/^\d*$/.test(no)) {
        this.set("cardNoError", true);
    } else {
        this.set("cardNoError", false);
    }
});

ractive.on("validatePhoneNo", function () {
    var no = this.get("phoneNo");
    if (!/^\d*$/.test(no)) {
        this.set("phoneNoError", true);
    } else {
        this.set("phoneNoError", false);
    }
});

ractive.on('doDel', function () {
    this.set('ifDel',true);
});
ractive.on("bind-card-submit", function () {
    var cardNoError = this.get("cardNoError");
    var phoneNoError = this.get("phoneNoError");
    if (cardNoError || phoneNoError) {
        return false;
    }
    Confirm.create({
        msg: '绑卡是否成功？',
        okText: '绑卡成功',
        cancelText: '绑卡失败',
        ok: function () {
            window.location.reload();
        },
        cancel: function () {
            window.location.reload();
        }
    });
});

ractive.on("delete-card-submit", function (e) {
    e.original.preventDefault();
    Confirm.create({
        msg: '请先确认当前的投资待还本金全部结清，再进行解绑银行卡！',
        okText: '确定解绑',
        cancelText: '取消解绑',
        ok: function () {
            $('.btn-confirm-cancel').trigger('click');
            Confirm.create({
                msg: '删卡是否成功？',
                okText: '删卡成功',
                cancelText: '删卡失败',
                ok: function () {
                    window.location.reload();
                },
                cancel: function () {
                    window.location.reload();
                }
            });
            $('form').submit();
        },
        cancel: function () {
        }
    });
    
});

ractive.on('selectPro', function () {
    var province = this.get('myProvince');
    accountService.getCity(province, function (res) {
        ractive.set('city', changeToList(res));
    });
});

function changeToList(map) {
    var _arr = [];
    for (var key in map) {
        var tmp = {};
        tmp.key = key;
        tmp.val = map[key];
        _arr.push(tmp);
    }

    return _arr;
};