/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/EventHistory",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/core/Configuration",
	// the lower 2 are set as a callback in the "register...Processors" which are not detected as dependencies from the preload-building
	"sap/ui/fl/apply/_internal/preprocessors/ControllerExtension",
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor"
], function(
	MvcController,
	XMLView,
	Component,
	ExtensionPoint,
	Preprocessor,
	ManifestUtils,
	EventHistory,
	DelegateMediator,
	DelegateMadiatorAPI,
	ChangeHandlerRegistration,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Configuration
) {
	"use strict";

	/**
	 * This class takes care of all the registration (hooks) needed to run flex!
	 *
	 * @name sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.43.0
	 */
	var RegistrationDelegator = {};


	function registerChangesInComponent() {
		Component._fnOnInstanceCreated = FlexControllerFactory.getChangesAndPropagate;
	}

	function registerChangeHandlers() {
		ChangeHandlerRegistration.registerPredefinedChangeHandlers();
		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
	}

	function registerLoadComponentEventHandler() {
		Component._fnLoadComponentCallback = ChangePersistenceFactory._onLoadComponent.bind(ChangePersistenceFactory);
	}

	function registerExtensionProvider() {
		MvcController.registerExtensionProvider("sap/ui/fl/apply/_internal/preprocessors/ControllerExtension");
	}

	function registerXMLPreprocessor() {
		if (XMLView.registerPreprocessor) {
			XMLView.registerPreprocessor("viewxml", "sap.ui.fl.apply._internal.preprocessors.XmlPreprocessor", true);
		}
	}

	function registerEventListener() {
		EventHistory.start();
	}

	function registerDescriptorChangeHandler() {
		Component._fnPreprocessManifest = Preprocessor.preprocessManifest;
	}

	function getExtensionPointProvider(oView) {
		if (ManifestUtils.isFlexExtensionPointHandlingEnabled(oView)) {
			return "sap/ui/fl/apply/_internal/extensionPoint/Processor";
		}
		if (Configuration.getDesignMode()) {
			return "sap/ui/fl/write/_internal/extensionPoint/Processor";
		}
		return undefined;
	}

	function registerExtensionPointProvider() {
		ExtensionPoint.registerExtensionProvider(getExtensionPointProvider);
	}

	function registerDefaultDelegate() {
		DelegateMadiatorAPI.registerDefaultDelegate({
			modelType: "sap.ui.model.odata.v4.ODataModel",
			delegate: "sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate",
			delegateType: DelegateMediator.types.READONLY
		});
	}

	/**
	 * Registers everything in one call
	 *
	 * @public
	 */
	RegistrationDelegator.registerAll = function() {
		registerEventListener();
		registerChangeHandlers();
		registerLoadComponentEventHandler();
		registerExtensionProvider();
		registerChangesInComponent();
		registerXMLPreprocessor();
		registerDescriptorChangeHandler();
		registerExtensionPointProvider();
		registerDefaultDelegate();
	};

	return RegistrationDelegator;
});
