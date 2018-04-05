/*global QUnit*/

(function ($, QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("view", "view");
	var sRoleAttribute = "role",
		getResourceBundleText = function (sResourceBundleKey) {
			return sap.uxap.ObjectPageLayout._getLibraryResourceBundle().getText(sResourceBundleKey);
		},
		assertCorrectRole = function ($elment, sRole, sMessage, assert) {
			assert.strictEqual($elment.attr(sRoleAttribute), sRole, sMessage);
		};

	QUnit.module("Screen reader support - Root element", {
		beforeEach: function () {
			this.objectPageView = sap.ui.xmlview("UxAP-71_ObjectPageScreenReaderSupport", {
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			});

			this.objectPageView.placeAt('content');
			sap.ui.getCore().applyChanges();

			this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
		},
		afterEach: function() {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Root element role", function (assert) {
		assertCorrectRole(this.oObjectPage.$(), "region", "Root element has appropriate region role set", assert);
	});

	QUnit.test("Root element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = oHeader.getTitleText(),
			sBundleTextWithTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITH_TITLE"),
			sBundleTextWithoutTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITHOUT_TITLE");

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"),  sBundleTextWithTitle + " "
			+ sTitleText, "The root element has correct aria-label set");

		// Update title's text
		sTitleText = "Updated title";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithTitle + " "
			+ sTitleText, "The root element has correctly updated it's aria-label");

		// Remove title's text
		sTitleText = "";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the root element now indicates that there is no title");
	});

	QUnit.module("Screen reader support - Section/SubSection", {
		beforeEach: function () {
			this.objectPageView = sap.ui.xmlview("UxAP-71_ObjectPageScreenReaderSupport", {
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			});
			this.objectPageView.placeAt('content');
			sap.ui.getCore().applyChanges();

			this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");

		},
		afterEach: function() {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Section/SubSection roles", function (assert) {
		var oSection = this.objectPageView.byId("testSection"),
				oSubSection = this.objectPageView.byId("testSubSection"),
				sRegionRole = "region";

		assertCorrectRole(oSection.$(), sRegionRole, "Sections have appropriate ARIA region role set", assert);
		assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA region role set", assert);
		assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA heading role set", assert);
	});

	QUnit.test("Section receives correct AriaLabelledBy", function (assert) {
		var oSection = this.objectPageView.byId("testSection"),
				sSectionTitle = oSection.getTitle(),
				oHiddenLabel = oSection.getAggregation("ariaLabelledBy");

		assert.strictEqual(oSection._getAriaLabelledBy().getText(), sSectionTitle, "The AriaLabelledBy element is set a" +
		" hidden label is created with the title of the section as text");

		assert.strictEqual(oHiddenLabel.sId, oSection.$().attr("aria-labelledby"),
				"The 'aria-labelledby' attribute is correctly set to the section");
	});

}(jQuery, QUnit));
