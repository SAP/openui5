/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	FieldExtensibility,
	AddElementsDialog,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oTextResources = oCore.getLibraryResourceBundle("sap.ui.rta");

	function createDialog() {
		var aElements = [
			{
				selected: false,
				label: "label1",
				tooltip: "tooltip1",
				elementId: "field1",
				originalLabel: "original",
				type: "invisible"
			},
			{
				selected: true,
				label: "label2",
				tooltip: "tooltip2",
				name: "field2",
				type: "odata"
			},
			{
				selected: true,
				label: "label3",
				tooltip: "tooltip3",
				parentPropertyName: "complexPropName",
				name: "field3",
				type: "odata"
			},
			{
				selected: false,
				label: "label4",
				tooltip: "tooltip4",
				parentPropertyName: "duplicateComplexPropName",
				duplicateName: true,
				name: "field4",
				type: "odata"
			},
			{
				selected: false,
				label: "label5",
				tooltip: "tooltip5",
				name: "field5",
				type: "delegate"
			}
		];

		var oAddElementsDialog = new AddElementsDialog({
			title: "hugo"
		});

		oAddElementsDialog.setElements(aElements);
		return oAddElementsDialog;
	}

	QUnit.module("Given that a AddElementsDialog is available...", {
		beforeEach() {
			sandbox.stub(FieldExtensibility, "getTexts").resolves({
				headerText: "extensibilityHeaderText",
				tooltip: "extensibilityTooltip"
			});
			this.oAddElementsDialog = createDialog();
		},
		afterEach() {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when item is selected, focus should persist", function(assert) {
			var done = assert.async();

			function getItemByPath(aItems, sBindingPath) {
				return aItems.filter(function(oItem) {
					return oItem.getBindingContext().getPath() === sBindingPath;
				})[0];
			}

			this.oAddElementsDialog._oDialogPromise.then(function() {
				var oList = oCore.byId(`${this.oAddElementsDialog.getId()}--` + `rta_addElementsDialogList`);
				var sBindingPath = oList.getItems()[0].getBindingContext().getPath();

				this.oAddElementsDialog.attachOpened(function() {
					var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
					oTargetItem.getDomRef().focus();
					assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
					oTargetItem.getDomRef().dispatchEvent(new Event("touchstart"));

					// Wait until list is re-rendered
					setTimeout(function() {
						var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
						assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
						done();
					});
				});
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized and open is called,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.getTitle(), "hugo", "then the title is set");
				assert.equal(this._oList.getItems().length, 5, "then 5 elements internally known");
				assert.equal(this.getElements().length, 5, "then 5 elements externally known");
				assert.equal(this.getSelectedElements().length, 2, "then 2 selected elements");
				assert.equal(this.getCustomFieldEnabled(), false, "then the customField-button is disabled");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[1].getText(), "was original", "then the originalLabel is set");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldsEnabled set and open is called", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldEnabled(true);
			this.oAddElementsDialog.attachOpenCustomField(function() {
				assert.ok(true, "then the openCustomField event is fired");
				done();
			});
			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this.getCustomFieldEnabled(), true, "then the button is enabled");
				var oCustomFieldButton = oCore.byId(`${this.getId()}--` + `rta_customFieldButton`);
				oCustomFieldButton.firePress();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldsEnabled set and no Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldEnabled(true);
			this.oAddElementsDialog.attachOpened(function() {
				var oBCContainer = oCore.byId(`${this.getId()}--` + `rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 2, "and the Business Context Container has two entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(oBCContainer.getContent()[1].getText(), oTextResources.getText("MSG_NO_BUSINESS_CONTEXTS"), "and the second entry is the No-Context Message");
				done();
			});
			this.oAddElementsDialog.addExtensionData().then(function() {
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldsEnabled set and three Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldEnabled(true);
			this.oAddElementsDialog.attachOpened(function() {
				var oBCContainer = oCore.byId(`${this.getId()}--` + `rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(oBCContainer.getContent()[1].getText(), "Business Context 1", "and the second entry is the First Business Context");
				assert.equal(oBCContainer.getContent()[2].getText(), "Business Context 2", "and the third entry is the Second Business Context");
				assert.equal(oBCContainer.getContent()[3].getText(), "Business Context 3", "and the fourth entry is the Third Business Context");
				done();
			});
			var aBusinessContexts = [
				{description: "Business Context 1"},
				{description: "Business Context 2"},
				{description: "Business Context 3"}
			];
			this.oAddElementsDialog.addExtensionData(aBusinessContexts).then(function() {
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets closed and opened again with customFieldsEnabled set and available Business Contexts", function(assert) {
			var done = assert.async();

			function fnOnClose() {
				this.oAddElementsDialog.attachEventOnce("opened", fnOnOpen);
			}
			function fnOnOpen() {
				var oBCContainer = oCore.byId(`${this.getId()}--` + `rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(oBCContainer.getContent()[1].getText(), "Business Context 1", "and the second entry is the First Business Context");
				assert.equal(oBCContainer.getContent()[2].getText(), "Business Context 2", "and the third entry is the Second Business Context");
				assert.equal(oBCContainer.getContent()[3].getText(), "Business Context 3", "and the fourth entry is the Third Business Context");
				done();
			}

			this.oAddElementsDialog.setCustomFieldEnabled(true);
			var aBusinessContexts = [
				{description: "Business Context 1"},
				{description: "Business Context 2"},
				{description: "Business Context 3"}
			];
			this.oAddElementsDialog.addExtensionData(aBusinessContexts);
			this.oAddElementsDialog._oDialogPromise.then(function(oDialog) {
				oDialog.attachEventOnce("afterClose", fnOnClose, this);
			}.bind(this));

			// Open the first time and close it
			this.oAddElementsDialog.open();
			this.oAddElementsDialog._submitDialog();

			// Add Business Context again
			this.oAddElementsDialog.addExtensionData(aBusinessContexts);
			// Open the second time
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog OK is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._submitDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when on opened AddElementsDialog Cancel is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._cancelDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(false, "then the promise got rejected");
			}).catch(function() {
				assert.ok(true, "then the promise got rejected");
			});
		});

		QUnit.test("when on opened AddElementsDialog the list gets filtered via input", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems().length, 5, "then initially 5 entries are there");
				this._updateModelFilter({getParameter() {return "2";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for '2' then 1 entry is shown");
				this._updateModelFilter({getParameter() {return null;}});
				assert.equal(this._oList.getItems().length, 5, "then after clearing 5 entries are there");
				this._updateModelFilter({getParameter() {return "complex";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'complex' then 1 entry is shown");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label4 (duplicateComplexPropName)", "then only label4 where complex is part of the label (duplicateName)");
				this._updateModelFilter({getParameter() {return null;}});
				this._updateModelFilter({getParameter() {return "orig";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'orig' then 1 entry is shown");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then only label1 with original name");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog the resort-button is pressed,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then label1 is first");
				this._resortList();
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label5", "then last label is first");
				done();
			});
			this.oAddElementsDialog.open();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});