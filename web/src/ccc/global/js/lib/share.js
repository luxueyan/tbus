//var $ = require('jquery');
window.share_to = function(m) {
        switch (m) {
            case "baidu":
                window.open('http://cang.baidu.com/do/add?it=' + encodeURIComponent(_C_.substring(0, 76)) + '&iu=' + encodeURIComponent(_U_) + '&fr=ien#nw=1', 'baidu', 'scrollbars=no,width=600,height=450,status=no,resizable=yes,left=' + (screen.width - 600) / 2 + ',top=' + (screen.height - 450) / 2);
                break;
            case "qq":
                window.open('http://shuqian.qq.com/post?from=3&title=' + encodeURIComponent(_C_) + '&uri=' + encodeURIComponent(_U_) + '&jumpback=2&noui=1', 'favit', 'width=930,height=570,toolbar=no,menubar=no,location=no,scrollbars=yes,status=yes,resizable=yes,left=' + (screen.width - 930) / 2 + ',top=' + (screen.height - 570) / 2);
                break;
            case "tsina":
                void ((function(s, d, e) {
                    try {
                    } catch (e) {
                    }
                    var f = 'http://v.t.sina.com.cn/share/share.php?', u = _U_, p = ['url=', e(u), '&title=', e(_C_)].join('');
                    function a() {
                        if (!window.open([f, p].join(''), 'mb', ['toolbar=0,status=0,resizable=1,width=620,height=450,left=', (s.width - 620) / 2, ',top=', (s.height - 450) / 2].join('')))
                            u.href = [f, p].join('');
                    }
                    ;
                    if (/Firefox/.test(navigator.userAgent)) {
                        setTimeout(a, 0)
                    } else {
                        a()
                    }
                })(screen, document, encodeURIComponent));
                break;
            case  "douban":
                void (function() {
                    var d = document, e = encodeURIComponent, s1 = window.getSelection, s2 = d.getSelection, s3 = d.selection, s = s1 ? s1() : s2 ? s2() : s3 ? s3.createRange().text : '', r = 'http://www.douban.com/recommend/?url=' + e(d.location.href) + '&title=' + e(d.title) + '&sel=' + e(s) + '&v=1', x = function() {
                        if (!window.open(r, 'douban', 'toolbar=0,resizable=1,scrollbars=yes,status=1,width=450,height=355,left=' + (screen.width - 450) / 2 + ',top=' + (screen.height - 330) / 2))
                            location.href = r + '&r=1'
                    };
                    if (/Firefox/.test(navigator.userAgent)) {
                        setTimeout(x, 0)
                    } else {
                        x()
                    }
                })();
                break;
            case  "renren":
                void ((function(s, d, e) {
                    if (/renren\.com/.test(d.location))
                        return;
                    var f = 'http://share.renren.com/share/buttonshare.do?link=', u = d.location, l = d.title, p = [e(u), '&title=', e(l)].join('');
                    function a() {
                        if (!window.open([f, p].join(''), 'xnshare', ['toolbar=0,status=0,resizable=1,width=626,height=436,left=', (s.width - 626) / 2, ',top=', (s.height - 436) / 2].join('')))
                            u.href = [f, p].join('');
                    }
                    ;
                    if (/Firefox/.test(navigator.userAgent))
                        setTimeout(a, 0);
                    else
                        a();
                })(screen, document, encodeURIComponent));
                break;
            case  "kaixin001":
                window.open('http://www.kaixin001.com/repaste/bshare.php?rtitle=' + encodeURIComponent(_C_) + '&rurl=' + encodeURIComponent('') + '&from=maxthon', 'kaixin001', 'toolbar=no,titlebar=no,status=no,menubar=no,scrollbars=no,location:no,directories:no,width=570,height=350,left=' + (screen.width - 570) / 2 + ',top=' + (screen.height - 420) / 2);
                break;
            case  "yahoo":
                window.open('http://myweb.cn.yahoo.com/popadd.html?url=' + encodeURIComponent(document.location.href) + '&title=' + encodeURIComponent(document.title), 'Yahoo', 'scrollbars=yes,width=440,height=440,left=80,top=80,status=yes,resizable=yes');
                break;
            case  "tsohu":
                void(((function(s, d, e) {
                    var f = 'http://t.sohu.com/third/post.jsp?&url=' + '&title=' + e(_C_),
                            u = '';
                    function a() {
			if (!window.open([ f, e(u) ].join(''),'tsohu',['toolbar=0,status=0,resizable=1,width=660,height=470,left=',(s.width - 660) / 2, ',top=',(s.height - 470) / 2 ].join('')))
					u.href = [ f, e(u) ].join('');
			};
			if (/Firefox/.test(navigator.userAgent))setTimeout(a, 0);else a();
                })(screen, document, escape)))
                break;
            case "qzone":
                window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + encodeURIComponent(_U_) + '&title=' + encodeURIComponent(_C_), 'qzone', 'toolbar=0,status=0,width=900,height=760,left=' + (screen.width - 900) / 2 + ',top=' + (screen.height - 760) / 2);
                //window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+ encodeURIComponent(location.href)+ '&title='+encodeURIComponent(document.title),'_blank');
                break;
            case  "t163":
                (function() {
                    var url = 'link=http://www.shareto.com.cn/&source=' + encodeURIComponent(_U_) + '&info=' + encodeURIComponent(_C_);
                    window.open('http://t.163.com/article/user/checkLogin.do?' + url + '&' + new Date().getTime(), 't163', 'height=730,width=550,top=' + (screen.height - 280) / 2 + ',left=' + (screen.width - 550) / 2 + ', toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no');
                })()
                break;
            case  "xianguo":
                void (function() {
                    var d = document, e = encodeURIComponent, s1 = window.getSelection, s2 = d.getSelection, s3 = d.selection, s = s1 ? s1() : s2 ? s2() : s3 ? s3.createRange().text : '', r = 'http://xianguo.com/service/submitfav/?link=' + e(d.location.href) + '&title=' + e(d.title) + '&notes='
                            + e(s), x = function() {
                        if (!window.open(r + '&r=0', 'xgfav', 'toolbar=0,resizable=1,scrollbars=yes,status=1,width=800,height=600'))
                            location.href = r + '&r=1'
                    };
                    if (/Firefox/.test(navigator.userAgent)) {
                        setTimeout(x, 0)
                    } else {
                        x()
                    }
                })()
                break;
            case  "delicious":
                (function() {
                    f = 'http://delicious.com/save?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(document.title) + '&v=5&';
                    a = function() {
                        if (!window.open(f + 'noui=1&jump=doclose', 'deliciousuiv5', 'location=yes,links=no,scrollbars=no,toolbar=no,width=550,height=550'))
                            location.href = f + 'jump=yes'
                    };
                    if (/Firefox/.test(navigator.userAgent)) {
                        setTimeout(a, 0)
                    } else {
                        a()
                    }
                })()
                break;
            case 'twitter':
                window.open("http://twitter.com/home/?status=" + encodeURIComponent(document.title) + "%20" + encodeURIComponent(document.location.href) + "%20via%20@Bonewordgold");
                break;
            case 'fbook':
                window.open("http://www.facebook.com/share.php?u=" + encodeURIComponent(document.location.href) + "&title=" + encodeURIComponent(document.title), 'facebook', 'toolbar=0,status=0,width=810,height=480,left=' + (screen.width - 810) / 2 + ',top=' + (screen.height - 700) / 2);
                break;
            case  "tqq":
                window.open('http://v.t.qq.com/share/share.php?title=' + encodeURIComponent(_C_) + '&url=' + encodeURIComponent(_U_), 'tqq', 'toolbar=0,status=0,width=700,height=360,left=' + (screen.width - 700) / 2 + ',top=' + (screen.height - 600) / 2);
                break;
            case  "t139":
                window.open('http://www.139.com/share/share.php?title=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(location.href), 't139', 'width=490,height=340,left=' + (screen.width - 490) / 2 + ',top=' + (screen.height - 340) / 2);
                break;
            case  "ymail":
                window.open("http://compose.mail.yahoo.com/?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(document.location.href), 'ymail', 'toolbar=0,status=0,width=760,height=670,left=' + (screen.width - 760) / 2 + ',top=' + (screen.height - 670) / 2);
                break;
            case  'zhuaxia':
                window.open("http://www.zhuaxia.com/add_channel.php?&url=" + encodeURIComponent(document.location.href))
        }
        return false;
    }
    $.fn.share = function(opt) {
        window._U_ = '';
        window._C_ = '';
        var str = {
            showIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            liMargin: 15,
            bigImg: false,
            showFont: true,
            url: document.location.href,
            content: document.title,
            imgUrl: CC.imgPath,
            share: [{title: 'twitter', click: 'twitter'}, {title: '新浪微薄', click: 'tsina'}, {title: 'qq微博', click: 'tqq'}, {title: '搜狐微博', click: 'tsohu'}, {title: '网易微博', click: 't163'}, {title: 'facebook', click: 'fbook'}, {title: '豆瓣', click: 'douban'}, {title: '人人网', click: 'renren'}, {title: '开心网', click: 'kaixin001'}, {title: 'Qzone', click: 'qzone'}, {title: '百度搜藏', click: 'baidu'}, {title: '鲜果', click: 'xianguo'}, {title: '抓虾', click: 'zhuaxia'}, {title: 'delicious', click: 'delicious'}, {title: 'qq书签', click: 'qq'}, {title: '雅虎收藏', click: 'yahoo'}]
        }
        opt = $.extend(str, opt);
        _U_ = opt.url;
        _C_ = opt.content;

        var imgsize = 16;
        //var imgUrl = opt.imgUrl + 'shareS.png';
        var imgUrl = CC.imgUrlS;
        opt.imgUrl = CC.imgUrl;
        var share = opt.share;
        var showIndex = opt.showIndex;
        if (opt.bigImg) {
            imgsize = 32;
            imgUrl = opt.imgUrl;
        }
        ;
        var string = '<ul style="list-style: none; margin: 0; padding:0;height:' + imgsize + 'px;width:';
        if (opt.showFont) {
            string += ((imgsize + opt.liMargin) * (showIndex.length) + 50) + 'px;overflow:hidden;" id="YUshare"><li style="float: left; display: inline; list-style: none; margin: 0; padding: 0;position:relative;width:50px;height:' + imgsize + 'px;line-height:' + imgsize + 'px;font-size:12px;">分享到：</li>';
        } else {
            string += (imgsize + opt.liMargin) * (showIndex.length) + 'px;overflow:hidden;" id="YUshare">';
        }
        for (var li = 0; li < showIndex.length; li++) {
            string += '<li style="float: left; display: inline; list-style: none; margin: 0; padding: 0;"><a href="javascript:void(0)" style="width: ' + imgsize + 'px;overflow:hidden; height: ' + imgsize + 'px; display: block; margin:0 ' + opt.liMargin + 'px 0 0; padding: 0; background: transparent url(\'' + imgUrl + '\') no-repeat 0 -' + (imgsize) * showIndex[li] + 'px" title="分享到' + share[showIndex[li]].title + '" onclick="share_to(\'' + share[showIndex[li]].click + '\')"></a></li>'
        }
        string += '</ul>';
        $(this).html(string);
        $('#YUshare a').hover(function() {
            $(this).css('backgroundPositionX', '-' + imgsize + 'px')
        }, function() {
            $(this).css('backgroundPositionX', '0px')
        }
        );
    }