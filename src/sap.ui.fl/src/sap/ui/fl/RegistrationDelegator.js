/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.RegistrationDelegator
sap.ui.define([
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/core/Component",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/EventHistory"
], function(FlexControllerFactory, Component, ChangeHandlerRegistration, ChangePersistenceFactory, MvcController, XMLView, EventHistory) {
	"use strict";

	/**
	 * This class takes care of all the registration (hooks) needed to run flex!
	 *
	 * @name sap.ui.fl.RegistrationDelegator
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.43.0
	 */
	var RegistrationDelegator = {
	};

	/**
	 * Registers the changes in the component
	 *
	 * @public
	 */
	RegistrationDelegator.registerChangesInComponent = function() {
		Component._fnOnInstanceCreated = FlexControllerFactory.getChangesAndPropagate;
	};

	/**
	 * Registers change handlers
	 *
	 * @public
	 */
	RegistrationDelegator.registerChangeHandlers = function() {
		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
	};

	/**
	 * Register the event handler
	 *
	 * @public
	 */
	RegistrationDelegator.registerLoadComponentEventHandler = function() {
		Component._fnLoadComponentCallback = ChangePersistenceFactory._onLoadComponent.bind(ChangePersistenceFactory);
	};

	/**
	 * Registers the extension provider
	 *
	 * @public
	 */
	RegistrationDelegator.registerExtensionProvider = function() {
		MvcController.registerExtensionProvider("sap.ui.fl.PreprocessorImpl");
	};

	/**
	 * Registers the xml preprocessor
	 *
	 * @public
	 */
	RegistrationDelegator.registerXMLPreprocessor = function() {
		if (XMLView.registerPreprocessor){
			XMLView.registerPreprocessor("viewxml", "sap.ui.fl.XmlPreprocessorImpl", true);
		}
	};

	/**
	 * Registers the event listener
	 *
	 * @public
	 */
	RegistrationDelegator.registerEventListener = function() {
		EventHistory.start();
	};

	/**
	 * Registers everything in one call
	 *
	 * @public
	 */
	RegistrationDelegator.registerAll = function() {
		RegistrationDelegator.registerEventListener();
		RegistrationDelegator.registerChangeHandlers();
		RegistrationDelegator.registerLoadComponentEventHandler();
		RegistrationDelegator.registerExtensionProvider();
		RegistrationDelegator.registerChangesInComponent();
		RegistrationDelegator.registerXMLPreprocessor();
	};

	return RegistrationDelegator;

}, /* bExport= */true);
