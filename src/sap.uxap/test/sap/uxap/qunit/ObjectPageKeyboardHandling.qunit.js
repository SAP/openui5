/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device"],
function($, Core, KeyCodes, QUtils, Device) {
	"use strict";

	var sAnchorSelector = ".sapUxAPAnchorBarScrollContainer .sapUxAPAnchorBarButton";

	sap.ui.controller("viewController", {});

	var viewController = sap.ui.controller("viewController");

	var anchorBarView = sap.ui.xmlview("UxAP-70_KeyboardHandling", {
		viewName: "view.UxAP-70_KeyboardHandling",
		controller: viewController
	});

	function getAnchorBar() {
		return Core.byId("UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar");
	}

	anchorBarView.placeAt("qunit-fixture");

	QUnit.module("AnchorBar", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			Device.system.phone = false;
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
			QUtils.triggerKeydown(oActiveElement, KeyCodes.ESCAPE);
			QUtils.triggerKeyup(oActiveElement, KeyCodes.ESCAPE);
			this.clock.tick(500);

			this.clock.restore();
		}
	});

	QUnit.test("TAB/SHIFT+TAB", function (assert) {
		var aAnchors = $(sAnchorSelector),
			oFirstAnchorButton = Core.byId(aAnchors[0].id),
			oAnchor4Button = Core.byId(aAnchors[4].id),
			oAnchor4Section = Core.byId("__section9");

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

		document.getElementById(iFirstAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iFirstAnchorId, KeyCodes.ARROW_RIGHT);
		QUtils.triggerKeyup(iFirstAnchorId, KeyCodes.ARROW_RIGHT);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Next button should be focused after arrow right");
	});

	QUnit.test("LEFT", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iSecondAnchorId = aAnchors[1].id,
			iThirdAnchorId = aAnchors[2].id;

		document.getElementById(iThirdAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iThirdAnchorId, KeyCodes.ARROW_LEFT);
		QUtils.triggerKeyup(iThirdAnchorId, KeyCodes.ARROW_LEFT);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Previous button should be focused after arrow left");
	});

	QUnit.test("HOME/END", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iLastAnchorId = aAnchors[aAnchors.length - 1].id + "-internalSplitBtn";

		document.getElementById(iFirstAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iFirstAnchorId, KeyCodes.END);
		QUtils.triggerKeyup(iFirstAnchorId, KeyCodes.END);
		assert.equal(document.getElementById(iLastAnchorId), document.activeElement, "Last button should be focused after end key");
		QUtils.triggerKeydown(iLastAnchorId, KeyCodes.HOME);
		QUtils.triggerKeyup(iLastAnchorId, KeyCodes.HOME);
		assert.equal(document.getElementById(iFirstAnchorId), document.activeElement, "First button should be focused after home key");
	});

	QUnit.test("PAGE UP: Anchor level", function (assert) {
		var oAncorBar = getAnchorBar(),
			aAnchors = oAncorBar.getContent(),
			oFirstAnchor = aAnchors[0].getDomRef(),
			oSecondAnchor = aAnchors[1].getDomRef(),
			oSeventhAnchor = aAnchors[6].getDomRef();

		// Focus the first anchor within the anchorbar and trigger PAGE UP
		jQuery(oFirstAnchor).focus();
		QUtils.triggerKeydown(oFirstAnchor, KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should remain focused");

		// Focus the second anchor within the anchorbar and trigger PAGE UP
		jQuery(oSecondAnchor).focus();
		QUtils.triggerKeydown(oSecondAnchor, KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should be focused");

		// Focus the seventh anchor within the anchorbar and trigger PAGE UP
		jQuery(oSeventhAnchor).focus();
		QUtils.triggerKeydown(oSeventhAnchor, KeyCodes.PAGE_UP);
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
		QUtils.triggerKeydown(oLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should remain focused");

		// Focus the second last anchor and trigger PAGE DOWN
		jQuery(oSecondLastAnchor).focus();
		QUtils.triggerKeydown(oSecondLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should be focused");

		// Focus the seventh anchor from the end and trigger PAGE DOWN
		jQuery(oSeventhLastAnchor).focus();
		QUtils.triggerKeydown(oSeventhLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true,
			"Five anchors should be skipped over and the last anchor should be focused");
	});

	QUnit.test("F6: Anchor level", function (assert) {
		var oAncorBar = getAnchorBar(),
			oFirstAnchor = oAncorBar.getContent()[0].getDomRef();

		// Focus the first anchor and trigger F6
		jQuery(oFirstAnchor).focus();
		QUtils.triggerKeydown(oFirstAnchor, KeyCodes.F6);
		assert.strictEqual(jQuery("#UxAP-70_KeyboardHandling--single-subsection-show-section").is(":focus"), true, "The single subsection button should be in focus");
	});

	QUnit.test("F6: Anchor level with hidden section", function (assert) {
		var oAncorBar, oFirstAnchor;

		this.oObjectPage.getSections()[0].setVisible(false);

		oAncorBar = getAnchorBar();
		oFirstAnchor = oAncorBar.getContent()[0].getDomRef();

		// Focus the first anchor and trigger F6
		jQuery(oFirstAnchor).focus();
		QUtils.triggerKeydown(oFirstAnchor, KeyCodes.F6);
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
		var $firstSection = Core.byId("__section1").$(),
			oCurrentSection = Core.byId("__section9"),
			oPersonalSection = Core.byId("__section16"),
			oContactSubSection = Core.byId("__section14");

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
		document.getElementById("__section1").focus();
		QUtils.triggerKeydown("__section1", KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section3", "Next section should be focused after arrow right");
		QUtils.triggerKeydown("__section3", KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section5", "Next section should be focused after arrow down");

		// Subsection
		document.getElementById("__section17").focus();
		QUtils.triggerKeydown("__section17", KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section18", "Next subsection should be focused after arrow right");
		QUtils.triggerKeydown("__section18", KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section19", "Next subsection should be focused after arrow down");
	});

	QUnit.test("LEFT/UP", function (assert) {
		// Section
		document.getElementById("__section5").focus();
		QUtils.triggerKeydown("__section5", KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section3", "Previous section should be focused after arrow left");
		QUtils.triggerKeydown("__section3", KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "Previous section should be focused after arrow up");

		// Subsection
		document.getElementById("__section19").focus();
		QUtils.triggerKeydown("__section19", KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section18", "Previous subsection should be focused after arrow left");
		QUtils.triggerKeydown("__section18", KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "Previous subsection should be focused after arrow up");
	});

	QUnit.test("HOME/END", function (assert) {
		// Section
		document.getElementById("__section1").focus();
		QUtils.triggerKeydown("__section1", KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section should be focused after END key");
		QUtils.triggerKeydown("UxAP-70_KeyboardHandling--section-with-multiple-sub-section", KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "First section should be focused after HOME key");

		// Subsection
		document.getElementById("__section17").focus();
		QUtils.triggerKeydown("__section17", KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section26", "Last subsection should be focused after END key");
		QUtils.triggerKeydown("__section26", KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "First subsection should be focused after HOME key");
	});

	QUnit.test("PAGE_DOWN/PAGE_UP", function (assert) {
		// Section
		document.getElementById("__section1").focus();
		QUtils.triggerKeydown("__section1", KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section13", "6th section down should be focused after PAGE DOWN");
		QUtils.triggerKeydown("__section13", KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "6th section up should be focused after PAGE UP");
		document.getElementById("__section27").focus();
		QUtils.triggerKeydown("__section27", KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section down should be focused after PAGE DOWN");
		document.getElementById("__section3").focus();
		QUtils.triggerKeydown("__section3", KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section1", "First section up should be focused after PAGE UP");

		// Subsection
		document.getElementById("__section17").focus();
		QUtils.triggerKeydown("__section17", KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section23", "6th subsection down should be focused after PAGE DOWN");
		QUtils.triggerKeydown("__section23", KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "6th subsection up should be focused after PAGE UP");
		document.getElementById("__section24").focus();
		QUtils.triggerKeydown("__section24", KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section26", "Last subsection down should be focused after PAGE DOWN");
		document.getElementById("__section19").focus();
		QUtils.triggerKeydown("__section19", KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), "__section17", "First subsection up should be focused after PAGE UP");
	});

	/*******************************************************************************
	 * sap.uxap.ObjectPageSection/sap.uxap.ObjectPageSubSection F7
	 ******************************************************************************/

	QUnit.test("ObjectPageSection F7 - interactive control inside Section with only one SubSection", function (assert) {
		var $btn = Core.byId("UxAP-70_KeyboardHandling--interactive-el-single-sub-section").$(),
			$section = Core.byId("UxAP-70_KeyboardHandling--section-with-single-sub-section").$();

		$section.attr("tabindex", 0);
		QUtils.triggerKeydown($btn, KeyCodes.F7);
		assert.strictEqual($section.is(":focus"), true, "Section must be focused");

		QUtils.triggerKeydown($section, KeyCodes.F7);
		assert.strictEqual($btn.is(":focus"), true, "Interactiove element must be focused back again");
	});

	QUnit.test("ObjectPageSection F7 - interactive control inside Section with only one SubSection", function (assert) {
		var $btn = Core.byId("UxAP-70_KeyboardHandling--interactive-el-multiple-sub-section").$(),
			$subSection = Core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-2").$();

		$subSection.attr("tabindex", 0);
		QUtils.triggerKeydown($btn, KeyCodes.F7);
		assert.strictEqual($subSection.is(":focus"), true, "Section must be focused");

		QUtils.triggerKeydown($subSection, KeyCodes.F7);
		assert.strictEqual($btn.is(":focus"), true, "Interactiove element must be focused back again");
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section", function (assert) {
		var $btnToolbar = Core.byId("UxAP-70_KeyboardHandling--button-toolbar").$(),
			$subSection = Core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-1").$();

		$subSection.attr("tabindex", 0);
		QUtils.triggerKeydown($btnToolbar, KeyCodes.F7);
		assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
	});

	QUnit.test("ObjectPageSection F7 - from section move focus to toolbar", function (assert) {
		var $btnToolbar = Core.byId("UxAP-70_KeyboardHandling--button-toolbar").$(),
			$subSection = Core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-1").$();

		QUtils.triggerKeydown($subSection, KeyCodes.F7);
		assert.strictEqual($btnToolbar.is(":focus"), true, "Button must be focused");
	});

	function testKeyboardEvent(sTestName, sKeyPressed, sButtonId, sSectionId) {
		QUnit.test(sTestName, function (assert) {
			assert.expect(1);
			var fDone = assert.async();

			setTimeout(function () {
				var oAnchorBarButtonControl = Core.byId(sButtonId),
				$anchorBarButton = oAnchorBarButtonControl.$(),
				$subSection = Core.byId(sSectionId).$();

				$anchorBarButton.focus();

				switch (sKeyPressed) {
					case "ENTER":
						QUtils.triggerKeydown($anchorBarButton, sKeyPressed);
						break;
					case "SPACE":
						QUtils.triggerKeyup($anchorBarButton, sKeyPressed);
						break;
					default:
						oAnchorBarButtonControl.firePress();
						break;
				}

				setTimeout(function () {
					assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
					fDone();
				}, 1000);
			}, 0);
		});
	}

	testKeyboardEvent(
		"ObjectPageSection F7 - from toolbar move focus to coresponding section upon Space press",
		"SPACE",
		"UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-__section3-anchor",
		"__section3"
	);

	testKeyboardEvent(
		"ObjectPageSection F7 - from toolbar move focus to coresponding section upon Enter press",
		"ENTER",
		"UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-__section5-anchor",
		"__section5"
	);

	testKeyboardEvent(
		"ObjectPageSection F7 - from toolbar move focus to coresponding section upon mouse click",
		"Click",
		"UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-__section11-anchor",
		"__section11"
	);

});
