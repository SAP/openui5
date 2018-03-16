/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
	// Controls
	// internal
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/Stack',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/fl/Utils',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/qunit/RtaQunitUtils',
	'sap/ui/Device',
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	RuntimeAuthoring,
	Stack,
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage,
	Utils,
	OverlayRegistry,
	CommandFactory,
	RtaQunitUtils,
	Device,
	sinon) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("test-view");

	FakeLrepConnectorLocalStorage.enableFakeConnector();

	QUnit.module("Given RTA is started...", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");

			this.oField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--Dates");
			this.oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");

			this.oCommandStack = new Stack();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				commandStack : this.oCommandStack
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(function() {
						this.oFieldOverlay = OverlayRegistry.getOverlay(this.oField);
						this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);

						fnResolve();
					}.bind(this));
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			this.oCommandStack.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when removing a group using a command stack API", function(assert) {
		var done = assert.async();
		var iFiredCounter = 0;
		this.oRta.attachUndoRedoStackModified(function() {
			iFiredCounter++;
		});

		assert.strictEqual(this.oRta.canUndo(), false, "initially no undo is possible");
		assert.strictEqual(this.oRta.canRedo(), false, "initially no redo is possible");
		assert.notOk(this.oRta.getToolbar().getControl('publish').getEnabled(), "initially no Changes are existing");

		var oCommand = new CommandFactory().getCommandFor(this.oGroup, "Remove", {
			removedElement : this.oGroup
		}, this.oGroupOverlay.getDesignTimeMetadata());

		this.oCommandStack.pushAndExecute(oCommand)

		.then(function() {
			sap.ui.getCore().applyChanges();
			assert.strictEqual(this.oGroup.getVisible(), false, "then group is hidden...");
			assert.strictEqual(this.oRta.canUndo(), true, "after any change undo is possible");
			assert.strictEqual(this.oRta.canRedo(), false, "after any change no redo is possible");
			assert.ok(this.oRta.getToolbar().getControl('undo').getEnabled(), "Undo button of RTA is enabled");
			assert.ok(this.oRta.getToolbar().getControl('publish').getEnabled(), "Transport button of RTA is enabled");
		}.bind(this))

		.then(this.oCommandStack.undo.bind(this.oCommandStack))

		.then(function() {
			sap.ui.getCore().applyChanges();
			assert.strictEqual(this.oGroup.getVisible(), true, "when the undo is called, then the group is visible again");
			assert.strictEqual(this.oRta.canUndo(), false, "after reverting a change undo is not possible");
			assert.strictEqual(this.oRta.canRedo(), true, "after reverting a change redo is possible");
			assert.notOk(this.oRta.getToolbar().getControl('publish').getEnabled(), "Transport button of RTA is disabled");
		}.bind(this))

		.then(this.oRta.redo.bind(this.oRta))

		.then(function() {
			sap.ui.getCore().applyChanges();
			assert.strictEqual(this.oGroup.getVisible(), false, "when the redo is called, then the group is not visible again");
			assert.ok(this.oRta.getToolbar().getControl('publish').getEnabled(), "Transport button of RTA is enabled again");
			// pushAndExecute fires modified twice!
			assert.strictEqual(iFiredCounter, 4, "undoRedoStackModified event of RTA is fired twice");
			done();
		}.bind(this));
	});

	QUnit.test("when renaming a form title using a property change command", function(assert) {
		var done = assert.async();
		sandbox.stub(Utils, "getCurrentLayer").returns("VENDOR");

		var oInitialTitle = this.oForm.getTitle();

		var oCommand = new CommandFactory({
			flexSettings: {
				layer: "VENDOR"
			}
		}).getCommandFor(this.oForm, "Property", {
			propertyName : "title",
			oldValue : oInitialTitle,
			newValue : "Test Title"
		});

		this.oCommandStack.pushAndExecute(oCommand)

		.then(function() {
			assert.strictEqual(this.oForm.getTitle(), "Test Title", "then title is changed...");
		}.bind(this))

		.then(this.oCommandStack.undo.bind(this.oCommandStack))

		.then(function() {
			assert.strictEqual(this.oForm.getTitle(), oInitialTitle, "when the undo is called, then the form's title is restored");
			done();
		}.bind(this));
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available and CTRL-Z/CTRL-Y are pressed...", {
		beforeEach : function(assert) {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");

			this.fnUndoSpy = sandbox.spy(RuntimeAuthoring.prototype, "_onUndo");
			this.fnRedoSpy = sandbox.spy(RuntimeAuthoring.prototype, "_onRedo");

			// Start RTA
			var oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : true,
				flexSettings: {
					developerMode: false
				}
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(function() {
						this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
						this.oElementOverlay = OverlayRegistry.getOverlay(sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode"));
						fnResolve();
					}.bind(this));
				}.bind(this)),
				this.oRta.start()
			]);
		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oRta.destroy();
			Device.os.macintosh = this.bMacintoshOriginal;
			FakeLrepLocalStorage.deleteChanges();
		}
	});

	QUnit.test("with focus on an overlay", function(assert) {
		this.oElementOverlay.getDomRef().focus();

		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Z, false, false, true);
		assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Y, false, false, true);
		assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
	});

	QUnit.test("with focus on the toolbar", function(assert) {
		this.oRta.getToolbar().getControl('exit').focus();

		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Z, false, false, true);
		assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Y, false, false, true);
		assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
	});

	QUnit.test("with focus on an open dialog", function(assert) {
		var done = assert.async();

		this.oElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(this.oElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);
		var oContextMenuItem = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl.getItems()[1];
		oContextMenuItem.getDomRef().click();
		sap.ui.getCore().applyChanges();

		var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
		oDialog.attachOpened(function() {
		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Z, false, false, true);
			assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");

		sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Y, false, false, true);
			assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
			sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
			sap.ui.getCore().applyChanges();
			done();
		}.bind(this));
	});

	QUnit.test("during rename", function(assert) {
		var fnDone = assert.async();
		sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
			if (mParams.overlay === this.oElementOverlay) {
				sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Z, false, false, true);
				assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");

				sap.ui.test.qunit.triggerKeydown(document, jQuery.sap.KeyCodes.Y, false, false, true);
				assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
				fnDone();
			}
		}, this);

		this.oElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(this.oElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);
		var oContextMenuItem = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl.getItems()[0];
		oContextMenuItem.getDomRef().click();
	});

	RtaQunitUtils.removeTestViewAfterTestsWhenCoverageIsRequested();
});
