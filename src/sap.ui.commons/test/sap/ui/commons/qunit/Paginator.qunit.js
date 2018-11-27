/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Paginator",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Dialog",
	"sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, Paginator, jQuery, Dialog, KeyCodes) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "margin-top:10px;");



	var sId = "paginator1";
	var lastSrcPage = null;
	var lastTargetPage = null;
	var lastEventType = null;
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");

	function pageEventHandler(oEvent) {
		lastSrcPage = oEvent.getParameter("srcPage");
		lastTargetPage = oEvent.getParameter("targetPage");
		lastEventType = oEvent.getParameter("type");
		QUnit.config.current.assert.equal(oEvent.getParameter("id"), sId, "ID should be the one of the Paginator"); // this also tests by being counted in the respective real test
	}


	var oCtrl = new Paginator(sId, {
		currentPage:1,
		numberOfPages:110,
		page:pageEventHandler
	});
	oCtrl.placeAt("uiArea1");



	QUnit.test("Initial Check", function(assert) {
		assert.expect(2);
		assert.ok(oCtrl, "Paginator should exist after creating");
	var oDomRef = oCtrl.getDomRef();
	assert.ok(oDomRef, "Paginator root element should exist in the page");
	});

	QUnit.test("Last Page Link", function(assert) {
		assert.expect(2);
	var oDomRef = oCtrl.getDomRef("-lastPageLink");
	assert.ok(oDomRef, "'Last Page' link should exist in the page");
	assert.equal(jQuery(oDomRef).text(), oResourceBundle.getText("PAGINATOR_OTHER_PAGE", [110]), "'Last Page' link should display 'Page 110'");
	});

	QUnit.test("Page Links", function(assert) {
		assert.expect(8);
	var $pages = oCtrl.$("pages");
	assert.equal($pages.length, 1, "pages ul tag should exist in the page");
	assert.equal($pages.children().length, 5, "pages ul tag should have five children");
	assert.equal($pages.children(":eq(0)").text(), "1", "first page link should say '1'");
	assert.ok($pages.children(":eq(0)").hasClass("sapUiPagPage"), "first page link should be a page link");
	assert.ok($pages.children(":eq(0)").hasClass("sapUiPagCurrentPage"), "first page link should be current");
	assert.equal($pages.children(":eq(1)").text(), "2", "second page link should say '1'");
	assert.ok($pages.children(":eq(1)").hasClass("sapUiPagPage"), "second page link should be a page link");
	assert.ok(!$pages.children(":eq(1)").hasClass("sapUiPagCurrentPage"), "second page link should not be current");
	});

	QUnit.test("Change Current Page", function(assert) {
		assert.expect(3); // no event should be fired
		oCtrl.setCurrentPage(2);
		sap.ui.getCore().applyChanges();
	var $pages = oCtrl.$("pages");
	assert.equal($pages.children().length, 5, "pages ul tag should have five children");
	assert.ok($pages.children(":eq(1)").hasClass("sapUiPagCurrentPage"), "second page link should be current");
	assert.ok(!$pages.children(":eq(0)").hasClass("sapUiPagCurrentPage"), "first page link should not be current");
	});

	QUnit.test("Change Current Page To The Middle", function(assert) {
		assert.expect(9); // no event should be fired
		oCtrl.setCurrentPage(50);
		sap.ui.getCore().applyChanges();
	var $pages = oCtrl.$("pages");
	assert.equal($pages.children().length, 5, "pages ul tag should have five children");
	assert.equal($pages.children(":eq(0)").text(), "48", "first displayed page link should say '48'");
	assert.equal($pages.children(":eq(1)").text(), "49", "second page link should say '49'");
	assert.equal($pages.children(":eq(2)").text(), "50", "middle page link should say '50'");
	assert.equal($pages.children(":eq(4)").text(), "52", "last page link should say '52'");
	assert.ok(!$pages.children(":eq(0)").hasClass("sapUiPagCurrentPage"), "first page link should not be current");
	assert.ok(!$pages.children(":eq(1)").hasClass("sapUiPagCurrentPage"), "second page link should not be current");
	assert.ok($pages.children(":eq(2)").hasClass("sapUiPagCurrentPage"), "middle page link should be current");
	assert.ok(!$pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should not be current");
	});

	QUnit.test("Change Current Page Close To The End", function(assert) {
		assert.expect(6); // no event should be fired
		oCtrl.setCurrentPage(109);
		sap.ui.getCore().applyChanges();
	var $pages = oCtrl.$("pages");
	assert.equal($pages.children().length, 5, "pages ul tag should have five children");
	assert.equal($pages.children(":eq(0)").text(), "106", "first displayed page link should say '106'");
	assert.equal($pages.children(":eq(3)").text(), "109", "second to last page link should say '109'");
	assert.equal($pages.children(":eq(4)").text(), "110", "last page link should say '110'");
	assert.ok($pages.children(":eq(3)").hasClass("sapUiPagCurrentPage"), "second to last page link should be current");
	assert.ok(!$pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should not be current");
	});

	QUnit.test("Trigger Forward (mouse)", function(assert) {
		assert.expect(17); // including event handler
		assert.equal(lastTargetPage, null, "lastTargetPage should be initial");

		// click forward once
		var target = oCtrl.getDomRef("-forwardLink");
		qutils.triggerMouseEvent(target, "click");
		assert.equal(lastTargetPage, 110, "lastTargetPage should be 110 after the click event");
		assert.equal(lastSrcPage, 109, "lastTargetPage should be 109 after the first click event");
		assert.equal(lastEventType, "Next", "lastEventType should be 'Next' after the click event");

		assert.equal(oCtrl.getCurrentPage(), 110, "current page should now be 110");
		var $pages = oCtrl.$("pages");
		assert.equal($pages.children(":eq(0)").text(), "106", "first displayed page link should say '106'");
		assert.equal($pages.children(":eq(3)").text(), "109", "second to last page link should say '109'");
		assert.equal($pages.children(":eq(4)").text(), "110", "last page link should say '110'");
		assert.ok($pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should be current");
		assert.ok(!$pages.children(":eq(3)").hasClass("sapUiPagCurrentPage"), "second to last page link should not be current");

		// another forward click even though we are already at the end
		target = oCtrl.getDomRef("-forwardLink");
		qutils.triggerMouseEvent(target, "click");

		assert.equal(oCtrl.getCurrentPage(), 110, "current page should now be 110");
		$pages = oCtrl.$("pages");
		assert.equal($pages.children(":eq(0)").text(), "106", "first displayed page link should say '106'");
		assert.equal($pages.children(":eq(3)").text(), "109", "second to last page link should say '109'");
		assert.equal($pages.children(":eq(4)").text(), "110", "last page link should say '110'");
		assert.ok($pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should be current");
		assert.ok(!$pages.children(":eq(3)").hasClass("sapUiPagCurrentPage"), "second to last page link should not be current");
	});

	QUnit.test("Trigger Back (mouse)", function(assert) {
		var done = assert.async();
		assert.expect(16); // including event handlers

		// click back multiple times
		var target = oCtrl.getDomRef("-backLink");
		qutils.triggerMouseEvent(target, "click");
		target = oCtrl.getDomRef("-backLink");
		qutils.triggerMouseEvent(target, "click");
		target = oCtrl.getDomRef("-backLink");
		qutils.triggerMouseEvent(target, "click");
		target = oCtrl.getDomRef("-backLink");
		qutils.triggerMouseEvent(target, "click");
		target = oCtrl.getDomRef("-backLink");
		qutils.triggerMouseEvent(target, "click");

		assert.equal(lastTargetPage, 105, "lastTargetPage should be 105 after the click event");
		assert.equal(lastSrcPage, 106, "lastTargetPage should be 106 after the click event");
		assert.equal(lastEventType, "Previous", "lastEventType should be 'Previous' after the click event");

		assert.equal(oCtrl.getCurrentPage(), 105, "current page should now be 110");
		setTimeout(function(){
			var $pages = oCtrl.$("pages");
			assert.equal($pages.children().length, 5, "pages ul tag should have five children");

			assert.equal($pages.children(":eq(0)").text(), "103", "first displayed page link should say '103'");
			assert.equal($pages.children(":eq(2)").text(), "105", "middle page link should say '105'");
			assert.equal($pages.children(":eq(4)").text(), "107", "last page link should say '107'");

			assert.ok(!$pages.children(":eq(0)").hasClass("sapUiPagCurrentPage"), "first page link should not be current");
			assert.ok($pages.children(":eq(2)").hasClass("sapUiPagCurrentPage"), "middle page link should be current");
			assert.ok(!$pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should not be current");
			done();
		}, 600);
	});

	QUnit.test("Trigger First (mouse)", function(assert) {
		var done = assert.async();
		assert.expect(12); // including event handler

		// click "Page 1"
		var target = oCtrl.getDomRef("-firstPageLink");
		qutils.triggerMouseEvent(target, "click");

		assert.equal(lastTargetPage, 1, "lastTargetPage should be 1 after the click event");
		assert.equal(lastSrcPage, 105, "lastTargetPage should be 105 after the  click event");
		assert.equal(lastEventType, "First", "lastEventType should be 'Back' after the click event");

		assert.equal(oCtrl.getCurrentPage(), 1, "current page should now be 1");
		setTimeout(function(){
		var $pages = oCtrl.$("pages");
			assert.equal($pages.children().length, 5, "pages ul tag should have five children");

			assert.equal($pages.children(":eq(0)").text(), "1", "first displayed page link should say '1'");
			assert.equal($pages.children(":eq(2)").text(), "3", "middle page link should say '3'");
			assert.equal($pages.children(":eq(4)").text(), "5", "last page link should say '5'");

			assert.ok($pages.children(":eq(0)").hasClass("sapUiPagCurrentPage"), "first page link should be current");
			assert.ok(!$pages.children(":eq(1)").hasClass("sapUiPagCurrentPage"), "second page link should not be current");
			assert.ok(!$pages.children(":eq(4)").hasClass("sapUiPagCurrentPage"), "last page link should not be current");
			done();
		}, 600);
	});

	QUnit.module("Keyboard handling", {
		beforeEach: function() {
			// arrange
			this.oPaginator = new Paginator({
				currentPage: 1,
				numberOfPages: 100
			});

			this.oPaginator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		getPageLink: function(oPaginator, iIndex) {
			return oPaginator.$("a--" + iIndex);
		},
		afterEach: function() {
			// cleanup
			this.oPaginator.destroy();
		}
	});

	QUnit.test("Tab chain", function(assert) {
		var oFirstPageLink = this.getPageLink(this.oPaginator, 1),
			oSecondPageLink = this.getPageLink(this.oPaginator, 2);

		oFirstPageLink.focus();
		qutils.triggerKeydown(oFirstPageLink[0], KeyCodes.ARROW_RIGHT);

		assert.strictEqual(document.activeElement, oSecondPageLink[0]);

		qutils.triggerKeydown(oSecondPageLink[0], KeyCodes.ARROW_LEFT);

		assert.strictEqual(document.activeElement, oFirstPageLink[0]);
	});

	QUnit.test("Enter", function(assert) {
		var oFirstPageLink = this.getPageLink(this.oPaginator, 1);

		oFirstPageLink.focus();
		qutils.triggerKeydown(oFirstPageLink[0], KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(document.activeElement,  KeyCodes.ENTER);

		assert.strictEqual(this.oPaginator.getCurrentPage(), 2, "Enter event should change the current page.");

	});

	QUnit.test("Enter for Paginator inside other controls", function(assert) {
		var oPaginator1 = new Paginator({
			currentPage: 1,
			numberOfPages: 100
		});

		var oDialog1 = new Dialog({
			content: [oPaginator1]
		});

		oDialog1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oDialog1.open();

		qutils.triggerKeydown(oPaginator1.$("a--2"), KeyCodes.ENTER);
		assert.strictEqual(oPaginator1.getCurrentPage(), 2, "Enter event should change the current page");

		//clean up
		oPaginator1.destroy();
		oDialog1.destroy();
	});

	QUnit.module("ARIA disabled link states", {
		beforeEach: function () {
			this.oPaginator = new Paginator({
				numberOfPages: 7,
				currentPage: 1
			});

			this.oPaginator.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.$firstPageLink = this._getLink("firstPage");
			this.$lastPageLink = this._getLink("lastPage");
			this.$forwardLink = this._getLink("forward");
			this.$backLink = this._getLink("back");
		},
		updateCurrentPage: function (iCurrentPage) {
			this.oPaginator.setCurrentPage(iCurrentPage);
			sap.ui.getCore().applyChanges();
		},
		hasAriaDisabledState: function ($element) {
			return $element.attr("aria-disabled") === "true";
		},
		_getLink: function (sLinkId) {
			var sSuffix = "-" + sLinkId + "Link";
			return this.oPaginator.$(sSuffix);
		},
		afterEach: function () {
			this.oPaginator.destroy();
			this.$firstPageLink = null;
			this.$lastPageLink = null;
			this.$forwardLink = null;
			this.$backLink = null;
		}
	});

	QUnit.test("Initial 'aria-disabled=true' state for paginator with current page 1 and 7 pages", function (assert) {
		assert.strictEqual(this.hasAriaDisabledState(this.$firstPageLink), true, "Should be added for the first page link");
		assert.strictEqual(this.hasAriaDisabledState(this.$backLink), true, "Should be added for the back link");
		assert.strictEqual(this.hasAriaDisabledState(this.$forwardLink), false, "Should not be added for the forward link");
		assert.strictEqual(this.hasAriaDisabledState(this.$lastPageLink), false, "Should not be added for the last page link");
	});

	QUnit.test("When the currentPage is updated to 7 and pages are 7 'aria-disabled=true' state", function (assert) {
		this.updateCurrentPage(7);
		assert.strictEqual(this.hasAriaDisabledState(this.$firstPageLink), false, "Should not be added for the first page link");
		assert.strictEqual(this.hasAriaDisabledState(this.$backLink), false, "Should not be added for the back link");
		assert.strictEqual(this.hasAriaDisabledState(this.$forwardLink), true, "Should be added for the forward link");
		assert.strictEqual(this.hasAriaDisabledState(this.$lastPageLink), true, "Should be added for the last page link");
	});

	QUnit.test("When the currentPage is updated to 1 and pages are 7 'aria-disabled=true' state", function (assert) {
		this.updateCurrentPage(1);
		assert.strictEqual(this.hasAriaDisabledState(this.$firstPageLink), true, "Should be added for the first page link");
		assert.strictEqual(this.hasAriaDisabledState(this.$backLink), true, "Should be added for the back link");
		assert.strictEqual(this.hasAriaDisabledState(this.$forwardLink), false, "Should not be added for the forward link");
		assert.strictEqual(this.hasAriaDisabledState(this.$lastPageLink), false, "Should not be added for the last page link");
	});

	QUnit.test("When the currentPage is updated to 3 and pages are 7 'aria-disabled=true' state", function (assert) {
		this.updateCurrentPage(3);
		assert.strictEqual(this.hasAriaDisabledState(this.$firstPageLink), false, "Should not be added for the first page link");
		assert.strictEqual(this.hasAriaDisabledState(this.$backLink), false, "Should not be added for the back link");
		assert.strictEqual(this.hasAriaDisabledState(this.$forwardLink), false, "Should not be added for the forward link");
		assert.strictEqual(this.hasAriaDisabledState(this.$lastPageLink), false, "Should not be added for the last page link");
	});
});