/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	// Controls
	// internal
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/fl/FakeLrepConnector',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/qunit/RtaQunitUtils'
], function(
	RuntimeAuthoring,
	FakeLrepConnector,
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage,
	OverlayRegistry,
	RtaQunitUtils
) {
	"use strict";

	QUnit.start();


	QUnit.module("Given RTA is started...", {
		beforeEach : function(assert) {
			this._oCompCont = RtaQunitUtils.renderTestAppAt("test-view");
			var that = this;
			FakeLrepLocalStorage.deleteChanges();
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 0, "Local storage based LREP is empty");
			this.oField = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--Dates");
			this.oGeneralGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
			this.oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			this.oRta = new RuntimeAuthoring({
				rootControl : this._oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(function () {
						this.oFieldOverlay = OverlayRegistry.getOverlay(that.oField);
						this.oGroupOverlay = OverlayRegistry.getOverlay(that.oGroup);
						this.ooGeneralGroupOverlay = OverlayRegistry.getOverlay(that.oGeneralGroup);
						fnResolve();
					}.bind(this));
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			this._oCompCont.destroy();
			FakeLrepLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when removing a field,", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

		var oFieldToHide = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");
		var oFieldToHideOverlay = OverlayRegistry.getOverlay(oFieldToHide);
		var oCommandStack = this.oRta.getCommandStack();
		oCommandStack.attachModified(function() {
			var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
			if (oFirstExecutedCommand &&
				oFirstExecutedCommand.getName() === 'remove') {
				assert.strictEqual(oFieldToHide.getVisible(), false, " then field is not visible");
				this.oRta.stop();
			}
		}.bind(this));

		oFieldToHideOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFieldToHideOverlay.getDomRef(), jQuery.sap.KeyCodes.ENTER, false, false, false);

		oFieldToHideOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFieldToHideOverlay.getDomRef(), jQuery.sap.KeyCodes.DELETE);
	});

	QUnit.test("when moving a field (via cut and paste),", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
		var oCommandStack = this.oRta.getCommandStack();
		oCommandStack.attachModified(function(oEvent) {
			var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
			if (oFirstExecutedCommand &&
				oFirstExecutedCommand.getName() === "move") {
				var iIndex = this.oGroup.getGroupElements().length - 1;
				assert.equal(this.oGroup.getGroupElements()[iIndex].getId(), this.oField.getId(), " then the field is moved");
				this.oRta.stop();
			}
		}.bind(this));

		sap.ui.test.qunit.triggerKeydown(this.oFieldOverlay.getDomRef(), jQuery.sap.KeyCodes.X, false, false, true);
		sap.ui.test.qunit.triggerKeydown(this.oGroupOverlay.getDomRef(), jQuery.sap.KeyCodes.V, false, false, true);
	});

	QUnit.test("when renaming a group (via double click) and setting a new title to Test...", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);

		var done = assert.async();

		this.oGroupOverlay.focus();
		var $groupOverlay = this.oGroupOverlay.$();
		$groupOverlay.click();
		$groupOverlay.click();

		sap.ui.getCore().applyChanges();

		var $editableField = $groupOverlay.find(".sapUiRtaEditableField");

		assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
		assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

		var oCommandStack = this.oRta.getCommandStack();
		oCommandStack.attachModified(function(oEvent) {
			var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
			if (oFirstExecutedCommand &&
				oFirstExecutedCommand.getName() === "rename") {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oGroup.getLabel(), "Test", "then title of the group is Test");

				// timeout is needed because of the timeout in rta.Rename plugin
				setTimeout(function() {
					assert.strictEqual(this.oGroupOverlay.getDomRef(), document.activeElement, " and focus is on group overlay");
					$editableField = $groupOverlay.find(".sapUiRtaEditableField");
					assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
					this.oRta.stop().then(done);
				}.bind(this), 500);
			}
		}.bind(this));

		document.activeElement.innerHTML = "Test";
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ENTER, false, false, false);

	});

	QUnit.test("when renaming a group element (via context menu) and setting a new label to Test...", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
		var done = assert.async();

		this.oFieldOverlay.focus();
		var $fieldOverlay = this.oFieldOverlay.$();

		sap.ui.test.qunit.triggerKeydown(this.oFieldOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuItem = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl.getItems()[0];
		oContextMenuItem.getDomRef().click();
		sap.ui.getCore().applyChanges();

		var $editableField = $fieldOverlay.find(".sapUiRtaEditableField");

		assert.strictEqual($editableField.length, 1, " then the rename input field is rendered");
		assert.strictEqual($editableField.find(document.activeElement).length, 1, " and focus is in it");

		var oCommandStack = this.oRta.getCommandStack();
		oCommandStack.attachModified(function(oEvent) {
			var oFirstExecutedCommand = oCommandStack.getAllExecutedCommands()[0];
			if (oFirstExecutedCommand &&
				oFirstExecutedCommand.getName() === "rename") {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oField._getLabel().getText(), "Test", "then label of the group element is Test");

				// timeout is needed because of the timeout in rta.Rename plugin
				setTimeout(function() {
					assert.strictEqual(document.activeElement, this.oFieldOverlay.getDomRef(), " and focus is on field overlay");
					$editableField = $fieldOverlay.find(".sapUiRtaEditableField");
					assert.strictEqual($editableField.length, 0, " and the editable field is removed from dom");
					this.oRta.stop().then(done);
				}.bind(this), 500);
			}
		}.bind(this));

		document.activeElement.innerHTML = "Test";
		sap.ui.test.qunit.triggerKeydown(document.activeElement, jQuery.sap.KeyCodes.ENTER, false, false, false);
	});

	QUnit.test("when adding a group element (via context menu) - addODataProperty", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
		var done = assert.async();

		var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
		this.oFieldOverlay.focus();

		sap.ui.test.qunit.triggerKeydown(this.oFieldOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuItem = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl.getItems()[1];
		oContextMenuItem.getDomRef().click();
		sap.ui.getCore().applyChanges();

		oDialog.attachOpened(function() {
			var oFieldToAdd = oDialog._oList.getItems()[1];

			// observer gets called when the Group changes. Then the new field is on the UI.
			var oObserver = new MutationObserver(function(mutations) {
				var oGroupElements = this.oGeneralGroup.getGroupElements();
				var iIndex = oGroupElements.indexOf(this.oField) + 1;
				assert.equal(oGroupElements[iIndex].getLabelText(), oFieldToAdd.getContent()[0].getItems()[0].getText(), "the added element is at the correct position");
				assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");

				oObserver.disconnect();
				this.oRta.stop().then(done);
			}.bind(this));
			var oConfig = { attributes: false, childList: true, characterData: false, subtree : true};
			oObserver.observe(this.oForm.getDomRef(), oConfig);

			// select the field in the list and close the dialog with OK
			oFieldToAdd.focus();
			sap.ui.test.qunit.triggerKeydown(oFieldToAdd.getDomRef(), jQuery.sap.KeyCodes.ENTER, false, false, false);
			sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
			sap.ui.getCore().applyChanges();

		}.bind(this));
	});

	QUnit.test("when adding a group element (via context menu) - reveal", function(assert) {
		RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd(1, assert);
		var done = assert.async();

		// to reveal we have to remove the field first (otherwise it would be addODataProperty)
		var oFieldToRemove = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.ExpirationDate");
		var oFieldToHideOverlay = OverlayRegistry.getOverlay(oFieldToRemove);
		oFieldToHideOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFieldToHideOverlay.getDomRef(), jQuery.sap.KeyCodes.ENTER, false, false, false);
		oFieldToHideOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFieldToHideOverlay.getDomRef(), jQuery.sap.KeyCodes.DELETE);

		var oDialog = this.oRta.getPlugins()["additionalElements"].getDialog();
		this.oFieldOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(this.oFieldOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuItem = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl.getItems()[1];
		oContextMenuItem.getDomRef().click();
		sap.ui.getCore().applyChanges();

		oDialog.attachOpened(function() {
			var oFieldToAdd = oDialog.getElements().filter(function(oFoo) {return oFoo.type === "invisible";})[0];

			// observer gets called when the Group changes. Then the new field is on the UI.
			var oObserver = new MutationObserver(function(mutations) {
				var oGroupElements = this.oGeneralGroup.getGroupElements();
				var iIndex = oGroupElements.indexOf(this.oField) + 1;
				assert.equal(oGroupElements[iIndex].getLabelText(), oFieldToAdd.label, "the added element is at the correct position");
				assert.ok(oGroupElements[iIndex].getVisible(), "the new field is visible");
				assert.equal(oFieldToRemove.fieldLabel, oFieldToAdd.label, "the new field is the one that got deleted");

				oObserver.disconnect();
				this.oRta.stop().then(done);
			}.bind(this));
			var oConfig = { attributes: false, childList: true, characterData: false, subtree : true};
			oObserver.observe(this.oForm.getDomRef(), oConfig);

			// select the field in the list and close the dialog with OK
			oFieldToAdd.selected = true;
			sap.ui.qunit.QUnitUtils.triggerEvent("tap", oDialog._oOKButton.getDomRef());
			sap.ui.getCore().applyChanges();
		}.bind(this));
	});

	RtaQunitUtils.removeTestViewAfterTestsWhenCoverageIsRequested();
});
