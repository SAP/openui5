/* global QUnit */
sap.ui.define(["sap/ui/core/IconPool"],function(IconPool) {
	"use strict";

	QUnit.test("insertFontFaceStyle", function(assert) {

		function findLinkElement() {
			return document.querySelector("head > link[type='text/css']");
		}

		assert.strictEqual(findLinkElement(), null, "Style should not have been inserted.");

		IconPool.insertFontFaceStyle();

		assert.strictEqual(findLinkElement(), null,
			"Link element still isn't created because the font-face declaration is done in library.css");
	});

});
