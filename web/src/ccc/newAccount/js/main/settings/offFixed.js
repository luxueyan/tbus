"use strict";

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/modules/cccPaging');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var AlertBox = require('ccc/global/js/modules/cccPromiseBox');

var type = 'INTERESTED';//  REDEMPTION


var offractive = new Ractive({
    el: '.account-home-wrapper',
    template: require('ccc/newAccount/partials/invest/offline.html'),
    size: 10, // pageSize
    data: {
        bankCards: CC.user.bankCards,
        loading: true,
        total: 0,
        pageOne: null // 第一次加载的数据
    },
    onrender: function () {
        var that = this;
        $.get('/api/v2/offlineData/offline/MYSELF?status=INTERESTED', function (o) {
            that.set('offlineInhand', o.data.totalSize);
        });
        $.get('/api/v2/offlineData/offline/MYSELF?status=REDEMPTION', function (o) {
            that.set('offlineCleared', o.data.totalSize);
        });
    },
    oninit: function () {
        this.setData(type);
    },
    setData: function (type) {
        var self = this;
        request.get('/api/v2/offlineData/offline/MYSELF?status=' + type + '&page=1&size=' + self.size)
            .end()
            .then(function (o) {
                if (o.body.success) {
                    self.set('loading', false);
                    self.set('typeS', type);
                    self.set('total', o.body.data.totalSize);
                    self.set('pageOne', self.parseData(o.body.data.results));
                    self.set('list', self.parseData(o.body.data.results));
                    self.renderPager(type);
                }
            });
    },
    parseData: function (res) {
        var datas = res;
        var assignStatus = {
            "INTERESTED": "计息中",
            "REDEMPTION": "已兑付"
        };
        for (var i = 0; i < datas.length; i++) {
            var o = datas[i];
            if (datas[i].rate > 100) {
                datas[i].rate = (datas[i].rate / 100).toFixed(2);
            }

            if (datas[i].valueDate) {
                datas[i].valueDate = moment(datas[i].valueDate).format('YYYY-MM-DD');
            } else {
                datas[i].valueDate = '';
            }

            if (datas[i].dueDate) {
                datas[i].dueDate = moment(datas[i].dueDate).format('YYYY-MM-DD');
            } else {
                datas[i].dueDate = '';
            }

            datas[i].Fstatus = assignStatus[o.status];
        }
        return datas;
    },
    renderPager: function (type) {
        var self = this;
        var api = '/api/v2/offlineData/offline/MYSELF?status=' + type + '&page=$page&size=$size';

        this.tooltip();
        $(this.el).find(".ccc-paging").cccPaging({
            total: self.get('total'),
            perpage: self.size,
            api: api.replace('$size', self.size),
            params: {
                type: 'GET',
                error: function (o) {
                    console.info('请求出现错误，' + o.statusText);
                }
            },
            onSelect: function (p, o) {
                self.set('list', p > 1 ? self.parseData(o.data.results) : self.get('pageOne'));
                self.tooltip();
            }
        });
    },
    tooltip: function () {
        $('.tips-top').tooltip({
            container: 'body',
            placement: 'top'
        });
    }

});

offractive.on('changeType', function (e) {
    var $this = $(e.node);
    type = $this.data('type');
    $(".tabs li").removeClass('active');
    $this.addClass('active');
    offractive.setData(type);
})