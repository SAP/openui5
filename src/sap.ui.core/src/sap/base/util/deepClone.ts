import isPlainObject from "./isPlainObject";
var fnDeepClone = function (src, maxDepth) {
    if (!maxDepth) {
        maxDepth = 10;
    }
    return clone(src, 0, maxDepth);
};
function clone(src, depth, maxDepth) {
    if (depth > maxDepth) {
        throw new TypeError("The structure depth of the source exceeds the maximum depth (" + maxDepth + ")");
    }
    if (src == null) {
        return src;
    }
    else if (src instanceof Date) {
        return new Date(src.getTime());
    }
    else if (Array.isArray(src)) {
        return cloneArray(src, depth, maxDepth);
    }
    else if (typeof src === "object") {
        return cloneObject(src, depth, maxDepth);
    }
    else {
        return src;
    }
}
function cloneArray(src, depth, maxDepth) {
    var aClone = [];
    for (var i = 0; i < src.length; i++) {
        aClone.push(clone(src[i], depth + 1, maxDepth));
    }
    return aClone;
}
function cloneObject(src, depth, maxDepth) {
    if (!isPlainObject(src)) {
        throw new TypeError("Cloning is only supported for plain objects");
    }
    var oClone = {};
    for (var key in src) {
        if (key === "__proto__") {
            continue;
        }
        oClone[key] = clone(src[key], depth + 1, maxDepth);
    }
    return oClone;
}