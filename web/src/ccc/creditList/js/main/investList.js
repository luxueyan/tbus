/*jshint multistr: true */

"use strict";
var i18n = require('@ds/i18n')['zh-cn'];

var InvestListService = require('ccc/creditList/js/main/service/list')
    .InvestListService;
var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/jquery.easy-pie-chart.js')

var params = {
    pageSize: 10,
    currentPage: 0,
    //status: '',
    minDealAmount: 0,
    maxDealAmount: 100000000, //转让价格
    minRemainPeriod: 0,      //剩余期限
    maxRemainPeriod: 100,
    orderBy:'',
    asc:''   //是否升序
};

function jsonToParams(params) {
    var str = '';
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            str += '&' + key + '=' + params[key];
        }
    }
    return str;
}


function formatItem(item) {
    //格式化序列号
    if( item.providerProjectCode ){
        if( item.providerProjectCode.indexOf('#') > 0 ){
            var hh_project_code = item.providerProjectCode.split('#');
            item.fProjectType = hh_project_code[0];
            item.fProjectCode = hh_project_code[1];
        } else {
            item.fProjectType = '';
            item.fProjectCode = item.providerProjectCode;
        }       
    }
    return item;
}

function parseLoanList(list) {
    for (var i = 0; i < list.length; i++) {
        list[i] = formatItem(list[i]);
		list[i].titleLength = replaceStr(list[i].title);
		list[i].actualRate = (list[i].actualRate*100).toFixed(2);
        list[i].dueDate = (moment(list[i].dueDate).format('YYYY-MM-DD'));
    }
    return list;
}
	
function replaceStr(str){
	return str.replace(/[^\x00-xff]/g,'xx').length;
}


var investRactive = new Ractive({
    el: ".invest-list-wrapper",
    template: require('ccc/creditList/partials/singleInvest.html'),
    data: {
        list: [],
        RepaymentMethod: i18n.enums.RepaymentMethod, // 还款方式
        user: CC.user
    },
    onrender:function(){
        var that = this;
        InvestListService.getCreditassignData(jsonToParams(params),function(res){
            that.set('list',parseLoanList(res.results));
            that.renderPager(res,params.currentPage,that);
            //console.log(res);
        });

    },
    oncomplete:function(){
        var that = this;
        $('.sStatus li').click(function () {
            $(this).addClass("selected").siblings().removeClass("selected");
            var status = $(this).data("status");
            if (status == 'SCHEDULED') {
                params.minDuration = 0;
                params.maxDuration = 100;
            }
            params.status = status;
            params.currentPage = 1;
            that.onrender();
        });

        $('.sTitou li').click(function () {
            if (!$(this).hasClass("selectTitle")) {
                $(this).addClass("s__is-selected").siblings().removeClass("s__is-selected");
                var minamount = $(this).data('min-amount');
                var maxamount = $(this).data('max-amount');

                params.currentPage = 0;
                params.minDealAmount = minamount;
                params.maxDealAmount = maxamount;
                that.onrender();
            }
        });

        $('.sDuration li').click(function () {
            if (!$(this).hasClass("selectTitle")) {
                $(this).addClass("s__is-selected").siblings().removeClass("s__is-selected");
                var minDuration = $(this)
                    .data('min-duration');
                var maxDuration = $(this)
                    .data('max-duration');

                params.currentPage = 0;
                params.minRemainPeriod = minDuration;
                params.maxRemainPeriod = maxDuration;
                that.onrender();
            }
        });

        $('.orderbyrules li').click(function () {
            var rules = $(this).data('rules');
            if (rules != 'normal') {
                if ($(this).hasClass('activeLi01')) {
                    params.asc = false;
                    //console.log($(this).hasClass('activeLi01'));
                    $(this).addClass('activeLi02').removeClass('activeLi01');
                    $(this).siblings().removeClass('activeLi01');
                    $(this).siblings().removeClass('activeLi02');
                } else {
                    params.asc = true;
                    //console.log($(this).hasClass('activeLi01'))
                    $(this).addClass('activeLi01').removeClass('activeLi02');
                    $(this).siblings().removeClass('activeLi01');
                    $(this).siblings().removeClass('activeLi02');
                }
                params.currentPage = 0;
                params.orderBy = rules;
            } else {
                params.currentPage = 0;
                delete params.orderBy;
                delete params.asc;
                $(this).addClass('activeLi01');
                $(this).siblings().removeClass('activeLi01');
                $(this).siblings().removeClass('activeLi02');
            }
            that.onrender();
        });
    },
    renderPager:function(res, currentPage,obj){
        if (!currentPage) {
            currentPage = 1;
        }

        function createList(len) {
            var arr = [];
            var i=parseInt(len/params.pageSize);
            if(len%params.pageSize>0){i++;}
            for(var m=0;m<i;m++){
                arr[m] =  m + 1;
            }
            return arr;
        };

        var pagerRactive = new Ractive({
            el: '#invest-pager',
            template: require('ccc/invest/partials/pager.html'),
            data: {
                totalPage: createList(res.totalSize),
                current: currentPage
            }
        });
        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            currentPage=current-1;
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                params.currentPage = current;
                obj.onrender();
            }

        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            currentPage=current+1;
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
                params.currentPage = current;
                obj.onrender();
            }
        });
        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                currentPage = page;
            } else {
                currentPage = e.context;
            }
            this.set('current', currentPage);
            params.currentPage = currentPage;
            obj.onrender();
        });
    },
});

//转让总金额和总笔数
var totalRactive = new Ractive({
    el:'.statistics-box',
    template:'<div class="content total">转让总金额(元): <span>{{totalDealAmount}}</span></div><div class="content time">转让总笔数(笔): <span>{{totalNumber}}</span></div>',
    onrender:function(){
        var self = this;
        request.get('/api/v2/creditassign/stat/total?status=FINISHED')
            .end()
            .then(function(r){
                var num = r.body.data;
                var totalDealAmount = utils.format.amount(num.totalDealAmount,2);
                var totalNumber = utils.format.amount(num.totalNumber,2);
                self.set('totalDealAmount', totalDealAmount);
                self.set('totalNumber', totalNumber);
            })
    }
});

//成交记录
var recordRactive = new Ractive({
    el:'.deal-data-box',
    template:require('ccc/creditList/partials/record.html'),
    data:{
        record:[]
    },
    onrender:function(){
        var self = this;
        request.get('/api/v2/creditassign/list/allInvests?status=SETTLED')
            .end()
            .then(function(r){
                recordRactive.set('record', self.parseDate(r.body.results));
            })
    },
    parseDate:function(res){
        for(var i=0;i<res.length;i++){
            res[i].mobile =  res[i].mobile.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2');
            res[i].submitTime =  moment(res[i].submitTime).format('YYYY-MM-DD');
        }
        return res;
    }
});

//常见问题
request.get(encodeURI('/api/v2/cms/category/HELP/name/产品转让')).end().then(function(res) {
    //console.log(res.body);
    var count = new Ractive({
        el: '.question-box',
        template: '{{#each items:i}}<ul>{{#if i<5}}<li><a href="/help/transfer">{{title}}</a></li>{{/if}}</ul>{{/each}}',
        data: {
            items: res.body
        }
    });
});