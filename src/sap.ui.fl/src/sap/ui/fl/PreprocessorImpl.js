/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.ProcessorImpl
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/Log"
],
function(
	Component,
	Utils,
	ChangePersistenceFactory,
	Log
) {
	'use strict';

	function isCodeExt(oChange) {
		return oChange.getChangeType() === "codeExt";
	}

	function isForController (sControllerName, oChange) {
		var sSelectorControllerName = oChange.getSelector().controllerName;
		return sControllerName === sSelectorControllerName;
	}

	/**
	 * The implementation of the <code>Preprocessor</code> for the SAPUI5 flexibility services that can be hooked in the <code>View</code> life cycle.
	 *
	 * @name sap.ui.fl.PreprocessorImpl
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var PreprocessorImpl = function() {};

	/**
	 * Provides an array of extension providers. An extension provider is an object which were defined as controller extensions. These objects
	 * provides lifecycle and event handler functions of a specific controller.
	 *
	 * @param {string} sControllerName - name of the controller
	 * @param {string} sComponentId - unique id for the running controller - unique as well for manifest first
	 * @param {boolean} bAsync - flag whether <code>Promise</code> should be returned or not (async=true)
	 * @returns {Promise | Array} An empty array in case of a sync processing or a Promise with all successful loaded controller extensions
	 * @see sap.ui.controller for an overview of the available functions on controllers.
	 * @since 1.34.0
	 * @public
	 */
	PreprocessorImpl.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		if (bAsync) {
			if (!sComponentId) {
				Log.warning("No component ID for determining the anchor of the code extensions was passed.");
				//always return a promise if async
				return Promise.resolve([]);
			}

			var oComponent = Component.get(sComponentId);
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			if (!Utils.isApplication(oAppComponent.getManifestObject())) {
				//we only consider components whose type is application. Otherwise, we might send request for components that can never have changes.
				return Promise.resolve([]);
			}
			var sFlexReference = Utils.getComponentClassName(oAppComponent);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sFlexReference);
			return oChangePersistence.getChangesForComponent().then(function(aChanges) {
				var aExtensionModules = aChanges.filter(function (oChange) {
					return isCodeExt(oChange) && isForController(sControllerName, oChange);
				}).map(function (oChange) {
					return oChange.getModuleName();
				});

				return PreprocessorImpl.getExtensionModules(aExtensionModules);
			});
		}

		Log.warning("Synchronous extensions are not supported by sap.ui.fl.PreprocessorImpl");
		return [];
	};

	/**
	 * Asynchronous loading of all passed controller extensions.
	 *
	 * @param {Array} aCodeExtModuleNames - names of all controller extensions which have to be requested
	 * @returns {Promise} Promise resolved with an array with all successful loaded controller extensions
	 * @since 1.60.0
	 */
	PreprocessorImpl.getExtensionModules = function(aCodeExtModuleNames) {
		if (aCodeExtModuleNames.length === 0) {
			return Promise.resolve([]);
		}

		return new Promise(function(resolve) {
			sap.ui.require(
				aCodeExtModuleNames,
				function() {
					// arguments are not a real array. This creates one for further processing
					var aModules = Array.prototype.slice.call(arguments);
					resolve(aModules);
				},
				function(oError) {
					Log.error("Code Extension not found", oError.message);
					resolve([]);
				}
			);
		});
	};

	return PreprocessorImpl;
}, /* bExport= */true);