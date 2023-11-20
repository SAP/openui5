sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel"
], function(
	App,
	Button,
	CheckBox,
	Page,
	SelectDialog,
	StandardListItem,
	Toolbar,
	ToolbarSpacer,
	VBox,
	coreLibrary,
	Filter,
	FilterOperator,
	JSONModel,
	ODataModel
) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	// filter function for the list search
	var fnDoSearch = function (oEvent, bProductSearch) {
		var aFilters = [],
			sSearchValue = oEvent.getParameter("value"),
			itemsBinding = oEvent.getParameter("itemsBinding");

		// create the local filter to apply
		if (sSearchValue !== undefined && sSearchValue.length > 0) {
			aFilters.push(new Filter((bProductSearch ? "ProductId" : "title" ), FilterOperator.Contains , sSearchValue));
		}
		// apply the filter to the bound items, and the Select Dialog will update
		itemsBinding.filter(aFilters, "Application");
	};

	// filter function to align the binding with the search term
	var fnCreatePrefilter = function (sSearchValue, bProductSearch) {
		var aFilters = [];

		// create the local filter to apply
		if (sSearchValue !== undefined) {
			aFilters.push(new Filter((bProductSearch ? "ProductId" : "title" ), FilterOperator.Contains , sSearchValue));
		}
		return aFilters;
	};

	/* dummy list data */
	var oListData = {
		superheros: [ {
				title: "Chuck Norris",
				description: "Undefeatable",
				icon: "sap-icon://employee",
				selected: true
			}, {
				title: "The incredible Hulk",
				description: "Lots of Anger, Mutation",
				icon: "sap-icon://e-care",
				selected: true
			}, {
				title: "Superman",
				description: "Flying, Laser Sight",
				icon: "sap-icon://competitor",
				selected: true
			}, {
				title: "Bud Spencer",
				description: "Dampfhammer, Beating",
				icon: "sap-icon://dimension",
				selected: true
			}, {
				title: "Jack Sparrow",
				description: "Pirate, Bad Luck",
				icon: "sap-icon://arobase",
				selected: false
			}
		]
	};

	var oModelList = new JSONModel();
	oModelList.setDefaultBindingMode("OneWay");
	oModelList.setData(oListData);

	var oItemTemplate = new StandardListItem({
			title: "{title}",
			description: "{description}",
			icon: "{icon}",
			type: "Active"
		}),
		oItemTemplateSelection = new StandardListItem({
			title: "{title}",
			description: "{description}",
			icon: "{icon}",
			selected: "{selected}"
		}),
		/* dialog data */
		oDialogData = {
			title: "Forward to",
			noDataMessage: "Sorry, we can't find what you are looking for.. No data available!"
		},
		oModelDialog = new JSONModel();

	oModelDialog.setData(oDialogData);

	/* 1) select dialog with list binding and dialog binding */
	var oSelectDialog1 = new SelectDialog("SelectDialog1", {
			title: "{dialog>/title}",
			noDataText: "{dialog>/noDataMessage}",
			contentWidth: "30rem",
			search : fnDoSearch,
			liveChange: fnDoSearch
		}),
		oButton1 = new Button("Button1", {
			text: "SelectDialog in single selection mode",
			ariaHasPopup: HasPopup.Dialog,
			press: function (oEvent) {
				// initiate model
				oSelectDialog1.setModel(oModelList);
				oSelectDialog1.setModel(oModelDialog, "dialog");

				// bind aggregation with filters
				oSelectDialog1.bindAggregation("items", {
					path: "/superheros",
					template: oItemTemplate
				});

				// open dialog
				oSelectDialog1.open();
			}
		}),

	/* 2) selection model in JSON data (multiSelect mode) + rememberSelections = true */
		oSelectDialog2 = new SelectDialog("SelectDialog4", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			rememberSelections: true,
			contentWidth: "30rem",
			search: fnDoSearch,
			liveChange: fnDoSearch
		});

	// initiate model
	oSelectDialog2.setModel(oModelList);

	// bind aggregation with filters
	oSelectDialog2.bindAggregation("items", {
		path: "/superheros",
		filters: fnCreatePrefilter(),
		template: oItemTemplateSelection
	});

	var oButton2 = new Button("Button4", {
		text: "SelectDialog in multi selection mode",
		ariaHasPopup: HasPopup.Dialog,
		press: function () {
			// prefilter dialog
			var itemsBinding = oSelectDialog2.getBinding("items");
			itemsBinding.filter(fnCreatePrefilter(), "Application");
			// open dialog
			oSelectDialog2.open();
		}
	});

	var oCompactMode = new CheckBox("compactMode", {
		text: "Compact Mode",
		selected : false,
		select : function() {
			document.body.classList.toggle("sapUiSizeCompact");
		}
	});

	var oPage = new Page("page", {
		title: "SelectDialog Accessibility Test Page",
		content: [
			new VBox({
				items: [
					oButton1,
					oButton2
				]
			})
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	});

	var oApp = new App("myApp", { initialPage: "page" });

	oApp.addPage(oPage).placeAt("content");
});
