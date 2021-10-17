import Metadata from "./Metadata";
import Log from "sap/base/Log";
var BaseObject = Metadata.createClass("sap.ui.base.Object", {
    constructor: function () {
        if (!(this instanceof BaseObject)) {
            throw Error("Cannot instantiate object: \"new\" is missing!");
        }
    }
});
BaseObject.prototype.destroy = function () {
};
BaseObject.prototype.getInterface = function () {
    var oInterface = new BaseObject._Interface(this, this.getMetadata().getAllPublicMethods());
    this.getInterface = function () {
        return oInterface;
    };
    return oInterface;
};
BaseObject.defineClass = function (sClassName, oStaticInfo, FNMetaImpl) {
    var oMetadata = new (FNMetaImpl || Metadata)(sClassName, oStaticInfo);
    var fnClass = oMetadata.getClass();
    fnClass.getMetadata = fnClass.prototype.getMetadata = function () {
        return oMetadata;
    };
    if (!oMetadata.isFinal()) {
        fnClass.extend = function (sSCName, oSCClassInfo, fnSCMetaImpl) {
            return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
        };
    }
    Log.debug("defined class '" + sClassName + "'" + (oMetadata.getParent() ? " as subclass of " + oMetadata.getParent().getName() : ""));
    return oMetadata;
};
BaseObject.prototype.isA = function (vTypeName) {
    return this.getMetadata().isA(vTypeName);
};
BaseObject.isA = function (oObject, vTypeName) {
    return oObject instanceof BaseObject && oObject.isA(vTypeName);
};
BaseObject._Interface = function (oObject, aMethods, _bReturnFacade) {
    if (!oObject) {
        return oObject;
    }
    function fCreateDelegator(oObject, sMethodName) {
        return function () {
            var tmp = oObject[sMethodName].apply(oObject, arguments);
            if (_bReturnFacade) {
                return this;
            }
            else {
                return (tmp instanceof BaseObject) ? tmp.getInterface() : tmp;
            }
        };
    }
    if (!aMethods) {
        return {};
    }
    var sMethodName;
    for (var i = 0, ml = aMethods.length; i < ml; i++) {
        sMethodName = aMethods[i];
        if (!oObject[sMethodName] || typeof oObject[sMethodName] === "function") {
            this[sMethodName] = fCreateDelegator(oObject, sMethodName);
        }
    }
};