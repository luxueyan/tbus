"use strict";

var utils = require('ccc/global/js/lib/utils');

var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/showbank.html'),
    data:{
      bankCards:CC.user.bankCards,
    }
});

  ractive.on('let-allow',function(event){
    var $dom = $(event.node);
    var _arg = $dom.attr("arg");
    var cardNo = _arg;
    var sendNo={
      cardNo:cardNo
    };
      $.post('/api/v2/hundsun/setDefaultAccount/MYSELF',sendNo,function(r){
        if(r.success){
          alert('设置默认卡成功');
          window.location.reload();
        }
      })
  });

  ractive.on('deleted-card',function(event){
    var $dom = $(event.node);
    console.log($dom);
    var _arg = $dom.attr("lala");
    console.log(_arg);
    var cardNo = _arg;
    var sendNo={
      cardNo:cardNo
    };
      $.post('/api/v2/hundsun/cancelCard/MYSELF',sendNo,function(r){
        if(r.success){
          alert('解绑成功');
          window.location.reload();
        }
      })
  });
