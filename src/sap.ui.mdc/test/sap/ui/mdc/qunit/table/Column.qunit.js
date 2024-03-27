/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table", "sap/ui/mdc/table/Column", "sap/m/Text", "sap/ui/core/TooltipBase"
], function(Table, Column, Text, TooltipBase) {
	"use strict";

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Initialize skip propagation", function(assert) {
		assert.deepEqual(this.oColumn.mSkipPropagation, {
			template: true,
			creationTemplate: true
		}, "Skip propagation is correctly initialized for template aggregations");
	});

	QUnit.test("Inner column", async function(assert) {
		const oTable = new Table();
		let oInnerColumn;

		assert.ok(!this.oColumn._oInnerColumn, "No parent: Inner column does not exist");

		oTable.addColumn(this.oColumn);
		await oTable.initialized();
		assert.ok(!!this.oColumn._oInnerColumn, "Child of an initialized table: Inner column exists");
		assert.strictEqual(this.oColumn.getInnerColumn(), this.oColumn._oInnerColumn, "#getInnerColumn returns the inner column");

		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.insertColumn(this.oColumn, 0);
		assert.ok(oInnerColumn.isDestroyed(), "Remove from table and add back to the same table: Old inner column is destroyed");
		assert.notStrictEqual(this.oColumn.getInnerColumn(), oInnerColumn, "#getInnerColumn returns a new inner column");

		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.removeColumn(this.oColumn);
		assert.ok(oInnerColumn.isDestroyed(), "Remove from table: Old inner column is destroyed");
		assert.notOk(!!this.oColumn.getInnerColumn(), "#getInnerColumn does not return a column");

		oTable.addColumn(this.oColumn);
		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.destroy();
		assert.ok(oInnerColumn.isDestroyed(), "Inner column is destroyed");
		assert.strictEqual(this.oColumn._oInnerColumn, undefined, "Reference to inner column is deleted");
		assert.notOk(!!this.oColumn.getInnerColumn(), "#getInnerColumn does not return a column");
	});

	QUnit.module("Templates", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Clones", function(assert) {
		assert.ok(!this.oColumn._oTemplateClone, "No template clone exists initially");
		assert.ok(!this.oColumn._oCreationTemplateClone, "No creationTemplate clone exists initially");

		const oTemplate = new Text({text: "foo"});
		const oCreationTemplate = new Text({text: "bar"});

		this.oColumn.setTemplate(oTemplate);
		this.oColumn.setCreationTemplate(oCreationTemplate);

		assert.strictEqual(this.oColumn.getTemplateClone(), undefined, "No template clone created if not a child of a table");
		assert.strictEqual(this.oColumn.getCreationTemplateClone(), undefined, "No creation template clone created if not a child of a table");

		const oTable = new Table({columns: this.oColumn});
		const oTemplateClone = this.oColumn.getTemplateClone();
		const oCreationTemplateClone = this.oColumn.getCreationTemplateClone();
		const oTemplateCloneDestroySpy = sinon.spy(oTemplateClone, "destroy");
		const oCreationTemplateCloneDestroySpy = sinon.spy(oCreationTemplateClone, "destroy");

		assert.strictEqual(this.oColumn._oTemplateClone, oTemplateClone, "Reference to the template clone is saved");
		assert.strictEqual(this.oColumn.getTemplateClone(), oTemplateClone, "Existing template clone is returned");
		assert.strictEqual(this.oColumn.getTemplate(), oTemplate, "Template is returned");
		assert.notStrictEqual(this.oColumn.getTemplate(), oTemplateClone, "Template and clone are different instances");

		assert.strictEqual(this.oColumn._oCreationTemplateClone, oCreationTemplateClone, "Reference to the creationTemplate clone is saved");
		assert.strictEqual(this.oColumn.getCreationTemplateClone(), oCreationTemplateClone, "Existing creationTemplate clone is returned");
		assert.strictEqual(this.oColumn.getCreationTemplate(), oCreationTemplate, "CreationTemplate is returned");
		assert.notStrictEqual(this.oColumn.getCreationTemplate(), oCreationTemplateClone, "CreationTemplate and clone are different instances");

		this.oColumn.destroy();

		assert.ok(oTemplateCloneDestroySpy.calledOnce, "The template clone was destroyed");
		assert.ok(oCreationTemplateCloneDestroySpy.calledOnce, "The creationTemplate clone was destroyed");
		assert.ok(!this.oColumn._oTemplateClone, "Reference to the template clone is removed");
		assert.ok(!this.oColumn._oCreationTemplateClone, "Reference to the creationTemplate clone is removed");

		oTable.destroy();
	});

	QUnit.module("Inner column settings", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("GridTable", async function(assert) {
		const oTable = new Table({columns: this.oColumn});
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oColumnHeaderLabel = oInnerColumn.getLabel().getLabel();

		assert.strictEqual(oInnerColumn.getId(), this.oColumn.getId() + "-innerColumn", "Inner column Id");
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Initial: Inner column 'tooltip'");
		assert.strictEqual(oInnerColumn.getResizable(), true, "Initial: Inner column 'resizable'");
		assert.strictEqual(oInnerColumn.getAutoResizable(), true, "Initial: Inner column 'autoResizable'");
		assert.strictEqual(oInnerColumn.getWidth(), "", "Initial: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getText(), "", "Initial: Label control 'text'");
		assert.strictEqual(oColumnHeaderLabel.getTextAlign(), "Begin", "Initial: Label control 'textAlign'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Initial: Label control 'wrapping'");
		assert.strictEqual(oColumnHeaderLabel.getWrappingType(), "Normal" , "Initial: Label control 'wrappingType'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "Initial: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getRequired(), false, "Initial: Label control 'required'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null, "Initial: Label control 'tooltip'");

		this.oColumn.setWidth("100px");
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Change 'width': Inner column 'width'");

		this.oColumn.setHeader("Text1");
		assert.strictEqual(oColumnHeaderLabel.getText(), "Text1", "Change 'text': Label control 'text'");

		this.oColumn.setHAlign("End");
		assert.strictEqual(oColumnHeaderLabel.getTextAlign(), "End", "Change 'hAlign': Label control 'hAlign'");

		this.oColumn.setRequired(true);
		assert.strictEqual(oColumnHeaderLabel.getRequired(), true, "Change 'required': Label control 'required'");

		this.oColumn.setHeaderVisible(false);
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Set 'headerVisible' to false: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "0px", "Set 'headerVisible' to false: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set 'headerVisible' to false: Label control 'wrapping'");

		oTable.setEnableColumnResize(false);
		assert.strictEqual(oInnerColumn.getResizable(), false, "Set table's 'enableColumnResize' to false: Inner column 'resizable'");
		assert.strictEqual(oInnerColumn.getAutoResizable(), false, "Set table's 'enableColumnResize' to false: Inner column 'autoResizable'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set table's 'enableColumnResize' to false: Label control 'wrapping'");

		this.oColumn.setHeaderVisible(true);
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Set 'headerVisible' to false: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "Set 'headerVisible' to false: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set 'headerVisible' to true: Label control 'wrapping'");

		oTable.setEnableColumnResize(true);
		assert.strictEqual(oInnerColumn.getResizable(), true, "Set table's 'enableColumnResize' to false: Inner column 'resizable'");
		assert.strictEqual(oInnerColumn.getAutoResizable(), true, "Set table's 'enableColumnResize' to false: Inner column 'autoResizable'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set table's 'enableColumnResize' to true: Label control 'wrapping'");

		oTable.destroy();
	});

	QUnit.test("ResponsiveTable", async function(assert) {
		const oTable = new Table({type: "ResponsiveTable", columns: this.oColumn});
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oColumnHeaderLabel = oInnerColumn.getHeader().getLabel();

		assert.strictEqual(oInnerColumn.getId(), this.oColumn.getId() + "-innerColumn", "Inner column Id");
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Initial: Inner column 'tooltip'");
		assert.strictEqual(oInnerColumn.getWidth(), "", "Initial: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getText(), "", "Initial: Label control 'text'");
		assert.strictEqual(oColumnHeaderLabel.getTextAlign(), "Begin", "Initial: Label control 'textAlign'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Initial: Label control 'wrapping'");
		assert.strictEqual(oColumnHeaderLabel.getWrappingType(), "Hyphenated" , "Initial: Label control 'wrappingType'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "Initial: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getRequired(), false, "Initial: Label control 'required'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null, "Initial: Label control 'tooltip'");

		this.oColumn.setWidth("100px");
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Change 'width': Inner column 'width'");

		this.oColumn.setHeader("Text1");
		assert.strictEqual(oColumnHeaderLabel.getText(), "Text1", "Change 'text': Label control 'text'");

		this.oColumn.setHAlign("End");
		assert.strictEqual(oColumnHeaderLabel.getTextAlign(), "End", "Change 'hAlign': Label control 'hAlign'");

		this.oColumn.setRequired(true);
		assert.strictEqual(oColumnHeaderLabel.getRequired(), true, "Change 'required': Label control 'required'");

		this.oColumn.setHeaderVisible(false);
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Set 'headerVisible' to false: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "0px", "Set 'headerVisible' to false: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set 'headerVisible' to false: Label control 'wrapping'");

		oTable.setEnableColumnResize(false);
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set table's 'enableColumnResize' to false: Label control 'wrapping'");

		this.oColumn.setHeaderVisible(true);
		assert.strictEqual(oInnerColumn.getWidth(), "100px", "Set 'headerVisible' to false: Inner column 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "Set 'headerVisible' to false: Label control 'width'");
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), true, "Set 'headerVisible' to true: Label control 'wrapping'");

		oTable.setEnableColumnResize(true);
		assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "Set table's 'enableColumnResize' to true: Label control 'wrapping'");

		oTable.destroy();
	});

	QUnit.module("Inner column settings - Tooltip", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("TooltipBase", function(assert) {
		const oTooltip = new TooltipBase();
		this.oColumn.setTooltip(oTooltip);
		assert.strictEqual(this.oColumn.getTooltip(), null, "TooltipBase tooltips are not supported");
		oTooltip.destroy();
	});

	QUnit.test("GridTable", async function(assert) {
		const oTable = new Table({columns: this.oColumn});
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oColumnHeaderLabel = oInnerColumn.getLabel().getLabel();

		this.oColumn.setTooltip("Tooltip1");
		assert.strictEqual(oInnerColumn.getTooltip(), "Tooltip1", "Set 'tooltip': Inner column 'tooltip'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null, "Set 'tooltip': Label control 'tooltip'");

		this.oColumn.setTooltip();
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Remove 'tooltip': Inner column 'tooltip'");

		this.oColumn.setHeader("Text1");
		oTable.setUseColumnLabelsAsTooltips(true);
		assert.strictEqual(oInnerColumn.getTooltip(), "Text1", "Set table's 'useColumnLabelsAsTooltips' to true: Inner column 'tooltip'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to true: Label control 'tooltip'");

		oTable.setUseColumnLabelsAsTooltips(false);
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to false: Inner column 'tooltip'");

		this.oColumn.setTooltip("Tooltip1");
		oTable.setUseColumnLabelsAsTooltips(true);
		assert.strictEqual(oInnerColumn.getTooltip(), "Tooltip1", "'tooltip' takes precedence over 'header'");

		this.oColumn.setHeaderVisible(false);
		assert.strictEqual(oInnerColumn.getTooltip(), "Tooltip1",
			"tooltip is set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");

		this.oColumn.setTooltip();
		assert.strictEqual(oInnerColumn.getTooltip(), null,
			"tooltip not set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");

		oTable.destroy();
	});

	QUnit.test("ResponsiveTable", async function(assert) {
		const oTable = new Table({type: "ResponsiveTable", columns: this.oColumn});
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oColumnHeaderLabel = oInnerColumn.getHeader().getLabel();

		this.oColumn.setTooltip("Tooltip1");
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Set 'tooltip': Inner column 'tooltip'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), "Tooltip1", "Set 'tooltip': Label control 'tooltip'");

		this.oColumn.setTooltip();
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Remove 'tooltip': Inner column 'tooltip'");

		this.oColumn.setHeader("Text1");
		oTable.setUseColumnLabelsAsTooltips(true);
		assert.strictEqual(oInnerColumn.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to true: Inner column 'tooltip'");
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), "Text1", "Set table's 'useColumnLabelsAsTooltips' to true: Label control 'tooltip'");

		oTable.setUseColumnLabelsAsTooltips(false);
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to false: Label control 'tooltip'");

		this.oColumn.setTooltip("Tooltip1");
		oTable.setUseColumnLabelsAsTooltips(true);
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), "Tooltip1", "'tooltip' takes precedence over 'header'");

		this.oColumn.setHeaderVisible(false);
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), "Tooltip1",
			"tooltip is set, headerVisible=false, useColumnLabelsAsTooltips=true: Label control 'tooltip'");

		this.oColumn.setTooltip();
		assert.strictEqual(oColumnHeaderLabel.getTooltip(), null,
			"tooltip not set, headerVisible=false, useColumnLabelsAsTooltips=true: Label control 'tooltip'");

		oTable.destroy();
	});
});