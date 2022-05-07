/*
* ! ${copyright}
*/
sap.ui.define([
	"sap/ui/mdc/util/loadModules"
], function(loadModules) {
	"use strict";

	/**
	 * Utility functionality for mdc flexibility changehandlers.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/flexibility/Util
	 * @since 1.101
	 * @private
	 */
	var Util = {};

	Util.APPLY = "apply";
	Util.REVERT = "revert";

	/**
	 * Creates a changehandler object for mdc controls.
	 * The changehandler will also call the <code>onAfterXMLChangeProcessing</code> hook on the control's delegate
	 * in case it's available.
	 *
	 * @param {object} mSettings An object defining the changehandler settings
	 * @param {function} mSettings.apply The changehandler applyChange function
	 * @param {function} mSettings.revert The changehandler applyChange function
	 * @param {function} [mSettings.complete] The changehandler applyChange function
	 *
	 * @returns {object} A Changehandler object
	 */
	Util.createChangeHandler = function(mSettings) {

		var fApply = mSettings.apply instanceof Function && mSettings.apply;
		var fRevert = mSettings.revert instanceof Function && mSettings.revert;
		var fComplete = mSettings.complete instanceof Function && mSettings.complete;

		if (!fApply || !fRevert) {
			throw new Error("Please provide atleast an apply and revert function!");
		}

		return {
			"changeHandler": {
				applyChange: function(oChange, oControl, mPropertyBag) {
					return fApply(oChange, oControl, mPropertyBag, Util.APPLY);
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					if (fComplete) {
						fComplete(oChange, mChangeSpecificInfo, mPropertyBag);
					}
				},
				revertChange: function(oChange, oControl, mPropertyBag) {
					return fRevert(oChange, oControl, mPropertyBag, Util.REVERT);
				},
				onAfterXMLChangeProcessing: function(oControl, mPropertyBag) {
					mPropertyBag.modifier.getProperty(oControl, "delegate")
					.then(function(oDelegate){
						loadModules(oDelegate.name)
						.then(function(aModules){
							var oDelegate = aModules[0];

							if (oDelegate.onAfterXMLChangeProcessing instanceof Function) {
								oDelegate.onAfterXMLChangeProcessing(oControl, mPropertyBag);
							}

						});
					});
				}
			},
			"layers": {
				"USER": true
			}
		};
	};

	return Util;
});
