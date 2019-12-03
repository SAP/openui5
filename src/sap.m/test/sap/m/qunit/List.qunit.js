/*global QUnit, sinon, jQuery */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Core",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/CustomData",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/Device",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/List",
	"sap/m/DisplayListItem",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/CustomListItem",
	"sap/m/ActionListItem",
	"sap/m/Input",
	"sap/ui/events/KeyCodes"
], function(jQuery, Core, EventExtension, createAndAppendDiv, qutils, JSONModel, Parameters, CustomData, coreLibrary, library, Device, App, Page, Button, Bar, List, DisplayListItem, StandardListItem, InputListItem, CustomListItem, ActionListItem, Input, KeyCodes) {
	"use strict";
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#content {" +
		"	height: 100%;" +
		"}" +
		"#mSAPUI5SupportMessage {" +
		"	display: none !important;" +
		"}";
	document.head.appendChild(styleElement);


	var IMAGE_PATH = "test-resources/sap/m/images/";

	var app = new App("myApp");
	//alert((app.isLandscape() ? "Landscape" : "Portrait"));

	/*
	// ================================================================================
	// create application pages for the different lists
	// ================================================================================
	*/
	var listOverview = new Page("listOverview", {
		title : "List Overview",
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var detailPage = new Page("detailPage", {
		title : "Detail Page",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		}
	});

	// ================================================================================

	var standardListThumb = new Page("standardListThumb", {
		title : "Standard List Thumb",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var standardListIcon = new Page("standardListIcon", {
		title : "Standard List Icon",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var standardListTitle = new Page("standardListTitle", {
		title : "Standard List Title",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var standardListNoImage = new Page("standardListNoImage", {
		title : "Standard List no Image",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		}
	});

	var displayList = new Page("displayList", {
		title : "Display list",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var inputList = new Page("inputList", {
		title : "Input List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var customList = new Page("customList", {
		title : "Custom List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var groupedList = new Page("groupedList", {
		title : "Grouped List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var groupedNoHeaderList = new Page("groupedNoHeaderList", {
		title : "Grouped List without Header/Footer",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	var selectionList = new Page("selectionList", {
		title : "Selection List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [
				new Button({
					text : "Embedded",
					press : switchStyle
				}),
				new Button({
					text : "None",
					press : switchModeNone
				}),
				new Button({
					text : "Single",
					press : switchModeSingle
				}),
				new Button({
					text : "Multi",
					press : switchModeMulti
				}),
				new Button({
					text : "Delete",
					press : switchModeDelete
				})
			]
		})
	});

	var invisibleList = new Page("invisibleList", {
		title : "Invisible List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		}
	});

	var noDataList = new Page("noDataList", {
		title : "No Data List",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer : new Bar({
			contentMiddle : [
				new Button({
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
					text : "Multi",
					press : function() {switchModeMulti(oListNoData); }
				}),
				new Button({
					text : "Delete",
					press : function() {switchModeDelete(oListNoData); }
				})
			]
		})
	});

	var swipeContentList;
	var swipeDirection;
	var swipeContentPage = new Page("swipeContentPage", {
		title : "Swipe Content Test",
		content : [swipeContentList = new List({
			inset : true,
			swipeContent : new Button({
				text : "Disapprove",
				type : "Reject",
				press : function(e) {
				}
			}),
			swipe : function(e) {
				var li = e.getParameter("listItem");
				li.setLabel(li.getLabel() + " " + new Date().toLocaleTimeString());
				swipeDirection = e.getParameter("swipeDirection");
				Core.applyChanges();
			},
			items : [new DisplayListItem({
				label : "Test",
				value : "Swipe Value"
			})]
		})]
	});

	/*
	// ================================================================================
	// create application sample for the data binding
	// ================================================================================
	*/
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
			title : "Standard List Title",
			type : "Navigation",
			press : 'standardListTitle'
		}, {
			title : "Standard List no Image",
			type : "Navigation",
			press : 'standardListNoImage'
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
		},{
			title : "No Data List",
			type : "Navigation",
			press : 'noDataList'
		} ]
	};

	var dataNavigation = {
			navigation : [ {
				title : "Travel Expend",
				description : "Access the travel expend workflow",
				icon : IMAGE_PATH + "travel_expend.png",
				activeIcon: IMAGE_PATH + "travel_expend_grey.png",
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
				icon : IMAGE_PATH + "travel_expense_report.png",
				activeIcon: IMAGE_PATH + "travel_expense_report_grey.png",
				iconInset : false,
				type : "Navigation",
				unread: true,
				counter: 456,
				selected: false,
				info: "Warning message",
				infoState: "Warning",
				press : 'detailPage'
			}, {
				title : "Travel Request",
				description : "Access the travel request workflow",
				icon : IMAGE_PATH + "travel_request.png",
				activeIcon: IMAGE_PATH + "travel_request_grey.png",
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
				icon : IMAGE_PATH + "wounds_doc.png",
				activeIcon: IMAGE_PATH + "wounds_doc_grey.png",
				iconInset : false,
				type : "Navigation",
				unread: true,
				counter: 999999999,
				selected: false,
				info: "Info message",
				press : 'detailPage'
			}, {
				title : "Travel Settings",
				description : "Change your travel worflow settings",
				icon : IMAGE_PATH + "settings.png",
				activeIcon: IMAGE_PATH + "settings_grey.png",
				iconInset : false,
				type : "Navigation",
				unread: true,
				counter: 4711,
				selected: false,
				press : 'detailPage'
			} ]
		};

	var dataDetail = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : IMAGE_PATH + "travel_expend.png",
			iconInset : false,
			type : "Detail",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			icon : IMAGE_PATH + "travel_expense_report.png",
			iconInset : false,
			type : "Detail",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			icon : IMAGE_PATH + "travel_request.png",
			iconInset : false,
			type : "Detail",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			icon : IMAGE_PATH + "wounds_doc.png",
			iconInset : false,
			type : "Detail",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel worflow settings",
			icon : IMAGE_PATH + "settings.png",
			iconInset : false,
			type : "Detail",
			press : 'detailPage'
		} ]
	};


	/*
	// ================================================================================
	// create templates for the different lists (visible content of each list)
	// ================================================================================
	*/
	var oItemTemplateOverview = new StandardListItem({
		title : "{title}",
		type : "{type}",
		press : handlePress
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
		press : handlePress
	});

	var oItemTemplateStandardIcon = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	var oItemTemplateStandardTitle = new StandardListItem({
		title : "{title}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	var oItemTemplateStandardNoImage = new StandardListItem({
		title : "{title}",
		description : "{description}",
		type : "{type}",
		press : handlePress
	});

	var oItemTemplateDisplay = new DisplayListItem({
		label : "{title}",
		value : "{description}"
	});

	var oItemTemplateInput = new InputListItem({
		label : "{title}",
		content : new Input({
			type : "Number",
			placeholder : "Number"
		})
	});

	var oItemTemplateCustom = new CustomListItem({
		content : new Button({
			text : "{title}",
			width : "100%",
			icon : "./images/action.png",
			type : library.ButtonType.Reject
		})
	});

	var oItemTemplateSelection = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	var oItemTemplateInvisible = new StandardListItem({
		title : "{title}",
		description : "{description}",
		type : "{type}",
		press : handlePress
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
				id : "sapMList002",
				inset : false,
				showUnread: true,
				'delete': deleteItem,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardIcon = new List(
			{
				id : "sapMList003",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardTitle = new List(
			{
				id : "sapMList004",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardNoImage = new List(
			{
				id : "sapMList005",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListDisplay = new List(
			{
				id : "sapMList006",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListInput = new List(
			{
				id : "sapMList007",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListCustom = new List(
			{
				id : "sapMList008",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	var oListStandardThumbNoHeader = new List({
		id : "sapMList002a",
		inset : false
	});

	var oListStandardIconNoHeader = new List({
		id : "sapMList003a",
		inset : false
	});

	var oListStandardTitleNoHeader = new List({
		id : "sapMList004a",
		inset : false
	});

	var oListStandardNoImageNoHeader = new List({
		id : "sapMList005a",
		inset : false
	});

	var oListDisplayNoHeader = new List({
		id : "sapMList006a",
		inset : false
	});

	var oListInputNoHeader = new List({
		id : "sapMList007a",
		inset : false
	});

	var oListCustomNoHeader = new List({
		id : "sapMList008a",
		inset : false
	});

	var oListSelection = new List({
		id : "sapMList009",
		inset : false,
		headerText : "Travel",
		footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services.",
		mode : library.ListMode.SingleSelect
	});

	var oListInvisible = new List({
		visible: false,
		id : "sapMList010",
		inset : false,
		headerText : "Travel",
		footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
	});

	var oListNoData = new List({
		id : "sapMList011",
		inset : false,
		showNoData: true,
		noDataText: "Forgot something???",
		'delete': deleteItem,
		headerText : "Travel [No Data List]",
		footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
	});

	/*
	// ================================================================================
	// bind data to the different lists
	// ================================================================================
	*/
	bindListData(dataOverview, oItemTemplateOverview, oListOverview);

	bindListData(dataNavigation, oItemTemplateStandardThumb, oListStandardThumb);
	bindListData(dataDetail, oItemTemplateStandardIcon, oListStandardIcon);
	bindListData(dataNavigation, oItemTemplateStandardTitle, oListStandardTitle);
	bindListData(dataNavigation, oItemTemplateStandardNoImage, oListStandardNoImage);
	bindListData(dataNavigation, oItemTemplateDisplay, oListDisplay);
	bindListData(dataNavigation, oItemTemplateInput, oListInput);
	bindListData(dataNavigation, oItemTemplateCustom, oListCustom);
	bindListData(dataNavigation, oItemTemplateInvisible, oListInvisible);

	bindListData(dataNavigation, oItemTemplateStandardThumb, oListStandardThumbNoHeader);
	bindListData(dataDetail, oItemTemplateStandardIcon, oListStandardIconNoHeader);
	bindListData(dataNavigation, oItemTemplateStandardTitle, oListStandardTitleNoHeader);
	bindListData(dataNavigation, oItemTemplateStandardNoImage, oListStandardNoImageNoHeader);
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
	var actionListItem = new ActionListItem({id: "actionListItem", text: "Action List Item", press: handlePress});
	actionList.addItem(actionListItem);

	standardListThumb.addContent(actionList);

	standardListIcon.addContent(oListStandardIcon);
	standardListTitle.addContent(oListStandardTitle);
	standardListNoImage.addContent(oListStandardNoImage);
	displayList.addContent(oListDisplay);
	inputList.addContent(oListInput);
	customList.addContent(oListCustom);
	invisibleList.addContent(oListInvisible);
	noDataList.addContent(oListNoData);

	groupedList.addContent(oListStandardThumb.clone());
	groupedList.addContent(oListStandardIcon.clone());
	groupedList.addContent(oListStandardTitle.clone());
	groupedList.addContent(oListStandardNoImage.clone());
	groupedList.addContent(oListDisplay.clone());
	groupedList.addContent(oListInput.clone());

	groupedNoHeaderList.addContent(oListStandardThumbNoHeader);
	groupedNoHeaderList.addContent(oListStandardIconNoHeader);
	groupedNoHeaderList.addContent(oListStandardTitleNoHeader);
	groupedNoHeaderList.addContent(oListStandardNoImageNoHeader);
	groupedNoHeaderList.addContent(oListDisplayNoHeader);
	groupedNoHeaderList.addContent(oListInputNoHeader);

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

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	function handlePress(e) {
		app.to(this.data("xyz"), "show");
	}

	function deleteItem(oEvent) {
		var model = oEvent.mParameters.listItem.getModel();

		var deleteId = model.getProperty("", oEvent.mParameters.listItem.getBindingContext());
		var data = model.getData().navigation;
		jQuery.each(data,function(iIndex, oEntry){

			if (oEntry == deleteId) {
			data.splice(iIndex, 1);
			return false;
			}
		});
		model.updateBindings();
	}

	function switchStyle() {
		var listArray = jQuery(".sapMList").control();
		var inset = !listArray[listArray.length - 1].getInset();
		for ( var i = 0; i < listArray.length; i++) {
			listArray[i].setInset(inset);
		}
		app.getCurrentPage()._refreshIScroll();
	}


	/*
	// ================================================================================
	// selection list: setter/getter functions - toggle between true and false
	// ================================================================================
	*/
	function setSelectionItem1() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[0].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[0].setSelected( (!aItems[0].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem2() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[1].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[1].setSelected( (!aItems[1].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem3() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[2].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[2].setSelected( (!aItems[2].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem4() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[3].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[3].setSelected( (!aItems[3].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem5() {
		var aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[4].setSelected( (!aItems[4].getModeControl().getSelected()) );
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[4].setSelected( (!aItems[4].getModeControl().getSelected()) );
		}
	}

	function checkSingleSelectionItem1() {
		var aItems = oListSelection.getItems();
		return aItems[0].getModeControl().getSelected();
	}

	function checkSingleSelectionItem2() {
		var aItems = oListSelection.getItems();
		return aItems[1].getModeControl().getSelected();
	}

	function checkSingleSelectionItem3() {
		var aItems = oListSelection.getItems();
		return aItems[2].getModeControl().getSelected();
	}

	function checkSingleSelectionItem4() {
		var aItems = oListSelection.getItems();
		return aItems[3].getModeControl().getSelected();
	}

	function checkSingleSelectionItem5() {
		var aItems = oListSelection.getItems();
		return aItems[4].getModeControl().getSelected();
	}

	function checkMultiSelectionItem1() {
		var aItems = oListSelection.getItems();
		return aItems[0].getModeControl().getSelected();
	}

	function checkMultiSelectionItem2() {
		var aItems = oListSelection.getItems();
		return aItems[1].getModeControl().getSelected();
	}

	function checkMultiSelectionItem3() {
		var aItems = oListSelection.getItems();
		return aItems[2].getModeControl().getSelected();
	}

	function checkMultiSelectionItem4() {
		var aItems = oListSelection.getItems();
		return aItems[3].getModeControl().getSelected();
	}

	function checkMultiSelectionItem5() {
		var aItems = oListSelection.getItems();
		return aItems[4].getModeControl().getSelected();
	}

	function removeSelection() {
		oListSelection.removeSelections();
	}


	/*
	// ================================================================================
	// selection list: functions to switch list selection mode
	// ================================================================================
	*/
	function switchModeNone() {
		oListSelection.setHeaderText("Travel [List-Mode: None]");
		oListSelection.setMode(library.ListMode.None);
	}

	function switchModeSingle() {
		oListSelection.setHeaderText("Travel [List-Mode: Single]");
		oListSelection.setMode(library.ListMode.SingleSelect);
	}

	function switchModeSingleLeft() {
		oListSelection.setHeaderText("Travel [List-Mode: SingleLeft]");
		oListSelection.setMode(library.ListMode.SingleSelectLeft);
	}

	function switchModeMulti() {
		oListSelection.setHeaderText("Travel [List-Mode: Multi]");
		oListSelection.setMode(library.ListMode.MultiSelect);
	}

	function switchModeDelete() {
		oListSelection.setHeaderText("Travel [List-Mode: Delete]");
		oListSelection.setMode(library.ListMode.Delete);
	}


	// ================================================================================

	app.addPage(listOverview).addPage(detailPage).addPage(standardListThumb).addPage(standardListIcon).addPage(standardListTitle).addPage(standardListNoImage)
			.addPage(displayList).addPage(inputList).addPage(customList).addPage(groupedList).addPage(groupedNoHeaderList)
			.addPage(selectionList).addPage(invisibleList).addPage(noDataList).addPage(swipeContentPage);
	app.setInitialPage("listOverview");
	app.placeAt("content");
	Core.applyChanges();


	/*
	// ================================================================================
	// qunit checks
	// ================================================================================
	*/
	QUnit.module("Initial Check");

	QUnit.test("Overview rendered", function(assert) {
		assert.ok(jQuery.sap.domById("sapMList001-listUl"), "Overview should be rendered");
		assert.ok(jQuery.sap.domById("sapMList001-listUl").childNodes[0], "Overview ListItem should be rendered");
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 1 to detail page", function(assert) {
		var done = assert.async();
		app.to("standardListThumb", "show");
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(jQuery.sap.domById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[0].getId();
		var oListItem = Core.byId(listItemId);
		var oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[0];
		oListItem.ontap(oEvent);
		setTimeout(function(){
			Core.applyChanges();
			assert.ok(jQuery.sap.domById("detailPage"), "detailPage should be rendered)");
			done();
		},50);
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 2 to detail page", function(assert) {
		var done = assert.async();
		app.back();
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(jQuery.sap.domById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[1].getId();
		var oListItem = Core.byId(listItemId);
		var oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[1];
		oListItem.ontap(oEvent);
		setTimeout(function(){
			Core.applyChanges();
			assert.ok(jQuery.sap.domById("detailPage"), "detailPage should be rendered)");
			done();
		},50);
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 3 to detail page", function(assert) {
		var done = assert.async();
		app.back();
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(jQuery.sap.domById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[2].getId();
		var oListItem = Core.byId(listItemId);
		var oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[2];
		oListItem.ontap(oEvent);
		setTimeout(function(){
			Core.applyChanges();
			assert.ok(jQuery.sap.domById("detailPage"), "detailPage should be rendered)");
			done();
		},50);
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 4 to detail page", function(assert) {
		var done = assert.async();
		app.back();
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(jQuery.sap.domById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[3].getId();
		var oListItem = Core.byId(listItemId);
		var oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[3];
		oListItem.ontap(oEvent);
		setTimeout(function(){
			Core.applyChanges();
			assert.ok(jQuery.sap.domById("detailPage"), "detailPage should be rendered)");
			done();
		},50);
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 5 to detail page", function(assert) {
		var done = assert.async();
		app.back();
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(jQuery.sap.domById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[4].getId();
		var oListItem = Core.byId(listItemId);
		var oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[4];
		oListItem.ontap(oEvent);
		setTimeout(function(){
			Core.applyChanges();
			assert.ok(jQuery.sap.domById("detailPage"), "detailPage should be rendered)");
			done();
		},50);
	});

	QUnit.test("standardListThumb rendered - unread indicatior, counter, info should be rendered", function(assert) {
		app.back();
		Core.applyChanges();
		var aItems = oListStandardThumb.getItems();
		var listItemId = aItems[0].getId();

		var _bShowUnreadBubble = (Parameters.get("sapUiLIUnreadAsBubble") == "true");
		if (_bShowUnreadBubble) {
			assert.ok(jQuery.sap.domById(listItemId + "-unread"), "standardListThumb unread indicator should be rendered");
		}
		assert.ok(jQuery.sap.domById(listItemId + "-counter"), "standardListThumb counter should be rendered");
		assert.ok(jQuery.sap.domById(listItemId + "-info"), "standardListThumb info should be rendered");
		assert.ok(jQuery.sap.domById("actionListItem"), "actionListItem should be rendered");
	});

	QUnit.test("standardListIcon rendered", function(assert) {
		app.to("standardListIcon", "show");
		Core.applyChanges();
		assert.ok(jQuery.sap.domById("sapMList003-listUl"), "standardListIcon should be rendered");
		assert.ok(jQuery.sap.domById("sapMList003-listUl").childNodes[0], "standardListIcon ListItem should be rendered");
		app.to("standardListTitle", "show");
		Core.applyChanges();
	});

	QUnit.test("standardListTitle rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList004-listUl"), "standardListTitle should be rendered");
		assert.ok(jQuery.sap.domById("sapMList004-listUl").childNodes[0], "standardListTitle ListItem should be rendered");
		app.to("standardListNoImage", "show");
		Core.applyChanges();
	});

	QUnit.test("standardListNoImage rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList005-listUl"), "standardListNoImage should be rendered");
		assert.ok(jQuery.sap.domById("sapMList005-listUl").childNodes[0], "standardListNoImage ListItem should be rendered");
		app.to("displayList", "show");
		Core.applyChanges();
	});

	QUnit.test("displayList rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList006-listUl"), "displayList should be rendered");
		assert.ok(jQuery.sap.domById("sapMList006-listUl").childNodes[0], "displayList ListItem should be rendered");
		app.to("inputList", "show");
		Core.applyChanges();
	});

	QUnit.test("inputList rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList007-listUl"), "inputList should be rendered");
		assert.ok(jQuery.sap.domById("sapMList007-listUl").childNodes[0], "inputList ListItem should be rendered");
		app.to("customList", "show");
		Core.applyChanges();
	});

	QUnit.test("customList rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList008-listUl"), "customList should be rendered");
		assert.ok(jQuery.sap.domById("sapMList008-listUl").childNodes[0], "customList ListItem should be rendered");
		app.to("invisibleList", "show");
		Core.applyChanges();
	});

	QUnit.test("invisibleList rendered", function(assert) {
		app.back();
		assert.ok(!jQuery.sap.domById("sapMList010-listUl"), "invisibleList should not be rendered");
		app.to("noDataList", "show");
		Core.applyChanges();
	});

	QUnit.test("noDataList rendered", function(assert) {
		app.back();
		assert.ok(jQuery.sap.domById("sapMList011-listUl"), "noDataList should be rendered");
		assert.ok(jQuery.sap.domById("sapMList011-nodata-text").textContent == "Forgot something???", "noDataList custom text should be rendered");
		app.to("selectionList", "show");
		Core.applyChanges();
	});

	if (jQuery.support.touch) {
		QUnit.test("swipe left action", function(assert) {
			var done = assert.async();
			app.back();
			app.to("swipeContentPage", "show");
			Core.applyChanges();

			var li = swipeContentList.getItems()[0],
				event = jQuery.Event("swipeleft", {
					srcControl : li
				});

			swipeContentList.onswipeleft(event);
			assert.equal(swipeDirection, "EndToBegin", "Swipe from the end to the Beginning");

			Core.applyChanges();

			setTimeout(function() {
				var oContainer = jQuery.sap.domById(swipeContentList.getId() + "-swp");
				assert.ok(oContainer instanceof HTMLElement, "Swipe Content is rendered");
				swipeContentList.swipeOut(function(li, swpcnt){
					var oContainer = jQuery.sap.domById(swipeContentList.getId() + "-swp");
					assert.equal(oContainer, null, "Swipe Content is removed");
					swipeContentList.setSwipeContent(swpcnt.setText("Disapprove").setType("Reject"));
					done();
				});
			}, 1000);
		});


		QUnit.test("swipe right action", function(assert) {
			//var done = assert.async();
			app.back();
			app.to("swipeContentPage", "show");
			Core.applyChanges();

			var li = swipeContentList.getItems()[0],
				event = jQuery.Event("swiperight", {
					srcControl : li
				});

			swipeContentList.onswiperight(event);
			assert.equal(swipeDirection, "BeginToEnd", "Swipe from the Beginning to the end");
		});
	}

	QUnit.test("selectionList rendered", function(assert) {
		assert.ok(jQuery.sap.domById("sapMList009"), "selectionList should be rendered");
		assert.ok(jQuery.sap.domById("sapMList009").childNodes[0], "selectionList ListItem should be rendered");
	});

	QUnit.test("selectionList singleSelection Item 1", function(assert) {
		setSelectionItem1();
		assert.equal(checkSingleSelectionItem1(), true, "SingleSelection: Item 1 should be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelection: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelection: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelection: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelection: Item 5 should not be selected");
	});

	QUnit.test("selectionList singleSelection Item 2", function(assert) {
		setSelectionItem2();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelection: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), true, "SingleSelection: Item 2 should be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelection: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelection: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelection: Item 5 should not be selected");
	});

	QUnit.test("selectionList singleSelection Item 3", function(assert) {
		setSelectionItem3();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelection: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelection: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), true, "SingleSelection: Item 3 should be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelection: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelection: Item 5 should not be selected");
	});

	QUnit.test("selectionList singleSelection Item 4", function(assert) {
		setSelectionItem4();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelection: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelection: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelection: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), true, "SingleSelection: Item 4 should be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelection: Item 5 should not be selected");
	});

	QUnit.test("selectionList singleSelection Item 5", function(assert) {
		setSelectionItem5();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelection: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelection: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelection: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelection: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), true, "SingleSelection: Item 5 should be selected");
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 1", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId1);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), true, "SingleSelection: Item 1 should be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");

			done();
		}, 0);
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 2", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId2);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), true, "SingleSelection: Item 2 should be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 3", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId3);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), true, "SingleSelection: Item 3 should be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 4", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId4);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), true, "SingleSelection: Item 4 should be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 5", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId5);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), true, "SingleSelection: Item 5 should be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList switch to SingleSelectionLeft", function(assert) {
		switchModeSingleLeft();
		assert.equal(oListSelection.getMode(), library.ListMode.SingleSelectLeft, "Switch to SingleSelectionLeft: Ok");
		Core.applyChanges();

	});

	QUnit.test("selectionList SingleSelectionLeft Item 1", function(assert) {
		setSelectionItem1();
		assert.equal(checkSingleSelectionItem1(), true, "SingleSelectionLeft: Item 1 should be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelectionLeft: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelectionLeft: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelectionLeft: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelectionLeft: Item 5 should not be selected");
	});

	QUnit.test("selectionList SingleSelectionLeft Item 2", function(assert) {
		setSelectionItem2();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelectionLeft: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), true, "SingleSelectionLeft: Item 2 should be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelectionLeft: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelectionLeft: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelectionLeft: Item 5 should not be selected");
	});

	QUnit.test("selectionList SingleSelectionLeft Item 3", function(assert) {
		setSelectionItem3();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelectionLeft: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelectionLeft: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), true, "SingleSelectionLeft: Item 3 should be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelectionLeft: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelectionLeft: Item 5 should not be selected");
	});

	QUnit.test("selectionList SingleSelectionLeft Item 4", function(assert) {
		setSelectionItem4();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelectionLeft: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelectionLeft: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelectionLeft: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), true, "SingleSelectionLeft: Item 4 should be selected");
		assert.equal(checkSingleSelectionItem5(), false, "SingleSelectionLeft: Item 5 should not be selected");
	});

	QUnit.test("selectionList SingleSelectionLeft Item 5", function(assert) {
		setSelectionItem5();
		assert.equal(checkSingleSelectionItem1(), false, "SingleSelectionLeft: Item 1 should not be selected");
		assert.equal(checkSingleSelectionItem2(), false, "SingleSelectionLeft: Item 2 should not be selected");
		assert.equal(checkSingleSelectionItem3(), false, "SingleSelectionLeft: Item 3 should not be selected");
		assert.equal(checkSingleSelectionItem4(), false, "SingleSelectionLeft: Item 4 should not be selected");
		assert.equal(checkSingleSelectionItem5(), true, "SingleSelectionLeft: Item 5 should be selected");
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 1", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId1);

		setTimeout(function() {
			assert.equal(Core.byId(radioButtonId1).getSelected(), true, "SingleSelectionLeft: Item 1 should be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");

			done();
		}, 0);
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 2", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId2);
		setTimeout(function() {

			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), true, "SingleSelectionLeft: Item 2 should be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 3", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId3);
		setTimeout(function() {

			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), true, "SingleSelectionLeft: Item 3 should be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 4", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId4);
		setTimeout(function() {

			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), true, "SingleSelectionLeft: Item 4 should be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 5", function(assert) {
		var done = assert.async();
		var aItems = oListSelection.getItems();
		var radioButtonId1 = aItems[0].getModeControl().getId();
		var radioButtonId2 = aItems[1].getModeControl().getId();
		var radioButtonId3 = aItems[2].getModeControl().getId();
		var radioButtonId4 = aItems[3].getModeControl().getId();
		var radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId5);
		setTimeout(function() {

			assert.equal(Core.byId(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
			assert.equal(Core.byId(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
			assert.equal(Core.byId(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
			assert.equal(Core.byId(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
			assert.equal(Core.byId(radioButtonId5).getSelected(), true, "SingleSelectionLeft: Item 5 should be checked");
			done();
		}, 0);
	});

	QUnit.test("selectionList switch to multiSelection", function(assert) {
		switchModeMulti();
		assert.equal(oListSelection.getMode(), library.ListMode.MultiSelect, "Switch to MultiSelection: Ok");
		Core.applyChanges();

	});

	QUnit.test("selectionList multiSelection item check (1,3,5)", function(assert) {
		removeSelection();
		setSelectionItem1();
		setSelectionItem3();
		setSelectionItem5();
		assert.equal(checkMultiSelectionItem1(), true, "MultiSelection: Item 1 should be selected");
		assert.equal(checkMultiSelectionItem2(), false, "MultiSelection: Item 2 should not be selected");
		assert.equal(checkMultiSelectionItem3(), true, "MultiSelection: Item 3 should be selected");
		assert.equal(checkMultiSelectionItem4(), false, "MultiSelection: Item 4 should not be selected");
		assert.equal(checkMultiSelectionItem5(), true, "MultiSelection: Item 5 should be selected");
	});

	QUnit.test("selectionList multiSelection: remove all selections", function(assert) {
		removeSelection();
		assert.equal(checkMultiSelectionItem1(), false, "MultiSelection: Item 1 should not be selected");
		assert.equal(checkMultiSelectionItem2(), false, "MultiSelection: Item 2 should not be selected");
		assert.equal(checkMultiSelectionItem3(), false, "MultiSelection: Item 3 should not be selected");
		assert.equal(checkMultiSelectionItem4(), false, "MultiSelection: Item 4 should not be selected");
		assert.equal(checkMultiSelectionItem5(), false, "MultiSelection: Item 5 should not be selected");
	});

	QUnit.test("selectionList multiSelection item check (2,4)", function(assert) {
		setSelectionItem2();
		setSelectionItem4();
		assert.equal(checkMultiSelectionItem1(), false, "MultiSelection: Item 1 should not be selected");
		assert.equal(checkMultiSelectionItem2(), true, "MultiSelection: Item 2 should be selected");
		assert.equal(checkMultiSelectionItem3(), false, "MultiSelection: Item 3 should not be selected");
		assert.equal(checkMultiSelectionItem4(), true, "MultiSelection: Item 4 should be selected");
		assert.equal(checkMultiSelectionItem5(), false, "MultiSelection: Item 5 should be selected");
	});

	QUnit.test("selectionList multiSelection item check by tap event (1,3,5)", function(assert) {
		var aItems = oListSelection.getItems();
		var checkBoxId1 = aItems[0].getModeControl().getId();
		var checkBoxId2 = aItems[1].getModeControl().getId();
		var checkBoxId3 = aItems[2].getModeControl().getId();
		var checkBoxId4 = aItems[3].getModeControl().getId();
		var checkBoxId5 = aItems[4].getModeControl().getId();
		//qutils.triggerEvent("tap", checkBoxId1);
		//qutils.triggerEvent("tap", checkBoxId3);
		//qutils.triggerEvent("tap", checkBoxId5);
		var oCheckbox1 = Core.byId(checkBoxId1);
		var oCheckbox3 = Core.byId(checkBoxId3);
		var oCheckbox5 = Core.byId(checkBoxId5);
		oCheckbox1.ontap(new jQuery.Event());
		oCheckbox3.ontap(new jQuery.Event());
		oCheckbox5.ontap(new jQuery.Event());
		assert.equal(Core.byId(checkBoxId1).getSelected(), true, "MultiSelection: Item 1 should be checked");
		assert.equal(Core.byId(checkBoxId2).getSelected(), true, "MultiSelection: Item 2 should be checked");
		assert.equal(Core.byId(checkBoxId3).getSelected(), true, "MultiSelection: Item 3 should be checked");
		assert.equal(Core.byId(checkBoxId4).getSelected(), true, "MultiSelection: Item 4 should be checked");
		assert.equal(Core.byId(checkBoxId5).getSelected(), true, "MultiSelection: Item 5 should be checked");
	});


	QUnit.test("selectionList switch to delete", function(assert) {
		switchModeDelete();
		assert.equal(oListSelection.getMode(), library.ListMode.Delete, "Switch to Delete: Ok");
	});


	QUnit.module("Properties", {
		beforeEach: function() {
			sinon.config.useFakeTimers = true;
		},
		afterEach: function() {
			sinon.config.useFakeTimers = false;
		}
	});


	QUnit.test("StandardListItem activeIcon", function(assert) {

		var sIcon = "sap-icon://up";
		var sActiveIcon = "sap-icon://down";
		var oStdLI = new StandardListItem({
			title : "Title",
			icon : sIcon,
			activeIcon: sActiveIcon,
			type : library.ListType.Active
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();
		var oIcon = oStdLI.$().find(".sapUiIcon").control(0);

		function createEvent(sEventName, oTarget, oParams) {
			var oEvent = jQuery.Event(sEventName);
			oEvent.originalEvent = {};
			oEvent.target = oTarget;
			if (oParams) {
				for (var x in oParams) {
					oEvent[x] = oParams[x];
					oEvent.originalEvent[x] = oParams[x];
				}
			}
			return oEvent;
		}

		var oTouchStart = createEvent("touchstart", oStdLI.getDomRef(), {
			srcControl : oStdLI,
			touches : [{
				clientX: 0,
				clientY: 0
			}],
			targetTouches : [{
				clientX: 0,
				clientY: 0
			}]
		});
		oStdLI.ontouchstart(oTouchStart);

		assert.strictEqual(oIcon.getSrc(), sIcon, "Icon has correct path before active handling.");

		// wait active feedback
		this.clock.tick(300);

		assert.strictEqual(oIcon.getSrc(), sActiveIcon, "Active icon has correct path during active handling");
		var oTouchEnd = createEvent("touchend", oStdLI.getDomRef(), {
			srcControl : oStdLI,
			targetTouches : [{
				clientX: 0,
				clientY: 0
			}]
		});
		oStdLI.ontouchend(oTouchEnd);

		assert.strictEqual(oIcon.getSrc(), sActiveIcon, "Active icon is changed with the previous state after active handling");
	});

	QUnit.module("StandartListItem RTL attributes");

	QUnit.test("setter / getter titleTextDirection", function(assert) {
		var oStdLI = new StandardListItem({
			title : "123 456"
		});
		var oList = new List({
			items : [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		oStdLI.setTitleTextDirection(coreLibrary.TextDirection.RTL);
		// Assert
		assert.equal(oStdLI.getTitleTextDirection(), coreLibrary.TextDirection.RTL, "Input value is " + coreLibrary.TextDirection.RTL);

		// Clean up
		oList.destroy();
	});

	QUnit.test("setter / getter infoTextDirection", function(assert) {
		var oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 123 456"
		});
		var oList = new List({
			items : [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		oStdLI.setInfoTextDirection(coreLibrary.TextDirection.RTL);
		// Assert
		assert.equal(oStdLI.getInfoTextDirection(), coreLibrary.TextDirection.RTL, "Input value is " + coreLibrary.TextDirection.RTL);

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem titleTextDirection", function(assert) {
		var oStdLI = new StandardListItem({
			title : "123 456",
			titleTextDirection: coreLibrary.TextDirection.LTR
			});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var oTitle = oStdLI.$().find(".sapMSLITitleOnly");
		// Assert
		assert.equal(oTitle.attr("dir"), 'ltr', "Title has attribute dir equal to ltr");

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem infoTextDirection", function(assert) {
		var oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var oInfo = oStdLI.$().find(".sapMSLIInfo");
		// Assert
		assert.equal(oInfo.attr("dir"), 'ltr', "Info has attribute dir equal to ltr");

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem wrapping behavior (Desktop)", function(assert) {
		this.clock = sinon.useFakeTimers();
		var oStdLI = new StandardListItem({
			title: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			wrapping: true
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var oRb = Core.getLibraryResourceBundle("sap.m"),
			fnToggleExpandCollapse = sinon.spy(oStdLI, "_toggleExpandCollapse");

		// varialbles for title elements
		var $titleText = oStdLI.getDomRef("titleText"),
			$titleThreeDots = oStdLI.getDomRef("titleThreeDots"),
			$titleButton = oStdLI.getDomRef("titleButton");

		// variables for description elements
		var $descText = oStdLI.getDomRef("descriptionText"),
			$descThreeDots = oStdLI.getDomRef("descriptionThreeDots"),
			$descButton = oStdLI.getDomRef("descriptionButton");

		// title text test
		assert.ok(oStdLI.$().hasClass("sapMSLIWrapping"), "Wrapping style class added");
		assert.ok($titleText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided title text");
		assert.equal($titleText.innerText.length, 300, "Desktop limit for collapsed text in wrapping behavior is set correctly to 300 characters");
		// safari browser returns the inner text without spaces, hence trim()
		assert.equal($titleThreeDots.innerText.trim(), "...", "three dots are rendered");
		assert.equal($titleButton.innerText, oRb.getText("TEXT_SHOW_MORE"), "button rendered with the correct text");

		// desciption text test
		assert.ok($descText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided description text");
		assert.equal($descText.innerText.length, 300, "Desktop limit for collapsed text in wrapping behavior is set correctly to 300 characters");
		// safari browser returns the inner text without spaces, hence trim()
		assert.equal($descThreeDots.innerText.trim(), "...", "three dots are rendered");
		assert.equal($descButton.innerText, oRb.getText("TEXT_SHOW_MORE"), "button rendered with the correct text");

		// trigger tap on tilte text
		jQuery($titleButton).trigger("tap");
		Core.applyChanges();
		assert.ok(fnToggleExpandCollapse.calledOnce, "_toggleExpandCollapse function called");
		$titleText = oStdLI.getDomRef("titleText");
		$titleThreeDots = oStdLI.getDomRef("titleThreeDots");
		$titleButton = oStdLI.getDomRef("titleButton");
		assert.equal($titleText.innerText.length, oStdLI.getTitle().length, "Full title text visible");
		assert.equal($titleThreeDots.innerText, " ", "space rendered");
		assert.equal($titleButton.innerText, oRb.getText("TEXT_SHOW_LESS"), "button rendered with the correct text");

		//trigger onsapspace on description text
		$descButton.focus();
		qutils.triggerKeyboardEvent($descButton.getAttribute("id"), KeyCodes.SPACE);
		this.clock.tick(50);

		Core.applyChanges();
		assert.ok(fnToggleExpandCollapse.calledTwice, "_toggleExpandCollapse function called");
		$descText = oStdLI.getDomRef("descriptionText");
		$descThreeDots = oStdLI.getDomRef("descriptionThreeDots");
		$descButton = oStdLI.getDomRef("descriptionButton");
		assert.equal($descText.innerText.length, oStdLI.getDescription().length, "Full desciption text visible");
		assert.equal($descThreeDots.innerText, " ", "space rendered");
		assert.equal($descButton.innerText, oRb.getText("TEXT_SHOW_LESS"), "button rendered with the correct text");

		oList.destroy();
	});

	QUnit.test("Info text - full text displayed when string lenght <= 15", function(assert) {
		// test with title text only
		var oStdLI = new StandardListItem({
			title: "This is the Title Text", // title text length > 18
			info: "X".repeat(15) // info text is 15 characters
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var oInfoTextDom = oStdLI.getDomRef("info");
		assert.ok(oInfoTextDom.classList.contains("sapMSLIInfoTextFull"), "Info Text is fully displayed as text is 15 characters lenght");

		oStdLI.setInfo("A very very long information text"); // info text is greater than 15
		Core.applyChanges();

		oInfoTextDom = oStdLI.getDomRef("info");
		assert.notOk(oInfoTextDom.classList.contains("sapMSLIInfoTextFull"), "Info Text is trucated as text is more than 15 characters in length");
		assert.ok(oInfoTextDom.classList.contains("sapMSLIInfoTextMinWidth"), "Min width reserved to show long info text");

		// test with description text
		oStdLI.setDescription("This is the description text");
		oStdLI.setInfo("X".repeat(15)); // info text is 15 characters
		Core.applyChanges();

		oInfoTextDom = oStdLI.getDomRef("info");
		assert.ok(oInfoTextDom.classList.contains("sapMSLIInfoTextFull"), "Info Text is fully displayed as text is 15 characters lenght");

		oStdLI.setInfo("Information text"); // info text is greater than 15
		Core.applyChanges();

		oInfoTextDom = oStdLI.getDomRef("info");
		assert.notOk(oInfoTextDom.classList.contains("sapMSLIInfoTextFull"), "Info Text is trucated as text is more than 15 characters in length");

		oList.destroy();
	});

	QUnit.test("StandardListItem inverted info text", function(assert) {
		var oStdLI = new StandardListItem({
			title: "This is the Title Text", // title text length > 18
			info: "Success" // info text is 15 characters
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var oInfoTextDom = oStdLI.getDomRef("info");
		assert.notOk(oStdLI.getInfoStateInverted(), "default value of infoStateInverted=false");
		assert.notOk(oInfoTextDom.classList.contains("sapMSLIInfoStateInverted"), "Style class for inverted info text not added");

		oStdLI.setInfoStateInverted(true);
		Core.applyChanges();

		assert.ok(oStdLI.getInfoStateInverted(), "infoStateInverted=true");
		oInfoTextDom = oStdLI.getDomRef("info");
		assert.ok(oInfoTextDom.classList.contains("sapMSLIInfoStateInverted"), "Style class for inverted info text added");

		oList.destroy();
	});

	QUnit.test("StandardListItem wrapping behavior (Phone)", function(assert) {
		this.stub(Device.system, "phone", true);

		var oStdLI = new StandardListItem({
			title: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			wrapping: true
		});

		var oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		var $titleText = oStdLI.getDomRef("titleText");

		assert.ok($titleText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided title text");
		assert.equal($titleText.innerText.length, 100, "Desktop limit for collapsed text in wrapping behavior is set correctly to 100 characters");

		oList.destroy();
	});

	QUnit.module("ListItemBase");

	QUnit.test("ListItemBase RenderOulineClass", function(assert) {
		var oMsieStub = this.stub(Device, "browser", {"msie": true});
		this.stub(Device.system, "desktop", true);

		// SUT
		var sut1 = new StandardListItem(),
			sut2 = new StandardListItem(),
			list = new List({
				items : sut1
			});

		list.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.ok(sut1.$().hasClass("sapMLIBFocusable"), "Outline class is added");
		assert.ok(sut1.$().hasClass("sapMLIBLegacyOutline"), "Legacy outline class is added");

		// Act
		oMsieStub.restore();
		this.stub(Device, "browser", {"msie": false });
		list.addItem(sut2);
		Core.applyChanges();

		// Assert
		assert.ok(sut2.$().hasClass("sapMLIBFocusable"), "Outline class is added");
		assert.ok(!sut2.$().hasClass("sapMLIBLegacyOutline"), "Legacy outline class is not added");

		//Cleanup
		list.destroy();
	});

});