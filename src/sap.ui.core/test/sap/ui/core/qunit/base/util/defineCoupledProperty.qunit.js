sap.ui.define([
	'sap/base/util/defineCoupledProperty'
], function(defineCoupledProperty) {
	"use strict";
	/*global QUnit*/

	QUnit.module("coupledProperty", {
		beforeEach: function(assert) {
			this.prop1 = {};
			this.prop2 = {};
			assert.notEqual(this.prop1, this.prop2, "should not be same");
		},
		afterEach: function(assert) {
			delete this.prop1;
			delete this.prop2;
			assert.notOk(Object.getOwnPropertyDescriptor(this, "prop1"), "should be deleted");
			assert.notOk(Object.getOwnPropertyDescriptor(this, "prop2"), "should be deleted");
		}
	});

	QUnit.test("get", function(assert) {
		var prop = this.prop2;
		defineCoupledProperty(this, "prop1", this, "prop2");
		assert.strictEqual(this.prop1, prop, "prop1 is updated");
		assert.strictEqual(this.prop2, prop, "prop2 is same");
	});

	QUnit.test("set", function(assert) {
		var propX = {};
		var propY = {};
		defineCoupledProperty(this, "prop1", this, "prop2");
		this.prop1 = propX;
		assert.strictEqual(this.prop1, propX, "prop1 is same");
		assert.strictEqual(this.prop2, propX, "prop2 is updated");
		this.prop2 = propY;
		assert.strictEqual(this.prop1, propY, "prop1 is same");
		assert.strictEqual(this.prop2, propY, "prop2 is updated");
	});

	QUnit.test("delete", function(assert) {
		defineCoupledProperty(this, "prop1", this, "prop2");
		delete this.prop1;
		assert.notOk(this.prop1, "prop1 is deleted");
		assert.ok(this.prop2, "prop1 still exists");
		this.prop1 = {};
		assert.notEqual(this.prop1, this.prop2, "should not be same");
	});

});
