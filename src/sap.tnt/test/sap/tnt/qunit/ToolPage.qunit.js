/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/Device',
	'sap/ui/model/json/JSONModel',
	'sap/m/Text',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/NavContainer',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/tnt/ToolHeader',
	'sap/tnt/ToolPage',
	'sap/tnt/ToolHeaderUtilitySeparator',
	'sap/tnt/SideNavigation',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	'sap/ui/qunit/utils/waitForThemeApplied'
], function (
	Core,
	Device,
	JSONModel,
	Text,
	App,
	Page,
	Button,
	NavContainer,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	ToolHeader,
	ToolPage,
	ToolHeaderUtilitySeparator,
	SideNavigation,
	NavigationList,
	NavigationListItem,
	waitForThemeApplied
) {
	'use strict';

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
					type: sap.m.ButtonType.Transparent,
					press: function () {
						toolPage.setSideExpanded(!toolPage.getSideExpanded());
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
				navContainer.to(event.getParameter('item').getKey());
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
		beforeEach: function () {
			this.toolPage = getToolPage();
			oPage.addContent(this.toolPage);

			Core.applyChanges();
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
		assert.ok(Core.byId(this.toolPage.getId()), "ToolPage is not created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.toolPage.$().hasClass('sapTntToolPage'), "sapTntToolPage class is not set");
	});

	QUnit.test("toggleSideContentMode", function (assert) {
		assert.strictEqual(this.toolPage.getSideExpanded(), true, "ToolPage should be expanded");

		this.toolPage.toggleSideContentMode();

		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed");
	});

	QUnit.test("setSideExpanded", function (assert) {
		this.toolPage.setSideExpanded(true);

		assert.equal(this.toolPage.$('aside').parent().hasClass('sapTntToolPageAsideCollapsed'), false, "ToolPage should not be collapsed");
		assert.strictEqual(this.toolPage.getSideExpanded(), true, "ToolPage should be expanded");

		this.toolPage.setSideExpanded(false);

		Core.applyChanges();

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

	QUnit.module("Media handling", {
		beforeEach: function () {
			this.toolPage = getToolPage();
			oPage.addContent(this.toolPage);

			Core.applyChanges();
		},
		afterEach: function () {
			this.toolPage.destroy();
			this.toolPage = null;
		}
	});

	QUnit.test("Media Query Handler - Tablet", function (assert) {
		// Arrange
		var oDeviceStub = this.stub(Device, "system",  {
			tablet: true
		});
		// Act
		this.toolPage._mediaQueryHandler();

		// Assert
		assert.strictEqual(this.toolPage.getSideExpanded(), false, "ToolPage should be collapsed in Tablet mode");

		oDeviceStub.restore();
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