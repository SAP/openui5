/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	'sap/ui/thirdparty/jquery',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/library',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/tnt/ToolHeader',
	'sap/tnt/ToolHeaderUtilitySeparator',
	'sap/ui/qunit/utils/waitForThemeApplied',
	"sap/ui/core/Core"
], function(
	Element,
	jQuery,
	App,
	Page,
	Button,
	mobileLibrary,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	ToolHeader,
	ToolHeaderUtilitySeparator,
	waitForThemeApplied,
	oCore
) {
	'use strict';

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	jQuery("#" + DOM_RENDER_LOCATION).width('300px');

	function getToolHeader() {
		return new ToolHeader({
			content: [
				new Button({
					icon: 'sap-icon://menu2',
					type: ButtonType.Transparent,
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})
				}),
				new ToolbarSpacer({
					width: '20px'
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "File",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "View",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Navigate",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Code",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.Low
					})
				}),
				new ToolHeaderUtilitySeparator({}),
				new ToolbarSpacer({
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.NeverOverflow,
						minWidth: "20px"
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "User Name",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.NeverOverflow
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					icon: "sap-icon://log",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority
.NeverOverflow
					})
				})
			]
		});
	}

	QUnit.module("API and Rendering", {
		beforeEach: function () {
			this.oApp = new App("myApp", { initialPage: "toolHeaderPage" });
			this.oPage = new Page("toolHeaderPage", { title: "Tool Header" });
			this.oApp.placeAt(DOM_RENDER_LOCATION);
			this.oApp.addPage(this.oPage);

			this.toolHeader = getToolHeader();
			this.oPage.addContent(this.toolHeader);
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
			this.oPage = null;
			this.toolHeader = null;
		}
	});

	QUnit.test("rendered", function (assert) {
		assert.strictEqual(this.toolHeader.$().length, 1, "should render");
	});

	QUnit.test("created", function (assert) {
		assert.ok(Element.getElementById(this.toolHeader.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.toolHeader.$().hasClass('sapTntToolHeader'), "sapTntToolHeader class is set");
	});

	QUnit.test("overflow button", function (assert) {
		var overflowButton = this.toolHeader.$('overflowButton');
		var overflowButtonClone = this.toolHeader.$('overflowButtonClone');

		assert.ok(overflowButton.length > 0, "Overflow button is rendered");
		assert.ok(overflowButtonClone.length > 0, "Overflow button clone is rendered");
	});

	QUnit.test("overflow popover", function (assert) {
		assert.ok(jQuery('.sapMOTAPopover').length == 0, "Popover is not rendered");

		var overflowButton = this.toolHeader.$('overflowButton');
		overflowButton.trigger('tap');

		assert.ok(jQuery('.sapMOTAPopover').length > 0, "Popover is rendered");
	});

	QUnit.test("ToolHeader sapMBarChildFirstChild class", function (assert) {
		var oFirstControl = this.toolHeader.getContent()[0],
			oSecondControl = this.toolHeader.getContent()[1];

		//Assert
		assert.ok(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child has 'sapMBarChildFirstChild' class");
		assert.notOk(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child does not have 'sapMBarChildFirstChild' class");

		//Act
		oFirstControl.setVisible(false);
		oCore.applyChanges();

		//Assert
		assert.notOk(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child does not have 'sapMBarChildFirstChild' class");
		assert.ok(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child now has 'sapMBarChildFirstChild' class, as the first one is not visible");
	});

	return waitForThemeApplied();
});
