const fs = require('fs');
const child = require('child_process');
const util = require('../../backend/framework/util');
const pug = require('../../backend/framework/pug');

const {name, bundleName, version, versionFullName, packageName, icons} = util.getBuildInfo();
const dir = 'build/darwin';
const icon = icons['darwin'] || 'app.icns';

function createAppInTarget() {
    if(fs.existsSync(`${dir}/target/${name}.app`)) {
        child.execSync(`rm -rf "${dir}/target/${name}.app"`)
    }
    if(!fs.existsSync(`${dir}/target`)) {
        fs.mkdirSync(`${dir}/target`)
    }
    if(fs.existsSync('node_modules/electron/dist/Electron.app')) {
        child.execSync(`cp -R node_modules/electron/dist/Electron.app "${dir}/target/${name}.app"`);
        console.log('copy Electron.app from node_modules.')
    }else{
        throw new Error('Cannot find Electron.app in node_modules/electron/dist/ .')
    }
}

function createIcon() {
    if(fs.existsSync(`${dir}/files/${icon}`)) {
        fs.copyFileSync(`${dir}/files/${icon}`, `${dir}/target/${name}.app/Contents/Resources/${icon}`);
        fs.unlinkSync(`${dir}/target/${name}.app/Contents/Resources/electron.icns`);
        console.log(`use ${dir}/files/${icon}.`)
    }else{
        fs.renameSync(`${dir}/target/${name}.app/Contents/Resources/electron.icns`, `${dir}/target/${name}.app/Contents/Resources/${icon}`);
        console.log('use default electron.icns.')
    }
}

function createInfo() {
    fs.renameSync(`${dir}/target/${name}.app/Contents/MacOS/Electron`, `${dir}/target/${name}.app/Contents/MacOS/${name}`);
    fs.unlinkSync(`${dir}/target/${name}.app/Contents/Resources/default_app.asar`);
    fs.writeFileSync(`${dir}/target/${name}.app/Contents/Info.plist`, `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>BuildMachineOSBuild</key>
	<string>17D102</string>
	<key>CFBundleDisplayName</key>
	<string>${name}</string>
	<key>CFBundleExecutable</key>
	<string>${name}</string>
	<key>CFBundleIconFile</key>
	<string>${icon}</string>
	<key>CFBundleIdentifier</key>
	<string>${packageName}</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>${bundleName}</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>${version}</string>
	<key>CFBundleVersion</key>
	<string>${versionFullName}</string>
	<key>DTCompiler</key>
	<string>com.apple.compilers.llvm.clang.1_0</string>
	<key>DTSDKBuild</key>
	<string>10.13</string>
	<key>DTSDKName</key>
	<string>macosx10.13</string>
	<key>DTXcode</key>
	<string>0941</string>
	<key>DTXcodeBuild</key>
	<string>9F2000</string>
	<key>LSApplicationCategoryType</key>
	<string>public.app-category.developer-tools</string>
	<key>LSMinimumSystemVersion</key>
	<string>10.10.0</string>
	<key>NSCameraUsageDescription</key>
	<string>This app needs access to the camera</string>
	<key>NSHighResolutionCapable</key>
	<true/>
	<key>NSMainNibFile</key>
	<string>MainMenu</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>This app needs access to the microphone</string>
	<key>NSPrincipalClass</key>
	<string>AtomApplication</string>
	<key>NSRequiresAquaSystemAppearance</key>
	<false/>
	<key>NSSupportsAutomaticGraphicsSwitching</key>
	<true/>
</dict>
</plist>`);
}

function compile() {
    if(fs.existsSync('target')) {
        child.execSync("rm -rf target")
    }
    child.execSync('tsc');
}

function copyResources() {
    if(fs.existsSync(`${dir}/target/${name}.app/Contents/Resources/app`)) {
        child.execSync(`rm -rf "${dir}/target/${name}.app/Contents/Resources/app"`)
    }

    fs.mkdirSync(`${dir}/target/${name}.app/Contents/Resources/app`);
    child.execSync(`cp -R backend target public build.json "${dir}/target/${name}.app/Contents/Resources/app/"`);

    let pkg = util.getPackageInfo();
    pkg['name'] = name;
    fs.writeFileSync(`${dir}/target/${name}.app/Contents/Resources/app/package.json`, JSON.stringify(pkg));

    pug.compileAll('src', `${dir}/target/${name}.app/Contents/Resources/app/public`, ['views', 'components']);

    fs.mkdirSync(`${dir}/target/${name}.app/Contents/Resources/app/node_modules`);
    const dependencies = util.getPackageDependenciesInfo();
    for(let path in dependencies) {
        let {dev} = dependencies[path];
        if(!dev) {
            let split = path.split('/');
            if(split.length > 1) {
                let folder = "";
                for(let i = 0; i < split.length - 1; ++i) {
                    folder += '/' + split[i];
                    if(!fs.existsSync(`${dir}/target/${name}.app/Contents/Resources/app/node_modules${folder}`)) {
                        fs.mkdirSync(`${dir}/target/${name}.app/Contents/Resources/app/node_modules${folder}`)
                    }
                }
                child.execSync(`cp -R node_modules/${path} "${dir}/target/${name}.app/Contents/Resources/app/node_modules/${path}"`)
            }else{
                child.execSync(`cp -R node_modules/${path} "${dir}/target/${name}.app/Contents/Resources/app/node_modules"`)
            }
        }
    }
}

function build() {
    createAppInTarget();
    createIcon();
    createInfo();

    compile();
    copyResources();

    console.log(`${name}.app version ${version} build success in ${dir}/target/ .`)
}

function updateResource() {
    copyResources();

    console.log(`${name}.app version ${version} update success in ${dir}/target/ .`)
}

module.exports = {build, updateResource};
