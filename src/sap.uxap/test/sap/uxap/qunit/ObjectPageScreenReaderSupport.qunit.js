/*global QUnit*/

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery"
],
function(nextUIUpdate, ObjectPageLayout, ObjectPageSection, XMLView, $) {
	"use strict";

	var sRoleAttribute = "role",
		sRoleDescriptionAttribute = "aria-roledescription",
		getResourceBundleText = function (sResourceBundleKey) {
			return ObjectPageLayout._getLibraryResourceBundle().getText(sResourceBundleKey);
		},
		assertCorrectRole = function ($element, sRole, sMessage, assert) {
			assert.strictEqual($element.attr(sRoleAttribute), sRole, sMessage);
		},
		assertCorrectRoleDescription = function ($element, sRoleDescription, sMessage, assert) {
			assert.strictEqual($element.attr(sRoleDescriptionAttribute), sRoleDescription, sMessage);
		};

	QUnit.module("Screen reader support - Page elements", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(async function(oView) {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				await nextUIUpdate();
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
		assertCorrectRoleDescription(this.oObjectPage.$(), sRoleBundleText, "Root element has appropriate role description set", assert);
	});

	QUnit.test("Root element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = oHeader.getTitleText(),
			sBundleTextWithoutTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITHOUT_TITLE");

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The root element has correct aria-label set");

		// Update title's text
		sTitleText = "Updated title";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The root element has the correct aria-label after header title is updated");

		// Remove title's text
		sTitleText = "";
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The root element has the correct aria-label on empty header title");
	});

	QUnit.test("Header element role", function (assert) {
		var sRoleBundleText = getResourceBundleText("HEADER_ROLE_DESCRIPTION");

		assertCorrectRole(this.oObjectPage.$("headerTitle"), "banner", "Header element has appropriate banner role set", assert);
		assertCorrectRoleDescription(this.oObjectPage.$("headerTitle"), sRoleBundleText, "Header element has appropriate role description set", assert);
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

	QUnit.test("AnchorBar element aria-label", function (assert) {
		var oHeader = this.objectPageView.byId("objectPageHeader"),
			sTitleText = "Updated title",
			sBundleTextWithoutTitle = getResourceBundleText("NAVIGATION_ARIA_LABEL_WITHOUT_TITLE");

		// Update title's text
		oHeader.setObjectTitle(sTitleText);

		assert.strictEqual(this.oObjectPage.$("anchorBar").attr("aria-label"), sTitleText, "The AnchorBar element has correctly updated it's aria-label");

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
		assertCorrectRoleDescription(this.oObjectPage.$("footerWrapper"), sRoleBundleText, "Footer element has appropriate role description set", assert);
	});

	QUnit.test('AriaLabelledBy attribute is set correctly on the footer toolbar', function(assert) {
		var oFooter = this.oObjectPage.getFooter(),
			$InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 1, "InvisibleText DOM element exists");
		assert.equal(oFooter.$().attr("aria-labelledby"), $InvisibleTextDomRef.attr('id'), "ObjectPageLayout Footer aria-labelledby points to the invisible text control");
	});

	QUnit.test('Invisible Text gets removed when footer aggregation is destroyed', async function(assert) {
		// Arrange
		var oPage = this.oObjectPage,
			oFooter = oPage.getFooter();

		// Act
		oPage.destroyFooter();
		await nextUIUpdate();

		var $InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 0, "InvisibleText element is removed from the DOM");
	});

	QUnit.module("Screen reader support - Section/SubSection", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(async function(oView) {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				await nextUIUpdate();
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
				oHiddenLabel = oSection.getAggregation("ariaLabelledBy");

		assert.strictEqual(oSection._getAriaLabelledBy().getText(), sSectionTitle,
			"A hidden text is created with the title of the section");

		assert.strictEqual(oHiddenLabel.sId, oSection.$().attr("aria-labelledby"),
				"The 'aria-labelledby' attribute is correctly set to the section");
	});

});
