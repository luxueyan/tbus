"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var AlertBox = require('ccc/global/js/modules/cccPromiseBox');
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/userInfo.html'),

    data: {
        agreement: typeof CC.user.accountId === 'undefined' ? false : CC.user.agreement,
        accountId: CC.user.agreement ? CC.user.agreement : false,
        idNumber: false,
        email: '',
        percent: 25,
        levelText: '弱',
        isEnterprise: CC.user.enterprise,
        bankCards: CC.user.bankCards,
    },
    init: function () {
        accountService.checkAuthenticate(function (r) {
            ractive.set('paymentPasswordHasSet', r.paymentAuthenticated);
            accountService.getUserInfo(function (userinfo) {
                console.log(r.emailAuthenticated);
                if (r.emailAuthenticated) {
                    ractive.set('email', userinfo.userInfo.user.email);
                }
                ractive.set('idNumber', formatNumber(userinfo.userInfo.user.idNumber));
                ractive.set('name', formatNumber(userinfo.userInfo.user.name));
                ractive.set('mobile', formatNumber(userinfo.userInfo.user.mobile));
            });
        });
    },
});

//ractive.init();

function formatNumber(number, left, right) {
    if (!number) {
        return '';
    }
    left = left || 3;
    right = right || 4;
    var tmp = '';
    for (var i = 0; i < number.length; i++) {
        if (i < left || (number.length - right) <= i) {
            tmp += number[i];
        } else {
            tmp += '*';
        }
    }
    return tmp;
}

//删除银行卡
ractive.on('delete-card', function () {
    var userId = CC.user.id;
    var banks = this.get('bankCards');
    var avaAmount = CC.user.availableAmount;
    var frozenAmount = CC.user.frozenAmount;
    var outstandingInterest = CC.user.outstandingInterest;
    var outstandingPrincipal = CC.user.outstandingPrincipal;
    var totalAmount = parseFloat(avaAmount + frozenAmount + outstandingInterest + outstandingPrincipal).toFixed(2);
    var accountNumber = banks[0].account.account;
    var params = {
        userId: userId,
        accountNumber: accountNumber
    }

    if (totalAmount > 0) {
        $("#mask").css("display", "inline");
        $(".debank").css("display", "inline");

    } else {
        accountService.deleteBank(params, function (r) {
            if (r.success) {
                alert('删卡成功！');
                window.location.reload();
            } else {
                alert('删卡失败！');
            }
        });
    }

});
//点击刷新
ractive.on('makeSure', function () {
    window.location.reload();
})
