import {readFileSync} from 'fs';
import {platformInfo} from "./electron-adapter";

export const Vue = require(platformInfo.debug ? 'vue/dist/vue' : 'vue/dist/vue.min');
export const $ = window['$'] = require('jquery');

const componentList = [];
const viewList = [];

let vue;

export interface VueUnit {
    name?: string,
    data?: () => object,
    methods?: object,
    computed?: object,
    props?: string[]
}

export function register(type: 'component'|'view', path: string) {
    let BASE_PATH;
    let LIST;
    if(type === 'component') {
        BASE_PATH = '/components/';
        LIST = componentList;
    }else{
        BASE_PATH = '/views/';
        LIST = viewList;
    }
    const unit = require('..' + BASE_PATH + path).default as VueUnit;
    let html;
    if(platformInfo.debug) {
        //debug模式下从src读pug文件并编译
        const pugCompiler = require('pug');
        let pug = readFileSync('src' + BASE_PATH + path + '.pug').toString('UTF-8');
        html = pugCompiler.compile(pug)();
    }else{
        //release模式下从public读html文件
        html = readFileSync(__dirname + '/../../public' + BASE_PATH + path + '.html').toString('UTF-8');
    }
    const name = unit.name || path;
    Vue.component(name, {
        data: unit.data,
        methods: unit.methods,
        computed: unit.computed,
        props: unit.props,
        template: html
    });
    LIST.push(name);
}

export function build(el?: string) {
    let rootEl = el || '#app';
    let root = $(rootEl);
    for(let view of viewList) {
        root.append($(`<${view} v-if="located === '${view}'"/>`))
    }
    return vue = new Vue({
        el: rootEl,
        data: {
            located: null
        },
    })
}

export function route(page: string) {
    vue.located = page;
}
