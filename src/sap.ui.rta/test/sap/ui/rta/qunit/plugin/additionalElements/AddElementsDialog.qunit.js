/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;
sap.ui.require(["sap/ui/rta/plugin/additionalElements/AddElementsDialog"],function(AddElementsDialog){
	"use strict";

	var oAddElementsDialog;

	QUnit.module("Given that a AddElementsDialog is available...", {
		beforeEach : function(assert) {
		},
		afterEach : function(assert) {
			oAddElementsDialog.destroy();
		}
	});

	QUnit.test("when AddElementsDialog gets initialized and open is called,", function(assert) {
		var done = assert.async();

		initializeDialog(false);

		oAddElementsDialog.attachOpened(function() {
			assert.ok(true, "then dialog pops up,");
			assert.equal(oAddElementsDialog.getTitle(), "hugo", "then the title is set");
			assert.equal(oAddElementsDialog._oList.getItems().length, 4, "then 4 elements internally known");
			assert.equal(oAddElementsDialog.getElements().length, 4, "then 4 elements externally known");
			assert.equal(oAddElementsDialog.getSelectedElements().length, 2, "then 2 selected elements");
			assert.equal(oAddElementsDialog._oCustomFieldButton.getEnabled(), false, "then the customField-button is disabled");
			assert.equal(oAddElementsDialog._oList.getItems()[0].getContent()[0].getItems()[1].getText(), "was original", "then the originalLabel is set");
			oAddElementsDialog._cancelDialog();
			done();
		});
		oAddElementsDialog.open();
	});

	QUnit.test("when AddElementsDialog gets initialized with customFieldsEnabled set and open is called", function(assert) {
		var done = assert.async();

		initializeDialog(true);

		oAddElementsDialog.attachOpenCustomField(function() {
			assert.ok(true, "then the openCustomField event is fired");
			done();
		});
		oAddElementsDialog.attachOpened(function() {
			assert.equal(oAddElementsDialog._oCustomFieldButton.getEnabled(), true, "then the button is enabled");
			oAddElementsDialog._oCustomFieldButton.firePress();
		});
		oAddElementsDialog.open();
	});

	QUnit.test("when on opened AddElementsDialog OK is pressed,", function(assert) {
		initializeDialog(false);

		oAddElementsDialog.attachOpened(function() {
			oAddElementsDialog._submitDialog();
		});

		return oAddElementsDialog.open().then(function() {
			assert.ok(true, "then the promise got resolved");
		});
	});

	QUnit.test("when on opened AddElementsDialog Cancel is pressed,", function(assert) {
		initializeDialog(false);

		oAddElementsDialog.attachOpened(function() {
			oAddElementsDialog._cancelDialog();
		});

		return oAddElementsDialog.open().then(function() {
			assert.ok(false, "then the promise got rejected");
		}).catch(function() {
			assert.ok(true, "then the promise got rejected");
		});
	});

	QUnit.test("when on opened AddElementsDialog the list gets filtered via input", function(assert) {
		var done = assert.async();

		initializeDialog(false);

		oAddElementsDialog.attachOpened(function() {
			assert.equal(oAddElementsDialog._oList.getItems().length, 4, "then 4");
			oAddElementsDialog._updateModelFilter({getParameter: function() {return "2";}});
			assert.equal(oAddElementsDialog._oList.getItems().length, 1, "then 1");
			oAddElementsDialog._updateModelFilter({getParameter: function() {return null;}});
			assert.equal(oAddElementsDialog._oList.getItems().length, 4, "then 4");
			oAddElementsDialog._updateModelFilter({getParameter: function() {return "complex";}});
			assert.equal(oAddElementsDialog._oList.getItems().length, 1, "then 1");
			assert.equal(oAddElementsDialog._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label4 (duplicateComplexPropName)", "then only label4 where complex is part of the label (duplicateComplexName)");
			oAddElementsDialog._updateModelFilter({getParameter: function() {return null;}});
			oAddElementsDialog._updateModelFilter({getParameter: function() {return "orig";}});
			assert.equal(oAddElementsDialog._oList.getItems().length, 1, "then 1");
			assert.equal(oAddElementsDialog._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then only label1 with original name");

			oAddElementsDialog._cancelDialog();
			done();
		});
		oAddElementsDialog.open();
	});

	QUnit.test("when on opened AddElementsDialog the resort-button is pressed,", function(assert) {
		var done = assert.async();

		initializeDialog(false);

		oAddElementsDialog.attachOpened(function() {
			assert.equal(oAddElementsDialog._oList.getItems().length, 4, "then 4");
			assert.equal(oAddElementsDialog._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then label1 is first");
			oAddElementsDialog._resortList();
			assert.equal(oAddElementsDialog._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label4 (duplicateComplexPropName)", "then label2 is first");
			oAddElementsDialog._cancelDialog();
			done();
		});
		oAddElementsDialog.open();
	});


	function initializeDialog(bCFE) {
		var aElements = [
			{
				selected: false,
				label: "label1",
				tooltip: "tooltip1",
				id: 1,
				originalLabel: "original"
			},
			{
				selected: true,
				label: "label2",
				tooltip: "tooltip2",
				id: 2
			},
			{
				selected: true,
				label: "label3",
				tooltip: "tooltip3",
				referencedComplexPropertyName: "complexPropName",
				id: 3
			},
			{
				selected: false,
				label: "label4",
				tooltip: "tooltip4",
				referencedComplexPropertyName: "duplicateComplexPropName",
				duplicateComplexName: true,
				id: 4
			}
		];

		oAddElementsDialog = new AddElementsDialog({
			title: "hugo",
			customFieldEnabled: bCFE
		});

		oAddElementsDialog.setElements(aElements);
	}

	QUnit.start();
});
