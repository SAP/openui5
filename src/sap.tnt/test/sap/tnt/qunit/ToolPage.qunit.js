/*global QUnit */
sap.ui.define([
	'sap/ui/Device',
	"sap/ui/core/Element",
	'sap/ui/model/json/JSONModel',
	'sap/m/Text',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/library',
	'sap/m/NavContainer',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/tnt/ToolHeader',
	'sap/tnt/ToolPage',
	'sap/tnt/ToolHeaderUtilitySeparator',
	'sap/tnt/SideNavigation',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	'sap/ui/qunit/utils/nextUIUpdate',
	'sap/ui/qunit/utils/waitForThemeApplied'
], function (
	Device,
	Element,
	JSONModel,
	Text,
	App,
	Page,
	Button,
	mobileLibrary,
	NavContainer,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	ToolHeader,
	ToolPage,
	ToolHeaderUtilitySeparator,
	SideNavigation,
	NavigationList,
	NavigationListItem,
	nextUIUpdate,
	waitForThemeApplied
) {
	'use strict';

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = mobileLibrary.PageBackgroundDesign;

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

	// create and add app
	var oApp = new App("myApp", {initialPage: "toolPage"});
	oApp.placeAt("qunit-fixture");

	var oPage = new Page("toolPage", {
		title: "Tool Page"
	});
	oApp.addPage(oPage);

	function getToolHeader() {
		return new ToolHeader({
			content: [
				new Button({
					icon: 'sap-icon://menu2',
					type: ButtonType.Transparent,
					press: function () {
						oPage.setSideExpanded(!oPage.getSideExpanded());
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
					text: "View",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Navigate",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "Code",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					})
				}),
				new ToolHeaderUtilitySeparator({}),
				new ToolbarSpacer({
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow,
						minWidth: "20px"
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					text: "User Name",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})
				}),
				new Button({
					type: ButtonType.Transparent,
					icon: "sap-icon://log",
					press: function () {

					},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})
				})
			]
		});
	}

	function getSideNavigation() {
		var model = new JSONModel();
		var data = {
			navigation: [{
				title: 'Root Item',
				icon: 'sap-icon://employee',
				expanded: true,
				items: [{
					title: 'Child Item 1',
					key: 'page1'
				}, {
					title: 'Child Item 2',
					enabled: false
				}, {
					title: 'Child Item 3',
					key: 'page2'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://building',
				enabled: false
			}, {
				title: 'Root Item',
				icon: 'sap-icon://card',
				expanded: false,
				items: [{
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://action',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://action-settings',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://activate',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://activities',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://add',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://arobase',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://attachment',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://badge',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://basket',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://bed',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://bookmark',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}
			],
			fixedNavigation: [{
				title: 'Fixed Item 1',
				icon: 'sap-icon://employee'
			}, {
				title: 'Fixed Item 2',
				icon: 'sap-icon://building'
			}, {
				title: 'Fixed Item 3',
				icon: 'sap-icon://card'
			}]
		};
		model.setData(data);

		var sideNavigation = new SideNavigation({
			expanded: false,
			itemSelect: function (event) {
				// navContainer.to(event.getParameter('item').getKey());
			},
			item: new NavigationList({
				items: {
					template: new NavigationListItem({
						text: '{title}',
						icon: '{icon}',
						enabled: '{enabled}',
						expanded: '{expanded}',
						items: {
							template: new NavigationListItem({
								text: '{title}',
								key: '{key}',
								enabled: '{enabled}'
							}),
							path: 'items'
						}
					}),

					path: '/navigation'
				}
			}),
			fixedItem: new NavigationList({
				items: {
					template: new NavigationListItem({
						text: '{title}',
						icon: '{icon}'
					}),
					path: '/fixedNavigation'
				}
			})
		}).setModel(model);

		return sideNavigation;
	}

	function getContent() {
		return new NavContainer({
			pages: [
				new Text('page1', {
					text: 'This is the first page'
				}),
				new Text('page2', {
					text: 'This is the second page'
				})]
		});
	}

	function getToolPage() {
		var toolHeader = getToolHeader();
		var sideNavigation = getSideNavigation();
		var content = getContent();

		return new ToolPage({
			header: toolHeader,
			sideContent: sideNavigation,
			mainContents: [content]
		});
	}

	QUnit.module("API and Rendering", {
		beforeEach: async function () {
			this.toolPage = getToolPage();
			oPage.addContent(this.toolPage);

			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.toolPage.destroy();
			this.toolPage = null;
		}
	});

	QUnit.test("Rendering", function (assert) {
		assert.strictEqual(this.toolPage.$().length, 1, "Tool Page is not rendered");
	});

	QUnit.test("Creation", function (assert) {
		assert.ok(Element.getElementById(this.toolPage.getId()), "ToolPage is not created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.toolPage.$().hasClass('sapTntToolPage'), "sapTntToolPage class is not set");
	});

	QUnit.test("header", function (assert) {
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeader").length, 1, "header is rendered");
	});

	QUnit.test("header and subheader", async function (assert) {
		this.toolPage.setSubHeader(new ToolHeader());
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeader").length, 2, "header and subheader are rendered");
	});

	QUnit.test("set subheader visibility to true|false", async function (assert) {
		var oToolHeader = new ToolHeader();

		this.toolPage.setSubHeader(oToolHeader);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeader").length, 2, "header and subheader are rendered");
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeaderWrapper.sapTntToolPageHeaderWithSubHeaderWrapper").length, 1, "wrapper has an extra css class");

		oToolHeader.setVisible(false);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeader").length, 1, "subheader is not rendered");
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeaderWrapper.sapTntToolPageHeaderWithSubHeaderWrapper").length, 0, "wrapper does not have an extra css class");

		oToolHeader.setVisible(true);
		await nextUIUpdate(this.clock);
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeader").length, 2, "header and subheader are rendered");
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageHeaderWrapper.sapTntToolPageHeaderWithSubHeaderWrapper").length, 1, "wrapper has an extra css class");
	});

	QUnit.test("set side navigation visibility to true|false", async function (assert) {
		var oSideNavigation = this.toolPage.getSideContent();

		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageAsideContent").length, 1, "sapTntToolPageAsideContent is rendered");

		oSideNavigation.setVisible(false);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageAsideContent").length, 0, "sapTntToolPageAsideContent is not rendered");

		oSideNavigation.setVisible(true);
		await nextUIUpdate(this.clock);
		assert.strictEqual(this.toolPage.$().find(".sapTntToolPageAsideContent").length, 1, "sapTntToolPageAsideContent is rendered");
	});

	QUnit.test("toggleSideContentMode", async function (assert) {
		assert.strictEqual(this.toolPage.getSideExpanded(), true, "ToolPage should be expanded");

		this.toolPage.toggleSideContentMode();

		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed");

		await clearPendingUIUpdates(this.clock);
	});

	QUnit.test("setSideExpanded", async function (assert) {
		this.toolPage.setSideExpanded(true);

		assert.equal(this.toolPage.$('aside').parent().hasClass('sapTntToolPageAsideCollapsed'), false, "ToolPage should not be collapsed");
		assert.strictEqual(this.toolPage.getSideExpanded(), true, "ToolPage should be expanded");

		this.toolPage.setSideExpanded(false);

		await nextUIUpdate(this.clock);

		assert.equal(this.toolPage.$('aside').parent().hasClass('sapTntToolPageAsideCollapsed'), true, "ToolPage should be collapsed");
		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed");
	});

	QUnit.test("Media Query Handler", function (assert) {
		// Arrange
		var oSideExpandedSpy = this.spy(this.toolPage, "setSideExpanded");
		var oUpdateLastQuerySpy = this.spy(this.toolPage, "_updateLastMediaQuery");
		this.toolPage._lastMediaQuery = "test";

		// Act
		this.toolPage._mediaQueryHandler();

		// Assert
		assert.strictEqual(oSideExpandedSpy.callCount, 1, "setSideExpanded called once");
		assert.strictEqual(oUpdateLastQuerySpy.callCount, 1, "setSideExpanded called once");

		// Reset sinon spy
		this.toolPage.setSideExpanded.restore();
		this.toolPage._updateLastMediaQuery.restore();
	});

	QUnit.test("#setContentBackgroundDesign() to 'Solid'", async function (assert) {
		// Act
		this.toolPage.setContentBackgroundDesign(PageBackgroundDesign.Solid);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.toolPage.$("main").hasClass("sapTntToolPageMainBackground-Solid"), "Correct class for Solid Background should be set");
	});

	QUnit.test("#setContentBackgroundDesign() to 'Transparent'", async function (assert) {
		// Act
		this.toolPage.setContentBackgroundDesign(PageBackgroundDesign.Transparent);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.toolPage.$("main").hasClass("sapTntToolPageMainBackground-Transparent"), "Correct class for Transparent Background should be set");
	});

	QUnit.test("#setContentBackgroundDesign() to 'List'", async function (assert) {
		// Act
		this.toolPage.setContentBackgroundDesign(PageBackgroundDesign.List);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.toolPage.$("main").hasClass("sapTntToolPageMainBackground-List"), "Correct class for List Background should be set");
	});

	QUnit.module("Media handling", {
		beforeEach: async function () {
			this.toolPage = getToolPage();
			oPage.addContent(this.toolPage);

			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.toolPage.destroy();
			this.toolPage = null;
		}
	});

	QUnit.test("Media Query Handler - Tablet", async function (assert) {
		// Arrange
		var oDeviceStub = this.stub(Device, "system",  {
			tablet: true
		});
		// Act
		this.toolPage._mediaQueryHandler();

		// Assert
		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed in Tablet mode");

		oDeviceStub.restore();
		await clearPendingUIUpdates(this.clock);
	});

	QUnit.test("Media Query Handler - Phone", function (assert) {
		// Arrange
		var oDeviceStub = this.stub(Device, "system",  {
			phone: true
		});

		// Act
		this.toolPage._mediaQueryHandler();

		// Assert
		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed in Phone mode");
		assert.strictEqual(this.toolPage.getSideContent().getExpanded(), true, "SideContent should be expanded in Phone mode");

		oDeviceStub.restore();
	});

	return waitForThemeApplied();
});