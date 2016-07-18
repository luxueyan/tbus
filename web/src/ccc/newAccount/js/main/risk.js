"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/risk/risk.html'),

    data: {
        question:true,
        result:false,
        list:'',
        type:'',
    },
    init: function() {
        var self = this;

        accountService.getQuestion(function (res) {

            self.set("list",res.questions);
        });

    },
    oncomplete:function(){
        var self = this;

        self.on('getScore',function(){
            var sum =0;
            var len = $('input:radio:checked').length;
            if(len<10){
                alert("请确保每个选项都已选择!");
                return;
            }
            $('input:radio:checked').each(function(i){
                var score = parseInt($(this).val());
                sum+=score;
            });

            self.set('question',false);
            self.set('result',true);

            //判断类型
            if(sum>0&&sum<=30){
                self.set('type','保守型');
            }else if(sum>30&&sum<=60){
                self.set('type','稳定型');
            };

        });

    }
});

ractive.on('submit',function() {
    var male = $('#male').val();
    var companyIndustry  = this.get('companyIndustry');
    var educationLevel = this.get('educationLevel');
    var salary = this.get('salary');
    var maritalStatus  = this.get('maritalStatus');
    accountService.updatePersonalInfo(male,educationLevel,maritalStatus,function(r) {
        if (!r.error) {
            accountService.updateCareerInfo(companyIndustry,salary,function(r) {
                console.log(r);
                if (!r.error) {
                    alert('信息编辑成功');
                    window.location.reload();
                } else {
                   alert('信息编辑失败,请稍后重试！'); 
                }   
            });
        } else {
             alert('信息编辑失败,请稍后重试！'); 
        }
    });
    return false;
});
           
