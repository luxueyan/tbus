
do (_, angular) ->

    angular.module('controller').controller 'HomepageCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, map_loan_summary, @$location', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, map_loan_summary, @$location) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'landing'

                angular.extend @$scope, {
                    list: {}
                    page_path: './'
                    carousel_height: do (width = @$window.document.body.clientWidth) ->
                        # width * 300 / 640 # aspect ratio of banner image
                }

                _.split('XSZX HDZX XNB FB XJB').forEach (product) =>

                    @api.get_loan_list_by_config product, 1, false
                        .then ({results}) =>

                            @$scope.list[product] =
                                _(results)
                                    .compact()
                                    .map map_loan_summary
                                    .value()


            num: (amount) ->
                amount = amount | 0
                is_myriad = amount.toString().length > 3

                return {
                    amount: amount
                    myriad: if is_myriad then (amount / 10000) | 0 else null
                }

