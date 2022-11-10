/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/integration/controls/ListContentItem",
	"sap/ui/integration/controls/Microchart",
	"sap/m/ObjectStatus"
], function (
	Core,
	coreLibrary,
	ListContentItem,
	Microchart,
	ObjectStatus
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Rendering");

	QUnit.test("Root classes", function (assert) {
		// arrange
		var oLCI = new ListContentItem();

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCI"), "'sapUiIntLCI' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and description", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			description: "This is description"
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and chart", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			microchart: new Microchart()
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and 1 row of attributes", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			attributes: [
				new ObjectStatus(),
				new ObjectStatus()
			]
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title, chart and description", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			description: "This is description",
			microchart: new Microchart()
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCIMultipleLines"), "'sapUiIntLCIMultipleLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oLCI = new ListContentItem();
		},
		afterEach: function () {
			this.oLCI.destroy();
		}
	});

	QUnit.test("getContentAnnouncement", function (assert) {
		// arrange
		var sTitle = "Item title",
			sDescription = "Item description",
			sInfo = "Item info",
			sInfoState = ValueState.Error,
			oMBundle = Core.getLibraryResourceBundle("sap.m"),
			sExpectedAnnouncement = sTitle + " . " + sDescription + " . " + sInfo + " . " + oMBundle.getText("LIST_ITEM_STATE_" + sInfoState.toUpperCase());
		this.oLCI.setTitle(sTitle)
			.setDescription(sDescription)
			.setInfo(sInfo)
			.setInfoState(sInfoState);

		// assert
		assert.strictEqual(this.oLCI.getContentAnnouncement(), sExpectedAnnouncement, "Content announcement should be correct");
	});
});
