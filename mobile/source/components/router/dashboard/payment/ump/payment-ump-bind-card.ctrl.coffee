
do (_, angular) ->

    angular.module('controller').controller 'PaymentUmpBindCardCtrl',

        _.ai             '@user, @baseURI, @$cookies, @$scope, @$window, @$routeParams', class
            constructor: (@user, @baseURI, @$cookies, @$scope, @$window, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back or 'dashboard'

                angular.extend @$scope, {
                    agreement: @user.agreement
                    bank_account: @user.bank_account
                }


            submit: (event) ->

                @$cookies.put 'return_url', @baseURI + 'dashboard/recharge', path: '/'
