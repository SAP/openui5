/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	RtaQunitUtils,
	Element,
	OverlayRegistry,
	States,
	VariantManagementState,
	FlexState,
	nextUIUpdate,
	QUnitUtils,
	CommandFactory,
	Stack,
	RuntimeAuthoring,
	sinon,
	FlexTestAPI
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "sap.ui.rta.test";

	function waitForCommandExecuted(oCommandStack) {
		return new Promise((resolve) => {
			oCommandStack.attachEventOnce("commandExecuted", resolve);
		});
	}

	QUnit.module("Given an app with a control variant...", {
		before: async () => {
			this.oCompContainer = await RtaQunitUtils.renderRuntimeAuthoringAppAt("qunit-fixture");
			return RtaQunitUtils.clear();
		},
		afterEach: () => {
			sandbox.restore();
			return RtaQunitUtils.clear();
		},
		after: () => {
			this.oCompContainer.destroy();
		}
	}, () => {
		QUnit.test("Complete variant deletion flow when condensing is enabled for the backend", async (assert) => {
			this.oCommandStack = new Stack();

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oCompContainer.getComponentInstance().getAggregation("rootControl"),
				commandStack: this.oCommandStack
			});

			await this.oRta.start();

			const oButton = Element.getElementById("Comp1---idMain1--lb1");
			const oButtonOverlay = OverlayRegistry.getOverlay(oButton);
			const oVMControlOverlay = OverlayRegistry.getOverlay("Comp1---idMain1--variantManagementBar");
			const sVMReference = "idMain1--variantManagementBar";
			const oVMControl = Element.getElementById("Comp1---idMain1--variantManagementBar");
			const oEmbeddedVM = oVMControl._getEmbeddedVM();

			// Remove button from bar
			const oRemoveCommand = await new CommandFactory().getCommandFor(oButton, "Remove", {
				removedElement: oButton
			}, oButtonOverlay.getDesignTimeMetadata(), sVMReference);
			this.oCommandStack.pushAndExecute(oRemoveCommand);
			await waitForCommandExecuted(this.oCommandStack);
			assert.strictEqual(oButton.getVisible(), false, "then the button is removed");
			assert.strictEqual(oVMControl.getModified(), true, "then the variant management control is modified");

			// Save new variant as default
			sandbox.stub(oEmbeddedVM, "_openSaveAsDialog").callsFake(() => {
				oVMControl.fireSave({
					name: "New Variant",
					overwrite: false,
					def: true
				});
			});
			const oControlVariantPlugin = this.oRta.getPlugins().controlVariant;
			oControlVariantPlugin.createSaveAsCommand([oVMControlOverlay]);
			await waitForCommandExecuted(this.oCommandStack);
			const oNewVariant = oEmbeddedVM.getItems().find((oItem) => {
				return oItem.getKey() === oVMControl._oVM.getSelectedKey();
			});
			assert.strictEqual(oVMControl.getModified(), false, "then the variant management control is saved");

			// Rename new variant
			const oVariantRenameCommand = await new CommandFactory().getCommandFor(oVMControl, "setTitle", {
				newText: "Renamed Variant"
			}, oVMControlOverlay.getDesignTimeMetadata(), sVMReference);
			await this.oCommandStack.pushAndExecute(oVariantRenameCommand);
			assert.strictEqual(oNewVariant.getTitle(), "Renamed Variant", "then the variant is renamed");

			// Save
			await this.oRta.save();
			assert.strictEqual(
				FlexTestAPI.getNumberOfChangesSynchronous("SessionStorage", sReference),
				4,
				"4 flex objects are saved - UI change, variant, variant management change and variant change"
			);

			// Remove second button from bar
			const oButton2 = Element.getElementById("Comp1---idMain1--lb2");
			const oButton2Overlay = OverlayRegistry.getOverlay(oButton2);
			const oRemoveCommand2 = await new CommandFactory().getCommandFor(oButton2, "Remove", {
				removedElement: oButton
			}, oButton2Overlay.getDesignTimeMetadata(), sVMReference);
			this.oCommandStack.pushAndExecute(oRemoveCommand2);
			await waitForCommandExecuted(this.oCommandStack);
			assert.strictEqual(oButton2.getVisible(), false, "then the button is removed");
			assert.strictEqual(oVMControl.getModified(), true, "then the variant management control is modified");

			// Rename new variant again
			const oVariantRenameCommand2 = await new CommandFactory().getCommandFor(oVMControl, "setTitle", {
				newText: "Renamed Variant Again"
			}, oVMControlOverlay.getDesignTimeMetadata(), sVMReference);
			await this.oCommandStack.pushAndExecute(oVariantRenameCommand2);
			assert.strictEqual(oNewVariant.getTitle(), "Renamed Variant Again", "then the variant is renamed again");

			// Delete new variant
			sandbox.stub(oEmbeddedVM, "_openManagementDialog").callsFake(() => {
				oVMControl.fireManage({
					deleted: [oNewVariant.getKey()]
				});
			});
			oControlVariantPlugin.configureVariants([oVMControlOverlay]);
			await waitForCommandExecuted(this.oCommandStack);

			const fnRunChecksAfterRemove = () => {
				assert.strictEqual(oVMControl.getModified(), false, "then the variant management control is not modified anymore");
				assert.strictEqual(oEmbeddedVM.getItems().length, 1, "then the variant is deleted");
				assert.strictEqual(oButton.getVisible(), true, "then the first button is visible again");
				assert.strictEqual(oButton2.getVisible(), true, "then the second button is visible again");
				const oVariantEntry = VariantManagementState.getAllVariants(sReference).find((oVar) => oVar.key === oNewVariant.getKey());
				assert.strictEqual(oVariantEntry.controlChanges.length, 1, "then only the previously persisted change remains");
				assert.strictEqual(
					oVariantEntry.controlChanges[0].getState(),
					States.LifecycleState.DELETED,
					"and it is in state DELETED"
				);
				assert.strictEqual(
					oVariantEntry.variantChanges.length,
					1,
					"then only the previously persisted variant change remains"
				);
				const [oSetTitleChange] = oVariantEntry.variantChanges;
				assert.strictEqual(oSetTitleChange.getChangeType(), "setTitle", "then the setTitle change remains");
				assert.strictEqual(oSetTitleChange.getState(), States.LifecycleState.DELETED, "then the setTitle is in state DELETED");
				const aVariantManagementChanges = VariantManagementState.getVariantManagementChanges({reference: sReference});
				assert.strictEqual(aVariantManagementChanges.length, 1, "then one variant management remains");
				assert.strictEqual(aVariantManagementChanges[0].getState(), States.LifecycleState.DELETED, "and it is DELETED");
			};

			fnRunChecksAfterRemove();

			// Undo
			await this.oCommandStack.undo();
			assert.strictEqual(oVMControl.getModified(), true, "then the variant management control is modified again");
			assert.strictEqual(oEmbeddedVM.getItems().length, 2, "then the variant is restored");
			assert.strictEqual(oButton.getVisible(), false, "then the first button is still removed");
			assert.strictEqual(oButton2.getVisible(), false, "then the second button is still removed");
			const oVariantEntryAfterUndo = VariantManagementState.getAllVariants(sReference).find(
				(oVar) => oVar.key === oNewVariant.getKey()
			);
			assert.strictEqual(oVariantEntryAfterUndo.controlChanges.length, 2, "then there are two control changes");
			assert.strictEqual(
				oVariantEntryAfterUndo.controlChanges[0].getState(),
				States.LifecycleState.PERSISTED,
				"the first control change is in state PERSISTED"
			);
			assert.strictEqual(
				oVariantEntryAfterUndo.controlChanges[1].getState(),
				States.LifecycleState.NEW,
				"the second control change is in state NEW"
			);
			assert.strictEqual(
				oVariantEntryAfterUndo.variantChanges.length,
				2,
				"then there are two setTitle variant changes and the setVisible change was removed"
			);
			const [oSetTitleChangeAfterUndo, oSecondSetTitleChangeAfterUndo] = oVariantEntryAfterUndo.variantChanges;
			assert.strictEqual(oSetTitleChangeAfterUndo.getChangeType(), "setTitle", "then the setTitle change remains");
			assert.strictEqual(oSecondSetTitleChangeAfterUndo.getChangeType(), "setTitle", "then the second setTitle change is restored");
			assert.strictEqual(
				oSetTitleChangeAfterUndo.getState(),
				States.LifecycleState.PERSISTED,
				"then the first setTitle is in state PERSISTED"
			);
			assert.strictEqual(
				oSecondSetTitleChangeAfterUndo.getState(),
				States.LifecycleState.NEW,
				"then the second setTitle is in state NEW"
			);
			const aVMChangesAfterUndo = VariantManagementState.getVariantManagementChanges({reference: sReference});
			assert.strictEqual(aVMChangesAfterUndo.length, 1, "then one variant management remains");
			assert.strictEqual(aVMChangesAfterUndo[0].getState(), States.LifecycleState.PERSISTED, "and it is PERSISTED");

			// Redo
			await this.oCommandStack.redo();
			fnRunChecksAfterRemove();

			// Save
			await this.oRta.save();
			assert.strictEqual(
				FlexTestAPI.getNumberOfChangesSynchronous("SessionStorage", sReference),
				0,
				"then all flex objects are removed"
			);
			assert.notOk(
				VariantManagementState.getAllVariants(sReference).includes(
					(oVar) => oVar.key === oNewVariant.getKey()
				),
				"then the variant is removed from the variant management state"
			);

			this.oRta.destroy();
		});

		QUnit.test("Personalization save and remove", (assert) => {
			const fnDone = assert.async();
			const oVMControl = Element.getElementById("Comp1---idMain1--variantManagementBar");

			oVMControl._createSaveAsDialog();
			const oEmbeddedVM = oVMControl._getEmbeddedVM();
			oEmbeddedVM.oSaveAsDialog.attachAfterOpen(() => {
				oEmbeddedVM.oInputName.setValue("New");

				const oUpdateStorageResponseStub = sandbox.stub(FlexState, "updateStorageResponse").callsFake(async (...aArgs) => {
					oUpdateStorageResponseStub.wrappedMethod.apply(this, aArgs);

					function updateStorageStubCheck() {
						oUpdateStorageResponseStub.wrappedMethod.apply(this, aArgs);
						assert.notOk(oUpdateStorageResponseStub.threw(), "then FlexState.updateStorageResponse does not throw an error");
						fnDone();
					}
					oUpdateStorageResponseStub.callsFake(updateStorageStubCheck);

					oVMControl.fireManage();
					oVMControl.openManagementDialog();

					// Delete new variant
					const oManagementTable = oVMControl.getManageDialog().getContent()[0];
					const aItems = oManagementTable.getItems();
					const aCells = aItems[1].getCells();
					const oDeleteButton = aCells[7].getFocusDomRef();
					QUnitUtils.triggerTouchEvent("tap", oDeleteButton, {
						srcControl: null
					});
					await nextUIUpdate();

					// Save
					const oSaveButton = oEmbeddedVM.oManagementSave.getFocusDomRef();
					QUnitUtils.triggerTouchEvent("tap", oSaveButton, {
						srcControl: null
					});
					await nextUIUpdate();
				});

				var oTarget = oEmbeddedVM.oSaveSave.getFocusDomRef();
				QUnitUtils.triggerTouchEvent("tap", oTarget, {
					srcControl: null
				});
			});
			oEmbeddedVM.openSaveAsDialog("STYLECLASS");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});