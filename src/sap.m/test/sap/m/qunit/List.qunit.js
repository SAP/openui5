/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
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
	"sap/m/Avatar",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/List",
	"sap/m/DisplayListItem",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/CustomListItem",
	"sap/m/ActionListItem",
	"sap/m/Input",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/m/ListItemBase",
	"sap/base/Log",
	"sap/ui/model/Sorter",
	"sap/ui/core/date/UI5Date"
], function(Library, jQuery, nextUIUpdate, createAndAppendDiv, qutils, JSONModel, Parameters, CustomData, coreLibrary, library, Device, App, Page, Avatar, Button, Bar, List, DisplayListItem, StandardListItem, InputListItem, CustomListItem, ActionListItem, Input, Text, KeyCodes, Control, Element, ListItemBase, Log, Sorter, UI5Date) {
	"use strict";
	createAndAppendDiv("content").style.height = "100%";

	const IMAGE_PATH = "test-resources/sap/m/images/";

	// app
	const app = new App("myApp");

	//alert((app.isLandscape() ? "Landscape" : "Portrait"));

	/*
	// ================================================================================
	// create application pages for the different lists
	// ================================================================================
	*/
	const listOverview = new Page("listOverview", {
		title : "List Overview",
		footer : new Bar({
			contentMiddle : [ new Button({
				text : "Embedded",
				press : switchStyle
			}) ]
		})
	});

	const detailPage = new Page("detailPage", {
		title : "Detail Page",
		showNavButton : true,
		navButtonPress : function() {
			app.back();
		}
	});

	// ================================================================================

	const standardListThumb = new Page("standardListThumb", {
		title : "Standard List Thumb",
		showNavButton : true,
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

	const standardListIcon = new Page("standardListIcon", {
		title : "Standard List Icon",
		showNavButton : true,
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

	const standardListTitle = new Page("standardListTitle", {
		title : "Standard List Title",
		showNavButton : true,
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

	const standardListNoImage = new Page("standardListNoImage", {
		title : "Standard List no Image",
		showNavButton : true,
		navButtonPress : function() {
			app.back();
		}
	});

	const displayList = new Page("displayList", {
		title : "Display list",
		showNavButton : true,
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

	const inputList = new Page("inputList", {
		title : "Input List",
		showNavButton : true,
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

	const customList = new Page("customList", {
		title : "Custom List",
		showNavButton : true,
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

	const groupedList = new Page("groupedList", {
		title : "Grouped List",
		showNavButton : true,
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

	const groupedNoHeaderList = new Page("groupedNoHeaderList", {
		title : "Grouped List without Header/Footer",
		showNavButton : true,
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

	const selectionList = new Page("selectionList", {
		title : "Selection List",
		showNavButton : true,
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

	const invisibleList = new Page("invisibleList", {
		title : "Invisible List",
		showNavButton : true,
		navButtonPress : function() {
			app.back();
		}
	});

	const noDataList = new Page("noDataList", {
		title : "No Data List",
		showNavButton : true,
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

	let swipeContentList;
	let swipeDirection;
	const swipeContentPage = new Page("swipeContentPage", {
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
				const li = e.getParameter("listItem");
				li.setLabel(li.getLabel() + " " + UI5Date.getInstance().toLocaleTimeString());
				swipeDirection = e.getParameter("swipeDirection");
			},
			items : [new DisplayListItem({
				label : "Test",
				value : "Swipe Value"
			})]
		})]
	});

	const backgroundDesignPage = new Page("backgroundDesignPage", {
			title : "List Test Page",
			showNavButton : true,
			navButtonPress : function() {
				app.back();
			}
		});

	/*
	// ================================================================================
	// create application sample for the data binding
	// ================================================================================
	*/
	// JSON sample data

	const dataOverview = {
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

	const dataNavigation = {
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

	const dataDetail = {
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
	const oItemTemplateOverview = new StandardListItem({
		title : "{title}",
		type : "{type}",
		press : handlePress
	});

	const oItemTemplateStandardThumb = new StandardListItem({
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

	const oItemTemplateStandardIcon = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	const oItemTemplateStandardTitle = new StandardListItem({
		title : "{title}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	const oItemTemplateStandardNoImage = new StandardListItem({
		title : "{title}",
		description : "{description}",
		type : "{type}",
		press : handlePress
	});

	const oItemTemplateDisplay = new DisplayListItem({
		label : "{title}",
		value : "{description}"
	});

	const oItemTemplateInput = new InputListItem({
		label : "{title}",
		content : new Input({
			type : "Number",
			placeholder : "Number"
		})
	});

	const oItemTemplateCustom = new CustomListItem({
		content : new Button({
			text : "{title}",
			width : "100%",
			icon : "./images/action.png",
			type : library.ButtonType.Reject
		})
	});

	const oItemTemplateSelection = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		type : "{type}",
		press : handlePress
	});

	const oItemTemplateInvisible = new StandardListItem({
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
	const oListOverview = new List({
		id : "sapMList001",
		inset : false,
		headerText : "List Overview",
		footerText : "These are just some list examples and this won't show all possible combinations."
	});

	const oListStandardThumb = new List(
			{
				id : "sapMList002",
				inset : false,
				showUnread: true,
				'delete': deleteItem,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListStandardIcon = new List(
			{
				id : "sapMList003",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListStandardTitle = new List(
			{
				id : "sapMList004",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListStandardNoImage = new List(
			{
				id : "sapMList005",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListDisplay = new List(
			{
				id : "sapMList006",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListInput = new List(
			{
				id : "sapMList007",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListCustom = new List(
			{
				id : "sapMList008",
				inset : false,
				headerText : "Travel",
				footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
			});

	const oListStandardThumbNoHeader = new List({
		id : "sapMList002a",
		inset : false
	});

	const oListStandardIconNoHeader = new List({
		id : "sapMList003a",
		inset : false
	});

	const oListStandardTitleNoHeader = new List({
		id : "sapMList004a",
		inset : false
	});

	const oListStandardNoImageNoHeader = new List({
		id : "sapMList005a",
		inset : false
	});

	const oListDisplayNoHeader = new List({
		id : "sapMList006a",
		inset : false
	});

	const oListInputNoHeader = new List({
		id : "sapMList007a",
		inset : false
	});

	const oListCustomNoHeader = new List({
		id : "sapMList008a",
		inset : false
	});

	const oListSelection = new List({
		id : "sapMList009",
		inset : false,
		headerText : "Travel",
		footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services.",
		mode : library.ListMode.SingleSelect
	});

	const oListInvisible = new List({
		visible: false,
		id : "sapMList010",
		inset : false,
		headerText : "Travel",
		footerText : "We strongly advise you to keep your luggage with you at all times. Any unattended luggage in the terminal will be removed by the security services."
	});

	const oListNoData = new List({
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

	const actionList = new List();
	const actionListItem = new ActionListItem({id: "actionListItem", text: "Action List Item", press: handlePress});
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
		const oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// create a CustomData template, set its key to "answer" and bind its value to the answer data
		const oDataTemplate = new CustomData({
			key : "xyz"
		});
		oDataTemplate.bindProperty("value", "press");

		// add the CustomData template to the item template
		itemTemplate.addCustomData(oDataTemplate);

		// bind Aggregation
		list.bindAggregation("items", {
			path: "/navigation",
			template: itemTemplate,
			templateShareable: true // sample template is used in list w/ and w/o header
		});
	}

	function handlePress(e) {
		app.to(this.data("xyz"), "show");
	}

	function deleteItem(oEvent) {
		const model = oEvent.mParameters.listItem.getModel();

		const deleteId = model.getProperty("", oEvent.mParameters.listItem.getBindingContext());
		const data = model.getData().navigation;
		jQuery.each(data,function(iIndex, oEntry){

			if (oEntry == deleteId) {
			data.splice(iIndex, 1);
			return false;
			}
		});
		model.updateBindings();
	}

	function switchStyle() {
		const listArray = Array.from(document.querySelectorAll(".sapMList"), function(oElement) {
			return Element.closestTo(oElement);
		});
		const inset = !listArray[listArray.length - 1].getInset();
		for (let i = 0; i < listArray.length; i++) {
			listArray[i].setInset(inset);
		}
		app.getCurrentPage()._refreshIScroll();
	}

	function timeout(iDuration) {
		return new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}


	/*
	// ================================================================================
	// selection list: setter/getter functions - toggle between true and false
	// ================================================================================
	*/
	function setSelectionItem1() {
		const aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[0].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[0].setSelected( (!aItems[0].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem2() {
		const aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[1].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[1].setSelected( (!aItems[1].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem3() {
		const aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[2].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[2].setSelected( (!aItems[2].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem4() {
		const aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[3].setSelected(true);
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[3].setSelected( (!aItems[3].getModeControl().getSelected()) );
		}
	}

	function setSelectionItem5() {
		const aItems = oListSelection.getItems();
		if (oListSelection.getMode() == library.ListMode.SingleSelect || oListSelection.getMode() == library.ListMode.SingleSelectLeft) {
			aItems[4].setSelected( (!aItems[4].getModeControl().getSelected()) );
		}
		if (oListSelection.getMode() == library.ListMode.MultiSelect){
			aItems[4].setSelected( (!aItems[4].getModeControl().getSelected()) );
		}
	}

	function checkSingleSelectionItem1() {
		const aItems = oListSelection.getItems();
		return aItems[0].getModeControl().getSelected();
	}

	function checkSingleSelectionItem2() {
		const aItems = oListSelection.getItems();
		return aItems[1].getModeControl().getSelected();
	}

	function checkSingleSelectionItem3() {
		const aItems = oListSelection.getItems();
		return aItems[2].getModeControl().getSelected();
	}

	function checkSingleSelectionItem4() {
		const aItems = oListSelection.getItems();
		return aItems[3].getModeControl().getSelected();
	}

	function checkSingleSelectionItem5() {
		const aItems = oListSelection.getItems();
		return aItems[4].getModeControl().getSelected();
	}

	function checkMultiSelectionItem1() {
		const aItems = oListSelection.getItems();
		return aItems[0].getModeControl().getSelected();
	}

	function checkMultiSelectionItem2() {
		const aItems = oListSelection.getItems();
		return aItems[1].getModeControl().getSelected();
	}

	function checkMultiSelectionItem3() {
		const aItems = oListSelection.getItems();
		return aItems[2].getModeControl().getSelected();
	}

	function checkMultiSelectionItem4() {
		const aItems = oListSelection.getItems();
		return aItems[3].getModeControl().getSelected();
	}

	function checkMultiSelectionItem5() {
		const aItems = oListSelection.getItems();
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
			.addPage(selectionList).addPage(invisibleList).addPage(noDataList).addPage(swipeContentPage).addPage(backgroundDesignPage);
	app.setInitialPage("listOverview");
	app.placeAt("content");

	/*
	// ================================================================================
	// qunit checks
	// ================================================================================
	*/
	QUnit.module("Initial Check");

	QUnit.test("Overview rendered", function(assert) {
		assert.ok(document.getElementById("sapMList001-listUl"), "Overview should be rendered");
		assert.ok(document.getElementById("sapMList001-listUl").childNodes[0], "Overview ListItem should be rendered");
	});

	QUnit.test("StandardListItem wrappedItem more button-onTouchStart", async function(assert) {
		const oStdLI = new StandardListItem({
			id: "sdf",
			title : "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
			wrapping: true,
			wrapCharLimit: 10
		});

		oStdLI.setType("Navigation");
		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		function createEvent(sEventName, oTarget, oParams) {
			const oEvent = jQuery.Event(sEventName);
			oEvent.originalEvent = {};
			oEvent.target = oTarget;
			if (oParams) {
				for (const x in oParams) {
					oEvent[x] = oParams[x];
					oEvent.originalEvent[x] = oParams[x];
				}
			}
			return oEvent;
		}

		const oTouchStartSpy = sinon.spy(oStdLI, "ontouchstart");
		const oTouchStart = createEvent("touchstart", document.getElementById(oStdLI.getId() + "-titleButton"), {
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
		await nextUIUpdate();

		assert.ok(oTouchStartSpy.calledWithExactly(oTouchStart), "Called Once");
		assert.notOk(oStdLI.$().hasClass("sapMLIBActive"));
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 1 to detail page", async function(assert) {
		app.to("standardListThumb", "show");
		await nextUIUpdate();

		assert.ok(document.getElementById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(document.getElementById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[0].getId();
		const oListItem = Element.getElementById(listItemId);
		const oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[0];
		oListItem.ontap(oEvent);

		await timeout(50);
		await nextUIUpdate();

		assert.ok(document.getElementById("detailPage"), "detailPage should be rendered)");
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 2 to detail page", async function(assert) {
		app.back();
		await nextUIUpdate();

		assert.ok(document.getElementById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(document.getElementById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[1].getId();
		const oListItem = Element.getElementById(listItemId);
		const oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[1];
		oListItem.ontap(oEvent);

		await timeout(50);
		await nextUIUpdate();

		assert.ok(document.getElementById("detailPage"), "detailPage should be rendered)");
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 3 to detail page", async function(assert) {
		app.back();
		await nextUIUpdate();

		assert.ok(document.getElementById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(document.getElementById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[2].getId();
		const oListItem = Element.getElementById(listItemId);
		const oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[2];
		oListItem.ontap(oEvent);

		await timeout(50);
		await nextUIUpdate();

		assert.ok(document.getElementById("detailPage"), "detailPage should be rendered)");
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 4 to detail page", async function(assert) {
		app.back();
		await nextUIUpdate();

		assert.ok(document.getElementById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(document.getElementById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[3].getId();
		const oListItem = Element.getElementById(listItemId);
		const oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[3];
		oListItem.ontap(oEvent);

		await timeout(50);
		await nextUIUpdate();

		assert.ok(document.getElementById("detailPage"), "detailPage should be rendered)");
	});

	QUnit.test("standardListThumb rendered - navigate from listitem no 5 to detail page", async function(assert) {
		app.back();
		await nextUIUpdate();

		assert.ok(document.getElementById("sapMList002-listUl"), "standardListThumb should be rendered");
		assert.ok(document.getElementById("sapMList002-listUl").childNodes[0], "standardListThumb ListItem should be rendered");
		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[4].getId();
		const oListItem = Element.getElementById(listItemId);
		const oEvent = new jQuery.Event();
		oEvent.srcControl = aItems[4];
		oListItem.ontap(oEvent);

		await timeout(50);
		await nextUIUpdate();

		assert.ok(document.getElementById("detailPage"), "detailPage should be rendered)");
	});

	QUnit.test("standardListThumb rendered - unread indicator, counter, info should be rendered", async function(assert) {
		app.back();
		await nextUIUpdate();

		const aItems = oListStandardThumb.getItems();
		const listItemId = aItems[0].getId();

		const _bShowUnreadBubble = (Parameters.get({name: "sapUiLIUnreadAsBubble"}) == "true");
		if (_bShowUnreadBubble) {
			assert.ok(document.getElementById(listItemId + "-unread"), "standardListThumb unread indicator should be rendered");
		}
		assert.ok(document.getElementById(listItemId + "-counter"), "standardListThumb counter should be rendered");
		assert.ok(document.getElementById(listItemId + "-info"), "standardListThumb info should be rendered");
		assert.ok(document.getElementById("actionListItem"), "actionListItem should be rendered");
	});

	QUnit.test("standardListIcon rendered", async function(assert) {
		app.to("standardListIcon", "show");
		await nextUIUpdate();
		assert.ok(document.getElementById("sapMList003-listUl"), "standardListIcon should be rendered");
		assert.ok(document.getElementById("sapMList003-listUl").childNodes[0], "standardListIcon ListItem should be rendered");
		app.to("standardListTitle", "show");
		await nextUIUpdate();
	});

	QUnit.test("standardListTitle rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList004-listUl"), "standardListTitle should be rendered");
		assert.ok(document.getElementById("sapMList004-listUl").childNodes[0], "standardListTitle ListItem should be rendered");
		app.to("standardListNoImage", "show");
		await nextUIUpdate();
	});

	QUnit.test("standardListNoImage rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList005-listUl"), "standardListNoImage should be rendered");
		assert.ok(document.getElementById("sapMList005-listUl").childNodes[0], "standardListNoImage ListItem should be rendered");
		app.to("displayList", "show");
		await nextUIUpdate();
	});

	QUnit.test("displayList rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList006-listUl"), "displayList should be rendered");
		assert.ok(document.getElementById("sapMList006-listUl").childNodes[0], "displayList ListItem should be rendered");
		app.to("inputList", "show");
		await nextUIUpdate();
	});

	QUnit.test("inputList rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList007-listUl"), "inputList should be rendered");
		assert.ok(document.getElementById("sapMList007-listUl").childNodes[0], "inputList ListItem should be rendered");
		app.to("customList", "show");
		await nextUIUpdate();
	});

	QUnit.test("customList rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList008-listUl"), "customList should be rendered");
		assert.ok(document.getElementById("sapMList008-listUl").childNodes[0], "customList ListItem should be rendered");
		app.to("invisibleList", "show");
		await nextUIUpdate();
	});

	QUnit.test("invisibleList rendered", async function(assert) {
		app.back();
		assert.ok(!document.getElementById("sapMList010-listUl"), "invisibleList should not be rendered");
		app.to("noDataList", "show");
		await nextUIUpdate();
	});

	QUnit.test("noDataList rendered", async function(assert) {
		app.back();
		assert.ok(document.getElementById("sapMList011-listUl"), "noDataList should be rendered");
		assert.ok(document.getElementById("sapMList011-nodata-text").textContent == "Forgot something???", "noDataList custom text should be rendered");
		assert.ok(jQuery("#sapMList011-nodata").attr("role") == "listitem", "ARIA role of No Data Entry");
		app.to("selectionList", "show");
		await nextUIUpdate();
	});

	if (jQuery.support.touch) {
		QUnit.test("swipe left action", async function(assert) {
			const done = assert.async();
			app.back();
			app.to("swipeContentPage", "show");
			await nextUIUpdate();

			const li = swipeContentList.getItems()[0],
				event = jQuery.Event("swipeleft", {
					srcControl : li
				});

			swipeContentList.onswipeleft(event);
			assert.equal(swipeDirection, "EndToBegin", "Swipe from the end to the Beginning");

			await nextUIUpdate();
			await timeout(1000);

			const oContainer = swipeContentList.getDomRef("swp");
			assert.ok(oContainer instanceof HTMLElement, "Swipe Content is rendered");
			swipeContentList.swipeOut(function(li, swpcnt){
				const oContainer = swipeContentList.getDomRef("swp");
				assert.equal(oContainer, null, "Swipe Content is removed");
				swipeContentList.setSwipeContent(swpcnt.setText("Disapprove").setType("Reject"));
				done();
			});
		});


		QUnit.test("swipe right action", async function(assert) {
			app.back();
			app.to("swipeContentPage", "show");
			await nextUIUpdate();

			const li = swipeContentList.getItems()[0],
				event = jQuery.Event("swiperight", {
					srcControl : li
				});

			swipeContentList.onswiperight(event);
			assert.equal(swipeDirection, "BeginToEnd", "Swipe from the Beginning to the end");
		});
	}

	QUnit.test("selectionList rendered", function(assert) {
		assert.ok(document.getElementById("sapMList009"), "selectionList should be rendered");
		assert.ok(document.getElementById("sapMList009").childNodes[0], "selectionList ListItem should be rendered");
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

	QUnit.test("selectionList singleSelection item check by tap event on Item 1", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId1);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), true, "SingleSelection: Item 1 should be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 2", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId2);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), true, "SingleSelection: Item 2 should be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 3", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId3);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), true, "SingleSelection: Item 3 should be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 4", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId4);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), true, "SingleSelection: Item 4 should be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelection: Item 5 should not be checked");
	});

	QUnit.test("selectionList singleSelection item check by tap event on Item 5", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId5);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelection: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelection: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelection: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelection: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), true, "SingleSelection: Item 5 should be checked");
	});

	QUnit.test("selectionList switch to SingleSelectionLeft", function(assert) {
		switchModeSingleLeft();
		assert.equal(oListSelection.getMode(), library.ListMode.SingleSelectLeft, "Switch to SingleSelectionLeft: Ok");
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

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 1", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId1);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), true, "SingleSelectionLeft: Item 1 should be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 2", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId2);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), true, "SingleSelectionLeft: Item 2 should be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 3", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId3);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), true, "SingleSelectionLeft: Item 3 should be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 4", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId4);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), true, "SingleSelectionLeft: Item 4 should be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), false, "SingleSelectionLeft: Item 5 should not be checked");
	});

	QUnit.test("selectionList SingleSelectionLeft item check by tap event on Item 5", async function(assert) {
		const aItems = oListSelection.getItems();
		const radioButtonId1 = aItems[0].getModeControl().getId();
		const radioButtonId2 = aItems[1].getModeControl().getId();
		const radioButtonId3 = aItems[2].getModeControl().getId();
		const radioButtonId4 = aItems[3].getModeControl().getId();
		const radioButtonId5 = aItems[4].getModeControl().getId();
		qutils.triggerEvent("tap", radioButtonId5);

		await timeout();

		assert.equal(Element.getElementById(radioButtonId1).getSelected(), false, "SingleSelectionLeft: Item 1 should not be checked");
		assert.equal(Element.getElementById(radioButtonId2).getSelected(), false, "SingleSelectionLeft: Item 2 should not be checked");
		assert.equal(Element.getElementById(radioButtonId3).getSelected(), false, "SingleSelectionLeft: Item 3 should not be checked");
		assert.equal(Element.getElementById(radioButtonId4).getSelected(), false, "SingleSelectionLeft: Item 4 should not be checked");
		assert.equal(Element.getElementById(radioButtonId5).getSelected(), true, "SingleSelectionLeft: Item 5 should be checked");
	});

	QUnit.test("selectionList switch to multiSelection", async function(assert) {
		switchModeMulti();
		assert.equal(oListSelection.getMode(), library.ListMode.MultiSelect, "Switch to MultiSelection: Ok");
		await nextUIUpdate();
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
		const aItems = oListSelection.getItems();
		const checkBoxId1 = aItems[0].getModeControl().getId();
		const checkBoxId2 = aItems[1].getModeControl().getId();
		const checkBoxId3 = aItems[2].getModeControl().getId();
		const checkBoxId4 = aItems[3].getModeControl().getId();
		const checkBoxId5 = aItems[4].getModeControl().getId();

		const oCheckbox1 = Element.getElementById(checkBoxId1);
		const oCheckbox3 = Element.getElementById(checkBoxId3);
		const oCheckbox5 = Element.getElementById(checkBoxId5);
		oCheckbox1.ontap(new jQuery.Event());
		oCheckbox3.ontap(new jQuery.Event());
		oCheckbox5.ontap(new jQuery.Event());
		assert.equal(Element.getElementById(checkBoxId1).getSelected(), true, "MultiSelection: Item 1 should be checked");
		assert.equal(Element.getElementById(checkBoxId2).getSelected(), true, "MultiSelection: Item 2 should be checked");
		assert.equal(Element.getElementById(checkBoxId3).getSelected(), true, "MultiSelection: Item 3 should be checked");
		assert.equal(Element.getElementById(checkBoxId4).getSelected(), true, "MultiSelection: Item 4 should be checked");
		assert.equal(Element.getElementById(checkBoxId5).getSelected(), true, "MultiSelection: Item 5 should be checked");
	});


	QUnit.test("selectionList switch to delete", function(assert) {
		switchModeDelete();
		assert.equal(oListSelection.getMode(), library.ListMode.Delete, "Switch to Delete: Ok");
	});


	QUnit.module("Properties");

	QUnit.test("StandardListItem activeIcon", async function(assert) {

		const sIcon = "sap-icon://up";
		const sActiveIcon = "sap-icon://down";
		const oStdLI = new StandardListItem({
			title : "Title",
			icon : sIcon,
			activeIcon: sActiveIcon,
			type : library.ListType.Active
		});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oIcon = Element.closestTo(oStdLI.$().find(".sapUiIcon")[0]);

		function createEvent(sEventName, oTarget, oParams) {
			const oEvent = jQuery.Event(sEventName);
			oEvent.originalEvent = {};
			oEvent.target = oTarget;
			if (oParams) {
				for (const x in oParams) {
					oEvent[x] = oParams[x];
					oEvent.originalEvent[x] = oParams[x];
				}
			}
			return oEvent;
		}

		const oTouchStart = createEvent("touchstart", oStdLI.getDomRef(), {
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

		await timeout(300);

		assert.strictEqual(oIcon.getSrc(), sActiveIcon, "Active icon has correct path during active handling");
		const oTouchEnd = createEvent("touchend", oStdLI.getDomRef(), {
			srcControl : oStdLI,
			targetTouches : [{
				clientX: 0,
				clientY: 0
			}]
		});
		oStdLI.ontouchend(oTouchEnd);

		assert.strictEqual(oIcon.getSrc(), sActiveIcon, "Active icon is changed with the previous state after active handling");
	});

	QUnit.test("setBackgroundDesign", async function(assert) {
		const oListItem = new StandardListItem({
				title : "Title",
				description: "Description"
			}),
			oList = new List({
				backgroundDesign: library.BackgroundDesign.Solid,
				items: [oListItem]
			});

		// add item to page & render
		backgroundDesignPage.addContent(oList);

		app.back();
		app.to("backgroundDesignPage", "show");
		await nextUIUpdate();

		let $list = oList.$();
		const oRenderSpy = this.spy(oList.getRenderer(), "render");

		// call method & do tests
		assert.strictEqual(oList.getBackgroundDesign(), library.BackgroundDesign.Solid, 'The property "backgroundDesign" is "Solid" on ' + oList);
		assert.ok($list.hasClass("sapMListBGSolid"), 'The HTML div container for the list has class "sapMListBGSolid" on ' + oList);
		assert.ok(!$list.hasClass("sapMListBGTransparent"), 'The HTML div container for the list does not have class "sapMListBGTransparent" on ' + oList);
		assert.ok(!$list.hasClass("sapMListBGTranslucent"), 'The HTML div container for the list does not have class "sapMListBGTranslucent" on ' + oList);

		assert.strictEqual(oList.setBackgroundDesign(library.BackgroundDesign.Transparent).getBackgroundDesign(), library.BackgroundDesign.Transparent, 'The property "backgroundDesign" is "Transparent" on ' + oList);
		await nextUIUpdate();
		$list = oList.$();
		assert.ok(!$list.hasClass("sapMListBGSolid"), 'The HTML div container for the list does not have class "sapMListBGSolid" on ' + oList);
		assert.ok($list.hasClass("sapMListBGTransparent"), 'The HTML div container for the list has class "sapMListBGTransparent" on ' + oList);
		assert.ok(!$list.hasClass("sapMListBGTranslucent"), 'The HTML div container for the list does not have class "sapMListBGTranslucent" on ' + oList);

		assert.strictEqual(oList.setBackgroundDesign(library.BackgroundDesign.Translucent).getBackgroundDesign(), library.BackgroundDesign.Translucent, 'The property "backgroundDesign" is "Translucent" on ' + oList);
		await nextUIUpdate();
		$list = oList.$();
		assert.ok(!$list.hasClass("sapMListBGSolid"), 'The HTML div container for the list does not have class "sapMListBGSolid" on ' + oList);
		assert.ok(!$list.hasClass("sapMListBGTransparent"), 'The HTML div container for the list does not have class "sapMListBGTransparent" on ' + oList);
		assert.ok($list.hasClass("sapMListBGTranslucent"), 'The HTML div container for the list has class "sapMListBGTranslucent" on ' + oList);

		assert.throws(function () {
			oList.setBackgroundDesign("DoesNotExist");
		}, "Throws a type exception");
		assert.strictEqual(oList.getBackgroundDesign(), library.BackgroundDesign.Translucent, 'The property "backgroundDesign" is still "sap.m.BackgroundDesign.Translucent" after setting mode "DoesNotExist" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setBackgroundDesign(), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 2, "The list should be rerendered in this method");

		// cleanup
		backgroundDesignPage.removeAllContent();
		oRenderSpy.restore();
		oList.destroy();
	});

	QUnit.module("StandartListItem RTL attributes");

	QUnit.test("setter / getter titleTextDirection", async function(assert) {
		const oStdLI = new StandardListItem({
			title : "123 456"
		});
		const oList = new List({
			items : [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oStdLI.setTitleTextDirection(coreLibrary.TextDirection.RTL);
		// Assert
		assert.equal(oStdLI.getTitleTextDirection(), coreLibrary.TextDirection.RTL, "Input value is " + coreLibrary.TextDirection.RTL);

		// Clean up
		oList.destroy();
	});

	QUnit.test("setter / getter infoTextDirection", async function(assert) {
		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 123 456"
		});
		const oList = new List({
			items : [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oStdLI.setInfoTextDirection(coreLibrary.TextDirection.RTL);
		// Assert
		assert.equal(oStdLI.getInfoTextDirection(), coreLibrary.TextDirection.RTL, "Input value is " + coreLibrary.TextDirection.RTL);

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem titleTextDirection", async function(assert) {
		const oStdLI = new StandardListItem({
			title : "123 456",
			titleTextDirection: coreLibrary.TextDirection.LTR
			});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oTitle = oStdLI.$().find(".sapMSLITitleOnly");
		// Assert
		assert.equal(oTitle.attr("dir"), 'ltr', "Title has attribute dir equal to ltr");

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem infoTextDirection", async function(assert) {
		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oInfo = oStdLI.$().find(".sapMSLIInfo");
		// Assert
		assert.equal(oInfo.attr("dir"), 'ltr', "Info has attribute dir equal to ltr");

		// Clean up
		oList.destroy();
	});

	QUnit.test("StandardListItem wrapping behavior (Desktop)", async function(assert) {
		const oStdLI = new StandardListItem({
			title: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			info: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			wrapping: true
		});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRb = Library.getResourceBundleFor("sap.m"),
			fnToggleExpandCollapse = sinon.spy(oStdLI, "_toggleExpandCollapse");

		// variables for title elements
		let $titleText = oStdLI.getDomRef("titleText"),
			$titleThreeDots = oStdLI.getDomRef("titleThreeDots"),
			$titleButton = oStdLI.getDomRef("titleButton");

		// variables for description elements
		let $descText = oStdLI.getDomRef("descriptionText"),
			$descThreeDots = oStdLI.getDomRef("descriptionThreeDots"),
			$descButton = oStdLI.getDomRef("descriptionButton");

		// variables for description elements
		const $infoText = oStdLI.getDomRef("infoText");

		// title text test
		assert.ok(oStdLI.$().hasClass("sapMSLIWrapping"), "Wrapping style class added");
		assert.ok($titleText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided title text");
		assert.equal($titleText.innerText.length, 300, "Desktop limit for collapsed text in wrapping behavior is set correctly to 300 characters");

		sinon.spy(Log, "error");
		oStdLI.setWrapCharLimit(150);
		await nextUIUpdate();
		assert.equal(oStdLI._getWrapCharLimit(), 150, "WrapCharLimit is configured to 150 characters");
		assert.equal($titleText.innerText.length, 150, "Desktop limit for collapsed text in wrapping behavior is configured to 150 characters");

		oStdLI.setWrapCharLimit(-1);
		await nextUIUpdate();
		assert.equal(Log.error.callCount, 1, "Error was logged");

		oStdLI.setWrapCharLimit(0);
		await nextUIUpdate();
		assert.equal(oStdLI._getWrapCharLimit(), 300, "WrapCharLimit is configured to Default Limit");
		assert.equal($titleText.innerText.length, 300, "wrapping character limit is set to default value when the property is set to 0");

		oStdLI.setWrapCharLimit(10);
		await nextUIUpdate();
		oStdLI.setWrapCharLimit();
		await nextUIUpdate();
		assert.equal($titleText.innerText.length, 300, "wrapping character limit is set to default value when the property is undefined");

		// safari browser returns the inner text without spaces, hence trim()
		assert.equal($titleThreeDots.innerText.trim(), "...", "three dots are rendered");
		assert.equal($titleButton.innerText, oRb.getText("EXPANDABLE_TEXT_SHOW_MORE"), "button rendered with the correct text");

		// desciption text test
		assert.ok($descText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided description text");
		assert.equal($descText.innerText.length, 300, "Desktop limit for collapsed text in wrapping behavior is set correctly to 300 characters");
		// safari browser returns the inner text without spaces, hence trim()
		assert.equal($descThreeDots.innerText.trim(), "...", "three dots are rendered");
		assert.equal($descButton.innerText, oRb.getText("EXPANDABLE_TEXT_SHOW_MORE"), "button rendered with the correct text");

		// info text test
		assert.strictEqual($infoText.innerText.length, oStdLI.getInfo().length, "The entire infoText is rendered by wrapping");

		// trigger tap on tilte text
		jQuery($titleButton).trigger("tap");
		await nextUIUpdate();
		assert.ok(fnToggleExpandCollapse.calledOnce, "_toggleExpandCollapse function called");
		$titleText = oStdLI.getDomRef("titleText");
		$titleThreeDots = oStdLI.getDomRef("titleThreeDots");
		$titleButton = oStdLI.getDomRef("titleButton");
		assert.equal($titleText.innerText.length, oStdLI.getTitle().length, "Full title text visible");
		assert.equal($titleThreeDots.innerText, " ", "space rendered");
		assert.equal($titleButton.innerText, oRb.getText("EXPANDABLE_TEXT_SHOW_LESS"), "button rendered with the correct text");

		//trigger onsapspace on description text
		$descButton.focus();
		qutils.triggerKeydown($descButton.getAttribute("id"), KeyCodes.SPACE);

		await nextUIUpdate();
		assert.ok(fnToggleExpandCollapse.calledTwice, "_toggleExpandCollapse function called");
		$descText = oStdLI.getDomRef("descriptionText");
		$descThreeDots = oStdLI.getDomRef("descriptionThreeDots");
		$descButton = oStdLI.getDomRef("descriptionButton");
		assert.equal($descText.innerText.length, oStdLI.getDescription().length, "Full desciption text visible");
		assert.equal($descThreeDots.innerText, " ", "space rendered");
		assert.equal($descButton.innerText, oRb.getText("EXPANDABLE_TEXT_SHOW_LESS"), "button rendered with the correct text");

		oList.destroy();
	});

	QUnit.test("StandardListItem infoText min-width test", async function(assert) {
		const oStdLI = new StandardListItem({
			title: "This is the Title Text",
			info: "Success"
		});

		const oStdLI2 = new StandardListItem({
			title: "This is the Title Text",
			info: "This is a very very very long information text"
		});

		const oList = new List({
			items : [oStdLI, oStdLI2]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(parseFloat(oStdLI.getDomRef("info").style.minWidth) < 7.5, "calculated info text width set as min-width");
		assert.strictEqual(oStdLI2.getDomRef("info").style.minWidth, "7.5rem", "7.5rem min-width applied as the info text is long");

		oList.destroy();
	});

	QUnit.test("StandardListItem - test onThemeChanged", async function(assert) {
		const oStdLI = new StandardListItem({
			title: "This is the Title Text",
			info: "Success",
			infoState: "Success",
			infoStateInverted: true
		});

		const oList = new List({
			items : [oStdLI]
		});

		assert.notOk(oStdLI._initialRender, "item is not rendered yet");
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oEvent = new jQuery.Event();
		oEvent.theme = "sap_fiori_3";
		oStdLI.onThemeChanged(oEvent);
		await nextUIUpdate();
		assert.ok(oStdLI._initialRender, "prevent info text calculation on initial rendering as this is done by the renderer");

		const fnMeasureInfoTextWidth = sinon.spy(oStdLI, "_measureInfoTextWidth");
		oEvent.theme = "sap_belize";
		oStdLI.onThemeChanged(oEvent);
		await nextUIUpdate();
		assert.ok(fnMeasureInfoTextWidth.calledWith(true), "info text width is recalculated onThemeChanged");

		oList.destroy();
	});

	QUnit.test("StandardListItem inverted info text", async function(assert) {
		const oStdLI = new StandardListItem({
			title: "This is the Title Text",
			info: "Success"
		});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		let oInfoTextDom = oStdLI.getDomRef("info");
		assert.notOk(oStdLI.getInfoStateInverted(), "default value of infoStateInverted=false");
		assert.notOk(oInfoTextDom.classList.contains("sapMSLIInfoStateInverted"), "Style class for inverted info text not added");

		oStdLI.setInfoStateInverted(true);
		await nextUIUpdate();

		assert.ok(oStdLI.getInfoStateInverted(), "infoStateInverted=true");
		oInfoTextDom = oStdLI.getDomRef("info");
		assert.ok(oInfoTextDom.classList.contains("sapMSLIInfoStateInverted"), "Style class for inverted info text added");

		oList.destroy();
	});

	QUnit.test("StandardListItem wrapping behavior (Phone)", async function(assert) {
		this.stub(Device.system, "phone").value(true);

		const oStdLI = new StandardListItem({
			title: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, seddiamnonumyeirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
			wrapping: true
		});

		const oList = new List({
			items : [oStdLI]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const $titleText = oStdLI.getDomRef("titleText");

		assert.ok($titleText.innerText.length < oStdLI.getTitle().length, "Collapsed text is rendered which has less characters than the provided title text");
		assert.equal($titleText.innerText.length, 100, "Desktop limit for collapsed text in wrapping behavior is set correctly to 100 characters");

		oList.destroy();
	});

	QUnit.test("StandardListItem Avatar Rendering and size)", async function(assert) {

		const oAvatar1 = new Avatar({
			id: "sliavatar1",
			displaySize: "XL",
			imageFitType: "Cover",
			src: IMAGE_PATH + "travel_expend.png"
		});

		const oAvatar2 = new Avatar({
			id: "sliavatar2",
			displaySize: "L",
			imageFitType: "Contain",
			src: IMAGE_PATH + "travel_expend.png"
		});

		const oStdLI1 = new StandardListItem({
			title: "This is the Title Text",
			info: "Success",
			iconInset: false,
			avatar: oAvatar1
		});

		const oStdLI2 = new StandardListItem({
			title: "This is the Title Text",
			info: "Success",
			iconInset: true,
			avatar: oAvatar2
		});

		const oList = new List({
			items : [oStdLI1, oStdLI2]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(document.getElementById("sliavatar1"), "Avatar should be in DOM");
		assert.ok(oStdLI2.getAvatar(), "Avatar should be in the aggregation");
		assert.ok(oStdLI1.getAvatar().getDomRef().classList.contains("sapMSLIAvatar"), "Style class for Avatar added");
		assert.strictEqual(oAvatar1.getDisplaySize(), "S", "Size of the Avatar1 should be S");
		assert.strictEqual(oAvatar2.getDisplaySize(), "XS", "Size of the Avatar2 should be XS");

		// Check the size is not propagated and stays "S" or "XS"
		oAvatar1.setDisplaySize("XL");
		await nextUIUpdate();

		assert.strictEqual(oAvatar1.getDisplaySize(), "S", "Size of the Avatar1 should stay S");

		oStdLI1.setIconInset(true);
		await nextUIUpdate();

		assert.strictEqual(oAvatar1.getDisplaySize(), "XS", "Size of the Avatar1 should be XS now");

		// Set empty avatar
		oStdLI2.setAvatar();
		await nextUIUpdate();

		assert.notOk(oStdLI2.getAvatar(), "Avatar should be removed from the aggregation");
		assert.notOk(document.getElementById("sliavatar2"), "Avatar should be removed from the DOM");

		oList.destroy();
	});

	QUnit.test("StandardListItem wrapping", async function(assert) {
		const oData = {
			names: [
				{firstName: "Peter", lastName: undefined},
				{firstName: "Petra", lastName: "Maier"}
			]
		};
		const oModel = new JSONModel();
		oModel.setData(oData);

		const oList = new List({
			headerText:"Names",
			mode:"MultiSelect"
		});

		oList.bindItems({
			path : "/names",
			template : new StandardListItem({
				wrapping: true,
				title: "{lastName}",
				info: "{firstName}"
			})
		});

		oList.setModel(oModel);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		let oItemDomRef = document.getElementById(oList.getItems()[0].getId() + "-info");
		assert.equal(oList.getItems()[0].getTitle(), "", "title is empty string");
		assert.equal(oList.getItems()[0].getInfo(), "Peter", "info is given");
		assert.ok(oItemDomRef, "info is rendered although title is empty string");

		oItemDomRef = document.getElementById(oList.getItems()[1].getId() + "-info");
		assert.equal(oList.getItems()[1].getTitle(), "Maier", "title is given");
		assert.equal(oList.getItems()[1].getInfo(), "Petra", "info is given");
		assert.ok(oItemDomRef, "info is rendered");

		oList.destroy();
	});

	QUnit.module("ListItemBase");

	QUnit.test("ListItemBase RenderOutlineClass", async function(assert) {
		this.stub(Device.system, "desktop").value(true);

		// SUT
		const sut1 = new StandardListItem(),
			sut2 = new StandardListItem(),
			list = new List({
				items : sut1
			});

		list.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(sut1.$().hasClass("sapMLIBFocusable"), "Outline class is added");

		// Act
		list.addItem(sut2);
		await nextUIUpdate();

		// Assert
		assert.ok(sut2.$().hasClass("sapMLIBFocusable"), "Outline class is added");

		//Cleanup
		list.destroy();
	});

	QUnit.test("ListItemBase - getAccessibilityText", async function(assert) {
		const TestCtr = Control.extend("TestCtr", {
			metadata : {
				properties: {
					"text" : "string"
				}
			},
			renderer : {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div", oControl);
					oRm.openEnd();
					oRm.text(oControl.getText() || "");
					oRm.close("div");
				}
			}
		});

		let oAccInfo = {};
		const fGetAccessibilityInfo = function() {
			return oAccInfo;
		};
		const fGetAccessibilityInfo2 = function() {
			return {description: this.getText()};
		};

		const oCtr1 = new TestCtr(),
			oCtr2 = new TestCtr({text: "UVW"}),
			oCtr3 = new TestCtr({text: "XYZ"}),
			oRb = Library.getResourceBundleFor("sap.m");

		oCtr1.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(ListItemBase.getAccessibilityText(), "", "Empty - no control");

		oCtr1.setVisible(false);
		await nextUIUpdate();

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "", "Empty - invisble");
		assert.equal(ListItemBase.getAccessibilityText(oCtr1, true), oRb.getText("CONTROL_EMPTY"), "Empty - invisble + detect empty");

		oCtr1.setVisible(true);
		await nextUIUpdate();

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "", "Empty - getDefaultAccessibilityInfo");
		assert.equal(ListItemBase.getAccessibilityText(oCtr1, true), oRb.getText("CONTROL_EMPTY"), "Empty - getDefaultAccessibilityInfo + detect empty");

		oCtr1.setText("ABC");
		await nextUIUpdate();

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "ABC", "getDefaultAccessibilityInfo");

		oCtr1.getAccessibilityInfo = fGetAccessibilityInfo;
		oAccInfo = {
			type: "Type"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Type", "Type only");

		oAccInfo = {
			description: "Description"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Description", "Description Only");

		oAccInfo = {
			type: "Type",
			description: "Description"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Type Description", "Type and Description");

		oCtr1.setTooltip("Tooltip");
		await nextUIUpdate();
		oAccInfo = {
			description: "Description"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Tooltip  Description", "Tooltip + Description");

		oAccInfo = {
			type: "Type",
			description: "Description"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Type Description", "Tooltip + Type + Description");

		oAccInfo = {
			description: "Description&Tooltip"
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Description&Tooltip", "Description contains Tooltip");

		oCtr1.setTooltip(null);
		await nextUIUpdate();
		oAccInfo = {
			description: "Description",
			enabled: false
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Description " + oRb.getText("CONTROL_DISABLED"), "Disabled");

		oAccInfo = {
			description: "Description",
			editable: false
		};

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Description " + oRb.getText("CONTROL_READONLY"), "Readonly");

		oAccInfo = {
			description: "Description",
			editable: false,
			children: [oCtr2, oCtr3]
		};
		oCtr2.getAccessibilityInfo = fGetAccessibilityInfo2;
		oCtr3.getAccessibilityInfo = fGetAccessibilityInfo2;

		assert.equal(ListItemBase.getAccessibilityText(oCtr1), "Description " + oRb.getText("CONTROL_READONLY") + " UVW XYZ", "Children");

		oCtr1.destroy();
		oCtr2.destroy();
		oCtr3.destroy();
	});

	QUnit.test("ListItemBase - getAccessibilityDescription", function(assert) {
		const oItem = new ListItemBase(),
			oRb = Library.getResourceBundleFor("sap.m"),
			sContent = "<CONTENT>";
		let aState = [], sGroup = "", bShowUnread = false, bSelectable = true;

		oItem.getContentAnnouncement = function() { return sContent; };
		oItem.getGroupAnnouncement = function() { return sGroup; };
		oItem.getListProperty = function(sPropertyName) {
			if (sPropertyName === "showUnread") {
				return bShowUnread;
			}
			return ListItemBase.prototype.getListProperty.apply(this, arguments);
		};

		oItem.isSelectable = function() { return bSelectable; };

		function check(sDescription) {
			const sAccText = oItem.getAccessibilityDescription(oRb);
			assert.equal(sAccText, aState.join(" . "), sDescription + ": '" + sAccText + "'");
		}

		const oList = new List({
			items: [oItem]
		});

		aState = [sContent, oRb.getText("LIST_ITEM_NOT_SELECTED")];
		check("Content only");

		oItem.setHighlightText("<HIGHLIGHT>");
		check("Content only + HighlightText only");

		oItem.setHighlight("Error");
		aState.splice(0, 0, "<HIGHLIGHT>");
		check("Highlight with Text + Content");

		oItem.setHighlightText(null);
		aState.splice(0, 1, oRb.getText("LIST_ITEM_STATE_ERROR"));
		check("Highlight + Content");

		oItem.setSelected(true);
		aState.pop();
		aState.splice(0, 0, oRb.getText("LIST_ITEM_SELECTED"));
		check("Selected + Highlight + Content");

		oItem.setUnread(true);
		check("Selected + Highlight + Unread (showUnread = false) + Content");

		bShowUnread = true;
		aState.splice(2, 0, oRb.getText("LIST_ITEM_UNREAD"));
		check("Selected + Highlight + Unread (showUnread = true) + Content");

		oItem.setCounter(5);
		aState.splice(3, 0, oRb.getText("LIST_ITEM_COUNTER", 5));
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Content");

		oItem.setType("Active");
		aState.splice(4, 0, oRb.getText("LIST_ITEM_ACTIVE"));
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Type (Active) + Content");

		oItem.setType("Navigation");
		aState.splice(4, 1, oRb.getText("LIST_ITEM_NAVIGATION"));
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Type (Navigation) + Content");

		oItem.setType("Detail");
		aState.splice(4, 1);
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Type (Detail) + Content");

		oItem.setType("DetailAndActive");
		aState.splice(4, 0, oRb.getText("LIST_ITEM_ACTIVE"));
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Type (DetailAndActive) + Content");

		sGroup = "<GROUP>";
		aState.splice(5, 0, sGroup);
		check("Selected + Highlight + Unread (showUnread = true) + Counter + Type (DetailAndActive) + Group + Content");

		//Reset
		oItem.setType("Inactive");
		oItem.setCounter(null);
		oItem.setHighlight("None");
		oItem.setSelected(false);
		oItem.setUnread(false);
		sGroup = "";
		bShowUnread = false;
		aState = [sContent, oRb.getText("LIST_ITEM_NOT_SELECTED")];
		check("Content only");

		oItem.setSelected(true);
		oItem.setTooltip(null);
		aState = [oRb.getText("LIST_ITEM_SELECTED"), sContent];
		check("Enhanced Selection (Item Selectable, Selected): Selection + Content");

		bSelectable = false;
		aState = [sContent];
		check("Enhanced Selection (Item Not Selectable, Selected): Content");

		bSelectable = false;
		aState = [sContent];
		oItem.setSelected(false);
		check("Enhanced Selection (Item Not Selectable, Not Selected): Content");

		bSelectable = true;
		oItem.setSelected(false);
		aState = [sContent, oRb.getText("LIST_ITEM_NOT_SELECTED")];
		check("Enhanced Selection (Item Selectable, Not Selected): Content + Not Selected");

		oList.applyAriaRole("listbox");

		aState = [sContent];
		check("Don't announce the 'not selected' status of legacy list");

		oList.applyAriaRole("list");

		aState = [sContent, oRb.getText("LIST_ITEM_NOT_SELECTED")];
		check("Announce the 'not selected' status");

		oItem.destroy();
	});

	QUnit.module("ARIA role", {
		beforeEach: function() {
			this.oSLI = new StandardListItem();
			this.oSelectedSLI = new StandardListItem();
			this.oCLI = new CustomListItem();
			this.oDLI = new DisplayListItem();
			this.oILI = new InputListItem();
			this.oALI = new ActionListItem();

			this.oList = new List({
				mode: "MultiSelect",
				items: [
					this.oSLI,
					this.oSelectedSLI,
					this.oCLI,
					this.oDLI,
					this.oILI,
					this.oALI
				]
			});
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("getAriaRole", async function(assert) {
		assert.strictEqual(this.oList.getAriaRole(), "list", "'list' is the default role");
		this.oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		// list check
		const oListDomRef = this.oList.getDomRef("listUl");
		assert.strictEqual(oListDomRef.getAttribute("role"), this.oList.getAriaRole(), "role='list' applied in DOM");
		assert.notOk(oListDomRef.hasAttribute("aria-multiselectable"), "aria-multiselectable attribute not added to DOM, since role='list'");

		// StandardListItem check
		const oSLIDomRef = this.oSLI.getDomRef();
		assert.strictEqual(oSLIDomRef.getAttribute("role"), "listitem", "role='listitem' applied to list items");
		assert.strictEqual(oSLIDomRef.getAttribute("aria-posinset"), "1", "correct aria-posinset. Added by default");
		assert.strictEqual(oSLIDomRef.getAttribute("aria-setsize"), "6", "correct aria-setsize. Added by default");
		assert.notOk(oSLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added, since role='listitem'");
		this.oSLI.setSelected(true);
		await nextUIUpdate();
		assert.notOk(oSLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added, since role='listitem'");
		const oSelectedSLIDomRef = this.oSelectedSLI.getDomRef();
		assert.notOk(oSelectedSLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added although the item is selected, since role='listitem'");

		// CustomListItem check
		const oCLIDomRef = this.oCLI.getDomRef();
		assert.strictEqual(oCLIDomRef.getAttribute("role"), "listitem", "role='listitem' applied to list items");
		assert.strictEqual(oCLIDomRef.getAttribute("aria-posinset"), "3", "correct aria-posinset. Added by default");
		assert.strictEqual(oCLIDomRef.getAttribute("aria-setsize"), "6", "correct aria-setsize. Added by default");
		assert.notOk(oCLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added, since role='listitem'");

		// DisplayListItem check
		const oDLIDomRef = this.oDLI.getDomRef();
		assert.strictEqual(oDLIDomRef.getAttribute("role"), "listitem", "role='listitem' applied to list items");
		assert.strictEqual(oDLIDomRef.getAttribute("aria-posinset"), "4", "correct aria-posinset. Added by default");
		assert.strictEqual(oDLIDomRef.getAttribute("aria-setsize"), "6", "correct aria-setsize. Added by default");
		assert.notOk(oDLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added, since role='listitem'");

		// InputListItem check
		const oILIDomRef = this.oILI.getDomRef();
		assert.strictEqual(oILIDomRef.getAttribute("role"), "listitem", "role='listitem' applied to list items");
		assert.strictEqual(oILIDomRef.getAttribute("aria-posinset"), "5", "correct aria-posinset. Added by default");
		assert.strictEqual(oILIDomRef.getAttribute("aria-setsize"), "6", "correct aria-setsize. Added by default");
		assert.notOk(oILIDomRef.hasAttribute("aria-selected"), "aria-selected attribute not added, since role='listitem'");

		// ActionListItem check
		const oALIDomRef = this.oALI.getDomRef();
		assert.strictEqual(oALIDomRef.getAttribute("role"), "listitem", "role='listitem' applied to list items");
		assert.strictEqual(oALIDomRef.getAttribute("aria-posinset"), "6", "correct aria-posinset. Added by default");
		assert.strictEqual(oALIDomRef.getAttribute("aria-setsize"), "6", "correct aria-setsize. Added by default");
	});

	QUnit.test("applyAriaRole", async function(assert) {
		// apply role listbox to the list control
		this.oList.applyAriaRole("listbox");
		this.oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		// list check
		const oListDomRef = this.oList.getDomRef("listUl");
		assert.strictEqual(this.oList.getAriaRole(), "listbox", "'listbox' is the default role");
		assert.strictEqual(oListDomRef.getAttribute("role"), this.oList.getAriaRole(), "role='listbox' applied in DOM");
		assert.ok(oListDomRef.hasAttribute("aria-multiselectable"), "aria-multiselectable attribute added to DOM, since role='listbox'");

		// StandardListItem check
		const oSLIDomRef = this.oSLI.getDomRef();
		assert.strictEqual(oSLIDomRef.getAttribute("role"), "option", "role='option' applied to list items");
		assert.ok(oSLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute added, since role='option'");
		const oSelectedSLIDomRef = this.oSelectedSLI.getDomRef();
		assert.ok(oSelectedSLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute, since role='option'");

		// CustomListItem check
		const oCLIDomRef = this.oCLI.getDomRef();
		assert.strictEqual(oCLIDomRef.getAttribute("role"), "option", "role='option' applied to list items");
		assert.ok(oCLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute added, since role='option'");

		// DisplayListItem check
		const oDLIDomRef = this.oDLI.getDomRef();
		assert.strictEqual(oDLIDomRef.getAttribute("role"), "option", "role='option' applied to list items");
		assert.ok(oDLIDomRef.hasAttribute("aria-selected"), "aria-selected attribute added, since role='option'");

		// InputListItem check
		const oILIDomRef = this.oILI.getDomRef();
		assert.strictEqual(oILIDomRef.getAttribute("role"), "option", "role='option' applied to list items");
		assert.ok(oILIDomRef.hasAttribute("aria-selected"), "aria-selected attribute added, since role='option'");

		// ActionListItem check
		const oALIDomRef = this.oALI.getDomRef();
		assert.strictEqual(oALIDomRef.getAttribute("role"), "option", "role='option' applied to list items");
	});

	QUnit.test("Grouping behavior role='listbox'", async function(assert) {
		// apply role listbox to the list control
		this.oList.applyAriaRole("listbox");

		const oData = { // 10 items
			items : [ {
				Key: "Key1",
				Title : "Title1",
				Description: "Description1"
			}, {
				Key: "Key2",
				Title : "",
				Description: "Description2"
			}, {
				Key: "Key3",
				Title : "Title3",
				Description: "Description3"
			}, {
				Key: "Key1",
				Title : "Title4",
				Description: "Description4"
			}, {
				Key: "Key3",
				Title : "Title5",
				Description: "Description5"
			}, {
				Key: "Key3",
				Title : "Title6",
				Description: "Description6"
			}, {
				Key: "Key1",
				Title : "Title7",
				Description: "Description7"
			}, {
				Key: "Key2",
				Title : "Title8",
				Description: "Description8"
			}, {
				Key: "Key2",
				Title : "Title9",
				Description: "Description9"
			}, {
				Key: "Key3",
				Title : "Title10",
				Description: "Description10"
			} ]
		};
		const oModel = new JSONModel(oData);
		this.oList.setModel(oModel);
		const oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		this.oList.bindItems({
			path: "/items",
			template: new StandardListItem({
				title: "{Title}",
				description: "{Description}"
			}),
			sorter: oSorter,
			groupHeaderFactory: function(oGroupInfo) {
				return new CustomListItem({
					content: [
						new Text({
							text: oGroupInfo.key
						})
					]
				});
			}
		});

		this.oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.ok(oGroupItem.isA("sap.m.CustomListItem"), "GroupHeader is the sap.m.CustomListItem, since groupHeaderFactory is defined");
			const $GroupItem = oGroupItem.$();
			assert.strictEqual($GroupItem.attr("role"), "group", "role=group assigned to CustomListItem, since its groupHeader");
			assert.notOk($GroupItem.attr("aria-posinset"), "aria-posinset not added, since its groupHeader");
			assert.notOk($GroupItem.attr("aria-setsize"), "aria-setsize not added, since its groupHeader");
			assert.ok($GroupItem.attr("aria-owns"), "aria-owns added");
		});
	});

	QUnit.test("Grouping behavior role='list'", async function(assert) {
		const oData = { // 10 items
			items : [ {
				Key: "Key1",
				Title : "Title1",
				Description: "Description1"
			}, {
				Key: "Key2",
				Title : "",
				Description: "Description2"
			}, {
				Key: "Key3",
				Title : "Title3",
				Description: "Description3"
			}, {
				Key: "Key1",
				Title : "Title4",
				Description: "Description4"
			}, {
				Key: "Key3",
				Title : "Title5",
				Description: "Description5"
			}, {
				Key: "Key3",
				Title : "Title6",
				Description: "Description6"
			}, {
				Key: "Key1",
				Title : "Title7",
				Description: "Description7"
			}, {
				Key: "Key2",
				Title : "Title8",
				Description: "Description8"
			}, {
				Key: "Key2",
				Title : "Title9",
				Description: "Description9"
			}, {
				Key: "Key3",
				Title : "Title10",
				Description: "Description10"
			} ]
		};
		const oModel = new JSONModel(oData);
		this.oList.setModel(oModel);
		const oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		this.oList.bindItems({
			path: "/items",
			template: new StandardListItem({
				title: "{Title}",
				description: "{Description}"
			}),
			sorter: oSorter,
			groupHeaderFactory: function(oGroupInfo) {
				return new CustomListItem({
					content: [
						new Text({
							text: oGroupInfo.key
						})
					]
				});
			}
		});

		this.oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.ok(oGroupItem.isA("sap.m.CustomListItem"), "GroupHeader is the sap.m.CustomListItem, since groupHeaderFactory is defined");
			const $GroupItem = oGroupItem.$();
			assert.strictEqual($GroupItem.attr("role"), "group", "role=group assigned to CustomListItem, since its groupHeader and parent's role=list");
			assert.notOk($GroupItem.attr("aria-posinset"), "aria-posinset not added, since its groupHeader");
			assert.notOk($GroupItem.attr("aria-setsize"), "aria-setsize not added, since its groupHeader");
			assert.ok($GroupItem.attr("aria-owns"), "aria-owns added");
		});
	});
});
