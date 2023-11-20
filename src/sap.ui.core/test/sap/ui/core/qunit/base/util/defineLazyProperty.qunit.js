sap.ui.define([
	'sap/base/util/defineLazyProperty'
], function(defineLazyProperty) {
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
		assert.expect(5);
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			return this.value;
		}.bind(this));
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").value, "property should not have a value yet");
		assert.strictEqual(this.legacy.value, this.value, "property set lazily via get");
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").get, "lazy property getter removed");
		assert.strictEqual(this.legacy.value, this.value, "property is still set");
	});

	QUnit.test("apply a lazy property stub from non-amd module", function(assert) {
		assert.expect();
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			// the defined setter is called by the following assignment and replaces the stub
			this.legacy.value = this.value;
			return this.legacy.value;
		}.bind(this));
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").value, "property should not have a value yet");
		assert.strictEqual(this.legacy.value, this.value, "property set lazily via get");
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").get, "lazy property getter removed");
		assert.strictEqual(this.legacy.value, this.value, "property is still set");
	});

	QUnit.test("overwriting a stubbed value", function(assert) {
		assert.expect(1);
		var altValue = {};
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(false, "callback should not be called");
			return this.value;
		}.bind(this));
		// the defined setter is called by the following assignment and replaces the stub
		this.legacy.value = altValue;
		assert.strictEqual(altValue, this.legacy.value);
	});

	QUnit.test("error in callback", function(assert) {
		assert.expect(2);
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			throw new Error("callback-error");
		});
		assert.throws(function()  {
			this.legacy.value; // accessing the property should throw an error
			assert.notOk(true, "this assert should not be reached");
		}, /callback-error/, "error is thrown");
	});

	QUnit.test("avoiding infinite loops", function(assert) {
		assert.expect(6);
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(true, "callback called");
			assert.strictEqual(this.legacy.value, undefined, "stubbed value must be undefined");
			return this.value;
		}.bind(this));
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").value, "property should not have a value yet");
		assert.strictEqual(this.legacy.value, this.value, "property set lazily via get");
		assert.notOk(Object.getOwnPropertyDescriptor(this.legacy, "value").get, "lazy property getter removed");
		assert.strictEqual(this.legacy.value, this.value, "property is still set");
	});

	QUnit.test("marker", function(assert) {
		assert.expect(1);
		defineLazyProperty(this.legacy, "value", function() {
			assert.ok(false, "callback should not be called");
			return this.value;
		}, "marker");
		var oDescriptor = Object.getOwnPropertyDescriptor(this.legacy, "value");
		assert.ok(oDescriptor && oDescriptor.get && oDescriptor.get["marker"], "marker should be in place");
	});

});
