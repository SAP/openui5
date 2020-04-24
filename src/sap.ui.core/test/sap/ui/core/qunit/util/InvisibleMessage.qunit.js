/*global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleMessage",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"

], function (Core, coreLibrary, InvisibleMessage, Log) {
	"use strict";

	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	QUnit.test("Element creation", function(assert) {
		// Arrange
		var oInstance = InvisibleMessage.getInstance(),
			oSecondInstance = new InvisibleMessage();

		// Assert
		assert.ok(oInstance, "element must have been created");
		assert.ok(oInstance === oSecondInstance, "There should be a single instance of the class.");
	});

	QUnit.test("Element announcing", function(assert) {
		// Arrange
		var oStatic = Core.getStaticAreaRef(),
			oPoliteMarkup = oStatic.querySelector(".sapUiInvisibleMessagePolite"),
			oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive"),
			fnInfoSpy = this.spy(Log, "info"),
			oInvisibleMessage = InvisibleMessage.getInstance();

		// Act
		oInvisibleMessage.announce("Announcement", "invalidMode");
		oInvisibleMessage.announce("Announcement", InvisibleMessageMode.Assertive);
		oInvisibleMessage.announce("<script>alert('xss')</script>", InvisibleMessageMode.Polite);

		// Assert
		assert.strictEqual(oPoliteMarkup.innerHTML, "&lt;script&gt;alert('xss')&lt;/script&gt;", "HTML tags are escaped");
		assert.strictEqual(oAssertiveMarkup.textContent, "Announcement",  "The text of the assertive span should have been changed.");
		assert.ok(fnInfoSpy.called, "An info message should be displayed when calling the method with invalid mode.");
	});
});