/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/modification/ModificationHandler",
	"sap/m/p13n/Engine"
], (Modificationhandler, Engine) => {
	"use strict";

	let oLocalStorageModificationHandler;
	const mInitialState = new WeakMap();

	/**
	 * @class This class offers <code>localStorage</code> persistence capabilities.
	 * It should be used as the persistence layer in the {@link sap.m.p13n.Engine#register Engine#register} process.
	 *
	 * @author SAP SE
	 * @private
	 * @alias sap.m.p13n.modification.LocalStorageModificationHandler
	 */
	const LocalStorageModificationHandler = Modificationhandler.extend("sap.m.p13n.modification.LocalStorageModificationHandler");

	LocalStorageModificationHandler.prototype.processChanges = function(aChanges, oModificationPayload) {
		const pAppliance = Modificationhandler.prototype.processChanges.apply(this, arguments);
		const oControl = aChanges && aChanges[0] ? aChanges[0].selectorElement : undefined;

		return pAppliance.then(() => {
			return Engine.getInstance().retrieveState(oControl)
				.then((oState) => {
					localStorage.setItem("$p13n.Engine.data--" + oControl.getId(), JSON.stringify(oState));
				});
		});
	};

	LocalStorageModificationHandler.prototype.initialize = (oControl) => {
		let oInitialState = JSON.parse(localStorage.getItem("$p13n.Engine.data--" + oControl.getId()));
		let pInitial;
		if (!oInitialState) {
			pInitial = Engine.getInstance().retrieveState(oControl)
				.then((oRetrievedState) => {
					oInitialState = oRetrievedState;
				});
		} else {
			pInitial = Engine.getInstance().applyState(oControl, oInitialState, true);
		}

		mInitialState.set(oControl, oInitialState);
		return pInitial;
	};

	LocalStorageModificationHandler.prototype.waitForChanges = (mPropertyBag, oModificationPayload) => {
		return Promise.resolve();
	};

	LocalStorageModificationHandler.prototype.reset = (mPropertyBag, oModificationPayload) => {
		const oControl = mPropertyBag.selector;
		localStorage.removeItem("$p13n.Engine.data--" + oControl.getId());
		return Engine.getInstance().applyState(oControl, mInitialState.get(oControl), true);
	};

	LocalStorageModificationHandler.prototype.isModificationSupported = (mPropertyBag, oModificationPayload) => {
		return false;
	};

	LocalStorageModificationHandler.getInstance = () => {
		if (!oLocalStorageModificationHandler) {
			oLocalStorageModificationHandler = new LocalStorageModificationHandler();
		}
		return oLocalStorageModificationHandler;
	};

	return LocalStorageModificationHandler;
});