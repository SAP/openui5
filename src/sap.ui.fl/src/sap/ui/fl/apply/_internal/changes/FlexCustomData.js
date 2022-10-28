/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/core/CustomData" // needs to be preloaded
], function(
	FlUtils,
	Log
) {
	"use strict";

	/**
	 * Provides functionality to handle flex related CustomData
	 * A CustomData object will be added to the control with the key depending on the success of the applyChange method.
	 * Possible keys are:
	 * 	- 'sap.ui.fl.appliedChanges.<sChangeId>'
	 * 	- 'sap.ui.fl.failedChanges.js.<sChangeId>'
	 * 	- 'sap.ui.fl.failedChanges.xml.<sChangeId>'
	 * 	- 'sap.ui.fl.notApplicableChanges.<sChangeId>'
	 * The value for applied changes is the serialized revert data, for every other it's just 'true'
	 * notApplicable describes a state where the change could not be applied, but it's still fine
	 * and doesn't harm the other changes (e.g. duplicate addFields change)
	 * The CustomData is also persisted in the view cache if it's active
	 *
	 * @alias sap.ui.fl.FlexCustomData
	 * @experimental Since 1.61.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var FlexCustomData = {};
	FlexCustomData.sync = {};

	FlexCustomData.appliedChangesCustomDataKey = "sap.ui.fl.appliedChanges";
	FlexCustomData.failedChangesCustomDataKeyJs = "sap.ui.fl.failedChanges.js";
	FlexCustomData.failedChangesCustomDataKeyXml = "sap.ui.fl.failedChanges.xml";
	FlexCustomData.notApplicableChangesCustomDataKey = "sap.ui.fl.notApplicableChanges";

	/**
	 * Checks the custom data of the provided control for applied changes and returns the value or 'undefined'
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 *
	 * @returns {string|undefined} Returns the custom data or 'undefined'
	 */
	FlexCustomData.sync.getAppliedCustomDataValue = function(oControl, oChange) {
		var mCustomData = getCustomDataSync(oControl, FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey));
		return mCustomData.customDataValue;
	};

	/**
	 * Checks the custom data of the provided control for applied changes and returns the value or 'undefined'
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 *
	 * @returns {Promise<string|undefined>} Resolves the custom data or 'undefined'
	 */
	FlexCustomData.getAppliedCustomDataValue = function(oControl, oChange, oModifier) {
		return getCustomDataAsync(oControl, oModifier, FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey))
			.then(function (mCustomData) {
				return mCustomData.customDataValue;
			});
	};

	/**
	 * Checks the custom data of the provided control. If there is a custom data value it gets parsed and returned as object
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 *
	 * @returns {object|undefined} Returns the revert data from the custom data as object or 'undefined'
	 */
	FlexCustomData.sync.getParsedRevertDataFromCustomData = function(oControl, oChange) {
		var sCustomDataValue = FlexCustomData.sync.getAppliedCustomDataValue(oControl, oChange);
		try {
			return sCustomDataValue && JSON.parse(sCustomDataValue);
		} catch (oError) {
			Log.error("Could not parse revert data from custom data", sCustomDataValue);
			return undefined;
		}
	};

	/**
	 * Checks the custom data of the provided control. If there is a custom data value it gets parsed and returned as object
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 *
	 * @returns {Promise<object>|object} Returns the revert data from the custom data as object or 'undefined'. The return value is wrapped in a promise when 'xml tree modifier' is used.
	 */
	FlexCustomData.getParsedRevertDataFromCustomData = function(oControl, oChange, oModifier) {
		return FlexCustomData.getAppliedCustomDataValue(oControl, oChange, oModifier)
			.then(function (sCustomDataValue) {
				return sCustomDataValue && JSON.parse(sCustomDataValue);
			});
	};

	/**
	 * Checks the custom data of the provided control and returns 'true' if the notApplicable, applied or failed change key is there
	 * Synchronous execution
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 *
	 * @returns {boolean} Resolves <code>true</code> if the custom data is there.
	 */
	FlexCustomData.sync.hasChangeApplyFinishedCustomData = function (oControl, oChange) {
		var aCustomData = FlUtils.getAggregation(oControl, "customData") || [];
		var aCustomDataKeys = [
			FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey),
			FlexCustomData._getCustomDataKey(oChange, FlexCustomData.failedChangesCustomDataKeyJs),
			FlexCustomData._getCustomDataKey(oChange, FlexCustomData.notApplicableChangesCustomDataKey)
		];
		return aCustomData.some(function (oCustomData) {
			var sKey = FlUtils.getProperty(oCustomData, "key");
			if (aCustomDataKeys.indexOf(sKey) > -1) {
				return !!FlUtils.getProperty(oCustomData, "value");
			}
			return false;
		});
	};

	/**
	 * Checks the custom data of the provided control and returns 'true' if the notApplicable, applied or failed change key is there
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 *
	 * @returns {Promise<boolean>} Resolves <code>true</code> if the custom data is there.
	 */
	FlexCustomData.hasChangeApplyFinishedCustomData = function(oControl, oChange, oModifier) {
		return Promise.resolve()
			.then(oModifier.getAggregation.bind(oModifier, oControl, "customData"))
			.then(function (aCustomData) {
				aCustomData = aCustomData || [];
				var aCustomDataKeys = [
					FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey),
					FlexCustomData._getCustomDataKey(oChange, FlexCustomData.failedChangesCustomDataKeyJs),
					FlexCustomData._getCustomDataKey(oChange, FlexCustomData.notApplicableChangesCustomDataKey)
				];
				return Promise.all(aCustomData.map(function(oCustomData) {
					return Promise.resolve()
						.then(oModifier.getProperty.bind(oModifier, oCustomData, "key"))
						.then(function (sKey) {
							if (aCustomDataKeys.indexOf(sKey) > -1) {
								return oModifier.getProperty(oCustomData, "value");
							}
							return undefined;
						})
						.then(function (sValue) {
							return !!sValue;
						});
				})).then(function (aValues) {
					return aValues.includes(true);
				});
			});
	};

	function getCustomValueData(bSaveRevertData, oChange) {
		var vRevertData = oChange.getRevertData();
		if (bSaveRevertData && vRevertData !== undefined) {
			return JSON.stringify(vRevertData);
		}
		return "true";
	}

	/**
	 * Adds applied custom data to the control. Depending on whether the change is revertible,
	 * the value of the custom data is either the revert data of the change (stringified and '{' and '}' escaped) or simply 'true'
	 *
	 * @param {sap.ui.core.Control} oControl The control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 * @param {object} mPropertyBag The propertyBag
	 * @param {object} mPropertyBag.view The view to process
	 * @param {object} mPropertyBag.modifier The polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor The app descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent The component instance that is currently loading
	 * @param {boolean} bSaveRevertData 'true' if the revert data should be saved as value
	 * @returns {Promise} resolves when custom data is written
	 */
	FlexCustomData.addAppliedCustomData = function(oControl, oChange, mPropertyBag, bSaveRevertData) {
		var sCustomDataValue = getCustomValueData(bSaveRevertData, oChange);
		var sCustomDataKey = FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey);
		return writeCustomDataAsync(oControl, sCustomDataKey, sCustomDataValue, mPropertyBag);
	};

	/**
	 * Adds failed custom data to the control. The value is just 'true'
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange The change instance
	 * @param {object} mPropertyBag The propertyBag
	 * @param {object} mPropertyBag.view The view to process
	 * @param {object} mPropertyBag.modifier The polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor The app descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent The component instance that is currently loading
	 * @param {string} sIdentifier Identifies which custom data key has to be used
	 * @returns {Promise} resolves when custom data is written
	 */
	FlexCustomData.addFailedCustomData = function(oControl, oChange, mPropertyBag, sIdentifier) {
		var sCustomDataKey = FlexCustomData._getCustomDataKey(oChange, sIdentifier);
		return writeCustomDataAsync(oControl, sCustomDataKey, "true", mPropertyBag);
	};

	/**
	 * Destroys the applied custom data for the given control
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change instance
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 */
	FlexCustomData.sync.destroyAppliedCustomData = function(oControl, oChange, oModifier) {
		var sKey = FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey);
		var mCustomData = getCustomDataSync(oControl, sKey);
		if (mCustomData.customData) {
			oModifier.destroy(mCustomData.customData);
		}
	};

	/**
	 * Destroys the applied custom data for the given control
	 *
	 * @param {sap.ui.core.Control} oControl The Control that should be checked
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change instance
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier The control tree modifier
	 * @return {Promise} resolves when the applied custom data is destroyed
	 */
	FlexCustomData.destroyAppliedCustomData = function(oControl, oChange, oModifier) {
		var sKey = FlexCustomData._getCustomDataKey(oChange, FlexCustomData.appliedChangesCustomDataKey);
		return getCustomDataAsync(oControl, oModifier, sKey)
			.then(function (mCustomData) {
				if (mCustomData.customData) {
					oModifier.destroy(mCustomData.customData);
				}
			});
	};

	/**
	 * Returns the identifier indicating which custom data key has to be used depending on the success, the error and the modifier.
	 * The correct key is determined like this:
	 * 	1. if bSuccess is true: FlexCustomData.appliedChangesCustomDataKey
	 * 	2. if bError is false: FlexCustomData.notApplicableChangesCustomDataKey
	 * 	3. if bXmlModifier is true: FlexCustomData.failedChangesCustomDataKeyXml
	 * 	4. FlexCustomData.failedChangesCustomDataKeyJs
	 *
	 * @param {boolean} bSuccess 'true' if the change has been applied successfully
	 * @param {boolean} bError 'true' if the change has thrown an error
	 * @param {boolean} bXmlModifier 'true' if the change has been applied in XML
	 *
	 * @returns {string} Returns the correct identifier as a string
	 */
	FlexCustomData.getCustomDataIdentifier = function(bSuccess, bError, bXmlModifier) {
		if (bSuccess) {
			return FlexCustomData.appliedChangesCustomDataKey;
		}
		if (!bError) {
			return FlexCustomData.notApplicableChangesCustomDataKey;
		}
		if (bXmlModifier) {
			return FlexCustomData.failedChangesCustomDataKeyXml;
		}
		return FlexCustomData.failedChangesCustomDataKeyJs;
	};

	/**
	 * Creates the Custom Data key by combining the identifier and the change ID.
	 * Also used in tests.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change Instance
	 * @param {string} sIdentifier - Identifier of the Custom Data that should be written
	 * @returns {string} Returns the key for the Custom Data
	 */
	FlexCustomData._getCustomDataKey = function(oChange, sIdentifier) {
		return sIdentifier + "." + oChange.getId();
	};

	function writeCustomDataAsync(oControl, sKey, sValue, mPropertyBag) {
		return getCustomDataAsync(oControl, mPropertyBag.modifier, sKey)
			.then(function (mCustomData) {
				if (!mCustomData.customData) {
					return mPropertyBag.modifier.createAndAddCustomData(oControl, sKey, sValue, mPropertyBag.appComponent);
				}
				return mPropertyBag.modifier.setProperty(mCustomData.customData, "value", sValue);
			});
	}

	function getCustomDataSync(oControl, sCustomDataKey) {
		var aCustomData = FlUtils.getAggregation(oControl, "customData") || [];
		var oReturn = {};
		aCustomData.some(function (oCustomData) {
			var sKey = FlUtils.getProperty(oCustomData, "key");
			if (sKey === sCustomDataKey) {
				oReturn.customData = oCustomData;
				oReturn.customDataValue = FlUtils.getProperty(oCustomData, "value");
				return true;
			}
			return false;
		});
		return oReturn;
	}

	function getCustomDataAsync(oControl, oModifier, sCustomDataKey) {
		return Promise.resolve()
			.then(oModifier.getAggregation.bind(oModifier, oControl, "customData"))
			.then(function (aCustomData) {
				aCustomData = aCustomData || [];
				var oReturn = {};
				return aCustomData.reduce(function (oPreviousPromise, oCustomData) {
					return oPreviousPromise
						.then(oModifier.getProperty.bind(oModifier, oCustomData, "key"))
						.then(function (sKey) {
							if (sKey === sCustomDataKey) {
								oReturn.customData = oCustomData;
								return oModifier.getProperty(oCustomData, "value");
							}
							return undefined;
						})
						.then(function (oCustomDataValue) {
							if (oCustomDataValue) {
								oReturn.customDataValue = oCustomDataValue;
							}
						});
				}, Promise.resolve())
				.then(function () {
					return oReturn;
				});
			});
	}

	return FlexCustomData;
}, /* bExport= */true);
