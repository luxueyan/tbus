"use strict";
var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/lib/jquery.easy-pie-chart');
require('bootstrap/js/carousel');

require('bootstrap/js/transition');
require('bootstrap/js/tooltip');

var Cal = require('ccc/global/js/modules/cccCalculator');

// cccConfirm
var Confirm = require('ccc/global/js/modules/cccConfirm');

var popupBigPic = require('ccc/loan/js/main/bigPic')
    .popupBigPic;
var statusMap = {
    SCHEDULED: '开标时间:{{timeOpen}}',
    SETTLED: '结标时间:{{timeSettled}}',
    OPENED: '',
    FINISHED: '',
    CLEARED: ''
};
var template = statusMap[CC.loan.status];

new Ractive({
    el: ".openTime",
    template: template,
    data: {
        timeOpen: moment(CC.loan.timeOpen).format('YYYY-MM-DD HH:mm'),
        //        timeFinished: moment(new Date(parseInt(CC.loan.timeFinished))).format('YYYY-MM-DD HH:mm')
        timeSettled: CC.loan.timeSettled
    }
});





function initailEasyPieChart() {
    ///////////////////////////////////////////////////////////
    // 初始化饼状图
    ///////////////////////////////////////////////////////////
    $(function () {
        var oldie = /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase());
        $(".easy-pie-chart").each(function () {
            var percentage = $(this).data("percent");
            var status = $(this).data("status");
            var percentageNum = CC.loan.rule.leftAmount;
            // 100%进度条颜色显示为背景色

            //var color = percentage != 100 && (status==='SETTLED'|| status==='CLEARED') ? "#f58220" : '#009ada';
            var color = (status === 'OPENED') ? '#009ada' : "#f58220";

            //            var color = percentage === 100 ? "#f58220" : '#f58220';

            $(this).easyPieChart({
                barColor: color,
                trackColor: '#ddd',
                scaleColor: false,
                lineCap: 'butt',
                lineWidth: 4,
                animate: oldie ? false : 1000,
                size: 130,
                onStep: function (from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });

            $(this).find("span.percentageNum").html('<span style="color:#f58220;font-size:24px;">' + percentageNum + '</span>' + '<span style="color:#4b4b4b;">' + CC.loan.rule.dw + '</span>');

            var width = $(this).find("span.percentageNum").width();
            $(this).find("span.percentageNum").css({
                'left': '50%',
                'margin-left': -width / 2
            });
            //			console.log(width);

        });

    });
};

initailEasyPieChart();


$("[data-toggle=tooltip]")
    .each(function () {
        $(this)
            .tooltip({
                // 同级的 tooltip-container
                container: $(this)
                    .parent()
                    .find('.tooltip-container')
            });
    });

setTimeout((function () {
    CC.loan.timeElapsed = utils.format.timeElapsed(CC.loan.timeElapsed);
    CC.loan.timeLeft = JSON.parse(CC.loan.timeLeft);
    var leftTime = CC.loan.timeLeft;
    var timeLeftToal = leftTime.ss + leftTime.mm * 60 + leftTime.hh * 60 * 60 + leftTime.dd * 60 * 60 * 24;
    setInterval(function () {
            timeLeftToal -= 1;
            var dd = parseInt(timeLeftToal / (60 * 60 * 24), 10),
                hh = parseInt((timeLeftToal - dd * 60 * 60 * 24) / (60 * 60), 10),
                mm = parseInt((timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60) / 60, 10),
                ss = parseInt(timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60 - mm * 60, 10);
            var newTimeleftTotal = {
                dd: dd,
                hh: hh,
                mm: mm,
                ss: ss
            }
            var days = newTimeleftTotal.dd ? '<i>' + newTimeleftTotal.dd + '</i>日' : '';
            $('.time>span').html(days + '<i>' + newTimeleftTotal.hh + '</i>时<i>' + newTimeleftTotal.mm + '</i>分<i>' + newTimeleftTotal.ss + '</i>秒');
        }, 1000)
        //获取最后还款日期
    if (CC.repayments instanceof Array && CC.repayments.length > 0) {
        CC.loan.lastRepaymentsDate = CC.repayments[0].dueDate;
        for (var i = 0; i < CC.repayments.length; i++) {
            if (CC.loan.lastRepaymentsDate < CC.repayments[i].dueDate) {
                CC.loan.lastRepaymentsDate = CC.repayments[i].dueDate;
            }
        };
    }


    var investRactive = new Ractive({
        el: ".do-invest-wrapper",
        template: require('ccc/loan/partials/doInvestOnDetail.html'),
        data: {
            name: '',
            user: CC.user,
            loan: CC.loan,
            // inputNum: CC.loan.rule.min,
            rate: utils.format.percent(CC.loan.investPercent *
                100, 2),
            errors: {
                visible: false,
                msg: ''
            },
            timeOpen: moment(CC.loan.timeOpen).format('YYYY-MM-DD'),
            serverDate: moment(CC.serverDate).format('YYYY-MM-DD'),
            isSend: false,
            backUrl: CC.backUrl,
            dueDate: (CC.repayments[0] || {}).dueDate,
            timeSettled: nextDate(CC.loan.timeSettled),
        },
        oninit: function () {
            var self = this;
            if (CC.loan.rule.balance < CC.loan.rule.min) {
                this.set('inputNum', CC.loan.rule.balance);
            }
        }
    });

    function nextDate(timestr) {
        var date = new Date(timestr.replace('/-/g', '\/'));
        var timeunix = Math.round((date.getTime() + 1000 * 60 * 60 * 24) / 1000);
        var time = moment(timeunix * 1000).format('YYYY-MM-DD');
        return time;
    }
    var serverDate = CC.serverDate;
    var openTime = CC.loan.timeOpen;
    serverDate += 1000;
    if (CC.loan.status === 'SCHEDULED') {
        var interval = setInterval((function () {
            var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
            var textDay = leftTime.day ? leftTime.day : '';
            if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                clearInterval(interval);
            } else {
                $('.left-time-start').html('<span class="text">距离开标时间还有<span style="color:#009ada">' + textDay + '</span>天<span style="color:#009ada;">' + leftTime.hour + '</span>时<span style="color:#009ada">' + leftTime.min + '</span>分<span style="color:#009ada">' + leftTime.sec + '</span>秒</span>')
            }
        }), 1000);
    }



    if (CC.user) {
        accountService.getUserInfo(function (res) {
            investRactive.set('name', res.user.name);
        });
    }

    investRactive.set('user', CC.user);
    if ($('.invest-submit').length > 0) {

    }



    investRactive.on("invest-submit", function (e) {
        e.original.preventDefault();

        var num = parseInt(this.get('inputNum'), 10); // 输入的值
        var smsCaptcha = this.get('smsCaptcha');
        var paymentPassword = this.get('paymentPassword');
        var couponSelection = $("#couponSelection").find("option:selected").text();
        var indexnum = couponSelection.indexOf("最低投资额：");
        var minnum = couponSelection.substring(indexnum + 6, couponSelection.length - 1);

        if (CC.loan.productKey === 'NEW') {
            if (investRactive.get('user').totalInvest > 0) {
                $('.info').css('display','none');
                $('.info-new').css('display','block');
                return false;
            };
        }


        if (num < minnum) {
            showErrors('投资额小于奖券最低投资额');
            return false;
        }
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
                showErrors('单次投标金额不可少于' + CC.loan.rule
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
                    disableErrors();
                    var couponText = '';
                    if ($("#couponSelection")) {
                        var value = $("#couponSelection").find("option:selected").val();

                        if (investRactive.get('selectOption') == null) {
                            if (value == '') {
                                couponText = '未使用任何奖券,';
                            } else {

                                couponText = '将使用' + $("#couponSelection").find("option:selected").text();
                            }
                        }
                    }


                    if (document.getElementById('agree').checked == true) {
                        $('.agree-error').css('visibility', 'hidden');
                        Confirm.create({
                            msg: '您本次投资的金额为' + num + '元，' + couponText + '是否确认投资？',
                            okText: '确定',
                            cancelText: '取消',

                            ok: function () {
                                if ($("#couponSelection").find("option:selected").val().replace(/^\s*/g, "") == '返现券') {
                                    
                                    var thisRebate = parseFloat(jQuery('#thisRebate').text()).toFixed(2);
                                    $.post('/api/v2/invest/tenderUseRebate/' + CC.user.userId, {
                                        amount: num,
                                        loanId: investRactive.get('loan.id'),
                                        paymentPassword: investRactive.get('paymentPassword'),
                                        rebateAmount: thisRebate
                                    }, function (res) {
                                        if (res.success) {
                                            CccOk.create({
                                                msg: '投资成功，<a href="/invest" style="color:#009ada;text-decoration:none">继续浏览其他项目</a>',
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
                                                msg: '投资失败' + errMsg,
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
                                } //使用返现劵接口end
                                else {
                                    $.post('/lianlianpay/tender', {
                                        amount: num,
                                        loanId: investRactive.get('loan.id'),
                                        placementId: investRactive.get('coupon'),
                                        paymentPassword: investRactive.get('paymentPassword')
                                    }, function (res) {
                                        if (res.success) {
                                            CccOk.create({
                                                msg: '投资成功，<a href="/invest" style="color:#009ada;text-decoration:none">继续浏览其他项目</a>',
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
                                                msg: '投资失败' + errMsg,
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

                                $('.dialog').hide();
                            },
                            cancel: function () {
                                $('.dialog').hide();
                            }
                        });
                    } else {
                        $('.agree-error').css('visibility', 'visible');
                        $('.agree-error').html('请先同意新毅用户投资服务协议');
                    }
                }
            });
        };
    });
    //显示返现金额
    investRactive.on('rebate', function () {
            jQuery('.calculator input[type="text"]').val(jQuery('.calculator input[type="text"]').val().replace(/[^0-9]/g, ''))
                //var inpNum=parseInt(jQuery('.calculator input[type="text"]').val());
            var inpNum = investRactive.get('inputNum');
            if (inpNum > CC.loan.rule.balance) {
                inpNum = CC.loan.rule.balance;
            }

            if (jQuery('#couponSelection').find("option:selected").val() == '返现券' && isNaN(inpNum) == false) {
                $.get('/api/v2/loan/' + CC.loan.id,
                    function (r) {
                        var protimeT = '';
                        var rebateMoney = '';
                        if (r.duration.days != 0) {
                            protimeT = parseInt(r.duration.totalDays);
                            rebateMoney = inpNum * protimeT / 365 * 0.005;
                        } else {
                            protimeT = parseInt(r.duration.totalMonths);
                            rebateMoney = inpNum * protimeT / 12 * 0.005;
                        }
                        var actualAmountNum = investRactive.get('actualAmountNum');
                        if (rebateMoney > actualAmountNum) {
                            rebateMoney = actualAmountNum;
                        }
                        jQuery('#thisRebate').html(rebateMoney.toFixed(2));
                        jQuery('.totalInterestRebate').css('display', 'block');

                    }
                );
            } else {
                jQuery('.totalInterestRebate').css('display', 'none');
            }

        })

    // 初始化倒计时
    if (CC.loan.timeOpen > 0) {
        var serverDate = CC.loan.serverDate;
        var leftTime = utils.countDown.getCountDownTime2(CC.loan.timeOpen,
            serverDate);
        if (leftTime) {
            var countDownRactive = new Ractive({
                el: ".next-time",
                template: require('ccc/loan/partials/countDown.html'),
                data: {
                    countDown: {
                        days: leftTime.day,
                        hours: leftTime.hour,
                        minutes: leftTime.min,
                        seconds: leftTime.sec
                    }
                }
            });
            var interval = setInterval((function () {
                serverDate += 1000;
                var leftTime = utils.countDown.getCountDownTime2(
                    CC.loan.timeOpen, serverDate);
                if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                    clearInterval(interval);
                    window.location.reload();
                } else {
                    countDownRactive.set('countDown', {
                        days: leftTime.day,
                        hours: leftTime.hour,
                        minutes: leftTime.min,
                        seconds: leftTime.sec
                    });
                }
            }), 1000);
        }
    }

    function parsedata(o) {

        var type = {
            'CASH': '现金券',
            'INTEREST': '加息券',
            'PRINCIPAL': '增值券',
            'REBATE': '返现券'
        };
        for (var i = o.length - 1; i >= 0; i--) {
            o[i] = o[i].placement;
            //var canuse = o[i].disabled;
            o[i].value = parseInt(o[i].couponPackage.parValue);
            o[i].id = o[i].id;
            o[i].typeKey = type[o[i].couponPackage.type];
            o[i].minimumInvest = o[i].couponPackage.minimumInvest + "元";

            if (o[i].couponPackage.type === 'INTEREST') {
                o[i].interest = true;
                o[i].displayValue = (parseFloat(o[i].couponPackage.parValue) / 100).toFixed(2) + '%';
            } else if (o[i].couponPackage.type === 'CASH') {
                o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
                o[i].hide = true;
            } else if (o[i].couponPackage.type === 'PRINCIPAL') {
                o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
            } else if (o[i].couponPackage.type === 'REBATE') {
                o[i].displayValue = '';
                o[i].minimumInvest = '';
                var actualAmountNum = o[i].actualAmount;
                investRactive.set('actualAmountNum', actualAmountNum);

            };

            //o[i].canuse = canuse;
        }
        return o;
    };





    function showErrors(error) {
        investRactive
            .set('errors', {
                visible: true,
                msg: error
            });
    }

    function disableErrors() {
        investRactive
            .set('errors', {
                visible: false,
                msg: ''
            });
    }

    function showSelect(amount) {
        $('#couponSelection').val('');
        var months = CC.loan.duration;
        investRactive.set('inum', parseFloat(amount));
        disableErrors();
        loanService.getMyCouponlist(amount, CC.loan.duration, function (coupon) {
            if (coupon.success) {
                var list = parsedata(coupon.data);
                list.sort(function (a, b) {
                    return a.couponPackage.timeExpire - b.couponPackage.timeExpire;
                });
                investRactive.set('selectOption', list);
            }
        });
    }
    //初始化选项
    showSelect(CC.loan.rule.min);

    investRactive.on('getCoupon', function () {
        var inputNum = this.get('inputNum');
        var inum = this.get('inum');
        jQuery('.totalInterestRebate').css('display', 'none');
        if (inputNum.length > 10) {
            showErrors('投标金额最大允许10位数字');
            return false;
        }
        if (parseFloat(inputNum) !== parseFloat(inum)) {
            showSelect(inputNum);
        }
    });
    investRactive.on('tenNum', function () {
        disableErrors();
        var inputNum = this.get('inputNum');
        var amount = CC.loan.rule.leftAmount * (CC.loan.rule.amountUnit == '万' ? 10000 : 1);
        var mout = CC.loan.rule.max > amount ? amount : CC.loan.rule.max;
        if (parseInt(inputNum) > parseInt(mout)) {
            this.set('inputNum', mout);
            inputNum = mout;
        }
        if (inputNum.length > 10) {
            this.set('inputNum', inputNum.substring(0, 10));
            showErrors('投标金额最大允许10位数字');
            return false;
        }
    });
}), 100);







$('.investInput').on('keyup', function () {
    showSelect($(this).val());
});

loanService.getLoanProof(CC.loan.requestId, function (r1) {
    loanService.getCareerProof(CC.loan.LuserId, function (r2) {
        var loanPurpose = [];
        for (var j = 0; j < r1.length; j++) {
            if (r1[j].proof.proofType == "GUARANTEE_ID") {

                if (r1[j].proof.proofType !== '') {
                    r1[j].proofType = i18n.enums.ProofType[r1[j].proof.proofType][0];
                } else {
                    r1[j].proofType = '暂无认证信息';
                }
                loanPurpose.push(r1[j]);
            }
        }


        var proofTypeArr = r2.proofs.CAREER;
        for (var i = 0; i < proofTypeArr.length; i++) {
            if (proofTypeArr[i].proof.proofType !== '') {
                proofTypeArr[i].proofType = i18n.enums.ProofType[proofTypeArr[i].proof.proofType][0];
            } else {
                proofTypeArr[i].proofType = '暂无认证信息';
            }
        };
        if (CC.loan.enterprise) {
            var relateDataRactive = new Ractive({
                // insurance 担保
                el: ".insurance-wrapper",
                template: require('ccc/loan/partials/relateDataOnDetail.html'),
                data: {
                    loanPurpose: loanPurpose,
                    career: proofTypeArr,
                    currentIndex: 0,
                    currentIndexB: 0,
                    selectorsMarginLeft: 0,
                    stageLen: 5,

                }
            });

            relateDataRactive.on("prev-pic next-pic", function (e) {
                var self = this;
                console.log(self.get("currentIndex"));
                if (e.name === 'prev-pic') {
                    self.set("currentIndex", self.get("currentIndex") - 1);
                    if (self.get('currentIndex') < 0) {
                        self.set('currentIndex', self.get('career').length - 1);
                    }
                } else {
                    self.set("currentIndex", self.get("currentIndex") + 1);
                    if (self.get('currentIndex') >= self.get('career').length) {
                        self.set('currentIndex', 0);
                    }
                }

            });

            relateDataRactive.on("prev-picB next-picB", function (e) {
                var self = this;
                console.log(self.get("currentIndexB"));
                if (e.name === 'prev-picB') {
                    self.set("currentIndexB", self.get("currentIndexB") - 1);
                    if (self.get('currentIndexB') < 0) {
                        self.set('currentIndexB', self.get('loanPurpose').length - 1);
                    }
                } else {
                    self.set("currentIndexB", self.get("currentIndexB") + 1);
                    if (self.get('currentIndexB') >= self.get('loanPurpose').length) {
                        self.set('currentIndexB', 0);
                    }
                }

            });

            relateDataRactive.on('begin-big-pic-career', function (e) {
                console.log(e);
                var index = Number(e.keypath.substr(-1));
                var options = {
                    imgs: r2.proofs.CAREER,
                    currentIndex: index,
                    selectorsMarginLeft: 0,
                    stageLen: 5,
                    imgLen: r2.proofs.CAREER.length
                };
                popupBigPic.show(options);
                //			console.log(r2);
                return false;

            });

            relateDataRactive.on('begin-big-pic-loan', function (e) {
                console.log(e);
                var index = Number(e.keypath.substr(-1));
                console.log('*********');
                console.log(index);
                var options = {
                    imgs: loanPurpose,
                    currentIndex: index,
                    selectorsMarginLeft: 0,
                    stageLen: 5,
                    imgLen: loanPurpose.length
                };
                popupBigPic.show(options);
                return false;

            });
        }
    });
});


$('.nav-tabs > li')
    .click(function () {
        $(this)
            .addClass('active')
            .siblings()
            .removeClass('active');
        $('.tab-panel')
            .eq($(this)
                .data('step'))
            .addClass('active')
            .siblings()
            .removeClass('active');
    });



function add() {
    var getNum = parseInt(document.getElementById("calculatorText").value);
    if (getNum > 0) {
        document.getElementById("calculatorText").value = getNum + 100;
    } else {}
}

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
        //        var api = self.api + self.page + '/' + self.pageSize;
        var api = self.api;
        request(api)
            .end()
            .get('body')
            .then(function (r) {
                self.setData(r);

            });
    },
    setData: function (r) {
        var self = this;
        //self.set('rebateMoney',rebateMoney);
        self.set('loading', false);
        self.set('list', self.parseData(r));
        self.set('totalSize', r.totalSize);
        //self.set('protimeT',)
        self.renderPager();
    },
    parseData: function (list) {
        for (var i = 0, l = list.length; i < l; i++) {
            list[i].submitTime = moment(list[i].submitTime)
                .format('YYYY-MM-DD HH:mm:ss');

            //            if (/^HRJK_/.test(list[i].userLoginName)) {
            //                list[i].userLoginName = list.userLoginName.replace('HRJK_', '手机用户');
            //            } else if (list[i].userLoginName.indexOf('手机用户') === 0) {
            //                var _name = list[i].userLoginName.substring(4).replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2');
            //            } else {
            //                if (list[i].userLoginName.length === 2) {
            //                    var _name = mask(list[i].userLoginName, 1);
            //                } else {
            //                    var _name = mask(list[i].userLoginName, 2);
            //                }
            //            }
            //
            //            list[i].userLoginName = _name;
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
        console.log("===>> totalPage = " + self.totalPage);
        for (var i = 0; i < self.totalPage; i++) {
            totalPage.push(i + 1);
        }

        renderPager(totalPage, self.page);
    }
});

function renderPager(totalPage, current) {
    console.log("===>render")
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