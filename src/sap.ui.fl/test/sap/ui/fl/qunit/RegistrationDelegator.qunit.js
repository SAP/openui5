jQuery.sap.require("sap.ui.fl.RegistrationDelegator");

(function(RegistrationDelegator) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.RegistrationDelegator", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Check if all the registration functions were called", function(assert) {
		var registerChangeHandlersStub = sinon.stub(RegistrationDelegator, "registerChangeHandlers");
		var registerLoadComponentEventHandlerStub = sinon.stub(RegistrationDelegator, "registerLoadComponentEventHandler");
		var registerExtensionProviderStub = sinon.stub(RegistrationDelegator, "registerExtensionProvider");
		var registerChangesInComponentStub = sinon.stub(RegistrationDelegator, "registerChangesInComponent");

		jQuery.sap.require("sap.ui.fl.library");

		sinon.assert.calledOnce(registerChangeHandlersStub, "Change Handlers called.");
		sinon.assert.calledOnce(registerLoadComponentEventHandlerStub, "Load Component Event Handler called.");
		sinon.assert.calledOnce(registerExtensionProviderStub, "Extension provider called.");
		sinon.assert.calledOnce(registerChangesInComponentStub, "Changes in Component called.");
	});

}(sap.ui.fl.RegistrationDelegator));
