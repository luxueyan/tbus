'use strict';
module.exports = function (router) {
    router.get('/', function (req, res, next) {
        res.redirect('/us/account');
        next();
    });

    var pageSize = 10;
    router.get('/:tab', function (req, res) {
        var cateMap = {
            account:'INTRODUCTION',
            invest: 'INTRODUCTION',
            transfer: 'INTRODUCTION',
            protection: 'INTRODUCTION',
            question: 'INTRODUCTION',
        };
        var nameMap = {
            account: '平台简介',
            invest: '团队介绍',
            transfer: '平台公告',
            protection: '联系我们',
            question:'媒体报道'
        };
        var indexMap={
            account: '平台简介',
            invest: '团队介绍',
            transfer: '平台公告',
            protection: '联系我们',
            question:'媒体报道'
        };

        var tabs = [{
             text: '平台简介',
             url: '/us/account'
         },{
            text: '团队介绍',
            url: '/us/invest'
        },{
            text: '平台公告',
            url: '/us/transfer'
        },{
            text: '媒体报道',
            url: '/us/question'
        },{
            text: '联系我们',
            url: '/us/protection'
        }];

            var tabIndex;
            var tabType;
            for (var index = 0, length = tabs.length; index < length; index++) {
                var tab = tabs[index];
                if (tab.text === '平台简介'||'团队介绍'||'联系我们') {
                    tabType = true;
                }
            }
            for (var index = 0, length = tabs.length; index < length; index++) {
                var tab = tabs[index];
                if (tab.text === indexMap[req.params.tab]) {
                    tabIndex = index;
                    break;
                }
            }
        
            var user = res.locals.user;
            res.locals.title='关于我们_太合汇';

            req.uest('/api/v2/cms/category/' + cateMap[req.params.tab] + '/name/' + encodeURIComponent(nameMap[req.params.tab])).end().then(function (r) {
                if (r.body.length > 1) {
                    var current = (req.query.page === undefined) ? 1 : req.query.page;
                    req.uest('/api/v2/cms/channel/' + r.body[0].channelId + '?page=' + current + '&pagesize=10').end()
                        .then(function (r) {
                            formatNews(r.body.results);

                            var contents = r.body.results.length >
                                0 ? r.body.results : null;

                            res.render('help/index', {
                                totalPage: createList(
                                    Math.ceil(r.body.totalSize / 10)),
                                current: parseInt(current,10),
                                tabs: tabs,
                                currentTab: nameMap[req.params.tab],
                                tabIndex: tabIndex,
                                tab: {
                                    name: req.params.tab,
                                    text: nameMap[req.paramstab]
                                },
                                contents: contents,
                                tabType:tabType
                            });
                        });


                } else {
                    formatNews(r);
                    var contents = r.body.length >
                        0 ? r.body : null;
                    res.render('help/index', {
                        tabs: tabs,
                        currentTab: nameMap[req.params.tab],
                        tabIndex: tabIndex,
                        tab: {
                            name: req.params.tab,text:
                                nameMap[req.params.tab]
                        },
                        contents: contents,
                        tabType:tabType
                    });
                }
            });


    });

function formatNews(news) {
    news = news || [];
    for (var i = 0; i < news.length; i++) {
        news[i].pubDate = moment(news[i].pubDate)
            .format('YYYY-MM-DD');
    }
    return news;
}


function createList(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr[i] = i;
    }
    return arr;
}


};
