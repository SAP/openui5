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
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/EventHistory",
	"sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor",
	// the lower 2 are set as a callback in the "register...Processors" which are not detected as dependencies from the preload-building
	"sap/ui/fl/PreprocessorImpl",
	"sap/ui/fl/XmlPreprocessorImpl"
], function(
	FlexControllerFactory,
	Component,
	ChangeHandlerRegistration,
	ChangePersistenceFactory,
	MvcController,
	XMLView,
	ExtensionPoint,
	EventHistory,
	Preprocessor
) {
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


	function _registerChangesInComponent() {
		Component._fnOnInstanceCreated = FlexControllerFactory.getChangesAndPropagate;
	}


	function _registerChangeHandlers() {
		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
	}

	function _registerLoadComponentEventHandler() {
		Component._fnLoadComponentCallback = ChangePersistenceFactory._onLoadComponent.bind(ChangePersistenceFactory);
	}

	function _registerExtensionProvider() {
		MvcController.registerExtensionProvider("sap.ui.fl.PreprocessorImpl");
	}

	function _registerXMLPreprocessor() {
		if (XMLView.registerPreprocessor) {
			XMLView.registerPreprocessor("viewxml", "sap.ui.fl.XmlPreprocessorImpl", true);
		}
	}

	function _registerEventListener() {
		EventHistory.start();
	}

	function _registerDescriptorChangeHandler() {
		Component._fnPreprocessManifest = Preprocessor.preprocessManifest;
	}

	function _registerExtensionPointProvider() {
		ExtensionPoint.registerExtensionProvider("sap/ui/fl/apply/_internal/extensionPoint/Processor");
	}

	/**
	 * Registers everything in one call
	 *
	 * @public
	 */
	RegistrationDelegator.registerAll = function() {
		_registerEventListener();
		_registerChangeHandlers();
		_registerLoadComponentEventHandler();
		_registerExtensionProvider();
		_registerChangesInComponent();
		_registerXMLPreprocessor();
		_registerDescriptorChangeHandler();
		_registerExtensionPointProvider();
	};

	return RegistrationDelegator;
}, /* bExport= */true);
