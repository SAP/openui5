/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItemBase",
	"sap/ui/thirdparty/jquery",
	"sap/m/library",
	"sap/ui/core/Popup",
	"sap/ui/core/Control",
	"sap/m/SplitButton",
	"sap/ui/core/library",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Label",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(
	Library,
	qutils,
	createAndAppendDiv,
	MenuButton,
	Menu,
	MenuItem,
	UnifiedMenu,
	UnifiedMenuItemBase,
	jQuery,
	mobileLibrary,
	Popup,
	Control,
	SplitButton,
	coreLibrary,
	Popover,
	Button,
	Label,
	KeyCodes,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.core.Popup.Dock
	var Dock = Popup.Dock;

	// shortcut for sap.m.MenuButtonMode
	var MenuButtonMode = mobileLibrary.MenuButtonMode;

	createAndAppendDiv("content");



	function AriaLabeledByHasCorrectValue(aAriaLabelledByIds, sValue) {
		for (var i = 0; i < aAriaLabelledByIds.length; i++) {
			if (jQuery("#" + aAriaLabelledByIds[i]).text() === sValue) {
				return true;
			}
		}
		return false;
	}


	QUnit.module("Basic", {
		beforeEach: function () {
			this.sut = new MenuButton("menuButton1");
			this.sut.setText("Menu Button");
			this.sut.setTooltip("This is a test tooltip");
			this.oMenu = new Menu("menu1");
			this.sut.setMenu(this.oMenu);
			var oMenuItem1 = new MenuItem("menuitem1", {text:"Item1"});
			var oMenuItem2 = new MenuItem("menuitem2", {text:"Item2"});
			this.oMenu.addItem(oMenuItem1);
			this.oMenu.addItem(oMenuItem2);
			this.sut.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = null;
			this.oMenu.destroy();
			this.oMenu = null;
		}
	});
	QUnit.test("Initial Rendering", function(assert) {
		assert.notEqual(this.sut.getDomRef(), null, "MenuButton HTML Element should be rendered");
		assert.equal(this.oMenu.getDomRef(), null, "Menu HTML Element is not yet rendered");
	});

	QUnit.test("MenuButton sets a stableID to the internal button", function (assert) {
		// assert
		assert.ok(this.sut.getDomRef("internalBtn"), "there is an element with -internalBtn suffix");
	});

	QUnit.test("MenuButton sets a stableID to the internal split button", function (assert) {
		// arrange
		var oMenuButton = new MenuButton({ buttonMode: MenuButtonMode.Split });
		oMenuButton.placeAt("content");
		oCore.applyChanges();

		// assert
		assert.ok(oMenuButton.getDomRef("internalSplitBtn"), "there is an element with -internalSplitBtn suffix");

		// cleanup
		oMenuButton.destroy();
	});

	QUnit.test("MenuButton sets a stableID to both text and action button in the internal split button", function (assert) {
		// arrange
		var oMenuButton = new MenuButton("splitButton", { buttonMode: MenuButtonMode.Split });
		oMenuButton.placeAt("content");
		oCore.applyChanges();
		var oMenuButtonInner = oMenuButton.getDomRef("internalSplitBtn");
		// assert
		assert.strictEqual(oMenuButtonInner.children[0].firstElementChild.id, "splitButton-internalSplitBtn-textButton", "there is an element with -internalSplitBtn-textButton suffix");

		// assert
		assert.strictEqual(oMenuButtonInner.children[0].lastElementChild.id, "splitButton-internalSplitBtn-arrowButton", "there is an element with -internalSplitBtn-arrowButton suffix");

		// cleanup
		oMenuButton.destroy();
	});

	QUnit.test("Property - Default Values", function(assert) {
		this.sut.destroy();
		this.sut = null;
		this.sut = new MenuButton('menuButton1');
		assert.equal(this.sut.getVisible(), true, "Default 'visible':");
		assert.equal(this.sut.getTooltip(), null, "Default 'tooltip':");
		assert.equal(this.sut.getEnabled(), true, "Default 'enabled':");
		assert.equal(this.sut.getText(), "", "Default 'title':");
		assert.equal(this.sut.getMenu(), null, "Default 'menu':");
		assert.strictEqual(this.sut.getAggregation('_button').getMetadata().getName() === 'sap.m.Button', true, 'Normal sap m button.');
		assert.equal(this.sut.getMenuPosition(), Dock.BeginBottom, "Default value is BeginBottom");
	});
	QUnit.test("Property - Custom Values", function(assert) {
		assert.equal(this.sut.getTooltip(), "This is a test tooltip", "Custom 'tooltip':");
		assert.equal(this.sut.getText(), "Menu Button", "Custom 'title':");
	});

	QUnit.module("Accessibility (ARIA)", {
		beforeEach: function () {
			this.sut = new MenuButton("menuButton1", {
				menu: new Menu("menuButton1Menu", {
					items: [
						new MenuItem({text: "MenuItem 1"}),
						new MenuItem({text: "MenuItem 2"}),
						new MenuItem({text: "MenuItem 3"})
					]
				})
			});
			this.sut.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("MenuButton (Regular) aria attributes", function (assert) {
		assert.strictEqual(this.sut._getButtonControl().$().attr("aria-haspopup"), "menu",
			"aria-haspopup is set on the internal button");
	});

	QUnit.test("MenuButton (Regular) aria-expanded attribute", function (assert) {
		var oButton = this.sut._getButtonControl();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "false",
			"aria-expanded is initially set to false on the internal button");

		// act
		oButton.firePress();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "true",
			"aria-expanded is set to false on the internal button when it is pressed");

		// act
		this.sut.getMenu().close();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "false",
			"aria-expanded is set to false on the internal button when the menu is closed");
	});

	QUnit.test("MenuButton (Split) aria-expanded attribute", function (assert) {
		this.sut.setButtonMode("Split");
		var oButton = this.sut._getButtonControl()._getArrowButton();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "false",
			"aria-expanded is initially set to false on the internal button");

		// act
		oButton.firePress();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "true",
			"aria-expanded is set to false on the internal button when it is pressed");

		// act
		this.sut.getMenu().close();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oButton.$().attr("aria-expanded"), "false",
			"aria-expanded is set to false on the internal button when the menu is closed");
	});

	QUnit.test("MenuButton (Regular) aria-controls placement", function (assert) {
		var $buttonReference = this.sut._getButtonControl().$(),
			oGetMenuSub = this.stub(this.sut, "getMenu").callsFake(function () {
				return {
					getDomRefId: function () { return "fake-menu-id"; }
				};
			});

		this.sut._writeAriaAttributes();
		assert.strictEqual($buttonReference.attr("aria-controls"), "fake-menu-id",
			"aria-controls is placed on the internal button and it holds the menu's id");

		this.sut._menuClosed();
		assert.notOk($buttonReference.attr("aria-controls"), "aria-controls is removed from the internal button");

		oGetMenuSub.restore();
	});

	QUnit.test("MenuButton in Split aria-controls placement", function (assert) {
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var $arrowButton = this.sut._getButtonControl()._getArrowButton().$(),
			oGetMenuSub = this.stub(this.sut, "getMenu").callsFake(function () {
				return {
					getDomRefId: function () { return "fake-menu-id"; }
				};
			});

		this.sut._writeAriaAttributes();
		assert.strictEqual($arrowButton.attr("aria-controls"), "fake-menu-id",
			"aria-controls is placed on the internal arrow button and it holds the menu's id");

		this.sut._menuClosed();
		assert.notOk($arrowButton.attr("aria-controls"), "aria-controls is removed from the internal arrow button");

		oGetMenuSub.restore();
	});

	QUnit.test("MenuButton in Split root aria attributes", function(assert) {
		//arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			sAriaHasPopup = oInnerButton._getArrowButton().$().attr("aria-haspopup");

		//assert
		assert.strictEqual(oInnerButton.getMetadata().getName(), "sap.m.SplitButton", "The inner aggregation '_buttonControl' has correct type");
		assert.strictEqual(sAriaHasPopup, "menu", '"aria-haspopup" is present and has a correct value');
	});

	QUnit.test("MenuButton in Split mode", function (assert) {
		//arrange
		var sText = "Example",
			sExpectedArrowButtonTooltip = Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_ARROW_TOOLTIP");

		this.sut.setText(sText);
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			aAriaLabelledIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			aAriaLabelledByDomElements = aAriaLabelledIds.map(function(id) {
				return jQuery("#" + id);
			});

		//assert
		assert.strictEqual(aAriaLabelledByDomElements.length, 3, "There exactly 2 dom elements referenced in the aria-labelledby");
		assert.strictEqual(aAriaLabelledByDomElements[0].text(),
				sText,
				'Referenced control in "aria-labelledby" shows the text of the button');
		assert.strictEqual(aAriaLabelledByDomElements[1].text(),
				Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_DESCRIPTION"),
				'Referenced control in "aria-labelledby" shows that this is a split button');

		assert.strictEqual(aAriaLabelledByDomElements[2].text(),
				Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT"),
				'Referenced control in "aria-labelledby" shows the keyboard handling hint');

		assert.strictEqual(oInnerButton._getArrowButton().getTooltip(), sExpectedArrowButtonTooltip,
				"Internal arrow button has explicit tooltip");

	});

	QUnit.test("MenuButton with tooltip in Split mode", function (assert) {
		//arrange
		var sTooltip = "Some meaningful tooltip";
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.setTooltip(sTooltip);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			oArrowButton = oInnerButton._getArrowButton(),
			oTextButton = oInnerButton._getTextButton(),
			sInnerButtonLabelledBy = oInnerButton.$().attr("aria-labelledby"),
			sInternalTooltipId = oInnerButton.getId() + "-tooltip";

		//assert
		assert.strictEqual(oInnerButton.$().attr("title"), sTooltip, "The inner split button has a title property with the provided tooltip");
		assert.ok(!oTextButton.getDomRef().hasAttribute("title"), "The inner '_textButton' button does not have and need DOM title property");
		assert.ok(!oArrowButton.getDomRef().hasAttribute("title"), "The inner '_arrowButton' button does not have DOM title property set to its Icon name");
		assert.ok(sInnerButtonLabelledBy.indexOf(sInternalTooltipId) !== -1, "The ID of the hidden SPAN with tooltip is added in aria-labelledby attribute");
		assert.ok(oInnerButton.$("tooltip").length, "The hidden SPAN with tooltip as content exists");
	});

	QUnit.test("MenuButton IconOnly in Split mode", function (assert) {
		var sIconName = "add";
		this.sut.setIcon("sap-icon://" + sIconName);
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			oTextButton = oInnerButton._getTextButton(),
			oArrowButton = oInnerButton._getArrowButton(),
			sInternalTooltipId = oInnerButton.getId() + "-tooltip",
			bHasAriaLabeledBy = oInnerButton.getDomRef().hasAttribute("aria-labelledby"),
			aAriaLabelledByIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			bAriaLabeledByHasCorrectValue = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT"));

		//assert
		assert.ok(bHasAriaLabeledBy && bAriaLabeledByHasCorrectValue, '"aria-labelledby" is present and has correct value');
		assert.ok(!oTextButton.getDomRef().hasAttribute("title"), "The inner '_textButton' button do not have and need DOM title property");
		assert.ok(!oArrowButton.getDomRef().hasAttribute("title"), "The inner '_arrowButton' button do not have DOM title property set to its Icon name");
		assert.ok(aAriaLabelledByIds.indexOf(sInternalTooltipId) !== -1, "The ID of the hidden SPAN with tooltip is added in aria-labelledby attribute");
		assert.ok(oInnerButton.$("tooltip").length, "The hidden SPAN with tooltip as content exists");
	});

	QUnit.test("MenuButton IconOnly with tooltip in Split mode", function (assert) {
		//arrange
		var sTooltip = "Some meaningful tooltip",
			sIconName = "slim-arrow-down";
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.setTooltip(sTooltip);
		this.sut.setIcon("sap-icon://" + sIconName);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl();

		//assert
		assert.strictEqual(oInnerButton.$().attr("title"), sTooltip, "The inner split button has a title property with the provided tooltip");
	});

	QUnit.test("Semantic MenuButton in Split mode", function (assert) {
		//arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.setType(ButtonType.Emphasized);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			bHasAriaLabeledBy = oInnerButton.getDomRef().hasAttribute("aria-labelledby"),
			aAriaLabelledByIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			bAriaLabeledByHasCorrectValue1 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT")),
			bAriaLabeledByHasCorrectValue2 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("BUTTON_ARIA_TYPE_EMPHASIZED"));

		//assert
		assert.ok(bHasAriaLabeledBy && bAriaLabeledByHasCorrectValue1 && bAriaLabeledByHasCorrectValue2, '"aria-labelledby" is present and has correct id references');
	});

	QUnit.test("Semantic MenuButton with tooltip in Split mode", function (assert) {
		var sTooltip = "Some meaningful tooltip";
		this.sut.setTooltip(sTooltip);
		this.sut.setIcon("sap-icon://slim-arrow-down");
		this.sut.setText("Hello");
		this.sut.setType(ButtonType.Emphasized);
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			bHasAriaLabeledBy = oInnerButton.getDomRef().hasAttribute("aria-labelledby"),
			aAriaLabelledByIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			bAriaLabeledByHasCorrectValue1 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT")),
			bAriaLabeledByHasCorrectValue2 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("BUTTON_ARIA_TYPE_EMPHASIZED"));

		//assert
		assert.strictEqual(oInnerButton.$().attr("title"), sTooltip, "The inner split button has a title property with the provided tooltip");
		assert.ok(bHasAriaLabeledBy && bAriaLabeledByHasCorrectValue1 && bAriaLabeledByHasCorrectValue2, '"aria-labelledby" is present and has correct id references');
	});

	QUnit.test("Semantic MenuButton IconOnly in Split mode", function (assert) {
		//arrange
		var sIconName = "slim-arrow-down";
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.setType(ButtonType.Emphasized);
		this.sut.setIcon("sap-icon://" + sIconName);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			bHasAriaLabeledBy = oInnerButton.getDomRef().hasAttribute("aria-labelledby"),
			aAriaLabelledByIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			bAriaLabeledByHasCorrectValue1 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT")),
			bAriaLabeledByHasCorrectValue2 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("BUTTON_ARIA_TYPE_EMPHASIZED"));

		//assert
		assert.ok(bHasAriaLabeledBy && bAriaLabeledByHasCorrectValue1 && bAriaLabeledByHasCorrectValue2, '"aria-labelledby" is present and has correct id references');
	});

	QUnit.test("Semantic MenuButton IconOnly with tooltip in Split mode", function (assert) {
		var sTooltip = "Some meaningful tooltip",
			sIconName = "slim-arrow-down";

		this.sut.setType(ButtonType.Reject);
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.setIcon("sap-icon://" + sIconName);
		this.sut.setTooltip(sTooltip);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl(),
			bHasAriaLabeledBy = oInnerButton.getDomRef().hasAttribute("aria-labelledby"),
			aAriaLabelledByIds = oInnerButton.$().attr("aria-labelledby").trim().split(" "),
			bAriaLabeledByHasCorrectValue1 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("SPLIT_BUTTON_KEYBOARD_HINT")),
			bAriaLabeledByHasCorrectValue2 = AriaLabeledByHasCorrectValue(aAriaLabelledByIds, Library.getResourceBundleFor("sap.m").getText("BUTTON_ARIA_TYPE_REJECT"));

		//assert
		assert.ok(bHasAriaLabeledBy && bAriaLabeledByHasCorrectValue1 && bAriaLabeledByHasCorrectValue2, '"aria-labelledby" is present and has correct value');
		assert.strictEqual(oInnerButton.$().attr('title'), sTooltip, "The icon tooltip is successfully set");
	});

	QUnit.test("Semantic MenuButton disabled in Split mode", function (assert) {
		this.sut.setEnabled(false);
		this.sut.setIcon("sap-icon://slim-arrow-down");
		this.sut.setText("Hello");
		this.sut.setType(ButtonType.Emphasized);
		this.sut.setButtonMode(MenuButtonMode.Split);
		oCore.applyChanges();

		var oInnerButton = this.sut._getButtonControl();

		//assert
		assert.strictEqual(oInnerButton.$().attr("tabindex"), "-1", "The inner split button has a tabindex -1");
		assert.ok(oInnerButton.$().children().hasClass("sapMSBInnerDisabled"), "The inner split button has disabled class");
	});

	QUnit.test("When ariaLabelledBy is added to the MenuButton, it gets propagated to the inner Button", function(assert) {
		// Act
		this.sut.addAriaLabelledBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy(), "test", "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When ariaLabelledBy is added to the MenuButton, it gets propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);

		// Act
		this.sut.addAriaLabelledBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy(), "test", "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When ariaDescribedBy is added to the MenuButton, it gets propagated to the inner Button", function(assert) {
		// Act
		this.sut.addAriaDescribedBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy(), "test", "The ariaDescribedBy is propagated.");
	});

	QUnit.test("When ariaDescribedBy is added to the MenuButton, it gets propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);

		// Act
		this.sut.addAriaDescribedBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy(), "test", "The ariaDescribedBy is propagated.");
	});

	QUnit.test("When ariaLabelledBy is removed from the MenuButton, it gets propagated to the inner Button", function(assert) {
		// Arrange
		this.sut.addAriaLabelledBy("test");

		// Act
		this.sut.removeAriaLabelledBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy().length, 0, "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When ariaLabelledBy is removed from the MenuButton, it gets propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.addAriaLabelledBy("test");

		// Act
		this.sut.removeAriaLabelledBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy().length, 0, "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When ariaDescribedBy is removed from the MenuButton, it gets propagated to the inner Button", function(assert) {
		// Arrange
		this.sut.addAriaDescribedBy("test");

		// Act
		this.sut.removeAriaDescribedBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy().length, 0, "The ariaDescribedBy is propagated.");
	});

	QUnit.test("When ariaDescribedBy is removed from the MenuButton, it gets propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.addAriaDescribedBy("test");

		// Act
		this.sut.removeAriaDescribedBy("test");

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy().length, 0, "The ariaDescribedBy is propagated.");
	});



	QUnit.test("When all ariaLabelledBy strings are removed from the MenuButton, they get propagated to the inner Button", function(assert) {
		// Arrange
		this.sut.addAriaLabelledBy("test");
		this.sut.addAriaLabelledBy("test2");

		// Act
		this.sut.removeAllAriaLabelledBy();

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy().length, 0, "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When all ariaLabelledBy strings are removed from the MenuButton, they get propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.addAriaLabelledBy("test");
		this.sut.addAriaLabelledBy("test2");

		// Act
		this.sut.removeAllAriaLabelledBy();

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaLabelledBy().length, 0, "The ariaLabelledBy is propagated.");
	});

	QUnit.test("When all ariaDescribedBy strings are removed from the MenuButton, they get propagated to the inner Button", function(assert) {
		// Arrange
		this.sut.addAriaDescribedBy("test");
		this.sut.addAriaDescribedBy("test2");

		// Act
		this.sut.removeAllAriaDescribedBy();

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy().length, 0, "The ariaDescribedBy is propagated.");
	});

	QUnit.test("When all ariaDescribedBy strings are removed from the MenuButton, they get propagated to the inner SplitButton", function(assert) {
		// Arrange
		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.addAriaDescribedBy("test");
		this.sut.addAriaDescribedBy("test2");

		// Act
		this.sut.removeAllAriaDescribedBy();

		// Assert
		assert.equal(this.sut.getAggregation("_button").getAriaDescribedBy().length, 0, "The ariaDescribedBy is propagated.");
	});

	QUnit.module("Accessibility (Labelling)", {
		beforeEach: function () {
			this.oLabel = new Label("initialLabel", {
				labelFor: "menuButton"
			});
			this.oMenuButton = new MenuButton("menuButton");

			this.oLabel.placeAt("content");
			this.oMenuButton.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oLabel.destroy();
			this.oMenuButton.destroy();

			this.oLabel = null;
			this.oMenuButton = null;
		}
	});

	QUnit.test("Label is redirected to internal button", function (assert) {
		var sInternalButtonAriaLabelledby = this.oMenuButton._getButtonControl().$().attr("aria-labelledby");

		assert.notOk(this.oMenuButton.$().attr("aria-labelledby"), "MenuButton doesn't have aria-labelledby attribute");
		assert.ok(sInternalButtonAriaLabelledby.indexOf("initialLabel") !== -1,
				"Reference to the label is added on the internal button");
	});

	QUnit.test("Dynamically created label", function (assert) {
		var oLabel = new Label("newLabel", { labelFor: "menuButton" }),
			sInternalButtonAriaLabelledby;

		oLabel.placeAt("content");
		oCore.applyChanges();

		sInternalButtonAriaLabelledby = this.oMenuButton._getButtonControl().$().attr("aria-labelledby");

		assert.ok(sInternalButtonAriaLabelledby.indexOf("initialLabel") !== -1,
				"Initial label reference is still kept");
		assert.ok(sInternalButtonAriaLabelledby.indexOf("newLabel") !== -1,
				"Internal button has reference to the newly created label");

		oLabel.destroy();
	});

	QUnit.module("Pressing", {
		beforeEach: function () {
			this.sut = new MenuButton("menuButton1");
			this.sut.setText("Menu Button");
			this.sut.setTooltip("This is a test tooltip");

			this.oMenu = new Menu();
			this.sut.setMenu(this.oMenu);

			this.oMenuItem1 = new MenuItem({text:"Item1"});
			this.oMenuItem2 = new MenuItem({text:"Item2"});

			this.oMenu.addItem(this.oMenuItem1);
			this.oMenu.addItem(this.oMenuItem2);

			this.sut.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oMenu.close();
			this.oMenu.destroy();
			this.oMenu = null;
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("Open with mouse", function(assert) {
		/* ToDo: Currently the _handleButtonPress cannot be spied when triggered from the press event of the internal
		 button - for this reason assertion is done on the opened control DOM - this test is tightly coupling with sap.m.Menu
		 - must be decoupled like the keyboard open test below */
		this.sut.getAggregation('_button').firePress();
		assert.strictEqual(jQuery('.sapMMenu').length, 1, "Opened control is visible after click");
	});

	QUnit.test("The menu of the MenuButton is closed on second click", function(assert) {
		var oMenuButton = this.sut,
			oCloseSpy = this.spy(oMenuButton.getMenu(), "close");

		// act
		// simulate event handlers in the expected order
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		// assert
		assert.strictEqual(oCloseSpy.callCount, 1, "the close method of Menu is called");
		assert.strictEqual(this.sut.getMenu()._getMenu().getPopup().isOpen(), false, "the Popup is closed");
	});

	QUnit.test("The menu of the MenuButton is closed on second click after it has one lost its focus", function(assert) {
		var oMenuButton = this.sut,
			oMenuButton2 = new MenuButton("menuButton2").placeAt("content");

		oCore.applyChanges();

		// act
		// simulate event handlers in the expected order
		// open
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		// focus leave
		qutils.triggerEvent("mousedown", oMenuButton2.getId());
		qutils.triggerEvent("mouseup", oMenuButton2.getId());
		qutils.triggerEvent("click", oMenuButton2.getId());

		// check again if opened
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return {
					keyboard: false
				};
			}
		});
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		// assert
		assert.strictEqual(this.sut.getMenu()._getMenu().getPopup().isOpen(), false, "the Popup is closed");

		// clean
		oMenuButton2.destroy();
	});

	QUnit.test("The menu of the MenuButton is closed on second click after an item is selected", function(assert) {
		var oMenuButton = this.sut,
				oCloseSpy = this.spy(oMenuButton.getMenu(), "close");

		// act
		// simulate event handlers in the expected order
		// open
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		// select an item
		qutils.triggerEvent("mousedown", oMenuButton.getMenu().getItems()[0].getId() + "-unifiedmenu");
		qutils.triggerEvent("mouseup", oMenuButton.getMenu().getItems()[0].getId() + "-unifiedmenu");
		qutils.triggerEvent("click", oMenuButton.getMenu().getItems()[0].getId() + "-unifiedmenu");

		// check again if opened
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});
		oMenuButton.ontouchstart();
		oMenuButton._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		// assert
		assert.strictEqual(oCloseSpy.callCount, 1, "the close method of Menu is called");
		assert.strictEqual(this.sut.getMenu()._getMenu().getPopup().isOpen(), false, "the Popup is closed");
	});


	QUnit.test("Open with keyboard", function(assert) {
		var fnHandleButtonPress = sinon.spy(this.sut, "_handleButtonPress"),
			oEvent = {
				stopPropagation: function() {}
			},
			fnStopPropagationSpy = sinon.spy(oEvent, "stopPropagation"),
			oProps = Object.create(null, {
				getParameter: {
					value: function() {
						return true;
					}
				}
			});

		this.sut.onsapup(oEvent);

		assert.ok(fnHandleButtonPress.calledWith(oProps), "Button press handler invoked after 'onsapup' event.");

		fnHandleButtonPress.restore();
		fnHandleButtonPress = sinon.spy(this.sut, "_handleButtonPress");
		this.sut.onsapdown(oEvent);
		assert.ok(fnHandleButtonPress.calledWith(oProps), "Button press handler invoked after 'onsapdown' event.");

		fnHandleButtonPress.restore();
		fnHandleButtonPress = sinon.spy(this.sut, "_handleButtonPress");
		this.sut.onsapupmodifiers(oEvent);
		assert.ok(fnHandleButtonPress.calledWith(oProps), "Button press handler invoked after 'onsapupmodifiers' event.");

		fnHandleButtonPress.restore();
		fnHandleButtonPress = sinon.spy(this.sut, "_handleButtonPress");
		this.sut.onsapdownmodifiers(oEvent);
		assert.ok(fnHandleButtonPress.calledWith(oProps), "Button press handler invoked after 'onsapdownmodifiers' event.");

		fnHandleButtonPress.restore();
		fnHandleButtonPress = sinon.spy(this.sut, "_handleButtonPress");

		assert.equal(fnStopPropagationSpy.callCount, 4, "'stopPropagation' called for each keyboard arrow interaction event");

		this.sut.onsapshow();
		assert.ok(fnHandleButtonPress.calledWith(oProps), "Button press handler invoked after 'onsapshow' event.");

		fnStopPropagationSpy.restore();
	});

	QUnit.test("Menu opens again when opened by SPACE after closing by ESCAPE or TAB", function(assert) {
		var oEvent = new jQuery.Event(),
			oButton = this.sut.getAggregation('_button'),
			oMenu;

		// Act
		oButton.focus();
		oEvent.which = KeyCodes.SPACE;
		oButton.onkeydown(oEvent);
		oButton.onkeyup(oEvent);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(jQuery('.sapMMenu').length, 1, "Opened control is visible after SPACE is clicked");

		// Act
		oEvent.which = KeyCodes.ESCAPE;
		oMenu = this.sut.getMenu()._getMenu();
		oMenu.onsapescape(oEvent);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(jQuery('.sapMMenu').length, 0, "Menu is closed after ESCAPE is pressed");

		// Act
		oButton.focus();
		oEvent.which = KeyCodes.SPACE;
		oButton.onkeydown(oEvent);
		oButton.onkeyup(oEvent);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(jQuery('.sapMMenu').length, 1, "Opened control is visible after SPACE is clicked");

		// Act
		oEvent.which = KeyCodes.TAB;
		oMenu = this.sut.getMenu()._getMenu();
		oMenu.onsaptabnext(oEvent);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(jQuery('.sapMMenu').length, 0, "Menu is closed after TAB is pressed");

		oButton.focus();
		oEvent.which = KeyCodes.SPACE;
		oButton.onkeydown(oEvent);
		oButton.onkeyup(oEvent);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(jQuery('.sapMMenu').length, 1, "Opened control is visible after SPACE is clicked");
	});

	QUnit.test("Open and close if the menu contains only disabled items", function(assert) {
		this.oMenuItem1.setEnabled(false);
		this.oMenuItem2.setEnabled(false);
		oCore.applyChanges();

		this.sut.openMenuByKeyboard();

		var oFakeEvent = { keyCode: 13};

		this.sut.handleKeydown(oFakeEvent);

		assert.strictEqual(this.sut._bPopupOpen, false, "The Menu was closed");

		this.oMenuItem1.setEnabled(true);
		this.oMenuItem2.setEnabled(true);
	});

	QUnit.test("Escape closes the menu if it contains only disabled items", function(assert) {
		var oEvent = new jQuery.Event();

		this.oMenuItem1.setEnabled(false);
		this.oMenuItem2.setEnabled(false);
		oCore.applyChanges();

		this.sut.openMenuByKeyboard();

		// Act
		oEvent.which = KeyCodes.ESCAPE;
		this.sut.onsapescape(oEvent);

		// Assert
		assert.strictEqual(this.sut._bPopupOpen, false, "The Menu in Regular mode was closed by pressing Escape");

		// Act
		this.sut.setButtonMode("Split");
		oCore.applyChanges();
		this.sut.openMenuByKeyboard();
		this.sut.onsapescape(oEvent);

		// Assert
		assert.strictEqual(this.sut._bPopupOpen, false, "The Menu in Split mode was closed by pressing Escape");


		this.oMenuItem1.setEnabled(true);
		this.oMenuItem2.setEnabled(true);
	});

	QUnit.test("_menuItemSelected is fired", function(assert) {
		var fnHandleMenuItemSelected = sinon.spy();
		this.sut.attachEvent("_menuItemSelected", fnHandleMenuItemSelected);

		this.sut.getMenu().fireItemSelected({item: this.sut.getMenu().getItems()[0]});
		this.clock.tick(1000);
		assert.strictEqual(fnHandleMenuItemSelected.calledOnce, true, "_menuItemSelected handler is notified");


		this.sut.setButtonMode(MenuButtonMode.Split);
		this.sut.getMenu().fireItemSelected({item: this.sut.getMenu().getItems()[0]});
		this.clock.tick(1000);
		assert.strictEqual(fnHandleMenuItemSelected.calledTwice, true, "_menuItemSelected handler is notified in split Mode");
	});

	QUnit.test('Regular mode beforeMenuOpen event', function (assert) {
		this.sut.destroy();
		this.sut = null;
		this.sut = new MenuButton({
			beforeMenuOpen : function () {}
		});
		this.sut.setButtonMode(MenuButtonMode.Regular);
		this.sut.placeAt("content");
		oCore.applyChanges();

		var fnFireBeforeMenuOpen = sinon.spy(this.sut, "fireBeforeMenuOpen");
		this.sut.getAggregation('_button').firePress();

		this.clock.tick(1000);

		assert.strictEqual(this.sut.getAggregation('_button').getMetadata().getName() === 'sap.m.Button', true, 'Normal sap m button.');
		assert.strictEqual(jQuery('.sapMMenuBtnSplit').length, 0, 'Split button not rendered');
		assert.strictEqual(jQuery('.sapMMenuBtn').length, 1, 'Normal button rendered');
		assert.strictEqual(fnFireBeforeMenuOpen.calledOnce, true, 'BeforeMenuOpen event fired.');

	});

	QUnit.test('SplitButton mode', function (assert) {
		this.sut.destroy();
		this.sut = null;
		this.sut = new MenuButton({
			buttonMode: MenuButtonMode.Split,
			defaultAction : function () {},
			beforeMenuOpen : function () {}
		});
		this.sut.placeAt("content");
		oCore.applyChanges();

		var fnFireDefaultAction = sinon.spy(this.sut, "fireDefaultAction"),
			fnFireBeforeMenuOpen = sinon.spy(this.sut, "fireBeforeMenuOpen");
		this.sut.getAggregation('_button').firePress();

		this.clock.tick(1000);
		assert.strictEqual(this.sut.getAggregation('_button').getMetadata().getName() === 'sap.m.SplitButton', true, 'Split button.');
		assert.strictEqual(jQuery('.sapMMenuBtnSplit').length, 1, 'Split button rendered');
		assert.strictEqual(fnFireDefaultAction.calledOnce, true, 'Default action called.');

		this.sut.getAggregation('_button').getAggregation('_arrowButton').firePress();
		assert.strictEqual(fnFireBeforeMenuOpen.calledOnce, true, 'BeforeMenuOpen event fired.');

		var handlerCalled = 0;
		this.oMenu = new Menu({
			items : [
				new MenuItem({text: 'item1'}),
				new MenuItem({text: 'item2'})
			],
			itemSelected : function () {
				handlerCalled++;
			}
		});
		this.sut.setMenu(this.oMenu);
		this.sut.getAggregation('_button')._getArrowButton().firePress();
		this.clock.tick(1000);
		this.sut.getMenu().fireItemSelected({item: this.sut.getMenu().getItems()[0]});
		this.clock.tick(1000);
		this.sut.getAggregation('_button').firePress();
		assert.strictEqual(handlerCalled, 2, 'The itemSelected handler of the menu is called when the text button is pressed after an item is selected.');
		this.clock.tick(1000);
		assert.strictEqual(jQuery('.sapMBtnContent').text(), '', 'Button text remains unchanged when no default text is set.');

		this.sut.setText('default text');
		this.clock.tick(1000);
		this.sut.getAggregation('_button').firePress();
		assert.strictEqual(handlerCalled, 3, 'The itemSelected handler of the menu is called when the text button is pressed after an item is selected.');
		this.clock.tick(1000);
		assert.strictEqual(jQuery('.sapMBtnContent').text(), 'item1', 'Button text corresponds to the last selected item.');


		this.sut.setButtonMode(MenuButtonMode.Regular);
		this.clock.tick(1000);
		assert.strictEqual(this.sut.getAggregation('_button').getMetadata().getName() === 'sap.m.Button', true, 'Normal sap m button.');
		assert.strictEqual(jQuery('.sapMMenuBtnSplit').length, 0, 'Split button not rendered');
		assert.strictEqual(jQuery('.sapMMenuBtn').length, 1, 'Normal button rendered');

		this.sut.setButtonMode(MenuButtonMode.Split);
		this.clock.tick(1000);
		assert.strictEqual(this.sut.getAggregation('_button').getMetadata().getName() === 'sap.m.SplitButton', true, 'Split button.');
		assert.strictEqual(jQuery('.sapMMenuBtnSplit').length, 1, 'Split button rendered');
	});

	QUnit.module("SplitButton integration", {
		beforeEach: function () {
			this.sut = new MenuButton({
				buttonMode: MenuButtonMode.Split,
				text: "Example",
				tooltip: "This is a test tooltip",
				menu: new Menu({
					items: [
						new MenuItem("menuitem1", { text:"Item1" }),
						new MenuItem("menuitem2", { text:"Item2" })
					]
				})
			});
			this.sut.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("setProperty", function(assert) {
		var oSpyControlSetProperty = this.spy(Control.prototype, "setProperty"),
			oSpyButtonSetProperty = this.spy(SplitButton.prototype, "setProperty");

		//Some values of 'type' property are forbidden
		//Act
		this.sut.setProperty("type", ButtonType.Back, true);

		//Assert
		assert.ok(!oSpyControlSetProperty.called, "Control's setProperty not called because values are forbidden");

		oSpyControlSetProperty.resetHistory();

		//Test allowed values of 'type' also
		//Act
		this.sut.setProperty("type", ButtonType.Emphasized, true);

		//Assert
		assert.ok(oSpyControlSetProperty.calledOn(this.sut), "Control's setProperty called on menu button");
		assert.ok(oSpyControlSetProperty.calledWith("type", ButtonType.Emphasized, true), "Control's setProperty called");


		//'textDirection' and other properties are propagated to the inner button
		//while 'type' is not

		//Assert
		assert.ok(!oSpyButtonSetProperty.called, "SplitButton's setProperty not called for type property");

		//Act
		this.sut.setProperty("textDirection", TextDirection.RTL);

		//Assert
		assert.ok(oSpyButtonSetProperty.calledWith("textDirection", TextDirection.RTL), "SplitButton's setProperty called for textDirection property");

		//Act
		this.sut.setProperty("enabled", false);

		//Assert
		assert.ok(oSpyButtonSetProperty.calledWith("enabled", false), "SplitButton's setProperty called for enabled property");

		//Act
		this.sut.setProperty("visible", false);

		//Assert
		assert.ok(oSpyButtonSetProperty.calledWith("visible", false), "SplitButton's setProperty called for visible property");
	});

	QUnit.test("_getFocusDomRef", function(assert) {
		assert.strictEqual(this.sut.getFocusDomRef(), this.sut._getButtonControl().getDomRef(), "focus dom ref is right");
	});

	QUnit.test("_handleButtonPress", function(assert) {
		var oSpySetArrowState = this.spy(SplitButton.prototype, "setArrowState"),
			oSpyMenuOpenBy = this.spy(Menu.prototype, "openBy");

		//Act
		this.sut._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		//Assert
		assert.ok(oSpySetArrowState.calledOnce, "SplitButton's setArrowState called exactly once");
		assert.ok(oSpySetArrowState.calledWith(true), "SplitButton's setArrowState(true) called");
		assert.ok(oSpyMenuOpenBy.calledOnce, "Menu's openBy called exactly once");
		assert.ok(oSpyMenuOpenBy.calledWith(this.sut, false), "Menu's openBy(menubutton, false) called");
		assert.ok(oSpyMenuOpenBy.args[0][2], Dock.BeginTop, "Menu's openBy default parameter sDockMy is BeginTop");
		assert.ok(oSpyMenuOpenBy.args[0][3], Dock.BeginBottom, "Menu's openBy default parameter sDockAt is BeginBottom");
		assert.ok(oSpyMenuOpenBy.args[0][4], "0 -2", "Menu's openBy default parameter sOffset is '0 -2'");

		oSpySetArrowState.resetHistory();
		oSpyMenuOpenBy.resetHistory();

		//Act
		this.sut.destroyMenu();
		this.sut._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		//Assert
		assert.ok(!oSpySetArrowState.called, "SplitButton's setArrowState not called");
		assert.ok(!oSpyMenuOpenBy.called, "Menu's openBy not called");
	});

	QUnit.test("open menu with correct params", function(assert) {
		var oSpyMenuOpenBy = this.spy(Menu.prototype, "openBy");

		this.sut.setMenuPosition(Dock.EndTop);

		//Act
		this.sut._handleButtonPress({
			getParameter: function() {
				return false;
			}
		});

		//Assert
		assert.equal(oSpyMenuOpenBy.args[0][2], Dock.EndBottom, "Menu's openBy default parameter sDockMy is EndBottom");
		assert.equal(oSpyMenuOpenBy.args[0][3], Dock.EndTop, "Menu's openBy default parameter sDockAt is EndTop");
		assert.equal(oSpyMenuOpenBy.args[0][4], "0 +2", "Menu's openBy default parameter sOffset is '0 +2'");
	});

	QUnit.test("_menuClosed", function(assert) {
		var oSpy = this.spy(SplitButton.prototype, "setArrowState");
		this.sut._menuClosed();

		//Assert
		assert.ok(oSpy.calledOnce, "SplitButton's setArrowState called exactly once");
		assert.ok(oSpy.calledWith(false), "SplitButton's setArrowState(false) called");
	});

	QUnit.test("SplitButton's setArrowState", function(assert) {
		var oSplitButton = this.sut._getButtonControl(),
			$SplitButtonArrow = oSplitButton._getArrowButton().$();

		//Assert
		assert.ok(!$SplitButtonArrow.hasClass("sapMSBActive"), "Arrow is not active");

		//Act
		oSplitButton.setArrowState(true);

		//Assert
		assert.ok($SplitButtonArrow.hasClass("sapMSBActive"), "Arrow is active");

		//Act
		oSplitButton.setArrowState(false);

		//Assert
		assert.ok(!$SplitButtonArrow.hasClass("sapMSBActive"), "Arrow is not active");
	});

	QUnit.test("rerendering in static area", function(assert) {

		var oMenuButton = new MenuButton({
			buttonMode: MenuButtonMode.Split,
			text: "Example",
			menu: new Menu({
				items: [
					new MenuItem({ text:"Item1" }),
					new MenuItem({ text:"Item2" })
				]
			})
		}),
		oPopover = new Popover({content: [
			oMenuButton
		]}),
		oButton = new Button({press: function() {
			oPopover.openBy(oButton);
		}});

		oButton.placeAt('content'); // popover opens only if opening button is rendered
		oCore.applyChanges();

		oButton.firePress(); // press to open the popover
		this.clock.tick(1000);

		// check width after first rendering
		assert.ok(oMenuButton.$().width() > 1, "width is greater than 1");

		//act
		oPopover.invalidate();
		oCore.applyChanges();

		// check width after rerendering
		assert.ok(oMenuButton.$().width() > 1, "width is still greater than 1 after rerendering");

		oPopover.destroy();
		oButton.destroy();
	});


	QUnit.module("SplitButton alone", {
		beforeEach: function() {
			this.sut = new SplitButton();
		},
		afterEach: function() {
			this.sut.destroy();
			this.sut = null;
		},
		keydown: function(which) {
			var oEvent = new jQuery.Event();
			oEvent.which = which;

			this.sut.onkeydown(oEvent);
		},
		keyup: function(which) {
			var oEvent = new jQuery.Event();
			oEvent.which = which;

			this.sut.onkeyup(oEvent);
		}
	});

	QUnit.test("Keyboard handling", function(assert) {
		var oSplitButtonMain = this.sut._getTextButton(),
			oSplitButtonArrow = this.sut._getArrowButton(),
			oSpyTextButtonPress = this.spy(oSplitButtonMain, "firePress"),
			oSpyArrowButtonPress = this.spy(oSplitButtonArrow, "firePress");

		this.sut.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		this.keydown(KeyCodes.ENTER);

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 1, "Main button firePress called");
		assert.ok(oSplitButtonMain.$("inner").hasClass("sapMBtnActive"), "the main button is styled as active");

		//Act
		this.keyup(KeyCodes.ENTER);

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 1, "Main button firePress called");
		assert.notOk(oSplitButtonMain.$("inner").hasClass("sapMBtnActive"), "the main button is not active");

		//Act
		this.keydown(KeyCodes.SPACE);

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 1, "Main button firePress called");
		assert.ok(oSplitButtonMain.$("inner").hasClass("sapMBtnActive"), "the main button is styled as active");

		//Act
		this.keyup(KeyCodes.SPACE);

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress called");
		assert.ok(!oSpyArrowButtonPress.called, "Arrow button firePress not called");
		assert.notOk(oSplitButtonMain.$("inner").hasClass("sapMBtnActive"), "the main button is not active");

		//Act
		this.sut.onsapup();

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress not called");
		assert.strictEqual(oSpyArrowButtonPress.callCount, 1, "Arrow button firePress called");

		//Act
		this.sut.onsapdown();

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress not called");
		assert.strictEqual(oSpyArrowButtonPress.callCount, 2, "Arrow button firePress called");

		//Act
		this.sut.onsapupmodifiers();

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress not called");
		assert.strictEqual(oSpyArrowButtonPress.callCount, 3, "Arrow button firePress called");

		//Act
		this.sut.onsapdownmodifiers();

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress not called");
		assert.strictEqual(oSpyArrowButtonPress.callCount, 4, "Arrow button firePress called");

		//Act
		this.sut.onsapshow({ preventDefault: function() {} });

		//Assert
		assert.strictEqual(oSpyTextButtonPress.callCount, 2, "Main button firePress not called");
		assert.strictEqual(oSpyArrowButtonPress.callCount, 5, "Arrow button firePress called");
	});

	QUnit.module("Other");

	QUnit.test("Focus is returned back the the opener DOM ref, when the menu is closed with F4", function(assert) {
		// arrange
		var oMenu = new UnifiedMenu(),
			oMenuItem = new UnifiedMenuItemBase();

		oMenuItem.setParent(oMenu);
		oMenu.open(true);
		oCore.applyChanges();

		assert.ok(oMenu.isOpen(), "Menu has been opened by keyboard");

		// act
		oMenuItem.onsapshow({
			preventDefault: function() {}
		});

		oCore.applyChanges();

		// assert
		assert.equal(oMenu.bIgnoreOpenerDOMRef, false , "Focused is returned to the opener DOM ref");

		// clean
		oMenu.destroy();
		oMenuItem.destroy();
	});

	QUnit.test("Exception is not thrown when the control is extended", function (assert) {
		// Arrange
		var CustomMenuButton = new MenuButton.extend("myMB", {
				metadata: {
					properties: {
						myProp: {type: "string"}
					}
				}
			}),
			bError,
			oCMB;

		try {
			oCMB = new CustomMenuButton({
				myProp: "bla",
				buttonMode: "Regular"
			});
		} catch (error) {
			bError = true;
		}

		// Assert
		assert.notOk(bError, "There is no exception thrown");

		// Clenaup
		oCMB.destroy();
	});
});