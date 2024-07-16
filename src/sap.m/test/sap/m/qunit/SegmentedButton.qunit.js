/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/m/OverflowToolbar",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/ChangeReason",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/CustomData",
	"sap/ui/core/LayoutData",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Element,
	Library,
	SegmentedButton,
	SegmentedButtonItem,
	Button,
	coreLibrary,
	OverflowToolbar,
	Label,
	JSONModel,
	ChangeReason,
	jQuery,
	CustomData,
	LayoutData,
	InvisibleText,
	XMLView,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	var IMAGE_PATH = "test-resources/sap/m/images/";

	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	/* =========================================================== */
	/* Initialize module                                           */
	/* =========================================================== */

	QUnit.module("Init");

	QUnit.test("Initial Check", function(assert) {
		// System under Test
		var oSegmentedButton = new SegmentedButton();

		// Act
		var s1 = Element.getElementById(oSegmentedButton.getId());

		// Assert
		assert.ok((s1 !== undefined) && (s1 != null), "SegmentedButton should be found");

		// Cleanup
		oSegmentedButton.destroy();
	});

	QUnit.test("clone", function(assert) {
		//arrange
		var oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({ text: 'a' }),
					new SegmentedButtonItem({ text: 'b' })
				]
			}),
			oSBClone;

		oSB.setSelectedButton(oSB.getButtons()[1]);

		//act
		oSBClone = oSB.clone();

		//assert
		assert.equal(oSBClone.getButtons().length, oSB.getButtons().length, "cloning has the same number of buttons");
		assert.equal(oSBClone.getSelectedButton(), oSBClone.getButtons()[1].getId(), "cloning has the same button selected");
	});

	/* =========================================================== */
	/* Render module                                               */
	/* =========================================================== */

	QUnit.module("Render");

	QUnit.test("Accessibility state is written when SegmentedButton is rendered as a sap.m.Select", function(assert) {
		// prepare
		var oSegmentedButton = new SegmentedButton({
				ariaLabelledBy: [
					new Label("labelledBy_test", {text: "labelledBy_test"})
				],
				ariaDescribedBy: [
					new Label("describedBy_test", {text: "describedBy_test"})
				]
			}),
			oSelect;

		// act
		oSegmentedButton._toSelectMode();
		oSelect = oSegmentedButton.getAggregation("_select");

		// assert
		assert.equal(oSelect.getAriaLabelledBy()[0], "labelledBy_test", "select control has corret ariaLabelledBy values from sap.m.SegmentedButton");
		assert.equal(oSelect.getAriaLabelledBy()[1], "describedBy_test", "select control has corret ariaDescribedBy values from sap.m.SegmentedButton");

		// clean
		oSegmentedButton.destroy();
	});

	QUnit.test("Initialize with items aggregation", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					text: "Button 2"
				}),
				new SegmentedButtonItem({
					text: "Button 3"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getItems().length, 3, "Control should have 3 items");
		assert.strictEqual(oSegmentedButton.getButtons().length, 3, "Control should have 3 buttons from the button aggregation");
		assert.strictEqual(oSegmentedButton.$().find("li").length, 3, "Control should have 3 buttons rendered");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Items aggregation tooltip", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					text: "Button 1",
					tooltip: "Tooltip 1"
				}),
				new SegmentedButtonItem({
					text: "Button 2"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		var aButtons = oSegmentedButton.getButtons(),
			$button1 = aButtons[0].$(),
			$button2 = aButtons[1].$();


		assert.strictEqual($button1.attr("title"), "Tooltip 1", "First button should have a title with the setted value");
		assert.strictEqual($button2.attr("title"), undefined, "There should be no title for the second button");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Items aggregation visible property", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					text: "Button 2"
				}),
				new SegmentedButtonItem({
					text: "Button 3"
				}),
				new SegmentedButtonItem({
					text: "Invisible Button",
					visible: false
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getItems().length, 4, "Control should have 4 items");
		assert.strictEqual(oSegmentedButton.getButtons().length, 4, "Control should have 4 buttons from the button aggregation");
		assert.strictEqual(oSegmentedButton.$().find("li.sapMSegBBtn").length, 3, "Control should have 3 buttons visible");
		assert.strictEqual(oSegmentedButton.$().find("li.sapUiHiddenPlaceholder").length, 1, "Control should have 1 button invisible");

		//Act
		oSegmentedButton.getItems()[3].setVisible(true);
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(oSegmentedButton.$().find("li.sapMSegBBtn").length, 4, "Control should have 4 buttons visible");
		assert.strictEqual(oSegmentedButton.$().find("li.sapUiHiddenPlaceholder").length, 0, "Control should have 0 button invisible");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("selectedKey is set correctly for invisible items and removes the selection from other items", async function(assert) {

		//Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					key: "k1",
					text: "item 1"
				}),
				new SegmentedButtonItem({
					key: "k2",
					text: "item 2",
					visible: false
				}),
				new SegmentedButtonItem({
					key: "k3",
					text: "item 3"
				})
			],
			selectedKey: "k1"
		});

		//System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(oSegmentedButton.$().find("li.sapMSegBBtn.sapMSegBBtnSel").length, 1, "1 selected button is rendered");

		//Act
		oSegmentedButton.setSelectedKey("k2");
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(oSegmentedButton.getSelectedButton(), oSegmentedButton.getButtons()[1].getId(), "The invisible button is selected");
		assert.strictEqual(oSegmentedButton.$().find("li.sapMSegBBtn.sapMSegBBtnSel").length, 0, "No selected buttons are rendered");

		//Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Initialize with XML view", async function(assert) {

		// Arrange
		var xmlData = '<mvc:View\
		xmlns="sap.m"\
		xmlns:mvc="sap.ui.core.mvc">\
		<SegmentedButton\
		id="XMLSegmentedButton"\
		selectedKey="b2">\
		<items>\
		<SegmentedButtonItem key="b1" text="Btn 1" />\
		<SegmentedButtonItem key="b2" text="Btn 2" />\
		<SegmentedButtonItem key="b3" text="Btn 3" />\
		</items>\
		</SegmentedButton>\
		</mvc:View>';

		var oView = await XMLView.create({
			definition: xmlData
		});
		var oSegmentedButton = oView.byId("XMLSegmentedButton");

		// System under Test
		oView.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getItems().length, 3, "Control should have 3 items");
		assert.strictEqual(oSegmentedButton.getButtons().length, 3, "Control should have 3 buttons from the button aggregation");
		assert.strictEqual(oSegmentedButton.$().find("li").length, 3, "Control should have 3 buttons rendered");
		assert.strictEqual(oSegmentedButton.getButtons()[0].getText(), "Btn 1", "Button text should be equal to xml view ListItem text");
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b2", "selectedKey should be 'b2'");

		// Cleanup
		oView.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("ID's of internal elements properly set/rendered", async function(assert) {

		var sItemIdComponent = "segmentedButtonItem-",
			aButtons,
			oSegmentedButton,
			getExpectedButtonId,
			getExpectedImageId,
			i = 0;

		getExpectedButtonId = function (iIndex) {
			return sItemIdComponent + iIndex + "-button";
		};

		getExpectedImageId = function (iIndex) {
			return sItemIdComponent + iIndex + "-button-img";
		};

		// Arrange
		oSegmentedButton = new SegmentedButton("segmentedButton", {
			items: [
				new SegmentedButtonItem(sItemIdComponent + 0, {
					icon: "sap-icon://home",
					text: "Button 1"
				}),
				new SegmentedButtonItem(sItemIdComponent + 1, {
					icon: "sap-icon://home",
					text: "Button 2"
				}),
				new SegmentedButtonItem(sItemIdComponent + 2, {
					icon: IMAGE_PATH + "candy_star_46x46.png",
					text: "Button 3"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		aButtons = oSegmentedButton.getButtons();

		// Assert
		for (;i < aButtons.length;i++) {
			// Buttons
			assert.strictEqual(aButtons[i].getId(), getExpectedButtonId(i),
					"Internal button id should be equal to the expected id");

			assert.strictEqual(aButtons[i].$().attr("id"), getExpectedButtonId(i),
					"Rendered button id should be equal to the expected id");

			// Images|icons
			assert.strictEqual(aButtons[i].$().find(".sapMBtnIcon").attr("id"), getExpectedImageId(i),
					"Rendered image id should be equal to the expected id");
		}

		// Cleanup
		aButtons = null;
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Using the .sapMSegmentedButtonNoAutoWidth CSS class", async function (assert) {

		// Arrange
		var oSB,
			aButtons,
			iBtn1Width,
			iBtn2Width,
			iBtn3Width,
			iBtn4Width;

		oSB = new SegmentedButton({
			items: [
					new SegmentedButtonItem({text: "All"}),
					new SegmentedButtonItem({text: "Some long text"}),
					new SegmentedButtonItem({text: "Other long text"}),
					new SegmentedButtonItem({text: "All"})
			]
		}).addStyleClass("sapMSegmentedButtonNoAutoWidth").placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		aButtons = oSB.getButtons();

		iBtn1Width = Math.ceil(aButtons[0].getDomRef().getBoundingClientRect().width);
		iBtn2Width = Math.ceil(aButtons[1].getDomRef().getBoundingClientRect().width);
		iBtn3Width = Math.ceil(aButtons[2].getDomRef().getBoundingClientRect().width);
		iBtn4Width = Math.ceil(aButtons[3].getDomRef().getBoundingClientRect().width);

		// Assert
		assert.ok(iBtn1Width > 0, "The width of the first button is greater than zero");
		assert.strictEqual(iBtn1Width, iBtn4Width, "The width of the first button is equal to the width of the last button");
		assert.ok((iBtn1Width * 2) < iBtn2Width, "The width of the first button multiplied is greater than the second button");
		assert.ok((iBtn1Width * 2) < iBtn3Width, "The width of the first button multiplied is greater than the third button");
		assert.ok((iBtn4Width * 2) < iBtn2Width, "The width of the last button multiplied is greater than the second button");
		assert.ok((iBtn4Width * 2) < iBtn3Width, "The width of the last button multiplied is greater than the third button");

		// Cleanup
		aButtons = null;
		iBtn1Width = null;
		iBtn2Width = null;
		iBtn3Width = null;
		iBtn4Width = null;
		oSB.destroy();
		oSB = null;
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Too long SegmentedButton inside the OveflowToolbar", async function (assert) {

		// Arrange
		var oSB,
			oOTB,
			iWidth = jQuery("#qunit-fixture").width();

		jQuery("#qunit-fixture").css({ width: "160px" });

		oSB = new SegmentedButton({
			items: [
				new SegmentedButtonItem({text: "Button 1"}),
				new SegmentedButtonItem({text: "Button 2"})
			]
		});

		oOTB = new OverflowToolbar({
			content: [ oSB ]
		}).placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oOTB._getOverflowButtonNeeded(), "The SegmentedButton is hidden and Overflow button is visible.");

		// Cleanup
		jQuery("#qunit-fixture").css({ width: iWidth });
		oSB.destroy();
		oSB = null;
		oOTB.destroy();
		oOTB = null;
		await nextUIUpdate(this.clock);
	});

	/* =========================================================== */
	/* Event module                                                */
	/* =========================================================== */

	QUnit.module("Event");

	//BCP: 1770067241
	QUnit.test("SegmentedItem press", async function(assert) {
		//arrange
		var fnOnPress = function(oEvent) {
				sSelectedKeyInsidePressHandler = oSB.getSelectedKey();
				bFired = true;
			},
			oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({
						key: 'KEY1',
						text: 'First',
						press: fnOnPress
					}),
					new SegmentedButtonItem({
						key: 'KEY2',
						text: 'Second',
						press: fnOnPress
					})
				]
			}).placeAt('qunit-fixture'),
			sSelectedKeyInsidePressHandler,
			bFired,
			fnFireSelectionChangeSpy;

		fnFireSelectionChangeSpy = this.spy(oSB, "fireSelectionChange");
		await nextUIUpdate(this.clock);

		//act
		oSB.getButtons()[1].firePress();

		//assert
		assert.ok(bFired, 'item fires press when a button is pressed');
		assert.equal(sSelectedKeyInsidePressHandler, "KEY1", 'item fires press before the selected key changes');
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "SelectionChange is fired");
		assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].item, oSB.getItems()[1],
				"SelectionChange is returning the right reference to the selected item");

		//clean
		oSB.destroy();
		await nextUIUpdate(this.clock);
	});

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	QUnit.test("SegmentedButton setSelectedItem API call", async function(assert) {

		// Arrange
		var oButton1 = new SegmentedButtonItem({text : "first button"}),
			oButton2 = new SegmentedButtonItem({text : "second button"}),
			oButton3 = new SegmentedButtonItem({text : "third button"}),
			oThisForChaining,
			oLabel = new Label("label", {});

		// System under test
		var oSegmentedButton = new SegmentedButton({
			items : [oButton1, oButton2, oButton3]
		});

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), oButton1.getId(),
				"initially the first button is selected");
		assert.ok(oButton1.$().hasClass("sapMSegBBtnSel"),
				"the first button's DOM element initially has style class \"sapMSegBBtnSel\"");

		// Act
		oThisForChaining = oSegmentedButton.setSelectedItem(oButton2);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), oButton2.getId(), "now the second button is selected");
		assert.ok(oButton2.$().hasClass("sapMSegBBtnSel"), "the second button's DOM element has style class \"sapMSegBBtnSel\"");
		assert.ok(oThisForChaining instanceof SegmentedButton, "the setter should return 'this' instance of the control itself to enable chaining");

		// Act
		oSegmentedButton.setSelectedItem("label");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), "label",
				"selectedItem association contains an existing id from another control and this does not break the control, only removes the selection style");
		assert.ok(!oButton2.$().hasClass("sapMSegBBtnSel"),
				"the last button's DOM element does not have style class \"sapMSegBBtnSel\" anymore");

		// Act
		oSegmentedButton.setSelectedItem(oLabel);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), oLabel.getId(),
				"selectedItem association contains an existing another control, not SegmentedButtonItem and this does not break the control, only removes the selection style");

		// Act
		oSegmentedButton.setSelectedItem(undefined);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), oSegmentedButton.getItems()[0].getId(),
				"When selectedItem is set to undefined, the selection goes to the first item");
		assert.ok(oButton1.$().hasClass("sapMSegBBtnSel"),
				"the first button does have the coresponding selected style class");

		// Act
		oSegmentedButton.setSelectedItem(oButton3.getId());
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), oButton3.getId(), "now the third button is selected");
		assert.ok(oButton3.$().hasClass("sapMSegBBtnSel"), "the third button's DOM element has style class \"sapMSegBBtnSel\"");

		// Act
		oSegmentedButton.setSelectedItem("mumpitz");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedItem(), "mumpitz", "selectedItem association contains \"mumpitz\"");
		assert.ok(!oButton3.$().hasClass("sapMSegBBtnSel"),
				"the third button's DOM element does not have style class \"sapMSegBBtnSel\" anymore");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("getSelectedKey()", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			selectedKey: "b2",
			items: [
				new SegmentedButtonItem({
					key: "b1",
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					key: "b2",
					text: "Button 2"
				}),
				new SegmentedButtonItem({
					key: "b3",
					text: "Button 3"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b2", "selectedKey should be 'b2'");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("when using items & setSelectedKey() is called, setSelectedButton() is called too", async function(assert) {
		// Arrange
		var oItem1 = new SegmentedButtonItem({
			key: "b1",
			text: "Button 1"
		});
		var oItem2 = new SegmentedButtonItem({
			key: "b2",
			text: "Button 2"
		});
		var oItem3 = new SegmentedButtonItem({
			key: "b3",
			text: "Button 3"
		});

		var oSetSelectedButtonSpy = this.spy(SegmentedButton.prototype, 'setSelectedButton');

		// System under Test
		var oSegmentedButton = new SegmentedButton({
			items : [oItem1, oItem2, oItem3],
			selectedKey : "b2"
		});

		assert.equal(oSetSelectedButtonSpy.callCount, 1, "setSelectedButton is called");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("setSelectedKey()", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					key: "b1",
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					key: "b2",
					text: "Button 2"
				}),
				new SegmentedButtonItem({
					key: "b3",
					text: "Button 3"
				})
			]
		}),
		oThisForChaining;

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b1", "When not set selectedKey should be equal to the first key in the list 'b1'");
		assert.strictEqual(oSegmentedButton.getProperty("selectedKey"), "b1", "When not set selectedKey property should be equal to the first key in the list 'b1'");

		// Act
		// Change selectedKey to "b2"
		oThisForChaining = oSegmentedButton.setSelectedKey("b2");

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b2", "selectedKey should be 'b2'");
		assert.strictEqual(oSegmentedButton.getProperty("selectedKey"), "b2", "selectedKey property should be 'b2'");
		assert.ok(oThisForChaining instanceof SegmentedButton, "the setter should return 'this' instance of the control itself to enable chaining");

		// Act
		// Change selectedKey to non existing key
		oSegmentedButton.setSelectedKey("NonexistingKey");

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b2", "selectedKey should be unchanged = 'b2'");
		assert.strictEqual(oSegmentedButton.getProperty("selectedKey"), "b2", "selectedKey property should be unchanged = 'b2'");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("selectedKey property on button press", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					key: "b1",
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					key: "b2",
					text: "Button 2"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		// Click on the second button
		oSegmentedButton.getButtons()[1].$().trigger("tap");
		oSegmentedButton.getButtons()[1].$().trigger("click");

		// Assert
		assert.strictEqual(oSegmentedButton.getProperty("selectedKey"), "b2", "selectedKey property should be 'b2'");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("sap.m.SegmentedButtonItem property update", async function (assert) {

		// Arrange
		var oSBI = new SegmentedButtonItem({
			key: "b1",
			text: "Btn 1"
		});

		var oSegmentedButton = new SegmentedButton({
			items: [
				oSBI
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		oSBI.setText("Btn changed");
		oSBI.setIcon("sap-icon://attachment");
		oSBI.setTextDirection(TextDirection.RTL);
		oSBI.setEnabled(false);
		oSBI.setWidth("300px");
		oSBI.setKey("changed");
		oSegmentedButton.setSelectedKey("changed");

		await nextUIUpdate(this.clock);

		// Assert
		var oButton = oSegmentedButton.getButtons()[0];
		var $LI = jQuery(oSegmentedButton.$().find("li")[0]);

		assert.strictEqual(oButton.getText(), "Btn changed", "Button text should have the new value");
		assert.strictEqual(oButton.getIcon(), "sap-icon://attachment", "Button should have the new value");
		assert.strictEqual(oButton.getTextDirection(), TextDirection.RTL, "Button should have the new value");
		assert.strictEqual(oButton.getEnabled(), false, "Button should have the new value");
		assert.strictEqual(oButton.getWidth(), "300px", "Button should have the new value");
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "changed", "SegmentedButton getSelectedKey() should return the new value");

		assert.strictEqual($LI.text(), "Btn changed", "Rendered li text should have the new value");
		assert.ok($LI.find(".sapMBtnIcon"), "Rendered li should contain a icon span");
		assert.strictEqual($LI.attr("dir"), "rtl", "Rendered li should have attribute dir equal to 'rtl'");
		assert.ok($LI.hasClass("sapMSegBBtnDis"), "Rendered li should have a disabled class");
		assert.strictEqual($LI.outerWidth(), 300, "Rendered li width must be equal the new value");

	});

	QUnit.test("Method 'getFormDoNotAdjustWidth' always returns true", function(assert) {
		// prepare
		var oSB = new SegmentedButton();

		// act
		// assert
		assert.equal(oSB.getFormDoNotAdjustWidth(), true, "The method has returned the correct value.");

		// clean
		oSB.destroy();
	});

	QUnit.module("API Items aggregation", {
		beforeEach: async function () {
			this.oSB = new SegmentedButton().placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oSB.destroy();
			this.oSB = null;
			this.applyChanges = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("addItem", async function (assert) {
		// Arrange
		var aItems,
			aButtons;

		// Act - add first item
		this.oSB.addItem(new SegmentedButtonItem({text: "Button 1"}));
		aItems = this.oSB.getButtons();
		aButtons = this.oSB.getButtons();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(aItems.length, 1, "There should be one item");
		assert.strictEqual(aButtons.length, 1, "There should be one button created");
		assert.strictEqual(aButtons[0].getText(), aItems[0].getText(), "The button text should equal the item test");
		assert.strictEqual(this.oSB.getSelectedButton(), aButtons[0].getId(),
			"The button created should be the selected button");
		assert.ok(aButtons[0].getDomRef().classList.contains("sapMSegBtnLastVisibleButton"), "The last button have sapMSegBtnLastVisibleButton styleClass");

		// Act - add second button and set selection to the newly added button
		this.oSB.addItem(new SegmentedButtonItem({text: "Button 2"}));
		aButtons = this.oSB.getButtons();
		this.oSB.setSelectedButton(aButtons[1]);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getItems().length, 2, "There should be two items");
		assert.strictEqual(aButtons.length, 2, "There should be two buttons created from items");
		assert.strictEqual(this.oSB.getSelectedButton(), aButtons[1].getId(),
			"The second button created should be selected");
		assert.notOk(aButtons[0].getDomRef().classList.contains("sapMSegBtnLastVisibleButton"), "The old last button is remove styleClass sapMSegBtnLastVisibleButton");
		assert.ok(aButtons[1].getDomRef().classList.contains("sapMSegBtnLastVisibleButton"), "The last button have correct style class");

		// Act - add third item
		this.oSB.addItem(new SegmentedButtonItem({text: "Button 3"}));
		aButtons = this.oSB.getButtons();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getItems().length, 3, "There should be three items");
		assert.strictEqual(aButtons.length, 3, "There should be three buttons");
		assert.strictEqual(this.oSB.getSelectedButton(), aButtons[1].getId(),
			"The second button should remain selected");
	});

	QUnit.test("removeItem", async function (assert){
		var aItems;

		// Arrange
		this.oSB.addItem(new SegmentedButtonItem({key: "b1", text: "Button 1"}));
		this.oSB.addItem(new SegmentedButtonItem({key: "b2", text: "Button 2"}));
		this.oSB.addItem(new SegmentedButtonItem({key: "b3", text: "Button 3"}));
		this.oSB.setSelectedKey("b3");
		aItems = this.oSB.getItems();

		// Act - remove Button 2
		this.oSB.removeItem(aItems[1]);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getItems().length, 2, "There are 2 items");
		assert.strictEqual(this.oSB.getButtons().length, 2, "There are 2 buttons");
		assert.strictEqual(this.oSB.$().find("li").length, 2, "There are 2 buttons rendered");
		assert.strictEqual(this.oSB.getSelectedKey(), "b3", "Button with key 'b3' is selected");

		// Act - remove Button 3
		this.oSB.removeItem(aItems[2]);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getButtons().length, 1, "There is one button");
		assert.strictEqual(this.oSB.getSelectedKey(), "b1", "Button with key 'b1' is selected");

		// Act - remove last button
		this.oSB.removeItem(aItems[0]);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getButtons().length, 0, "There are no buttons");
		assert.strictEqual(this.oSB.getSelectedKey(), "", "There is no selected key");
		assert.strictEqual(this.oSB.$().find("li").length, 0, "There are no buttons rendered");

		// Act - adding an item after all ware removed
		this.oSB.addItem(new SegmentedButtonItem({key: "b4", text: "Button 4"}));
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.$().find("li").length, 1, "There is one buttons rendered");
		assert.strictEqual(this.oSB.getSelectedKey(), "b4", "Button with key 'b4' is selected");
	});

	// BCP: 1880235141
	QUnit.test("remove item returns the removed item", function (assert) {
		// Arrange
		var oResult,
			oSegmentedButtonItem1 = new SegmentedButtonItem("item1"),
			oSegmentedButtonItem2 = new SegmentedButtonItem("item2"),
			oSegmentedButton = new SegmentedButton({ items: [oSegmentedButtonItem1, oSegmentedButtonItem2] });

		// Act
		oResult = oSegmentedButton.removeItem(oSegmentedButtonItem1);

		// Assert
		assert.equal(oResult.getId(), oSegmentedButtonItem1.getId(), "removeItem should return the removed item");

		// Cleanup
		oSegmentedButton.destroy();
		oSegmentedButtonItem1.destroy();
		oSegmentedButtonItem2.destroy();
	});

	QUnit.test("insertItem", async function (assert) {
		// Arrange
		this.oSB.addItem(new SegmentedButtonItem({text: "Button 1"}));
		this.oSB.addItem(new SegmentedButtonItem({text: "Button 2"}));

		// Act - insert item between Button 1 and 2
		this.oSB.insertItem(new SegmentedButtonItem({text: "Button 3"}), 1);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getItems().length, 3, "There are 3 items");
		assert.strictEqual(this.oSB.getButtons().length, 3, "There are 3 buttons");
		assert.strictEqual(this.oSB.$().find("li").length, 3, "There are 3 buttons rendered");
		assert.strictEqual(this.oSB.getButtons()[1].getText(), "Button 3",
			"Button with text 'Button 3' should be the second button");
	});

	QUnit.test("removeAllItems", async function (assert) {
		// Arrange
		this.oSB.addItem(new SegmentedButtonItem({key: "b1", text: "Button 1"}));
		this.oSB.addItem(new SegmentedButtonItem({key: "b2", text: "Button 2"}));
		this.oSB.addItem(new SegmentedButtonItem({key: "b3", text: "Button 3"}));
		this.oSB.setSelectedKey("b2");

		// Act
		this.oSB.removeAllItems();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getItems().length, 0, "There are 0 items");
		assert.strictEqual(this.oSB.getButtons().length, 0, "There are 0 buttons");
		assert.strictEqual(this.oSB.getSelectedKey(), "", "There is no selected key");
		assert.strictEqual(this.oSB.getSelectedButton(), null, "There is no selected button");
		assert.strictEqual(this.oSB.$().find("li").length, 0, "There are 0 buttons rendered");
	});

	// BCP: 1880235141
	QUnit.test("remove all items returns the removed items", function (assert) {
		assert.expect(2);
		// Arrange
		var aResult,
			aItems = [new SegmentedButtonItem("item1"), new SegmentedButtonItem("item2")],
			oSegmentedButton = new SegmentedButton({ items: aItems });

		// Act
		aResult = oSegmentedButton.removeAllItems();

		// Assert
		aResult.forEach(function (oRemovedItem, index) {
			assert.equal(oRemovedItem.getId(), aItems[index].getId(), "removeAllItems should remove item " + oRemovedItem.getId());
		});

		// Cleanup
		oSegmentedButton.destroy();
		aItems[0].destroy();
		aItems[1].destroy();
	});


	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	/* =========================================================== */
	/* Helper functionality module                                 */
	/* =========================================================== */

	QUnit.module("Helper functions");

	QUnit.test("_getButtonWidth private method", function (assert) {
		// Arrange
		var oSB = new SegmentedButton(),
			aButtons;

		// Setting internal custom width marker so width calculations will pass
		oSB._bCustomButtonWidth = true;

		// Assert
		aButtons = [
			new Button(),
			new Button({width: "300px"}),
			new Button()
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), "calc(50% - 150px)", "Resulting css width should be calc(50% - 150px)");

		aButtons = [
			new Button(),
			new Button({width: "300px"}),
			new Button({width: "300px"})
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), "calc(100% - 600px)", "Resulting css width should be calc(100% - 600px)");

		aButtons = [
			new Button(),
			new Button(),
			new Button({width: "60%"}),
			new Button({width: "300px"})
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), "calc(20% - 150px)", "Resulting css width should be calc(20% - 150px)");

		aButtons = [
			new Button(),
			new Button({width: "70%"}),
			new Button()
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), "15%", "Resulting css width should be 15%");

		aButtons = [
			new Button({width: "100px"}),
			new Button({width: "100px"}),
			new Button({width: "100px"})
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), false, "Resulting css width should be false because there are no buttons" +
				"without custom widths");

		aButtons = [
			new Button({width: "50%"}),
			new Button({width: "50%"}),
			new Button()
		];
		assert.strictEqual(oSB._getButtonWidth(aButtons), "0%", "Resulting css width should be 0% because the other buttons" +
				" are occupying all the available width");

		// Cleanup
		oSB.destroy();
		oSB = null;
		aButtons = null;
	});

	QUnit.test("_clearAutoWidthAppliedToControl private method", async function (assert) {
		// Arrange
		var oSB,
			aButtons,
			i;

		oSB = new SegmentedButton({
			items: [
				new SegmentedButtonItem({text: "Btn 1"}),
				new SegmentedButtonItem({text: "Btn 2", width: "20px"}),
				new SegmentedButtonItem({text: "Btn 3"})
			]
		}).placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		aButtons = oSB.getButtons();

		// Assert
		assert.ok(oSB.$().attr("style").indexOf("width:") !== -1, "Auto width is applied to control");
		for (i = 0;i < aButtons.length; i++) {
			assert.ok(aButtons[i].$().attr("style").indexOf("width:") !== -1, "Auto|predefined width is applied to internal " +
					"button");
		}

		// Act
		oSB._clearAutoWidthAppliedToControl();

		// Assert
		assert.notOk(oSB.$().attr("style"), "Auto width is removed from control");
		assert.notOk(aButtons[0].$().attr("style"), "Auto width is removed from internal button");
		assert.ok(aButtons[1].$().attr("style").indexOf("20px") !== -1, "Predefined width is not removed from internal button");
		assert.notOk(aButtons[2].$().attr("style"), "Auto width is removed from internal button");

		// Act
		oSB.setWidth("200px");
		aButtons[0].setWidth("10px");
		await nextUIUpdate(this.clock);
		oSB._clearAutoWidthAppliedToControl();

		// Assert
		assert.ok(oSB.$().attr("style").indexOf("200px") !== -1, "Control width is not cleared if predefined");
		assert.ok(aButtons[0].$().attr("style").indexOf("10px") !== -1, "First button width is not cleared if predefined");

		// Cleanup
		oSB.destroy();
		oSB = null;
		aButtons = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_handleContainerResize private method", function (assert) {
		// Arrange
		var oSB = new SegmentedButton({
			items: [
				new SegmentedButtonItem({text: "Btn 1"}),
				new SegmentedButtonItem({text: "Btn 2"}),
				new SegmentedButtonItem({text: "Btn 3"})
			]
		});

		this.spy(oSB, "_clearAutoWidthAppliedToControl");
		this.spy(oSB, "_getRenderedButtonWidths");
		this.spy(oSB, "_updateWidth");

		// Act
		oSB._handleContainerResize();

		// Assert
		assert.ok(oSB._clearAutoWidthAppliedToControl.calledOnce, "Method _clearAutoWidthAppliedToControl called once");
		assert.ok(oSB._getRenderedButtonWidths.calledOnce, "Method _getRenderedButtonWidths called once");
		assert.ok(oSB._updateWidth.calledOnce, "Method _updateWidth called once");

		// Cleanup
		oSB.destroy();
		oSB = null;
	});

	QUnit.test("_updateWidth private method", async function (assert) {
		// Arrange
		var oSB,
			aButtons,
			i;

		oSB = new SegmentedButton({
			items: [
				new SegmentedButtonItem({text: "Btn 1"}),
				new SegmentedButtonItem({text: "Btn 2"}),
				new SegmentedButtonItem({text: "Btn 3"}),
				new SegmentedButtonItem({text: "Btn 4"})
			]
		}).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		aButtons = oSB.getButtons();

		// Act
		oSB._aWidths = [20, 20, 20, 20];
		oSB._updateWidth();

		// Assert
		assert.strictEqual(oSB.$().attr("style"), "width: 81px;", "Result should be sum of all 4 button widths which is 80 " +
				"plus one pixel added for the border");

		// Act
		oSB.setWidth("400px");

		// Assert
		for (i = 0;i < aButtons.length;i++) {
			assert.strictEqual(aButtons[i].$().attr("style"), "width: 25%;", "Width of all buttons should be 25%");
		}

		// Act
		oSB._aWidths = [0, 0, 0, 0];
		oSB._updateWidth();

		// Assert
		assert.notOk(oSB.$().css("width") === "1px", "Corner case when all reported inner buttons width is 0 applied width " +
				"should not be 1px");

		// Cleanup
		aButtons = null;
		oSB.destroy();
		oSB = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_updateWidth - sum of buttons width is greater than parent element width", async function (assert) {
		// Arrange
		var that = this,
			oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({text: "Btn 1"}),
					new SegmentedButtonItem({text: "Btn 2"}),
					new SegmentedButtonItem({text: "Btn 3"}),
					new SegmentedButtonItem({text: "Btn 4"})
				]
			}).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		// Act
		// Here we replace the jQuery.innerWidth method to report stable width for the parent element if the parent
		// element is the qunit-fixture itself
		this._ojQueryInnerWidthMethod = jQuery.fn.innerWidth;
		jQuery.fn.innerWidth = function (sWidth) {
			if (!sWidth && this[0].id === "qunit-fixture") {
				return 100;
			}
			return that._ojQueryInnerWidthMethod.apply(this, arguments);
		};

		oSB._aWidths = [100, 100, 100];
		oSB._updateWidth();

		// Assert
		assert.ok(oSB.$().hasClass("sapMSegBFit"), "The proper class is set");

		// Restore jQuery.innerWidth method
		jQuery.fn.innerWidth = this._ojQueryInnerWidthMethod;

		// Cleanup
		oSB.destroy();
		oSB = null;
		this._ojQueryInnerWidthMethod = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("_handleContainerResize fires _containerWidthChanged event when width is changed", async function (assert) {
		// Arrange
		var oSB = new SegmentedButton({
			items: [
				new SegmentedButtonItem({text: "Btn 1"}),
				new SegmentedButtonItem({text: "Btn 2"}),
				new SegmentedButtonItem({text: "Btn 3"})
			]
		}).placeAt("qunit-fixture");

		this.spy(oSB, "fireEvent");

		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oSB.fireEvent.callCount, 0, "FireEvent is not called on first rendering");

		// Act
		oSB.$().parent().innerWidth("10px");
		oSB._handleContainerResize();

		// Assert
		assert.ok(oSB.fireEvent.calledWith("_containerWidthChanged"), "The _containerWidthChanged event is fired");

		// Cleanup
		oSB.destroy();
		oSB = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("getOverflowToolbarConfig - correct configuration for sap.m.OverflowToolbar control", function (assert) {
		// Arrange
		var oSB = new SegmentedButton(),
			oExpected = {
				canOverflow: true,
				listenForEvents: ["selectionChange"],
				autoCloseEvents: ["selectionChange"], // BCP: 1970012411 In overflow - selection should close the popover.
				propsUnrelatedToSize: ["enabled", "selectedKey"],
				invalidationEvents: ["_containerWidthChanged"],
				onBeforeEnterOverflow: oSB._onBeforeEnterOverflow,
				onAfterExitOverflow: oSB._onAfterExitOverflow
			};

		// Assert
		assert.deepEqual(oSB.getOverflowToolbarConfig(), oExpected,
			"Return object is valid for sap.m.OverflowToolbar configuration");

	});

	/* =========================================================== */
	/* Helper functionality module                                 */
	/* =========================================================== */

	QUnit.module("Data binding");

	QUnit.test("Data binding items aggregation", async function(assert) {
		// Arrange
		var mData = {
			selectedKey: "b7",
			items: [
				{key: "b1", text: "btn 1", icon: "sap-icon://attachment"},
				{key: "b2", text: "btn 2", enabled: false},
				{key: "b3", text: "111 222 333", textDirection: TextDirection.RTL},
				{key: "b4", text: "btn 4", icon: "sap-icon://home"},
				{key: "b5", text: "btn 4", icon: "sap-icon://attachment"},
				{key: "b6", text: "btn 4", width: "100px"},
				{key: "b7", text: "btn 4", icon: "sap-icon://home"},
				{key: "b8", text: "btn 4"}
			]
		};

		// System under Test
		var oSegmentedButton = new SegmentedButton({
			selectedKey: "{/selectedKey}",
			items : {
				path : "/items",
				template : new SegmentedButtonItem({
					key: "{key}",
					text: "{text}",
					icon: "{icon}",
					enabled: "{enabled}",
					textDirection: "{textDirection}",
					width: "{width}"
				})
			}
		});

		var oModel = new JSONModel();
		oModel.setData(mData);

		oSegmentedButton.setModel(oModel);

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getSelectedKey(), oModel.getData().selectedKey,
				"selectedKey property should be equal to Model");

		// Assert
		assert.strictEqual(oSegmentedButton.getItems()[0].getIcon(), oModel.getData().items[0].icon,
				"Button icon should be equal to Model icon");
		assert.strictEqual(oSegmentedButton.getItems()[6].getText(), oModel.getData().items[6].text,
				"Button text should be equal to Model text");
		assert.strictEqual(oSegmentedButton.getItems()[1].getEnabled(), oModel.getData().items[1].enabled,
				"Button enabled property should be equal to Model enabled property");
		assert.strictEqual(oSegmentedButton.getItems()[2].getTextDirection(), oModel.getData().items[2].textDirection,
				"Button textDirection should be equal to Model textDirection");
		assert.strictEqual(oSegmentedButton.getItems()[5].getWidth(), oModel.getData().items[5].width,
				"Button width should be equal to Model text");

		// Act
		mData.items[6].enabled = true;
		mData.items[6].text = "sLabel";

		// Update bindings with a change reason
		oModel.updateBindings(ChangeReason.Change);

		// Assert
		assert.strictEqual(oSegmentedButton.getButtons()[6].getEnabled(), oModel.getData().items[6].enabled,
				"Button enabled property should be equal to Model enabled property after model update");

		assert.strictEqual(oSegmentedButton.getButtons()[6].getText(), 'sLabel',
				"Button should have label: 'sLabel' after model update");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Data binding items aggregation live model change", async function(assert) {
		var mDataInitial,
			mDataSecond,
			oSegmentedButton,
			oModel;

		// Arrange
		mDataInitial = {
			items: [
				{key: "b1", text: "Initial btn 1"},
				{key: "b2", text: "Initial btn 2"},
				{key: "b3", text: "Initial btn 3"}
			]
		};

		mDataSecond = {
			selectedKey: "b7",
			items: [
				{key: "b1", text: "btn 1", icon: "sap-icon://attachment"},
				{key: "b2", text: "btn 2", enabled: false},
				{key: "b3", text: "111 222 333", textDirection: TextDirection.RTL},
				{key: "b4", text: "btn 4", icon: "sap-icon://home"},
				{key: "b5", text: "btn 4", icon: "sap-icon://home"},
				{key: "b6", text: "btn 4"},
				{key: "b7", text: "btn 4", icon: "sap-icon://home"},
				{key: "b8", text: "btn 4"}
			]
		};

		// System under Test
		oSegmentedButton = new SegmentedButton({
			selectedKey: "{/selectedKey}",
			items : {
				path : "/items",
				template : new SegmentedButtonItem({
					key: "{key}",
					text: "{text}",
					icon: "{icon}",
					enabled: "{enabled}",
					textDirection: "{textDirection}"
				})
			}
		});

		oModel = new JSONModel();
		oModel.setData(mDataInitial);

		oSegmentedButton.setModel(oModel);

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getItems().length, 3, "Should have 3 items");
		assert.strictEqual(oSegmentedButton.getButtons().length, 3, "Should have 3 buttons");
		assert.strictEqual(oSegmentedButton.$().find("li").length, 3, "Should have 3 buttons rendered");
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b1", "selectedKey should be the default first item key");
		assert.strictEqual(oSegmentedButton.getItems()[0].getText(),
				"Initial btn 1", "Button text should be equal to initial Model text");

		// Act
		oModel.setData(mDataSecond);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSegmentedButton.getItems().length, 8, "Should have 8 items");
		assert.strictEqual(oSegmentedButton.getButtons().length, 8, "Should have 8 buttons");
		assert.strictEqual(oSegmentedButton.$().find("li").length, 8, "Should have 8 buttons rendered");
		assert.strictEqual(oSegmentedButton.getSelectedKey(), "b7", "selectedKey should be equal to the second model selectedKey");
		assert.strictEqual(oSegmentedButton.getButtons()[0].getText(), "btn 1",
				"Button text should be equal to second Model text");
		assert.strictEqual(oSegmentedButton.getButtons()[1].getEnabled(), false,
				"Button enabled should be equal to second Model enabled");
		assert.strictEqual(oSegmentedButton.getButtons()[2].getTextDirection(), TextDirection.RTL,
				"Button textDirection should be equal to second Model textDirection");
		assert.strictEqual(jQuery(oSegmentedButton.$().find("li")[2]).attr("dir"), TextDirection.RTL.toLowerCase(),
				"Button textDirection should be rendered to second Model textDirection");
		assert.strictEqual(oSegmentedButton.getButtons()[3].getIcon(), "sap-icon://home",
				"Button icon should be equal to second Model icon");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("Keyboard handling");

	QUnit.test("alt/meta key + right/left or + home/end is not handled", async function(assert) {
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({ text: 'a'}),
				new SegmentedButtonItem({ text: 'b'}),
				new SegmentedButtonItem({ text: 'c'})
			]
		}).placeAt('qunit-fixture');
		await nextUIUpdate(this.clock);

		var oModifiers = oSegmentedButton._oItemNavigation.getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.ok(oModifiers["saphome"], "saphome has disabled modifiers");
		assert.ok(oModifiers["sapend"], "sapend has disabled modifiers");
		assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "right is not handled when alt is pressed");
		assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "right is not handled when meta key is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "left is not handled when alt is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "left is not handled when meta key is pressed");
		assert.ok(oModifiers["saphome"].indexOf("alt") !== -1, "home is not handled when alt is pressed");
		assert.ok(oModifiers["saphome"].indexOf("meta") !== -1, "home is not handled when meta key is pressed");
		assert.ok(oModifiers["sapend"].indexOf("meta") !== -1, "end is not handled when meta key is pressed");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Press 'SPACE' should not scroll the page", function (assert) {
		// Arrange
		var oSB = new SegmentedButton(),
			oSpy = this.spy(),
			oEvent = {
				preventDefault: function () {
					oSpy();
				}
			};

		// Act
		oSB.onsapspace(oEvent);

		// Assert
		assert.equal(oSpy.callCount, 1, "preventDefault should be called on 'SPACE' to prevent scrolling");

		// Cleanup
		oSB.destroy();
	});

	/* Module ARIA*/

	QUnit.module('ARIA');

	QUnit.test("Root's general ARIA attributes", async function (assert) {
		var oFirstButton = new SegmentedButtonItem({ text: "First" }),
			oSecondButton = new SegmentedButtonItem({ text: "Second" }),
			oSegmentedButton = new SegmentedButton({
				items: [oFirstButton, oSecondButton]
			}),
			$segmentedButton;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);


		$segmentedButton = oSegmentedButton.$();
		assert.strictEqual($segmentedButton.attr("role"), "listbox", "Control has role 'listbox'");
		assert.strictEqual($segmentedButton.attr("aria-multiselectable"), "true", "aria-multiselectable is set to 'true'");
		assert.strictEqual($segmentedButton.attr("aria-roledescription"), oResourceBundle.getText("SEGMENTEDBUTTON_NAME"),
			"Additional description for control's role is added");
		assert.strictEqual($segmentedButton.attr("aria-describedby"), InvisibleText.getStaticId("sap.m", "SEGMENTEDBUTTON_SELECTION"),
			"Tutor message for selection is added");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Inner buttons' general ARIA attributes", async function (assert) {
		var oInnerButton = new SegmentedButtonItem({ text: "First" }),
			oInnerDisabledButton = new SegmentedButtonItem({ text: "Second", enabled: false }),
			oSegmentedButton = new SegmentedButton({
				items: [oInnerButton, oInnerDisabledButton]
			}),
			$innerButton,
			$innerDisabledButton;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		$innerButton = oInnerButton.$();
		$innerDisabledButton = oInnerDisabledButton.$();

		assert.strictEqual($innerButton.attr("role"), "option", "Inner button has role 'option'");
		assert.strictEqual($innerDisabledButton.attr("role"), "option", "Second inner button has role 'option' as well");

		assert.strictEqual($innerButton.attr("aria-roledescription"), oResourceBundle.getText("SEGMENTEDBUTTON_BUTTONS_NAME"),
			"First button has an additional description of its role");
		assert.strictEqual($innerDisabledButton.attr("aria-roledescription"), oResourceBundle.getText("SEGMENTEDBUTTON_BUTTONS_NAME"),
			"Second button has an additional description of its role as well");

		assert.notOk($innerButton.attr("aria-disabled"), "Non-disabled buttons aren't marked as disabled");
		assert.strictEqual($innerDisabledButton.attr("aria-disabled"), "true", "Disabled buttons have aria-disabled");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Text-only SegmentedButtonItem's ARIA", async function (assert) {
		var oItem = new SegmentedButtonItem({ text: "Something" }),
			oSegmentedButton = new SegmentedButton({ items: oItem }),
			oItemDomRef;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oItemDomRef = oItem.getDomRef();
		assert.notOk(oItemDomRef.getAttribute("title"), "Default tooltip isn't added");
		assert.notOk(oItemDomRef.getAttribute("aria-label"), "aria-label isn't added");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Icon-only SegmentedButtonItem's ARIA", async function (assert) {
		var oDefaultItem = new SegmentedButtonItem({
				icon: "sap-icon://list"
			}),
			oItemWithTooltip = new SegmentedButtonItem({
				icon: "sap-icon://list",
				tooltip: "Something"
			}),
			oSegmentedButton = new SegmentedButton({
				items: [
					oDefaultItem,
					oItemWithTooltip
				]
			}),
			oDefaultItemDomRef,
			oItemWithTooltipDomRef;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oDefaultItemDomRef = oDefaultItem.getDomRef();
		assert.strictEqual(oDefaultItemDomRef.getAttribute("title"), "list", "Icon's name serves as the tooltip");
		assert.strictEqual(oDefaultItemDomRef.getAttribute("aria-label"), "list", "Icon's name is added in aria-label");

		oItemWithTooltipDomRef = oItemWithTooltip.getDomRef();
		assert.strictEqual(oItemWithTooltipDomRef.getAttribute("title"), "Something", "User-provided tooltip is prioritized over icon's name ");
		assert.strictEqual(oItemWithTooltipDomRef.getAttribute("aria-label"), "Something", "This tooltip is added in aria-label as well");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);

	});

	QUnit.test("Combined(text + icon) SegmentedButtonItem's ARIA", async function (assert) {
		var oItem = new SegmentedButtonItem({ text: "Something", icon: "sap-icon://list" }),
			oSegmentedButton = new SegmentedButton({ items: oItem }),
			oItemDomRef;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oItemDomRef = oItem.getDomRef();
		assert.notOk(oItemDomRef.getAttribute("title"), "Default tooltip isn't added");
		assert.notOk(oItemDomRef.getAttribute("aria-label"), "aria-label isn't added");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("getAccessibilityInfo", async function(assert) {
		// Arrange
		var SegmentedItem = new SegmentedButtonItem({
				tooltip: "Tooltip",
				icon: "sap-icon://save"
			}),
			oSegmentedButton = new SegmentedButton({
				items : [ SegmentedItem ]
			}),
			oAccInfoSpy = this.spy(SegmentedItem.oButton, "getAccessibilityInfo"),
			sDescription;

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		sDescription = oSegmentedButton.getAccessibilityInfo().description;

		// Assert
		assert.ok(oAccInfoSpy.calledOnce, "getAccessibilityInfo from sap.m.Button gets called");
		assert.strictEqual(sDescription, SegmentedItem.getTooltip(), "Proper description is generated");

		// Clean
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	/* Module Select Mode */

	QUnit.module('Select Mode');

	QUnit.test("Can work with special characters in the ID", async function(assert) {

		// Arrange
		var oSegmentedButton = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					id: "contains::colon",
					text: "Button 1"
				}),
				new SegmentedButtonItem({
					text: "Button 2"
				}),
				new SegmentedButtonItem({
					text: "Button 3"
				})
			]
		});

		// System under Test
		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		assert.ok(oSegmentedButton.getDomRef(), "SegmentedButton should be rendered");

		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("SegmentedButton in communicates changes in its aggregated items/buttons");


	QUnit.test("Changing the text property aggregated items", async function (assert) {
		// Arrange
		var oTestItem = new SegmentedButtonItem({text: "Button 1"}),
			oSegmentedButton = new SegmentedButton({items: [oTestItem]}),
			sNewText = "new Text",
			fnChangHandler = this.spy();

		oSegmentedButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		oSegmentedButton.attachEvent("_change", fnChangHandler);

		// Assert
		assert.equal(fnChangHandler.callCount, 0, "Initially the change event hasn't been fired");

		//Act
		oTestItem.setText(sNewText);

		//Assert
		assert.strictEqual(oTestItem.getText(), sNewText, "The internal button has changed its text");
		assert.equal(fnChangHandler.callCount, 1, "The change event has been fired after the SegmentedButtonItem's property has changed");

		// Cleanup
		oSegmentedButton.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Adding items (XML view with binding)", function(assert) {
		// Arrange
		var fnChangHandler = this.spy();

		return XMLView.create({
			definition:  '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc">'
						+ '  <SegmentedButton id="SB" items="{/}">'
						+ '    <items>'
						+ '      <SegmentedButtonItem text="{text}"/>'
						+ '    </items>'
						+ '  </SegmentedButton>'
						+ '</mvc:View>'
		}).then(function(oView) {

			oView.setModel(new JSONModel());

			oView.byId("SB").attachEvent("_change", fnChangHandler);

			// Assert
			assert.equal(fnChangHandler.callCount, 0, "Initially the change event hasn't been fired");

			// Act
			oView.getModel().setData([{text: "Test"}]);

			// Assert
			assert.equal(fnChangHandler.callCount, 1, "The change event has been fired after new item is added");

			// Cleanup
			oView.destroy();
		});
	});

	QUnit.test("Removing items (XML view with binding)", function(assert) {
		// Arrange
		var fnChangHandler = this.spy();

		return XMLView.create({
			definition:  '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc">'
				+ '  <SegmentedButton id="SB" items="{/}">'
				+ '    <items>'
				+ '      <SegmentedButtonItem text="{text}"/>'
				+ '    </items>'
				+ '  </SegmentedButton>'
				+ '</mvc:View>'
		}).then(function(oView) {

			oView.setModel(new JSONModel([{text: "Test"}]));

			oView.byId("SB").attachEvent("_change", fnChangHandler);

			// Assert
			assert.equal(fnChangHandler.callCount, 0, "Initially the change event hasn't been fired");

			// Act
			oView.getModel().setData([]);

			// Assert
			assert.equal(fnChangHandler.callCount, 1, "The change event has been fired after new item is added");

			// Cleanup
			oView.destroy();
		});
	});

	QUnit.module("SegmentedButtonItem", {
		beforeEach: function () {
			this.oSBI = new SegmentedButtonItem();
		},
		afterEach: function () {
			this.oSBI.destroy();
			this.oSBI = null;
		}
	});

	QUnit.test("Objects needed for CustomStyleClass sync between item and internal button", function (assert) {
		// Arrange
		var oB = this.oSBI.oButton,
			oSBI = this.oSBI;

		// Assert
		assert.strictEqual(oB.aCustomStyleClasses, oSBI.aCustomStyleClasses, "This should be a reference to the same object");
		assert.strictEqual(oB.mCustomStyleClassMap, oSBI.mCustomStyleClassMap, "This should be a reference to the same object");
	});

	QUnit.test("CustomData sync", function (assert) {
		// Arrange
		var oCustomData = new CustomData({
			key: "my",
			value: "5"
		});
		this.oSBI.addCustomData(oCustomData);

		// Assert
		assert.strictEqual(this.oSBI.oButton.getCustomData()[0], oCustomData,
			"The CustomData returned from the internal button should be a reference to the same CustomData added in the item");
	});

	QUnit.test("LayoutData sync", function (assert) {
		// Arrange
		// Keep in mind that we are using sap.ui.core.LayoutData which is an abstract class and this usage is ok only for testing
		var oLayoutData = new LayoutData();
		this.oSBI.setLayoutData(oLayoutData);

		// Assert
		assert.strictEqual(this.oSBI.oButton.getLayoutData(), oLayoutData,
			"The LayoutData returned from the internal button should be a reference to the same LayoutData set in the item");
	});

	QUnit.test("Press event", function (assert) {
		// Arrange
		var oSB = new SegmentedButton({
			items: [
				this.oSBI
			]
		}),
		aButtons = oSB.getButtons();

		this.oSBI.attachPress(function () {
			// Assert
			assert.ok(true, "Event attached to the item should be fired when the button event is fired");
		});

		// Act
		aButtons[0].firePress();
	});

	QUnit.test("Cleanup - standalone", function (assert) {
		// Arrange
		var oDestroySpy = this.spy(this.oSBI.oButton, "destroy");

		// Act
		this.oSBI.destroy();

		// Internal created button should be destroyed
		assert.strictEqual(oDestroySpy.callCount, 1, "Destroy method of the button should be called once");
		assert.strictEqual(this.oSBI.oButton, null, "Internal button pointer should be null");

		// Cleanup
		oDestroySpy.restore();
	});

	QUnit.test("Cleanup - sap.m.SegmentedButton", function (assert) {
		// Arrange
		var oSB = new SegmentedButton({
			items: [
				this.oSBI
			]
		});

		// Act - destroy the SegmentedButton
		oSB.destroy();

		// Assert
		assert.strictEqual(this.oSBI.oButton, null, "The internal button should be destroyed");
	});

	QUnit.test("destroyItems should destroy internal buttons created from the SegmentedButtonItem", async function (assert) {
		// Arrange
		var oSegmentedButtonItem = new SegmentedButtonItem(),
			oButtonDestroySpy = this.spy(oSegmentedButtonItem.oButton, "destroy"),
			oSB = new SegmentedButton({ items: oSegmentedButtonItem }).placeAt("qunit-fixture");

		// Act
		oSB.destroyItems();

		// Assert
		assert.equal(oButtonDestroySpy.callCount, 1, "internal button should be destroyed");

		// Cleanup
		oSB.destroy();
		oButtonDestroySpy.restore();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("destroyItems should destroy internal buttons and adding item with the same ID should not throw an exception", async function (assert) {
		// Arrange
		var sSegmentedButtonId = "testId",
			oSegmentedButtonItem = new SegmentedButtonItem(sSegmentedButtonId),
			oSB = new SegmentedButton({ items: oSegmentedButtonItem });

		// Act
		oSB.destroyItems();
		oSB.addItem(new SegmentedButtonItem(sSegmentedButtonId));

		// Assert
		assert.ok(true, "no dublicate id exception is thrown");

		// Cleanup
		oSB.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("sap.ui.core.CustomData and 'items' aggregation", {
		beforeEach: async function () {
			// Create the control
			this.oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({
						text: "Btn1",
						customData: {
							key: "my",
							value: "1",
							writeToDom: true
						}
					}),
					new SegmentedButtonItem({
						text: "Btn2",
						customData: {
							key: "my",
							value: "2",
							writeToDom: true
						}
					}),
					new SegmentedButtonItem({
						text: "Btn3"
					})
				]
			}).placeAt("qunit-fixture");
			// Get custom data of the first item
			this.oCD = this.oSB.getItems()[0].getCustomData()[0];

			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oSB.destroy();
			this.oSB = null;

			this.oCD.destroy();
			this.oCD = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("CustomData is rendered correct in the dom", function (assert) {
		// Arrange
		var aBtn = this.oSB.getButtons();

		// Assert
		assert.strictEqual(aBtn[0].getCustomData()[0].getKey(), "my", "There is CustomData with key 'my' in the first button");
		assert.strictEqual(aBtn[0].$().data("my"), 1, "There is CustomData attribute with value '1' rendered on the first button");
		assert.strictEqual(aBtn[1].$().data("my"), 2, "There is CustomData attribute with value '2' rendered on the second button");
		assert.strictEqual(aBtn[2].getCustomData().length, 0, "There is no CustomData on the third button");
		assert.strictEqual(aBtn[2].$().data("my"), undefined, "There is no CustomData rendered on the third button");
	});

	QUnit.test("Update of item's CustomData Value property must be reflected in the SegmentedButton", async function (assert) {
		// Act - change the CustomData value of the item
		this.oCD.setValue("2222");
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getButtons()[0].$().data("my"), 2222, "The rendered CustomData on the first button should be updated");
	});

	QUnit.test("Update of item's CustomData Key property must be reflected in the SegmentedButton", async function (assert) {
		// Arrange
		var oFirstButton;

		// Act - change the CustomData key of the item
		this.oCD.setKey("yours");
		await nextUIUpdate(this.clock);

		// Get first button after update because it's regenerated
		oFirstButton = this.oSB.getButtons()[0];

		// Assert
		assert.strictEqual(oFirstButton.$().data("my"), undefined,
			"There should be no CustomData with key 'my' rendered on the first");
		assert.strictEqual(oFirstButton.$().data("yours"), 1,
			"There should be new CustomData with key 'yours' rendered on the first button");
	});

	QUnit.test("Update of item's CustomData writeToDom property must be reflected in the SegmentedButton", async function (assert) {
		// Act - change the CustomData writeToDom property
		this.oCD.setWriteToDom(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oSB.getButtons()[0].$().data(this.oCD.getKey()), undefined,
			"There should be new CustomData with key 'yours' rendered on the first button");
	});
});
