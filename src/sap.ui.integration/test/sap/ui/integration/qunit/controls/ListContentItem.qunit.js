/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/controls/ListContentItem",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	Core,
	ListContentItem,
	Microchart,
	waitForThemeApplied
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Rendering");

	QUnit.test("Root classes", function (assert) {
		// arrange
		var oLCI = new ListContentItem();

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntegrationListContentItem"), "'sapUiIntegrationListContentItem' class should be present.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Root classes when there is a chart", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			microchart: new Microchart()
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oLCI.$().hasClass("sapUiIntegrationListContentItemWithChart"), "'sapUiIntegrationListContentItemWithChart' class should be present.");

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
		assert.strictEqual(oLCI.$().find(".sapMSLIDiv").css("flex-direction"), "column", "The content should be in column.");

		// clean up
		oLCI.destroy();
	});

	QUnit.test("Content layout when there are title, chart and description", function (assert) {
		// arrange
		var oLCI = new ListContentItem({
			title: "This is title",
			description: "This is description",
			chart: new Microchart()
		});

		oLCI.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.strictEqual(oLCI.$().find(".sapMSLIDiv").css("flex-direction"), "column", "The content should be in column.");

		// clean up
		oLCI.destroy();
	});

	return waitForThemeApplied();
});
