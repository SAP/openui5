/* global QUnit */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/fl/FakeLrepConnectorSessionStorage',
	'sap/ui/fl/FakeLrepSessionStorage',
	'sap/ui/dt/OverlayRegistry',
	'qunit/RtaQunitUtils',
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	'sap/ui/thirdparty/sinon-4'

], function (
	jQuery,
	RuntimeAuthoring,
	FakeLrepConnectorSessionStorage,
	FakeLrepSessionStorage,
	OverlayRegistry,
	RtaQunitUtils,
	ChangePersistenceFactory,
	QUnitUtils,
	KeyCodes,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given RTA is started...", {
		before: function () {
			FakeLrepConnectorSessionStorage.enableFakeConnector();
			QUnit.config.fixture = null;
		},
		after: function () {
			FakeLrepConnectorSessionStorage.disableFakeConnector();
			QUnit.config.fixture = '';
		},
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();
			assert.equal(FakeLrepSessionStorage.getNumChanges(), 0, "Session storage based LREP is empty");
			this.oCompanyCodeField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oBoundButton35Field = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--Dates");
			this.oGeneralGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
			this.oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(function () {
						this.oCompanyCodeFieldOverlay = OverlayRegistry.getOverlay(this.oCompanyCodeField);
						this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
						this.ooGeneralGroupOverlay = OverlayRegistry.getOverlay(this.oGeneralGroup);
						this.oBoundButton35FieldOverlay = OverlayRegistry.getOverlay(this.oBoundButton35Field);
						fnResolve();
					}.bind(this));
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach: function () {
			this.oRta.destroy();
			FakeLrepSessionStorage.deleteChanges();
			sandbox.restore();
		}
	}, function () {
		// FIXME: change as soon as a public method for this is available
		var fnWaitForExecutionAndSerializationBeingDone = function() {
			return this.oRta.getCommandStack()._oLastCommand;
		};
		var fnPressRenameAndEnsureFunctionality = function(assert, oChangePersistence, oRenameButton, sText) {
			var $fieldOverlay = this.oCompanyCodeFieldOverlay.$();

			return new Promise(function(fnResolve, fnReject) {
				oRenameButton.firePress();

				sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
					if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
						var $editableField = $fieldOverlay.find(".sapUiRtaEditableField");

						assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
						assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

						Promise.all([
							new Promise(function (fnResolve) {
								var oCommandStack = this.oRta.getCommandStack();
								oCommandStack.attachModified(function(oEvent) {
									var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
									if (oFirstExecutedCommand && oFirstExecutedCommand.getName() === "rename") {
										fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
											assert.strictEqual(this.oCompanyCodeField._getLabel().getText(), sText, "then label of the group element is " + sText);
											assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there is 1 dirty change in the FL ChangePersistence");
											fnResolve();
										}.bind(this));
									}
								}.bind(this));
							}.bind(this)),
							new Promise(function (fnResolve) {
								sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.stopEdit', function (sChannel, sEvent, mParams) {
									if (mParams.overlay === this.oCompanyCodeFieldOverlay) {
										assert.strictEqual(document.activeElement, this.oCompanyCodeFieldOverlay.getDomRef(), " and focus is on field overlay");
										$editableField = $fieldOverlay.find(".sapUiRtaEditableField");
										assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
										fnResolve();
									}
								}, this);
							}.bind(this))
						]).then(function () {
							return this.oRta.stop();
						}.bind(this))
						.then(fnResolve);

						document.activeElement.innerHTML = sText;
						QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ENTER, false, false, false);
					}
				}, this);
			}.bind(this));
		};

		QUnit.test("when adding a group element via context menu (expanded context menu - reveal)", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(3, assert);
			var done = assert.async();

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("commandExecuted", function() {
				setTimeout(function() {
					// remove field is executed, reveal should be available
					var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
					this.oCompanyCodeFieldOverlay.focus();

					// open context menu dialog
					QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.F10, true, false, false);
					var oContextMenuButton = this.oRta.getPlugins()["contextMenu"].oContextMenuControl.getButtons()[1];
					oContextMenuButton.firePress();
					sap.ui.getCore().applyChanges();

					oDialog.attachOpened(function() {
						var oFieldToAdd = oDialog.getElements().filter(function(oField) {return oField.type === "invisible";})[0];
						oCommandStack.attachModified(function(oEvent) {
							var aCommands = oCommandStack.getAllExecutedCommands();
							if (aCommands &&
								aCommands.length  === 3) {
								sap.ui.getCore().applyChanges();

								fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
									var oGroupElements = this.oGeneralGroup.getGroupElements();
									var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
									assert.equal(oGroupElements[iIndex].getLabelText(), oFieldToAdd.label, "the added element is at the correct position");
									assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
									assert.equal(this.oBoundButton35Field.fieldLabel, oFieldToAdd.label, "the new field is the one that got deleted");
									assert.equal(oChangePersistence.getDirtyChanges().length, 3, "then there are 3 dirty change in the FL ChangePersistence");
								}.bind(this))

								.then(this.oRta.stop.bind(this.oRta))

								.then(done);
								}
						}.bind(this));

						// select the field in the list and close the dialog with OK
						oFieldToAdd.selected = true;
						sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
						sap.ui.getCore().applyChanges();
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
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
			var done = assert.async();

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
			this.oCompanyCodeFieldOverlay.focus();

			// open context menu (context menu) and select add field
			QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.F10, true, false, false);
			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachEventOnce("Opened", function() {
				var oContextMenuButton = oContextMenuControl.getButtons()[1];
				assert.equal(oContextMenuButton.getText(), "Add: Field", "then the add field action button is available in the menu");
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();
			});

			oDialog.attachOpened(function() {
				var oFieldToAdd = oDialog._oList.getItems()[1];
				var sFieldToAddText = oFieldToAdd.getContent()[0].getItems()[0].getText();

				// observer gets called when the Group changes. Then the new field is on the UI.
				var oObserver = new MutationObserver(function(mutations) {
					var oGroupElements = this.oGeneralGroup.getGroupElements();
					var iIndex = oGroupElements.indexOf(this.oCompanyCodeField) + 1;
					assert.equal(oGroupElements[iIndex].getLabelText(), sFieldToAddText, "the added element is at the correct position");
					assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
					assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there is 1 dirty change in the FL ChangePersistence");

					oObserver.disconnect();
					this.oRta.stop().then(done);
				}.bind(this));
				var oConfig = { attributes: false, childList: true, characterData: false, subtree : true};
				oObserver.observe(this.oForm.getDomRef(), oConfig);

				// select the field in the list and close the dialog with OK
				oFieldToAdd.focus();
				QUnitUtils.triggerKeydown(oFieldToAdd.getDomRef(), KeyCodes.ENTER, false, false, false);
				sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
				sap.ui.getCore().applyChanges();

			}.bind(this));
		});

		QUnit.test("when removing a field,", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

			var oCommandStack = this.oRta.getCommandStack();

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oBoundButton35Field);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			oCommandStack.attachModified(function() {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand &&
					oFirstExecutedCommand.getName() === 'remove') {
						//TODO fix timing as modified is called before serializer is triggered...
					fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
						assert.strictEqual(this.oBoundButton35Field.getVisible(), false, " then field is not visible");
						assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there is 1 dirty change in the FL ChangePersistence");
						this.oRta.stop();
					}.bind(this));
				}
			}.bind(this));

			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.ENTER, false, false, false);

			this.oBoundButton35FieldOverlay.focus();
			QUnitUtils.triggerKeydown(this.oBoundButton35FieldOverlay.getDomRef(), KeyCodes.DELETE);
		});

		QUnit.test("when moving a field (via cut and paste),", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
			var oCommandStack = this.oRta.getCommandStack();

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			oCommandStack.attachModified(function(oEvent) {
				var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
				if (oFirstExecutedCommand &&
					oFirstExecutedCommand.getName() === "move") {
					fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
						var iIndex = 0;
						assert.equal(this.oGroup.getGroupElements()[iIndex].getId(), this.oCompanyCodeField.getId(), " then the field is moved to first place");
						assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there is 1 dirty change in the FL ChangePersistence");
						this.oRta.stop();
					}.bind(this));
				}
			}.bind(this));

			QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.X, false, false, true);
			QUnitUtils.triggerKeydown(this.oGroupOverlay.getDomRef(), KeyCodes.V, false, false, true);
		});

		QUnit.test("when renaming a group (via double click) and setting a new title...", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oGroup);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			this.oGroupOverlay.focus();
			var $groupOverlay = this.oGroupOverlay.$();

			var done = assert.async();

			sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
				if (mParams.overlay === this.oGroupOverlay) {
					var $editableField = $groupOverlay.find(".sapUiRtaEditableField");

					assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
					assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

					Promise.all([
						new Promise(function (fnResolve) {
							var oCommandStack = this.oRta.getCommandStack();
							oCommandStack.attachModified(function(oEvent) {
								var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
								if (oFirstExecutedCommand &&
									oFirstExecutedCommand.getName() === "rename") {
									fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
										assert.strictEqual(this.oGroup.getLabel(), "Test", "then title of the group is Test");
										assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there is 1 dirty change in the FL ChangePersistence");
										fnResolve();
									}.bind(this));
								}
							}.bind(this));
						}.bind(this)),
						new Promise(function (fnResolve) {
							sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.stopEdit', function (sChannel, sEvent, mParams) {
								if (mParams.overlay === this.oGroupOverlay) {
									assert.strictEqual(this.oGroupOverlay.getDomRef(), document.activeElement, " and focus is on group overlay");
									$editableField = $groupOverlay.find(".sapUiRtaEditableField");
									assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
									fnResolve();
								}
							}, this);
						}.bind(this))
					]).then(function () {
						this.oRta.stop().then(done);
					}.bind(this));

					document.activeElement.innerHTML = "Test";
					QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ENTER, false, false, false);
				}
			}, this);

			$groupOverlay.click();
			$groupOverlay.click();
		});

		QUnit.test("when adding a SimpleForm Field via context menu (expanded context menu) - reveal", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(3, assert);
			var done = assert.async();

			var oForm = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm--Form");
			var oFormContainer = oForm.getFormContainers()[0];
			var oFieldToHide = oFormContainer.getFormElements()[0];
			var oFieldToHideOverlay = OverlayRegistry.getOverlay(oFieldToHide);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachEventOnce("commandExecuted", function() {
				setTimeout(function() {
					// remove field is executed, reveal should be available
					var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
					oFormContainer = oForm.getFormContainers()[0];
					var oField = oFormContainer.getFormElements()[1];
					var oFieldOverlay = OverlayRegistry.getOverlay(oField);
					oFieldOverlay.focus();

					// open context menu (compact context menu)
					QUnitUtils.triggerKeydown(oFieldOverlay.getDomRef(), KeyCodes.F10, true, false, false);
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					oContextMenuControl.attachOpened(function() {
						var oContextMenuButton = oContextMenuControl.getButtons()[1];
						assert.equal(oContextMenuButton.getText(), "Add: Field", "the the add field action button is available in the menu");
						oContextMenuButton.firePress();
						sap.ui.getCore().applyChanges();
					});

					// wait for opening additional Elements dialog
					oDialog.attachOpened(function() {
						var oFieldToAdd = oDialog.getElements().filter(function(oField) {return oField.type === "invisible";})[0];
						oCommandStack.attachModified(function(oEvent) {
							var aCommands = oCommandStack.getAllExecutedCommands();
							if (aCommands &&
								aCommands.length  === 3) {
								fnWaitForExecutionAndSerializationBeingDone.call(this).then(function() {
									sap.ui.getCore().applyChanges();
									assert.equal(oChangePersistence.getDirtyChanges().length, 3, "then there are 3 dirty change in the FL ChangePersistence");
								})
								.then(this.oRta.stop.bind(this.oRta))

								.then(done);
							}
						}.bind(this));

						// select the field in the list and close the dialog with OK
						oFieldToAdd.selected = true;
						sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
						sap.ui.getCore().applyChanges();
					}.bind(this));
				}.bind(this), 0);
			}.bind(this));

			// to reveal we have to remove the field first (otherwise it would be addODataProperty)
			oFieldToHideOverlay.focus();
			QUnitUtils.triggerKeydown(oFieldToHideOverlay.getDomRef(), KeyCodes.F10, true, false, false);
			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachEventOnce("Opened", function() {
				var oContextMenuButton = oContextMenuControl.getButtons()[2];
				assert.equal(oContextMenuButton.getText(), "Remove", "the the add field action button is available in the menu");
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();
			});
		});

		QUnit.test("when renaming a group element via context menu (expanded context menu) and setting a new label...", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			this.oCompanyCodeFieldOverlay.focus();

			// open context menu (expanded menu) and press rename button
			QUnitUtils.triggerKeydown(this.oCompanyCodeFieldOverlay.getDomRef(), KeyCodes.F10, true, false, false);
			var oContextMenuButton = this.oRta.getPlugins()["contextMenu"].oContextMenuControl.getButtons()[0];

			return fnPressRenameAndEnsureFunctionality.call(this, assert, oChangePersistence, oContextMenuButton, 'TestExpandedMenu');
		});

		QUnit.test("when renaming a group element via Context menu (compact context menu) and setting a new label...", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
			var done = assert.async();

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oCompanyCodeField);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			this.oCompanyCodeFieldOverlay.focus();

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachOpened(function() {
				assert.ok(oContextMenuControl.bOpen, "ContextMenu should be opened");
				// press rename button
				var oRenameButton = oContextMenuControl.getButtons()[0];
				fnPressRenameAndEnsureFunctionality.call(this, assert, oChangePersistence, oRenameButton, 'TestCompactMenu').then(done);
			}.bind(this));

			// open context menu (compact menu)
			QUnitUtils.triggerMouseEvent(this.oCompanyCodeFieldOverlay.getDomRef(), "click");
		});

		QUnit.test("when splitting a combined SmartForm GroupElement via context menu (expanded context menu) - split", function(assert) {
			RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
			var done = assert.async();

			var oCombinedElement = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			var oCombinedElementOverlay = OverlayRegistry.getOverlay(oCombinedElement);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oCombinedElement);
			assert.equal(oChangePersistence.getDirtyChanges().length, 0, "then there is no dirty change in the FL ChangePersistence");

			var oCommandStack = this.oRta.getCommandStack();
			oCommandStack.attachCommandExecuted(function() {
				fnWaitForExecutionAndSerializationBeingDone.call(this)
					.then(function() {
						sap.ui.getCore().applyChanges();
						assert.equal(oChangePersistence.getDirtyChanges().length, 1, "then there ia a dirty change in the FL ChangePersistence");
					})
					.then(this.oRta.stop.bind(this.oRta))
					.then(done);
			}, this);

			// open context menu (expanded context menu) on fucused overlay
			oCombinedElementOverlay.focus();

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			oContextMenuControl.attachEventOnce("Opened", function() {
				var oContextMenuButton = oContextMenuControl.getButtons().filter(function (oButton) {
					return oButton.getText() === 'Split';
				})[0];
				assert.ok(oContextMenuButton, "the the split action button is available in the menu");
				oContextMenuButton.firePress();
				sap.ui.getCore().applyChanges();
			});
			QUnitUtils.triggerKeydown(oCombinedElementOverlay.getDomRef(), KeyCodes.F10, true, false, false);
		});
	});

	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oView = oCompCont.getComponentInstance().oView;
	oView.getController().isDataReady().then(function () {
		QUnit.start();
	});

	QUnit.done(function () {
		oView.destroy();
		oCompCont.destroy();
		jQuery("#qunit-fixture").hide();
	});
});