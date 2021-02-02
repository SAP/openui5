/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/Access"
], function(
	Access
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
	// we can add parameters here, but the assumption is that this is not dependent on a single control
	function getImplementationForCurrentScenario() {
		if (!_oCurrentScenario) {
			// currently there is only one case, but here would be the differentiation between the scenarios (CAP, ABAP, ...)
			_oCurrentScenario = Access;
		}
		return _oCurrentScenario;
	}

	function callFunctionInImplementation(sFunctionName, vArgs) {
		var oImplementation = getImplementationForCurrentScenario();
		return Promise.resolve(oImplementation[sFunctionName](vArgs));
	}

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
	 * @param {string} sServiceUrl - Service URL
	 * @returns {Promise<boolean>} Resolves with <code>true</code> if the service is outdated, <code>false</code> otherwise
	 */
	FieldExtensibility.isServiceOutdated = function(sServiceUrl) {
		return callFunctionInImplementation("isServiceOutdated", sServiceUrl);
	};

	/**
	 * Removes the flag that identifies the service as outdated.
	 *
	 * @param {string} sServiceUrl - Service URL
	 */
	FieldExtensibility.setServiceValid = function(sServiceUrl) {
		callFunctionInImplementation("setServiceValid", sServiceUrl);
	};

	/**
	 * Retrieves the necessary texts.
	 *
	 * @returns {object} - Object with <code>tooltip</code> and <code>headerText</code>
	 */
	FieldExtensibility.getTexts = function() {
		return callFunctionInImplementation("getTexts");
	};

	/**
	 * Retrieves the extension data for a given control.
	 *
	 * @param {sap.ui.base.ManagedObject} oControl - Control to get the extension data from
	 * @returns {Object} All necessary information about the extension data. This will be passed to <code>FieldExtensibility.onTriggerCreateExtensionData</code>
	 */
	FieldExtensibility.getExtensionData = function(oControl) {
		// TODO: currently the return value must be an object that includes .BusinessContexts in order to be shown in the Dialog.
		// Will be changed in a follow up
		return callFunctionInImplementation("getExtensionData", oControl);
	};

	/**
	 * Handler for the button to trigger extension data creation.
	 *
	 * @param {object} oExtensibilityInfo - Information about the extension data. Should be the return value of <code>FieldExtensibility.getExtensionData</code>
	 */
	FieldExtensibility.onTriggerCreateExtensionData = function(oExtensibilityInfo) {
		callFunctionInImplementation("onTriggerCreateExtensionData", oExtensibilityInfo);
	};

	return FieldExtensibility;
});