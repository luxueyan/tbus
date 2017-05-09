
do (_, angular) ->

    angular.module('service').service 'user',

        _.ai '            @$rootScope', class
            constructor: (@$rootScope) ->

                @info = null
                @fund = null
                @statistics = null
                @fund_accounts = null
                @authenticates = null

                @has_logged_in = false
                @has_bank_card = false
                @has_payment_account = false
                @has_payment_password = false

                @bank_account = {}
                @bank_account_list = []


            ready: (status = false) ->

                return unless status is true

                _.split('info fund statistics fund_accounts authenticates').forEach (property) =>
                    @[property] ?= {}

                @has_logged_in = true

                @has_payment_account = !!@authenticates?.idauthenticated
                @has_payment_password = !!@authenticates?.paymentAuthenticated

                @bank_account_list = do (list = _(@fund_accounts or [])) ->
                    list.each (item) ->
                            item.account.mask =
                                "#{ item.account.account }".replace /^(\d{4})(\d+)(\d{4})$/, '$1 ***** ***** $3'
                        .value()

                @bank_account = _(@bank_account_list).pluck('account').first()

                @has_bank_card = !!@bank_account?.account

                @is_newbie = @fund.totalInvest < 1

                @$rootScope.$broadcast 'user.logged_in', @

                return @
