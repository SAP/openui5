sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Text",
	"sap/tnt/ToolHeader",
	"sap/tnt/ToolHeaderUtilitySeparator",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/OverflowToolbarButton",
	"sap/m/Avatar",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/m/Image",
	"sap/m/Title",
	"sap/m/ToolbarSeparator",
	"sap/m/ObjectStatus",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/m/MenuButton",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/App",
	"sap/m/IconTabSeparator",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/BadgeCustomData",
	"sap/m/Label",
	"sap/ui/core/Element"
], function (
	coreLibrary,
	Device,
	Core,
	Log,
	MessageToast,
	mLibrary,
	Page,
	Button,
	CheckBox,
	Text,
	ToolHeader,
	ToolHeaderUtilitySeparator,
	OverflowToolbarLayoutData,
	OverflowToolbarButton,
	Avatar,
	ToolbarSpacer,
	SearchField,
	Image,
	Title,
	ToolbarSeparator,
	ObjectStatus,
	Icon,
	IconPool,
	MenuButton,
	Select,
	Item,
	App,
	IconTabSeparator,
	IconTabHeader,
	IconTabFilter,
	BadgeCustomData,
	Label,
	Element

) {
	"use strict";
	//shortcuts
	const IconColor = coreLibrary.IconColor;
	const ButtonType = mLibrary.ButtonType;
	const OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;
	const ValueState = coreLibrary.ValueState;

	const body = document.querySelector("body");
	var oCheckBoxCompact =
	new CheckBox("compactMode", {
		text: "Compact Mode",
		selected: !Device.system.phone && body.classList.contains("sapUiSizeCompact"),
		select: function () {
			if (body.classList.contains("sapUiSizeCompact")) {
				body.classList.remove("sapUiSizeCompact");
			} else {
				body.classList.add("sapUiSizeCompact");
			}
		}
	});

	// There are specific controls with specific order that should be included in the ToolHeader
	// in the time when theme Horizon is the default theme of UI5.
	// This is checked by UXC-016 Shell requirement, which is valid for the ToolHeader as well:
	// "Products must provide a shell bar that follows a defined structure and responsive behavior."
	var toolHeaderHorizon = new ToolHeader("horizonToolHeader", {
		content: [
			new Button({
				icon: 'sap-icon://menu2',
				tooltip: 'Menu',
				type: ButtonType.Transparent,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Image({
				src: "./images/SAP_Logo.png",
				width: "60px",
				height: "30px",
				tooltip: "SAP logo",
				press: function () {},
				decorative: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Title({
				id: "productName",
				text: "Product name",
				wrapping: false
			}),
			new Text({
				id: "secondTitle",
				text: "Second title",
				wrapping: false
				// layoutData: new OverflowToolbarLayoutData({
				// 	priority: OverflowToolbarPriority.Disappear
				// })
			}),
			new ToolbarSpacer(),
			new SearchField({
				id: "searchField",
				width: "25rem",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low,
					group: 1
				})
			}),
			new Button({
				id: "searchButton",
				tooltip: "Search",
				type: ButtonType.Transparent,
				icon: "sap-icon://search",
				visible: false
			}),
			new OverflowToolbarButton({
				icon: "sap-icon://da",
				type: ButtonType.Transparent,
				tooltip: "Joule",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})

			}),
			new OverflowToolbarButton({
				tooltip: "Action 1",
				text: "Action 1",
				type: ButtonType.Transparent,
				icon: "sap-icon://source-code",
				layoutData: new OverflowToolbarLayoutData({
					group: 2
				})
			}),
			new OverflowToolbarButton({
				tooltip: "Action 2",
				text: "Action 2",
				type: ButtonType.Transparent,
				icon: "sap-icon://card",
				layoutData: new OverflowToolbarLayoutData({
					group: 2
				})
			}),
			new OverflowToolbarButton({
				text: "Settings",
				type: ButtonType.Transparent,
				icon: "sap-icon://action-settings"
			}),
			new Button({
				tooltip: "Notifications",
				type: ButtonType.Transparent,
				icon: "sap-icon://bell",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}),
				customData: [
					new BadgeCustomData({
						key:"badge",
						value:"5",
						visible:true
					})
				]
			}),
			new OverflowToolbarButton({
				text: "My products",
				icon: "sap-icon://grid",
				type: ButtonType.Transparent,
				tooltip: "My products"
			}),
			new Avatar({
				tooltip: "Profile",
				src: "images/Woman_avatar_01.png",
				initials: "UI",
				displaySize: "XS",
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			})
		]
	});

	// There are specific controls with specific order that should be included in the ToolHeader
	// in the time when theme Horizon is the default theme of UI5.
	// This is checked by UXC-016 Shell requirement, which is valid for the ToolHeader as well:
	// "Products must provide a shell bar that follows a defined structure and responsive behavior."
	// Mandatory/required are logo, product name, avatar
	var toolHeaderHorizonMand = new ToolHeader("horizonToolHeaderOnlyMandatoryControls", {
		content: [
			new Image({
				src: "./images/SAP_Logo.png",
				tooltip: "SAP logo",
				width: "60px",
				height: "30px",
				press: function () {},
				decorative: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Title({
				text: "Product name",
				wrapping: false
			}),
			new ToolbarSpacer(),
			new Avatar({
				tooltip: "Profile",
				src: "images/Woman_avatar_01.png",
				initials: "UI",
				displaySize: "XS",
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");


	// This is the content and structure of the ToolHeader, which was required with Fiori 3 theme
	var toolHeader = new ToolHeader("shellLike", {
		content: [
			new Button({
				icon: 'sap-icon://menu2',
				type: ButtonType.Transparent,
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new ToolbarSpacer({
				width: '20px'
			}),
			new Image({
				src: "./images/SAP_Logo.png",
				width: "60px",
				height: "30px"
			}),
			new Text({
				text: "Tool Header Text"
			}),
			new Title({
				text: "Tool Header Title"
			}),
			new ToolHeaderUtilitySeparator({}),
			new Image({
				src: "./images/CoPilot.svg",
				press: function () {
					MessageToast.show("Image pressed!");
				}
			}),
			new ToolbarSpacer({
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow,
					minWidth: "20px"
				})
			}),
			new Avatar({
				src: "images/Woman_avatar_01.png",
				initials: "UI",
				displaySize: "XS"
			}),
			new Avatar({
				src: "images/Woman_avatar_02.png",
				initials: "UI",
				displaySize: "XS",
				press: function () {
					MessageToast.show("Avatar pressed!");
				}
			}),
			new Avatar({
				initials: "UI",
				displaySize: "XS"
			}),
			new Avatar({
				displaySize: "XS",
				press: function () {
					MessageToast.show("Avatar pressed!");
				}
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
				enabled: false,
				icon: "sap-icon://log",
				press: function () {

				},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderIcons = new ToolHeader("toolHeaderIcons", {
		content: [
			new Label({
				text: "Default:"
			}),
			new Icon({
				src: "sap-icon://bell"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Default
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Default
			}),
			new Label({
				text: "Contrast:"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Contrast
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Contrast
			}),
			new Label({
				text: "Positive:"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Positive
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Positive
			}),
			new Label({
				text: "Critical:"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Critical
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Critical
			}),
			new Label({
				text: "Negative:"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Negative
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Negative
			}),
			new Label({
				text: "Neutral:"
			}),
			new Icon({
				src: "sap-icon://bell",
				color: IconColor.Neutral
			}),
			new Icon({
				src: "sap-icon://bell",
				backgroundColor: IconColor.Neutral
			}),
			new Label({
				text: "Interaction:"
			}),
			new Icon({
				src: "sap-icon://bell",
				press: function () {
					MessageToast.show("Icon is pressed, but no interaction states visualized!");
				}
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderButtons = new ToolHeader("toolHeaderButtons", {
		content: [
			new Button({
				type: ButtonType.Transparent,
				text: "File",
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Transparent,
				text: "Edit",
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Transparent,
				text: "Edit",
				enabled: false,
				press: function () {},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Transparent,
				text: "Add Item",
				icon: IconPool.getIconURI("add")
			}),
			new Button({
				type: ButtonType.Transparent,
				enabled: false,
				text: "Add Item",
				icon: IconPool.getIconURI("add")
			}),
			new MenuButton({
				type: ButtonType.Transparent,
				text: "Navigate",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Transparent,
				text: "Navigate",
				buttonMode: "Split",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Transparent,
				enabled: false,
				text: "Navigate",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Transparent,
				icon: 'sap-icon://customer'
			}),
			new MenuButton({
				type: ButtonType.Emphasized,
				text: "Mega Menu"
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderButtons2 = new ToolHeader("toolHeaderButtons2", {
		content: [
			new Button({
				type: ButtonType.Default,
				text: "Default",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Default,
				text: "Default",
				icon: "sap-icon://customer",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Back,
				text: "Back",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Up,
				text: "Up",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Default,
				text: "Default",
				enabled: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Back,
				text: "Back",
				enabled: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Up,
				text: "Up",
				enabled: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new Button({
				type: ButtonType.Default,
				icon: IconPool.getIconURI("customer")
			}),
			new Button({
				type: ButtonType.Back,
				icon: IconPool.getIconURI("customer")
			}),
			new Button({
				type: ButtonType.Up,
				icon: IconPool.getIconURI("customer")
			}),
			new Button({
				type: ButtonType.Default,
				enabled: false,
				icon: IconPool.getIconURI("customer")
			}),
			new Button({
				type: ButtonType.Back,
				enabled: false,
				icon: IconPool.getIconURI("customer")
			}),
			new Button({
				type: ButtonType.Up,
				enabled: false,
				icon: IconPool.getIconURI("customer")
			}),
			new MenuButton({
				type: ButtonType.Default,
				text: "Navigate",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Default,
				text: "Navigate",
				buttonMode: "Split",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Default,
				enabled: false,
				text: "Navigate",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.Low
				})
			}),
			new MenuButton({
				type: ButtonType.Default,
				icon: 'sap-icon://customer'
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderSelectSearch = new ToolHeader("toolHeaderSelectSearch", {
		content: [
			new Select({
				icon: "sap-icon://settings",
				type: "IconOnly",
				autoAdjustWidth: true,
				items: [
					new Item({
						text: "option 1",
						key: "o1"
					}),
					new Item({
						text: "option 2",
						key: "o2"
					})
				]
			}),
			new Select({
				items: [
					new Item({
						text: "option 1",
						key: "o1"
					}),
					new Item({
						text: "option 2",
						key: "o2"
					})
				],
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new Select({
				enabled: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}),
				items: [
					new Item({
						text: "option 1",
						key: "o1"
					}),
					new Item({
						text: "option 2",
						key: "o2"
					})
				]
			}),
			new SearchField({
				width: "200px",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new SearchField({
				width: "200px",
				value: "Some",
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			}),
			new SearchField({
				width: "200px",
				enabled: false,
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				})
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderITB = new ToolHeader("toolHeaderITB", {
		content: [
			new IconTabHeader({
				backgroundDesign: "Transparent",
				items: [
					new IconTabFilter({text: "Filter 1"}),
					new IconTabSeparator(),
					new IconTabFilter({text: "Filter 2"}),
					new IconTabFilter({text: "Filter 3"})
				]
			}),
			new IconTabHeader({
				backgroundDesign: "Solid",
				items: [
					new IconTabFilter({text: "Filter 1"}),
					new IconTabFilter({
						text: "Filter 2",
						items: [
							new IconTabFilter({text: "Filter 2-1"}),
							new IconTabFilter({text: "Filter 2-2"}),
							new IconTabFilter({text: "Filter 2-3"})
						]
					}),
					new IconTabFilter({
						text: "Filter 3",
						interactionMode: "SelectLeavesOnly",
						items: [
							new IconTabFilter({text: "Filter 3-1"}),
							new IconTabFilter({text: "Filter 3-2"}),
							new IconTabFilter({text: "Filter 3-3"})
						]
					}),
					new IconTabFilter({
						text: "Filter 4",
						interactionMode: "SelectLeavesOnly"
					}),
					new IconTabFilter({
						text: "Filter 5",
						interactionMode: "Select"
					})
				]
			}),
			new IconTabHeader({
				backgroundDesign: "Translucent",
				items: [
					new IconTabFilter({text: "Filter 1"}),
					new IconTabFilter({text: "Filter 2"}),
					new IconTabFilter({text: "Filter 3"})
				]
			}),
			new IconTabHeader({
				backgroundDesign: "Transparent",
				mode: "Inline",
				items: [
					new IconTabFilter({
						text: "Filter 1",
						count: "123"
					}),
					new IconTabFilter({
						text: "Filter 2",
						enabled: false
					}),
					new IconTabFilter({
						text: "Filter 3",
						count: "45"
					})
				]
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderObjStatus = new ToolHeader("toolHeaderObjStatus", {
		content: [
			new ObjectStatus({
				title: 'Error Status Title',
				text: 'Error Status Text',
				icon: 'sap-icon://status-negative',
				state: ValueState.Error
			}),
			new ObjectStatus({
				text: 'Warning Status Text',
				icon: 'sap-icon://status-critical',
				state: ValueState.Warning,
				active: true
			}),
			new ObjectStatus({
				text: 'Information Status Text',
				icon: 'sap-icon://hint',
				state: ValueState.Information
			}),
			new ObjectStatus({
				title: 'Success Status Title',
				text: 'Success Status Text',
				icon: 'sap-icon://status-positive',
				state: ValueState.Success
			}),
			new ObjectStatus({
				title: 'None Status Title',
				text: 'None Status Text',
				icon: 'sap-icon://status-inactive',
				state: ValueState.None
			}),
			new ObjectStatus({
				text: 'Only text followed with only icon',
				state: ValueState.Information
			}),
			new ObjectStatus({
				icon: 'sap-icon://hint',
				state: ValueState.Information
			})

		]
	}).addStyleClass("sapUiLargeMarginTop");

	var toolHeaderObjStatusInverted = new ToolHeader("toolHeaderObjStatusInverted", {
		content: [
			new ObjectStatus({
				title: 'Error Status Title',
				text: 'Error Status Text',
				icon: 'sap-icon://status-negative',
				state: ValueState.Error,
				inverted: true
			}),
			new ObjectStatus({
				text: 'Warning Status Text',
				icon: 'sap-icon://status-critical',
				state: ValueState.Warning,
				active: true,
				inverted: true
			}),
			new ObjectStatus({
				text: 'Information Status Text',
				icon: 'sap-icon://hint',
				state: ValueState.Information,
				inverted: true
			}),
			new ObjectStatus({
				title: 'Success Status Title',
				text: 'Success Status Text',
				icon: 'sap-icon://status-positive',
				state: ValueState.Success,
				inverted: true
			}),
			new ObjectStatus({
				title: 'None Status Title',
				text: 'None Status Text',
				icon: 'sap-icon://status-inactive',
				state: ValueState.None,
				inverted: true
			}),
			new ObjectStatus({
				text: 'Only text followed with only icon',
				state: ValueState.Information,
				inverted: true
			}),
			new ObjectStatus({
				icon: 'sap-icon://hint',
				state: ValueState.Information,
				inverted: true
			})
		]
	}).addStyleClass("sapUiLargeMarginTop");

	var app = new App("myApp", {initialPage: "tabBarPage"});
	app.placeAt("body");
	var initialPage = new Page("tabBarPage", {
		showHeader: false,
		content: [
			oCheckBoxCompact,
			toolHeaderHorizon,
			toolHeaderHorizonMand,
			toolHeader,
			toolHeaderIcons,
			toolHeaderButtons,
			toolHeaderButtons2,
			toolHeaderSelectSearch,
			toolHeaderITB,
			toolHeaderObjStatus,
			toolHeaderObjStatusInverted
		]
	});
	app.addPage(initialPage);

	this._handleMediaChange = function () {
		var rangeName = Device.media.getCurrentRange("StdExt").name;

		switch (rangeName) {
			// Shell Desktop
			case "LargeDesktop":
				Element.getElementById("productName").setVisible(true);
				Element.getElementById("secondTitle").setVisible(true);
				Element.getElementById("searchField").setVisible(true);
				Element.getElementById("searchButton").setVisible(false);
				Log.info("Screen width is corresponding to Large Desktop");
				break;

			// Tablet - Landscape
			case "Desktop":
				Element.getElementById("productName").setVisible(true);
				Element.getElementById("secondTitle").setVisible(false);
				Element.getElementById("searchField").setVisible(true);
				Element.getElementById("searchButton").setVisible(false);
				Log.info("Screen width is corresponding to Desktop");
				break;

			// Tablet - Portrait
			case "Tablet":
				Element.getElementById("productName").setVisible(true);
				Element.getElementById("secondTitle").setVisible(true);
				Element.getElementById("searchButton").setVisible(true);
				Element.getElementById("searchField").setVisible(false);
				Log.info("Screen width is corresponding to Tablet");
				break;

			case "Phone":
				Element.getElementById("searchButton").setVisible(true);
				Element.getElementById("searchField").setVisible(false);
				Element.getElementById("productName").setVisible(false);
				Element.getElementById("secondTitle").setVisible(false);
				Log.info("Screen width is corresponding to Phone");
				break;

			default:
				break;
		}
	};

	Device.media.attachHandler(this._handleMediaChange, this);
	this._handleMediaChange();
});