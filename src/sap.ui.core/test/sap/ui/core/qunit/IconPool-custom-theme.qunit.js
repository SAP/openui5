/* global QUnit */
sap.ui.define(["sap/ui/core/IconPool"],function(IconPool) {
	"use strict";

	QUnit.test("insertFontFaceStyle", function(assert) {

		assert.equal(jQuery("head > link[type='text/css']").get(0), null, "Style should not have been inserted.");

		IconPool.insertFontFaceStyle();

		var oLinkElement = jQuery("head > link[type='text/css']");
		assert.ok(oLinkElement.length === 0, "Link element isn't created because the font-face declaration is done in library.css");
	});

});
