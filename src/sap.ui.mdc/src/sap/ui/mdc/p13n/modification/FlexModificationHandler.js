/*
* ! ${copyright}
*/
sap.ui.define([
    "./ModificationHandler",
    "sap/ui/mdc/p13n/FlexUtil",
    "sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
    "sap/ui/mdc/enum/PersistenceMode"
], function(ModificationHandler, FlexUtil, FlexRuntimeInfoAPI, mode) {
	"use strict";

    var oFlexModificationHandler;


    /**
	 *  @class Flex specific modification handler implementation
	 *
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.87.0
	 * @alias sap.ui.mdc.p13n.modification.FlexModificationHandler
	 */
	var FlexModificationHandler = ModificationHandler.extend("sap.ui.mdc.p13n.modification.FlexModificationHandler");

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
        var oHandleChangesPromise = FlexUtil.handleChanges.call(this, aChanges, bIsGlobal, bIsTransient);
        return bIsGlobal ? oHandleChangesPromise.then(function(aDirtyChanges){
            return FlexUtil.saveChanges.call(this, oControl, aDirtyChanges);
        }) : oHandleChangesPromise;
    };

    FlexModificationHandler.prototype.waitForChanges = function(mPropertyBag, oModificationPayload){
        return FlexRuntimeInfoAPI.waitForChanges.apply(this, arguments);
    };

    FlexModificationHandler.prototype.reset = function(mPropertyBag, oModificationPayload){
        var sPersistenceMode = oModificationPayload.mode;

        var bIsGlobal = sPersistenceMode === mode.Global;
        var bIsAutoGlobal = !oModificationPayload.hasVM && oModificationPayload.hasPP && sPersistenceMode === mode.Auto;

        return (bIsGlobal || bIsAutoGlobal) ? FlexUtil.reset.call(this, mPropertyBag) : FlexUtil.restore.call(this, mPropertyBag);
    };

    FlexModificationHandler.prototype.isModificationSupported = function(mPropertyBag, oModificationPayload){
        return FlexRuntimeInfoAPI.isFlexSupported.apply(this, arguments);
    };

    FlexModificationHandler.getInstance = function() {
        if (!oFlexModificationHandler){
            oFlexModificationHandler = new FlexModificationHandler();
        }
        return oFlexModificationHandler;
    };

	return FlexModificationHandler;
});