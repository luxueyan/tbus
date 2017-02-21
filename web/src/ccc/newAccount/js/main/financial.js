'use strict';

var utils = require('ccc/global/js/lib/utils');

var ractive = new Ractive({
    el: '.account-invite-wrapper',
    template: require('ccc/newAccount/partials/financial/financial.html'),
    oncomplete: function () {
        $.get('/api/v2/user/MYSELF/invite', function (o) {
            if (o.success) {
                ractive.set('financialList', formatList(o.data.results));
                ractive.set('registerDateData', 'up');
                ractive.set('totalAssetsData', 'up');
                ractive.set('availableAmountData', 'up');
                ractive.set('previousInvestTimeData', 'up');
                ractive.set('latestDueAmountData', 'up');
                ractive.set('latestDueTimeData', 'up');
                ractive.set('financialListOld', ractive.get('financialList'));
            }
        });
    },
});

ractive.on('arrowA01', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.registerdate;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.user.registerDate < b.user.registerDate ? -1 : 1;//时间正序
        // return Date.parse(a.time) - Date.parse(b.time);//时间正序
    });
    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('registerDateData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('registerDateData', 'up');
    }
});

ractive.on('arrowA02', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.totalassets;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.totalAssets < b.totalAssets ? -1 : 1;//时间正序
    });
    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('totalAssetsData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('totalAssetsData', 'up');
    }
});

ractive.on('arrowA03', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.availableamount;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.availableAmount < b.availableAmount ? -1 : 1;//时间正序
    });
    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('availableAmountData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('availableAmountData', 'up');
    }
});

ractive.on('arrowA04', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.previousinvesttime;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.previousInvestTime < b.previousInvestTime ? -1 : 1;//时间正序
    });
    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('previousInvestTimeData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('previousInvestTimeData', 'up');
    }
});

ractive.on('arrowA05', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.latestdueamount;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.latestDueAmount < b.latestDueAmount ? -1 : 1;//时间正序
    });
    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('latestDueAmountData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('latestDueAmountData', 'up');
    }
});

ractive.on('arrowA06', function (e) {
    ractive.set('financialList', null);
    var status = e.node.dataset.latestduetime;
    var rows = ractive.get('financialListOld');
    rows.sort(function (a, b) {
        return a.latestDueTime < b.latestDueTime ? -1 : 1;//时间正序
    });
    console.log(rows)

    if (status == 'up') {
        ractive.set('financialList', rows);
        ractive.set('latestDueTimeData', 'down');
    } else {
        ractive.set('financialList', rows.reverse());
        ractive.set('latestDueTimeData', 'up');
    }
});

// 格式化列表
function formatList(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].user.registerDate) {
            data[i].user.registerDateNew = moment(data[i].user.registerDate).format('YYYY-MM-DD');
        }

        if (data[i].previousInvestTime) {
            data[i].previousInvestTimeNew = moment(data[i].previousInvestTime).format('YYYY-MM-DD');
        } else {
            data[i].previousInvestTime = 2724441632;
        }

        if (data[i].latestDueTime) {
            data[i].latestDueTimeNew = moment(data[i].latestDueTime).format('YYYY-MM-DD');
        } else {
            data[i].latestDueTime = 2724441632;
        }
    }
    return data;
}