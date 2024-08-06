sap.ui.define([
	"sap/m/ActionListItem",
	"sap/m/App",
	"sap/m/Avatar",
	"sap/m/BusyDialog",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/CustomListItem",
	"sap/m/Dialog",
	"sap/m/DisplayListItem",
	"sap/m/HBox",
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/InputListItem",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Slider",
	"sap/m/StandardListItem",
	"sap/m/Switch",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/CustomData",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(
	ActionListItem,
	App,
	Avatar,
	BusyDialog,
	Button,
	ToggleButton,
	CustomListItem,
	Dialog,
	DisplayListItem,
	HBox,
	MImage,
	Input,
	InputListItem,
	Label,
	mobileLibrary,
	List,
	MessageToast,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	Page,
	Select,
	Slider,
	StandardListItem,
	Switch,
	ToolbarSpacer,
	CustomData,
	Element,
	HTML,
	Item,
	coreLibrary,
	JSONModel,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var app = new App("myApp");

	function addFioriButton(){
		return new Select({
			tooltip: "Page Style",
			items: [
				new Item({ key: "0", text: "Normal" }),
				new Item({ key: "1", text: "Fiori Object" })
			],
			selectedItem: "0",
			change: function(oControlEvent){
					var sKey = oControlEvent.getParameter("selectedItem").getKey();
					jQuery(".sapMPage").toggleClass("sapUiFioriObjectPage", sKey == "1");
			}
		});
	}

	function addDialogButton(){
		return new Button({
			text : "Dialog",
			press : function(){
				var page = this.getParent().getParent();
				var list = page.getContent()[0];
				showDialog(page, list);
			}
		});
	}

	/*
	// ================================================================================
	// create application pages for the different lists
	// ================================================================================
	*/
	var listOverview = new Page("listOverview", {
		title : "List Overview",
		titleLevel: "H1",
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new ToolbarSpacer()
			]
		})
	});

	var detailPage = new Page("detailPage", {
		title : "Detail Page",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		}
	});



	var oNone = new Item({
		key: "0",
		text: "None"
	});

	var oInner = new Item({
		key: "1",
		text: "Inner"
	});

	var oAll = new Item({
		key: "2",
		text: "All"
	});
	var oTransparent = new Item({
		key: "0",
		text: "Transparent"
	});

	var oTranslucent = new Item({
		key: "1",
		text: "Translucent"
	});

	var oSolid = new Item({
		key: "2",
		text: "Solid"
	});
	// ================================================================================

	var standardListThumb = new Page("standardListThumb", {
		title : "Standard List Thumb",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardThumb); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardThumb); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardThumb); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardThumb); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardThumb); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardThumb); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardThumb);}
				}),
				new Select({
					name: "Separators",
					tooltip: "Separators",
					items: [oNone, oInner, oAll],
					selectedItem: oAll,
					change: function(oEvent) {switchSeparators(oEvent, oListStandardThumb);}
				}),
				new Select({
					name: "BG-Design",
					tooltip: "BG-Design",
					items: [oTransparent, oTranslucent, oSolid],
					selectedItem: oTransparent,
					change: function(oEvent) {switchBGDesign(oEvent, oListStandardThumb);}
				})
			]
		})
	});

	var standardListIcon = new Page("standardListIcon", {
		title : "Standard List Icon",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardIcon); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardIcon); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardIcon); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardIcon); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardIcon); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardIcon); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardIcon); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var standardListIconA = new Page("standardListIconA", {
		title : "Standard List Icon Active",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardIconA); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardIconA); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardIconA); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardIconA); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardIconA); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardIconA); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardIconA); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var standardListIconDA = new Page("standardListIconDA", {
		title : "Standard List Icon Detail and Active",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardIconDA); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardIconDA); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardIconDA); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardIconDA); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardIconDA); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardIconDA); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardIconDA); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var standardListTitle = new Page("standardListTitle", {
		title : "Standard List Title",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardTitle); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardTitle); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardTitle); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardTitle); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardTitle); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardTitle); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardTitle); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var standardListNoImage = new Page("standardListNoImage", {
		title : "Standard List no Image",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardNoImage); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardNoImage); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardNoImage); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardNoImage); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardNoImage); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardNoImage); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardNoImage); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var standardListAvatar = new Page("standardListAvatar", {
		title : "Standard List with Avatar",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListStandardAvatar); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListStandardAvatar); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListStandardAvatar); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListStandardAvatar); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListStandardAvatar); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListStandardAvatar); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListStandardAvatar); }
				}),
				new ToolbarSpacer()
			]
		})
	});


	var displayList = new Page("displayList", {
		title : "Display list",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListDisplay); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListDisplay); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListDisplay); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListDisplay); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListDisplay); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListDisplay); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListDisplay); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var inputList = new Page("inputList", {
		title : "Input List",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListInput); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListInput); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListInput); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListInput); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListInput); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListInput); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListInput); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var customList = new Page("customList", {
		title : "Custom List",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListCustom); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListCustom); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListCustom); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListCustom); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListCustom); }
				}),
				new Button({
					text : "Swipe",
					press : function() {switchToSwipe(oListCustom); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListCustom); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var groupedList = new Page("groupedList", {
		title : "Grouped List",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new ToolbarSpacer()
			]
		})
	});

	var groupedNoHeaderList = new Page("groupedNoHeaderList", {
		title : "Grouped List without Header/Footer",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new ToolbarSpacer()
			]
		})
	});

	var selectionList = new Page("selectionList", {
		title: "Selection List", //Only needed for the Dialog (see addDialogButton)
		titleLevel: "H1",
		customHeader : new OverflowToolbar({
			content: [
				new Button('myButtonSelectionBack', {text:"Back", type:ButtonType.Back, press:function() {app.back();},
					layoutData: new OverflowToolbarLayoutData({group:1})}),
				new ToolbarSpacer(),
				new Label("myBarLabel", {text: "Selection List", layoutData: new OverflowToolbarLayoutData({group:2})}),
				new ToolbarSpacer(),
				new Button('myButtonSetSelectionItem1', {text:"#1", press: setSelectionItem1, layoutData: new OverflowToolbarLayoutData({group:3})}),
				new Button('myButtonSetSelectionItem2', {text:"#2", press: setSelectionItem2, layoutData: new OverflowToolbarLayoutData({group:3})}),
				new Button('myButtonSetSelectionItem3', {text:"#3", press: setSelectionItem3, layoutData: new OverflowToolbarLayoutData({group:3})}),
				new Button('myButtonSetSelectionItem4', {text:"#4", press: setSelectionItem4, layoutData: new OverflowToolbarLayoutData({group:3})}),
				new Button('myButtonSetSelectionItem5', {text:"#5", press: setSelectionItem5, layoutData: new OverflowToolbarLayoutData({group:3})}),
				new Button('myButtonGetSelection', {text:"Get Selection", press: getSelection2,
					layoutData: new OverflowToolbarLayoutData({group:3, priority: OverflowToolbarPriority.AlwaysOverflow})}),
				new Button('myButtonRemoveSelection', {text:"Remove Selection", press: removeSelection,
					layoutData: new OverflowToolbarLayoutData({group:3, priority: OverflowToolbarPriority.AlwaysOverflow})})
			]
		}),
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListSelection); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListSelection); }
				}),
				new Button({
					text : "SingleLeft",
					press : function() {switchModeSingleLeft(oListSelection); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListSelection); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListSelection); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListSelection); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListSelection); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var htmlList = new Page("htmlList", {
		title : "Html List",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListHtml); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListHtml); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListHtml); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListHtml); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListHtml); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListHtml); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var noDataList = new Page("noDataList", {
		title : "No Data List",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new OverflowToolbar({
			content : [
				new ToolbarSpacer(),
				addFioriButton(),
				addDialogButton(),
				new ToggleButton({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : function() {switchModeNone(oListNoData); }
				}),
				new Button({
					text : "Single",
					press : function() {switchModeSingle(oListNoData); }
				}),
				new Button({
					text : "SingleMaster",
					press : function() {switchModeSingleMaster(oListNoData); }
				}),
				new Button({
					text : "Multi",
					press : function() {switchModeMulti(oListNoData); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListNoData); }
				}),
				new Button({
					text : "Switch Mode Interaction",
					press : function() {switchModeInteraction(oListNoData); }
				}),
				new ToolbarSpacer()
			]
		})
	});

	var oSwpBusyDialog = new BusyDialog({
		title: 'Processing...'
	});

	var oSwipeList1, oSwipeList2, oSwipeList3;
	var swipeAction = new Page("swipeAction", {
		title : "List Swipe Action",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		content : [oSwipeList1 = new List({
			inset : true,
			showUnread: true,
			headerText : "Dynamic Button",
			headerLevel: "H2",
			swipeContent : new Button({
				text : "Approve",
				type : "Accept",
				press : function(e) {
					var oSwipedItem = oSwipeList1.getSwipedItem(),
						isApproved = !oSwipedItem.data("approved");

					oSwpBusyDialog.open();
					setTimeout(function() {
						oSwpBusyDialog.close();
						if (isApproved) {
							oSwipedItem.setIcon("images/candy_v_46x46.png");
						} else {
							oSwipedItem.setIcon("images/candy_x_46x46.png");
						}
						oSwipedItem.data("approved", isApproved);
						oSwipeList1.swipeOut();
					}, 1500);
				}
			}),
			swipe: function(e) {
				var oSwipedItem = e.getParameter("listItem"),
					oSwipeContent = e.getParameter("swipeContent");

				if (oSwipedItem.data("approved")) {
					oSwipeContent.setText("Disapprove").setType("Reject");
				} else  {
					oSwipeContent.setText("Approve").setType("Accept");
				}
			},
			items : [
				new StandardListItem({
					title : "123 456",
					titleTextDirection: TextDirection.LTR,
					description : "SIP Telephone Set",
					info: "Today",
					infoState: "Success",
					icon: "",
					type: "Navigation",
					unread : true,
					counter: 1,
					press: handlePress,
					wrapping: true
				}).data("approved", false),
				new StandardListItem({
					title : "Tracy Thompson",
					description : "Mouse, Headphone, Keyboard",
					info: "+ 359 234 567",
					infoTextDirection: TextDirection.LTR,
					infoState: "Warning",
					icon: "",
					type: "Navigation",
					unread : true,
					counter: 3,
					press: handlePress,
					wrapping: true
				}).data("approved", false),
				new StandardListItem({
					title : "Steven John Parker",
					description : "Brilliance Monitor, Docking Station",
					info: "Yesterday",
					icon: "",
					type: "Navigation",
					unread : true,
					counter: 2,
					press: handlePress,
					wrapping: true
				}).data("approved", false)
			]
		}), oSwipeList2 = new List({
			inset : true,
			headerText : "Combined Swipe Content HBox with Images",
			headerLevel: "H2",
			footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services.",
			swipeContent : new HBox({
				items:[
					new MImage({
						src : "images/edit_48.png",
						press : function() {
							var oSwipedItem = oSwipeList2.getSwipedItem(),
								oData = oSwipedItem.getBindingContext().getObject();

							showPopup("Edit pressed for " + oData.firstName + " " + oData.lastName);
							oSwipeList2.swipeOut();
						}
					}),
					new MImage({
						src : "images/delete_48.png",
						press : function() {
							var oSwipedItem = oSwipeList2.getSwipedItem();

							oSwipeList2.removeAggregation("items", oSwipedItem);
							oSwipeList2.swipeOut();
						}
					})
				]
			}).addStyleClass("hboxBG")
		}), oSwipeList3 = new List({
			inset : true,
			headerText : "Swipe Event Combination",
			headerLevel: "H2",
			swipeContent : new Button({
				text : "Swipe Button",
				type: "Reject",
				press : function(e) {
					oSwipeList3.swipeOut();
				}
			}),
			swipe: function(e) {
				var oSrcControl = e.getParameter("srcControl");
				if (oSrcControl instanceof Button) {
					e.preventDefault();
				}
			},
			items : [new DisplayListItem({
				label : "Label",
				value : "Test"
			}), new InputListItem({
				label : "Slider",
				content : new Slider({
					value: 50,
					width: "140px"
				})
			}), new InputListItem({
				label : "Switch",
				content : new Switch({})
			}), new InputListItem({
				label : "Button",
				content : new Button({
					text : "Cancel Swipe"
				})
			})]
		})]
	});


	// JSON sample data

	var dataOverview = {
		navigation : [ {
			title : "Standard List Thumb",
			type : "Navigation",
			press : 'standardListThumb'
		}, {
			title : "Standard List Icon",
			type : "Navigation",
			press : 'standardListIcon'
		}, {
			title : "Standard List Icon Active",
			type : "Navigation",
			press : 'standardListIconA'
		}, {
			title : "Standard List Icon Detail and Active",
			type : "Navigation",
			press : 'standardListIconDA'
		}, {
			title : "Standard List Title",
			type : "Navigation",
			press : 'standardListTitle'
		}, {
			title : "Standard List no Image",
			type : "Navigation",
			press : 'standardListNoImage'
		}, {
			title : "Standard List with Avatar",
			type : "Navigation",
			press : 'standardListAvatar'
		}, {
			title : "Display List",
			type : "Navigation",
			press : 'displayList'
		}, {
			title : "Input List",
			type : "Navigation",
			press : 'inputList'
		}, {
			title : "Custom List",
			type : "Navigation",
			press : 'customList'
		}, {
			title : "Grouped List",
			type : "Navigation",
			press : 'groupedList'
		}, {
			title : "Grouped List without Header/Footer",
			type : "Navigation",
			press : 'groupedNoHeaderList'
		}, {
			title : "Selection List",
			type : "Navigation",
			press : 'selectionList'
		}, {
			title : "Html List",
			type : "Navigation",
			press : 'htmlList'
		}, {
			title : "No Data List",
			type : "Navigation",
			press : 'noDataList'
		}, {
			title : "Swipe Action",
			type : "Navigation",
			press : 'swipeAction'
		} ]
	};

	var dataNavigation = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : "images/placeholder_48x48.png",
			//icon : "sap-icon://favorite",
			iconInset : false,
			type : "Navigation",
			unread: true,
			counter: 123,
			selected: false,
			info: "Error message",
			infoState: "Error",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			icon : "images/placeholder_48x48.png",
			//icon : "sap-icon://database",
			iconInset : false,
			type : "Navigation",
			unread: true,
			counter: 3,
			selected: false,
			info: "Warning message",
			infoState: "Warning",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			icon : "sap-icon://employee",
			iconInset : false,
			type : "Navigation",
			unread: true,
			counter: 0,
			selected: false,
			info: "Success message",
			infoState: "Success",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			icon : "sap-icon://e-care",
			iconInset : true,
			type : "Navigation",
			unread: true,
			counter: 999999999,
			selected: false,
			info: "Info message",
			infoState: "Information",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel workflow settings",
			icon : "sap-icon://competitor",
			iconInset : true,
			type : "Navigation",
			unread: true,
			counter: 4711,
			selected: true,
			info: "no semantic",
			press : 'detailPage'
		} ]
	};

	var dataDetail = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : "images/placeholder_48x48.png",
			//icon : "sap-icon://favorite",
			iconInset : false,
			type : "Detail",
			unread: true,
			counter: 123,
			press: "Content pressed",
			detailPress : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			icon : "images/placeholder_48x48.png",
			//icon : "sap-icon://database",
			iconInset : false,
			type : "Detail",
			unread: true,
			counter: 4,
			press: "Content pressed",
			detailPress : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			icon : "sap-icon://employee",
			iconInset : false,
			type : "Detail",
			unread: true,
			press: "Content pressed",
			detailPress : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			icon : "sap-icon://e-care",
			iconInset : true,
			type : "Detail",
			unread: true,
			press: "Content pressed",
			detailPress : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel workflow settings",
			icon : "sap-icon://competitor",
			iconInset : true,
			type : "Detail",
			unread: true,
			press: "Content pressed",
			detailPress : 'detailPage'
		} ]
	};

	var dataDetailA = {
			navigation : [ {
				title : "Travel Expend",
				description : "Access the travel expend workflow",
				icon : "images/placeholder_48x48.png",
				//icon : "sap-icon://favorite",
				iconInset : false,
				type : "Active",
				unread: true,
				counter: 123,
				info: "Error message",
				infoState: "Error",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Travel and expense report",
				description : "Access travel and expense reports",
				icon : "images/placeholder_48x48.png",
				//icon : "sap-icon://database",
				iconInset : false,
				type : "Active",
				unread: true,
				counter: 4,
				info: "Warning message",
				infoState: "Warning",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Travel Request",
				description : "Access the travel request workflow",
				icon : "sap-icon://employee",
				iconInset : false,
				type : "Active",
				unread: true,
				info: "Success message",
				infoState: "Success",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Work Accidents",
				description : "Report your work accidents",
				icon : "sap-icon://e-care",
				iconInset : true,
				type : "Active",
				unread: true,
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Travel Settings",
				description : "Change your travel workflow settings",
				icon : "sap-icon://competitor",
				iconInset : true,
				type : "Active",
				unread: true,
				press: "Content pressed",
				detailPress : 'detailPage'
			} ]
		};

	var dataDetailDA = {
			navigation : [ {
				title : "Travel Expend",
				description : "Access the travel expend workflow",
				icon : "images/placeholder_48x48.png",
				//icon : "sap-icon://favorite",
				iconInset : false,
				type : "DetailAndActive",
				unread: true,
				info: "Error message",
				infoState: "Error",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Travel and expense report",
				description : "Access travel and expense reports",
				icon : "images/placeholder_48x48.png",
				//icon : "sap-icon://database",
				iconInset : false,
				type : "DetailAndActive",
				unread: true,
				info: "Warning message",
				infoState: "Warning",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Travel Request",
				description : "Access the travel request workflow",
				icon : "sap-icon://employee",
				iconInset : false,
				type : "DetailAndActive",
				unread: true,
				info: "Success message",
				infoState: "Success",
				press: "Content pressed",
				detailPress : 'detailPage'
			}, {
				title : "Work Accidents",
				description : "Report your work accidents",
				icon : "sap-icon://e-care",
				iconInset : true,
				type : "DetailAndActive",
				unread: true,
				press: "Content pressed",detailPress : 'detailPage'

			}, {
				title : "Travel Settings",
				description : "Change your travel workflow settings",
				icon : "sap-icon://competitor",
				iconInset : true,
				type : "DetailAndActive",
				unread: true,
				press: "Content pressed",
				detailPress : 'detailPage'
			} ]
		};

	var dataHTML = {
			navigation : [ {
				firstName : "Karl",
				lastName : "Schmidt",
				age : "26",
				city : "Berlin",
				type : "Navigation",
				unread: true,
				press: "detailPage"
			}, {
				firstName : "Susanne",
				lastName : "Bold",
				age : "28",
				city : "New York",
				type : "Navigation",
				unread: true,
				press: "detailPage"
			},{
				firstName : "Michael",
				lastName : "Maier",
				age : "24",
				city : "Walldorf",
				type : "Navigation",
				unread: true,
				press: "detailPage"
			}, {
				firstName : "Franziska",
				lastName : "Kranz",
				age : "48",
				city : "Stuttgart",
				type : "Navigation",
				unread: true,
				press: "detailPage"
			},{
				firstName : "Phil",
				lastName : "Duncan",
				age : "35",
				city : "Los Angeles",
				type : "Navigation",
				unread: true,
				press: "detailPage"
			} ]
		};

	// Data for Avatar in StandardListItem
	var dataAvatar = {
		navigation : [
			{
				title : "Avatar no Inset",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				displaySize: "L", //for test only, do not play a role as it will be overrwritten
				badgeIcon: "sap-icon://camera",
				src: "images/Woman_avatar_01.png",
				displayShape: "Circle",
				press: function(){MessageToast.show("Avatar (no Inset) pressed");},
				unread : true,
				iconInset: false,
				imageFitType: "Cover",
				counter: 1,
				detailPress : 'detailPage'
		},
		{
				title : "Avatar with Inset",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				displaySize: "L", //for test only, do not play a role as it will be overrwritten
				displayShape: "Circle",
				imageFitType: "Cover",
				src: "images/Woman_avatar_01.png",
				unread : true,
				iconInset: true,
				counter: 2,
				detailPress : 'detailPage'
		},
		{
				title : "Avatar no Inset and cover fit of the image",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				displaySize: "M",
				imageFitType: "Cover",
				src: "images/Lamp_avatar_01.jpg",
				displayShape: "Square",
				unread : true,
				iconInset: false,
				counter: 3
		},
		{
				title : "Avatar no Inset and contain fit of the image",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				displaySize: "S",
				imageFitType: "Contain",
				src: "images/Lamp_avatar_01.jpg",
				displayShape: "Square",
				unread : true,
				iconInset: false,
				counter: 3

		},
		{
				title : "Avatar with Inset and cover fit of the image",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				imageFitType: "Cover",
				src: "images/Lamp_avatar_01.jpg",
				displayShape: "Square",
				unread : true,
				iconInset: true,
				counter: 4
		}
		,{
				title : "Avatar with Inset and contain fit of the image",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				displaySize: "L",
				imageFitType: "Contain",
				src: "images/Lamp_avatar_01.jpg",
				displayShape: "Square",
				unread : true,
				iconInset: true,
				counter: 4
		},
		{
				title : "Avatar with Inset",
				description : "Mouse, Headphone, Keyboard",
				info: "+ 359 234 567",
				infoTextDirection: TextDirection.LTR,
				infoState: "Warning",
				src: "sap-icon://lab",
				unread : true,
				iconInset: true,
				counter: 5,
				badgeIcon: "sap-icon://zoom-in"
		}
	 ]
	};


	/*
	// ================================================================================
	// create templates for the different lists (visible content of each list)
	// ================================================================================
	*/
	var oItemTemplateOverview = new StandardListItem({
		title : "{title}",
		type : "{type}",
		unread: "{unread}",
		press : handlePress,
		wrapping: true
	});

	var oItemTemplateStandardThumb = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		activeIcon: "{activeIcon}",
		iconInset : "{iconInset}",
		type : "{type}",
		unread: "{unread}",
		counter: "{counter}",
		selected: "{selected}",
		info: "{info}",
		infoState: "{infoState}",
		press : handlePress,
		wrapping: true
	});

	var oItemTemplateStandardIcon = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		activeIcon: "{activeIcon}",
		iconInset : "{iconInset}",
		type : "{type}",
		unread: "{unread}",
		counter: "{counter}",
		info: "{info}",
		infoState: "{infoState}",
		detailPress : handleDetailPress,
		press: handlePress,
		wrapping: true
	});

	var oItemTemplateStandardTitle = new StandardListItem({
		title : "{title}",
		info : "{info}",
		icon : "{icon}",
		iconInset : "{iconInset}",
		infoState: "{infoState}",
		activeIcon: "{activeIcon}",
		unread: "{unread}",
		press : handlePress,
		wrapping: true
	});

	var oItemTemplateStandardNoImage = new StandardListItem({
		title : "{title}",
		description : "{description}",
		type : "{type}",
		unread: "{unread}",
		press : handlePress,
		wrapping: true
	});

	var oItemTemplateStandardAvatar = new StandardListItem({
		title : "{title}",
		info : "{info}",
		icon : "{icon}",
		iconInset : "{iconInset}",
		infoState: "{infoState}",
		activeIcon: "{activeIcon}",
		counter: "{counter}",
		avatar: new Avatar({
			displaySize: "{displaySize}",
			displayShape: "{displayShape}",
			badgeIcon: "{badgeIcon}",
			imageFitType: "{imageFitType}",
			src: "{src}",
			press: function(){MessageToast.show("Avatar pressed");}
		}),
		unread: "{unread}",
		press : handlePress,
		wrapping: true
	});

	var oItemTemplateDisplay = new DisplayListItem({
		label : "{title}",
		value : "{description}",
		type : "{type}",
		unread: "{unread}",
		press : handlePress
	});

	var oItemTemplateInput = new InputListItem({
		label : "{title}",
		type : "{type}",
		unread: "{unread}",
		content : new Input({
			type : "Number",
			placeholder : "Number"
		}),
		press : handlePress
	});

	var oItemTemplateCustom = new CustomListItem({
		type : "{type}",
		unread: "{unread}",
		content : new Button({
			text : "{title}",
			width : "100%",
			icon : "sap-icon://action",
			type : ButtonType.Reject
		}),
		press : handlePress
	}).addStyleClass("SmallPaddingBegin");

	var oItemTemplateHtml = new CustomListItem({
		unread: "{unread}",
		content: new HTML({
			content: {
				parts: [
					{path: "firstName"},
					{path: "lastName"},
					{path: "age"},
					{path: "city"}
				],
				formatter: function(firstName, lastName, age, city) {
					return "<div style='padding: 1rem;'><div>Name: " + firstName + " " + lastName
						+ "</div><div>Age: " + age + "</div><div>City: " + city + "</div></div>";
				}
			}}),
		type : "{type}",
		press : handlePress
	});

	var oItemTemplateSelection = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		activeIcon: "{activeIcon}",
		type : "{type}",
		unread: "{unread}",
		press : handlePress,
		wrapping: true
	});


	/*
	// ================================================================================
	// create the list objects for the different pages
	// ================================================================================
	*/
	var oListOverview = new List({
		id : "sapMList001",
		inset : false,
		headerText : "List Overview",
		footerText : "These are just some list examples and this won't show all possible combinations."
	});

	var oListStandardThumb = new List(
			{
				inset : false,
				showUnread: true,
				backgroundDesign: "Solid",
				'delete': deleteItem,
				headerText : "Travel [StandardListThumb]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardIcon = new List(
			{
				inset : false,
				showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListIcon]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardIconA = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListIconA]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardIconDA = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListIconDA]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardTitle = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListTitle]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardNoImage = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListNoImage]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardAvatar = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [StandardListAvatar]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListDisplay = new List(
			{
				inset : false,
				showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [DisplayList]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListInput = new List(
			{
				inset : false,
				//showUnread: true,
				'delete': deleteItem,
				headerText : "Travel [InputList]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListCustom = new List(
			{
				inset : false,
				//showUnread: true,
				showSeparators: "None",
				'delete': deleteItem,
				headerText : "Travel [CustomList]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardThumbNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardIconNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardIconANoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardIconDANoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardTitleNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardNoImageNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListStandardAvatarNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListDisplayNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListInputNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListCustomNoHeader = new List(
			{
				showUnread: true,
				inset : false
			});

	var oListSelection = new List(
			{
				showUnread: true,
				inset : false,
				'delete': deleteItem,
				headerText : "Travel [List-Mode: Single]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services.",
				mode : ListMode.None
			});

	var oListHtml = new List(
			{
				showUnread: true,
				inset : false,
				'delete': deleteItem,
				headerText : "Travel [HtmlList]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListNoData = new List(
			{
				inset : false,
				showNoData: true,
				showSeparators: "None",
				'delete': deleteItem,
				headerText : "Travel [No Data List]",
				headerLevel: "H2",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardThumbGroup = oListStandardThumb.clone();
	var oListStandardIconGroup = oListStandardIcon.clone();
	var oListStandardIconAGroup = oListStandardIconA.clone();
	var oListStandardIconDAGroup = oListStandardIconDA.clone();
	var oListStandardTitleGroup = oListStandardTitle.clone();
	var oListStandardNoImageGroup = oListStandardNoImage.clone();
	var oListStandardAvatarGroup = oListStandardAvatar.clone();
	var oListDisplayGroup = oListDisplay.clone();
	var oListInputGroup = oListInput.clone();
	var oListCustomGroup = oListCustom.clone();

	/*
	// ================================================================================
	// bind data to the different lists
	// ================================================================================
	*/
	bindListData(dataOverview, oItemTemplateOverview, oListOverview);
	bindListData(dataNavigation, oItemTemplateStandardThumb, oListStandardThumb);
	bindListData(dataDetail, oItemTemplateStandardIcon, oListStandardIcon);
	bindListData(dataDetailA, oItemTemplateStandardIcon, oListStandardIconA);
	bindListData(dataDetailDA, oItemTemplateStandardIcon, oListStandardIconDA);
	bindListData(dataNavigation, oItemTemplateStandardTitle, oListStandardTitle);
	bindListData(dataNavigation, oItemTemplateStandardNoImage, oListStandardNoImage);
	bindListData(dataAvatar, oItemTemplateStandardAvatar, oListStandardAvatar);
	bindListData(dataNavigation, oItemTemplateDisplay, oListDisplay);
	bindListData(dataNavigation, oItemTemplateInput, oListInput);
	bindListData(dataNavigation, oItemTemplateCustom, oListCustom);
	bindListData(dataHTML, oItemTemplateHtml, oListHtml);
	bindListData(dataHTML, oItemTemplateHtml, oSwipeList2);

	bindListData(dataNavigation, oItemTemplateStandardThumb, oListStandardThumbGroup);
	bindListData(dataDetail, oItemTemplateStandardIcon, oListStandardIconGroup);
	bindListData(dataDetailA, oItemTemplateStandardIcon, oListStandardIconAGroup);
	bindListData(dataDetailDA, oItemTemplateStandardIcon, oListStandardIconDAGroup);
	bindListData(dataNavigation, oItemTemplateStandardTitle, oListStandardTitleGroup);
	bindListData(dataNavigation, oItemTemplateStandardNoImage, oListStandardNoImageGroup);
	bindListData(dataAvatar, oItemTemplateStandardAvatar, oListStandardAvatarGroup);
	bindListData(dataNavigation, oItemTemplateDisplay, oListDisplayGroup);
	bindListData(dataNavigation, oItemTemplateInput, oListInputGroup);
	bindListData(dataNavigation, oItemTemplateCustom, oListCustomGroup);



	bindListData(dataNavigation, oItemTemplateStandardThumb, oListStandardThumbNoHeader);
	bindListData(dataDetail, oItemTemplateStandardIcon, oListStandardIconNoHeader);
	bindListData(dataDetailA, oItemTemplateStandardIcon, oListStandardIconANoHeader);
	bindListData(dataDetailDA, oItemTemplateStandardIcon, oListStandardIconDANoHeader);
	bindListData(dataNavigation, oItemTemplateStandardTitle, oListStandardTitleNoHeader);
	bindListData(dataNavigation, oItemTemplateStandardNoImage, oListStandardNoImageNoHeader);
	bindListData(dataAvatar, oItemTemplateStandardAvatar, oListStandardAvatarNoHeader);
	bindListData(dataNavigation, oItemTemplateDisplay, oListDisplayNoHeader);
	bindListData(dataNavigation, oItemTemplateInput, oListInputNoHeader);
	bindListData(dataNavigation, oItemTemplateCustom, oListCustomNoHeader);

	bindListData(dataNavigation, oItemTemplateSelection, oListSelection);


	/*
	// ================================================================================
	// add different lists to their content
	// ================================================================================
	*/
	listOverview.addContent(oListOverview);

	standardListThumb.addContent(oListStandardThumb);

	var actionList = new List();
	var actionListItem = new ActionListItem({id: "actionListItem", text: "Add Item to Control", press: function(){
		var addedItem = new StandardListItem({
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : "images/travel_expend.png",
			activeIcon: "images/travel_expend_grey.png",
			iconInset : false,
			type : "Navigation",
			unread: true,
			counter: 123,
			selected: false,
			info: "Error message",
			infoState: "Error",
			press : handlePress,
			customData: [
				new CustomData({
					key : "xyz",
					value: "detailPage"
				})
			],
			wrapping: true
		});
		oListStandardThumb.addItem(addedItem);
	}});
	var actionListItem2 = new ActionListItem({id: "actionListItem2", text: "Add Item to Model", press: function(){
		(oListStandardThumb.getModel()).getData().navigation.push(jQuery.extend({}, oListStandardThumb.getModel().getData().navigation[0]));
		(oListStandardThumb.getModel()).setData((oListStandardThumb.getModel()).getData());
	}});

	actionList.addItem(actionListItem);
	actionList.addItem(actionListItem2);

	standardListThumb.addContent(actionList);

	standardListIcon.addContent(oListStandardIcon);
	standardListIconA.addContent(oListStandardIconA);
	standardListIconDA.addContent(oListStandardIconDA);
	standardListTitle.addContent(oListStandardTitle);
	standardListNoImage.addContent(oListStandardNoImage);
	standardListAvatar.addContent(oListStandardAvatar);
	displayList.addContent(oListDisplay);
	inputList.addContent(oListInput);
	customList.addContent(oListCustom);
	htmlList.addContent(oListHtml);
	noDataList.addContent(oListNoData);

	groupedList.addContent(oListStandardThumbGroup);
	groupedList.addContent(oListStandardIconGroup);
	groupedList.addContent(oListStandardIconAGroup);
	groupedList.addContent(oListStandardIconDAGroup);
	groupedList.addContent(oListStandardTitleGroup);
	groupedList.addContent(oListStandardNoImageGroup);
	groupedList.addContent(oListStandardAvatarGroup);
	groupedList.addContent(oListDisplayGroup);
	groupedList.addContent(oListInputGroup);
	groupedList.addContent(oListCustomGroup);

	groupedNoHeaderList.addContent(oListStandardThumbNoHeader);
	groupedNoHeaderList.addContent(oListStandardIconNoHeader);
	groupedNoHeaderList.addContent(oListStandardIconANoHeader);
	groupedNoHeaderList.addContent(oListStandardIconDANoHeader);
	groupedNoHeaderList.addContent(oListStandardTitleNoHeader);
	groupedNoHeaderList.addContent(oListStandardAvatarNoHeader);
	groupedNoHeaderList.addContent(oListDisplayNoHeader);
	groupedNoHeaderList.addContent(oListInputNoHeader);
	groupedNoHeaderList.addContent(oListCustomNoHeader);

	selectionList.addContent(oListSelection);


	/*
	// ================================================================================
	// application helper functions
	// ================================================================================
	*/
	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// create a CustomData template, set its key to "answer" and bind its value to the answer data
		var oDataTemplate = new CustomData({
			key : "xyz"
		});

		oDataTemplate.bindProperty("value", "press");


		// add the CustomData template to the item template
		itemTemplate.addCustomData(oDataTemplate);

		var oDataTemplate2 = new CustomData({
			key : "abc"
		});

		oDataTemplate2.bindProperty("value", "detailPress");


		// add the CustomData template to the item template
		itemTemplate.addCustomData(oDataTemplate2);

		// bind Aggregation
		list.bindAggregation("items", {
			path: "/navigation",
			templateShareable: false,
			template: itemTemplate
		});
	}

	function handlePress(e) {
		if (this.data("xyz") && this.data("xyz") != "Content pressed" && !this.getParent().data("ContainedinDialog")) {
			app.to(this.data("xyz"));
		} else {
			showPopup();
		}
	}

	function showPopup(message) {
		if (!message) {message = "List item was tapped!";}

		var oMessageContent = new HTML({content:"<p>" + message + "</p>"});

		var oMessageDialog1 = new Dialog({
			title: "Important Message",
			content: [
				oMessageContent
			],
			beginButton:
				new Button({
					text: "Reject",
					type: ButtonType.Reject,
					press : function() {
						oMessageDialog1.close();
					}
				}),
			endButton:
				new Button({
					text: "Accept",
					type: ButtonType.Accept,
					press : function() {
						oMessageDialog1.close();
					}
				}),
			type: DialogType.Message
		});
		oMessageDialog1.open();
	}

	function handleDetailPress(e) {
		app.to(this.data("abc"));
	}

	function switchStyle() {
		var listArray = jQuery(".sapMList").map(function(idx, oList) {
			return Element.closestTo(oList);
		}).get();
		var inset = !listArray[listArray.length - 1].getInset();
		for ( var i = 0; i < listArray.length; i++) {
			listArray[i].setInset(inset);
		}
		if (app.getCurrentPage()._refreshIScroll) {app.getCurrentPage()._refreshIScroll();}
	}

	function deleteItem(oEvent) {
		var model = oEvent.mParameters.listItem.getModel();

		var deleteId = model.getProperty("", oEvent.mParameters.listItem.getBindingContext());
		var data = model.getData().navigation;
		jQuery.each(data,function(iIndex, oEntry){

			if (oEntry == deleteId) {
				data.splice(iIndex, 1);
				MessageToast.show("List item deleted");
				return false;
			}
		}
	);
	model.setData(model.getData());
	}

	function showDialog(oPage, oList){
		if (!oPage._dialog){
			var list = oList.clone();
			list.data("ContainedinDialog", true);
			oPage._dialog = new Dialog({
				title: oPage.getTitle(),
				content: [
					list
				],
				beginButton:
					new Button({
						text: "Close",
						press : function() {
							oPage._dialog.close();
						}
					})
			});
		}
		oPage._dialog.open();
	}

	/*
	// ================================================================================
	// selection list: setter/getter functions - toggle between true and false
	// ================================================================================
	*/
	function setSelectionItem1() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			aItems[0].setSelected(true);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			aItems[0].setSelected(!aItems[0].getSelected());
		}
	}

	function setSelectionItem2() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			aItems[1].setSelected(true);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			aItems[1].setSelected(!aItems[1].getSelected());
		}
	}

	function setSelectionItem3() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			aItems[2].setSelected(true);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			aItems[2].setSelected(!aItems[2].getSelected());
		}
	}

	function setSelectionItem4() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			aItems[3].setSelected(true);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			aItems[3].setSelected( (!aItems[3].getSelected()) );
		}
	}

	function setSelectionItem5() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			aItems[4].setSelected(true);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			aItems[4].setSelected( (!aItems[4].getSelected()) );
		}
	}

	function getSelection2() {
		if (oListSelection.getMode() == ListMode.SingleSelect || oListSelection.getMode() == ListMode.SingleSelectLeft || oListSelection.getMode() == ListMode.SingleSelectMaster) {
			var oResult = oListSelection.getSelectedItem();
			showPopup(oResult);
		}
		if (oListSelection.getMode() == ListMode.MultiSelect){
			var aItems = oListSelection.getSelectedItems();
			var sResult = "Count: " + aItems.length + "\n";
			for ( var i = 0; i < aItems.length; i++) {
				sResult = sResult + i.toString() + ": " + aItems[i] + "\n";
			}
			showPopup(sResult);
		}
	}


	function removeSelection() {
		oListSelection.removeSelections();
	}


	/*
	// ================================================================================
	// selection list: functions to switch list selection mode
	// ================================================================================
	*/
	function switchModeNone(oList) {
		oList.setHeaderText("Travel [List-Mode: None]");
		oList.setMode(ListMode.None);
		}

	function switchModeSingle(oList) {
		oList.setHeaderText("Travel [List-Mode: Single]");
		oList.setMode(ListMode.SingleSelect);
	}

	function switchModeSingleLeft(oList) {
		oList.setHeaderText("Travel [List-Mode: SingleLeft]");
		oList.setMode(ListMode.SingleSelectLeft);
	}

	function switchModeSingleMaster(oList) {
		oList.setHeaderText("Travel [List-Mode: SingleMaster]");
		oList.setMode(ListMode.SingleSelectMaster);
	}

	function switchModeMulti(oList) {
		oList.setHeaderText("Travel [List-Mode: Multi]");
		oList.setMode(ListMode.MultiSelect);
	}

	function switchModeDelete(oList) {
		oList.setHeaderText("Travel [List-Mode: Delete]");
		oList.setMode(ListMode.Delete);
	}

	function switchToSwipe(oList) {
		if (!oList.data("swipe")) {
			var btnTypes = ["Default", "Accept", "Reject"],
				btnType = btnTypes[Math.floor(Math.random() * btnTypes.length)];

			oList.setSwipeContent(new Button({
				text : "Swipe Btn " + btnType,
				type : btnType,
				press : function() {
					var li = oList.getSwipedItem();
					showPopup(li.getDomRef().innerText);
					oList.swipeOut();
				}
			}));
			oList.data("swipe", true);
			showPopup("Swipe left on list to see swipe content!!");
		} else {
			oList.swipeOut();
		}
	}

	function switchModeInteraction(oList) {
		oList.setIncludeItemInSelection(!oList.getIncludeItemInSelection());
		var aItems = oList.getItems();
		for ( var i = 0; i < aItems.length; i++) {
			aItems[i]._includeItemInSelection = oList.getIncludeItemInSelection();
		}
	}

	function switchSeparators(oEvent, oList) {
		oList.setShowSeparators(oEvent.getParameter("selectedItem").getText());
	}

	function switchBGDesign(oEvent, oList) {
		oList.setBackgroundDesign(oEvent.getParameter("selectedItem").getText());
	}

	// ================================================================================

	app.addPage(listOverview).addPage(detailPage).addPage(standardListThumb).addPage(standardListIcon).addPage(standardListIconA).addPage(standardListIconDA).addPage(standardListTitle).addPage(standardListNoImage)
	.addPage(standardListAvatar).addPage(displayList).addPage(inputList).addPage(customList).addPage(groupedList).addPage(groupedNoHeaderList).addPage(selectionList).addPage(htmlList).addPage(noDataList).addPage(swipeAction);
	app.setInitialPage("listOverview");
	app.placeAt("body");
});
