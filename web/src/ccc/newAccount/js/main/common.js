'use strict';

var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var navRactive = new Ractive({
    el: '.account-nav',
    template: require('ccc/newAccount/partials/nav.html'),
    data: {
        showInvestToggleMenu: false,
        showAccountToggleMenu: false,
        showFundToggleMenu: false
    },
    oninit: function () {
        var location = window.location.pathname.split('/');

        this.set('isMMC', CC.user.isMMC);
        this.set('financialShow', false);

        if (location.length <= 3) {
            var tab = location[location.length - 1];
            this.set(tab, true);
        } else {
            var tab = location[location.length - 2];
            var menu = location[location.length - 1];
            this.set(tab, true);
            this.set(menu, true);
            if (tab === 'home' || tab === 'fixed') {
                this.set('showHomeToggleMenu', true);
            } else if (tab === 'fund') {
                this.set('showFundToggleMenu', true);
            } else {
                this.set('showAccountToggleMenu', true);
            }
        }
    }
});

navRactive.on('toggleMenu', function (event) {
    var toggleMenu = event.node.getAttribute('data-toggle');
    this.set(toggleMenu, !this.get(toggleMenu));
});

navRactive.on('financialShow', function () {
    if (location.pathname == "/newAccount/financial") {
        location.href = '/newAccount/financial';
    } else {
        navRactive.set('mobileNew', CC.user.mobile.slice(0, 3) + '****' + CC.user.mobile.slice(7, 11));
        navRactive.set('financialShow', true);
    }
});

var interval = null;

// 获取进入理财师密码
navRactive.on('getSMS', function () {
    $.post('/api/v2/user/' + CC.user.id + '/sendMMCCaptcha', {sMSType: 'CREDITMARKET_CHECK_MONEYMANAGING'}, function (r) {
        if (r.success == true) {
            $('#getSMS').attr("disabled", true);
            var msg = '$秒后重新发送';
            var left = 59;
            interval = setInterval((function () {
                if (left > 0) {
                    $('#getSMS').val(msg.replace('$', left--));
                } else {
                    $('#getSMS').val('获取验证码');
                    $('#getSMS').removeAttr("disabled");
                    clearInterval(interval);
                }
            }), 1000);
        } else {
            alert('验证码获取太过频繁，请稍后再次获取');
        }
    });

});

// 验证进入理财师密码
navRactive.on('financialSMSS', function () {
    if(this.get('smsCaptcha')){
        $.post('/api/v2/checkSMSCaptcha/' + CC.user.id, {
            smsType: 'CREDITMARKET_CHECK_MONEYMANAGING',
            smsCaptcha: this.get('smsCaptcha')
        }, function (r) {
            if (r.success) {
                location.href = '/newAccount/financial';
            } else {
                alert('验证码错误，请重新输入');
            }
        });
    }
    else{
        alert('验证码不能为空，请输入验证码');
    }
});

// 取消验证
navRactive.on('financialSMSN', function () {
    navRactive.set('smsCaptcha','');
    navRactive.set('mobileNew', null);
    navRactive.set('financialShow', false);
    $('#getSMS').val('获取验证码');
    $('#getSMS').removeAttr("disabled");
    clearInterval(interval);
});

if (location.pathname != '/newAccount/userInfo') {
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
}