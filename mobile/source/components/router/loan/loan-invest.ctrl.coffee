
do (_, angular, Math) ->

    angular.module('controller').controller 'LoanInvestCtrl',

        _.ai '            @api, @user, @loan, @$scope, @$rootScope, @$location, @$window, @$q, map_loan_summary, @$uibModal, @popup_payment_state, @popup_payment_password, @view_pdf, @alert', class
            constructor: (@api, @user, @loan, @$scope, @$rootScope, @$location, @$window, @$q, map_loan_summary, @$uibModal, @popup_payment_state, @popup_payment_password, @view_pdf, @alert) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                @page_path = @$location.path()[1..]

                @$scope.default_bank_account = do (list = @user.bank_account_list) ->
                    item = _.find list, (item) -> item.defaultAccount is true
                    return (if item then item else _(list).first())

                angular.extend @$scope, {
                    store: {}
                    earning: 0
                    loan: map_loan_summary @loan

                    coupon_list: []

                    handle_coupon_list: (data) ->
                        _(data)
                            .filter (item) -> item.disabled is false
                            .pluck 'placement'
                            .filter (item) -> item.couponPackage.type isnt 'CASH'
                            .map (item) ->
                                info = item.couponPackage

                                return {
                                    id: item.id
                                    couponPackage: info
                                    timeExpire: item.timeExpire
                                    status: item.status
                                    minimum: info.minimumInvest
                                    maximum: info.maximumInvest
                                    type: info.type
                                    value: do ->
                                        value = info.parValue
                                        value /= 100 if info.type is 'INTEREST'
                                        return value

                                    display: do ->
                                        INTEREST = 'INTEREST'

                                        type_cn = {
                                            CASH: '现金券'
                                            INTEREST: '加息券'
                                            PRINCIPAL: '增值券'
                                            REBATE: '返现券'
                                        }[info.type]

                                        value = info.parValue
                                        value /= 100 if info.type is INTEREST

                                        unit = if info.type is INTEREST then '%' else '元'

                                        return "#{ value + unit + type_cn }"
                                }
                            .value()
                }

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'invest'
                    }

                EXTEND_API @api

                @init_amount()


            init_amount: (amount) ->

                amount ?= @loan.loanRequest.investRule.minAmount
                amount = @amount_polishing(amount)

                @fetch_analyse(amount)
                angular.extend @$scope.store, {amount}


            amount_polishing: (amount) ->

                loan = @$scope.loan
                rule = loan.raw.loanRequest.investRule

                [step, balance, minimum, maximum] = [rule.stepAmount, loan.balance, rule.minAmount, rule.maxAmount]

                return balance if balance < minimum

                amount = Math.max minimum, amount
                amount = Math.min amount, balance
                amount = Math.min amount, maximum

                return minimum + (amount - minimum) // step * step


            fetch_analyse: (amount = 0, loan = @$scope.loan) ->

                data = {
                    amountValue: amount
                    dueDay: loan.raw.duration.days
                    dueMonth: loan.raw.duration.months
                    dueYear: loan.raw.duration.years
                    annualRate: loan.rate
                    paymentMethod: loan.method
                }

                @api.fetch_invest_analyse(data).then (response) =>
                    @$scope.earning = +response.data?.interest

                (@api.fetch_coupon_list_v2(amount, loan.raw.duration.totalDays)
                    .then (response) =>
                        @$scope.coupon_list = @$scope.handle_coupon_list(response.data)
                )

                coupon = @$scope.store?.coupon
                if coupon and coupon.type is 'CASH'
                    @$scope.actual_payment_amount = Math.max 0, amount - coupon.value
                else
                    @$scope.actual_payment_amount = amount


            submit: (event) ->

                good_to_go = true
                do event.preventDefault  # submitting via AJAX

                loan = @$scope.loan

                isCycleProduct = loan.is_cycle_product

                # {password} = @$scope.store
                coupon = @$scope.store?.coupon
                amount = @$scope.store.amount or 0
                loan_minimum = loan.raw.loanRequest.investRule.minAmount
                loan_maximum = loan.raw.loanRequest.investRule.maxAmount
                loan_available = loan.balance
                loan_step = loan.raw.loanRequest.investRule.stepAmount
                user_available = @user.fund.availableAmount
                coupon_minimum = @$scope.store.coupon?.minimum
                coupon_maximum = @$scope.store.coupon?.maximum
                {singleQuota} = @$scope.default_bank_account.account
                can_use_balance = if @$scope.store.isUseBalance then user_available else 0

                (if amount > loan_available
                    good_to_go = false
                    @$window.alert "当前剩余可投#{ loan_available }元"

                else if loan_available >= loan_minimum and (amount < loan_minimum or (amount - loan_minimum) % loan_step isnt 0)
                    good_to_go = false
                    @$window.alert "#{ loan_minimum }元起投，#{ loan_step }元递增"

                else if loan_available < loan_minimum and amount isnt loan_available
                    good_to_go = false
                    @$window.alert "投资金额必须为标的剩余金额#{ loan_available }元"

                else if amount > loan_maximum and loan_maximum != 0
                    good_to_go = false
                    @$window.alert "单笔最多可投 #{ loan_maximum }元"

                # else if @$scope.store.isUseBalance and (user_available <= 0 or amount > user_available)
                #     good_to_go = false
                #     do @prompt_short_of_balance

                else if coupon_minimum and amount < coupon_minimum
                    good_to_go = false
                    @$window.alert "该优惠券需要投资额大于 #{ coupon_minimum } 方可使用"

                else if coupon_maximum and amount > coupon_maximum
                    good_to_go = false
                    @$window.alert "该优惠券需要投资额小于 #{ coupon_maximum } 方可使用"

                else if singleQuota != -1 and (amount - can_use_balance) > singleQuota
                    good_to_go = false
                    @$window.alert "超过银行卡单笔 #{ singleQuota }元的限额"
                )

                return unless good_to_go

                @submit_sending = true

                (@$q.resolve()

                    .then =>
                        return unless @$scope.coupon_list.length
                        return if @$scope.store.coupon

                        has_not_available_coupon = _.every(
                            @$scope.coupon_list,
                            (item) -> amount < item.minimum
                        )
                        return if has_not_available_coupon

                        return @use_coupon_confirm()

                    .then => @popup_payment_password()

                    .then (data) =>
                        @$scope.store.password = data
                        @api.payment_pool_check_password(@$scope.store.password)

                    .then @api.process_response

                    .catch (data) =>
                        return @$q.reject(data) if data is 'cancel'
                        return @$q.reject(data) if _.get(data, 'error') is 'access_denied'

                        @$q.reject error: [message: 'INCORRECT_PASSWORD']


                    .then (data) =>
                        post_data = {
                            userId: @user.info.id
                            clientIp: @user.clientIp
                            loanId: loan.id
                            amount: amount
                            smsCaptcha: false
                            placementId: coupon?.id or ''
                            paymentPassword: @$scope.store.password
                            isUseBalance: @$scope.store.isUseBalance
                            isCycleProduct
                        }

                        @api.payment_pool_tender(post_data)

                    .then @api.process_response

                    .then =>
                        @api.flush_user_info()
                        @$scope.action_result = { success: true }

                        if isCycleProduct
                            cycle_tip = '''
                                <h4><strong>温馨提示</strong></h4>
                                <p class="text-left text-justify">
                                    该产品为可循环产品，默认本金自动循环。
                                    “开放日（T日）”指每期产品的到期日，份额持有人在T-15日前点击“赎回”按钮，则当期赎回本金，否则顺延投资至下一期。
                                </p>
                            '''
                            @alert(cycle_tip)

                        # @$scope.show_invest_result = true

                        # @$scope.$on '$locationChangeSuccess', =>
                        #     @$window.location.reload()

                    .catch (data) =>
                        return if data is 'cancel'

                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        msg = @$scope.msg[key] or key

                        @$scope.action_result = { success: false, msg: msg }

                        # @$window.alert message

                    .finally =>
                        @submit_sending = false
                )


            prompt_short_of_balance: ->

                prompt = @$uibModal.open {
                    size: 'sm'
                    keyboard: false
                    backdrop: 'static'
                    windowClass: 'center'
                    animation: true
                    templateUrl: 'ngt-loan-invest-short-of-balance.tmpl'

                    controller: _.ai '$scope', ($scope) =>
                        angular.extend $scope, {
                            balance: @user.fund.availableAmount
                            minimum: @loan.loanRequest.investRule.minAmount
                        }
                }

                prompt.result.catch (new_path) =>

                    @$location
                        .path new_path
                        .search next: @page_path


            agreement: (name) ->

                api_path = '/api/v2/cms/category/DECLARATION/name/' + name

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center ngt-invest-agreement'
                    animation: true
                    templateUrl: 'ngt-invest-agreement.tmpl'

                    resolve: {
                        content: _.ai '$http', ($http) ->
                            $http
                                .get api_path, {cache: true}
                                .then (response) -> _.get response.data, '[0].content'
                    }

                    controller: _.ai '$scope, content',
                        (             $scope, content) ->
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result


            select_coupon: (event, store) ->

                do event.preventDefault if event

                prompt = @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-loan-invest-select-coupon.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) =>
                            angular.extend $scope, {
                                coupon_list: @$scope.coupon_list
                                select: (coupon) ->
                                    store.coupon = coupon
                            }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result


            use_coupon_confirm: ->

                self = @
                store = @$scope.store

                prompt = @$uibModal.open {
                    size: 'sm'
                    keyboard: false
                    backdrop: 'static'
                    windowClass: 'center modal-confirm'
                    animation: false
                    template: '''
                        <div class="modal-body text-center">
                           您有红包未使用，是否使用红包？
                        </div>

                        <div class="modal-buttons">
                            <div class="modal-button" ng-click="$dismiss('cancel'); select_coupon()">是</div>
                            <div class="modal-button" ng-click="$close()">否</div>
                        </div>
                    '''

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, {
                                select_coupon: -> self.select_coupon(null, store)
                            }
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss('cancel')
                    do once

                return prompt.result








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_tender = (data) ->

            @$http
                .post '/api/v2/invest/tender/MYSELF', _.compact data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
