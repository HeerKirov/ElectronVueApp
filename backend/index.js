const Parameters = require('./framework/parameters');
const application = require('./framework/application');

(function() {
    let parameters = new Parameters(process.argv.slice(2));
    application({
        debug: parameters.containFlag('debug'),
        debugAppDataPath: parameters.optParams('debug-app-data-path'),
        platform: process.platform
    });
})();
