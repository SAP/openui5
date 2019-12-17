/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/core/Component",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/EventHistory",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	RegistrationDelegator,
	Component,
	ChangeHandlerRegistration,
	MvcController,
	XMLView,
	EventHistory,
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

			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterAllSpy.callCount, 1, "register all was called once");

				assert.ok(Component._fnOnInstanceCreated, "register changes in component is registered.");
				assert.equal(oRegisterChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.ok(Component._fnLoadComponentCallback, "load component event handler is registered.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1, "Extension provider called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1, "XML preprocessor called.");
				assert.equal(oRegisterEventListenerStub.callCount, 1, "Event Listener called.");
				//TODO: enable Applier.preprocessManifest after FlexState is updated
				// assert.ok(Component._fnPreprocessManifest); //"descriptor change handler is registered.");
				fnDone();
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
