import Metadata from "sap/ui/base/Metadata";
import merge from "sap/base/util/merge";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import Log from "sap/base/Log";
var ControllerMetadata = function (sClassName, oClassInfo) {
    Metadata.apply(this, arguments);
    if (this.isA("sap.ui.core.mvc.ControllerExtension") && this.getParent().getClass().override) {
        this.getClass().override = this.getParent().getClass().override;
    }
};
ControllerMetadata.prototype = Object.create(Metadata.prototype);
ControllerMetadata.prototype.constructor = ControllerMetadata;
ControllerMetadata.prototype.applySettings = function (oClassInfo) {
    if (oClassInfo.override) {
        this._override = oClassInfo.override;
        delete oClassInfo.override;
    }
    Metadata.prototype.applySettings.call(this, oClassInfo);
    var oStaticInfo = oClassInfo.metadata;
    this._defaultLifecycleMethodMetadata = {
        "onInit": { "public": true, "final": false, "overrideExecution": OverrideExecution.After },
        "onExit": { "public": true, "final": false, "overrideExecution": OverrideExecution.Before },
        "onBeforeRendering": { "public": true, "final": false, "overrideExecution": OverrideExecution.Before },
        "onAfterRendering": { "public": true, "final": false, "overrideExecution": OverrideExecution.After }
    };
    var bIsExtension = this.isA("sap.ui.core.mvc.ControllerExtension");
    var rPrivateCheck = /^_/;
    var bExtendsController = this._oParent.isA("sap.ui.core.mvc.Controller");
    var bDefinesMethods = oClassInfo.metadata && oClassInfo.metadata.methods ? true : false;
    if (!bIsExtension) {
        if (bExtendsController && !bDefinesMethods) {
            rPrivateCheck = /^_|^on|^init$|^exit$/;
        }
        if (bExtendsController && bDefinesMethods) {
            merge(oStaticInfo.methods, this._defaultLifecycleMethodMetadata);
        }
    }
    if (bIsExtension || bDefinesMethods) {
        this._aPublicMethods = [];
    }
    this._mMethods = oStaticInfo.methods || {};
    for (var n in oClassInfo) {
        if (n !== "metadata" && n !== "constructor") {
            if (!n.match(rPrivateCheck)) {
                if (bExtendsController && this._oParent && this._oParent.isMethodFinal(n)) {
                    Log.error("Method: '" + n + "' of controller '" + this._oParent.getName() + "' is final and cannot be overridden by controller '" + this.getName() + "'");
                    delete this._oClass.prototype[n];
                }
                if (!(n in this._mMethods) && typeof oClassInfo[n] === "function") {
                    if (!(oClassInfo[n].getMetadata && oClassInfo[n].getMetadata().isA("sap.ui.core.mvc.ControllerExtension"))) {
                        this._mMethods[n] = { "public": true, "final": false };
                    }
                }
            }
        }
    }
    for (var m in this._mMethods) {
        if (this.isMethodPublic(m)) {
            this._aPublicMethods.push(m);
        }
    }
};
ControllerMetadata.prototype.afterApplySettings = function () {
    Metadata.prototype.afterApplySettings.call(this);
    var bIsExtension = this.isA("sap.ui.core.mvc.ControllerExtension");
    if (this._oParent) {
        var mParentMethods = this._oParent._mMethods ? this._oParent._mMethods : {};
        for (var sMethod in mParentMethods) {
            if (this._mMethods[sMethod] && !bIsExtension) {
                var bPublic = this._mMethods[sMethod].public;
                this._mMethods[sMethod] = merge({}, mParentMethods[sMethod]);
                if (bPublic !== undefined) {
                    this._mMethods[sMethod].public = bPublic;
                }
                if (!this.isMethodPublic(sMethod) && this._mMethods[sMethod].public !== mParentMethods[sMethod].public) {
                    this._aAllPublicMethods.splice(this._aAllPublicMethods.indexOf(sMethod), 1);
                }
            }
            else {
                this._mMethods[sMethod] = mParentMethods[sMethod];
            }
        }
    }
    if (this._oParent && this._oParent.isA("sap.ui.core.mvc.ControllerExtension")) {
        this._bFinal = true;
    }
};
ControllerMetadata.prototype.getNamespace = function () {
    var bIsAnonymous = this._sClassName.indexOf("anonymousExtension~") == 0;
    var sNamespace = bIsAnonymous ? this._oParent._sClassName : this._sClassName;
    return sNamespace.substr(0, sNamespace.lastIndexOf("."));
};
ControllerMetadata.prototype.isMethodFinal = function (sMethod) {
    var oMethodMetadata = this._mMethods[sMethod];
    return oMethodMetadata && oMethodMetadata.final;
};
ControllerMetadata.prototype.isMethodPublic = function (sMethod) {
    var oMethodMetadata = this._mMethods[sMethod];
    return oMethodMetadata && oMethodMetadata.public;
};
ControllerMetadata.prototype.getAllMethods = function () {
    return this._mMethods;
};
ControllerMetadata.prototype.getOverrideExecution = function (sMethod) {
    var oMethodMetadata = this._mMethods[sMethod];
    var sOverrideExecution = OverrideExecution.Instead;
    if (oMethodMetadata) {
        sOverrideExecution = oMethodMetadata.overrideExecution;
    }
    return sOverrideExecution;
};
ControllerMetadata.prototype.getOverrides = function () {
    return this._override;
};
ControllerMetadata.prototype.getStaticOverrides = function () {
    return this._staticOverride;
};
ControllerMetadata.prototype.hasOverrides = function () {
    return !!this._override || !!this._staticOverride;
};
ControllerMetadata.prototype.getLifecycleConfiguration = function () {
    return this._defaultLifecycleMethodMetadata;
};