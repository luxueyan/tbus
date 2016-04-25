'use strict';

var cache, router, _, auth, ef, errto, parallel, cacheMiddleware, cacheCategory, marketPrefix, getArticlesByChannel, getAllArticlesByChannel, findChannelByCategoryAndName, findChannelsByCategory, findChannelByCategory, getCarousel, getCarouselApp, getHelp, getArticlesByChannelCategory, getLinks;
cache = require('cache-manager').caching({
    store: 'memory',
    max: 1,
    ttl: 60
});
router = require('express').Router();
module.exports = router;
var request = require('promisingagent');
_ = require('lodash');
auth = require('../../auth');
ef = require('../../ef');
errto = require('errto');
parallel = require('async').parallel;
cacheMiddleware = require('../../cache').middleware('cms');
cacheCategory = cacheMiddleware('_CMS', function (req) {
    return 'CATEGORY_NAME';
});
marketPrefix = require('config').proxy.market;
var co = require('co');
getArticlesByChannel = function (name, filterGetChannelId) {
    return cache.wrap.bind(cache, name + '_FIRST', function (cb) {
        co(function* () {
            var r = yield request(marketPrefix + "/api/v2/cms/channels");
            var channel = filterGetChannelId(Array.isArray(r.body) ? r.body : []);
            if (!(channel != null && channel.id)) {
                return cb(null, {
                    channel: channel,
                    docs: []
                });
            }
            var rc = yield request(marketPrefix + "/api/v2/cms/channel/" + channel.id);
            if (Array.isArray(rc.body.results)) {
                return cb(null, {
                    channel: channel,
                    docs: rc.body.results
                });
            } else {
                return cb(null, {
                    channel: channel,
                    docs: []
                });
            }
        }).catch(cb);
    });
};
getAllArticlesByChannel = function (name, filterGetChannelsId) {
    return cache.wrap.bind(cache, name + '_ALL', function (cb) {
        co(function* () {
            var r = yield request(marketPrefix + "/api/v2/cms/channels");
            var channels = filterGetChannelsId(Array.isArray(r.body) ? r.body : []);
            if (!(channels != null && channels.length)) {
                return cb(null, []);
            }
            var results = yield Promise.all(channels.map(function (channel) {
                return request(marketPrefix + "/api/v2/cms/channel/" + channel.id);
            }));
            results = results.map(function (rc, j) {
                var ref$;
                if ((ref$ = rc.body) != null && ref$.results) {
                    return {
                        channel: channels[j],
                        docs: rc.body.results
                    };
                } else {
                    return null;
                }
            }).filter(Boolean);
            cb(null, results);
        });
    });
};
findChannelByCategoryAndName = function (category, name) {
    return function (channels) {
        return channels.filter(function (channel) {
            return channel.category === category && channel.name === name;
        })[0] || null;
    };
};
findChannelsByCategory = function (category) {
    return function (channels) {
        return channels.filter(function (channel) {
            return channel.category === category;
        }) || [];
    };
};
findChannelByCategory = function (category) {
    return function (channels) {
        return findChannelsByCategory(category)(channels)[0] || null;
    };
};
getCarousel = getArticlesByChannel('carousel', findChannelByCategoryAndName('HOMEPAGE', 'carousel'));
getCarouselApp = getArticlesByChannel('carousel_app', findChannelByCategoryAndName('HOMEPAGE', 'carousel_app'));
getHelp = getAllArticlesByChannel('help', findChannelsByCategory('HELP'));
getArticlesByChannelCategory = function () {
    var _cache;
    _cache = {};
    return function (category) {
        if (_cache[category]) {
            return _cache[category];
        }
        return _cache[category] = getArticlesByChannel(category, findChannelByCategory(category));
    };
}();
getLinks = getArticlesByChannelCategory('LINK');
router.get('/api/v2/cms/carousel', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getCarousel(errto(next, function (result) {
        return res.send(result.docs.map(function (doc) {
            var r;
            r = doc.content;
            if (Number(req.query.ext)) {
                r = doc;
            }
            return r;
        }));
    }));
});
router.get('/api/v2/cms/carouselApp', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getCarouselApp(errto(next, function (result) {
        return res.send(result.docs.map(function (doc) {
            var r;
            r = doc.content;
            if (Number(req.query.ext)) {
                r = doc;
            }
            return r;
        }));
    }));
});
router.get('/api/v2/cms/links', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getLinks(errto(next, function (result) {
        return res.send({
            channel: result.channel,
            links: result.docs.map(function (doc) {
                return {
                    title: doc.title,
                    link: doc.url
                };
            })
        });
    }));
});
router.get('/api/v2/cms/help', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getHelp(errto(next, function (result) {
        return res.send(_.sortBy(result, function (r) {
            var n, ref$;
            n = parseInt((ref$ = r.channel.name.match(/(^\d+)/)) != null ? ref$[1] : void 8, 10);
            if (isNaN(n)) {
                n = Infinity;
            }
            return n;
        }));
    }));
});
router.get('/api/v2/cms/carousel_detail', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getCarousel(errto(next, function (result) {
        return res.send((result.docs || []).map(function (doc) {
            return {
                img: doc.content,
                link: doc.url || undefined,
                bgc: doc.author || 'transparent',
                title: doc.title || undefined,
                ordinal: doc.ordinal || undefined,
            };
        }));
    }));
});
router.get('/api/v2/cms/channels', auth.pass());
router.get('/api/v2/cms/channel/:channelId', auth.pass());
router.get('/api/v2/cms/mobileBanners', auth.pass());
router.get('/api/v2/cms/article/by_channel_category/:category/and_uid/:uid', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getArticlesByChannelCategory(req.params.category)(errto(next, function (result) {
        if (!result.channel) {
            return res.end('null');
        }
        return res.json(result.docs.filter(function (doc) {
            return doc.newsId === req.params.uid;
        })[0]) || null;
    }));
});
router.get('/api/v2/cms/article/:articleId', auth.pass());
router.get('/api/v2/cms/articles/by_channel_category/:category', function (req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return getArticlesByChannelCategory(req.params.category)(errto(next, res.json.bind(res)));
});
router.get('/api/v2/cms/category/:category/name/:name', auth.pass(), cacheCategory);
router.get('/api/v2/cms/channelInfo/:channelId', auth.pass());
router.get('/api/v2/cms/:category/:name', auth.pass());
function bind$(obj, key, target) {
    return function () { return (target || obj)[key].apply(obj, arguments) };
}
