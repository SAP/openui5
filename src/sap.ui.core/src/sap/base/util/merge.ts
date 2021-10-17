import _merge from "./_merge";
var fnMerge = function () {
    var args = [true, false];
    args.push.apply(args, arguments);
    return _merge.apply(null, args);
};