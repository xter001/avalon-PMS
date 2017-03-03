# scrat-pms

## 一、前端环境安装：

### 1.安装node
安装node
### 2.安装fis **(fis2)**
`npm install –g fis`
### 3.安装scrat
`npm install –g scrat`
### 4.安装artTemplate
`npm install –g art-template`
### 5.安装TmodJS
`npm install –g tmodjs`
### 6.Java环境变量设置
目前运行需运行 `pms_play2.3` (java)项目、所以需安装java环境
[http://jingyan.baidu.com/article/f96699bb8b38e0894e3c1bef.html](http://jingyan.baidu.com/article/f96699bb8b38e0894e3c1bef.html)


## 二、项目地址：

- scrat-pms 前端项目：`svn://115.29.145.114/scrat-pms/trunk/scrat-pms`
- pms-paly项目(java)：`svn://115.29.145.114/pms/trunk/pms_play2.3`
- 前端公共项目：`svn://115.29.145.114/tomasky-fe-global/trunk`

纯工具、组件 **此项目务必要属性个方法、方便使用**
scrat是模块化开发的纯前端项目、为开发版，开发后需编译，目前编译后的文件是嫁接在pms里的静态目录里的。
暂时按这种方式开发、后续会逐渐全部抽离。

## 三、项目启动

### 1.pms-paly

####配置：  
目前pms采用play framework 所以需先配置play环境变量：下载play框架包并追加到系统环境变量上。

####启动：
`activator.bat run` _(需切换到pms所在根目录)_

_pms项目启动异常解决办法：  
1.`activator clean`  
2.`activator compile`  
3.`activator.bat run`_

以上步骤若不能解决问题，一般是后台存在问题。



###2.scrat-pms：

scrat-pms项目启动开发模式：  
`scrat release -wd local2pms` 
需切换到pms所在根目录，其作用是动态编译并copy到指定目录，此处是copy发布到pms指定目录
_注：我们开发是在scrat里，但提交代码时，scrat【开发版】，pms【发布版、编译后的文件】都要提交，因为目前我们最后发布的是pms项目_

artTemplate 预编译：  
`tmod` 需切换到template下package.json所在目录，将artTemplate模板事先编译为js文件，页面中直接引入编译后的js即可

fis[项目发布编译]：  
`fis release -Dopd ./` 此只在项目发布时用，平时开发不关注


## 四、开发工具：

前端IDE使用webstorm，后续可能接触nodejs开发，目前webstorm调试nodejs最方便，功能也很强大。

安装完webstorm后按“WebStorm设置简介.docx”统一设置
在写完js、css代码后必须格式化
格式化快捷键：`Ctrl+shift+f`
