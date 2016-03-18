
do (_, document, $script, angular, modules, APP_NAME = 'Gyro') ->

    eByID = document.getElementById.bind document

    angular.module APP_NAME, modules

        .config _.ai '$routeProvider, $locationProvider',
            (         $routeProvider, $locationProvider) ->

                $routeProvider

                    .when '/', {
                        controller: 'HomepageCtrl as self'
                        templateUrl: 'components/router/homepage/homepage.tmpl.html'
                        # redirectTo: '/list'
                    }

                    .when '/list/:type?', {
                        controller: 'ListCtrl as self'
                        templateUrl: 'components/router/list/list.tmpl.html'
                    }

                    .when '/login', {
                        controller: 'LoginCtrl as self'
                        templateUrl: 'components/router/login/login.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user()

                                        .then ->
                                            $location.path '/'
                                            return $q.reject()

                                        .catch $q.resolve
                    }

                    .when '/register', {
                        controller: 'RegisterCtrl as self'
                        templateUrl: 'components/router/register/register.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user()

                                        .then ->
                                            $location.path '/'
                                            return $q.reject()

                                        .catch $q.resolve
                    }

                    .when '/password/forgot', {
                        controller: 'PasswordForgotCtrl as self'
                        templateUrl: 'components/router/password/password-forgot.tmpl.html'
                    }

                    .when '/password/change', {
                        controller: 'PasswordChangeCtrl as self'
                        templateUrl: 'components/router/password/password-change.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'password/change'
                                        do $q.reject
                    }

                    .when '/activity', {
                        controller: 'ActivityCtrl as self'
                        templateUrl: 'components/router/activity/activity.tmpl.html'
                    }

                    .when '/announcement', {
                        controller: 'AnnouncementCtrl as self'
                        templateUrl: 'components/router/announcement/announcement.tmpl.html'
                        resolve:
                            data: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.get_announcement().catch ->
                                        $location.path '/'
                                        return $q.reject()
                    }

                    .when '/help', {
                        controller: 'HelpCtrl as self'
                        templateUrl: 'components/router/help/help.tmpl.html'
                    }

                    .when '/share-coupon/:id', {
                        controller: 'ShareCouponCtrl as self'
                        templateUrl: 'components/router/share-coupon/share-coupon.tmpl.html'
                        resolve:
                            wx: _.ai 'api, $location, $route, $q, $window',
                                (     api, $location, $route, $q, $window) ->
                                    deferred = do $q.defer

                                    is_wechat = /MicroMessenger/.test $window.navigator.userAgent

                                    if is_wechat
                                        $script '//res.wx.qq.com/open/js/jweixin-1.0.0.js', ->
                                            deferred.resolve $window.wx or {}
                                    else
                                        deferred.resolve {}

                                    return deferred.promise
                    }

                    .when '/dashboard', {
                        controller: 'DashboardCtrl as self'
                        templateUrl: 'components/router/dashboard/home.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard'
                                        return $q.reject()
                    }

                    .when '/dashboard/bank-card/:amount?', {
                        controller: 'BankCardCtrl as self'
                        templateUrl: 'components/router/dashboard/bank-card.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/bank-card'
                                        do $q.reject
                    }

                    .when '/dashboard/bank-card/edit/:id', {
                        controller: 'BankCardEditCtrl as self'
                        templateUrl: 'components/router/dashboard/bank-card-edit.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q, $route',
                                (       api, $location, $q, $route) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: "dashboard/bank-card/edit/#{ $route.current.params.id }"
                                        do $q.reject
                    }

                    .when '/dashboard/total-assets', {
                        controller: 'TotalAssetsCtrl as self'
                        templateUrl: 'components/router/dashboard/total-assets.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/total-assets'
                                        return $q.reject()
                    }

                    .when '/dashboard/coupon/:amount?/:months?/:loan_id?/:input?', {
                        controller: 'CouponCtrl as self'
                        templateUrl: 'components/router/dashboard/coupon.tmpl.html'
                        resolve:
                            data: _.ai 'api, $location, $q, $route',
                                (       api, $location, $q, $route) ->
                                    {amount, months, loan_id} = $route.current.params

                                    if !!amount and !!months and !!loan_id
                                        api.fetch_coupon_list(amount, months, loan_id)
                                            .then api.TAKE_RESPONSE_DATA
                                            .then (list) ->
                                                _(list)
                                                    .filter disabled: false
                                                    .pluck 'placement'
                                                    .value()
                                    else
                                        api.fetch_user_coupons()

                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/coupon'
                                        return $q.reject()
                    }

                    .when '/dashboard/notification', {
                        controller: 'NotificationCtrl as self'
                        templateUrl: 'components/router/dashboard/notification.tmpl.html'
                        resolve:
                            data: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_user_notifications().catch ->
                                        $location
                                            .replace()
                                            .path 'login'
                                            .search next: 'dashboard/notification'
                                        return $q.reject()
                    }

                    .when '/dashboard/payment/register', {
                        controller: 'PaymentPoolRegisterCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-register.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/payment/register'
                                        return $q.reject()
                    }

                    .when '/dashboard/payment/agreement', {
                        controller: 'PaymentUmpAgreementCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/ump/payment-ump-agreement.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/payment/agreement'
                                        return $q.reject()
                    }

                    .when '/dashboard/payment/bind-card', {
                        controller: 'PaymentPoolBindCardCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-bind-card.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/payment/bind-card'
                                        do $q.reject

                            banks: _.ai 'api', (api) -> api.get_available_bank_list()
                    }

                    .when '/dashboard/payment/password/:type?', {
                        controller: 'PaymentPoolPasswordCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-password.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q, $route',
                                (       api, $location, $q, $route) ->
                                    {type, back, next} = $route.current.params

                                    api.fetch_current_user()
                                        .then (user) ->
                                            return user if type in _.split 'set change reset'

                                            type = if user.has_payment_password then 'reset' else 'set'

                                            $location
                                                .replace()
                                                .path "/dashboard/payment/password/#{ type }"
                                                .search {back, next}

                                            return $q.reject(user)

                                        .catch (user) ->
                                            unless user
                                                $location
                                                    .replace()
                                                    .path '/login'
                                                    .search next: 'dashboard/payment/password'

                                            return $q.reject()
                    }

                    .when '/dashboard/invest', {
                        controller: 'InvestCtrl as self'
                        templateUrl: 'components/router/dashboard/invest.tmpl.html'
                        resolve:
                            data: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.get_user_investments().catch ->
                                        $location.path '/dashboard'
                                        return $q.reject()
                    }

                    .when '/dashboard/invest/:id', {
                        controller: 'InvestDetailCtrl as self'
                        templateUrl: 'components/router/dashboard/invest-detail.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: "dashboard/invest/#{ $route.current.params.id }"
                                        return $q.reject()
                    }

                    .when '/dashboard/repayment', {
                        controller: 'RepaymentCtrl as self'
                        templateUrl: 'components/router/dashboard/repayment.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/repayment'
                                        return $q.reject()
                    }

                    .when '/dashboard/funds', {
                        controller: 'FundsCtrl as self'
                        templateUrl: 'components/router/dashboard/funds.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/funds'
                                        return $q.reject()
                    }

                    .when '/dashboard/recharge/:amount?/:bank_id?', {
                        controller: 'RechargeCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-recharge.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/recharge'
                                        do $q.reject
                    }

                    .when '/dashboard/withdraw/:amount?/:bank_id?', {
                        controller: 'WithdrawCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-withdraw.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/withdraw'
                                        return $q.reject()
                    }

                    .when '/dashboard/invite', {
                        controller: 'InviteCtrl as self'
                        templateUrl: 'components/router/dashboard/invite.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/invite'
                                        return $q.reject()

                            wx: _.ai 'api, $location, $route, $q, $window',
                                (     api, $location, $route, $q, $window) ->
                                    deferred = do $q.defer

                                    is_wechat = /MicroMessenger/.test $window.navigator.userAgent

                                    if is_wechat
                                        $script '//res.wx.qq.com/open/js/jweixin-1.0.0.js', ->
                                            deferred.resolve $window.wx or {}
                                    else
                                        deferred.resolve {}

                                    return deferred.promise
                    }

                    .when '/dashboard/feedback', {
                        controller: 'FeedbackCtrl as self'
                        templateUrl: 'components/router/dashboard/feedback.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/feedback'
                                        return $q.reject()
                    }

                    .when '/dashboard/invite-registered', {
                        controller: 'InviteRegisteredCtrl as self'
                        templateUrl: 'components/router/dashboard/invite-registered.tmpl.html'
                    }

                    .when '/dashboard/return-results', {
                        controller: 'ReturnResultsCtrl as self'
                        templateUrl: 'components/router/dashboard/return-results.tmpl.html'
                    }

                    .when '/loan/:id', {
                        controller: 'LoanCtrl as self'
                        templateUrl: 'components/router/loan/loan.tmpl.html'
                        resolve:
                            loan: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.get_loan_detail($route.current.params.id, false).catch ->
                                        $location.path '/'
                                        do $q.reject
                    }

                    .when '/loan/:id/investors', {
                        controller: 'LoanInvestorsCtrl as self'
                        templateUrl: 'components/router/loan/loan-investors.tmpl.html'
                        resolve:
                            investors: _.ai 'api, $location, $route, $q',
                                (            api, $location, $route, $q) ->
                                    api.get_loan_investors($route.current.params.id).catch ->
                                        $location.path '/'
                                        do $q.reject
                    }

                    .when '/loan/:id/info', {
                        controller: 'LoanInfoCtrl as self'
                        templateUrl: 'components/router/loan/loan-info.tmpl.html'
                        resolve:
                            loan: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.get_loan_detail($route.current.params.id, true).catch ->
                                        $location.path '/'
                                        do $q.reject
                    }

                    .when '/loan/:id/detail', {
                        controller: 'LoanDetailCtrl as self'
                        templateUrl: 'components/router/loan/loan-detail.tmpl.html'
                        resolve:
                            loan: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.get_loan_detail($route.current.params.id, false).catch ->
                                        $location.path '/'
                                        do $q.reject
                    }

                    .when '/loan/:id/invest/:amount?/:coupon?', {
                        controller: 'LoanInvestCtrl as self'
                        templateUrl: 'components/router/loan/loan-invest.tmpl.html'
                        resolve:
                            loan: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user()
                                        .then -> api.get_loan_detail($route.current.params.id, false)
                                        .catch ->
                                            $location
                                                .replace()
                                                .path '/login'
                                                .search next: "loan/#{ $route.current.params.id }/invest"
                                            return $q.reject()

                            coupon: _.ai 'api, $location, $route, $q',
                                (         api, $location, $route, $q) ->
                                    api.fetch_current_user()
                                        .then -> api.get_loan_detail($route.current.params.id, true)
                                        .then (data) ->
                                            amount = data.balance
                                            months = _.get data, 'duration.totalMonths'
                                            loan_id = data.id

                                            return api.fetch_coupon_list amount, months, loan_id

                            _newbie: _.ai 'api, $location, $route, $q, $window',
                                (          api, $location, $route, $q, $window) ->
                                    is_newbie = false

                                    (api.fetch_current_user()

                                        .then (user) -> is_newbie = user.is_newbie

                                        .then -> api.get_loan_detail($route.current.params.id, true)

                                        .then (loan) ->
                                            if loan.loanRequest.productKey is 'NEW' and is_newbie isnt true

                                                $window.alert '此为新注册用户专享产品，您不符合活动要求，请选择其他产品！'

                                                $location
                                                    .replace()
                                                    .path "loan/#{ $route.current.params.id }"

                                                return $q.reject()
                                    )
                    }

                    .when '/more', {
                        controller: 'MoreCtrl as self'
                        templateUrl: 'components/router/more/more.tmpl.html'
                    }

                    .when '/about', {
                        controller: 'AboutCtrl as self'
                        templateUrl: 'components/router/about/about.tmpl.html'
                    }

                    .otherwise redirectTo: '/'


                $locationProvider
                    .html5Mode true
                    .hashPrefix '!'



























        .config _.ai '$provide, build_timestamp', ($provide, build_timestamp) ->
            return unless build_timestamp

            HOLDER = '{ts}'
            TPR = 'totalPendingRequests'

            $provide.decorator '$templateRequest', _.ai '$delegate', ($delegate) ->

                wrapper = (tpl, ignoreRequestError) ->

                    if /// ^/? ( components | static | assets ) ///.test tpl
                        if not /// #{ HOLDER } ///.test tpl
                            tpl += if /\?/.test(tpl) then '&' else '?'
                            tpl += '_t=' + HOLDER

                    return $delegate tpl.replace(HOLDER, build_timestamp), ignoreRequestError

                return {}.constructor.defineProperty wrapper, TPR, get: -> $delegate[TPR]


        .config _.ai '$compileProvider', ($compileProvider) ->

            func = $compileProvider.imgSrcSanitizationWhitelist.bind $compileProvider
            list = func().source.split '|'

            list_to_append = [///
                ( wxLocalResource          # WeChat on iOS
                | weixin                   # WeChat on Android
                | chrome-extension         # Google Chrome Extensions
                | app                      # NW.js (former node-webkit)
                ):
            ///.source, list.pop()]

            func /// #{ list.concat(list_to_append).join '|' } ///i


        .run _.ai 'api, $cookies', (api, $cookies) ->
            $cookies.remove 'return_url', path: '/'

            do api.fetch_current_user


        .constant 'baseURI', document.baseURI

        .constant 'build_timestamp', do (src = eByID('main-script')?.src) ->
            1000 * (src?.match(/t=([^&]+)/)?[1] or '0')

        .constant 'api_server', do (server = eByID('main-script').getAttribute('data-api-server')) ->
            if server.match /^{.*}$/ then '' else server

    on_ready = ->
        angular.bootstrap document, [APP_NAME], strictDi: true

    angular.element(document).ready on_ready
    document.addEventListener 'deviceready', on_ready
