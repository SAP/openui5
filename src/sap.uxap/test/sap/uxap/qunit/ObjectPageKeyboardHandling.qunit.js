/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/events/F6Navigation",
	"sap/ui/core/mvc/XMLView"],
function($, Core, Configuration, KeyCodes, QUtils, Device, F6Navigation, XMLView) {
	"use strict";

	var sAnchorSelector = ".sapUxAPAnchorBarScrollContainer .sapUxAPAnchorBarButton";

	function getAnchorBar() {
		return Core.byId("UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar");
	}

	QUnit.module("F6/Group skipping", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageDynamicHeader",
				viewName: "view.UxAP-12-ObjectPageDynamicHeader"
			}).then(function (oView) {
				this.oView = oView;
				this.oObjectPage = oView.byId("ObjectPageLayout");
				this.oObjectPage.setShowFooter(true);
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("F6 - focus should to the first element in the tab chain of the next F6-group, no matter where it resides within the List of Sections", function (assert) {
		// Arrange
		var done = assert.async(),
			oObjectPage = this.oObjectPage,
			$oExpectedTarget,
			oF6NavigationStub,
			fnF6NavigationStub = function (oEvent, oSettings) {
				// Assert
				assert.strictEqual(oSettings.target, $oExpectedTarget[0],
					"The correct dom ref is given for starting point, skipping the sections of OP");

				// Clean up
				oF6NavigationStub.restore();
				done();
			},
			fnOnDomReady = function () {
				// Arrange
				// _$skipFastGroupAnchor the DOMNode which should be used as
				// starting point to find the next DOMNode in the F6 chain.
				$oExpectedTarget = oObjectPage._$skipFastGroupAnchor;

				// Act
				oObjectPage.getSections()[0].getDomRef().focus();
				QUtils.triggerKeydown(oObjectPage.getDomRef(), KeyCodes.F6);
			};

		// Arrange
		oF6NavigationStub = sinon.stub(F6Navigation, "handleF6GroupNavigation", fnF6NavigationStub);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		this.oView.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("F6/SHIFT+F6 - order should be correct", function (assert) {
		assert.expect(10); //number of assertions
		// Arrange
		var $oEl,
			fnDone = assert.async(),
			oControl,
			aTabChain,
			aOrderList = ['headerTitle', '_headerContent', '_anchorBar', '_$sectionsContainer', 'footer'],
			oObjectPage = this.oObjectPage,
			fnCheckOrder = function (bForward) {
				// Arrange
				aTabChain = bForward ? aOrderList : aOrderList.reverse();

				aTabChain.forEach(function (item) {
					oControl = oObjectPage.getAggregation(item);
					if (oControl) {
						$oEl = oControl.$();
					} else {
						$oEl = oObjectPage[item];
					}
					// Act
					QUtils.triggerKeydown(oObjectPage.getDomRef(), KeyCodes.F6, !bForward);

					// Assert
					assert.strictEqual(document.activeElement, $oEl.firstFocusableDomRef(), item + " focused correctly");
				});
			},
			fnOnDomReady = function () {
				fnCheckOrder(true);

				// Act
				// go one after footer so when pressing SHIFT+F6 focus comes back to footer first
				QUtils.triggerKeydown(oObjectPage.getDomRef(), KeyCodes.F6);

				fnCheckOrder(false);

				// Clean up
				fnDone();
			};

		// Arrange
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		this.oView.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.module("AnchorBar", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.clock = sinon.useFakeTimers();
			Device.system.phone = false;
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(function (oView) {
				this.anchorBarView = oView;
				jQuery("html")
					.removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
					.addClass("sapUiMedia-Std-Desktop");
				var sFocusable = "0",
					sTabIndex = "tabindex";
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.oObjectPage._setAsCurrentSection(this.oObjectPage.getSections()[0].sId);
				this.assertCorrectTabIndex = function ($elment, sMessage, assert) {
					assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
				};
				this.anchorBarView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.clock.tick(500);
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.clock.restore();
		}
	});

	QUnit.test("TAB/SHIFT+TAB", function (assert) {
		var aAnchors = $(sAnchorSelector),
			oFirstAnchorButton = Core.byId(aAnchors[0].id),
			oAnchor4Button = Core.byId(aAnchors[4].id),
			aSections = this.oObjectPage.getSections(),
			oAnchor4Section = aSections[4];

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

	QUnit.test("DOWN", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oEvent = {
				keyCode: KeyCodes.ARROW_DOWN,
				preventDefault: function () {}
			},
			oSpy = this.spy(oEvent, "preventDefault");

		oAnchorBar.onsapdown(oEvent);
		assert.ok(oSpy.calledOnce, "preventDefault is called on DOWN key for the AnchorBar");
	});

	QUnit.test("UP", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oEvent = {
				keyCode: KeyCodes.ARROW_UP,
				preventDefault: function () {}
			},
			oSpy = this.spy(oEvent, "preventDefault");

		oAnchorBar.onsapdown(oEvent);
		assert.ok(oSpy.calledOnce, "preventDefault is called on UP key for the AnchorBar");
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
		jQuery(oFirstAnchor).trigger("focus");
		QUtils.triggerKeydown(oFirstAnchor, KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should remain focused");

		// Focus the second anchor within the anchorbar and trigger PAGE UP
		jQuery(oSecondAnchor).trigger("focus");
		QUtils.triggerKeydown(oSecondAnchor, KeyCodes.PAGE_UP);
		assert.strictEqual(jQuery(oFirstAnchor).is(":focus"),
			true, "The first anchor should be focused");

		// Focus the seventh anchor within the anchorbar and trigger PAGE UP
		jQuery(oSeventhAnchor).trigger("focus");
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
		jQuery(oLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should remain focused");

		// Focus the second last anchor and trigger PAGE DOWN
		jQuery(oSecondLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oSecondLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true, "The last anchor should be focused");

		// Focus the seventh anchor from the end and trigger PAGE DOWN
		jQuery(oSeventhLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oSeventhLastAnchor, KeyCodes.PAGE_DOWN);
		assert.strictEqual(jQuery(oLastAnchor).is(":focus"), true,
			"Five anchors should be skipped over and the last anchor should be focused");
	});

	QUnit.test("Focus of stickyAnchorBar menu buttons", function (assert) {
		var iSectionIndex = 7,
			oAncorBar = getAnchorBar(),
			oSectionAnchor = oAncorBar.getContent()[iSectionIndex];

		oSectionAnchor.focus =  function fakeFn() {
			// Check
			assert.strictEqual(this.oObjectPage._bStickyAnchorBar, true, "anchorBar is snapped");
		}.bind(this);

		// Setup
		// assert init state
		assert.equal(oSectionAnchor.isA("sap.m.MenuButton"), true, "anchor is a menu button");

		// Act
		oSectionAnchor.getAggregation("_button").firePress();
	});

	QUnit.module("Section/Subsection", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(function (oView) {
				this.anchorBarView = oView;
				var sFocusable = "0",
					sTabIndex = "tabindex";
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.assertCorrectTabIndex = function ($elment, sMessage, assert) {
					assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
				};
				this.anchorBarView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("TAB/SHIFT+TAB", function (assert) {
		var aSections = this.oObjectPage.getSections(),
			$firstSection = aSections[0].$(),
			oCurrentSection = aSections[4],
			oPersonalSection = aSections[7],
			oContactSubSection = aSections[7].getSubSections()[0];

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
		var aSections = this.oObjectPage.getSections(),
			aSubSections = aSections[8].getSubSections();

		// Section
		aSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSections[0].sId, KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[1].sId, "Next section should be focused after arrow right");
		QUtils.triggerKeydown(aSections[1].sId, KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[2].sId, "Next section should be focused after arrow down");

		// Subsection
		aSubSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[1].sId, "Next subsection should be focused after arrow right");
		QUtils.triggerKeydown(aSubSections[1].sId, KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[2].sId, "Next subsection should be focused after arrow down");
	});

	QUnit.test("LEFT/UP", function (assert) {
		var aSections = this.oObjectPage.getSections(),
			aSubSections = aSections[8].getSubSections();

		// Section
		aSections[2].$().trigger("focus");
		QUtils.triggerKeydown(aSections[2].sId, KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[1].sId, "Previous section should be focused after arrow left");
		QUtils.triggerKeydown(aSections[1].sId, KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[0].sId, "Previous section should be focused after arrow up");

		// Subsection
		aSubSections[2].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[2].sId, KeyCodes.ARROW_LEFT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[1].sId, "Previous subsection should be focused after arrow left");
		QUtils.triggerKeydown(aSubSections[1].sId, KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "Previous subsection should be focused after arrow up");
	});

	QUnit.test("HOME/END", function (assert) {
		var aSections = this.oObjectPage.getSections(),
			aSubSections = aSections[8].getSubSections(),
			oSingleSubsection = aSections[0].getSubSections()[0],
		    oSpy = this.spy(oSingleSubsection, "_scrollParent");

		// Section
		aSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSections[0].sId, KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section should be focused after END key");
		QUtils.triggerKeydown("UxAP-70_KeyboardHandling--section-with-multiple-sub-section", KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[0].sId, "First section should be focused after HOME key");

		// Subsection
		aSubSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[9].sId, "Last subsection should be focused after END key");
		QUtils.triggerKeydown(aSubSections[9].sId, KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "First subsection should be focused after HOME key");

		// Single subsection should not scroll the page
		oSingleSubsection.$().trigger("focus");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.HOME);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.END);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
	});

	QUnit.test("PAGE_DOWN/PAGE_UP", function (assert) {
		var aSections = this.oObjectPage.getSections(),
			aSubSections = aSections[8].getSubSections(),
			oSingleSubsection = aSections[0].getSubSections()[0],
		    oSpy = this.spy(oSingleSubsection, "_scrollParent");

		// Section
		aSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSections[0].sId, KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[6].sId, "6th section down should be focused after PAGE DOWN");
		QUtils.triggerKeydown(aSections[6].sId, KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[0].sId, "6th section up should be focused after PAGE UP");
		aSections[8].$().trigger("focus");
		QUtils.triggerKeydown(aSections[8].sId, KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section down should be focused after PAGE DOWN");
		aSections[1].$().trigger("focus");
		QUtils.triggerKeydown(aSections[1].sId, KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[0].sId, "First section up should be focused after PAGE UP");

		// Subsection
		aSubSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[6].sId, "6th subsection down should be focused after PAGE DOWN");
		QUtils.triggerKeydown(aSubSections[6].sId, KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "6th subsection up should be focused after PAGE UP");
		aSubSections[7].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[7].sId, KeyCodes.PAGE_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[9].sId, "Last subsection down should be focused after PAGE DOWN");
		aSubSections[2].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[2].sId, KeyCodes.PAGE_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "First subsection up should be focused after PAGE UP");

		// Single subsection should not scroll the page
		oSingleSubsection.$().trigger("focus");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.PAGE_DOWN);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.PAGE_UP);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
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

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon Space press", function (assert) {
		assert.expect(1);
		var fDone = assert.async(),
			sSectionId = this.oObjectPage.getSections()[1].sId,
			sButtonId = "UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-" + sSectionId + "-anchor",
			sKeyPressed = "SPACE";

		setTimeout(function () {
			var oAnchorBarButtonControl = Core.byId(sButtonId),
			$anchorBarButton = oAnchorBarButtonControl.$(),
			$subSection = Core.byId(sSectionId).$();

			$anchorBarButton.trigger("focus");

			QUtils.triggerKeyup($anchorBarButton, sKeyPressed);

			setTimeout(function () {
				assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
				fDone();
			}, 1000);
		}, 0);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon Enter press", function (assert) {
		assert.expect(1);
		var fDone = assert.async(),
			sSectionId = this.oObjectPage.getSections()[2].sId,
			sButtonId = "UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-" + sSectionId + "-anchor",
			sKeyPressed = "ENTER";

		setTimeout(function () {
			var oAnchorBarButtonControl = Core.byId(sButtonId),
			$anchorBarButton = oAnchorBarButtonControl.$(),
			$subSection = Core.byId(sSectionId).$();

			$anchorBarButton.trigger("focus");

			QUtils.triggerKeydown($anchorBarButton, sKeyPressed);

			setTimeout(function () {
				assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
				fDone();
			}, 1000);
		}, 0);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon mouse click", function (assert) {
		assert.expect(1);
		var fDone = assert.async(),
			sSectionId = this.oObjectPage.getSections()[5].sId,
			sButtonId = "UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar-" + sSectionId + "-anchor";

		setTimeout(function () {
			var oAnchorBarButtonControl = Core.byId(sButtonId),
			$anchorBarButton = oAnchorBarButtonControl.$(),
			$subSection = Core.byId(sSectionId).$();

			$anchorBarButton.trigger("focus");

			oAnchorBarButtonControl.firePress();

			setTimeout(function () {
				assert.strictEqual($subSection.is(":focus"), true, "SubSection must be focused");
				fDone();
			}, 1000);
		}, 0);
	});

	QUnit.test("ObjectPageSection SPACE - browser scrolling is prevented", function (assert) {
		var oSection = Core.byId("UxAP-70_KeyboardHandling--section-with-single-sub-section"),
			oInput = Core.byId("UxAP-70_KeyboardHandling--input-single-sub-section"),
			oEventSection = {
				keyCode: KeyCodes.SPACE,
				preventDefault: function () {},
				srcControl: oSection
			},
			oSpySection = this.spy(oEventSection, "preventDefault"),
			oEventInput = {
				keyCode: KeyCodes.SPACE,
				preventDefault: function () {},
				srcControl: oInput
			},
			oSpyInput = this.spy(oEventInput, "preventDefault");

		oSection.onkeydown(oEventSection);
		assert.ok(oSpySection.calledOnce, "preventDefault is called on SPACE key for the section");

		oInput.onkeydown(oEventInput);
		assert.notOk(oSpyInput.called, "preventDefault is not called on SPACE key for the internal input");
	});

	QUnit.test("ObjectPageSubSection SPACE - browser scrolling is prevented", function (assert) {
		var oSection = Core.byId("UxAP-70_KeyboardHandling--multiple-sub-section-1"),
			oInput = Core.byId("UxAP-70_KeyboardHandling--input-multiple-sub-section"),
			oEventSection = {
				keyCode: KeyCodes.SPACE,
				preventDefault: function () {},
				srcControl: oSection
			},
			oSpySection = this.spy(oEventSection, "preventDefault"),
			oEventInput = {
				keyCode: KeyCodes.SPACE,
				preventDefault: function () {},
				srcControl: oInput
			},
			oSpyInput = this.spy(oEventInput, "preventDefault");

		oSection.onkeydown(oEventSection);
		assert.ok(oSpySection.calledOnce, "preventDefault is called on SPACE key for the subsection");

		oInput.onkeydown(oEventInput);
		assert.notOk(oSpyInput.called, "preventDefault is not called on SPACE key for the internal input");
	});

	QUnit.module("Focus/scroll order", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(function (oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.oScrollSpy = sinon.spy(sap.uxap.AnchorBar.prototype, "_handleDirectScroll");
				this.oFocusSpy = sinon.spy(this.oObjectPage._oABHelper, "_moveFocusOnSection");
				this.anchorBarView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oScrollSpy.restore();
			this.oFocusSpy.restore();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Focus from toolbar to section", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1],
			oOrigAnimationMode = Core.getConfiguration().getAnimationMode();

		assert.expect(3);

		// Setup
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.none);
		this.oScrollSpy.reset();
		this.oFocusSpy.reset();

		// Act
		oSectionButton.firePress();

		// Check
		assert.strictEqual(this.oScrollSpy.called, true, "Scroll to section is called");
		assert.strictEqual(this.oFocusSpy.called, true, "Section must be focused");
		sinon.assert.callOrder(this.oFocusSpy, this.oScrollSpy);

		// restore state
		Core.getConfiguration().setAnimationMode(oOrigAnimationMode);
	});

	QUnit.module("Focus on selection, selected state", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(function (oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	//This test is written to cover a timing problem in IE, when focus outruns scrolling to section
	QUnit.test("Focus a section on selection with animation mode 'none'", function (assert) {
		var oAnchorBar = getAnchorBar(),
			oSectionButton = oAnchorBar.getContent()[2],
			oOrigAnimationMode = Core.getConfiguration().getAnimationMode(),
			done = assert.async();

		assert.expect(1);

		// Setup
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.none);


		// Check
		setTimeout(function() {

			// Act
			oSectionButton.firePress();
			setTimeout(function() {

				assert.strictEqual(this.oObjectPage.getSelectedSection(), oSectionButton.data("sectionId"), "Section is properly selected");

				// restore state
				Core.getConfiguration().setAnimationMode(oOrigAnimationMode);
				done();
			}.bind(this), 500);
		}.bind(this), 500);

	});
});
