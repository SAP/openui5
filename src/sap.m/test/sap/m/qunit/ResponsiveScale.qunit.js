/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ResponsiveScale"
], function(QUnitUtils, createAndAppendDiv, ResponsiveScale) {
	createAndAppendDiv("content");



	QUnit.module("Methods");

	QUnit.test("Calculate max possible tickmarks that could fit on the scale.", function (assert) {
		var oScale = new ResponsiveScale();

		// Assert
		assert.strictEqual(oScale.calcNumberOfTickmarks(100, 1, 100), 100, "Do not allow more than 100 tickmarks per scale. Performance reasons.");
		assert.strictEqual(oScale.calcNumberOfTickmarks(100, 0.5, 100), 100, "Do not allow more than 100 tickmarks per scale. Performance reasons.");
		assert.strictEqual(oScale.calcNumberOfTickmarks(100, 5, 100), 21, "Should calculate a tickmark for every possible step.");
		assert.strictEqual(oScale.calcNumberOfTickmarks(499 /* prime number */, 1, 100), 1, "For prime numbers calculations are not possible. Can't spread tickmarks evenly in such edge case.");

		// Cleanup
		oScale.destroy();
	});

	QUnit.test("Labels responsiveness calculations.", function (assert) {
		var udef;
		var aResult1 = [udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef];
		var aResult2 = [udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef, true, udef];
		var aResult3 = [udef, true, true, true, udef, true, true, true, udef, true, true, true, udef, true, true, true, udef, true, true, true, udef, true, true, true, udef];
		var aResult4 = [udef, true, true, true, true, true, true, true, udef, true, true, true, true, true, true, true, udef, true, true, true, true, true, true, true, udef];


		var oScale = new ResponsiveScale();

		// Assert
		assert.deepEqual(oScale.getHiddenTickmarksLabels(1080, 25, 45, 80), aResult1, "Scale width of 1080px, 25 tickmarks, 45px offset left.");
		assert.deepEqual(oScale.getHiddenTickmarksLabels(960,  25, 40, 80), aResult2, "Scale width of 960px, 25 tickmarks, 40px offset left.");
		assert.deepEqual(oScale.getHiddenTickmarksLabels(720,  25, 30, 80), aResult3, "Scale width of 720px, 25 tickmarks, 30px offset left.");
		assert.deepEqual(oScale.getHiddenTickmarksLabels(360,  25, 15, 80), aResult4, "Scale width of 360px, 25 tickmarks, 15px offset left.");

		// Destroy
		oScale.destroy();
	});
});