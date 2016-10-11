'use strict';
module.exports = function (router) {
var pageSize = 10;

router.get('/:channelName', function (req, res) {
    var user = res.locals.user;
    if (user && user.idNumber) {
        delete user.idNumber;
    }
    res.expose(user, 'user');
    req.uest(
        '/api/v2/cms/channels')
        .end()
        .then(function (r) {
            var channels = r.body;
            var channelName = req.params.channelName;
            var channelId = '';
            var current = (req.query.page === undefined) ? 1 : req.query
                .page;
            for (var i = 0; i < channels.length; i++) {
                if (getChannelIdByName(channelName) === channels[i].name&&channels[i].category==='COVERAGE') {
                    channelId = channels[i].id;
                    break;
                }
            }
            req.uest(
                '/api/v2/cms/channel/' + channelId + '?page=' + current +
                '&pagesize=' + pageSize)
                .end()
                .then(function (r) {
                   
                    res.render(channelName + '/list', {
                        title: getChannelIdByName(channelName),
                        news: formatNews(r.body.results),
                        totalPage: createList(Math.ceil(r.body.totalSize /
                            pageSize)),
                        channelName: getChannelIdByName(channelName),
                        current: parseInt(current, 10)
                    });
                });
        });
});

//财富讲堂
router.get('/cfjt/:id', function (req, res) {
    var user = res.locals.user;
    if (user && user.idNumber) {
        delete user.idNumber;
    }
    res.expose(user, 'user');

    req.uest(
        '/api/v2/cms/article/' + req.params.id)
        .end()
        .then(function (r) {
            res.locals.title = '汇财富';
            res.locals.description = r.body.content.replace(/<\/?[^>]*>/g, '').slice(0,100);
            res.render('detail', {
                detail: formatDetail(r.body)
            });
        });
});
//服务协议
router.get('/fwxy/:id', function (req, res) {
    var user = res.locals.user;
    if (user && user.idNumber) {
        delete user.idNumber;
    }
    res.expose(user, 'user');

    req.uest(
        '/api/v2/cms/article/' + req.params.id)
        .end()
        .then(function (r) {
            res.locals.title = '汇财富';
            res.locals.description = r.body.content.replace(/<\/?[^>]*>/g, '').slice(0,100);
            res.render('detail', {
                detail: formatDetail(r.body)
            });
        });
});
//媒体报道
router.get('/mtbd/:id', function (req, res) {
    var user = res.locals.user;
    if (user && user.idNumber) {
        delete user.idNumber;
    }
    res.expose(user, 'user');

    req.uest(
        '/api/v2/cms/article/' + req.params.id)
        .end()
        .then(function (r) {
            res.locals.title = '汇财富';
            res.locals.description = r.body.content.replace(/<\/?[^>]*>/g, '').slice(0,100);
            res.render('detail', {
                detail: formatDetail(r.body)
            });
        });
});

function getChannelIdByName(channel) {
    var channelMap = {
        news: '最新公告',
        medias: '媒体报道'
    };
    return channelMap[channel];
}


function formatNews(news) {
    news = news || [];
    for (var i = 0; i < news.length; i++) {
        news[i].pubDate = moment(news[i].pubDate)
            .format('YYYY-MM-DD');
    }
    return news;
}

function formatDetail(item) {
//    item.pubDate = moment(item.pubDate)
//        .format('YYYY/MM/DD');
    item.timeRecorded = moment(item.timeRecorded).format('YYYY/MM/DD HH:mm:ss');
    return item;
}


function createList(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr[i] = i;
    }
    return arr;
}
};
