# Electron Vue Framework
一套基于原始Vue的、无需配置的Electron脚手架，可以直接在此项目的基础上进行开发。  

### 支持的开发模式
1. 使用TypeScript编写前端代码，使用JavaScript编写后端代码。
2. 使用Pug编写组件内容。
3. 允许简单的vue组件开发。
4. 使用简单的单层页面导航。
5. 提供单窗口Electron支持。

### 文件结构和开发指南
下面列出了**需要关注**的文件目录内容。
```
build/                      - 与构建有关的文件和代码。在打包应用程序时会用到。
    darwin/                 - macOS平台的相关打包材料。
        files/              - 存放相关文件。
        target/             - 存放打包结果。

backend/                    - 后端代码。这一部分代码使用js编写，运行在Electron的Node层，也就是主进程。
    framework/              - 脚手架代码。
        application.js      - App和Window的相关构建类，可以侵入式修改或继承修改。
        util.js             - 一些工具函数。
    index.js                - Electron主进程的入口文件。

src/                        - 前端代码。这一部分代码使用ts编写，运行在Electron的Chrome层，也就是渲染进程。
    framework/              - 脚手架代码。
        vue-loader.ts       - 提供Vue相关的构建工具，包括组件加载工具和Vue生成。
        electron-adapter.ts - 提供与后端通信的SDK。
        runtime.ts          - 提供Vue组件中全局共享的运行时环境。
    component/              - 存放组件。
        hello.ts
        hello.pug
    views/                  - 存放页面。
        home.ts
        home.pug
    main.ts                 - 前端的入口文件。
public/                     - 公共资源文件。
    css/                    - CSS文件。新增加的资源需要手动添加到index.html的引用中。
    fonts/                  - font文件。
    index.html              - 前端的加载页面。此页面中需要加载静态资源，以及引入初始代码文件。

build.json                  - 与构建相关的配置。                  
package.json                - npm的配置。
```

### 构建、调试和打包
#### 安装和编译
在项目开始使用前安装依赖和TypeScript：
```
npm install
npm install -g typescript
```
在执行任何运行动作之前编译：
```
tsc
```
#### 开发环境运行
要使用本地存储文件夹调试项目并启用开发者工具：
```
npm run debug
```
#### 打包
将应用程序打包为可执行文件，有一套专用配置。  
目前仅支持macOS(darwin)平台的自动打包。

`build.json`配置文件给出了在打包时使用的一部分文件选项。
```
{
  "name": "ElectronVueApp",                 //应用程序名称。将用于程序文件名、执行名等处。默认值为package.json["name"]。
  "bundleName": "Electron Vue App",         //额外的应用程序名称标识。将用于macOS菜单栏、About对话框。可选。
  "version": null,                          //版本信息。默认为package.json["version"]。
  "versionFullName": null,                  //更详细的版本信息。可选。
  "package": "com.heerkirov.electron",      //包名。将用于macOS包名限定名。
  "icons": {                                //打包使用的图标资源。此资源需要放置在`build/${platform}/files`文件夹下。可选。
    "darwin": "app.icns"
  }
}
```
在调整好打包配置之后，执行命令打包：
```
npm run build
```
`backend`, `node_modules`(非dev部分), `public`, `target`, `package.json`, `build.json`部分的资源将会被打包到应用程序内。

此外，如果进行临时开发后仅需要对包内代码资源进行更新，那么可以执行：
```
npm run build-update
```
