import {build, register, route} from "./framework/vue-loader";
import * as path from 'path';

console.log('cwd: ' + process.cwd());
console.log('cd: ' + path.join(__dirname, '../'));
process.chdir(path.join(__dirname, '../'));

//register component
register('component', 'hello');

//register view
register('view', 'home');

//build vue
build();

route('home');
