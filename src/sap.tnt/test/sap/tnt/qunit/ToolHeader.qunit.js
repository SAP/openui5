/*global QUnit */
sap.ui.define([
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

	jQuery("#qunit-fixture").width('300px');

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
						priority: sap.m.OverflowToolbarPriority.Low
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
			this.oApp.placeAt("qunit-fixture");
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
		assert.ok(oCore.byId(this.toolHeader.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.toolHeader.$().hasClass('sapTntToolHeader'), "sapTntToolHeader class is set");
	});

	QUnit.test("overflow button", function (assert) {

		var overflowButton = this.toolHeader.$('overflowButton');
		assert.ok(overflowButton.length > 0, "Overflow button is rendered");
	});

	QUnit.test("overflow popover", function (assert) {
		assert.ok(jQuery('.sapMOTAPopover').length == 0, "Popover is not rendered");


		var overflowButton = this.toolHeader.$('overflowButton');
		overflowButton.trigger('tap');

		assert.ok(jQuery('.sapMOTAPopover').length > 0, "Popover is rendered");
	});

	return waitForThemeApplied();
});
