/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Log,
	Element,
	OverlayRegistry,
	Layer,
	LayerUtils,
	nextUIUpdate,
	QUnitUtils,
	CommandFactory,
	Stack,
	RuntimeAuthoring,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.done(function() {
		QUnit.config.fixture = "";
		document.getElementById("qunit-fixture").style.display = "none";
	});

	QUnit.config.fixture = null;

	let oCompCont;

	const oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
	.then(function(oCompContainer) {
		oCompCont = oCompContainer;
	});

	QUnit.module("Given RTA is started...", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.oField = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroup = Element.getElementById("Comp1---idMain1--Dates");
			this.oForm = Element.getElementById("Comp1---idMain1--MainForm");

			this.oCommandStack = new Stack();

			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				commandStack: this.oCommandStack
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta)).then(function() {
				this.oFieldOverlay = OverlayRegistry.getOverlay(this.oField);
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			this.oCommandStack.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when removing a group using a command stack API", function(assert) {
			let iFiredCounter = 0;
			this.oRta.attachUndoRedoStackModified(function() {
				iFiredCounter++;
			});

			assert.strictEqual(this.oRta.canUndo(), false, "initially no undo is possible");
			assert.strictEqual(this.oRta.canRedo(), false, "initially no redo is possible");

			return new CommandFactory().getCommandFor(this.oGroup, "Remove", {
				removedElement: this.oGroup
			}, this.oGroupOverlay.getDesignTimeMetadata())

			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))

			.then(async function() {
				await nextUIUpdate();
				assert.strictEqual(this.oGroup.getVisible(), false, "then group is hidden...");
				assert.strictEqual(this.oRta.canUndo(), true, "after any change undo is possible");
				assert.strictEqual(this.oRta.canRedo(), false, "after any change no redo is possible");
				assert.ok(this.oRta.getToolbar().getControl("undo").getEnabled(), "Undo button of RTA is enabled");
			}.bind(this))

			.then(this.oCommandStack.undo.bind(this.oCommandStack))

			.then(async function() {
				await nextUIUpdate();
				assert.strictEqual(this.oGroup.getVisible(), true, "when the undo is called, then the group is visible again");
				assert.strictEqual(this.oRta.canUndo(), false, "after reverting a change undo is not possible");
				assert.strictEqual(this.oRta.canRedo(), true, "after reverting a change redo is possible");
			}.bind(this))

			.then(this.oRta.redo.bind(this.oRta))

			.then(async function() {
				await nextUIUpdate();
				assert.strictEqual(this.oGroup.getVisible(), false, "when the redo is called, then the group is not visible again");
				assert.strictEqual(iFiredCounter, 3, "undoRedoStackModified event of RTA is fired 3 times");
			}.bind(this))

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when renaming a form title using a property change command", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);

			const oInitialTitle = this.oForm.getTitle();

			return new CommandFactory({
				flexSettings: {
					layer: Layer.VENDOR
				}
			}).getCommandFor(this.oForm, "Property", {
				propertyName: "title",
				newValue: "Test Title"
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

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available and CTRL-Z/CTRL-Y are pressed...", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.fnUndoSpy = sandbox.spy(RuntimeAuthoring.prototype, "undo");
			this.fnRedoSpy = sandbox.spy(RuntimeAuthoring.prototype, "redo");

			// Start RTA
			const oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				flexSettings: {
					developerMode: false
				}
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta)).then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
				this.oGroupElement = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
				this.oElementOverlay = OverlayRegistry.getOverlay(this.oGroupElement);
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("with focus on an overlay", function(assert) {
			assert.ok(this.oGroupElement, "then the group element is available");
			assert.ok(this.oElementOverlay, "then the overlay for the group element is available");
			this.oElementOverlay.getDomRef().focus();

			RtaQunitUtils.triggerUndo();
			assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

			RtaQunitUtils.triggerRedo();
			assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oRta.getToolbar().getControl("exit").focus();

			RtaQunitUtils.triggerUndo();
			assert.equal(this.fnUndoSpy.callCount, 1, "then _onUndo was called once");

			RtaQunitUtils.triggerRedo();
			assert.equal(this.fnRedoSpy.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on an open dialog", function(assert) {
			const done = assert.async();
			this.oElementOverlay.focus();
			this.oElementOverlay.setSelected(true);

			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oElementOverlay, sinon).then(async function() {
				const oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
				// Track test instability issues - "setEnabled of undefined" error
				const oAddSiblingItem = oMenu.getItems().find((oItem) => oItem.getKey() === "CTX_ADD_ELEMENTS_AS_SIBLING");
				assert.ok(oAddSiblingItem, "then the 'Add Sibling' context menu item is available");
				if (!oAddSiblingItem) {
					Log.info(oMenu.getItems().map((oItem) => oItem.getKey()).join(", "), "Context Menu Items");
					assert.ok(false, "Test failed because 'Add Sibling' context menu item is not available");
					done();
					return;
				}
				oAddSiblingItem.setEnabled(true);
				QUnitUtils.triggerEvent("click", oMenu.getItems().find((oItem) => oItem.getIcon() === "sap-icon://add").getDomRef());

				function waitForDialog() {
					return new Promise(async function(resolve) {
						let oDialog = this.oRta.getPlugins().additionalElements.getDialog();
						let iDialogTimeoutCounter = 0;
						while (!oDialog) {
							// Wait until the dialog is available
							await nextUIUpdate();
							oDialog = this.oRta.getPlugins().additionalElements.getDialog();
							iDialogTimeoutCounter++;
							if (iDialogTimeoutCounter > 10) {
								assert.ok(false, "Dialog did not appear within expected time");
								resolve(null);
								return;
							}
						}
						resolve(oDialog);
					}.bind(this));
				}

				const oDialog = await waitForDialog.call(this);
				if (!oDialog) {
					done();
					return;
				}
				oDialog.attachOpened(async function() {
					RtaQunitUtils.triggerUndo();
					assert.equal(this.fnUndoSpy.callCount, 0, "then _onUndo was not called");
					RtaQunitUtils.triggerRedo();
					assert.equal(this.fnRedoSpy.callCount, 0, "then _onRedo was not called");
					const oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
					QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
					await nextUIUpdate();
					done();
				}.bind(this));
			}.bind(this));
		});
	});
});