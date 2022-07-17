/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/CAPAccess",
	"sap/base/util/UriParameters",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Utils"
], function(
	ABAPAccess,
	CAPAccess,
	UriParameters,
	ManagedObject,
	FlUtils
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle <code>FieldExtensibility</code>.
	 *
	 * @namespace sap.ui.fl.write.api.FieldExtensibility
	 * @since 1.87
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */

	var FieldExtensibility = {};

	var _oCurrentScenario;

	function getImplementationForCurrentScenario(oControl) {
		if (!_oCurrentScenario) {
			if (!(oControl instanceof ManagedObject)) {
				return undefined;
			}
			var oAppComponent = FlUtils.getAppComponentForControl(oControl);
			var oManifestConfig = (oAppComponent && oAppComponent.getManifestEntry("/sap.ui5/config")) || {};
			var oUriParams = UriParameters.fromQuery(window.location.search);
			if (
				oManifestConfig.experimentalCAPScenario
				|| oUriParams.get("sap-ui-fl-xx-capScenario") === "true"
			) {
				_oCurrentScenario = CAPAccess;
			} else {
				_oCurrentScenario = ABAPAccess;
			}
		}
		return _oCurrentScenario;
	}

	function callFunctionInImplementation() {
		var aArgs = Array.from(arguments);
		var sFunctionName = aArgs.shift();
		var oImplementation = getImplementationForCurrentScenario.apply(null, aArgs);
		if (!oImplementation) {
			return Promise.reject("Could not determine field extensibility scenario");
		}
		return Promise.resolve(oImplementation[sFunctionName].apply(null, aArgs));
	}

	/**
	 * This function will be called as soon as a control was selected via the UI.
	 * Until this function is called again the control does not change and information can be cached.
	 *
	 * @param {sap.ui.base.ManagedObject} oControl - Control instance that was selected
	 * @returns {Promise} Resolves with the return value of the function in the implementation
	 */
	FieldExtensibility.onControlSelected = function(oControl) {
		return callFunctionInImplementation("onControlSelected", oControl);
	};

	/**
	 * Checks if extensibility is enabled for the current app.
	 *
	 * @param {sap.ui.base.ManagedObject} oControl - Control to get the component from
	 * @returns {Promise<boolean>} Resolves with <code>true</code> if the system is extensibility enabled, <code>false</code> otherwise
	 */
	FieldExtensibility.isExtensibilityEnabled = function(oControl) {
		return callFunctionInImplementation("isExtensibilityEnabled", oControl);
	};

	/**
	 * Checks if the service is up to date with the service in the back end.
	 *
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @returns {Promise<boolean>} Resolves with <code>true</code> if the service is outdated, <code>false</code> otherwise
	 */
	FieldExtensibility.isServiceOutdated = function(vServiceInfo) {
		return callFunctionInImplementation("isServiceOutdated", vServiceInfo);
	};

	/**
	 * Removes the flag that identifies the service as outdated.
	 *
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @returns {Promise} Resolves with the return value of the function in the implementation
	 */
	FieldExtensibility.setServiceValid = function(vServiceInfo) {
		return callFunctionInImplementation("setServiceValid", vServiceInfo);
	};

	/**
	 * Retrieves the necessary texts.
	 *
	 * @returns {Promise<object>} - Object with <code>tooltip</code> and <code>headerText</code>
	 */
	FieldExtensibility.getTexts = function() {
		return callFunctionInImplementation("getTexts");
	};

	/**
	 * Retrieves the extension data.
	 *
	 * @returns {Promise<object>} All necessary information about the extension data. This will be passed to <code>FieldExtensibility.onTriggerCreateExtensionData</code>
	 */
	FieldExtensibility.getExtensionData = function() {
		// TODO: currently the return value must be an object that includes .BusinessContexts in order to be shown in the Dialog.
		// Will be changed in a follow up
		return callFunctionInImplementation("getExtensionData");
	};

	/**
	 * Handler for the button to trigger extension data creation.
	 *
	 * @param {object} oExtensibilityInfo - Information about the extension data. Should be the return value of <code>FieldExtensibility.getExtensionData</code>
	 * @param {string} sRtaStyleClassName - CSS style class that should be added to any dialogs
	 * @returns {Promise} Resolves with the return value of the function in the implementation
	 */
	FieldExtensibility.onTriggerCreateExtensionData = function(oExtensibilityInfo, sRtaStyleClassName) {
		return callFunctionInImplementation("onTriggerCreateExtensionData", oExtensibilityInfo, sRtaStyleClassName);
	};

	// Resets the current scenario for testing purposes
	FieldExtensibility._resetCurrentScenario = function() {
		_oCurrentScenario = null;
	};

	return FieldExtensibility;
});