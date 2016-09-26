/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.ProcessorImpl
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Component', 'sap/ui/fl/FlexControllerFactory', 'sap/ui/fl/Utils', 'sap/ui/fl/LrepConnector', 'sap/ui/fl/ChangePersistenceFactory'
], function(jQuery, Component, FlexControllerFactory, Utils, LrepConnector, ChangePersistenceFactory) {
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
				return [];
			}

			var oComponent = sap.ui.component(sComponentId);
			var sFlexReference = Utils.getAppComponentClassNameForComponent(oComponent);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sFlexReference);
			return oChangePersistence.getChangesForComponent(LrepConnector.createConnector(), sFlexReference, undefined).then(function(oChanges) {

				var aExtensionProviders = [];

				jQuery.each(oChanges, function (index, oChange) {
					var oChangeDefinition = oChange.getDefinition();
					if (oChangeDefinition.changeType === "codeExt" && oChangeDefinition.content && sControllerName === oChangeDefinition.selector.id) {
						aExtensionProviders.push(PreprocessorImpl.getExtensionProvider(oChangeDefinition));
					}
				});

				return aExtensionProviders;
			});
		}
	};

	PreprocessorImpl.getExtensionProvider = function(oChange) {
		var sConvertedAsciiCodeContent = oChange.content.code || {};
		var sConvertedCodeContent = Utils.asciiToString(sConvertedAsciiCodeContent);
		var oExtensionProvider;
		/*eslint-disable */
		eval("oExtensionProvider = " + sConvertedCodeContent);
		/*eslint-enable */

		return oExtensionProvider;
	};

	/**
	 * Asynchronous view processing method.
	 *
	 * @param {sap.ui.core.mvc.View} oView view to process
	 * @param {object} mProperties
	 * @param {string} mProperties.componentId ID of the application component
	 * @returns {jquery.sap.promise} result of the processing, promise if executed asynchronously
	 *
	 * @public
	 */
	 PreprocessorImpl.process = function(oView, mProperties){
		 try {

			 var oComponent = sap.ui.getCore().getComponent(mProperties.componentId);

			 if (!oComponent) {
				 Utils.log.warning("View is generated without an component. Flexibility features are not possible.");
				 return Promise.resolve(oView);
			 }

			 var sFlexReference = Utils.getComponentClassName(oComponent);
			 var oFlexController = FlexControllerFactory.create(sFlexReference);
			 return oFlexController.processView(oView).then(function() {
				 jQuery.sap.log.debug("flex processing view " + oView.getId() + " finished");
				 return oView;
			 });
		 } catch (error) {
			 var sError = "view " + oView.getId() + ": " + error;
			 jQuery.sap.log.info(sError); //to allow control usage in applications that do not work with UI flex and components
			 // throw new Error(sError); // throw again, when caller handles the promise
			 return Promise.resolve(oView);
		 }
	 };

	 return PreprocessorImpl;

}, /* bExport= */true);
