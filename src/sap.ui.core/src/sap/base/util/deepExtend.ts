import _merge from "./_merge";
var fnDeepExtend = function () {
    var args = [true, true];
    args.push.apply(args, arguments);
    return _merge.apply(null, args);
};