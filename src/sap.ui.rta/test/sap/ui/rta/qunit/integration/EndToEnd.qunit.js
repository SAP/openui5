/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/dt/OverlayRegistry",
	"qunit/RtaQunitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/EventBus",
	"sap/ui/core/LabelEnablement"
], function(
	Layer,
	VersionsAPI,
	RuntimeAuthoring,
	RtaUtils,
	OverlayRegistry,
	RtaQunitUtils,
	QUnitUtils,
	KeyCodes,
	FlexTestAPI,
	sinon,
	nextUIUpdate,
	Element,
	EventBus,
	LabelEnablement
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oCompCont;
	var oView;

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

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});

			await this.oRta.start();

			this.oVictimOverlay = OverlayRegistry.getOverlay(this.oVictim);
			this.oCompanyCodeFieldOverlay = OverlayRegistry.getOverlay(this.oCompanyCodeField);
			this.oDatesGroupOverlay = OverlayRegistry.getOverlay(this.oDatesGroup);
			this.oBoundButton35FieldOverlay = OverlayRegistry.getOverlay(this.oBoundButton35Field);
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
						var oResult = oObject[sMethodName].wrappedMethod.apply(this, aArgs);
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

		function fnPressRenameAndEnsureFunctionality(assert, oControl, oRenameItem, sText) {
			var oFieldOverlay = this.oCompanyCodeFieldOverlay.getDomRef();

			return new Promise(function(fnResolve) {
				EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function(sChannel, sEvent, mParams) {
					if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
						var aEditableFields = Array.from(oFieldOverlay.querySelectorAll(".sapUiRtaEditableField"));

						assert.strictEqual(aEditableFields.length, 1, " then the rename input field is rendered");
						assert.ok(aEditableFields[0].contains(document.activeElement), " and focus is in it");
						Promise.all([
							new Promise(function(fnResolveOnCommandAdded) {
								var oCommandStack = this.oRta.getCommandStack();
								oCommandStack.attachModified(function() {
									var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
									if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "rename") {
										assert.strictEqual(
											this.oCompanyCodeField._getLabel().getText(),
											sText,
											`then label of the group element is ${sText}`
										);
										var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oControl}).length;
										assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
										fnResolveOnCommandAdded();
									}
								}.bind(this));
							}.bind(this)),
							new Promise(function(fnResolveWhenRenamed) {
								EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit",
									function(sChannel, sEvent, mParams) {
										if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
											assert.strictEqual(document.activeElement, this.oCompanyCodeFieldOverlay.getDomRef(),
												" and focus is on field overlay");
											var aEditableFields = Array.from(oFieldOverlay.querySelectorAll(".sapUiRtaEditableField"));
											assert.strictEqual(aEditableFields.length, 0, " and the editable field is removed from dom");
											fnResolveWhenRenamed();
										}
									}, this);
							}.bind(this))
						]).then(function() {
							stubShowMessageBoxOnRtaClose(this.oRta);
							this.oRta.stop().then(fnResolve);
						}.bind(this));

						var oEvent = new Event("keydown");
						oEvent.keyCode = KeyCodes.ENTER;
						document.activeElement.innerHTML = sText;
						document.activeElement.dispatchEvent(oEvent);
					}
				}, this);
				QUnitUtils.triggerEvent("click", oRenameItem.getDomRef());
			}.bind(this));
		}

		QUnit.test("when adding a group element via context menu (expanded context menu - reveal)", function(assert) {
			var fnDone = assert.async();

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("commandExecuted", function() {
				setTimeout(function() {
					// remove field is executed, reveal should be available
					var oDialog = this.oRta.getPlugins().additionalElements.getDialog();
					this.oCompanyCodeFieldOverlay.focus();

					// open context menu dialog
					this.oCompanyCodeFieldOverlay.setSelected(true);
					RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(async function() {
						var oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
						QUnitUtils.triggerEvent("click", oMenu._getVisualParent().getItems()[1].getDomRef());
						await nextUIUpdate();

						oDialog.attachOpened(async function() {
							var oFieldToAdd = oDialog.getElements().filter(function(oField) {
								return oField.type === "invisible";
							})[0];
							oCommandStack.attachModified(async function() {
								var aCommands = oCommandStack.getAllExecutedCommands();
								if (aCommands &&
									aCommands.length === 3) {
									await nextUIUpdate();

									var oGroupElements = this.oGeneralGroup.getGroupElements();
									var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
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
							var oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
							QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
							await nextUIUpdate();
						}.bind(this));
					}.bind(this));
				}.bind(this), 2000);
			}.bind(this));

			// to reveal we have to remove the field first (otherwise it would be addViaDelegate)
			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);
			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.DELETE);
		});

		QUnit.test("when adding a group element via context menu (expanded context menu - addViaDelegate)", function(assert) {
			var fnDone = assert.async();

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			var oDialog = this.oRta.getPlugins().additionalElements.getDialog();
			this.oCompanyCodeFieldOverlay.focus();
			this.oCompanyCodeFieldOverlay.setSelected(true);

			// open context menu (context menu) and select add field
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(async function() {
				oDialog.attachOpened(async function() {
					var oFieldToAdd = oDialog._oList.getItems()[1];
					var sFieldToAddText = oFieldToAdd.getContent()[0].getItems()[0].getText();

					// observer gets called when the Group changes. Then the new field is on the UI.
					var oObserver = new MutationObserver(function() {
						var oGroupElements = this.oGeneralGroup.getGroupElements();
						var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
						var oGroupElement = oGroupElements[iIndex];
						var oSmartField = oGroupElement && oGroupElement.getElements()[0];
						var oSmartFieldInnerControl = oSmartField && oSmartField.getFirstInnerControl();
						var bLabelIsInitialized = false;
						if (oSmartFieldInnerControl && LabelEnablement.getReferencingLabels(oSmartFieldInnerControl)[0] !== undefined) {
							bLabelIsInitialized = true;
						}

						if (bLabelIsInitialized) {
							assert.equal(oGroupElement.getLabelText(), sFieldToAddText, "the added element is at the correct position");
							assert.ok(oGroupElement.getVisible(), "the new field is visible");
							var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
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

					var oConfig = {attributes: false, childList: true, characterData: false, subtree: true};
					oObserver.observe(this.oForm.getDomRef(), oConfig);

					// select the field in the list and close the dialog with OK
					oFieldToAdd.focus();
					QUnitUtils.triggerKeydown(oFieldToAdd.getDomRef(), KeyCodes.ENTER, false, false, false);
					var oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
					QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
					await nextUIUpdate();
				}.bind(this));

				var oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
				var oContextMenuItem = oMenu.getItems()[1];
				assert.equal(oContextMenuItem.getText(), "Add: Field", "then the add field action button is available in the menu");
				QUnitUtils.triggerEvent("click", oMenu._getVisualParent().getItems()[1].getDomRef());
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when removing a field,", function(assert) {
			var fnDone = assert.async();
			var oCommandStack = this.oRta.getCommandStack();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oVictim}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function() {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
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
			QUnitUtils.triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);

			this.oVictimOverlay.focus();
			QUnitUtils.triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.DELETE);
		});
		QUnit.test("when moving a field (via cut and paste),", function(assert) {
			var fnDone = assert.async();
			var oCommandStack = this.oRta.getCommandStack();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function() {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand &&
					oFirstExecutedCommand.getName() === "move") {
					var iIndex = 0;
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

			var oCutPastePlugin = this.oRta.getPlugins().cutPaste;

			QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
			// need to wait until the valid targetzones get marked by the cut action
			oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
				QUnitUtils.triggerKeydown(this.oDatesGroupOverlay.getDomRef(), KeyCodes.V, false, false, true);
			}.bind(this), 0);
		});

		QUnit.test("when renaming a group (via double click) and setting a new title...", function(assert) {
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			this.oDatesGroupOverlay.focus();
			var oGroupOverlay = this.oDatesGroupOverlay.getDomRef();

			var fnDone = assert.async();

			EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function(sChannel, sEvent, mParams) {
				if (mParams.overlay === this.oDatesGroupOverlay) {
					var aEditableFields = Array.from(oGroupOverlay.querySelectorAll(".sapUiRtaEditableField"));

					assert.strictEqual(aEditableFields.length, 1, " then the rename input field is rendered");
					assert.strictEqual(aEditableFields[0].contains(document.activeElement), true, " and focus is in it");
					Promise.all([
						new Promise(function(fnResolveOnCommandAdded) {
							var oCommandStack = this.oRta.getCommandStack();
							oCommandStack.attachModified(function() {
								var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
								if (oFirstExecutedCommand &&
									oFirstExecutedCommand.getName() === "rename") {
									assert.strictEqual(this.oDatesGroup.getTitle(), "Test", "then title of the group is Test");
									iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
									assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
									fnResolveOnCommandAdded();
								}
							}.bind(this));
						}.bind(this)),
						new Promise(function(fnResolveWhenRenamed) {
							EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit", function(sChannel, sEvent, mParams) {
								if (mParams.overlay === this.oDatesGroupOverlay) {
									assert.strictEqual(
										this.oDatesGroupOverlay.getDomRef(),
										document.activeElement,
										" and focus is on group overlay"
									);
									aEditableFields = Array.from(oGroupOverlay.querySelectorAll(".sapUiRtaEditableField"));
									assert.strictEqual(aEditableFields.length, 0, " and the editable field is removed from dom");
									fnResolveWhenRenamed();
								}
							}, this);
						}.bind(this))
					]).then(function() {
						stubShowMessageBoxOnRtaClose(this.oRta);
						return this.oRta.stop();
					}.bind(this))
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function(iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
					})
					.then(fnDone);

					var oEvent = new Event("keydown");
					oEvent.keyCode = KeyCodes.ENTER;
					document.activeElement.innerHTML = "Test";
					document.activeElement.dispatchEvent(oEvent);
				}
			}, this);

			oGroupOverlay.click();
			oGroupOverlay.click();
		});

		QUnit.test("when adding a SimpleForm Field via context menu (expanded context menu) - reveal", function(assert) {
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			var fnDone = assert.async();
			var oForm = Element.getElementById("Comp1---idMain1--SimpleForm--Form");
			var oFormContainer = oForm.getFormContainers()[0];
			var oCommandStack = this.oRta.getCommandStack();
			var oDialog = this.oRta.getPlugins().additionalElements.getDialog();
			var oFieldOverlay = OverlayRegistry.getOverlay(oFormContainer.getFormElements()[1]);
			oFieldOverlay.focus();
			oFieldOverlay.setSelected(true);
			// open context menu (compact context menu)
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFieldOverlay).then(async function() {
				// wait for opening additional Elements dialog
				oDialog.attachOpened(async function() {
					var oFieldToAdd = oDialog.getElements().filter(function(oField) {
						return oField.type === "invisible";
					})[0];
					oCommandStack.attachModified(async function() {
						var aCommands = oCommandStack.getAllExecutedCommands();
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
					var oOkButton = Element.getElementById(`${oDialog.getId()}--rta_addDialogOkButton`);
					QUnitUtils.triggerEvent("tap", oOkButton.getDomRef());
					await nextUIUpdate();
				}.bind(this));

				var oMenu = this.oRta.getPlugins().contextMenu.oContextMenuControl;
				var oContextMenuItem = oMenu.getItems()[1];
				assert.equal(oContextMenuItem.getText(), "Add: Field", "then the add field action button is available in the menu");
				QUnitUtils.triggerEvent("click", oMenu._getVisualParent().getItems()[1].getDomRef());
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when making two dirty changes of the same type on a simple form field and switching from visualization to adaptation mode between the changes,", function(assert) {
			var fnDone = assert.async();
			var oForm = Element.getElementById("Comp1---idMain1--SimpleForm--Form");
			var oFormContainer = oForm.getFormContainers()[0];
			var oFormField = oFormContainer.getFormElements()[0];
			var oFormField2 = oFormContainer.getFormElements()[1];
			var oFieldOverlay = OverlayRegistry.getOverlay(oFormField);
			var oFieldOverlay2 = OverlayRegistry.getOverlay(oFormField2);
			var oCommandStack = this.oRta.getCommandStack();
			var oCutPastePlugin = this.oRta.getPlugins().cutPaste;
			assert.strictEqual(
				FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length,
				0,
				"then there are no dirty changes in the flex persistence"
			);

			var fnCutAndPaste = function() {
				assert.strictEqual(
					oCommandStack.getAllExecutedCommands()[0].getName(),
					"move",
					"then the move command is added to the stack"
				);
				this.oChangeVisualization = this.oRta.getChangeVisualization();
				return startVisualization(this.oRta)
				.then(function() {
					var aVizModel = this.oRta.getToolbar().getModel("visualizationModel").getData().changeCategories;
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
							QUnitUtils.triggerKeydown(oFieldOverlay2.getDomRef(), KeyCodes.V, false, false, true);
						}, 0);
						QUnitUtils.triggerKeydown(oFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
					});

					return this.oRta.setMode("adaptation");
				}.bind(this));
			}.bind(this);

			oCommandStack.attachEventOnce("modified", fnCutAndPaste);

			oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
				QUnitUtils.triggerKeydown(oFieldOverlay2.getDomRef(), KeyCodes.V, false, false, true);
			}, 0);
			QUnitUtils.triggerKeydown(oFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
		});

		QUnit.test("when renaming a group element via Context menu (compact context menu) and setting a new label...", function(assert) {
			var fnDone = assert.async();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			this.oCompanyCodeFieldOverlay.focus();

			var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "ContextMenu is open");
				// press rename button
				var oRenameItem = oContextMenuControl._getVisualParent().getItems()[0];
				fnPressRenameAndEnsureFunctionality.call(this, assert, this.oCompanyCodeField, oRenameItem, "TestCompactMenu")
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function(iNumberOfChanges) {
					assert.equal(iNumberOfChanges, 1);
				})
				.then(fnDone);
			}.bind(this));

			// open context menu (compact menu)
			QUnitUtils.triggerMouseEvent(this.oCompanyCodeFieldOverlay.getDomRef(), "click");
		});

		QUnit.test("when splitting a combined SmartForm GroupElement via context menu (expanded context menu) - split", function(assert) {
			var fnDone = assert.async();
			var oCombinedElement = Element.getElementById("Comp1---idMain1--Dates.BoundButton35");
			var oCombinedElementOverlay = OverlayRegistry.getOverlay(oCombinedElement);

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oCombinedElement}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no changes to publish in the flex persistence");

			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachCommandExecuted(async function() {
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

			var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", async function() {
				var oContextMenuItem = oContextMenuControl._getVisualParent().getItems().filter(function(oItem) {
					return oItem.getText() === "Split";
				})[0];
				assert.ok(oContextMenuItem, "the the split action button is available in the menu");
				QUnitUtils.triggerEvent("click", oContextMenuItem.getDomRef());
				await nextUIUpdate();
			});
			QUnitUtils.triggerKeyup(oCombinedElementOverlay.getDomRef(), KeyCodes.F10, true, false, false);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});