/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/CustomData",
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/events/F6Navigation",
	"sap/ui/core/mvc/XMLView",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/Text",
	"sap/ui/dom/jquery/Focusable" /* jQuery Plugin "firstFocusableDomRef" */
],
function(AnimationMode, ControlBehavior, CustomData, Element, nextUIUpdate, jQuery, KeyCodes, QUtils, Device, F6Navigation, XMLView, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, Button, OverflowToolbar, Text) {
	"use strict";

	const sAnchorSelector = ".sapUxAPObjectPageNavigation .sapMITBHead .sapMITBFilter";

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL
	 * @returns {Promise<void>}
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	function getAnchorBar() {
		return Element.getElementById("UxAP-70_KeyboardHandling--ObjectPageLayout-anchBar");
	}

	/**
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

	QUnit.module("F6/Group skipping", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageDynamicHeader",
				viewName: "view.UxAP-12-ObjectPageDynamicHeader"
			}).then((oView) => {
				this.oView = oView;
				this.oObjectPage = oView.byId("ObjectPageLayout");
				this.oObjectPage.setShowFooter(true);
				done();
			});
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("F6/SHIFT+F6 - order should be correct", async function(assert) {
		assert.expect(10); //number of assertions
		// Arrange
		let $oEl;
		let oControl;
		const aOrderList = ['headerTitle', '_headerContent', '_anchorBar', '_$sectionsContainer', 'footer'];
		const oObjectPage = this.oObjectPage;
		const fnCheckOrder = (bForward) => {
				// Arrange
				const aTabChain = bForward ? aOrderList : aOrderList.reverse();

				aTabChain.forEach((item) => {
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
			};

		// Arrange
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();
		await waitForDOMReady(oObjectPage);

		fnCheckOrder(true);

		// Act
		// go one after footer so when pressing SHIFT+F6 focus comes back to footer first
		QUtils.triggerKeydown(oObjectPage.getDomRef(), KeyCodes.F6);

		fnCheckOrder(false);
	});

	QUnit.module("AnchorBar", {
		beforeEach: function (assert) {
			const done = assert.async();
			this.clock = sinon.useFakeTimers();
			Device.system.phone = false;
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(async (oView) => {
				this.anchorBarView = oView;
				jQuery("html")
					.removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
					.addClass("sapUiMedia-Std-Desktop");
				const sFocusable = "0";
				const sTabIndex = "tabindex";
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.oObjectPage._setAsCurrentSection(this.oObjectPage.getSections()[0].sId);
				this.assertCorrectTabIndex = ($elment, sMessage, assert) => {
					assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
				};
				this.anchorBarView.placeAt("qunit-fixture");
				await nextUIUpdate(this.clock);
				done();
			});
		},
		afterEach: async function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
		}
	});

	QUnit.test("TAB/SHIFT+TAB - correct tab index on anchor buttons", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const oAnchorBar = Element.getElementById(this.oObjectPage.$().find(".sapMITH")[0].id);
		const oFirstAnchorButton = Element.getElementById(aAnchors[0].id);
		const oAnchor4Button = Element.getElementById(aAnchors[4].id);
		const aSections = this.oObjectPage.getSections();
		const oAnchor4Section = aSections[4];

		oAnchorBar.focus();
		this.assertCorrectTabIndex(oFirstAnchorButton.$(), "If no previously selected anchor button, " +
			"the first focusable anchor button should be the first one in the container", assert);

		this.oObjectPage._setAsCurrentSection(oAnchor4Section.sId);
		QUtils.triggerKeydown(aAnchors[4], KeyCodes.ENTER);

		this.assertCorrectTabIndex(oAnchor4Button.$(), "Given a previously selected anchor button, " +
			"than it should be the first one to be focused on", assert);
	});


	QUnit.test("RIGHT - next anchor button should be focused after arrow right", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const iFirstAnchorId = aAnchors[0].id;
		const iSecondAnchorId = aAnchors[1].id;

		document.getElementById(iFirstAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iFirstAnchorId, KeyCodes.ARROW_RIGHT);
		QUtils.triggerKeyup(iFirstAnchorId, KeyCodes.ARROW_RIGHT);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Next button should be focused after arrow right");
	});

	QUnit.test("LEFT - previous anchor button should be focused after arrow left", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const iSecondAnchorId = aAnchors[1].id;
		const iThirdAnchorId = aAnchors[2].id;

		document.getElementById(iThirdAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iThirdAnchorId, KeyCodes.ARROW_LEFT);
		QUtils.triggerKeyup(iThirdAnchorId, KeyCodes.ARROW_LEFT);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Previous button should be focused after arrow left");
	});

	QUnit.test("DOWN - next anchor button should be focused after arrow down", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const iFirstAnchorId = aAnchors[0].id;
		const iSecondAnchorId = aAnchors[1].id;

		document.getElementById(iFirstAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iFirstAnchorId, KeyCodes.ARROW_DOWN);
		QUtils.triggerKeyup(iFirstAnchorId, KeyCodes.ARROW_DOWN);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Next button should be focused after arrow right");
	});

	QUnit.test("UP - previous anchor button should be focused after arrow up", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const iSecondAnchorId = aAnchors[1].id;
		const iThirdAnchorId = aAnchors[2].id;

		document.getElementById(iThirdAnchorId).focus();
		this.clock.tick(500);
		QUtils.triggerKeydown(iThirdAnchorId, KeyCodes.ARROW_UP);
		QUtils.triggerKeyup(iThirdAnchorId, KeyCodes.ARROW_UP);
		assert.equal(document.getElementById(iSecondAnchorId), document.activeElement, "Previous button should be focused after arrow left");
	});

	QUnit.test("HOME/END - first and last anchor buttons should be focused with HOME and END keys", function (assert) {
		const aAnchors = jQuery(sAnchorSelector);
		const oEndOverflow = jQuery(".sapMITH .sapMITHEndOverflow .sapMITBFilter");
		const iFirstAnchorId = aAnchors[0].id;
		const iLastAnchorId = oEndOverflow[0].id;

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
		const oAncorBar = getAnchorBar();
		const aAnchors = oAncorBar.getItems();
		const oFirstAnchor = aAnchors[0].getDomRef();
		const oSecondAnchor = aAnchors[1].getDomRef();
		const oSeventhAnchor = aAnchors[6].getDomRef();
			oFirstAnchor.focus = function () {
				// Check if focus function is called on firstAnchor
				assert.ok(true, "The first anchor should be focused");
			};

		// Focus the first anchor within the anchorbar and trigger PAGE UP
		jQuery(oFirstAnchor).trigger("focus");
		QUtils.triggerKeydown(oFirstAnchor, KeyCodes.PAGE_UP);

		// Focus the second anchor within the anchorbar and trigger PAGE UP
		jQuery(oSecondAnchor).trigger("focus");
		QUtils.triggerKeydown(oSecondAnchor, KeyCodes.PAGE_UP);

		// Focus the seventh anchor within the anchorbar and trigger PAGE UP
		jQuery(oSeventhAnchor).trigger("focus");
		QUtils.triggerKeydown(oSeventhAnchor, KeyCodes.PAGE_UP);
	});

	QUnit.test("PAGE DOWN: Anchor level", function (assert) {
		const oAncorBar = getAnchorBar();
		const aAnchors = oAncorBar.getItems();
		const oLastAnchor = aAnchors[aAnchors.length - 1].getDomRef();
		const oSecondLastAnchor = aAnchors[aAnchors.length - 2].getDomRef();
		const oSeventhLastAnchor = aAnchors[aAnchors.length - 7].getDomRef();
			oLastAnchor.focus = function () {
				// Check if focus function is called on firstAnchor
				assert.ok(true, "The last anchor should be focused");
			};

		// Focus the last anchor and trigger PAGE DOWN
		jQuery(oLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oLastAnchor, KeyCodes.PAGE_DOWN);

		// Focus the second last anchor and trigger PAGE DOWN
		jQuery(oSecondLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oSecondLastAnchor, KeyCodes.PAGE_DOWN);

		// Focus the seventh anchor from the end and trigger PAGE DOWN
		jQuery(oSeventhLastAnchor).trigger("focus");
		QUtils.triggerKeydown(oSeventhLastAnchor, KeyCodes.PAGE_DOWN);
	});

	QUnit.test("Focus of stickyAnchorBar filter buttons", function (assert) {
		const iSectionIndex = 7;
		const oAncorBar = getAnchorBar();
		const oSectionAnchor = oAncorBar.getItems()[iSectionIndex];

		oSectionAnchor.focus = function fakeFn() {
			// Check
			assert.strictEqual(this.oObjectPage._bStickyAnchorBar, true, "anchorBar is snapped");
		}.bind(this);

		// Setup
		// assert init state
		assert.equal(oSectionAnchor.isA("sap.m.IconTabFilter"), true, "anchor is a menu button");

		// Act
		oAncorBar.fireSelect({
			key: oSectionAnchor.getKey()
		});
	});

	QUnit.module("Section/Subsection", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(async (oView) => {
				this.anchorBarView = oView;
				const sFocusable = "0";
				const sTabIndex = "tabindex";
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.assertCorrectTabIndex = ($elment, sMessage, assert) => {
					assert.strictEqual($elment.attr(sTabIndex), sFocusable, sMessage);
				};
				this.anchorBarView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("TAB/SHIFT+TAB - correct tab index on section and subsection", function (assert) {
		const aSections = this.oObjectPage.getSections();
		const $firstSection = aSections[0].$();
		const oCurrentSection = aSections[4];
		const oPersonalSection = aSections[7];
		const oContactSubSection = aSections[7].getSubSections()[0];

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

	QUnit.test("TAB/click - single section is not focusable (no navigation)", async function (assert) {
		// Arrange - an ObjectPageLayout with only one section => the anchorBar is hidden
		const oObjectPage = new ObjectPageLayout({
			sections: [
				new ObjectPageSection({
					title: "Section 1",
					subSections: [
						new ObjectPageSubSection({
							title: "SubSection 1",
							blocks: [new Text({ text: "Content" })]
						})
					]
				})
			]
		});
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oSection1 = oObjectPage.getSections()[0];

		// Assert - with a single section, no tabindex is set,
		// so the section is not focusable via TAB nor via mouse click
		assert.strictEqual(oSection1.$().attr("tabindex"), undefined,
			"When there is only one section, it should not have a tabindex attribute");

		// Act - try to focus the section programmatically (as a mouse click on it would)
		oSection1.getDomRef().focus();

		// Assert - focus falls through to the body, proving the single section
		// cannot receive focus (rather than focus landing elsewhere by chance)
		assert.strictEqual(document.activeElement, document.body,
			"Focus falls through to the body - the single section cannot receive focus");

		// Act - add a second section => the navigation becomes visible again
		const oSection2 = new ObjectPageSection({
			title: "Section 2",
			subSections: [
				new ObjectPageSubSection({
					title: "SubSection 2",
					blocks: [new Text({ text: "Content" })]
				})
			]
		});
		oObjectPage.addSection(oSection2);
		await nextUIUpdate();

		// Assert - the focus values are correctly restored for the multi-section case
		assert.strictEqual(oSection1.$().attr("tabindex"), "0",
			"When a second section is added, the first section becomes focusable (tabindex '0')");
		assert.strictEqual(oSection2.$().attr("tabindex"), "-1",
			"When a second section is added, the non-selected section is not focusable (tabindex '-1')");

		// Act - remove the second section again => back to the single-section case
		oObjectPage.removeSection(oSection2);
		oSection2.destroy();
		await nextUIUpdate();

		// Assert - the single section is not focusable again
		assert.strictEqual(oSection1.$().attr("tabindex"), undefined,
			"When back to a single section, the section should not have a tabindex attribute again");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("RIGHT/DOWN - next section and subsection should be focused with arrow right/down", async function(assert) {
		assert.expect(5);
		const aSections = this.oObjectPage.getSections();
		const aSubSections = aSections[8].getSubSections();

		aSections.forEach((oSection) => {
			oSection.getSubSections().forEach((oSubSection) => {
				oSubSection._setColumnSpan(ObjectPageSubSection.COLUMN_SPAN.auto);
			});
		});

		await nextUIUpdate();

		// Section
		aSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSections[0].sId, KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[1].sId, "Next section should be focused after arrow right");
		QUtils.triggerKeydown(aSections[1].sId, KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[2].sId, "Next section should be focused after arrow down");

		// Subsection
		aSubSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.ARROW_UP);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "Same subsection should be focused after arrow up");

		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.ARROW_DOWN);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[1].sId, "Next subsection should be focused after arrow down");

		QUtils.triggerKeydown(aSubSections[1].sId, KeyCodes.ARROW_RIGHT);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[2].sId, "Next subsection should be focused after arrow right");
	});

	QUnit.test("LEFT/UP - previous section and subsection should be focused with arrow left/up", function (assert) {
		const aSections = this.oObjectPage.getSections();
		const aSubSections = aSections[8].getSubSections();

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

	QUnit.test("HOME/END - first and last section and subsection should be focused with HOME and END keys", function (assert) {
		const aSections = this.oObjectPage.getSections();
		const aSubSections = aSections[8].getSubSections();
		const oSingleSubsection = aSections[0].getSubSections()[0];
		const oSpy = this.spy(oSingleSubsection, "_scrollParent");

		// Section
		aSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSections[0].sId, KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), "UxAP-70_KeyboardHandling--section-with-multiple-sub-section", "Last section should be focused after END key");
		QUtils.triggerKeydown("UxAP-70_KeyboardHandling--section-with-multiple-sub-section", KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), aSections[0].sId, "First section should be focused after HOME key");

		// Subsection
		aSubSections[0].$().trigger("focus");
		QUtils.triggerKeydown(aSubSections[0].sId, KeyCodes.END);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[11].sId, "Last subsection should be focused after END key");
		QUtils.triggerKeydown(aSubSections[9].sId, KeyCodes.HOME);
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[0].sId, "First subsection should be focused after HOME key");

		// Single subsection should not scroll the page
		oSingleSubsection.$().trigger("focus");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.HOME);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
		QUtils.triggerKeydown(oSingleSubsection.getId(), KeyCodes.END);
		assert.ok(oSpy.notCalled, "_scrollParent should not be called");
	});

	QUnit.test("PAGE_DOWN/PAGE_UP - correct section and subsection navigation with page keys", function (assert) {
		const aSections = this.oObjectPage.getSections();
		const aSubSections = aSections[8].getSubSections();
		const oSingleSubsection = aSections[0].getSubSections()[0];
		const oSpy = this.spy(oSingleSubsection, "_scrollParent");

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
		assert.equal(jQuery(document.activeElement).attr("id"), aSubSections[11].sId, "Last subsection down should be focused after PAGE DOWN");
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
		const oBtn = Element.getElementById("UxAP-70_KeyboardHandling--interactive-el-single-sub-section");
		const $btn = oBtn.$();
		const oSection = Element.getElementById("UxAP-70_KeyboardHandling--section-with-single-sub-section");
		const $section = oSection.$();

		oSection.$ = function () {
			return {
				trigger: function (sMethod) {
					if (sMethod === "focus") {
						assert.ok(true, "Section must be focused");
					}
				}
			};
		};
		oBtn.$ = function () {
			return {
				off: function () {},
				trigger: function (sMethod) {
					if (sMethod === "focus") {
						assert.ok(true, "Interactive element must be focused back again");
					}
				}
			};
		};

		$section.attr("tabindex", 0);
		QUtils.triggerKeydown($btn, KeyCodes.F7);

		QUtils.triggerKeydown($section, KeyCodes.F7);
	});

	QUnit.test("ObjectPageSection F7 - interactive control inside Section with only one SubSection", function (assert) {
		const oBtn = Element.getElementById("UxAP-70_KeyboardHandling--interactive-el-multiple-sub-section");
		const $btn = oBtn.$();
		const oSubSection = Element.getElementById("UxAP-70_KeyboardHandling--multiple-sub-section-2");
		const $subSection = oSubSection.$();

		oSubSection.$ = function () {
			return {
				trigger: function (sMethod) {
					if (sMethod === "focus") {
						assert.ok(true, "SubSection must be focused");
					}
				}
			};
		};
		oBtn.$ = function () {
			return {
				off: function () {},
				trigger: function (sMethod) {
					if (sMethod === "focus") {
						assert.ok(true, "Interactive element must be focused back again");
					}
				}
			};
		};

		$subSection.attr("tabindex", 0);
		QUtils.triggerKeydown($btn, KeyCodes.F7);

		QUtils.triggerKeydown($subSection, KeyCodes.F7);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section", function (assert) {
		const $btnToolbar = Element.getElementById("UxAP-70_KeyboardHandling--button-toolbar").$();
		const oSubSection = Element.getElementById("UxAP-70_KeyboardHandling--multiple-sub-section-1");
		const $subSection = oSubSection.$();

		oSubSection.$ = function () {
			return {
				trigger: function (sMethod) {
					if (sMethod === "focus") {
						assert.ok(true, "SubSection must be focused");
					}
				}
			};
		};

		$subSection.attr("tabindex", 0);
		QUtils.triggerKeydown($btnToolbar, KeyCodes.F7);
	});

	QUnit.test("ObjectPageSection F7 - from section move focus to toolbar", function (assert) {
		const oSubSection = Element.getElementById("UxAP-70_KeyboardHandling--multiple-sub-section-1");
		const $subSection = oSubSection.$();

		oSubSection.$ = function () {
			return {
				firstFocusableDomRef: function () {
					return {
						focus: function () {
							assert.ok(true, "Button must be focused");
						}
					};
				}
			};
		};

		QUtils.triggerKeydown($subSection, KeyCodes.F7);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon Space press", function (assert) {
		assert.expect(1);
		// Arrange
		const fDone = assert.async();
		const sSectionId = this.oObjectPage.getSections()[1].sId;
		const sButtonId = getAnchorBar().getItems()[1].getId();
		const sKeyPressed = "SPACE";
		let oStub;

		// Act
// eslint-disable-next-line no-warning-comments
		// Cannot replace with nextUIUpdate — waits for AnchorBar DOM calculations after keyboard events
		setTimeout(() => {
			const oAnchorBarButtonControl = Element.getElementById(sButtonId);
			const $anchorBarButton = oAnchorBarButtonControl.$();
			const oSubSection = Element.getElementById(sSectionId);

			oStub = this.stub(oSubSection, "getDomRef").callsFake(function () {
				return {
					focus: function () {
						// Assert
						assert.ok(true, "SubSection must be focused");
						oStub.restore();
						fDone();
					}
				};
			});
			$anchorBarButton.trigger("focus");

			QUtils.triggerKeyup($anchorBarButton, sKeyPressed);
		}, 0);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon Enter press", function (assert) {
		assert.expect(1);
		// Arrange
		const fDone = assert.async();
		const sSectionId = this.oObjectPage.getSections()[2].sId;
		const sButtonId = getAnchorBar().getItems()[2].getId();
		const sKeyPressed = "ENTER";
		let oStub;

// eslint-disable-next-line no-warning-comments
		// Act
		// Cannot replace with nextUIUpdate — waits for AnchorBar DOM calculations after keyboard events
		setTimeout(() => {
			const oAnchorBarButtonControl = Element.getElementById(sButtonId);
			const $anchorBarButton = oAnchorBarButtonControl.$();
			const oSubSection = Element.getElementById(sSectionId);

			oStub = this.stub(oSubSection, "getDomRef").callsFake(function () {
				return {
					focus: function () {
						// Assert
						assert.ok(true, "SubSection must be focused");
						oStub.restore();
						fDone();
					}
				};
			});
			$anchorBarButton.trigger("focus");

			QUtils.triggerKeydown($anchorBarButton, sKeyPressed);
		}, 0);
	});

	QUnit.test("ObjectPageSection F7 - from toolbar move focus to coresponding section upon mouse click", function (assert) {
		assert.expect(1);
		// Arrange
		const fDone = assert.async();
		const sSectionId = this.oObjectPage.getSections()[5].sId;
		const sButtonId = getAnchorBar().getItems()[5].getId();
		let oStub;
// eslint-disable-next-line no-warning-comments

		// Act
		// Cannot replace with nextUIUpdate — waits for AnchorBar DOM calculations after keyboard events
		setTimeout(() => {
			const oAnchorBarButtonControl = Element.getElementById(sButtonId);
			const $anchorBarButton = oAnchorBarButtonControl.$();
			const oSubSection = Element.getElementById(sSectionId);

			oStub = this.stub(oSubSection, "getDomRef").callsFake(function () {
				return {
					focus: function () {
						// Assert
						assert.ok(true, "SubSection must be focused");
						oStub.restore();
						fDone();
					}
				};
			});

			$anchorBarButton.trigger("focus");

			getAnchorBar().fireSelect({
				key: oAnchorBarButtonControl.getKey()
			});
		}, 0);
	});

	QUnit.test("ObjectPageSection SPACE - browser scrolling is prevented", function (assert) {
		const oSection = Element.getElementById("UxAP-70_KeyboardHandling--section-with-single-sub-section");
		const oInput = Element.getElementById("UxAP-70_KeyboardHandling--input-single-sub-section");
		const oEventSection = {
			keyCode: KeyCodes.SPACE,
			preventDefault: function () {},
			srcControl: oSection
		};
		const oSpySection = this.spy(oEventSection, "preventDefault");
		const oEventInput = {
			keyCode: KeyCodes.SPACE,
			preventDefault: function () {},
			srcControl: oInput
		};
		const oSpyInput = this.spy(oEventInput, "preventDefault");

		oSection.onkeydown(oEventSection);
		assert.ok(oSpySection.calledOnce, "preventDefault is called on SPACE key for the section");

		oInput.onkeydown(oEventInput);
		assert.notOk(oSpyInput.called, "preventDefault is not called on SPACE key for the internal input");
	});

	QUnit.test("ObjectPageSubSection SPACE - browser scrolling is prevented", function (assert) {
		const oSection = Element.getElementById("UxAP-70_KeyboardHandling--multiple-sub-section-1");
		const oInput = Element.getElementById("UxAP-70_KeyboardHandling--input-multiple-sub-section");
		const oEventSection = {
			keyCode: KeyCodes.SPACE,
			preventDefault: function () {},
			srcControl: oSection
		};
		const oSpySection = this.spy(oEventSection, "preventDefault");
		const oEventInput = {
			keyCode: KeyCodes.SPACE,
			preventDefault: function () {},
			srcControl: oInput
		};
		const oSpyInput = this.spy(oEventInput, "preventDefault");

		oSection.onkeydown(oEventSection);
		assert.ok(oSpySection.calledOnce, "preventDefault is called on SPACE key for the subsection");

		oInput.onkeydown(oEventInput);
		assert.notOk(oSpyInput.called, "preventDefault is not called on SPACE key for the internal input");
	});

	QUnit.module("Focus/scroll order", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(async (oView) => {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.oScrollSpy = this.spy(this.oObjectPage, "scrollToSection");
				this.oFocusSpy = this.spy(this.oObjectPage._oABHelper, "_moveFocusOnSection");
				this.anchorBarView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Focus from toolbar to section", function (assert) {
		const oAnchorBar = this.oObjectPage.getAggregation("_anchorBar");
		const oSectionButton = oAnchorBar.getItems()[1];
		const oOrigAnimationMode = ControlBehavior.getAnimationMode();

		assert.expect(3);

		// Setup
		ControlBehavior.setAnimationMode(AnimationMode.none);
		this.oScrollSpy.resetHistory();
		this.oFocusSpy.resetHistory();

		// Act
		oAnchorBar.fireSelect({
			key: oSectionButton.getKey()
		});

		// Check
		assert.strictEqual(this.oScrollSpy.called, true, "Scroll to section is called");
		assert.strictEqual(this.oFocusSpy.called, true, "Section must be focused");
		assert.ok(this.oFocusSpy.calledBefore(this.oScrollSpy));

		// restore state
		ControlBehavior.setAnimationMode(oOrigAnimationMode);
	});

	QUnit.module("Focus on selection, selected state", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-70_KeyboardHandling",
				viewName: "view.UxAP-70_KeyboardHandling"
			}).then(async (oView) => {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	//This test is written to cover a timing problem in IE, when focus outruns scrolling to section
	QUnit.test("Focus a section on selection with animation mode 'none'", function (assert) {
		const oAnchorBar = getAnchorBar();
		const oSectionButton = oAnchorBar.getItems()[2];
		const oOrigAnimationMode = ControlBehavior.getAnimationMode();
		const done = assert.async();

		assert.expect(1);

// eslint-disable-next-line no-warning-comments
		// Setup
		ControlBehavior.setAnimationMode(AnimationMode.none);

		// Cannot replace with nextUIUpdate — waits for AnchorBar DOM calculations after keyboard events
		// Check
// eslint-disable-next-line no-warning-comments
		setTimeout(() => {

			// Act
			oAnchorBar.fireSelect({ key: oSectionButton.getKey() });
			// Cannot replace with nextUIUpdate — waits for AnchorBar DOM calculations after keyboard events
			setTimeout(() => {

				assert.strictEqual(this.oObjectPage.getSelectedSection(), oSectionButton.getKey(), "Section is properly selected");

				// restore state
				ControlBehavior.setAnimationMode(oOrigAnimationMode);
				done();
			}, 500);
		}, 500);

	});

	QUnit.module("onfocusFail", {
		beforeEach: function () {
			this.oFooterToolbar = new OverflowToolbar({
				visible: false
			});
			this.oObjectPage = new ObjectPageLayout({
				footer: this.oFooterToolbar
			});
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
			this.oFooterToolbar = null;
		}
	});

	QUnit.test("skip restoring focus from footer toolbar if toolbar hidden", function (assert) {
		// Arrange
		const oSpy = this.spy(Element.prototype, "onfocusfail");

		// Act
		this.oObjectPage.onfocusfail({
			srcControl: this.oFooterToolbar
		});

		// Assert
		assert.ok(oSpy.notCalled, "restoring focus is skipped");
	});

	QUnit.module("Sections outside viewport", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageDynamicHeader",
				viewName: "view.UxAP-12-ObjectPageDynamicHeader"
			}).then((oView) => {
				this.oView = oView;
				this.oObjectPage = oView.byId("ObjectPageLayout");
				done();
			});
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("scrolls to focused section", async function(assert) {
		assert.expect(4); //number of assertions
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oFirstVisibleSection = oObjectPage.getSections()[0];
		const resizePageToSmallHeight = () => {
				//make the page smaller so that only the title+header area is visible in the viewport
				const iHeaderHeight = oObjectPage._$titleArea.get(0).offsetHeight;
				oObjectPage.$().height(iHeaderHeight);
			};
		const waitForScroll = () => {
				return new Promise((resolve) => {
					oObjectPage._$opWrapper.get(0).addEventListener("scroll", (oEvent) => {
						resolve(oEvent.target.scrollTop);
					});
				});
			};

		// Arrange
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();
		await waitForDOMReady(oObjectPage);

		resizePageToSmallHeight();

		// Assert initial state
		const iFirstVisibleSectionOffsetTop = oFirstVisibleSection.getDomRef().offsetTop;
		assert.ok(iFirstVisibleSectionOffsetTop > oObjectPage.$().height(), "first visible section is below the viewport");
		assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), 0, "initially scrolled to top");

		// Act
		oFirstVisibleSection.getDomRef().focus();

		const iNewScrollTop = await waitForScroll();
		// Assert
		assert.ok(iNewScrollTop >= iFirstVisibleSectionOffsetTop, "scrolled down to focused section");
		assert.ok(oObjectPage._isClosestScrolledSection(oFirstVisibleSection.getId()), "scrolled down to focused section");
	});

	QUnit.module("sap-ui-fastnavgroup CustomData on Section", {
		beforeEach: async function () {
			this.oSection = new ObjectPageSection({
				title: "Section with fastnavgroup=false",
				customData: [new CustomData({ key: "sap-ui-fastnavgroup", value: "false", writeToDom: true })],
				subSections: [new ObjectPageSubSection({
					title: "Sub",
					blocks: [new Text({ text: "content" })]
				})]
			});
			this.oOtherSection = new ObjectPageSection({
				title: "Other Section",
				subSections: [new ObjectPageSubSection({
					title: "Other Sub",
					blocks: [new Text({ text: "other content" })]
				})]
			});
			this.oOPL = new ObjectPageLayout({
				sections: [this.oSection, this.oOtherSection]
			});
			this.oOPL.placeAt("qunit-fixture");
			await nextUIUpdate();
			await waitForDOMReady(this.oOPL);
		},
		afterEach: function () {
			this.oOPL.destroy();
		}
	});

	QUnit.test("Section with sap-ui-fastnavgroup=false renders data-sap-ui-customfastnavgroup='true' on DOM", function (assert) {
		// Assert
		assert.strictEqual(
			this.oSection.getDomRef().getAttribute("data-sap-ui-customfastnavgroup"),
			"true",
			"Section with CustomData sap-ui-fastnavgroup=false must render data-sap-ui-customfastnavgroup='true' so F6Navigation fires BeforeFastNavigationFocus"
		);
		assert.notEqual(
			this.oSection.getDomRef().getAttribute("data-sap-ui-fastnavgroup"),
			"true",
			"Section with CustomData sap-ui-fastnavgroup=false must not render data-sap-ui-fastnavgroup='true'"
		);
	});

	QUnit.test("Section with sap-ui-fastnavgroup=false remains TAB-reachable (tabindex='0') when selected", function (assert) {
		// Act - trigger focus value assignment as if this section is the selected one
		this.oOPL._setSectionsFocusValues(this.oSection.getId());

		// Assert - sap-ui-fastnavgroup only affects F6, not TAB reachability, so the
		// selected section must still be a TAB stop
		assert.strictEqual(
			this.oSection.getDomRef().getAttribute("tabindex"),
			"0",
			"Section with sap-ui-fastnavgroup=false must remain focusable via TAB (tabindex='0'); the CustomData only affects F6 navigation"
		);
	});

	QUnit.test("F6 from anchor bar skips section with sap-ui-fastnavgroup=false", function (assert) {
		// Arrange
		const oAnchorBar = this.oOPL.getAggregation("_anchorBar");
		const oAnchorBarDomRef = oAnchorBar && oAnchorBar.getDomRef();
		assert.ok(oAnchorBarDomRef, "AnchorBar DOM is present");

		// Focus the anchor bar and trigger F6
		oAnchorBarDomRef.focus();
		QUtils.triggerKeydown(oAnchorBarDomRef, KeyCodes.F6);

		// Assert - focus must NOT land on the section element with fastnavgroup=false
		assert.notStrictEqual(
			document.activeElement,
			this.oSection.getDomRef(),
			"F6 from anchor bar must not land on a section with sap-ui-fastnavgroup=false"
		);
	});

	QUnit.test("F6 from anchor bar skips all tabbable content inside a section with sap-ui-fastnavgroup=false", async function (assert) {
		// Arrange - extend the opted-out section with a tabbable Button and add a Button in the normal section
		const oButtonInOptedOut = new Button({ text: "Button in opted-out section" });
		const oButtonInNormal = new Button({ text: "Button in normal section" });

		this.oSection.getSubSections()[0].addBlock(oButtonInOptedOut);
		this.oOtherSection.getSubSections()[0].addBlock(oButtonInNormal);
		await nextUIUpdate();

		const oAnchorBarDomRef = this.oOPL.getAggregation("_anchorBar").getDomRef();
		oAnchorBarDomRef.focus();

		// Act
		QUtils.triggerKeydown(oAnchorBarDomRef, KeyCodes.F6);

		// Assert - focus must land somewhere inside the NORMAL section, not inside the opted-out section
		assert.ok(
			!this.oSection.getDomRef().contains(document.activeElement),
			"F6 from anchor bar must skip all tabbable content inside a section with sap-ui-fastnavgroup=false"
		);
		assert.ok(
			this.oOtherSection.getDomRef().contains(document.activeElement),
			"F6 from anchor bar must land inside the normal (non-opted-out) section"
		);
	});

	QUnit.test("Shift+F6 backward: no eligible previous section falls back to anchor bar", function (assert) {
		// oSection (opted-out) is at index 0 - no section precedes it
		// Shift+F6 from the normal section travels backward, hits oSection, finds no earlier eligible section
		const oNormalDom = this.oOtherSection.getDomRef();
		oNormalDom.focus();

		QUtils.triggerKeydown(oNormalDom, KeyCodes.F6, /*shift=*/true);

		const oAnchorBarDom = this.oOPL.getAggregation("_anchorBar").getDomRef();
		assert.ok(
			oAnchorBarDom.contains(document.activeElement),
			"Shift+F6 backward with no eligible previous section must fall back to anchor bar"
		);
	});

	QUnit.test("F6 forward: no eligible next section falls back to anchor bar", async function (assert) {
		// Create a layout where the opted-out section is LAST, so F6 forward finds no eligible section
		const oNormalSection = new ObjectPageSection({
			title: "Normal",
			subSections: [new ObjectPageSubSection({
				title: "Sub",
				blocks: [new Button({ text: "btn" })]
			})]
		});
		const oOptedOutLast = new ObjectPageSection({
			title: "Opted-out last",
			customData: [new CustomData({ key: "sap-ui-fastnavgroup", value: "false", writeToDom: true })],
			subSections: [new ObjectPageSubSection({
				title: "Sub",
				blocks: [new Button({ text: "btn2" })]
			})]
		});
		const oLayout = new ObjectPageLayout({ sections: [oNormalSection, oOptedOutLast] });
		oLayout.placeAt("qunit-fixture");
		await nextUIUpdate();
		await waitForDOMReady(oLayout);

		// Focus normal section, then F6 forward - next group is opted-out with no eligible section after it
		const oNormalDom = oNormalSection.getDomRef();
		oNormalDom.focus();
		QUtils.triggerKeydown(oNormalDom, KeyCodes.F6);

		const oAnchorBarDom = oLayout.getAggregation("_anchorBar").getDomRef();
		assert.ok(
			oAnchorBarDom.contains(document.activeElement),
			"F6 forward with no eligible next section must fall back to anchor bar"
		);

		oLayout.destroy();
	});

	QUnit.test("F6 from anchor bar skips multiple consecutive opted-out sections", async function (assert) {
		const oOptedOut2 = new ObjectPageSection({
			title: "Opted-out 2",
			customData: [new CustomData({ key: "sap-ui-fastnavgroup", value: "false", writeToDom: true })],
			subSections: [new ObjectPageSubSection({
				title: "Sub",
				blocks: [new Button({ text: "btn in opted-out 2" })]
			})]
		});
		// Insert a second opted-out section between oSection and oOtherSection
		this.oOPL.insertSection(oOptedOut2, 1);
		await nextUIUpdate();

		const oAnchorBarDom = this.oOPL.getAggregation("_anchorBar").getDomRef();
		oAnchorBarDom.focus();
		QUtils.triggerKeydown(oAnchorBarDom, KeyCodes.F6);

		assert.ok(
			!this.oSection.getDomRef().contains(document.activeElement),
			"F6 must skip opted-out section 1"
		);
		assert.ok(
			!oOptedOut2.getDomRef().contains(document.activeElement),
			"F6 must skip opted-out section 2"
		);
		assert.ok(
			this.oOtherSection.getDomRef().contains(document.activeElement),
			"F6 must land inside the first non-opted-out section"
		);
	});
});
