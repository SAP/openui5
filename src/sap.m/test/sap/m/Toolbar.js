sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/Toolbar",
	"sap/ui/core/IconPool",
	"sap/m/App",
	"sap/ui/core/InvisibleText",
	"sap/m/Button",
	"sap/m/ToolbarSeparator",
	"sap/m/Label",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/SearchField",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/library",
	"sap/m/ToolbarSpacer",
	"sap/m/ToggleButton",
	"sap/m/Input",
	"sap/m/DateTimePicker",
	"sap/m/CheckBox",
	"sap/m/RadioButton",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/core/library",
	"sap/ui/core/Icon",
	"sap/m/ToolbarLayoutData"
], function(
	MessageToast,
	Toolbar,
	IconPool,
	App,
	InvisibleText,
	Button,
	ToolbarSeparator,
	Label,
	Select,
	Item,
	SearchField,
	SegmentedButton,
	SegmentedButtonItem,
	mobileLibrary,
	ToolbarSpacer,
	ToggleButton,
	Input,
	DateTimePicker,
	CheckBox,
	RadioButton,
	Dialog,
	List,
	Page,
	MText,
	Title,
	coreLibrary,
	Icon,
	ToolbarLayoutData
) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = mobileLibrary.ToolbarDesign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

	var oApp = new App();
	var sAddIconURI = IconPool.getIconURI("add");

	new InvisibleText("SF_AD", {text: "Sample Text"}).toStatic();

	function getToolbarContent (sText, sSelId) {
		return [
			new Button({text : "Button"}),
			new ToolbarSeparator(),
			new Button({text : "Test"}),
			new Label({
				text: "Choose:",
				tooltip: "Choose:",
				labelFor: sSelId
			}),
			new Select(sSelId, {
				autoAdjustWidth: true,
				items : [
					new Item({
							key: "0",
							text: "item 0"
						}),
					new Item({
							key: "1",
							text: "loooooooooooooong item"
					})
				]
			}),
			new SearchField({
				placeholder : "Search",
				ariaLabelledBy: ["SF_AD"],
				width : "200px"
			}),
			new SegmentedButton({
				items: [
					new SegmentedButtonItem({
						icon: sAddIconURI,
						enabled: true
					}),
					new SegmentedButtonItem({
						icon: sAddIconURI,
						enabled: true
					}),
					new SegmentedButtonItem({
						icon: sAddIconURI,
						enabled: true
					}),
					new SegmentedButtonItem({
						icon: sAddIconURI,
						enabled: true
					})
				]
			}),
			new Button({text : "Button"}),
			new Select({
				type: SelectType.IconOnly,
				icon: IconPool.getIconURI("filter"),
				autoAdjustWidth: true,
				items : [
					new Item({
						key: "0",
						text: "item 0"
					}),
					new Item({
						key: "1",
						text: "loooooooooooooong item"
					})
				]
			}),
			new ToolbarSpacer(),
			new Label({ text : sText, tooltip : sText }),
			new ToolbarSpacer(),
			new Label({
				text: "Choose:",
				tooltip: "Choose:",
				labelFor: sSelId + 'innerSelect'
			}),
			new Select(sSelId + 'innerSelect', {
				items : [
					new Item({
						key: "0",
						text: "item 0"
					}),
					new Item({
						key: "1",
						text: "loooooooooooooong item"
					})
				]
			})
		];
	}

	function getInputToolbarContent () {
		return [
			new Label({
				text : "Input controls",
				tooltip : "Input controls"
			}),
			new ToolbarSpacer(),
			new ToggleButton({
				text: "Press to toggle"
			}),
			new Input({
				placeholder: "Input",
				ariaLabelledBy: ["SF_AD"],
				width: "150px"
			}),
			new DateTimePicker({
				placeholder: "DateTimePicker",
				width: "250px"
			}),
			new CheckBox({
				text : "Checkbox"
			}),
			new RadioButton({
				text : "Option a",
				groupName : "a"
			}),
			new RadioButton({
				text : "Option b",
				groupName : "b"
			})
		];
	}

	var TBHeader = new Toolbar({
		content : getToolbarContent("This is a Header", "selH")
	});

	var TBSubHeader = new Toolbar({
		content : getToolbarContent("This is a SubHeader", "selSubH")
	});

	var TBFooter = new Toolbar({
		content : getToolbarContent("This is a Footer", "selF")
	});

	// test toolbars in dialog
	var oList;
	var oDialog = new Dialog({
		title: "Toolbar Dialog",
		content: [
			oList = new List({
				headerToolbar : new Toolbar({
					content : [
						new Label({
							text : "This is a header",
							tooltip : "This is a header"
						}),
						new ToolbarSpacer(),
						new Button({
							text : "Remove",
							type : "Reject",
							press : function() {
								oList.getHeaderToolbar().destroy();
							}
						})
					]
				})
			}),
			oList.getHeaderToolbar().clone().setDesign("Info").setHeight("auto")
		],
		beginButton: new Button({
			text: "Close",
			press : function() {
				oDialog.close();
			}
		})
	});

	var iMessageToastDuration = 500;

	// add toolbars to the page
	var oPage = new Page("toolbar-page", {
		customHeader : TBHeader,
		subHeader : TBSubHeader,
		footer : TBFooter,
		title : "Toolbar",
		enableScrolling : true,
		headerContent : new Button({
			text : "Open Dialog",
			press : function() {
				oDialog.open();
			}
		}),
		content : [
			new Toolbar("info_bar", {
				active : true,
				ariaHasPopup: "dialog",
				design : ToolbarDesign.Info,
				tooltip : "This is a info bar",
				content : [
					new Label({text : "Label", tooltip: "Label"}),
					new MText({text: "Text"}),
					new Title({text: "Title", level: TitleLevel.H1}),
					new Icon({src : "sap-icon://collaborate"})
				]
			}).attachPress(function(oEvent) {
				MessageToast.show("InfoBar Pressed! Sorce: " + oEvent.getParameter("srcControl").getId(), {
					duration: iMessageToastDuration
				});
			}),
			new Toolbar("info_bar2", {
				active : false,
				design : ToolbarDesign.Info,
				tooltip : "This is a info bar",
				content : [
					new Label({text : "Label", tooltip: "Label"}),
					new MText({text: "Text"}),
					new Title({text: "Title", level: TitleLevel.H2}),
					new Icon({src : "sap-icon://collaborate"})
				]
			}),
			new Toolbar({
				design : ToolbarDesign.Solid,
				height : "auto",
				content : [
					new Label({
						text : "This text should never get shrink.",
						tooltip : "This text should never get shrink.",
						layoutData : new ToolbarLayoutData({
							shrinkable : false
						})
					}),
					new ToolbarSpacer(),
					new Button({
						text : "This Button is shrinkable up to 100px",
						icon: "sap-icon://person-placeholder",
						layoutData : new ToolbarLayoutData({
							shrinkable : true,
							minWidth: "100px"
						}),
						press : function() {
							MessageToast.show("Shrinkable button is pressed.",  {
								at: "center center",
								duration: iMessageToastDuration
							});
						}
					})
				]
			}),
			new Toolbar({
				height: "auto",
				content : [
					new Label({
						text : "Percent Width Controls",
						tooltip : "Percent Width Controls",
						labelFor: "searchField",
						width: "15%"
					}),
					new ToolbarSpacer(),
					new SearchField("searchField", {
						ariaDescribedBy: ["SF_AD"],
						placeholder : "This has 100% width by default"
					})
				]
			}),
			new Toolbar({
				height: "auto",
				design : ToolbarDesign.Transparent,
				content : [
					new Label({
						text : "Segmented Button in Transparent Toolbar",
						tooltip : "Segmented Button"
					}),
					new ToolbarSpacer(),
					new SegmentedButton({
						selectedItem : "sbi1",
						items : [
							new SegmentedButtonItem("sbi1", {
								text : "Seg-"
							}),
							new SegmentedButtonItem({
								text : "-men-"
							}),
							new SegmentedButtonItem({
								text : "-ted Button"
							})
						]
					})
				]
			}),
			new Toolbar({
				height: "auto",
				design : ToolbarDesign.Transparent,
				content : [
					new Label({
						text : "Lots of Buttons",
						tooltip : "Lots of Buttons"
					}),
					new ToolbarSpacer(),
					new Button({
						text : "1st Button"
					}),
					new Button({
						type : "Accept",
						text : "Second Button Shrinkable",
						icon: "sap-icon://person-placeholder",
						layoutData : new ToolbarLayoutData({
							shrinkable : true
						})
					}),
					new Button({
						text : "3rd Button"
					}),
					new Button({
						type : "Reject",
						text : "Fourth Button Shrinkable",
						icon: "sap-icon://person-placeholder",
						layoutData : new ToolbarLayoutData({
							shrinkable : true
						})
					}),
					new Button({
						text : "5th Button"
					})
				]
			}),
			new Toolbar({
				content : getInputToolbarContent()
			}).applyTagAndContextClassFor("header"),
			new Toolbar({
				content : getInputToolbarContent()
			}).applyTagAndContextClassFor("subheader"),
			new Toolbar({
				content : 	getInputToolbarContent()
			}).applyTagAndContextClassFor("footer"),
			new Toolbar({
				design : ToolbarDesign.Transparent,
				content : getInputToolbarContent()
			}),
			new Toolbar({
				design : ToolbarDesign.Solid,
				content : getInputToolbarContent()
			}),
			new Toolbar({
				height : "auto",
				design : ToolbarDesign.Solid,
				content : [
					new Label({
						text : "This text should never get shrink This text should never get shrink",
						tooltip : "This text should never get shrink This text should never get shrink",
						layoutData : new ToolbarLayoutData({
							shrinkable : false
						})
					}),
					new ToolbarSpacer(),
					new Button({
						text : "This Button is shrinkable",
						layoutData : new ToolbarLayoutData({
							shrinkable : true
						})
					}),
					new ToolbarSpacer(),
					new Button({
						text : "This Button is shrinkable up to 100px",
						layoutData : new ToolbarLayoutData({
							shrinkable : true,
							minWidth: "100px",
							maxWidth: "300px"
						})
					})
				]
			}),
			new Toolbar({
				design : ToolbarDesign.Solid,
				content : [
					new Button({
						text : "Button1",
						type : "Accept",
						width : "50%"
					}),
					new Button({
						text : "Button2",
						type : "Reject",
						width : "50%"
					})
				]
			})
		]
	});

	oApp.addPage(oPage).placeAt("body");

	var oB = new Button("size_btn", {
		text : "Change page size to 300px",
		press : function() {
			oPage.$().width("300px");
			MessageToast.show("Page size changed to 300px");
		}
	});

	var oB2 = new Button("size_btn2", {
		text : "Change page size to 100%",
		press : function() {
			oPage.$().width("100%");
			MessageToast.show("Page size changed to 100%");
		}
	});

	oB.placeAt("body");
	oB2.placeAt("body");
});
