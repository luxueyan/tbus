"use strict";

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var AlertBox = require('ccc/global/js/modules/cccPromiseBox');

var fixedRactive = new Ractive({
    el: ".account-home-wrapper",
    template: require('ccc/newAccount/partials/home/fixed.html'),
    data: {
        bankCards: CC.user.bankCards
    },
    onrender: function () {
        var that = this ;
        var outstandingInterest = parseFloat(CC.user.investStatistics.outstandingInterest || 0).toFixed(2);
        var amoutArray = outstandingInterest.split('.');
        this.set('outstandingInterest', parseInt(amoutArray[0]));
        this.set('oMore', amoutArray[1]);

        var holdTotalAmount = parseFloat(CC.user.investStatistics.investStatistics.dueAmount.totalAmount || 0).toFixed(2);
        var amoutArray = holdTotalAmount.split('.');
        this.set('holdTotalAmount', parseInt(amoutArray[0]));
        this.set('hMore', amoutArray[1]);

        $.get('/api/v2/user/MYSELF/invest/list/1/4?status=SETTLED&status=OVERDUE&status=BREACH&status=FINISHED&status=PROPOSED&status=FROZEN', function (o) {
            that.set('ASSIGN', o.result.totalSize);
        });
        $.get('/api/v2/creditassign/list/user/MYSELF?status=OPEN&status=FINISHED', function (o) {
            that.set('INHAND', o.totalSize);
        });
        $.get('/api/v2/user/MYSELF/invest/list/1/4?status=CLEARED', function (o) {
            that.set('CLEARED', o.result.totalSize);
        });
    }
});


var Tab = {

    // 转让
    ASSIGN: {
        ractive: null,
        api: '/api/v2/creditassign/list/user/MYSELF?status=OPEN&status=FINISHED&page=$page&pageSize=$size',
        template: require('ccc/newAccount/partials/invest/assign.html')
    },
    // 进行中/申请中 (FINISHED/PROPOSED/FROZEN) 全部 (SETTLED/OVERDUE/BREACH/FINISHED/PROPOSED/FROZEN/CLEARED)
    INHAND: {
        ractive: null,
        api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=SETTLED&status=OVERDUE&status=BREACH&status=FINISHED&status=PROPOSED&status=FROZEN',
        template: require('ccc/newAccount/partials/invest/inhand.html')
    },
    // 已结清 (CLEARED)
    CLEARED: {
        ractive: null,

        api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=CLEARED',
        template: require('ccc/newAccount/partials/invest/cleared.html')
    }
    // REALIZATION (可变现)
};

var STATUS = ["SETTLED", "CLEARED", "OVERDUE", "BREACH"];

var getCurrentType = function () {
    return $('.ccc-tab li.active').data('type');
};

$('ul.tabs li').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active');
    var num = $(this).index();
    $('.fixed-invest .tab-panel').eq(num).addClass('active').siblings().removeClass('active');
});
$('.inhand_pro').on('click', function () {
    $(".inhand_pro").css("background-image","url('/ccc/newAccount/img/icon_inhand_active.png')");
    $(".assign_pro").css("background-image","url('/ccc/newAccount/img/icon_assign.png')");
    $(".clear_pro").css("background-image","url('/ccc/newAccount/img/icon_clear.png')");
});
$('.assign_pro').on('click', function () {
    $(".inhand_pro").css("background-image","url('/ccc/newAccount/img/icon_inhand.png')");
    $(".assign_pro").css("background-image","url('/ccc/newAccount/img/icon_assign_active.png')");
    $(".clear_pro").css("background-image","url('/ccc/newAccount/img/icon_clear.png')");
});
$('.clear_pro').on('click', function () {
    $(".inhand_pro").css("background-image","url('/ccc/newAccount/img/icon_inhand.png')");
    $(".assign_pro").css("background-image","url('/ccc/newAccount/img/icon_assign.png')");
    $(".clear_pro").css("background-image","url('/ccc/newAccount/img/icon_clear_active.png')");
});
$('ul.tabs li a').on('click', function () {
    var type = $(this).parent().data('type');
    init(type);
});


function init(type) {
    var tab = Tab[type];
    if (tab.ractive === null) {
        tab.ractive = new Ractive({
            el: '.panel-' + type,
            template: tab.template,
            size: 4, // pageSize
            data: {
                loading: true,
                total: 0,
                list: [],
                pageOne: null // 第一次加载的数据
            },
            getData: function (callback) {
                var self = this;
                var api = tab.api.replace('$page', 1).replace('$size', self.size);
                //if (type == 'ASSIGN') {
                //    var api = tab.api.replace('$page', 1).replace('$size', self.size);
                //} else {
                //    var api = tab.api.replace('$page', 0).replace('$size', self.size);
                //}

                $.get(api, function (o) {
                    callback(o);
                }).error(function (o) {
                    console.info('请求出现错误，' + o.statusText);
                });
            },
            setData: function (o) {
                this.set('loading', false);
                if (type == 'ASSIGN') {
                    this.set('total', o.totalSize);
                    this.set('pageOne', o.results);
                    this.set('list', o.results);
                }else{
                    this.set('total', o.result.totalSize);
                    this.set('pageOne', o.result.results);
                    this.set('list', o.result.results);
                }
                this.renderPager();
            },
            parseData: function (res) {
                if (type == 'ASSIGN') {
                    var datas = res.results;
                    for (var i = 0; i < datas.length; i++) {
                        var o = datas[i];
                        var assignStatus = {
                            "PROPOSED": "已申请",
                            "SCHEDULED": "已安排",
                            "FINISHED": "转让已满",
                            "OPEN": "转让中",
                            "FAILED": "转让未满",
                            "CANCELED": "已取消"
                        };
                        datas[i].id = o.id;
                        //datas[i].creditDealRate = o.creditDealRate * 100;
                        datas[i].timeOpen = moment(o.timeOpen).format('YYYY-MM-DD HH:mm:ss');
                        datas[i].timeFinished = moment(o.timeOpen).add(o.timeOut, 'hours').format('YYYY-MM-DD HH:mm:ss');
                        datas[i].Fstatus = assignStatus[o.status];
                        datas[i].investId = o.investId;
                    }
                    return res;
                }else{
                    var datas = res.result.results;
                    for (var i = 0; i < datas.length; i++) {
                        var o = datas[i];
                        datas[i].FvalueDate = moment(res.dates[datas[i].loanId].loanRequest.valueDate).format('YYYY-MM-DD');
                        datas[i].FdueDate = moment(res.dates[datas[i].loanId].loanRequest.dueDate).format('YYYY-MM-DD');
                        //datas[i].timeFinished = moment(res.dates[datas[i].loanId].timeFinished).format('YYYY-MM-DD');
                        datas[i].timeOpen = moment(res.dates[datas[i].loanId].timeOpen).format('YYYY-MM-DD');
                        //datas[i].timeout = res.dates[datas[i].loanId].timeout/24;
                        //datas[i].timeEnd = moment(res.dates[datas[i].loanId].timeOpen).add(res.dates[datas[i].loanId].timeout, 'days').format('YYYY-MM-DD');

                        switch (type) {
                            case 'INHAND':
                                datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
                                datas[i].Fduration = utils.format.duration(o.duration);
                                datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
                                datas[i].Frate = utils.format.percent(o.rate / 100, 2);
                                datas[i].Famount = utils.format.amount(o.amount, 2);
                                datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
                                datas[i].requestId = o.loan.loanRequest.id;
                                var nowDate = new Date();
                                if(datas[i].status == 'SETTLED'){
                                    if(datas[i].loan.loanRequest.valueDate <= nowDate){
                                        datas[i].Fstatus = '计息中';
                                    }
                                };
                                break;
                            case 'CLEARED':
                                datas[i].Fduration = utils.format.duration(o.duration);
                                datas[i].Frate = utils.format.percent(o.rate / 100, 2);
                                datas[i].Famount = utils.format.amount(o.amount, 2);
                                datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
                                datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
                                break;
                        }
                        ////申请中
                        //if (o.status === 'FINISHED' || o.status === 'PROPOSED' || o.status === 'FROZEN') {
                        //  datas[i].Fstatus = '申请中';
                        //}
                        ////持有中
                        //if (o.status === 'SETTLED' || o.status === 'OVERDUE' || o.status === 'BREACH') {
                        //  datas[i].Fstatus = '持有中';
                        //}
                        ////已结束
                        //if (o.status === 'CLEARED') {
                        //  datas[i].Fstatus = '已结束';
                        //}


                        if (datas[i].hasContract) {
                            var repay = this.getRepay(o.repayments);
                            datas[i].holdDay = (moment(nowDate).unix() - moment(datas[i].valueDate).unix())/24/60/60;
                            datas[i].Frepayed = utils.format.amount(repay.repayed, 2);
                            console.log("333333333")
                            //console.log(datas[i].holdDay)
                            //console.log(moment(nowDate))
                            //console.log(moment(nowDate).unix())
                            console.log(moment(datas[i].valueDate))
                            //console.log(moment(datas[i].valueDate).unix())
                            //datas[i].Funrepay = utils.format.amount(repay.unrepay, 2);
                            datas[i].unrepay = o.amount+o.amount*(o.rate/10000)*(parseInt(datas[i].holdDay))/365;
                            datas[i].Funrepay = utils.format.amount(datas[i].unrepay,2);
                        }
                    }
                    return res;
                }
            },
            renderPager: function () {
                var self = this;

                this.tooltip();
                $(this.el).find(".ccc-paging").cccPaging({
                    total: self.get('total'),
                    perpage: self.size,
                    api: tab.api.replace('$size', self.size),
                    params: {
                        //pageFromZero: true,
                        type: 'GET',
                        error: function (o) {
                            console.info('请求出现错误，' + o.statusText);
                        }
                    },
                    onSelect: function (p, o) {
                        if (type == 'ASSIGN') {
                            self.set('list', p > 1 ? self.parseData(o).results : self.get('pageOne'));
                        }else{
                            self.set('list', p > 1 ? self.parseData(o).result.results : self.get('pageOne'));
                        }

                        self.tooltip();
                    }
                });
            },
            onrender: function () {
                var self = this;
                self.getData(function (o) {
                    self.setData(self.parseData(o));
                });
            },
            oncomplete: function () {
                this.on('show-repayments', function (e) {
                    var $this = $(e.node);
                    var $tr = $this.parents("tr");
                    var investId = $this.attr('data-id');
                    $tr.toggleClass('bg-light');
                    $this.parents("tr").next().toggle();
                    var detailheight = $this.parents("tr").next().outerHeight(true);
                    $('.detail').css('height', detailheight);
                    $('.back').click(function () {
                        $('.detail_each').css('display', 'none');
                        $('.detail').css('height', 'auto');
                    })
                });



                this.on('showFixed', function (e) {
                    //console.log(e)
                    var alertTip = new AlertBox();
                    var data = {
                        amount:$(e.node).data('amount'),
                        investId:$(e.node).data('invest'),
                        creditDealRate:null,
                        error:'',
                        assignTitle:$(e.node).data('title'),
                        requestId:$(e.node).data('request'),
                        unrepay:$(e.node).data('unrepay'),
                        Funrepay: utils.format.amount($(e.node).data('unrepay'),2)
                    }
                    //console.log(unrepay)
                    //console.log(data.unrepay)
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
                        "DISCOUNT_TOO_HIGH":"债权转让折让率太高，实际利率小于等于零",
                        "ASSIGN_AMOUNT_LIMIT": "低于最低转让金额限制",
                        'NEXT_REPAY_DATE_IN_TIMEOUT':'',
                    };

                    alertTip.alert({
                        width:535,
                        hasCloseBtn:true,
                        title:data.assignTitle,
                        hasCancelBtn:false,
                        hasOkBtn:false,
                        renderHandler:function(el){
                            var tipRac = new Ractive({
                                el:el,
                                template:require('ccc/newAccount/partials/settings/fixed.html'),
                                data:data,
                                magic:true,
                                computed:{
                                    area:'(${unrepay} * ${creditDealRate}).toFixed(2)',
                                    commiss:'(${unrepay} * ${creditDealRate} * 0.001).toFixed(2)',
                                },
                                oncomplete:function(){
                                    var that = this;
                                    this.on('changeVal',function(e){
                                        if(/\D/g.test(data.creditDealRate) && data.creditDealRate.indexOf('.') ==-1) return data.error = '请输入正确的折价率';
                                        else if(data.creditDealRate == '') return data.error = '请输入折价率！'
                                        else if(data.creditDealRate>2.05) return data.error = '折价率必须小于等于1.05!';
                                        else if(data.creditDealRate<0.95) return data.error = '折价率必须大于等于0.95!';
                                        else if((data.creditDealRate+'').length>4) return data.error = '折价率最多保留两位小数！';
                                        else data.error = '';
                                    })

                                    this.on('makeSure',function(e){
                                        if(data.error || !data.creditDealRate) return !data.creditDealRate ? data.error = '请输入折价率！':data.error;
                                        e.node.disabled = true;
                                        e.node.innerHTML = '转让中...';
                                        //发送请求
                                        accountService.createCreditAssign(data.investId, data.creditDealRate, data.assignTitle, function (o) {
                                            if (o.success) {
                                                alert("债转创建成功!");
                                                window.location.reload();
                                            } else {
                                                alert("债转创建失败，" + o.error[0].message);
                                                window.location.reload();
                                            }

                                        });
                                    })
                                },
                            })
                        }
                    });
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

        });
    }
    //else {}
}
init(getCurrentType());