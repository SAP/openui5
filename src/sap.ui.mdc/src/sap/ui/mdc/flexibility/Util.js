/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/util/loadModules", "sap/m/p13n/Engine", "sap/base/Log"
], (loadModules, Engine, SAPLog) => {
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
	const Util = {};

	Util.APPLY = "apply";
	Util.REVERT = "revert";

	/**
	 * Whenever a set of changes is going to be applied to a control instance, the flex change processing
	 * will trigger invalidation through generic setters/getters by manipulating the controls aggregations
	 * and properties (such as adding columns, changing widths, setting filter values, ...) since there is no
	 * generic handling in place that ensures that invalidation/rendering is only happening once, it needs
	 * to be ensured that flickeruing and invalidation is deferred/suppressed until all pending changes have been
	 * applied. UIArea#suppressInvalidationFor has been designed to suppress the invalidation for a given control
	 * instance by retrieving its UIArea that its located in and to trigger all pending changes done on resuming
	 * the invalidation for the provided control. This process will also include the controls children in case
	 * invalidation has been triggerd for any nested elements. The suppress/resume needs to be balanced, hence
	 * it should always be suppressed/resumed for a control instance once.
	 *
	 * @param {sap.ui.mdc.Control} oControl
	 */
	function suppressInvalidation(oControl) {
		const oUIArea = oControl && oControl.getUIArea && oControl.getUIArea();
		if (oUIArea && !oControl._bInvalidationSuppressed) {
			oControl._bInvalidationSuppressed = oUIArea.suppressInvalidationFor(oControl);
		}
	}

	/**
	 * Resume for invalidation suppressed controls. This will also reset/remove the _bInvalidationSuppressed flag.
	 *
	 * @param {sap.ui.mdc.Control} oControl
	 */
	function resumeInvalidation(oControl) {
		const oUIArea = oControl && oControl.getUIArea && oControl.getUIArea();
		if (oUIArea && oControl._bInvalidationSuppressed) {
			oUIArea.resumeInvalidationFor(oControl);
			delete oControl._bInvalidationSuppressed;
		}
	}

	function fConfigModified(oControl, oChange) {

		if (oControl.isA) {
			Engine.getInstance().trace(oControl, {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: oChange.getChangeType(),
					content: oChange.getContent()
				}
			});

			if (!oControl._pPendingModification && oControl._onModifications instanceof Function) {
				oControl._pPendingModification = Engine.getInstance().waitForChanges(oControl).then(async () => {
					const aAffectedControllerKeys = Engine.getInstance().getTrace(oControl);
					Engine.getInstance().clearTrace(oControl);
					delete oControl._pPendingModification;
					Engine.getInstance().fireStateChange(oControl);
					await oControl._onModifications(aAffectedControllerKeys);
					resumeInvalidation(oControl);
				}).catch((oError) => {
					SAPLog.error(`Error during mdc flex handling: ${oError}`);
					resumeInvalidation(oControl);
				});
			}
		}
	}

	/**
	 * Loads the corresponding module.
	 *
	 * @param {string} sModulePath Path of the modul to be loaded
	 * @returns {Promise<object>} Resolves with the runtime representation of the modul
	 */
	Util.getModule = function(sModulePath) {
		return new Promise((fResolveLoad, fRejectLoad) => {
				sap.ui.require([
					sModulePath
				], fResolveLoad, fRejectLoad);
			})
			.then((Module) => {
				return Module;
			});
	};

	/**
	 * For a given text key the corresponding language dependent text is returned from the mdc-resour
	 *
	 * @param {string} sKey Text identifier
	 * @param {array} aArgs array of arguments to enhance the resulting text
	 * @returns {Promise<string>} Resolves with a translated text
	 */
	Util.getMdcResourceText = function(sKey, aArgs) {
		return Util.getModule("sap/ui/core/Lib").then((Library) => {
			return Library.getResourceBundleFor("sap.ui.mdc").getText(sKey, aArgs);
		});
	};

	/**
	 * Creates a changehandler object for mdc controls.
	 * The changehandler will also call the <code>onAfterXMLChangeProcessing</code> hook on the control's delegate
	 * in case it's available.
	 *
	 * @param {object} mSettings An object defining the changehandler settings
	 * @param {(function(oChange, oControl, mPropertyBag): Promise)} mSettings.apply The changehandler applyChange function
	 * @param {(function(oChange, oControl, mPropertyBag): Promise)} mSettings.revert The changehandler revertChange function
	 * @param {(function(oChange, mChangeSpecificInfo, mPropertyBag): Promise)} [mSettings.complete] The changehandler completeChangeContent function
	 * @param {(function(oChange, mPropertyBag): Promise)} [mSettings.getCondenserInfo] The changehandler condenser info
	 *
	 * @returns {object} A Changehandler object
	 */
	Util.createChangeHandler = function(mSettings) {

		const fApply = mSettings.apply instanceof Function && mSettings.apply;
		const fRevert = mSettings.revert instanceof Function && mSettings.revert;
		const fComplete = mSettings.complete instanceof Function && mSettings.complete;

		if (!fApply || !fRevert) {
			throw new Error("Please provide atleast an apply and revert function!");
		}

		return {
			"changeHandler": {
				applyChange: function(oChange, oControl, mPropertyBag) {
					suppressInvalidation(oControl);
					return fApply(oChange, oControl, mPropertyBag, Util.APPLY)
						.then(() => {
							fConfigModified(oControl, oChange);
						});
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					if (fComplete) {
						fComplete(oChange, mChangeSpecificInfo, mPropertyBag);
					}
				},
				revertChange: function(oChange, oControl, mPropertyBag) {
					suppressInvalidation(oControl);
					return fRevert(oChange, oControl, mPropertyBag, Util.REVERT)
						.then(() => {
							fConfigModified(oControl, oChange);
						});
				},
				onAfterXMLChangeProcessing: function(oControl, mPropertyBag) {
					return mPropertyBag.modifier.getProperty(oControl, "delegate")
						.then((oDelegate) => {
							if (oDelegate) {
								return loadModules(oDelegate.name)
									.then((aModules) => {
										const oDelegate = aModules[0];

										if (oDelegate.onAfterXMLChangeProcessing instanceof Function) {
											oDelegate.onAfterXMLChangeProcessing(oControl, mPropertyBag);
										}

									});
							}
						});
				},
				getCondenserInfo: mSettings.getCondenserInfo,
				getChangeVisualizationInfo: mSettings.getChangeVisualizationInfo
			},
			"layers": {
				"USER": true
			}
		};
	};

	return Util;
});