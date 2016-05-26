"use strict"
var InvestListService = require('ccc/aboutus/js/service/list').InvestListService;
require('bootstrap/js/tab');

// 平台公告
InvestListService.getPtgg(function (list) {
    var ptggRactive = new Ractive({
        el: '.ptgg-box',
        template: require('ccc/aboutus/partials/common.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });

    //分页
    var totalRecord = list.length;
    var maxResult = 10;
    var t = totalRecord % maxResult;
    var totalPage = (totalRecord + maxResult - t) / maxResult;
    var datalength = totalPage;
    renderPager(list);

    function render(current) {
        ptggRactive.set('list', parseData(list.slice(10 * (current - 1), 10 * (current - 1) + 10)));
        renderPager(list.length, current);
    }

    function renderPager(list, current) {
        if (!current) {
            current = 1;
        }
        var pagerRactive = new Ractive({
            el: '#ptgg-pager',
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

// 服务协议
InvestListService.getFwxy(function (list) {
    var fwxyRactive = new Ractive({
        el: '.fwxy-box',
        template: require('ccc/aboutus/partials/common.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });
    
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
            el: '#fwxy-pager',
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
        el: '.mtbd-box',
        template: require('ccc/aboutus/partials/common.html'),
        data: {
            list: parseData(list.slice(0, 10)),
        }
    });

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
            el: '#mtbd-pager',
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

function parseData(list) {
    for (var i = 0; i < list.length; i++) {
        list[i].pubDate = moment(list[i].pubDate).format('YYYY-MM-DD');
    }
    return list;
}


function createList(len, current) {
    var arr = [];
    var i=parseInt(len/10);
    if(len%10>0){i++;}
    for(var m=0;m<i;m++){
         arr[m] =  m + 1;
    }
    return arr;
};


//关于我们 路由
var nameMap = ['ptjs','ptgg','aqbz','fwxy','ggtd','bgcd','mebd','lxwm'];

var mediaHref = document.location.hash.slice(1);

$.each(nameMap,function(i){
    if(mediaHref == nameMap[i]){
        $('.tab_left .'+mediaHref).addClass('active').siblings().removeClass('active');
        $('#'+mediaHref).addClass('active').siblings().removeClass('active');
    };

});

$('.tab_left li').click(function(){
    var url = $(this).children().attr('href');
    location.href= '/aboutus'+url;
});

$('.s-footer .left-guide a').click(function(){
    var url = $(this).attr('href');
    location.href= '/aboutus'+url;
});




















