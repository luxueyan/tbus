'use strict';
module.exports = function (router) {
    router.get('/loans', async function (req, res, next) {
        
        //var loans = await req.uest.get('/api/v2/loans/home/summary').end().get('body');
        var loans = await req.uest.get('/api/v2/loans/summary').end().get('body');
        
            for(var p in loans){
                if(loans[p][0]){
                    var proofs = (await req.uest.get(
                        '/api/v2/loan/'+loans[p][0].id+'/detail')
                        ).body.data.proofs;
                    if(proofs){
                        for(let i = 0;i < proofs.length; i++){
                            if(proofs[i].proof.proofType == 'LOANPURPOSE'){
                                loans[p][0].coverImg = (proofs[i] || {}).uri;
                            }
                        }
                    }
                }
            }  

//        for (let i = 0; i < loans.open.length; i++) {
//            var proofs = (await req.uest.get(
//                '/api/v2/loan/'+loans.open[i].id+'/detail')
//                ).body.data.proofs;
//            loans.open[i].coverImg = (proofs[0] || {}).uri;
//        }
//        for (let i = 0; i < loans.scheduled.length; i++) {
//            var proofs = (await req.uest.get(
//                '/api/v2/loan/'+loans.scheduled[i].id+'/detail')
//                ).body.data.proofs;
//            loans.scheduled[i].coverImg = (proofs[0] || {}).uri;
//        }
//        for (let i = 0; i < loans.settled.length; i++) {
//            var proofs = (await req.uest.get(
//                '/api/v2/loan/'+loans.settled[i].id+'/detail')
//                ).body.data.proofs;
//            loans.settled[i].coverImg = (proofs[0] || {}).uri;
//        }
//        for (let i = 0; i < loans.finished.length; i++) {
//            var proofs = (await req.uest.get(
//                '/api/v2/loan/'+loans.finished[i].id+'/detail')
//                ).body.data.proofs;
//            loans.finished[i].coverImg = (proofs[0] || {}).uri;
//        }   
        res.json(loans)
    });
};
