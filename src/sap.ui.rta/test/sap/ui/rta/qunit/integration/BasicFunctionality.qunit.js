/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/CommandFactory",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4"
], function(
	RuntimeAuthoring,
	Stack,
	CommandFactory,
	RtaQunitUtils,
	Layer,
	LayerUtils,
	OverlayRegistry,
	Device,
	QUnitUtils,
	KeyCodes,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");

	QUnit.begin(function () {
		QUnit.config.fixture = null;
	});

	QUnit.done(function () {
		QUnit.config.fixture = '';
		jQuery("#qunit-fixture").hide();
	});

	QUnit.module("Given RTA is started...", {
		beforeEach : function() {
			this.oField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--Dates");
			this.oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");

			this.oCommandStack = new Stack();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				commandStack : this.oCommandStack
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta)).then(function () {
				this.oFieldOverlay = OverlayRegistry.getOverlay(this.oField);
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			}.bind(this));
		},
		afterEach : function() {
			this.oRta.destroy();
			this.oCommandStack.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function () {
		QUnit.test("when removing a group using a command stack API", function(assert) {
			var iFiredCounter = 0;
			this.oRta.attachUndoRedoStackModified(function() {
				iFiredCounter++;
			});

			assert.strictEqual(this.oRta.canUndo(), false, "initially no undo is possible");
			assert.strictEqual(this.oRta.canRedo(), false, "initially no redo is possible");
			assert.notOk(this.oRta.getToolbar().getControl('publish').getEnabled(), "initially no Changes are existing");

			return new CommandFactory().getCommandFor(this.oGroup, "Remove", {
				removedElement : this.oGroup
			}, this.oGroupOverlay.getDesignTimeMetadata())

			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))

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
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when renaming a form title using a property change command", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);

			var oInitialTitle = this.oForm.getTitle();

			return new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			}).getCommandFor(this.oForm, "Property", {
				propertyName : "title",
				oldValue : oInitialTitle,
				newValue : "Test Title"
			})

			.then(function(oCommand) {
				return this.oCommandStack.pushAndExecute(oCommand);
			}.bind(this))

			.then(function() {
				assert.strictEqual(this.oForm.getTitle(), "Test Title", "then title is changed...");
			}.bind(this))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(function() {
				assert.strictEqual(this.oForm.getTitle(), oInitialTitle, "when the undo is called, then the form's title is restored");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available and CTRL-Z/CTRL-Y are pressed...", {
		beforeEach : function() {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

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

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta)).then(function () {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
				this.oElementOverlay = OverlayRegistry.getOverlay(sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode"));
			}.bind(this));
		},
		afterEach : function () {
			sandbox.restore();
			this.oRta.destroy();
			Device.os.macintosh = this.bMacintoshOriginal;
			return RtaQunitUtils.clear();
		}
	}, function () {
		QUnit.test("with focus on an overlay", function(assert) {
			this.oElementOverlay.getDomRef().focus();

			QUnitUtils.triggerKeydown(document, KeyCodes.Z, false, false, true);
			assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

			QUnitUtils.triggerKeydown(document, KeyCodes.Y, false, false, true);
			assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oRta.getToolbar().getControl('exit').focus();

			QUnitUtils.triggerKeydown(document, KeyCodes.Z, false, false, true);
			assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

			QUnitUtils.triggerKeydown(document, KeyCodes.Y, false, false, true);
			assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on an open dialog", function(assert) {
			var done = assert.async();

			this.oElementOverlay.focus();
			this.oElementOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oElementOverlay, sinon).then(function() {
				var oContextMenuButton = this.oRta.getPlugins()["contextMenu"].oContextMenuControl.getButtons()[1];
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();

				var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
				oDialog.attachOpened(function() {
					QUnitUtils.triggerKeydown(document, KeyCodes.Z, false, false, true);
					assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");
					QUnitUtils.triggerKeydown(document, KeyCodes.Y, false, false, true);
					assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
					sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
					sap.ui.getCore().applyChanges();
					done();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("during rename", function(assert) {
			var fnDone = assert.async();
			sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
				if (mParams.overlay === this.oElementOverlay) {
					QUnitUtils.triggerKeydown(document, KeyCodes.Z, false, false, true);
					assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");

					QUnitUtils.triggerKeydown(document, KeyCodes.Y, false, false, true);
					assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
					fnDone();
				}
			}, this);

			this.oElementOverlay.focus();
			this.oElementOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oElementOverlay, sinon).then(function() {
				var oContextMenuButton = this.oRta.getPlugins()["contextMenu"].oContextMenuControl.getButtons()[0];
				oContextMenuButton.firePress();
			}.bind(this));
		});
	});
});