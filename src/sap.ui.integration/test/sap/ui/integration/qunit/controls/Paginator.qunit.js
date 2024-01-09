/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/controls/Paginator",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Library,
	Paginator,
	nextUIUpdate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	QUnit.module("API and Rendering", {
		beforeEach: async function () {
			this.oPaginator = new Paginator({
				pageNumber: 1,
				pageCount: 4
			});
			this.oPaginator.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPaginator.destroy();
		}
	});

	QUnit.test("rendered", function (assert) {
		assert.strictEqual(this.oPaginator.$().length, 1, "rendered");

		assert.strictEqual(this.oPaginator._getNavigationArrow("prev").getTooltip(), oResourceBundle.getText("PAGINGBUTTON_PREVIOUS"), "tooltip text is correct");
		assert.strictEqual(this.oPaginator._getNavigationArrow("next").getTooltip(), oResourceBundle.getText("PAGINGBUTTON_NEXT"), "tooltip text is correct");
	});

	QUnit.test("pageCount <= 1", async function (assert) {
		this.oPaginator.setPageCount(1);
		await nextUIUpdate();
		assert.notOk(this.oPaginator.$().length, "not rendered");
	});

	QUnit.test("pageCount = 0", function (assert) {
		this.oPaginator
			.setPageCount(0)
			.setPageSize(3);

		assert.notOk(this.oPaginator._getLastPageNumber() < 0, "Last page number should NOT be negative number");
		assert.strictEqual(this.oPaginator._getLastPageNumber(), 0, "Last page number should be 0 when there are no pages");
	});

	QUnit.test("arrows and dots", function (assert) {
		assert.strictEqual(this.oPaginator.$().find(".sapMCrslPrev").length, 1, "prev arrow is rendered");
		assert.strictEqual(this.oPaginator.$().find(".sapMCrslNext").length, 1, "next arrow is rendered");

		assert.strictEqual(this.oPaginator.$().find(".sapMCrslBulleted span").length, 4, "dots are rendered");
		assert.ok(this.oPaginator.$().find(".sapMCrslBulleted span")[1].classList.contains("sapMCrslActive"), "active dot is correct");
	});

	QUnit.test("pageCount > 5", async function (assert) {
		this.oPaginator.setPageCount(10);
		await nextUIUpdate();
		assert.notOk(this.oPaginator.$().find(".sapMCrslBulleted span").length, "dots are not rendered");

		var $numericIndicator = this.oPaginator.$().find(".sapMCrslNumeric span");
		assert.strictEqual($numericIndicator.length, 1, "numeric indicator is rendered");
		assert.strictEqual($numericIndicator.text(), Library.getResourceBundleFor("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 10]), "numeric indicator is correct");
	});

	QUnit.module("Interaction", {
		beforeEach: async function () {
			this.oPaginator = new Paginator({
				pageNumber: 1,
				pageCount: 5
			});
			this.oPaginator.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPaginator.destroy();
		}
	});

	QUnit.test("navigate next", async function (assert) {
		// act - press right arrow
		this.oPaginator.$().find(".sapMCrslNext .sapUiIcon").trigger("click");
		assert.strictEqual(this.oPaginator.getPageNumber(), 2, "page number is correct");

		this.oPaginator.setPageNumber(4);
		await nextUIUpdate();

		this.oPaginator.$().find(".sapMCrslNext .sapUiIcon").trigger("click");
		assert.strictEqual(this.oPaginator.getPageNumber(), 4, "page number stays the same");
		assert.notOk(this.oPaginator.$().find(".sapFCardContentCloned, .sapFCardContentTransition, .sapFCardContentOriginal").length, "animations are cleared");
	});

	QUnit.test("navigate prev", function (assert) {
		// act - press right arrow
		this.oPaginator.$().find(".sapMCrslPrev .sapUiIcon").trigger("click");
		assert.strictEqual(this.oPaginator.getPageNumber(), 0, "page number is correct");

		this.oPaginator.$().find(".sapMCrslPrev .sapUiIcon").trigger("click");
		assert.strictEqual(this.oPaginator.getPageNumber(), 0, "page number stays the same");
		assert.notOk(this.oPaginator.$().find(".sapFCardContentCloned, .sapFCardContentTransition, .sapFCardContentOriginal, .sapFCardContentReverseAnim").length, "animations are cleared");
	});
});