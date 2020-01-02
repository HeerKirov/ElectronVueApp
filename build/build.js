const Parameters = require('../backend/framework/parameters');

(function () {
    let parameters = new Parameters(process.argv.slice(2));
    let platform = parameters.optParams('platform', process.platform);
    let update = parameters.containFlag('update');

    switch (platform) {
        case 'darwin':
            if(update) {
                require('./darwin/build').updateResource()
            }else{
                require('./darwin/build').build()
            }
            break;
        default:
            console.log(`current platform (${process.platform}) is not supported to build.`);
    }
})();
