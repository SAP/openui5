/*jslint eqeq: true, plusplus: true, undef: true, sloppy: true, vars: true, forin: true */
/*!
 * jQuery MobiScroll v2.2
 * http://mobiscroll.com
 *
 * Copyright 2010-2011, Acid Media
 * Licensed under the MIT license.
 *
 */
(function ($) {

    function Scroller(elem, settings) {
        var that = this,
            ms = $.mobiscroll,
            e = elem,
            elm = $(e),
            theme,
            lang,
            s = $.extend({}, defaults),
            m,
            hi,
            v,
            dw,
            warr = [],
            iv = {},
            input = elm.is('input'),
            visible = false;

        // Private functions

        function isReadOnly(wh) {
            if ($.isArray(s.readonly)) {
                var i = $('.dwwl', dw).index(wh);
                return s.readonly[i];
            }
            return s.readonly;
        }

        function generateWheelItems(wIndex) {
            var html = '',
                j;

            for (j in warr[wIndex]) {
                html += '<li class="dw-v" data-val="' + j + '" style="height:' + hi + 'px;line-height:' + hi + 'px;"><div class="dw-i">' + warr[wIndex][j] + '</div></li>';
            }
            return html;
        }

        function getDocHeight() {
            var body = document.body,
                html = document.documentElement;
            return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        }

        function setGlobals(t) {
            min = $('li.dw-v', t).eq(0).index();
            max = $('li.dw-v', t).eq(-1).index();
            index = $('ul', dw).index(t);
            h = hi;
            inst = that;
        }

        function formatHeader(v) {
            var t = s.headerText;
            return t ? (typeof (t) == 'function' ? t.call(e, v) : t.replace(/\{value\}/i, v)) : '';
        }

        function read() {
            that.temp = ((input && (that.val !== null && that.val != elm.val() || !elm.val().length)) || that.values === null) ? s.parseValue(elm.val() || '', that) : that.values.slice(0);
            that.setValue(true);
        }

        function scrollToPos(time, orig, index, manual, dir) {
            // Call validation event
            s.validate.call(e, dw, index, time);

            // Set scrollers to position
            $('.dww ul', dw).each(function (i) {
                var t = $(this),
                    cell = $('li[data-val="' + that.temp[i] + '"]', t),
                    v = cell.index(),
                    sc = i == index || index === undefined;

                // Scroll to a valid cell
                if (!cell.hasClass('dw-v')) {
                    var cell1 = cell,
                        cell2 = cell,
                        dist1 = 0,
                        dist2 = 0;
                    while (cell1.prev().length && !cell1.hasClass('dw-v')) {
                        cell1 = cell1.prev();
                        dist1++;
                    }
                    while (cell2.next().length && !cell2.hasClass('dw-v')) {
                        cell2 = cell2.next();
                        dist2++;
                    }
                    // If we have direction (+/- or mouse wheel), the distance does not count
                    if (((dist2 < dist1 && dist2 && dir !== 2) || !dist1 || !(cell1.hasClass('dw-v')) || dir == 1) && cell2.hasClass('dw-v')) {
                        cell = cell2;
                        v = v + dist2;
                    } else {
                        cell = cell1;
                        v = v - dist1;
                    }
                }

                //val = cell.attr('data-val');

                //if (val != that.temp[i] || sc) {
                if (!(cell.hasClass('dw-sel')) || sc) {
                    // Set valid value
                    that.temp[i] = cell.attr('data-val');

                    // Add selected class to cell
                    $('.dw-sel', t).removeClass('dw-sel');
                    cell.addClass('dw-sel');

                    // Scroll to position
                    that.scroll(t, v, sc ? time : 0.2, sc ? orig : undefined, i);
                }
            });

            // Reformat value if validation changed something
            that.change(manual);
        }

        function scrollToValid(cell, val, i, dir) {

            return val;
        }

        function position() {

            if (s.display == 'inline') {
                return;
            }

            function countWidth() {
                $('.dwc', dw).each(function () {
                    //if ($(this).css('display') != 'none') {
                        w = $(this).outerWidth(true);
                        totalw += w;
                        minw = (w > minw) ? w : minw;
                    //}
                });
                w = totalw > ww ? minw : totalw;
                w = $('.dwwr', dw).width(w + 1).outerWidth();
                h = d.outerHeight();
            }

            var totalw = 0,
                minw = 0,
                ww = $(window).width(),
                wh = window.innerHeight,
                st = $(window).scrollTop(),
                d = $('.dw', dw),
                w,
                t,
                l,
                h,
                ew,
                css = {},
                needScroll,
                elma = s.anchor === undefined ? elm : s.anchor;

            wh = wh || $(window).height();

            if (s.display == 'modal') {
                countWidth();
                l = (ww - w) / 2;
                t = st + (wh - h) / 2;
            } else if (s.display == 'bubble') {
                countWidth();
                var p = elma.offset(),
                    poc = $('.dw-arr', dw),
                    pocw = $('.dw-arrw-i', dw),
                    wd = d.outerWidth();

                // horizontal positioning
                ew = elma.outerWidth();
                l = p.left - (d.outerWidth(true) - ew) / 2;
                l = l > (ww - wd) ? (ww - (wd + 20)) : l;
                l = l >= 0 ? l : 20;

                // vertical positioning
                t = p.top - (d.outerHeight() + 3); // above the input
                if ((t < st) || (p.top > st + wh)) { // if doesn't fit above or the input is out of the screen
                    d.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
                    t = p.top + elma.outerHeight() + 3; // below the input
                    needScroll = ((t + d.outerHeight(true) > st + wh) || (p.top > st + wh));
                } else {
                    d.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');
                }

                t = t >= st ? t : st;

                // Calculate Arrow position
                var pl = p.left + ew / 2 - (l + (wd - pocw.outerWidth()) / 2);

                // Limit Arrow position to [0, pocw.width] intervall
                if (pl > pocw.outerWidth()) {
                    pl = pocw.outerWidth();
                }

                poc.css({ left: pl });
            } else {
                css.width = '100%';
                if (s.display == 'top') {
                    t = st;
                } else if (s.display == 'bottom') {
                    t = st + wh - d.outerHeight();
                    t = t >= 0 ? t : 0;
                }
            }
            css.top = t;
            css.left = l;
            d.css(css);

            $('.dwo, .dw-persp', dw).height(0).height(getDocHeight());

            if (needScroll) {
                $(window).scrollTop(t + d.outerHeight(true) - wh);
            }
        }

        function plus(t) {
            var p = +t.data('pos'),
                val = p + 1;
            calc(t, val > max ? min : val, 1);
        }

        function minus(t) {
            var p = +t.data('pos'),
                val = p - 1;
            calc(t, val < min ? max : val, 2);
        }

        // Public functions

        /**
        * Enables the scroller and the associated input.
        */
        that.enable = function () {
            s.disabled = false;
            if (input) {
                elm.prop('disabled', false);
            }
        };

        /**
        * Disables the scroller and the associated input.
        */
        that.disable = function () {
            s.disabled = true;
            if (input) {
                elm.prop('disabled', true);
            }
        };

        /**
        * Scrolls target to the specified position
        * @param {Object} t - Target wheel jQuery object.
        * @param {Number} val - Value.
        * @param {Number} time - Duration of the animation, optional.
        * @param {Number} orig - Original value.
        * @param {Number} index - Index of the changed wheel.
        */
        that.scroll = function (t, val, time, orig, index) {

            function getVal(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            }

            function ready() {
                clearInterval(iv[index]);
                iv[index] = null;
                t.data('pos', val).closest('.dwwl').removeClass('dwa');
            }

            var px = (m - val) * hi,
                i;

            t.attr('style', (time ? (prefix + '-transition:all ' + time.toFixed(1) + 's ease-out;') : '') + (has3d ? (prefix + '-transform:translate3d(0,' + px + 'px,0);') : ('top:' + px + 'px;')));

            if (iv[index]) {
                ready();
            }

            if (time && orig !== undefined) {
                i = 0;
                t.closest('.dwwl').addClass('dwa');
                iv[index] = setInterval(function () {
                    i += 0.1;
                    t.data('pos', Math.round(getVal(i, orig, val - orig, time)));
                    if (i >= time) {
                        ready();
                    }
                }, 100);
            } else {
                t.data('pos', val);
            }
        };

        /**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Boolean} sc - Scroll the wheel in position.
        * @param {Boolean} fill - Also set the value of the associated input element. Default is true.
        * @param {Number} time - Animation time
        * @param {Boolean} temp - If true, then only set the temporary value.(only scroll there but not set the value)
        */
        that.setValue = function (sc, fill, time, temp) {
            if (!temp) {
                that.values = that.temp.slice(0);
            }

            if (visible && sc) {
                scrollToPos(time);
            }

            if (fill) {
                that.val = v;
                if (input) {
                    elm.val(v).trigger('change');
                }
            }
        };

        /**
        * Checks if the current selected values are valid together.
        * In case of date presets it checks the number of days in a month.
        * @param {Number} time - Animation time
        * @param {Number} orig - Original value
        * @param {Number} i - Currently changed wheel index, -1 if initial validation.
        * @param {Number} dir - Scroll direction
        */
        that.validate = function (time, orig, i, dir) {
            scrollToPos(time, orig, i, true, dir);
        };

        /**
        *
        */
        that.change = function (manual) {
            v = s.formatResult(that.temp);
            if (s.display == 'inline') {
                that.setValue(false, manual);
            } else {
                $('.dwv', dw).html(formatHeader(v));
            }

            if (manual) {
                s.onChange.call(e, v, that);
            }
        };

        /**
        * Hides the scroller instance.
        */
        that.hide = function (prevAnim) {
            // If onClose handler returns false, prevent hide
            if (s.onClose.call(e, v, that) === false) {
                return false;
            }

            // Re-enable temporary disabled fields
            $('.dwtd').prop('disabled', false).removeClass('dwtd');
            elm.blur();

            // Hide wheels and overlay
            if (dw) {
                if (s.display != 'inline' && s.animate && !prevAnim) {
                    $('.dw', dw).addClass('dw-' + s.animate + ' dw-out');
                    setTimeout(function () {
                        dw.remove();
                        dw = null;
                    }, 350);
                } else {
                    dw.remove();
                    dw = null;
                }
                visible = false;
                // Stop positioning on window resize
                $(window).unbind('.dw');
            }
        };

        /**
        * Changes the values of a wheel, and scrolls to the correct position
        */
        that.changeWheel = function () {
            if (dw) {
                var i = 0,
                    j,
                    k,
                    ul,
                    al = arguments.length;

                for (j in s.wheels) {
                    for (k in s.wheels[j]) {
                        if ($.inArray(i, arguments) > -1) {
                            warr[i] = s.wheels[j][k];
                            ul = $('ul', dw).eq(i);
                            ul.html(generateWheelItems(i));
                            al--;
                            if (!al) {
                                position();
                                scrollToPos();
                                return;
                            }
                        }
                        i++;
                    }
                }
            }
        };

        /**
        * Shows the scroller instance.
        * @param {Boolean} prevAnim - Prevent animation if true
        */
        that.show = function (prevAnim) {
            if (s.disabled || visible) {
                return false;
            }

            if (s.display == 'top') {
                s.animate = 'slidedown';
            }

            if (s.display == 'bottom') {
                s.animate = 'slideup';
            }

            // Parse value from input
            read();

            s.onBeforeShow.call(e, dw, that);

            // Create wheels
            var l = 0,
                i,
                label,
                mAnim = '',
                persPS = '',
                persPE = '';

            if (s.animate && !prevAnim) {
                persPS = '<div class="dw-persp">';
                persPE = '</div>';
                mAnim = 'dw-' + s.animate + ' dw-in';
            }
            // Create wheels containers
            var html = '<div class="' + s.theme + ' dw-' + s.display + '">' + (s.display == 'inline' ? '<div class="dw dwbg dwi"><div class="dwwr">' : persPS + '<div class="dwo"></div><div class="dw dwbg ' + mAnim + '"><div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div><div class="dwwr">' + (s.headerText ? '<div class="dwv"></div>' : ''));

            for (i = 0; i < s.wheels.length; i++) {
                html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '"><div class="dwwc dwrc"><table cellpadding="0" cellspacing="0"><tr>';
                // Create wheels
                for (label in s.wheels[i]) {
                    warr[l] = s.wheels[i][label];
                    html += '<td><div class="dwwl dwrc dwwl' + l + '">' + (s.mode != 'scroller' ? '<div class="dwwb dwwbp" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>+</span></div><div class="dwwb dwwbm" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>&ndash;</span></div>' : '') + '<div class="dwl">' + label + '</div><div class="dww dwrc" style="height:' + (s.rows * hi) + 'px;min-width:' + s.width + 'px;"><ul>';
                    // Create wheel values
                    html += generateWheelItems(l);
                    html += '</ul><div class="dwwo"></div></div><div class="dwwol"></div></div></td>';
                    l++;
                }
                html += '</tr></table></div></div>';
            }
            html += (s.display != 'inline' ? '<div class="dwbc' + (s.button3 ? ' dwbc-p' : '') + '"><span class="dwbw dwb-s"><span class="dwb">' + s.setText + '</span></span>' + (s.button3 ? '<span class="dwbw dwb-n"><span class="dwb">' + s.button3Text + '</span></span>' : '') + '<span class="dwbw dwb-c"><span class="dwb">' + s.cancelText + '</span></span></div>' + persPE : '<div class="dwcc"></div>') + '</div></div></div>';
            dw = $(html);

            scrollToPos();

            // Show
            if (s.display != 'inline') {
                dw.appendTo('body');
            } else if (elm.is('div')) {
                elm.html(dw);
            } else {
                dw.insertAfter(elm);
            }
            visible = true;

            if (s.display != 'inline') {
                // Init buttons
                $('.dwb-s span', dw).click(function () {
                    that.hide();
                    that.setValue(false, true);
                    s.onSelect.call(e, that.val, that);
                    return false;
                });

                $('.dwb-c span', dw).click(function () {
                    that.hide();
                    s.onCancel.call(e, that.val, that);
                    return false;
                });

                if (s.button3) {
                    $('.dwb-n span', dw).click(s.button3);
                }

                // prevent scrolling if not specified otherwise
                if (s.scrollLock) {
                    dw.bind('touchmove', function (e) {
                        e.preventDefault();
                    });
                }

                // Disable inputs to prevent bleed through (Android bug)
                $('input,select').each(function () {
                    if (!$(this).prop('disabled')) {
                        $(this).addClass('dwtd');
                    }
                });
                $('input,select').prop('disabled', true);

                // Set position
                position();
                $(window).bind('resize.dw', position);

            }

            // Events
            dw.delegate('.dwwl', 'DOMMouseScroll mousewheel', function (e) {
                if (!isReadOnly(this)) {
                    e.preventDefault();
                    e = e.originalEvent;
                    var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0),
                        t = $('ul', this),
                        p = +t.data('pos'),
                        val = Math.round(p - delta);
                    setGlobals(t);
                    calc(t, val, delta < 0 ? 1 : 2);
                }
            }).delegate('.dwb, .dwwb', START_EVENT, function (e) {
                // Active button
                $(this).addClass('dwb-a');
            }).delegate('.dwwb', START_EVENT, function (e) {
                var w = $(this).closest('.dwwl');
                if (!isReadOnly(w) && !w.hasClass('dwa')) {
                    // + Button
                    e.preventDefault();
                    e.stopPropagation();
                    var t = w.find('ul'),
                        func = $(this).hasClass('dwwbp') ? plus : minus;
                    click = true;
                    setGlobals(t);
                    clearInterval(timer);
                    timer = setInterval(function () { func(t); }, s.delay);
                    func(t);
                }
            }).delegate('.dwwl', START_EVENT, function (e) {
                // Prevent scroll
                e.preventDefault();
                // Scroll start
                if (!isReadOnly(this) && !click && s.mode != 'clickpick') {
                    move = true;
                    moved = false;
                    target = $('ul', this);
                    target.closest('.dwwl').addClass('dwa');
                    pos = +target.data('pos');
                    setGlobals(target);
                    clearInterval(iv[index]);
                    start = getY(e);
                    startTime = new Date();
                    stop = start;
                    that.scroll(target, pos);
                }
            });

            s.onShow.call(e, dw, that);

            // Theme init
            theme.init(dw, that);
        };

        /**
        * Scroller initialization.
        */
        that.init = function (ss) {
            // Get theme defaults
            theme = $.extend({ defaults: {}, init: empty }, ms.themes[ss.theme || s.theme]);

            // Get language defaults
            lang = ms.i18n[ss.lang || s.lang];

            $.extend(s, theme.defaults, lang, settings, ss);

            that.settings = s;

            // Unbind all events (if re-init)
            elm.unbind('.dw');

            var preset = ms.presets[s.preset];

            if (preset) {
                var p = preset.call(e, that);
                $.extend(settings, ss); // Update original user settings
                $.extend(s, p, settings); // Load preset settings
                $.extend(methods, p.methods); // Extend core methods
            }

            // Set private members
            m = Math.floor(s.rows / 2);
            hi = s.height;

            if (elm.data('dwro') !== undefined) {
                e.readOnly = bool(elm.data('dwro'));
            }

            if (visible) {
                that.hide();
            }

            if (s.display == 'inline') {
                that.show();
            } else {
                read();
                if (input && s.showOnFocus) {
                    // Set element readonly, save original state
                    elm.data('dwro', e.readOnly);
                    e.readOnly = true;
                    // Init show datewheel
                    elm.bind('focus.dw', function () { that.show(); });
                }
            }
        };

        that.values = null;
        that.val = null;
        that.temp = null;

        that.init(settings);
    }

    function testProps(props) {
        var i;
        for (i in props) {
            if (mod[props[i]] !== undefined) {
                return true;
            }
        }
        return false;
    }

    function testPrefix() {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            p;

        for (p in prefixes) {
            if (testProps([prefixes[p] + 'Transform'])) {
                return '-' + prefixes[p].toLowerCase();
            }
        }
        return '';
    }

    function getInst(e) {
        return scrollers[e.id];
    }

    function getY(e) {
        return e.changedTouches || (e.originalEvent && e.originalEvent.changedTouches) ? (e.originalEvent ? e.originalEvent.changedTouches[0].pageY : e.changedTouches[0].pageY) : e.pageY;

    }

    function bool(v) {
        return (v === true || v == 'true');
    }

    function calc(t, val, dir, anim, orig) {
        val = val > max ? max : val;
        val = val < min ? min : val;

        var cell = $('li', t).eq(val);

        // Set selected scroller value
        inst.temp[index] = cell.attr('data-val');

        // Validate
        inst.validate(anim ? (val == orig ? 0.1 : Math.abs((val - orig) * 0.1)) : 0, orig, index, dir);
    }

    var scrollers = {},
        timer,
        empty = function () { },
        h,
        min,
        max,
        inst, // Current instance
        date = new Date(),
        uuid = date.getTime(),
        move,
        click,
        target,
        index,
        start,
        stop,
        startTime,
        pos,
        moved,
        mod = document.createElement('modernizr').style,
        has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']),// && 'webkitPerspective' in document.documentElement.style,
        prefix = testPrefix(),
        START_EVENT = 'touchstart mousedown',
        MOVE_EVENT = 'touchmove mousemove',
        END_EVENT = 'touchend mouseup',
        defaults = {
            // Options
            width: 70,
            height: 40,
            rows: 3,
            delay: 300,
            disabled: false,
            readonly: false,
            showOnFocus: true,
            showLabel: true,
            wheels: [],
            theme: '',
            headerText: '{value}',
            display: 'modal',
            mode: 'scroller',
            preset: '',
            lang: 'en-US',
            setText: 'Set',
            cancelText: 'Cancel',
            scrollLock: true,
            // Events
            onBeforeShow: empty,
            onShow: empty,
            onClose: empty,
            onSelect: empty,
            onCancel: empty,
            onChange: empty,
            formatResult: function (d) {
                return d.join(' ');
            },
            parseValue: function (value, inst) {
                var w = inst.settings.wheels,
                    val = value.split(' '),
                    ret = [],
                    j = 0,
                    i,
                    l,
                    v;

                for (i = 0; i < w.length; i++) {
                    for (l in w[i]) {
                        if (w[i][l][val[j]] !== undefined) {
                            ret.push(val[j]);
                        } else {
                            for (v in w[i][l]) { // Select first value from wheel
                                ret.push(v);
                                break;
                            }
                        }
                        j++;
                    }
                }
                return ret;
            },
            validate: empty
        },

        methods = {
            init: function (options) {
                if (options === undefined) {
                    options = {};
                }

                return this.each(function () {
                    if (!this.id) {
                        uuid += 1;
                        this.id = 'scoller' + uuid;
                    }
                    scrollers[this.id] = new Scroller(this, options);
                });
            },
            enable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.enable();
                    }
                });
            },
            disable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.disable();
                    }
                });
            },
            isDisabled: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.settings.disabled;
                }
            },
            option: function (option, value) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        var obj = {};
                        if (typeof option === 'object') {
                            obj = option;
                        } else {
                            obj[option] = value;
                        }
                        inst.init(obj);
                    }
                });
            },
            setValue: function (d, fill, time, temp) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.temp = d;
                        inst.setValue(true, fill, time, temp);
                    }
                });
            },
            getInst: function () {
                return getInst(this[0]);
            },
            getValue: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.values;
                }
            },
            show: function () {
                var inst = getInst(this[0]);
                if (inst) {
                    return inst.show();
                }
            },
            hide: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                    }
                });
            },
            destroy: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                        $(this).unbind('.dw');
                        delete scrollers[this.id];
                        if ($(this).is('input')) {
                            this.readOnly = bool($(this).data('dwro'));
                        }
                    }
                });
            }
        };

    $(document).bind(MOVE_EVENT, function (e) {
        if (move) {
            e.preventDefault();
            stop = getY(e);
            var val = pos + (start - stop) / h;
            val = val > (max + 1) ? (max + 1) : val;
            val = val < (min - 1) ? (min - 1) : val;
            inst.scroll(target, val);
            moved = true;
        }
    });

    $(document).bind(END_EVENT, function (e) {
        if (move) {
            e.preventDefault();

            var time = new Date() - startTime,
                val = pos + (start - stop) / h,
                speed,
                dist,
                tindex,
                ttop = target.offset().top;

            val = val > (max + 1) ? (max + 1) : val;
            val = val < (min - 1) ? (min - 1) : val;

            if (time < 300) {
                speed = (stop - start) / time;
                dist = (speed * speed) / (2 * 0.0006);
                if (stop - start < 0) {
                    dist = -dist;
                }
            } else {
                dist = stop - start;
            }
            if (!dist && !moved) { // this is a "tap"
                tindex = Math.floor((stop - ttop) / h);
            } else {
                tindex = Math.round(pos - dist / h);
            }
            calc(target, tindex, 0, true, Math.round(val));
            move = false;
            target = null;
        }
        if (click) {
            clearInterval(timer);
            click = false;
        }
        $('.dwb-a').removeClass('dwb-a');
    });

    $.fn.mobiscroll = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        $.error('Unknown method');
    };

    $.mobiscroll = {
        /**
        * Set settings for all instances.
        * @param {Object} o - New default settings.
        */
        setDefaults: function (o) {
            $.extend(defaults, o);
        },
        presets: {},
        themes: {},
        i18n: {}
    };

    $.scroller = $.scroller || $.mobiscroll;
    $.fn.scroller = $.fn.scroller || $.fn.mobiscroll;

})(jQuery);
