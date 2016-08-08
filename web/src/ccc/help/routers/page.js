'use strict';
module.exports = function (router) {
    router.get('/', function (req, res, next) {
        res.redirect('/help/account');
        next();
    });

    var pageSize = 10;
    router.get('/:tab', function (req, res) {
        var cateMap = {
            account:'HELP',
            invest: 'HELP',
            transfer: 'HELP',
            protection: 'HELP',
            question: 'HELP',
        };
        var nameMap = {
            account: '账户管理',
            invest: '投资操作',
            transfer: '产品转让',
            protection: '收益保障',
            question:'其他问题'
        };
        var indexMap={
            account: '账户管理',
            invest: '投资操作',
            transfer: '产品转让',
            protection: '收益保障',
            question:'其他问题'
        };

        var tabs = [{
             text: '账户管理',
             url: '/help/account'
         },{
            text: '投资操作',
            url: '/help/invest'
        },{
            text: '产品转让',
            url: '/help/transfer'
        },{
            text: '收益保障',
            url: '/help/protection'
        },{
            text: '其他问题',
            url: '/help/question'
        }];

            var tabIndex;
            for (var index = 0, length = tabs.length; index < length; index++) {
                var tab = tabs[index];
                if (tab.text === indexMap[req.params.tab]) {
                    tabIndex = index;
                    break;
                }
            }
        
            var user = res.locals.user;
            res.locals.title='帮助中心_太合汇';

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
                                contents: contents
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
                        contents: contents
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
