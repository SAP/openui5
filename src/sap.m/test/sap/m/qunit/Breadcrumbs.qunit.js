/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/dom/units/Rem",
	"sap/ui/core/theming/Parameters",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
],
function(qutils, DomUnitsRem, Parameters, Breadcrumbs, Link, Text, library, oCore, jQuery, Device) {
	"use strict";
	var core, oFactory, helpers;



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
			return oCore.getLibraryResourceBundle("sap.m");
		}
	};

	helpers = {
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
		controlIsInTheDom: function (oControl){
			return !!oControl.getDomRef();
		},
		setMobile: function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop").addClass("sapUiMedia-Std-Phone");
			Device.system.desktop = false;
			Device.system.phone = true;
		},
		resetMobile: function () {
			jQuery("html").addClass("sapUiMedia-Std-Desktop").removeClass("sapUiMedia-Std-Phone");
			Device.system.desktop = true;
			Device.system.phone = false;
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

		assert.ok(helpers.controlIsInTheDom(oSecondLink), "Initially the link is visible and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);

		oSecondLink.setVisible(false);
		helpers.waitForUIUpdates();

		assert.ok(!helpers.controlIsInTheDom(oSecondLink), "The link is not visible and not in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 4);

		oSecondLink.setVisible(true);
		helpers.waitForUIUpdates();

		assert.ok(helpers.controlIsInTheDom(oSecondLink), "The link is visible again and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);
	});

	QUnit.test("Current location setter", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			sNewCurrentLocationVal = "New current location value";

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "has current location text setted");
		assert.ok(oStandardBreadCrumbsControl._getCurrentLocation(), "has current location text control instantiated");
		assert.ok(oStandardBreadCrumbsControl._getCurrentLocation().hasStyleClass("sapMBreadcrumbsCurrentLocation"), "current location has a correct class");

		oStandardBreadCrumbsControl.setCurrentLocationText(sNewCurrentLocationVal);
		assert.strictEqual(oStandardBreadCrumbsControl.getCurrentLocationText(), sNewCurrentLocationVal, "current location value changed to sNewCurrentLocationVal");
	});

	QUnit.test("Instantiation", function (assert) {
		var oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(0, null),
			$currentLocationText;

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		oCore.applyChanges();

		$currentLocationText = oStandardBreadCrumbsControl.$("currentText");
		assert.strictEqual($currentLocationText.length, 0, "has " + 0 + " links");

		oStandardBreadCrumbsControl.setCurrentLocationText("Test");
		oCore.applyChanges();

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

	var testSeparatorStyleSymbols = function (oControl, sStyle, assert) {
		//arrange
		var sAppliedSymbol,
			sExpectedSymbol;

		oControl.setSeparatorStyle(sStyle);
		oCore.applyChanges();

		//act
		sAppliedSymbol = oControl.$().find(".sapMBreadcrumbsSeparator").first().text();
		sExpectedSymbol = Breadcrumbs.STYLE_MAPPER[oControl.getSeparatorStyle()];

		// assert
		assert.equal(sAppliedSymbol, sExpectedSymbol, sStyle + " separator loaded");
	};

	QUnit.test("Custom separator (String Rendering)", function (assert) {
		Object.keys(library.BreadcrumbsSeparatorStyle).forEach( function (sStyle) {
			// arrange
			// using a new control each time enforces initial string rendering
			var oControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
			oControl.placeAt("qunit-fixture");

			// assert
			testSeparatorStyleSymbols(oControl, sStyle, assert);

			// clean up
			oControl.destroy();
			oCore.applyChanges();
		} );
	});

	QUnit.test("Custom separator (DOM Patching)", function (assert) {
		//arrange
		var oControl = this.oStandardBreadCrumbsControl;
		oControl.placeAt("qunit-fixture");
		// initial rendering is always string rendering, later re-renderings will use DOM patching
		oCore.applyChanges();

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

	QUnit.test("Select on mobile contains only links with visible true", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			oSecondLink = oStandardBreadCrumbsControl.getLinks()[0],
			iItemsLengthA,
			iItemsLengthB;

		iItemsLengthA = oStandardBreadCrumbsControl._getItemsForMobile().length;
		oSecondLink.setVisible(false);
		iItemsLengthB = oStandardBreadCrumbsControl._getItemsForMobile().length;

		assert.ok(iItemsLengthB === iItemsLengthA - 1, "All links with visible true are returned");
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

	QUnit.test("No invalidation when creating the select", function (assert) {
		var createSelectSpy = this.spy(Breadcrumbs.prototype, "_getSelect"),
			afterRenderingSpy = this.spy(Breadcrumbs.prototype, "onAfterRendering"),
			invalidateSpy = this.spy(Breadcrumbs.prototype, "invalidate");
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(15, "Current location text");

		this.oStandardBreadCrumbsControl.addEventDelegate({
			onBeforeRendering: function() {
				invalidateSpy.resetHistory();
			}
		});

		// Act
		helpers.renderObject(this.oStandardBreadCrumbsControl);

		// Check if invalidation upon select creation during rendering
		assert.ok(createSelectSpy.calledBefore(afterRenderingSpy), "select is created during rendering");
		assert.ok(invalidateSpy.notCalled, "breadcrumb is not invalidated during rendering");
	});

	QUnit.test("Prevent width rounding issues", function (assert) {

		var oLink1 = new Link({text: "Sales Organization"}),
			oLink2 = new Link({text: "Order Type"}),
			iSumOfContentWidths,
			iContainerWidth;
		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		helpers.renderObject(this.oStandardBreadCrumbsControl);

		this.stub(this.oStandardBreadCrumbsControl, "$").callsFake(function() {
			return {
				"outerWidth": function(){ return 208;}
			};
		});
		this.stub(oLink1, "$").callsFake(function() {
			return {
				"parent": function() {
					return {
						"outerWidth": function(){ return 128;}
					};
				}
			};
		});
		this.stub(oLink2, "$").callsFake(function() {
			return {
				"parent": function() {
					return {
						"outerWidth": function(){ return 81;}
					};
				}
			};
		});

		iSumOfContentWidths = oLink1.$().parent().outerWidth() + oLink2.$().parent().outerWidth();
		iContainerWidth = this.oStandardBreadCrumbsControl.$().outerWidth();

		// assert mocked setup (when we have a rounding issue)
		assert.strictEqual(iSumOfContentWidths, iContainerWidth + 1, "sum of the widths of the children exceeds the container width by 1");

		this.oStandardBreadCrumbsControl._resetControl();
		this.oStandardBreadCrumbsControl.rerender();

		assert.equal(this.oStandardBreadCrumbsControl._getSelect().getVisible(), false, "select is not shown");
	});

	QUnit.test("Skip overflow recalculations when no width change", function (assert) {
		var oLink1 = new Link({text: "link1"}),
			oLink2 = new Link({text: "link2"}),
			oSpy;
		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		helpers.renderObject(this.oStandardBreadCrumbsControl);

		oSpy = this.spy(this.oStandardBreadCrumbsControl, "_getControlDistribution");

		// Act
		this.oStandardBreadCrumbsControl._handleScreenResize({
			size: { width: 100},
			oldSize: { width: 100}
		});

		assert.notOk(oSpy.called, "skipped overflow recalculations");
	});

	QUnit.test("Skip overflow recalculations when new width is 0", function (assert) {
		// Arrange
		var oLink1 = new Link({text: "link1"}),
			oLink2 = new Link({text: "link2"}),
			oSpy;

		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		helpers.renderObject(this.oStandardBreadCrumbsControl);

		oSpy = this.spy(this.oStandardBreadCrumbsControl, "_getControlDistribution");

		// Act
		this.oStandardBreadCrumbsControl._handleScreenResize({
			size: { width: 0 },
			oldSize: { width: 100}
		});

		// Assert
		assert.ok(oSpy.notCalled, "Skipped overflow recalculations");

		// Clean up
		this.oStandardBreadCrumbsControl.destroy();
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

	QUnit.test("Screen reader support", function ( assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			sExpectedText = oStandardBreadCrumbsControl._getInvisibleText().getId();

		helpers.renderObject(oStandardBreadCrumbsControl);
		assert.strictEqual(oStandardBreadCrumbsControl.$()[0].tagName, "NAV", "Breadcrumbs is rendered in nav HTML element");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("aria-labelledby"), sExpectedText, "has correct 'aria-labelledby'");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("role"), undefined, "Role shouldn't be defined for the nav element");

		oStandardBreadCrumbsControl.$().find("li").each(function (index, item) {
			assert.strictEqual(jQuery(item).attr("role"), undefined, "Role shouldn't be defined for the li element");
		});
	});

	QUnit.test("Position and size of the items", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			oCurrentLocation = oStandardBreadCrumbsControl._getCurrentLocation(),
			oLinks = oStandardBreadCrumbsControl._getControlsForBreadcrumbTrail(),
			oFirstLink = oLinks[0],
			aAriaLabelledByFirstLink,
			oInvisibleTextData;

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		oCore.applyChanges();

		aAriaLabelledByFirstLink = oFirstLink.getAriaLabelledBy();
		oInvisibleTextData = oStandardBreadCrumbsControl._aCachedInvisibleTexts.find(function (oItem) {
			return oItem.controlId === oFirstLink.getId();
		});

		assert.strictEqual(oInvisibleTextData.invisibleText.getText(), "1 of " + oLinks.length, "Announcement is correct");
		assert.ok(aAriaLabelledByFirstLink.includes(oInvisibleTextData.invisibleText.getId()), "Announcement is correct");

		assert.ok(oCurrentLocation.$().attr("aria-label").indexOf(oLinks.length + " of " + oLinks.length) > -1, "Aria label is correct");
	});

	QUnit.test("Current location aria attributes", function (assert) {
		// Arrange
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			oCurrentLocation = oStandardBreadCrumbsControl._getCurrentLocation();

		// Act
		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		helpers.waitForUIUpdates();

		// Assert
		assert.strictEqual(oCurrentLocation.$().attr("aria-current"), "page", "Current location should have correct aria attribute");
		assert.strictEqual(oCurrentLocation.$().attr("role"), "link", "Current location should have correct role attribute");
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

	QUnit.test("Current location focus restored", function (assert) {
		// Arrange
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			oCurrentLocation = oStandardBreadCrumbsControl._getCurrentLocation();

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		oCore.applyChanges();
		// Act
		oCurrentLocation.focus();
		// Assert
		assert.equal(document.activeElement, oCurrentLocation.getDomRef(), "Focus on the current location element");
		// Act
		oStandardBreadCrumbsControl.addLink(new Link({text: "New Test Link"}));
		oCore.applyChanges();
		// Assert
		assert.equal(document.activeElement, oCurrentLocation.getDomRef(), "Focus is correctly restored");

	});

	QUnit.test("ARIA labelledBy", function(assert) {
		var oBreadcrumbsControl = new Breadcrumbs({
			ariaLabelledBy: "id1"
		});

		oBreadcrumbsControl.placeAt("qunit-fixture");
		core.applyChanges();

		assert.strictEqual(oBreadcrumbsControl.getAriaLabelledBy().join(""), "id1", "aria-labelledby is set correctly");

		oBreadcrumbsControl.destroy();
	});

	QUnit.module("Internal ItemNavigation");

	QUnit.test("alt/meta key + right/left or + home/end is not handled", function (assert) {
		// Prepare
		var oBreadcrumbs = new Breadcrumbs(),
		oModifiers;

		// Act
		oBreadcrumbs._configureKeyboardHandling();

		// Assert
		var oModifiers = oBreadcrumbs._getItemNavigation().getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "right is not handled when alt is pressed");
		assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "right is not handled when meta key is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "left is not handled when alt is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "left is not handled when meta key is pressed");

		// Cleanup
		oBreadcrumbs.destroy();
	});

	QUnit.module("OverflowToolbar configuration");

	QUnit.test("OverflowToolbar configuration is set correctly", function (assert) {
		var oBreadcrumbs = new Breadcrumbs(),
			oConfig = oBreadcrumbs.getOverflowToolbarConfig();

		assert.ok(oConfig.canOverflow, "canOverflow is set to true");
		assert.equal(typeof oConfig.getCustomImportance, "function", "getCustomImportance function is set");
		assert.equal(oConfig.getCustomImportance(), "High", "customImportance is set to 'High'");
	});
});
