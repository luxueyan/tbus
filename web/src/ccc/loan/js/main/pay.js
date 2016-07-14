var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/account/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var CccBox = require('ccc/global/js/modules/cccBox');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
var Confirm = require('ccc/global/js/modules/cccConfirm');

//支付
var payRactive = new Ractive({
    el:'.payment-content',
    template: require('ccc/loan/partials/pay.html'),
    data:{
        user:CC.user,
    },
})