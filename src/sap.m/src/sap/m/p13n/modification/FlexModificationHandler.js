/*!
 * ${copyright}
 */
sap.ui.define([
    "./ModificationHandler",
    "sap/m/p13n/FlexUtil",
    "sap/m/p13n/enum/PersistenceMode",
    "sap/ui/core/Core"
], function(ModificationHandler, FlexUtil, mode, Core) {
	"use strict";

    var oFlexModificationHandler, pInitialize, pRuntimeAPI, pWriteAPI;

    var _requireFlexRuntimeAPI = function() {
        if (!pRuntimeAPI) {
            pRuntimeAPI = new Promise(function (resolve, reject) {
                sap.ui.require([
                    "sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
                ], function (FlexRuntimeInfoAPI) {
                    resolve(FlexRuntimeInfoAPI);
                }, reject);
            });
        }
        return pRuntimeAPI;
    };

    var _requireWriteAPI = function() {
        if (!pWriteAPI) {
            pWriteAPI = new Promise(function (resolve, reject) {
                sap.ui.require([
                    "sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
                ], function (ControlPersonalizationWriteAPI) {
                    resolve(ControlPersonalizationWriteAPI);
                });
            });
        }
        return pWriteAPI;
    };

    /**
	 * @class This class offers <code>sap.ui.fl</code> capabilities.
     * It should be used as the persistence layer in the {@link sap.m.p13n.Engine#register Engine#register} process.
	 *
	 * @author SAP SE
	 * @private
     * @experimental Since 1.104.
	 * @alias sap.m.p13n.modification.FlexModificationHandler
	 */
	var FlexModificationHandler = ModificationHandler.extend("sap.m.p13n.modification.FlexModificationHandler");

    FlexModificationHandler.prototype.processChanges = function(aChanges, oModificationPayload){
        var oControl = aChanges && aChanges[0] ? aChanges[0].selectorElement : undefined;

        var sInternalPersistenceMode = oModificationPayload.mode;

        /**
         * In case of 'Auto' we internally overwrite the persistence mode to use the VM
         * in case it has been provided instead of the PP
         */
        var bIsAutoGlobal = sInternalPersistenceMode === mode.Auto;
        if (bIsAutoGlobal) {
            sInternalPersistenceMode = oModificationPayload.hasVM ? "Standard" : mode.Global;
        }

        var bIsGlobal = sInternalPersistenceMode === mode.Global;

        var bIsTransient = sInternalPersistenceMode === mode.Transient;

        return this.initialize()
        .then(function(){

            var oHandleChangesPromise = FlexUtil.handleChanges(aChanges, bIsGlobal, bIsTransient);
            return bIsGlobal ? oHandleChangesPromise.then(function(aDirtyChanges){
                return FlexUtil.saveChanges(oControl, aDirtyChanges);
            }) : oHandleChangesPromise;
        });
    };

    FlexModificationHandler.prototype.waitForChanges = function(mPropertyBag, oModificationPayload){
        return this.initialize()
        .then(function(){
            return _requireFlexRuntimeAPI().then(function(FlexRuntimeInfoAPI){
                return FlexRuntimeInfoAPI.waitForChanges(mPropertyBag, oModificationPayload);
            });
        });
    };

    FlexModificationHandler.prototype.hasChanges = function(mPropertyBag, oModificationPayload){

        var sInternalPersistenceMode = oModificationPayload.mode;

        if (sInternalPersistenceMode === mode.Auto) {
            sInternalPersistenceMode = oModificationPayload.hasVM ? "Standard" : mode.Global;
        }

        return this.initialize()
        .then(function(){
            if (sInternalPersistenceMode === mode.Global) {
                return _requireFlexRuntimeAPI().then(function(FlexRuntimeInfoAPI){
                    return FlexRuntimeInfoAPI.isPersonalized({selectors: [mPropertyBag.selector]});
                });
            } else {
                return _requireWriteAPI().then(function(ControlPersonalizationWriteAPI){
                    return ControlPersonalizationWriteAPI.hasDirtyFlexObjects(mPropertyBag);
                });
            }
        });
    };

    FlexModificationHandler.prototype.reset = function(mPropertyBag, oModificationPayload){
        var sPersistenceMode = oModificationPayload.mode;

        var bIsGlobal = sPersistenceMode === mode.Global;
        var bIsAutoGlobal = !oModificationPayload.hasVM && oModificationPayload.hasPP && sPersistenceMode === mode.Auto;

        return this.initialize()
        .then(function(){
            return (bIsGlobal || bIsAutoGlobal) ? FlexUtil.reset(mPropertyBag) : FlexUtil.restore(mPropertyBag);
        });
    };

    FlexModificationHandler.prototype.isModificationSupported = function(mPropertyBag, oModificationPayload){
        return this.initialize()
        .then(function(){
            return _requireFlexRuntimeAPI().then(function(FlexRuntimeInfoAPI){
                return FlexRuntimeInfoAPI.isFlexSupported(mPropertyBag, oModificationPayload);
            });
        });
    };

    FlexModificationHandler.prototype.initialize = function() {
        if (!pInitialize) {
            pInitialize = Core.loadLibrary('sap.ui.fl', {
                async: true
            });
        }
        return pInitialize;
    };

    FlexModificationHandler.getInstance = function() {
        if (!oFlexModificationHandler){
            oFlexModificationHandler = new FlexModificationHandler();
        }
        return oFlexModificationHandler;
    };

	return FlexModificationHandler;
});