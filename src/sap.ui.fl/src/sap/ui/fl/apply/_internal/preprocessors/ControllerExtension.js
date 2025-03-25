/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils"
], function(
	Log,
	Component,
	FlexState,
	ManifestUtils,
	Utils
) {
	"use strict";

	/**
	 * Provides the Controller Extensions to the ControllerExtensionProvider from the core
	 *
	 * @name sap.ui.fl.apply._internal.preprocessors.ControllerExtension
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.core
	 */
	var ControllerExtension = function() {};

	function isCodeExt(oChange) {
		return oChange.getChangeType() === "codeExt";
	}

	function migrateToNewSyntaxIfNecessary(sControllerName) {
		if (!sControllerName.startsWith("module:")) {
			return `module:${sControllerName.replace(/\./g, "/")}.controller`;
		}
		return sControllerName;
	}

	/**
	 * Checks if the controller name saved in the change matches the provided controller name.
	 * The syntax for the controller name changed to module syntax in 1.134, so legacy changes need
	 * to be transformed to module syntax before the check.
	 *
	 * @param {string} sControllerName - Name of the controller in module syntax
	 * @param {sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange} oChange - ControllerExtensionChange instance
	 * @returns {boolean} - Returns true if the controller name of the change matches the provided controller name
	 */
	function isForController(sControllerName, oChange) {
		var sSelectorControllerName = migrateToNewSyntaxIfNecessary(oChange.getSelector().controllerName);
		return sSelectorControllerName === migrateToNewSyntaxIfNecessary(sControllerName);
	}

	function getExtensionModules(aCodeExtModuleNames) {
		return new Promise(function(resolve) {
			sap.ui.require(
				aCodeExtModuleNames,
				function(...aArgs) {
					resolve(aArgs);
				},
				function(oError) {
					Log.error("Code Extension not found", oError.message);
					resolve([]);
				}
			);
		});
	}

	/**
	 * Provides an array of extension providers. An extension provider is an object which were defined as controller extensions.
	 * These objects provide lifecycle and event handler functions of a specific controller.
	 *
	 * @param {string} sControllerName - Name of the controller
	 * @param {string} sComponentId - Unique id for the running controller - unique as well for manifest first
	 * @param {boolean} bAsync - Flag whether <code>Promise</code> should be returned or not (async=true)
	 * @returns {Promise|Array} An empty array in case of a sync processing or a Promise with all successful loaded controller extensions
	 * @see sap.ui.core.mvc.Controller for an overview of the available functions on controllers.
	 */
	ControllerExtension.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		if (bAsync) {
			if (!sComponentId) {
				// always return a promise if async
				return Promise.resolve([]);
			}

			var oComponent = Component.getComponentById(sComponentId);
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			// In case an application of a component can not be identified, ex: FLP plugins components, return a promise of no extension
			if (!oAppComponent) {
				return Promise.resolve([]);
			}
			if (!Utils.isApplication(oAppComponent.getManifestObject())) {
				// we only consider components whose type is application
				return Promise.resolve([]);
			}
			var sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

			return FlexState.waitForInitialization(sFlexReference).then(() => {
				const aFlexObjects = FlexState.getFlexObjectsDataSelector().get({reference: sFlexReference});
				var aExtensionModules = aFlexObjects.filter(function(oChange) {
					return isCodeExt(oChange) && isForController(sControllerName, oChange);
				}).map(function(oChange) {
					return oChange.getModuleName();
				});

				return getExtensionModules(aExtensionModules);
			});
		}

		return [];
	};

	return ControllerExtension;
});
