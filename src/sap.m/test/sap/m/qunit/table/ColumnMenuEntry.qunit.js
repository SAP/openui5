/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/ColumnMenuEntry",
	"sap/m/table/ColumnMenu"
], function (QUnitUtils, ColumnMenuEntry, ColumnMenu) {
	"use strict";

	QUnit.module("Instantiation");

	QUnit.test("Instantiate ColumnMenuEntry", function(assert) {
		var oEntry = new ColumnMenuEntry({
			visible: true
		});
		assert.ok(oEntry);
	});

	// Test setup
	QUnit.module("Plain ColumnMenuEntry", {
		beforeEach: function () {
			this.oEntry = new ColumnMenuEntry({
				visible: true
			});
		},
		afterEach: function () {
			this.oEntry.destroy();
		}
	});

	QUnit.test("Access unimplemented label", function(assert) {
		try {
			this.oEntry.getLabel();
		} catch (error) {
			assert.equal(error.message, this.oEntry + " does not implement #getLabel");
		}
	});

	QUnit.test("Access unimplemented content", function(assert) {
		try {
			this.oEntry.getContent();
		} catch (error) {
			assert.equal(error.message, this.oEntry + " does not implement #getContent");
		}
	});

	QUnit.module("ColumnMenuEntry with ColumnMenu Parent", {
		beforeEach: function () {
			this.oEntry = new ColumnMenuEntry();
			this._oMenu = new ColumnMenu();
			this.oEntry.setParent(this._oMenu);
		},
		afterEach: function () {
			this.oEntry.destroy();
		}
	});

	QUnit.test("Retrieve menu", function (assert) {
		assert.deepEqual(this.oEntry.getMenu(), this._oMenu);
	});
});