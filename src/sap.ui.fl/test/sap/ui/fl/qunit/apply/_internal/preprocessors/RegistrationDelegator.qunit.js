/* global QUnit */

sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentHooks",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/flexState/communication/FLPAboutInfo",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/thirdparty/sinon-4"
], function(
	DesignTime,
	MvcController,
	XMLView,
	ComponentHooks,
	ExtensionPoint,
	FLPAboutInfo,
	ManifestUtils,
	RegistrationDelegator,
	DelegateMediator,
	DelegateMediatorAPI,
	ChangeAnnotation,
	ChangeHandlerRegistration,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function deregisterAllComponentHooks() {
		ComponentHooks.onInstanceCreated.deregister();
		ComponentHooks.onComponentLoaded.deregister();
		ComponentHooks.onPreprocessManifest.deregister();
		ComponentHooks.onModelCreated.deregister();
	}

	QUnit.module("sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator", {
		afterEach() {
			deregisterAllComponentHooks();
			sandbox.restore();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("Check if all the registration functions were called", function(assert) {
			const oRegisterAllSpy = sandbox.spy(RegistrationDelegator, "registerAll");

			const oRegisterChangeHandlersForLibraryStub = sandbox.stub(
				ChangeHandlerRegistration,
				"getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs"
			);
			const oRegisterPredefinedChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerPredefinedChangeHandlers");
			const oRegisterAnnotationChangeHandlerStub = sandbox.stub(ChangeHandlerRegistration, "registerAnnotationChangeHandler");

			const oRegisterExtensionProviderStub = sandbox.stub(MvcController, "registerExtensionProvider");
			const oRegisterXMLPreprocessorStub = sandbox.stub(XMLView, "registerPreprocessor");
			const oRegisterExtensionPointProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			const oRegisterReadDelegateStub = sandbox.stub(DelegateMediatorAPI, "registerReadDelegate");
			const oRegisterFLPAboutInfoStub = sandbox.stub(FLPAboutInfo, "initialize");

			const fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterAllSpy.callCount, 1, "register all was called once");

				assert.ok(ComponentHooks.onInstanceCreated.isRegistered(), "register changes in component is registered.");
				assert.equal(oRegisterChangeHandlersForLibraryStub.callCount, 1, "Register Change Handlers called.");
				assert.equal(oRegisterPredefinedChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.strictEqual(oRegisterAnnotationChangeHandlerStub.callCount, 1, "Annotation change handler called once.");
				assert.deepEqual(oRegisterAnnotationChangeHandlerStub.getCall(0).args[0], {
					changeHandler: ChangeAnnotation,
					isDefaultChangeHandler: true
				}, "Annotation change handler registered for ODataModel v2");
				assert.ok(ComponentHooks.onComponentLoaded.isRegistered(), "load component event handler is registered.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1, "Extension provider called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1, "XML preprocessor called.");
				assert.equal(oRegisterExtensionPointProviderStub.callCount, 1, "ExtensionPoint called.");
				assert.equal(oRegisterReadDelegateStub.callCount, 3, "delegate registration is called.");
				assert.ok(ComponentHooks.onPreprocessManifest.isRegistered());
				assert.ok(oRegisterFLPAboutInfoStub.callCount, 1, "FLPAboutInfo registration is called.");
				fnDone();
			});
		});
	});

	const sWriteProcessorPath = "sap/ui/fl/write/_internal/extensionPoint/Processor";
	const sApplyProcessorPath = "sap/ui/fl/apply/_internal/extensionPoint/Processor";

	QUnit.module("sap.ui.fl.RegistrationDelegator getExtensionPointProvider function", {
		beforeEach() {
			const oRegisterExtensionProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			RegistrationDelegator.registerAll();
			[this.fnExtensionProvider] = oRegisterExtensionProviderStub.firstCall.args;
		},
		afterEach() {
			deregisterAllComponentHooks();
			sandbox.restore();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("When extension point handling is disabled", function(assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			assert.notOk(this.fnExtensionProvider({}), "then 'undefined' is returned");
		});

		QUnit.test("When extension point handling is disabled and design mode (adaptation project) is enabled", function(assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			sandbox.stub(DesignTime, "isDesignModeEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sWriteProcessorPath, "then the base processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled", function(assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled and design mode (adaptation project) is enabled", function(assert) {
			sandbox.stub(DesignTime, "isDesignModeEnabled").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});
	});

	QUnit.module("sap.ui.fl.RegistrationDelegator 'registerModelSpecificReadDelegates' function", {
		afterEach() {
			deregisterAllComponentHooks();
			sandbox.restore();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("When 'registerModelSpecificReadDelegates' is called", function(assert) {
			const oRegisterReadDelegateStub = sandbox.stub(DelegateMediatorAPI, "registerReadDelegate");
			RegistrationDelegator.registerAll();
			assert.strictEqual(
				oRegisterReadDelegateStub.getCall(0).args[0].modelType,
				"sap.ui.model.odata.v4.ODataModel",
				"then the model type is 'sap.ui.model.odata.v4.ODataModel'"
			);
			assert.strictEqual(
				oRegisterReadDelegateStub.getCall(1).args[0].modelType,
				"sap.ui.model.odata.v2.ODataModel",
				"then the model type is 'sap.ui.model.odata.v2.ODataModel'"
			);
			assert.strictEqual(
				oRegisterReadDelegateStub.getCall(2).args[0].modelType,
				"sap.ui.model.odata.ODataModel",
				"then the model type is 'sap.ui.model.odata.ODataModel'"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
