/*global QUnit*/

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/EventHistory",
	"sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	MvcController,
	XMLView,
	Component,
	ExtensionPoint,
	ManifestUtils,
	EventHistory,
	RegistrationDelegator,
	ChangeHandlerRegistration,
	DelegateMediatorAPI,
	DelegateMediator,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Check if all the registration functions were called", function(assert) {
			var oRegisterAllSpy = sandbox.spy(RegistrationDelegator, "registerAll");

			var oRegisterChangeHandlersForLibraryStub = sandbox.stub(ChangeHandlerRegistration, "getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs");
			var oRegisterPredefinedChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerPredefinedChangeHandlers");
			var oRegisterExtensionProviderStub = sandbox.stub(MvcController, "registerExtensionProvider");
			var oRegisterXMLPreprocessorStub = sandbox.stub(XMLView, "registerPreprocessor");
			var oRegisterEventListenerStub = sandbox.stub(EventHistory, "start");
			var oRegisterExtensionPointProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			var oRegisterDefaultDelegateStub = sandbox.stub(DelegateMediatorAPI, "registerDefaultDelegate");

			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterAllSpy.callCount, 1, "register all was called once");

				assert.ok(Component._fnOnInstanceCreated, "register changes in component is registered.");
				assert.equal(oRegisterChangeHandlersForLibraryStub.callCount, 1, "Register Change Handlers called.");
				assert.equal(oRegisterPredefinedChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.ok(Component._fnLoadComponentCallback, "load component event handler is registered.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1, "Extension provider called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1, "XML preprocessor called.");
				assert.equal(oRegisterEventListenerStub.callCount, 1, "Event Listener called.");
				assert.equal(oRegisterExtensionPointProviderStub.callCount, 1, "ExtensionPoint called.");
				assert.equal(oRegisterDefaultDelegateStub.callCount, 1, "DefaultDelegate called.");
				assert.ok(Component._fnPreprocessManifest);
				fnDone();
			});
		});
	});

	var sWriteProcessorPath = "sap/ui/fl/write/_internal/extensionPoint/Processor";
	var sApplyProcessorPath = "sap/ui/fl/apply/_internal/extensionPoint/Processor";

	QUnit.module("sap.ui.fl.RegistrationDelegator getExtensionPointProvider function", {
		beforeEach: function () {
			var oRegisterExtensionProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");
			DelegateMediator._mDefaultDelegateItems = [];
			RegistrationDelegator.registerAll();
			this.fnExtensionProvider = oRegisterExtensionProviderStub.firstCall.args[0];
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When extension point handling is disabled", function (assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			assert.notOk(this.fnExtensionProvider({}), "then 'undefined' is returned");
		});

		QUnit.test("When extension point handling is disabled and design mode (adaptation project) is enabled", function (assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(false);
			sandbox.stub(oCore.getConfiguration(), "getDesignMode").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sWriteProcessorPath, "then the base processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled", function (assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled and design mode (adaptation project) is enabled", function (assert) {
			sandbox.stub(oCore.getConfiguration(), "getDesignMode").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
