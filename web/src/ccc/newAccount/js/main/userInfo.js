"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var AlertBox = require('ccc/global/js/modules/cccPromiseBox');
// 可用余额
var avaAmount = parseFloat(CC.user.availableAmount).toFixed(2);
var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var infoRactive = new Ractive({
    el: '.user-nav',
    template: require('ccc/newAccount/partials/home/userinfo.html'),
    data: {
        user: CC.user,
        //paymentPasswordHasSet : CC.user.paymentPasswordHasSet,
        banksabled: banksabled.length ? true : false,
        safetyProgress: 25,
        riskText: '中',
        vip: '普通用户',
        showVip: true,
        greetingText: '',
        avaAmount: avaAmount,
        emailAuthenticated: false,
    },
    oninit: function () {
        var location = window.location.pathname.split('/');
        var tab = location[location.length - 2];
        var menu = location[location.length - 1];
        this.set(tab, true);
        this.set(menu, true);
        // 问候语
        var now = new Date();
        var hours = now.getHours();
        if (6 < hours && hours < 9) {
            this.set('greetingText', '早上好');
        } else if (9 <= hours && hours < 12) {
            this.set('greetingText', '上午好');
        } else if (12 <= hours && hours < 13) {
            this.set('greetingText', '中午好');
        } else if (13 <= hours && hours < 18) {
            this.set('greetingText', '下午好');
        } else {
            this.set('greetingText', '晚上好');
        }

        var safetyProgress = 25;
        accountService.getVipLevel(function (r) {
            if (r.success && r.data) {
                infoRactive.set('vip', r.data.level.name);
            }
        });
        accountService.checkAuthenticate(function (r) {
            infoRactive.set('paymentPasswordHasSet', r.paymentAuthenticated);
            infoRactive.set('emailAuthenticated', r.emailAuthenticated);
            ractive.set('paymentPasswordHasSet', r.paymentAuthenticated);
            accountService.getUserInfo(function (userinfo) {
                if (r.emailAuthenticated) {
                    ractive.set('email', userinfo.userInfo.user.email);
                }
                ractive.set('idNumber', formatNumber(userinfo.userInfo.user.idNumber));
                ractive.set('name', formatNumber(userinfo.userInfo.user.name));
                ractive.set('mobile', formatNumber(userinfo.userInfo.user.mobile));
            });
        });

        var self = this;
        var avaAmount = self.get('avaAmount') + '';
        var check = avaAmount.indexOf('.');
        if (check == -1) {
            self.set('avaAmount', parseInt(avaAmount));
        } else {
            var amoutArray = avaAmount.split('.');
            self.set('avaAmount', parseInt(amoutArray[0]));
            self.set('morAmount', amoutArray[1]);
        }
    }
});

infoRactive.on({
    'showTip': function (event) {
        $($(event)[0].node.nextElementSibling).fadeIn(200);
    },
    hideTip: function (event) {
        $($(event)[0].node.nextElementSibling).fadeOut(0);
    }
});
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
        var avaAmount = CC.user.availableAmount;
        var frozenAmount = CC.user.frozenAmount;
        var outstandingInterest = CC.user.outstandingInterest;
        var outstandingPrincipal = CC.user.outstandingPrincipal;
        var totalAmount = parseFloat(avaAmount + frozenAmount + outstandingInterest + outstandingPrincipal).toFixed(2);
        this.set('totalAmount', totalAmount);
    }
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

//显示弹框
ractive.on('show-pop', function () {
    var totalAmount = this.get('totalAmount');
    //var totalAmount = 0;
    if (totalAmount > 0) {
        ractive.set('total', true);
        $("#mask").css("display", "inline");
        $(".debank").css("display", "inline");

    } else {
        ractive.set('total', false);
        $("#mask").css("display", "inline");
        $(".debank").css("display", "inline");
    }
});
//关闭弹窗
ractive.on('makeSure', function () {
    $("#mask").css("display", "none");
    $(".debank").css("display", "none");
})
//删除卡片
ractive.on('delete-card', function () {
    var userId = CC.user.id;
    var banks = this.get('bankCards');
    var accountNumber = banks[0].account.account;
    var params = {
        userId: userId,
        accountNumber: accountNumber
    }
    accountService.deleteBank(params, function (r) {
        if (r.success) {
            alert('删卡成功！');
            window.location.reload();
        } else {
            alert('删卡失败！');
        }
    });
})


