
do (angular, _) ->

    angular.module('controller').controller 'AssignmentInvestCtrl',

        _.ai '            @api, @user, @assignment, @loan, @$scope, @$rootScope, @$q, @$location, @$window, map_assignment_summary, @$uibModal, @popup_payment_state, @popup_payment_password', class
            constructor: (@api, @user, @assignment, @loan, @$scope, @$rootScope, @$q, @$location, @$window, map_assignment_summary, @$uibModal, @popup_payment_state, @popup_payment_password) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                @page_path = @$location.path()[1..]

                @$scope.default_bank_account = do (list = @user.bank_account_list) ->
                        _.find list, (item) -> item.defaultAccount is true

                angular.extend @$scope, {
                    store: {}
                    assignment: map_assignment_summary @assignment.creditassign

                    # coupon_list:
                    #     _(@coupon.data)
                    #         .filter (item) -> item.disabled is false
                    #         .pluck 'placement'
                    #         .filter (item) -> item.couponPackage.type isnt 'CASH'
                    #         .map (item) ->
                    #             info = item.couponPackage

                    #             return {
                    #                 id: item.id
                    #                 couponPackage: info
                    #                 status: item.status
                    #                 minimum: info.minimumInvest
                    #                 type: info.type
                    #                 value: do ->
                    #                     value = info.parValue
                    #                     value /= 100 if info.type is 'INTEREST'
                    #                     return value

                    #                 display: do ->
                    #                     INTEREST = 'INTEREST'

                    #                     type_cn = {
                    #                         CASH: '现金券'
                    #                         INTEREST: '加息券'
                    #                         PRINCIPAL: '增值券'
                    #                         REBATE: '返现券'
                    #                     }[info.type]

                    #                     value = info.parValue
                    #                     value /= 100 if info.type is INTEREST

                    #                     unit = if info.type is INTEREST then '%' else '元'

                    #                     return "#{ value + unit + type_cn } - 最低投资额: #{ info.minimumInvest }"
                    #             }
                    #         .value()

                    # coupon_minimum: (item) =>
                    #     @$scope.store.amount >= item.minimum
                }

                if !@user.has_bank_card or !@user.has_payment_password
                    @popup_payment_state {
                        user: @user
                        page: 'invest'
                    }

                EXTEND_API @api


            submit: (event) ->

                good_to_go = true
                do event.preventDefault  # submitting via AJAX

                # loan_available = @assignment.creditassign.balance
                # user_available = @user.fund.availableAmount

                # coupon = @$scope.store?.coupon
                # coupon_minimum = @$scope.store.coupon?.minimum

                # (if user_available <= 0 or amount > user_available
                #     good_to_go = false
                #     do @prompt_short_of_balance

                # else if @$scope.store.amount > loan_available
                #     good_to_go = false
                #     @$window.alert "投资金额超出项目剩余金额，请重新输入"

                if @assignment.creditassign.userId == @user.info.id
                    good_to_go = false
                    @$window.alert "不可以投自己转让的债权标"

                else if @loan.loanRequest.userId == @user.info.id
                    good_to_go = false
                    @$window.alert "不可以投自己借款的债转标"

                # else if coupon_minimum and amount < coupon_minimum
                #     good_to_go = false
                #     @$window.alert "该优惠券需要投资额大于 #{ coupon_minimum } 方可使用"
                # )

                return unless good_to_go

                @submit_sending = true

                (@popup_payment_password()

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
                            clientIp: @user.clientIp
                            amount: @assignment.creditassign.creditAmount
                            creditAssignId: @assignment.creditassign.id
                            isUseBalance: @$scope.store.isUseBalance
                        }

                        @api.payment_pool_creditAssign_invest(post_data)

                    .then @api.process_response

                    .then =>
                        @api.user_fetching_promise = null
                        @user.has_logged_in = false
                        @$scope.action_result = { success: true }

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
                            minimum: @assignment.creditassign.creditDealAmount
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








    EXTEND_API = (api) ->

        api.__proto__.payment_pool_creditAssign_invest = (data) ->

            @$http
                .post '/api/v2/invest/user/MYSELF/creditAssign/invest', data

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR
