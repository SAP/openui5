/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"qunit/RtaQunitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/thirdparty/sinon-4"
], function (
	jQuery,
	RuntimeAuthoring,
	OverlayRegistry,
	DtUtil,
	RtaQunitUtils,
	QUnitUtils,
	KeyCodes,
	FlexTestAPI,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oView = oCompCont.getComponentInstance().oView;

	QUnit.module("Given RTA is started...", {
		before: function () {
			QUnit.config.fixture = null;
		},
		after: function () {
			QUnit.config.fixture = "";
		},
		beforeEach : function() {
			return RtaQunitUtils.clear(oView, true).then(function () {
				this.oVictim = sap.ui.getCore().byId("Comp1---idMain1--Victim");
				this.oCompanyCodeField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
				this.oBoundButton35Field = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
				this.oDatesGroup = sap.ui.getCore().byId("Comp1---idMain1--Dates");
				this.oGeneralGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
				this.oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");

				this.oRta = new RuntimeAuthoring({
					rootControl: oCompCont.getComponentInstance().getAggregation("rootControl")
				});
				return Promise.all([
					this.oRta.start(),
					new Promise(function (fnResolve) {
						this.oRta.attachStart(function () {
							this.oVictimOverlay = OverlayRegistry.getOverlay(this.oVictim);
							this.oCompanyCodeFieldOverlay = OverlayRegistry.getOverlay(this.oCompanyCodeField);
							this.oDatesGroupOverlay = OverlayRegistry.getOverlay(this.oDatesGroup);
							this.oBoundButton35FieldOverlay = OverlayRegistry.getOverlay(this.oBoundButton35Field);
							fnResolve();
						}.bind(this));
					}.bind(this))
				]);
			}.bind(this));
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		// FIXME: change as soon as a public method for this is available
		function fnWaitForExecutionAndSerializationBeingDone() {
			return this.oRta.getCommandStack()._oLastCommand;
		}

		function fnPressRenameAndEnsureFunctionality(assert, oControl, oRenameButton, sText) {
			var $fieldOverlay = this.oCompanyCodeFieldOverlay.$();

			return new Promise(function(fnResolve) {
				oRenameButton.firePress();

				sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function (sChannel, sEvent, mParams) {
					if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
						var $editableField = $fieldOverlay.find(".sapUiRtaEditableField");

						assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
						assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

						Promise.all([
							new Promise(function (fnResolveOnCommandAdded) {
								var oCommandStack = this.oRta.getCommandStack();
								oCommandStack.attachModified(function () {
									var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
									if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "rename") {
										fnWaitForExecutionAndSerializationBeingDone.call(this).then(function () {
											assert.strictEqual(this.oCompanyCodeField._getLabel().getText(), sText, "then label of the group element is " + sText);
											var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oControl}).length;
											assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
											fnResolveOnCommandAdded();
										}.bind(this));
									}
								}.bind(this));
							}.bind(this)),
							new Promise(function (fnResolveWhenRenamed) {
								sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit", function (sChannel, sEvent, mParams) {
									if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
										assert.strictEqual(document.activeElement, this.oCompanyCodeFieldOverlay.getDomRef(), " and focus is on field overlay");
										$editableField = $fieldOverlay.find(".sapUiRtaEditableField");
										assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
										fnResolveWhenRenamed();
									}
								}, this);
							}.bind(this))
						]).then(function () {
							this.oRta.stop().then(fnResolve);
						}.bind(this));

						document.activeElement.innerHTML = sText;
						QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ENTER, false, false, false);
					}
				}, this);
			}.bind(this));
		}

		QUnit.test("when adding a group element via context menu (expanded context menu - reveal)", function(assert) {
			var fnDone = assert.async();

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("commandExecuted", function () {
				setTimeout(function () {
					// remove field is executed, reveal should be available
					var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
					this.oCompanyCodeFieldOverlay.focus();

					// open context menu dialog
					this.oCompanyCodeFieldOverlay.setSelected(true);
					RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(function () {
						var oContextMenuButton = this.oRta.getPlugins()["contextMenu"].oContextMenuControl.getButtons()[1];
						oContextMenuButton.firePress();
						sap.ui.getCore().applyChanges();

						oDialog.attachOpened(function () {
							var oFieldToAdd = oDialog.getElements().filter(function (oField) {
								return oField.type === "invisible";
							})[0];
							oCommandStack.attachModified(function () {
								var aCommands = oCommandStack.getAllExecutedCommands();
								if (aCommands &&
									aCommands.length === 3) {
									sap.ui.getCore().applyChanges();

									fnWaitForExecutionAndSerializationBeingDone.call(this).then(function () {
										var oGroupElements = this.oGeneralGroup.getGroupElements();
										var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
										assert.equal(oGroupElements[iIndex].getLabelText(), oFieldToAdd.label, "the added element is at the correct position");
										assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
										assert.equal(this.oBoundButton35Field.fieldLabel, oFieldToAdd.label, "the new field is the one that got deleted");
										iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
										assert.strictEqual(iDirtyChangesCount, 3, "then there are three dirty changes in the flex persistence");
										return this.oRta.stop();
									}.bind(this))
									.then(RtaQunitUtils.getNumberOfChangesForTestApp)
									.then(function (iNumberOfChanges) {
										assert.equal(iNumberOfChanges, 3);
									})
									.then(fnDone);
								}
							}.bind(this));

							// select the field in the list and close the dialog with OK
							oFieldToAdd.selected = true;
							sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
							sap.ui.getCore().applyChanges();
						}.bind(this));
					}.bind(this));
				}.bind(this), 0);
			}.bind(this));

			// to reveal we have to remove the field first (otherwise it would be addODataProperty)
			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);
			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.DELETE);
		});

		QUnit.test("when adding a group element via context menu (expanded context menu - addODataProperty)", function(assert) {
			var fnDone = assert.async();

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
			var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
			this.oCompanyCodeFieldOverlay.focus();
			this.oCompanyCodeFieldOverlay.setSelected(true);

			// open context menu (context menu) and select add field
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, this.oCompanyCodeFieldOverlay).then(function () {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				oContextMenuControl.attachEventOnce("Opened", function () {
					var oContextMenuButton = oContextMenuControl.getButtons()[1];
					assert.equal(oContextMenuButton.getText(), "Add: Field", "then the add field action button is available in the menu");
					oContextMenuButton.firePress();
					sap.ui.getCore().applyChanges();
				});

				oDialog.attachOpened(function () {
					var oFieldToAdd = oDialog._oList.getItems()[1];
					var sFieldToAddText = oFieldToAdd.getContent()[0].getItems()[0].getText();

					// observer gets called when the Group changes. Then the new field is on the UI.
					var oObserver = new MutationObserver(function () {
						var oGroupElements = this.oGeneralGroup.getGroupElements();
						var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
						assert.equal(oGroupElements[iIndex].getLabelText(), sFieldToAddText, "the added element is at the correct position");
						assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
						var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oCompanyCodeField}).length;
						assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
						oObserver.disconnect();
						this.oRta.stop()
						.then(RtaQunitUtils.getNumberOfChangesForTestApp)
						.then(function (iNumberOfChanges) {
							assert.equal(iNumberOfChanges, 1);
						})
						.then(fnDone);
					}.bind(this));

					var oConfig = {attributes: false, childList: true, characterData: false, subtree: true};
					oObserver.observe(this.oForm.getDomRef(), oConfig);

					// select the field in the list and close the dialog with OK
					oFieldToAdd.focus();
					QUnitUtils.triggerKeydown(oFieldToAdd.getDomRef(), KeyCodes.ENTER, false, false, false);
					sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
					sap.ui.getCore().applyChanges();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when removing a field,", function(assert) {
			var fnDone = assert.async();
			var oCommandStack = this.oRta.getCommandStack();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oVictim}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function () {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "remove") {
					//TODO fix timing as modified is called before serializer is triggered...
					fnWaitForExecutionAndSerializationBeingDone.call(this)
						.then(function () {
							assert.strictEqual(this.oVictim.getVisible(), false, " then field is not visible");
							iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oVictim}).length;
							assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
							return this.oRta.stop();
						}.bind(this))
						.then(RtaQunitUtils.getNumberOfChangesForTestApp)
						.then(function (iNumberOfChanges) {
							assert.equal(iNumberOfChanges, 1);
						})
						.then(fnDone);
				}
			}.bind(this));

			this.oVictimOverlay.focus();
			QUnitUtils.triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);

			this.oVictimOverlay.focus();
			QUnitUtils.triggerKeydown(this.oVictimOverlay.getDomRef(), KeyCodes.DELETE);
		});

		QUnit.test("when moving a field (via cut and paste),", function(assert) {
			var fnDone = assert.async();
			var oCommandStack = this.oRta.getCommandStack();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			oCommandStack.attachModified(function () {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand &&
					oFirstExecutedCommand.getName() === "move") {
					fnWaitForExecutionAndSerializationBeingDone.call(this).then(function () {
						var iIndex = 0;
						assert.equal(this.oDatesGroup.getGroupElements()[iIndex].getId(), this.oCompanyCodeField.getId(), " then the field is moved to first place");
						iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
						assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
						return this.oRta.stop();
					}.bind(this))
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function (iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
					})
					.then(fnDone);
				}
			}.bind(this));

			var oCutPastePlugin = this.oRta.getPlugins().cutPaste;

			QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
			// need to wait until the valid targetzones get marked by the cut action
			oCutPastePlugin.getElementMover().attachEventOnce("validTargetZonesActivated", function () {
				QUnitUtils.triggerKeydown(this.oDatesGroupOverlay.getDomRef(), KeyCodes.V, false, false, true);
			}.bind(this), 0);
		});

		QUnit.test("when renaming a group (via double click) and setting a new title...", function(assert) {
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			this.oDatesGroupOverlay.focus();
			var $groupOverlay = this.oDatesGroupOverlay.$();

			var fnDone = assert.async();

			sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function (sChannel, sEvent, mParams) {
				if (mParams.overlay === this.oDatesGroupOverlay) {
					var $editableField = $groupOverlay.find(".sapUiRtaEditableField");

					assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
					assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

					Promise.all([
						new Promise(function (fnResolveOnCommandAdded) {
							var oCommandStack = this.oRta.getCommandStack();
							oCommandStack.attachModified(function () {
								var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
								if (oFirstExecutedCommand &&
									oFirstExecutedCommand.getName() === "rename") {
									fnWaitForExecutionAndSerializationBeingDone.call(this).then(function () {
										assert.strictEqual(this.oDatesGroup.getLabel(), "Test", "then title of the group is Test");
										iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
										assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
										fnResolveOnCommandAdded();
									}.bind(this));
								}
							}.bind(this));
						}.bind(this)),
						new Promise(function (fnResolveWhenRenamed) {
							sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit", function (sChannel, sEvent, mParams) {
								if (mParams.overlay === this.oDatesGroupOverlay) {
									assert.strictEqual(this.oDatesGroupOverlay.getDomRef(), document.activeElement, " and focus is on group overlay");
									$editableField = $groupOverlay.find(".sapUiRtaEditableField");
									assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
									fnResolveWhenRenamed();
								}
							}, this);
						}.bind(this))
					]).then(function () {
						return this.oRta.stop();
					}.bind(this))
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function (iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
					})
					.then(fnDone);

					document.activeElement.innerHTML = "Test";
					QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ENTER, false, false, false);
				}
			}, this);

			$groupOverlay.click();
			$groupOverlay.click();
		});

		QUnit.test("when adding a SimpleForm Field via context menu (expanded context menu) - reveal", function(assert) {
			var fnDone = assert.async();
			var oForm = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm--Form");
			var oFormContainer = oForm.getFormContainers()[0];
			var oFieldToHide = oFormContainer.getFormElements()[0];
			var oFieldToHideOverlay = OverlayRegistry.getOverlay(oFieldToHide);

			function checkOverlay(oEvent, oData) {
				var oOverlayCreated = oEvent.getParameters().elementOverlay;
				if (oOverlayCreated.getElement().getId() === oData.controlId) {
					this.oRta._oDesignTime.detachEvent("elementOverlayCreated", checkOverlay, this);
					oData.resolve(oOverlayCreated);
				}
			}

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			var oCommandStack = this.oRta.getCommandStack();
			var oFieldOverlay;
			oCommandStack.attachEventOnce("commandExecuted", function () {
				setTimeout(function () {
					DtUtil.waitForSynced(this.oRta._oDesignTime)().then(function () {
						// remove field is executed, reveal should be available
						var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
						oFormContainer = oForm.getFormContainers()[0];
						var oField = oFormContainer.getFormElements()[1];
						oFieldOverlay = OverlayRegistry.getOverlay(oField);

						// BCP: 1970331115 - Simple form destroys and re-created all content async, when aggregation content is either added or remoeved.
						// TODO: Remove this promise, when this issue is fixed.
						new Promise(function (fnResolve) {
							if (!oFieldOverlay) {
								this.oRta._oDesignTime.attachEvent("elementOverlayCreated", {
									resolve : fnResolve,
									controlId : oField.getId()
								}, checkOverlay, this);
							} else {
								fnResolve(oFieldOverlay);
							}
						}.bind(this))
							.then(function (oCreatedOverlay) {
								oFieldOverlay = oCreatedOverlay;
								oFieldOverlay.focus();
								oFieldOverlay.setSelected(true);
								// open context menu (compact context menu)
								RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFieldOverlay).then(function () {
									var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
									oContextMenuControl.attachEventOnce("Opened", function () {
										var oContextMenuButton = oContextMenuControl.getButtons()[1];
										assert.equal(oContextMenuButton.getText(), "Add: Field", "the the add field action button is available in the menu");
										oContextMenuButton.firePress();
										sap.ui.getCore().applyChanges();
									});

									// wait for opening additional Elements dialog
									oDialog.attachOpened(function () {
										var oFieldToAdd = oDialog.getElements().filter(function (oField) {
											return oField.type === "invisible";
										})[0];
										oCommandStack.attachModified(function () {
											var aCommands = oCommandStack.getAllExecutedCommands();
											if (aCommands &&
												aCommands.length === 3) {
												fnWaitForExecutionAndSerializationBeingDone.call(this)
													.then(function () {
														sap.ui.getCore().applyChanges();
													})
													.then(function () {
														iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
														assert.strictEqual(iDirtyChangesCount, 3, "then there are three dirty changes in the flex persistence");
														return this.oRta.stop();
													}.bind(this))
													.then(RtaQunitUtils.getNumberOfChangesForTestApp).then(function (iNumberOfChanges) {
														assert.equal(iNumberOfChanges, 3);
													})
													.then(fnDone);
											}
										}.bind(this));

										// select the field in the list and close the dialog with OK
										oFieldToAdd.selected = true;
										sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
										sap.ui.getCore().applyChanges();
									}.bind(this));
								}.bind(this));
							}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));

			// to reveal we have to remove the field first (otherwise it would be addODataProperty)
			oFieldToHideOverlay.focus();
			oFieldToHideOverlay.setSelected(true);
			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachEventOnce("Opened", function () {
				var oContextMenuButton = oContextMenuControl.getButtons()[2];
				assert.equal(oContextMenuButton.getText(), "Remove", "the 'remove' action button is available in the menu");
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();
			});
			QUnitUtils.triggerKeyup(oFieldToHideOverlay.getDomRef(), KeyCodes.F10, true, false, false);
		});

		QUnit.test("when renaming a group element via Context menu (compact context menu) and setting a new label...", function(assert) {
			var fnDone = assert.async();
			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : this.oCompanyCodeField}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");

			this.oCompanyCodeFieldOverlay.focus();

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachOpened(function () {
				assert.ok(oContextMenuControl.getPopover(false).isOpen(), "ContextMenu is open");
				// press rename button
				var oRenameButton = oContextMenuControl.getButtons()[0];
				fnPressRenameAndEnsureFunctionality.call(this, assert, this.oCompanyCodeField, oRenameButton, "TestCompactMenu")
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function (iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
					})
					.then(fnDone);
			}.bind(this));

			// open context menu (compact menu)
			QUnitUtils.triggerMouseEvent(this.oCompanyCodeFieldOverlay.getDomRef(), "click");
		});

		QUnit.test("when splitting a combined SmartForm GroupElement via context menu (expanded context menu) - split", function(assert) {
			var fnDone = assert.async();
			var oCombinedElement = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			var oCombinedElementOverlay = OverlayRegistry.getOverlay(oCombinedElement);

			var iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : oCombinedElement}).length;
			assert.strictEqual(iDirtyChangesCount, 0, "then there are no changes to publish in the flex persistence");

			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachCommandExecuted(function () {
				fnWaitForExecutionAndSerializationBeingDone.call(this)
					.then(function () {
						sap.ui.getCore().applyChanges();
						iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector : oCombinedElement}).length;
						assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
						return this.oRta.stop();
					}.bind(this))
					.then(RtaQunitUtils.getNumberOfChangesForTestApp)
					.then(function (iNumberOfChanges) {
						assert.equal(iNumberOfChanges, 1);
					})
					.then(fnDone);
			}, this);

			// open context menu (expanded context menu) on fucused overlay
			oCombinedElementOverlay.focus();
			oCombinedElementOverlay.setSelected(true);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachEventOnce("Opened", function () {
				var oContextMenuButton = oContextMenuControl.getButtons().filter(function (oButton) {
					return oButton.getText() === "Split";
				})[0];
				assert.ok(oContextMenuButton, "the the split action button is available in the menu");
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();
			});
			QUnitUtils.triggerKeyup(oCombinedElementOverlay.getDomRef(), KeyCodes.F10, true, false, false);
		});
	});

	oView.getController().isDataReady().then(function () {
		QUnit.start();
	});

	QUnit.done(function () {
		oView.destroy();
		oCompCont.destroy();
		jQuery("#qunit-fixture").hide();
	});
});