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
	 * Delegator Mediator to manage default delegators.
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
		if (!sModelType) {
			// get the default model
			var oModel = oControl.getModel();
			if (!oModel) {
				return undefined;
			}
			sModelType = oModel.getMetadata().getName();
		}
		return {
			name: DelegateMediator._mDefaultDelegateItems[sModelType]
		};
	}

	function loadDelegate(oModifier, oControl, mDelegate) {
		if (!mDelegate) {
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

	/**
	 * Checks if there is already a registered delegate available for the given model type.
	 *
	 * @param {string} sModelType - delegate model type
	 * @returns {boolean} <true> if a delegate is already registered for the modelType
	 */
	DelegateMediator.isDelegateRegistered = function (sModelType) {
		return !!DelegateMediator._mDefaultDelegateItems[sModelType];
	};

	/**
	 * Register default delegate by the model type.
	 *
	 * @param {object} mPropertyBag - Property bag for default delegate
	 * @param {object} mPropertyBag.modelType - default delegate model type
	 * @param {object} mPropertyBag.delegate - path to default delegate
	 */
	DelegateMediator.registerDefaultDelegate = function (mPropertyBag) {
		if (!(mPropertyBag.modelType && mPropertyBag.delegate)) {
			throw new Error("'modelType' and 'delegate' properties are required for registration!");
		}
		if (DelegateMediator.isDelegateRegistered(mPropertyBag.modelType)) {
			throw new Error("modelType " + mPropertyBag.modelType + "is already defined!");
		}
		DelegateMediator._mDefaultDelegateItems[mPropertyBag.modelType] = mPropertyBag.delegate;
	};

	/**
	 * Returns the delegate object for the requested control.
	 *
	 * @param {sap.ui.core.Element} oControl - The control for which the corresponding delegate should be returned
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - The control tree modifier
	 * @param {string} sModelType - The model type is required in case you passed the XmlTreeModifier
	 * @returns {Promise.<object>} Returns the delegate information including the lazy loaded instance of the delegate
	 */
	DelegateMediator.getDelegateForControl = function (oControl, oModifier, sModelType) {
		return validateInputParameters(oControl, oModifier)
			.then(function () {
				return oModifier.getFlexDelegate(oControl);
			})
			.then(function (mInstancespecificDelegate) {
				return mInstancespecificDelegate || getDefaultDelegateInfo(oControl, sModelType);
			})
			.then(loadDelegate.bind(this, oModifier, oControl));
	};

	DelegateMediator.clear = function () {
		DelegateMediator._mDefaultDelegateItems = {};
	};

	return DelegateMediator;
}, /* bExport= */false);
