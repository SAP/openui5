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
	'sap/ui/qunit/utils/nextUIUpdate',
	'sap/ui/qunit/utils/waitForThemeApplied'
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
	nextUIUpdate,
	waitForThemeApplied
) {
	'use strict';

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	jQuery("#" + DOM_RENDER_LOCATION).width('300px');

	/**
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

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
		beforeEach: async function () {
			this.oApp = new App("myApp", { initialPage: "toolHeaderPage" });
			this.oPage = new Page("toolHeaderPage", { title: "Tool Header" });
			this.oApp.placeAt(DOM_RENDER_LOCATION);
			this.oApp.addPage(this.oPage);

			this.toolHeader = getToolHeader();
			this.oPage.addContent(this.toolHeader);
			await nextUIUpdate(); // no fake timer active in beforeEach
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

	QUnit.test("overflow popover", async function (assert) {
		assert.ok(jQuery('.sapMOTAPopover').length == 0, "Popover is not rendered");

		var overflowButton = this.toolHeader.$('overflowButton');
		overflowButton.trigger('tap');

		assert.ok(jQuery('.sapMOTAPopover').length > 0, "Popover is rendered");

		await clearPendingUIUpdates(this.clock);
	});

	QUnit.test("ToolHeader sapMBarChildFirstChild class", async function (assert) {
		var oFirstControl = this.toolHeader.getContent()[0],
			oSecondControl = this.toolHeader.getContent()[1];

		//Assert
		assert.ok(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child has 'sapMBarChildFirstChild' class");
		assert.notOk(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child does not have 'sapMBarChildFirstChild' class");

		//Act
		oFirstControl.setVisible(false);
		await nextUIUpdate(this.clock);

		//Assert
		assert.notOk(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child does not have 'sapMBarChildFirstChild' class");
		assert.ok(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child now has 'sapMBarChildFirstChild' class, as the first one is not visible");
	});

	return waitForThemeApplied();
});
