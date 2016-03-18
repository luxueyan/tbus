
do (_, angular) ->

    angular.module('controller').controller 'PaymentPoolBindCardCtrl',

        _.ai '            @banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @mg_alert, @$location, @$timeout, @$interval, @$routeParams, @$uibModal, @popup_payment_state', class
            constructor: (@banks, @user, @api, @$scope, @$rootScope, @$window, @$q, @mg_alert, @$location, @$timeout, @$interval, @$routeParams, @$uibModal, @popup_payment_state) ->

                @$window.scrollTo 0, 0

                angular.extend @$scope, {
                    province: null
                    city: null
                    store: {}
                }

                @back_path = @$routeParams.back
                @next_path = @$routeParams.next or 'dashboard'

                @submit_sending = false

                @error = {timer: null, timeout: 4000, message: '', on: false}
                @captcha = {timer: null, count: 60, count_default: 60, has_sent: false, buffering: false}

                # @api.get_province_list().then (data) =>
                #     @$scope.province = data


            send_mobile_captcha: ({id_number, user_name, cardNo, bank, cardPhone}) ->

                # do @api.payment_pool_bind_card_sent_captcha

                (@$q.resolve(!!@user.has_payment_account)

                    .then (has_payment_account) =>
                        return if has_payment_account

                        (@api.payment_pool_register(user_name, id_number)

                            .then @api.process_response

                            .then (data) =>
                                @user.info.name = user_name
                                @user.info.idNumber = id_number
                                @user.has_payment_account = true
                        )

                    .then => @api.payment_pool_check_card(cardNo, bank.bankCode, cardPhone)

                    .then @api.process_response

                    .then =>
                        @captcha.timer = @$interval =>
                            @captcha.count -= 1

                            if @captcha.count < 1
                                @$interval.cancel @captcha.timer
                                @captcha.count = @captcha.count_default
                                @captcha.buffering = false
                        , 1000

                        @captcha.has_sent = @captcha.buffering = true

                    .catch (data) =>
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key
                        return

                        @$timeout.cancel @error.timer

                        @error.on = true
                        @error.message = _.get data, 'error[0].message', '系统繁忙，请稍后重试！'

                        @error.timer = @$timeout =>
                            @error.on = false
                        , @error.timeout
                )


            fetch_city: (province) ->

                @api.get_city_list_by_province(province).then (data) =>
                    @$scope.city = data


            fetch_branch: (cityCode, cardNo) ->

                return # remove this in case branch list should being fetched from remote API

                unless !!cityCode and !!cardNo
                    @$scope.branchs = []
                    return

                @api.get_bank_branch_name(cityCode, cardNo).then (data) =>
                    @$scope.branchs = data


            need_location: ->

                @$scope.store.bankName and @$scope.store.bankName not in @$scope.direct_paid_banks


            on_change_bank_name: ->

                return if @need_location()

                _.split('province city branchName').forEach (key) =>
                    _.set @$scope.store, key, ''


            bind_card: ({id_number, user_name, cardNo, bank, cardPhone, smsCaptcha}) ->

                @submit_sending = true

                check_input = (data) =>
                    error_msg = ''

                    _.each data, (value, key) =>
                        return if !!value

                        error_msg = @$scope.msg[key]
                        return false

                    return @$q.reject {error: [message: error_msg]} if error_msg
                    return true

                (@$q.resolve(@need_location())

                    .then (location_needed) ->

                        return check_input({id_number}) unless !!id_number
                        return check_input({user_name}) unless !!user_name
                        return check_input({cardNo}) unless !!cardNo
                        return check_input({bank}) unless !!bank
                        return check_input({cardPhone}) unless !!cardPhone
                        # return check_input({city, province, branchName}) if location_needed
                        return check_input({smsCaptcha}) unless !!smsCaptcha

                    .then => @api.payment_pool_bind_card(cardNo, bank.bankCode, cardPhone, smsCaptcha)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED

                        @$rootScope.$on '$locationChangeStart', (event, new_path) =>
                            event.preventDefault()
                            @$window.location.href = new_path

                        @user.has_bank_card = true

                        unless @user.has_payment_password
                            @popup_payment_state {
                                user: @user
                                page: 'bind-card'
                                page_path: 'dashboard/payment/bind-card'
                            }
                            return

                        @mg_alert _.get data, 'data', 'wow...'
                            .result.finally =>
                                @$location
                                    .path @next_path
                                    .search t: _.now()

                    .catch (data) =>
                        @submit_sending = false
                        key = _.get data, 'error[0].message', 'UNKNOWN'
                        @$window.alert @$scope.msg[key] or key
                        return

                        @$timeout.cancel @error.timer

                        @error.on = true
                        @error.message = _.get data, 'error[0].message', '系统繁忙，请稍后重试！'

                        @error.timer = @$timeout =>
                            @error.on = false
                        , @error.timeout
                )


            select_bank: (event, store) ->

                do event.preventDefault

                self = @

                @$uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'modal-full-page'
                    openedClass: 'modal-full-page-wrap'
                    animation: false
                    templateUrl: 'ngt-select-bank.tmpl'

                    controller: _.ai '$scope',
                        (             $scope) ->
                            angular.extend $scope, {
                                banks: self.banks
                                select: (bank) ->
                                    store.bank = bank
                            }
                }









    angular.module('directive').directive 'idNumber',

        _.ai 'checkChinaID', (checkChinaID) ->

            restrict: 'A'
            require: 'ngModel'

            link: (scope, element, attr, ngModel) ->

                ngModel.$parsers.push (value) ->
                    ('' + value).trim().toUpperCase()

                ngModel.$validators.id_number = checkChinaID
