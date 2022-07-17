/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/modification/ModificationHandler"
], function(Modificationhandler) {
	"use strict";

	var oLocalStorageModificationHandler;
	var mInitialState = new WeakMap();

	/**
	 * @class This class offers <code>localStorage</code> capabilities.
     * It should be used as the persistence layer in the {@link sap.m.p13n.Engine#register Engine#register} process.
	 *
	 * @author SAP SE
	 * @public
     * @experimental Since 1.104.
	 * @alias sap.m.p13n.modification.LocalStorageModificationHandler
	 */
	var LocalStorageModificationHandler = Modificationhandler.extend("sap.m.p13n.modification.LocalStorageModificationHandler");

	LocalStorageModificationHandler.prototype.processChanges = function(aChanges, oModificationPayload){
        var pAppliance = Modificationhandler.prototype.processChanges.apply(this, arguments);
        var oControl = aChanges && aChanges[0] ? aChanges[0].selectorElement : undefined;

        return pAppliance.then(function(){
            return sap.m.p13n.Engine.getInstance().retrieveState(oControl)
            .then(function(oState){
                localStorage.setItem("$p13n.Engine.data--" + oControl.getId(), JSON.stringify(oState));
            });
        });
	};

	LocalStorageModificationHandler.prototype.initialize = function(oControl) {
        var oInitialState = JSON.parse(localStorage.getItem("$p13n.Engine.data--" + oControl.getId()));
		var pInitial;
		if (!oInitialState) {
			pInitial = sap.m.p13n.Engine.getInstance().retrieveState(oControl)
			.then(function(oRetrievedState){
				oInitialState = oRetrievedState;
			});
		} else {
			pInitial = sap.m.p13n.Engine.getInstance().applyState(oControl, oInitialState, true);
		}

		mInitialState.set(oControl, oInitialState);
		return pInitial;
	};

    LocalStorageModificationHandler.prototype.waitForChanges = function(mPropertyBag, oModificationPayload) {
        return Promise.resolve();
	};

	LocalStorageModificationHandler.prototype.reset = function(mPropertyBag, oModificationPayload) {
		var oControl = mPropertyBag.selector;
		localStorage.removeItem("$p13n.Engine.data--" + oControl.getId());
		return sap.m.p13n.Engine.getInstance().applyState(oControl, mInitialState.get(oControl), true);
	};

	LocalStorageModificationHandler.prototype.isModificationSupported = function(mPropertyBag, oModificationPayload){
		return false;
	};

	LocalStorageModificationHandler.getInstance = function() {
		if (!oLocalStorageModificationHandler){
			oLocalStorageModificationHandler = new LocalStorageModificationHandler();
		}
		return oLocalStorageModificationHandler;
	};

	return LocalStorageModificationHandler;
});