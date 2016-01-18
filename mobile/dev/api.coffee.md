

APIs
====

    module.exports = (router, _ = require 'lodash') ->










<h2 align="right"
----------------------------------------------------------------->get loan list
</h2>

        router.get '/api/v2/loans/summary', (req, res) ->

            res.json {
                openLoans: []
            }









Misc.
=====

        return router
