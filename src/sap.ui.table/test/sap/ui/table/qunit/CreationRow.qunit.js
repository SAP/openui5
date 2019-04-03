/*global QUnit */

sap.ui.define([
	"sap/ui/table/CreationRow",
	"sap/ui/table/Column",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel"
], function(CreationRow, Column, TableQUnitUtils, Control, JSONModel) {
	"use strict";

	// TODO: a lot lot more...

	var TestControl = TableQUnitUtils.getTestControl();

	QUnit.module("Cells", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCount: 1,
				rows: {path: "/"},
				models: new JSONModel(new Array(1))
			}, function(oTable) {
				oTable.addColumn(new Column());
				oTable.addColumn(new Column()
					.setCreationTemplate(new TestControl({text: "Column2*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column3"})}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column4"})})
					.setCreationTemplate(new TestControl({text: "Column4*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column5"}), visible: false}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column6"}), visible: false})
					.setCreationTemplate(new TestControl({text: "Column6*"})));
				oTable.addColumn(new Column({template: new TestControl({text: "Column7"})}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column8"})})
					.setCreationTemplate(new TestControl({text: "Column8*"})));
			});
			this.oTable.setCreationRow(new CreationRow());

			sap.ui.getCore().applyChanges();
			return this.oTable.qunit.whenInitialRenderingFinished();
		},
		assertCells: function(assert) {
			var aActualCells = this.oTable.getCreationRow().getCells().map(function(oCell) {
				var sText = oCell.getText();
				return sText.substring(0, sText.length - 1);
			});
			var aExpectedCells = Array.prototype.slice.call(arguments, 1);

			assert.deepEqual(aActualCells, aExpectedCells, "The creation row has the correct cells");
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial", function(assert) {
		this.assertCells(assert, "Column4", "Column8");
	});

	QUnit.test("After changing column visibility", function(assert) {
		this.oTable.getColumns()[2].setVisible(false);
		this.oTable.getColumns()[3].setVisible(false);
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[4].setVisible(true);
		this.oTable.getColumns()[5].setVisible(true);
		this.assertCells(assert, "Column6", "Column8");
	});

	QUnit.test("After setting column templates", function(assert) {
		this.oTable.getColumns()[0].setCreationTemplate(new TestControl({text: "Column1*"}));
		this.assertCells(assert, "Column4", "Column8");

		this.oTable.getColumns()[1].setTemplate(new TestControl({text: "Column2"}));
		this.assertCells(assert, "Column2", "Column4", "Column8");

		this.oTable.getColumns()[2].setCreationTemplate(new TestControl({text: "Column3*"}));
		this.assertCells(assert, "Column2", "Column3", "Column4", "Column8");
	});

	QUnit.test("After removing column templates", function(assert) {
		this.oTable.getColumns()[3].setTemplate(null);
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[7].setCreationTemplate(null);
		this.assertCells(assert);
	});

	QUnit.test("After destroying column templates", function(assert) {
		this.oTable.getColumns()[3].destroyTemplate();
		this.assertCells(assert, "Column8");

		this.oTable.getColumns()[7].destroyCreationTemplate();
		this.assertCells(assert);
	});

	QUnit.test("After changing column templates", function(assert) {
		this.oTable.getColumns()[3].getCreationTemplate().setText("Not Column4*");
		this.assertCells(assert, "Column4", "Column8");
	});

	QUnit.test("After removing columns", function(assert) {
		this.oTable.removeColumn(this.oTable.getColumns()[3]);
		this.assertCells(assert, "Column8");

		this.oTable.removeAllColumns();
		this.assertCells(assert);
	});

	QUnit.test("After destroying columns", function(assert) {
		this.oTable.getColumns()[3].destroy();
		this.assertCells(assert, "Column8");

		this.oTable.destroyColumns();
		this.assertCells(assert);
	});

	QUnit.test("After adding columns", function(assert) {
		this.oTable.addColumn(new Column({template: new TestControl({text: "Column9"})})
			.setCreationTemplate(new TestControl({text: "Column9*"})));
		this.assertCells(assert, "Column4", "Column8", "Column9");

		this.oTable.insertColumn(new Column({template: new TestControl({text: "Column0"})})
			.setCreationTemplate(new TestControl({text: "Column0*"})), 0);
		this.assertCells(assert, "Column0", "Column4", "Column8", "Column9");
	});

	QUnit.test("Accessibility", function(assert) {
		var oRow = this.oTable.getCreationRow();
		var $Row = oRow.$();
		assert.strictEqual($Row.attr("role"), "form", "Aria Role of creation row root element");
		assert.strictEqual($Row.attr("aria-labelledby"), oRow.getId() + "-label", "Label of creation row root element");
		assert.ok(oRow._oDefaultToolbar.getAriaLabelledBy()[0] === oRow.getId() + "-label", "Default toolbar has correct label");
		assert.strictEqual($Row.find("table").attr("role"), "presentation", "Aria Role of creation row inner table element");
	});

	QUnit.module("Toolbar", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("Default Toolbar", function(assert) {
		var oCreationRow = new CreationRow();

		assert.strictEqual(oCreationRow.getToolbar(), null, "No toolbar is set");
		assert.ok(oCreationRow._oDefaultToolbar == null, "No default toolbar is created yet");

		//...
	});
});