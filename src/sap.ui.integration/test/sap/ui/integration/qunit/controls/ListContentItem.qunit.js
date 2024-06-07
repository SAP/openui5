/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/integration/cards/ListContent",
	"sap/ui/integration/controls/ListContentItem",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/ObjectStatus"
], function(
	Library,
	coreLibrary,
	ListContent,
	ListContentItem,
	Microchart,
	nextUIUpdate,
	ObjectStatus
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Rendering");

	QUnit.test("Root classes", async function (assert) {
		// arrange
		var oLCI = new ListContentItem();

		oLCI.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCI"), "'sapUiIntLCI' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and description", async function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			description: "This is description"
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		oLCI.setDescriptionVisible(false);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCIOneLine"), "'sapUiIntLCIOneLine' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and chart", async function (assert) {
		// arrange
		var oMicrochart = new Microchart();
		var oLCI = new ListContentItem({
			title: "This is title",
			microchart:oMicrochart
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		oMicrochart.setVisible(false);
		oLCI.invalidate();
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCIOneLine"), "'sapUiIntLCIOneLine' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title and 1 row of attributes", async function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			attributes: [
				new ObjectStatus(),
				new ObjectStatus()
			]
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCITwoLines"), "'sapUiIntLCITwoLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title, chart and description", async function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			description: "This is description",
			microchart: new Microchart()
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntLCIMultipleLines"), "'sapUiIntLCIMultipleLines' class should be present.");

		// clean up
		oLCI.destroy();
	});

	[
		{ src: "https://sap.com/someIcon.jpg", isThumbnail: true },
		{ src: "", isThumbnail: false },
		{ src: " ", isThumbnail: false },
		{ src: "sap-icon://error", isThumbnail: false }
	].forEach(({src, isThumbnail}) => {
		QUnit.test(`Thumbnail class for src '${src}'`, async function (assert) {
			// arrange
			const oLCI = new ListContentItem({ icon: src });
			oLCI.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			// assert
			assert.strictEqual(oLCI.getDomRef().classList.contains("sapUiIntLCIThumbnail"), isThumbnail);

			// clean up
			oLCI.destroy();
		});
	});

	QUnit.test("Lines count for renderer - attributes", function (assert) {
		// arrange
		const oContent = new ListContent();

		const oSample1 = {
			title: "This is title",
			description: {
				value: "This is description"
			},
			attributes: [
				{
					value: "test 1"
				},
				{
					value: "test 2"
				},
				{
					value: "test 3"
				},
				{
					value: "test 4"
				}
			],
			chart: {

			}
		};

		// assert
		assert.strictEqual(ListContentItem.getLinesCount(oSample1, oContent), 5, "Lines count are as expected.");

		// clean up
		oContent.destroy();
	});

	QUnit.test("Lines count for renderer attributes 2", function (assert) {
		// arrange
		const oContent = new ListContent();

		const oSample2 = {
			title: "This is title",
			description: {
				value: "This is description",
				visible: "{= !!${binding}}"
			},
			attributes: [
				{
					value: "test 1",
					visible: true
				},
				{
					value: "test 2",
					visible: false
				},
				{
					value: "test 3"
				},
				{
					value: "test 4",
					visible: "{= !!${binding}}"
				}
			],
			chart: {
				visible: "{= !!${binding}}"
			}
		};

		// assert
		assert.strictEqual(ListContentItem.getLinesCount(oSample2, oContent), 2, "Lines count are as expected.");

		// clean up
		oContent.destroy();
	});

	QUnit.test("Lines count for renderer - attributes 3", function (assert) {
		// arrange
		const oContent = new ListContent();

		const oSample1 = {
			title: "This is title",
			attributes: [
				{
					value: "test 1",
					visible: true
				},
				{
					value: "test 2",
					visible: false
				}
			]
		};

		// assert
		assert.strictEqual(ListContentItem.getLinesCount(oSample1, oContent), 2, "Lines count are as expected.");

		// clean up
		oContent.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oLCI = new ListContentItem();
		},
		afterEach: function () {
			this.oLCI.destroy();
		}
	});

	QUnit.test("getContentAnnouncement with attributes", function (assert) {
		// arrange
		var sTitle = "Item title";

		var oLCI = new ListContentItem({
			title: sTitle,
			attributes: [
				new ObjectStatus({text: "test 1", state: "Error"}),
				new ObjectStatus({text: "test 2", visible: false})
			]
		});

		// assert
		assert.strictEqual(oLCI.getContentAnnouncement(), "Item title . test 1 Invalid entry", "Content announcement should be correct");
	});

	QUnit.test("getContentAnnouncement all elements set on a listContent", function (assert) {
		// arrange
		var sTitle = "Item title",
			sDescription = "Item description",
			sInfo = "Item info",
			sInfoState = ValueState.Error,
			oMBundle = Library.getResourceBundleFor("sap.m"),
			sExpectedAnnouncement = sTitle + " . " + sDescription + " . " + sInfo + " . " + oMBundle.getText("LIST_ITEM_STATE_" + sInfoState.toUpperCase());
		this.oLCI.setTitle(sTitle)
			.setDescription(sDescription)
			.setInfo(sInfo)
			.setInfoState(sInfoState);

		// assert
		assert.strictEqual(this.oLCI.getContentAnnouncement(), sExpectedAnnouncement, "Content announcement should be correct");
	});
});
