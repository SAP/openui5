sap.ui.define(['./isPlainObject'], function (isPlainObject) { 'use strict';

    var oToken = Object.create(null);
    var fnMerge = function () {
        var src, copyIsArray, copy, name, options, clone, target = arguments[2] || {}, i = 3, length = arguments.length, deep = arguments[0] || false, skipToken = arguments[1] ? undefined : oToken;
        if (typeof target !== 'object' && typeof target !== 'function') {
            target = {};
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (name === '__proto__' || target === copy) {
                        continue;
                    }
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }
                        target[name] = fnMerge(deep, arguments[1], clone, copy);
                    } else if (copy !== skipToken) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };

    return fnMerge;

});
