(function ($, QUnit, sinon) {

	var core = sap.ui.getCore(),
		sAnchorSelector = ".sapUxAPAnchorBarScrollContainer .sapUxAPAnchorBarButton",
		sPopOverAnchorSelector = ".sapMPopoverScroll > .sapUxAPAnchorBarButton";
	
	sinon.config.useFakeTimers = true;

	jQuery.sap.registerModulePath("view", "view");

	sap.ui.controller("viewController", {});

	var viewController = new sap.ui.controller("viewController");

	var anchorBarView = sap.ui.xmlview("UxAP-70_KeyboardHandling", {
		viewName: "view.UxAP-70_KeyboardHandling",
		controller: viewController
	});

	function openAnchorSubMenu(test) {
		applyKeyOnAnchorSubMenu(test, jQuery.sap.KeyCodes.SPACE);
	}

	function applyKeyOnAnchorSubMenu(test, sKeyCode) {
		var iFirstAnchorThatHasSubItems = $(sAnchorSelector)[8].id;
		jQuery.sap.byId(iFirstAnchorThatHasSubItems).focus();
		test.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iFirstAnchorThatHasSubItems, sKeyCode);
		sap.ui.test.qunit.triggerKeyup(iFirstAnchorThatHasSubItems, sKeyCode);
		test.clock.tick(500);
	}

	anchorBarView.placeAt('content');

	module("AnchorBar", {
		beforeEach: function () {
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
			}
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


	QUnit.test("RIGHT/DOWN", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iSecondAnchorId = aAnchors[1].id,
			iThirdAnchorId = aAnchors[2].id,
			aPopoverAnchors, iSecondSubAnchor, iThirdSubAnchor, iFourthSubAnchor;

// Main anchors
		jQuery.sap.byId(iFirstAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iFirstAnchorId, jQuery.sap.KeyCodes.ARROW_RIGHT);
		sap.ui.test.qunit.triggerKeyup(iFirstAnchorId, jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.ok(jQuery.sap.byId(iSecondAnchorId).is(":focus"), "Next button should be focused after arrow right");
		sap.ui.test.qunit.triggerKeydown(iSecondAnchorId, jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeyup(iSecondAnchorId, jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(jQuery.sap.byId(iThirdAnchorId).is(":focus"), "Next button should be focused after arrow down");

// Anchors in popover
		openAnchorSubMenu(this);

		aPopoverAnchors = $(sPopOverAnchorSelector);
		iSecondSubAnchor = aPopoverAnchors[0].id;
		iThirdSubAnchor = aPopoverAnchors[1].id;
		iFourthSubAnchor = aPopoverAnchors[2].id;

		sap.ui.test.qunit.triggerKeydown(iSecondSubAnchor, jQuery.sap.KeyCodes.ARROW_RIGHT);
		sap.ui.test.qunit.triggerKeyup(iSecondSubAnchor, jQuery.sap.KeyCodes.ARROW_RIGHT);

		assert.ok(jQuery.sap.byId(iThirdSubAnchor).is(":focus"), "Next button should be focused after arrow right");
		sap.ui.test.qunit.triggerKeydown(iThirdSubAnchor, jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeyup(iThirdSubAnchor, jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(jQuery.sap.byId(iFourthSubAnchor).is(":focus"), "Next button should be focused after arrow down");
	});

	QUnit.test("LEFT/UP", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iSecondAnchorId = aAnchors[1].id,
			iThirdAnchorId = aAnchors[2].id,
			aPopoverAnchors, iFirstSubAnchor, iSecondSubAnchor, iThirdSubAnchor;

// Main anchors
		jQuery.sap.byId(iThirdAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iThirdAnchorId, jQuery.sap.KeyCodes.ARROW_LEFT);
		sap.ui.test.qunit.triggerKeyup(iThirdAnchorId, jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.ok(jQuery.sap.byId(iSecondAnchorId).is(":focus"), "Previous button should be focused after arrow left");
		sap.ui.test.qunit.triggerKeydown(iSecondAnchorId, jQuery.sap.KeyCodes.ARROW_UP);
		sap.ui.test.qunit.triggerKeyup(iSecondAnchorId, jQuery.sap.KeyCodes.ARROW_UP);
		assert.ok(jQuery.sap.byId(iFirstAnchorId).is(":focus"), "Previous button should be focused after arrow up");

		openAnchorSubMenu(this);

		aPopoverAnchors = $(sPopOverAnchorSelector);
		iFirstSubAnchor = aPopoverAnchors[0].id;
		iSecondSubAnchor = aPopoverAnchors[1].id;
		iThirdSubAnchor = aPopoverAnchors[2].id;

		jQuery.sap.byId(iThirdSubAnchor).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iThirdSubAnchor, jQuery.sap.KeyCodes.ARROW_LEFT);
		sap.ui.test.qunit.triggerKeyup(iThirdSubAnchor, jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.ok(jQuery.sap.byId(iSecondSubAnchor).is(":focus"), "Previous button should be focused after arrow left");
		sap.ui.test.qunit.triggerKeydown(iSecondSubAnchor, jQuery.sap.KeyCodes.ARROW_UP);
		sap.ui.test.qunit.triggerKeyup(iSecondSubAnchor, jQuery.sap.KeyCodes.ARROW_UP);
		assert.ok(jQuery.sap.byId(iFirstSubAnchor).is(":focus"), "Previous button should be focused after arrow up");
	});

	QUnit.test("HOME/END", function (assert) {
		var aAnchors = $(sAnchorSelector),
			iFirstAnchorId = aAnchors[0].id,
			iLastAnchorId = aAnchors[aAnchors.length - 1].id,
			aPopoverAnchors, iFirstSubAnchor, iLastSubAnchor;

// Main anchors
		jQuery.sap.byId(iFirstAnchorId).focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerKeydown(iFirstAnchorId, jQuery.sap.KeyCodes.END);
		sap.ui.test.qunit.triggerKeyup(iFirstAnchorId, jQuery.sap.KeyCodes.END);
		assert.ok(jQuery.sap.byId(iLastAnchorId).is(":focus"), "Last button should be focused after end key");
		sap.ui.test.qunit.triggerKeydown(iLastAnchorId, jQuery.sap.KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeyup(iLastAnchorId, jQuery.sap.KeyCodes.HOME);
		assert.ok(jQuery.sap.byId(iFirstAnchorId).is(":focus"), "First button should be focused after home key");

// Anchors in popover
		openAnchorSubMenu(this);
		aPopoverAnchors = $(sPopOverAnchorSelector);
		iFirstSubAnchor = aPopoverAnchors[0].id;
		iLastSubAnchor = aPopoverAnchors[aPopoverAnchors.length - 1].id;

		sap.ui.test.qunit.triggerKeydown(iFirstSubAnchor, jQuery.sap.KeyCodes.END);
		sap.ui.test.qunit.triggerKeyup(iFirstSubAnchor, jQuery.sap.KeyCodes.END);
		assert.ok(jQuery.sap.byId(iLastSubAnchor).is(":focus"), "Last button should be focused after end key");
		sap.ui.test.qunit.triggerKeydown(iLastSubAnchor, jQuery.sap.KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeyup(iLastSubAnchor, jQuery.sap.KeyCodes.HOME);
		assert.ok(jQuery.sap.byId(iFirstSubAnchor).is(":focus"), "First button should be focused after home key");
	});

	QUnit.test("SPACE", function (assert) {
		openAnchorSubMenu(this);
		assert.ok(jQuery.sap.byId($(sPopOverAnchorSelector)[0].id).is(":focus"), "Menu should be opened and first anchor focused");
	});

	QUnit.test("ENTER", function (assert) {
		applyKeyOnAnchorSubMenu(this, jQuery.sap.KeyCodes.ENTER);
// Anchor with menu
		var aPopoverAnchors = $(sPopOverAnchorSelector),
			iFirstSubAnchor = aPopoverAnchors[0].id;
		assert.ok(jQuery.sap.byId(iFirstSubAnchor).is(":focus"), "Menu should be opened and first anchor focused");

// Close the popover
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(iFirstSubAnchor), jQuery.sap.KeyCodes.ESCAPE);
		sap.ui.test.qunit.triggerKeyup(jQuery.sap.byId(iFirstSubAnchor), jQuery.sap.KeyCodes.ESCAPE);
	});

	QUnit.test("PAGE UP: Anchor level", function (assert) {
		var oAncorBar = sap.ui.getCore().getElementById("__bar0"),
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

	QUnit.test("PAGE UP: Popover level", function (assert) {
// Focus an anchor with subanchors and open the popover
		var oAnchorBar = sap.ui.getCore().getElementById("__bar0"),
			aAnchors = oAnchorBar.getContent(),
			oTestAnchor = aAnchors[8].getDomRef();

		jQuery(oTestAnchor).focus();

		sap.ui.test.qunit.triggerKeydown(oTestAnchor, jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oTestAnchor, jQuery.sap.KeyCodes.SPACE);
		this.clock.tick();

// Find the first, second and seventh anchors in the popover
		var aPopoverAnchors = $(sPopOverAnchorSelector),
			oFirstAnchor = aPopoverAnchors[0].id,
			oSecondAnchor = aPopoverAnchors[1].id,
			oSeventhAnchor = aPopoverAnchors[6].id;

// Trigger PAGE UP on the first anchor
		jQuery.sap.byId(oFirstAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oFirstAnchor), jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery.sap.byId(oFirstAnchor).is(":focus"),
			true, "The first anchor shoud remain focused");

// Focus the second  anchor and trigger PAGE UP
		jQuery.sap.byId(oSecondAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oSecondAnchor), jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery.sap.byId(oFirstAnchor).is(":focus"),
			true, "The first anchor shoud be focused");

// Focus the seventh anchor and trigger PAGE UP
		jQuery.sap.byId(oSeventhAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oSeventhAnchor), jQuery.sap.KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery.sap.byId(oFirstAnchor).is(":focus"),
			true, "Five anchors should be skipped over and the first anchor shoud be focused");
	});

	QUnit.test("PAGE DOWN: Anchor level", function (assert) {
		var oAncorBar = sap.ui.getCore().getElementById("__bar0"),
			aAnchors = oAncorBar.getContent(),
			oLastAnchor = aAnchors[aAnchors.length - 1].getDomRef(),
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

	QUnit.test("PAGE DOWN: Popover level", function (assert) {
// Focus an anchor with subanchors and trigger SPACE to open the popover
		var oAncorBar = sap.ui.getCore().getElementById("__bar0"),
			aAnchors = oAncorBar.getContent(),
			oTestAnchor = aAnchors[8].getDomRef();

		jQuery(oTestAnchor).focus();

		sap.ui.test.qunit.triggerKeydown(oTestAnchor, jQuery.sap.KeyCodes.SPACE);
		sap.ui.test.qunit.triggerKeyup(oTestAnchor, jQuery.sap.KeyCodes.SPACE);
		this.clock.tick();

// Find the first, second and seventh anchors in the popover
		var aPopoverAnchors = $(sPopOverAnchorSelector),
			oLastAnchor = aPopoverAnchors[aPopoverAnchors.length - 1].id,
			oSecondLastAnchor = aPopoverAnchors[aPopoverAnchors.length - 2].id,
			oSeventhLastAnchor = aPopoverAnchors[aPopoverAnchors.length - 7].id;

// Focus the last anchor and trigger PAGE DOWN
		jQuery.sap.byId(oLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oLastAnchor), jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery.sap.byId(oLastAnchor).is(":focus"),
			true, "The last anchor shoud remain focused");

// Focus the second last anchor and trigger PAGE DOWN
		jQuery.sap.byId(oSecondLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oSecondLastAnchor), jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery.sap.byId(oLastAnchor).is(":focus"),
			true, "The last anchor shoud be focused");

// Focus the seventh anchor from the end and trigger PAGE DOWN
		jQuery.sap.byId(oSeventhLastAnchor).focus();
		sap.ui.test.qunit.triggerKeydown(jQuery.sap.byId(oSeventhLastAnchor), jQuery.sap.KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery.sap.byId(oLastAnchor).is(":focus"),
			true, "Five anchors should be skipped over and the last anchor shoud be focused");
	});

	module("Section/Subsection", {
		beforeEach: function () {
			var sFocusable = "0",
				sTabIndex = "tabIndex";
			this.oObjectPage = anchorBarView.byId("ObjectPageLayout");

			this.assertCorrectTabIndex = function ($elment, sMessage, assert) {
				assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
			}
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

	QUnit.test("ObjectPageSection F7 - SubSection without remebered control", function (assert) {
		var $title = jQuery(jQuery("#UxAP-70_KeyboardHandling--multiple-sub-section-2-headerTitle")[0]);
		$subSection = core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-2").$();

		sap.ui.test.qunit.triggerKeydown($subSection, jQuery.sap.KeyCodes.F7);
		assert.strictEqual($title.is(":focus"), true, "First interactive control must be focused");
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

	/*******************************************************************************
	 * ObjectPage F6
	 ******************************************************************************/

	QUnit.test("ObjectPageAnchorBar F6 - after anchor bar focus must be at sub section title", function (assert) {
		var oAncorBar = sap.ui.getCore().getElementById("__bar0");
		var aAnchors = oAncorBar.getContent();

		var $btn = aAnchors[0].getDomRef(),
			$subSectionTitle = jQuery(jQuery("#__section0-headerTitle")[0]),
			$subSectionTitle2 = jQuery(jQuery("#__section2-headerTitle")[0]);

		$btn.focus();
		sap.ui.test.qunit.triggerKeydown($btn, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($subSectionTitle.is(":focus"), true, "SubSection title must be focused");

		sap.ui.test.qunit.triggerKeydown($subSectionTitle, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($subSectionTitle2.is(":focus"), true, "Second SubSection title must be focused");
	});

	QUnit.test("ObjectPageAnchorBar F6 - after anchor bar focus must be at sub section title", function (assert) {
		var $section = core.byId("UxAP-70_KeyboardHandling--section-with-single-sub-section").$(),
			$subSectionTitle = jQuery(jQuery("#UxAP-70_KeyboardHandling--single-sub-section-headerTitle")[0]),
			$button1 = core.byId("__button0").$(),
			$link = core.byId("__link1").$(),
			$subSectionTitle2 = jQuery(jQuery("#UxAP-70_KeyboardHandling--multiple-sub-section-1-headerTitle")[0]);

		$section.focus();
		sap.ui.test.qunit.triggerKeydown($section, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($subSectionTitle.is(":focus"), true, "SubSection title must be focused");

		sap.ui.test.qunit.triggerKeydown($subSectionTitle, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($button1.is(":focus"), true, "Second SubSection title must be focused");

		sap.ui.test.qunit.triggerKeydown($button1, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($link.is(":focus"), true, "Second SubSection title must be focused");

		sap.ui.test.qunit.triggerKeydown($button1, jQuery.sap.KeyCodes.F6);
		assert.strictEqual($subSectionTitle2.is(":focus"), true, "Second SubSection title must be focused");
	});

}(jQuery, QUnit, sinon));
