'use strict';
require('ccc/global/js/modules/tooltip');

var accountService = require('ccc/account/js/main/service/account').accountService;
var Box = require('ccc/global/js/modules/cccBox');
var Confirm = require('ccc/global/js/modules/cccConfirm');

$('ul.info li').tooltip({
    placement: 'top',
    container: $('.info-tooltip-container')
});

accountService.getUserInfo(function (res) {

    var enterprise = res.user.enterprise;
    if (!res.user) {
        res.user = {};
        res.user.name = '';
    }

    accountService.getTotalInters(function (res) {
        new Ractive({
            el: ".integration",
            template: '{{#if !interTotal}}0{{else}}{{interTotal}}{{/if}}',
            data: {
                interTotal: res
            }
        });
    });
    if (!enterprise) {
        if (!res.user.name && location.pathname != "/account/umpay") {
            var tpl = require('ccc/account/partials/paymentNotice.html');
            new Box({
                title: '提示',
                value: tpl.replace('$name', CC.user.name || CC.user.loginName),
                cla: 'corp-account-wrap',
                showed: function (ele, box) {}
            });
        }
    };
});