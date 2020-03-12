/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/IconTabHeader',
	'sap/m/IconTabFilter',
	'sap/tnt/ToolHeader',
	'sap/tnt/ToolHeaderUtilitySeparator',
	'sap/ui/qunit/utils/waitForThemeApplied'
], function(
	jQuery,
	App,
	Page,
	Button,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	IconTabHeader,
	IconTabFilter,
	ToolHeader,
	ToolHeaderUtilitySeparator,
	waitForThemeApplied) {

	'use strict';

	jQuery("#qunit-fixture").width('300px');

	function getToolHeader() {
		return new ToolHeader({
			content: [
				new Button({
					icon: 'sap-icon://menu2',
					type: sap.m.ButtonType.Transparent,
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					})
				}),
				new ToolbarSpacer({
					width: '20px'
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "File",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Edit",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "View",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Navigate",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "Code",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.Low
					})
				}),
				new ToolHeaderUtilitySeparator({}),
				new ToolbarSpacer({
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow,
						minWidth: "20px"
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					text: "User Name",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					})
				}),
				new Button({
					type: sap.m.ButtonType.Transparent,
					icon: "sap-icon://log",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
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
			sap.ui.getCore().applyChanges();
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
		assert.ok(sap.ui.getCore().byId(this.toolHeader.getId()), "created");
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
