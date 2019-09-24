/*global QUnit */
sap.ui.define([
	"sap/ui/dom/units/Rem",
	"sap/ui/core/theming/Parameters",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/library"
],
function(DomUnitsRem, Parameters, Breadcrumbs, Link, Text, library) {
	"use strict";
	var core, oFactory, helpers, $ = jQuery;



	core = sap.ui.getCore();
	oFactory = {
		getLink: function (sText, sHref) {
			return new Link({
				text: sText || "Page 1 long link",
				href: sHref || "http://go.sap.com/index.html"
			});
		},
		getText: function (sText) {
			return new Text({
				text: sText || "Current Location Text"
			});
		},
		getLinks: function (iCount) {
			var aLinks = [],
				i;

			for (i = 0; i < iCount; i++) {
				aLinks.push(this.getLink());
			}

			return aLinks;
		},
		getBreadCrumbControlWithLinks: function (iLinkCount, sCurrentLocationText) {
			return new Breadcrumbs({
				links: [this.getLinks(iLinkCount)],
				currentLocationText: sCurrentLocationText
			});
		},
		getResourceBundle: function () {
			return sap.ui.getCore().getLibraryResourceBundle("sap.m");
		}
	};

	helpers = {
		verifyFocusOnKeyDown: function (assert, iKeyCode, oItemToStartWith, oExpectedItemToBeFocused, sMessage) {
			oItemToStartWith.$().focus();
			sap.ui.test.qunit.triggerKeydown(oItemToStartWith.getId(), iKeyCode);
			assert.ok(oExpectedItemToBeFocused.jQuery().is(':focus'), sMessage);
		},
		waitForUIUpdates: function (){
			core.applyChanges();
		},
		countChildren: function (oControl){
			return oControl.$().find("li").length;
		},
		renderObject: function (oSapUiObject) {
			oSapUiObject.placeAt("qunit-fixture");
			core.applyChanges();
			return oSapUiObject;
		},
		objectIsInTheDom: function (sSelector) {
			var $object = $(sSelector);
			return $object.length > 0;
		},
		controlIsInTheDom: function (oControl){
			return !!oControl.getDomRef();
		},
		setMobile: function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop").addClass("sapUiMedia-Std-Phone");
			sap.ui.Device.system.desktop = false;
			sap.ui.Device.system.phone = true;
		},
		resetMobile: function () {
			jQuery("html").addClass("sapUiMedia-Std-Desktop").removeClass("sapUiMedia-Std-Phone");
			sap.ui.Device.system.desktop = true;
			sap.ui.Device.system.phone = false;
		},
		setSmallScreenSize: function () {
			jQuery("#qunit-fixture").css("width", "50px");
		},
		resetScreenSize: function () {
			jQuery("#qunit-fixture").css("width", "");
		}
	};

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - API", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Instantiation", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		assert.ok(oStandardBreadCrumbsControl, "is instantiated correctly");
		assert.strictEqual(iLinksCount, 4, "has " + 4 + " links");
	});

	QUnit.test("Changing the control dynamically", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iExpectedLinkCount = oStandardBreadCrumbsControl.getLinks().length,
			oRemovedLink,
			oNewLink;

		oStandardBreadCrumbsControl.addLink(oFactory.getLink());
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly added to the control");

		oNewLink = oFactory.getLink();
		oStandardBreadCrumbsControl.insertLink(oNewLink, 2);
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is inserted correctly");

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks()[2], oNewLink,
			"the link is correctly inserted at position 2");

		oNewLink = oFactory.getLink();
		oStandardBreadCrumbsControl.insertLink(oNewLink);
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is inserted correctly");

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks()[0], oNewLink,
			"the link is correctly inserted at the beginning of the array");

		oStandardBreadCrumbsControl.removeLink(oStandardBreadCrumbsControl.getLinks()[0]);
		iExpectedLinkCount--;
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly removed from the control");

		oRemovedLink = oStandardBreadCrumbsControl.getLinks()[1];
		oStandardBreadCrumbsControl.removeLink(1);
		iExpectedLinkCount--;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly removed from the control using its index");

		assert.ok(oStandardBreadCrumbsControl.getLinks().indexOf(oRemovedLink) === -1,
			"the link is correctly removed from the control using its index");

		assert.throws(function () {
			oStandardBreadCrumbsControl.addLink(oFactory.getText());
		}, "an exception is thrown when trying to add an incorrect type to the links aggregation");
	});

	QUnit.test("Toggling the links' visibility", function (assert) {
		var oBreadcrumbsControl = this.oStandardBreadCrumbsControl,
			oSecondLink = oBreadcrumbsControl.getLinks()[1];

		helpers.renderObject(oBreadcrumbsControl);

		assert.ok(helpers.objectIsInTheDom(oSecondLink), "Initially the link is visible and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);

		oSecondLink.setVisible(false);
		helpers.waitForUIUpdates();

		assert.ok(!helpers.controlIsInTheDom(oSecondLink), "The link is not visible and not in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 4);

		oSecondLink.setVisible(true);
		helpers.waitForUIUpdates();

		assert.ok(helpers.objectIsInTheDom(oSecondLink), "The link is visible again and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);
	});

	QUnit.test("Current location setter", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			sNewCurrentLocationVal = "New current location value";

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "has current location text setted");
		assert.ok(oStandardBreadCrumbsControl._getCurrentLocation(), "has current location text control instantiated");

		oStandardBreadCrumbsControl.setCurrentLocationText(sNewCurrentLocationVal);
		assert.strictEqual(oStandardBreadCrumbsControl.getCurrentLocationText(), sNewCurrentLocationVal, "current location value changed to sNewCurrentLocationVal");
	});

	QUnit.test("Instantiation", function (assert) {
		var oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(0, null),
			$currentLocationText;

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		$currentLocationText = oStandardBreadCrumbsControl.$("currentText");
		assert.strictEqual($currentLocationText.length, 0, "has " + 0 + " links");

		oStandardBreadCrumbsControl.setCurrentLocationText("Test");
		sap.ui.getCore().applyChanges();

		$currentLocationText = oStandardBreadCrumbsControl.$("currentText");
		assert.strictEqual($currentLocationText.length, 1, "has " + 1 + " links");
	});

	QUnit.test("Current location not set", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		oStandardBreadCrumbsControl.setCurrentLocationText("");

		helpers.renderObject(oStandardBreadCrumbsControl);
		assert.ok(!oStandardBreadCrumbsControl._getCurrentLocation().getDomRef(), "When empty string is set the text control is not rendered");
	});

	QUnit.test("Select aggregation", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		helpers.setSmallScreenSize();
		helpers.renderObject(oStandardBreadCrumbsControl);
		assert.ok(oStandardBreadCrumbsControl._getSelect().getDomRef(), "Select is rendered");

		helpers.resetScreenSize();
	});

	QUnit.test("Select width", function (assert) {
		// arrange
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		helpers.setSmallScreenSize();
		helpers.renderObject(oStandardBreadCrumbsControl);

		// assert
		assert.ok(oStandardBreadCrumbsControl._getSelectWidth() > 0, "Select is rendered");

		// act
		oStandardBreadCrumbsControl.getAggregation("_select").setVisible(false);

		// assert
		assert.ok(oStandardBreadCrumbsControl._getSelectWidth() === 0, "Select is not rendered");
	});

	// Helper method to convert HTML Entity sybol to its numeric character
	var entityToCharCode = function (sEntity) {
		return sEntity.replace(/&#(\d{0,4});/g,
			function(sFullEntity, sNumericPart) { return String.fromCharCode(sNumericPart); });
	};

	var testSeparatorStyleSymbols = function (oControl, sStyle, assert) {
		//arrange
		var sAppliedSymbol,
			sExpectedSymbol;

		oControl.setSeparatorStyle(sStyle);
		sap.ui.getCore().applyChanges();

		//act
		sAppliedSymbol = oControl.$().find(".sapMBreadcrumbsSeparator").first().html();
		sExpectedSymbol = entityToCharCode(Breadcrumbs.STYLE_MAPPER[oControl.getSeparatorStyle()]);

		// assert
		assert.equal(sExpectedSymbol, sAppliedSymbol, sStyle + " separator loaded");
	};

	QUnit.test("Custom separator", function (assert) {
		//arrange
		var oControl = this.oStandardBreadCrumbsControl;
		oControl.placeAt("qunit-fixture");
		//assert
		Object.keys(library.BreadcrumbsSeparatorStyle).forEach( function (sStyle) {
			testSeparatorStyleSymbols(oControl, sStyle, assert);
		} );
	});

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Mobile cases, small screen", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
			helpers.setMobile();
			helpers.setSmallScreenSize();
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
			helpers.resetMobile();
			helpers.resetScreenSize();
		}
	});

	QUnit.test("Select on mobile contains all links with no current location text", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		oStandardBreadCrumbsControl.setCurrentLocationText("");
		helpers.renderObject(oStandardBreadCrumbsControl);

		var aSelectItems = oStandardBreadCrumbsControl._getSelect().getItems();

		assert.ok(!oStandardBreadCrumbsControl.getCurrentLocationText(), "There's no current location text set");
		assert.ok(aSelectItems.length === 4, "All links are in select, but no current location item");
	});

	QUnit.test("Select on mobile contains all links with current location text", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		helpers.renderObject(oStandardBreadCrumbsControl);

		var aSelectItems = oStandardBreadCrumbsControl._getSelect().getItems();

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "There's current location text set");
		assert.ok(aSelectItems.length === 5, "All links are in select along with the currrent location item");
	});

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Special cases", {
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Only links", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4);
		helpers.renderObject(this.oStandardBreadCrumbsControl);
		assert.ok(!this.oStandardBreadCrumbsControl._getCurrentLocation().getDomRef(), "Current location has no dom ref");
		var $lastSeparator = this.oStandardBreadCrumbsControl.$().find("li.sapMBreadcrumbsItem:last-child > span.sapMBreadcrumbsSeparator");

		assert.ok($lastSeparator.length, "There is a '/' separator after last link");
		assert.strictEqual(Math.ceil(parseFloat($lastSeparator.css("fontSize"))),
			DomUnitsRem.toPx(Parameters.get("sapMFontMediumSize")),
			"Font-size of the separator is 14px");
	});

	QUnit.test("Only current location", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(0, "Current location text");

		helpers.setSmallScreenSize();
		helpers.renderObject(this.oStandardBreadCrumbsControl);
		assert.ok(this.oStandardBreadCrumbsControl._getCurrentLocation().getDomRef(), "Current location is rendered");
		assert.ok(!this.oStandardBreadCrumbsControl._getSelect().getDomRef(), "No Select icon");
		helpers.resetScreenSize();
	});

	QUnit.test("Prevent dependency bug with select's popover", function (assert) {
		var pickerAfterOpenSpy = this.spy(Breadcrumbs.prototype, "_removeItemNavigation"),
			pickerBeforeCloseSpy = this.spy(Breadcrumbs.prototype, "_restoreItemNavigation");
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(15, "Current location text");

		helpers.renderObject(this.oStandardBreadCrumbsControl);

		this.oStandardBreadCrumbsControl._getSelect().open();
		this.oStandardBreadCrumbsControl._getSelect().close();

		assert.ok(pickerAfterOpenSpy.calledOnce, "Popover after open event is handled");
		assert.ok(pickerBeforeCloseSpy.calledOnce, "Popover after before close event is handled");
	});

	QUnit.module("Breadcrumbs - private functions", {
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});


	QUnit.test("_determineControlDistribution - all items in breadcrumb", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		var aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(300);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 3, "Trail has 3 items");
		assert.ok(aControlDistrib.aControlsForSelect.length === 0, "There is no select items");
	});

	QUnit.test("_determineControlDistribution - all items in select", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		var aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(60);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 1, "There must be always one item in the trail");
		assert.ok(aControlDistrib.aControlsForSelect.length === 2, "Select has 2 items");
	});

	QUnit.test("_determineControlDistribution - equal select and breadcrumb items", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		var aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(250);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 2, "There are 2 items in the trail");
		assert.ok(aControlDistrib.aControlsForSelect.length === 2, "There are 2 items in the breadcrumb");
	});


	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Accessibility", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Screen reader support", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			sExpectedText = oFactory.getResourceBundle().getText("BREADCRUMB_LABEL");

		helpers.renderObject(oStandardBreadCrumbsControl);
		assert.strictEqual(oStandardBreadCrumbsControl.$()[0].tagName, "NAV", "Breadcrumbs is rendered in nav HTML element");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("aria-label"), sExpectedText, "has correct 'aria-label'");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("role"), undefined, "Role shouldn't be defined for the nav element");

		oStandardBreadCrumbsControl.$().find("li").each(function (index, item) {
			assert.strictEqual(jQuery(item).attr("role"), undefined, "Role shouldn't be defined for the li element");
		});
	});

	QUnit.test("Keyboard Handling", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		helpers.renderObject(oStandardBreadCrumbsControl);
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("tabindex"), "0", "Default tabindex 0 should be set");

		// Act - make the inside elements of the control empty
		oStandardBreadCrumbsControl.setCurrentLocationText("");
		oStandardBreadCrumbsControl.removeAllLinks();
		helpers.waitForUIUpdates();

		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("tabindex"), undefined, "Tabindex should not be set for empty breadcrumbs");
	});
});
