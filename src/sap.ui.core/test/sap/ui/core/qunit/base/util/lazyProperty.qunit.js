sap.ui.define([
	'sap/base/util/lazyProperty'
], function(lazyProperty) {
	"use strict";
	/*global QUnit*/

	QUnit.module("lazyProperty", {
		before: function() {
			this.value = {};
		},
		beforeEach: function() {
			this.legacy = {};
		},
		afterEach: function(assert) {
			delete this.legacy;
		}
	});

	QUnit.test("apply a lazy property stub from amd module", function(assert) {
		assert.expect(2);
		lazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			return this.value;
		}.bind(this));
		assert.strictEqual(this.legacy.value, this.value, "stub is applied");
	});

	QUnit.test("apply a lazy property stub from non-amd module", function(assert) {
		assert.expect(2);
		lazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			// the defined setter is called by the following assignment and replaces the stub
			this.legacy.value = this.value;
			return this.legacy.value;
		}.bind(this));
		assert.strictEqual(this.legacy.value, this.value, "stub is applied");
	});

	QUnit.test("overwriting a stubbed value", function(assert) {
		assert.expect(1);
		var altValue = {};
		lazyProperty(this.legacy, "value", function() {
			assert.ok(false, "callback should not be called");
			return this.value;
		}.bind(this));
		// the defined setter is called by the following assignment and replaces the stub
		this.legacy.value = altValue;
		assert.strictEqual(altValue, this.legacy.value);
	});

	QUnit.test("error in callback", function(assert) {
		assert.expect(2);
		lazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			throw new Error("callback-error");
		});
		assert.throws(function()  {
			this.legacy.value; // accessing the property should throw an error
			assert.notOk(true, "this assert should not be reached");
		}, /callback-error/, "error is thrown");
	});

	QUnit.test("avoiding infinite loops", function(assert) {
		assert.expect(3);
		lazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			assert.strictEqual(this.legacy.value, undefined, "stubbed value must be undefined");
			return this.value;
		}.bind(this));
		assert.strictEqual(this.legacy.value, this.value, "stub is applied");
	});

});
