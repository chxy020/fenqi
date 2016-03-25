/**
 * @ 3.0.1
 * @ www.silpjs.com
 * @ E-mail：398791472@qq.com
 */
(function (f, c) {
    _fun = {
        ios: function () {
            var i = navigator.userAgent.match(/.*OS\s([\d_]+)/),
            h = !!i;
            if (!this._version_value && h) {
                this._version_value = i[1].replace(/_/g, '.')
            }
            this.ios = function () {
                return h
            };
            return h
        },
        version: function () {
            return this._version_value
        },
        clone: function (h) {
            function i() {
            }
            i.prototype = h;
            return new i
        }
    };
    var b = {
        _refreshCommon: function (h, j) {
            var i = this;
            i.wide_high = h || i.core[i.offset] - i.up_range;
            i.parent_wide_high = j || i.core.parentNode[i.offset];
            i._getCoreWidthSubtractShellWidth()
        },
        _initCommon: function (h, j) {
            var i = this;
            i.core = h;
            i.startFun = j.startFun;
            i.moveFun = j.moveFun;
            i.touchEndFun = j.touchEndFun;
            i.endFun = j.endFun;
            i.direction = j.direction;
            i.up_range = j.up_range || 0;
            i.down_range = j.down_range || 0;
            if (i.direction == 'x') {
                i.offset = 'offsetWidth';
                i._pos = i.__posX
            } else {
                i.offset = 'offsetHeight';
                i._pos = i.__posY
            }
            i.wide_high = j.wide_high || i.core[i.offset] - i.up_range;
            i.parent_wide_high = j.parent_wide_high || i.core.parentNode[i.offset];
            i._getCoreWidthSubtractShellWidth();
            i._bind('touchstart');
            i._bind('touchmove');
            i._bind('touchend');
            i._bind('webkitTransitionEnd');
            i.xy = 0;
            i.y = 0;
            i._pos( - i.up_range)
        },
        _getCoreWidthSubtractShellWidth: function () {
            var h = this;
            h.width_cut_coreWidth = h.parent_wide_high - h.wide_high;
            h.coreWidth_cut_width = h.wide_high - h.parent_wide_high
        },
        handleEvent: function (h) {
            switch (h.type) {
                case 'touchstart':
                    this._start(h);
                    break;
                case 'touchmove':
                    this._move(h);
                    break;
                case 'touchend':
                case 'touchcancel':
                    this._end(h);
                    break;
                case 'webkitTransitionEnd':
                    this._transitionEnd(h);
                    break
            }
        },
        _bind: function (i, h) {
            this.core.addEventListener(i, this, !!h)
        },
        _unBind: function (i, h) {
            this.core.removeEventListener(i, this, !!h)
        },
        __posX: function (h) {
            this.xy = h;
            this.core.style.webkitTransform = 'translate3d(' + h + 'px, 0px, 0px)'
        },
        __posY: function (h) {
            this.xy = h;
            this.core.style.webkitTransform = 'translate3d(0px, ' + h + 'px, 0px)'
        },
        _posTime: function (h, i) {
            this.core.style.webkitTransitionDuration = '' + i + 'ms';
            this._pos(h)
        }
    };
    var a = _fun.clone(b);
    a._init = function (h, j) {
        var i = this;
        i._initCommon(h, j);
        i.num = j.num;
        i.page = 0;
        i.change_time = j.change_time;
        i.lastPageFun = j.lastPageFun;
        i.firstPageFun = j.firstPageFun;
        j.change_time && i._autoChange();
        j.no_follow ? (i._move = i._moveNoMove, i.next_time = 500)  : i.next_time = 300
    };
    a._start = function (i) {
        var h = this,
        i = i.touches[0];
        h._abrupt_x = 0;
        h._abrupt_x_abs = 0;
        h._start_x = h._start_x_clone = i.pageX;
        h._start_y = i.pageY;
        h._movestart = undefined;
        h.change_time && h._stop();
        h.startFun && h.startFun(i)
    };
    a._move = function (h) {
        var i = this;
        i._moveShare(h);
        if (!i._movestart) {
            var j = h.touches[0];
            h.preventDefault();
            i.offset_x = (i.xy > 0 || i.xy < i.width_cut_coreWidth) ? i._dis_x / 2 + i.xy : i._dis_x + i.xy;
            i._start_x = j.pageX;
            if (i._abrupt_x_abs < 6) {
                i._abrupt_x += i._dis_x;
                i._abrupt_x_abs = Math.abs(i._abrupt_x);
                return
            }
            i._pos(i.offset_x);
            i.moveFun && i.moveFun(j)
        }
    };
    a._moveNoMove = function (h) {
        var i = this;
        i._moveShare(h);
        if (!i._movestart) {
            h.preventDefault();
            i.moveFun && i.moveFun(e)
        }
    };
    a._moveShare = function (h) {
        var i = this,
        j = h.touches[0];
        i._dis_x = j.pageX - i._start_x;
        i._dis_y = j.pageY - i._start_y;
        typeof i._movestart == 'undefined' && (i._movestart = !!(i._movestart || Math.abs(i._dis_x) < Math.abs(i._dis_y)))
    };
    a._end = function (i) {
        if (!this._movestart) {
            var h = this;
            h._end_x = i.changedTouches[0].pageX;
            h._range = h._end_x - h._start_x_clone;
            if (h._range > 35) {
                h.page != 0 ? h.page -= 1 : (h.firstPageFun && h.firstPageFun(i))
            } else {
                if (Math.abs(h._range) > 35) {
                    h.page != h.num - 1 ? h.page += 1 : (h.lastPageFun && h.lastPageFun(i))
                }
            }
            h.toPage(h.page, h.next_time);
            h.touchEndFun && h.touchEndFun(i)
        }
    };
    a._transitionEnd = function (i) {
        var h = this;
        i.stopPropagation();
        h.core.style.webkitTransitionDuration = '0';
        h._stop_ing && h._autoChange(),
        h._stop_ing = false;
        h.endFun && h.endFun()
    };
    a.toPage = function (h, i) {
        this._posTime( - this.parent_wide_high * h, i || 0);
        this.page = h
    };
    a._stop = function () {
        clearInterval(this._autoChangeSet);
        this._stop_ing = true
    };
    a._autoChange = function () {
        var h = this;
        h._autoChangeSet = setInterval(function () {
            h.page != h.num - 1 ? h.page += 1 : h.page = 0;
            h.toPage(h.page, h.next_time)
        }, h.change_time)
    };
    a.refresh = function (h, i) {
        this._refreshCommon(h, i)
    };
    var g = _fun.clone(b);
    g._init = function (h, j) {
        var i = this;
        i._initCommon(h, j);
        i.perfect = j.perfect;
        i.bar_no_hide = j.bar_no_hide;
        if (i.direction == 'x') {
            i.page_x = 'pageX';
            i.page_y = 'pageY';
            i.width_or_height = 'width';
            i._real = i._realX;
            i._posBar = i.__posBarX
        } else {
            i.page_x = 'pageY';
            i.page_y = 'pageX';
            i.width_or_height = 'height';
            i._real = i._realY;
            i._posBar = i.__posBarY
        }
        if (i.perfect) {
            i._transitionEnd = function () {
            };
            i._stop = i._stopPerfect;
            i._slipBar = i._slipBarPerfect;
            i._posTime = i._posTimePerfect;
            i._bar_upRange = i.up_range;
            i.no_bar = false;
            i._slipBarTime = function () {
            }
        } else {
            i.no_bar = j.no_bar;
            i.core.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33, 0.66, 0.66, 1)'
        }
        if (i.bar_no_hide) {
            i._hideBar = function () {
            };
            i._showBar = function () {
            }
        }
        if (_fun.ios()) {
            i.radius = 11
        } else {
            i.radius = 0
        }
        if (!i.no_bar) {
            i._insertSlipBar(j);
            if (i.coreWidth_cut_width <= 0) {
                i._bar_shell_opacity = 0;
                i._showBarStorage = i._showBar;
                i._showBar = function () {
                }
            }
        } else {
            i._hideBar = function () {
            };
            i._showBar = function () {
            }
        }
    };
    g._start = function (i) {
        var h = this,
        i = i.touches[0];
        h._animating = false;
        h._steps = [
        ];
        h._abrupt_x = 0;
        h._abrupt_x_abs = 0;
        h._start_x = h._start_x_clone = i[h.page_x];
        h._start_y = i[h.page_y];
        h._start_time = i.timeStamp || Date.now();
        h._movestart = undefined;
        !h.perfect && h._need_stop && h._stop();
        h.core.style.webkitTransitionDuration = '0';
        h.startFun && h.startFun(i)
    };
    g._move = function (i) {
        var j = this,
        k = i.touches[0],
        l = k[j.page_x],
        m = k[j.page_y],
        h = j.xy;
        j._dis_x = l - j._start_x;
        j._dis_y = m - j._start_y;
        (j.direction == 'x' && typeof j._movestart == 'undefined') && (j._movestart = !!(j._movestart || (Math.abs(j._dis_x) < Math.abs(j._dis_y))));
        if (!j._movestart) {
            i.preventDefault();
            j._move_time = k.timeStamp || Date.now();
            j.offset_x = (h > 0 || h < j.width_cut_coreWidth - j.up_range) ? j._dis_x / 2 + h : j._dis_x + h;
            j._start_x = l;
            j._start_y = m;
            j._showBar();
            if (j._abrupt_x_abs < 6) {
                j._abrupt_x += j._dis_x;
                j._abrupt_x_abs = Math.abs(j._abrupt_x);
                return
            }
            j._pos(j.offset_x);
            j.no_bar || j._slipBar();
            if (j._move_time - j._start_time > 300) {
                j._start_time = j._move_time;
                j._start_x_clone = l
            }
            j.moveFun && j.moveFun(k)
        }
    };
    g._end = function (l) {
        if (!this._movestart) {
            var j = this,
            l = l.changedTouches[0],
            k = (l.timeStamp || Date.now()) - j._start_time,
            i = l[j.page_x] - j._start_x_clone;
            j._need_stop = true;
            if (k < 300 && Math.abs(i) > 10) {
                if (j.xy > - j.up_range || j.xy < j.width_cut_coreWidth) {
                    j._rebound()
                } else {
                    var h = j._momentum(i, k, - j.xy - j.up_range, j.coreWidth_cut_width + (j.xy), j.parent_wide_high);
                    j._posTime(j.xy + h.dist, h.time);
                    j.no_bar || j._slipBarTime(h.time)
                }
            } else {
                j._rebound()
            }
            j.touchEndFun && j.touchEndFun(l)
        }
    };
    g._transitionEnd = function (i) {
        var h = this;
        if (i.target != h.core) {
            return
        }
        h._rebound();
        h._need_stop = false
    };
    g._rebound = function (j) {
        var i = this,
        h = (i.coreWidth_cut_width <= 0) ? 0 : (i.xy >= - i.up_range ? - i.up_range : i.xy <= i.width_cut_coreWidth - i.up_range ? i.width_cut_coreWidth - i.up_range : i.xy);
        if (h == i.xy) {
            i.endFun && i.endFun();
            i._hideBar();
            return
        }
        i._posTime(h, j || 400);
        i.no_bar || i._slipBarTime(j)
    };
    g._insertSlipBar = function (l) {
        var i = this;
        i._bar = c.createElement('div');
        i._bar_shell = c.createElement('div');
        if (i.direction == 'x') {
            var k = 'height: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var j = 'opacity: ' + i._bar_shell_opacity + '; left:2px; bottom: 2px; right: 2px; height: 5px; position: absolute; z-index: 10; pointer-events: none;'
        } else {
            var k = 'width: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var j = 'opacity: ' + i._bar_shell_opacity + '; top:2px; bottom: 2px; right: 2px; width: 5px; position: absolute; z-index: 10; pointer-events: none; '
        }
        var h = ' background-color: rgba(0, 0, 0, 0.5); border-radius: ' + i.radius + 'px; -webkit-transition: cubic-bezier(0.33, 0.66, 0.66, 1);';
        var k = k + h + l.bar_css;
        i._bar.style.cssText = k;
        i._bar_shell.style.cssText = j;
        i._countAboutBar();
        i._countBarSize();
        i._setBarSize();
        i._countWidthCutBarSize();
        i._bar_shell.appendChild(i._bar);
        i.core.parentNode.appendChild(i._bar_shell);
        setTimeout(function () {
            i._hideBar()
        }, 500)
    };
    g._posBar = function (h) {
    };
    g.__posBarX = function (i) {
        var h = this;
        h._bar.style.webkitTransform = 'translate3d(' + i + 'px, 0px, 0px)'
    };
    g.__posBarY = function (i) {
        var h = this;
        h._bar.style.webkitTransform = 'translate3d(0px, ' + i + 'px, 0px)'
    };
    g._slipBar = function () {
        var h = this;
        var i = h._about_bar * (h.xy + h.up_range);
        if (i <= 0) {
            i = 0
        } else {
            if (i >= h._width_cut_barSize) {
                i = Math.round(h._width_cut_barSize)
            }
        }
        h._posBar(i);
        h._showBar()
    };
    g._slipBarPerfect = function () {
        var i = this;
        var j = i._about_bar * (i.xy + i._bar_upRange);
        i._bar.style[i.width_or_height] = i._bar_size + 'px';
        if (j < 0) {
            var h = i._bar_size + j * 3;
            i._bar.style[i.width_or_height] = Math.round(Math.max(h, 5)) + 'px';
            j = 0
        } else {
            if (j >= i._width_cut_barSize) {
                var h = i._bar_size - (j - i._width_cut_barSize) * 3;
                if (h < 5) {
                    h = 5
                }
                i._bar.style[i.width_or_height] = Math.round(h) + 'px';
                j = Math.round(i._width_cut_barSize + i._bar_size - h)
            }
        }
        i._posBar(j)
    };
    g._slipBarTime = function (h) {
        this._bar.style.webkitTransitionDuration = '' + h + 'ms';
        this._slipBar()
    };
    g._stop = function () {
        var h = this,
        i = h._real();
        h._pos(i);
        if (!h.no_bar) {
            h._bar.style.webkitTransitionDuration = '0';
            h._posBar(h._about_bar * i)
        }
    };
    g._stopPerfect = function () {
        clearTimeout(this._aniTime);
        this._animating = false
    };
    g._realX = function () {
        var h = getComputedStyle(this.core, null) ['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return h[4] * 1
    };
    g._realY = function () {
        var h = getComputedStyle(this.core, null) ['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return h[5] * 1
    };
    g._countBarSize = function () {
        this._bar_size = Math.round(Math.max(this.parent_wide_high * this.parent_wide_high / this.wide_high, 5))
    };
    g._setBarSize = function () {
        this._bar.style[this.width_or_height] = this._bar_size + 'px'
    };
    g._countAboutBar = function () {
        this._about_bar = ((this.parent_wide_high - 4) - (this.parent_wide_high - 4) * this.parent_wide_high / this.wide_high) / this.width_cut_coreWidth
    };
    g._countWidthCutBarSize = function () {
        this._width_cut_barSize = (this.parent_wide_high - 4) - this._bar_size
    };
    g.refresh = function (h, j) {
        var i = this;
        i._refreshCommon(h, j);
        if (!i.no_bar) {
            if (i.coreWidth_cut_width <= 0) {
                i._bar_shell_opacity = 0;
                i._showBar = function () {
                }
            } else {
                i._showBar = i._showBarStorage || i._showBar;
                i._countAboutBar();
                i._countBarSize();
                i._setBarSize();
                i._countWidthCutBarSize()
            }
        }
        i._rebound(0)
    };
    g._posTimePerfect = function (h, o) {
        var n = this,
        m = h,
        k,
        j;
        n._steps.push({
            x: h,
            time: o || 0
        });
        n._startAni()
    };
    g._startAni = function () {
        var m = this,
        h = m.xy,
        k = Date.now(),
        l,
        j,
        i;
        if (m._animating) {
            return
        }
        if (!m._steps.length) {
            m._rebound();
            return
        }
        l = m._steps.shift();
        if (l.x == h) {
            l.time = 0
        }
        m._animating = true;
        i = function () {
            var n = Date.now(),
            o;
            if (n >= k + l.time) {
                m._pos(l.x);
                m._animating = false;
                m._startAni();
                return
            }
            n = (n - k) / l.time - 1;
            j = Math.sqrt(1 - n * n);
            o = (l.x - h) * j + h;
            m._pos(o);
            if (m._animating) {
                m._slipBar();
                m._aniTime = setTimeout(i, 1)
            }
        };
        i()
    };
    g._momentum = function (o, i, m, h, q) {
        var n = 0.001,
        j = Math.abs(o) / i,
        k = (j * j) / (2 * n),
        p = 0,
        l = 0;
        if (o > 0 && k > m) {
            l = q / (6 / (k / j * n));
            m = m + l;
            j = j * m / k;
            k = m
        } else {
            if (o < 0 && k > h) {
                l = q / (6 / (k / j * n));
                h = h + l;
                j = j * h / k;
                k = h
            }
        }
        k = k * (o < 0 ? - 1 : 1);
        p = j / n;
        return {
            dist: k,
            time: p
        }
    };
    g._showBar = function () {
        var h = this;
        h._bar_shell.style.webkitTransitionDelay = '0ms';
        h._bar_shell.style.webkitTransitionDuration = '0ms';
        h._bar_shell.style.opacity = '1'
    };
    g._hideBar = function () {
        var h = this;
        h._bar_shell.style.opacity = '0';
        h._bar_shell.style.webkitTransitionDelay = '300ms';
        h._bar_shell.style.webkitTransitionDuration = '300ms'
    };
    function d(k, h, l) {
        l || (l = {
        });
        if (_fun.ios() && (parseInt(_fun.version()) >= 5 && l.direction == 'x') && l.wit) {
            h.parentNode.style.cssText += 'overflow:scroll; -webkit-overflow-scrolling:touch;'
        } else {
            switch (k) {
                case 'page':
                    l.direction = 'x';
                    if (!this.SlipPage) {
                        this.SlipPage = true;
                        a._init(h, l);
                        return a
                    } else {
                        var j = _fun.clone(a);
                        j._init(h, l);
                        return j
                    }
                    break;
                case 'px':
                    if (!this.SlipPx) {
                        this.SlipPx = true;
                        g._init(h, l);
                        return g
                    } else {
                        var i = _fun.clone(g);
                        i._init(h, l);
                        return i
                    }
                    break;
                default:
                    break
            }
        }
    }
    f.slip = d
}) (window, document);