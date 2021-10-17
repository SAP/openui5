import _merge from "./_merge";
var fnExtend = function () {
    var args = [false, true];
    args.push.apply(args, arguments);
    return _merge.apply(null, args);
};