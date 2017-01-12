'use strict';
module.exports = function (router) {
    router.get('/', function (req, res, next) {
        res.redirect('/us/account');
        next();
    });

    var pageSize = 10;
    router.get('/:tab', function (req, res) {
        var cateMap = {
            account: 'INTRODUCTION',
            invest: 'INTRODUCTION',
            transfer: 'INTRODUCTION',
            protection: 'INTRODUCTION',
            question: 'INTRODUCTION',
            administration: 'INTRODUCTION',
            investment: 'INTRODUCTION',
            risk: 'INTRODUCTION',
            company: 'INTRODUCTION',
            wealth: 'NEWS',
            partner: 'COOPERATION',
        };
        var nameMap = {
            account: '平台简介',
            invest: '团队介绍',
            transfer: '平台公告',
            protection: '联系我们',
            question: '媒体报道',
            administration: '团队介绍',
            investment: '投资决策委员会',
            risk: '风险管理委员会',
            company: '公司动态',
            wealth: '财富讲堂',
            partner: '合作伙伴',
        };
        var indexMap = {
            account: '平台简介',
            invest: '团队介绍',
            transfer: '平台公告',
            protection: '联系我们',
            question: '媒体报道',
            administration: '团队介绍',
            investment: '投资决策委员会',
            risk: '风险管理委员会',
            company: '公司动态',
            wealth: '财富讲堂',
            partner: '合作伙伴',
        };

        var tabs = [{
            text: '平台简介',
            url: '/us/account'
        }, {
            text: '团队介绍',
            url: '/us/invest',
            subTabs: [{
                text: '管理团队',
                url: '/us/administration'
            }, {
                text: '投资决策委员会',
                url: '/us/investment'
            }, {
                text: '风险管理委员会',
                url: '/us/risk'
            }]
        }, {
            text: '平台公告',
            url: '/us/transfer'
        }, {
            text: '媒体报道',
            url: '/us/question',

        }, {
            text: '公司动态',
            url: '/us/company',

        }, {
            text: '财富讲堂',
            url: '/us/wealth',

        }, {
            text: '合作伙伴',
            url: '/us/partner',

        }, {
            text: '联系我们',
            url: '/us/protection'
        }];
        var path = req.path.replace(/\/$/, '');
        var tabIndex, subTabIndex;
        var tabType = null;
        for (var index = 0, length = tabs.length; index < length; index++) {
            var tab = tabs[index];
            if (tab.text === '平台简介' || tab.text === '团队介绍' || tab.text === '联系我们' || tabIndex == "2") {
                tabType = true;
            } else {
                tabType = false;
            }

            if (tab.text === '媒体报道') {
                res.locals.title = '媒体报道-汇财富';
                res.locals.keywords = '媒体报道,新闻公告,新闻资讯,最新新闻资讯,太合汇,汇财富';
                res.locals.description = '媒体报道，新闻报道，最新新闻资讯，报道汇财富投资产品汇利精选、汇鑫理财最新新闻资讯、最新活动、获奖名单、奖品等资讯，让您把握最新投资项目新闻资讯。';
            }

            if (tab.text === indexMap[req.params.tab]) {
                tabIndex = index;
                break;
            }
            if (tab.subTabs) {
                for (var idx = 0, len = tab.subTabs.length; idx < len; idx++) {
                    var subTab = tab.subTabs[idx];
                    if (subTab.url === path) {
                        tabIndex = index;
                        subTabIndex = idx;
                        break;
                    }
                }
            }
        }

        var user = res.locals.user;

        req.uest('/api/v2/cms/category/' + cateMap[req.params.tab] + '/name/' + encodeURIComponent(nameMap[req.params.tab])).end().then(function (r) {
            if (nameMap[req.params.tab] == '管理团队' || nameMap[req.params.tab] == '投资决策委员会' || nameMap[req.params.tab] == '风险管理委员会') {
                var navMenu = '>团队介绍>' + nameMap[req.params.tab];
            } else {
                var navMenu = '>' + nameMap[req.params.tab];
            }

            if (r.body.length > 1) {
                var current = (req.query.page === undefined) ? 1 : req.query.page;
                req.uest('/api/v2/cms/channel/' + r.body[0].channelId + '?page=' + current + '&pagesize=10').end()
                    .then(function (r) {
                        formatNews(r.body.results);

                        var contents = r.body.results.length > 0 ? r.body.results : null;

                        res.render('help/index', {
                            totalPage: createList(Math.ceil(r.body.totalSize / 10)),
                            current: parseInt(current, 10),
                            tabs: tabs,
                            currentTab: nameMap[req.params.tab],
                            tabIndex: tabIndex,
                            tab: {
                                name: req.params.tab,
                                text: nameMap[req.paramstab]
                            },
                            contents: contents,
                            tabType: tabType,
                            navMenu: navMenu
                        });
                    });
            } else {
                formatNews(r);
                var contents = r.body.length > 0 ? r.body : null;
                res.render('help/index', {
                    tabs: tabs,
                    currentTab: nameMap[req.params.tab],
                    tabIndex: tabIndex,
                    tab: {
                        name: req.params.tab, text: nameMap[req.params.tab]
                    },
                    contents: contents,
                    tabType: tabType,
                    navMenu: navMenu
                });
            }
        });
    });

    router.get('/article/:id', function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');

        var tabs = [{
            text: '平台简介',
            url: '/us/account'
        }, {
            text: '团队介绍',
            url: '/us/invest',
            subTabs: [{
                text: '管理团队',
                url: '/us/administration'
            }, {
                text: '投资决策委员会',
                url: '/us/investment'
            }, {
                text: '风险管理委员会',
                url: '/us/risk'
            }]
        }, {
            text: '平台公告',
            url: '/us/transfer'
        }, {
            text: '媒体报道',
            url: '/us/question',

        }, {
            text: '公司动态',
            url: '/us/company',

        }, {
            text: '财富讲堂',
            url: '/us/wealth',

        }, {
            text: '合作伙伴',
            url: '/us/partner',

        }, {
            text: '联系我们',
            url: '/us/protection'
        }];

        req.uest('/api/v2/cms/article/' + req.params.id)
            .end()
            .then(function (r) {
                res.locals.title = r.body.title + '-财富讲堂-汇财富';
                res.locals.keywords = r.body.keyword;
                res.locals.description = r.body.description;

                res.render('help/article', {
                    tabs: tabs,
                    detail: r.body
                });
            });
    });

    function formatNews(news) {
        news = news || [];
        for (var i = 0; i < news.length; i++) {
            news[i].pubDate = moment(news[i].pubDate).format('YYYY-MM-DD');
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
