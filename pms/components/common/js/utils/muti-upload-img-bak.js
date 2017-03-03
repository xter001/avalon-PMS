/**
 * Created by xiong bai on 2016/6/7.
 */


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

    this.progress = function () {
        canBeCall(_self_.options.progress) && _self_.options.progress.apply(_self_, [_self_.index])
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

            _self_.batchStart(files)
            var i = 0;
            while (i < files.length) {
                var formData = new FormData()
                for (var key in this.options.params) {// process form parameters add it into form
                    formData.append(key, this.options.params[key]);
                }


                formData.append(this.options.name, files[i])//添加图片数据到formData 对象中

                var intervalId = null;
                _self_.index = i

                $.ajax({
                    url: this.options.url,
                    async: false,//一个个传需要设置为同步方法
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    dataType: 'json',
                    timeout: 10000,//10s超时设置
                    beforeSend: function (xhr) {//在此设置定时轮询功能
                        _self_.beforeSend(xhr, formData, files[i], i)

                        //intervalId = setInterval(_self_.progress, _self_.options.interval || 2000)
                    },
                    success: function (data, status, xhr) {
                        // clearInterval(intervalId);
                        _self_.success(data, status, xhr, files[i], i)
                    },
                    error: function (xhr, errorText, error) {
                        // clearInterval(intervalId);
                        _self_.error(xhr, errorText, error, files[i], i)
                    },
                    complete: function (xhr, status) {
                        _self_.complete(xhr, status, files[i], i);

                    }

                });


                i++
            }


        }

        _self_.batchFinish(files)

    }


    this.openPrompt = function () {
        var input = $('<input type="file" />').appendTo('body')
        input.attr('multiple', 'multiplie')
        input.change(function () {
            if (!this.files.length) {
                return false;
            }

            if (_self_.preValidate(this.files)) {
                _input_=this
                //设置定时器是因为非异步的批量上传会一直占用单线程的js，导致preValidate 里面的界面弹出框没办法渲染出来，需要留点时间给浏览器渲染界面
                setTimeout(function(){
                    _self_.upload(_input_.files)
                },500)

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