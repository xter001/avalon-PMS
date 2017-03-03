/**
 * Created by xiong bai on 2016/6/7.
 */

//var UUID=require('../uuid.js')
var UUID = function () {
    var result = ''
    var arr = []
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 30; i++) {
        var temp = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        arr.push(temp)
    }

    result = arr.join('') + '_' + (new Date()).getTime()
    return result;

}

var ImgUploader = function (options) {

    this.options = {}
    if (typeof options == 'object') {
        this.options = options;
    }

    this.index = -1 //用来标记一个个传的时候处理第几张图片


    function canBeCall(obj) {//can be invoke as function
        return obj && typeof obj == 'function'

    }

    //var funs=['beforeSend','success','progress','error']
    var _self_ = this;

    this.preValidate = function (files) {//上传前的验证
        if (canBeCall(this.options.preValidate)) return this.options.preValidate.apply(this, arguments)

        return true;
    }

    this.beforeSend = function () {
        canBeCall(this.options.beforeSend) && this.options.beforeSend.apply(this, arguments)

    }

    this.success = function () {
        canBeCall(this.options.success) && this.options.success.apply(this, arguments)
    }

    this.progress = function (index) {
        canBeCall(_self_.options.progress) && _self_.options.progress.apply(_self_, [index])
    }

    this.error = function () {
        canBeCall(this.options.error) && this.options.error.apply(this, arguments)
    }

    this.complete = function () {
        canBeCall(this.options.complete) && this.options.complete.apply(this, arguments)
    }

    this.batchStart = function () {
        canBeCall(this.options.batchStart) && this.options.batchStart.apply(this, arguments)
    }

    this.batchFinish = function () {//全部图片上传完后触发， 在batch 模式下，complete 和 batchFinish 只会执行一次，非batch 模式下 complete要执行多次
        canBeCall(this.options.batchFinish) && this.options.batchFinish.apply(this, arguments)
    }


    this.upload = function (files) {
        if (!window.FormData) {
            alert('浏览器不支持此上传功能，请换firefox 或 chrome')
            return
        }

        if (this.options.batch == true) {// 一次性上传

        } else {//一个个上传

            var fun = function () {

                //console.log('before exe interval: '+intervalId)
                //console.log('fun.index '+fun.index)
                //console.log('fun.proFinished '+ fun.proFinished)
                //console.log('fun.allFinished '+ fun.allFinished)

                if (fun.allFinished) {

                    //batchFinished
                    clearInterval(intervalId);
                    _self_.batchFinish(files)
                    console.log('all  finished')

                    return
                }

                if (fun.proFinished) {
                    if (fun.index + 1 < fun.maxIndex) {
                        fun.index++
                        fun.processing = true // start processing
                        fun.proFinished = false// not finished

                        //preprocess
                        var formData = new FormData()
                        for (var key in _self_.options.params) {// process form parameters add it into form
                            formData.append(key, _self_.options.params[key]);
                        }


                        formData.append(_self_.options.name, files[fun.index])//添加图片数据到formData 对象中
                        _self_.index = fun.index


                        //asynchronous upload img
                        var uuid = UUID();

                        $.ajax({
                            url: _self_.options.url + '?uuid=' + uuid,
                            //async: true,
                            type: 'POST',
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false,
                            dataType: 'json',
                            timeout: 30000,//30s超时设置
                            beforeSend: function (xhr) {
                                _self_.beforeSend(xhr, formData, files[fun.index], fun.index, uuid)

                                //intervalId = setInterval(_self_.progress, _self_.options.interval || 2000)
                            },
                            success: function (data, status, xhr) {
                                //避免complete没有被执行
                                fun.processing = false
                                fun.proFinished = true
                                // clearInterval(intervalId);
                                _self_.success(data, status, xhr, files[fun.index], fun.index)


                            },
                            error: function (xhr, errorText, error) {
                                //避免complete没有被执行
                                fun.processing = false
                                fun.proFinished = true
                                // clearInterval(intervalId);
                                _self_.error(xhr, errorText, error, files[fun.index], fun.index)


                            },
                            //特别注意在按了backspace以后，如果页面是局部刷新（包括avalon自己的路由功能）
                            // 可能会出现success 会被成功执行而，complete 没有被执行的情况
                            // 此complete 回调建议废除
                            complete: function (xhr, status) {
                                fun.processing = false
                                fun.proFinished = true
                                console.log('file ' + fun.index + ' finished')
                                _self_.complete(xhr, status, files[fun.index], fun.index);

                            }

                        });


                    } else {
                        fun.allFinished = true
                    }

                } else {
                    // 　asynchronous call get progress ajax

                    //processing
                    _self_.progress(fun.index,intervalId)
                }

                //console.log(fun.i++)
                //window.i=window.i+1

            }

            fun.index = -1;
            fun.maxIndex = files.length || -1;
            fun.processing = false;
            fun.proFinished = true;
//fun.canGoToNext=true;

            fun.allFinished = false;

            _self_.batchStart(files)
            var intervalId = setInterval(fun, 400)


        }


    }


    this.openPrompt = function () {
        var input = $('<input type="file" style="display:none;" />').appendTo('body')
        input.attr('multiple', 'multiplie')
        input.change(function () {
            if (!this.files.length) {
                return false;
            }

            if (_self_.preValidate(this.files)) {
                _input_ = this
                //设置定时器是因为非异步的批量上传会一直占用单线程的js，导致preValidate 里面的界面弹出框没办法渲染出来，需要留点时间给浏览器渲染界面
                setTimeout(function () {
                    _self_.upload(_input_.files)
                }, 100)

            }


            input.remove()

        });

        input.click();


    }


}

ImgUploader.init = function (options) { //创建对象的静态方法
    return new ImgUploader(options)
}

module.exports = ImgUploader;