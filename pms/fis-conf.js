var meta = require('./package.json');
fis.config.set('name', meta.name);
fis.config.set('version', meta.version);
// fis.config.set('project.exclude', 'node_modules/**');
fis.config.set('project.exclude',
    [
        "dist/**",
        'components/house/control/**',
        'component_modules/dist/**',
        'component_modules/fis-conf.js',
        'component_modules/tomasky.ui.plugins.js',
        'views/lib/tomato/resources/**',
        'temp*/**'
    ]);

// 设置url前缀
fis.config.set('urlPrefix', '/public');

fis.config.set('framework', {
    cache : false,
    combo : false,
    urlPattern : '/public/c/%s',
    comboPattern : '/co??%s'
});

fis.config.get('roadmap.path').unshift({
    reg : '**.vm',
    isJsLike : true,
    isComponents : false,
    // 只是内嵌，不用发布
    release : false
});


fis.config.set('modules.parser.handlebars', 'handlebars-3.x');

// fis.config.merge({
// roadmap : {
// path : [ {
// // 所有的css文件
// reg : '**.css',
// // 发布到/static/css/xxx目录下
// release : '/public/pms/1.0.0/css$&'
// }
// // , {
// // // 所有image目录下的.png，.gif文件
// // reg : /^\/images\/(.*\.(?:png|gif))/i,
// // // 发布到/static/pic/xxx目录下
// // release : '/static/pic/$1'
// // }
// ]
// }
// });

fis.config.merge({
    deploy : {
        // remote : {
        // //如果配置了receiver，fis会把文件逐个post到接收端上
        // receiver : 'http://www.example.com/path/to/receiver.php',
        // //从产出的结果的static目录下找文件
        // from : '/static',
        // //保存到远端机器的/home/fis/www/static目录下
        // //这个参数会跟随post请求一起发送
        // to : '/home/fis/www/',
        // //通配或正则过滤文件，表示只上传所有的js文件
        // include : '**.js',
        // //widget目录下的那些文件就不要发布了
        // exclude : /\/widget\//i,
        // //支持对文件进行字符串替换
        // replace : {
        // from : 'http://www.online.com',
        // to : 'http://www.offline.com'
        // }
        // },

        // 开发时使用 scrat release -wd local2pms 来使用这个配置
        local2pms: [{
            // 发布到当前项目的上一级的output目录中
            from: '/public/c',
            to : '/Users/sunaaron/works/fanqie/pms_play2.3/public'
        },
            {
                // 发布到当前项目的上一级的output目录中
                from: '/public/views',
                to : '/Users/sunaaron/works/fanqie/pms_play2.3/public'
            }]
    }
});