/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/util/loadModules",
	"sap/ui/mdc/p13n/Engine"
], function(loadModules, Engine) {
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

	/*
	* Hack to prevent invalidation/rendering until all changes are applied. This seems to be needed now because our change handlers are now async and
	* get executed once micro-task execution starts and can lead to other JS event loop tasks being executed after every promise resolution. If we
	* add the item synchronously (as was done before), this is not observed as we run to completion with change application before continuing to
	* other tasks in the JS event loop (e.g. rendering). The change has to be async as consumers (mainly FE) want to use the same fragment-based mechanism
	* mechanism to apply changes. One might also have to wait for some metadata to be loaded and then continue with application of such changes.
	* @TODO: As this is a generic issue on applying multiple changes, we need a mechanism (preferably in Core/FL) to be able to prevent invalidation
	* while such processing (mainly application of flex changes on a control is taking place). This is NOT an issue during normal JS handling and can
	* also happen for other controls where execution is async and multiple changes are applied.
	*/
	function delayInvalidate(oControl) {
		if (oControl && oControl.isInvalidateSuppressed && !oControl.isInvalidateSuppressed()) {
			oControl.iSuppressInvalidate = 1;
			Engine.getInstance().waitForChanges(oControl).then(function() {
				oControl.iSuppressInvalidate = 0;
				oControl.invalidate("InvalidationSuppressedByMDCFlex");
			});
		}
	}

	function fConfigModified(oControl) {
        if (!oControl._bWaitForModificationChanges && oControl.isA) {
            oControl._bWaitForModificationChanges = true;
            Engine.getInstance().waitForChanges(oControl).then(function() {
                if (oControl._onModifications instanceof Function) {
                    oControl._onModifications();
                }
                delete oControl._bWaitForModificationChanges;
            });
        }
	}

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
					delayInvalidate(oControl);
					return fApply(oChange, oControl, mPropertyBag, Util.APPLY)
					.then(function(){
						fConfigModified(oControl);
					});
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					if (fComplete) {
						fComplete(oChange, mChangeSpecificInfo, mPropertyBag);
					}
				},
				revertChange: function(oChange, oControl, mPropertyBag) {
					delayInvalidate(oControl);
					return fRevert(oChange, oControl, mPropertyBag, Util.REVERT)
					.then(function(){
						fConfigModified(oControl);
					});
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
