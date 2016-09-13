'use strict';
var moment = require('moment');
module.exports = function (router) {
router.get('/', function (req, res, next) {
    var user = res.locals.user;
    res.locals.title = '汇财富－卓越金融，财富人生';
    res.locals.keywords = '理财、投资、财富、理财投资、个人理财、理财产品、理财平台、金融理财、个人投资、普惠金融';
    res.locals.description = '太合汇致力于为投资者提供专业、绿色、智能、透明、安全的理财服务，是新型的互联网理财服务交易平台。';
    if (user && user.idNumber) {
        delete user.idNumber;
    }

    res.expose(user, 'user');
    res.locals.carousel = req.uest(
//        '/api/v2/cms/carousel_detail')
        '/api/v2/cms/category/HOMEPAGE/name/carousel')
        .end()
        .get('body')
        .then(function(data){
            return data;
        });

    res.locals.picture = req.uest(encodeURI('/api/v2/cms/category/IMAGE/name/首页广告栏'))
        .end()
        .get('body')
        .then(function(data){
            return data;
        });

    res.locals.latestNew = req.uest(
        '/api/v2/cms/category/INTRODUCTION/name/' + encodeURIComponent('平台公告'))
        .end()
        .get('body')
        .then(function (data) {
            _.forEach(data,  function (userInfo){
                userInfo.timeRecorded = moment(userInfo.pubDate).format('YYYY-MM-DD');
            })

            return data;

        });

    res.locals.latestNews = req.uest(
        '/api/v2/cms/category/NEWS/name/' + encodeURIComponent('财富讲堂'))
        .end()
        .get('body')
        .then(function (data) {
            return data;
        });

    res.locals.regUser = req.uest(
        '/api/v2/users/getHomeDynamicData?userDynamicTypes=RIGISTER&userDynamicTypes=COUPON&userDynamicTypes=INVEST')
        .end()
        .get('body')
        .then( function(data){
            data = (Array.isArray(data) ? data : []);

            for(var i=0; i<data.length; i++){
                if(data[i].date == null || data[i].mobile == null){
                    data.splice(i,1);
                    i--;
                }
            }

            _.forEach(data,  function (userInfo){
                userInfo.date = moment(userInfo.date).format('HH:mm:ss');
                userInfo.mobile = userInfo.mobile.replace(/1(\d{2})\d{4}(\d{4})/g,"1$1****$2");
            })
            return data;
        });
    res.locals.latestOne = req.uest(
        '/api/v2/cms/category/PUBLICATION/name/' + encodeURIComponent('平台公告'))
        .end()
        .get('body')
        .then( function(data){
            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
            return data;
        });
       res.locals.expireOne = req.uest(
        '/api/v2/cms/category/PUBLICATION/name/' + encodeURIComponent('到期公告'))
        .end()
        .get('body')
        .then( function(data){
            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
            return data;
        });
    res.locals.latestPublication = req.uest(
        '/api/v2/cms/category/NEWS/name/' + encodeURIComponent('新闻资讯'))
        .end()
        .get('body')
        .then( function(data) {
            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
            return data;
        });
      res.locals.latestImgPublication = req.uest(
        '/api/v2/cms/category/NEWS/name/' + encodeURIComponent('今日头条'))
        .end()
        .get('body')
        .then( function(data) {
            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
            return data;
        });
    res.locals.hotAd = req.uest(
        '/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('热门广告位'))
        .end()
        .get('body')
        .then( function(data){
//            data = (Array.isArray(data) ? data : []).sort(compare('pubDate'));
            return data;
        });


    res.locals.userInfo = req.uest(
         '/api/v2/user/MYSELF/userinfo')
         .end()
         .get('body').then( function(data) {
        console.log(data);
            return data;
        });

    var nowtime=new Date();
    var nowname='';
    if(nowtime.getHours()>=12&&nowtime.getHours()<18){
        nowname='下午';
    }else if(nowtime.getHours()>=5&&nowtime.getHours()<12){
        nowname='上午';
    }else{
       nowname='晚上';
    }

  res.locals.shangwuxiawu=nowname;
  res.render();
});

function parseCMStitle(data) {
    for (var i = 0; i < data.length; i++ ) {
        if(data[i].title.length >= 40) {
            data[i].title = data[i].title.substring(0,40) + "...";
        }
    }
    return data;
}

function compare(propertyName){
	return function(object1,object2){
		var value1 = object1[propertyName];
		var value2 = object2[propertyName];
		if(value2 < value1){
			return -1;
		}else if(value2 > value1){
			return 1;
		}else{
			return 0;
		}
	}
}

}



// 'use strict';
// module.exports = function (router) {
// router.get('/', function (req, res, next) {
//     var user = res.locals.user;
//     res.locals.title = '国美金融';
//     res.locals.keywords = '国美金融';
//     res.locals.description = '国美金融';
//     if (user && user.idNumber) {
//         delete user.idNumber;
//     }

//     res.expose(user, 'user');
//     res.locals.carousel = req.uest(
//         '/api/v2/cms/carousel_detail')
//         .end()
//         .get('body');
//     res.locals.latestNoitce = req.uest(
//         '/api/v2/cms/category/PUBLICATION/name/' + encodeURIComponent('最新公告'))
//         .end()
//         .get('body')
//         .then( function(data){
//             return data[0];
//         });
//     res.locals.indexLoan = req.uest('/api/v2/loans/getLoanWithProduct', {
//         query: {
//             product: 'XSB,BL,XFD',
//             currentShow: 3,
//             status: 'OPENED,SCHEDULED,FINISHED,SETTLED',
//             minDuration: 0,
//             maxDuration: 100,
//             minRate: 0,
//             maxRate: 100,
//             asc: 'true',
//         }
//     })
//     res.render('index');
// });

// }
