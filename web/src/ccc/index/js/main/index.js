"use strict";

require('bootstrap/js/transition');
require('bootstrap/js/carousel');
$('[data-ride="carousel"]').each(function () {
  var $carousel = $(this)
  $(this).carousel($carousel.data())
})

require('bootstrap/js/tab');
var $carousel = $("#my-carousel");
var IndexService = require('./service')
    .IndexService;
var utils = require('ccc/global/js/lib/utils');
var i18n = require('@ds/i18n')['zh-cn'];
var loginElement=document.getElementsByClassName?document.getElementsByClassName('info')[0]:$('.info')[0];

require('ccc/global/js/lib/jquery.easy-pie-chart.js')

// $carousel.on('slid.bs.carousel', function (e) {
//         // slide 完成后
//     });


$(function () {
    
    $('.investList ul li').hover(function (){
        $(this).addClass('active').siblings().removeClass('active');
        
        var _this = $(this).parent().parent().parent().children('.listContent');
        _this.find('.productList').eq($(this).index()).addClass('active').siblings().removeClass('active');
    });
});



function replaceStr(str){
	return str.replace(/[^\x00-xff]/g,'xx').length;
}


IndexService.getLoanSummary(function (list) {
    var listXSZX = [],listDCB = [],listLHB = [],listSBTZ = [],listHOT = [];
    for(var i=0;i<list.length;i++){
        list[i].method = i18n.enums.RepaymentMethod[list[i].method][0];
        list[i].titleLength = replaceStr(list[i].title);
        if(list[i].titleLength > 60){
             list[i].title = list[i].title.substr(0,60)+'...';
        }

        if(list[i].loanRequest.productKey == 'NEW'){
             listXSZX.push(list[i]);
         }else if(list[i].loanRequest.productKey == 'DCB'){
             listDCB.push(list[i]);
         }else if(list[i].loanRequest.productKey == 'LHB'){
             listLHB.push(list[i]);
         }else if(list[i].loanRequest.productKey == 'SBTZ'){
             listSBTZ.push(list[i]);
         }else if(list[i].loanRequest.productKey == 'HOT'){
             listHOT.push(list[i]);
         }
     }

//    listLHB = [listLHB[0],listXNB[0],listFB[0]];
//
//    for(var i=0; i<listLHB.length; i++){
//        if(listLHB[i] == undefined || listLHB[i] == ''){
//            listLHB.splice(i,1);
//            i-=1;
//        }
//    }
    var investRactive = new Ractive({
        el: ".NEWproductList",
        template: require('ccc/global/partials/singleInvest1.html'),
        data: {
            list: listXSZX,
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });

    var investRactive = new Ractive({
        el: ".DCBproductList",
        template: require('ccc/global/partials/singleInvest1.html'),
        data: {
            list: listDCB,
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });

    var investRactive = new Ractive({
        el: ".LHBproductList",
        template: require('ccc/global/partials/singleInvest1.html'),
        data: {
            list: listLHB,
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });    
    var investRactive = new Ractive({
        el: ".SBTZproductList",
        template: require('ccc/global/partials/singleInvest1.html'),
        data: {
            list: listSBTZ,
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });    
    var investRactive = new Ractive({
        el: ".HOTproductList",
        template: require('ccc/global/partials/singleInvest1.html'),
        data: {
            list: listHOT,
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });
    initailEasyPieChart();
    ininconut();

});

//借款计划
//IndexService.getLoanSummary(function (list) {
//
//    var investRactive = new Ractive({
//        el: "#loan-plan",
//        template: require('ccc/global/partials/singleInvest.html'),
//        data: {
//            list: list,
//            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
//        }
//    });
//
//    initailEasyPieChart();
//    ininconut();
//
//});




IndexService.getLatestScheduled(function (loan) {
    var serverDate = loan.serverDate;
    var leftTime = utils.countDown.getCountDownTime2(loan.timeOpen,
        serverDate);
    var countDownRactive = new Ractive({
        el: ".next-time",
        template: require('ccc/index/partials/countdown.html'),
        data: {
            countDown: {
                hours: leftTime.hour,
                minutes: leftTime.min,
                seconds: leftTime.sec,
            }
        }
    });
    setInterval((function () {
        serverDate += 1000;
        var leftTime = utils.countDown.getCountDownTime2(loan.timeOpen,
            serverDate);
        countDownRactive.set('countDown', {
            hours: leftTime.hour,
            minutes: leftTime.min,
            seconds: leftTime.sec
        });
    }), 1000);
});

$("#btn-login-on-carousel").click(function(e){
    window.HeaderRactive.fire('maskLogin',{
        original: e
    });
});

function initailEasyPieChart() {
    ///////////////////////////////////////////////////////////
    // 初始化饼状图
    ///////////////////////////////////////////////////////////
    $(function () {
        var oldie = /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase());
        $(".easy-pie-chart").each(function () {
            var percentage = $(this).data("percent");
             var status=$(this).data("status");
            // 100%进度条颜色显示为背景色

           // var color = percentage != 100 && (status==='SETTLED'|| status==='CLEARED') ? "#f58220" : '#009ada';
             var color = (status==='OPENED') ? '#009ada' : "#f58220";

//            var color = percentage === 100 ? "#f58220" : '#f58220';

            $(this).easyPieChart({
                barColor: color,
                trackColor: '#ddd',
                scaleColor: false,
                lineCap: 'butt',
                lineWidth: 4,
                animate: oldie ? false : 1000,
                size: 45,
                onStep: function (from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });
            $(this).find("span.percentageNum").html(percentage+"%");
        });

    });
};

function showError(message){
    var errorMaps = {
        USER_DISABLED: '帐号密码错误次数过多，您的帐户已被锁定，请联系客服400-818-9696解锁。',
        FAILED: '手机号/用户名或密码错误'
    };
    var $error = $(".error");
    $error.text(errorMaps[message]);
    $error.addClass('show');
    setTimeout(function(){
        $error.css({
            opacity:'1'
        })
    });
    setTimeout(function(){
        $error.css({
            opacity:'0'
        })
    },1500);
    setTimeout(function(){
        $error.removeClass('show');
    },2000);
};

function clearError(){
    var $error = $(".error");
    $error.text("");
}

function verifyAndLogin(){
    var username = $("#loginName").val();
    var password = $("#password").val();
    if (username && password) {
        $.post('/ajaxLogin', {
            loginName : username,
            password : password
        }, function (data){
            if (!data.success) {
                showError(data.error_description.result);
            } else {
                clearError();
                window.location.reload();
            }
        });
    }else{
        showError('FAILED');
    }
}
$('.loginBtn').click(function (){
        verifyAndLogin();
    });
$('.registerBtn').click(function(){
    location.href="/register"
})

$("#my-carousel").hover(function(){
    $('.carousel-control-box').css('display','block');
},function(){
    $('.carousel-control-box').css('display','none');
});

window.onscroll=function(){
    var scrollTopOffset= document.documentElement.scrollTop || document.body.scrollTop,headerEle;
    if(loginElement){
        if(scrollTopOffset>=129){
            loginElement.className='info floating';
        }else{
            loginElement.className='info';
        }
    }
}

$(document).keyup(function (e) {
    if(e.keyCode == 13) {
        verifyAndLogin();
    }
});

//合作伙伴
request.get(encodeURI('/api/v2/cms/category/COOPERATION/name/合作伙伴'))
    .end()
    .then(function (res) {
        var partnerRactive = new Ractive({
            el: '.partner .icon-grounp',
            template: require('ccc/index/partials/partner.html'),
            data: {
                list: []
            },
            onrender: function(){
                
                if(res.body.length <= 4){
                    this.set('cooperation',res.body);
                }else{
                    var num = 4;
                    var j = num;
                    var length = res.body.length;
                    var total = Math.ceil(length/j);
                    this.set('cooperation',res.body.slice(0,num));
                    
                    for(var i=0;i<total-1;i++){

                        this.set('cooperationNext',res.body.slice(j,j+num));
                        j = j+num;

                        var cooperationNext = this.get('cooperationNext');  
                        this.push('list', cooperationNext);

                    }     
                }
               
            }
        });
    });
//友情链接
request.get(encodeURI('/api/v2/cms/category/LINK/name/友情链接'))
    .end()
    .then(function (res) {
        var count = new Ractive({
            el: '.firendLink',
            template: '<span class="friend-left" style="margin-right:16px;">友情链接</span><span class="friend-right">{{#each items}}<a href="http://{{url}}" target="_blank">{{{title}}}</a>{{/each}}</span>',
            data: {
                items: res.body
            }
        });
    });

//底部鼠标滑过显示公司链接
$('.icon-grounp .company-intro').hide();
$(' .icon-group1').mouseenter(function(){
    $(this).children('.company-intro').show(200);
}).mouseleave(function(){
    $(this).children('.company-intro').hide(200);
});

//$('.strengthProtect').click(function(){
//    var url=$(this).find('a').attr('href');
//    location.href=url;
//});

function ininconut () {
    $(".opre > .investbtn-time").each(function () {
        var t = $(this);
        if(t.data("status") === 'SCHEDULED'){
            var id = t.data("id");
            var openTime = t.data("open");
            var serverDate = t.data("serv");
            var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
            var textDay = leftTime.day ? leftTime.day +'天'+'&nbsp;' : '';
            var interval = setInterval((function () {
                serverDate += 1000;
                var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
                var textDay = leftTime.day ? leftTime.day +'<span style="color:#c6c6c6">天</span>'+'&nbsp;': '';
                if(!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                    clearInterval(interval);
					t.prev().hide();
                    t.replaceWith('<a href="/loan/'+id+'" style="text-decoration:none"><div class="investbtn">立即投资</div></a>');
                }else {
                    t.html('<span class="text" style="color:#c6c6c6">倒计时<span style="color:#ff7200">'+ textDay + leftTime.hour +'</span>时<span style="color:#ff7200">'+ leftTime.min +'</span>分<span style="color:#ff7200">'+ leftTime.sec +'</span>秒</span>')
                }
            }), 1000);
        }
    });
};


var sayHello = function () {
    console.log(`Hello, ${this.name}!`);
};
({ name: 'ES7' })::sayHello();
es6();
function es6(){
    //let sym = Symbol('asd');
    let o = {
        log: x => console.log(x)
    }
    let str = `ccc`;
    let arr = [1,2,3,4,5,6];
    let a = (...aaa) => {
        console.log(aaa.join(''));
    }
    console.log(a(1,2,3,4,5))
    //o.log(typeof sym);
}

