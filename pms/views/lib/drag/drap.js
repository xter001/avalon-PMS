jQuery.fn.extend({
    Drap: function (opts) {
        var _self = this, _this = $(this), posX = 0, posY = 0;
        var h = $(window).height()
        opts = jQuery.extend({
            DrapMove: null,
            IsLimit: false,
            Callback: function () { }
        }, opts || {});
        _self.mousemove = function (e) {
            e.stopPropagation();

            if ( /msie/.test(navigator.userAgent.toLowerCase())) { e = window.event; }
            var x = e.clientX - posX;
            var y = e.clientY - posY;
            if (opts.IsLimit) {
                if (x < 0) {
                    x = 0;
                }
                if (y < 0) {
                    y = 0;
                }
                if (x > ($(document).width() - _this.width() - 2)) {
                    x = ($(document).width() - _this.width() - 2);
                }
                if (y > ($(document).height() - _this.height() - 2)) {
                    y = ($(document).height() - _this.height() - 2);
                }
            }
            _this.css("left", x + "px");
            _this.css("bottom", h-y-320 + "px");
            _this.css('margin',0)
            _this.addClass('no')
        }
        _this.find(opts.DrapMove).mousedown(function (e) {
            e.stopPropagation();
            if ( /msie/.test(navigator.userAgent.toLowerCase())) { e = window.event; }
            posX = e.clientX - parseInt(_this.offset().left);
            posY = e.clientY - parseInt(_this.offset().top);
            $(document).mousemove(function (ev) {
                _self.mousemove(ev);
            });
        });
        $(document).mouseup(function () {
            $(document).unbind("mousemove");
            opts.Callback();
        });
        _this.find(opts.DrapMove).css("cursor", "move");
    }
});
