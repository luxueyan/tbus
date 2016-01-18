
do (angular) ->

    angular.module('directive').directive 'gyroHeader', ->

        restrict: 'AE'
        replace: true
        transclude: true
        templateUrl: 'components/header/header.tmpl.html'

        scope:
            user: '='

        controller: _.ai '@$element, @$location, @$rootScope', class
            constructor: (@$element, @$location, @$rootScope) ->
                42

        controllerAs: 'self'









    angular.module('directive').directive 'headerDropdownMenu', ->

        restrict: 'AE'
        replace: true
        transclude: true
        templateUrl: 'components/templates/ngt-header-dropdown-menu.tmpl.html'

        scope:
            state: '='

        controller: _.ai '@user, @$scope, @$cookies, @$location, @$window', class
            constructor: (@user, @$scope, @$cookies, @$location, @$window) ->
                @$scope.page_path = @$window.encodeURIComponent @$location.absUrl()
                @$cookies.put 'invite_back_path', @$scope.page_path

        controllerAs: 'self'
