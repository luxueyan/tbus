'use strict';

var utils = require('ccc/global/js/lib/utils');
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');
var couponTpl = require('ccc/newAccount/partials/coupon/coupon.html');
var RenderPage = require('ccc/global/js/modules/cccPageSuper')
var CccBox = require('ccc/global/js/modules/cccBox');


var pagesize = 9;
var page = 1;
var totalPage = 1;

var getCurrentType = function () {
    return $('.ccc-tab li.active').data('type');
};

var Tab = {
    PLACED: {
        ractive: null,
        api: '/api/v2/coupon/MYSELF/coupons/byStatus?status=PLACED',
        //template: require('ccc/newAccount/partials/coupon/coupon.html')
    },
    // 未使用
    REDEEMED: {
        ractive: null,
        api: '/api/v2/coupon/MYSELF/coupons/byStatus?status=REDEEMED&status=USED',
        //template: require('ccc/newAccount/partials/coupon/coupon.html')
    },
    // 已使用
    EXPIRED: {
        ractive: null,
        api: '/api/v2/coupon/MYSELF/coupons/byStatus?status=EXPIRED',
        //template: require('ccc/newAccount/partials/coupon/coupon.html')
    }
    // REALIZATION (可变现)
};

$('ul.ttabs li a').on('click', function () {
    var type = $(this).parent().data('type');
    init(type);
    //console.log(type);
    //console.log(typeof type);
});

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function init(type) {
    //console.log(type);
    var tab = Tab[type];
    if (type) {
        var couponRactive = new Ractive({
            el: '.panel-' + type,
            template: couponTpl,
            size: pagesize,
            perpage: self.size,
            page: page,
            totalPage: totalPage,
            //api: '/api/v2/coupon/MYSELF/coupons/byStatus',
            api: tab.api,
            data: {
                loading: true,
                list: [],
                total: 0,
                pageOne: null // 第一次加载的数据
            },
            bindTime: 0,
            status: {
                'INITIATED': '未使用',
                'PLACED': '未使用',
                'USED': '审核中',
                'CANCELLED': '已作废',
                'EXPIRED': '已过期',
                'REDEEMED': '已使用'
            },
            type: {
                'CASH': '现金券',
                'INTEREST': '加息券',
                'PRINCIPAL': '增值券',
                'REBATE': '返现券'
            },
            onrender: function () {
                var self = this;
                self.getCouponData(function (o) {
                    self.set('total', o.totalSize);
                    var parseResult = self.parseData(o.results);
                    self.setData(parseResult, o.totalSize, type);
                });
            },
            getCouponData: function (callback) {
                var self = this;
                $.get(self.api, {
                    //status: type,
                    pageNo: self.page,
                    pageSize: self.size
                }, function (o) {
                    //console.log(o.data);
                    if (o.success) {
                        self.pageOneData = o.data.results;
                        callback(o.data);
                    }
                });
            },
            setData: function (o, totalSize, type) {
                var self = this;
                self.set('loading', false);
                self.set('list', o);

                this.renderPager(totalSize, type);
            },

            parseData: function (o) {
                var typeMap = {
                    'CASH': '现金券',
                    'INTEREST': '加息券',
                    'PRINCIPAL': '增值券',
                    'REBATE': '返现券'
                };
                for (var i = 0; i < o.length; i++) {

                    o[i].displayName = o[i].couponPackage.displayName;
                    o[i].parValue = o[i].couponPackage.parValue;
                    o[i].type = o[i].couponPackage.type;
                    o[i].Ftype = typeMap[o[i].type];
                    o[i].typeKey = o[i].couponPackage.displayName;
                    o[i].canuse = false;
                    o[i].USED = false;
                    if (o[i].type === 'CASH') {
                        if (o[i].status === 'INITIATED' || o[i].status === 'PLACED') {
                            o[i].canuse = true;
                        }
                    }
                    if (o[i].type === 'INTEREST') {
                        o[i].interest = true;
                        o[i].displayValue = (parseFloat(o[i].parValue) / 100).toFixed(2);
                    } else if (o[i].type === 'CASH') {
                        o[i].displayValue = parseInt(o[i].parValue);
                    } else if (o[i].type === 'PRINCIPAL') {
                        o[i].displayValue = parseInt(o[i].parValue);
                    } else if (o[i].type === 'REBATE') {
                        o[i].displayValue = parseInt(o[i].parValue);
                    }

                    if (o[i].status === 'INITIATED' || o[i].status === 'PLACED') {
                        o[i].notUse = true;
                        o[i].displayStatus = '未使用';
                    } else if (o[i].status === 'USED' || o[i].status === 'REDEEMED') {
                        o[i].USED = true;
                        o[i].displayStatus = '已使用';
                    } else if (o[i].status === 'EXPIRED' || o[i].status === 'CANCELLED') {
                        o[i].EXPIRED = true;
                        o[i].displayStatus = '已过期';
                    }

                    //	                o[i].status = this.status[o[i].status];
                    o[i].timePlaced = (new Date(o[i].timePlaced)).Format("yyyy-MM-dd"); //分发时间
                    o[i].timeRedeemed = o[i].timeRedeemed; //兑换时间
                    o[i].description = o[i].couponPackage.description;
                    o[i].totalAmount = o[i].couponPackage.totalAmount;
                    o[i].timeIssued = o[i].couponPackage.timeIssued;
                    o[i].timeStart = o[i].couponPackage.timeStart;
                    if (o[i].couponPackage.timeExpire == null) {
                        o[i].timeExpire = "永不过期";
                    } else {
                        o[i].timeExpire = (new Date(o[i].couponPackage.timeExpire)).Format("yyyy-MM-dd");
                    }
                    if (o[i].timeExpire != "永不过期") {
                        if (o[i].displayStatus === '未使用') {
                            if (o[i].couponPackage.timeExpire < new Date()) {
                                o[i].status = 'EXPIRED';
                                o[i].notUse = false;
                                o[i].EXPIRED = true;
                                o[i].displayStatus = '已过期';
                            }
                        }
                    }
                    if (o[i].description === "") {
                        o[i].description = "暂无描述";
                    }
                }
                return o;
            },
            renderPager: function (totalSize, type) {
                var self = this;
                new RenderPage().page({
                    pageSize: pagesize,
                    totalSize: totalSize,
                    //api:'/api/v2/coupon/MYSELF/coupons/byStatus?pageNo=$currentPage&pageSize=$pageSize',
                    api: self.api + "&pageNo=$currentPage&pageSize=$pageSize",
                    //queryString:{
                    //    pageNo: self.page,
                    //    pageSize: self.size
                    //},
                    callback: function (o) {
                        self.set('list', self.parseData(o.data.results))
                    }
                });

            },
            tooltip: function () {
                $('.tips-top').tooltip({
                    container: 'body',
                    placement: 'top'
                });
            },
        });
    }
}


//var ctype=['CASH','INTEREST','PRINCIPAL','REBATE'];
init(getCurrentType());

window.redeemCoupon = function (btn) {
    var $btn = $(btn);
    if ($btn.hasClass('disabled')) {
        return;
    }
    Coupon_Box($btn);
}


$('.rule').click(function () {
    $('.coupon-nav-view').hide();
    $('.coupon-content-detail').hide();
    $('#coupon-pager').hide();
    $('.coupon_rule').show();
});
$('.back').click(function () {
    $('.coupon_rule').hide();
    $('.coupon-nav-view').show();
    $('.coupon-content-detail').show();
    $('#coupon-pager').show();
});


function Coupon_Box($btn) {
    new CccBox({
        title: '现金券兑换',
        value: 'loading...',
        autoHeight: true,
        width: 500,
        height: 240,
        showed: function (ele, box) {
            var imgRac = new Ractive({
                el: $(ele),
                template: require('ccc/newAccount/partials/coupon/check.html'),
                data: {
                    captcha: '',
                    token: '',
                    errMsg: ''
                },
                oninit: function () {
                    this.getImgCaptcha();
                },
                oncomplete: function () {
                    var _this = this;
                    _this.on('submitCoupon', function () {
                        $btn.addClass('disabled');
                        var id = $btn.data("id");
                        if (!_this.get("errMsg") && _this.get("value")) {
                            $.post("/api/v2/coupon/MYSELF/redeemCouponIgnoreApprovalWithCaptcha", {
                                placementId: id,
                                captcha_token: _this.get("token"),
                                captcha_answer: _this.get("value")
                            }, function (res) {
                                if (res) {
                                    alert("兑现成功!");
                                } else {
                                    $btn.removeClass('disabled');
                                    alert("兑现失败!");
                                }
                                $('.bar .close').click();
                            });
                        }
                        else {
                            _this.set("errMsg", "请输入图形验证码");
                        }
                    });
                    _this.on('exchangeImgCaptcha', function () {
                        _this.getImgCaptcha();
                    })
                    _this.on('checkImgCaptcha', function () {
                        this.checkImgCaptcha();
                    })
                },
                getImgCaptcha: function () {
                    var _this = this;
                    request('GET', '/api/v2/captcha', {query: {v: (new Date).valueOf()}})
                        .end()
                        .then(function (r) {
                            _this.set('captcha', r.body.captcha);
                            _this.set('token', r.body.token);
                        });
                },
                checkImgCaptcha: function () {
                    var _this = this;
                    request('POST', "/api/v2/captcha?token=" + _this.get("token"))
                        .send({captcha: _this.get("value")})
                        .end()
                        .then(function (res) {
                            if (res.body.success) {
                                _this.set("errMsg", "");
                            } else {
                                _this.set("errMsg", "图形验证码错误");
                            }
                        });
                }
            })
        }
    })
}