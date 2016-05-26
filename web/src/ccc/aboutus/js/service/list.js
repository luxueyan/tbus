'use strict';

exports.InvestListService = {
    getPtgg: function (next) {
        request.get('/api/v2/cms/category/INTRODUCTION/name/' +
                encodeURIComponent('平台公告'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    },
    getFwxy: function (next) {
        request.get('/api/v2/cms/category/DECLARATION/name/' + encodeURIComponent('服务协议'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    },
    getMedia: function (next) {
        request.get('/api/v2/cms/category/COVERAGE/name/' + encodeURIComponent('媒体报道'))
            .end()
            .then(function (res) {
                next(res.body);
            })
    }
}
