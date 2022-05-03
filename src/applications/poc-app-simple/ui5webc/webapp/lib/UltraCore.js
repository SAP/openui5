sap.ui.define([], function() {
    sap.ui["define"]("sap/ui/model/BindingMode", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/base/BindingParser", [], function() {
        var BP = function(v) {return v;};
        BP.escape = function(v) {return v;};
        return {simpleParser: BP, complexParser: BP};
    });
    sap.ui["define"]("sap/ui/model/StaticBinding", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/CompositeBinding", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/Context", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/FormatException", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/ParseException", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/Type", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/ValidateException", [], function() { return function() {}; });

    sap.ui["define"]("sap/base/i18n/ResourceBundle", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/ValidateException", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/model/ValidateException", [], function() { return function() {}; });

    sap.ui["define"]("sap/ui/thirdparty/jquery-compat", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/thirdparty/jquery", ["sap/ui/base/Object"], function(BaseObject) {
        var jQuery = function(o) {
            if (typeof o === "function") {
                if (!document.body) {
                    document.addEventListener("DOMContentLoaded", o);
                } else {
                    setTimeout(o);
                }
            } else if (o instanceof HTMLElement) {
                return (function(element) {
                    var aO = [element];
                        aO.attr = function(key, value) {
                            if (arguments.length == 1) {
                                return element.getAttribute(key);
                            } else {
                                element.setAttribute(key, value);
                                return this;
                            }
                        };
                        aO.bind = function(eventTypes, handler) {
                            if (eventTypes) {
                                eventTypes.split(" ").forEach(function(type) {
                                    element.addEventListener(type, function(event) {
                                        handler(jQuery.Event(event));
                                    });
                                });
                            }
                        };
                        aO.children = function() {
                            return {
                                each: function() {}
                            };
                        };
                        aO.append = function(content) {
                            element.innerHTML = content;
                        };
                        aO.control = function(index) {
                            var control = element.closest("[data-sap-ui]");
                            if (control) {
                                return sap.ui.getCore().byId(control.id);
                            }
                        };
                        aO.replaceWith = function() {};
                        aO.on = function(type, fn) {
                            type.split(" ").forEach(function(t) {
                                element.addEventListener(t, function(event) {
                                    fn(jQuery.Event(event));
                                });
                            });
                            return this;
                        };
                        aO.off = function(type, fn) {
                            type.split(" ").forEach(function(t) {
                                element.remove(t, function(event) {
                                    fn(jQuery.Event(event));
                                });
                            });
                            return this;
                        };
                        aO.remove = function() {};
                        aO.css = function() {};
                        aO.get = function() {return document.body;};
                        return aO;

                }(o));
            } else if (o instanceof HTMLDocument) {
                return (function(element) {
                    return {
                        children: function() {
                            return {
                                each: function() {}
                            };
                        },
                        replaceWith: function() {},
                        on: function(type, fn) {
                            type.split(" ").forEach(t => {
                                element.addEventListener(t, function(event) {
                                    fn(jQuery.Event(event));
                                });
                            });
                            return this;
                        }
                    }
                }(o));
            } else {
                return {
                    children: function() {
                        return {
                            each: function() {}
                        };
                    },
                    replaceWith: function() {},
                    on: function() {
                        element.addEventListener(type, function(event) {
                            fn(jQuery.Event(event));
                        });
                        return this;
                    }
                }
            }
        };
        jQuery.extend = function(o1, o2, o3) {
            return Object.assign.apply(window, arguments);
        };
        jQuery.Event = function(event) {
            return {
                isPropagationStopped: function() { return false; },
                isImmediatePropagationStopped: function() { return false; },
                isImmediateHandlerPropagationStopped: function() { return false; },
                isMarked: function() { return false; },
                getMark: function() { return; },
                setMark: function() { },
                setMarked: function() { },
                target: typeof(event) === "string" ? undefined : event.target,
                type: typeof(event) === "string" ? event : event.type
            };
        };
        jQuery.event = {
            special = function() {}
        }
        jQuery.isEmptyObject = function(o) {
            return Object.keys(o).length == 0;
        }
        jQuery.Deferred = function() {
            var that = this;
            this.promise = new Promise(function(resolve, reject) {
                that.resolve = resolve;
                that.reject = reject;
            });
            this.then = function() {
                return this.promise.then.apply(this.promise, arguments);
            }.bind(this);
        };
        jQuery.ajax = function(opts) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', opts.url);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var convert = jQuery.ajaxSettings.converters["text " + opts.dataType];
                    opts.success(convert(xhr.responseText));
                }
                else {
                    opts.error(xhr.responseText);
                }
            };
            xhr.send();
        };
        jQuery.ajaxSettings = {
            converters: {
                "text xml": function(v) {
                    var parser = new DOMParser();
                    return parser.parseFromString(v,"text/xml");
                },
                "text json": function(v) {
                    return JSON.parse(v);
                },
                "text html": function(v) {
                    return v;
                }
            }
        };
        jQuery.each = function(o, fn) {
            Object.keys(o).forEach(function(v) {
                fn(v, o[v]);
            });
        }
        jQuery.fn = {};
        window.$ = window.jQuery = jQuery;
        return jQuery;
    });
    sap.ui["define"]("sap/ui/dom/jquery/Selectors", [], function() { return function() {}; });
    sap.ui["define"]("sap/ui/dom/jquery/control", [], function() { return function() {}; });

});