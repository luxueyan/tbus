
do (_, angular, moment, Array, Date) ->

    WWW_FORM_HEADER = 'Content-Type': 'application/x-www-form-urlencoded'

    TAKE_RESPONSE_DATA = (response) -> response.data
    TAKE_RESPONSE_ERROR = (q, response) -> q.reject response.data

    ARRAY_JOIN = _.partialRight Array::join, ''


    angular.module('service').service 'api',

        _.ai '            @user, @$http, @$q, @param, @$timeout', class
            constructor: (@user, @$http, @$q, @param, @$timeout) ->

                @access_token = 'cookie'
                @user_fetching_promise = null

                TAKE_RESPONSE_ERROR = _.partial TAKE_RESPONSE_ERROR, @$q

                @TAKE_RESPONSE_ERROR = TAKE_RESPONSE_ERROR
                @TAKE_RESPONSE_DATA = TAKE_RESPONSE_DATA

                @process_response = (data) =>
                    return @$q.reject(data) unless data?.success is true
                    return data

                @flush_user_info = =>
                    @user_fetching_promise = null
                    @user.has_logged_in = false


            fetch_current_user: ->

                if @user_fetching_promise
                    return @user_fetching_promise

                deferred = do @$q.defer
                @user_fetching_promise = deferred.promise

                unless @access_token
                    do deferred.reject
                    return @user_fetching_promise

                if @user.has_logged_in
                    deferred.resolve @user
                    return @user_fetching_promise

                (@$http.get('/api/v2/user/MYSELF')

                    .then (response, {api_list} = {}) =>
                        @user.info = response.data

                        @$timeout =>
                            @flush_user_info()
                        , 30 * 60 * 1000 + @user.info.lastLoginDate - Date.now()

                        api_list = _.split '
                            statistics/invest
                            userfund
                            fundaccounts
                            authenticates
                        '

                        api_list = api_list.map (path) =>
                            @$http.get "/api/v2/user/#{ @user.info.id }/#{ path }"

                        api_list.push @$http.get '/api/v2/baofoo/getBankConstraints', cache: true
                        api_list.push @$http.get '/getClientIp', cache: true

                        return @$q.all api_list

                    .then (response) =>
                        [
                            @user.statistics
                            @user.fund
                            @user.fund_accounts
                            @user.authenticates
                            {data: banks}
                            @user.clientIp

                        ] = _.pluck response, 'data'

                        _.each @user.fund_accounts, (item) ->
                            _.extend item.account, _.find banks, (bank) -> bank.bankCode is item.account.bank

                        deferred.resolve @user.ready true

                    .catch =>
                        deferred.reject @user_fetching_promise = null
                )

                return @user_fetching_promise


            get_user_investments: (query_set = {}, cache = false) ->

                _.defaults query_set, {
                    status: _.split 'FINISHED PROPOSED FROZEN SETTLED OVERDUE BREACH CLEARED'
                    page: 1
                    pageSize: 10
                }

                new_path = ->
                    ARRAY_JOIN.call [
                        '/api/v2/user/MYSELF/invest/list'
                        '/', query_set.page
                        '/', query_set.pageSize
                    ]

                @$http
                    .get new_path(),
                        params: _.omit query_set, ['page', 'pageSize']
                        cache: cache

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_user_creditassign_list: (query_set = {}, cache = false) ->

                _.defaults query_set, {
                    status: 'OPEN'
                    page: 1
                    pageSize: 10
                }

                @$http
                    .get '/api/v2/creditassign/list/user/MYSELF',
                        params: query_set
                        cache: cache

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_user_repayments: (query_set = {}, cache = true) ->

                convert_to_day = (date) ->
                    moment(date.format 'YYYY-MM-DD').unix() * 1000

                _.defaults query_set, {
                    status: 'UNDUE'
                    from: convert_to_day moment().add 1, 'd'
                    to: convert_to_day moment().add 6, 'M'
                    page: 1
                    pageSize: 20
                }

                new_path = ->
                    ARRAY_JOIN.call [
                        '/api/v2/user/MYSELF/investRepayments'
                        '/', query_set.page
                        '/', query_set.pageSize
                    ]

                @$http
                    .get new_path(),
                        params: _.omit query_set, ['page', 'pageSize']
                        cache: cache

                    .then TAKE_RESPONSE_DATA

                    .then (response) =>

                        totalSize = _.get response, 'data.totalSize'

                        return response if query_set.pageSize >= totalSize

                        query_set.pageSize = totalSize

                        @$http
                            .get new_path(),
                                params: _.omit query_set, ['page', 'pageSize']
                                cache: cache

                            .then TAKE_RESPONSE_DATA

                    .catch TAKE_RESPONSE_ERROR


            get_user_coupons: (query_set = {}, cache = false) ->

                _.defaults query_set, {
                    status: 'PLACED'
                    pageNo: 1
                    pageSize: 10
                }

                @$http
                    .get '/api/v2/coupon/MYSELF/coupons/byStatus',
                        params: query_set
                        cache: cache

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_carousel_banners: ->

                @$http
                    .get '/api/v2/cms/mobileBanners', cache: true

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_loan_list: ->

                @$http
                    .get('/api/v2/loans/summary', cache: false)

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_loan_list_by_config: (query_set = {}, cache = false) ->

                _.defaults query_set, {
                    status: ''
                    minDuration: 0
                    maxDuration: 100
                    minRate: 0
                    maxRate: 100
                    minAmount: 1
                    maxAmount: 100000000
                    currentPage: 1
                    pageSize: 10
                }

                @$http
                    .get '/api/v2/loans/getLoanWithPage',
                        params: query_set
                        cache: cache

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_loan_detail: (id, cache = false) ->

                @$http
                    .get "/api/v2/loan/#{ id }", {cache}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_repayment_detail: (id, cache = false) ->

                @$http
                    .get "/api/v2/loan/invest/#{ id }/repayments", {cache}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            fetch_invest_analyse: ({amountValue, dueDay, dueMonth, dueYear, annualRate, paymentMethod}) ->
                store =            {amountValue, dueDay, dueMonth, dueYear, annualRate, paymentMethod}

                @$http
                    .post '/api/v2/loan/request/analyse', store

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_invest_contract: (id, deferred = @$q.defer()) ->

                deferred.resolve "/api/v2/user/MYSELF/invest/#{ id }/contract"
                return deferred.promise


            fetch_coupon_list: (amount, months, loanId) ->

                @$http
                    .post '/api/v2/coupon/MYSELF/listCoupon', {months, amount, loanId}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_loan_investors: (id) ->

                @$http
                    .get "/api/v2/loan/#{ id }/invests"

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_assignment_list: (query_set = {}, cache = false) ->

                _.defaults query_set, {
                    pageSize: 10
                    currentPage: 0
                    status: _.split 'OPEN FINISHED'
                    minDealAmount: 0
                    maxDealAmount: 100000000
                    minRemainPeriod: 0
                    maxRemainPeriod: 100
                    orderBy: ''
                    asc: ''
                }

                @$http
                    .get '/api/v2/creditassign/list/filter',
                        params: query_set
                        cache: cache

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_assignment_detail: (id, cache = false) ->

                @$http
                    .get('/api/v2/creditassign/creditAssignDetail/' + id, {cache})

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            login: (loginName, password) ->

                @$http
                    .post '/api/web/login', {loginName, password, source: 'mobile'}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            logout: ->

                @$http.post '/logout', {}, {
                    headers: 'X-Requested-With': 'XMLHttpRequest'
                }


            check_mobile: (mobile) ->

                @$http
                    .post '/api/v2/register/check_mobile', {mobile}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            check_invite_code: (inviteCode) ->

                @$http
                    .post '/api/v2/users/check/inviteCode', {inviteCode}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            bind_social: (socialType, socialId) ->

                @$http
                    .post '/api/v2/user/MYSELF/bind_social', {socialType, socialId}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            payment_pool_check_password: (password) ->

                return @$q.reject() unless password

                @$http
                    .post '/api/v2/user/MYSELF/validatePaymentPassword', {password}

                    .then (response) -> success: response.data is true
                    .catch TAKE_RESPONSE_ERROR


            get_available_bank_list: ->

                @$http.get '/api/v2/baofoo/getBankConstraints', cache: true

                    .then TAKE_RESPONSE_DATA
                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            register: (password, mobile, mobile_captcha, optional = {}) ->

                optional = _.compact optional

                @$http
                    .post '/api/web/register/submit',
                        _.merge optional, {password, mobile, mobile_captcha, source: 'MOBILE'}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            mobile_encrypt: (mobile) ->

                @$http
                    .post '/api/v2/users/mobile/encrypt', {mobile}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            fetch_register_captcha: ->

                @$http
                    .get '/api/v2/captcha?timestamp=' + _.now()
                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            fetch_password_captcha: ->

                @$http
                    .get '/api/v2/register/captcha?timestamp=' + _.now()
                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            reset_password: (mobile, captcha, newPassword) ->

                @$http
                    .post '/api/v2/auth/reset_password/password',
                        _.compact {mobile, captcha, newPassword}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            change_password: (mobile, currentPassword, newPassword) ->

                @$http
                    .post '/api/v2/user/MYSELF/change_password',
                        _.compact {mobile, currentPassword, newPassword}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            send_verification_code: (mobile, captcha_answer, captcha_token) ->

                @$http
                    .get '/api/v2/users/smsCaptcha',
                        params: _.compact {mobile, captcha_answer, captcha_token}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            send_captcha_for_reset_password: (mobile) ->

                @$http
                    .get '/api/v2/users/smsCaptcha/changePwd',
                        params: {mobile}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            exchange_wechat_signature: (data) ->

                @$http
                    .post '/wx/signature', data, {skip_json_to_form: true}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_refer_count_and_reward: (cache = false) ->

                @$http
                    .get '/api/v2/reward/getReferUserCountAndReward/MYSELF', {cache}

                    .then TAKE_RESPONSE_DATA
                    .catch TAKE_RESPONSE_ERROR


            get_user_available_withdraw_amount: (cache = false) ->

                convert_to_day = (date) ->
                    moment(date.format 'YYYY-MM-DD').unix() * 1000

                query_set = {
                    type: 'DEPOSIT'
                    status: 'SUCCESSFUL'
                    operation: 'IN'
                    startDate: convert_to_day moment()
                    endDate: convert_to_day moment().add 1, 'd'
                    page: 1
                    pageSize: 10
                }

                @$http
                    .get '/api/v2/user/MYSELF/funds/query',
                        params: query_set
                        cache: cache

                    .then TAKE_RESPONSE_DATA

                    .then (response) =>

                        totalSize = _.get response, 'totalSize'

                        return response if query_set.pageSize >= totalSize

                        query_set.pageSize = totalSize

                        @$http
                            .get '/api/v2/user/MYSELF/funds/query',
                                params: query_set
                                cache: cache

                            .then TAKE_RESPONSE_DATA

                    .then ({results}) =>

                        recharge_amount_today = _.sum results, (item) -> item.amount

                        return Math.max 0, (@user.fund.availableAmount - recharge_amount_today)

                    .catch TAKE_RESPONSE_ERROR












    angular.module('service').config _.ai '$httpProvider', ($httpProvider) ->

        $httpProvider.interceptors.push [].concat [],

            _.ai '$httpParamSerializerJQLike, api_server', ($httpParamSerializerJQLike, api_server) ->

                request: (config) ->

                    if api_server and config.url.match /// ^/ ( api | wx ) ///
                        config.url = api_server + config.url

                    {skip_json_to_form, method, headers, data} = config

                    if skip_json_to_form or method isnt 'POST' or not angular.isObject data
                        return config

                    _.set headers, 'Content-Type', 'application/x-www-form-urlencoded'
                    _.set config,  'data',         $httpParamSerializerJQLike data

                    return config
