sap.ui.define([
	"sap/m/App",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/InvisibleText",
	"sap/m/ResponsivePopover",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(
	App,
	List,
	StandardListItem,
	JSONModel,
	Button,
	mobileLibrary,
	InvisibleText,
	ResponsivePopover,
	CheckBox,
	Page,
	Toolbar,
	ToolbarSpacer
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var app = new App("myApp", {initialPage:"page1"});

	//create the list
	var oList = new List({});

	var data = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel worflow settings",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel worflow settings",
			type : "Navigation",
			press : 'detailPage'
		} ]
	};

	var oItemTemplate1 = new StandardListItem({
		title : "{title}",
		description : "{description}",
		type : "{type}"
	});

	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	bindListData(data, oItemTemplate1, oList);
	//end of the list creation

	var oBeginButton = new Button({
		text: "Action",
		type: ButtonType.Reject,
		press: function(){
			oResponsivePopover.close();
		}
	}),
		oInvisibleText = new InvisibleText({text: "I have a hidden label"}).toStatic(),

		oResponsivePopover = new ResponsivePopover("popoverBottom", {
			placement: PlacementType.Bottom,
			title: "Responsive Popover Title",
			showHeader: true,
			beginButton: oBeginButton,
			horizontalScrolling: false,
			content: [
				oList
			],
			ariaLabelledBy: oInvisibleText.getId()
		}),

		oButton = new Button("btnPopoverBottom", {
			text : "ResponsivePopover with hidden label",
			press : function() {
				oResponsivePopover.openBy(this);
			}
		}),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oPage = new Page("page1", {
			title:"ResponsivePopover Accessibility Test Page",
			content: [
				oButton
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	app.addPage(oPage);
	app.placeAt("body");
});
