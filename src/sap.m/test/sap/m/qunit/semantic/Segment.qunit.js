/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/semantic/Segment",
	"sap/m/Toolbar",
	"sap/m/Button"
], function(QUnitUtils, createAndAppendDiv, Segment, Toolbar, Button) {
	createAndAppendDiv("qunit-fixture-visible");



	//

	QUnit.module("Segment", {
		beforeEach: function () {

		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("has correct init state", function (assert) {
		// Arrange
		var oToolbar = new Toolbar();

		// Act
		var oSegment = new Segment(null, oToolbar);

		// Assert
		assert.strictEqual(oSegment != null, true, "Segment is created");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("content is managed correctly", function (assert) {
		// Arrange
		var oToolbar = new Toolbar(),
				oSegment = new Segment(null, oToolbar, "content"),
				aContent = oSegment.getContent(),
				oBtn1 = new Button(),
				oBtn2 = new Button(),
				oBtn3 = new Button();

		// Assert
		assert.ok(aContent !== oSegment.getContent(), "New copy of the content array is returned");

		// Act
		oSegment.addContent(oBtn1);

		// Assert
		assert.strictEqual(oToolbar.indexOfContent(oBtn1), 0, "Button is added");

		// Act
		oSegment.addContent(oBtn2);

		// Assert
		assert.strictEqual(oToolbar.indexOfContent(oBtn2), 1, "Button is added");

		// Act
		oSegment.insertContent(oBtn3, 1);

		// Assert
		assert.strictEqual(oToolbar.indexOfContent(oBtn3), 1, "Button is inserted");

		// Act
		var oResult = oSegment.removeContent(oBtn1);

		// Assert
		assert.strictEqual(oResult, oBtn1, "Button is removed");
		assert.strictEqual(oSegment.getContent().length, 2, "has correct length");

		// Act
		oResult = oSegment.removeAllContent();

		// Assert
		assert.strictEqual(oResult.length, 2, "Buttons are removed");
		assert.strictEqual(oSegment.getContent().length, 0, "has correct length");

		// Cleanup
		oToolbar.destroy();
	});
});