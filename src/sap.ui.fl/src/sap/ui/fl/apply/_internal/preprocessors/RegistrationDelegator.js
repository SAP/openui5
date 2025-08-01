/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator
sap.ui.define([
	"sap/ui/core/mvc/ControllerExtensionProvider",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentHooks",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor",
	"sap/ui/fl/apply/_internal/flexState/communication/FLPAboutInfo",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/ComponentLifecycleHooks",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/base/DesignTime",
	// the lower 2 are set as a callback in the "register...Processors" which are not detected as dependencies from the preload-building
	"sap/ui/fl/apply/_internal/preprocessors/ControllerExtension",
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor"
], function(
	MvcControllerExtensionProvider,
	XMLView,
	ComponentHooks,
	ExtensionPoint,
	Preprocessor,
	FLPAboutInfo,
	ManifestUtils,
	ComponentLifecycleHooks,
	DelegateMediatorAPI,
	ChangeAnnotation,
	ChangeHandlerRegistration,
	DesignTime
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
	 * @since 1.43.0
	 * @private
	 */
	var RegistrationDelegator = {};
	function registerChangesInComponent() {
		ComponentHooks.onInstanceCreated.register(ComponentLifecycleHooks.instanceCreatedHook);
	}

	function registerChangeHandlers() {
		ChangeHandlerRegistration.registerPredefinedChangeHandlers();
		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
		ChangeHandlerRegistration.registerAnnotationChangeHandler({
			changeHandler: ChangeAnnotation,
			isDefaultChangeHandler: true
		});
	}

	function registerOnModelCreated() {
		ComponentHooks.onModelCreated.register(ComponentLifecycleHooks.modelCreatedHook);
	}

	function registerLoadComponentEventHandler() {
		ComponentHooks.onComponentLoaded.register(ComponentLifecycleHooks.componentLoadedHook);
	}

	function registerExtensionProvider() {
		MvcControllerExtensionProvider.registerExtensionProvider("sap/ui/fl/apply/_internal/preprocessors/ControllerExtension");
	}

	function registerXMLPreprocessor() {
		if (XMLView.registerPreprocessor) {
			XMLView.registerPreprocessor("viewxml", "sap.ui.fl.apply._internal.preprocessors.XmlPreprocessor");
		}
	}

	function registerDescriptorChangeHandler() {
		ComponentHooks.onPreprocessManifest.register(Preprocessor.preprocessManifest);
	}

	function getExtensionPointProvider(oView) {
		if (ManifestUtils.isFlexExtensionPointHandlingEnabled(oView)) {
			return "sap/ui/fl/apply/_internal/extensionPoint/Processor";
		}
		if (DesignTime.isDesignModeEnabled()) {
			return "sap/ui/fl/write/_internal/extensionPoint/Processor";
		}
		return undefined;
	}

	function registerExtensionPointProvider() {
		ExtensionPoint.registerExtensionProvider(getExtensionPointProvider);
	}

	function registerModelSpecificReadDelegates() {
		DelegateMediatorAPI.registerReadDelegate({
			modelType: "sap.ui.model.odata.v4.ODataModel",
			delegate: "sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate"
		});
		DelegateMediatorAPI.registerReadDelegate({
			modelType: "sap.ui.model.odata.v2.ODataModel",
			delegate: "sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"
		});
		DelegateMediatorAPI.registerReadDelegate({
			modelType: "sap.ui.model.odata.ODataModel",
			delegate: "sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"
		});
	}

	function registerFLPAboutInfo() {
		FLPAboutInfo.initialize();
	}

	/**
	 * Registers everything in one call
	 *
	 * @public
	 */
	RegistrationDelegator.registerAll = function() {
		registerChangeHandlers();
		registerLoadComponentEventHandler();
		registerExtensionProvider();
		registerChangesInComponent();
		registerXMLPreprocessor();
		registerDescriptorChangeHandler();
		registerExtensionPointProvider();
		registerModelSpecificReadDelegates();
		registerOnModelCreated();
		registerFLPAboutInfo();
	};

	return RegistrationDelegator;
});
