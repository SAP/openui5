/*global QUnit,sinon*/

(function ($, QUnit, sinon) {
	"use strict";

	var core = sap.ui.getCore(),
		sAnchorSelector = ".sapUxAPAnchorBarScrollContainer .sapUxAPAnchorBarButton";

	jQuery.sap.registerModulePath("view", "view");

	sap.ui.controller("viewController", {});

	var viewController = sap.ui.controller("viewController");

	var anchorBarView = sap.ui.xmlview("UxAP-70_KeyboardHandling", {
		viewName: "view.UxAP-70_KeyboardHandling",
		controller: viewController
	});

	function getAnchorBar() {
		return sap.ui.getCore().byId("UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar");
	}

	anchorBarView.placeAt("content");

	QUnit.module("AnchorBar", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			sap.ui.Device.system.phone = false;
			jQuery("html")
				.removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
				.addClass("sapUiMedia-Std-Desktop");
			var sFocusable = "0",
				sTabIndex = "tabIndex";
			this.oObjectPage = anchorBarView.byId("ObjectPageLayout");
			this.oObjectPage._setAsCurrentSection("__section1");

			this.assertCorrectTabIndex = function ($elment, sMessage, assert) {
				assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
			};
		},
		afterEach: function() {
			// trigger 'escape' keypress event to potentially close the popover
			var oActiveElement = document.activeElement;
			sap.ui.test.qunit.triggerKeydown(oActiveElement, jQuery.sap.KeyCodes.ESCAPE);
			sap.ui.test.qunit.triggerKeyup(oActiveElement, jQuery.sap.KeyCodes.ESCAPE);
			this.clock.tick(500);

			this.clock.restore();
		}
	});

	QUnit.test("TAB/SHIFT+TAB", function (assert) {
		var aAnchors = $(sAnchorSelector),
			oFirstAnchorButton = core.byId(aAnchors[0].id),
			oAnchor4Button = core.byId(aAnchors[4].id),
			oAnchor4Section = core.byId("__section9");

		this.assertCorrectTabIndex(oFirstAnchorButton.$(), "If no previously selected anchor button, " +
			"the first focusable anchor button should be the first one in the container", assert);

		this.oObjectPage._setAsCurrentSection(oAnchor4Section.sId);

		this.assertCorrectTabIndex(oAnchor4Button.$(), "Given a previously selected anchor button, " +
			"than it should be the first one to be focused on", assert);
	});


	QUnit.test("RIGHT", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iSecondAnchorId = aAnchors[1].id;

		jQuery.sap.byId(iFirstAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iFirstAnchorId, jQuery.sap.KeyCodes.ARROW_RIGHT);
		sap.ui.test.qunit.triggerKeyup(iFirstAnchorId, jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.ok(jQuery.sap.byId(iSecondAnchorId).is(":focus"), "Next button should be focused after arrow right");
	});

	QUnit.test("LEFT", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iSecondAnchorId = aAnchors[1].id,
			iThirdAnchorId = aAnchors[2].id;

		jQuery.sap.byId(iThirdAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iThirdAnchorId, jQuery.sap.KeyCodes.ARROW_LEFT);
		sap.ui.test.qunit.triggerKeyup(iThirdAnchorId, jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.ok(jQuery.sap.byId(iSecondAnchorId).is(":focus"), "Previous button should be focused after arrow left");
	});

	QUnit.test("HOME/END", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iLastAnchorId = aAnchors[aAnchors.length - 1].id + "-internalSplitBtn";

		jQuery.sap.byId(iFirstAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iFirstAnchorId, jQuery.sap.KeyCodes.END);
		sap.ui.test.qunit.triggerKeyup(iFirstAnchorId, jQuery.sap.KeyCodes.END);
		assert.ok(jQuery.sap.byId(iLastAnchorId).is(":focus"), "Last button should be focused after end key");
		sap.ui.test.qunit.triggerKeydown(iLastAnchorId, jQuery.sap.KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeyup(iLastAnchorId, jQuery.sap.KeyCodes.HOME);
		assert.ok(jQuery.sap.byId(iFirstAnchorId).is(":focus"), "First button should be focused after home key");
	});

	QUnit.test("PAGE UP: Anchor level", function (assert) {
		var oAncorBar = getAnchorBar(),
			aAnchors = oAncorBar.getContent(),
			oFirstAnchor = aAnchors[0].getDomRef(),
			oSecondAnchor = aAnchors[1].getDomRef(),
			oSeventhAnchor = aAnchors[6].getDomRef();

		// Focus the first anchor within the anchorbar and trigger PAGE UP
		jQuery(oFirstAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oFirstAnchor, jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should remain focused");

		// Focus the second anchor within the anchorbar and trigger PAGE UP
		jQuery(oSecondAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oSecondAnchor, jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should be focused");

		// Focus the seventh anchor within the anchorbar and trigger PAGE UP
		jQuery(oSeventhAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oSeventhAnchor, jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "Five anchors should be skipped over and the first anchor should be focused"
		);
	});

	QUnit.test("PAGE DOWN: Anchor level", function (assert) {
		var oAncorBar = getAnchorBar(),
			aAnchors = oAncorBar.getContent(),
			oLastAnchor = aAnchors[aAnchors.length - 1].getAggregation("_button").getDomRef(),
			oSecondLastAnchor = aAnchors[aAnchors.length - 2].getDomRef(),
			oSeventhLastAnchor = aAnchors[aAnchors.length - 7].getDomRef();

		// Focus the last anchor and trigger PAGE DOWN
		jQuery(oLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oLastAnchor, jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should remain focused");

		// Focus the second last anchor and trigger PAGE DOWN
		jQuery(oSecondLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oSecondLastAnchor, jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should be focused");

		// Focus the seventh anchor from the end and trigger PAGE DOWN
		jQuery(oSeventhLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oSeventhLastAnchor, jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true,
			"Five anchors should be skipped over and the last anchor should be focused");
	});

	QUnit.test("F6: Anchor level", function (assert) {
		var oAncorBar = getAnchorBar(),
			oFirstAnchor = oAncorBar.getContent()[0].getDomRef();

		// Focus the first anchor and trigger F6
		jQuery(oFirstAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oFirstAnchor, jQuery.sap.KeyCodes.F6);
		assert.strictEqual(jQuery("#UxAP-70_KeyboardHandling--single-subsection-show-section").is(":focus"), true, "The single subsection button should be in focus");
	});

	QUnit.test("F6: Anchor level with hidden section", function (assert) {
		var oAncorBar, oFirstAnchor;

		this.oObjectPage.getSections()[0].setVisible(false);

		oAncorBar = getAnchorBar();
		oFirstAnchor = oAncorBar.getContent()[0].getDomRef();

		// Focus the first anchor and trigger F6
		jQuery(oFirstAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(oFirstAnchor, jQuery.sap.KeyCodes.F6);
		assert.strictEqual(jQuery("#UxAP-70_KeyboardHandling--single-subsection-show-section").is(":focus"), true, "The single subsection button should be in focus");

		// restore
		this.oObjectPage.getSections()[0].setVisible(true);
	});

	QUnit.module("Section/Subsection", {
		beforeEach: function () {
			var sFocusable = "0",
				sTabIndex = "tabIndex";
			this.oObjectPage = anchorBarView.byId("ObjectPageLayout");

			this.assertCorrectTabIndex = function ($elment, sMessage, assert) {
				assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
			};
		}
	});

	QUnit.test("TAB/SHIFT+TAB", function (assert) {
		var $firstSection = core.byId("__section1").$(),
			oCurrentSection = core.byId("__section9"),
			oPersonalSection = core.byId("__section16"),
			oContactSubSection = core.byId("__section14");

		this.assertCorrectTabIndex($firstSection, "If no previously selected section, " +
			"the first focusable section should be the first one in the container", assert);

		this.oObjectPage._setAsCurrentSection(oCurrentSection.sId);

		this.assertCorrectTabIndex(oCurrentSection.$(), "Given a previously selected section, " +
			"than it should be the first one to be focused on", assert);

		this.oObjectPage._setAsCurrentSection(oPersonalSection.sId);

		this.assertCorrectTabIndex(oContactSubSection.$(), "If no previously selected sub section, " +
			"the first focusable sub section should be the first one in the container section", assert);

		oPersonalSection.setSelectedSubSection(oContactSubSection);

		this.assertCorrectTabIndex(oContactSubSection.$(), "Given a previously selected sub section, " +
			"the first focusable sub section should be the first one in the container section", assert);
	});

	QUnit.test("RIGHT/DOWN", function (assert) {
		// Section
		jQuery.sap.byId("__section1").focus();
		sap.ui.test.qunit.triggerKeydown("__section1", jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section3", "Next section should be focused after arrow right");
		sap.ui.test.qunit.triggerKeydown("__section3", jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section5", "Next section should be focused after arrow down");

		// Subsection
		jQuery.sap.byId("__section17").focus();
		sap.ui.test.qunit.triggerKeydown("__section17", jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section18", "Next subsection should be focused after arrow right");
		sap.ui.test.qunit.triggerKeydown("__section18", jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section19", "Next subsection should be focused after arrow down");
	});

	QUnit.test("LEFT/UP", function (assert) {
		// Section
		jQuery.sap.byId("__section5").focus();
		sap.ui.test.qunit.triggerKeydown("__section5", jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section3", "Previous section should be focused after arrow left");
		sap.ui.test.qunit.triggerKeydown("__section3", jQuery.sap.KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "Previous section should be focused after arrow up");

		// Subsection
		jQuery.sap.byId("__section19").focus();
		sap.ui.test.qunit.triggerKeydown("__section19", jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section18", "Previous subsection should be focused after arrow left");
		sap.ui.test.qunit.triggerKeydown("__section18", jQuery.sap.KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "Previous subsection should be focused after arrow up");
	});

	QUnit.test("HOME/END", function (assert) {
		// Section
		jQuery.sap.byId("__section1").focus();
		sap.ui.test.qunit.triggerKeydown("__section1", jQuery.sap.KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section should be focused after END key");
		sap.ui.test.qunit.triggerKeydown("UxAP-70_KeyboardHandling--section-with-multiple-sub-section", jQuery.sap.KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "First section should be focused after HOME key");

		// Subsection
		jQuery.sap.byId("__section17").focus();
		sap.ui.test.qunit.triggerKeydown("__section17", jQuery.sap.KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section26", "Last subsection should be focused after END key");
		sap.ui.test.qunit.triggerKeydown("__section26", jQuery.sap.KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "First subsection should be focused after HOME key");
	});

	QUnit.test("PAGE_DOWN/PAGE_UP", function (assert) {
		// Section
		jQuery.sap.byId("__section1").focus();
		sap.ui.test.qunit.triggerKeydown("__section1", jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section13", "6th section down should be focused after PAGE DOWN");
		sap.ui.test.qunit.triggerKeydown("__section13", jQuery.sap.KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "6th section up should be focused after PAGE UP");
		jQuery.sap.byId("__section27").focus();
		sap.ui.test.qunit.triggerKeydown("__section27", jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section down should be focused after PAGE DOWN");
		jQuery.sap.byId("__section3").focus();
		sap.ui.test.qunit.triggerKeydown("__section3", jQuery.sap.KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "First section up should be focused after PAGE UP");

		// Subsection
		jQuery.sap.byId("__section17").focus();
		sap.ui.test.qunit.triggerKeydown("__section17", jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section23", "6th subsection down should be focused after PAGE DOWN");
		sap.ui.test.qunit.triggerKeydown("__section23", jQuery.sap.KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "6th subsection up should be focused after PAGE UP");
		jQuery.sap.byId("__section24").focus();
		sap.ui.test.qunit.triggerKeydown("__section24", jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section26", "Last subsection down should be focused after PAGE DOWN");
		jQuery.sap.byId("__section19").focus();
		sap.ui.test.qunit.triggerKeydown("__section19", jQuery.sap.KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "First subsection up should be focused after PAGE UP");
	});

	/*******************************************************************************
	 * sap.uxap.ObjectPageSection/sap.uxap.ObjectPageSubSection F7
	 ******************************************************************************/

	QUnit.test("ObjectPageSection F7 - interactive control inside Section with only one SubSection", function (assert) {
		var $btn = core.byId("UxAP-70_KeyboardHandling--interactive-el-single-sub-section").$(),
			$section = core.byId("UxAP-70_KeyboardHandling--section-with-single-sub-section").$();

		$section.attr("tabindex", 0);
		sap.ui.test.qunit.triggerKeydown($btn, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($section.is(":focus"), true, "Section must be focused");

		sap.ui.test.qunit.triggerKeydown($section, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($btn.is(":focus"), true, "Interactiove element must be focused back again");
	});

	QUnit.test("ObjectPageSection F7 - interactive control inside Section with only one SubSection", function (assert) {
		var $btn = core.byId("UxAP-70_KeyboardHandling--interactive-el-multiple-sub-section").$(),
			$subSection = core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-2").$();

		$subSection.attr("tabindex", 0);
		sap.ui.test.qunit.triggerKeydown($btn, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($subSection.is(":focus"), true, "Section must be focused");

		sap.ui.test.qunit.triggerKeydown($subSection, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($btn.is(":focus"), true, "Interactiove element must be focused back again");
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section", function (assert) {
		var $btnToolbar = core.byId("UxAP-70_KeyboardHandling--button-toolbar").$(),
			$subSection = core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-1").$();

		$subSection.attr("tabindex", 0);
		sap.ui.test.qunit.triggerKeydown($btnToolbar, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
	});

	QUnit.test("ObjectPageSection F7 - from section move focus to toolbar", function (assert) {
		var $btnToolbar = core.byId("UxAP-70_KeyboardHandling--button-toolbar").$(),
			$subSection = core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-1").$();

		sap.ui.test.qunit.triggerKeydown($subSection, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($btnToolbar.is(":focus"), true, "Button must be focused");
	});

}(jQuery, QUnit, sinon));
