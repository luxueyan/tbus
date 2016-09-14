
do (_, angular) ->

    angular.module('controller').controller 'ListCtrl',

        _.ai '            @api, @user, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams, @popup_information_disclosure_agreement', class
            constructor: (@api, @user, @$scope, @$rootScope, @$window, @map_loan_summary, @map_assignment_summary, @$routeParams, @popup_information_disclosure_agreement) ->

                @$window.scrollTo 0, 0

                @$rootScope.state = 'list'

                current_tab = @$routeParams.tab or 'loan'

                query_set = {}

                if current_tab is 'loan'
                    query_set.product = 'GDSY'

                else if current_tab is 'high'
                    query_set.product = 'GDLC'

                    unless @user.has_logged_in
                        @popup_information_disclosure_agreement()

                angular.extend @$scope, {
                    current_tab
                    query_set
                }

                @query(query_set)


            query: (query_set, options = {}) ->

                if @$scope.current_tab in _.split 'loan high'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 1
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_loan_list_by_config(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat results.map(@map_loan_summary)

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )

                else if @$scope.current_tab is 'assignment'

                    if options.on_next_page
                        query_set.currentPage++
                    else
                        query_set.currentPage = 0
                        @$scope.list = []

                    @$scope.loading = true

                    (@api.get_assignment_list(query_set)

                        .then ({results, totalSize}) =>

                            @$scope.list = @$scope.list.concat(
                                _(results.map(@map_assignment_summary))
                                    .sortBy (item) ->
                                        ['OPENED', 'FINISHED'].indexOf(item.status)
                                    .value()
                            )

                            angular.extend @$scope.list, {totalSize}

                        .finally =>
                            @$scope.loading = false
                    )


            infinite_scroll: (distance) =>

                return if distance >= 0

                @$scope.$evalAsync =>
                    @query(@$scope.query_set, {on_next_page: true})
                        .then => @$scope.$broadcast('scrollpointShouldReset')










    angular.module('factory').factory 'popup_information_disclosure_agreement', _.ai '$uibModal', ($uibModal) ->

            ->

                prompt = $uibModal.open {
                    size: 'lg'
                    backdrop: 'static'
                    windowClass: 'center'
                    animation: false
                    template: '''
                        <div class="modal-body"
                             style="max-height: 300px; overflow-y: auto;"
                             ng-bind-html="content | sanitize"
                        ></div>

                        <div class="modal-footer container">
                            <div class="row">
                                <div class="col-xs-6">
                                    <a class="btn btn-block btn-default"
                                       href="./"
                                    >离开</a>
                                </div>
                                <div class="col-xs-6">
                                    <a class="btn btn-block btn-theme"
                                       href="login?next=list?tab=high"
                                    >确认</a>
                                </div>
                            </div>
                        </div>
                    '''

                    controller: _.ai '$scope',
                        (             $scope) ->
                            content = '''
                                阁下如有意进行私募投资基金投资且满足《私募投资基金监督管理暂行办法》关于"合规投资者"标准之规定，即具备相应风险识别能力和风险承担能力，投资于单只私募基金的金额不低于100 万元，且个人金融类资产不低于300万元或者最近三年个人年均收入不低于50万元人民币。请阁下详细阅读本提示，并注册成为太合汇·汇财富特定的合规投资者，方可获得太合汇私募投资基金产品宣传推介服务。
                            '''
                            angular.extend $scope, {content}
                }

                once = @$scope.$on '$locationChangeStart', ->
                    prompt?.dismiss()
                    do once

                return prompt.result

