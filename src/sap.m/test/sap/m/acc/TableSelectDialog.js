sap.ui.define([
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Column",
	"sap/m/TableSelectDialog",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/App"
], function(
	ColumnListItem,
	Label,
	Filter,
	FilterOperator,
	JSONModel,
	Column,
	TableSelectDialog,
	MessageBox,
	Button,
	coreLibrary,
	Page,
	VBox,
	App
) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	// create the template for the items binding
	var oItemTemplate1 = new ColumnListItem({
		type : "Active",
		unread : false,
		cells : [
			new Label({
				text : "{name}"
			}),
			new Label({
				text: "{quantity}"
			}), new Label({
				text: "{limit}"
			}), new Label({
				text : "{price}"
			})
		]
	});
	// filter function for the list search
	var fnDoSearch = function (oEvent, bProductSearch) {
		var aFilters = [],
				sSearchValue = oEvent.getParameter("value"),
				itemsBinding = oEvent.getParameter("itemsBinding");

		// create the local filter to apply
		if (sSearchValue !== undefined && sSearchValue.length > 0) {
			if (bProductSearch) {
				// create multi-field filter to allow search over all attributes
				aFilters.push(new Filter("ProductId", FilterOperator.Contains , sSearchValue));
				// apply the filter to the bound items, and the Select Dialog will update
				itemsBinding.filter(aFilters, "Application");
			} else {
				// create multi-field filter to allow search over all attributes
				aFilters.push(new Filter("name", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("lname", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("ean13", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("ean8", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("quantity", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("limit", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("backorder", FilterOperator.Contains , sSearchValue));
				aFilters.push(new Filter("price", FilterOperator.Contains , sSearchValue));
				// apply the filter to the bound items, and the Select Dialog will update
				itemsBinding.filter(new Filter(aFilters, false), "Application"); // filters connected with OR
			}
		} else {
			// filter with empty array to reset filters
			itemsBinding.filter(aFilters, "Application");
		}
	};


	// create the data to be shown in the table
	var oProductData1 = {
		items : [{
			name : "Headphone",
			quantity : "10 EA",
			limit : "15.00 Eur",
			price : "12.00 EUR"
		}, {
			name : "Mouse Pad",
			quantity : "1 EA",
			limit : "5.00 Eur",
			price : "3.00 EUR"
		}, {
			name : "Monitor",
			quantity : "8 EA",
			limit : "60.00 Eur",
			price : "45.00 EUR"
		}, {
			name : "Optic Mouse",
			quantity : "2 EA",
			limit : "40.00 Eur",
			price : "15.00 EUR"
		}, {
			name : "Dock Station",
			quantity : "1 EA",
			limit : "90.00 Eur",
			price : "55.00 EUR"
		}]
	};

	// create the model to hold the data
	var oModel1 = new JSONModel();
	oModel1.setDefaultBindingMode("OneWay");
	oModel1.setData(oProductData1);

	var fnCreateSimpleDialogColumns = function () {
		return [
			new Column({
				hAlign: "Center",
				popinDisplay: "Inline",
				header: new Label({
					text: "Quantity"
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			}),
			new Column({
				hAlign: "End",
				width: "30%",
				header: new Label({
					text: "Value"
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			}),
			new Column({
				hAlign: "End",
				width: "30%",
				popinDisplay: "Inline",
				header: new Label({
					text: "Price"
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			})];
	};

	var oTableSelectDialog3 = new TableSelectDialog("TableSelectDialog3", {
		title: "Title one",
		noDataText: "{dialog>/noDataMessage}",
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

	// attach confirm listener
	oTableSelectDialog3.attachConfirm(function (evt) {
		var selectedItem = evt.getParameter("selectedItem");
		if (selectedItem) {
			//Get all the cells and pull back the first one which will be the name content
			var oCells = selectedItem.getCells();
			var oCell = oCells[0];
			//Now update the input with the value
			MessageBox.alert("Item selected is : " + oCell.getText());
		}
		//Now destroy it
		oTableSelectDialog3.destroy();
		oTableSelectDialog3 = null;
	});

	var oButton3 = new Button("Button3", {
		text: "Open TableSelectDialog with destroy call in close event & late binding",
		ariaHasPopup: HasPopup.Dialog,
		press: function (evt) {
			oTableSelectDialog3.open();

			// then set model & bind Aggregation
			oTableSelectDialog3.bindAggregation("items", "/items", oItemTemplate1);
			oTableSelectDialog3.setModel(oModel1);
		}
	});

	var aData = [];
	for (var i = 0; i < 50; i++) {
		aData.push({text : "Item" + i, selected : i > 20 || i === 5});
	}

	//create TableSelectDialog with growing false, search is not implemented to work
	var oTableSelectDialog11 = new TableSelectDialog({
		title: "Title two",
		columns : [
			fnCreateSimpleDialogColumns()
		],
		liveChange: fnDoSearch,
		multiSelect : true,
		rememberSelections: true,
		contentWidth: "200px",
		growing: false
	});

	var oButton11 = new Button("Button11", {
		text: "Open TableSelectDialog with property growing false",
		ariaHasPopup: HasPopup.Dialog,
		press: function () {
			oTableSelectDialog11.open();
			// then set model & bind Aggregation
			oTableSelectDialog11.bindAggregation("items", "/items", oItemTemplate1);
			oTableSelectDialog11.setModel(oModel1);
		}
	});

	// create the application page
	var oPage = new Page("page", {
		title:" TableSelectDialog Acc Test Page",
		content:[
			new VBox({
				items: [
					oButton3,
					oButton11
				]
			})
		]
	});

	var oApp = new App("myApp", {initialPage:"page"});
	oApp.addPage(oPage).placeAt("content");
});
