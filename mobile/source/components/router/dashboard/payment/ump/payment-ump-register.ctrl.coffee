
do (_, angular) ->

    angular.module('controller').controller 'PaymentUmpRegisterCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$q, @$location, @$timeout, @$routeParams', class
            constructor: (@user, @api, @$scope, @$window, @$q, @$location, @$timeout, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back or 'dashboard'
                @next_path = @$routeParams.next or 'dashboard'

                @submit_sending = false

                @error = {timer: null, timeout: 2000, message: '', on: false}


            logout: ->

                @api.logout().then =>

                    @$location.path '/'
                    @$scope.$on '$locationChangeSuccess', =>
                        @$window.location.reload()


            submit: (real_name, id_number) ->

                return unless !!real_name is !!id_number

                @submit_sending = true

                (@api.payment_ump_register(real_name, id_number)

                    .then @api.process_response

                    .then (data) =>
                        @user.info.name = real_name
                        @user.has_payment_account = true

                        @$location.path @next_path
                        @$scope.$on '$locationChangeSuccess', =>
                            @$window.location.reload()

                    .catch (data) =>
                        @submit_sending = false
                        @$timeout.cancel @error.timer

                        @error.on = true
                        @error.message  = _.get data, 'data.retMsg'       # ID and name not match up
                        @error.message ?= _.get data, 'error[0].message'  # ID has already been used

                        @error.timer = @$timeout =>
                            @error.on = false
                        , @error.timeout
                )









    angular.module('directive').directive 'idNumber',

        _.ai 'checkChinaID', (checkChinaID) ->

            restrict: 'A'
            require: 'ngModel'

            link: (scope, element, attr, ngModel) ->

                ngModel.$parsers.push (value) ->
                    ('' + value).trim().toUpperCase()

                ngModel.$validators.id_number = checkChinaID
