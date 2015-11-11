(function ($, QUnit, sinon) {
	"use strict";


	sinon.config.useFakeTimers = true;
	var core = sap.ui.getCore(),
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
				var aLinks = [];

				for (var i = 0; i < iCount; i++) {
					aLinks.push(this.getLink());
				}

				return aLinks;
			},
			getBreadCrumbControlWithLinks: function (iLinkCount) {
				return new sap.uxap.BreadCrumbs({
					links: [this.getLinks(iLinkCount)],
					currentLocation: oFactory.getText()
				});
			},
			getResourceBundle: function () {
				return sap.uxap.i18nModel.getResourceBundle();
			}
		},
		helpers = {
			verifyFocusOnKeyDown: function (assert, iKeyCode, oItemToStartWith, oExpectedItemToBeFocused, sMessage) {
				oItemToStartWith.$().focus();
				sap.ui.test.qunit.triggerKeydown(oItemToStartWith.getId(), iKeyCode);
				assert.ok(oExpectedItemToBeFocused.$().is(':focus'), sMessage);
			},
			renderObject: function (oSapUiObject) {
				oSapUiObject.placeAt("qunit-fixture");
				core.applyChanges();
				return oSapUiObject;
			},
			checkType: function (assert, fnConstructor, oObjectToCheck, sMessage) {
				assert.strictEqual(oObjectToCheck instanceof fnConstructor, true, sMessage);
			},
			objectIsInTheDom: function (sSelector) {
				var $object = $(sSelector);
				return $object.length > 0;
			},
			_stubBreadcrumbsAsJQueryObject: function (iReturnHeight, oBreadcrumbsControl) {
				oBreadcrumbsControl._getBreadcrumbsAsJQueryObject = function () {
					return {
						css: function (property, value) {
							oBreadcrumbsControl[property] = value;
						},
						removeClass: function () {
						},
						addClass: function () {
						},
						outerHeight: function () {
							return iReturnHeight || 20;
						}
					};
				};
			}
		};

	QUnit.module("BreadCrumbs - API", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4);
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Instantiation", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		assert.ok(oStandardBreadCrumbsControl, "is instantiated correctly");
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iLinksCount, "has " + iLinksCount + " links");
	});

	QUnit.test("Changing the control dynamically", function (assert) {
		var oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl,
			iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		oStandardBreadCrumbsControl.addLink(oFactory.getLink());
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iLinksCount + 1,
			"the link is correctly added to the control");

		oStandardBreadCrumbsControl.removeLink(1);
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iLinksCount,
			"the link is correctly removed from the control");

		assert.throws(function () {
			oStandardBreadCrumbsControl.addLink(new oFactory.getText());
		}, "an exception is thrown when trying to add an incorrect type to the links aggregation");

		assert.throws(function () {
			oStandardBreadCrumbsControl.setCurrentLocation(new oFactory.getLink());
		}, "an exception is thrown when trying to set an incorrect type to currentLocation");
	});

	QUnit.module("BreadCrumbs - Internals", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4);
			this.sResultMessage = "an object is returned from the function";
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Creating the internal icon for link separation", function (assert) {
		var oBreadCrumbControl = this.oStandardBreadCrumbsControl,
			oTubeIcon = oBreadCrumbControl._getTubeIcon();

		assert.ok(oTubeIcon, "an object is returned from the function");
		helpers.checkType(assert, sap.ui.core.Icon, oTubeIcon, "the tube separator is an Icon");
		assert.strictEqual(oTubeIcon.getSrc(), "sap-icon://slim-arrow-right", "a correct icon is used");
		assert.strictEqual(oTubeIcon.getColor(), "#bfbfbf", "the correct color is selected");
		assert.strictEqual(oTubeIcon.getSize(), "1rem", "the correct size of 1rem is used");
	});

	QUnit.test("Creating the internal select for the overflown version of the control", function (assert) {
		var oBreadCrumbControl = this.oStandardBreadCrumbsControl,
			oOverflowSelect = oBreadCrumbControl._getOverflowSelect();

		assert.ok(oOverflowSelect, this.sResultMessage);
		helpers.checkType(assert, sap.m.Select, oOverflowSelect, "the OverflownSelect is an sap.m.Select");
		assert.strictEqual(oOverflowSelect.getItems().length, oBreadCrumbControl.getLinks().length + 1,
			"the select has all of the items from the normal version of the control");

		var oLink = oFactory.getLink(),
			oText = oFactory.getText(),
			oSelectItem = oBreadCrumbControl._createSelectItem(oLink),
			oCurrentlySelectedItem = oBreadCrumbControl._createSelectItem(oText);

		assert.ok(oSelectItem, this.sResultMessage);
		helpers.checkType(assert, sap.ui.core.Item, oSelectItem, "the selectItem is an sap.ui.core.Item");

		assert.ok(oCurrentlySelectedItem, this.sResultMessage);
		helpers.checkType(assert, sap.ui.core.Item, oCurrentlySelectedItem,
			"the oCurrentlySelectedItem is an sap.ui.core.Item");
	});

	QUnit.test("Mode state selection", function (assert) {
		var oBreadCrumbControl = this.oStandardBreadCrumbsControl;

		helpers._stubBreadcrumbsAsJQueryObject(60, oBreadCrumbControl);

		assert.strictEqual(oBreadCrumbControl._shouldOverflow(), true,
			"when there's not enough space the control should go into overflow select mode");

		helpers._stubBreadcrumbsAsJQueryObject(20, oBreadCrumbControl);

		assert.strictEqual(oBreadCrumbControl._shouldOverflow(), false,
			"given enough space the control should not go into overflow select mode");

		assert.ok(!oBreadCrumbControl.visibility,
			"after' _shouldOverflow' is called the visibility of the control should be restored");
	});

	QUnit.test("On phone always show overflowSelect", function (assert) {
		var oBreadCrumbControl = this.oStandardBreadCrumbsControl;
		sap.ui.Device.system.phone = true;
		oBreadCrumbControl.onBeforeRendering();
		oBreadCrumbControl._handleInitialModeSelection();
		assert.ok(oBreadCrumbControl._getUsingOverflowSelect());
	});

	QUnit.module("BreadCrumbs - Rendering", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oBreadCrumbs = oFactory.getBreadCrumbControlWithLinks(2);
			helpers.renderObject(this.oBreadCrumbs);
			this.$breadCrumbs = this.oBreadCrumbs.$();
		},
		afterEach: function () {
			this.oBreadCrumbs.destroy();
		},
		baseCaseTests: function (assert) {
			assert.ok(helpers.objectIsInTheDom("#" + this.oBreadCrumbs.getId()),
				"the breadcrumb control is in the DOM");
			assert.ok(this.$breadCrumbs.hasClass("sapUxAPBreadCrumbs"),
				"the breadcrumb control has the correct CSS class");
		}
	});

	QUnit.test("The control is rendered in standard mode", function (assert) {
		this.baseCaseTests(assert);
	});

	QUnit.test("The control is rendered in overflow mode", function (assert) {
		this.baseCaseTests(assert);
		this.oBreadCrumbs._bUseOverflowSelect = true;
		this.oBreadCrumbs.rerender();

		var $breadCrumbs = this.oBreadCrumbs.$(),
			$overflowDots = $breadCrumbs.find("span.sapUxAPBreadCrumbsDots"),
			$overflowSelect = $breadCrumbs.find(".sapMSlt");

		assert.ok($overflowDots.length, "the overflow dots are rendered");
		assert.ok($overflowSelect.length, "the overflowSelect is rendered ");
	});

	QUnit.test("Changing the state of visibility of the breadcrumb", function (assert) {
		var oBreadCrumbControl = this.oBreadCrumbs,
			$BreadCrumbControl = oBreadCrumbControl.$(),
			$breadcrumbs = oBreadCrumbControl._getBreadcrumbsAsJQueryObject();

		oBreadCrumbControl._setBreadcrumbsVisible(true);

		assert.ok(!$breadcrumbs.hasClass("sapUiHidden"));
		assert.ok(!$BreadCrumbControl.hasClass("sapUxAPFullWidth"));

		oBreadCrumbControl._setBreadcrumbsVisible(false);

		assert.ok($breadcrumbs.hasClass("sapUiHidden"));
		assert.ok($BreadCrumbControl.hasClass("sapUxAPFullWidth"));
	});

	QUnit.test("Changing the state of visibility of the select", function (assert) {
		var oBreadCrumbControl = this.oBreadCrumbs,
			$select = oBreadCrumbControl._getOverflowSelectAsJQueryObject();

		oBreadCrumbControl._setSelectVisible(false);

		assert.ok($select.hasClass("sapUiHidden"));

		oBreadCrumbControl._setSelectVisible(true);

		assert.ok(!$select.hasClass("sapUiHidden"));
	});

	QUnit.module("BreadCrumbs - Accessibility", {
		beforeEach: function () {
			sap.ui.Device.system.phone = false;
			this.oBreadCrumbs = oFactory.getBreadCrumbControlWithLinks(10);
			helpers.renderObject(this.oBreadCrumbs);
			this.$breadCrumbs = this.oBreadCrumbs.$();
		},
		afterEach: function () {
			this.oBreadCrumbs.destroy();
		},
		baseCaseTests: function (assert) {
			assert.ok(helpers.objectIsInTheDom("#" + this.oBreadCrumbs.getId()), "the breadcrumb control is in the DOM");
			assert.ok(this.$breadCrumbs.hasClass("sapUxAPBreadCrumbs"),
				"the breadcrumb control has the correct CSS class");
		}
	});

	QUnit.test("Screen reader support", function (assert) {
		assert.strictEqual(this.$breadCrumbs.attr("role"), "navigation",
			"BreadCrumbs have appropriate ARIA role set");
	});

	QUnit.test("BreadCrumbs receives correct AriaLabelledBy", function (assert) {
		var oBreadCrumbControl = this.oBreadCrumbs,
			oHiddenLabel = oBreadCrumbControl._getAriaLabelledBy(),
			sLabelText = oFactory.getResourceBundle().getText("BREADCRUMB_TRAIL_LABEL");

		assert.strictEqual(oHiddenLabel.getText(), sLabelText,
			"The AriaLabelledBy element is set a hidden label is created with the correct text");

		assert.strictEqual(this.$breadCrumbs.attr("aria-labelledby"), oHiddenLabel.getId(),
			"The 'aria-labelledby' attribute is correctly set to the control");
	});

	QUnit.test("PAGE DOWN/PAGE UP keyboard handling", function (assert) {
		var oBreadCrumbControl = this.oBreadCrumbs,
			iItemSkipSize = sap.uxap.BreadCrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE,
			oItemsToNavigate = oBreadCrumbControl._getItemsToNavigate(),
			iTotalItemCount = oItemsToNavigate.length;

		oBreadCrumbControl._toggleOverflowMode(false);

		helpers.verifyFocusOnKeyDown(assert, jQuery.sap.KeyCodes.PAGE_DOWN, oItemsToNavigate[0],
			oItemsToNavigate[iItemSkipSize], "5th item down should be focused after PAGE DOWN");

		helpers.verifyFocusOnKeyDown(assert, jQuery.sap.KeyCodes.PAGE_UP, oItemsToNavigate[10],
			oItemsToNavigate[10 - iItemSkipSize], "5th item up should be focused after PAGE UP");

		helpers.verifyFocusOnKeyDown(assert, jQuery.sap.KeyCodes.PAGE_DOWN, oItemsToNavigate[iTotalItemCount - 3],
			oItemsToNavigate[iTotalItemCount - 1], "Last item down should be focused after PAGE DOWN");

		helpers.verifyFocusOnKeyDown(assert, jQuery.sap.KeyCodes.PAGE_UP, oItemsToNavigate[3],
			oItemsToNavigate[0], "Last item down should be focused after PAGE DOWN");
	});
})(jQuery, QUnit, sinon);
