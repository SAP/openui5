(function ($, QUnit, sinon, Breadcrumbs) {
	"use strict";
	var core, oFactory, helpers;

	$.sap.require("sap.m.Breadcrumbs");

	sinon.config.useFakeTimers = true;

	core = sap.ui.getCore();
	oFactory = {
		getLink: function (sText, sHref) {
			return new sap.m.Link({
				text: sText || "Page 1 long link",
				href: sHref || "http://go.sap.com/index.html"
			});
		},
		getText: function (sText) {
			return new sap.m.Text({
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
			return new sap.m.Breadcrumbs({
				links: [this.getLinks(iLinkCount)],
				currentLocationText: sCurrentLocationText
			});
		},
		getResourceBundle: function () {
			return sap.uxap.i18nModel.getResourceBundle();
		}
	};

	helpers = {
		verifyFocusOnKeyDown: function (assert, iKeyCode, oItemToStartWith, oExpectedItemToBeFocused, sMessage ) {
			oItemToStartWith.$().focus();
			sap.ui.test.qunit.triggerKeydown(oItemToStartWith.getId(), iKeyCode);
			assert.ok(oExpectedItemToBeFocused.jQuery().is(':focus'), sMessage);
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
		setMobile: function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop");
			jQuery("html").addClass("sapUiMedia-Std-Phone");
			sap.ui.Device.system.desktop = false;
			sap.ui.Device.system.phone = true;
		},
		resetMobile: function () {
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone");
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
		setup: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		},
		teardown: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Instantiation", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		assert.ok(oStandardBreadCrumbsControl, "is instantiated correctly");
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, 4, "has " + 4 + " links");
	});

	QUnit.test("Changing the control dynamically", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		oStandardBreadCrumbsControl.addLink(oFactory.getLink());
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iLinksCount + 1,
			"the link is correctly added to the control");

		oStandardBreadCrumbsControl.removeLink(oStandardBreadCrumbsControl.getLinks()[0]);
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iLinksCount,
			"the link is correctly removed from the control");

		assert.throws(function () {
			oStandardBreadCrumbsControl.addLink(oFactory.getText());
		}, "an exception is thrown when trying to add an incorrect type to the links aggregation");
	});

/*There are some issuue with the sinon spy. Must be investigated.
	QUnit.test("Changing breadcrumb item that affects control size", function (assert) {
		var spy = this.spy(sap.m.Breadcrumbs.prototype, "_resetControl"),
			oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		helpers.renderObject(oStandardBreadCrumbsControl);

		oStandardBreadCrumbsControl.getLinks().forEach(function (oLink) {
			oLink.setWidth("100px");
			this.clock.tick(1000);
		}, this);

		assert.ok(spy.callCount === 4, "Handler is called");
	});*/

	QUnit.test("Current location setter", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			sNewCurrentLocationVal = "New current location value";

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "has current location text setted");
		assert.ok(oStandardBreadCrumbsControl._getCurrentLocation(), "has current location text control instantiated");

		oStandardBreadCrumbsControl.setCurrentLocationText(sNewCurrentLocationVal);
		assert.strictEqual(oStandardBreadCrumbsControl.getCurrentLocationText(), sNewCurrentLocationVal, "current location value changed to sNewCurrentLocationVal");
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


	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Mobile cases, small screen", {
		setup: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
			helpers.setMobile();
			helpers.setSmallScreenSize();
		},
		teardown: function () {
			this.oStandardBreadCrumbsControl.destroy();
			helpers.resetMobile();
			helpers.resetScreenSize();
		}
	});

	QUnit.test("Select on mobile contains all links", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		helpers.renderObject(oStandardBreadCrumbsControl);

		var aSelectItems = oStandardBreadCrumbsControl._getSelect().getItems();

		assert.ok(aSelectItems.length === 4, "All links are in select");
	});

	QUnit.test("Select has cancel button on mobile", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		assert.ok(oStandardBreadCrumbsControl._getSelect().getButtons().length, "Has one button");
	});

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Special cases", {
		teardown: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Only links", function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4);
		helpers.renderObject(this.oStandardBreadCrumbsControl );
		assert.ok(!this.oStandardBreadCrumbsControl._getCurrentLocation().getDomRef(), "Current location has no dom ref");
		var $lastSeparator = this.oStandardBreadCrumbsControl.$().find("li.sapMBreadcrumbsItem:last-child > span.sapMBreadcrumbsSeparator");

		assert.ok($lastSeparator.length, "There is a '/' separator after last link");
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
		var pickerAfterOpenSpy = this.spy(sap.m.Breadcrumbs.prototype, "_removeItemNavigation"),
				pickerBeforeCloseSpy = this.spy(sap.m.Breadcrumbs.prototype, "_restoreItemNavigation");
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(15, "Current location text");

		helpers.renderObject(this.oStandardBreadCrumbsControl);

		this.oStandardBreadCrumbsControl._getSelect().open()
		this.oStandardBreadCrumbsControl._getSelect().close()

		assert.ok(pickerAfterOpenSpy.calledOnce, "Popover after open event is handled");
		assert.ok(pickerBeforeCloseSpy.calledOnce, "Popover after before close event is handled");
	});

	QUnit.module("Breadcrumbs - private functions", {
		teardown: function () {
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
			}
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
			}
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
			}
		};
		var aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(250);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 2, "There are 2 items in the trail");
		assert.ok(aControlDistrib.aControlsForSelect.length === 2, "There are 2 items in the breadcrumb");
	});
}(jQuery, QUnit, sinon, sap.m.Breadcrumbs));
