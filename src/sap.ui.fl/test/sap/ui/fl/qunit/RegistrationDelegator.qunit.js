/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	RegistrationDelegator,
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
			var oRegisterChangeHandlersStub = sandbox.stub(RegistrationDelegator, "registerChangeHandlers");
			var oRegisterLoadComponentEventHandlerStub = sandbox.stub(RegistrationDelegator, "registerLoadComponentEventHandler");
			var oRegisterExtensionProviderStub = sandbox.stub(RegistrationDelegator, "registerExtensionProvider");
			var oRegisterChangesInComponentStub = sandbox.stub(RegistrationDelegator, "registerChangesInComponent");
			var oRegisterXMLPreprocessorStub = sandbox.stub(RegistrationDelegator, "registerXMLPreprocessor");
			var oRegisterEventListenerStub = sandbox.stub(RegistrationDelegator, "registerEventListener");

			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.equal(oRegisterChangeHandlersStub.callCount, 1); //"Change Handlers called."
				assert.equal(oRegisterLoadComponentEventHandlerStub.callCount, 1); //"Load Component Event Handler called.");
				assert.equal(oRegisterExtensionProviderStub.callCount, 1); //"Extension provider called.");
				assert.equal(oRegisterChangesInComponentStub.callCount, 1); //"Changes in Component called.");
				assert.equal(oRegisterXMLPreprocessorStub.callCount, 1); //"XML preprocessor called.");
				assert.equal(oRegisterEventListenerStub.callCount, 1); //"Event Listener called.");
				fnDone();
			});
		});
	});


	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
