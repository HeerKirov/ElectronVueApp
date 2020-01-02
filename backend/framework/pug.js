const fs = require('fs');
const pug = require('pug');
const path = require('path');

function compile(src, target) {
    let html = pug.compileFile(src, null)();
    fs.writeFileSync(target, html);
}

function compileByDeep(srcFolder, targetFolder) {
    const files = fs.readdirSync(srcFolder);
    if(!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    for(let filename of files) {
        let filepath = path.join(srcFolder, filename);
        let stat = fs.statSync(filepath);
        if(stat.isDirectory()) {
            compileByDeep(filepath, path.join(targetFolder, filename))
        }else if(stat.isFile() && filename.endsWith('.pug')) {
            compile(filepath, path.join(targetFolder, filename.substr(0, filename.length - 4) + '.html'))
        }
    }
}

function compileAll(srcFolder, targetFolder, includes) {
    if(includes) {
        for(let include of includes) {
            compileByDeep(path.join(srcFolder, include), path.join(targetFolder, include))
        }
    }else{
        compileByDeep(srcFolder, targetFolder)
    }
}

module.exports = {compileAll};

