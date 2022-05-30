/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/core/dnd/DragInfo",
	"sap/m/Panel",
	"sap/m/library",
	"sap/ui/thirdparty/jquery"
], function(qutils, createAndAppendDiv, Link, Text, KeyCodes, coreLibrary, Core, DragInfo, Panel, mobileLibrary, jQuery) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Core.getLibraryResourceBundle("sap.m");

	createAndAppendDiv("uiArea1");

	var sText = "Hello World";
	var bLinkPressExpectCtrlKey = false;
	var bLinkPressExpectMetaKey = false;

	var oLink1 = new Link("l1", {
		text : sText,
		href: "x.html",
		target: "_blank",
		width : "200px",
		press:function(oEvent) {
			oEvent.preventDefault();
			QUnit.config.current.assert.ok(true, "This should be executed when the link is triggered");
			QUnit.config.current.assert.strictEqual(oEvent.getParameter("ctrlKey"), bLinkPressExpectCtrlKey, "CtrlKey-Parameter correct for press event");
			QUnit.config.current.assert.strictEqual(oEvent.getParameter("metaKey"), bLinkPressExpectMetaKey, "MetaKey-Parameter correct for press event");
		}
	}).placeAt("uiArea1");

	var oLink2 = new Link("l2", {
		text : sText,
		href: "x.html",
		enabled: false
	}).placeAt("uiArea1");

	// test property accessor methods

	QUnit.module("");

	QUnit.test("Text in HTML", function(assert) {
		assert.equal(oLink1.$().text(), sText, "oLink1 text should be correct");
	});

	QUnit.test("Width", function(assert) {
		assert.strictEqual(oLink1.getDomRef().offsetWidth, 200, "oLink1 width should be correct");
	});

	QUnit.test("href", function(assert) {
		var href = oLink1.getDomRef().href;
		assert.strictEqual(href.indexOf("x.html"), href.length - "x.html".length, "oLink1 href should be correct");
	});

	QUnit.test("Target", function(assert) {
		assert.strictEqual(oLink1.getDomRef().target, "_blank", "oLink1 target should be correct");
	});

	QUnit.test("Press event", function(assert) {
		assert.expect(12); // verifies the event handler was executed
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oLink1.getId());
		bLinkPressExpectCtrlKey = true;
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oLink1.getId(), {ctrlKey: true});
		bLinkPressExpectCtrlKey = false;
		bLinkPressExpectMetaKey = true;
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oLink1.getId(), {metaKey: true});
		bLinkPressExpectCtrlKey = true;
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oLink1.getId(), {metaKey: true, ctrlKey: true});
		bLinkPressExpectMetaKey = false;
		bLinkPressExpectCtrlKey = false;
	});

	QUnit.test("Enter event should fire press event on keydown", function (assert) {
		assert.expect(3); // verifies the event handler was executed
		qutils.triggerKeydown(oLink1.getDomRef(), KeyCodes.ENTER);
	});

	QUnit.test("Enter event should not fire press on keyup", function (assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		qutils.triggerKeyup(oLink1.getDomRef(), KeyCodes.ENTER);
	});

	QUnit.test("Space event should fire press event on keyup", function (assert) {
		assert.expect(3); // verifies the event handler was executed
		qutils.triggerKeyup(oLink1.getDomRef(), KeyCodes.SPACE);
	});

	QUnit.test("Space event should not fire press on keydown", function (assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		qutils.triggerKeydown(oLink1.getDomRef(), KeyCodes.SPACE);
	});

	QUnit.test("Space event should not fire press if escape is pressed and released after the Space is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oLink = new Link({
				press: pressSpy
			}).placeAt("qunit-fixture");

		Core.applyChanges();
		// Action
		// first keydown on SPACE, keydown on ESCAPE, release SPACE then release ESCAPE
		var oLinkDomRef = oLink.getDomRef();
		qutils.triggerKeydown(oLinkDomRef, KeyCodes.SPACE);
		qutils.triggerKeydown(oLinkDomRef, KeyCodes.ESCAPE);
		qutils.triggerKeyup(oLinkDomRef, KeyCodes.SPACE);
		qutils.triggerKeyup(oLinkDomRef, KeyCodes.ESCAPE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oLink.destroy();
	});

	QUnit.test("Space event should not fire press if escape is pressed then Space is released and then Escape is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oLink = new Link({
				press: pressSpy
			}).placeAt("qunit-fixture");

		Core.applyChanges();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then release SPACE
		var oLinkDomRef = oLink.getDomRef();
		qutils.triggerKeydown(oLinkDomRef, KeyCodes.SPACE);
		qutils.triggerKeydown(oLinkDomRef, KeyCodes.ESCAPE);
		qutils.triggerKeyup(oLinkDomRef, KeyCodes.ESCAPE);
		qutils.triggerKeyup(oLinkDomRef, KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oLink.destroy();
	});

	QUnit.test("Disabled", function(assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		oLink1.setEnabled(false);
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oLink1.getId());
	});

	QUnit.test("Enabled is properly validated", function(assert) {
		var sut = new Link({text : "text"}).placeAt("qunit-fixture");
		Core.applyChanges();

		sut.setEnabled(undefined);
		Core.applyChanges();
		assert.ok(!sut.$().hasClass("sapMLnkDsbl"), "The disabled CSS class was not set when trying to set undefined for the enabled property.");
	});

	QUnit.test("When width is not set max-width should apply to control", function(assert) {
		var sut = new Link({text : "text"}).placeAt("qunit-fixture");
		Core.applyChanges();
		assert.ok(sut.$().hasClass("sapMLnkMaxWidth"), "Link has max width restriction for the trunctation.");

		sut.setWidth("100px");
		Core.applyChanges();
		assert.ok(!sut.$().hasClass("sapMLnkMaxWidth"), "Link has width and does not have max width restriction.");
	});

	QUnit.test("Subtle", function(assert) {
		oLink1.setSubtle(true);
		Core.applyChanges();
		assert.ok(oLink1.$().hasClass('sapMLnkSubtle'), "Link is subtle.");
	});

	QUnit.test("Emphasized", function(assert) {
		oLink1.setEmphasized(true);
		Core.applyChanges();
		assert.ok(oLink1.$().hasClass('sapMLnkEmphasized'), "Link is emphasized.");
		oLink1.destroy();
	});

	QUnit.test("Non-rendered Subtle values", function(assert) {
		// this checks for the bug in BCP message 1472023641 - no need to actually render the Link (issue is about non-rendered Links) or write checks, it would fail with a JS error
		assert.expect(0);
		var oLinkNRS = new Link({subtle: false});
		oLinkNRS.setSubtle(true);
		oLinkNRS.setSubtle(false);
		oLinkNRS.destroy();
	});

	QUnit.test("Non-rendered Emphasized values", function(assert) {
		// this checks for the bug in BCP message 1472023641 - no need to actually render the Link (issue is about non-rendered Links) or write checks, it would fail with a JS error
		assert.expect(0);
		var oLinkNRE = new Link({emphasized: false});
		oLinkNRE.setEmphasized(true);
		oLinkNRE.setEmphasized(false);
		oLinkNRE.destroy();
	});

	QUnit.test("Rendered initial Subtle values", function(assert) {
		assert.expect(1);
		var oLinkRIS = new Link({subtle: true});
		oLinkRIS.placeAt("uiArea1");
		Core.applyChanges();
		assert.ok(oLinkRIS.$().hasClass('sapMLnkSubtle'), "Link should have the 'sapMLnkSubtle' CSS class.");
		oLinkRIS.destroy();
	});

	QUnit.test("Rendered initial Emphasized values", function(assert) {
		assert.expect(1);
		var oLinkRIE = new Link({emphasized: true});
		oLinkRIE.placeAt("uiArea1");
		Core.applyChanges();
		assert.ok(oLinkRIE.$().hasClass('sapMLnkEmphasized'), "Link should have the 'sapMLnkEmphasized' CSS class.");
		oLinkRIE.destroy();
	});

	QUnit.test("Link should be shrinkable", function(assert) {
		var oLink = new Link();
		assert.ok(oLink.getMetadata().isInstanceOf("sap.ui.core.IShrinkable"), "Link control implements IShrinkable interface");
		oLink.destroy();
	});

	QUnit.test("Disabled link should have empty href", function(assert) {
		/*eslint-disable no-script-url */
		assert.equal(oLink2.$().attr("href"), "javascript:void(0)", "oLink2 href should be empty");
		oLink2.setEnabled(true);
		Core.applyChanges();
		assert.equal(oLink2.$().attr("href"), "x.html", "oLink2 href should be 'x.html' again after enabling");
		oLink2.destroy();
	});

	// Keyboard handling

	QUnit.test("Link with empty or no text should not be in the tab chain", function(assert) {
		var oLink1 = new Link("l1", {
			text : "",
			href: "x.html",
			target: "_blank",
			width : "200px"
		}).placeAt("uiArea1");

		Core.applyChanges();

		var $oLink = oLink1.$();

		assert.strictEqual($oLink.attr("tabindex"), "-1", "Attribute 'tabindex' should be '-1'");

		oLink1.destroy();
	});

	QUnit.test("setEnabled(false) does not remove the tabindex", function(assert) {
		// arrange
		var oLink1 = new Link({
				text: 'linkwithtext'
			}).placeAt("uiArea1"),
			$Link1;

		Core.applyChanges();
		$Link1 = oLink1.$();

		// act
		oLink1.setEnabled(false);
		Core.applyChanges();

		// assert
		assert.strictEqual($Link1.attr("tabindex"), "-1", "disabled link shouldn't be focusable");

		// clean
		oLink1.destroy();
	});

	QUnit.test("_getTabindex should return -1 if the link has no text", function(assert) {
		var oLink1 = new Link({
			text : ""
		});

		assert.equal(oLink1._getTabindex(), "-1", "Tabindex of the Link should be -1");

		oLink1.destroy();
	});

	QUnit.test("_getTabindex should return 0 if the link has text", function(assert) {
		var oLink1 = new Link({
			text : "Some link"
		});

		assert.equal(oLink1._getTabindex(), "0", "Tabindex of the Link should be 0");

		oLink1.destroy();
	});

	QUnit.test("Normal link should be in the tab chain", function(assert) {
		var oLink1 = new Link("l1", {
			text : sText,
			href: "x.html",
			target: "_blank",
			width : "200px"
		}).placeAt("uiArea1");

		Core.applyChanges();

		var $oLink = oLink1.$();

		assert.strictEqual($oLink.attr("tabindex"), "0", "Attribute 'tabindex' should be '0'");

		oLink1.destroy();
	});

	// ARIA specific tests
	QUnit.test("ARIA specific test", function(assert) {
		var oLink = new Link({
				text : sText,
				href: "x.html",
				target: "_blank",
				width : "200px",
				press: function() {
					assert.ok(true, "This should be executed when the link is triggered");
				}
			}).placeAt("uiArea1"),
			AriaHasPopup = coreLibrary.aria.HasPopup,
			oLinkDomRef;

		Core.applyChanges();
		oLinkDomRef = oLink.getDomRef();

		// ARIA role
		assert.notOk(oLinkDomRef.getAttribute("role"), "Attribute 'role' is redundant on an anchor tag");

		oLink.setHref("");
		Core.applyChanges();
		assert.notOk(oLinkDomRef.getAttribute("role"), "Links without href shouldn't have a role too");
		/*eslint-disable no-script-url */
		assert.strictEqual(oLinkDomRef.getAttribute("href"), "javascript:void(0)", "Links without href should have an empty href attribute");

		// ARIA disabled
		oLink.setEnabled(false);
		Core.applyChanges();

		assert.ok(oLinkDomRef.getAttribute("aria-disabled"), "Attribute 'aria-disabled' should be placed on disabled links");
		oLink.setEnabled(true);
		Core.applyChanges();

		assert.notOk(oLinkDomRef.getAttribute("aria-disabled"), "Attribute 'aria-disabled' should not exist for non-disabled links");

		// ARIA describedby for Subtle link
		oLink.setSubtle(true);
		Core.applyChanges();

		assert.strictEqual(oLinkDomRef.getAttribute("aria-describedby"). length > 0, true, "Property 'aria-describedby' should exist");
		assert.strictEqual(((oLinkDomRef.getAttribute("aria-describedby").indexOf(oLink._sAriaLinkSubtleId)) !== -1), true,
			"Subtle ID: " + oLink._sAriaLinkSubtleId + " should be included in aria-describedby");

		oLink.setSubtle(false);
		Core.applyChanges();

		assert.notOk(oLinkDomRef.getAttribute("aria-describedby"), "Property 'aria-describedby' should not exist");

		// ARIA describedby for Emphasized link
		oLink.setEmphasized(true);
		Core.applyChanges();

		assert.strictEqual(oLinkDomRef.getAttribute("aria-describedby").length > 0, true, "Property 'aria-describedby' should exist");
		assert.strictEqual(((oLinkDomRef.getAttribute("aria-describedby").indexOf(oLink._sAriaLinkEmphasizedId)) !== -1), true,
			"Emphasized ID: " + oLink._sAriaLinkEmphasizedId + " should be included in aria-describedby");

		oLink.setEmphasized(false);
		Core.applyChanges();

		assert.notOk(oLinkDomRef.getAttribute("aria-describedby"), "Property 'aria-describedby' should not exist");

		oLink.addAriaLabelledBy("id1");
		Core.applyChanges();
		assert.strictEqual(oLinkDomRef.getAttribute("aria-labelledby"), "id1 " + oLink.getId(),
			"Property 'aria-labelledby' should contain the link ID");

		oLink.removeAriaLabelledBy("id1");
		Core.applyChanges();
		assert.notOk(oLinkDomRef.getAttribute("aria-labelledby"), "Property 'aria-labelledby' should not exist");

		// check initial aria-haspopup state
		assert.notOk(oLinkDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute initially.");

		// act
		oLink.setAriaHasPopup(AriaHasPopup.Menu);
		Core.applyChanges();

		// check if aria-haspopup appears
		assert.equal(oLinkDomRef.getAttribute("aria-haspopup"), AriaHasPopup.Menu.toLowerCase(),
			"There is aria-haspopup attribute with proper value after the link property is being set to something different than None.");

		// act
		oLink.setAriaHasPopup(AriaHasPopup.None);
		Core.applyChanges();

		// check if aria-haspopup disappears
		assert.notOk(oLinkDomRef.getAttribute("aria-haspopup"),
			"There is no aria-haspopup attribute after the link property is being set to None.");

		// check ih href disappears if there is no text
		oLink.setText("");
		Core.applyChanges();
		assert.notOk(oLinkDomRef.getAttribute("href"), "Empty links don't have href");

		oLink.destroy();
	});

	QUnit.test("textAlign set to END", function(assert) {
		var oLink = new Link({
			text: "(+359) 111 222 333",
			textAlign: TextAlign.End
		});

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oLink.$().css("text-align"), "right", "Text align style is shifted to right");

		oLink.destroy();
	});

	QUnit.test("textDirection set to RTL and textAlign set to Begin", function(assert) {
		var oLink = new Link({
			text: "(+359) 111 222 333",
			textAlign: TextAlign.Begin,
			textDirection: TextDirection.RTL
		});

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oLink.$().attr('dir'), 'rtl', "The dir element must be set to 'rtl'");
		assert.strictEqual(oLink.$().css("text-align"), "right", "Text align style is shifted to right");

		oLink.destroy();
	});

	QUnit.test("textDirection set to LTR and textAlign set to END", function(assert) {
		var oLink = new Link({
			text: "(+359) 111 222 333",
			textAlign: TextAlign.End,
			textDirection: TextDirection.LTR
		});

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oLink.$().attr('dir'), 'ltr', "The dir element must be set to 'ltr'");
		assert.strictEqual(oLink.$().css("text-align"), "right", "Text align style is shifted to right");

		oLink.destroy();
	});

	QUnit.test("textDirection not set", function(assert) {
		var oLink = new Link({
			text: "(+359) 111 222 333"
		});

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oLink.$().attr('dir'), undefined, "The dir attribute should not be rendered");

		oLink.destroy();
	});

	QUnit.test("validateUrl property behavior", function(assert) {
		var sValidUrl = "http://sap.com",
			sInvalidUrl = "hhtp://invalid",
			oLink = new Link({
				validateUrl: true,
				text: "Validate URL",
				href: sInvalidUrl
			});

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		/*eslint-disable no-script-url */
		assert.equal(oLink.$().attr("href"), "javascript:void(0)", "Link href should be empty if an invalid URL is provided");

		oLink.setHref(sValidUrl);
		Core.applyChanges();

		assert.equal(oLink.$().attr("href"), sValidUrl, "Link href should equal the valid URL");

		oLink.setHref(sInvalidUrl);
		Core.applyChanges();

		assert.equal(oLink.$().attr("href"), "javascript:void(0)", "Link href should be empty if an invalid URL is set");

		oLink.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new Link({ text: "Text", href: "HRef" }),
			oInfo = oControl.getAccessibilityInfo(),
			oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		assert.strictEqual(oInfo.role, "link", "AriaRole");
		assert.strictEqual(oInfo.type, oResourceBundle.getText("ACC_CTR_TYPE_LINK"), "Type");
		assert.strictEqual(oInfo.description, "Text", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");


		oControl.setEmphasized(true);
		oControl.setSubtle(true);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description,  "Text " + oResourceBundle.getText("LINK_EMPHASIZED")
			+ " " + oResourceBundle.getText("LINK_SUBTLE"), "Emphasized/Subtle information is added");

		oControl.setText("");
		oControl.setEnabled(false);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.type, undefined, "No type, when no text");
		assert.strictEqual(oInfo.focusable, false, "Not focusable when disabled");

		oControl.destroy();
	});

	QUnit.test("Subtle and Emphasized types don't overwrite default description", function (assert) {
		var oDescr = new Text({ text: "Description" }),
			oLink = new Link({
				text: "Link",
				href: "www.sap.com",
				ariaDescribedBy: oDescr,
				subtle: true,
				emphasized: true
			}),
			oLinkDescription;

		oLink.placeAt("qunit-fixture");
		Core.applyChanges();

		oLinkDescription = oLink.$().attr("aria-describedby");
		assert.ok(oLinkDescription.indexOf(oDescr.getId()) !== -1, "Default description is still present");
		assert.ok(oLinkDescription.indexOf(oLink._sAriaLinkSubtleId) !== -1, "Subtle description is present");
		assert.ok(oLinkDescription.indexOf(oLink._sAriaLinkEmphasizedId) !== -1, "Emphasized description is present");

		oDescr.destroy();
		oLink.destroy();
	});

	QUnit.test("drag and drop", function(assert) {
		var oLink = new Link({
			dragDropConfig: new DragInfo({
				enabled: false
			})
		}).placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oLink.$().attr('draggable'), "false", "The draggable attribute should be rendered with value false");

		oLink.getDragDropConfig()[0].setEnabled(true);
		Core.applyChanges();
		assert.strictEqual(oLink.$().attr('draggable'), "true", "The draggable attribute should be rendered with value true");

		oLink.destroy();
	});


	QUnit.test("Rel attribute derived properly", function(assert) {
		var oLink = new Link({
			target: "_blank",
			href: "https://www.sap.com"
		}).placeAt("qunit-fixture");
		Core.applyChanges();
		assert.strictEqual(oLink.getDomRef().rel, "noopener noreferrer", "oLink rel is set based on blank target and " +
			"cross-origin URL");

		oLink.destroy();
	});

	QUnit.module("EmptyIndicator", {
		beforeEach : function() {
			this.oLink = new Link({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.On
			});

			this.oLinkEmptyAuto = new Link({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oLinkEmptyAutoNoClass = new Link({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oPanel = new Panel({
				content: this.oLinkEmptyAuto
			}).addStyleClass("sapMShowEmpty-CTX");

			this.oPanel1 = new Panel({
				content: this.oLinkEmptyAutoNoClass
			});

			this.oLink.placeAt("qunit-fixture");
			this.oPanel.placeAt("qunit-fixture");
			this.oPanel1.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach : function() {
			this.oLink.destroy();
			this.oLinkEmptyAuto.destroy();
			this.oLinkEmptyAutoNoClass.destroy();
			this.oPanel.destroy();
			this.oPanel1.destroy();
		}
	});

	QUnit.test("Indicator should be rendered", function(assert) {
		var oSpan = this.oLink.getDomRef().childNodes[0];
		assert.strictEqual(oSpan.firstChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, "Empty Value", "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is not empty", function(assert) {
		//Arrange
		this.oLink.setText("test");
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oLink.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off", function(assert) {
		//Arrange
		this.oLink.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oLink.getDomRef().childNodes[0].textContent, "", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered, when sapMShowEmpty-CTX is added to parent", function(assert) {
		//Assert
		var oSpan = this.oLinkEmptyAuto.getDomRef().childNodes[0];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, "Empty Value", "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is available", function(assert) {
		//Arrange
		this.oLinkEmptyAuto.setText("test");
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oLinkEmptyAuto.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered when 'sapMShowEmpty-CTX' is added", function(assert) {
		var oSpan = this.oLinkEmptyAutoNoClass.getDomRef().childNodes[0];
		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "none", "Empty indicator is not rendered");
		//Arrange
		this.oPanel1.addStyleClass("sapMShowEmpty-CTX");
		Core.applyChanges();

		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "inline-block", "Empty indicator is rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off and there is a text", function(assert) {
		//Arrange
		this.oLink.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		this.oLink.setText("test");
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oLink.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});

});