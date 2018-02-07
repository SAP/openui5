/*global QUnit */
sap.ui.define(["sap/base/strings/charToUpperCase"], function(charToUpperCase) {
	"use strict";

	QUnit.test("CharToUpperCase", function (assert) {
		assert.strictEqual(charToUpperCase("gggT"), "GggT");
		assert.strictEqual(charToUpperCase("gs4T"), "Gs4T");
		assert.strictEqual(charToUpperCase("gggT",0), "GggT");
		assert.strictEqual(charToUpperCase("gggT",3), "gggT");
		assert.strictEqual(charToUpperCase("gggT",2), "ggGT");
		assert.strictEqual(charToUpperCase("low",2), "loW");
		assert.strictEqual(charToUpperCase("löw",3), "Löw");

		assert.strictEqual(charToUpperCase("gggT",-1), "GggT");
		assert.strictEqual(charToUpperCase("gggT",-2), "GggT");
		assert.strictEqual(charToUpperCase("gggT","kgtzjrf"), "GggT");
		assert.strictEqual(charToUpperCase("gshfJsrhT",10), "GshfJsrhT");

		assert.strictEqual(charToUpperCase("gggT",null), "GggT");
		assert.strictEqual(charToUpperCase(null,-1), null);

		assert.strictEqual(charToUpperCase("gggT",{}), "GggT");

	});
});
