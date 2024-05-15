sap.ui.define([
	"sap/m/App",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/library",
	"sap/m/PullToRefresh",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/ToolbarSpacer",
	"sap/m/Bar",
	"sap/m/BusyDialog",
	"sap/m/MessageToast"
], function(
	App,
	Select,
	Item,
	Label,
	Page,
	List,
	StandardListItem,
	mobileLibrary,
	PullToRefresh,
	OverflowToolbar,
	Button,
	ToolbarSpacer,
	Bar,
	BusyDialog,
	MessageToast
) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	var app = new App("P2RApp");

	/*
	 * functions
	 */

	function createSelect(oPullDown, iSelectedItem){
		var sId = oPullDown.getId();
		var iconSelect = new Select({
			tooltip: "Show Logo",
			items: [
				new Item(sId + "0", { key: "0", text: "Standard Icon" }),
				new Item(sId + "1", { key: "1", text: "Custom Icon" }),
				new Item(sId + "2", { key: "2", text: "No Icon" })
			],
			selectedItem: sId + (iSelectedItem || "0"),
			change: function(oControlEvent){
				var sKey = oControlEvent.getParameter("selectedItem").getKey();
				switch (sKey){
					case "0": oPullDown.setShowIcon(true).setCustomIcon(null); break;
					case "1": oPullDown.setShowIcon(true).setCustomIcon("images/SAPUI5Logo.png"); break;
					case "2": oPullDown.setShowIcon(false); break;
				}
				// re-render the parent container after content change
				oPullDown.getParent().invalidate();
			}
		});
		var visibilitySelect = new Select({
			tooltip: "Visibility",
			items: [
				new Item(sId + "v0", { key: "0", text: "Visible" }),
				new Item(sId + "v1", { key: "1", text: "Hidden" })
			],
			selectedItem: sId +  "v0",
			change: function(oControlEvent){
				var sKey = oControlEvent.getParameter("selectedItem").getKey();
				switch (sKey){
					case "0": oPullDown.setVisible(true); break;
					case "1": oPullDown.setVisible(false); break;
				}
			}
		});
		var iconLabel = new Label({
			text : "Icon:",
			labelFor: iconSelect
		});
		var visibilityLabel = new Label({
			text : "Visibility:",
			labelFor: visibilitySelect
		});
		return [
			iconLabel,
			iconSelect,
			visibilityLabel,
			visibilitySelect
		];
	}

	/*
	 * Entry page
	 */
	var overviewPage = new Page("overviewPage", {
		title : "Pull to Refresh",
		titleLevel: "H1"
	});

	overviewPage.addContent(new List({
		inset : false,
		headerText : "Pull variants",
		items: [
			new StandardListItem({
				id: "standard_pull_page",
				title: "Standard Pull Down to Refresh",
				type: ListType.Active,
				press: function() {
					app.to("standardP2R");
				}
			}),
			new StandardListItem({
				id: "hide_pull_page",
				title: "Hide Immediately",
				type: ListType.Active,
				press: function() {
					app.to("simplePage");
				}
			}),
			new StandardListItem({
				id: "busy_dialog_pull_page",
				title: "Show Busy Dialog",
				type: ListType.Active,
				press: function() {
					app.to("busyPage");
				}
			})
		]
	}));

	var detailPage = new Page("detailPage", {
		title : "Detail Page",
		titleLevel: "H1",
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		}
	});

	/*
	 * Standard PullDown To Refresh example
	 */

	var standardList =  new List({inset : false});
	addItems(standardList, 5);
	var pullToRefreshStd = new PullToRefresh({
		id: "standard_pull_control",
		tooltip: "Standard Pull to Refresh",
		refresh: function(){
			setTimeout(function(){
				pullToRefreshStd.hide();
				addItems(standardList, 10);
			}, 1000);
		}
	});

	var oBar0 = new OverflowToolbar("otbFooter", {
		width: 'auto',
		content : [
			new Button({
				text : "Clear List",
				press : function() {
					standardList.removeAllAggregation("items");
					MessageToast.show("List cleared");
				}
			}),
			new ToolbarSpacer()
		].concat(createSelect(pullToRefreshStd))
	});

	var standardPull2Refresh = new Page("standardP2R", {
		title : "Standard Pull to Refresh",
		titleLevel: "H1",
		enableScrolling: true,
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function() {
			app.back();
		},
		footer: oBar0
	});

	standardPull2Refresh.addContent(pullToRefreshStd);
	standardPull2Refresh.addContent(standardList);

	function addItems(list, nItems){
		var n = list.getItems().length + 1;
		for (var i = 0; i < nItems; i++){
			list.insertItem(
				new StandardListItem({
					title: "List item " + (n + i),
					type: ListType.Active,
					press: function() {
						app.to("detailPage");
					}
				}), 0 // insert new items at the top of the list
			);
		}
	}

	/*
	 * Hide immediately example
	 */

	var pullToHide = new PullToRefresh({
		id: "hide_pull_control",
		customIcon: "images/SAPUI5.png",
		showIcon: true,
		refresh: function(){
			pullToHide.hide();
			pullToHide.setDescription("...");
			setTimeout(function(){
				addItems(simpleList, 10);
				pullToHide.setDescription("");
			}, 1000);
	}});
	var simpleList =  new List("simpleList", {inset : false});
	addItems(simpleList, 5);

	var simplePage = new Page("simplePage", {
		title : "Hide pull-down immediately",
		titleLevel: "H1",
		enableScrolling: true,
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function(){ app.back(); },
		footer : new OverflowToolbar({
			content : [
				new Button({
					text: "Clear list",
					press : function() {
						simpleList.removeAllAggregation("items");
						MessageToast.show("List cleared");
					}
			}), new ToolbarSpacer(), createSelect(pullToHide, 1)]
		})
	});

	simplePage.addContent(pullToHide);
	simplePage.addContent(simpleList);

	/*
	 * Busy dialog example
	 */

	var sOldDescription;

	var busyDialog = new BusyDialog({
			text:"Please wait, data is loading..",
			title: "Loading..",
			showCancelButton: true,
			close: function(oEvent){
				if (oTimeout){
					clearTimeout(oTimeout);
					oTimeout = null;
					if (sOldDescription){
						pullToBusy.setDescription(sOldDescription);
					}
				}
			}
		});

	var oTimeout = null;

	var pullToBusy = new PullToRefresh({
		id: "busy_dialog_pull_control",
		showIcon: false,
		refresh: function(){
			pullToBusy.hide();
			sOldDescription = pullToBusy.getDescription();
			pullToBusy.setDescription("...");
			setTimeout(function(){
				busyDialog.open();
				oTimeout = setTimeout(function(){
					addItems(busyList, 10);
					pullToBusy.setDescription("");
					oTimeout = null;
					busyDialog.close();
				}, 1000);
			}, 100);
		}});
	var busyList =  new List("busyList", {inset : false});
	addItems(busyList, 5);

	var busyPage = new Page("busyPage", {
		title : "Show busy dialog",
		titleLevel: "H1",
		enableScrolling: true,
		showNavButton : true,
		navButtonText : "Back",
		navButtonPress : function(){ app.back(); },
		footer : new OverflowToolbar({
			content : [
				new Button({
					text: "Clear list",
					press : function() {
						busyList.removeAllAggregation("items");
						MessageToast.show("List cleared");
					}
			}), new ToolbarSpacer(), createSelect(pullToBusy, 2)]
		})
	});

	busyPage.addContent(pullToBusy);
	busyPage.addContent(busyList);

	app.addPage(overviewPage)
		.addPage(standardPull2Refresh)
		.addPage(detailPage)
		.addPage(simplePage)
		.addPage(busyPage)
		.setInitialPage("overviewPage")
		.placeAt("body");
});
