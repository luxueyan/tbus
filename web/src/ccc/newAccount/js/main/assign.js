'use strict';

require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/cccPaging');
require('ccc/global/js/modules/tooltip');
var Ractive = require('ractive/ractive-legacy');
var ractive;
var statu = '';
var utils = require('ccc/global/js/lib/utils');
var Plan = require('ccc/global/js/modules/cccRepayments');
var pageSize = 5;
var STATUS = ["SETTLED", "OPEN", "FINISHED", "BREACH"];
var defalutApi = '/api/v2/creditassign/listForCreditAssign/' + CC.user.id + '?page=$page&pageSize=$size';
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var templateStatus = {
//    ALL: require('ccc/account/partials/home/investright.html'),
    SETTLED: require('ccc/newAccount/partials/creditassign/creditable.html'),
    OPEN: require('ccc/newAccount/partials/creditassign/crediting.html'),
    FINISHED: require('ccc/newAccount/partials/creditassign/credited.html'),
    PURCHASE: require('ccc/newAccount/partials/creditassign/purchase.html'),
}

function init(status) {
    ractive = new Ractive({
        el: '.right-wrap',
        template: templateStatus[status],
        size: 10,
        data: {
            loading: true,
            total: 0,
            list: [],
            moment: moment,
            pageOne: null
        },
        bindTime: 0,
        onrender: function () {
            var self = this;
            this.filterDataByStatue(status, function (o) {
                self.setData(self.parseData(o));

            });
            if (self.bindTime == 0) {
                self.initClick();
                self.bindTime++;
            }
        },
        setData: function (o) {

            this.set('loading', false);
            this.set('total', o.totalSize);
            this.set('pageOne', o.results);
            this.set('list', o.results);

            this.renderPager();
        },
        filterDataByStatue: function (status, callback) {
            statu = status;
            var self = this;
            var temp = '/api/v2/creditassign/list/user/MYSELF';
            var statueMap = {
//                ALL: '?status=all&page=$page&pageSize=' + self.size,
                SETTLED: '?page=$page&pageSize=' + self.size,
                OPEN: '?status=OPEN&page=$page&pageSize=' + self.size,
                FINISHED: '?status=FINISHED&page=$page&pageSize=' + self.size
            };
            if (status === 'SETTLED') {
                temp = '/api/v2/creditassign/listForCreditAssign/' + CC.user.id;
            }
//            if (status === 'ALL') {
//                temp = '/api/v2/creditassign/listForCreditAssign/' + CC.user.id;
//            }
            temp = temp + statueMap[status];
            defalutApi = temp;
            temp = temp.replace('$page', '1');
            if (statu === 'OPEN'||statu === 'FINISHED') {
                $.get(temp, function (o) {
                    self.setData(self.parseCreditingData(o));
                }).error(function (o) {
                    console.info('请求出现错误，' + o.statusText);
                });
            } else {

                $.get(temp, function (o) {
                    self.setData(self.parseData(o));
                }).error(function (o) {
                    console.info('请求出现错误，' + o.statusText);
                });
            }
        },
        oncomplete: function () {
            // init Plan
            var plan = new Plan();

            // bind events
            this.on('getPlan', function (e) {
                var $this = $(e.node);

                var $tr = $this.parent().parent();
                var $plan = $tr.next();
                var loanId = $this.attr('data-loanid');

                $tr.toggleClass('bg-light');
                $plan.toggle();

                plan.render({
                    container: $plan.find('td'),
                    loanId: loanId,
                    //debug: true,
                    complete: function () {
                        $this.data('loaded', true);
                    }
                });
            });
        },
        parseCreditingData: function (o) {
            var self = this;
            var methodMap = {
                "MonthlyInterest": "按月付息到期还本",
                "EqualInstallment": "按月等额本息",
                "EqualPrincipal": "按月等额本金",
                "BulletRepayment": "一次性还本付息",
                "EqualInterest": "月平息"
            };
            var assignStatus = {
                "PROPOSED": "已申请",
                "SCHEDULED": "已安排",
                "FINISHED": "转让已满",
                "OPEN": "转让中",
                "FAILED": "转让未满",
                "CANCELED": "已取消"
            }
            var list = o.results;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                item.id = item.id;
                item.creditDealRate = item.creditDealRate * 100;
                item.timeOpen = moment(item.timeOpen).format('YYYY-MM-DD HH:mm:ss');
                item.timeFinished = moment(item.timeOpen).add(item.timeOut, 'hours').format('YYYY-MM-DD HH:mm:ss');
                item.status = assignStatus[item.status];
                item.investId = item.investId;
            }
            return o;
        },
//        parseCreditAssignData: function (o) {
//            var self = this;
//            var methodMap = {
//                "MonthlyInterest": "按月付息到期还本",
//                "EqualInstallment": "按月等额本息",
//                "EqualPrincipal": "按月等额本金",
//                "BulletRepayment": "一次性还本付息",
//                "EqualInterest": "月平息"
//            };
//            var STATUS = {
//                PROPOSED: "申请投标",
//                FROZEN: "账户资金冻结",
//                FROZEN_FAILED: "资金冻结失败",
//                FAILED: "流标",
//                FINISHED: "投标成功",
//                CANCELED: "已取消",
//                SETTLED: "已结算",
//                CLEARED: "还款完成",
//                OVERDUE: "逾期",
//                BREACH: "违约"
//            };
//
//            for (var i = 0; i < o.length; i++) {
//                var item = o[i];
//                item.loanTitle = item.loanTitle;
//                item.amount = item.amount;
//                item.rate = item.rate / 100;
//                item.duration = self.formateDuration(item.duration);
//                item.repayMethod = methodMap[item.repayMethod];
//                item.statusName = STATUS[item.status];
//                item.submitTime = new Date(item.submitTime).Format("yyyy-MM-dd");
//            }
//            return o;
//        },
        parseData: function (res) {
            var datas = res.results;
            this.sortBySubmitTime(res.results);
            for (var i = 0; i < datas.length; i++) {
                var o = datas[i];
                datas[i].Fduration = utils.format.duration(o.duration);
                datas[i].Frate = utils.format.percent(o.rate / 100, 2);
                datas[i].Famount = utils.format.amount(o.amount, 2);
                datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
                datas[i].FrepayMethod = utils.i18n.RepaymentMethod[o.repayMethod][0];
                datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
                datas[i].dateTime = moment(o.submitTime).format('YYYY-MM-DD HH:mm:ss');
                // status
                if (o.status === 'FROZEN') {
                    datas[i].Fstatus = '已购买';
                }
                if (o.status === 'FINISHED') {
                    datas[i].Fstatus = '已购买';
                }
                if (o.status === 'SETTLED') {
                    datas[i].Fstatus = '计息中';
                }
                if (o.status === 'CLEARED') {
                    datas[i].Fstatus = '已结息';
                }

                datas[i].amountInterest = this.getAmountInterest(o.repayments);
                if (this.getAmountInterest(o.repayments) !== null) {
                    datas[i].amountInterest = utils.format.amount(this.getAmountInterest(
                        o.repayments), 2);
                }
                if (datas[i].hasContract) {
                    var repay = this.getRepay(o.repayments);
                    datas[i].Frepayed = utils.format.amount(repay.repayed,
                        2);
                    datas[i].Funrepay = utils.format.amount(repay.unrepay,
                        2);
                }
            }
            return res;
        },
        getAmountInterest: function (datas) {
            var amountInterest = null;
            if (!datas) {
                return amountInterest;
            }
            for (var i = 0; i < datas.length; i++) {
                var o = datas[i];
                amountInterest += datas[i].repayment.amountInterest;
            }

            return amountInterest;
        },
        renderPager: function () {
            var self = this;
            this.tooltip();
            var api = defalutApi;
            self.bindActions();
            $(this.el).find(".ccc-paging").cccPaging({
                total: this.get('total'),
                perpage: self.size,
                api: api.replace('$size', this.size),
                params: {
                    type: 'GET',
                    error: function (o) {
                        console.info('请求出现错误，' + o.statusText);
                    }
                },
                onSelect: function (p, o) {
                    console.log(p);
                    self.set('list', p > 1 ? self.parseData(o).results : self.get('pageOne'));
                    self.tooltip();
                }
            });
        },
        initClick: function () {
            var self = this;
            var currentPage = $(".currentPage").text();
            $(".prev").click(function () {
                if (self.page == 1) {
                    return false
                } else {
                    self.page = self.page - 1;
                    self.onrender();
                }
            });

            $(".next").click(function () {
                if (self.page == self.totalPage) {
                    return false
                } else {
                    self.page = self.page + 1;
                    self.onrender();
                }
            });
        },
        tooltip: function () {
            $('.tips-top').tooltip({
                container: 'body',
                placement: 'top'
            });
        },
        getRepay: function (datas) {
            // repayed, unrepay
            var repay = {
                repayed: 0,
                unrepay: 0
            };
            if (!datas) {
                return repay;
            }
            //var _repayed = 0, _unrepay = 0;
            for (var i = 0; i < datas.length; i++) {
                var o = datas[i];
                var _total = o.repayment.amountPrincipal + o.repayment.amountInterest;
                if (o.status === 'REPAYED') {
                    repay.repayed += _total;
                } else {
                    repay.unrepay += _total;
                }
            }
            return repay;
        },
        bindActions: function () {
            var bindTime = 0;
            $('.operation').on('click', function () {
                var returnMap = {
                    "CREDIT_ASSIGN_DISABLED": "没有开启债权转让功能",
                    "REASSIGN_DISABLED": "二次转让功能关闭",
                    "INVEST_NOT_FOUND": "原始投标找不到",
                    "SUCCESSFUL": "成功",
                    "EXCEED_DISCOUNT_LIMIT": "超过债权转让折让率允许范围",
                    "REPEATED_ASSIGN_REQUEST": "债权转让已存在,不能重复转让",
                    "INSUFFICIENT": "没有本金可转让",
                    "ILLEGAL_INVEST": "投标状态不可转让",
                    "ILLEGAL_INVEST_USER": "只能转让自己的投标",
                    "ILLEGAL_REPAYMENT": "投标有逾期违约还款",
                    "ILLEGAL_DATE": "不在可转让时间范围",
                    "NEXT_REPAY_DATE_LIMIT": "下次回款到期日前一定天数内不允许转让",
                    "INVEST_DATE_LIMIT": "投资持有一定天数后才允许转让",
                    "DAILY_LIMIT": "超过每日债权转让次数上限",
                    "DISCOUNT_LIMIT": "超过债权转让折让率允许范围",
                    "ASSIGN_AMOUNT_LIMIT": "低于最低转让金额限制"
                };

                var self = this;
                $("#creditDealRate").val('');

                var investId = $(this).data("invest");
                var amount = $(this).data("amount");
                var title = $(this).data("title");

                $(".assignAmount").text("￥" + amount);
                $("#form-data-title").text(title + " - 债权转让");

                $("#creditDealRate").blur(function () {
                    if ($(this).val() == "") {
                        $(this).siblings("span.error").text("");
                    } else if ($(this).val() > 1.05) {
                        $("#creditDealRate").siblings("span.error").text("折价率必须小于等于1.05!");
                    } else if ($(this).val().length > 4) {
                        $("#creditDealRate").siblings("span.error").text("折价率最多保留两位小数");
                    } else if ($(this).val() < 0.95) {
                        $("#creditDealRate").siblings("span.error").text("折价率必须大于等于0.95!");
                    }else {
                        $(this).siblings("span.error").text("");
                    }
                });

                $("#mask-layer-wraper").show();
                $('#popup').show();

                //提交

                $("#btn-confirm").click(function () {
                    $(this).addClass('disabled').html('处理中');
                    var assignTitle = title + " - 债权转让";
                    var creditDealRate = $("#creditDealRate").val();
                    if (creditDealRate > 1.05) {
                        $("#creditDealRate").siblings("span.error").text("折价率必须小于等于1.05!");
                        $(this).removeClass('disabled').html('确认转让')
                        return false;
                    } else if (creditDealRate < 0.95 && creditDealRate != '') {
                        $("#creditDealRate").siblings("span.error").text("折价率必须大于等于0.95!");
                        $(this).removeClass('disabled').html('确认转让');
                        return false;
                    } else if (creditDealRate.length > 4) {
                        $("#creditDealRate").siblings("span.error").text("折价率最多保留两位小数");
                        $(this).removeClass('disabled').html('确认转让');
                        return false;
                    } else if (creditDealRate == '') {
                        $("#creditDealRate").siblings("span.error").text("请输入您的折价率");
                        $(this).removeClass('disabled').html('确认转让');
                        return false;
                    } else if(isNaN(creditDealRate)){
                          $("#creditDealRate").siblings("span.error").text("只能输入数字和小数点");
                          $(this).removeClass('disabled').html('确认转让');
                          return false;
                    }
                    else {
                        $("#creditDealRate").siblings("span.error").text("");
                        if (investId && creditDealRate && assignTitle) {
                            accountService.createCreditAssign(investId, creditDealRate, assignTitle, function (o) {

                                if (o == "SUCCESSFUL") {

                                    alert("债转创建成功!");

                                    $('#mask-layer-wraper').hide();
                                    $('#popup').hide();
                                    window.location.reload();
                                } else {
                                    alert("债转创建失败，" + returnMap[o]);
                                    window.location.reload();

                                    $('#mask-layer-wraper').hide();
                                    $('#popup').hide();

                                }

                            });
                        }
                    }
                });
            });
            //关闭浮层
            $('#popup-close').click(function () {
                $('#mask-layer-wraper').hide();
                $('#popup').hide();
            });

            $(".cancel").click(function () {
                var creditassignId = $(this).data('creditassign');
                if (!creditassignId) {
                    return false;
                } else {
                    accountService.cancelCreditassign(creditassignId, function (o) {
                        if (o) {
                            alert('取消转让成功！');
                            window.location.reload();
                        } else {
                            alert('取消转让失败！');
                            window.location.reload();
                        }
                    });
                }
            });
        },
        sortBySubmitTime: function (datas) {
            if (datas.length === 0) {
                return datas;
            }
            datas.sort(function compare(a, b) {
                return b.submitTime - a.submitTime;
            });
        },
        sortByAmount: function (datas) {
            if (datas.length === 0) {
                return datas;
            }
            datas.sort(function compare(a, b) {
                return b.amount - a.amount;
            });
        }

    });

}


$("#investTime").click(function () {
    var list = ractive.get("list");
    sortBySubmitTime(ractive.get("list"));
    $(this).addClass('danger-button');
    $("#investAmount").removeClass('danger-button');
});

$("#investAmount").click(function () {
    var list = ractive.get("list");
    sortByAmount(ractive.get("list"));
    $(this).addClass('danger-button');
    $("#investTime").removeClass('danger-button');
});

$("#filter").click(function () {
    var startDate = moment($("#startDate").val()).unix() * 1000;
    var endDate = moment($("#endDate").val()).unix() * 1000;
    ractive.filterDataByTime(startDate, endDate);
});

$(".ul-tab>li+li").on('click', function () {
    $(this).addClass('active').siblings().removeClass('active');
    var statue = $(this).data('statue');
    init(statue);
    //        this.set('template', );
});
init('SETTLED');

function sortBySubmitTime(ary) {
    if (ary.length === 0) {
        return ary;
    }
    ary.sort(function compare(a, b) {
        return b.submitTime - a.submitTime;
    });
}

function sortByAmount(ary) {
    if (ary.length === 0) {
        return ary;
    }

    ary.sort(function compare(a, b) {
        return b.amount - a.amount;
    });
}
