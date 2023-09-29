/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core", "sap/ui/mdc/Table", "sap/ui/mdc/table/Column", "sap/m/Text", "sap/ui/core/TooltipBase"
], function(Core, Table, Column, Text, TooltipBase) {
	"use strict";

	QUnit.module("sap.ui.mdc.table.Column", {
		before: function(assert) {
			//
		},
		after: function() {
			//
		},
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oColumn);
	});

	QUnit.test("Initialize skip propagation", function(assert) {
		assert.deepEqual(this.oColumn.mSkipPropagation, {
			template: true,
			creationTemplate: true
		}, "Skip propagation is correctly initialized for template aggregations");
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

	QUnit.test("Column Header Settings - ResponsiveTable", function(assert) {
		assert.ok(!this.oColumn._oColumnHeaderLabel, "No Column Header Label defined so far.");
		assert.ok(!this.oColumn.getHeader(), "Default header property");
		assert.ok(!this.oColumn.getTooltip(), "Default tooltip property");
		assert.ok(this.oColumn.getHeaderVisible(), "Default headerVisible property");
		assert.strictEqual(this.oColumn.getHAlign(), "Begin", "Default hAlign property");
		assert.ok(!this.oColumn.getRequired(), "Default required property");

		this.oColumn.setHeader("Text1");

		const oTooltip = new TooltipBase();
		this.oColumn.setTooltip(oTooltip);
		assert.ok(!this.oColumn.getTooltip(), "TooltipBase tooltips are not supported");
		this.oColumn.setTooltip("Tooltip1");
		oTooltip.destroy();

		assert.ok(!this.oColumn._oColumnHeaderLabel, "Still no Column Header Label defined so far.");
		assert.strictEqual(this.oColumn._getColumnHeaderLabel(), undefined, "No column header label created if not a child of a table");

		const oTable = new Table({type: "ResponsiveTable", columns: this.oColumn, enableColumnResize: false});

		return oTable.initialized().then(function() {
			const oColumnHeaderLabel = this.oColumn._getColumnHeaderLabel().getLabel();

			assert.strictEqual(oColumnHeaderLabel.getWrappingType(), "Hyphenated", "wrapping type of label control");
			assert.strictEqual(oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), true, "wrapping set on label control according to headerVisible");
			assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "default width set on the label control");
			assert.strictEqual(this.oColumn.getInnerColumn().getPopinDisplay(), "Inline", "popinDisplay is Inline for the inner column");
			assert.strictEqual(this.oColumn.getId() + "-innerColumn", this.oColumn.getInnerColumn().getId(), "Inner column set with ID of column with `innercolumn` suffix");
			assert.ok(oColumnHeaderLabel.getTooltip() === "Tooltip1", "tooltip set also on column label");

			this.oColumn.setHeader("Text2");
			this.oColumn.setTooltip("Tooltip2");
			this.oColumn.setHeaderVisible(false);
			this.oColumn.setHAlign("End");
			this.oColumn.setRequired(true);

			assert.strictEqual(oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "wrapping set on label control according to headerVisible");
			assert.strictEqual(oColumnHeaderLabel.getWidth(), "0px", "width set on label control according to headerVisible");
			assert.strictEqual(this.oColumn.getInnerColumn().getPopinDisplay(), "WithoutHeader", "popinDisplay set according to headerVisible");
			assert.ok(oColumnHeaderLabel.getTooltip() === "Tooltip2", "tooltip set on column label");
			assert.strictEqual(oColumnHeaderLabel.getRequired(), true, "required set on label control according to required");

			this.oColumn.setHeaderVisible(true);
			oTable.setEnableColumnResize(true);
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "wrapping on label control is disabled when resizing is activated");
			oTable.setEnableColumnResize(false);
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), true, "wrapping on label control is enabled when resizing is deactivated");

			this.oColumn.setTooltip(null);
			oTable.setUseColumnLabelsAsTooltips(true);
			assert.ok(oColumnHeaderLabel.getTooltip() === this.oColumn.getHeader(), "label set as tooltip on column label");
			oTable.setUseColumnLabelsAsTooltips(false);
			assert.ok(!oColumnHeaderLabel.getTooltip(), "no tooltip set on column label");
			this.oColumn.setTooltip("Tooltip3");
			assert.ok(oColumnHeaderLabel.getTooltip() === "Tooltip3", "tooltip set on column label");
			oTable.setUseColumnLabelsAsTooltips(true);
			this.oColumn.setTooltip(null);
			assert.ok(oColumnHeaderLabel.getTooltip() === this.oColumn.getHeader(), "label set as tooltip on column label");
			this.oColumn.setHeaderVisible(false);
			assert.ok(!oColumnHeaderLabel.getTooltip(), "no tooltip set on column label");
			this.oColumn.setTooltip("Tooltip4");
			assert.ok(oColumnHeaderLabel.getTooltip() === "Tooltip4", "tooltip set on column label");

			oTable.destroy();
		}.bind(this));
	});

	QUnit.test("Column Header Settings - GridTable", function(assert) {
		assert.ok(!this.oColumn._oColumnHeaderLabel, "No Column Header Label defined so far.");
		assert.ok(!this.oColumn.getHeader(), "Default header property");
		assert.ok(!this.oColumn.getTooltip(), "Default tooltip property");
		assert.ok(this.oColumn.getHeaderVisible(), "Default headerVisible property");
		assert.strictEqual(this.oColumn.getHAlign(), "Begin", "Default hAlign property");
		assert.ok(!this.oColumn.getRequired(), "Default required property");

		this.oColumn.setHeader("Text1");

		const oTooltip = new TooltipBase();
		this.oColumn.setTooltip(oTooltip);
		assert.ok(!this.oColumn.getTooltip(), "TooltipBase tooltips are not supported");
		this.oColumn.setTooltip("Tooltip1");
		oTooltip.destroy();

		assert.ok(!this.oColumn._oColumnHeaderLabel, "Still no Column Header Label defined so far.");
		assert.strictEqual(this.oColumn._getColumnHeaderLabel(), undefined, "No column header label created if not a child of a table");

		const oTable = new Table({columns: this.oColumn});

		return oTable.initialized().then(function() {
			const oColumnHeaderLabel = this.oColumn._getColumnHeaderLabel().getLabel();

			assert.strictEqual(oColumnHeaderLabel.getWrappingType(), "Normal" /*Default*/, "wrapping type of label control");
			assert.strictEqual(oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "no wrapping set on label control");
			assert.strictEqual(oColumnHeaderLabel.getWidth(), "100%", "default width set on the label control");
			assert.strictEqual(this.oColumn.getInnerColumn().getTooltip(), "Tooltip1", "tooltip forwarded to inner column control");
			assert.ok(!oColumnHeaderLabel.getTooltip(), "no tooltip on column label");

			this.oColumn.setHeader("Text2");
			this.oColumn.setTooltip("Tooltip2");
			this.oColumn.setHeaderVisible(false);
			this.oColumn.setHAlign("End");
			this.oColumn.setRequired(true);

			assert.strictEqual(oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "no wrapping set on label control");
			assert.strictEqual(oColumnHeaderLabel.getWidth(), "0px", "width set on label control according to headerVisible");
			assert.strictEqual(this.oColumn.getInnerColumn().getTooltip(), "Tooltip2", "tooltip forwarded to inner column control");
			assert.strictEqual(this.oColumn.getId() + "-innerColumn", this.oColumn.getInnerColumn().getId(), "Inner column set with ID of column with `innercolumn` suffix");
			assert.ok(!oColumnHeaderLabel.getTooltip(), "no tooltip on column label");
			assert.strictEqual(oColumnHeaderLabel.getRequired(), true, "required set on label control according to required");

			this.oColumn.setHeaderVisible(true);
			oTable.setEnableColumnResize(false);
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "wrapping on label control is disabled when resizing is deactivated");
			oTable.setEnableColumnResize(true);
			assert.strictEqual(oColumnHeaderLabel.getWrapping(), false, "wrapping on label control is disabled when resizing is activated");

			this.oColumn.setTooltip(null);
			oTable.setUseColumnLabelsAsTooltips(true);
			assert.ok(this.oColumn.getInnerColumn().getTooltip() === this.oColumn.getHeader(), "label set as tooltip on column label");
			oTable.setUseColumnLabelsAsTooltips(false);
			assert.ok(!this.oColumn.getInnerColumn().getTooltip(), "no tooltip set on column label");
			this.oColumn.setTooltip("Tooltip3");
			assert.ok(this.oColumn.getInnerColumn().getTooltip() === "Tooltip3", "tooltip set on column label");
			oTable.setUseColumnLabelsAsTooltips(true);
			this.oColumn.setTooltip(null);
			assert.ok(this.oColumn.getInnerColumn().getTooltip() === this.oColumn.getHeader(), "label set as tooltip on column label");
			this.oColumn.setHeaderVisible(false);
			assert.ok(!this.oColumn.getInnerColumn().getTooltip(), "no tooltip set on column label");
			this.oColumn.setTooltip("Tooltip4");
			assert.ok(this.oColumn.getInnerColumn().getTooltip() === "Tooltip4", "tooltip set on column label");


			oTable.destroy();
		}.bind(this));
	});
});