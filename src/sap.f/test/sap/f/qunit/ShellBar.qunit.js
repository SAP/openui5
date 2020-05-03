/* global QUnit, sinon */

sap.ui.define([
	"sap/f/SearchManager",
	"sap/f/ShellBar",
	"sap/f/shellBar/Factory",
	"sap/f/ShellBarRenderer",
	"sap/f/shellBar/ResponsiveHandler",
	"sap/f/shellBar/AdditionalContentSupport",
	"sap/f/shellBar/ContentButton",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarButton",
	"sap/ui/core/theming/Parameters",
	"sap/f/Avatar",
	"sap/m/Menu",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
],
function (
	SearchManager,
	ShellBar,
	Factory,
	ShellBarRenderer,
	ResponsiveHandler,
	AdditionalContentSupport,
	ContentButton,
	ToolbarSpacer,
	OverflowToolbarButton,
	Parameters,
	Avatar,
	Menu,
	Core,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var _getVisibleControlsCount = function (oControl) {
		var iVisibleControls = 0;

		oControl._aControls.forEach(function (oItem) {
			iVisibleControls += oItem.$().css("visibility") === "visible" ? 1 : 0 ;
		});

		return iVisibleControls;
	};

	QUnit.module("Init");

	QUnit.test("Proper initialization", function (assert) {
		// Arrange
		var oSB,
			_aOverflowControls;

		// Act
		oSB = new ShellBar();
		_aOverflowControls = oSB._getOverflowToolbar().getContent();

		// Factory
		assert.ok(oSB._oFactory instanceof Factory, "Factory is instance of correct class");

		// Overflow Toolbar
		assert.ok(oSB._oOverflowToolbar.isA("sap.m.OverflowToolbar"), "Overflow Toolbar initialized");
		assert.strictEqual(oSB.getAggregation("_overflowToolbar"), oSB._oOverflowToolbar,
			"OTB added to Aggregation");

		// Others
		assert.ok(oSB._bOTBUpdateNeeded, "Initial update requirement registered");
		assert.ok(oSB._oToolbarSpacer instanceof ToolbarSpacer, "Toolbar spacer initialized");
		assert.ok(oSB._oResponsiveHandler instanceof ResponsiveHandler, "ResponsiveHandler initialized");
		assert.ok(Array.isArray(_aOverflowControls), "Overflow controls collection initialized");

		// Cleanup
		oSB.destroy();
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.oSB = new ShellBar();

		},
		afterEach: function () {
			this.oSB.destroy();
		},
		getPropertiesObject: function () {
			var aProperties = [],
				oProperties = this.oSB.getMetadata().getProperties();

			Object.keys(oProperties).forEach(function (sKey) {
				var oProperty = oProperties[sKey];
				aProperties.push({
					name: oProperty.name,
					type: oProperty.type,
					defaultValue: oProperty.defaultValue
				});
			});
			return aProperties;
		},
		getAggregationsObject: function () {
			var aAggregations = [],
				oAggregations = this.oSB.getMetadata().getAggregations();

			Object.keys(oAggregations).forEach(function (sKey) {
				var oAggregation = oAggregations[sKey],
					oForwarding;

				if (oAggregation.forwarding) {
					oForwarding = {
						aggregation: oAggregation.forwarding.aggregation,
						getter: oAggregation.forwarding.getter
					};
				}

				aAggregations.push({
					name: oAggregation.name,
					type: oAggregation.type,
					multiple: oAggregation.multiple,
					singularName: oAggregation.singularName,
					forwarding: oForwarding
				});
			});
			return aAggregations;
		},
		getEventsObject: function () {
			var aEvents = [],
				oEvents = this.oSB.getMetadata().getEvents();

			Object.keys(oEvents).forEach(function (sKey) {
				var oEvent = oEvents[sKey];
				aEvents.push({
					name: oEvent.name,
					parameters: oEvent.appData ? oEvent.appData.parameters : undefined
				});
			});
			return aEvents;
		}
	});

	QUnit.test("Properties", function (assert) {
		var oExpectedObject = [
			{name: "title", type: "string", defaultValue: ""},
			{name: "secondTitle", type: "string", defaultValue: ""},
			{name: "homeIcon", type: "sap.ui.core.URI", defaultValue: ""},
			{name: "homeIconTooltip", type: "string", defaultValue: ""},
			{name: "showMenuButton", type: "boolean", defaultValue: false},
			{name: "showNavButton", type: "boolean", defaultValue: false},
			{name: "showCopilot", type: "boolean", defaultValue: false},
			{name: "showSearch", type: "boolean", defaultValue: false},
			{name: "showNotifications", type: "boolean", defaultValue: false},
			{name: "showProductSwitcher", type: "boolean", defaultValue: false},
			{name: "notificationsNumber", type: "string", defaultValue: ""}];

		assert.deepEqual(this.getPropertiesObject(), oExpectedObject, "All properties setup as expected");
	});

	QUnit.test("Aggregations", function (assert) {
		var oExpectedObject = [
			{
				name: "menu",
				type: "sap.m.Menu",
				multiple: false,
				singularName: undefined,
				forwarding: {
					aggregation: "menu",
					getter: "_getMenu"
				}},
			{
				name: "searchManager",
				type: "sap.f.SearchManager",
				multiple: false,
				singularName: undefined,
				forwarding: undefined
			},
			{
				name: "profile",
				type: "sap.f.Avatar",
				multiple: false,
				singularName: undefined,
				forwarding: {
					aggregation: "avatar",
					getter: "_getProfile"
				}},
			{
				name: "additionalContent",
				type: "sap.f.IShellBar",
				multiple: true,
				singularName: "additionalContent",
				forwarding: undefined
			}
		];

		assert.deepEqual(this.getAggregationsObject(), oExpectedObject, "All aggregations setup as expected");
	});

	QUnit.test("Events", function (assert) {
		var oExpectedObject = [
			{name: "homeIconPressed", parameters: {icon: {type: "sap.m.Image"}}},
			{name: "menuButtonPressed", parameters: {button: {type: "sap.m.Button"}}},
			{name: "navButtonPressed", parameters: {button: {type: "sap.m.Button"}}},
			{name: "copilotPressed", parameters: {image: {type: "sap.m.Image"}}},
			{name: "searchButtonPressed", parameters: {button: {type: "sap.m.Button"}}},
			{name: "notificationsPressed", parameters: {button: {type: "sap.m.Button"}}},
			{name: "productSwitcherPressed", parameters: {button: {type: "sap.m.Button"}}},
			{name: "avatarPressed", parameters: {avatar: {type: "sap.f.Avatar"}}}
		];

		assert.deepEqual(this.getEventsObject(), oExpectedObject, "All events setup as expected");
	});

	QUnit.test("Setters no value", function (assert) {
		// Assert
		[
			this.oSB._oHomeIcon,
			this.oSB._oMegaMenu,
			this.oSB._oSecondTitle,
			this.oSB._oCopilot,
			this.oSB._oSearch,
			this.oSB._oNotifications,
			this.oSB._oProductSwitcher,
			this.oSB._oNavButton,
			this.oSB._oMenuButton
		].forEach(function (oInternalObject) {
			assert.strictEqual(typeof oInternalObject, "undefined", "Internal object is undefined");
		});

		// Act - call setters with falsy value
		this.oSB.setHomeIcon("");
		this.oSB.setTitle("");
		this.oSB.setSecondTitle("");
		this.oSB.setShowCopilot(false);
		this.oSB.setShowSearch(false);
		this.oSB.setShowNotifications(false);
		this.oSB.setShowProductSwitcher(false);
		this.oSB.setShowNavButton(false);
		this.oSB.setShowMenuButton(false);
		this.oSB.setSearchManager(null);

		// Assert
		[
			this.oSB._oHomeIcon,
			this.oSB._oMegaMenu,
			this.oSB._oSecondTitle,
			this.oSB._oCopilot,
			this.oSB._oSearch,
			this.oSB._oNotifications,
			this.oSB._oProductSwitcher,
			this.oSB._oNavButton,
			this.oSB._oMenuButton,
			this.oSB._oManagedSearch
		].forEach(function (oInternalObject) {
			assert.ok(oInternalObject === null, "Internal object is equal to 'null'");
		});
	});

	QUnit.test("Additional content support", function (assert) {
		// Arrange
		var oAdditionalButtonFirst = new OverflowToolbarButton({id: "additionalButtonFirst",
		text: "Text of First Additional Button"}),
			oAdditionalButtonSecond = new OverflowToolbarButton({id: "additionalButtonSecond",
			text: "Text of Second Additional Button"});

		// Act
		this.oSB.insertAdditionalContent(oAdditionalButtonFirst, -1);
		// Assert
		assert.strictEqual(this.oSB._aAdditionalContent[0], oAdditionalButtonFirst, "Additional " +
		"content on index '0' is the First Button");
		// Act
		this.oSB.insertAdditionalContent(oAdditionalButtonSecond, 0);
		// Assert
		assert.strictEqual(this.oSB._aAdditionalContent[0], oAdditionalButtonSecond, "Additional " +
		"content on index '0' is the Second Button");
		assert.strictEqual(this.oSB._aAdditionalContent[1], oAdditionalButtonFirst, "Additional " +
		"content on index '1' is the First Button");

		// Act
		this.oSB.insertAdditionalContent(oAdditionalButtonFirst, 100);

		// Assert
		assert.strictEqual(this.oSB._aAdditionalContent[0], oAdditionalButtonSecond, "Additional" +
		"content on index '0' is the Second Button");
		assert.strictEqual(this.oSB._aAdditionalContent[1], oAdditionalButtonFirst, "Additional " +
		"content on index '1' is the First Button");
		assert.strictEqual(this.oSB._aAdditionalContent[2], oAdditionalButtonFirst, "Additional " +
		"content on index '2' is the First Button");

		// Act
		this.oSB.removeAdditionalContent(oAdditionalButtonFirst);
		this.oSB.removeAdditionalContent(oAdditionalButtonSecond);
		this.oSB.destroyAdditionalContent();
		// Assert
		assert.strictEqual(this.oSB.indexOfAdditionalContent(oAdditionalButtonFirst), 0, "Additional " +
		"content removed properly and index returned correctly");
		assert.strictEqual(this.oSB.indexOfAdditionalContent(oAdditionalButtonSecond), -1, "Additional " +
		"content removed properly and index returned correctly");

		// Act
		this.oSB.removeAdditionalContent("additionalButtonFirst");
		// Assert
		assert.strictEqual(this.oSB._aAdditionalContent.length, 0, "Additional content removed" +
		" properly by ID");

		// Cleanup
		oAdditionalButtonFirst.destroy();
		oAdditionalButtonSecond.destroy();
	});

	QUnit.test("Configurations", function (assert) {

		// Act
		this.oSB.setTitle("Title");
		this.oSB.setShowMenuButton(true);
		this.oSB._assignControls();


		// Assert
		assert.strictEqual(this.oSB._oTitleControl, this.oSB._oPrimaryTitle,
		"Configuration with MenuButton is correctly rendered");
		assert.strictEqual(this.oSB._oMegaMenu !== null, true,  "MegaMenu element instance is hold by the control");
		assert.strictEqual(this.oSB._oOverflowToolbar.getContent().indexOf(this.oSB._oMegaMenu ), -1,
		"MegaMenu element is not part of the control Overflow Toolbar");

		// Act
		this.oSB.setMenu(new Menu({}));
		this.oSB.setShowMenuButton(false);
		this.oSB._assignControls();

		// Assert
		assert.strictEqual(this.oSB._oTitleControl, this.oSB._oMegaMenu,
			"Configuration without MenuButton is correctly rendered");
		assert.strictEqual(this.oSB._oPrimaryTitle !== null, true,  "PrimaryTitle element instance is hold by the control");
		assert.strictEqual(this.oSB._oOverflowToolbar.getContent().indexOf(this.oSB._oPrimaryTitle ), -1,
			"PrimaryTitle element is not part of the control Overflow Toolbar");

		// Act
		this.oSB.setTitle("");
		this.oSB._assignControls();
		// Assert
		assert.strictEqual(this.oSB._oTitleControl,null,
			"Configuration without MenuButton is correctly rendered");
		assert.strictEqual(this.oSB._oPrimaryTitle === null && this.oSB._oMegaMenu === null, true,  "PrimaryTitle element instance is hold by the control");
		assert.strictEqual(this.oSB._oOverflowToolbar.getContent().indexOf(this.oSB._oMegaMenu ), -1,
			"PrimaryTitle element is not part of the control Overflow Toolbar");
		assert.strictEqual(this.oSB._oOverflowToolbar.getContent().indexOf(this.oSB._oPrimaryTitle ), -1,
			"PrimaryTitle element is not part of the control Overflow Toolbar");

		// Cleanup

	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oSB = new ShellBar();
		},
		afterEach: function () {
			this.oSB.destroy();
		}
	});

	QUnit.test("Defaults", function (assert) {
		// Act
		this.oSB.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(this.oSB.getDomRef(), "Control is rendered");
		assert.ok(this.oSB.getDomRef().classList.contains("sapFShellBar"), "Main control class is applied");
	});

	QUnit.module("Lifecycle handlers", {
		beforeEach: function () {
			this.oSB = new ShellBar();
		},
		afterEach: function () {
			this.oSB.destroy();
		}
	});

	QUnit.test("onBeforeRendering", function (assert) {
		// Arrange
		var oAssignControlsToOverflowToolbarSpy = sinon.spy(this.oSB, "_assignControls");

		// Act
		this.oSB.onBeforeRendering();

		// Assert
		assert.strictEqual(oAssignControlsToOverflowToolbarSpy.callCount, 1, "Assign method called once");

		// Cleanup
		oAssignControlsToOverflowToolbarSpy.restore();
	});

	QUnit.test("exit", function (assert) {
		// Arrange
		var oResponsiveHandlerSpy = sinon.spy(this.oSB._oResponsiveHandler, "exit"),
			oFactorySpy = sinon.spy(this.oSB._oFactory, "destroy");

		// Act
		this.oSB.destroy();

		// Assert
		assert.strictEqual(oResponsiveHandlerSpy.callCount, 1, "Exit method called once");
		assert.strictEqual(oFactorySpy.callCount, 1, "Cleanup method called once");

		// Cleanup
		oResponsiveHandlerSpy.restore();
		oFactorySpy.restore();
	});

	QUnit.module("Utility methods", {
		beforeEach: function () {
			this.oSB = new ShellBar();
		},
		afterEach: function () {
			this.oSB.destroy();
		}
	});

	QUnit.test("_getProfile", function (assert) {
		// Arrange
		var oFactoryGetterSpy = sinon.spy(this.oSB._oFactory, "getAvatarButton");

		// Act
		var oProfile = this.oSB._getProfile();

		// Assert
		assert.strictEqual(oFactoryGetterSpy.callCount, 1, "Factory getter called once");
		assert.ok(oProfile.isA("sap.f.shallBar.ContentButton"), "Method returned correct object");

		// Cleanup
		oFactoryGetterSpy.restore();
	});

	QUnit.test("_getMenu", function (assert) {
		// Arrange
		var oFactoryGetterSpy = sinon.spy(this.oSB._oFactory, "getMegaMenu");

		// Act
		var oMenuButton = this.oSB._getMenu();

		// Assert
		assert.strictEqual(oFactoryGetterSpy.callCount, 1, "Factory getter called once");
		assert.ok(oMenuButton.isA("sap.m.MenuButton"), "Method returned correct object");

		// Cleanup
		oFactoryGetterSpy.restore();
	});

	QUnit.test("_getOverflowToolbar", function (assert) {
		// Act
		var oOTB = this.oSB._getOverflowToolbar();

		// Assert
		assert.ok(oOTB.isA("sap.m.OverflowToolbar"), "Method returned correct object");
	});

	QUnit.test("_assignControls - robustness and optimization", function (assert) {
		// Arrange
		this.oSB._bOTBUpdateNeeded = false;
		this.oSB._bLeftBoxUpdateNeeded = false;
		this.oSB._bRightBoxUpdateNeeded = false;
		this.oSB._aControls = undefined;

		// Act
		this.oSB._assignControls();

		// Assert
		assert.strictEqual(this.oSB._aControls, undefined, "Internal array remains undefined");

		// Arrange
		this.oSB._bOTBUpdateNeeded = true;
		this.oSB._oOverflowToolbar = undefined;

		// Act
		this.oSB._assignControls();

		// Assert
		assert.strictEqual(this.oSB._getOverflowToolbar(), undefined, "Internal array remains undefined");
	});

	QUnit.test("_assignControls - empty ShellBar", function (assert) {
		// Arrange
		var oOTB = this.oSB._oOverflowToolbar,
			oControls = this.oSB._aControls;

		// Act
		this.oSB._bOTBUpdateNeeded = true;
		this.oSB._assignControls();

		// Assert
		assert.strictEqual(oOTB.getContent().length, 1, "Only OverflowToolbar spacer added to OverflowToolbar");
		assert.ok(Array.isArray(oControls), "Property '_aOverflowControls' of type array is created");
		assert.strictEqual(oControls.length, 1, "Array '_aControls' is tracking all controls inside SB");
		assert.strictEqual(this.oSB._bOTBUpdateNeeded, false,
			"Property '_bOTBUpdateNeeded' set to false after method called");
	});

	QUnit.test("_assignControls - Full ShellBar", function (assert) {
		// Arrange
		var oOTB = this.oSB._oOverflowToolbar,
			oAdditionalButton1 = new OverflowToolbarButton(),
			oAdditionalButton2 = new OverflowToolbarButton(),
			aContent,
			aItems,
			aOverflowControls;

		this.oSB.setShowNavButton(true);
		this.oSB.setShowMenuButton(true);
		this.oSB.setHomeIcon(sap.ui.require.toUrl("sap/ui/documentation/sdk/images/logo_sap.png"));
		this.oSB.setTitle("Test title");
		this.oSB.setSecondTitle("Test second title");
		this.oSB.setShowCopilot(true);
		this.oSB.setSearchManager(new SearchManager());
		this.oSB.setShowSearch(true);
		this.oSB.setShowNotifications(true);
		this.oSB.setShowProductSwitcher(true);
		this.oSB.setProfile(new Avatar());
		this.oSB.setMenu(new Menu());
		this.oSB.addAdditionalContent(oAdditionalButton1);
		this.oSB.addAdditionalContent(oAdditionalButton2);

		// Act

		this.oSB.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Arrange
		aContent = oOTB.getContent();
		aItems = this.oSB._aControls;
		aOverflowControls = this.oSB._getOverflowToolbar().getContent();
		// Assert
		assert.strictEqual(aContent.length, 6, "Expected number of controls added to OverflowToolbar");
		// Assert
		assert.strictEqual(aItems.length, 14, "Expected number of controls added to OverflowToolbar");

		// Assert - Order of controls in aggregation
		assert.ok(aItems[0] === this.oSB._oNavButton, "Control at index 0 in SB is NavButton");
		assert.ok(aItems[1] === this.oSB._oMenuButton, "Control at index 2 in SB is MenuButton");
		assert.ok(aItems[2] === this.oSB._oHomeIcon, "Control at index 3 in SB is HomeIcon");
		assert.ok(aItems[3] === this.oSB._oPrimaryTitle, "Control at index 4 in SB is PrimaryTitle");
		assert.ok(aItems[4] === this.oSB._oSecondTitle, "Control at index 5 in SB is SecondTitle");
		assert.ok(aItems[5] === this.oSB._oCopilot, "Control at index 6 in SB is CoPilot");
		assert.ok(aItems[6] === this.oSB._oToolbarSpacer, "Control at index 7 in SB is ToolbarSpcer");
		assert.ok(aItems[7] === this.oSB._oManagedSearch, "Control at index 8 in SB is Managed Search");
		assert.ok(aItems[8] === this.oSB._oSearch, "Control at index 9 in SB is Search");
		assert.ok(aItems[9] === this.oSB._oNotifications, "Control at index 10 in SB is Notifications");
		assert.ok(aItems[10] === oAdditionalButton1, "Control at index 11 in SB is AdditionalButton 1");
		assert.ok(aItems[11] === oAdditionalButton2, "Control at index 12 in SB is AdditionalButton 2");
		assert.ok(aItems[12] === this.oSB._oAvatarButton, "Control at index 13 in SB is AvatarButton");
		assert.ok(aItems[13] === this.oSB._oProductSwitcher, "Control at index 9 in OT is ProductSwitcher");

		// Assert - _aOverflowControls
		assert.strictEqual(aOverflowControls.length, 6, "Overflow Toolbar has 5 controls in it");
		assert.ok(aOverflowControls[0] === this.oSB._oToolbarSpacer, "Control at index 0 is Toolbar Spacer");
		assert.ok(aOverflowControls[1] === this.oSB._oManagedSearch, "Control at index 1 is Managed Search");
		assert.ok(aOverflowControls[2] === this.oSB._oSearch, "Control at index 2 is Search");
		assert.ok(aOverflowControls[3] === this.oSB._oNotifications, "Control at index 3 is Notifications");
		assert.ok(aOverflowControls[4] === oAdditionalButton1, "Control at index 4 is AdditionalButton 1");
		assert.ok(aOverflowControls[5] === oAdditionalButton2, "Control at index 5 is AdditionalButton 2");
	});

	// Responsiveness
	QUnit.module("Responsiveness", {
		beforeEach: function () {
			this.oSB = new ShellBar();
		},
		afterEach: function () {
			this.oSB.destroy();
		}
	});

	QUnit.test("ResponsiveHandler _handleResize on size changed", function (assert) {

		// Arrange
		var oControl = this.oSB,
			oStub;

		oControl.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oStub = sinon.stub(oControl._oResponsiveHandler, "_handleResize").callsFake( function() {
			//Assert
			assert.ok(true, "Responsivehandler delegated event called");
		});
		// Act
		oControl._oOverflowToolbar.attachEvent("_controlWidthChanged", oStub, this);
		oControl._oOverflowToolbar.fireEvent("_controlWidthChanged");

		//Cleanup
		oControl._oResponsiveHandler._handleResize.restore();
		oControl = null; oStub = null;
	});

	QUnit.test("Sizes are cought when the theme is loaded", function (assert) {
			// asert
			var oHandleResizeSpy = sinon.spy(this.oSB._oResponsiveHandler, "_handleResize");

			// act
			this.oSB.onThemeChanged();

			// asert
			assert.strictEqual(oHandleResizeSpy.callCount, 1, "_handleResize is called when the theme is applied and the values are cought");

			oHandleResizeSpy.restore();
	});

	QUnit.test("ResponsiveHandler phone/regular transformation test", function (assert) {

		// Arrange
		var oControl = this.oSB;
		oControl.setSecondTitle("Second title");
		oControl.setHomeIcon(sap.ui.require.toUrl("sap/ui/documentation/sdk/images/logo_sap.png"));
		oControl.setShowMenuButton(true);

		oControl.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		document.getElementById(DOM_RENDER_LOCATION).style.width = 300 + "px";
		this.oSB._oResponsiveHandler._handleResize();

		// Assert

		assert.strictEqual(oControl._oSecondTitle.getVisible(), false, "phone mode requirements passed");
		assert.strictEqual(oControl._oHomeIcon.getVisible(), true, "phone mode requirements passed");

		// Act
		document.getElementById(DOM_RENDER_LOCATION).style.width = 1024 + "px";
		this.oSB._oResponsiveHandler._handleResize();

		// Assert

		assert.strictEqual(oControl._oSecondTitle.getVisible(), true, "regular mode requirements passed");
		assert.strictEqual(oControl._oHomeIcon.getVisible(), true, "regular mode requirements passed");


		// Act
		document.getElementById(DOM_RENDER_LOCATION).style.width = 300 + "px";
		oControl.setShowMenuButton(false);
		this.oSB._oResponsiveHandler._handleResize();

		// Assert

		assert.strictEqual(oControl._oHomeIcon.getVisible(), true, "regular mode requirements passed");

		//Cleanup
		document.getElementById(DOM_RENDER_LOCATION).style.width = 1024 + "px";
	});

	// Accessibility related tests
	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oSB = new ShellBar({
				title: "Application title",
				secondTitle: "Short description",
				homeIcon: "./resources/sap/ui/documentation/sdk/images/logo_ui5.png",
				showNavButton: true,
				showCopilot: true,
				showSearch: true,
				showNotifications: true,
				showProductSwitcher: true,
				showMenuButton: true
			});
			this.oSB.setAggregation("profile", new Avatar({initials: "UI"}));
			this.oRb = Core.getLibraryResourceBundle("sap.f");
			this.oSB.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oSB.destroy();
			this.oRb = null;
		}
	});

	QUnit.test("Hidden title behavior", function (assert) {
		var sHiddenTitleId = '#' + this.oSB.getId() + '-titleHidden',
			$oHiddenTitle = jQuery(sHiddenTitleId),
			sTitle = this.oSB.getTitle(),
			sNewTitle = "Test title";

		// Assert
		assert.strictEqual($oHiddenTitle.length, 0, "Hidden title div should not be rendered when showMenuButton=true");

		// Act
		this.oSB.setShowMenuButton(false);
		Core.applyChanges();
		$oHiddenTitle = jQuery(sHiddenTitleId);

		// Assert
		assert.strictEqual($oHiddenTitle.length, 1, "Hidden title div should be rendered when showMenuButton=false");
		assert.ok($oHiddenTitle.hasClass("sapFShellBarTitleHidden"), "Hidden title class is correct");
		assert.strictEqual($oHiddenTitle.text(), sTitle, "Hidden title text is correct");
		assert.strictEqual($oHiddenTitle.attr("role"), "heading", "Hidden title role is correct");
		assert.strictEqual($oHiddenTitle.attr("aria-level"), "1", "Hidden title aria-level is correct");

		// Act
		this.oSB.setTitle(sNewTitle);
		Core.applyChanges();
		$oHiddenTitle = jQuery(sHiddenTitleId);

		//Assert
		assert.strictEqual($oHiddenTitle.text(), sNewTitle, "Hidden title new text is set correctly");
	});

	QUnit.test("Second title attributes", function (assert) {
		var $oSecondTitle = this.oSB._oSecondTitle.$();

		// Assert
		assert.strictEqual($oSecondTitle.attr("role"), "heading", "Second title role is correct");
		assert.strictEqual($oSecondTitle.attr("aria-level"), "2", "Second title aria-level is correct");
	});

	QUnit.test("Home icon tooltip", function (assert) {
		var oHomeIcon = this.oSB._oHomeIcon,
			sTooltip = this.oRb.getText("SHELLBAR_LOGO_TOOLTIP"),
			sNewTooltip = "Test";

		// Assert
		assert.strictEqual(oHomeIcon.getTooltip(), sTooltip, "Home icon tooltip is the default one");

		// Act
		this.oSB.setHomeIconTooltip(sNewTooltip);

		// Assert
		assert.strictEqual(oHomeIcon.getTooltip(), sNewTooltip, "Custom tooltip is set correctly");

		// Act
		this.oSB.setHomeIconTooltip(null);

		// Assert
		assert.strictEqual(oHomeIcon.getTooltip(), sTooltip, "Default tooltip is restored");
	});

	QUnit.test("CoPilot attributes", function (assert) {
		var oCopilot = this.oSB._oCopilot,
			sTooltip = this.oRb.getText("SHELLBAR_COPILOT_TOOLTIP");

		// Assert
		assert.strictEqual(oCopilot.$().attr("role"), "button", "CoPilot role is correct");
		assert.strictEqual(oCopilot.$().attr("aria-label"), sTooltip, "CoPilot aria-label is correct");
		assert.strictEqual(oCopilot.getTooltip(), sTooltip, "CoPilot tooltip is correct");
	});

	QUnit.test("Search attributes", function (assert) {
		var oSearch = this.oSB._oSearch,
			sTooltip = this.oRb.getText("SHELLBAR_SEARCH_TOOLTIP");

		// Assert
		assert.strictEqual(oSearch.$().attr("aria-label"), sTooltip, "Search aria-label is correct");
		assert.strictEqual(oSearch.getTooltip(), sTooltip, "Search tooltip is correct");
	});

	QUnit.test("Nav button attributes", function (assert) {
		var oNavButton = this.oSB._oNavButton,
			sTooltip = this.oRb.getText("SHELLBAR_BACK_TOOLTIP");

		// Assert
		assert.strictEqual(oNavButton.$().attr("aria-label"), sTooltip, "Nav button aria-label is correct");
		assert.strictEqual(oNavButton.getTooltip(), sTooltip, "Nav button tooltip is correct");
	});

	QUnit.test("Menu button attributes", function (assert) {
		var oMenuButton = this.oSB._oMenuButton,
			$oMenuButton = oMenuButton.$(),
			sTooltip = this.oRb.getText("SHELLBAR_MENU_TOOLTIP");

		// Assert
		assert.strictEqual($oMenuButton.attr("aria-haspopup"), "menu", "Menu button aria-haspopup is correct");
		assert.strictEqual($oMenuButton.attr("aria-label"), sTooltip, "Menu button aria-label is correct");
		assert.strictEqual(oMenuButton.getTooltip(), sTooltip, "Menu button tooltip is correct");
	});

	QUnit.test("Notifications attributes", function (assert) {
		var oNotifications = this.oSB._oNotifications,
			$oNotifications = oNotifications.$(),
			sTooltip = this.oRb.getText("SHELLBAR_NOTIFICATIONS_TOOLTIP");

		// Assert
		assert.strictEqual($oNotifications.attr("aria-haspopup"), "dialog", "Notifications aria-haspopup is correct");
		assert.strictEqual($oNotifications.attr("aria-label"), sTooltip, "Notifications aria-label is correct");
		assert.strictEqual(oNotifications.getTooltip(), sTooltip, "Notifications tooltip is correct");

		// Act
		this.oSB.setNotificationsNumber("2");

		// Assert
		assert.strictEqual($oNotifications.attr("aria-label"), "2 " + sTooltip, "Notifications aria-label is updated");
		assert.strictEqual(oNotifications.getTooltip(), "2 " + sTooltip, "Notifications tooltip is updated");

		// Act
		this.oSB.setNotificationsNumber(null);

		// Assert
		assert.strictEqual($oNotifications.attr("aria-label"), sTooltip, "Notifications aria-label is restored to default");
		assert.strictEqual(oNotifications.getTooltip(), sTooltip, "Notifications tooltip is restored to default");

	});

	QUnit.test("Products attributes", function (assert) {
		var oProducts = this.oSB._oProductSwitcher,
			$oProducts = oProducts.$(),
			sTooltip = this.oRb.getText("SHELLBAR_PRODUCTS_TOOLTIP");

		// Assert
		assert.strictEqual($oProducts.attr("aria-haspopup"), "menu", "Products aria-haspopup is correct");
		assert.strictEqual($oProducts.attr("aria-label"), sTooltip, "Products aria-label is correct");
		assert.strictEqual(oProducts.getTooltip(), sTooltip, "Products tooltip is correct");
	});

	QUnit.test("Avatar attributes", function (assert) {
		var oAvatar = this.oSB._oAvatarButton,
			$oAvatar = oAvatar.$(),
			sTooltip = this.oRb.getText("SHELLBAR_PROFILE_TOOLTIP");

		// Assert
		assert.strictEqual($oAvatar.attr("aria-haspopup"), "menu", "Avatar aria-haspopup is correct");
		assert.strictEqual($oAvatar.attr("aria-label"), sTooltip, "Avatar aria-label is correct");
		assert.strictEqual(oAvatar.getTooltip(), sTooltip, "Avatar tooltip is correct");
	});

	QUnit.test("Notifications Badge basic functionality", function (assert) {
		// Arrange
		var sNotificationsButtonNumber,
			sOverflowToolbarButtonNumber,
			oRendererSpy = sinon.spy(ShellBarRenderer, "render");

		// Act

		this.oSB.setShowNotifications(true);
		this.oSB.setNotificationsNumber("40");

		// Arrange
		sNotificationsButtonNumber = this.oSB._oNotifications.data("notifications");
		sOverflowToolbarButtonNumber = this.oSB._oOverflowToolbar._getOverflowButton().data("notifications");

		// Assert
		assert.strictEqual(sNotificationsButtonNumber, "40", "Badge data rendered correctly inside notifications button");
		assert.strictEqual(sOverflowToolbarButtonNumber, "40", "Badge data rendered correctly inside overflow button");

		// Act
		this.oSB.setNotificationsNumber("50");
		// Assert
		assert.strictEqual(oRendererSpy.callCount, 0, "Control didn`t rerender on property change");

		sNotificationsButtonNumber = null;
		sOverflowToolbarButtonNumber = null;
	});

	QUnit.module("Managed Search", {
		beforeEach: function () {
			var oSearchManager = new SearchManager();

			oSearchManager._oSearch.setIsOpen(true);

			this.oSB = new ShellBar({
				title: "Application title",
				secondTitle: "Short description",
				homeIcon: "./resources/sap/ui/documentation/sdk/images/logo_ui5.png",
				searchManager: oSearchManager,
				showNavButton: true,
				showCopilot: true,
				showSearch: true,
				showNotifications: true,
				showProductSwitcher: true,
				showMenuButton: true
			});


			this.oSB.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oSB.destroy();
			this.oRb = null;
		}
	});

	QUnit.test("ResponsiveHandler with open search", function (assert) {
		// Assert
		assert.strictEqual(_getVisibleControlsCount(this.oSB), 11, "phone mode requirements passed");
		assert.strictEqual(this.oSB.hasStyleClass("sapFShellBarFullSearch"), false,
			"Full width search class list was added to Shell Bar.");

		// Act
		this.oSB._oResponsiveHandler._transformToPhoneState();

		// Assert
		assert.strictEqual(_getVisibleControlsCount(this.oSB), 1, "phone mode requirements passed");
		assert.strictEqual(this.oSB.hasStyleClass("sapFShellBarFullSearch"), true,
			"Full width search class list was added to Shell Bar.");

		// Act
		this.oSB._oResponsiveHandler._transformToRegularState();

		// Assert
		assert.strictEqual(_getVisibleControlsCount(this.oSB), 11, "phone mode requirements passed");
		assert.strictEqual(this.oSB.hasStyleClass("sapFShellBarFullSearch"), false,
			"Full width search class list was added to Shell Bar.");
	});

	QUnit.test("LayoutData of Search", function (assert) {
		// Arrange
		var oSB = this.oSB,
		oSearchManager = this.oSB.getSearchManager(),
			oSearchEventDelegate = {
					"onAfterRendering": function() {
						oSearchManager._oSearch.removeEventDelegate(oSearchEventDelegate);
						// Assert
						assert.strictEqual(oSB._oSearch.getLayoutData().getPriority(), "AlwaysOverflow",
							"Always priority is set when Search is not open and it is in the overflow menu of the OFT");

						// Clean up
						fnDone();
				}
			},
			oOSBEventDelegate = {
				"onAfterRendering": function() {
					this.oSB.removeEventDelegate(oOSBEventDelegate);

					// Act
					this.oSB._oOverflowToolbar._getOverflowButton().firePress();
				}
			},
			fnDone = assert.async();


		assert.expect(1);

		// Act
		oSearchManager._oSearch.setIsOpen(false);
		this.oSB._oResponsiveHandler._transformToPhoneState();
		Core.applyChanges();

		setTimeout(function () {
			oSearchManager._oSearch.addEventDelegate(oSearchEventDelegate);
			this.oSB.addEventDelegate(oOSBEventDelegate, this);
			this.oSB.invalidate();
		}.bind(this), 1000);
	});

	QUnit.test("Mobile requirements with both configuration - with or without menu button", function (assert) {

		// Act
		this.oSB._oResponsiveHandler._transformToPhoneState();
		this.oSB.setShowMenuButton(true);
		this.oSB._oSearch.firePress();

		// Assert
		assert.strictEqual(this.oSB._oHomeIcon.$().css("visibility"), "hidden", true, "Search " +
			"bar hides home button on left on mobile with menu button");
		assert.strictEqual(this.oSB._oMenuButton.$().css("visibility"), "hidden", true, "Search " +
			"bar hides all the content on left on mobile with menu button");
		// Act
		this.oSB.setShowMenuButton(false);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oSB._oMegaMenu.$().css("visibility"), "hidden", true, "Search " +
			"bar hides all the content on left on mobile with menu button");

	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oSB = new ShellBar({
				title: "Application title",
				secondTitle: "Short description",
				homeIcon: "./resources/sap/ui/documentation/sdk/images/logo_ui5.png",
				showNavButton: true,
				showCopilot: true,
				showSearch: true,
				showNotifications: true,
				showProductSwitcher: true,
				showMenuButton: true,
				profile: new Avatar({initials: "UI"})
			});
			this.oSB.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oSB.destroy();
		}
	});

	QUnit.test("avatarPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oAvatarButton.getAvatar().getId(),
					oEventParamters.avatar.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachAvatarPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oAvatarButton.firePress();
	});


	QUnit.test("copilotPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oCopilot.getId(),
					oEventParamters.image.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachCopilotPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oCopilot.firePress();
	});

	QUnit.test("homeIconPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oHomeIcon.getId(),
					oEventParamters.icon.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachHomeIconPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oHomeIcon.firePress();
	});

	QUnit.test("menuButtonPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oMenuButton.getId(),
					oEventParamters.button.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachMenuButtonPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oMenuButton.firePress();
	});

	QUnit.test("navButtonPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oNavButton.getId(),
					oEventParamters.button.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachNavButtonPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oNavButton.firePress();
	});

	QUnit.test("notificationsPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oNotifications.getId(),
					oEventParamters.button.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachNotificationsPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oNotifications.firePress();
	});

	QUnit.test("productSwitcherPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oProductSwitcher.getId(),
					oEventParamters.button.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachProductSwitcherPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oProductSwitcher.firePress();
	});

	QUnit.test("searchButtonPressed", function (assert) {
		// Setup
		var oEventParamters,
			done = assert.async(),
			fnTestEvent = function () {
				// Assert
				assert.ok(true, "Event was fired");
				assert.strictEqual(this.oSB._oSearch.getId(),
					oEventParamters.button.getId(), "Correct parameter was passed");

				// Clean up
				done();
			}.bind(this);

		assert.expect(2);

		this.oSB.attachSearchButtonPressed(function(oEvent) {
			oEventParamters = oEvent.getParameters();
			fnTestEvent(oEvent);
		});

		// Act
		this.oSB._oSearch.firePress();
	});
});
