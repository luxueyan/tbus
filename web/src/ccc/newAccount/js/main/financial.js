'use strict';

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/ZeroClipboard');
require("ccc/global/js/lib/share");

new Ractive({
    el: '.account-invite-wrapper',
    template: require('ccc/newAccount/partials/financial/financial.html'),
    onrender: function () {
        var self = this;
        $.get('/api/v2/user/MYSELF/invite', function (o) {
            if (o.success) {
                self.set('financialList', formatList(o.data.results))
            }
        });
    },
});

// 格式化列表
function formatList(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].user.registerDate = moment(data[i].user.registerDate).format('YYYY-MM-DD');
    }
    return data;
}

var data = {
    "rows": [{
        "name": "张三",
        "time": "2011/4/1 0:00:00",
    }, {
        "name": "李四",
        "time": "2015/5/6 12:30:00",
    }, {
        "name": "王五",
        "time": "2012/10/1 22:10:00",
    }, {
        "name": "赵六",
        "time": "2011/9/1 22:10:00",
    }]
};
var rows = data.rows;
rows.sort(function (a, b) {
    return Date.parse(a.time) - Date.parse(b.time);//时间正序
});
for (var i = 0, l = rows.length; i < l; i++) {
    console.log(rows[i].name + " | " + rows[i].time);
}