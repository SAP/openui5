sap.ui.define([
	"sap/m/Toolbar",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/Element",
	"sap/ui/core/IconPool",
	"sap/ui/core/InvisibleText",
	"sap/m/ActionSheet",
	"sap/m/Button",
	"sap/m/ResponsivePopover",
	"sap/m/library",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Menu",
	"sap/m/MessageToast",
	"sap/m/MenuItem",
	"sap/m/Label",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/ComboBox",
	"sap/m/ToolbarSeparator",
	"sap/m/ToolbarLayoutData",
	"sap/m/ToggleButton",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Input",
	"sap/m/DateTimePicker",
	"sap/m/DateRangeSelection",
	"sap/m/CheckBox",
	"sap/m/RadioButton",
	"sap/m/MenuButton",
	"sap/m/SplitButton",
	"sap/m/ColorPalettePopover",
	"sap/m/GenericTag",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/Page",
	"sap/m/Slider",
	"sap/m/MessageStrip",
	"sap/m/NavContainer",
	"sap/m/HBox",
	"sap/m/App"
], function(
	Toolbar,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	Element,
	IconPool,
	InvisibleText,
	ActionSheet,
	Button,
	ResponsivePopover,
	mobileLibrary,
	VerticalLayout,
	Menu,
	MessageToast,
	MenuItem,
	Label,
	ToolbarSpacer,
	SearchField,
	Select,
	Item,
	ComboBox,
	ToolbarSeparator,
	ToolbarLayoutData,
	ToggleButton,
	SegmentedButton,
	SegmentedButtonItem,
	Input,
	DateTimePicker,
	DateRangeSelection,
	CheckBox,
	RadioButton,
	MenuButton,
	SplitButton,
	ColorPalettePopover,
	GenericTag,
	Breadcrumbs,
	Link,
	Page,
	Slider,
	MessageStrip,
	NavContainer,
	HBox,
	App
) {
	"use strict";

	// shortcut for sap.m.FlexWrap
	var FlexWrap = mobileLibrary.FlexWrap;

	// shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mobileLibrary.FlexJustifyContent;

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

	// shortcut for sap.m.MenuButtonMode
	var MenuButtonMode = mobileLibrary.MenuButtonMode;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var sAddIconURI = IconPool.getIconURI("add");
	var sDeleteIconURI = IconPool.getIconURI("delete");
	var sChangeIconURI = IconPool.getIconURI("cause");
	var sNotesIconURI = IconPool.getIconURI("notes");
	var sRequestIconURI = IconPool.getIconURI("request");
	var sReceiptIconURI = IconPool.getIconURI("receipt");

	new InvisibleText("dummy_label_acc_name", {text: "Dummy Accessible Name"}).toStatic();

	var oActionSheet = new ActionSheet("actionSheet1", {
		buttons: [
			new Button({
				icon: "sap-icon://accept",
				text: "Close",
				press: function () {
					Element.getElementById("otb0").closeOverflow();
				}
			}),
			new Button({
				icon: "sap-icon://decline",
				text: "Do not close"
			})
		]
	});

	var oPopover = new ResponsivePopover("popover1", {
		placement: PlacementType.Horizontal,
		title: "Popover",
		showHeader: true,
		content: [
			new VerticalLayout({
				content: [
					new Button({
						icon: "sap-icon://accept",
						text: "Close",
						press: function () {
							Element.getElementById("otb0").closeOverflow();
						}
					}),
					new Button({
						icon: "sap-icon://decline",
						text: "Do not close"
					})
				]
			})
		]
	});

	var oMenu = new Menu({
		title: "random 2",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
				sItemPath = "";
			while (oItem instanceof MenuItem) {
				sItemPath = oItem.getText() + " > " + sItemPath;
				oItem = oItem.getParent();
			}

			sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

			MessageToast.show("itemSelected: " + sItemPath);
		},
		items: [
			new MenuItem({
				text: "fridge",
				icon: "sap-icon://fridge",
				items: [
					new MenuItem({
						text: "accidental leave",
						icon: "sap-icon://accidental-leave",
						items: [
							new MenuItem({
								icon: "sap-icon://factory",
								text: "factory"
							}),
							new MenuItem({
								icon: "sap-icon://flag",
								text: "flag"
							}),
							new MenuItem({
								icon: "sap-icon://flight",
								text: "flight"
							})
						]
					}),
					new MenuItem({
						text: "iphone",
						icon: "sap-icon://iphone",
						items: [
							new MenuItem({
								icon: "sap-icon://video",
								text: "video"
							}),
							new MenuItem({
								icon: "sap-icon://loan",
								text: "loan"
							}),
							new MenuItem({
								icon: "sap-icon://commission-check",
								text: "commission check"
							}),
							new MenuItem({
								icon: "sap-icon://doctor",
								text: "doctor"
							})
						]
					})
				]
			}),
			new MenuItem({
				text: "globe",
				icon: "sap-icon://globe",
				items: [
					new MenuItem({
						text: "e-care",
						icon: "sap-icon://e-care"
					})
				]
			})
		]
	});

	var toolbarContent0 = [
		new Label({
			text : "Group Toolbar"
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Always 1",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: false}),
			width: "125px",
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
		new Button({
			text : "Always 2",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: false}),
			width: "125px",
			press: function () {
				oPopover.openBy(this);
			}
		}),
		new Button({
			text : "G1 High",
			type : ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({
				group: 1,
				priority: OverflowToolbarPriority.High
			}),
			width: "125px"
		}),
		new Button({
			text : "G1 Low",
			type : ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({
				group: 1,
				priority: OverflowToolbarPriority.Low
			}),
			width: "125px"
		}),
		new Button({
			text : "Never 1",
			type : ButtonType.Reject,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			width: "125px"
		}),
		new Button({
			text : "Never 2",
			type : ButtonType.Reject,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			width: "125px"
		}),
		new Button({
			text : "Single Low",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}),
			width: "125px"
		}),
		new Button({
			text : "Single Disappear",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Disappear})
		}),
		new Button({
			text : "Single Default",
			width: "125px"
		}),
		new Button({
			text : "G2 Low 1",
			type : ButtonType.Accept,
			layoutData: new OverflowToolbarLayoutData({
				group: 2,
				priority: OverflowToolbarPriority.Low
			}),
			width: "125px"
		}),
		new Button({
			text : "G2 Low 2",
			type : ButtonType.Accept,
			layoutData: new OverflowToolbarLayoutData({
				group: 2,
				priority: OverflowToolbarPriority.Low
			}),
			width: "125px"
		})
	];

	var toolbarContent1 = [
		new Label({
			text : "Priority Toolbar"
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Always 1",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}),
			width: "125px"
		}),
		new Button({
			text : "Always 2",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}),
			width: "125px"
		}),
		new Button({
			text : "High 1",
			type : ButtonType.Accept,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}),
			width: "125px"
		}),
		new Button({
			text : "Low 1",
			type : ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}),
			width: "125px"
		}),
		new Button({
			text : "Never 1",
			type : ButtonType.Reject,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			width: "125px"
		}),
		new Button({
			text : "Never 2",
			type : ButtonType.Reject,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			width: "125px"
		}),
		new Button({
			text : "Low 2",
			type : ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}),
			width: "125px"
		}),
		new Button({
			text : "Disappear",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Disappear}),
			width: "125px"
		}),
		new Button({
			text : "High 2",
			type : ButtonType.Accept,
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}),
			width: "125px"
		})
	];

	var toolbarContent2 = [
		new Label({
			text : "The last 2 buttons always overflow"
		}),
		new ToolbarSpacer(),

		new Button({icon: sAddIconURI, text: "Add"}),
		new Button({icon: sDeleteIconURI, text: "Delete"}),
		new Button({icon: sChangeIconURI, text: "Change"}),
		new Button({icon: sNotesIconURI, text: "Notes"}),

		new ToolbarSpacer(),
		new Button({
			text : "REQUEST",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			icon: sRequestIconURI
		}),
		new Button({
			text : "RECEIPT",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
			icon: sReceiptIconURI
		}),
		new Button({
			text : "Undo",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow})
		}),
		new Button({
			text : "Redo",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow})
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Cut"
		}),
		new Button({
			text : "Copy"
		}),
		new Button({
			text : "Paste"
		})
	];

	var toolbarContent3 = [
		new Button({
			text: "About"
		}),
		new Label({
			id: "hotelsLabel",
			text : "Find hotels"
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Load search",
			type: ButtonType.Transparent
		}),
		new Button({
			text : "Save search",
			type: ButtonType.Transparent
		}),
		new Button({
			text : "Save",
			type: ButtonType.Transparent
		}),
		new ToolbarSpacer(),
		new SearchField("sf1", {width:'25%', ariaLabelledBy: ["dummy_label_acc_name"]}),
		new ToolbarSpacer(),
		new Button({
			text : "BOOK NOW!",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
		}),
		new Button({
			text : "BOOK LATER!",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
		}),
		new ToolbarSpacer(),
		new Label({
			text : "Country:",
			labelFor: "selectCountry"
		}),
		new Select("selectCountry", {
			name: "select-country",
			items: [
				new Item({
					key: "0",
					text: "France"
				}),

				new Item({
					key: "1",
					text: "Sweden"
				}),

				new Item({
					key: "2",
					text: "Italy"
				})
			]
		})
	];

	var toolbarContent4 = [

		new Label({
			text : "The ComboBox control can overflow"
		}),
		new ToolbarSpacer(),
		new ComboBox({
			placeholder: "Choose your country",

			items: [
				{
					"key": "DZ",
					"text": "Algeria"
				},

				{
					"key": "AR",
					"text": "Argentina"
				},

				{
					"key": "AU",
					"text": "Australia"
				},

				{
					"key": "AT",
					"text": "Austria"
				}
			]
		}),
		new ToolbarSeparator(),
		new Button({
			text : "VERY LONG ACCEPT TEXT",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
		}),
		new Button({
			text : "VERY LONG REJECT TEXT",
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
		})
	];

	var toolbarContent5 = [

		new Button({
			text : "Shrinkable up to 100px and does not go to overflow",
			icon: "sap-icon://person-placeholder",
			layoutData : new OverflowToolbarLayoutData({
				shrinkable : true,
				minWidth: "100px",
				priority: OverflowToolbarPriority.NeverOverflow
			})
		}),

		new ToolbarSpacer(),


		new Button({
			text : "Shrinkable up to 100px and can overflow 1",
			icon: "sap-icon://person-placeholder",
			layoutData : new ToolbarLayoutData({
				shrinkable : true,
				minWidth: "100px"
			})
		}),

		new ToolbarSpacer(),

		new Button({
			text : "Shrinkable up to 100px and can overflow 2",
			icon: "sap-icon://person-placeholder",
			layoutData : new ToolbarLayoutData({
				shrinkable : true,
				minWidth: "100px"
			})
		}),

		new ToolbarSpacer(),

		new Button({
			text : "Shrinkable up to 100px and can overflow 3",
			icon: "sap-icon://person-placeholder",
			layoutData : new ToolbarLayoutData({
				shrinkable : true,
				minWidth: "100px"
			})
		})
	];

	var toolbarContent6 = [
		new Label({
			text : "Input controls"
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Regular Button"
		}),
		new ToggleButton({
			text: "Toggle me"
		}),
		new SegmentedButton({
			ariaLabelledBy: "dummy_label_acc_name",
			items: [
				new SegmentedButtonItem({
					text : "Left Button"
				}),
				new SegmentedButtonItem({
					icon: sNotesIconURI,
					tooltip: "Notes"
				}),
				new SegmentedButtonItem({
					text : "Disabled Button",
					enabled: false
				}),
				new SegmentedButtonItem({
					text : "Right Button"
				})
			]
		}),
		new Input({
			placeholder: "Input",
			ariaLabelledBy: ["dummy_label_acc_name"],
			width: "150px"
		}),
		new DateTimePicker({
			placeholder: "DateTimePicker"
		}),
		new DateRangeSelection({
			placeholder: "DateRangeSelection"
		}),
		new CheckBox({
			text : "Cb"
		}),
		new RadioButton({
			text : "Option a",
			groupName : "a"
		}),
		new RadioButton({
			text : "Option b",
			groupName : "a"
		})
	];

	var toolbarContent7 = [
		new Label({
			text : "MenuButton controls"
		}),
		new ToolbarSpacer(),
		new MenuButton({
			text: "RglrMB autoClose",
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: true}),
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		}),
		new MenuButton({
			text: "RglrMB noClose",
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: false}),
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		}),
		new MenuButton({
			text: "SplitMB autoClose",
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: true}),
			buttonMode: MenuButtonMode.Split,
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		}),
		new MenuButton({
			text: "SplitMB NoClose",
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: false}),
			buttonMode: MenuButtonMode.Split,
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		}),
		new MenuButton({
			text: "SplitMBd autoClose",
			useDefaultActionOnly: true,
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: true}),
			buttonMode: MenuButtonMode.Split,
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		}),
		new MenuButton({
			text: "SplitMBd NoClose",
			useDefaultActionOnly: true,
			layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow, closeOverflowOnInteraction: false}),
			buttonMode: MenuButtonMode.Split,
			type : ButtonType.Transparent,
			icon: "sap-icon://e-care",
			menu: oMenu.clone(),
			defaultAction: function() {
				MessageToast.show("Default action is used until a menu item is selected");
			}
		})
	];

	var toolbarContent8 = [
		new Label({
			text : "Label and labelled controls"
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Single button"
		}),
		new Label({
			text : "Label for Input",
			labelFor: "labelledInput",
			layoutData: new OverflowToolbarLayoutData({
				group: 1
			})
		}),
		new Input("labelledInput", {
			value : "I am labelled",
			layoutData: new OverflowToolbarLayoutData({
				group: 1
			}),
			width: "125px"
		}),
		new Label({
			text : "This is a very long label text that exceeds the allowed overflow width limit"
		}),
		new Button({
			text : "Single button2"
		}),
		new Label({
			text : "G2 First Label",
			layoutData: new OverflowToolbarLayoutData({
				group: 2
			})
		}),
		new Label({
			text : "G2 Second Label",
			layoutData: new OverflowToolbarLayoutData({
				group: 2
			})
		}),
		new Button({
			text : "Single button3"
		})
	];

	var toolbarContent9 = [
		new Label({
			text: "SplitButton controls"
		}),
		new ToolbarSpacer(),
		new SplitButton({
			text: "Apply text color",
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow,
				closeOverflowOnInteraction: true
			}),
			icon: "sap-icon://e-care",
			press: function () {
				MessageToast.show("Text color is applied");
			},
			arrowPress: function () {
				new ColorPalettePopover({
					colorSelect: function () {
						MessageToast.show("Color is selected");
					}
				}).openBy(this);
			}
		}),
		new SplitButton({
			text: "Apply background color",
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow,
				closeOverflowOnInteraction: false
			}),
			icon: "sap-icon://e-care",
			press: function () {
				MessageToast.show("Background color is applied");
			},
			arrowPress: function () {
				new ColorPalettePopover({
					colorSelect: function () {
						MessageToast.show("Color is selected");
					}
				}).openBy(this);
			}
		})
	];

	var toolbarContent10 = [
		new Label({
			id: "labelNoLayout",
			text : "Label no LayoutData"
		}),
		new Button({
			text: "Button no LayoutData"
		}),
		new Label({
			id: "labelLayoutData",
			text : "Shrinkable LayoutData",
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "100px"
			})
		}),
		new Button({
			text: "Shrinkable LayoutData",
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "50px"
			})
		}),
		new ToolbarSpacer(),
		new SearchField("searchLayoutData",
		{
			ariaLabelledBy: ["dummy_label_acc_name"],
			width:"25%",
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "7rem"
			})
		}),
		new Label({
			text : "Language:",
			labelFor: "selectLanguage"
		}),
		new Select("selectLanguage", {
			name: "select-language",
			items: [
				new Item({
					key: "0",
					text: "French"
				}),

				new Item({
					key: "1",
					text: "English"
				}),

				new Item({
					key: "2",
					text: "German"
				})
			],
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "100px"
			})
		}),
		new Input({
			placeholder: "Input",
			width: "10%",
			ariaLabelledBy: ["dummy_label_acc_name"],
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "100px"
			})
		}),
		new ToolbarSpacer(),
		new CheckBox({
			text : "Checkbox",
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "100px"
			})
		}),
		new Label({
			text : "Items:",
			labelFor: "comboBox"
		}),
		new ComboBox("comboBox", {
			placeholder: "Choose item",
			items: [
						new Item({
								key: "0",
								text: "item 0"
						}),
						new Item({
							key: "1",
							text: "item 1"
						}),
						new Item({
							key: "2",
							text: "item 2"
						})
					],
			layoutData: new OverflowToolbarLayoutData({
				shrinkable: true,
				minWidth: "50px"
			})
		})
	];

	var toolbarContent11 = [
		new GenericTag({
			text : "Shortage Expected",
			status: "Warning"
		}),
		new GenericTag({
			text : "Project Cost",
			status: "Error"
		}),
		new GenericTag({
			text : "In Stock",
			status: "Success"
		}),
		new GenericTag({
			text : "Total Cost",
			valueState: "Error"
		}),
		new GenericTag({
			text : "Shortage Expected",
			status: "Warning"
		}),
		new GenericTag({
			text : "Project Cost",
			status: "Error"
		}),
		new GenericTag({
			text : "In Stock",
			status: "Success"
		}),
		new GenericTag({
			text : "Total Cost",
			valueState: "Error"
		}),
		new GenericTag({
			text : "Shortage Expected",
			status: "Warning"
		}),
		new GenericTag({
			text : "Project Cost",
			status: "Error"
		}),
		new GenericTag({
			text : "In Stock",
			status: "Success"
		}),
		new GenericTag({
			text : "Total Cost",
			valueState: "Error"
		}),
		new ToolbarSpacer()
	];

	var toolbarContent12 = [
		new Label({
			text : "Breadcrumbs Toolbar"
		}),
		new Breadcrumbs({
			currentLocationText: "Sed laudantium, totam rem aperiam, eaque ipsa quae. "
				+ "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.",
			links: [
				new Link({text: "Link 1"}),
				new Link({text: "Link 2"}),
				new Link({text: "Link 3"})
			]
		}),
		new Button({
			icon: "sap-icon://filter"
		}),
		new Button({
			icon: "sap-icon://add"
		}),
		new Button({
			icon: "sap-icon://delete"
		}),
		new Button({
			icon: "sap-icon://share"
		})
	];

	var toolbarContentFooter = [
		new Label({
			text : "When the toolbar is in the footer, the action sheet opens above it."
		}),
		new ToolbarSpacer(),
		new Button({
			text : "Footer Button 1"
		}),
		new Button({
			text : "Footer Button 2"
		}),
		new Button({
			text : "Footer Button 3"
		}),

		new Select({
			type: SelectType.IconOnly,
			icon: IconPool.getIconURI("filter"),
			autoAdjustWidth: true,
			items : [
				new Item({
					key: "0",
					text: "Footer Select 1"
				}),
				new Item({
					key: "1",
					text: "Footer Select 2"
				})
			]
		}),

		new Button({
			text : "Footer Button 4"
		}),
		new Button({
			text : "Footer Button 5"
		}),
		new Button({
			text : "Footer Button 6"
		})
	];

	var aAllToolbars = [
		new OverflowToolbar("otb0", {
			width: 'auto',
			content : toolbarContent0
		}),

		new OverflowToolbar("otb1", {
			width: 'auto',
			content : toolbarContent1
		}),

		new OverflowToolbar("otb2", {
			width: 'auto',
			content : toolbarContent2
		}),
		new OverflowToolbar("otb3", {
			width: 'auto',
			content : toolbarContent3
		}),

		new OverflowToolbar("otb4", {
			width: 'auto',
			content : toolbarContent4
		}),

		new OverflowToolbar("otb5", {
			width: 'auto',
			content : toolbarContent5
		}),

		new OverflowToolbar("otb6", {
			width: 'auto',
			content : toolbarContent6
		}),

		new OverflowToolbar("otb7", {
			width: 'auto',
			content : toolbarContent7
		}),

		new OverflowToolbar("otb8", {
			width: 'auto',
			content : toolbarContent8
		}),

		new OverflowToolbar("otb9", {
			width: 'auto',
			content: toolbarContent9
		}),

		new OverflowToolbar("otb10", {
			width: 'auto',
			content: toolbarContent10
		}),

		new OverflowToolbar("otb11", {
			width: 'auto',
			content: toolbarContent11
		}),

		new OverflowToolbar("otb12", {
			width: 'auto',
			content: toolbarContent12
		}),

		new OverflowToolbar("otbFooter", {
			width: 'auto',
			style: 'Clear',
			content : toolbarContentFooter
		})
	];

	var oPage = new NavContainer("toolbar-page", {
		pages: [new Page({
		title : "Overflow Toolbar - the buttons that do not fit go to an action sheet",
		titleLevel: "H1",
		enableScrolling : true,
		subHeader: aAllToolbars[0],
		content: [
			new Slider({
				value: 100,
				liveChange: function(oControlEvent) {

					var sSize = oControlEvent.getParameter("value");

					if (sSize === 100) {
						sSize = "auto";
					} else {
						sSize += "%";
					}

					aAllToolbars.forEach(function (oToolbar) {
						if (Toolbar.isRelativeWidth(oToolbar.getWidth())) {
							oToolbar.setWidth(sSize);
						}
					});

				}
			}),

			aAllToolbars.slice(1, aAllToolbars.length - 1),

			new MessageStrip({
				text: "Change page width",
				showIcon: true
			}).addStyleClass("sapUiSmallMargin"),

			new HBox({
				justifyContent: FlexJustifyContent.Center,
				wrap: FlexWrap.Wrap,
				items: [
					new Button("size_btn", {
						text : "Change page width to 480px",
						press : function() {
							Element.getElementById("toolbar-page").setWidth("480px");
							MessageToast.show("Page width changed to 480px.");
						}
					}).addStyleClass("sapUiSmallMargin"),
					new Button("size_btn2", {
						text : "Change page width to 700px",
						press : function() {
							Element.getElementById("toolbar-page").setWidth("700px");
							MessageToast.show("Page width changed to 700px.");
						}
					}).addStyleClass("sapUiSmallMargin"),
					new Button("size_btn3", {
						text : "Change page width to 100%",
						press : function() {
							Element.getElementById("toolbar-page").setWidth("100%");
							MessageToast.show("Page width changed to 100%.");
						}
					}).addStyleClass("sapUiSmallMargin")
				]
			})
		],
	footer: aAllToolbars[aAllToolbars.length - 1]
	})]});


	var oApp = new App();

	/*
	var oWorkExample = new OverflowToolbar("otb", {
		width: 'auto',
		content : [
			new Button({
				text : "Play",
				width: "100px"
			}),
			new Label({
				text : "This is an old player very very old old player"
			}),
			new Button({
				text : "Fast Rewind",
				width: "100px"
			}),
			new Button({
				text : "Rewind",
				width: "100px"
			}),
			new ToolbarSpacer(),
			new Button({
				text : "Record",
				width: "100px"
			}),
			new Button({
				text : "Pause",
				width: "100px"
			}),
			new Button({
				text : "Stop",
				width: "100px"
			}),
			new Button({
				text : "Forward",
				width: "100px"
			})
		]
	});
	*/

	Element.getElementById("sf1").attachSearch(function (oParams) {
		Element.getElementById("hotelsLabel").setText(oParams.getParameter("query"));
	});

	oApp.addPage(oPage).placeAt("content");
});
