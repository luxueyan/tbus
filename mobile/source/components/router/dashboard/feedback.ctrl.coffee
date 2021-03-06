
do (_, angular) ->

    angular.module('controller').controller 'FeedbackCtrl',

        _.ai '            @user, @api, @$scope, @$window, @$location', class
            constructor: (@user, @api, @$scope, @$window, @$location) ->

                @$window.scrollTo 0, 0

                @$scope.store = {
                    name: @user.info.name or ''
                    contact: @user.info.mobile
                }

                EXTEND_API @api


            submit: ({name, contact, feedback}) ->

                @submit_sending = true

                (@api.feedback(name, contact, feedback)

                    .then @api.process_response

                    .then (data) =>
                        @$window.alert @$scope.msg.SUCCEED
                        @$window.history.back()

                    .catch (data) =>
                        if _.get(data, 'error') is 'access_denied'
                            @$window.alert @$scope.msg.ACCESS_DENIED
                            @$window.location.reload()
                            return

                        @$window.alert @$scope.msg.FAILED
                        @submit_sending = false
                )






    EXTEND_API = (api) ->

        api.__proto__.feedback = (name, contact, feedback) ->

            @$http
                .post '/api/v2/user/MYSELF/feedback',
                    {name, contact, feedback}

                .then @TAKE_RESPONSE_DATA
                .catch @TAKE_RESPONSE_ERROR


