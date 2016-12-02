var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/account/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var CccBox = require('ccc/global/js/modules/cccBox');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
var Confirm = require('ccc/global/js/modules/cccConfirm');
var investRactive = new Ractive({
    el: ".do-invest-wrapper",
    template: require('ccc/loan/partials/doInvestOnDetail.html'),
    data: {
        name: '',
        user: CC.user,
        loan: CC.loan,
        rate: utils.format.percent(CC.loan.investPercent *
            100, 2),
        errors: {
            visible: false,
            msg: ''
        },
        serverDate: CC.serverDate,
        isSend: false,
        backUrl: CC.backUrl
    },
    oninit: function () {
        var self = this;

        if (!!CC.user) {
            accountService.getAuthentication(function (r) {
                if (!r.serviceError) {
                    self.set('idauthenticated', r.data.idauthenticated);
                    self.set('paymentPass', r.data.paymentAuthenticated);
                } else {
                    showErrors(r.error);
                }
            });
        }
        ;
    }
});

investRactive.on('checkCoupon', function () {
    var self = this;
    if (!self.get('selectInputFirst', true)) {
        var minCouponAmount = $('#couponSelection').find("option:selected").data('min');
        self.set('selectCouponFirst', true);
        self.set('minCouponAmount', minCouponAmount);
    }
});

investRactive.on("invest-submit", function (e) {
    var self = this;
    e.original.preventDefault();
    if (parseInt(this.get('inputNum'), 10) != this.get('inputNum')) {
        showErrors('投资金额只能为整数 ');
        return false;
    }
    var num = parseInt(this.get('inputNum'), 10); // 输入的值
    var loanId = this.get('loan.id');
    var placementId = this.get('coupon');
    var paymentPassword = this.get('paymentPassword');
    if (CC.loan.userId === CC.user.userId) {
        showErrors('该标为您本人借款，无法投标 ');
        return false;
    }

    if (isNaN(num)) {
        showErrors('输入有误，请重新输入 ! ');
        return false;
    }

    if (CC.loan.rule.balance < CC.loan.rule.min) {
        if (this.get('inputNum') != CC.loan.rule.balance) {
            this.set('inputNum', CC.loan.rule.balance);
            showErrors('投资金额必须为标的剩余金额');
            return false;
        } else {
            disableErrors();
        }
    } else {
        if (num < CC.loan.rule.min) {
            showErrors('起投金额为' + CC.loan.rule
                    .min + '元 !');
            return false;
        }

        if (((num - CC.loan.rule.min) % CC.loan.rule.step) !==
            0) {
            showErrors('不符合投资规则!最少为' + CC.loan.rule.min + '元，且投资增量为' + CC.loan.rule.step + "元");
            return false;
        }
    }

    if (num > CC.loan.rule.balance) {
        showErrors('投标金额不可超过剩余额度 !');
        return false;
    }

    if (num > CC.loan.rule.max) {
        showErrors('单次投标金额不可超过' + CC.loan.rule
                .max +
            '元!');
        return false;
    }

    if (self.get('selectCouponFirst') && self.get('minCouponAmount') >= 0 && num < parseInt(self.get('minCouponAmount'))) {
        showErrors('您选用的奖券最低使用金额为 ' + self.get('minCouponAmount') + '元');
        return false;
    }

    if (num > CC.user.availableAmount) {
        showErrors('账户余额不足，请先充值 !');
        return false;
    }

    if (paymentPassword === '') {
        showErrors('请输入交易密码!');
        return false;
    } else {
        accountService.checkPassword(paymentPassword, function (r) {
            if (!r) {
                showErrors('请输入正确的交易密码!');
            } else {
                var num = investRactive.get('inputNum');
                var userdCoupon = !!investRactive.get('coupon');
                var couponLength = investRactive.get('couponLength');
                disableErrors();

                if (!self.get('tendering')) {
                    self.set('tendering', true);
                    $.post('/lianlianpay/tender', {
                        amount: num,
                        loanId: investRactive.get('loan.id'),
                        placementId: investRactive.get('coupon'),
                        paymentPassword: investRactive.get('paymentPassword')
                    }, function (res) {
                        if (res.success) {
                            CccOk.create({
                                msg: '恭喜您，投资成功',
                                okText: '确定',
                                // cancelText: '重新登录',
                                ok: function () {
                                    window.location.reload();
                                },
                                cancel: function () {
                                    window.location.reload();
                                }
                            });
                        } else {
                            var errType = res.error && res.error[0] && res.error[0].message || '';
                            var errMsg = {
                                    TOO_CROWD: '投资者过多您被挤掉了，请点击投资按钮重试。'
                                }[errType] || errType;
                            CccOk.create({
                                msg: '投资失败，' + errMsg,
                                okText: '确定',
                                // cancelText: '重新登录',
                                ok: function () {
                                    window.location.reload();
                                },
                                cancel: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    ;
});

function parsedata(o) {
    var type = {
        'CASH': '现金券',
        'INTEREST': '加息券',
        'PRINCIPAL': '增值券',
        'REBATE': '返现券'
    };
    for (var i = 0; i < o.length; i++) {
        var canuse = o[i].disabled;
        o[i] = o[i].placement;
        if (o[i].couponPackage.type === 'INTEREST') {
            o[i].interest = true;
            o[i].displayValue = (parseFloat(o[i].couponPackage.parValue) / 100).toFixed(1) + '%';
        } else if (o[i].couponPackage.type === 'CASH') {
            o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
            o[i].hide = true;
        } else if (o[i].couponPackage.type === 'PRINCIPAL') {
            o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
        } else if (o[i].couponPackage.type === 'REBATE') {
            o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
        }
        ;
        o[i].value = parseInt(o[i].couponPackage.parValue);
        o[i].id = o[i].id;
        o[i].typeKey = type[o[i].couponPackage.type];
        o[i].minimumInvest = o[i].couponPackage.minimumInvest + "元";
        o[i].min = o[i].couponPackage.minimumInvest;
        o[i].canuse = canuse;
    }
    return o;
};


function showErrors(error) {
    investRactive.set('errors', {visible: true, msg: error});
}

function disableErrors() {
    investRactive.set('errors', {visible: false, msg: ''});
}

$('.benefit-calculator').on('click', function () {
    Cal.create();
});

function showSelect(amount) {
    $('#couponSelection').val('');
    var months = CC.loan.duration;
    investRactive.set('inum', parseFloat(amount));
    disableErrors();
    loanService.getMyCoupon(amount, months, function (coupon) {
        if (coupon.success) {
            var canUseCoupon = _.filter(coupon.data, function (r) {
                return r.disabled === false;
            });
            investRactive.set('couponLength', canUseCoupon.length);
            investRactive.set('selectOption', parsedata(coupon.data));
        }
    });
}
//初始化选项
if (!!CC.user) {
    showSelect(CC.loan.rule.balance);
}

investRactive.on('getCoupon', function () {
    var self = this;

    if (isNaN(self.get('inputNum'))) {
        self.set('showEarn', false);
        return false;
    }
    var args = {
        amountValue: self.get('inputNum'),
        dueYear: CC.loan.dueYear,
        dueMonth: CC.loan.dueMonth,
        dueDay: CC.loan.dueDay,
        annualRate: CC.loan.rate,
        paymentMethod: CC.loan.method
    };

    request.post('/api/v2/loan/request/analyse')
        .type('form')
        .send(args)
        .end()
        .then(function (res) {
            if (res.body.success) {
                self.set('showEarn', true)
                self.set('Earninterest', res.body.data.interest);//只返回收益不返回本金
            }
        });
    if (!self.get('selectCouponFirst')) {
        self.set('selectInputFirst', true);
        var inputNum = this.get('inputNum');
        var inum = this.get('inum');
        if (parseFloat(inputNum) !== parseFloat(inum)) {
            showSelect(inputNum);
        }
    }
});
//tab切换
$('.tablist .tabItem').click(function () {
    var step = $(this).data('step');

    $(this)
        .addClass('tabItemActive')
        .find('span.jiao')
        .addClass('jiaoActive')
        .parent()
        .siblings()
        .removeClass('tabItemActive')
        .find('span.jiao')
        .removeClass('jiaoActive');

    $('.tabInner .innerItem')
        .eq(step)
        .addClass('innerItemActive')
        .siblings()
        .removeClass('innerItemActive');
});

//剩余时间倒计时
var coutDown = function () {
    if (CC.loan.status == 'SCHEDULED') {
        var timeLeft = CC.loan.countDownTime;
        var countDownRactive = new Ractive({
            el: '.countDown',
            template: require('ccc/loan/partials/countDown.html'),
            data: {
                countDown: {
                    days: timeLeft.dd,
                    hours: timeLeft.hh,
                    minutes: timeLeft.mm,
                    seconds: timeLeft.ss
                }
            }
        });
        var timeLeftToal = timeLeft.ss + timeLeft.mm * 60 + timeLeft.hh * 60 * 60 + timeLeft.dd * 60 * 60 * 24;
        var countDownInterval = setInterval(function () {
            if (timeLeftToal >= 1) {
                timeLeftToal -= 1;
                var dd = parseInt(timeLeftToal / (60 * 60 * 24), 10),
                    hh = parseInt((timeLeftToal - dd * 60 * 60 * 24) / (60 * 60), 10),
                    mm = parseInt((timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60) / 60, 10),
                    ss = parseInt(timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60 - mm * 60, 10);
                countDownRactive.set('countDown', {
                    days: dd,
                    hours: hh,
                    minutes: mm,
                    seconds: ss
                });
            } else {
                clearInterval(countDownInterval);
                window.location.reload();
            }
        }, 1000);
    }
};

setTimeout(coutDown, 500);

var recordRactive = new Ractive({
    el: '.invest-record',
    template: require('ccc/loan/partials/record.html'),
    page: 1,
    pageSize: 40,
    api: '/api/v2/loan/' + CC.loan.id + '/invests/',
    data: {
        loading: true,
        list: [],
        totalSize: 0
    },
    oninit: function () {
        this.getRecord();
    },
    getRecord: function () {
        var self = this;
        var api = self.api + self.page + '/' + self.pageSize;
        request(api)
            .end()
            .get('body')
            .then(function (r) {
                self.setData(r);
            });
    },
    setData: function (r) {
        var self = this;
        self.set('loading', false);
        self.set('list', self.parseData(r.results));
        self.set('totalSize', r.totalSize);
        self.renderPager();
    },
    parseData: function (list) {
        for (var i = 0, l = list.length; i < l; i++) {
            list[i].submitTime = moment(list[i].submitTime)
                .format('YYYY-MM-DD HH:mm:ss');

            if (/^GMJR_/.test(list[i].userLoginName)) {
                list[i].userLoginName = list.userLoginName.replace('GMJR_', '手机用户');
            } else if (list[i].userLoginName.indexOf('手机用户') === 0) {
                var _name = list[i].userLoginName.substring(4).replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2');
            } else {
                if (list[i].userLoginName.length === 2) {
                    var _name = mask(list[i].userLoginName, 1);
                } else {
                    var _name = mask(list[i].userLoginName, 2);
                }
            }

            list[i].userLoginName = _name;
        }
        return list;
    },
    renderPager: function () {
        var self = this;
        var totalSize = self.get('totalSize');

        if (totalSize != 0) {
            self.totalPage = Math.ceil(totalSize / self.pageSize);
        }

        var totalPage = [];
        // console.log("===>> totalPage = " + self.totalPage);
        for (var i = 0; i < self.totalPage; i++) {
            totalPage.push(i + 1);
        }

        renderPager(totalPage, self.page);
    }
});

function renderPager(totalPage, current) {
    // console.log("===>render")
    if (!current) {
        current = 1;
    }
    var pagerRactive = new Ractive({
        el: '#record-pager',
        template: require('ccc/loan/partials/pagerRecord.html'),
        data: {
            totalPage: totalPage,
            current: current
        }
    });

    pagerRactive.on('previous', function (e) {
        e.original.preventDefault();
        var current = this.get('current');
        if (current > 1) {
            current -= 1;
            this.set('current', current);
            recordRactive.page = current;
            recordRactive.getRecord();

        }
    });

    pagerRactive.on('page', function (e, page) {
        e.original.preventDefault();
        if (page) {
            current = page;
        } else {
            current = e.context;
        }
        this.set('current', current);
        recordRactive.page = current;
        recordRactive.getRecord();

    });
    pagerRactive.on('next', function (e) {
        e.original.preventDefault();
        var current = this.get('current');
        if (current < this.get('totalPage')[this.get('totalPage')
                .length - 1]) {
            current += 1;
            this.set('current', current);
            recordRactive.page = current;
            recordRactive.getRecord();
        }
    });
}


function mask(str, s, l) {
    if (!str) {
        return '';
    }
    var len = str.length;
    if (!len) {
        return '';
    }
    if (!l || l < 0) {
        l = len === 2 ? 1 : len - 2;
    } else if (l > len - 1) {
        l = len - 1;
        s = !!s ? 1 : 0;
    }
    if (s > len) {
        s = len - 1;
    }
    str = str.substring(0, s) + (new Array(l + 1))
            .join('*') + str.substring(s + l);
    str = str.substring(0, len);
    return str;
}
