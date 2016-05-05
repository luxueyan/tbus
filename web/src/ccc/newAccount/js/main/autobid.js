'use strict';
var $ = global.jQuery = require('jquery');
var Ractive = require('ractive/ractive-legacy');
var utils = require('ccc/global/js/lib/utils');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var CccOk = require('ccc/global/js/modules/cccOk');
var repayMethod = utils.i18n.RepaymentMethod;
var template = require('ccc/newAccount/partials/autobid/autobid.html');


var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var ractive = new Ractive({
    el: ".autobid-ractive-container",
    template:template,
    data: {
        isActive: CC.user.autobidConfig.active || false,
        autoBidAmount : CC.user.autobidConfig.singleAmount ,
        autoBidRemainAmount: CC.user.autobidConfig.reservedAmount,
        annualRateFrom: CC.user.autobidConfig.range.minRate / 100||0,
        annualRateTo: CC.user.autobidConfig.range.maxRate / 100||0,
        durationFrom: CC.user.autobidConfig.range.minDuration,
        durationTo: CC.user.autobidConfig.range.maxDuration,
        repaymentMethod : CC.user.autobidConfig.repayMethod,
        allMethod : repayMethod
    },
    onrender: function (){

        this.parseRepaymentMethod();
    },
    parseRepaymentMethod: function(){
        var _arr = [];
        var r = this.get('repaymentMethod');

        for (var k in repayMethod) {
            var o = repayMethod[k];
            var tmp = {};
            tmp.key = k;
            tmp.name = o[0];
            if ($.inArray(k, r) > -1) {
                tmp.checked = true;
            }
            _arr.push(tmp);
        };

        this.set('rp', _arr);
    }
});
var maxRate = CC.user.autobidConfig.range.maxRate / 100,
    minRate = 0,
    minDuration = -1,
    maxDuration = 48,
    flag = true;
ractive.on('checkbutton',function(){

    this.set('isActive',!this.get('isActive'));
    arams['repaymentMethod'] = methods.toString();
});
ractive.on('checkValue', function (event) {
    var selector = event.node.getAttribute('data-selector');
    var value = this.get(selector);
    if (value == '') {
        showError(selector,'输入信息不能为空');
    } else {
        clearError(selector);

        if (isNaN(value) || value < 0) {

            showError(selector,'输入信息无效');

        } else if (selector === 'annualRateFrom' || selector === 'annualRateTo') {

            var annualRateFrom = parseFloat(this.get('annualRateFrom'));
            var annualRateTo = parseFloat(this.get('annualRateTo'));

            if (value > 50) {
                showError(selector,'利率最大值不能超过'+50+'%');

            } else if (annualRateFrom != '' && annualRateTo != '') {

                if (annualRateFrom > annualRateTo) {
                    if (annualRateFrom > maxRate) {
                        this.set('annualRateTo', maxRate);
                    } else {
                        showError(selector, '最小利率不能超过最大利率');
                    }
                }
            } else {
               clearError(selector);
            }

        } else if (selector === 'durationFrom' || selector === 'durationTo') {

            var durationFrom = parseInt(this.get('durationFrom'),10);
            var durationTo = parseInt(this.get('durationTo'),10);

            if (value < minDuration || value >maxDuration) {

                showError(selector,'借款期限只能在0到48个月之间');

            } else if (durationFrom != '' && durationTo != '') {

                if (durationFrom > durationTo) {

                    if (durationFrom > maxDuration) {
                        this.set('durationTo', maxDuration);
                    } else {
                        showError(selector, '最小期限不能超过最大期限');
                    }
                }

            } else {
                clearError(selector);
            }
        } else {
            clearError(selector);
        }
    }
});

ractive.on('saveConfig', function () {
    var radio=$('input[type=radio]:checked').val();
    if (!$('input[name=type]:checked').length) {
        showError('repaymentMethod', '请选择还款方式');
    }else{
        clearError('repaymentMethod');
    }
    if(this.get('autoBidAmount')==0){
        showError('autoBidAmount', '单笔投资金额不可以为0');
    }

    $('div.error').each(function(){
        if($(this).text().trim()){
            flag=false;
        }
    });
    if ( flag ) {
        var params = {
            'isActive': radio,
            'autoBidAmount': parseFloat(this.get('autoBidAmount')),
            'autoBidRemainAmount': parseFloat(this.get('autoBidRemainAmount')),
            'annualRateFrom': parseInt(parseFloat(this.get('annualRateFrom') * 100),10),
            'annualRateTo': parseInt(parseFloat(this.get('annualRateTo') * 100),10),
            'durationFrom': parseInt(this.get('durationFrom'),10),
            'durationTo': parseInt(this.get('durationTo'),10),
            //'mortgaged': $('input[name=mortgaged]:checked').val()
        };

        var methods = [];
        $('input[name=type]:checked').each(function() {
            methods.push($(this).val());
        });
        params['repaymentMethod'] = methods.toString();

        accountService.saveAutoBidConfig(params, function (o) {
            CccOk.create({
                msg: '自动投标设置保存成功',
                okText: '确定',
                cancelText: '',
                klass: 'cc-autobid-succ',
                ok: function () {
                    window.location.reload();
                },
                cancel: function () {
                    window.location.reload();
                }
            });
        });

    } else {
        alert('请确认输入信息无误,才可以保存设置!');
    }
});


function showError (ele, msg) {
    $('#' + ele)
        .find('div.error')
        .text(msg);
    flag = false;
}

function clearError (ele) {

    $('#' + ele)
        .find('div.error')
        .text('');
    flag = true;
}
