'use strict';

/**
 * 收益计算器 (cccCalculator)
 *
 * <link rel="stylesheet" href="/assets/css/modules/cccCalculator.css">
 * var Cal = require('assets/js/modules/cccCalculator');
 * Cal.create();
 */
var utils = require('ccc/global/js/lib/utils');
var tpl = {
	wrap: require('ccc/global/partials/modules/cccCalculator.html'),
	list: '{{#each list}}\
			<div class="clearfix backgr-f tdContent">\
				<div class="ccc-f tdCell backgr-f">{{dueDate}}</div>\
				<div class="tdCell backgr-f">{{amount}}</div>\
				<div class="tdCell backgr-f">{{amountPrincipal}}</div>\
				<div class="tdCell backgr-f">{{amountInterest}}</div>\
				<div class="ccc-l tdCell backgr-f">{{amountOutstanding}}</div>\
			</div>\
		{{/each}}'
};

var Dialog = require("ccc/global/js/modules/cccBox");

// 缓存部分数据
window.CC_CACHE = {};

var reg = /^([1-9][\d]{0,7}|0)$/;
var reg1 = /^([1-9][\d]{0,1}|0)(\.[\d]{1,8})?$/;

module.exports.create = function (p) {
    p = p || {};
    var defaults = {
        title: p.title || '收益计算器',
        tpl: p.tpl || tpl.wrap,
        width: 850,
        height: 400,
        top: '20%',
        callback: function () {}
    };

    $.extend(defaults, p);
    var o = defaults;

    // get data
    var renderPurpose = function () {
        //var P = T('zh-cn').enums.RepaymentMethod;
        var _option = '';
		
		$.each(utils.i18n.RepaymentMethod, function(k, v) {
			_option += '<option value="' + k + '">' + v[0] + '</option>';
		});
		
        //过滤还款方式
        return '<option value="EqualInstallment">按月等额本息</option>\
				<option value="EqualPrincipal">按月等额本金</option>\
				<option value="MonthlyInterest">按月付息到期还本</option>\
				<option value="BulletRepayment">一次性还本付息</option>';
    };

    if (!CC_CACHE.options) {
        CC_CACHE.options = renderPurpose();
    }

    new Dialog({
        title: o.title,
        value: o.tpl,
        width: o.width,
        height: o.height,
        top: o.top,
        showed: function (ele, box) {
			// set list tpl
			//tpl.list = $(ele).find('.ccc-calculator-tpl-list').html();
			
            var date_cal = new Date();
            var date_cal1 = new Date(date_cal);
            date_cal1.setDate(date_cal.getDate() + 3);
            var last_date = date_cal1.getFullYear() + '-' + (date_cal1.getMonth() + 1) + '-' + date_cal1.getDate();
			
            // render options
            $(ele)
                .find('select[name=paymentMethod]')
                .html(CC_CACHE.options);
            $(ele)
                .find('form[name=ccCalculatorForm]')
                .submit(function (e) {
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }
                    var $this = $(this);
                    var datas = $this.serializeArray();
                    var nc = function (msg) {
                        $(ele)
                            .find('#cc-cal-list-wp')
                            .html('<p>' + msg + '</p>');
                    };

                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i].name === 'paymentMethod') {
							continue;
						}
                        var calValue = datas[i].value;
                        var isLegal = reg.test(calValue);
                        var tex = $(ele)
                            .find('[name=' + datas[i].name + ']')
                            .parent()
                            .prev()
                            .text();
                        if (calValue === '') {
                            $(ele)
                                .find('[name=' + datas[i].name + ']')
                                .addClass('nc')
                                .focus();
                            nc('请输入' + tex);
                            return;
                        } else if (!isLegal && datas[i].name !== 'annualRate') {
                            $(ele)
                                .find('[name=' + datas[i].name + ']')
                                .addClass('nc')
                                .focus();
                            if (datas[i].name === 'amountValue' &&
                                calValue > 99999999) {
                                nc(tex + '不能超过8位数字');
                            } else {
                                nc(tex + '必须为整数');
                            }
                            return;
                        } else if (datas[i].name === 'annualRate' && !
                            reg1.test(calValue)) {
                            $(ele)
                                .find('[name=' + datas[i].name + ']')
                                .addClass('nc')
                                .focus();
                            nc(tex + '必须为小于100的数字');
                            return;
                        } else {
                            $(ele)
                                .find('[name=' + datas[i].name + ']')
                                .removeClass('nc');
                        }
                    }

                    var $postBtn = $(ele)
                        .find('.btn-cal');
                    $postBtn.addClass('disabled')
                        .text('计算中…');

                    var url = '/api/v2/loan/request/analyse';
                    $.post(url, datas, function (res) {
                        if (res.success) {
                            $postBtn.removeClass('disabled')
                                .text('计算收益');
                            $(ele)
                                .find('.Tamount')
                                .text(res.data.interest + res.data.principal);
                            $(ele)
                                .find('.Famount')
                                .html('￥' + utils.format.amount((res.data.interest +
                                        res.data.principal), 2) +
                                    '<span style="padding-left:20px;">假设起息日为' +
                                    last_date + '</span>');
                            $(ele)
                                .find('.TamountPrincipal')
                                .text(res.data.principal);
                            $(ele)
                                .find('.TamountInterest')
                                .text(res.data.interest);
                            $(ele)
                                .find('.cc-talbe-total')
                                .removeClass('hide');
                            //$(ele).find('.Frate').text(datas[2].value+'%');
							
							new Ractive({
								el: $(ele).find('#cc-cal-list-wp'),
								template: tpl.list,
								data: {
									list: res.data.repayments
								}
							});
                        } else {
                            nc('请求出错~');
                        }
                    })
                        .error(function () {
                            $postBtn.removeClass('disabled')
                                .text('计算收益');
                            nc('请求出错~');
                        });
                });
            o.callback(ele, box);
        }
    });
};
