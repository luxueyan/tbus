/*jshint unused: false*/

'use strict';

require('bootstrap/js/transition');
require('bootstrap/js/tooltip');
require('bootstrap/js/dropdown');
require('eonasdan-bootstrap-datetimepicker');
require('ccc/global/js/modules/cccTab');
require('ccc/global/js/modules/cccPaging');

var template = require('ccc/account/partials/funds/funds.html');
var utils = require('ccc/global/js/lib/utils');

var typeLists = [];
var size = 10; // pageSize;
typeLists[0] = [{
    type: 'ALL',
    text: '全部'
}];
window.u = utils;

var FundRecordType = utils.i18n.FundRecordType;
$.each(FundRecordType, function (k, v) {
    typeLists[0].push({
        type: k,
        text: v
    });
});

typeLists[1] = [{
    type: true,
    text: '全部状态'
}, {
    type: false,
    text: '成功'
}];

typeLists[2] = [{
    type: true,
    text: '全部状态'
}, {
    type: false,
    text: '成功'
}];

var statusMap = {
    'INITIALIZED': '初始',
    'PROCESSING' : '处理中',
    'AUDITING' : '审核中',//目前主要用于取现申请复核
    'PAY_PENDING' : '支付结果待查',// 目前用于银联单笔代付没有实时返回最终成功或者失败结果的情况
    'CUT_PENDING' : '代扣结果待查',// 目前用于银联单笔代扣没有实时返回最终成功或者失败结果的情况
    'SUCCESSFUL' : '成功',
    'FAILED' : '失败',
    'REJECTED' : '拒绝',
    'CANCELED' : '取消'
};

var pageOneData = {};

var ractive = new Ractive({
    el: $('.funds-ractive-container'),
    template: template,

    data: {
        tabIndex: 0,
        selectedIndex: 0, // 类别的selectedIndex

        typeLists: typeLists, // 切换类别
        list: [], // 数据,

        dateFrom: moment()
            .subtract(1, 'M') // 前1月
            .format('YYYY-MM-DD'),
        dateTo: moment()
            .format('YYYY-MM-DD')
    }
});

// 切换tab
$('.ccc-tab')
    .on('select', function (e) {
        ractive.set({
            tabIndex: e.index,
            selectedIndex: 0
        });
        loadInitData(e.index);
        return false;
    });


// datetime picker
$('.date-from-picker,.date-to-picker').datetimepicker({
    language: 'zh-cn',
    pickTime: false
}).find('input').click(function () {
    $(this).prev().trigger('click');
    return false;
});

$('.date-to-picker>input').change(function () {
    // console.log("success");
});

ractive.on('select-type', function (e) { // dropdown 选择类型的时候
    var selectedIndex = +(e.keypath.substring(e.keypath.lastIndexOf('.') +
        1));

    this.set('selectedIndex', selectedIndex);

    $(this.find('.type-checker'))
        .removeClass('open');

    return false;
});

ractive.on('do-filter', function () { // 开始筛选数据
    // 类型
    var type,
        status,
        operation;
    var tabIndex = this.get('tabIndex');
    if (tabIndex === 1) {
        type = 'DEPOSIT';
        status = (typeLists[1][this.get('selectedIndex')])
            .type;
    } else if (tabIndex === 2) {
        type = 'WITHDRAW';
        status = (typeLists[2][this.get('selectedIndex')])
            .type;
    } else {
        // 第一个tab
        type = (typeLists[0][this.get('selectedIndex')])
            .type;
        operation = (typeLists[0][this.get('selectedIndex')])
            .operation;
    }

    var preset;
    if (this.get('tabIndex') === 0) {
        preset = tab1Preset;
    } else if (this.get('tabIndex') === 1) {
        preset = tab2Preset;
    } else {
        preset = tab3Preset;
    }
    ractive.loadData({
        type: type,
        status: status,
        preset: preset
    });

    return false;
});

// type
// page,pageSize
// preset
ractive.loadData = function (obj) {
    if (this.get('loading')) {
        return;
    }
    this.set('loading', true);
    size = obj.pageSize || size;
    request.get('/api/v2/user/MYSELF/funds')
        .query({
            type: obj.type || 'ALL',
            allStatus: obj.status || false,
            allOperation: true,
            startDate: moment(this.get('dateFrom')).unix() * 1000,
            endDate: moment(this.get('dateTo')).unix() * 1000 + 1000 * 60 * 60 * 24,
            page: obj.page || 1,
            pageSize: size
        })
        .end()
        .then(function (r) {
            ractive.set('loading', false);
            var res = r.body;

            if (!res) {
                return alert("获取数据失败...");
            }

            if (res.error) {
                alert(res.error + '\n' + res.error_description);
                return;
            }

            var list = res.results;
            if (obj.preset) {
                list.forEach(obj.preset);
            }
            // set first one data
            pageOneData = list;
            ractive.set('list', list);
            renderPage(res.totalSize, obj);
        });
};


// 先加载一遍数据
loadInitData(0);

// tab1,对ajax数据 set到ractive之前的操作
function tab1Preset(item) {
    // 如果备注是数字，转换成第x期
    if (item.description !== null && isNumber(item.description)) {
        item.description = '第' + item.description + '期';
    }

    // 操作
    item.operationName = utils.i18n.FundRecordOperation[item.operation];

    // 时间
    item.dateTime = moment(item.timeRecorded)
        .format("YYYY-MM-DD HH:mm:ss");

    // 交易类型
    typeLists[0].forEach(function (t) {
        if (t.type === item.type) {
            if (t.operation) {
                // 在typeList中规定了operation,需要两个都等
                // type=invest,operation = in/freeze/release
                if (t.operation === item.operation) {
                    item.transactionType = t.text;
                }
            } else { // typeList没写operation,只需要type等
                item.transactionType = t.text;
            }
        }
    });
    if (!item.transactionType) {
        item.transactionType = item.type; // 找不到的话,显示英文type
    }

    // 状态
    item.status = statusMap[item.status];
    // 金额
    // amountClass 用于显示颜色
    switch (item.operation) {
    case 'IN':
        item.amount = '+' + item.amount;
        item.amountClass = 'in';
        break;
    case 'OUT':
        item.amount = '-' + item.amount;
        item.amountClass = 'out';
        break;

    case 'RELEASE':
        item.amountClass = 'release';
        break;
    case 'FREEZE':
        item.amountClass = 'freeze';
        break;
    default:
        break;
    }
    return item;
}

function tab2Preset(item) {
    item.dateTime = moment(item.timeRecorded)
        .format('YYYY-MM-DD HH:mm:ss');
    if (item.type === 'FEE_WITHDRAW ') {
        item.feeAmout = item.amount;
        item.amount = '';
    }
    item.operationName = utils.i18n.FundRecordOperation[item.operation];
    item.status = statusMap[item.status];
    return item;
}

function tab3Preset(item) {
    item.dateTime = moment(item.timeRecorded)
        .format('YYYY-MM-DD HH:mm:ss');
    item.operationName = utils.i18n.FundRecordOperation[item.operation];
    item.status = statusMap[item.status];
    return item;
}

function loadInitData(index) {
    switch (index) {
    case 0:
        ractive.loadData({
            type: 'ALL',
            preset: tab1Preset
        });
        break;
    case 1:
        ractive.loadData({
            type: 'DEPOSIT',
            status: true,
            preset: tab2Preset
        });
        break;
    case 2:
        ractive.loadData({
            type: 'WITHDRAW',
            status: true,
            preset: tab3Preset
        });
        break;
    }
}

function renderPage(total, obj) {
    var self = ractive;
    var params = {
        type: obj.type || 'ALL',
        allStatus: obj.status || false,
        allOperation: true,
        startDate: 1111122222000,
        endDate: moment(self.get('toDate'))
            .unix() * 1000,
        pageSize: size
    };
    var api = '/api/v2/user/MYSELF/funds?page=$page' + jsonToParams(params);
    $(".ccc-paging")
        .cccPaging({
            total: total,
            perpage: size,
            api: api,
            params: {
                type: 'GET',
                error: function (o) {
                    console.info('请求出现错误，' + o.statusText);
                }
            },
            onSelect: function (p, o) {
                if (o) {
                    switch (self.get('tabIndex')) {
                    case 0:
                        o = formatData(0, o);
                        break;
                    case 1:
                        o = formatData(1, o);
                        break;
                    case 2:
                        o = formatData(2, o);
                        break;

                    }
                } else {

                    o = {};
                }
                self.set('list', p > 1 ? o.results : pageOneData);
            }
        });
}

function jsonToParams(params) {
    var str = '';
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            str += '&' + key + '=' + params[key];
        }
    }
    return str;
}

function formatData(index, data) {

    for (var i = 0, l = data.results.length; i < l; i++) {
        if (index === 0) {
            data.results[i] = tab1Preset(data.results[i]);
        }
        if (index === 1) {
            data.results[i] = tab2Preset(data.results[i]);
        }
        if (index === 2) {
            data.results[i] = tab3Preset(data.results[i]);
        }
    }

    return data;
}

function isNumber(t) {
    var e = new RegExp('^[0-9]*$');
    return e.test(t) ? !0 : !1;
}