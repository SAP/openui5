/*
* ! ${copyright}
*/
sap.ui.define([
    "./ModificationHandler",
    "sap/m/p13n/FlexUtil",
    "sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
    "sap/m/p13n/enum/PersistenceMode"
], function(ModificationHandler, FlexUtil, FlexRuntimeInfoAPI, mode) {
	"use strict";

    var oFlexModificationHandler;


    /**
	 * @class This class offers <code>sap.ui.fl</code> capabilities.
     * It should be used as the persistence layer in the {@link sap.m.p13n.Engine#register Engine#register}process.
	 *
	 * @author SAP SE
	 * @public
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

    FlexModificationHandler.prototype.initialize = function(oControl) {
        return sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		})
		.then(function() {
            return this.waitForChanges({
                element: oControl
            });
        }.bind(this))
        .then(function(){
            sap.m.p13n.Engine.getInstance().fireStateChange(oControl);
        });
    };

    FlexModificationHandler.getInstance = function() {
        if (!oFlexModificationHandler){
            oFlexModificationHandler = new FlexModificationHandler();
        }
        return oFlexModificationHandler;
    };

	return FlexModificationHandler;
});