/*global QUnit,sinon */

jQuery.sap.require("sap.ui.fl.RegistrationDelegator");

(function(RegistrationDelegator) {
	"use strict";

	QUnit.module("sap.ui.fl.RegistrationDelegator", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
		},
		afterEach: function() {
			this._oSandbox.restore();
		}
	});

	QUnit.test("Check if all the registration functions were called", function(assert) {
		var registerChangeHandlersStub = sinon.stub(RegistrationDelegator, "registerChangeHandlers");
		var registerLoadComponentEventHandlerStub = sinon.stub(RegistrationDelegator, "registerLoadComponentEventHandler");
		var registerExtensionProviderStub = sinon.stub(RegistrationDelegator, "registerExtensionProvider");
		var registerChangesInComponentStub = sinon.stub(RegistrationDelegator, "registerChangesInComponent");
		var registerXMLPreprocessorStub = sinon.stub(RegistrationDelegator, "registerXMLPreprocessor");
		var registerEventListenerStub = sinon.stub(RegistrationDelegator, "registerEventListener");

		jQuery.sap.require("sap.ui.fl.library");

		sinon.assert.calledOnce(registerChangeHandlersStub, "Change Handlers called.");
		sinon.assert.calledOnce(registerLoadComponentEventHandlerStub, "Load Component Event Handler called.");
		sinon.assert.calledOnce(registerExtensionProviderStub, "Extension provider called.");
		sinon.assert.calledOnce(registerChangesInComponentStub, "Changes in Component called.");
		sinon.assert.calledOnce(registerXMLPreprocessorStub, "XML preprocessor called.");
		sinon.assert.calledOnce(registerEventListenerStub, "Event Listener called.");
	});

}(sap.ui.fl.RegistrationDelegator));
