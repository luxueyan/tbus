"use strict"
var InvestListService = require('ccc/aboutus/js/service/list').InvestListService;
require('bootstrap/js/tab');

// 平台公告
InvestListService.getTerrace(function (list) {
    var terrace = new Ractive({
        el: '.terrace-wrap',
        template: require('ccc/aboutus/partials/terrace.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });

    function parseData(list) {
        for (var i = 0; i < list.length; i++) {
            list[i].pubDate = moment(list[i].pubDate).format('YYYY-MM-DD');
        }
        return list;
    }


    //分页
    var totalRecord = list.length;
    var maxResult = 10;
    var t = totalRecord % maxResult;
    var totalPage = (totalRecord + maxResult - t) / maxResult;
    var datalength = totalPage;
    renderPager(list);

    function render(current) {
        terrace.set('list', parseData(list.slice(10 * (current - 1), 10 * (current - 1) + 10)));
        renderPager(list.length, current);
    }

    function renderPager(list, current) {
        if (!current) {
            current = 1;
        }
        var pagerRactive = new Ractive({
            el: '#invest-pager1',
            template: require('ccc/aboutus/partials/pager.html'),
            data: {
                totalPage: createList(totalRecord, current),
                current: current
            }
        });

        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                render(current);
            }
        });

        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            this.set('current', current);
            render(current);
        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
                render(current);
            }
        });
    }
});

// 媒体报道
InvestListService.getMedia(function (list) {
    var media = new Ractive({
        el: '.media-wrap',
        template: require('ccc/aboutus/partials/media.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });


    function parseData(list) {
        for (var i = 0; i < list.length; i++) {
            list[i].pubDate = moment(list[i].pubDate).format('YYYY-MM-DD');
        }
        return list;
    }


    //分页
    var totalRecord = list.length;
    var maxResult = 10;
    var t = totalRecord % maxResult;
    var totalPage = (totalRecord + maxResult - t) / maxResult;
    var datalength = totalPage;
    renderPager(list);

    function render(current) {
        media.set('list', parseData(list.slice(10 * (current - 1), 10 * (current - 1) + 10)));
        renderPager(list.length, current);
    }

    function renderPager(list, current) {
        if (!current) {
            current = 1;
        };

        var pagerRactive = new Ractive({
            el: '#invest-pager2',
            template: require('ccc/aboutus/partials/pager.html'),
            data: {
                totalPage: createList(totalRecord, current),
                current: current
            }
        });

        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                render(current);
            }
        });

        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            this.set('current', current);
            render(current);
        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
                render(current);
            }
        });
    }
});

// 行业新闻
InvestListService.getHangye(function (list) {
    var hangye = new Ractive({
        el: '.hangye-wrap',
        template: require('ccc/aboutus/partials/hangye.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });

    function parseData(list) {
        for (var i = 0; i < list.length; i++) {
            list[i].pubDate = moment(list[i].pubDate).format('YYYY-MM-DD');
        }
        return list;
    }


    //分页
    var totalRecord = list.length;
    var maxResult = 10;
    var t = totalRecord % maxResult;
    var totalPage = (totalRecord + maxResult - t) / maxResult;
    var datalength = totalPage;
    renderPager(list);

    function render(current) {
        hangye.set('list', parseData(list.slice(10 * (current - 1), 10 * (current - 1) + 10)));
        renderPager(list.length, current);
    }

    function renderPager(list, current) {
        if (!current) {
            current = 1;
        }
        var pagerRactive = new Ractive({
            el: '#invest-pager3',
            template: require('ccc/aboutus/partials/pager.html'),
            data: {
                totalPage: createList(totalRecord, current),
                current: current
            }
        });

        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                render(current);
            }
        });

        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            this.set('current', current);
            render(current);
        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
                render(current);
            }
        });
    }
});

// 投资攻略
InvestListService.getTouzi(function (list) {
    var touzi = new Ractive({
        el: '.touzi-wrap',
        template: require('ccc/aboutus/partials/touzi.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });

    function parseData(list) {
        for (var i = 0; i < list.length; i++) {
            list[i].pubDate = moment(list[i].pubDate).format('YYYY-MM-DD');
        }
        return list;
    }


    //分页
    var totalRecord = list.length;
    var maxResult = 10;
    var t = totalRecord % maxResult;
    var totalPage = (totalRecord + maxResult - t) / maxResult;
    var datalength = totalPage;
    renderPager(list);

    function render(current) {
        touzi.set('list', parseData(list.slice(10 * (current - 1), 10 * (current - 1) + 10)));
        renderPager(list.length, current);
    }

    function renderPager(list, current) {
        if (!current) {
            current = 1;
        }
        var pagerRactive = new Ractive({
            el: '#invest-pager4',
            template: require('ccc/aboutus/partials/pager.html'),
            data: {
                totalPage: createList(totalRecord, current),
                current: current
            }
        });

        pagerRactive.on('previous', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
                render(current);
            }
        });

        pagerRactive.on('page', function (e, page) {
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            this.set('current', current);
            render(current);
        });
        pagerRactive.on('next', function (e) {
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
                render(current);
            }
        });
    }
});


function createList(len, current) {
    var arr = [];
    var i=parseInt(len/10);
    if(len%10>0){i++;}
    for(var m=0;m<i;m++){
         arr[m] =  m + 1;
    }
    return arr;
};

//var mediaHref = document.location.hash.slice(1);
//if (mediaHref == 'gyebb') {
//    $('.tab_left .gyebb').addClass('active').siblings().removeClass('active');
//    $('#gyebb').addClass('active').siblings().removeClass('active');
//} else if (mediaHref == 'gltd') {
//    $('.tab_left .gltd').addClass('active').siblings().removeClass('active');
//    $('#gltd').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'gwtd') {
//    $('.tab_left .gwtd').addClass('active').siblings().removeClass('active');
//    $('#gwtd').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'gglb') {
//    $('.tab_left .gglb').addClass('active').siblings().removeClass('active');
//    $('#gglb').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'hyxw') {
//    $('.tab_left .hyxw').addClass('active').siblings().removeClass('active');
//    $('#hyxw').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'gsdt') {
//    $('.tab_left .gsdt').addClass('active').siblings().removeClass('active');
//    $('#gsdt').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'tzgl') {
//    $('.tab_left .tzgl').addClass('active').siblings().removeClass('active');
//    $('#tzgl').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'mzsm') {
//    $('.tab_left .mzsm').addClass('active').siblings().removeClass('active');
//    $('#mzsm').addClass('active').siblings().removeClass('active');
//}else if (mediaHref == 'lxwm') {
//    $('.tab_left .lxwm').addClass('active').siblings().removeClass('active');
//    $('#lxwm').addClass('active').siblings().removeClass('active');
//}




















