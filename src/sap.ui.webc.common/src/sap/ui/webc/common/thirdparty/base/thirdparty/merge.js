sap.ui.define(['./_merge'], function (_merge) { 'use strict';

    var fnMerge = function () {
        var args = [
            true,
            false
        ];
        args.push.apply(args, arguments);
        return _merge.apply(null, args);
    };

    return fnMerge;

});
