/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/Device",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/Change",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Log,
	MessageToast,
	oCore,
	Device,
	DesignTimeMetadata,
	OverlayRegistry,
	KeyCodes,
	SmartVariantManagementApplyAPI,
	FlexRuntimeInfoAPI,
	Change,
	PersistenceWriteAPI,
	VersionsAPI,
	ChangesWriteAPI,
	QUnitUtils,
	RTABaseCommand,
	CommandFactory,
	Stack,
	RuntimeAuthoring,
	RtaUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.config.fixture = null;

	var oComp;
	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture").then(function(oCompContainer) {
		oComp = oCompContainer.getComponentInstance();
	});

	function triggerKeydown(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	}

	function cleanInfoSessionStorage() {
		var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
		window.sessionStorage.removeItem("sap.ui.fl.info." + sFlexReference);
	}

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function(assert) {
			var fnDone = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			// Prepare elements an designtime
			var oElement1 = oCore.byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = oCore.byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data: {
					actions: {
						remove: {
							changeType: "hideControl"
						}
					}
				}
			});
			// Create commmands
			var oCommandFactory = new CommandFactory();
			oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement: oElement1
			}, this.oGroupElementDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				this.oRemoveCommand = oRemoveCommand;
				this.oCommandStack = new Stack();
				// Start RTA with command stack
				var oRootControl = oComp.getAggregation("rootControl");
				this.oRta = new RuntimeAuthoring({
					rootControl: oRootControl,
					commandStack: this.oCommandStack,
					showToolbars: true,
					flexSettings: {
						developerMode: false
					}
				});
				return RtaQunitUtils.clear()
					.then(this.oRta.start.bind(this.oRta))
					.then(function() {
						this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
						this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
						this.oCommandStack.pushAndExecute(oRemoveCommand);
					}.bind(this))
					.then(fnDone)
					.catch(function(oError) {
						assert.ok(false, "catch must never be called - Error: " + oError);
					});
			}.bind(this));
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			sandbox.restore();
			this.oRemoveCommand.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
					//redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Z, true, false, false, true);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CMD + SHIFT + Z is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = true;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, false, true);
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CTRL + Z the stack is empty");
					//redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Y, false, false, true, false);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CTRL + Y is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, true, false);
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a simple form", function(assert) {
			var done = assert.async();
			var fnFireElementModifiedSpy = sandbox.spy(this.oRta.getPluginManager().getDefaultPlugins()["createContainer"], "fireElementModified");

			var oSimpleForm = oCore.byId("Comp1---idMain1--SimpleForm");
			var oSimpleFormOverlay = OverlayRegistry.getOverlay(oSimpleForm.getAggregation("form").getId());

			sandbox.stub(this.oRta.getPluginManager().getDefaultPlugins()["rename"], "startEdit").callsFake(function(oNewContainerOverlay) {
				oCore.applyChanges();
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta.getPluginManager().getDefaultPlugins()["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				assert.ok(fnFireElementModifiedSpy.calledOnce, "then 'fireElementModified' from the createContainer plugin is called once");
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSimpleFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a smart form", function(assert) {
			var done = assert.async();

			var fnFireElementModifiedSpy = sinon.spy(this.oRta.getPluginManager().getDefaultPlugins()["createContainer"], "fireElementModified");

			var oSmartForm = oCore.byId("Comp1---idMain1--MainForm");
			var oSmartFormOverlay = OverlayRegistry.getOverlay(oSmartForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function(oNewContainerOverlay) {
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta.getPluginManager().getDefaultPlugins()["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				oCore.applyChanges();
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSmartFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on an empty form", function(assert) {
			var done = assert.async();

			// An existing empty Form is used for the test
			var oForm = oCore.byId("Comp1---idMain1--MainForm1");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function(oNewContainerOverlay) {
				oCore.applyChanges();
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				assert.ok(true, "then the new container starts the edit for rename");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oFormOverlay);
			oCore.applyChanges();
		});

		QUnit.test("when calling '_handleElementModified' and the command fails because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff.... The following Change cannot be applied because of a dependency .... some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent).then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 1, "one MessageBox got shown");
			});
		});

		QUnit.test("when calling '_handleElementModified' and the command fails, but not because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff........ some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent).then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 0, "no MessageBox got shown");
			});
		});

		QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
			var fnStubSerialize = function() {
				return Promise.reject();
			};
			sandbox.stub(this.oRta, "_serializeToLrep").callsFake(fnStubSerialize);

			return this.oRta.stop(false).catch(function() {
				assert.ok(true, "then the promise got rejected");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				assert.strictEqual(jQuery(".sapUiRtaToolbar:visible").length, 1, "and the Toolbar is visible.");
			}.bind(this));
		});

		QUnit.test("when stopping rta without saving changes,", function(assert) {
			return this.oRta.stop(true)
				.then(function() {
					assert.ok(true, "then the promise got resolved");
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				}.bind(this))
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function(iNumOfChanges) {
					assert.equal(iNumOfChanges, 0, "there is no change written");
				});
		});

		QUnit.test("when stopping rta with saving changes", function(assert) {
			var oSaveSpy = sandbox.spy(PersistenceWriteAPI, "save");

			return this.oRta.stop()
				.then(function() {
					var oSavePropertyBag = oSaveSpy.getCall(0).args[0];
					assert.ok(oSavePropertyBag.removeOtherLayerChanges, "then removeOtherLayerChanges is set to true");
					assert.strictEqual(oSavePropertyBag.layer, this.oRta.getLayer(), "then the layer is properly passed along");
				}.bind(this))
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function(iNumberOfChanges) {
					assert.strictEqual(iNumberOfChanges, 1, "then the change is written");
					var mPropertyBag = {
						oComponent: oComp,
						selector: oComp,
						invalidateCache: false,
						currentLayer: this.oRta.getLayer(),
						includeDirtyChanges: true
					};
					return PersistenceWriteAPI._getUIChanges(mPropertyBag).then(function(aChanges) {
						assert.ok(
							aChanges[0].isSuccessfullyApplied(),
							"then the change keeps its apply state"
						);
						assert.notStrictEqual(
							aChanges[0].getRevertData(),
							null,
							"then the change keeps its revert data"
						);
					});
				}.bind(this));
		});

		QUnit.test("when stopping rta with saving changes and versioning is disabled", function(assert) {
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, false, "the draft flag is set to false");
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning is enabled and condenseAnyLayer true", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);

			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep(true)
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.strictEqual(aSavePropertyBag.draft, true, "the draft flag is set to true");
				assert.strictEqual(aSavePropertyBag.condenseAnyLayer, true, "the condense flag is set to true");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var fnGetResetAndPublishInfoStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isPublishEnabled: false,
				isResetEnabled: true
			});
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.equal(fnGetResetAndPublishInfoStub.callCount, 1, "then the status of publish and reset button is evaluated");
			});
		});

		QUnit.test("When publishVersion function is called and publicVersion returns Promise.resolve() ", function(assert) {
			sandbox.stub(VersionsAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			return this.oRta._onPublishVersion().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
			});
		});

		QUnit.test("When publishVersion function is called and publicVersion returns Cancel or Error", function(assert) {
			sandbox.stub(VersionsAPI, "publish").resolves("Cancel");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			return this.oRta._onPublishVersion().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then no messageToast was shown");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		before: function() {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl"),
				metadataScope: "someScope"
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach: function() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started, then the overlay has the scoped metadata associated", function(assert) {
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then RTA knows the scope");
			assert.equal(this.oRta._oDesignTime.getScope(), "someScope", "then designtime knows the scope");

			var oOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---idMain1--Dates.SpecificFlexibility");
			var mDesignTimeMetadata = oOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata.some.deep, null, "Scope can delete keys");

			var oRootOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---app");
			var mDesignTimeMetadata2 = oRootOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata2.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata2.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata2.some.deep, null, "Scope can delete keys");

			var oErrorStub = sandbox.stub(Log, "error");
			this.oRta.setMetadataScope("some other scope");
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then the scope in RTA didn't change");
			assert.equal(oErrorStub.callCount, 1, "and an error was logged");
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
