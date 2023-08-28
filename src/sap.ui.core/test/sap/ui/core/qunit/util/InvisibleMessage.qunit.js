/*global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleMessage",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/StaticArea",
	"sap/ui/thirdparty/sinon-qunit"
], function(Core, coreLibrary, InvisibleMessage, Log, sinon, nextUIUpdate, StaticArea) {
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
		var oInvisibleMessage = InvisibleMessage.getInstance(),
			oStatic = StaticArea.getDomRef()/* LFUI5: Check: StaticArea's API might have a better fit for your use case. */,
			fnInfoSpy = this.spy(Log, "info"),
			oPoliteMarkup, oAssertiveMarkup;

		// Act
		oInvisibleMessage.announce("Announcement", "invalidMode");
		oInvisibleMessage.announce("Announcement", InvisibleMessageMode.Assertive);
		oInvisibleMessage.announce("<script>alert('xss')</script>", InvisibleMessageMode.Polite);

		oPoliteMarkup = oStatic.querySelector(".sapUiInvisibleMessagePolite");
		oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive");

		// Assert
		assert.strictEqual(oPoliteMarkup.innerHTML, "&lt;script&gt;alert('xss')&lt;/script&gt;", "HTML tags are escaped");
		assert.strictEqual(oAssertiveMarkup.textContent, "Announcement",  "The text of the assertive span should have been changed.");
		assert.ok(fnInfoSpy.called, "An info message should be displayed when calling the method with invalid mode.");
	});

	QUnit.test("Clearing of element content", async function(assert) {
		// Arrange
		var oInvisibleMessage = InvisibleMessage.getInstance(),
			oStatic = StaticArea.getDomRef()/* LFUI5: Check: StaticArea's API might have a better fit for your use case. */,
			oAssertiveMarkup;

		this.clock = sinon.useFakeTimers();

		// Act
		oInvisibleMessage.announce("Announcement", InvisibleMessageMode.Assertive);

		oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive");

		// Assert
		assert.strictEqual(oAssertiveMarkup.textContent, "Announcement",  "The text of the assertive span should have been changed.");

		this.clock.tick(4000);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAssertiveMarkup.textContent, "",  "The text of the assertive span should be cleared out.");
	});
});