/*global QUnit */

sap.ui.define([
	"sap/f/GridListItem",
	"sap/m/Text",
	"sap/ui/core/message/MessageType",
	"sap/m/library",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function (
	GridListItem,
	Text,
	MessageType,
	mobileLibrary,
	createAndAppendDiv,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	var DOM_RENDER_LOCATION = "gridListItem-fixture";
	createAndAppendDiv(DOM_RENDER_LOCATION);

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.oGridListItem = new GridListItem({
				content: [
					new Text({ text: "This is the content"})
				]
			});
			this.oGridListItem.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGridListItem.destroy();
			this.oGridListItem = null;
		}
	});

	QUnit.test("Only content", function (assert) {
		// Assert
		assert.strictEqual(this.oGridListItem.$().find(".sapFGLIToolbar").length, 0, "Should NOT render toolbar when it is not needed.");
		assert.strictEqual(this.oGridListItem.$().find(".sapMLIBContent").length, 1, "The content should be rendered.");
	});

	QUnit.test("Highlight", async function (assert) {

		this.oGridListItem.setHighlight(MessageType.Success);
		await nextUIUpdate();
		assert.strictEqual(this.oGridListItem.$().find(".sapMLIBHighlight").length, 1, "Should render the 'highlight' state.");

		this.oGridListItem.setHighlight(MessageType.None);
		await nextUIUpdate();
		assert.strictEqual(this.oGridListItem.$().find(".sapMLIBHighlight").length, 0, "Should NOT render any state if not needed.");
	});

	QUnit.test("Mode", async function (assert) {
		// Arrange
		this.oGridListItem.setType(ListType.Navigation);
		await nextUIUpdate();
		var $headerToolbar = this.oGridListItem.$("gridListItemToolbar");
		var oTypeControlDomRef = this.oGridListItem.getTypeControl().getDomRef();

		// Assert
		assert.strictEqual($headerToolbar.length, 1, "Should render toolbar when there is type set.");
		assert.strictEqual($headerToolbar.find(oTypeControlDomRef).length, 1, "The type control is rendered within the toolbar.");
	});

	QUnit.module("API", {
		beforeEach: async function () {
			this.oGridListItem = new GridListItem({
				content: [
					new Text({ text: "This is the content"})
				]
			});
			this.oGridListItem.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGridListItem.destroy();
			this.oGridListItem = null;
		}
	});

	QUnit.test("#getContentAnnouncement", function (assert) {
		// Arrange
		var sContentAnnouncement = this.oGridListItem.getContentAnnouncement(),
			sContentText = this.oGridListItem.getContent()[0].getText();

		// Assert
		assert.strictEqual(sContentAnnouncement, sContentText, "The announcement text is correct");
	});

});