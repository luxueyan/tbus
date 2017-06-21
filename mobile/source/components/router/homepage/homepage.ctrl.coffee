do (_, angular) ->
  angular.module('controller').controller 'HomepageCtrl',

    _.ai '@api, @user, @$scope, @$rootScope, @$window, @map_loan_summary', class
      constructor: (@api, @user, @$scope, @$rootScope, @$window, @map_loan_summary) ->
        @$window.scrollTo 0, 0

        @$rootScope.state = 'landing'

        EXTEND_API @api

        @query()

      query: ->
        @$scope.loading = true

        (@api.get_homepage_loans()

        .then (data) =>
          @$scope.list = data.results

#          console.log(@$scope.list)

        .finally =>
          @$scope.loading = false
        )

  EXTEND_API = (api) ->
    api.__proto__.get_homepage_loans = ->
      @$http
      .get '/api/v2/loans/getLoanWithPage?currentPage=1&pageSize=3&product=QD2&recommedInFront=true&status='
      .then @TAKE_RESPONSE_DATA
      .catch @TAKE_RESPONSE_ERROR

