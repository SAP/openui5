/*global QUnit*/

sap.ui.define(["sap/ui/thirdparty/jquery",
               "sap/ui/core/Core",
               "sap/uxap/ObjectPageLayout",
               "sap/uxap/ObjectPageSection",
               "sap/ui/core/mvc/XMLView"],
function (jQuery, Core, ObjectPageLayout, ObjectPageSection, XMLView) {
	"use strict";

	var sRoleAttribute = "role",
		sRoleDescriptionAttribute = "aria-roledescription",
		getResourceBundleText = function (sResourceBundleKey) {
			return ObjectPageLayout._getLibraryResourceBundle().getText(sResourceBundleKey);
		},
		assertCorrectRole = function ($elment, sRole, sMessage, assert) {
			assert.strictEqual($elment.attr(sRoleAttribute), sRole, sMessage);
		},
		assertCorrectRoleDescripiton = function ($elment, sRoleDescription, sMessage, assert) {
			assert.strictEqual($elment.attr(sRoleDescriptionAttribute), sRoleDescription, sMessage);
		};

	QUnit.module("Screen reader support - Page elements", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(function (oView) {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Root element role", function (assert) {
		var sRoleBundleText = getResourceBundleText("ROOT_ROLE_DESCRIPTION");

		assertCorrectRole(this.oObjectPage.$(), "main", "Root element has appropriate main role set", assert);
		assertCorrectRoleDescripiton(this.oObjectPage.$(), sRoleBundleText, "Root element has appropriate role description set", assert);
	});

	QUnit.test("Root element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = oHeader.getTitleText(),
			sBundleTextWithTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITH_TITLE"),
			sBundleTextWithoutTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITHOUT_TITLE");

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sTitleText + " "
			+ sBundleTextWithTitle, "The root element has correct aria-label set");

		// Update title's text
		sTitleText = "Updated title";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sTitleText + " "
				+ sBundleTextWithTitle, "The root element has correctly updated it's aria-label");

		// Remove title's text
		sTitleText = "";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the root element now indicates that there is no title");
	});

	QUnit.test("Header element role", function (assert) {
		var sRoleBundleText = getResourceBundleText("HEADER_ROLE_DESCRIPTION");

		assertCorrectRole(this.oObjectPage.$("headerTitle"), "banner", "Header element has appropriate banner role set", assert);
		assertCorrectRoleDescripiton(this.oObjectPage.$("headerTitle"), sRoleBundleText, "Header element has appropriate role description set", assert);
	});

	QUnit.test("Header element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = oHeader.getTitleText(),
			sBundleTextWithTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITH_TITLE"),
			sBundleTextWithoutTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITHOUT_TITLE");

		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), sTitleText + " "
			+ sBundleTextWithTitle, "The header element has correct aria-label set");

		// Update title's text
		sTitleText = "Updated title";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), sTitleText + " "
				+ sBundleTextWithTitle, "The header element has correctly updated it's aria-label");

		// Remove title's text
		sTitleText = "";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the header element now indicates that there is no title");
	});

	QUnit.test("AnchorBar element role", function (assert) {
		var sRoleBundleText = getResourceBundleText("NAVIGATION_ROLE_DESCRIPTION");

		assertCorrectRole(this.oObjectPage.$("anchorBar"), "navigation", "AnchorBar element has appropriate banner role set", assert);
		assertCorrectRoleDescripiton(this.oObjectPage.$("anchorBar"), sRoleBundleText, "AnchorBar element has appropriate role description set", assert);
	});

	QUnit.test("AnchorBar element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = "Updated title",
			sBundleTextWithTitle = getResourceBundleText("NAVIGATION_ARIA_LABEL_WITH_TITLE"),
			sBundleTextWithoutTitle = getResourceBundleText("NAVIGATION_ARIA_LABEL_WITHOUT_TITLE");

		// Update title's text
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$("anchorBar").attr("aria-label"), sTitleText + " "
				+ sBundleTextWithTitle, "The AnchorBar element has correctly updated it's aria-label");

		// Remove title's text
		sTitleText = "";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$("anchorBar").attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the AnchorBar element now indicates that there is no title");
	});

	QUnit.test("AnchorBar sticky aria state", function (assert) {
		var oStickyAnchorBar = this.oObjectPage.$("stickyAnchorBar");

		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "true", "The sticky AnchorBar should have aria-hidden=true when header is expanded initially.");

		this.oObjectPage._snapHeader();
		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "false", "The sticky AnchorBar should have aria-hidden=false when header is snaped.");

		this.oObjectPage._expandHeader();
		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "true", "The sticky AnchorBar should have aria-hidden=true when header is expanded again.");
	});

	QUnit.test("Footer element role", function (assert) {
		var sRoleBundleText = getResourceBundleText("FOOTER_ROLE_DESCRIPTION");

		assertCorrectRole(this.oObjectPage.$("footerWrapper"), "region", "Footer element has appropriate banner role set", assert);
		assertCorrectRoleDescripiton(this.oObjectPage.$("footerWrapper"), sRoleBundleText, "Footer element has appropriate role description set", assert);
	});

	QUnit.test("Footer element aria-label", function (assert) {
		var oFooter = this.oObjectPage.getFooter(),
			sAriaLabelBundleText = getResourceBundleText("FOOTER_ARIA_LABEL");

		assert.strictEqual(oFooter.$().attr("aria-label"), sAriaLabelBundleText, "The footer element has correct aria-label set");
	});

	QUnit.module("Screen reader support - Section/SubSection", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(function (oView) {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}	});

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
				oHiddenLabel = oSection.getAggregation("ariaLabelledBy"),
				sSectionText = ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME");

		assert.strictEqual(oSection._getAriaLabelledBy().getText(), sSectionTitle + " " + sSectionText,
			"A hidden text is created with the title of the section plus the word 'Section' as text");

		assert.strictEqual(oHiddenLabel.sId, oSection.$().attr("aria-labelledby"),
				"The 'aria-labelledby' attribute is correctly set to the section");
	});

});
