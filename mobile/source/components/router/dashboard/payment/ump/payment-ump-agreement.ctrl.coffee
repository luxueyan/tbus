
do (_, angular) ->

    angular.module('controller').controller 'PaymentUmpAgreementCtrl',

        _.ai             '@api, @baseURI, @$cookies, @$scope, @$window, @$location, @$routeParams', class
            constructor: (@api, @baseURI, @$cookies, @$scope, @$window, @$location, @$routeParams) ->

                @$window.scrollTo 0, 0

                @back_path = @$routeParams.back or 'dashboard'
                @next_path = @$routeParams.next or 'dashboard'


            logout: ->

                @api.logout().then =>

                    @$location.path '/'
                    @$scope.$on '$locationChangeSuccess', =>
                        @$window.location.reload()


            submit: (event) ->

                @$cookies.put 'return_url', @baseURI + 'dashboard', path: '/'
