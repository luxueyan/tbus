'use strict';

require('ccc/global/js/modules/tooltip');
// cccConfirm
var Confirm = require('ccc/global/js/modules/cccConfirm');
var popupInvestRactive = require('ccc/agreement/js/main/quickInvest').popupInvestRactive;
var popupRepayRactive = require('ccc/agreement/js/main/quickRepay').popupRepayRactive;

var accountService = require('ccc/account/js/main/service/account').accountService;

// /account/agreement 账户管理/无密协议
new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/agreement.html'),

    data: {
        expand: true,
        bindMsg: null,
        unbindMsg: null,
        agreement: typeof CC.user.accountId === 'undefined' ? false : CC.user
            .agreement,
        accountId: CC.user.agreement ? CC.user.agreement : false
    },

    onrender: function () {
        // 重新 render的时候,重新调 tooltip
        // ractive.on('render',xxx) 不起作用,执行太快
        
        $("[data-toggle=tooltip]")
            .each(function () {
                $(this)
                    .tooltip({
                        container: $(this)
                            .parent()
                            .find(".tooltip-container")
                    });
            });

        $('.tips-left')
            .tooltip({
                container: 'body',
                placement: 'left'
            });
        
        var self = this;
        accountService.getLoanCount('?status=SETTLED&status=OVERDUE&status=BREACH',function (loanCount) {      
            self.set('loanCount',loanCount);                                
            });
    },
    check: function (inputs) {
        return _.some(inputs, function (input) {
            return input.checked && !input.disabled;
        });
    },
    oncomplete: function () {
        var self = this;
        var $bindForm = $(this.el)
            .find('[name=agreementForm]');
        var $unbindForm = $(this.el)
            .find('[name=unagreementForm]');

        this.on('close-msg', function () {
            self.set('bindMsg', null);
            self.set('unbindMsg', null);
        });

        this.on('maskInvestAgreement', function () {
            popupInvestRactive.show();
        });

        this.on('maskRepayAgreement', function () {
            popupRepayRactive.show();
        });
        $bindForm.submit(function (e) {
            var $this = $(this);
            self.set('bindMsg', null);
            if (!self.check($this.find('input'))) {
                self.set('bindMsg', '请选择要签订的协议');
                e.preventDefault();
                return false;
            }

            Confirm.create({
                msg: '绑定协议是否成功？',
                okText: '签订成功',
                cancelText: '签订失败',
                ok: function () {
                    window.location.reload();
                },
                cancel: function () {
                    window.location.reload();
                }
            });
        });

        $unbindForm.submit(function (e) {
            var $this = $(this);
            self.set('unbindMsg', null);
            if (!self.check($this.find('input'))) {
                self.set('unbindMsg', '请选择要解绑的协议');
                e.preventDefault();
                return false;
            }

            Confirm.create({
                msg: '解绑协议是否成功？',
                okText: '操作成功',
                cancelText: '操作失败',
                ok: function () {
                    window.location.reload();
                },
                cancel: function () {
                    window.location.reload();
                }
            });
        });
    }
});
