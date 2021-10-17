import ObjectPath from "sap/base/util/ObjectPath";
var oNotFound = Object.create(null);
function _resolve(aParts, oRoot, mOptions) {
    var vRef, oContext;
    if (oRoot && (aParts[0] in oRoot)) {
        oContext = aParts.length > 1 ? ObjectPath.get(aParts.slice(0, -1), oRoot) : oRoot;
        vRef = oContext && oContext[aParts[aParts.length - 1]];
        if (typeof vRef === "function" && mOptions.bindContext) {
            vRef = vRef.bind(mOptions.rootContext || oContext);
        }
        return vRef;
    }
    return oNotFound;
}
var resolveReference = function (sPath, mVariables, mOptions) {
    mVariables = mVariables || {};
    mOptions = mOptions || {};
    mOptions.bindContext = mOptions.bindContext !== false;
    mOptions.bindDotContext = mOptions.bindDotContext !== false;
    var aParts = sPath.split("."), sVariable = aParts.shift() || ".", bDotCase = sVariable === ".", vRef = oNotFound;
    aParts.unshift(sVariable);
    if (mOptions.preferDotContext && !bDotCase) {
        vRef = _resolve(aParts, mVariables["."], {
            bindContext: mOptions.bindContext && mOptions.bindDotContext,
            rootContext: mVariables["."]
        });
    }
    if (vRef === oNotFound) {
        vRef = _resolve(aParts, mVariables, {
            bindContext: mOptions.bindContext && (bDotCase ? mOptions.bindDotContext : (aParts.length > 1)),
            rootContext: bDotCase ? mVariables["."] : undefined
        });
    }
    if (vRef === oNotFound) {
        vRef = ObjectPath.get(sPath);
    }
    return vRef;
};