/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/Bar",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Element, createAndAppendDiv, Page, App, Bar, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("page-content");

	var $Page;
	var $PageHeader;
	var $PageSubHeader;
	var $PageFooter;
	var $PageSection;

	var cacheAndInitializeDomRefs = function(sId) {

		// global variables
		var oPage = Element.getElementById(sId);
		$Page = oPage.$();
		$PageHeader = $Page.find(".sapMBar.sapMHeader-CTX");
		$PageSubHeader = $Page.find(".sapMBar.sapMSubHeader-CTX");
		$PageFooter = $Page.find(".sapMBar.sapMFooter-CTX");
		$PageSection = $Page.find("section");
	};

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	QUnit.test("default values", async function(assert) {

		// system under test
		var oPage = new Page();

		// arrange
		var oApp = new App("myApp");
		oApp.placeAt("page-content");
		oApp.addPage(oPage);
		await nextUIUpdate();
		cacheAndInitializeDomRefs(oPage.getId());

		// assertions
		assert.strictEqual(oPage.getTitle(), "");
		assert.strictEqual(oPage.getShowNavButton(), false);
		assert.strictEqual(oPage.getShowHeader(), true);
		assert.strictEqual(oPage.getEnableScrolling(), true);
		assert.strictEqual(oPage.getBackgroundDesign(), "Standard");

		// cleanup
		oApp.destroy();
	});

	/**
	 * @deprecated Since version 1.20
	 */
	QUnit.test("default values (deprecated properties)", async function(assert) {

		// system under test
		var oPage = new Page();

		// arrange
		var oApp = new App("myApp");
		oApp.placeAt("page-content");
		oApp.addPage(oPage);
		await nextUIUpdate();
		cacheAndInitializeDomRefs(oPage.getId());

		// assertions
		assert.strictEqual(oPage.getNavButtonText(), "");
		assert.strictEqual(oPage.getIcon(), "");
		assert.strictEqual(oPage.getNavButtonType(), "Back");

		// cleanup
		oApp.destroy();
	});

	/* =========================================================== */
	/* HTML module                                                 */
	/* =========================================================== */

	QUnit.module("HTML");

	var fnRendererTestCase = function(mOptions) {
		QUnit.test("rendering", async function(assert) {

			// system under test
			var oPage = mOptions.page;

			// arrange
			var oApp = new App("myApp");

			var oFooter = oPage.getFooter(),
				bShowFooter = oPage.getShowFooter(),
				bShouldOffsetTheContent = !!(oFooter && bShowFooter);

			oApp.placeAt("page-content");
			oApp.addPage(oPage);
			await nextUIUpdate();
			cacheAndInitializeDomRefs(oPage.getId());

			// assertions
			assert.ok($Page.length, "The page HTML div element exists");
			assert.ok($PageSection.length, "The page section HTML element exists");
			assert.ok($Page.hasClass("sapMPage"), 'The page HTML Div element "must have" the CSS class "sapMPage"');

			if (oPage.getShowHeader()) {
				assert.ok($PageHeader.length, "The page header HTML element exists");
				assert.ok($Page.hasClass("sapMPageWithHeader"), 'The page HTML Div element "must have" the CSS class "sapMPageWithHeader"');
			} else {
				assert.ok(!$PageHeader.length, "The page header HTML element do not exists");
				assert.ok(!$Page.hasClass("sapMPageWithHeader"), 'The page HTML Div element "must not have" the CSS class "sapMPageWithHeader"');
			}

			if (oPage.getSubHeader()) {
				assert.ok($PageSubHeader.length, "The page sub-header HTML element exists");
				assert.ok($Page.hasClass("sapMPageWithSubHeader"), 'The page HTML Div element "must have" the CSS class "sapMPageWithSubHeader"');
			} else {
				assert.ok(!$PageSubHeader.length, "The page sub-header HTML element do not exists");
				assert.ok(!$Page.hasClass("sapMPageWithSubHeader"), 'The page HTML Div element "must not have" the CSS class "sapMPageWithSubHeader"');
			}

			if (oFooter) {
				assert.ok($PageFooter.length, "The page footer HTML element exists");
			} else {
				assert.ok(!$PageFooter.length, "The page footer HTML element do not exists");
			}

			assert.equal($Page.hasClass("sapMPageWithFooter"), bShouldOffsetTheContent, 'The page HTML Div element has the class "sapMPageWithFooter": ' + bShouldOffsetTheContent);

			assert.strictEqual($Page.css("display"), "block", 'The page HTML Div element is displayed as block, "diplay: block"');

			// cleanup
			oApp.destroy();
		});
	};

	// page without footer, header and sub-header
	fnRendererTestCase({
		page: new Page({
			showHeader: false
		})
	});

	// page with header
	fnRendererTestCase({
		page: new Page()
	});

	// page with footer
	fnRendererTestCase({
		page: new Page({
			showHeader: false,
			footer: new Bar()
		})
	});

	// page with header and sub-header
	fnRendererTestCase({
		page: new Page({
			showHeader: true,
			subHeader: new Bar()
		})
	});

	// page with header and footer
	fnRendererTestCase({
		page: new Page({
			showHeader: true,
			footer: new Bar()
		})
	});

	// page with header, sub-header and footer
	fnRendererTestCase({
		page: new Page({
			showHeader: true,
			subHeader: new Bar(),
			footer: new Bar()
		})
	});
});