/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.ProcessorImpl
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Component',
	'sap/ui/fl/Utils',
	'sap/ui/fl/ChangePersistenceFactory'
],
function(
	jQuery,
	Component,
	Utils,
	ChangePersistenceFactory
) {
	'use strict';

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
	var PreprocessorImpl = function(){
	};

	/**
	 * Provides an array of extension providers. An extension provider is an object which were defined as controller extensions. These objects
	 * provides lifecycle and event handler functions of a specific controller.
	 *
	 * @param {string} sControllerName - name of the controller
	 * @param {string} sComponentId - unique id for the running controller - unique as well for manifest first
	 * @param {boolean} bAsync - flag whether <code>Promise</code> should be returned or not (async=true)
	 * @see sap.ui.controller for an overview of the available functions on controllers.
	 * @since 1.34.0
	 * @public
	 */
	PreprocessorImpl.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		if (bAsync) {

			if (!sComponentId) {
				jQuery.sap.log.warning("No component ID for determining the anchor of the code extensions was passed.");
				//always return a promise if async
				return Promise.resolve([]);
			}

			var oComponent = sap.ui.component(sComponentId);
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			var sFlexReference = Utils.getComponentClassName(oAppComponent);
			var sAppVersion = Utils.getAppVersionFromManifest(oAppComponent.getManifest());

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sFlexReference, sAppVersion);
			return oChangePersistence.getChangesForComponent().then(function(aChanges) {
				if (!this._mPreloaded) {
					this._mPreloaded = {};
				}

				if (!this._mPreloaded[sComponentId]) {
					this.aCodeExtChanges = [];
					this._preloadExtensions(aChanges);
					this._mPreloaded[sComponentId] = true;
				}

				var aExtensionProviders = [];
				this.aCodeExtChanges.forEach(function (oChange) {
					var oChangeDefinition = oChange.getDefinition();
					if (oChangeDefinition.content && sControllerName === oChangeDefinition.selector.controllerName) {
						aExtensionProviders.push(PreprocessorImpl.getExtensionProvider(oChangeDefinition));
					}
				});

				return Promise.all(aExtensionProviders);
			}.bind(this));
		} else {
			jQuery.sap.log.warning("Synchronous extensions are not supported by sap.ui.fl.PreprocessorImpl");
			return [];
		}
	};

	/**
	 * creates an object with all the code extensions and the codeRef as a key, calls sap.ui.require.preload with that object.
	 *
	 * @param {sap.ui.fl.Change[]} aChanges array with all changes for the current component
	 */
	PreprocessorImpl.prototype._preloadExtensions = function(aChanges) {
		var oCodeExtensions = {};
		var oExtensionProvider;
		aChanges.forEach(function(oChange) {
			var sChangeType = oChange.getChangeType();
			var oContent = oChange.getContent();
			if (sChangeType === "codeExt" && oContent.code) {
				var sConvertedCodeContent = Utils.asciiToString(oContent.code);
				/*eslint-disable */
				eval("oExtensionProvider = function() {" + sConvertedCodeContent + "}");
				/*eslint-enable */
				oCodeExtensions[oContent.codeRef] = oExtensionProvider;
				this.aCodeExtChanges.push(oChange);
			}
		}.bind(this));

		if (Object.keys(oCodeExtensions).length > 0) {
			sap.ui.require.preload(oCodeExtensions);
		}
	};

	PreprocessorImpl.getExtensionProvider = function(oChangeDefinition) {
		return new Promise(function(resolve) {
			var sCodeRef = oChangeDefinition.content.codeRef;
			var sFileId = sCodeRef.substr(0, sCodeRef.lastIndexOf("."));
			sap.ui.require(
				[sFileId],
				function(oExtension) {
					resolve(oExtension);
				},
				function(oError) {
					Utils.log.error("Code Extension not found", oError.message);
					resolve({});
				}
			);
		});
	};

	return PreprocessorImpl;

}, /* bExport= */true);
