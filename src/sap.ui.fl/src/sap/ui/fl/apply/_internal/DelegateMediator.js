/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	Log,
	flUtils,
	JsControlTreeModifier
) {
	"use strict";

	/**
	 * Delegator mediator to manage default delegators.
	 *
	 * @alias sap.ui.fl.apply._internal.DelegateMediator
	 *
	 * @private
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental Since 1.80 This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 *
	 */
	var DelegateMediator = {};

	DelegateMediator._mDefaultDelegateItems = {};

	function getDefaultDelegateInfo(oControl, sModelType) {
		if (!sModelType && oControl.getModel) {
			// get the default model
			var oModel = oControl.getModel();
			if (!oModel) {
				return undefined;
			}
			sModelType = oModel.getMetadata().getName();
		}
		var mDelegateInfo = DelegateMediator._mDefaultDelegateItems[sModelType];
		if (mDelegateInfo) {
			//only return a delegate info if a default delegate is found
			return {
				name: mDelegateInfo.name,
				payload: {}, //default is empty payload
				modelType: sModelType, //only added for default delegate as this has to be stored when creating a change
				requiredLibraries: mDelegateInfo.requiredLibraries //only required for default delegates
			};
		}
	}

	function loadDelegate(oModifier, oControl, mDelegate) {
		if (!mDelegate) {
			//it is a valid case to ask for a delegate and there is none
			//a broken delegate is logged below
			return Promise.resolve();
		}
		return flUtils.requireAsync(mDelegate.name)
			.then(function (oDelegate) {
				mDelegate.instance = oDelegate;
				return mDelegate;
			})
			.catch(function(oError) {
				Log.error("Failed to load the delegate for the control " + oModifier.getId(oControl) +
					"\n" + oError.message);
			});
	}

	function validateInputParameters(oControl, oModifier) {
		return new Promise(function (resolve, reject) {
			if (!oControl) {
				reject(new Error("The control parameter is missing"));
			}
			if (!oModifier) {
				reject(new Error("The modifier parameter is missing"));
			}
			if (!oControl) {
				reject(new Error("The input control should be available"));
			}
			if (
				oModifier === JsControlTreeModifier
				&& (!oControl.isA || !oControl.isA("sap.ui.base.ManagedObject"))
			) {
				reject(new Error("The input control should be a managed object"));
			}
			return resolve();
		});
	}

	DelegateMediator.getKnownDefaultDelegateLibraries = function () {
		return ["sap.ui.comp"]; // OdataV2Delegate is defined in sap.ui.comp
	};

	/**
	 * Checks if there is already a registered delegate available for the given model type.
	 *
	 * @param {string} sModelType - Delegate model type
	 * @returns {boolean} <code>true</code> if a delegate is already registered for the model type
	 */
	DelegateMediator.isDelegateRegistered = function (sModelType) {
		return !!DelegateMediator._mDefaultDelegateItems[sModelType];
	};

	/**
	 * Register default delegate by the model type.
	 *
	 * @param {object} mPropertyBag - Property bag for default delegate
	 * @param {object} mPropertyBag.modelType - Default delegate model type
	 * @param {object} mPropertyBag.delegate - Path to default delegate
	 * @param {object} mPropertyBag.requiredLibraries - map of required libraries
	 */
	DelegateMediator.registerDefaultDelegate = function (mPropertyBag) {
		if (!(mPropertyBag.modelType && mPropertyBag.delegate)) {
			throw new Error("'modelType' and 'delegate' properties are required for registration!");
		}
		if (DelegateMediator.isDelegateRegistered(mPropertyBag.modelType)) {
			throw new Error("modelType " + mPropertyBag.modelType + "is already defined!");
		}
		DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] = {
			name: mPropertyBag.delegate,
			requiredLibraries: mPropertyBag.requiredLibraries
		};
	};

	/**
	 * Returns the delegate object for the requested control.
	 *
	 * @param {sap.ui.core.Element} oControl - Control for which the corresponding delegate should be returned
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @param {string} sModelType - Model type; required in case you passed the <code>XmlTreeModifier</code>
	 * @param {boolean} [bSupportsDefault] - Include default delegate if no instance specific delegate is available
	 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
	 */
	DelegateMediator.getDelegateForControl = function (oControl, oModifier, sModelType, bSupportsDefault) {
		return validateInputParameters(oControl, oModifier)
			.then(function () {
				return oModifier.getFlexDelegate(oControl);
			})
			.then(function (mInstanceSpecificDelegate) {
				if (mInstanceSpecificDelegate) {
					//instance specific delegate always takes over
					return mInstanceSpecificDelegate;
				}
				return bSupportsDefault && getDefaultDelegateInfo(oControl, sModelType);
			})
			.then(loadDelegate.bind(this, oModifier, oControl));
	};

	DelegateMediator.clear = function () {
		DelegateMediator._mDefaultDelegateItems = {};
	};

	return DelegateMediator;
}, /* bExport= */false);
