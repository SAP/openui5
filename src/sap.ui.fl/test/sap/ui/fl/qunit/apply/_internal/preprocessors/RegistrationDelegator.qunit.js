/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/base/DesignTime"
], function(
	MvcController,
	XMLView,
	Component,
	ExtensionPoint,
	ManifestUtils,
	RegistrationDelegator,
	ChangeHandlerRegistration,
	DelegateMediatorAPI,
	DelegateMediator,
	sinon,
	DesignTime
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator", {
		afterEach() {
			sandbox.restore();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("Check if all the registration functions were called", function(assert) {
			var oRegisterAllSpy = sandbox.spy(RegistrationDelegator, "registerAll");

			var oRegisterChangeHandlersForLibraryStub = sandbox.stub(
				ChangeHandlerRegistration,
				"getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs"
			);
			var oRegisterPredefinedChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerPredefinedChangeHandlers");
			var oRegisterExtensionProviderStub = sandbox.stub(MvcController, "registerExtensionProvider");
			var oRegisterXMLPreprocessorStub = sandbox.stub(XMLView, "registerPreprocessor");
			var oRegisterExtensionPointProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			var oRegisterReadDelegateStub = sandbox.stub(DelegateMediatorAPI, "registerReadDelegate");

			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterAllSpy.callCount, 1, "register all was called once");

				assert.ok(Component._fnOnInstanceCreated, "register changes in component is registered.");
				assert.equal(oRegisterChangeHandlersForLibraryStub.callCount, 1, "Register Change Handlers called.");
				assert.equal(oRegisterPredefinedChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.ok(Component._fnLoadComponentCallback, "load component event handler is registered.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1, "Extension provider called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1, "XML preprocessor called.");
				assert.equal(oRegisterExtensionPointProviderStub.callCount, 1, "ExtensionPoint called.");
				assert.equal(oRegisterReadDelegateStub.callCount, 3, "delegate registration is called.");
				assert.ok(Component._fnPreprocessManifest);
				fnDone();
			});
		});
	});

	var sWriteProcessorPath = "sap/ui/fl/write/_internal/extensionPoint/Processor";
	var sApplyProcessorPath = "sap/ui/fl/apply/_internal/extensionPoint/Processor";

	QUnit.module("sap.ui.fl.RegistrationDelegator getExtensionPointProvider function", {
		beforeEach() {
			var oRegisterExtensionProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			RegistrationDelegator.registerAll();
			[this.fnExtensionProvider] = oRegisterExtensionProviderStub.firstCall.args;
		},
		afterEach() {
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
			sandbox.restore();
			DelegateMediator.clear();
		}
	});

	QUnit.test("When 'registerModelSpecificReadDelegates' is called", function(assert) {
		var oRegisterReadDelegateStub = sandbox.stub(DelegateMediatorAPI, "registerReadDelegate");
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
