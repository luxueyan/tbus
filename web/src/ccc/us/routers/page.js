'use strict';
module.exports = function (router) {
    router.get('/', function (req, res, next) {
        res.redirect('/us/account');
        next();
    });

    var pageSize = 10;
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
        administration: '管理团队',
        investment: '投资决策委员会',
        risk: '风险管理委员会',
        company: '公司动态',
        wealth: '财富讲堂',
        partner: '合作伙伴介绍',
    };
    var indexMap = {
        account: '平台简介',
        invest: '团队介绍',
        transfer: '平台公告',
        protection: '联系我们',
        question: '媒体报道',
        administration: '管理团队',
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

    router.get('/:tab', function (req, res) {
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
                res.locals.title = '媒体报道-土巴士';
                res.locals.keywords = '媒体报道,新闻公告,新闻资讯,最新新闻资讯,土巴士';
                res.locals.description = '媒体报道，新闻报道，最新新闻资讯，报道土巴士投资产品汇利精选、汇鑫理财最新新闻资讯、最新活动、获奖名单、奖品等资讯，让您把握最新投资项目新闻资讯。';
            } else {
                res.locals.title = nameMap[req.params.tab] + '-土巴士';
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
        req.uest('/api/v2/cms/category/' + cateMap[req.params.tab] + '/name/' +
            encodeURIComponent(req.params.tab == "administration" ? "团队介绍" : nameMap[req.params.tab])).end().then(function (r) {
            if (nameMap[req.params.tab] == '管理团队' || nameMap[req.params.tab] == '投资决策委员会' || nameMap[req.params.tab] == '风险管理委员会') {
                var navMenuNN = 0;
            }
            var navMenu = (nameMap[req.params.tab] == '合作伙伴介绍' ? '合作伙伴' : nameMap[req.params.tab]);
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
                            navMenu: navMenu,
                            navMenuNN: navMenuNN
                        });
                    });
            } else {
                formatNews(r.body);
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

        req.uest('/api/v2/cms/article/' + req.params.id).end().then(function (r) {
            res.locals.title = r.body.title;
            res.locals.keywords = r.body.keyword;
            res.locals.description = r.body.description;

            var urlAll = {
                '平台简介': '/us/account',
                '团队介绍': '/us/invest',
                '平台公告': '/us/transfer',
                '联系我们': '/us/protection',
                '媒体报道': '/us/question',
                '管理团队': '/us/administration',
                '投资决策委员会': '/us/investment',
                '风险管理委员会': '/us/risk',
                '公司动态': '/us/company',
                '财富讲堂': '/us/wealth',
                '合作伙伴': '/us/partner',
            };

            req.uest('/api/v2/cms/channelInfo/' + r.body.channelId).end().then(function (re) {
                // console.log(re.body.name)
                var menuN = (re.body.name == '合作伙伴介绍' ? '合作伙伴' : re.body.name);
                if (menuN == '管理团队' || menuN == '投资决策委员会' || menuN == '风险管理委员会') {
                    var navMenu = {
                        text: '团队介绍',
                        url: '/us/invest',
                        subTabs: [{
                            text: menuN,
                            url: urlAll[menuN]
                        }]
                    };
                } else {
                    var navMenu = {
                        text: menuN,
                        url: urlAll[menuN]
                    };
                }
                res.render('help/article', {
                    tabs: tabs,
                    navMenu: navMenu,
                    detail: formatDetail(r.body)
                });
            });

        });
    });

    function formatDetail(item) {
        item.timeRecorded = moment(item.timeRecorded).format('YYYY/MM/DD');
        return item;
    }

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
