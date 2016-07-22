"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var riskId='',rank='';
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/risk/risk.html'),

    data: {
        question:true,
        result:false,
        list:'',
        timeLastUpdated:'',
        type:'',
    },
    init: function() {
        var self = this;
        accountService.getQuestion(function (res) {
            self.set("list",res.questions);
            riskId=res.id;
        });
        request('GET', '/api/v2/user/MYSELF/userinfo')
            .end()
            .then(function (r) {
                console.log(r.body);
                self.set("timeLastUpdated", moment(r.body.surveyFilling.timeLastUpdated).format('YYYY-MM-DD HH:mm:ss'));
                rank=r.body.surveyScore.rank;
                self.set('type',r.body.surveyScore.name);
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
            request.post('/api/v2/user/MYSELF/surveyFilling')
                .query({
                    userId: CC.user.id,
                    surveyId: riskId,
                    fillingStatus:'FINISHED',
                    score:sum,
                    rank:rank,
                    content:''
                })
                .end()
                .then(function (r) {
                    var res = r.body;
                    if (!res) {
                        return alert("获取数据失败...");
                    }
                    console.log(res.error);
                    if (res.success) {
                        console.log(res.data);
                        self.set('question',false);
                        self.set('result',true);
                        self.set('timeLastUpdated',moment(res.data.timeLastUpdated).format('YYYY-MM-DD HH:mm:ss'));
                        return;
                    }
                    alert(res.error.toString() + '\n');
                });
        });

    }
});

ractive.on('reEvaluation',function(){
    this.set('question',true);
    this.set('result',false);
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
           
