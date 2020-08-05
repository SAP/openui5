/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/Bar"
], function(QUnitUtils, createAndAppendDiv, Page, App, Bar) {
	createAndAppendDiv("page-content");



	var cacheAndInitializeDomRefs = function(sId) {

		// global variables
		oPage = sap.ui.getCore().byId(sId);
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

	QUnit.test("default values", function(assert) {

		// system under test
		var oPage = new Page();

		// arrange
		var oApp = new App("myApp");
		oApp.placeAt("page-content");
		oApp.addPage(oPage);
		sap.ui.getCore().applyChanges();
		cacheAndInitializeDomRefs(oPage.getId());

		// assertions
		assert.strictEqual(oPage.getTitle(), "");
		assert.strictEqual(oPage.getShowNavButton(), false);
		assert.strictEqual(oPage.getShowHeader(), true);
		assert.strictEqual(oPage.getNavButtonText(), "");
		assert.strictEqual(oPage.getEnableScrolling(), true);
		assert.strictEqual(oPage.getIcon(), "");
		assert.strictEqual(oPage.getBackgroundDesign(), "Standard");
		assert.strictEqual(oPage.getNavButtonType(), "Back");

		// cleanup
		oApp.destroy();
	});

	/* =========================================================== */
	/* HTML module                                                 */
	/* =========================================================== */

	QUnit.module("HTML");

	var fnRendererTestCase = function(mOptions) {
		QUnit.test("rendering", function(assert) {

			// system under test
			var oPage = mOptions.page;

			// arrange
			var oApp = new App("myApp"),
				sTop = "0px",
				sBottom = "0px";

			var oFooter = oPage.getFooter(),
				bShowFooter = oPage.getShowFooter(),
				bShouldOffsetTheContent = !!(oFooter && bShowFooter);

			oApp.placeAt("page-content");
			oApp.addPage(oPage);
			sap.ui.getCore().applyChanges();
			cacheAndInitializeDomRefs(oPage.getId());

			// assertions
			assert.ok($Page.length, "The page HTML div element exists");
			assert.ok($PageSection.length, "The page section HTML element exists");
			assert.ok($Page.hasClass("sapMPage"), 'The page HTML Div element "must have" the CSS class "sapMPage"');
			assert.strictEqual($Page.css("position"), "absolute", 'The page HTML Div element is absolute positioned, "position: absolute"');

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

			assert.strictEqual($Page.css("top"), "0px", 'The page HTML Div element is absolute positioned, "top: 0px"');
			assert.strictEqual($Page.css("left"), "0px", 'The page HTML Div element is absolute positioned, "left: 0px"');
			assert.strictEqual($Page.css("display"), "block", 'The page HTML Div element is displayed as block, "diplay: block"');
			assert.strictEqual($PageSection.css("position"), "absolute", 'The page section HTML element is absolute positioned, "position: absolute"');

			assert.strictEqual($PageSection.css("right"), "0px", 'The page section HTML element is absolute positioned, "right: 0px"');
			assert.strictEqual($PageSection.css("left"), "0px", 'The page section HTML element is absolute positioned, "left: 0px"');

			if (oPage.getShowHeader() || oPage.getSubHeader()) {
				sTop = "48px";
			}

			if (oPage.getShowHeader() && oPage.getSubHeader()) {
				sTop = "96px";
			}

			if (oFooter) {
				sBottom = "48px";
			}

			assert.strictEqual($PageSection.css("top"), sTop, 'The page section HTML element is absolute positioned, "top: ' + sTop + '"');
			assert.strictEqual($PageSection.css("bottom"), sBottom, 'The page section HTML element is absolute positioned, "bottom: ' + sBottom + '"');

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