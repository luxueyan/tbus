"use strict";

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var fixedRactive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/fixed.html'),
    data:{
      bankCards:CC.user.bankCards
    },
    onrender:function(){
      var outstandingInterest = parseFloat(CC.user.outstandingInterest || 0).toFixed(2);
      var amoutArray = outstandingInterest.split('.');
      this.set('outstandingInterest', parseInt(amoutArray[0]));
      this.set('oMore', amoutArray[1]);
    }
});



var Tab = {

  // 转让
  ASSIGN: {
    ractive: null,
    api: '/api/v2/creditassign/list/user/MYSELF?status=OPEN&page=$page&pageSize=$size',
    template: require('ccc/newAccount/partials/invest/assign.html')
  },
  // 进行中/申请中 (FINISHED/PROPOSED/FROZEN) 全部 (SETTLED/OVERDUE/BREACH/FINISHED/PROPOSED/FROZEN/CLEARED)
  INHAND: {
    ractive: null,
    api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=SETTLED&status=OVERDUE&status=BREACH&status=FINISHED&status=PROPOSED&status=FROZEN&status=CLEARED',
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
        if(type == 'ASSIGN'){
          var api = tab.api.replace('$page', 1).replace('$size', this.size);
        }else{
          var api = tab.api.replace('$page', 0).replace('$size', this.size);
        }

        $.get(api, function (o) {
          //console.log(o)
          callback(o);
        }).error(function (o) {
          console.info('请求出现错误，' + o.statusText);
        });
      },
      setData: function (o) {
        this.set('loading', false);
        this.set('total', o.totalSize);
        this.set('pageOne', o.results);
        this.set('list', o.results);
        this.renderPager();
      },
      parseData: function (res) {
        var datas = res.results;
        for (var i = 0; i < datas.length; i++) {
          var o = datas[i];
          switch (type) {
            case 'ASSIGN':
              var assignStatus = {
                "PROPOSED": "已申请",
                "SCHEDULED": "已安排",
                "FINISHED": "转让已满",
                "OPEN": "转让中",
                "FAILED": "转让未满",
                "CANCELED": "已取消"
              };
              datas[i].id = o.id;
              datas[i].creditDealRate = o.creditDealRate * 100;
              datas[i].timeOpen = moment(o.timeOpen).format('YYYY-MM-DD HH:mm:ss');
              datas[i].timeFinished = moment(o.timeOpen).add(o.timeOut, 'hours').format('YYYY-MM-DD HH:mm:ss');
              datas[i].status = assignStatus[o.status];
              datas[i].investId = o.investId;
              break;
            case 'INHAND':
              datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
              datas[i].Fduration = utils.format.duration(o.duration);
              datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
              datas[i].Frate = utils.format.percent(o.rate / 100, 2);
              datas[i].Famount = utils.format.amount(o.amount, 2);
              datas[i].expectYield = utils.format.amount(o.repayments[0].repayment.amountInterest, 2);
              datas[i].FrepayMethod = utils.i18n.RepaymentMethod[o.repayMethod][0];
              datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
              break;
            case 'CLEARED':
              datas[i].Fduration = utils.format.duration(o.duration);
              datas[i].Frate = utils.format.percent(o.rate / 100, 2);
              datas[i].Famount = utils.format.amount(o.amount, 2);
              datas[i].expectYield = utils.format.amount(o.repayments[0].repayment.amountInterest, 2);
              datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
              datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
              datas[i].endDate = o.repayments[o.repayments.length - 1].repayment.dueDate;

              //获取未到期的个数
              var notodays = 0;
              for (var j = 0; j < o.repayments.length; j++) {
                if (o.repayments[j].status == 'UNDUE') {
                  notodays++;
                }
              }
              datas[i].notodays = notodays;
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
            datas[i].Frepayed = utils.format.amount(repay.repayed, 2);
            datas[i].Funrepay = utils.format.amount(repay.unrepay, 2);
          }
        }
        return res;
      },
      renderPager: function () {
        var self = this;
        self.bindActions();
        this.tooltip();
        $(this.el).find(".ccc-paging").cccPaging({
          total: this.get('total'),
          perpage: self.size,
          api: tab.api.replace('$size', this.size),
          params: {
            pageFromZero: true,
            type: 'GET',
            error: function (o) {
              console.info('请求出现错误，' + o.statusText);
            }
          },
          onSelect: function (p, o) {
            self.set('list', p > 0 ? self.parseData(o).results : self.get('pageOne'));
            self.tooltip();
          }
        });
      },
      onrender: function () {
        var self = this;
        this.getData(function (o) {
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

          var investId = $(this).data("invest");
          var amount = $(this).data("amount");
          var title = $(this).data("title");

          $(".assignAmount").text(amount.toFixed(2));
          $("#form-data-title").text("转让 - " + title);

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
            };

            var creditDealRate = $("#creditDealRate").val();
            $("#form-num").text((amount*creditDealRate).toFixed(2));
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
    });
  }
  //else {}
}
init(getCurrentType());