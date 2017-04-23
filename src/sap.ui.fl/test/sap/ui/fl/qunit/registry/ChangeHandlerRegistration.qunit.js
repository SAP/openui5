/*global QUnit,sinon*/

jQuery.sap.require("sap.ui.fl.registry.ChangeHandlerRegistration");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

(function (ChangeHandlerRegistration, ChangeRegistry) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.registry.ChangeHandlerRegistration", {
		beforeEach: function () {
			this.stubs = [];

			// create new instance of ChangeRegistry
			this.changeRegistryInstance = new ChangeRegistry();
			sandbox.stub(ChangeRegistry, "getInstance").returns(this.changeRegistryInstance);
		},
		afterEach: function () {
			sandbox.restore();
		}
	});

	QUnit.test("the registry can identify flexChangeHandlers from already loaded libraries", function (assert) {
		var oFlChangeHandlerObject = {/* some stub object instance*/};

		var oLoadedLibrary1 = {
			extensions: {
				flChangeHandlers: oFlChangeHandlerObject
			}
		};

		var oLoadedLibrary2 = {/* some stub object instance*/};

		var oLoadedLibraries = [
			oLoadedLibrary1,
			oLoadedLibrary2
		];

		var oCoreMock = {
			getLoadedLibraries: function () {
				return oLoadedLibraries;
			},
			attachLibraryChanged: function () {}
		};

		sandbox.stub(sap.ui, "getCore").returns(oCoreMock);
		var oRegisterFlexChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerFlexChangeHandlers");

		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();

		assert.ok(
			oRegisterFlexChangeHandlersStub.calledOnce,
			"for one lib the register flex change handlers was called"
		);

		assert.equal(
			oRegisterFlexChangeHandlersStub.firstCall.args[0],
			oFlChangeHandlerObject,
			"the change handler passed within the metadata was passed to the registration"
		);
	});

	QUnit.test("the registry registers itself to later loaded libraries", function (assert) {
		var oCoreMock = {
			getLoadedLibraries: function () {
				return [];
			},
			attachLibraryChanged: function () {}
		};

		var oAttachLibraryChangedStub = sandbox.stub(oCoreMock, "attachLibraryChanged");
		sandbox.stub(sap.ui, "getCore").returns(oCoreMock);

		ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();

		assert.ok(
			oAttachLibraryChangedStub.calledOnce,
			"the change handler registration registers to later loaded libraries"
		);
	});

	QUnit.test("the registry can identify flexChangeHandlers from loaded libraries after fl was loaded", function (assert) {
		var oFlChangeHandlerObject = {/* some stub object instance*/};

		var oMockedLibraryChangedEvent = {
			parameters: {
				"operation": "add",
				"metadata": {
					"extensions": {
						"flChangeHandlers": oFlChangeHandlerObject
					}
				}
			}
		};

		oMockedLibraryChangedEvent.getParameter = function (key) {
			return oMockedLibraryChangedEvent.parameters[key];
		};

		var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerFlexChangeHandlers");

		ChangeHandlerRegistration.handleLibraryRegistrationAfterFlexLibraryIsLoaded(oMockedLibraryChangedEvent);

		assert.ok(oRegisterChangeHandlersStub.calledOnce, "the registration was called once");
		assert.equal(oRegisterChangeHandlersStub.firstCall.args[0], oFlChangeHandlerObject, "the flex registry was called with the change handler passed from the metadata of the loaded lib");
	});

	QUnit.test("the registry does nothing if a library was changes, but not added", function (assert) {
		var oFlChangeHandlerObject = {/* some stub object instance*/};

		var oMockedLibraryChangedEvent = {
			parameters: {
				"operation": "changed",
				"metadata": {
					"extensions": {
						"flChangeHandlers": oFlChangeHandlerObject
					}
				}
			}
		};

		oMockedLibraryChangedEvent.getParameter = function (key) {
			return oMockedLibraryChangedEvent.parameters[key];
		};

		var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerFlexChangeHandlers");

		ChangeHandlerRegistration.handleLibraryRegistrationAfterFlexLibraryIsLoaded(oMockedLibraryChangedEvent);

		assert.equal(oRegisterChangeHandlersStub.callCount, 0, "the registration was not called");
	});

	QUnit.test("the registry does nothing if a later loaded library has no change handlers", function (assert) {
		var oMockedLibraryChangedEvent = {
			parameters: {
				"operation": "add",
				"metadata": {
					"extensions" : {}
				}
			}
		};

		oMockedLibraryChangedEvent.getParameter = function (key) {
			return oMockedLibraryChangedEvent.parameters[key];
		};

		var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerFlexChangeHandlers");

		ChangeHandlerRegistration.handleLibraryRegistrationAfterFlexLibraryIsLoaded(oMockedLibraryChangedEvent);

		assert.equal(oRegisterChangeHandlersStub.callCount, 0, "the registration was called once");
	});

}(sap.ui.fl.registry.ChangeHandlerRegistration, sap.ui.fl.registry.ChangeRegistry));
