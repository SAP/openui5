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

	QUnit.test("Column Header Settings - ResponsiveTable", function(assert) {
		assert.ok(!this.oColumn._oColumnHeaderLabel, "No Column Header Label defined so far.");
		assert.ok(!this.oColumn.getHeader(), "Default header property");
		assert.ok(this.oColumn.getHeaderVisible(), "Default headerVisible property");
		assert.strictEqual(this.oColumn.getHAlign(), "Begin", "Default hAlign property");

		this.oColumn._addAriaStaticDom();

		this.oColumn.setHeader("Text1");

		assert.ok(!this.oColumn._oColumnHeaderLabel, "Still no Column Header Label defined so far.");
		this.oColumn.getColumnHeaderControl(true);
		assert.ok(!!this.oColumn._oColumnHeaderLabel, "Column Header Label is initialized");

		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrappingType(), "Hyphenated", "wrapping type of label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrapping(), this.oColumn.getHeaderVisible(), "wrapping set on label control according to according to headerVisible");
		assert.ok(!this.oColumn._oColumnHeaderLabel.getWidth(), "width set on label control according to according to headerVisible");
		var oLabelElement = document.getElementById(this.oColumn.getId());
		assert.strictEqual(oLabelElement && oLabelElement.textContent, this.oColumn.getHeader(), "header text forwarded to ACC label");

		this.oColumn.setHeader("Text2");
		this.oColumn.setHeaderVisible(false);
		this.oColumn.setHAlign("End");

		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrapping(), this.oColumn.getHeaderVisible(), "wrapping set on label control according to according to headerVisible");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWidth(), "0px", "width set on label control according to according to headerVisible");
		oLabelElement = document.getElementById(this.oColumn.getId());
		assert.strictEqual(oLabelElement && oLabelElement.textContent, this.oColumn.getHeader(), "header text forwarded to ACC label");

		this.oColumn._removeAriaStaticDom();
	});

	QUnit.test("Column Header Settings - GridTable", function(assert) {
		assert.ok(!this.oColumn._oColumnHeaderLabel, "No Column Header Label defined so far.");
		assert.ok(!this.oColumn.getHeader(), "Default header property");
		assert.ok(this.oColumn.getHeaderVisible(), "Default headerVisible property");
		assert.strictEqual(this.oColumn.getHAlign(), "Begin", "Default hAlign property");

		this.oColumn._addAriaStaticDom();

		this.oColumn.setHeader("Text1");

		assert.ok(!this.oColumn._oColumnHeaderLabel, "Still no Column Header Label defined so far.");
		this.oColumn.getColumnHeaderControl(false);
		assert.ok(!!this.oColumn._oColumnHeaderLabel, "Column Header Label is initialized");

		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrappingType(), "Normal" /*Default*/, "wrapping type of label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrapping(), false, "no wrapping set on label control");
		assert.ok(!this.oColumn._oColumnHeaderLabel.getWidth(), "width set on label control according to according to headerVisible");
		var oLabelElement = document.getElementById(this.oColumn.getId());
		assert.strictEqual(oLabelElement && oLabelElement.textContent, this.oColumn.getHeader(), "header text forwarded to ACC label");

		this.oColumn.setHeader("Text2");
		this.oColumn.setHeaderVisible(false);
		this.oColumn.setHAlign("End");

		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getText(), this.oColumn.getHeader(), "header text forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getTextAlign(), this.oColumn.getHAlign(), "hAlign forwarded to label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWrapping(), false, "no wrapping set on label control");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel.getWidth(), "0px", "width set on label control according to according to headerVisible");
		oLabelElement = document.getElementById(this.oColumn.getId());
		assert.strictEqual(oLabelElement && oLabelElement.textContent, this.oColumn.getHeader(), "header text forwarded to ACC label");

		this.oColumn._removeAriaStaticDom();
	});

});
