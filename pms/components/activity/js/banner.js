/**
 * Created by yu on 2016/7/8.
 */
;(function ($) {
    var _ltimer
    $.fn.lyScrollStop = function () {
        $('.l-prev,.l-next,.l-point').remove()
    }
    $.fn.lyScrollInit = function (options) {
        clearInterval(_ltimer)
        $('.l-prev,.l-next,.l-point').remove()
        this.defaultOpt = {
            time : 5000
        }
        this.options = $.extend({}, this.defaultOpt, options)
        var $banner = this;
        var $subBanner = this.options.obj;
        var options = this.options
        $banner.append('<i class="l-prev"></i><i class="l-next"></i><div class="l-point"></div>')
        /*banner的轮播*/
        var point = 0;
        _ltimer = setInterval(autoRun, options.time);
        init()
        function init() {
            $('.l-point').html('')
            $subBanner.each(function (index) {
                if (index == 0) {
                    $('.l-point').append('<span class="on"></span>')
                } else {
                    $('.l-point').append('<span></span>')
                }
                $(this).css('left', index * getWidth())
            });
            point = 0;
        }

        $subBanner.hover(function () {
            clearInterval(_ltimer);
        }, function () {
            clearInterval(_ltimer);
            _ltimer = setInterval(autoRun, options.time);
        });
        $('.l-point span').on('click', function () {
            var index = $(this).index();
            if (point > index) {
                $subBanner.animate({
                    'left' : '+=' + getWidth() * (point - index)
                });
                point = index;
                banner1cl(point);
            }
            ;
            if (point < index) {
                $subBanner.animate({
                    'left' : '-=' + getWidth() * (index - point)
                });
                point = index;
                banner1cl(point);
            }
            ;
        });
        $('.l-prev').on('click', function () {
            if (point != 0) {
                goRun('left');
            }
        });
        $('.l-next').on('click', function () {
            if (point != $subBanner.length - 1) {
                goRun('right');
            }
        });
        window.onresize = function () {
            init()
        };
        function getWidth() {
            var width = $banner.width();
            return width;
        };
        function goRun(dir) {
            if (dir == 'left') {
                point--;
                $subBanner.animate({
                    'left' : '+=' + getWidth()
                });
            } else if (dir == 'right') {
                point++;
                $subBanner.animate({
                    'left' : '-=' + getWidth()
                });
            }
            ;
            banner1cl(point);
        };
        function autoRun() {
            if (point < $subBanner.length - 1) {
                $subBanner.animate({
                    'left' : '-=' + getWidth()
                });
                point++;
            } else if (point == $subBanner.length - 1) {
                point = 0;
                $subBanner.each(function (index) {
                    $(this).animate({'left' : index * getWidth()})
                });
            }
            ;
            banner1cl(point);
        }

        function banner1cl(point) {
            $('.l-point span').removeClass('on');
            $('.l-point span').eq(point).addClass('on');
        }
    }
})(jQuery);