"use strict";

require('bootstrap/js/transition');
require('bootstrap/js/carousel');
$('[data-ride="carousel"]').each(function () {
    var $carousel = $(this)
    $(this).carousel($carousel.data())
});


require('bootstrap/js/tab');
var $carousel = $("#my-carousel");
var IndexService = require('./service').IndexService;
var utils = require('ccc/global/js/lib/utils');
var i18n = require('@ds/i18n')['zh-cn'];
var loginElement = document.getElementsByClassName ? document.getElementsByClassName('info')[0] : $('.info')[0];

require('ccc/global/js/lib/jquery.easy-pie-chart.js');

$(function () {
    $('.investList ul li').hover(function () {
        $(this).addClass('active').siblings().removeClass('active');

        var _this = $(this).parent().parent().parent().children('.listContent');
        _this.find('.productList').eq($(this).index()).addClass('active').siblings().removeClass('active');
    });
});


function replaceStr(str) {
    return str.replace(/[^\x00-xff]/g, 'xx').length;
}


IndexService.getLoansForHomePage(function (res) {
    var investRactive = new Ractive({
            el: ".GDSYproductList",
            template: require('ccc/index/partials/gdsy.html'),
            data: {
                listTJ: formatItemNew(res['CPTJ']),
                listNew: formatItemNew(res['NEW']),
                listGD: formatItem(res['GDSY'])[0],
            },
            oninit: function () {
                if (res['CPTJ'] == null || res['CPTJ'] == "null") {
                    if (res['GDSY'][2]) {
                        this.set('listTJ', formatItem(res['GDSY'])[2]);
                    }

                }
                if (res['NEW'] = null || res['NEW'] == "null") {
                    if (res['GDSY'][1]){
                        this.set('listTJ', formatItem(res['GDSY'])[1]);
                    }
                }
            }
        })
        ;
})
;


$("#btn-login-on-carousel").click(function (e) {
    window.HeaderRactive.fire('maskLogin', {
        original: e
    });
});

function showError(message) {
    var errorMaps = {
        USER_DISABLED: '帐号密码错误次数过多，您的帐户已被锁定，请联系客服400-818-9696解锁。',
        FAILED: '手机号/用户名或密码错误'
    };
    var $error = $(".error");
    $error.text(errorMaps[message]);
    $error.addClass('show');
    setTimeout(function () {
        $error.css({
            opacity: '1'
        })
    });
    setTimeout(function () {
        $error.css({
            opacity: '0'
        })
    }, 1500);
    setTimeout(function () {
        $error.removeClass('show');
    }, 2000);
}

function clearError() {
    var $error = $(".error");
    $error.text("");
}

function verifyAndLogin() {
    var username = $("#loginName").val();
    var password = $("#password").val();
    if (username && password) {
        $.post('/ajaxLogin', {
            loginName: username,
            password: password
        }, function (data) {
            if (!data.success) {
                showError(data.error_description.result);
            } else {
                clearError();
                window.location.reload();
            }
        });
    } else {
        showError('FAILED');
    }
}
$('.loginBtn').click(function () {
    verifyAndLogin();
});
$('.registerBtn').click(function () {
    location.href = "/register"
});

$("#my-carousel").hover(function () {
    $('.carousel-control-box').css('display', 'block');
}, function () {
    $('.carousel-control-box').css('display', 'none');
});

window.onscroll = function () {
    var scrollTopOffset = document.documentElement.scrollTop || document.body.scrollTop, headerEle;
    if (loginElement) {
        if (scrollTopOffset >= 129) {
            loginElement.className = 'info floating';
        } else {
            loginElement.className = 'info';
        }
    }
};

$(document).keyup(function (e) {
    if (e.keyCode == 13) {
        verifyAndLogin();
    }
});

//合作伙伴
request.get(encodeURI('/api/v2/cms/category/COOPERATION/name/合作伙伴')).end().then(function (res) {
    var partnerRactive = new Ractive({
        el: '.partner .icon-grounp',
        template: require('ccc/index/partials/partner.html'),
        data: {
            list: []
        },
        onrender: function () {
            if (res.body.length <= 6) {
                this.set('cooperation', res.body);
            } else {
                var num = 6;
                var j = num;
                var length = res.body.length;
                var total = Math.ceil(length / j);
                this.set('cooperation', res.body.slice(0, num));

                for (var i = 0; i < total - 1; i++) {
                    this.set('cooperationNext', res.body.slice(j, j + num));
                    j = j + num;
                    var cooperationNext = this.get('cooperationNext');
                    this.push('list', cooperationNext);
                }
            }

        }
    });
});


function formatItem(item) {
    for (var i = 0; i < item.length; i++) {
        item[i].rate = item[i].rate / 100;

        //格式化期限
        if (item[i].loanRequest.displayDuration) {
            var durationNew = item[i].loanRequest.displayDuration.frontShowDuration;
            var reg1 = /(\d{1,3})+(?:\.\d+)?/g;
            var reg2 = /[\u4e00-\u9fa5]{1,}/g;
            item[i].durationNewNo = durationNew.match(reg1)[0];
            item[i].durationNewName = durationNew.match(reg2)[0];
        }

        item[i].FminAmount = utils.format.amount(item[i].loanRequest.investRule.minAmount);
        if (item[i].loanRequest.investRule.minAmount >= 10000) {
            item[i].minAmountUnit = '万元';
            item.minAmount = utils.format.amount((item[i].loanRequest.investRule.minAmount / 10000));
        } else {
            item[i].minAmount = utils.format.amount(item[i].loanRequest.investRule.minAmount);
            item[i].minAmountUnit = '元';
        }
    }
    return item;
}

function formatItemNew(item) {
    item.rate = item.rate / 100;

    //格式化期限
    if (item.loanRequest.displayDuration) {
        var durationNew = item.loanRequest.displayDuration.frontShowDuration;
        var reg1 = /(\d{1,3})+(?:\.\d+)?/g;
        var reg2 = /[\u4e00-\u9fa5]{1,}/g;
        item.durationNewNo = durationNew.match(reg1)[0];
        item.durationNewName = durationNew.match(reg2)[0];
    }

    item.FminAmount = utils.format.amount(item.loanRequest.investRule.minAmount);
    if (item.loanRequest.investRule.minAmount >= 10000) {
        item.minAmountUnit = '万元';
        item.minAmount = utils.format.amount((item.loanRequest.investRule.minAmount / 10000));
    } else {
        item.minAmount = utils.format.amount(item.loanRequest.investRule.minAmount);
        item.minAmountUnit = '元';
    }
    return item;
}