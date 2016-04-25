'use strict';
var app = require('@cc/oauth2');
if (require.main === module) {
    app.listen(parseInt(process.env.PORT, 10) || 4100, function () {
        console.log('oauth server listened');
    });
} else {
    module.exports = app;
}
