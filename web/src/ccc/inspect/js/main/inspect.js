'use strict';
//$(function () {
    //$('body').append('<link rel="stylesheet" href="/ccc/inspect/css/inspect.css"/>');
    //var $cccInspect = $('<div id="cccInspect" class="ccc-inspect"></div>');
    //$('body').append($cccInspect);
    var inspectRactive = new Ractive({
        el: '#cccInspect',
        template: require('ccc/inspect/partials/inspect.html'),
        data: {
            currentEnv: CC.NODE_ENV === 'development'
                ? 'dev' : CC.NODE_APP_INSTANCE === 'uat'
                    ? 'uat' : null,
            config: {},
        },
    });
    inspectRactive.on('refresh', function () {
        inspectRactive.set('config', {});
        inspectRactive.set('backendStatus', '检测中...');
        request('/__/inspect/ajax/config').end().get('body').then(function (config) {
            inspectRactive.set('config', config);
        });
        request('/api/v2/loans/summary').then(function (r) {
            if (r.error) {
                if (r.error.status) {
                    inspectRactive.set('backendStatus', r.error.status +
                            (r.error.status === 404 ? '（可能正在部署）'
                                : r.error.status === 500 ? '（后端出错）' : '')
                            );
                } else {
                    inspectRactive.set('backendStatus', '连接出错');
                }
            } else {
                if (r.body && r.body.open) {
                    inspectRactive.set('backendStatus', '可访问');
                } else {
                    inspectRactive.set('backendStatus', '不正常');
                }

            }
        });
    });
    inspectRactive.on('close', function () {
        inspectRactive.teardown();
        $cccInspect.remove();
    });
//});
