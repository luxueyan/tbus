
do (_ ,angular, decodeURI) ->

    angular.module('controller').controller 'LoanInvestorsCtrl',

        _.ai '            @investors, @$scope, @$window', class
            constructor: (@investors, @$scope, @$window) ->

                @$window.scrollTo 0, 0

                @$scope.investors = @investors.map (item) ->

                    name = item.userLoginName.trim()

                    _.each [
                        /// ^zzhj_ ///
                        /// ^ZZHJ_ ///
                        /// ^ #{ decodeURI '%E6%89%8B%E6%9C%BA%E7%94%A8%E6%88%B7' } ///

                    ], (reg) -> name = name.replace reg, ''

                    if name isnt item.userLoginName
                        item.name = name.replace /(\d{3})(\d+)(\d{4})$/, '$1****$3'
                    else
                        [empty, head, tail] = name.split /^(..)/

                        item.name = head + tail.replace /./g, '*'
                        item.name = "#{ head[0] }*" if name.length < 3

                    return item
