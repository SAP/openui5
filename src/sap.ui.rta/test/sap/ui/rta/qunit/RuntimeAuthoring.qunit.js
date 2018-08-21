/* global QUnit */

sap.ui.define([
	'sap/m/MessageBox',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/SmartForm',
	"sap/ui/core/BusyIndicator",
	'sap/ui/Device',
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Overlay',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Change',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	"sap/ui/rta/appVariant/AppVariantUtils",
	'sap/ui/fl/FakeLrepSessionStorage',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/base/Event',
	'sap/ui/base/EventProvider',
	'sap/ui/rta/command/BaseCommand',
	'qunit/RtaQunitUtils',
	'sap/ui/rta/appVariant/Feature',
	'sap/base/Log',
	"sap/base/util/UriParameters",
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/thirdparty/sinon-4'
],
function(
	MessageBox,
	Group,
	GroupElement,
	SmartForm,
	BusyIndicator,
	Device,
	ContextMenuPlugin,
	DesignTimeMetadata,
	OverlayRegistry,
	Overlay,
	ChangeRegistry,
	Change,
	Utils,
	RtaUtils,
	AppVariantUtils,
	FakeLrepSessionStorage,
	RuntimeAuthoring,
	Stack,
	CommandFactory,
	Remove,
	Event,
	EventProvider,
	RTABaseCommand,
	RtaQunitUtils,
	RtaAppVariantFeature,
	Log,
	UriParameters,
	QUnitUtils,
	sinon
) {
	"use strict";

	var fnTriggerKeydown = function(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	};

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();
			this.oRootControl = oComp.getAggregation("rootControl");

			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");
			return this.oRta.start().then(function(){
				this.oRootControlOverlay = OverlayRegistry.getOverlay(this.oRootControl);
			}.bind(this));
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA gets initialized and command stack is changed,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");
			assert.ok(this.oRootControlOverlay.$().css("z-index") < this.oRta.getToolbar().$().css("z-index"), "and the toolbar is in front of the root overlay");
			assert.notOk(RuntimeAuthoring.needsRestart(), "restart is not needed initially");

			assert.equal(this.oRta.getToolbar().getControl('exit').getVisible(), true, "then the exit Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('exit').getEnabled(), true, "then the exit Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('modeSwitcher').getVisible(), true, "then the modeSwitcher Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('modeSwitcher').getEnabled(), true, "then the modeSwitcher Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('undo').getVisible(), true, "then the undo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('undo').getEnabled(), false, "then the undo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('redo').getVisible(), true, "then the redo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('redo').getEnabled(), false, "then the redo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Restore Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), false, "then the Restore Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl('publish').getVisible(), true, "then the Publish Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('publish').getEnabled(), false, "then the Publish Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), false, "then the saveAs Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('saveAs').getEnabled(), false, "then the saveAs Button is not enabled");

			var oInitialCommandStack = this.oRta.getCommandStack();
			assert.ok(oInitialCommandStack, "the command stack is automatically created");
			this.oRta.setCommandStack(new Stack());
			var oNewCommandStack = this.oRta.getCommandStack();
			assert.notEqual(oInitialCommandStack, oNewCommandStack, "rta getCommandStack returns new command stack");
		});

		QUnit.test("when RTA is stopped and destroyed, the default plugins get created and destroyed", function(assert) {
			var done = assert.async();

			assert.ok(this.oRta.getPlugins()['contextMenu'], " then the default ContextMenuPlugin is set");
			assert.notOk(this.oRta.getPlugins()['contextMenu'].bIsDestroyed, " and the default ContextMenuPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['dragDrop'], " and the default DragDropPlugin is set");
			assert.notOk(this.oRta.getPlugins()['dragDrop'].bIsDestroyed, " and the default DragDropPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['cutPaste'], " and the default CutPastePlugin is set");
			assert.notOk(this.oRta.getPlugins()['cutPaste'].bIsDestroyed, " and the default CutPastePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['remove'], " and the default RemovePlugin is set");
			assert.notOk(this.oRta.getPlugins()['remove'].bIsDestroyed, " and the default RemovePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['additionalElements'], " and the default AdditionalElementsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['additionalElements'].bIsDestroyed, " and the default AdditionalElementsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['rename'], " and the default RenamePlugin is set");
			assert.notOk(this.oRta.getPlugins()['rename'].bIsDestroyed, " and the default RenamePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['selection'], " and the default SelectionPlugin is set");
			assert.notOk(this.oRta.getPlugins()['selection'].bIsDestroyed, " and the default SelectionPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['settings'], " and the default SettingsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['settings'].bIsDestroyed, " and the default SettingsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['createContainer'], " and the default CreateContainerPlugin is set");
			assert.notOk(this.oRta.getPlugins()['createContainer'].bIsDestroyed, " and the default CreateContainerPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['tabHandling'], " and the default TabHandlingPlugin is set");
			assert.notOk(this.oRta.getPlugins()['tabHandling'].bIsDestroyed, " and the default TabHandlingPlugin is not destroyed");

			this.oRta.attachStop(function() {
				assert.ok(true, "the 'stop' event was fired");

				this.oRta.destroy();
				assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));
			this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when setMode is called", function(assert) {
			var oTabhandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabhandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabhandlingPlugin, "restoreTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), "then the designTime property enabled is false");
			assert.ok(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.ok(oFireModeChangedSpy.callCount, 1, "then the event was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"});

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "then the designTime property enabled is true again");
			assert.ok(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.ok(oFireModeChangedSpy.callCount, 2, "then the event was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"});
		});
	});

	QUnit.module("Given a USER layer change", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();

			this.oUserChange = new Change({
				"fileType": "change",
				"layer": "USER",
				"fileName": "a",
				"namespace": "b",
				"packageName": "c",
				"changeType": "labelChange",
				"creation": "",
				"reference": "",
				"selector": {
					"id": "abc123"
				},
				"content": {
					"something": "createNewVariant"
				}
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started and stopped in the user layer", function(assert) {
			var done = assert.async();
			var oFlexController = this.oRta._getFlexController();
			sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([this.oUserChange]));
			this.oRta.setFlexSettings({layer: "USER"});
			var oReloadSpy = sandbox.spy(this.oRta, "_handleReloadOnExit");

			this.oRta.attachStop(function() {
				assert.ok(oReloadSpy.notCalled, "the reload check was skipped");
				done();
			});

			this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Restore Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), true, "then the Restore Button is enabled");
				assert.equal(this.oRta.getToolbar().getControl('exit').getVisible(), true, "then the Exit Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('exit').getEnabled(), true, "then the Exit Button is enabled");
			}.bind(this))
			.then(function() {
				this.oRta.getToolbar().getControl("exit").firePress();
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", function(assert) {
			var oFlexController = this.oRta._getFlexController();
			sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));
			sandbox.stub(this.oRta, '_getPublishAndAppVariantSupportVisibility').returns(Promise.resolve([true, true]));
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: false}));
			sandbox.stub(Utils, "getAppDescriptor").returns({"sap.app": {id: "1"}});

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), true, "then the 'AppVariant Overview' Icon Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP developer) but the manifest of an app is not supported", function(assert) {
			var oFlexController = this.oRta._getFlexController();
			sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));

			sandbox.stub(this.oRta, '_getPublishAndAppVariantSupportVisibility').returns(Promise.resolve([true, true]));
			sandbox.stub(RtaAppVariantFeature, "isOverviewExtended").returns(true);

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), true, "then the 'AppVariant Overview' Menu Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});

		QUnit.test("when _onGetAppVariantOverview is called", function(assert) {
			var oMenuButton = {
				getId : function() {
					return 'keyUser';
				}
			};

			var oEmptyEvent = new sap.ui.base.Event("emptyEventId", oMenuButton, {
				item : oMenuButton
			});

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));
			return this.oRta._onGetAppVariantOverview(oEmptyEvent).then(function() {
				assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once and the key user view will be shown");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started without toolbar...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars : false
			});

			return this.oRta.start();
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA gets initialized,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
		});
	});

	QUnit.module("Undo/Redo functionality", {
		beforeEach: function(assert) {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			this.fnUndoStub = sandbox.stub().returns(Promise.resolve());
			this.fnRedoStub = sandbox.stub().returns(Promise.resolve());

			this.oToolbarDomRef = jQuery('<input/>').appendTo('#qunit-fixture').get(0);
			this.oOverlayContainer = jQuery('<button/>').appendTo('#qunit-fixture');
			this.oAnyOtherDomRef = jQuery('<button/>').appendTo('#qunit-fixture').get(0);

			this.oUndoEvent = new Event("dummyEvent", new EventProvider());
			this.oUndoEvent.keyCode = jQuery.sap.KeyCodes.Z;
			this.oUndoEvent.ctrlKey = true;
			this.oUndoEvent.shiftKey = false;
			this.oUndoEvent.altKey = false;
			this.oUndoEvent.stopPropagation = function() {};

			this.oRedoEvent = new Event("dummyEvent", new EventProvider());
			this.oRedoEvent.keyCode = jQuery.sap.KeyCodes.Y;
			this.oRedoEvent.ctrlKey = true;
			this.oRedoEvent.shiftKey = false;
			this.oRedoEvent.altKey = false;
			this.oRedoEvent.stopPropagation = function() {};

			sandbox.stub(Overlay, "getOverlayContainer").returns(this.oOverlayContainer);

			this.mContext = {
				getToolbar: function () {
					return {
						getDomRef: function() {
							return this.oToolbarDomRef;
						}.bind(this)
					};
				}.bind(this),
				getShowToolbars: function () {
					return true;
				},
				_onUndo: this.fnUndoStub,
				_onRedo: this.fnRedoStub
			};
		},

		afterEach : function(assert) {
			sandbox.restore();
			Device.os.macintosh = this.bMacintoshOriginal;
		}
	}, function() {
		QUnit.test("with focus on an overlay", function(assert) {
			this.oOverlayContainer.get(0).focus();
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oToolbarDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on an outside element (e.g. dialog)", function(assert) {
			this.oAnyOtherDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("during rename", function(assert) {
			jQuery('<div/>', {
				"class": "sapUiRtaEditableField",
				"tabIndex": 1
			}).appendTo("#qunit-fixture").get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("using the public API", function(assert) {
			RuntimeAuthoring.prototype.undo.call(this.mContext);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called");

			RuntimeAuthoring.prototype.redo.call(this.mContext);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called");
		});

		QUnit.test("macintosh support", function(assert) {
			Device.os.macintosh = true;
			this.oUndoEvent.ctrlKey = false;
			this.oUndoEvent.metaKey = true;

			this.oOverlayContainer.get(0).focus();
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			this.oRedoEvent.keyCode = jQuery.sap.KeyCodes.Z;
			this.oRedoEvent.ctrlKey = false;
			this.oRedoEvent.metaKey = true;
			this.oRedoEvent.shiftKey = true;

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			FakeLrepSessionStorage.deleteChanges();
			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "Local storage based LREP is empty");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"hideControl" : "default"
				}
			});

			// Prepare elements an designtime
			var oElement1 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});

			// Create commmands
			var oCommandFactory = new CommandFactory();
			return oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement : oElement1
			}, this.oGroupElementDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				this.oRemoveCommand = oRemoveCommand;
				// Create command stack with the commands
				return this.oRemoveCommand.execute();
			}.bind(this))

			.then(function() {

				//After command has been pushed
				var fnStackModifiedSpy = sinon.spy(function() {

					// Start RTA with command stack
					var oRootControl = oComp.getAggregation("rootControl");
					this.oRta = new RuntimeAuthoring({
						rootControl : oRootControl,
						commandStack : this.oCommandStack,
						showToolbars : true,
						flexSettings: {
							developerMode: false
						}
					});

					this.oRta.start()

					.then(function() {
						this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
						this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
					}.bind(this))

					.then(fnDone)

					.catch(function (oError) {
						assert.ok(false, 'catch must never be called - Error: ' + oError);
					});
				}.bind(this));

				this.oCommandStack = new Stack();
				this.oCommandStack.attachEventOnce("modified", fnStackModifiedSpy);
				return this.oCommandStack.pushExecutedCommand(this.oRemoveCommand);
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oRemoveCommand.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			FakeLrepSessionStorage.deleteChanges();
		}
	}, function() {
		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
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
			fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, false, true);

			//redo -> execute -> fireModified (inside promise)
			fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Z, true, false, false, true);
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CTRL + Z the stack is empty");
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
			fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, true, false);

			//redo -> execute -> fireModified (inside promise)
			fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Y, false, false, true, false);
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a simple form", function(assert){
			var done = assert.async();

			var fnFireElementModifiedSpy = sandbox.spy(this.oRta._mDefaultPlugins["createContainer"], "fireElementModified");

			var oSimpleForm = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
			var oSimpleFormOverlay = OverlayRegistry.getOverlay(oSimpleForm.getAggregation("form").getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				sap.ui.getCore().applyChanges();
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta._mDefaultPlugins["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				assert.ok(fnFireElementModifiedSpy.calledOnce, "then 'fireElementModified' from the createContainer plugin is called once");
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSimpleFormOverlay);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a smart form", function(assert){
			var done = assert.async();

			var fnFireElementModifiedSpy = sinon.spy(this.oRta._mDefaultPlugins["createContainer"], "fireElementModified");

			var oSmartForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			var oSmartFormOverlay = OverlayRegistry.getOverlay(oSmartForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta._mDefaultPlugins["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				sap.ui.getCore().applyChanges();
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSmartFormOverlay);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on an empty form", function(assert){
			var done = assert.async();

			// An existing empty Form is used for the test
			var oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm1");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				sap.ui.getCore().applyChanges();
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				assert.ok(true, "then the new container starts the edit for rename");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oFormOverlay);
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();
			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "Local storage based LREP is empty");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);

			// Create the controls
			this.oGroupElement1 = new GroupElement({id : oComp.createId("element1")});
			this.oGroupElement2 = new GroupElement({id : oComp.createId("element2")});
			this.oGroup = new Group({
				id : oComp.createId("group"),
				groupElements : [this.oGroupElement1, this.oGroupElement2]
			});
			this.oSmartForm = new SmartForm({
				id : oComp.createId("smartform"),
				groups : [this.oGroup]
			});

			// Create commmands
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});

			var oCommandFactory = new CommandFactory();
			return oCommandFactory.getCommandFor(this.oGroupElement1, "Remove", {
				removedElement : this.oGroupElement1
			}, this.oGroupElementDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				this.oRemoveCommand1 = oRemoveCommand;
				return oCommandFactory.getCommandFor(this.oGroupElement2, "Remove", {
					removedElement : this.oGroupElement2
				}, this.oGroupElementDesignTimeMetadata);
			}.bind(this))

			.then(function(oRemoveCommand) {
				this.oRemoveCommand2 = oRemoveCommand;
				// Create command stack with the commands
				this.oCommandStack = new Stack();
				return this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
			}.bind(this))

			.then(function() {
				return this.oCommandStack.pushExecutedCommand(this.oRemoveCommand2);
			}.bind(this))

			.then(function() {
				// Start RTA with command stack
				this.oRta = new RuntimeAuthoring({
					rootControl : this.oSmartForm,
					commandStack : this.oCommandStack,
					showToolbars : true
				});

				return this.oRta.start();
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		},
		afterEach : function(assert) {
			this.oSmartForm.destroy();
			this.oRemoveCommand1.destroy();
			this.oRemoveCommand2.destroy();
			this.oGroupElementDesignTimeMetadata.destroy();
			this.oRta.destroy();
			this.oCommandStack.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
			var fnStubSerialize = function() {
				return Promise.reject();
			};
			sandbox.stub(this.oRta, "_serializeToLrep").callsFake(fnStubSerialize);

			return this.oRta.stop(false).catch(function() {
				assert.ok(true, "then the promise got rejected");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
				assert.strictEqual(jQuery(".sapUiRtaToolbar:visible").length, 1, "and the Toolbar is visible.");
			}.bind(this));
		});

		QUnit.test("when stopping rta without saving changes,", function(assert) {
			var done = assert.async();
			return this.oRta.stop(true).then(function() {
				assert.ok(true, "then the promise got resolved");
				assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "there is no change written to LREP");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
				done();
			}.bind(this));
		});

		QUnit.test("when stopping rta with saving changes,", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(2, assert);
			return this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenuPlugin("nonDefaultContextMenu");
			this.oRemovePlugin = new Remove({
				id : "nonDefaultRemovePlugin",
				commandFactory : oCommandFactory
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars : false,
				plugins : {
					remove : this.oRemovePlugin,
					contextMenu : this.oContextMenuPlugin
				}
			});

			this.fnDestroy = sandbox.spy(this.oRta, "_destroyDefaultPlugins");

			return this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepSessionStorage.deleteChanges();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA gets initialized with custom plugins only", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " and the custom ContextMenuPlugin is set");
			assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
			assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

			return this.oRta.stop(false).then(function() {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				metadataScope : "someScope"
			});

			return this.oRta.start();
		},
		afterEach : function(assert) {
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

	QUnit.module("Given that RuntimeAuthoring is created but not started", {
		beforeEach : function(assert) {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false,
				flexSettings: {
					layer: "CUSTOMER"
				}
			});
			sandbox.stub(BusyIndicator, "show");
			this.oChangePersistence = {
				transportAllUIChanges: function() {}
			};
			this.oFlexController = {
				_oChangePersistence: this.oChangePersistence,
				resetChanges: function() {}
			};
			this.oFlexControllerStub = sandbox.stub(this.oRta, "_getFlexController").returns(this.oFlexController);
			sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
			this.oDeleteChangesStub = sandbox.stub(this.oRta, "_deleteChanges");
			this.oEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.oReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When transport function is called and transportAllUIChanges returns Promise.resolve()", function(assert) {
			var oChangePersistenceStub = sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.resolve());
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oChangePersistenceStub.firstCall.args[1], RtaUtils.getRtaStyleClassName(), "the styleClass was passed correctly");
				assert.equal(oChangePersistenceStub.firstCall.args[2], "CUSTOMER", "the layer was passed correctly");
			});
		});

		QUnit.test("When transport function is called and transportAllUIChanges returns Promise.reject()", function(assert) {
			sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.reject(new Error("Error")));
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oShowErrorStub = sandbox.stub(Log, "error");
			var oErrorBoxStub = sandbox.stub(MessageBox, "error");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
				assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
			});
		});

		QUnit.test("When transport function is called and transportAllUIChanges returns Promise.reject() with an array of error messages", function(assert) {
			var oError = {messages :
				[
				 {
					 severity : "Error",
					 text : "Error text 1"
				 },
				 {
					 severity : "Error",
					 text : "Error text 2"
				 }
				]
			};
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sErrorBoxText = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
					+ oTextResources.getText("MSG_ERROR_REASON", "Error text 1\nError text 2\n");
			sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.reject(oError));
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oShowErrorStub = sandbox.stub(Log, "error");
			var oErrorBoxStub = sandbox.stub(MessageBox, "error");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
				assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
				assert.equal(oErrorBoxStub.args[0][0], sErrorBoxText, "and the shown error text is correct");
			});
		});

		QUnit.test("When transport function is called and transportAllUIChanges returns Promise.resolve() with 'Error' as parameter", function(assert) {
			sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.resolve('Error'));
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
			});
		});

		QUnit.test("When transport function is called and transportAllUIChanges returns Promise.resolve() with 'Cancel' as parameter", function(assert) {
			sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.resolve('Cancel'));
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
			});
		});

		QUnit.test("When restore function is called in the CUSTOMER layer", function(assert) {
			var done = assert.async();
			sandbox.stub(MessageBox, "confirm").callsFake(function(sMessage, mParameters) {
				assert.equal(sMessage, this.oRta._getTextResources().getText("FORM_PERS_RESET_MESSAGE"), "then the message is correct");
				assert.equal(mParameters.title, this.oRta._getTextResources().getText("FORM_PERS_RESET_TITLE"), "then the message is correct");

				mParameters.onClose("OK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], "CUSTOMER", "for the correct layer");

				mParameters.onClose("notOK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
				done();
			}.bind(this));

			this.oRta.restore();
		});

		QUnit.test("When restore function is called in the USER layer", function(assert) {
			var done = assert.async();
			this.oRta.setFlexSettings({
				layer: "USER"
			});
			sandbox.stub(MessageBox, "confirm").callsFake(function(sMessage, mParameters) {
				assert.equal(sMessage, this.oRta._getTextResources().getText("FORM_PERS_RESET_MESSAGE_PERSONALIZATION"), "then the message is correct");
				assert.equal(mParameters.title, this.oRta._getTextResources().getText("BTN_RESTORE"), "then the message is correct");

				mParameters.onClose("OK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], "USER", "for the correct layer");

				mParameters.onClose("notOK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
				done();
			}.bind(this));

			this.oRta.restore();
		});

		QUnit.test("when calling '_deleteChanges' successfully, ", function(assert) {
			this.oDeleteChangesStub.restore();
			sandbox.stub(this.oFlexController, "resetChanges").callsFake(function() {
				assert.strictEqual(arguments[0], this.oRta.getLayer(), "then correct layer parameter passed");
				assert.strictEqual(arguments[1], "Change.createInitialFileContent", "then correct generator parameter passed");
				assert.deepEqual(arguments[2], Utils.getAppComponentForControl(this.oRootControl), "then correct component parameter passed");
				return Promise.resolve();
			}.bind(this));

			return this.oRta._deleteChanges().then(function() {
				assert.ok(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges and there is an error', ", function(assert){
			this.oDeleteChangesStub.restore();

			sandbox.stub(this.oFlexController, "resetChanges").callsFake(function() {
				return Promise.reject("Error");
			});

			sandbox.stub(RtaUtils, "_showMessageBox").callsFake(function(sIconType, sHeader, sMessage, sError){
				assert.equal(sError, "Error", "and a message box shows the error to the user");
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_handleElementModified' and the command fails because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Utils.log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "_showMessageBox");
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
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 1, "one MessageBox got shown");
			});
		});

		QUnit.test("when calling '_handleElementModified' and the command fails, but not because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Utils.log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "_showMessageBox");
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
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 0, "no MessageBox got shown");
			});
		});

		QUnit.test("when enabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer);

			assert.ok(RuntimeAuthoring.needsRestart(sLayer), "then restart is needed");
		});

		QUnit.test("when enabling and disabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);

			RuntimeAuthoring.disableRestart(sLayer);

			assert.notOk(RuntimeAuthoring.needsRestart(sLayer), "then restart is not needed");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created without flexSettings", {
		beforeEach : function() {
			sandbox.stub(Utils, "buildLrepRootNamespace").returns("rootNamespace/");
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the uri-parameter sap-ui-layer is set,", function(assert) {
			assert.equal(this.oRta.getLayer(), "CUSTOMER", "then the layer is the default 'CUSTOMER'");

			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-layer").returns("VENDOR");

			this.oRta.setFlexSettings(this.oRta.getFlexSettings());
			assert.equal(this.oRta.getLayer("CUSTOMER"), "VENDOR", "then the function reacts to the URL parameter and sets the layer to VENDOR");
			oStub.restore();
		});

		QUnit.test("when setFlexSettings is called", function(assert) {
			assert.deepEqual(
				this.oRta.getFlexSettings(),
				{
					layer: "CUSTOMER",
					developerMode: true
				}
			);

			this.oRta.setFlexSettings({
				layer: "USER",
				namespace: "namespace"
			});

			assert.deepEqual(this.oRta.getFlexSettings(), {
				layer: "USER",
				developerMode: true,
				namespace: "namespace"
			});

			this.oRta.setFlexSettings({
				scenario: "scenario"
			});

			assert.deepEqual(this.oRta.getFlexSettings(), {
				layer: "USER",
				developerMode: true,
				namespace: "rootNamespace/changes/",
				rootNamespace: "rootNamespace/",
				scenario: "scenario"
			});
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});