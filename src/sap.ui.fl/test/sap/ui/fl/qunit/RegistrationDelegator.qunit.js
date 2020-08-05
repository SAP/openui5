/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/core/Component",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/EventHistory",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	RegistrationDelegator,
	Component,
	ChangeHandlerRegistration,
	MvcController,
	XMLView,
	EventHistory,
	ExtensionPoint,
	ManifestUtils,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.RegistrationDelegator", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Check if all the registration functions were called", function(assert) {
			var oRegisterAllSpy = sandbox.spy(RegistrationDelegator, "registerAll");

			var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs");
			var oRegisterExtensionProviderStub = sandbox.stub(MvcController, "registerExtensionProvider");
			var oRegisterXMLPreprocessorStub = sandbox.stub(XMLView, "registerPreprocessor");
			var oRegisterEventListenerStub = sandbox.stub(EventHistory, "start");
			var oRegisterExtensionPointProviderStub = sandbox.stub(ExtensionPoint, "registerExtensionProvider");

			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterAllSpy.callCount, 1, "register all was called once");

				assert.ok(Component._fnOnInstanceCreated, "register changes in component is registered.");
				assert.equal(oRegisterChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.ok(Component._fnLoadComponentCallback, "load component event handler is registered.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1, "Extension provider called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1, "XML preprocessor called.");
				assert.equal(oRegisterEventListenerStub.callCount, 1, "Event Listener called.");
				assert.equal(oRegisterExtensionPointProviderStub.callCount, 1, "ExtensionPoint called.");
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
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sWriteProcessorPath, "then the base processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled", function (assert) {
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});

		QUnit.test("When extension point handling is enabled and design mode (adaptation project) is enabled", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			assert.strictEqual(this.fnExtensionProvider({}), sApplyProcessorPath, "then the processor module path is returned");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
