/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core", "sap/ui/mdc/Table", "sap/ui/mdc/table/Column", "sap/m/Text"
], function(Core, Table, Column, Text) {
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

		var oTemplate = new Text({text: "foo"});
		var oCreationTemplate = new Text({text: "bar"});

		this.oColumn.setTemplate(oTemplate);
		this.oColumn.setCreationTemplate(oCreationTemplate);

		var oTemplateClone = this.oColumn.getTemplate(true);
		var oCreationTemplateClone = this.oColumn.getCreationTemplate(true);
		var oTemplateCloneDestroySpy = sinon.spy(oTemplateClone, "destroy");
		var oCreationTemplateCloneDestroySpy = sinon.spy(oCreationTemplateClone, "destroy");

		assert.strictEqual(this.oColumn._oTemplateClone, oTemplateClone, "Reference to the template clone is saved");
		assert.strictEqual(this.oColumn.getTemplate(true), oTemplateClone, "Existing template clone is returned");
		assert.strictEqual(this.oColumn.getTemplate(), oTemplate, "Template is returned");
		assert.notStrictEqual(this.oColumn.getTemplate(), oTemplateClone, "Template and clone are different instances");

		assert.strictEqual(this.oColumn._oCreationTemplateClone, oCreationTemplateClone, "Reference to the creationTemplate clone is saved");
		assert.strictEqual(this.oColumn.getCreationTemplate(true), oCreationTemplateClone, "Existing creationTemplate clone is returned");
		assert.strictEqual(this.oColumn.getCreationTemplate(), oCreationTemplate, "CreationTemplate is returned");
		assert.notStrictEqual(this.oColumn.getCreationTemplate(), oCreationTemplateClone, "CreationTemplate and clone are different instances");

		this.oColumn.destroy();

		assert.ok(oTemplateCloneDestroySpy.calledOnce, "The template clone was destroyed");
		assert.ok(oCreationTemplateCloneDestroySpy.calledOnce, "The creationTemplate clone was destroyed");
		assert.ok(!this.oColumn._oTemplateClone, "Reference to the template clone is removed");
		assert.ok(!this.oColumn._oCreationTemplateClone, "Reference to the creationTemplate clone is removed");
	});

	QUnit.test("test headerVisible property with GridTable", function(assert) {
		var done = assert.async(),
			oTable = new Table(),
			fGetColumnHeaderControl = sinon.spy(this.oColumn, "getColumnHeaderControl"),
			fUpdateColumnHeaderControl = sinon.spy(this.oColumn, "_updateColumnHeaderControl");
		oTable.placeAt("qunit-fixture");
		oTable.addColumn(this.oColumn);
		this.oColumn.setHeader("Test");
		Core.applyChanges();
		assert.ok(this.oColumn.getHeaderVisible(), "headerVisible=true by default");

		oTable.initialized().then(function() {
			assert.ok(fGetColumnHeaderControl.calledWith(false), "called with false since table type is Grid table");
			assert.ok(this.oColumn._oColumnHeaderLabel.getWidth() !== "0px", "Column header label is visible");
			this.oColumn.setHeaderVisible(false);
			Core.applyChanges();
			assert.ok(fUpdateColumnHeaderControl.calledWith(false));
			assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWidth() , "0px", "Column header label is visible");
			done();
		}.bind(this));
	});

	QUnit.test("test headerVisible property ResponsiveTable", function(assert) {
		var done = assert.async(),
			oTable = new Table({
				type: "ResponsiveTable"
			}),
			fGetColumnHeaderControl = sinon.spy(this.oColumn, "getColumnHeaderControl"),
			fUpdateColumnHeaderControl = sinon.spy(this.oColumn, "_updateColumnHeaderControl");
		oTable.placeAt("qunit-fixture");
		oTable.addColumn(this.oColumn);
		this.oColumn.setHeader("Test");
		Core.applyChanges();
		assert.ok(this.oColumn.getHeaderVisible(), "headerVisible=true by default");

		oTable.initialized().then(function() {
			assert.ok(fGetColumnHeaderControl.calledWith(true), "called with false since table type is Responsive table");
			this.oColumn.setHeaderVisible(false);
			Core.applyChanges();
			assert.ok(fUpdateColumnHeaderControl.calledWith(false));
			done();
		}.bind(this));
	});
});
