import ObjectPath from "sap/base/util/ObjectPath";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import uniqueSort from "sap/base/util/array/uniqueSort";
export class Metadata {
    extend(oClassInfo: any) {
        this.applySettings(oClassInfo);
        this.afterApplySettings();
    }
    applySettings(oClassInfo: any) {
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
    }
    afterApplySettings(...args: any) {
        if (this._oParent) {
            this._aAllPublicMethods = this._oParent._aAllPublicMethods.concat(this._aPublicMethods);
            this._bInterfacesUnique = false;
        }
        else {
            this._aAllPublicMethods = this._aPublicMethods;
        }
    }
    getStereotype(...args: any) {
        return this._sStereotype;
    }
    getName(...args: any) {
        return this._sClassName;
    }
    getClass(...args: any) {
        return this._oClass;
    }
    getParent(...args: any) {
        return this._oParent;
    }
    private _dedupInterfaces(...args: any) {
        if (!this._bInterfacesUnique) {
            uniqueSort(this._aInterfaces);
            uniqueSort(this._aPublicMethods);
            uniqueSort(this._aAllPublicMethods);
            this._bInterfacesUnique = true;
        }
    }
    getPublicMethods(...args: any) {
        this._dedupInterfaces();
        return this._aPublicMethods;
    }
    getAllPublicMethods(...args: any) {
        this._dedupInterfaces();
        return this._aAllPublicMethods;
    }
    getInterfaces(...args: any) {
        this._dedupInterfaces();
        return this._aInterfaces;
    }
    isInstanceOf(sInterface: any) {
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
    }
    isA(vTypeName: any) {
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
    }
    isAbstract(...args: any) {
        return this._bAbstract;
    }
    isFinal(...args: any) {
        return this._bFinal;
    }
    isDeprecated(...args: any) {
        return this._bDeprecated;
    }
    addPublicMethods(sMethod: any) {
        var aNames = (sMethod instanceof Array) ? sMethod : arguments;
        Array.prototype.push.apply(this._aPublicMethods, aNames);
        Array.prototype.push.apply(this._aAllPublicMethods, aNames);
        this._bInterfacesUnique = false;
    }
    static createClass(fnBaseClass: any, sClassName: any, oClassInfo: any, FNMetaImpl: any) {
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
    }
    constructor(sClassName: any, oClassInfo: any) {
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
    }
}
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