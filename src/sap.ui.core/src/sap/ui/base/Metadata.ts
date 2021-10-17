import ObjectPath from "sap/base/util/ObjectPath";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import uniqueSort from "sap/base/util/array/uniqueSort";
var Metadata = function (sClassName, oClassInfo) {
    assert(typeof sClassName === "string" && sClassName, "Metadata: sClassName must be a non-empty string");
    assert(typeof oClassInfo === "object", "Metadata: oClassInfo must be empty or an object");
    if (!oClassInfo || typeof oClassInfo.metadata !== "object") {
        oClassInfo = {
            metadata: oClassInfo || {},
            constructor: ObjectPath.get(sClassName)
        };
        oClassInfo.metadata.__version = 1;
    }
    oClassInfo.metadata.__version = oClassInfo.metadata.__version || 2;
    if (typeof oClassInfo.constructor !== "function") {
        throw Error("constructor for class " + sClassName + " must have been declared before creating metadata for it");
    }
    this._sClassName = sClassName;
    this._oClass = oClassInfo.constructor;
    this.extend(oClassInfo);
};
Metadata.prototype.extend = function (oClassInfo) {
    this.applySettings(oClassInfo);
    this.afterApplySettings();
};
Metadata.prototype.applySettings = function (oClassInfo) {
    var that = this, oStaticInfo = oClassInfo.metadata, oPrototype;
    if (oStaticInfo.baseType) {
        var oParentClass = ObjectPath.get(oStaticInfo.baseType);
        if (typeof oParentClass !== "function") {
            Log.fatal("base class '" + oStaticInfo.baseType + "' does not exist");
        }
        if (oParentClass.getMetadata) {
            this._oParent = oParentClass.getMetadata();
            assert(oParentClass === oParentClass.getMetadata().getClass(), "Metadata: oParentClass must match the class in the parent metadata");
        }
        else {
            this._oParent = new Metadata(oStaticInfo.baseType, {});
        }
    }
    else {
        this._oParent = undefined;
    }
    this._bAbstract = !!oStaticInfo["abstract"];
    this._bFinal = !!oStaticInfo["final"];
    this._sStereotype = oStaticInfo.stereotype || (this._oParent ? this._oParent._sStereotype : "object");
    this._bDeprecated = !!oStaticInfo["deprecated"];
    this._aInterfaces = oStaticInfo.interfaces || [];
    this._aPublicMethods = oStaticInfo.publicMethods || [];
    this._bInterfacesUnique = false;
    oPrototype = this._oClass.prototype;
    for (var n in oClassInfo) {
        if (n !== "metadata" && n !== "constructor") {
            oPrototype[n] = oClassInfo[n];
            if (!n.match(/^_|^on|^init$|^exit$/)) {
                that._aPublicMethods.push(n);
            }
        }
    }
};
Metadata.prototype.afterApplySettings = function () {
    if (this._oParent) {
        this._aAllPublicMethods = this._oParent._aAllPublicMethods.concat(this._aPublicMethods);
        this._bInterfacesUnique = false;
    }
    else {
        this._aAllPublicMethods = this._aPublicMethods;
    }
};
Metadata.prototype.getStereotype = function () {
    return this._sStereotype;
};
Metadata.prototype.getName = function () {
    return this._sClassName;
};
Metadata.prototype.getClass = function () {
    return this._oClass;
};
Metadata.prototype.getParent = function () {
    return this._oParent;
};
Metadata.prototype._dedupInterfaces = function () {
    if (!this._bInterfacesUnique) {
        uniqueSort(this._aInterfaces);
        uniqueSort(this._aPublicMethods);
        uniqueSort(this._aAllPublicMethods);
        this._bInterfacesUnique = true;
    }
};
Metadata.prototype.getPublicMethods = function () {
    this._dedupInterfaces();
    return this._aPublicMethods;
};
Metadata.prototype.getAllPublicMethods = function () {
    this._dedupInterfaces();
    return this._aAllPublicMethods;
};
Metadata.prototype.getInterfaces = function () {
    this._dedupInterfaces();
    return this._aInterfaces;
};
Metadata.prototype.isInstanceOf = function (sInterface) {
    if (this._oParent) {
        if (this._oParent.isInstanceOf(sInterface)) {
            return true;
        }
    }
    var a = this._aInterfaces;
    for (var i = 0, l = a.length; i < l; i++) {
        if (a[i] === sInterface) {
            return true;
        }
    }
    return false;
};
Object.defineProperty(Metadata.prototype, "_mImplementedTypes", {
    get: function () {
        if (this === Metadata.prototype) {
            throw new Error("sap.ui.base.Metadata: The '_mImplementedTypes' property must not be accessed on the prototype");
        }
        var result = Object.create(this._oParent ? this._oParent._mImplementedTypes : null);
        result[this._sClassName] = true;
        var aInterfaces = this._aInterfaces, i = aInterfaces.length;
        while (i-- > 0) {
            if (!result[aInterfaces[i]]) {
                result[aInterfaces[i]] = true;
            }
        }
        Object.defineProperty(this, "_mImplementedTypes", {
            value: Object.freeze(result),
            writable: false,
            configurable: false
        });
        return result;
    },
    configurable: true
});
Metadata.prototype.isA = function (vTypeName) {
    var mTypes = this._mImplementedTypes;
    if (Array.isArray(vTypeName)) {
        for (var i = 0; i < vTypeName.length; i++) {
            if (vTypeName[i] in mTypes) {
                return true;
            }
        }
        return false;
    }
    return vTypeName in mTypes;
};
Metadata.prototype.isAbstract = function () {
    return this._bAbstract;
};
Metadata.prototype.isFinal = function () {
    return this._bFinal;
};
Metadata.prototype.isDeprecated = function () {
    return this._bDeprecated;
};
Metadata.prototype.addPublicMethods = function (sMethod) {
    var aNames = (sMethod instanceof Array) ? sMethod : arguments;
    Array.prototype.push.apply(this._aPublicMethods, aNames);
    Array.prototype.push.apply(this._aAllPublicMethods, aNames);
    this._bInterfacesUnique = false;
};
Metadata.createClass = function (fnBaseClass, sClassName, oClassInfo, FNMetaImpl) {
    if (typeof fnBaseClass === "string") {
        FNMetaImpl = oClassInfo;
        oClassInfo = sClassName;
        sClassName = fnBaseClass;
        fnBaseClass = null;
    }
    assert(!fnBaseClass || typeof fnBaseClass === "function");
    assert(typeof sClassName === "string" && !!sClassName);
    assert(!oClassInfo || typeof oClassInfo === "object");
    assert(!FNMetaImpl || typeof FNMetaImpl === "function");
    FNMetaImpl = FNMetaImpl || Metadata;
    if (typeof FNMetaImpl.preprocessClassInfo === "function") {
        oClassInfo = FNMetaImpl.preprocessClassInfo(oClassInfo);
    }
    oClassInfo = oClassInfo || {};
    oClassInfo.metadata = oClassInfo.metadata || {};
    if (!oClassInfo.hasOwnProperty("constructor")) {
        oClassInfo.constructor = undefined;
    }
    var fnClass = oClassInfo.constructor;
    assert(!fnClass || typeof fnClass === "function");
    if (fnBaseClass) {
        if (!fnClass) {
            if (oClassInfo.metadata.deprecated) {
                fnClass = function () {
                    Log.warning("Usage of deprecated class: " + sClassName);
                    fnBaseClass.apply(this, arguments);
                };
            }
            else {
                fnClass = function () {
                    fnBaseClass.apply(this, arguments);
                };
            }
        }
        fnClass.prototype = Object.create(fnBaseClass.prototype);
        fnClass.prototype.constructor = fnClass;
        oClassInfo.metadata.baseType = fnBaseClass.getMetadata().getName();
    }
    else {
        fnClass = fnClass || function () { };
        delete oClassInfo.metadata.baseType;
    }
    oClassInfo.constructor = fnClass;
    ObjectPath.set(sClassName, fnClass);
    var oMetadata = new FNMetaImpl(sClassName, oClassInfo);
    fnClass.getMetadata = fnClass.prototype.getMetadata = function () {
        return oMetadata;
    };
    if (!fnClass.getMetadata().isFinal()) {
        fnClass.extend = function (sSCName, oSCClassInfo, fnSCMetaImpl) {
            return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
        };
    }
    return fnClass;
};