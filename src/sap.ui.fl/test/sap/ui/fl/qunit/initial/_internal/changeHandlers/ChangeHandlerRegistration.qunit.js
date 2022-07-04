/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/thirdparty/sinon-4"
], function(
	Core,
	ChangeHandlerRegistration,
	ChangeHandlerStorage,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.initial._internal.changeHandlers.ChangeHandlerRegistration", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("the registry can identify flexChangeHandlers from already loaded libraries", function (assert) {
			var oFlChangeHandlerObject = {foo: "bar"};

			var aLoadedLibraries = [
				{
					extensions: {
						flChangeHandlers: oFlChangeHandlerObject
					}
				},
				{}
			];

			var oRegisterFlexChangeHandlersStub = sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary");
			sandbox.stub(Core, "getLoadedLibraries").returns(aLoadedLibraries);
			var oAttachLibraryChangedStub = sandbox.stub(Core, "attachLibraryChanged");

			return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs().then(function() {
				assert.equal(oRegisterFlexChangeHandlersStub.callCount, 1, "for one lib the register flex change handlers was called");
				assert.equal(oRegisterFlexChangeHandlersStub.firstCall.args[0], oFlChangeHandlerObject, "the change handler passed within the metadata was passed to the registration");
				assert.equal(oAttachLibraryChangedStub.callCount, 1, "the change handler registration registers to later loaded libraries");
			});
		});

		QUnit.test("the registry registration rejects when error occurs", function (assert) {
			var oLoadedLibrary1 = {
				extensions: {
					flChangeHandlers: {}
				}
			};

			var oRegisterFlexChangeHandlersStub = sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary").rejects();
			sandbox.stub(Core, "getLoadedLibraries").returns([oLoadedLibrary1]);
			var oAttachLibraryChangedStub = sandbox.stub(Core, "attachLibraryChanged");

			return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs()
			.catch(function() {
				assert.equal(oRegisterFlexChangeHandlersStub.callCount, 1, "the change handler registration rejects after error");
				assert.equal(oAttachLibraryChangedStub.callCount, 1, "the change handler registration registers to later loaded libraries");
			});
		});

		QUnit.test("the registry can identify flexChangeHandlers from loaded libraries after fl was loaded", function (assert) {
			var oFlChangeHandlerObject = {foo: "bar"};
			var oMockedLibraryChangedEvent = {
				parameters: {
					operation: "add",
					metadata: {
						extensions: {
							flChangeHandlers: oFlChangeHandlerObject
						}
					}
				}
			};
			oMockedLibraryChangedEvent.getParameter = function (key) {
				return oMockedLibraryChangedEvent.parameters[key];
			};

			sandbox.stub(Core, "attachLibraryChanged").callsFake(function(fnCallback) {
				fnCallback(oMockedLibraryChangedEvent);
			});
			sandbox.stub(Core, "getLoadedLibraries").returns({});
			var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary").resolves();

			return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs().then(function() {
				assert.equal(oRegisterChangeHandlersStub.callCount, 1, "the registration was called once");
				assert.equal(oRegisterChangeHandlersStub.firstCall.args[0], oFlChangeHandlerObject, "the flex registry was called with the change handler passed from the metadata of the loaded lib");
			});
		});

		QUnit.test("the registry does nothing if a library was changes, but not added", function (assert) {
			var oFlChangeHandlerObject = {foo: "bar"};
			var oMockedLibraryChangedEvent = {
				parameters: {
					operation: "changed",
					metadata: {
						extensions: {
							flChangeHandlers: oFlChangeHandlerObject
						}
					}
				}
			};
			oMockedLibraryChangedEvent.getParameter = function (key) {
				return oMockedLibraryChangedEvent.parameters[key];
			};

			sandbox.stub(Core, "attachLibraryChanged").callsFake(function(fnCallback) {
				fnCallback(oMockedLibraryChangedEvent);
			});
			sandbox.stub(Core, "getLoadedLibraries").returns({});
			var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary").resolves();

			return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs().then(function() {
				assert.equal(oRegisterChangeHandlersStub.callCount, 0, "the registration was not called");
			});
		});

		QUnit.test("the registry does nothing if a later loaded library has no change handlers", function (assert) {
			var oMockedLibraryChangedEvent = {
				parameters: {
					operation: "add",
					metadata: {
						extensions: {}
					}
				}
			};
			oMockedLibraryChangedEvent.getParameter = function (key) {
				return oMockedLibraryChangedEvent.parameters[key];
			};

			sandbox.stub(Core, "attachLibraryChanged").callsFake(function(fnCallback) {
				fnCallback(oMockedLibraryChangedEvent);
			});
			sandbox.stub(Core, "getLoadedLibraries").returns({});
			var oRegisterChangeHandlersStub = sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary").resolves();

			return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs().then(function() {
				assert.equal(oRegisterChangeHandlersStub.callCount, 0, "the registration was not called");
			});
		});

		[true, false].forEach(function(bResolve) {
			var sMsg = "addRegistrationPromise + waitForChangeHandlerRegistration - " + bResolve ? "resolving promise" : "rejecting promise";
			QUnit.test(sMsg, function(assert) {
				var done = assert.async();
				var sKey = "myFancyName";
				var oFlChangeHandlerObject = {foo: "bar"};
				var oMockedLibraryChangedEvent = {
					parameters: {
						operation: "add",
						metadata: {
							extensions: {
								flChangeHandlers: oFlChangeHandlerObject
							},
							sName: sKey
						}
					}
				};
				oMockedLibraryChangedEvent.getParameter = function (key) {
					return oMockedLibraryChangedEvent.parameters[key];
				};

				sandbox.stub(Core, "attachLibraryChanged").callsFake(function(fnCallback) {
					fnCallback(oMockedLibraryChangedEvent);
				});
				sandbox.stub(Core, "getLoadedLibraries").returns({});

				var fnPromiseFunction;
				var oPromise = new Promise(function(resolve, reject) {
					fnPromiseFunction = bResolve ? resolve : reject;
				});
				sandbox.stub(ChangeHandlerStorage, "registerChangeHandlersForLibrary").returns(oPromise);

				return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs().then(function() {
					ChangeHandlerRegistration.waitForChangeHandlerRegistration(sKey).then(function() {
						assert.ok(true, "the function resolves");
					}).then(function() {
						return ChangeHandlerRegistration.waitForChangeHandlerRegistration(sKey);
					}).then(function() {
						assert.ok(true, "the function also resolves without any registration going on");
						done();
					});
					fnPromiseFunction();
				});
			});
		});

		QUnit.test("registerPredefinedChangeHandlers", function(assert) {
			var oRegisterStub = sandbox.stub(ChangeHandlerStorage, "registerPredefinedChangeHandlers");
			ChangeHandlerRegistration.registerPredefinedChangeHandlers();

			var mPassedDefaultChangeHandlers = oRegisterStub.firstCall.args[0];
			assert.ok(mPassedDefaultChangeHandlers.hideControl, "the HideControl ChangeHandler was passed");
			assert.ok(mPassedDefaultChangeHandlers.moveElements, "the MoveElements ChangeHandler was passed");
			assert.ok(mPassedDefaultChangeHandlers.moveControls, "the MoveControls ChangeHandler was passed");
			assert.ok(mPassedDefaultChangeHandlers.unhideControl, "the UnhideControl ChangeHandler was passed");
			assert.ok(mPassedDefaultChangeHandlers.stashControl, "the StashControl ChangeHandler was passed");
			assert.ok(mPassedDefaultChangeHandlers.unstashControl, "the UnstashControl ChangeHandler was passed");

			var mPassedDevModeChangeHandlers = oRegisterStub.firstCall.args[1];
			assert.ok(mPassedDevModeChangeHandlers.propertyChange, "the PropertyChange ChangeHandler was passed");
			assert.ok(mPassedDevModeChangeHandlers.propertyBindingChange, "the PropertyBindingChange ChangeHandler was passed");
			assert.ok(mPassedDevModeChangeHandlers.addXML, "the AddXML ChangeHandler was passed");
			assert.ok(mPassedDevModeChangeHandlers.addXMLAtExtensionPoint, "the AddXMLAtExtensionPoint ChangeHandler was passed");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
