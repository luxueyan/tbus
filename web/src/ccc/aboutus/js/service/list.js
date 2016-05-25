'use strict';

exports.InvestListService = {
    getTerrace: function (next) {
        request.get('/api/v2/cms/category/PUBLICATION/name/' +
                encodeURIComponent('最新公告'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    },
    getMedia: function (next) {
        request.get('/api/v2/cms/category/COVERAGE/name/' + encodeURIComponent('公司动态'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    },
    getHangye: function (next) {
        request.get('/api/v2/cms/category/NEWS/name/' + encodeURIComponent('行业新闻'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    },
    getTouzi: function (next) {
        request.get('/api/v2/cms/category/HELP/name/' + encodeURIComponent('投资攻略'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    }
}
