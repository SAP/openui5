/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
	// Controls
	'sap/m/Button',
	'sap/m/MessageBox',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/SmartForm',
	"sap/ui/core/BusyIndicator",
	// internal
	'sap/ui/Device',
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Overlay',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/LrepConnector',
	'sap/ui/fl/Change',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/fl/ChangePersistence',
	'sap/ui/fl/transport/TransportSelection',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/rta/plugin/CreateContainer',
	'sap/ui/rta/plugin/Rename',
	'sap/ui/base/Event',
	'sap/ui/base/EventProvider',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/qunit/RtaQunitUtils',
	'sap/ui/rta/appVariant/Feature',
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Button,
	MessageBox,
	Group,
	GroupElement,
	SmartForm,
	BusyIndicator,
	Device,
	ContextMenu,
	DesignTimeMetadata,
	OverlayRegistry,
	Overlay,
	Settings,
	ChangeRegistry,
	LrepConnector,
	Change,
	Utils,
	RtaUtils,
	FakeLrepLocalStorage,
	ChangePersistence,
	TransportSelection,
	RuntimeAuthoring,
	Stack,
	CommandFactory,
	Remove,
	CreateContainerPlugin,
	RenamePlugin,
	Event,
	EventProvider,
	RTABaseCommand,
	RtaQunitUtils,
	RtaAppVariantFeature,
	sinon
) {
	"use strict";

	QUnit.start();

	var fnTriggerKeydown = function(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		sap.ui.test.qunit.triggerEvent("keydown", oTargetDomRef, oParams);
	};

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("test-view");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized,", function(assert) {
		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");
	});

	QUnit.test("when the uri-parameter sap-ui-layer is set,", function(assert) {
		assert.equal(this.oRta.getLayer(), "CUSTOMER", "then the layer is the default 'CUSTOMER'");

		sandbox.stub(jQuery.sap, "getUriParameters").returns(
			{
				mParams: {
					"sap-ui-layer": ["VENDOR"]
			}
		});

		this.oRta.setFlexSettings(this.oRta.getFlexSettings());
		assert.equal(this.oRta.getLayer("CUSTOMER"), "VENDOR", "then the function reacts to the URL parameter and sets the layer to VENDOR");
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

	});

	QUnit.test("when command stack is changed,", function(assert) {
		var oInitialCommandStack = this.oRta.getCommandStack();
		assert.ok(oInitialCommandStack, "the command stack is automatically created");
		this.oRta.setCommandStack(new Stack());
		var oNewCommandStack = this.oRta.getCommandStack();
		assert.notEqual(oInitialCommandStack, oNewCommandStack, "rta getCommandStack returns new command stack");
	});

	QUnit.test("when two overlays are added to selection", function(assert) {
		var that = this;

		var oElement1 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
		var oOverlay1 = OverlayRegistry.getOverlay(oElement1.getId());
		var oElement2 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
		var oOverlay2 = OverlayRegistry.getOverlay(oElement2.getId());

		assert.strictEqual(this.oRta.getSelection().length, 0, "initially there's no selection in RTA");

		var iFired = 0;
		this.oRta.attachSelectionChange(function(oEvent) {
			iFired++;
			assert.deepEqual(that.oRta.getSelection(), oEvent.getParameter("selection"), "the selection event from rta is fired with a coreect selection");
		});

		oOverlay1.focus();
		sap.ui.test.qunit.triggerKeydown(oOverlay1.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		assert.strictEqual(this.oRta.getSelection().length, 1, "after first selection one overlay is selected");

		this.oRta._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
		oOverlay2.focus();
		sap.ui.test.qunit.triggerKeydown(oOverlay2.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		assert.strictEqual(this.oRta.getSelection().length, 2, "after second selection two overlays are selected");

		assert.strictEqual(iFired, 2, "and selection event from RTA is fired twice");
	});

	QUnit.test("when RTA is stopped ...", function(assert) {
		var done = assert.async();
		this.oRta.attachStop(function() {
			assert.ok(true, "the 'stop' event was fired");
			done();
		});
		this.oRta.stop().then(function() {
			assert.ok(true, "then the promise got resolved");
		});
	});

	QUnit.test("when RTA is destroyed", function (assert) {
		return this.oRta.stop().then(function() {
			this.oRta.destroy();
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
		}.bind(this));
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
		this.oRta.getToolbar().fireModeChange({key: "adaptation"});
		assert.ok(this.oRta._oDesignTime.getEnabled(), "then the designTime property enabled is true again");
		assert.ok(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
		assert.ok(oFireModeChangedSpy.callCount, 2, "then the event was fired again");
		assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"});
	});

	QUnit.module("Given a USER layer change", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

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
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA is started in the customer layer", function(assert) {
		var oFlexController = this.oRta._getFlexController();
		sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));

		return this.oRta.start().then(function () {
			assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), false, "then the Restore Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
		}.bind(this));
	});

	QUnit.test("when RTA is started in the user layer", function(assert) {
		var oFlexController = this.oRta._getFlexController();
		sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([this.oUserChange]));

		this.oRta.setFlexSettings({layer: "USER"});
		return this.oRta.start().then(function () {
			assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), true, "then the Restore Button is enabled");
		}.bind(this));
	});

	QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", function(assert) {
		var oFlexController = this.oRta._getFlexController();
		sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));

		sandbox.stub(this.oRta, '_getPublishAndAppVariantSupportVisibility').returns(Promise.resolve([true, true]));
		return this.oRta.start().then(function () {
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
		return this.oRta.start().then(function () {
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

	QUnit.module("Given that RuntimeAuthoring is started without toolbar...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars : false
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized,", function(assert) {
		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
	});

	QUnit.module("Undo/Redo functionality", {
		beforeEach: function(assert) {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			this.fnUndoSpy = sandbox.stub().returns(Promise.resolve());
			this.fnRedoSpy = sandbox.stub().returns(Promise.resolve());

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
				_onUndo: this.fnUndoSpy,
				_onRedo: this.fnRedoSpy
			};
		},

		afterEach : function(assert) {
			sandbox.restore();
			Device.os.macintosh = this.bMacintoshOriginal;
		}
	});

	QUnit.test("with focus on an overlay", function(assert) {
		this.oOverlayContainer.get(0).focus();
		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
		assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
		assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
	});

	QUnit.test("with focus on the toolbar", function(assert) {
		this.oToolbarDomRef.focus();

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
		assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
		assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
	});

	QUnit.test("with focus on an outside element (e.g. dialog)", function(assert) {
		this.oAnyOtherDomRef.focus();

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
		assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
		assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
	});

	QUnit.test("during rename", function(assert) {
		jQuery('<div/>', {
			"class": "sapUiRtaEditableField",
			"tabIndex": 1
		}).appendTo("#qunit-fixture").get(0).focus();

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
		assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
		assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
	});

	QUnit.test("macintosh support", function(assert) {
		Device.os.macintosh = true;
		this.oUndoEvent.ctrlKey = false;
		this.oUndoEvent.metaKey = true;

		this.oOverlayContainer.get(0).focus();
		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
		assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

		this.oRedoEvent.keyCode = jQuery.sap.KeyCodes.Z;
		this.oRedoEvent.ctrlKey = false;
		this.oRedoEvent.metaKey = true;
		this.oRedoEvent.shiftKey = true;

		RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
		assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			var done = assert.async();

			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");
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
							changeType : "hideControl",
							getState : function(oGroupElement) {
								return {
									visible : oGroupElement.getVisible()
								};
							},
							restoreState : function(oGroupElement, oState) {
								oGroupElement.setVisible(oState.visible);
							}
						}
					}
				}
			});

			// Create commmands
			var oCommandFactory = new CommandFactory();
			this.oRemoveCommand1 = oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement : oElement1
			}, this.oGroupElementDesignTimeMetadata);

			// Create command stack with the commands
			this.oRemoveCommand1.execute().then(function() {

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

					Promise.all([
						new Promise(function (fnResolve) {
							this.oRta.attachStart(function() {
								this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
								this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
								fnResolve();
							}.bind(this));
						}.bind(this)),
						this.oRta.start()
					]).then(done);
				}.bind(this));

				this.oCommandStack = new Stack();
				this.oCommandStack.attachEventOnce("modified", fnStackModifiedSpy);
				this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);

			}.bind(this));
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oRemoveCommand1.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			FakeLrepLocalStorage.deleteChanges();
		}
	});

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

	QUnit.test("when a simple form has a title", function(assert) {
		var oTitle = sap.ui.getCore().byId("Comp1---idMain1--Title1");
		var oTitleOverlay = OverlayRegistry.getOverlay(oTitle.getId());
		assert.strictEqual(oTitleOverlay.getEditable(), false, "then the title is not editable.");
	});

	QUnit.test("when _handleElementModified is called if a create container command was executed", function(assert){
		var done = assert.async();

		// An existing Form is used for the test
		var oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
		var oFormOverlay = OverlayRegistry.getOverlay(oForm.getId());

		this.oRta.getPlugins()["createContainer"].handleCreate(false, oFormOverlay);

		sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit", function(oNewContainerOverlay){
			assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
			assert.ok(true, "then the new container starts the edit for rename");
			this.oCommandStack.undo();
			done();
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");
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
			this.oRemoveCommand1 = oCommandFactory.getCommandFor(this.oGroupElement1, "Remove", {
				removedElement : this.oGroupElement1
			}, this.oGroupElementDesignTimeMetadata);
			this.oRemoveCommand2 = oCommandFactory.getCommandFor(this.oGroupElement2, "Remove", {
				removedElement : this.oGroupElement2
			}, this.oGroupElementDesignTimeMetadata);

			// Create command stack with the commands
			this.oCommandStack = new Stack();
			this.oCommandStack.pushExecutedCommand(this.oRemoveCommand1);
			this.oCommandStack.pushExecutedCommand(this.oRemoveCommand2);

			// Start RTA with command stack
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oSmartForm,
				commandStack : this.oCommandStack,
				showToolbars : true
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oSmartForm.destroy();
			this.oRemoveCommand1.destroy();
			this.oRemoveCommand2.destroy();
			this.oGroupElementDesignTimeMetadata.destroy();
			this.oRta.destroy();
			this.oCommandStack.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
		var fnStubSerialize = function() {
			return Promise.reject();
		};
		sandbox.stub(this.oRta, "_serializeToLrep", fnStubSerialize);

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
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "there is no change written to LREP");
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

	QUnit.test("when calling '_deleteChanges' successfully, ", function(assert){
		var fnDone = assert.async();
		sandbox.stub(this.oRta._getFlexController(), "resetChanges", function() {
			return Promise.resolve();
		});

		sandbox.stub(this.oRta, "_reloadPage", function(){
			assert.ok(true, "and page reload is triggered");
			fnDone();
		});

		this.oRta._deleteChanges();
	});

	QUnit.test("when calling '_deleteChanges and there is an error', ", function(assert){
		var fnDone = assert.async();
		var fnReloadPageSpy = sandbox.spy(this.oRta, "_reloadPage");

		sandbox.stub(this.oRta._getFlexController(), "resetChanges", function(){
			return Promise.reject("Error");
		});

		sandbox.stub(RtaUtils, "_showMessageBox", function(sIconType, sHeader, sMessage, sError){
			assert.ok(fnReloadPageSpy.notCalled, "then the page does not reload");
			assert.equal(sError, "Error", "and a message box shows the error to the user");
			fnDone();
		});

		this.oRta._deleteChanges();
	});

	QUnit.test("when calling '_deleteChanges and there are 2 LREP changes together with 2 local changes', ", function(assert) {
		var fnSetTransportCalled = assert.async();
		var fnDone = assert.async();

		sandbox.stub(Settings.prototype, "isProductiveSystem").returns(false);
		sandbox.stub(Settings.prototype, "hasMergeErrorOccured").returns(false);

		sandbox.stub(this.oRta._getFlexController()._oChangePersistence, "getChangesForComponent", function(){
			return Promise.resolve(
				[{fileName: 'change1', getRequest: function() {return "testtransport";}},
				{fileName: 'change2', getRequest: function() {return "testtransport";}}]
			);
		});

		var oTransportSelection = this.oRta._getFlexController()._oChangePersistence._oTransportSelection;
		sandbox.stub(oTransportSelection, "setTransports", function(aChanges, oRootControl){
			assert.equal(aChanges.length, 2, "then only the 2 persisted changes are passed to the transport");
			fnSetTransportCalled();
			return Promise.resolve();
		});
		sandbox.stub(this.oRta._getFlexController()._oChangePersistence._oConnector, "send", function() {
			assert.ok(true, "and the send function in LrepConnector is called");
			return Promise.resolve();
		});

		sandbox.stub(this.oRta, "_reloadPage", function(){
			assert.ok(true, "and page reload is triggered");
			fnDone();
		});

		this.oRta._deleteChanges();
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenu("nonDefaultContextMenu");
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

			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepLocalStorage.deleteChanges();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when RTA gets initialized with custom plugins only", function(assert) {
		var done = assert.async();

		assert.ok(this.oRta, " then RuntimeAuthoring is created");
		assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " and the custom ContextMenuPlugin is set");
		assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
		assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

		return this.oRta.stop(false).then(function() {
			this.oRta.destroy();
			assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			done();
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				metadataScope : "someScope"
			});

			this.oRta.attachStart(function() {
				done();
			});
			this.oRta.start();

		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

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

		var oErrorStub = sandbox.stub(jQuery.sap.log, "error");
		this.oRta.setMetadataScope("some other scope");
		assert.equal(this.oRta.getMetadataScope(), "someScope", "then the scope in RTA didn't change");
		assert.equal(oErrorStub.callCount, 1, "and an error was logged");
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
			sandbox.stub(this.oRta, "_getFlexController").returns({
				_oChangePersistence: this.oChangePersistence
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When transport function is called and transportAllUIChanges returns Promise.resolve()", function(assert) {
		sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
		var oChangePersistenceStub = sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.resolve());
		var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
		return this.oRta.transport().then(function() {
			assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
			assert.equal(oChangePersistenceStub.firstCall.args[1], RtaUtils.getRtaStyleClassName(), "the styleClass was passed correctly");
			assert.equal(oChangePersistenceStub.firstCall.args[2], "CUSTOMER", "the layer was passed correctly");
		});
	});

	QUnit.test("When transport function is called and transportAllUIChanges returns Promise.reject()", function(assert) {
		sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
		sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.reject(new Error("Error")));
		var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
		var oShowErrorStub = sandbox.stub(jQuery.sap.log, "error");
		var oErrorBoxStub = sandbox.stub(MessageBox, "error");
		return this.oRta.transport().then(function() {
			assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
			assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
			assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
		});
	});

	QUnit.test("When transport function is called and transportAllUIChanges returns Promise.resolve() with 'Error' as parameter", function(assert) {
		sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
		sandbox.stub(this.oChangePersistence, "transportAllUIChanges").returns(Promise.resolve('Error'));
		var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
		return this.oRta.transport().then(function() {
			assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
		});
	});

	QUnit.done(function( details ) {
		oComp.destroy();
		jQuery("#test-view").hide();
	});
});