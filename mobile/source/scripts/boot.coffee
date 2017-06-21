
do (_, document, $script, angular, modules, APP_NAME = 'Gyro') ->

    eByID = document.getElementById.bind document

    angular.module APP_NAME, modules

        .config _.ai '$routeProvider, $locationProvider, $touchProvider',
            (         $routeProvider, $locationProvider, $touchProvider) ->

                $routeProvider

                    .when '/', {
                        controller: 'HomepageCtrl as self'
                        templateUrl: 'components/router/homepage/homepage.tmpl.html'
                        resolve:
                            user: _.ai 'api, user',
                                (       api, user) ->
                                    api.fetch_current_user().catch ->
                                        return user
                        # redirectTo: '/list'
                    }

                    .when '/list', {
                        controller: 'ListCtrl as self'
                        templateUrl: 'components/router/list/list.tmpl.html'
                        resolve:
                            user: _.ai 'api, user',
                                (       api, user) ->
                                    api.fetch_current_user().catch ->
                                        return user
                    }

                    .when '/login', {
                        controller: 'LoginCtrl as self'
                        templateUrl: 'components/router/login/login.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user()

                                        .then ->
                                            $location
                                                .replace()
                                                .path '/dashboard'
                                                .search {}
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
                                            $location
                                                .replace()
                                                .path '/dashboard'
                                                .search {}
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

                    .when '/dashboard/subhome', {
                        controller: 'DashboardSubhomeCtrl as self'
                        templateUrl: 'components/router/dashboard/subhome.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/subhome'
                                        return $q.reject()
                    }

                    .when '/dashboard/bank-card', {
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

                    # .when '/dashboard/bank-card/edit', {
                    #     controller: 'BankCardEditCtrl as self'
                    #     templateUrl: 'components/router/dashboard/bank-card-edit.tmpl.html'
                    #     resolve:
                    #         user: _.ai 'api, $location, $q, $route',
                    #             (       api, $location, $q, $route) ->
                    #                 api.fetch_current_user().catch ->
                    #                     $location
                    #                         .replace()
                    #                         .path '/login'
                    #                         .search next: 'dashboard/bank-card/edit'
                    #                     do $q.reject

                    #         banks: _.ai 'api', (api) -> api.get_available_bank_list()
                    # }

                    .when '/dashboard/coupon', {
                        controller: 'CouponCtrl as self'
                        templateUrl: 'components/router/dashboard/coupon.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/coupon'
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

                    .when '/dashboard/payment/password', {
                        controller: 'PaymentPoolPasswordCtrl as self'
                        templateUrl: 'components/router/dashboard/payment/pool/payment-pool-password.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/payment/password'
                                        do $q.reject
                    }

                    .when '/dashboard/invest', {
                        controller: 'InvestCtrl as self'
                        templateUrl: 'components/router/dashboard/invest.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/invest'
                                        return $q.reject()
                    }

                    # .when '/dashboard/invest/:id', {
                    #     controller: 'InvestDetailCtrl as self'
                    #     templateUrl: 'components/router/dashboard/invest-detail.tmpl.html'
                    #     resolve:
                    #         user: _.ai 'api, $location, $route, $q',
                    #             (       api, $location, $route, $q) ->
                    #                 api.fetch_current_user().catch ->
                    #                     $location
                    #                         .replace()
                    #                         .path '/login'
                    #                         .search next: "dashboard/invest/#{ $route.current.params.id }"
                    #                     return $q.reject()
                    # }

                    .when '/dashboard/assignment/:id', {
                        controller: 'DashboardAssignmentCtrl as self'
                        templateUrl: 'components/router/dashboard/assignment.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: "dashboard/assignment/#{ $route.current.params.id }"
                                        return $q.reject()
                    }

                    .when '/dashboard/redeem/:id', {
                        controller: 'DashboardRedeemCtrl as self'
                        templateUrl: 'components/router/dashboard/redeem.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: "dashboard/redeem/#{ $route.current.params.id }"
                                        return $q.reject()
                    }

                    # .when '/dashboard/repayment', {
                    #     controller: 'RepaymentCtrl as self'
                    #     templateUrl: 'components/router/dashboard/repayment.tmpl.html'
                    #     resolve:
                    #         user: _.ai 'api, $location, $q',
                    #             (       api, $location, $q) ->
                    #                 api.fetch_current_user().catch ->
                    #                     $location
                    #                         .replace()
                    #                         .path '/login'
                    #                         .search next: 'dashboard/repayment'
                    #                     return $q.reject()
                    # }

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

                    .when '/dashboard/recharge', {
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

                    .when '/dashboard/withdraw', {
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

                    # .when '/dashboard/feedback', {
                    #     controller: 'FeedbackCtrl as self'
                    #     templateUrl: 'components/router/dashboard/feedback.tmpl.html'
                    #     resolve:
                    #         user: _.ai 'api, $location, $route, $q',
                    #             (       api, $location, $route, $q) ->
                    #                 api.fetch_current_user().catch ->
                    #                     $location
                    #                         .replace()
                    #                         .path '/login'
                    #                         .search next: 'dashboard/feedback'
                    #                     return $q.reject()
                    # }

                    .when '/dashboard/mobile-change', {
                        controller: 'MobileChangeCtrl as self'
                        templateUrl: 'components/router/dashboard/mobile-change.tmpl.html'
                        resolve:
                            user: _.ai 'api, $location, $q',
                                (       api, $location, $q) ->
                                    api.fetch_current_user().catch ->
                                        $location
                                            .replace()
                                            .path '/login'
                                            .search next: 'dashboard/mobile-change'
                                        return $q.reject()
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

                    # .when '/loan/:id/investors', {
                    #     controller: 'LoanInvestorsCtrl as self'
                    #     templateUrl: 'components/router/loan/loan-investors.tmpl.html'
                    #     resolve:
                    #         investors: _.ai 'api, $location, $route, $q',
                    #             (            api, $location, $route, $q) ->
                    #                 api.get_loan_investors($route.current.params.id).catch ->
                    #                     $location.path '/'
                    #                     do $q.reject
                    # }

                    # .when '/loan/:id/info', {
                    #     controller: 'LoanInfoCtrl as self'
                    #     templateUrl: 'components/router/loan/loan-info.tmpl.html'
                    #     resolve:
                    #         loan: _.ai 'api, $location, $route, $q',
                    #             (       api, $location, $route, $q) ->
                    #                 api.get_loan_detail($route.current.params.id, true).catch ->
                    #                     $location.path '/'
                    #                     do $q.reject
                    # }

                    # .when '/loan/:id/detail', {
                    #     controller: 'LoanDetailCtrl as self'
                    #     templateUrl: 'components/router/loan/loan-detail.tmpl.html'
                    #     resolve:
                    #         loan: _.ai 'api, $location, $route, $q',
                    #             (       api, $location, $route, $q) ->
                    #                 api.get_loan_detail($route.current.params.id, false).catch ->
                    #                     $location.path '/'
                    #                     do $q.reject
                    # }

                    .when '/loan/:id/invest', {
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
                            ###
                            coupon: _.ai 'api, $route, $q',
                                (         api, $route, $q) ->
                                    api.fetch_current_user()
                                        .then -> api.get_loan_detail($route.current.params.id, true)
                                        .then (data) ->
                                            if _.get(data, 'loanRequest.productKey') is 'NEW'
                                                return {data: []}

                                            amount = data.balance

                                            { days, totalDays, totalMonths } = _.get data, 'duration'
                                            if days
                                                months = Math.ceil(totalDays / 30)
                                            else
                                                months = totalMonths

                                            loan_id = data.id

                                            return api.fetch_coupon_list amount, months, loan_id
                            ###

                            _newbie: _.ai 'api, $route, $q, $window',
                                (          api, $route, $q, $window) ->
                                    is_newbie = false

                                    (api.fetch_current_user()

                                        .then (user) -> is_newbie = user.is_newbie

                                        .then -> api.get_loan_detail($route.current.params.id, true)

                                        .then (loan) ->
                                            if loan.loanRequest.productKey is 'NEW' and is_newbie isnt true

                                                $window.alert '该项目为新手专享，请选择其他项目进行购买'

                                                $window.history.back()

                                                return $q.reject()
                                    )

#                            _survey: _.ai 'api, $q, $window',
#                                (          api, $q, $window) ->
#                                    (api.fetch_current_user()
#                                        .then (user) ->
#                                            return if !user.has_bank_card or !user.has_payment_password
#
#                                            (api.get_user_surveys()
#                                                .then (data) ->
#                                                    return if _.isArray(data) and !_.isEmpty(data)
#
#                                                    $window.alert('请下载或直接登录汇财富APP进行风险测评！')
#                                                    $window.history.back()
#                                                    return $q.reject()
#                                            )
#                                    )
                    }

                    .when '/assignment/:id', {
                        controller: 'AssignmentCtrl as self'
                        templateUrl: 'components/router/assignment/assignment.tmpl.html'
                        resolve:
                            loan: _.ai 'api, $location, $route',
                                (       api, $location, $route) ->
                                    api.get_assignment_detail($route.current.params.id, false)
                                        .then (result) -> api.get_loan_detail(result.creditassign.loanId, false)

                            assignment: _.ai 'api, $location, $route',
                                (             api, $location, $route) ->
                                    api.get_assignment_detail($route.current.params.id, false)
                    }

                    .when '/assignment/:id/invest', {
                        controller: 'AssignmentInvestCtrl as self'
                        templateUrl: 'components/router/assignment/assignment-invest.tmpl.html'
                        resolve:
                            assignment: _.ai 'api, $location, $route, $q',
                                (       api, $location, $route, $q) ->
                                    api.fetch_current_user()
                                        .then -> api.get_assignment_detail($route.current.params.id, false)
                                        .catch ->
                                            $location
                                                .replace()
                                                .path '/login'
                                                .search next: "assignment/#{ $route.current.params.id }/invest"
                                            do $q.reject

                            loan: _.ai 'api, $location, $route',
                                (       api, $location, $route) ->
                                    api.get_assignment_detail($route.current.params.id, false)
                                        .then (result) -> api.get_loan_detail(result.creditassign.loanId, false)

#                            _survey: _.ai 'api, $q, $window',
#                                (          api, $q, $window) ->
#                                    (api.fetch_current_user()
#                                        .then (user) ->
#                                            return if !user.has_bank_card or !user.has_payment_password
#
#                                            (api.get_user_surveys()
#                                                .then (data) ->
#                                                    return if _.isArray(data) and !_.isEmpty(data)
#
#                                                    $window.alert('请下载或直接登录汇财富APP进行风险测评！')
#                                                    $window.history.back()
#                                                    return $q.reject()
#                                            )
#                                    )

                            # coupon: _.ai 'api, $route, $q',
                            #     (         api, $route, $q) ->
                            #         api.fetch_current_user()
                            #             .then -> api.get_assignment_detail($route.current.params.id, false)
                            #             .then (result) -> api.get_loan_detail(result.creditassign.loanId, false)
                            #             .then (data) ->
                            #                 amount = data.balance
                            #                 months = _.get data, 'duration.totalMonths'
                            #                 loan_id = data.id

                            #                 return api.fetch_coupon_list amount, months, loan_id
                    }

                    .when '/more', {
                        controller: 'MoreCtrl as self'
                        templateUrl: 'components/router/more/more.tmpl.html'
                    }

                    .when '/feature/:feature?', {
                        controller: 'FeatureCtrl as self'
                        templateUrl: 'components/router/feature/feature.tmpl.html'
                    }

                    .when '/about', {
                        controller: 'AboutCtrl as self'
                        templateUrl: 'components/router/about/about.tmpl.html'
                    }

                    # .when '/about-coupon', {
                    #     controller: 'AboutCouponCtrl as self'
                    #     templateUrl: 'components/router/about/about-coupon.tmpl.html'
                    # }

                    .when '/contact', {
                        controller: 'ContactCtrl as self'
                        templateUrl: 'components/router/contact/contact.tmpl.html'
                    }

                    .when '/help', {
                        controller: 'HelpCtrl as self'
                        templateUrl: 'components/router/help/help.tmpl.html'
                    }

                    .when '/download-app', {
                        controller: 'DownloadAppCtrl as self'
                        templateUrl: 'components/router/download/app.tmpl.html'
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

                    .when '/activity', {
                        controller: 'ActivityCtrl as self'
                        templateUrl: 'components/router/activity/activity.tmpl.html'
                    }

                    .when '/news', {
                        controller: 'NewsCtrl as self'
                        templateUrl: 'components/router/news/news.tmpl.html'
                    }

                    .otherwise redirectTo: '/'


                $locationProvider
                    .html5Mode true
                    .hashPrefix '!'

                $touchProvider.ngClickOverrideEnabled true


























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
