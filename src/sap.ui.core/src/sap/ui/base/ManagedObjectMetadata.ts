import DataType from "./DataType";
import Metadata from "./Metadata";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
import ObjectPath from "sap/base/util/ObjectPath";
import escapeRegExp from "sap/base/strings/escapeRegExp";
import merge from "sap/base/util/merge";
import isPlainObject from "sap/base/util/isPlainObject";
export class ManagedObjectMetadata {
    static prototype = Object.create(Metadata.prototype);
    private static _guessSingularName = guessSingularName;
    static Kind = Kind;
    static uid = uid;
    applySettings(oClassInfo: any) {
        var that = this, oStaticInfo = oClassInfo.metadata;
        Metadata.prototype.applySettings.call(this, oClassInfo);
        function normalize(mInfoMap, FNClass) {
            var mResult = {}, sName;
            if (mInfoMap) {
                for (sName in mInfoMap) {
                    if (hasOwnProperty.call(mInfoMap, sName)) {
                        mResult[sName] = new FNClass(that, sName, mInfoMap[sName]);
                    }
                }
            }
            return mResult;
        }
        function filter(mInfoMap, bPublic) {
            var mResult = {}, sName;
            for (sName in mInfoMap) {
                if (bPublic === (mInfoMap[sName].visibility === "public")) {
                    mResult[sName] = mInfoMap[sName];
                }
            }
            return mResult;
        }
        var rLibName = /([a-z][^.]*(?:\.[a-z][^.]*)*)\./;
        function defaultLibName(sName) {
            var m = rLibName.exec(sName);
            return (m && m[1]) || "";
        }
        this._sLibraryName = oStaticInfo.library || defaultLibName(this.getName());
        this._mSpecialSettings = normalize(oStaticInfo.specialSettings, this.metaFactorySpecialSetting);
        var mAllProperties = normalize(oStaticInfo.properties, this.metaFactoryProperty);
        this._mProperties = filter(mAllProperties, true);
        this._mPrivateProperties = filter(mAllProperties, false);
        var mAllAggregations = normalize(oStaticInfo.aggregations, this.metaFactoryAggregation);
        this._mAggregations = filter(mAllAggregations, true);
        this._mPrivateAggregations = filter(mAllAggregations, false);
        this._sDefaultAggregation = oStaticInfo.defaultAggregation || null;
        this._sDefaultProperty = oStaticInfo.defaultProperty || null;
        var mAllAssociations = normalize(oStaticInfo.associations, this.metaFactoryAssociation);
        this._mAssociations = filter(mAllAssociations, true);
        this._mPrivateAssociations = filter(mAllAssociations, false);
        this._mEvents = normalize(oStaticInfo.events, this.metaFactoryEvent);
        this._oDesignTime = oClassInfo.metadata["designtime"] || oClassInfo.metadata["designTime"];
        this._sProvider = oClassInfo.metadata["provider"];
        if (oClassInfo.metadata.__version > 1) {
            this.generateAccessors();
        }
    }
    afterApplySettings(...args: any) {
        Metadata.prototype.afterApplySettings.call(this);
        var oParent = this.getParent();
        if (oParent instanceof ManagedObjectMetadata) {
            this._mAllEvents = Object.assign({}, oParent._mAllEvents, this._mEvents);
            this._mAllPrivateProperties = Object.assign({}, oParent._mAllPrivateProperties, this._mPrivateProperties);
            this._mAllProperties = Object.assign({}, oParent._mAllProperties, this._mProperties);
            this._mAllPrivateAggregations = Object.assign({}, oParent._mAllPrivateAggregations, this._mPrivateAggregations);
            this._mAllAggregations = Object.assign({}, oParent._mAllAggregations, this._mAggregations);
            this._mAllPrivateAssociations = Object.assign({}, oParent._mAllPrivateAssociations, this._mPrivateAssociations);
            this._mAllAssociations = Object.assign({}, oParent._mAllAssociations, this._mAssociations);
            this._sDefaultAggregation = this._sDefaultAggregation || oParent._sDefaultAggregation;
            this._sDefaultProperty = this._sDefaultProperty || oParent._sDefaultProperty;
            this._mAllSpecialSettings = Object.assign({}, oParent._mAllSpecialSettings, this._mSpecialSettings);
            this._sProvider = this._sProvider || oParent._sProvider;
        }
        else {
            this._mAllEvents = this._mEvents;
            this._mAllPrivateProperties = this._mPrivateProperties;
            this._mAllProperties = this._mProperties;
            this._mAllPrivateAggregations = this._mPrivateAggregations;
            this._mAllAggregations = this._mAggregations;
            this._mAllPrivateAssociations = this._mPrivateAssociations;
            this._mAllAssociations = this._mAssociations;
            this._mAllSpecialSettings = this._mSpecialSettings;
        }
    }
    getLibraryName(...args: any) {
        return this._sLibraryName;
    }
    addProperty(sName: any, oInfo: any) {
        var oProp = this._mProperties[sName] = new Property(this, sName, oInfo);
        if (!this._mAllProperties[sName]) {
            this._mAllProperties[sName] = oProp;
        }
        if (this._fnPropertyBagFactory) {
            this._fnPropertyBagFactory.prototype[sName] = oProp.getDefaultValue();
        }
    }
    hasProperty(sName: any) {
        return !!this._mAllProperties[sName];
    }
    getProperty(sName: any) {
        var oProp = this._mAllProperties[sName];
        return typeof oProp === "object" ? oProp : undefined;
    }
    getProperties(...args: any) {
        return this._mProperties;
    }
    getAllProperties(...args: any) {
        return this._mAllProperties;
    }
    getAllPrivateProperties(...args: any) {
        return this._mAllPrivateProperties;
    }
    getManagedProperty(sName: any) {
        sName = sName || this._sDefaultProperty;
        var oProp = sName ? this._mAllProperties[sName] || this._mAllPrivateProperties[sName] : undefined;
        return typeof oProp === "object" ? oProp : undefined;
    }
    getDefaultPropertyName(...args: any) {
        return this._sDefaultProperty;
    }
    getDefaultProperty(...args: any) {
        return this.getProperty(this.getDefaultPropertyName());
    }
    hasAggregation(sName: any) {
        return !!this._mAllAggregations[sName];
    }
    getAggregation(sName: any) {
        sName = sName || this._sDefaultAggregation;
        var oAggr = sName ? this._mAllAggregations[sName] : undefined;
        return typeof oAggr === "object" ? oAggr : undefined;
    }
    getAggregations(...args: any) {
        return this._mAggregations;
    }
    getAllAggregations(...args: any) {
        return this._mAllAggregations;
    }
    getAllPrivateAggregations(...args: any) {
        return this._mAllPrivateAggregations;
    }
    getManagedAggregation(sAggregationName: any) {
        sAggregationName = sAggregationName || this._sDefaultAggregation;
        var oAggr = sAggregationName ? this._mAllAggregations[sAggregationName] || this._mAllPrivateAggregations[sAggregationName] : undefined;
        return typeof oAggr === "object" ? oAggr : undefined;
    }
    getDefaultAggregationName(...args: any) {
        return this._sDefaultAggregation;
    }
    getDefaultAggregation(...args: any) {
        return this.getAggregation();
    }
    forwardAggregation(sForwardedSourceAggregation: any, mOptions: any) {
        var oAggregation = this.getAggregation(sForwardedSourceAggregation);
        if (!oAggregation) {
            throw new Error("aggregation " + sForwardedSourceAggregation + " does not exist");
        }
        if (!mOptions || !mOptions.aggregation || !(mOptions.idSuffix || mOptions.getter) || (mOptions.idSuffix && mOptions.getter)) {
            throw new Error("an 'mOptions' object with 'aggregation' property and either 'idSuffix' or 'getter' property (but not both) must be given" + " but does not exist");
        }
        if (oAggregation._oParent === this) {
            oAggregation.forwarding = mOptions;
            oAggregation._oForwarder = new AggregationForwarder(oAggregation);
        }
        else {
            oAggregation = new this.metaFactoryAggregation(this, sForwardedSourceAggregation, {
                type: oAggregation.type,
                altTypes: oAggregation.altTypes,
                multiple: oAggregation.multiple,
                singularName: oAggregation.singularName,
                bindable: oAggregation.bindable,
                deprecated: oAggregation.deprecated,
                visibility: oAggregation.visibility,
                selector: oAggregation.selector,
                forwarding: mOptions
            });
            this._mAggregations[sForwardedSourceAggregation] = this._mAllAggregations[sForwardedSourceAggregation] = oAggregation;
        }
    }
    getAggregationForwarder(sAggregationName: any) {
        var oAggregation = this._mAllAggregations[sAggregationName];
        return oAggregation ? oAggregation._oForwarder : undefined;
    }
    getDefaultPropertyName(...args: any) {
        return this._sDefaultProperty;
    }
    getDefaultProperty(...args: any) {
        return this.getProperty(this.getDefaultPropertyName());
    }
    getPropertyLikeSetting(sName: any) {
        var oProp = this._mAllProperties[sName];
        if (typeof oProp === "object") {
            return oProp;
        }
        oProp = this._mAllAggregations[sName];
        return (typeof oProp === "object" && oProp.altTypes && oProp.altTypes.length > 0) ? oProp : undefined;
    }
    hasAssociation(sName: any) {
        return !!this._mAllAssociations[sName];
    }
    getAssociation(sName: any) {
        var oAssoc = this._mAllAssociations[sName];
        return typeof oAssoc === "object" ? oAssoc : undefined;
    }
    getAssociations(...args: any) {
        return this._mAssociations;
    }
    getAllAssociations(...args: any) {
        return this._mAllAssociations;
    }
    getAllPrivateAssociations(...args: any) {
        return this._mAllPrivateAssociations;
    }
    getManagedAssociation(sName: any) {
        var oAggr = this._mAllAssociations[sName] || this._mAllPrivateAssociations[sName];
        return typeof oAggr === "object" ? oAggr : undefined;
    }
    hasEvent(sName: any) {
        return !!this._mAllEvents[sName];
    }
    getEvent(sName: any) {
        var oEvent = this._mAllEvents[sName];
        return typeof oEvent === "object" ? oEvent : undefined;
    }
    getEvents(...args: any) {
        return this._mEvents;
    }
    getAllEvents(...args: any) {
        return this._mAllEvents;
    }
    addSpecialSetting(sName: any, oInfo: any) {
        var oSS = new SpecialSetting(this, sName, oInfo);
        this._mSpecialSettings[sName] = oSS;
        if (!this._mAllSpecialSettings[sName]) {
            this._mAllSpecialSettings[sName] = oSS;
        }
    }
    hasSpecialSetting(sName: any) {
        return !!this._mAllSpecialSettings[sName];
    }
    getPropertyDefaults(...args: any) {
        var mDefaults = this._mDefaults, s;
        if (mDefaults) {
            return mDefaults;
        }
        if (this.getParent() instanceof ManagedObjectMetadata) {
            mDefaults = Object.assign({}, this.getParent().getPropertyDefaults());
        }
        else {
            mDefaults = {};
        }
        for (s in this._mProperties) {
            mDefaults[s] = this._mProperties[s].getDefaultValue();
        }
        for (s in this._mPrivateProperties) {
            mDefaults[s] = this._mPrivateProperties[s].getDefaultValue();
        }
        this._mDefaults = mDefaults;
        return mDefaults;
    }
    createPropertyBag(...args: any) {
        if (!this._fnPropertyBagFactory) {
            this._fnPropertyBagFactory = function PropertyBag() { };
            this._fnPropertyBagFactory.prototype = this.getPropertyDefaults();
        }
        return new (this._fnPropertyBagFactory)();
    }
    getJSONKeys(...args: any) {
        if (this._mJSONKeys) {
            return this._mJSONKeys;
        }
        var mAllSettings = {}, mJSONKeys = {};
        function addKeys(m) {
            var sName, oInfo, oPrevInfo;
            for (sName in m) {
                oInfo = m[sName];
                oPrevInfo = mAllSettings[sName];
                if (!oPrevInfo || oInfo._iKind < oPrevInfo._iKind) {
                    mAllSettings[sName] = mJSONKeys[sName] = oInfo;
                }
                mJSONKeys[oInfo._sUID] = oInfo;
            }
        }
        addKeys(this._mAllSpecialSettings);
        addKeys(this.getAllProperties());
        addKeys(this.getAllAggregations());
        addKeys(this.getAllAssociations());
        addKeys(this.getAllEvents());
        this._mJSONKeys = mJSONKeys;
        this._mAllSettings = mAllSettings;
        return this._mJSONKeys;
    }
    getAllSettings(...args: any) {
        if (!this._mAllSettings) {
            this.getJSONKeys();
        }
        return this._mAllSettings;
    }
    removeUnknownSettings(mSettings: any) {
        assert(mSettings == null || typeof mSettings === "object", "mSettings must be null or an object");
        if (mSettings == null) {
            return mSettings;
        }
        var mValidKeys = this.getJSONKeys(), mResult = {}, sName;
        for (sName in mSettings) {
            if (hasOwnProperty.call(mValidKeys, sName)) {
                mResult[sName] = mSettings[sName];
            }
        }
        return mResult;
    }
    generateAccessors(...args: any) {
        var proto = this.getClass().prototype, prefix = this.getName() + ".", methods = this._aPublicMethods, n;
        function add(name, fn, info) {
            if (!proto[name]) {
                proto[name] = (info && info.deprecated) ? deprecation(fn, prefix + info.name) : fn;
            }
            methods.push(name);
        }
        for (n in this._mProperties) {
            this._mProperties[n].generate(add);
        }
        for (n in this._mAggregations) {
            this._mAggregations[n].generate(add);
        }
        for (n in this._mAssociations) {
            this._mAssociations[n].generate(add);
        }
        for (n in this._mEvents) {
            this._mEvents[n].generate(add);
        }
    }
    loadDesignTime(oManagedObject: any, sScopeKey: any) {
        sScopeKey = typeof sScopeKey === "string" && sScopeKey || "default";
        var oInstanceDesigntimeLoaded = loadInstanceDesignTime(oManagedObject);
        if (!this._oDesignTimePromise) {
            var oWhenParentLoaded;
            var oParent = this.getParent();
            if (oParent instanceof ManagedObjectMetadata) {
                oWhenParentLoaded = oParent.loadDesignTime(null, sScopeKey);
            }
            else {
                oWhenParentLoaded = Promise.resolve({});
            }
            this._oDesignTimePromise = loadOwnDesignTime(this).then(function (mOwnDesignTime) {
                return oWhenParentLoaded.then(function (mParentDesignTime) {
                    return mergeDesignTime(mOwnDesignTime, mParentDesignTime, sScopeKey);
                });
            });
        }
        return Promise.all([oInstanceDesigntimeLoaded, this._oDesignTimePromise]).then(function (aData) {
            var oInstanceDesigntime = aData[0], oDesignTime = aData[1];
            return merge({}, oDesignTime, getScopeBasedDesignTime(oInstanceDesigntime || {}, sScopeKey));
        });
    }
    uid(...args: any) {
        var sId = this._sUIDToken;
        if (typeof sId !== "string") {
            sId = this.getName();
            sId = sId.slice(sId.lastIndexOf(".") + 1);
            sId = sId.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").slice(-1)[0];
            sId = this._sUIDToken = sId.replace(/([^A-Za-z0-9-_.:])|([0-9]+$)/g, "").toLowerCase();
        }
        return uid(sId);
    }
    static addAPIParentInfoBegin(oAggregatedObject: any, oParent: any, sAggregationName: any) {
        if (!oAggregatedObject) {
            return;
        }
        var oNewAPIParentInfo = { parent: oParent, aggregationName: sAggregationName };
        if (oAggregatedObject.aAPIParentInfos) {
            if (oAggregatedObject.aAPIParentInfos.forwardingCounter) {
                oAggregatedObject.aAPIParentInfos.forwardingCounter++;
            }
            else {
                delete oAggregatedObject.aAPIParentInfos;
            }
        }
        if (!oAggregatedObject.aAPIParentInfos) {
            oAggregatedObject.aAPIParentInfos = [oNewAPIParentInfo];
            oAggregatedObject.aAPIParentInfos.forwardingCounter = 1;
        }
        else {
            oAggregatedObject.aAPIParentInfos.push(oNewAPIParentInfo);
        }
    }
    static addAPIParentInfoEnd(oAggregatedObject: any) {
        oAggregatedObject && oAggregatedObject.aAPIParentInfos && oAggregatedObject.aAPIParentInfos.forwardingCounter--;
    }
    static setDesignTimeDefaultMapping(mPredefinedDesignTime: any) {
        mPredefinedDesignTimeModules = mPredefinedDesignTime;
    }
    static isGeneratedId(sId: any) {
        sUIDPrefix = sUIDPrefix || sap.ui.getCore().getConfiguration().getUIDPrefix();
        rGeneratedUID = rGeneratedUID || new RegExp("(^|-{1,3})" + escapeRegExp(sUIDPrefix));
        return rGeneratedUID.test(sId);
    }
    constructor(sClassName: any, oClassInfo: any) {
        Metadata.apply(this, arguments);
    }
}
ManagedObjectMetadata.prototype.constructor = ManagedObjectMetadata;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function capitalize(sName) {
    return sName.charAt(0).toUpperCase() + sName.slice(1);
}
var rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
var mSingular = { "children": -3, "ies": "y", "ves": "f", "oes": -2, "ses": -2, "ches": -2, "shes": -2, "xes": -2, "s": -1 };
function guessSingularName(sName) {
    return sName.replace(rPlural, function ($, sPlural) {
        var vRepl = mSingular[sPlural.toLowerCase()];
        return typeof vRepl === "string" ? vRepl : sPlural.slice(0, vRepl);
    });
}
function deprecation(fn, name) {
    return function () {
        Log.warning("Usage of deprecated feature: " + name);
        return fn.apply(this, arguments);
    };
}
function remainder(obj, info) {
    var result = null;
    for (var n in info) {
        if (hasOwnProperty.call(info, n) && typeof obj[n] === "undefined") {
            result = result || {};
            result[n] = info[n];
        }
    }
    return result;
}
var Kind = {
    SPECIAL_SETTING: -1,
    PROPERTY: 0,
    SINGLE_AGGREGATION: 1,
    MULTIPLE_AGGREGATION: 2,
    SINGLE_ASSOCIATION: 3,
    MULTIPLE_ASSOCIATION: 4,
    EVENT: 5
};
function SpecialSetting(oClass, name, info) {
    info = typeof info !== "object" ? { type: info } : info;
    this.name = name;
    this.type = info.type || "any";
    this.visibility = info.visibility || "public";
    this.defaultValue = info.defaultValue;
    this.appData = remainder(this, info);
    this._oParent = oClass;
    this._sUID = "special:" + name;
    this._iKind = Kind.SPECIAL_SETTING;
}
function Property(oClass, name, info) {
    info = typeof info !== "object" ? { type: info } : info;
    this.name = name;
    this.type = info.type || "string";
    this.group = info.group || "Misc";
    this.defaultValue = info.defaultValue !== null ? info.defaultValue : null;
    this.bindable = !!info.bindable;
    this.deprecated = !!info.deprecated || false;
    this.visibility = info.visibility || "public";
    this.byValue = info.byValue === true;
    this.selector = typeof info.selector === "string" ? info.selector : null;
    this.appData = remainder(this, info);
    this._oParent = oClass;
    this._sUID = name;
    this._iKind = Kind.PROPERTY;
    var N = capitalize(name);
    this._sMutator = "set" + N;
    this._sGetter = "get" + N;
    if (this.bindable) {
        this._sBind = "bind" + N;
        this._sUnbind = "unbind" + N;
    }
    else {
        this._sBind = this._sUnbind = undefined;
    }
    this._oType = null;
}
Property.prototype.generate = function (add) {
    var that = this, n = that.name;
    add(that._sGetter, function () { return this.getProperty(n); });
    add(that._sMutator, function (v) { this.setProperty(n, v); return this; }, that);
    if (that.bindable) {
        add(that._sBind, function (p, fn, m) { this.bindProperty(n, p, fn, m); return this; }, that);
        add(that._sUnbind, function (p) { this.unbindProperty(n, p); return this; });
    }
};
Property.prototype.getType = function () {
    if (!this._oType) {
        this._oType = DataType.getType(this.type);
    }
    return this._oType;
};
Property.prototype.getDefaultValue = function () {
    var oDefaultValue = this.defaultValue, oType;
    if (oDefaultValue === null) {
        oType = this.getType();
        if (oType instanceof DataType) {
            oDefaultValue = oType.getDefaultValue();
        }
    }
    return oDefaultValue;
};
Property.prototype.get = function (instance) {
    if (this.visibility !== "public") {
        return instance.getProperty(this.name);
    }
    return instance[this._sGetter]();
};
Property.prototype.set = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.setProperty(this.name, oValue);
    }
    return instance[this._sMutator](oValue);
};
function Aggregation(oClass, name, info) {
    info = typeof info !== "object" ? { type: info } : info;
    this.name = name;
    this.type = info.type || "sap.ui.core.Control";
    this.altTypes = Array.isArray(info.altTypes) ? info.altTypes : undefined;
    this.multiple = typeof info.multiple === "boolean" ? info.multiple : true;
    this.singularName = this.multiple ? info.singularName || guessSingularName(name) : undefined;
    this.bindable = !!info.bindable;
    this.deprecated = info.deprecated || false;
    this.visibility = info.visibility || "public";
    this.selector = info.selector || null;
    this.forwarding = info.forwarding;
    this._doesNotRequireFactory = !!info._doesNotRequireFactory;
    this.appData = remainder(this, info);
    this._oParent = oClass;
    this._sUID = "aggregation:" + name;
    this._iKind = this.multiple ? Kind.MULTIPLE_AGGREGATION : Kind.SINGLE_AGGREGATION;
    this._oForwarder = this.forwarding ? new AggregationForwarder(this) : undefined;
    var N = capitalize(name);
    this._sGetter = "get" + N;
    if (this.multiple) {
        var N1 = capitalize(this.singularName);
        this._sMutator = "add" + N1;
        this._sInsertMutator = "insert" + N1;
        this._sRemoveMutator = "remove" + N1;
        this._sRemoveAllMutator = "removeAll" + N;
        this._sIndexGetter = "indexOf" + N1;
        this._sUpdater = "update" + N;
        this._sRefresher = "refresh" + N;
    }
    else {
        this._sMutator = "set" + N;
        this._sInsertMutator = this._sRemoveMutator = this._sRemoveAllMutator = this._sIndexGetter = this._sUpdater = this._sRefresher = undefined;
    }
    this._sDestructor = "destroy" + N;
    if (this.bindable) {
        this._sBind = "bind" + N;
        this._sUnbind = "unbind" + N;
    }
    else {
        this._sBind = this._sUnbind = undefined;
    }
}
Aggregation.prototype.generate = function (add) {
    var that = this, n = that.name;
    if (!that.multiple) {
        add(that._sGetter, function () { return this.getAggregation(n); });
        add(that._sMutator, function (v) { this.setAggregation(n, v); return this; }, that);
    }
    else {
        add(that._sGetter, function () { return this.getAggregation(n, []); });
        add(that._sMutator, function (a) { this.addAggregation(n, a); return this; }, that);
        add(that._sInsertMutator, function (i, a) { this.insertAggregation(n, i, a); return this; }, that);
        add(that._sRemoveMutator, function (a) { return this.removeAggregation(n, a); });
        add(that._sRemoveAllMutator, function () { return this.removeAllAggregation(n); });
        add(that._sIndexGetter, function (a) { return this.indexOfAggregation(n, a); });
    }
    add(that._sDestructor, function () { this.destroyAggregation(n); return this; });
    if (that.bindable) {
        add(that._sBind, function (p, t, s, f) { this.bindAggregation(n, p, t, s, f); return this; }, that);
        add(that._sUnbind, function (p) { this.unbindAggregation(n, p); return this; });
    }
};
Aggregation.prototype.getType = function () {
    if (!this._oType) {
        this._oType = DataType.getType(this.type);
    }
    return this._oType;
};
Aggregation.prototype.get = function (instance) {
    if (this.visibility !== "public") {
        return instance.getAggregation(this.name, this.multiple ? [] : undefined);
    }
    return instance[this._sGetter]();
};
Aggregation.prototype.set = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.setAggregation(this.name, oValue);
    }
    return instance[this._sMutator](oValue);
};
Aggregation.prototype.add = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.addAggregation(this.name, oValue);
    }
    return instance[this._sMutator](oValue);
};
Aggregation.prototype.insert = function (instance, oValue, iPos) {
    if (this.visibility !== "public") {
        return instance.insertAggregation(this.name, oValue, iPos);
    }
    return instance[this._sInsertMutator](oValue, iPos);
};
Aggregation.prototype.remove = function (instance, vValue) {
    if (this.visibility !== "public") {
        return instance.removeAggregation(this.name, vValue);
    }
    return instance[this._sRemoveMutator](vValue);
};
Aggregation.prototype.removeAll = function (instance) {
    if (this.visibility !== "public") {
        return instance.removeAllAggregation(this.name);
    }
    return instance[this._sRemoveAllMutator]();
};
Aggregation.prototype.indexOf = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.indexOfAggregation(this.name, oValue);
    }
    return instance[this._sIndexGetter](oValue);
};
Aggregation.prototype.destroy = function (instance) {
    return instance[this._sDestructor]();
};
Aggregation.prototype.update = function (instance, sChangeReason, oEventInfo) {
    if (instance[this._sUpdater]) {
        instance[this._sUpdater](sChangeReason, oEventInfo);
    }
    else {
        instance.updateAggregation(this.name, sChangeReason, oEventInfo);
    }
};
Aggregation.prototype.refresh = function (instance, sChangeReason) {
    if (instance[this._sRefresher]) {
        instance[this._sRefresher](sChangeReason);
    }
    else {
        this.update(instance, sChangeReason);
    }
};
function AggregationForwarder(oAggregation) {
    var oForwardTo = oAggregation.forwarding;
    this.aggregation = oAggregation;
    this.targetAggregationName = oForwardTo.aggregation;
    this.forwardBinding = oForwardTo.forwardBinding;
    this.targetAggregationInfo = null;
    if (oForwardTo.getter) {
        if (typeof oForwardTo.getter === "function") {
            this._getTarget = oForwardTo.getter;
        }
        else {
            this._getTarget = (function (sGetterName) {
                return function () {
                    return this[sGetterName]();
                };
            })(oForwardTo.getter);
        }
    }
    else if (oForwardTo.idSuffix) {
        this._getTarget = (function (sIdSuffix) {
            return function () {
                return sap.ui.getCore().byId(this.getId() + sIdSuffix);
            };
        })(oForwardTo.idSuffix);
    }
    else {
        throw new Error("Either getter or idSuffix must be given for forwarding the aggregation " + oAggregation.name + " to the aggregation " + oForwardTo.aggregation + " in " + oAggregation._oParent.getName());
    }
}
AggregationForwarder.prototype._getTargetAggregationInfo = function (oTarget) {
    var oTargetAggregationInfo = this.targetAggregationInfo;
    if (!oTargetAggregationInfo && oTarget) {
        oTargetAggregationInfo = this.targetAggregationInfo = oTarget.getMetadata().getAggregation(this.targetAggregationName);
        if (!oTargetAggregationInfo) {
            throw new Error("Target aggregation " + this.targetAggregationName + " not found on " + oTarget);
        }
        if (this.aggregation.multiple && !oTargetAggregationInfo.multiple) {
            throw new Error("Aggregation " + this.aggregation + " (multiple: " + this.aggregation.multiple + ") cannot be forwarded to aggregation " + this.targetAggregationName + " (multiple: " + oTargetAggregationInfo.multiple + ")");
        }
        if (!this.aggregation.multiple && oTargetAggregationInfo.multiple && this.aggregation.forwarding.forwardBinding) {
            throw new Error("Aggregation " + this.aggregation + " (multiple: " + this.aggregation.multiple + ") cannot be forwarded to aggregation " + this.targetAggregationName + " (multiple: " + oTargetAggregationInfo.multiple + ") with 'forwardBinding' set to 'true'");
        }
    }
    return oTargetAggregationInfo;
};
AggregationForwarder.prototype.getTarget = function (oInstance, bConnectTargetInfo) {
    var oTarget = this._getTarget.call(oInstance);
    this._getTargetAggregationInfo(oTarget);
    if (oTarget) {
        oInstance.mForwardedAggregations = oInstance.mForwardedAggregations || {};
        if (oInstance.mForwardedAggregations[this.aggregation.name] === undefined || bConnectTargetInfo) {
            var vTargetAggregation = oTarget.mAggregations[this.targetAggregationInfo.name];
            if (vTargetAggregation && !bConnectTargetInfo && !this.aggregation.forwarding.forwardBinding && !(Array.isArray(vTargetAggregation) && vTargetAggregation.length === 0)) {
                throw new Error("There is already content in aggregation " + this.targetAggregationInfo.name + " of " + oTarget + " to which forwarding is being set up now.");
            }
            else {
                var vInitial = oTarget.mAggregations[this.targetAggregationInfo.name] || (this.targetAggregationInfo.multiple ? [] : null);
                oInstance.mForwardedAggregations[this.aggregation.name] = oTarget.mAggregations[this.targetAggregationInfo.name] = vInitial;
            }
        }
    }
    return oTarget;
};
AggregationForwarder.prototype.get = function (oInstance) {
    var oTarget = this.getTarget(oInstance);
    if (oTarget) {
        var result = this.targetAggregationInfo.get(oTarget);
        if (!this.aggregation.multiple && this.targetAggregationInfo.multiple) {
            result = result[0];
        }
        return result;
    }
    else {
        return this.aggregation.multiple ? [] : null;
    }
};
AggregationForwarder.prototype.indexOf = function (oInstance, oAggregatedObject) {
    var oTarget = this.getTarget(oInstance);
    return this.targetAggregationInfo.indexOf(oTarget, oAggregatedObject);
};
AggregationForwarder.prototype.set = function (oInstance, oAggregatedObject) {
    var oTarget = this.getTarget(oInstance);
    oInstance.mForwardedAggregations[this.aggregation.name] = oAggregatedObject;
    if (this.targetAggregationInfo.multiple) {
        var oPreviousElement = this.targetAggregationInfo.get(oTarget);
        if (oPreviousElement && oPreviousElement[0]) {
            if (oPreviousElement[0] === oAggregatedObject) {
                return oInstance;
            }
            this.targetAggregationInfo.removeAll(oTarget);
        }
        ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
        this.targetAggregationInfo.add(oTarget, oAggregatedObject);
    }
    else {
        ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
        this.targetAggregationInfo.set(oTarget, oAggregatedObject);
    }
    ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);
    return oInstance;
};
AggregationForwarder.prototype.add = function (oInstance, oAggregatedObject) {
    var oTarget = this.getTarget(oInstance);
    ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
    this.targetAggregationInfo.add(oTarget, oAggregatedObject);
    ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);
    return oInstance;
};
AggregationForwarder.prototype.insert = function (oInstance, oAggregatedObject, iIndex) {
    var oTarget = this.getTarget(oInstance);
    ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
    this.targetAggregationInfo.insert(oTarget, oAggregatedObject, iIndex);
    ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);
    return oInstance;
};
AggregationForwarder.prototype.remove = function (oInstance, vAggregatedObject) {
    var oTarget = this.getTarget(oInstance);
    var result = this.targetAggregationInfo.remove(oTarget, vAggregatedObject);
    if (result) {
        result.aAPIParentInfos && result.aAPIParentInfos.pop();
    }
    return result;
};
AggregationForwarder.prototype.removeAll = function (oInstance) {
    var oTarget = this.getTarget(oInstance);
    delete oInstance.mForwardedAggregations[this.aggregation.name];
    var aRemoved = this.targetAggregationInfo.removeAll(oTarget);
    for (var i = 0; i < aRemoved.length; i++) {
        if (aRemoved[i].aAPIParentInfos) {
            aRemoved[i].aAPIParentInfos.pop();
        }
    }
    return aRemoved;
};
AggregationForwarder.prototype.destroy = function (oInstance) {
    var oTarget = this.getTarget(oInstance);
    delete oInstance.mForwardedAggregations[this.aggregation.name];
    if (oTarget) {
        this.targetAggregationInfo.destroy(oTarget);
    }
    return oInstance;
};
function Association(oClass, name, info) {
    info = typeof info !== "object" ? { type: info } : info;
    this.name = name;
    this.type = info.type || "sap.ui.core.Control";
    this.multiple = info.multiple || false;
    this.singularName = this.multiple ? info.singularName || guessSingularName(name) : undefined;
    this.deprecated = info.deprecated || false;
    this.visibility = info.visibility || "public";
    this.appData = remainder(this, info);
    this._oParent = oClass;
    this._sUID = "association:" + name;
    this._iKind = this.multiple ? Kind.MULTIPLE_ASSOCIATION : Kind.SINGLE_ASSOCIATION;
    var N = capitalize(name);
    this._sGetter = "get" + N;
    if (this.multiple) {
        var N1 = capitalize(this.singularName);
        this._sMutator = "add" + N1;
        this._sRemoveMutator = "remove" + N1;
        this._sRemoveAllMutator = "removeAll" + N;
    }
    else {
        this._sMutator = "set" + N;
        this._sRemoveMutator = this._sRemoveAllMutator = undefined;
    }
}
Association.prototype.generate = function (add) {
    var that = this, n = that.name;
    if (!that.multiple) {
        add(that._sGetter, function () { return this.getAssociation(n); });
        add(that._sMutator, function (v) { this.setAssociation(n, v); return this; }, that);
    }
    else {
        add(that._sGetter, function () { return this.getAssociation(n, []); });
        add(that._sMutator, function (a) { this.addAssociation(n, a); return this; }, that);
        add(that._sRemoveMutator, function (a) { return this.removeAssociation(n, a); });
        add(that._sRemoveAllMutator, function () { return this.removeAllAssociation(n); });
        if (n !== that.singularName) {
            add("removeAll" + capitalize(that.singularName), function () {
                Log.warning("Usage of deprecated method " + that._oParent.getName() + ".prototype." + "removeAll" + capitalize(that.singularName) + "," + " use method " + that._sRemoveAllMutator + " (plural) instead.");
                return this[that._sRemoveAllMutator]();
            });
        }
    }
};
Association.prototype.getType = function () {
    if (!this._oType) {
        this._oType = DataType.getType(this.type);
    }
    return this._oType;
};
Association.prototype.get = function (instance) {
    if (this.visibility !== "public") {
        return instance.getAssociation(this.name, this.multiple ? [] : undefined);
    }
    return instance[this._sGetter]();
};
Association.prototype.set = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.setAssociation(this.name, oValue);
    }
    return instance[this._sMutator](oValue);
};
Association.prototype.add = function (instance, oValue) {
    if (this.visibility !== "public") {
        return instance.addAssociation(this.name, oValue);
    }
    return instance[this._sMutator](oValue);
};
Association.prototype.remove = function (instance, vValue) {
    if (this.visibility !== "public") {
        return instance.removeAssociation(this.name, vValue);
    }
    return instance[this._sRemoveMutator](vValue);
};
Association.prototype.removeAll = function (instance) {
    if (this.visibility !== "public") {
        return instance.removeAllAssociation(this.name);
    }
    return instance[this._sRemoveAllMutator]();
};
function Event(oClass, name, info) {
    this.name = name;
    this.allowPreventDefault = info.allowPreventDefault || false;
    this.deprecated = info.deprecated || false;
    this.visibility = "public";
    this.allowPreventDefault = !!info.allowPreventDefault;
    this.enableEventBubbling = !!info.enableEventBubbling;
    this.appData = remainder(this, info);
    this._oParent = oClass;
    this._sUID = "event:" + name;
    this._iKind = Kind.EVENT;
    var N = capitalize(name);
    this._sMutator = "attach" + N;
    this._sDetachMutator = "detach" + N;
    this._sTrigger = "fire" + N;
}
Event.prototype.generate = function (add) {
    var that = this, n = that.name, allowPreventDefault = that.allowPreventDefault, enableEventBubbling = that.enableEventBubbling;
    add(that._sMutator, function (d, f, o) { this.attachEvent(n, d, f, o); return this; }, that);
    add(that._sDetachMutator, function (f, o) { this.detachEvent(n, f, o); return this; });
    add(that._sTrigger, function (p) { return this.fireEvent(n, p, allowPreventDefault, enableEventBubbling); });
};
Event.prototype.attach = function (instance, data, fn, listener) {
    return instance[this._sMutator](data, fn, listener);
};
Event.prototype.detach = function (instance, fn, listener) {
    return instance[this._sDetachMutator](fn, listener);
};
Event.prototype.fire = function (instance, params) {
    return instance[this._sTrigger](params, this.allowPreventDefault, this.enableEventBubbling);
};
ManagedObjectMetadata.prototype.metaFactorySpecialSetting = SpecialSetting;
ManagedObjectMetadata.prototype.metaFactoryProperty = Property;
ManagedObjectMetadata.prototype.metaFactoryAggregation = Aggregation;
ManagedObjectMetadata.prototype.metaFactoryAssociation = Association;
ManagedObjectMetadata.prototype.metaFactoryEvent = Event;
function preloadDesigntimeLibrary(oMetadata) {
    var sLibrary = oMetadata.getLibraryName(), sPreload = sap.ui.getCore().getConfiguration().getPreload(), oLibrary = sap.ui.getCore().getLoadedLibraries()[sLibrary];
    if (oLibrary && oLibrary.designtime) {
        var oPromise;
        if (sPreload === "async" || sPreload === "sync") {
            oPromise = sap.ui.loader._.loadJSResourceAsync(oLibrary.designtime.replace(/\.designtime$/, "-preload.designtime.js"), true);
        }
        else {
            oPromise = Promise.resolve();
        }
        return new Promise(function (fnResolve, fnReject) {
            oPromise.then(function () {
                sap.ui.require([oLibrary.designtime], function (oLib) {
                    fnResolve(oLib);
                }, fnReject);
            });
        });
    }
    return Promise.resolve(null);
}
function loadOwnDesignTime(oMetadata) {
    if (isPlainObject(oMetadata._oDesignTime) || !oMetadata._oDesignTime) {
        return Promise.resolve(oMetadata._oDesignTime || {});
    }
    return new Promise(function (fnResolve, fnReject) {
        var sModule;
        if (typeof oMetadata._oDesignTime === "string") {
            sModule = oMetadata._oDesignTime;
        }
        else {
            sModule = oMetadata.getName().replace(/\./g, "/") + ".designtime";
        }
        preloadDesigntimeLibrary(oMetadata).then(function (oLib) {
            sap.ui.require([sModule], function (mDesignTime) {
                mDesignTime.designtimeModule = sModule;
                oMetadata._oDesignTime = mDesignTime;
                mDesignTime._oLib = oLib;
                fnResolve(mDesignTime);
            }, fnReject);
        });
    });
}
var mPredefinedDesignTimeModules = {};
function loadInstanceDesignTime(oInstance) {
    var sInstanceSpecificModule = oInstance instanceof ObjectPath.get("sap.ui.base.ManagedObject") && typeof oInstance.data === "function" && oInstance.data("sap-ui-custom-settings") && oInstance.data("sap-ui-custom-settings")["sap.ui.dt"] && oInstance.data("sap-ui-custom-settings")["sap.ui.dt"].designtime;
    if (typeof sInstanceSpecificModule === "string") {
        sInstanceSpecificModule = mPredefinedDesignTimeModules[sInstanceSpecificModule] || sInstanceSpecificModule;
        return new Promise(function (fnResolve, fnReject) {
            sap.ui.require([sInstanceSpecificModule], function (vDesignTime) {
                if (typeof vDesignTime === "function") {
                    fnResolve(vDesignTime(oInstance));
                }
                else {
                    fnResolve(vDesignTime);
                }
            }, fnReject);
        });
    }
    else {
        return Promise.resolve({});
    }
}
function getScopeBasedDesignTime(mMetadata, sScopeKey) {
    var mResult = mMetadata;
    if ("default" in mMetadata) {
        mResult = merge({}, mMetadata.default, sScopeKey !== "default" && mMetadata[sScopeKey] || null);
    }
    return mResult;
}
function mergeDesignTime(mOwnDesignTime, mParentDesignTime, sScopeKey) {
    return merge({}, getScopeBasedDesignTime(mParentDesignTime, sScopeKey), {
        templates: {
            create: null
        }
    }, getScopeBasedDesignTime(mOwnDesignTime, sScopeKey), {
        designtimeModule: mOwnDesignTime.designtimeModule || undefined,
        _oLib: mOwnDesignTime._oLib
    });
}
var mUIDCounts = {}, sUIDPrefix;
function uid(sId) {
    assert(!/[0-9]+$/.exec(sId), "AutoId Prefixes must not end with numbers");
    sId = (sUIDPrefix || (sUIDPrefix = sap.ui.getCore().getConfiguration().getUIDPrefix())) + sId;
    var iCount = mUIDCounts[sId] || 0;
    mUIDCounts[sId] = iCount + 1;
    return sId + iCount;
}
var rGeneratedUID;