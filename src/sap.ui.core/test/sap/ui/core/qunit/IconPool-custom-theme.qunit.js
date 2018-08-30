/* global QUnit */
sap.ui.define(["sap/ui/core/IconPool"],function(IconPool) {
	"use strict";

	QUnit.test("insertFontFaceStyle", function(assert) {

		assert.equal(jQuery("head > style[type='text/css']").get(0), null, "Style should not have been inserted.");

		IconPool.insertFontFaceStyle();

		var sCss = jQuery("head > style[type='text/css']").text();
		assert.ok(sCss.indexOf("url('test-resources/sap/ui/core/qunit/testdata/customcss/sap/ui/core/themes/base/fonts/SAP-icons") !== -1,
			"Font should have been include from custom theme folder.");
	});

});