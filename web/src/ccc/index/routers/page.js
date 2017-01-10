'use strict';
var moment = require('moment');
module.exports = function (router) {
    router.get('/', async function (req, res, next) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');
        res.locals.carousel = await req.uest('/api/v2/cms/category/HOMEPAGE/name/carousel')
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.picture = await req.uest(encodeURI('/api/v2/cms/category/IMAGE/name/首页广告栏'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.latestNew = await req.uest('/api/v2/cms/category/INTRODUCTION/name/' + encodeURIComponent('平台公告'))
            .end()
            .get('body')
            .then(function (data) {
                _.forEach(data, function (userInfo) {
                    userInfo.timeRecorded = moment(userInfo.pubDate).format('YYYY-MM-DD');
                });
                return data;
            });

        res.locals.mtbdNew = await req.uest('/api/v2/cms/category/NEWS/name/' + encodeURIComponent('媒体报道'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.gsdtNew = await req.uest('/api/v2/cms/category/INTRODUCTION/name/' + encodeURIComponent('公司动态'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.cfjtNew = await req.uest('/api/v2/cms/category/NEWS/name/' + encodeURIComponent('财富讲堂'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.regUser = await req.uest('/api/v2/users/getHomeDynamicData?userDynamicTypes=RIGISTER&userDynamicTypes=COUPON&userDynamicTypes=INVEST')
            .end()
            .get('body')
            .then(function (data) {
                data = (Array.isArray(data) ? data : []);

                for (var i = 0; i < data.length; i++) {
                    if (data[i].date == null || data[i].mobile == null) {
                        data.splice(i, 1);
                        i--;
                    }
                }

                _.forEach(data, function (userInfo) {
                    userInfo.date = moment(userInfo.date).format('HH:mm:ss');
                    userInfo.mobile = userInfo.mobile.replace(/1(\d{2})\d{4}(\d{4})/g, "1$1****$2");
                });
                return data;
            });

        res.locals.latestOne = await req.uest('/api/v2/cms/category/PUBLICATION/name/' + encodeURIComponent('平台公告'))
            .end()
            .get('body')
            .then(function (data) {
                data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
                return data;
            });

        res.locals.expireOne = await req.uest('/api/v2/cms/category/PUBLICATION/name/' + encodeURIComponent('到期公告'))
            .end()
            .get('body')
            .then(function (data) {
                data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
                return data;
            });

        res.locals.latestPublication = await req.uest('/api/v2/cms/category/NEWS/name/' + encodeURIComponent('新闻资讯'))
            .end()
            .get('body')
            .then(function (data) {
                data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
                return data;
            });

        res.locals.latestImgPublication = await req.uest('/api/v2/cms/category/NEWS/name/' + encodeURIComponent('今日头条'))
            .end()
            .get('body')
            .then(function (data) {
                data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
                return data;
            });

        res.locals.hotAd = await req.uest('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('热门广告位'))
            .end()
            .get('body')
            .then(function (data) {
//            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
                return data;
            });

        res.locals.userInfo = await req.uest('/api/v2/user/MYSELF/userinfo')
            .end()
            .get('body').then(function (data) {
                console.log(data);
                return data;
            });

        var nowtime = new Date();
        var nowname = '';
        if (nowtime.getHours() >= 12 && nowtime.getHours() < 18) {
            nowname = '下午';
        } else if (nowtime.getHours() >= 5 && nowtime.getHours() < 12) {
            nowname = '上午';
        } else {
            nowname = '晚上';
        }

        res.locals.shangwuxiawu = nowname;
        res.render();
    });

    function parseCMStitle(data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].title.length >= 40) {
                data[i].title = data[i].title.substring(0, 40) + "...";
            }
        }
        return data;
    }

    function compare(propertyName) {
        return function (object1, object2) {
            var value1 = object1[propertyName];
            var value2 = object2[propertyName];
            if (value2 < value1) {
                return -1;
            } else if (value2 > value1) {
                return 1;
            } else {
                return 0;
            }
        }
    }
};