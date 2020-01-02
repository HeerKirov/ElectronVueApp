const fs = require('fs');
const path = require('path');

/**
 * 获得package.json内的json结构信息。
 * @return {json}
 */
function getPackageInfo() {
    let str = fs.readFileSync(path.join(__dirname, '../../package.json')).toString('UTF-8');
    return JSON.parse(str);
}

/**
 * 获得package-lock.json内的、依赖的状况信息。
 * @return {{}} dependencies
 */
function getPackageDependenciesInfo() {
    let str = fs.readFileSync(path.join(__dirname, '../../package-lock.json')).toString('UTF-8');
    return JSON.parse(str).dependencies;
}

/**
 * 结合package.json，获得build.json内的json结构信息。
 */
function getBuildInfo() {
    let pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString('UTF-8'));
    let build = JSON.parse(fs.readFileSync(path.join(__dirname, '../../build.json')).toString('UTF-8'));
    return {
        name: build.name || pkg.name,
        bundleName: build.bundleName || build.name || pkg.name,
        version: build.version || pkg.version,
        versionFullName: build.versionFullName || build.version || pkg.version,
        packageName: build['package'],
        icons: build.icons
    }
}

module.exports = {getPackageInfo, getPackageDependenciesInfo, getBuildInfo};
