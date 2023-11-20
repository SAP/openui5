/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Entry",
	"sap/m/table/columnmenu/Menu"
], function (QUnitUtils, Entry, Menu) {
	"use strict";

	QUnit.module("Instantiation");

	QUnit.test("Instantiate ColumnMenuEntry", function(assert) {
		var oEntry = new Entry({
			visible: true
		});
		assert.ok(oEntry);
	});

	// Test setup
	QUnit.module("Plain ColumnMenuEntry", {
		beforeEach: function () {
			this.oEntry = new Entry({
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
			this.oEntry = new Entry();
			this._oMenu = new Menu();
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