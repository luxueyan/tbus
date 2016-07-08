"use strict";

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');

var floatRactive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/float.html'),
    data:{
      bankCards:CC.user.bankCards,
    }
});



var Tab = {

  // 持有中 (SETTLED/OVERDUE/BREACH)
  HOLDING: {
    ractive: null,
    api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=SETTLED&status=OVERDUE&status=BREACH',
    template: require('ccc/newAccount/partials/float/holding.html')
  },
  // 进行中/申请中 (FINISHED/PROPOSED/FROZEN)
  INHAND: {
    ractive: null,
    api: '/api/v2/user/MYSELF/invest/list/$page/$size?status=FINISHED&status=PROPOSED&status=FROZEN',
    template: require('ccc/newAccount/partials/float/inhand.html')
  }
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
        var api = tab.api.replace('$page', 0).replace('$size', this.size);
        $.get(api, function (o) {
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
            case 'ALL':
              datas[i].Fduration = utils.format.duration(o.duration);
              datas[i].Frate = utils.format.percent(o.rate / 100, 2);
              datas[i].Famount = utils.format.amount(o.amount, 2);
              datas[i].Fstatus = utils.i18n.InvestStatus[o.status];
              datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
              //获取最后还款日期
              if (o.repayments.length) {
                datas[i].endDate = o.repayments[o.repayments.length - 1].repayment.dueDate;
                //获取未到期的个数
                var notodays = 0;
                for (var j = 0; j < o.repayments.length; j++) {
                  if (o.repayments[j].status == 'UNDUE') {
                    notodays++;
                  }
                }
                datas[i].notodays = notodays;
              }

              break;
            case 'HOLDING':
              datas[i].Fduration = utils.format.duration(o.duration);
              datas[i].Frate = utils.format.percent(o.rate / 100, 2);
              datas[i].Famount = utils.format.amount(o.amount, 2);
              datas[i].hasContract = ($.inArray(o.status, STATUS) !== -1) ? true : false;
              datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
              datas[i].endDate = o.repayments[o.repayments.length - 1].repayment.dueDate;
              //获取未到期的个数
              var endAmount = 0;
              for (var j = 0; j < o.repayments.length; j++) {
                endAmount = endAmount +  o.repayments[j].repayment.amountInterest;
              }
              datas[i].endAmount = utils.format.amount(endAmount, 2);
              break;
            case 'INHAND':
              datas[i].submitTime = moment(o.submitTime).format('YYYY-MM-DD');
              datas[i].Fduration = utils.format.duration(o.duration);
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
          //申请中
          if (o.status === 'FINISHED' || o.status === 'PROPOSED' || o.status === 'FROZEN') {
            datas[i].Fstatus = '申请中';
          }
          //持有中
          if (o.status === 'SETTLED' || o.status === 'OVERDUE' || o.status === 'BREACH') {
            datas[i].Fstatus = '持有中';
          }
          //已结束
          if (o.status === 'CLEARED') {
            datas[i].Fstatus = '已结束';
          }


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
      }
    });
  }
  //else {}
}
init(getCurrentType());