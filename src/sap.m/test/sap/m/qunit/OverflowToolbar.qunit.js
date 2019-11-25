/*global sinon */
/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */

sap.ui.define([
	"sap/ui/dom/units/Rem",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/ToolbarRenderer",
	"sap/m/ButtonRenderer",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/GenericTag",
	"sap/m/Text",
	"sap/m/OverflowToolbarButton",
	"sap/m/Slider",
	"sap/m/MenuItem",
	"sap/m/Menu",
	"sap/m/MenuButton",
	"sap/m/FlexItemData"
], function(
	DomUnitsRem,
	createAndAppendDiv,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	Toolbar,
	Label,
	ToolbarSpacer,
	Button,
	ToolbarRenderer,
	ButtonRenderer,
	mobileLibrary,
	JSONModel,
	Select,
	Item,
	GenericTag,
	Text,
	OverflowToolbarButton,
	Slider,
	MenuItem,
	Menu,
	MenuButton,
	FlexItemData
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	createAndAppendDiv("qunit-fixture-visible");



	/**
	 * Generates some content that will be used for creating toolbars
	 * Important: do not modify this array, some elements are referenced by their index in the returned array
	 * [] @param {boolean} [bWithLayout]
	 * @returns {*[]}
	 */
	function getDefaultContent(bWithLayout) {
		return [
			new Label({
				text: "This is an old player"
			}),
			new ToolbarSpacer(),
			new Button({
				text: "1 Fast forward"
			}),
			new Button({
				text: "2 Record",
				layoutData: bWithLayout ? new OverflowToolbarLayoutData({stayInOverflow: true}) : undefined
			}),
			new Button({
				text: "3 Play"
			}),
			new Button({
				text: "4 Pause"
			}),
			new Button({
				text: "5 Stop",
				layoutData: bWithLayout ? new OverflowToolbarLayoutData({moveToOverflow: false}) : undefined
			}),
			new Button({
				text: "6 Rewind"
			})
		];
	}

	function createOverflowToolbar(oConfig, aContent, bSkipAplyChanges) {
		var oOverflowTB;

		oConfig = oConfig || {};
		aContent = aContent || getDefaultContent();
		oConfig.content = aContent;

		oOverflowTB = new OverflowToolbar(oConfig);

		oOverflowTB.placeAt("qunit-fixture");

		if (!bSkipAplyChanges) {
			sap.ui.getCore().applyChanges();
		}

		return oOverflowTB;
	}

	function getButton(sText, sPriority, iGroup) {
		return new Button({
			text: sText,
			width: "100px",
			layoutData: new OverflowToolbarLayoutData({
				priority: sPriority,
				group: iGroup
			})
		});
	}
	/**
	 * A list of widths that test all scenarios
	 * @returns {*[]}
	 */
	function getSampleWidths() {
		return ['auto', '200px', '0'];
	}

	function getVisibleControls(oOverflowTB, sControlName) {
		var iVisibleButtons = 0;
		oOverflowTB.getContent().forEach(function (oControl) {
			if (oControl.getMetadata().getName() === sControlName && oControl.$().is(":visible")) {
				iVisibleButtons++;
			}
		});
		return iVisibleButtons;
	}

	QUnit.module("DOM Rendering");
	QUnit.test("Creating a toolbar should add it in DOM", function (assert) {
		var oOverflowTB = createOverflowToolbar();

		assert.strictEqual(oOverflowTB.$().length, 1, "Overflow Toolbar is in DOM");

		oOverflowTB.destroy();
	});


	QUnit.module("Calculations");


	function testAllFlexBoxModes(sName, fnTest) {
		QUnit.test(sName, function (assert) {
			fnTest.call(this, assert);
		});
	}

	testAllFlexBoxModes("Shrinking a toolbar should move some buttons to the overflow", function (assert) {

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Before the resize, all buttons are visible
		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Initially all buttons should be visible");

		// Resize the toolbar
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// After the resize there should be less buttons visible on the toolbar
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons < aDefaultContent.length, true, "After the resize, the number of visible buttons should have decreased");

		// There should be an overflow button and it should be visible
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

		// The overflow area should not be visible yet
		var oPopover = oOverflowTB._getPopover();
		assert.strictEqual(oPopover.$().is(":visible"), false, "The overflow area is not visible");

		// Click the overflow button
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// The overflow area should appear
		assert.strictEqual(oPopover.$().is(":visible"), true, "The overflow area is visible after clicking the overflow button");

		// All buttons should be visible again, because the overflow area is open
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "After opening the overflow area, all buttons are visible once more");

		// Restore the toolbar to the original size
		oOverflowTB.setWidth('550px');
		sap.ui.getCore().applyChanges();

		// There should be no overflow button, no overflow area, all buttons visible again
		assert.strictEqual(oOverflowButton.$().is(":visible"), false, "The overflow button is not visible after restoring to full size");
		this.clock.tick(1000);
		assert.strictEqual(oPopover.$().is(":visible"), false, "The overflow area is not visible after restoring to full size");
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Again all buttons should be visible");

		oOverflowTB.destroy();
	});

	testAllFlexBoxModes("Shrinking a toolbar should also move custom buttons to the overflow", function (assert) {

		var MyButton = Button.extend("sap.m.MyButton", {
			renderer: ButtonRenderer.render
		});

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new MyButton({text: "1", width: "100px"}),
					new MyButton({text: "2", width: "100px"}),
					new MyButton({text: "3", width: "100px"}),
					new MyButton({text: "4", width: "100px"}),
					new MyButton({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Before the resize, all buttons are visible
		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.MyButton");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Initially all buttons should be visible");

		// Resize the toolbar
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// After the resize there should be less buttons visible on the toolbar
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.MyButton");
		assert.strictEqual(iVisibleButtons < aDefaultContent.length, true, "After the resize, the number of visible buttons should have decreased");

		// There should be an overflow button and it should be visible
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

		oOverflowTB.destroy();
	});

	testAllFlexBoxModes("Changing the width of a control moves other controls to the overflow", function (assert) {

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Before the resize, all buttons are visible
		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Initially all buttons should be visible");

		// Change the width of a button
		aDefaultContent[4].setWidth("500px");
		sap.ui.getCore().applyChanges();

		// After the width change there should be less buttons visible on the toolbar
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons < aDefaultContent.length, true, "After the resize, the number of visible buttons should have decreased");

		// There should be an overflow button and it should be visible
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

		// Resize the button back
		aDefaultContent[4].setWidth("100px");
		sap.ui.getCore().applyChanges();

		// There should be no overflow button, no overflow area, all buttons visible again
		assert.strictEqual(oOverflowButton.$().is(":visible"), false, "The overflow button is not visible after resizing the button back");
		this.clock.tick(1000);
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Again all buttons should be visible");

		oOverflowTB.destroy();
	});

	testAllFlexBoxModes("Inserting a control moves other controls to the overflow", function (assert) {

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Before the resize, all buttons are visible
		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Initially all buttons should be visible");

		// Insert a new button
		var oNewButton = new Button({text: "0", width: "100px"});
		oOverflowTB.insertContent(oNewButton, 0);
		sap.ui.getCore().applyChanges();

		// After the insertion there should be less buttons visible on the toolbar
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons < aDefaultContent.length + 1, true, "After the insertion, the number of visible buttons should have decreased");

		// There should be an overflow button and it should be visible
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

		// Remove the button
		oOverflowTB.removeContent(oNewButton);
		sap.ui.getCore().applyChanges();

		// There should be no overflow button, no overflow area, all buttons visible again
		assert.strictEqual(oOverflowButton.$().is(":visible"), false, "The overflow button is not visible after resizing the button back");
		this.clock.tick(1000);
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Again all buttons should be visible");

		oOverflowTB.destroy();
	});

	testAllFlexBoxModes("Async: Changing the width of a control moves other controls to the overflow", function (assert) {
		// Arrange - create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px",
					asyncMode: true
				}, aDefaultContent),
				done = assert.async(),
				iVisibleButtons;

		assert.expect(5);
		this.clock.restore();

		setTimeout(function () {
			// Assert - before the resize, all buttons are visible
			iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
			assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Initially all buttons should be visible");

			// Act - change the width of a button
			aDefaultContent[4].setWidth("500px");
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				// Assert - after the width change there should be less buttons visible on the toolbar
				iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
				assert.strictEqual(iVisibleButtons < aDefaultContent.length, true, "After the resize, the number of visible buttons should have decreased");

				// There should be an overflow button and it should be visible
				var oOverflowButton = oOverflowTB._getOverflowButton();
				assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

				// Act - resize the button back
				aDefaultContent[4].setWidth("100px");
				sap.ui.getCore().applyChanges();

				setTimeout(function () {
					// Assert - there should be no overflow button, no overflow area, all buttons visible again
					assert.strictEqual(oOverflowButton.$().is(":visible"), false, "The overflow button is not visible after resizing the button back");
					iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
					assert.strictEqual(iVisibleButtons, aDefaultContent.length, "Again all buttons should be visible");

					// Clean up
					oOverflowTB.destroy();
					done();
				}, 500);
			}, 200);
		}, 200);
	});

	QUnit.module("Priority");

	testAllFlexBoxModes("Buttons with layout to stay in overflow never go to the toolbar", function (assert) {

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					getButton('1'),
					getButton('2'),
					new Button({text: "3", width: "100px", layoutData: new OverflowToolbarLayoutData({stayInOverflow: true})}),
					getButton('4'),
					getButton('5')
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Initially there is an overflow button and not all buttons are visible on the toolbar
		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons < aDefaultContent.length, true, "Even though there is enough space on the toolbar, not all buttons are visible");
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is always visible");

		oOverflowTB.destroy();
	});

	testAllFlexBoxModes("Buttons with layout to stay in the toolbar never go to the overflow", function (assert) {

		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					getButton('1'),
					getButton('2'),
					getButton('3'),
					getButton('4'),
					new Button({text: "5", width: "100px", layoutData: new OverflowToolbarLayoutData({moveToOverflow: false})})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		// Before the resize, the button with special layout is in the toolbar
		var oSpecialButton = aDefaultContent[4];
		assert.strictEqual(oSpecialButton.$().is(":visible"), true, "Initially the button with special layout is visible");

		// Resize the toolbar
		oOverflowTB.setWidth('200px');
		sap.ui.getCore().applyChanges();

		// After the resize there should be less buttons visible on the toolbar
		assert.strictEqual(oSpecialButton.$().is(":visible"), true, "After the resize, the special layout button is still visible");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with priority NeverOverflow should never overflow", function (assert) {

		// Create a toolbar 75px and 5 buttons x 100px, so all buttons should overflow by default,
		// but one of the buttons has special priority which forces the button to stay

		var aDefaultContent = [
					getButton('1'),
					getButton('2'),
					getButton('3', OverflowToolbarPriority.NeverOverflow),
					getButton('4'),
					getButton('5')
				],
				oOverflowTB = createOverflowToolbar({
					width: "75px"
				}, aDefaultContent);

		var iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, 1, "The button never overflows");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with priority AlwaysOverflow should always overflow and should never be rendered in the toolbar", function (assert) {

		// Create a toolbar 600px and 5 buttons x 100px, so there is enough space for all buttons,
		// but two of the button has special priority which force the buttons to overflow always
		var aDefaultContent = [
				getButton('1'),
				getButton('2'),
				getButton('3', OverflowToolbarPriority.AlwaysOverflow),
				getButton('4', OverflowToolbarPriority.AlwaysOverflow),
				getButton('5')
			],
			oOverflowTB = createOverflowToolbar({
				width: "600px"
			}, aDefaultContent, true),
			iVisibleButtons,
			iOverflowedButtons,
			fnDoLayout = oOverflowTB._doLayout,
			oStubDoLayout = this.stub(OverflowToolbar.prototype, "_doLayout", function () {
				// There should be three buttons visible in the toolbar
				iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
				assert.strictEqual(iVisibleButtons, 3, "Only three buttons are visible in the toolbar");

				// call the real _doLayout method
				fnDoLayout.call(oOverflowTB);
			});

		sap.ui.getCore().applyChanges();

		// Even though there is enough space on the toolbar, two of the buttons always oferflows
		iOverflowedButtons = oOverflowTB._getPopover().getAssociatedContent().length;
		assert.strictEqual(iOverflowedButtons, 2, "Two of the buttons always overflow");

		// There should be three buttons visible in the toolbar
		iVisibleButtons = getVisibleControls(oOverflowTB, "sap.m.Button");
		assert.strictEqual(iVisibleButtons, 3, "Only three buttons are visible in the toolbar");

		oStubDoLayout.restore();
		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with priority Disappear should be hidden in the overflow area", function (assert) {

		// Create a toolbar 600px and 5 buttons x 100px, so all buttons should be visible,
		// but one of the button has special priority Disappear, so when it overflows it should be hidden in the overflow popover
		var oButtonWithDisappearPriority = getButton('5', OverflowToolbarPriority.Disappear);

		var aDefaultContent = [
					getButton('1'),
					getButton('2'),
					getButton('3'),
					getButton('4'),
					oButtonWithDisappearPriority
				],
				oOverflowTB = createOverflowToolbar({
					width: "600px"
				}, aDefaultContent);

		// Shrink the toolbar
		oOverflowTB.setWidth('300px');
		sap.ui.getCore().applyChanges();

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Check if the button with Priority Disappear is visible in the overflow popover
		assert.strictEqual(oButtonWithDisappearPriority.$().css("display") === "none", true,
			"The button with Priority Disappear is hidden and the proper css style is applied");

		oOverflowTB.destroy();
	});

	QUnit.test("When there are only buttons with priority Disappear the overflow button should not be shown", function (assert) {

		// Arrange
		var aDefaultContent = [
					getButton('1', OverflowToolbarPriority.Disappear),
					getButton('2', OverflowToolbarPriority.Disappear),
					getButton('3', OverflowToolbarPriority.Disappear)
				],
				oOverflowTB = createOverflowToolbar({
					width: "100px"
				}, aDefaultContent);

		// Assert
		assert.strictEqual(oOverflowTB._getOverflowButton().$().is(":visible"), false, "The overflow button is not visible");
		assert.strictEqual(oOverflowTB._hasControlsToBeShownInPopover(), false, "_hasControlsToBeShownInPopover returns false");

		// Clean up
		oOverflowTB.destroy();
	});

	QUnit.test("Changing piority from Low to High should move the button from the overflow area back to the toolbar", function (assert) {

		// Create a toolbar 300px and 5 buttons x 100px, so there is no enogh space for all buttons.
		// Since all buttons are with equal priority 'Low' they should overflow from right to the left.
		var oButtonUnderTest = getButton('5', OverflowToolbarPriority.Low);

		var aDefaultContent = [
					getButton('1', OverflowToolbarPriority.Low),
					getButton('2', OverflowToolbarPriority.Low),
					getButton('3', OverflowToolbarPriority.Low),
					getButton('4', OverflowToolbarPriority.Low),
					oButtonUnderTest
				],

				oOverflowTB = createOverflowToolbar({
					width: "300px"
				}, aDefaultContent);

		// The Button with Low Priority is not visible
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false, "The button with Low Priority is not visible");

		// Change the button priority from Low to High
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}));
		sap.ui.getCore().applyChanges();

		// Check if the button moved back to the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button with Chaged Priority is visible whithin the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing priority from Low to NeverOverflow should move the button to the overflow", function (assert) {

		// Create a toolbar 300px and 5 buttons x 100px, so there is no enogh space for all buttons.
		// Since all buttons are with equal priority 'Low', they should overflow from right to the left.
		var oButtonUnderTest = getButton('5', OverflowToolbarPriority.Low);

		var aDefaultContent = [
					getButton('1', OverflowToolbarPriority.Low),
					getButton('2', OverflowToolbarPriority.Low),
					getButton('3', OverflowToolbarPriority.Low),
					getButton('4', OverflowToolbarPriority.Low),
					oButtonUnderTest
				],

				oOverflowTB = createOverflowToolbar({
					width: "300px"
				}, aDefaultContent);

		//Check if the button is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false,
			"The button with Low Priority is not visible whithin the toolbar");

		// Change the button priority from Low to NeverOverflow
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}));
		sap.ui.getCore().applyChanges();

		//Check if the button is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button with Chaged Priority is visible whithin the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing priority from High to Low should move the button to the overflow", function (assert) {

		// Create a toolbar 300px and 5 buttons x 100px, so there is no enogh space for all buttons.
		// Since all buttons are with equal priority 'High' they should overflow from right to the left.
		var oButtonUnderTest = getButton('1', OverflowToolbarPriority.High);

		var aDefaultContent = [
					oButtonUnderTest,
					getButton('2', OverflowToolbarPriority.High),
					getButton('3', OverflowToolbarPriority.High),
					getButton('4', OverflowToolbarPriority.High),
					getButton('5', OverflowToolbarPriority.High)
				],

				oOverflowTB = createOverflowToolbar({
					width: "300px"
				}, aDefaultContent);

		// The leftmost Button with High Priority should be visible
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button with High Priority is  visible");

		// Change the button priority from High to Low
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}));
		sap.ui.getCore().applyChanges();

		//Check if the button moved back to the overflow area
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false,
			"The button with Chaged Priority is not visible whithin the toolbar");

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Check if the button with Changed Priority is visible in the overflow popover
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button with Chaged Priority is visible whithin the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing priority from High to AlwaysOverflow should move the button to the overflow", function (assert) {

		// Create a toolbar 300px and 5 buttons x 100px, so there is no enogh space for all buttons.
		// Since all buttons are with equal priority 'High' they should overflow from right to the left.
		var oButtonUnderTest = getButton('1', OverflowToolbarPriority.High);

		var aDefaultContent = [
					oButtonUnderTest,
					getButton('2', OverflowToolbarPriority.High),
					getButton('3', OverflowToolbarPriority.High),
					getButton('4', OverflowToolbarPriority.High),
					getButton('5', OverflowToolbarPriority.High)
				],

				oOverflowTB = createOverflowToolbar({
					width: "300px"
				}, aDefaultContent);

		// The leftmost Button with High Priority should be visible
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The leftmost button with High Priority is visible");

		// Change the button priority from High to AlwaysOverflow
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}));
		sap.ui.getCore().applyChanges();

		//Check if the button is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false,
			"The button with Chaged Priority is not visible whithin the toolbar");

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Check if the button with the Changed Priority is visible in the overflow popover
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true, "The button with Chaged Priority is visible whithin the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with Priority High should overflow last among the buttons with Priority Low", function (assert) {

		// Create a toolbar 600px and 5 buttons x 100px, so there is enough space for all buttons,
		// and position the button with Priority High in the rightmost in the toolbar
		var oButtonWithHighPriority = getButton('5', OverflowToolbarPriority.High);

		var aDefaultContent = [
					getButton('1', OverflowToolbarPriority.Low),
					getButton('2', OverflowToolbarPriority.Low),
					getButton('3', OverflowToolbarPriority.Low),
					getButton('4', OverflowToolbarPriority.Low),
					oButtonWithHighPriority
				],

				oOverflowTB = createOverflowToolbar({
					width: "600px"
				}, aDefaultContent);

		// Resize the toolbar so the buttons should overflow from right to the left
		oOverflowTB.setWidth('300px');
		sap.ui.getCore().applyChanges();

		// Check if the button with Priority High is still visible
		assert.strictEqual(oButtonWithHighPriority.$().is(":visible"), true,
			"The button with Priority High is visible");

		oOverflowTB.destroy();
	});

	QUnit.test("Button with Priority Low should overflow first among buttons with Priority High", function (assert) {

		// Create a toolbar 600px and 5 buttons x 100px, so there is enough space for all buttons,
		// and position the button with Priority Low in the leftmost in the toolbar
		var oButtonWithLowPriority = getButton('1', OverflowToolbarPriority.Low);

		var aDefaultContent = [
					oButtonWithLowPriority,
					getButton('2', OverflowToolbarPriority.High),
					getButton('3', OverflowToolbarPriority.High),
					getButton('4', OverflowToolbarPriority.High),
					getButton('5', OverflowToolbarPriority.High)
				],

				oOverflowTB = createOverflowToolbar({
					width: "600px"
				}, aDefaultContent);

		// Resize the toolbar so the buttons should overflow from right to the left
		oOverflowTB.setWidth('300px');
		sap.ui.getCore().applyChanges();

		// Check if the button with Priority Low is still visible
		assert.strictEqual(oButtonWithLowPriority.$().is(":visible"), false, "The button with Priority Low is not visible");

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Check if the button with  Priority Low is visible
		assert.strictEqual(oButtonWithLowPriority.$().is(":visible"), true, "The button with Priority Low is visible whithin the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with equal priority should follow the general overflow order", function (assert) {

		// Create a toolbar 600px and 5 buttons x 100px with priority Low
		var oLeftMostButton = getButton('1');
		var oRightMostButton = getButton('5');

		var aDefaultContent = [
					oLeftMostButton,
					getButton('2'),
					getButton('3'),
					getButton('4'),
					oRightMostButton
				],

				oOverflowTB = createOverflowToolbar({
					width: "600px"
				}, aDefaultContent);

		// Resize the toolbar so the buttons should overflow from right to the left
		oOverflowTB.setWidth('300px');
		sap.ui.getCore().applyChanges();

		// Check if the leftmost button is still visible
		assert.strictEqual(oLeftMostButton.$().is(":visible"), true,
			"The leftmost button is visible in the toolbar");

		assert.strictEqual(oRightMostButton.$().is(":visible"), false,
			"The rightmost button is not visible in the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.test("The order of the items in the overflow area should correspond to the overflow order", function (assert) {

		// Create a toolbar 75px and 5 buttons x 100px, so there is no enogh space and all buttons should overflow.
		// The buttons have different priorities which affects the order of overflow,
		// and their position in the popover correspond the order they overflow.
		var oButtonDefaultPriority = getButton('1'),
			oButtonLowPriority = getButton('3', OverflowToolbarPriority.Low),
			oButtonLowPriority2 = getButton('4', OverflowToolbarPriority.Low),
			oButtonHighPriority = getButton('2', OverflowToolbarPriority.High),
			oButtonHighPriority2 = getButton('5', OverflowToolbarPriority.High);

		var aDefaultContent = [
					oButtonDefaultPriority,
					oButtonHighPriority,
					oButtonLowPriority,
					oButtonLowPriority2,
					oButtonHighPriority2
				],

				oOverflowTB = createOverflowToolbar({
					width: "75px"
				}, aDefaultContent);

		// Check if the order of the elements in the popover correspond their order in the toolbar, starting from right to left e.g reversed
		var aPopoverButtonsIDs = oOverflowTB._getPopover().getAssociatedContent();

		var aExpectedOrder = [
			oButtonDefaultPriority.getId(),
			oButtonHighPriority.getId(),
			oButtonHighPriority2.getId(),
			oButtonLowPriority.getId(),
			oButtonLowPriority2.getId()
		];

		assert.deepEqual(aPopoverButtonsIDs, aExpectedOrder, "The elements order matches");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing the priority of a group item should move the group back in the toolbar", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oButtonUnderTest1 = getButton('1', OverflowToolbarPriority.Low, 1),
			oButtonUnderTest2 = getButton('2', OverflowToolbarPriority.Low, 1),

			aDefaultContent = [
				oButtonUnderTest1,
				oButtonUnderTest2,
				getButton('3'),
				getButton('4'),
				getButton('5')
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the buttons under test are visible in the toolbar
		assert.strictEqual(oButtonUnderTest1.$().is(":visible"), false,
			"The button under test is not visible in the toolbar");

		assert.strictEqual(oButtonUnderTest2.$().is(":visible"), false,
			"The button under test is not visible in the toolbar");

		// Change the priority of the button from group 1
		oButtonUnderTest2.setLayoutData(new OverflowToolbarLayoutData({
			priority: OverflowToolbarPriority.High,
			group: 1
		}));
		sap.ui.getCore().applyChanges();

		// Check if the buttons under test are visible in the toolbar
		assert.strictEqual(oButtonUnderTest1.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		assert.strictEqual(oButtonUnderTest2.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing the priority of a group item should move the group in the overflow area", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oButtonUnderTest1 = getButton('2', OverflowToolbarPriority.Low, 1),
			oButtonUnderTest2 = getButton('3', OverflowToolbarPriority.High, 1),

			aDefaultContent = [
				getButton('1'),
				oButtonUnderTest1,
				oButtonUnderTest2,
				getButton('4'),
				getButton('5')
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the buttons under test are visible in the toolbar
		assert.strictEqual(oButtonUnderTest1.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		assert.strictEqual(oButtonUnderTest2.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		// Change the priority of the button from group 1
		oButtonUnderTest2.setLayoutData(new OverflowToolbarLayoutData({
			priority: OverflowToolbarPriority.Low,
			group: 1
		}));
		sap.ui.getCore().applyChanges();

		// Click the overflow button
		oOverflowTB._getOverflowButton().firePress();
		this.clock.tick(1000);

		// Check if the members of group number 1 are visible in the overflow area
		assert.strictEqual(oButtonUnderTest1.$().is(":visible"), true,
			"The button under test from group number 1 is visible whithin the overflow area");

		assert.strictEqual(oButtonUnderTest2.$().is(":visible"), true,
			"The button under test from group number 1 is visible whithin the overflow area");

		oOverflowTB.destroy();
	});

	QUnit.module("Grouping");

	QUnit.test("Buttons in a group should overflow together", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oGroupedButton1 = getButton('2', OverflowToolbarPriority.Low, 1),
			oGroupedButton2 = getButton('3', OverflowToolbarPriority.Low, 1),

			aDefaultContent = [
				getButton('1'),
				oGroupedButton1,
				oGroupedButton2,
				getButton('4'),
				getButton('5')
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the members of group number 1 are visible
		assert.strictEqual(oGroupedButton1.$().is(":visible"), false,
			"The button 1 from group number 1 is not visible in the toolbar");

		assert.strictEqual(oGroupedButton2.$().is(":visible"), false,
			"The button 2 from group number 1 is not visible in the toolbar");

		// Click the overflow button
		oOverflowTB._getOverflowButton().firePress();
		this.clock.tick(1000);

		// Check if the members of group number 1 are visible
		assert.strictEqual(oGroupedButton1.$().is(":visible"), true,
			"The button 1 from group number 1 is visible whithin the overflow");

		assert.strictEqual(oGroupedButton2.$().is(":visible"), true,
			"The button 2 from group number 1 is visible whithin the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons in a group should overflow together even if they are unordered", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oGroupedButton1 = getButton('2', OverflowToolbarPriority.Low, 1),
			oGroupedButton2 = getButton('3', OverflowToolbarPriority.Low, 1),

			aDefaultContent = [
				getButton('1'),
				oGroupedButton1,
				getButton('4'),
				getButton('5'),
				oGroupedButton2
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the members of group number 1 are visible
		assert.strictEqual(oGroupedButton1.$().is(":visible"), false,
			"The button 1 from group number 1 is not visible in the toolbar");

		assert.strictEqual(oGroupedButton2.$().is(":visible"), false,
			"The button 2 from group number 1 is not visible in the toolbar");

		// Click the overflow button
		oOverflowTB._getOverflowButton().firePress();
		this.clock.tick(1000);

		// Check if the members of group number 1 are visible
		assert.strictEqual(oGroupedButton1.$().is(":visible"), true,
			"The button 1 from group number 1 is visible whithin the overflow");

		assert.strictEqual(oGroupedButton1.$().is(":visible"), true,
			"The button 2 from group number 1 is visible whithin the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("The order of grouped controls should be preserved in the overflow", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oGroupedButton1 = getButton('2', OverflowToolbarPriority.Low, 1),
			oGroupedButton2 = getButton('3', OverflowToolbarPriority.Low, 1),

				aDefaultContent = [
					getButton('1'),
					oGroupedButton1,
					oGroupedButton2,
					getButton('4'),
					getButton('5')
				],

				oOverflowTB = createOverflowToolbar({
					width: "500px"
				}, aDefaultContent),

				aElementsInOverflowIds,
				iGroupedButton1Index,
				iGroupedButton2Index;

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Click the overflow button
		oOverflowTB._getOverflowButton().firePress();
		this.clock.tick(1000);

		aElementsInOverflowIds = oOverflowTB._getPopover().getAssociatedContent();
		iGroupedButton1Index = aElementsInOverflowIds.indexOf(oGroupedButton1.getId());
		iGroupedButton2Index = aElementsInOverflowIds.indexOf(oGroupedButton2.getId());

		// Check if the order of the grouped items is correct
		assert.strictEqual(iGroupedButton1Index < iGroupedButton2Index, true,
				"The button 1 from group number 1 is ordered before button 2 from the same group");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing the group of a button should move it in the overflow", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oButtonUnderTest = getButton('2', OverflowToolbarPriority.Low),

			aDefaultContent = [
				getButton('1'),
				oButtonUnderTest,
				getButton('3'),
				getButton('4', OverflowToolbarPriority.Low, 1),
				getButton('5', OverflowToolbarPriority.Low, 1)
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the button under test is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		// Change the group of the button
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({group: 1}));
		sap.ui.getCore().applyChanges();

		// Check if the button under test is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false,
			"The button under test from group number 1 is not visible in the toolbar");

		// Click the overflow button
		oOverflowTB._getOverflowButton().firePress();
		this.clock.tick(1000);

		// Check if the new member of group number 1 is visible in the overflow area
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button under test from group number 1 is visible within the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing the group of a button should move it back to the toolbar", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Three of the buttons belongs to group number 1
		var oButtonUnderTest = getButton('2', OverflowToolbarPriority.Low, 1),

			aDefaultContent = [
				getButton('1'),
				oButtonUnderTest,
				getButton('3'),
				getButton('4', OverflowToolbarPriority.Low, 1),
				getButton('5', OverflowToolbarPriority.Low, 1)
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the button under test is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), false,
			"The button under test is not visible in the toolbar");

		// Change the group of the button
		oButtonUnderTest.setLayoutData(new OverflowToolbarLayoutData({group: 2}));
		sap.ui.getCore().applyChanges();

		// Check if the button under test is visible in the toolbar
		assert.strictEqual(oButtonUnderTest.$().is(":visible"), true,
			"The button under test is visible in the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.test("Group overall priority should be the max priority of its members", function (assert) {
		// Create a toolbar 500px and 5 buttons x 100px
		// Two of the buttons belongs to group number 1
		var oGroupedButton1 = getButton('2', OverflowToolbarPriority.Low, 1),

			aDefaultContent = [
				getButton('1'),
				oGroupedButton1,
				getButton('3', OverflowToolbarPriority.High, 1),
				getButton('4'),
				getButton('5')
			],

			oOverflowTB = createOverflowToolbar({
				width: "500px"
			}, aDefaultContent);

		// Shrink the toolbar with 100px
		oOverflowTB.setWidth('400px');
		sap.ui.getCore().applyChanges();

		// Check if the members of group number 1 are visible
		assert.strictEqual(oGroupedButton1.$().is(":visible"), true,
			"The button 1 from group number 1 is visible in the toolbar although its priority is Low");

		oOverflowTB.destroy();
	});

	QUnit.module("Data - aggregations and bindings");

	QUnit.test("[getContent] The content aggregation should contain the proper number of elements", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				widthTypes = getSampleWidths();

		// For each width, create a toolbar - in some cases all controls will be in the toolbar, in others - will overflow
		widthTypes.forEach(function (sWidth) {
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			assert.strictEqual(oOverflowTB.getContent().length, aContent.length, "When the toolbar's width is '" + sWidth + "', getContent() correctly returns all " + aContent.length + " items");
		});

		oOverflowTB.destroy();
	});


	QUnit.test("[getContent] Modifying the controls the dynamic toolbar was created with affects its content aggregation", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				widthTypes = getSampleWidths(),
				newText;

		// For each width, create a toolbar - in some cases all controls will be in the toolbar, in others - will overflow
		widthTypes.forEach(function (sWidth) {
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			// For each control, change the text and match against the respective element from the aggregation
			aContent.forEach(function (oControl, i) {
				if (typeof oControl.setText === "function") {
					newText = "Modified " + i;
					oControl.setText(newText);
					assert.strictEqual(oOverflowTB.getContent()[i].getText(), newText, "When the toolbar's width is '" + sWidth + "', Setting the text of the " + i + "th control (" + oControl + ") affects the respective content aggregation item");
				}
			});
		});

		oOverflowTB.destroy();
	});

	QUnit.test("[getContent] Shrinking and expanding the toolbar will not affect the order of the controls in its content aggregation when no controls have special layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				aInitialOrder,
				aFinalOrder;

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);

		aInitialOrder = oOverflowTB.getContent().map(function (item) {
			return item.getId();
		});
		oOverflowTB.setWidth('300px'); // shrink
		this.clock.tick(1000);
		oOverflowTB.setWidth('auto');  // then back to full
		this.clock.tick(1000);

		aFinalOrder = oOverflowTB.getContent().map(function (item) {
			return item.getId();
		});

		// For each control, check if it's in the same place as before
		aInitialOrder.forEach(function (oControl, i) {
			assert.strictEqual(aFinalOrder[i], aInitialOrder[i], "The item with index: " + i + " has the same index after shrinking and restoring");
		});

		oOverflowTB.destroy();
	});

	QUnit.test("[getContent] Shrinking and expanding the toolbar will not affect the order of the controls in its content aggregation when some controls have special layout", function (assert) {
		var aContent = getDefaultContent(true),
				oOverflowTB,
				aInitialOrder,
				aFinalOrder;

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);

		aInitialOrder = oOverflowTB.getContent().map(function (item) {
			return item.getId();
		});

		oOverflowTB.setWidth('300px'); // shrink
		this.clock.tick(1000);
		oOverflowTB.setWidth('auto');  // then back to full
		this.clock.tick(1000);

		aFinalOrder = oOverflowTB.getContent().map(function (item) {
			return item.getId();
		});

		// For each control, check if it's in the same place as before
		aInitialOrder.forEach(function (oControl, i) {
			assert.strictEqual(aFinalOrder[i], aInitialOrder[i], "The item with index: " + i + " has the same index after shrinking and restoring");
		});

		oOverflowTB.destroy();
	});


	QUnit.test("[addContent] Adding controls with addContent puts them at the end of the aggregation", function (assert) {
		var aContent,
				oOverflowTB,
				newButton,
				widthTypes = getSampleWidths();

		widthTypes.forEach(function (sWidth) {
			aContent = getDefaultContent();
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			newButton = new Button({
				text: "I am new"
			});
			oOverflowTB.addContent(newButton);

			assert.strictEqual(oOverflowTB.getContent()[oOverflowTB.getContent().length - 1].getId(), newButton.getId(), "For a toolbar with width = " + sWidth + ", the newly created button is really the last element of the aggregation");

			oOverflowTB.destroy();
			newButton.destroy();
		});
	});

	QUnit.test("[addContent] Calling addContent with falsy value does not throw an exception", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB = createOverflowToolbar({}, aContent),
				newButton,
				newButton2 = "";

			oOverflowTB.addContent(newButton);

			//Assert
			assert.ok(true, "does not throw an exception with undefined");

			oOverflowTB.addContent(newButton2);

			//Assert
			assert.ok(true, "does not throw an exception with empty string");

			oOverflowTB.destroy();
	});

	QUnit.test("[insertContent] Calling insertContent with falsy value does not throw an exception", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB = createOverflowToolbar({}, aContent),
				newButton,
				newButton2 = "";

			oOverflowTB.insertContent(newButton, 1);

			//Assert
			assert.ok(true, "does not throw an exception with undefined");

			oOverflowTB.insertContent(newButton2, 1);

			//Assert
			assert.ok(true, "does not throw an exception with empty string");

			oOverflowTB.destroy();
	});

	QUnit.test("[insertContent] Adding controls with insertContent inserts them at the proper index of the aggregation", function (assert) {
		var aContent,
				oOverflowTB,
				newButton,
				widthTypes = getSampleWidths();


		widthTypes.forEach(function (sWidth) {
			aContent = getDefaultContent();
			newButton = new Button({
				text: "I am new"
			});
			aContent.forEach(function (oControl, i) {
				oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
				oOverflowTB.insertContent(newButton, i);
				assert.strictEqual(oOverflowTB.getContent()[i].getId(), newButton.getId(), "For a toolbar with width = " + sWidth + ", the newly created button is really at index " + i + " in the aggregation");

			});

			oOverflowTB.destroy();
			newButton.destroy();
		});

	});

	QUnit.test("[removeContent] Removing a control with removeContent works no matter if the control is in the toolbar or popover", function (assert) {
		var aContent,
				oOverflowTB,
				removeAssociatedContentSpy,
				oAssociativePopover,
				oControlToRemove,
				sControlToRemoveId,
				widthTypes = getSampleWidths();

		widthTypes.forEach(function (sWidth) {
			aContent = getDefaultContent();
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			oAssociativePopover = oOverflowTB._getPopover();
			this.clock.tick(1000);
			removeAssociatedContentSpy = this.spy(oAssociativePopover, "removeAssociatedContent");
			oControlToRemove = aContent[aContent.length - 1];
			sControlToRemoveId = oControlToRemove.getId();

			oOverflowTB.removeContent(oControlToRemove);
			assert.ok(removeAssociatedContentSpy.calledWith(sControlToRemoveId), "The control is removed from the AssociatedContent");
			assert.strictEqual(oAssociativePopover.getAssociatedContent().indexOf(sControlToRemoveId), -1, "The control cannot be found in the AssociatedContent");
			assert.strictEqual(oOverflowTB.getContent().length, aContent.length - 1, "For a toolbar with width = " + sWidth + ", removing the last control works");

			oOverflowTB.destroy();
		}, this);

	});

	QUnit.test("[removeAllContent] Removing all controls with removeAllContent really removes all controls, even if there were some in the popover", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				widthTypes = getSampleWidths();

		widthTypes.forEach(function (sWidth) {
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			oOverflowTB.removeAllContent();

			assert.strictEqual(oOverflowTB.getContent().length, 0, "For a toolbar with width = " + sWidth + ", removing all controls really empties the aggregation");

			oOverflowTB.destroy();
		});

	});

	QUnit.test("[destroyContent] Destroying the aggregation does not leave out any controls in the popover", function (assert) {
		var aContent,
				oOverflowTB,
				widthTypes = getSampleWidths();

		widthTypes.forEach(function (sWidth) {
			aContent = getDefaultContent();
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			oOverflowTB.destroyContent();
			this.clock.tick(1000);
			assert.strictEqual(oOverflowTB.getContent().length, 0, "For a toolbar with width = " + sWidth + ", after destroying the aggregation, there are no controls left");

			// There shouldn't be an overflow button and it should be visible
			var oOverflowButton = oOverflowTB._getOverflowButton();
			assert.strictEqual(oOverflowButton.$().is(":visible"), false, "The overflow button is not visible");

			oOverflowTB.destroy();
		}, this);

	});

	QUnit.test("[indexOfContent] Getting all controls by index is possible no matter whether a control is in the popover or in the toolbar", function (assert) {
		var aContent,
				oOverflowTB,
				widthTypes = getSampleWidths();

		widthTypes.forEach(function (sWidth) {
			aContent = getDefaultContent();
			oOverflowTB = createOverflowToolbar({width: sWidth}, aContent);
			aContent.forEach(function (oControl, i) {
				assert.strictEqual(oOverflowTB.indexOfContent(oControl), i, "For a toolbar with width = " + sWidth + ", the control with index " + i + " has the same index in the aggregation");
			});

			oOverflowTB.destroy();
		});

	});

	QUnit.test("[bindAggregation] Binding the control to a model makes it load the items from the model", function (assert) {
		var oOverflowTB,
				oModel,
				oButtonTemplate,
				oData,
				widthTypes = getSampleWidths();

		// The template
		oButtonTemplate = new Button({
			text: "{text}"
		});

		// The data
		oData = {
			buttons: [
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 1"},
				{text: "Button 2"}
			]
		};

		oModel = new JSONModel();
		oModel.setData(oData);

		widthTypes.forEach(function (sWidth) {
			oOverflowTB = createOverflowToolbar({width: sWidth}, getDefaultContent());
			oOverflowTB.setModel(oModel);
			oOverflowTB.bindAggregation("content", "/buttons", oButtonTemplate);
			this.clock.tick(1000);
			assert.strictEqual(oOverflowTB.getContent().length, oData.buttons.length, "When the width is: " + sWidth + ", the toolbar properly displays all buttons from the data source");

			// There should be an overflow button and it should be visible
			var oOverflowButton = oOverflowTB._getOverflowButton();
			if (sWidth > 0) {
				assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible when size > 0");
			}

			oOverflowTB.destroy();
		}, this);

	});

	QUnit.test("Destroying a control that is in the overflow is possible", function (assert) {

		var btn = new Button({
					text: "Button in overflow",
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow})
				}),
				oOverflowTB = createOverflowToolbar({width: 'auto'}, [btn]);

		sap.ui.getCore().applyChanges();

		btn.destroy();

		assert.strictEqual(oOverflowTB.getContent().length, 0, "Button successfully removed from the toolbar");

		oOverflowTB.destroy();
	});

	QUnit.module("Layout");

	QUnit.test("Changing a control'с property does not change the order in controls' collections", function (assert) {
		// Arrange
		var aContent = getDefaultContent(),
			oOverflowTB,
			oLabel;

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		oLabel = aContent[0];

		// Act
		oLabel.setText("New text");

		// Assert
		assert.strictEqual(oOverflowTB._aMovableControls.indexOf(oLabel), 0, "Labels is still on index 0 in movable controls collection");

		// Clean-up
		oOverflowTB.destroy();
	});

	QUnit.test("Changing a control property that affects control size(visibility) forces a recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy;

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		aContent[5].setVisible(false);

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 1, "Layout recalculation triggered (_resetAndInvalidateToolbar called)");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing visible property of control, before the OFT is rendered, moves control in suitable collection", function (assert) {
		// Arrange
		var aContent = getDefaultContent(),
			oOverflowTB = new OverflowToolbar({content: aContent, width: "auto"});

		// Assert
		assert.ok(oOverflowTB._aMovableControls.indexOf(aContent[5]) > -1,
			"The button with visible = true is in movables controls collection before its property is changed to false");

		//Act
		aContent[5].setVisible(false);
		oOverflowTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oOverflowTB._aMovableControls.indexOf(aContent[5]) === -1,
			"The button with visible = false is moved out from the movables controls collection");

		// Clean up
		oOverflowTB.destroy();
	});

	QUnit.test("Changing selected item of sap.m.Select, which has autoAdjustWidth: true (affects control size), forces recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy;

		var oSelect = new Select({
			autoAdjustWidth: true,
			items: [
				new Item({id: "idItem1", text: "Item 1"}),
				new Item({id: "idItem2", text: "This is an extremely long Item 2"})
			]
		});

		aContent.push(oSelect);

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		oSelect.setSelectedItemId("idItem2");

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 1, "Layout recalculation triggered (_resetAndInvalidateToolbar called)");

		//simulate select control is in the overflow
		oSelect._bIsInOverflow = true;

		iInvalidationCountBefore = spy.callCount;

		oSelect.setSelectedItemId("idItem1");

		this.clock.tick(1000);

		iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 0, "Layout recalculation not triggered when select is in the overflow");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing width of sap.m.SegmentedButton fires _containerWidthChanged event, which triggers _resetAndInvalidateToolbar when in Toolbar",
	function (assert) {
		var oSegmentedButton = new sap.m.SegmentedButton({
				selectedKey: "Item1",
				items: [
					new sap.m.SegmentedButtonItem({id: "idSBItem1", key: "Item1", text: "Item 1", icon: "sap-icon://home"}),
					new sap.m.SegmentedButtonItem({id: "idSBItem2", key: "Item2", text: "Item 2", icon: "sap-icon://home"})
				]
			}),
			aContent = [oSegmentedButton],
			oOverflowTB,
			oSpyInvalidationEvent,
			oStubWidth;


		// arrange
		oSpyInvalidationEvent = this.spy(oSegmentedButton, "fireEvent");
		oOverflowTB = createOverflowToolbar({}, aContent);
		this.clock.tick(1000);

		// assert
		assert.notOk(oSpyInvalidationEvent.calledWith("_containerWidthChanged"), "_containerWidthChanged event is not fired on first rendering");

		// act - simulate image load, which changes width and calls _updateWidth
		oStubWidth = this.stub(oSegmentedButton, "_previousWidth", 100);
		oSegmentedButton._updateWidth();

		// assert
		assert.ok(oSpyInvalidationEvent.calledWith("_containerWidthChanged"),
			"Layout recalculation triggered (when SegmentedButton's width is changed, _resetAndInvalidateToolbar is called)");

		oStubWidth.restore();
		oOverflowTB.destroy();
	});

	QUnit.test("Changing width of sap.m.SegmentedButton does not fire _containerWidthChanged event, when in Associative Popover",
	function (assert) {
		var oSegmentedButton = new sap.m.SegmentedButton({
			selectedKey: "Item1",
			items: [
				new sap.m.SegmentedButtonItem({id: "idSBItem1", key: "Item1", text: "Item 1", icon: "sap-icon://home"}),
				new sap.m.SegmentedButtonItem({id: "idSBItem2", key: "Item2", text: "Item 2", icon: "sap-icon://home"})
			]
		}),
		aContent = [oSegmentedButton],
		oOverflowTB,
		oSpyInvalidationEvent,
		oOverflowButton;

		// arrange
		oSpyInvalidationEvent = this.spy(oSegmentedButton, "fireEvent");
		oOverflowTB = createOverflowToolbar({width: "50px"}, aContent);
		this.clock.tick(1000);

		// assert
		assert.notOk(oSpyInvalidationEvent.calledWith("_containerWidthChanged"), "_containerWidthChanged event is not fired on first rendering");

		// act - click the overflow button
		oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();

		// assert
		assert.notOk(oSpyInvalidationEvent.calledWith("_containerWidthChanged"),
			"_containerWidthChanged event is not fired when SegmentedButton is in the Associative Popover, even though the SegmentedButton's size is changed");

		oOverflowTB.destroy();
	});

	QUnit.test("_contentSizeChange event is fired with invalidate = true", function (assert) {
		// Arrange
		var oGenericTag = new GenericTag({
					text: "Test1"
				}),
				oOverflowTB = new OverflowToolbar({content: [oGenericTag]}),
				fnCheckContentSize = function(oEvent) {
					// Assert
					assert.ok(oEvent.getParameter("invalidate"), "invalidate property of the Event object is true");
					assert.ok(oOverflowTB._bHasFlexibleContent, "_bHasFlexibleContent is true");

					// Clean up
					done();
				},
				done = assert.async();

		assert.expect(2);

		// Act
		oOverflowTB.placeAt("qunit-fixture");
		oOverflowTB.attachEventOnce("_contentSizeChange", fnCheckContentSize);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Changing selected item's data model of sap.m.Select, which has autoAdjustWidth: true (affects control size), forces recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oModel,
				oOverflowTB,
				spy;

		var oSelect = new Select({
			autoAdjustWidth: true,
			items: [
				new Item({id: "idItem1", text: "{/}"})
			]
		});

		aContent.push(oSelect);

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oModel = new JSONModel();
		oModel.setData("text");
		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		oOverflowTB.setModel(oModel);

		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		oModel.setData("extremely long text");
		oOverflowTB.setModel(oModel);

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 1, "Layout recalculation triggered (_resetAndInvalidateToolbar called)");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing a control property that does not affect control size(enabled) does not force a recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy;

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		aContent[5].setEnabled(false);

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 0, "Layout recalculation not triggered (_resetAndInvalidateToolbar not called)");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing selected item of sap.m.Select, which has autoAdjustWidth: false (does Not affect control size), does Not force recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy;

		var oSelect = new Select({
			autoAdjustWidth: false,
			items: [
				new Item({id: "idItem1", text: "Item 1"}),
				new Item({id: "idItem2", text: "This is an extremely long Item 2"})
			]
		});

		aContent.push(oSelect);

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		oSelect.setSelectedItemId("idItem2");

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 0, "Layout recalculation Not triggered (_resetAndInvalidateToolbar Not called)");

		oOverflowTB.destroy();
	});

	QUnit.test("Changing the layout of controls in the toolbar forces a recalculation of the layout", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy;

		spy = this.spy(OverflowToolbar.prototype, "onLayoutDataChange");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		aContent[5].setLayoutData(new OverflowToolbarLayoutData({stayInOverflow: true}));
		this.clock.tick(1000);

		assert.strictEqual(spy.callCount, 1, "Layout recalculation triggered");

		// There should be an overflow button and it should be visible
		var oOverflowButton = oOverflowTB._getOverflowButton();
		assert.strictEqual(oOverflowButton.$().is(":visible"), true, "The overflow button is visible");

		oOverflowTB.destroy();
	});

	QUnit.test("[_doLayout] Control-size cache is invalidated only when necessary and resize handler is called always", function (assert) {
		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		var spyCache = this.spy(OverflowToolbar.prototype, "_cacheControlsInfo");
		var spyResizeHandler = this.spy(OverflowToolbar.prototype, "_setControlsOverflowAndShrinking");

		// Change the width of the toolbar - the cache should not be invalidated
		oOverflowTB.setWidth("251px");
		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 0, "When there is just a resize, the cache isn't recalculated");
		assert.strictEqual(spyResizeHandler.callCount, 1, "For every resize/change, _setControlsOverflowAndShrinking is called");

		// Resize a button - the cache should be invalidated
		aDefaultContent[0].setWidth("101px");
		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 1, "When a control changes a property that affects size, the cache is recalculated");
		assert.strictEqual(spyResizeHandler.callCount, 2, "For every resize/change, _setControlsOverflowAndShrinking is called");

		// Add a button - the cache should be invalidated
		oOverflowTB.addContent(new Button({width: "100px"}));
		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 2, "When a new control is inserted, the cache is recalculated");
		assert.strictEqual(spyResizeHandler.callCount, 3, "For every resize/change, _setControlsOverflowAndShrinking is called");

		// Change the width of the toolbar again - the cache should not be invalidated
		oOverflowTB.setWidth("550px");
		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 2, "When there is just a resize (again), the cache isn't recalculated");
		assert.strictEqual(spyResizeHandler.callCount, 4, "For every resize/change, _setControlsOverflowAndShrinking is called");

		// Change the layout of a button - the cache should be invalidated
		aDefaultContent[1].setLayoutData(new OverflowToolbarLayoutData({stayInOverflow: true}));
		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 3, "When the layout of a control is changed, the cache is recalculated");
		assert.strictEqual(spyResizeHandler.callCount, 5, "For every resize/change, _setControlsOverflowAndShrinking is called");

		oOverflowTB.getContent()[0].setVisible(false);
		oOverflowTB._handleResize();

		this.clock.tick(1000);

		assert.strictEqual(spyCache.callCount, 5,
			"If visibility of a content Control is changed, cacheControlsInfo func is called again upon rerendering");

		oOverflowTB.destroy();
	});


	QUnit.test("[destroyContent] check for is overflowButton rendered after destroyContent execution", function (assert) {
		var oOverflowTBbar = createOverflowToolbar({
				width: "100%"
			});

		oOverflowTBbar.destroyContent();

		for (var i = 0; i < 20; i++) {
			oOverflowTBbar.addContent(new sap.m.Button({text: "Very long text for test"}));
		}

		this.clock.tick(500);
		assert.equal(oOverflowTBbar._getOverflowButtonNeeded(), true, "Button should be displayed");
		assert.equal(oOverflowTBbar.$().find("#" + oOverflowTBbar.getId() + "-overflowButton").length, 1, "Button was rendered");

	});

	QUnit.test("[onThemeChanged] resets also values in _aControlSizes object", function (assert) {
		// Create a toolbar 550px wide with 5 buttons x 100px each, so all can fit (button margins included)
		var aDefaultContent = [
			new Button({text: "1", width: "100px"}),
			new Button({text: "2", width: "100px"}),
			new Button({text: "3", width: "100px"}),
			new Button({text: "4", width: "100px"}),
			new Button({text: "5", width: "100px"})
		],
		oOverflowTB = createOverflowToolbar({
			width: "550px"
		}, aDefaultContent);

		oOverflowTB.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		oOverflowTB.onThemeChanged();

		for (var iControlSize in oOverflowTB._aControlSizes) {
			if (oOverflowTB._aControlSizes.hasOwnProperty(iControlSize)) {
				assert.strictEqual(oOverflowTB._aControlSizes[iControlSize], 0, "Cached control size is 0");
			}
		}

		oOverflowTB.destroy();
	});

	QUnit.test("[_cacheControlsInfo] Control caching works properly", function (assert) {
		var spyCache = this.spy(OverflowToolbar.prototype, "_cacheControlsInfo"),
				aDefaultContent = [
					new Text({text: "Label1", width: "100px"}),
					new Text({text: "Label2", width: "100px"}),
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px", layoutData: new OverflowToolbarLayoutData({stayInOverflow: true})}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);


		assert.strictEqual(spyCache.callCount, 1, "After a toolbar is created, _cacheControlsInfo is called once and _bControlsInfoCached is set to true");
		assert.strictEqual(oOverflowTB._bControlsInfoCached, true, "After a toolbar is created, _bControlsInfoCached is set to true");
		assert.strictEqual(oOverflowTB._aMovableControls.length, 4, "4 of the buttons are properly marked as movable to the popover");
		assert.strictEqual(oOverflowTB._aToolbarOnlyControls.length, 2, "The 2 texts are properly marked as toolbar only");
		assert.strictEqual(oOverflowTB._aPopoverOnlyControls.length, 1, "The button with special layout is properly marked as popover only");

		assert.strictEqual(oOverflowTB._aMovableControls, oOverflowTB._aAllCollections[0], 'before clear, _aMovableControls is correctly referenced from _aAllCollections');

		oOverflowTB._clearAllControlsCollections();

		assert.strictEqual(oOverflowTB._aMovableControls, oOverflowTB._aAllCollections[0], 'after clear, _aMovableControls is correctly referenced from _aAllCollections');

		// Note: control sizes and total content size are not checked here because they depend on margins and calculations are not always predictable

		oOverflowTB.destroy();
	});

	QUnit.test("no Popover when Popover content is not visible", function (assert) {
		var oToolbarOnlyControl = new Text({
				maxLines: 1, wrapping: true, text: "Sales and Total sales by Product and Quarter",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow,
					shrinkable: true
				})
			}),
			oMovableControl = new OverflowToolbarButton({text: 'text1', visible: false}),
			aContent = [
				oToolbarOnlyControl,
				oMovableControl
			],
			oOverflowTB = createOverflowToolbar({
				width: "300px" // width is purposely smaller that the content width
			}, aContent);

		assert.strictEqual(oOverflowTB._aMovableControls.length, 0, "invisible buttons are skipped");

		oMovableControl.setVisible(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oOverflowTB._aMovableControls.length, 1, "movable visible button is inclided");

		oOverflowTB.destroy();
	});

	QUnit.test("requestAnimationFrame is canceled when OverflowToolbar is destroyed", function (assert) {
		var aContent = getDefaultContent(),
			oOverflowTB = createOverflowToolbar({width: 'auto', asyncMode: true}, aContent),
			done = assert.async();

		assert.expect(2);
		this.clock.restore();

		setTimeout(function () {
			assert.ok(oOverflowTB._iFrameRequest !== null, "requestAnimationFrame is assigned");
			oOverflowTB.destroy();
				assert.strictEqual(oOverflowTB._iFrameRequest, null, "requestAnimationFrame is canceled after destroy");

				done();
		}, 200);
	});

	QUnit.test("changing property of an invisible control inside OT, does nоt force it to rerender", function (assert) {

	// Arrange
		var oLabel = new Label({text: "Text", visible: false, id: "label_0"}),
			aContent = [oLabel, new Button()],
			oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent),
			spyOTInvalidate = this.spy(OverflowToolbar.prototype, "invalidate");
	// Act
		oLabel.setText("Text123");
		sap.ui.getCore().applyChanges();
	// Assert
		assert.strictEqual(spyOTInvalidate.callCount, 0);

	// Clean
		spyOTInvalidate.restore();
	});

	QUnit.test("Mark first/last visible child", function (assert) {
		// Arrange
		var aContent = getDefaultContent();

			createOverflowToolbar({}, aContent);

		// Assert
		assert.ok(aContent[0].$().hasClass("sapMBarFirstVisibleChild"), "First visible child is marked.");
		assert.ok(aContent[aContent.length - 1].$().hasClass("sapMBarLastVisibleChild"), "Last visible child is marked.");
	});

	QUnit.test("Mark first/last visible child when there are not visible children", function (assert) {
		assert.expect(4);
		// Arrange
		var aContent = getDefaultContent(),
			oOverflowTB = createOverflowToolbar({}, aContent),
			done = assert.async(),
			iControlsWithFirstChildClass,
			iControlsWithLastChildClass,
			oDelegate = {
				onAfterRendering: function () {
					oOverflowTB.removeEventDelegate(oDelegate);

					iControlsWithFirstChildClass = aContent.filter(function (oElement) {
						return oElement.$().hasClass("sapMBarFirstVisibleChild");
					}).length;
					iControlsWithLastChildClass = aContent.filter(function (oElement) {
						return oElement.$().hasClass("sapMBarLastVisibleChild");
					}).length;

					// assert
					assert.strictEqual(iControlsWithFirstChildClass, 1, "Only 1 child with sapMBarFirstVisibleChild class.");
					assert.strictEqual(iControlsWithLastChildClass, 1, "Only 1 child with sapMBarLastVisibleChild class.");
					assert.ok(aContent[1].$().hasClass("sapMBarFirstVisibleChild"), "First visible child is marked.");
					assert.ok(aContent[aContent.length - 2].$().hasClass("sapMBarLastVisibleChild"), "Last visible child is marked.");
					done();

					// Clean-up
					oOverflowTB.destroy();
				}
			};

		aContent[0].setVisible(false);
		aContent[aContent.length - 1].setVisible(false);
		oOverflowTB.addEventDelegate(oDelegate);

		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Resize handling");

	QUnit.test("Handling of resizes that don't move elements around", function (assert) {

		var aDefaultContent = [
				new Button({text: "1", width: "100px"}),
				new Button({text: "2", width: "100px"}),
				new Button({text: "3", width: "100px"}),
				new Button({text: "4", width: "100px"}),
				new Button({text: "5", width: "100px"})
			],
			oOverflowTB = createOverflowToolbar({
				width: "550px"
			}, aDefaultContent);

		var spyResizeHandler = this.spy(OverflowToolbar.prototype, "_setControlsOverflowAndShrinking");
		var spyInvalidate = this.spy(OverflowToolbar.prototype, "invalidate");
		var spyFlexbox = this.spy(OverflowToolbar.prototype, "_checkContents");

		// The toolbar already can fit all items, increase its size by 1px so that no rearranging will be necessary
		oOverflowTB.setWidth("551px");
		assert.strictEqual(spyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");
		this.clock.tick(1000);

		assert.strictEqual(spyResizeHandler.callCount, 1, "The resize handler was called once");
		assert.strictEqual(spyInvalidate.callCount, 1, "It did NOT call invalidate");
		assert.strictEqual(spyFlexbox.callCount, 0, "It did NOT set flexbox css");

		oOverflowTB.destroy();
	});

	QUnit.test("Handling of resizes that move elements around", function (assert) {

		var aDefaultContent = [
					new Button({text: "1", width: "100px"}),
					new Button({text: "2", width: "100px"}),
					new Button({text: "3", width: "100px"}),
					new Button({text: "4", width: "100px"}),
					new Button({text: "5", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		var spyResizeHandler = this.spy(OverflowToolbar.prototype, "_setControlsOverflowAndShrinking");
		var spyInvalidate = this.spy(OverflowToolbar.prototype, "invalidate");
		var spyFlexbox = this.spy(OverflowToolbar.prototype, "_checkContents");

		// Decrease the size so that some buttons have to move the popover
		oOverflowTB.setWidth("200px");
		assert.strictEqual(spyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");
		this.clock.tick(1000);

		assert.strictEqual(spyResizeHandler.callCount, 1, "The resize handler was called once");
		assert.strictEqual(spyInvalidate.callCount, 2, "It called invalidate");
		assert.strictEqual(spyFlexbox.callCount, 0, "It did NOT set flexbox css");

		oOverflowTB.destroy();
	});

	QUnit.test("Items must first overflow and then shrink", function (assert) {

		var aDefaultContent = [
					new Text({text: "This is a very very very long text"}),
					new Button({text: "2", width: "100px"})
				],
				oOverflowTB = createOverflowToolbar({
					width: "550px"
				}, aDefaultContent);

		var spyResizeHandler = this.spy(OverflowToolbar.prototype, "_setControlsOverflowAndShrinking");
		var spyInvalidate = this.spy(OverflowToolbar.prototype, "invalidate");
		var spyFlexbox = this.spy(OverflowToolbar.prototype, "_checkContents");

		// Decrease the size so that all buttons must overflow and the label must be shrunk
		oOverflowTB.setWidth("60px");
		assert.strictEqual(spyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");
		this.clock.tick(1000);

		assert.strictEqual(spyResizeHandler.callCount, 1, "The resize handler was called once");
		assert.strictEqual(spyInvalidate.callCount, 2, "It called invalidate");
		assert.strictEqual(spyFlexbox.callCount, 1, "It set flexbox css");

		oOverflowTB.destroy();
	});

	function testShrinkableLayoutData(sTestName, sWidth, aControls, aSpyCalls, aAsserts) {
		QUnit.test(sTestName, function (assert) {
			// arrange
			var aDefaultContent = aControls,
					oOverflowTB = createOverflowToolbar({
						width: "550px"
					}, aDefaultContent),
				spyResizeHandler = this.spy(OverflowToolbar.prototype, "_setControlsOverflowAndShrinking"),
				spyInvalidate = this.spy(OverflowToolbar.prototype, "invalidate"),
				spyFlexbox = this.spy(OverflowToolbar.prototype, "_checkContents"),
				spyFlexboxWithLayoutData = this.spy(OverflowToolbar.prototype, "_markControlsWithShrinkableLayoutData");

			// act
			oOverflowTB.setWidth(sWidth);
			assert.strictEqual(spyInvalidate.callCount, aSpyCalls[0], aAsserts[0]);
			this.clock.tick(500);

			// assert
			assert.strictEqual(spyResizeHandler.callCount, aSpyCalls[1], aAsserts[1]);
			assert.strictEqual(spyFlexboxWithLayoutData.callCount, aSpyCalls[2], aAsserts[2]);
			assert.strictEqual(spyFlexbox.callCount, aSpyCalls[3], aAsserts[3]);

			// cleanup
			oOverflowTB.destroy();
		});
	}

	testShrinkableLayoutData(
		"Items with LayoutData and shrinkable = true overflow to min possible width \
		and if there's still not enough space, items with no LayoutData go to overflow",
		"230px",
		[
			new Button({text: "This is a very very very long text"}),
			new Button(
				{
					text: "2",
					layoutData: new OverflowToolbarLayoutData({
						shrinkable: true,
						minWidth: "20px"
					})
				})
		],
		[1, 1, 1, 0],
		["invalidate is called by the framework after the resize",
		"the resize handler is called once",
		"_markControlsWithShrinkableLayoutData is called and the second button is shrinked",
		"_checkContents is not called and the first button is not shrinked"]);

	testShrinkableLayoutData(
		"Items with LayoutData and shrinkable = true overflow to min possible width \
		and if there's enough space, other items don't overflow",
		"260px",
		[
			new Button({text: "This is a very very very long text"}),
			new Button(
				{
					text: "2",
					layoutData: new OverflowToolbarLayoutData({
						shrinkable: true,
						minWidth: "20px"
					})
				})
		],
		[1, 1, 1, 0],
		["invalidate is called by the framework after the resize",
		"the resize handler is called once",
		"_markControlsWithShrinkableLayoutData is called and the second button is shrinked",
		"_checkContents is not called and the first button is not shrinked"]);

	testShrinkableLayoutData(
		"If min possible width of item with LayoutData is reached and \
		there is still not enough place for other items, they can also shrink",
		"60px",
		[
			new Text({text: "This is a very very very long text"}),
			new Button(
				{
					text: "2",
					layoutData: new OverflowToolbarLayoutData({
						shrinkable: true,
						minWidth: "20px"
					})
				})
		],
		[1, 1, 1, 1],
		["invalidate is called by the framework after the resize",
		"the resize handler is called once",
		"_markControlsWithShrinkableLayoutData is called and the button is shrinked",
		"_checkContents is called and the text is also shrinked"]);

	QUnit.module("Resize handling async");

	QUnit.test("Handling of resizes that don't move elements around", function (assert) {
		// Arrange
		var aDefaultContent = [
			new Button({text: "1", width: "100px"}),
			new Button({text: "2", width: "100px"}),
			new Button({text: "3", width: "100px"}),
			new Button({text: "4", width: "100px"}),
			new Button({text: "5", width: "100px"})
		],
		oOverflowTB = createOverflowToolbar({
			width: "550px"
		}, aDefaultContent),
		done = assert.async(),
		oSpy = this.spy,
		oSpyResizeHandler,
		oSpyInvalidate,
		oSpyFlexbox;

		assert.expect(4);
		this.clock.restore();

		setTimeout(function () {
			oSpyResizeHandler = oSpy(oOverflowTB, "_setControlsOverflowAndShrinking");
			oSpyInvalidate = oSpy(oOverflowTB, "invalidate");
			oSpyFlexbox = oSpy(oOverflowTB, "_checkContents");

			// Act - the toolbar already can fit all items, increase its size by 1px so that no rearranging will be necessary
			oOverflowTB.setWidth("551px");
			assert.strictEqual(oSpyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");

			setTimeout(function () {
				// Assert
				assert.strictEqual(oSpyResizeHandler.callCount, 1, "The resize handler was called once");
				assert.strictEqual(oSpyInvalidate.callCount, 1, "It did NOT call invalidate again");
				assert.strictEqual(oSpyFlexbox.callCount, 0, "It did NOT set flexbox css");

				// Clean up
				oOverflowTB.destroy();
				done();
			}, 200);
		}, 200);
	});

	QUnit.test("Handling of resizes that move elements around", function (assert) {
		// Arrange
		var aDefaultContent = [
				new Button({text: "1", width: "100px"}),
				new Button({text: "2", width: "100px"}),
				new Button({text: "3", width: "100px"}),
				new Button({text: "4", width: "100px"}),
				new Button({text: "5", width: "100px"})
			],
			oOverflowTB = createOverflowToolbar({
				width: "550px"
			}, aDefaultContent),
			done = assert.async(),
			oSpy = this.spy,
			oSpyResizeHandler,
			oSpyInvalidate,
			oSpyFlexbox;

		assert.expect(4);
		this.clock.restore();

		setTimeout(function () {
			oSpyResizeHandler = oSpy(oOverflowTB, "_setControlsOverflowAndShrinking");
			oSpyInvalidate = oSpy(oOverflowTB, "invalidate");
			oSpyFlexbox = oSpy(oOverflowTB, "_checkContents");

			// Act - decrease the size so that some buttons have to move the popover
			oOverflowTB.setWidth("200px");
			assert.strictEqual(oSpyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");

			setTimeout(function () {
				// Assert
				assert.strictEqual(oSpyResizeHandler.callCount, 1, "The resize handler was called once");
				assert.strictEqual(oSpyInvalidate.callCount, 2, "It called invalidate");
				assert.strictEqual(oSpyFlexbox.callCount, 0, "It did NOT set flexbox css");

				// Clean up
				oOverflowTB.destroy();
				done();
			}, 200);
		}, 200);
	});

	QUnit.test("Items must first overflow and then shrink", function (assert) {
		// Arrange
		var aDefaultContent = [
				new Text({text: "This is a very very very long text"}),
				new Button({text: "2", width: "100px"})
			],
			oOverflowTB = createOverflowToolbar({
				width: "550px"
			}, aDefaultContent),
			done = assert.async(),
			oSpy = this.spy,
			oSpyResizeHandler,
			oSpyInvalidate,
			oSpyFlexbox;

		assert.expect(4);
		this.clock.restore();

		setTimeout(function () {
			oSpyResizeHandler = oSpy(oOverflowTB, "_setControlsOverflowAndShrinking");
			oSpyInvalidate = oSpy(oOverflowTB, "invalidate");
			oSpyFlexbox = oSpy(oOverflowTB, "_checkContents");

			// Act - decrease the size so that all buttons must overflow and the label must be shrunk
			oOverflowTB.setWidth("60px");
			assert.strictEqual(oSpyInvalidate.callCount, 1, "invalidate was called by the framework after the resize");

			setTimeout(function () {
				// Assert
				assert.strictEqual(oSpyResizeHandler.callCount, 1, "The resize handler was called once");
				assert.strictEqual(oSpyInvalidate.callCount, 2, "It called invalidate");
				assert.strictEqual(oSpyFlexbox.callCount, 1, "It set flexbox css");

				// Clean up
				oOverflowTB.destroy();
				done();
			}, 200);
		}, 200);
	});

	QUnit.module("Integration");

	QUnit.test("Sliders work inside an overflow toolbar", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				spy,
				oSlider = new Slider({width: "200px"});

		aContent.push(oSlider);

		spy = this.spy(OverflowToolbar.prototype, "_resetAndInvalidateToolbar");

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		var iInvalidationCountBefore = spy.callCount;

		// Change the value of the slider
		oSlider.setValue(1);

		this.clock.tick(1000);

		var iInvalidationCountAfter = spy.callCount;

		assert.strictEqual(iInvalidationCountAfter - iInvalidationCountBefore, 0, "Changing the value of the sliderLayout does not trigger recalculation (_resetAndInvalidateToolbar not called)");

		oOverflowTB.destroy();
	});

	QUnit.test("Buttons with closeOverflowOnInteraction=false do not close the popover", function (assert) {
		var aContent = getDefaultContent(),
				oOverflowTB,
				oBtn = new Button({
					text: "Do not close",
					width: "200px",
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.AlwaysOverflow,
						closeOverflowOnInteraction: false
					})
				});

		aContent.push(oBtn);

		oOverflowTB = createOverflowToolbar({width: 'auto'}, aContent);
		this.clock.tick(1000);

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Click the special button
		oBtn.firePress();
		this.clock.tick(1000);

		// The overflow area should still be visible
		var oPopover = oOverflowTB._getPopover();
		assert.strictEqual(oPopover.$().is(":visible"), true, "Even though the button was clicked, the overflow area is visible");

		oOverflowTB.destroy();
	});

	QUnit.test("Popover can listen to private interaction events from associative controls", function (assert) {
		var oOverflowTB = new OverflowToolbar({width: 'auto'}),
			oPopover = oOverflowTB._getPopover(),
			oMenuItem = new MenuItem({text:"Item1"}),
			oMenu = new Menu({items: [ oMenuItem ]}),
			oBtn = new MenuButton({
				text: "Do not close",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.AlwaysOverflow,
					closeOverflowOnInteraction: true
				}),
				menu: oMenu
			}),
			spy;

		oOverflowTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		spy = this.spy(oPopover, "_closeOnInteraction");

		oOverflowTB.addContent(oBtn);
		this.clock.tick(1000);

		// Click the overflow button
		var oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Click the menu item
		oMenu.fireItemSelected({item: oMenuItem});
		this.clock.tick(1000);

		// listener should be called
		assert.strictEqual(spy.called, true, "The listener for the private event is notified");

		oOverflowTB.destroy();
	});

	QUnit.module("Control size measurement");

	QUnit.test("Size of a visible control reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button({width: "200px"}),
			oOTB = createOverflowToolbar({}, [oTestButton]);

		oTestButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), 200);
	});

	QUnit.test("Size of an invisible control reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button({width: "200px", visible: false}),
			oOTB = createOverflowToolbar({}, [oTestButton]);

		oTestButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), 0);
	});

	QUnit.test("Size of a control that was measured before, but now not in the DOM, reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button(),
			oOTB = createOverflowToolbar({}, [oTestButton]);
			oOTB.destroy();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton, 333), 333);
	});

	QUnit.test("Size of a ToolbarSpacer with specified witdh is reported correctly", function (assert) {
		// Arrange
		var oTestToolbarSpacer = new ToolbarSpacer({ width: "20px" }),
			oOTB = createOverflowToolbar({}, [oTestToolbarSpacer]);

		oTestToolbarSpacer.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestToolbarSpacer), 20);
	});

	QUnit.test("Size of a control with LayoutData, shrinkable = true and minWidth, is reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button(
							{
								text: "This is text",
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: true,
									minWidth: "50px"
								})
							}),
			oOTB = createOverflowToolbar({}, [oTestButton]);

		oOTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), 50,
			"Size is equal to minWidth + margins");
	});

	QUnit.test("Size of a control with LayoutData, shrinkable = true and minWidth and visible = false, is reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button(
							{
								text: "This is text",
								visible: false,
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: true,
									minWidth: "50px"
								})
							}),
			oOTB = createOverflowToolbar({}, [oTestButton]);

		oOTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), 0,
			"Size is equal to 0");
	});

	QUnit.test("Size of a control with LayoutData, shrinkable = false and minWidth, is reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button(
							{
								text: "This is text",
								width: "200px",
								visible: true,
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: false,
									minWidth: "50px"
								})
							}),
			oOTB = createOverflowToolbar({}, [oTestButton]);

		oOTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), 200,
			"Size is equal to outer width");
	});

	QUnit.test("Size of a control with LayoutData, shrinkable = true and minWidth in rems, is reported correctly", function (assert) {
		// Arrange
		var oTestButton = new Button(
							{
								text: "This is text",
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: true,
									minWidth: "3rem"
								})
							}),
			oTestButton2 = new Button(
				{
					text: "This is text",
					layoutData: new OverflowToolbarLayoutData({
						shrinkable: true,
						minWidth: "50%"
					})
				}),
			oOTB = createOverflowToolbar({ width: "300px" }, [oTestButton, oTestButton2]),
			iRemInPx = DomUnitsRem.toPx("1rem");

		oOTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton), (3 * iRemInPx) + (2 * 0.25 * iRemInPx),
			"Size is equal to minWidth (3rem) + margins (2x0.25 rem)");

		assert.strictEqual(oOTB._getOptimalControlWidth(oTestButton2), (50 * 300) / 100 + (2 * 0.25 * iRemInPx),
			"Size is equal to minWidth (150px) + margins (2x0.25 rem)");
	});

	QUnit.module("Content size measurement");

	QUnit.test("Size of Overflow Button in Fiori 3 theme is reported correctly", function (assert) {
		// Arrange
		var oOverflowTB = new OverflowToolbar(),
			oMarginStub = this.stub(DomUnitsRem, "toPx", function () { return 0; }),
			oBaseFontSizeStub = this.stub(mobileLibrary, "BaseFontSize", "16px");

		// Assert
		assert.strictEqual(oOverflowTB._getOverflowButtonSize(), 44, "When there is no right margin, 0.25rem is deducted");

		// Clean-up
		oMarginStub.restore();
		oBaseFontSizeStub.restore();
	});


	QUnit.test("Size of content is reported correctly", function (assert) {
		var oButton1 = new Button({
					text: "Test1",
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow})
				}),
				oButton2 = new Button({text: "Test2"}),
				oOverflowTB = new OverflowToolbar({width: 'auto', content: [oButton1, oButton2]}),
				fnCheckContentSize = function(oEvent) {

					var iButton2Width = oOverflowTB._aControlSizes[oButton2.getId()],
							iOverflowButtonWidth = oOverflowTB._getOverflowButtonSize(),
							iExpectedContentSize = iButton2Width + iOverflowButtonWidth;

					assert.ok(oEvent.getParameter("contentSize"), iExpectedContentSize);
					done();
				},
				done = assert.async();

		oOverflowTB.placeAt("qunit-fixture");
		oOverflowTB.attachEventOnce("_contentSizeChange", fnCheckContentSize);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Presence of overflow button is checked correctly", function (assert) {
		var oButton1 = new Button({text: "Test1"}),
				oButton2 = new Button({text: "Test2"}),
				oOverflowTB = new OverflowToolbar({width: 'auto', content: [oButton1, oButton2]}),
				fnCheckContentSize = function(oEvent) {

					var iButton2Width = oOverflowTB._aControlSizes[oButton2.getId()],
							iOverflowButtonWidth = oOverflowTB._getOverflowButtonSize(),
							iExpectedContentSize = iButton2Width + iOverflowButtonWidth;

					assert.ok(oEvent.getParameter("contentSize"), iExpectedContentSize);
					done();
				},
				done = assert.async();

		oOverflowTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oOverflowTB.addContent(oButton1.clone());
		oButton1.setLayoutData(new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}));
		oOverflowTB.attachEventOnce("_contentSizeChange", fnCheckContentSize);
		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Focusing", {
		beforeEach: function () {
			this.oButtonUnderTest = new Button({
				id: "btnUnderTest",
				width: "150px"
			});
			this.oButtonUnderTest2 = new Button({
				id: "btnUnderTest2",
				width: "150px"
			});
			this.oOTB = new OverflowToolbar({
				width: "300px",
				content: [
					this.oButtonUnderTest
				]
			});
			this.oOTBOverflowed = new OverflowToolbar({
				id: "smallOverflowTB",
				width: "100px",
				content: [
					new Button({
						text: "Press me",
						width: "200px"
					}),
					this.oButtonUnderTest2
				]
			});

			this.oOTB.placeAt("qunit-fixture");
			this.oOTBOverflowed.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			sinon.config.useFakeTimers = false;
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTBOverflowed.destroy();
			this.oOTB = null;
			this.oOTBOverflowed = null;
			this.oButtonUnderTest = null;
			this.oButtonUnderTest2 = null;
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Focus on toolbar child is retained after toolbar invalidation", function (assert) {
		assert.expect(2);

		// arrange
		var done = assert.async(),
			oApplyFocusSpy = this.spy(OverflowToolbar.prototype, "_applyFocus"),
			oDelegate = {
				onAfterRendering: function() {
					this.oOTB.removeEventDelegate(oDelegate);

					// assert
					assert.ok(oApplyFocusSpy.calledOnce, "Method _applyFocus called upon button focus.");
					assert.strictEqual(document.activeElement, this.oButtonUnderTest.getDomRef(), "Button is focused correctly :: " + this.oButtonUnderTest.getId());
					done();
				}.bind(this)
			};

		this.oOTB.addEventDelegate(oDelegate);

		// act - child control is on focus, invalidate the toolbar.
		this.oOTB.sFocusedChildControlId = this.oButtonUnderTest.getId();
		this.oOTB.setWidth("1000px");
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Focus on overflow button is retained after toolbar invalidation", function (assert) {
		assert.expect(1);

		// arrange
		var done = assert.async(),
			oOverflowButton = this.oOTBOverflowed._getOverflowButton(),
			oDelegate = {
				onAfterRendering: function() {
					this.oOTBOverflowed.removeEventDelegate(oDelegate);

					// assert
					assert.strictEqual(document.activeElement, oOverflowButton.getDomRef(), "OverflowButton is focused correctly :: " + oOverflowButton.getId());
					done();

				}.bind(this)
			};

		this.oOTBOverflowed.addEventDelegate(oDelegate);

		// act - overvlow button has been focused, then invalidate the toolbar.
		this.oOTBOverflowed.sFocusedChildControlId = oOverflowButton.getId();
		this.oOTBOverflowed.rerender();
	});

	QUnit.test("Focus should move on last child after toolbar expanding", function (assert) {
		assert.expect(3);

		// arrange
		var done = assert.async(),
			oOverflowButton = this.oOTBOverflowed._getOverflowButton(),
			oDelegate = {
				onAfterRendering: function() {
					// act (2) - remove delegate and simulate that overflow button is focused
					// Note: the _bOverflowButtonWasFocused flag is set after the invalidation,
					// because in this scenario the OTB invalidates twice and if the flag is set in act (1),
					// it will be internaly overwritten.
					this.oOTBOverflowed.removeEventDelegate(oDelegate);
					this.oOTBOverflowed._bOverflowButtonWasFocused = true;

					setTimeout(function() {
						// assert
						assert.strictEqual(document.activeElement.id, this.oButtonUnderTest2.getId(), "Last child control is focused correctly :: " + this.oButtonUnderTest2.getId());
						assert.strictEqual(this.oOTBOverflowed._getOverflowButtonNeeded(), false, "Toolbar has been expanded.");
						done();
					}.bind(this), 0);

				}.bind(this)
			};

		this.oOTBOverflowed.addEventDelegate(oDelegate);

		// assert
		assert.equal(this.oOTBOverflowed._getOverflowButtonNeeded(), true, "Toolbar is overflowed.");

		// act (1) - set toolbar width to larger than its content and invalidate the toolbar.
		this.oOTBOverflowed.setWidth("500px");
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Focus info is cleared upon sapfocusleave", function (assert) {
		// arrange
		var oResetChildControlFocusInfoSpy = this.spy(this.oOTB, "_resetChildControlFocusInfo");

		// act - trigger focus leave handler
		this.oOTB.sFocusedChildControlId = this.oButtonUnderTest.getId();
		this.oOTB.onsapfocusleave();

		// assert
		assert.ok(oResetChildControlFocusInfoSpy.calledOnce, "Method _resetChildControlFocusInfo called upon onsapfocusleave.");
		assert.strictEqual(this.oOTB.sFocusedChildControlId, "", "Focus info cleared.");
	});

	QUnit.test("Async: Focus on toolbar child is retained after toolbar invalidation", function (assert) {
		// Arrange
		var done = assert.async(),
			oSpy = this.spy,
			oOverflowTBbar = this.oOTB,
			oButtonUnderTest = this.oButtonUnderTest,
			oApplyFocusSpy;

		oOverflowTBbar.setAsyncMode(true);
		assert.expect(2);

		setTimeout(function () {
			// Act - child control is on focus, invalidate the toolbar.
			oApplyFocusSpy = oSpy(oOverflowTBbar, "_applyFocus");
			oOverflowTBbar.sFocusedChildControlId = oButtonUnderTest.getId();
			oOverflowTBbar.setWidth("1000px");
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				// Assert
				assert.ok(oApplyFocusSpy.calledOnce, "Method _applyFocus called upon button focus.");
				assert.strictEqual(document.activeElement, oButtonUnderTest.getDomRef(), "Button is focused correctly :: " + oButtonUnderTest.getId());
				done();
			}, 200);
		}, 200);
	});

	QUnit.module("Control destroy");

	QUnit.test("Popover is not re-created on layoutDataChange after Toolbar is destroyed", function (assert) {
		var oOTB = createOverflowToolbar({}, [
			getButton("B1"),
			getButton("B2")
		]), oPopover;

		// Arrange
		oOTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Overwrite the OverflowToolbar exit method
		// to simulate layoutDataChange is fired before the _popover aggregation is unregistered from the Core.
		oOTB.exit = function () {
			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				var fnOriginalDeregister = oPopover.deregister;
				oPopover.deregister = function(oElement) {};
				oPopover.destroy();
				this.onLayoutDataChange(); // call the layoutDataChange handler
				oPopover.deregister = fnOriginalDeregister;
				oPopover.deregister();
			}
		};

		// Act: destroy the OverflowToolbar
		oOTB.destroy(); // exit is called
		oPopover = oOTB.getAggregation("_popover");

		// Assert
		assert.strictEqual(oOTB._bIsBeingDestroyed, true, "Toolbar is destroyed");
		assert.strictEqual(oPopover, null, "Popover is destroyed");
	});

	QUnit.module("Private API: _markControlsWithShrinkableLayoutData", {
		beforeEach: function () {
			var aDefaultContent = [
						new Button(),
						new Button(
							{
								text: "This is text",
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: false
								})
							}),
						new Button(
							{
								text: "2",
								layoutData: new OverflowToolbarLayoutData({
									shrinkable: true,
									minWidth: "20px"
								})
							}),
						new Button(
						{
							text: "3",
							layoutData: new FlexItemData({
								growFactor: 1
							})
						})
					];
			this.oOTB = createOverflowToolbar({}, aDefaultContent);
		},
		afterEach: function () {
			this.oOTB.destroy();
		}
	});

	QUnit.test("_markControlsWithShrinkableLayoutData with items with fixed widths", function (assert) {
		var fnIsRelativeWidth = this.stub(Toolbar, "isRelativeWidth", function () { return false; }),
			aContent = this.oOTB.getContent(),
			sShrinkClass = "sapMTBShrinkItem";

		// act
		this.oOTB._markControlsWithShrinkableLayoutData();

		// assert
		aContent.forEach(function (oControl) {
			assert.notOk(oControl.hasStyleClass(sShrinkClass), "shrinkClass is not added");
		});

		// cleanup
		fnIsRelativeWidth.restore();
	});

	QUnit.test("_markControlsWithShrinkableLayoutData with items with not fixed width", function (assert) {
		var fnIsRelativeWidth = this.stub(Toolbar, "isRelativeWidth", function () { return true; }),
			aContent = this.oOTB.getContent(),
			oButton0 = aContent[0],
			oButton1 = aContent[1],
			oButton2 = aContent[2],
			oButton3 = aContent[3],
			sShrinkClass = "sapMTBShrinkItem";

		// act
		this.oOTB._markControlsWithShrinkableLayoutData();

		// assert
		assert.notOk(oButton0.hasStyleClass(sShrinkClass), "shrinkClass is not added when no LayoutData is set");
		assert.notOk(oButton1.hasStyleClass(sShrinkClass), "shrinkClass is not added when LayoutData is not shrinkable");
		assert.ok(oButton2.hasStyleClass(sShrinkClass), "shrinkClass is added when LayoutData is shrinkable");
		assert.notOk(oButton3.hasStyleClass(sShrinkClass), "shrinkClass is not added when LayoutData is from a different type. Error is not thrown.");

		// cleanup
		fnIsRelativeWidth.restore();
	});
});
