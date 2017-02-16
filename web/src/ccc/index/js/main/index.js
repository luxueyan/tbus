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


IndexService.getLoanSummary(function (list) {
    var listGDSY = [], listNEW = [], listTJ = [];

    for (var i = 0; i < list.length; i++) {
        list[i].method = i18n.enums.RepaymentMethod[list[i].method][0];
        list[i].titleLength = replaceStr(list[i].title);

        if (list[i].titleLength > 60) {
            list[i].title = list[i].title.substr(0, 60) + '...';
        }

        if (list[i].loanRequest.productKey == "CPTJ") {
            listTJ.push(list[i]);
        } else if (list[i].loanRequest.productKey == 'GDSY') {
            listGDSY.push(list[i]);
        } else if (list[i].loanRequest.productKey == 'NEW') {
            listNEW.push(list[i]);
        }
    }


    var listTJNew = listAll(listTJ);//推荐
    var listNewNew = listAll(listNEW);//新手
    var listGDNew = listAll(listGDSY);//固定

    function listAll(listOld) {
        var listOpen = [];     //在售中  OPENED
        var listNew = [];
        for (var i = 0; i < listOld.length; i++) {
            if (listOld[i].status == "OPENED") {
                listOpen.push(listOld[i]);
            }
        }
        if (listOpen.length) {
            listNew = listOpen[0];
        } else {
            listNew = listOld[0]
        }
        return listNew;
    }

    var investRactive = new Ractive({
        el: ".GDSYproductList",
        template: require('ccc/index/partials/gdsy.html'),
        data: {
            listTJ: listTJNew,
            listNew: listNewNew,
            listGD: listGDNew,
        }
    });
});


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