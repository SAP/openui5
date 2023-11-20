/*global QUnit*/

sap.ui.define([
	"sap/ui/demo/toolpageapp/model/formatter"
], function (formatter) {
	"use strict";

	QUnit.module("Home image");

	function imageSourceTestCase(assert, bValue, sHomeImagePath, fExpectedSourceImage) {
		// Act
		var sImageSrc = formatter.srcImageValue(bValue, sHomeImagePath);

		// Assert
		assert.strictEqual(sImageSrc, fExpectedSourceImage, "The right image version is displayed");
	}

	QUnit.test("Should display the reduced image on small screen sizes", function (assert) {

		imageSourceTestCase.call(this, assert, true, "./images/homeImage", "./images/homeImage_small.jpg");
	});

	QUnit.test("Should display the original image on large screen sizes", function (assert) {

		imageSourceTestCase.call(this, assert, false, "./images/homeImage", "./images/homeImage.jpg");
	});

});