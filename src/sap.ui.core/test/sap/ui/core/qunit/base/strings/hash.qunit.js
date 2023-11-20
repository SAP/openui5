/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/strings/hash'], function(hash) {
	"use strict";

	QUnit.module("sap/base/strings/hash");

	QUnit.test("empty string", function(assert) {
		var s = "";
		assert.equal(hash(s), 0, "empty string hash-code is 0");
	});

	QUnit.test("equality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.strictEqual(hash(s), hash(s), "same string - same hash-code");
	});

	QUnit.test("inequality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.notEqual(hash(s), hash(s + "."), "different string - different hash-code");
	});

});