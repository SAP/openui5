sap.ui.define([
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Page",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/FilterOperator",
	"sap/m/TableSelectDialog",
	"sap/m/VBox",
	"sap/m/Input",
	"sap/m/FlexItemData",
	"sap/ui/core/library"
], function(
	App,
	MessageBox,
	Label,
	JSONModel,
	Filter,
	Button,
	Column,
	ColumnListItem,
	Page,
	MockServer,
	ODataModel,
	FilterOperator,
	TableSelectDialog,
	VBox,
	Input,
	FlexItemData,
	coreLibrary
) {
	"use strict";

	var sServiceURI = "/service/";
	var sMetaDataURI = "qunit/data/";


	// configure respond to requests delay
	MockServer.config({
		autoRespond : true,
		autoRespondAfter : 1000
	});

	// create mockserver
	var oMockServer = new MockServer({
		rootUri : sServiceURI
	});

	// start mockserver
	oMockServer.simulate(sMetaDataURI + "metadata.xml", sMetaDataURI);
	oMockServer.start();


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

	// filter function for the product search
	var fnDoProductSearch = function (oEvent) {
		fnDoSearch(oEvent, true);
	};

	// filter function to align the binding with the search term
	var fnCreatePrefilter = function (sSearchValue, bProductSearch) {
		var aFilters = [];

		// create the local filter to apply
		if (sSearchValue !== undefined) {
			aFilters.push(new Filter((bProductSearch ? "ProductId" : "name" ), FilterOperator.Contains , sSearchValue));
		}
		return aFilters;
	};

	var fnPrefilterDialog = function (sSearchValue){
		// create an array to hold the filters we create
		var aFilters = fnCreatePrefilter(sSearchValue),
				itemsBinding = oTableSelectDialog1.getBinding("items");

		itemsBinding.filter(aFilters, "Application");
	};

	/* dialog data */
	var oDialogData = {
		title: "Choose your tech..",
		noDataMessage: "We don't have any tech to show here and we are very sorry for that!"
	};

	var oModelDialog = new JSONModel();
	oModelDialog.setData(oDialogData);

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

	// create the data to be shown in the table
	var oProductData2 = {
		items : [{
			name : "Tablet",
			quantity : "1 EA",
			limit : "150.00 Eur",
			price : "120.00 EUR"
		}, {
			name : "Docking Station",
			quantity : "1 EA",
			limit : "15.00 Eur",
			price : "13.00 EUR"
		}, {
			name : "DVD-R",
			quantity : "10 EA",
			limit : "6.00 Eur",
			price : "4.00 EUR"
		}, {
			name : "Headset",
			quantity : "1 EA",
			limit : "20.00 Eur",
			price : "15.00 EUR"
		}, {
			name : "Power Supply",
			quantity : "1 EA",
			limit : "32.00 Eur",
			price : "20.00 EUR"
		}]
	};

	// create the model to hold the data
	var oModel2 = new JSONModel();
	oModel2.setDefaultBindingMode("OneWay");
	oModel2.setData(oProductData2);

	// create the data to be shown in the table
	var oProductData3 = {
		items : [{
			name : "Headphone",
			lname : "Headphone 1234567890120 12345678",
			ean13 : "1234567890120",
			ean8 : "12345678",
			quantity : "10 EA",
			limit : "15.00 Eur",
			backorder : "10,000",
			price : "12.00 EUR"
		}, {
			name : "Mouse Pad",
			lname : "Mouse Pad 1234565544123 1234565544123",
			ean13 : "1234565544123",
			ean8 : "1234565544123",
			quantity : "1 EA",
			limit : "5.00 Eur",
			backorder : "25,000",
			price : "3.00 EUR"
		}, {
			name : "Monitor",
			lname : "Monitor 1234565544133 15675678",
			ean13 : "1234565544133",
			ean8 : "15675678",
			quantity : "8 EA",
			limit : "60.00 Eur",
			backorder : "125,000",
			price : "45.00 EUR"
		}, {
			name : "Optic Mouse",
			lname : "Optic Mouse 2222365544133 15232678",
			ean13 : "2222365544133",
			ean8 : "15232678",
			quantity : "2 EA",
			limit : "40.00 Eur",
			backorder : "125,500",
			price : "15.00 EUR"
		}, {
			name : "Dock Station",
			lname : "Dock Station 2221121244133 15675222",
			ean13 : "2221121244133",
			ean8 : "15675222",
			quantity : "1 EA",
			limit : "90.00 Eur",
			backorder : "25,000",
			price : "55.00 EUR"
		}, {
			name : "Dock Station",
			lname : "Dock Station 2221121244133 15675222",
			ean13 : "2221121244133",
			ean8 : "15675222",
			quantity : "1 EA",
			limit : "90.00 Eur",
			backorder : "25,000",
			price : "55.00 EUR"
		}, {
			name : "Dock Station",
			lname : "Dock Station 2221121244133 15675222",
			ean13 : "2221121244133",
			ean8 : "15675222",
			quantity : "1 EA",
			limit : "90.00 Eur",
			backorder : "25,000",
			price : "55.00 EUR"
		}]
	};

	// create the model to hold the data
	var oModel3 = new JSONModel();
	oModel3.setDefaultBindingMode("OneWay");
	oModel3.setData(oProductData3);

	var fnCreateSimpleDialogColumns = function () {
		return [
			new Column({
				hAlign: "Begin",
				header: new Label({
					text: "Name"
				})
			}),
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

	// create our new Table Select Dialog
	var oTableSelectDialog1 = new TableSelectDialog("TableSelectDialog1", {
		title: "Choose a piece of tech",
		noDataText: "Sorry, no tech available today",
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

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

	// create the template for the items binding
	var oItemTemplate2 = new ColumnListItem({
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
				text : "{backorder}"
			}), new Label({
				text : "{price}"
			})
		]
	});

	// create the template for the items binding
	var oItemTemplate3 = new ColumnListItem({
		type : "Active",
		unread : false,
		cells : [
			new Label({
				text : "{name}"
			}),  new Label({
				text : "{lname}"
			}),  new Label({
				text : "{ean13}"
			}),  new Label({
				text : "{ean8}"
			}),  new Label({
				text: "{quantity}"
			}), new Label({
				text: "{limit}"
			}), new Label({
				text : "{backorder}"
			}), new Label({
				text : "{price}"
			})
		]
	});

	// create the template for the web service binding
	var oProductItemTemplate = new ColumnListItem({
		type : "Active",
		unread : false,
		cells : [
			new Label({
				text : "{ProductId}"
			}),  new Label({
				text : "{Name}"
			}),  new Label({
				text : "{Price}"
			}),  new Label({
				text : "{Weight}"
			})
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog1.setModel(oModel3);
	oTableSelectDialog1.bindAggregation("items", "/items", oItemTemplate1);

	// attach confirm listener
	oTableSelectDialog1.attachConfirm(function (evt) {
		var selectedItem = evt.getParameter("selectedItem");
		if (selectedItem) {
			//Get all the cells and pull back the first one which will be the name content
			var oCells = selectedItem.getCells();
			var oCell = oCells[0];
			//Now update the input with the value
			oInput1.setValue("Item selected is : " + oCell.getText());
		}
	});

	var oInput1 = new Input({
		type: "Text",
		placeholder: "Open TableSelectDialog with Items Binding",
		showValueHelp: true,
		valueHelpRequest: function () {
			oTableSelectDialog1.open(oInput1.getValue());

			oTableSelectDialog1.setModel(oModel3);
			oTableSelectDialog1.bindAggregation("items", "/items", oItemTemplate1);

			fnPrefilterDialog(oInput1.getValue());
		}
	});

	/* 2) table select dialog with binding and dialog binding */
	var oTableSelectDialog2 = new TableSelectDialog("TableSelectDialog2", {
		title: "{dialog>/title}",
		noDataText: "{dialog>/noDataMessage}",
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

	var oInput2 = new Input('tsdWithBindingInput', {
		type: "Text",
		placeholder: "Open TableSelectDialog with Dialog Binding & Items Binding",
		showValueHelp: true,
		valueHelpRequest: function () {
			oTableSelectDialog2.open(oInput2.getValue());

			// then set model & bind Aggregation
			oTableSelectDialog2.bindAggregation("items", "/items", oItemTemplate1);
			oTableSelectDialog2.setModel(oModel1);
			oTableSelectDialog2.setModel(oModelDialog,"dialog");
		}
	});

	// attach confirm listener
	oTableSelectDialog2.attachConfirm(function (evt) {
		var selectedItem = evt.getParameter("selectedItem");
		if (selectedItem) {
			//Get all the cells and pull back the first one which will be the name content
			var oCells = selectedItem.getCells();
			var oCell = oCells[0];
			//Now update the input with the value
			oInput2.setValue("Item selected is : " + oCell.getText());
		}
	});

	/* 3) table dialog with binding auto destroy on close */
	var oTableSelectDialog3 = new TableSelectDialog("TableSelectDialog3", {
		title: "{dialog>/title}",
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
	});

	var oButton3 = new Button("Button3", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with destroy call in close event & late binding",
		press: function (evt) {
			oTableSelectDialog3.open();

			// then set model & bind Aggregation
			oTableSelectDialog3.bindAggregation("items", "/items", oItemTemplate1);
			oTableSelectDialog3.setModel(oModel1);
		}
	});

	/* 4) multi select table dialog with binding  */
	var oTableSelectDialog4 = new TableSelectDialog("TableSelectDialog4", {
		title: "Choose several tech products",
		noDataText: "Sorry, no tech today",
		multiSelect: true,
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog4.setModel(oModel1);
	oTableSelectDialog4.bindAggregation("items", "/items", oItemTemplate1);

	// attach confirm listener
	oTableSelectDialog4.attachConfirm(function (evt) {
		var aSelectedItems = evt.getParameter("selectedItems");
		if (aSelectedItems) {
			var sSelectedItems = "";
			//Loop through all selected items
			for (var i = 0; i < aSelectedItems.length; i++) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = aSelectedItems[i].getCells();
				var oCell = oCells[0];
				//Update the text
				sSelectedItems += oCell.getText();
				if (i < aSelectedItems.length - 1) {
					sSelectedItems += ', ';
				}
			}
			MessageBox.alert("You selected: " + sSelectedItems);
		}
	});

	var oButton4 = new Button("tsdWithMultiSelectButton", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog in MultiSelect mode",
		press: function () {
			// open dialog
			oTableSelectDialog4.open();
		}
	});

	var fnCreateColumsForDialog5 = function () {
		return [
			new Column({
				hAlign : "Begin",
				header : new Label({
					text : "Name"
				})
			}),
			new Column({
				hAlign : "Center",
				width : "90px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Quantity"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "End",
				width : "100px",
				header : new Label({
					text : "Value"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				width : "150px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Back Order"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "End",
				width : "150px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Price"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			})
		];
	};

	/* 5) multi select table dialog with large binding */
	var oTableSelectDialog5 = new TableSelectDialog("TableSelectDialog5", {
		title: "Choose several extended tech products",
		noDataText: "Sorry, no tech today",
		multiSelect: true,
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			fnCreateColumsForDialog5()
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog5.setModel(oModel2);
	oTableSelectDialog5.bindAggregation("items", "/items", oItemTemplate2);


	// attach confirm listener
	oTableSelectDialog5.attachConfirm(function (evt) {
		var aSelectedItems = evt.getParameter("selectedItems");
		if (aSelectedItems) {
			var sSelectedItems = "";
			//Loop through all selected items
			for (var i = 0; i < aSelectedItems.length; i++) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = aSelectedItems[i].getCells();
				var oCell = oCells[0];
				//Update the text
				sSelectedItems += oCell.getText();
				if (i < aSelectedItems.length - 1) {
					sSelectedItems += ', ';
				}
			}
			MessageBox.alert("You selected: " + sSelectedItems);
		}
	});

	var oButton5 = new Button("tsdWithLargeDataAndMultiSelectButton", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog in MultiSelect mode with large data",
		press: function () {
			// open dialog
			oTableSelectDialog5.open();
		}
	});

	/* 6) table dialog with large binding */
	var oTableSelectDialog6 = new TableSelectDialog("TableSelectDialog6", {
		title: "Choose an extended tech products",
		noDataText: "Sorry, no tech today",
		search : fnDoSearch,
		liveChange: fnDoSearch,
		columns : [
			new Column({
				width : "150px",
				hAlign : "Begin",
				header : new Label({
					text : "Name"
				})
			}),
			new Column({
				width : "250px",
				hAlign : "Begin",
				header : new Label({
					text : "Long Name"
				}),
				popinDisplay : "Inline",
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				width : "290px",
				popinDisplay : "Inline",
				header : new Label({
					text : "EAN 13"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				width : "290px",
				popinDisplay : "Inline",
				header : new Label({
					text : "EAN 8"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				width : "190px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Quantity"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "End",
				width : "200px",
				header : new Label({
					text : "Value"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				width : "250px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Back Order"
				}),
				minScreenWidth : "2400px",
				demandPopin : true
			}),
			new Column({
				hAlign : "End",
				width : "250px",
				popinDisplay : "Inline",
				header : new Label({
					text : "Price"
				}),
				minScreenWidth : "2400px",
				demandPopin : true
			})
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog6.setModel(oModel3);
	oTableSelectDialog6.bindAggregation("items", "/items", oItemTemplate3);

	// attach confirm listener
	oTableSelectDialog6.attachConfirm(function (evt) {
		if (oTableSelectDialog6.getMultiSelect()) {
			var aSelectedItems = evt.getParameter("selectedItems");
			if (aSelectedItems) {
				var sSelectedItems = "";
				//Loop through all selected items
				for (var i = 0; i < aSelectedItems.length; i++) {
					//Get all the cells and pull back the first one which will be the name content
					var oCells = aSelectedItems[i].getCells();
					var oCell = oCells[0];
					//Update the text
					sSelectedItems += oCell.getText();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}
				MessageBox.alert("You selected: " + sSelectedItems);
			}
		} else {
			var selectedItem = evt.getParameter("selectedItem");
			if (selectedItem) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = selectedItem.getCells();
				var oCell = oCells[0];
				//Now update the input with the value
				MessageBox.alert("Item selected is : " + oCell.getText());
			}
		}
	});

	var oButton6 = new Button("tsdWithVeryLargeDataButton", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with very large data",
		press: function () {
			// open dialog
			oTableSelectDialog6.setMultiSelect(false);
			oTableSelectDialog6.open();
		}
	});

	var oButton7 = new Button("Button7", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with multi Select and very large data",
		press: function () {
			// open dialog
			oTableSelectDialog6.setMultiSelect(true);
			oTableSelectDialog6.open();
		}
	});

	var fnCreateDialogColumns = function (aColumnsNames) {
		return [
			new Column({
				hAlign: "Begin",
				header: new Label({
					text: aColumnsNames[0]
				})
			}),
			new Column({
				hAlign: "Center",
				styleClass: "Quantity",
				popinDisplay: "Inline",
				header: new Label({
					text: aColumnsNames[1]
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			}),
			new Column({
				hAlign: "End",
				width: "30%",
				header: new Label({
					text: aColumnsNames[2]
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			}),
			new Column({
				hAlign: "End",
				width: "30%",
				popinDisplay: "Inline",
				header: new Label({
					text: aColumnsNames[3]
				}),
				minScreenWidth: "Tablet",
				demandPopin: true
			})
		];
	};

	/* 8) table select dialog with web service binding, prefiltered by "id_1" */
	var oTableSelectDialog8 = new TableSelectDialog("TableSelectDialog8", {
		title: "Choose an extended tech products",
		noDataText: "Sorry, no tech today",
		multiSelect: true,
		search : fnDoProductSearch,
		liveChange: fnDoProductSearch,
		columns: [
			fnCreateDialogColumns(["ID", "Name", "Price", "Weight"])
		]
	});

	// attach confirm listener
	oTableSelectDialog8.attachConfirm(function (evt) {
		if (oTableSelectDialog6.getMultiSelect()) {
			var aSelectedItems = evt.getParameter("selectedItems");
			if (aSelectedItems) {
				var sSelectedItems = "";
				//Loop through all selected items
				for (var i = 0; i < aSelectedItems.length; i++) {
					//Get all the cells and pull back the first one which will be the name content
					var oCells = aSelectedItems[i].getCells();
					var oCell = oCells[0];
					//Update the text
					sSelectedItems += oCell.getText();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}
				MessageBox.alert("You selected: " + sSelectedItems);
			}
		} else {
			var selectedItem = evt.getParameter("selectedItem");
			if (selectedItem) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = selectedItem.getCells();
				var oCell = oCells[0];
				//Now update the input with the value
				MessageBox.alert("Item selected is : " + oCell.getText());
			}
		}
	});

	var oButton8 = new Button("Button8", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog in MultiSelect mode, Web service binding, prefiltered by \"id_1\" with web service binding and no fixed width",
		press: function () {
			// initiate model
			var oModel = new ODataModel(sServiceURI, true);
			oTableSelectDialog8.setModel(oModel);

			// bind aggregation with filters
			oTableSelectDialog8.bindAggregation("items", {
				path: "/Products",
				filters: fnCreatePrefilter("id_1", true),
				template: oProductItemTemplate
			});

			// open dialog
			oTableSelectDialog8.open("id_1");
		}
	});


	/* 9) table select dialog with web service binding, prefiltered by "id_1" and fixed width set to 800px */

	var oTableSelectDialog9 = new TableSelectDialog("TableSelectDialog9", {
		contentWidth: "800px",
		title: "Choose an extended tech products",
		noDataText: "Sorry, no tech today",
		multiSelect: true,
		search : fnDoProductSearch,
		liveChange: fnDoProductSearch,
		columns: [
			fnCreateDialogColumns(["ID", "Name", "Currency", "Price"])
		]
	});

	// attach confirm listener
	oTableSelectDialog9.attachConfirm(function (evt) {
		if (oTableSelectDialog6.getMultiSelect()) {
			var aSelectedItems = evt.getParameter("selectedItems");
			if (aSelectedItems) {
				var sSelectedItems = "";
				//Loop through all selected items
				for (var i = 0; i < aSelectedItems.length; i++) {
					//Get all the cells and pull back the first one which will be the name content
					var oCells = aSelectedItems[i].getCells();
					var oCell = oCells[0];
					//Update the text
					sSelectedItems += oCell.getText();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}
				MessageBox.alert("You selected: " + sSelectedItems);
			}
		} else {
			var selectedItem = evt.getParameter("selectedItem");
			if (selectedItem) {
				//Get all the cells and pull back the first one which will be the name content
				var oCells = selectedItem.getCells();
				var oCell = oCells[0];
				//Now update the input with the value
				MessageBox.alert("Item selected is : " + oCell.getText());
			}
		}
	});

	var oButton9 = new Button("Button9", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog in MultiSelect mode, Web service binding, late binding, with web service binding and 400px width",
		press: function () {
			// open dialog
			oTableSelectDialog9.open("");

			// initiate model
			var oModel = new ODataModel(sServiceURI, true);
			oTableSelectDialog9.setModel(oModel);

			// bind aggregation with filters
			oTableSelectDialog9.bindAggregation("items", {
				path: "/Products",
				filters: fnCreatePrefilter("", true),
				template: oProductItemTemplate
			});

		}
	});

	var oButton10 = new Button("Button10", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with default property growing (true)",
		press: function () {
			oTableSelectDialog10.open();
		}
	});

	var oButton11 = new Button("Button11", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with property growing false",
		press: function () {
			oTableSelectDialog11.open();
		}
	});

	var aData = [];
	for (var i = 0; i < 50; i++) {
		aData.push({text : "Item" + i, selected : i > 20 || i === 5});
	}

	//create TableSelectDialog with default growing (true), search is not implemented to work
	var oTableSelectDialog10 = new TableSelectDialog({
		columns : [
			new Column({
				header : new Label({text : "Item"})
			})
		],
		multiSelect : true,
		rememberSelections: true,
		contentWidth: "200px"
	});

	oTableSelectDialog10.setModel(new JSONModel(aData));
	oTableSelectDialog10.bindItems("/", new ColumnListItem({
		cells : [
			new Label({text : "{text}"})
		],
		selected : "{selected}"
	}));

	//create TableSelectDialog with growing false, search is not implemented to work
	var oTableSelectDialog11 = new TableSelectDialog({
		columns : [
			new Column({
				header : new Label({text : "Item"})
			})
		],
		multiSelect : true,
		rememberSelections: true,
		contentWidth: "200px",
		growing: false
	});

	oTableSelectDialog11.setModel(new JSONModel(aData));
	oTableSelectDialog11.bindItems("/", new ColumnListItem({
		cells : [
			new Label({text : "{text}"})
		],
		selected : "{selected}"
	}));

	oTableSelectDialog11.setModel(new JSONModel(aData));
	oTableSelectDialog11.bindItems("/", new ColumnListItem({
		cells : [
			new Label({text : "{text}"})
		],
		selected : "{selected}"
	}));

	var oButton12 = new Button("Button12", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open TableSelectDialog with Reset Button and long title",
		press: function () {
			oTableSelectDialog12.open();
		}
	});

	var oTableSelectDialog12 = new TableSelectDialog("resetButtonTableSelectDialog", {
		title: "Very very very very very very very very long title",
		columns : [
			new Column({
				header : new Label({text : "Item"})
			})
		],
		multiSelect : true,
		rememberSelections: true,
		contentWidth: "200px",
		growing: false
	});

	oTableSelectDialog12.setModel(new JSONModel(aData));
	oTableSelectDialog12.bindItems("/", new ColumnListItem({
		cells : [
			new Label({text : "{text}"})
		],
		selected : "{selected}"
	}));

	/* TableSelectDialog with resizable true */

	var oTableSelectDialog13 = new TableSelectDialog("TableSelectDialog13", {
		title: "Table Select Dialog with resizable and draggable true",
		noDataText: "Table Select Dialog with resizable and draggable true no data",
		contentWidth: "1000px",
		resizable: true,
		draggable: true
	});

	// set model & bind Aggregation
	oTableSelectDialog13.setModel(new JSONModel(aData));
	oTableSelectDialog13.bindItems("/", new ColumnListItem({
		cells : [
			new Label({text : "{text}"})
		],
		selected : "{selected}"
	}));
	var oButton13 = new Button("Button13", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open SelectDialog with resizable=true",
		press: function () {
			// open dialog
			oTableSelectDialog13.open();
		}
	});

	var oTableSelectDialog14 = new TableSelectDialog("TableSelectDialog14", {
		title: "Table Select Dialog with Responsive Paddings (SAP Quartz and Horizon themes only)",
		noDataText: "No data",
		contentWidth: "100%",
		resizable: true,
		draggable: true,
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog14.setModel(oModel3);
	oTableSelectDialog14.bindAggregation("items", "/items", oItemTemplate1);
	oTableSelectDialog14.addStyleClass("sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer");

	var oButton14 = new Button("Button14", {
		layoutData: new FlexItemData({
			maxWidth: "100%"
		}),
		text: "Open SelectDialog with Responsive Padding",
		press: function () {
			// open dialog
			oTableSelectDialog14.open();
		}
	});

	var oTableSelectDialog15 = new TableSelectDialog("TableSelectDialog15", {
		title: "Choose several World Domination companions",
		noDataText: "Sorry, no world domination companions available",
		contentWidth: "1000px",
		searchPlaceholder: "Placeholder text",
		columns : [
			fnCreateSimpleDialogColumns()
		]
	});

	// set model & bind Aggregation
	oTableSelectDialog14.setModel(oModel3);
	oTableSelectDialog14.bindAggregation("items", "/items", oItemTemplate1);
	oTableSelectDialog14.addStyleClass("sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer");

	var oButton15 = new Button("Button15", {
		text: "Select Dialog with custom placeholder",
		press: function () {
			// open dialog
			oTableSelectDialog15.open();
		}
	});

	var oTableSelectDialog16 = new TableSelectDialog("TableSelectDialog16", {
		title: "Delayed loading",
		noDataText: "Data is loading",
		contentWidth: "1000px",
		searchPlaceholder: "Placeholder text",
		columns: [
			fnCreateSimpleDialogColumns()
		]
	});

	var oButton16 = new Button("Button16", {
		text: "Select Dialog with delayed loading",
		press: function () {
			// open dialog
			oTableSelectDialog16.open();

			setTimeout(function () {
				// initiate model & bind Aggregation
				oTableSelectDialog16.setModel(oModel3);
				oTableSelectDialog16.bindAggregation("items", "/items", oItemTemplate1);
			}, 500);
		}
	});

	// create the application page
	var oPage = new Page("page", {
		title:"Mobile TableSelectDialog Control",
		content:[
			new VBox({
				renderType: "Bare",
				alignItems: "Start",
				items: [
					oInput1,
					oInput2,
					oButton3,
					oButton4,
					oButton5,
					oButton6,
					oButton7,
					oButton8,
					oButton9,
					oButton10,
					oButton11,
					oButton12,
					oButton13,
					oButton14,
					oButton15,
					oButton16
				]
			})
		]
	});

	var oApp = new App("myApp", {initialPage:"page"});
	oApp.addPage(oPage).placeAt("content");
});
