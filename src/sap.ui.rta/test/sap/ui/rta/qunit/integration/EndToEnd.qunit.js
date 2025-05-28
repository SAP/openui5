/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/ui/core/Element",
	"sap/ui/core/LabelEnablement",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	RtaQunitUtils,
	Element,
	LabelEnablement,
	OverlayRegistry,
	KeyCodes,
	QUnitUtils,
	nextUIUpdate,
	RuntimeAuthoring,
	RtaUtils,
	sinon,
	FlexTestAPI
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	let oCompCont;
	let oView;

	function triggerKeydown(oTargetDomRef, iKeyCode, bShiftKey = false, bAltKey = false, bCtrlKey = false, bMetaKey = false) {
		const oEvent = new KeyboardEvent("keydown", {
			keyCode: iKeyCode,
			which: iKeyCode,
			shiftKey: bShiftKey,
			altKey: bAltKey,
			ctrlKey: bCtrlKey,
			metaKey: bMetaKey,
			bubbles: true,
			cancelable: true
		});

		// Dispatch the event on the target DOM element
		oTargetDomRef.dispatchEvent(oEvent);
	}

	QUnit.module("Given RTA is started...", {
		before() {
			QUnit.config.fixture = null;
			return RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
			.then(function(oCompContainer) {
				oCompCont = oCompContainer;
				oView = Element.getElementById("Comp1---idMain1");
				return oView.getController().isDataReady();
			});
		},
		after() {
			QUnit.config.fixture = "";
			oCompCont.destroy();
			oView.destroy();
		},
		async beforeEach() {
			await RtaQunitUtils.clear(oView, true);

			this.oVictim = Element.getElementById("Comp1---idMain1--Victim");
			this.oCompanyCodeField = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oBoundButton35Field = Element.getElementById("Comp1---idMain1--Dates.BoundButton35");
			this.oDatesGroup = Element.getElementById("Comp1---idMain1--Dates");
			this.oGeneralGroup = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument");
			this.oForm = Element.getElementById("Comp1---idMain1--MainForm");
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oButton = Element.getElementById("Comp1---idMain1--lb1");

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});

			await this.oRta.start();

			this.oVictimOverlay = OverlayRegistry.getOverlay(this.oVictim);
			this.oCompanyCodeFieldOverlay = OverlayRegistry.getOverlay(this.oCompanyCodeField);
			this.oDatesGroupOverlay = OverlayRegistry.getOverlay(this.oDatesGroup);
			this.oBoundButton35FieldOverlay = OverlayRegistry.getOverlay(this.oBoundButton35Field);
			this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		function startVisualization(oRta) {
			oRta.setMode("visualization");
			return waitForMethodCall(oRta.getToolbar(), "setModel");
		}

		function waitForMethodCall(oObject, sMethodName) {
			// Returns a promise which is resolved with the return value
			// of the given method after it was first called
			// Doesn't work with event handlers
			return new Promise(function(resolve) {
				sandbox.stub(oObject, sMethodName)
				.callsFake(function(...aArgs) {
					if (oObject[sMethodName].wrappedMethod) {
						const oResult = oObject[sMethodName].wrappedMethod.apply(this, aArgs);
						resolve(oResult);
					}
				});
			})
			.then(function() {
				oObject[sMethodName].restore();
			});
		}

		function stubShowMessageBoxOnRtaClose(oRta) {
			return sandbox.stub(RtaUtils, "showMessageBox")
			.resolves(oRta._getTextResources().getText("BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE"));
		}

		QUnit.test("when adding a group element via context menu (expanded context menu - reveal)", function(assert) {
			const fnDone = assert.async();

			let iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			const oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("modified", function() {
				setTimeout(function() {
					// remove field is executed, reveal should be available
					const oDialog = this.oRta.getPlugins().additionalElements.getDialog();
					this.oCompanyCodeFieldOverlay.focus();

					// open context menu dialog
					this.oCompanyCodeFieldOverlay.setSelected(true);
					RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(async function() {
						const oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
						const oAddIconDomRef = oMenu.getItems().find((oItem) => oItem.getIcon() === "sap-icon://add").getDomRef();
						const oClickEvent = new Event("click", {
							bubbles: true,
							cancelable: true
						});
						oAddIconDomRef.dispatchEvent(oClickEvent);
						await nextUIUpdate();

						oDialog.attachOpened(async function() {
							const oFieldToAdd = oDialog.getElements().filter(function(oField) {
								return oField.type === "invisible";
							})[0];
							oCommandStack.attachModified(async function() {
								const aCommands = oCommandStack.getAllExecutedCommands();
								if (aCommands &&
									aCommands.length === 3) {
									await nextUIUpdate();

									const oGroupElements = this.oGeneralGroup.getGroupElements();
									const iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
									assert.equal(
										oGroupElements[iIndex].getLabelText(),
										oFieldToAdd.label,
										"the added element is at the correct position"
									);
									assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
									assert.equal(
										this.oBoundButton35Field.__label,
										oFieldToAdd.label,
										"the new field is the one that got deleted"
									);
									iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
									assert.strictEqual(iDirtyChangesCount, 3, "then there are three dirty changes in the flex persistence");
									stubShowMessageBoxOnRtaClose(this.oRta);
									await this.oRta.stop();
									const iNumberOfChanges = await RtaQunitUtils.getNumberOfChangesForTestApp();

									// hide and unhide get condensed, so only the add is saved
									assert.equal(iNumberOfChanges, 1);

									fnDone();
								}
								return undefined;
							}.bind(this));

							// select the field in the list and close the dialog with OK
							oFieldToAdd.selected = true;
							const oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
							QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
							await nextUIUpdate();
						}.bind(this));
					}.bind(this));
				}.bind(this), 2000);
			}.bind(this));

			// to reveal we have to remove the field first (otherwise it would be addViaDelegate)
			this.oBoundButton35FieldOverlay.focus();
			triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);
			this.oBoundButton35FieldOverlay.focus();
			triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.DELETE);
		});

		QUnit.test("when adding a group element via context menu (expanded context menu - addViaDelegate)", function(assert) {
			const fnDone = assert.async();

			const iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			const oDialog = this.oRta.getPlugins().additionalElements.getDialog();
			this.oCompanyCodeFieldOverlay.focus();
			this.oCompanyCodeFieldOverlay.setSelected(true);

			// open context menu (context menu) and select add field
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(async function() {
				oDialog.attachOpened(async function() {
					const oFieldToAdd = oDialog._oList.getItems()[1];
					const sFieldToAddText = oFieldToAdd.getContent()[0].getItems()[0].getText();

					// observer gets called when the Group changes. Then the new field is on the UI.
					const oObserver = new MutationObserver(function() {
						const oGroupElements = this.oGeneralGroup.getGroupElements();
						const iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
						const oGroupElement = oGroupElements[iIndex];
						const oSmartField = oGroupElement && oGroupElement.getElements()[0];
						const oSmartFieldInnerControl = oSmartField && oSmartField.getFirstInnerControl();
						let bLabelIsInitialized = false;
						if (oSmartFieldInnerControl && LabelEnablement.getReferencingLabels(oSmartFieldInnerControl)[0] !== undefined) {
							bLabelIsInitialized = true;
						}

						if (bLabelIsInitialized) {
							assert.equal(oGroupElement.getLabelText(), sFieldToAddText, "the added element is at the correct position");
							assert.ok(oGroupElement.getVisible(), "the new field is visible");
							const iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
							assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
							oObserver.disconnect();
							stubShowMessageBoxOnRtaClose(this.oRta);
							this.oRta.stop()
							.then(RtaQunitUtils.getNumberOfChangesForTestApp)
							.then(function(iNumberOfChanges) {
								assert.equal(iNumberOfChanges, 1);
							})
							.then(fnDone);
						}
					}.bind(this));

					const oConfig = {attributes: false, childList: true, characterData: false, subtree: true};
					oObserver.observe(this.oForm.getDomRef(), oConfig);

					// select the field in the list and close the dialog with OK
					oFieldToAdd.focus();
					triggerKeydown(oFieldToAdd.getDomRef(), KeyCodes.ENTER, false, false, false);
					const oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
					QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
					await nextUIUpdate();
				}.bind(this));

				const oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
				const oContextMenuItem = oMenu.getItems().find((oItem) => oItem.getKey() === "CTX_ADD_ELEMENTS_AS_SIBLING");
				assert.equal(oContextMenuItem.getText(), "Add: Field", "then the add field action button is available in the menu");
				QUnitUtils.triggerEvent("click", oMenu.getItems().find((oItem) => oItem.getIcon() === "sap-icon://add").getDomRef());
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when removing a field,", function(assert) {
			const fnDone = assert.async();
			const oCommandStack = this.oRta.getCommandStack();
			let iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oVictim}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function() {
				const oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "remove") {
					assert.strictEqual(this.oVictim.getVisible(), false, " then field is not visible");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oVictim}).length;
					assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
					stubShowMessageBoxOnRtaClose(this.oRta);
					return this.oRta.stop()
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function(iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
						fnDone();
					});
				}
				return undefined;
			}.bind(this));

			this.oVictimOverlay.focus();
			triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);

			this.oVictimOverlay.focus();
			triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.DELETE);
		});
		QUnit.test("when moving a field (via cut and paste),", function(assert) {
			const fnDone = assert.async();
			const oCommandStack = this.oRta.getCommandStack();
			let iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function() {
				const oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand &&
					oFirstExecutedCommand.getName() === "move") {
					const iIndex = 0;
					assert.equal(
						this.oDatesGroup.getGroupElements()[iIndex].getId(),
						this.oCompanyCodeField.getId(),
						" then the field is moved to first place"
					);
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
					assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
					stubShowMessageBoxOnRtaClose(this.oRta);
					return this.oRta.stop()
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function(iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
						fnDone();
					});
				}
				return undefined;
			}.bind(this));

			const oCutPastePlugin = this.oRta.getPlugins().cutPaste;

			triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
			// need to wait until the valid targetzones get marked by the cut action
			oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
				triggerKeydown(this.oDatesGroupOverlay.getDomRef(), KeyCodes.V, false, false, true);
			}.bind(this), 0);
		});

		QUnit.test("when adding a SimpleForm Field via context menu (expanded context menu) - reveal", function(assert) {
			let iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			const fnDone = assert.async();
			const oForm = Element.getElementById("Comp1---idMain1--SimpleForm--Form");
			const oFormContainer = oForm.getFormContainers()[0];
			const oCommandStack = this.oRta.getCommandStack();
			const oDialog = this.oRta.getPlugins().additionalElements.getDialog();
			const oFieldOverlay = OverlayRegistry.getOverlay(oFormContainer.getFormElements()[1]);
			oFieldOverlay.focus();
			oFieldOverlay.setSelected(true);
			// open context menu (compact context menu)
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFieldOverlay).then(async function() {
				// wait for opening additional Elements dialog
				oDialog.attachOpened(async function() {
					const oFieldToAdd = oDialog.getElements().filter(function(oField) {
						return oField.type === "invisible";
					})[0];
					oCommandStack.attachModified(async function() {
						const aCommands = oCommandStack.getAllExecutedCommands();
						if (aCommands && aCommands.length === 1) {
							await nextUIUpdate();

							iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
							assert.strictEqual(iDirtyChangesCount, 1, "then there are three dirty changes in the flex persistence");
							stubShowMessageBoxOnRtaClose(this.oRta);
							return this.oRta.stop()
							.then(RtaQunitUtils.getNumberOfChangesForTestApp)
							.then(function(iNumberOfChanges) {
								assert.equal(iNumberOfChanges, 1);
								fnDone();
							});
						}
						return undefined;
					}.bind(this));

					// select the field in the list and close the dialog with OK
					oFieldToAdd.selected = true;
					const oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
					QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
					await nextUIUpdate();
				}.bind(this));

				const oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
				const oContextMenuItem = oMenu.getItems()[1];
				assert.equal(oContextMenuItem.getText(), "Add: Field", "then the add field action button is available in the menu");
				QUnitUtils.triggerEvent("click", oMenu.getItems()[1].getDomRef());
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when making two dirty changes of the same type on a simple form field and switching from visualization to adaptation mode between the changes,", function(assert) {
			const fnDone = assert.async();
			const oForm = Element.getElementById("Comp1---idMain1--SimpleForm--Form");
			let oFormContainer = oForm.getFormContainers()[0];
			let oFormField = oFormContainer.getFormElements()[0];
			let oFormField2 = oFormContainer.getFormElements()[1];
			let oFieldOverlay = OverlayRegistry.getOverlay(oFormField);
			let oFieldOverlay2 = OverlayRegistry.getOverlay(oFormField2);
			const oCommandStack = this.oRta.getCommandStack();
			const oCutPastePlugin = this.oRta.getPlugins().cutPaste;
			assert.strictEqual(
				FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length,
				0,
				"then there are no dirty changes in the flex persistence"
			);

			const fnCutAndPaste = function() {
				assert.strictEqual(
					oCommandStack.getAllExecutedCommands()[0].getName(),
					"move",
					"then the move command is added to the stack"
				);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				return startVisualization(this.oRta)
				.then(function() {
					let aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
					assert.strictEqual(aVizModel[2].count, 1, "then one move change is registered");
					// SimpleForm recreates all elements after cut&paste, thus we need to fetch them again
					[oFormContainer] = oForm.getFormContainers();
					[oFormField, oFormField2] = oFormContainer.getFormElements();
					oFieldOverlay = OverlayRegistry.getOverlay(oFormField);
					oFieldOverlay2 = OverlayRegistry.getOverlay(oFormField2);

					oCommandStack.attachEventOnce("modified", (function() {
						assert.strictEqual(
							oCommandStack.getAllExecutedCommands()[0].getName(),
							"move",
							"then the second move command is added to the stack"
						);
						return startVisualization(this.oRta)
						.then(function() {
							aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
							assert.strictEqual(aVizModel[2].count, 2, "then two move changes are registered");
							fnDone();
						}.bind(this));
					}.bind(this)));

					Promise.all([
						new Promise(function(resolve) { this.oRta.attachEventOnce("modeChanged", resolve); }.bind(this)),
						new Promise(function(resolve) { this.oRta._oDesignTime.attachEventOnce("synced", resolve); }.bind(this))
					])
					.then(function() {
						oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
							triggerKeydown(oFieldOverlay2.getDomRef(), KeyCodes.V, false, false, true);
						}, 0);
						triggerKeydown(oFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
					});

					return this.oRta.setMode("adaptation");
				}.bind(this));
			}.bind(this);

			oCommandStack.attachEventOnce("modified", fnCutAndPaste);

			oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
				triggerKeydown(oFieldOverlay2.getDomRef(), KeyCodes.V, false, false, true);
			}, 0);
			triggerKeydown(oFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
		});

		QUnit.test("when renaming a button", function(assert) {
			const fnDone = assert.async();
			const sNewText = "TestRenameWithMenu";

			const iDirtyChangesCount = FlexTestAPI.getDirtyChanges({ selector: this.oCompanyCodeField }).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are initially no dirty changes in the flex persistence");

			this.oButtonOverlay.focus();
			const { oContextMenuControl } = this.oRta.getPlugins().contextMenu;
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", async () => {
				assert.ok(true, "ContextMenu is open");

				const oRenameChecksPromise = new Promise(function(fnResolveOnCommandAdded) {
					const oCommandStack = this.oRta.getCommandStack();
					oCommandStack.attachModified(function() {
						const oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
						if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "rename") {
							assert.strictEqual(
								this.oButton.getText(),
								sNewText,
								`then label of the button is ${sNewText}`
							);
							const iDirtyChangesCount = FlexTestAPI.getDirtyChanges({ selector: this.oButton }).length;
							assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
							fnResolveOnCommandAdded();
						}
					}.bind(this));
				}.bind(this));

				RtaQunitUtils.simulateRename(sandbox, sNewText, () => {
					// press rename button
					const oRenameItem = oContextMenuControl.getItems()[0];
					QUnitUtils.triggerEvent("click", oRenameItem.getDomRef());
				});

				await oRenameChecksPromise;
				stubShowMessageBoxOnRtaClose(this.oRta);
				await this.oRta.stop();

				const iNumberOfChanges = await RtaQunitUtils.getNumberOfChangesForTestApp();
				assert.strictEqual(iNumberOfChanges, 1, "then one change is saved");
				fnDone();
			});

			// open context menu
			const oClickEvent = new Event("click", {
				bubbles: true,
				cancelable: true
			});
			this.oButtonOverlay.getDomRef().dispatchEvent(oClickEvent);
		});

		QUnit.test("when splitting a combined SmartForm GroupElement via context menu (expanded context menu) - split", function(assert) {
			const fnDone = assert.async();
			const oCombinedElement = Element.getElementById("Comp1---idMain1--Dates.BoundButton35");
			const oCombinedElementOverlay = OverlayRegistry.getOverlay(oCombinedElement);

			let iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oCombinedElement}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no changes to publish in the flex persistence");

			const oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("modified", async function() {
				await nextUIUpdate();
				iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oCombinedElement}).length;
				assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
				stubShowMessageBoxOnRtaClose(this.oRta);
				return this.oRta.stop()
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function(iNumberOfChanges) {
					assert.equal(iNumberOfChanges, 1);
					fnDone();
				});
			}, this);

			// open context menu (expanded context menu) on fucused overlay
			oCombinedElementOverlay.focus();
			oCombinedElementOverlay.setSelected(true);

			const {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", async function() {
				const oContextMenuItem = oContextMenuControl.getItems().filter(function(oItem) {
					return oItem.getText() === "Split";
				})[0];
				assert.ok(oContextMenuItem, "the the split action button is available in the menu");
				QUnitUtils.triggerEvent("click", oContextMenuItem.getDomRef());
				await nextUIUpdate();
			});
			const oEvent = new KeyboardEvent("keyup", {
				keyCode: 121,
				which: 121,
				shiftKey: true
			});
			oCombinedElementOverlay.getDomRef().dispatchEvent(oEvent);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});