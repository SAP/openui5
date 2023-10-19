/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService",
	"sap/ui/model/odata/ODataListBinding",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/Filter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/List",
	"sap/m/DisplayListItem"
], function(
	fakeService,
	ODataListBinding,
	ODataModel,
	ODataFilter,
	Filter,
	FilterOperator,
	Sorter,
	List,
	ListItem
) {
	"use strict";

	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sURI = "/proxy/http/" + sURI.replace("http://","");

	function initModel(sURI, bJSON){
		var oModel = new ODataModel(sURI, bJSON);
		return oModel;
	}

	QUnit.test("ListBinding getLength, getContexts", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");

		var handler = function() {
			assert.equal(oBinding.getPath(), "/Categories", "ListBinding path");
			assert.ok(oBinding.getModel() == oModel, "ListBinding model");
			assert.equal(oBinding.getLength(), 8, "length of items");
			assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
			oBinding.getContexts().forEach(function(context, i){
				assert.equal(context.getPath(), "/Categories(" + (i + 1) + ")", "ListBinding context");
			});
			assert.equal(oBinding.getDownloadUrl(), sURI + "Categories");
			assert.equal(oBinding.getDownloadUrl("xlsx"), sURI + "Categories?$format=xlsx");
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};

		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("ListBinding getCurrentContexts", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");

		var handler = function() {
			var aCurrentContexts;
			oBinding.getContexts(0, 5);
			aCurrentContexts = oBinding.getCurrentContexts();

			assert.equal(aCurrentContexts.length, 5, "amount of items in current contexts");
			aCurrentContexts.forEach(function(context, i){
				assert.equal(context.getPath(), "/Categories(" + (i + 1) + ")", "ListBinding context");
			});
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("ListBinding relative with context", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("Products");
		var iCount = 0;

		var changeHandler = function() {
			iCount++;
			if (iCount == 1) {
				assert.equal(oBinding.getPath(), "Products", "ListBinding path");
				assert.ok(oBinding.getModel() == oModel, "ListBinding model");
				assert.equal(oBinding.getLength(), 5, "length of items");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				oBinding.setContext(null);
			} else {
				assert.equal(oBinding.getLength(), 0, "length of items");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				oBinding.detachChange(changeHandler);
				done(); // resume normal testing
			}
		};

		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.attachChange(changeHandler);
		oBinding.initialize();
		oModel.createBindingContext("/Categories(7)", function(oContext) {
			oBinding.setContext(oContext);
		});
	});

	QUnit.test("ListBinding with expand with empty data, runs only with sinon because of response manipulation!!!", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true, "Regions");
		var oBinding = oModel.bindList("/Regions", null,null,null, {expand:"Territories"});

		var handler = function() {
			assert.equal(oBinding.getPath(), "/Regions", "ListBinding path");
			assert.ok(oBinding.getModel() == oModel, "ListBinding model");

			oBinding.getContexts().forEach(function(context, i){
				assert.equal(context.getPath(), "/Regions(" + (i + 1) + ")", "ListBinding context");
			});


			var oBinding2 = oModel.bindList("/Regions(1)/Territories");
			assert.equal(oBinding2.getLength(), 0, "length of items");
			assert.equal(oBinding2.isLengthFinal(), true, "isLengthFinal");

			var handler2 = function() {
				assert.ok(false, "should not land here");
				oBinding2.detachChange(handler2);

			};
			oBinding2.attachChange(handler2);
			oBinding2.getContexts();

			// has 2 territories here
			var oBinding3 = oModel.bindList("/Regions(4)/Territories");
			assert.equal(oBinding3.getLength(), 2, "length of items");
			assert.equal(oBinding3.isLengthFinal(), true, "isLengthFinal");

			var handler3 = function() {
				assert.ok(false, "should not land here");
				oBinding3.detachChange(handler3);

			};
			oBinding3.attachChange(handler3);
			oBinding3.getContexts();

			oBinding.detachChange(handler);
			done(); // resume normal testing

		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("ListBinding sort", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		var handler3 = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding before sort");
			// resume normal testing
			done();
		};
		var handler2 = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding after 2nd sort");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Categories?$orderby=CategoryName%20asc");
			oBinding.detachChange(handler2);
			oBinding.sort(null);
			oBinding.attachChange(handler3);
			// resume normal testing
			done();
		};
		var handler1 =	function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Beverages", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Condiments", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Confections", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Dairy Products", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Grains/Cereals", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Meat/Poultry", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Produce", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Seafood", "ListBinding after sort");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Categories?$orderby=CategoryName%20desc");
			assert.equal(oBinding.getDownloadUrl("xlsx"), sURI + "Categories?$format=xlsx&$orderby=CategoryName%20desc");

			oBinding.detachChange(handler1);
			// ascending again
			var oSorter = new Sorter("CategoryName", false);
			oBinding.sort(oSorter);
			oBinding.attachChange(handler2);
			// fire first loading
			oBinding.getContexts();
		};

		var handler0 = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding before sort");

			oBinding.detachChange(handler0);
			// descending
			var oSorter = new Sorter("CategoryName", true);
			oBinding.sort(oSorter);
			oBinding.attachChange(handler1);
			// fire first loading
			oBinding.getContexts();
		};

		oBinding.attachChange(handler0);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("ListBinding expand", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories", null, null, null, {expand: "Products"});
		var handler = function() { // delay the following test
			var aContexts = oBinding.getContexts(),
				oContext = aContexts[0];
			assert.equal(oContext.getPath(), "/Categories(1)", "Context path");
			assert.ok(Array.isArray(oContext.getProperty("Products")), "Products loaded");
			done(); // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("ListBinding filter", function(assert){
		var done = assert.async();
		var handler = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "EQ filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "EQ filtered content");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Categories?$filter=CategoryName%20eq%20%27Beverages%27");
			assert.equal(oBinding.getDownloadUrl("xlsx"), sURI + "Categories?$format=xlsx&$filter=CategoryName%20eq%20%27Beverages%27");

			oBinding.detachChange(handler);
			// NE, contains
			oFilter = new Filter("CategoryName", FilterOperator.EQ, "Condiments");
			var oFilter2 = new Filter("CategoryName", FilterOperator.Contains, "ons");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler1);
			oBinding.getContexts();
		};
		var handler1 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "NE, contains, filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "EQ, Contains, filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Confections", "EQ, Contains, filtered content");

			oBinding.detachChange(handler1);
			// between
			oFilter = new Filter("CategoryName", FilterOperator.BT, "Beverages","D");
			oBinding.filter([oFilter]);
			oBinding.attachChange(handler2);
			oBinding.getContexts();
		};
		var handler2 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 3, "between filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[2]), "Confections", "between filtered content");

			oBinding.detachChange(handler2);
			// startsWith, endsWith
			oFilter = new Filter("CategoryName", FilterOperator.StartsWith, "C");
			var oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ngs");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler3);
			oBinding.getContexts();
		};
		var handler3 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "startsWith, endsWith filtered content");

			oBinding.detachChange(handler3);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.LE, value1: "Z"}, {operator:FilterOperator.GE, value1: "A"}, {operator:FilterOperator.NE, value1: "Beverages"}]);
			oBinding.filter([oFilter]);
			oBinding.attachChange(handler4);
			oBinding.getContexts();
		};
		var handler4 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 7, "sap.ui.model.odata.Filter, ANDed");
			assert.ok(oModel.getProperty("CategoryName",aFilteredContexts[0]) != "Beverages" && oModel.getProperty("CategoryName",aFilteredContexts[0]) == "Condiments", "sap.ui.model.odata.Filter, ANDed");

			oBinding.detachChange(handler4);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			oBinding.filter([oFilter]);
			oBinding.attachChange(handler5);
			oBinding.getContexts();
		};
		var handler5 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "sap.ui.model.odata.Filter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "sap.ui.model.odata.Filter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "sap.ui.model.odata.Filter, ORed");

			oBinding.detachChange(handler5);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			var oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ings");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler6);
			oBinding.getContexts();
		};
		var handler6 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "sap.ui.model.odata.Filter + normal Filter");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "sap.ui.model.odata.Filter + normal Filter");

			oBinding.detachChange(handler6);
			//check (ProductID=male AND (SupplierID = Green OR (CategoryName = Peter OR CategoryName = Frank OR CategoryName = Gina)))
			var oFilter1 = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
			var oFilter2 = new Filter("CategoryName", FilterOperator.EQ, "Dairy Products");
			var oFilter3 = new Filter("CategoryName", FilterOperator.EQ, "Grains/Cereals");
			var oMultiFilter1 = new Filter([oFilter1, oFilter2, oFilter3], false);
			var oFilter4 = new Filter("CategoryID", FilterOperator.EQ, 3);
			var oMultiFilter2 = new Filter([oMultiFilter1, oFilter4], false);
			var oFilter5 = new Filter("Description", FilterOperator.EndsWith, "s");
			var oMultiFilter3 = new Filter([oMultiFilter2, oFilter5], true);
			oBinding.filter(oMultiFilter3);
			oBinding.attachChange(handler7);
			oBinding.getContexts();
		};
		var handler7 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 3, "sap.ui.model.odata.Filter + normal Filter");
			//assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "sap.ui.model.odata.Filter + normal Filter");

			oBinding.detachChange(handler7);
			done();
		};
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
		oBinding.filter([oFilter]);
		oBinding.attachChange(handler);
		oBinding.getContexts();
	});

	QUnit.test("ListBinding ANDing Control and Application Filters", function(assert){
		var done = assert.async();

		//Test initial Application Filter handling
		var handler = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 9, "Only AppFilter, content length");
			assert.equal(oModel.getProperty("ProductName", aFilteredContexts[0]), "Chai", "Application Filter only, filtered content");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Products?$filter=startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m", "Application Filter only, URL-Params-Construction");

			oBinding.detachChange(handler);

			// Apply different Control filters
			var oFirstControlFilter = new Filter("ProductName", FilterOperator.Contains, "o");
			oBinding.filter([oFirstControlFilter]);

			oBinding.attachChange(handler1);
			oBinding.getContexts();

		};

		//Test Control and Application Filter ANDing
		var handler1 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 5, "ControlFilter AND AppFilter, content length");
			assert.equal(oModel.getProperty("ProductName", aFilteredContexts[0]), "Chef Anton's Cajun Seasoning", "ControlFilter AND AppFilter, filtered content");
			//check if the braces are set correct
			assert.equal(oBinding.getDownloadUrl(), sURI + "Products?$filter=substringof(%27o%27,ProductName)%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)", "Control and Application Filter, Braces when ANDed");

			oBinding.detachChange(handler1);

			// Apply different Control filters
			var oFilter = new Filter("UnitPrice", FilterOperator.LE, "30.000");
			oBinding.filter([oFilter]);

			oBinding.attachChange(handler2);
			oBinding.getContexts();

		};

		//check if different control filters were applied and ANDed with the application filters
		var handler2 = function (oEvent) {
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 6, "Changing the Control-Filters, content length");
			assert.equal(oModel.getProperty("ProductName", aFilteredContexts[0]), "Chai", "ControlFilter AND AppFilter, filtered content");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Products?$filter=UnitPrice%20le%2030.000m%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)", "Control and Application Filter, Braces when ANDed");

			oBinding.detachChange(handler2);

			//apply empty filter --> control-filters are reset
			oBinding.filter();

			oBinding.attachChange(handler3);
			oBinding.getContexts();
		};

		//after removing the control filters, check if only App-Filters are applied
		var handler3 = function (oEvent) {
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 9, "Reset to AppFilter, content length");
			assert.equal(oModel.getProperty("ProductName", aFilteredContexts[0]), "Chai", "Application Filter only, filtered content");
			assert.equal(oBinding.getDownloadUrl(), sURI + "Products?$filter=startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m", "Application Filter only, URL-Params-Construction");

			oBinding.detachChange(handler3);
			done();
		};

		//Initialise the stuff
		var oModel = initModel(sURI, false);
		var oApplicationFilter = [new Filter("ProductName", "StartsWith", "C"), new Filter("UnitPrice", "GE", "10.000")];
		var oBinding = oModel.bindList("/Products", null, null, oApplicationFilter);

		oBinding.attachChange(handler);
		oBinding.getContexts();
	});

	QUnit.test("ListBinding - Clearing Filters if application filters are empty", function (assert) {

		// Arrange
		var oModel = initModel(sURI, false, "Categories");

		// System under Test
		var oBinding = oModel.bindList("/Categories");

		// test filter with no params
		oBinding.sFilterParams = "$filter=foo%20and%20bar";
		oBinding.filter();
		assert.strictEqual(oBinding.sFilterParams, undefined, "filter() - Filter-Caching should be reset to 'undefined'");

		// test filter with empty array
		oBinding.sFilterParams = "$filter=foo%20and%20bar";
		oBinding.filter([]);
		assert.strictEqual(oBinding.sFilterParams, undefined, "filter([]) - Filter-Caching should be reset to 'undefined'");

	});

	QUnit.test("ListBinding Diff", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		oBinding.bUseExtendedChangeDetection = true;

		var handler = function(oEvent) {
			assert.deepEqual(oBinding.getContexts(0, 8).diff, [
				{ index: 0, type: "insert" },
				{ index: 1, type: "insert" },
				{ index: 2, type: "insert" },
				{ index: 3, type: "insert" },
				{ index: 4, type: "insert" },
				{ index: 5, type: "insert" },
				{ index: 6, type: "insert" },
				{ index: 7, type: "insert" }
			], "8 insertions");
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};
		oBinding.attachChange(handler);

		oBinding.getContexts(0, 8);
	});

	QUnit.test("Event order", function(assert){
		var done = assert.async();
		assert.expect(4);

		var bChanged = false, bDataRequested = false, bDataReceived = false;

		var fnChange = function(oEvent) {
			bChanged = true;
			assert.ok(bDataRequested && !bDataReceived,"change fired");
		};

		var fnDataRequested = function(oEvent) {
			bDataRequested = true;
			assert.ok(!bDataReceived && !bChanged,"dataRequested fired");
		};

		var fnDataReceived = function(oEvent) {
			bDataReceived = true;
			assert.ok(bChanged && bDataRequested,"dataRecieved fired");
			done();
		};

		var oModel = initModel(sURI, false, "Categories");
		var oList = new List();
		var oItem = new ListItem();
		oList.bindAggregation("items", {path:"/Categories", template: oItem, events:{change:fnChange, dataRequested:fnDataRequested, dataReceived:fnDataReceived}});
		oList.setModel(oModel);
		var handler = function(oEvent) {
			assert.equal(oList.getItems().length, 8, "items created");
		};
		oList.getBinding("items").attachChange(handler);
	});


	QUnit.test("ListBinding filter (sap.ui.model.odata.Filter.convert)", function(assert){
		var done = assert.async();
		var handler = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "EQ filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "EQ filtered content");

			oBinding.detachChange(handler);
			// NE, contains
			oFilter = new ODataFilter("CategoryName", [{
				operator: FilterOperator.EQ,
				value1: "Condiments"
			}, {
				operator: FilterOperator.Contains,
				value1: "ons"
			}], false);
			oBinding.filter(oFilter.convert());
			oBinding.attachChange(handler1);
			oBinding.getContexts();
		};
		var handler1 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "NE, contains, filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "EQ, Contains, filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Confections", "EQ, Contains, filtered content");

			oBinding.detachChange(handler1);
			// between
			oFilter = new ODataFilter("CategoryName", [{
				operator: FilterOperator.BT,
				value1: "Beverages",
				value2: "D"
			}]);
			oBinding.filter(oFilter.convert());
			oBinding.attachChange(handler2);
			oBinding.getContexts();
		};
		var handler2 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 3, "between filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[2]), "Confections", "between filtered content");

			oBinding.detachChange(handler2);
			// startsWith, endsWith
			oFilter = new ODataFilter("CategoryName", [{operator: FilterOperator.StartsWith, value1: "C"}]);
			var oFilter2 = new ODataFilter("Description", [{operator: FilterOperator.EndsWith, value1: "ngs"}]);
			oBinding.filter([oFilter.convert(), oFilter2.convert()]);
			oBinding.attachChange(handler3);
			oBinding.getContexts();
		};
		var handler3 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "startsWith, endsWith filtered content");

			oBinding.detachChange(handler3);
			oFilter = new ODataFilter("CategoryName", [{
				operator:FilterOperator.LE,
				value1: "Z"
			}, {
				operator:FilterOperator.GE,
				value1: "A"
			}, {
				operator:FilterOperator.NE,
				value1: "Beverages"
			}]);
			oBinding.filter(oFilter.convert());
			oBinding.attachChange(handler4);
			oBinding.getContexts();
		};
		var handler4 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 7, "sap.ui.model.odata.Filter, ANDed");
			assert.ok(oModel.getProperty("CategoryName",aFilteredContexts[0]) != "Beverages" && oModel.getProperty("CategoryName",aFilteredContexts[0]) == "Condiments", "sap.ui.model.odata.Filter, ANDed");

			oBinding.detachChange(handler4);
			oFilter = new ODataFilter("CategoryName", [{
				operator:FilterOperator.EQ,
				value1: "Condiments"
			}, {
				operator:FilterOperator.EQ,
				value1: "Beverages"
			}], false);
			oBinding.filter(oFilter.convert());
			oBinding.attachChange(handler5);
			oBinding.getContexts();
		};
		var handler5 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "sap.ui.model.odata.Filter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "sap.ui.model.odata.Filter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "sap.ui.model.odata.Filter, ORed");

			oBinding.detachChange(handler5);
			oFilter = new ODataFilter("CategoryName", [{
				operator:FilterOperator.EQ, value1: "Condiments"
			}, {
				operator:FilterOperator.EQ, value1: "Beverages"
			}], false);
			var oFilter2 = new ODataFilter("Description", [{
				operator: FilterOperator.EndsWith,
				value1: "ings"
			}]);
			oBinding.filter([oFilter.convert(), oFilter2.convert()]);
			oBinding.attachChange(handler6);
			oBinding.getContexts();
		};
		var handler6 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "sap.ui.model.odata.Filter + normal Filter");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "sap.ui.model.odata.Filter + normal Filter");

			oBinding.detachChange(handler6);
			done();
		};
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		//check EQ
		var oFilter = new ODataFilter("CategoryName", [{
			operator: FilterOperator.EQ,
			value1: "Beverages"
		}]);
		oBinding.attachChange(handler);
		oBinding.filter(oFilter.convert());
		oBinding.getContexts();
	});

	QUnit.test("Export to file URL", function(assert) {
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		var sUrl = oBinding.getDownloadUrl("csv");
		assert.equal(sUrl, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=csv", "Download URL for csv correctly constructed.");
		sUrl = oBinding.getDownloadUrl("xlsx");
		assert.equal(sUrl, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=xlsx", "Download URL for excel correctly constructed.");
	});

	QUnit.module("Unsupported Filters", {
		beforeEach : function() {
			this.oModel = initModel(sURI, false);
		},

		afterEach : function() {
			this.oModel.destroy();
		},

		getErrorWithMessage: function(sFilter) {
			return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
		}
	});

	QUnit.test("constructor - Any/All are rejected", function (assert) {
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				this.oModel.bindList("/teamMembers", undefined, undefined, [oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("filter() - Any/All are rejected", function(assert) {
		var oListBinding = this.oModel.bindList("/teamMembers", undefined, undefined, []);

		// "Any"" at last position fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.GT, "Wallace");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});
				oListBinding.filter([oFilter, oFilter2]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// "All" at first position fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id2", condition: new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Rush");
				oListBinding.filter([oFilter, oFilter2]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id3", condition: new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Bar");

				var oMultiFilter = new Filter({
					filters: [oFilter, oFilter2],
					and: false
				});

				oListBinding.filter([oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				oListBinding.filter([oMultiFilter]);
			},
			this.getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function(assert) {
		var oListBinding = this.oModel.bindList("/teamMembers", undefined, undefined, []);

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({path: "y", operator: FilterOperator.All, variable: "id1", condition: new Filter()});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				oListBinding.filter([oMultiFilter3]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function(assert) {
		var oListBinding = this.oModel.bindList("/teamMembers", undefined, undefined, []);

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({
			path: "y",
			operator: FilterOperator.All,
			variable: "id1",
			condition: new Filter([
				new Filter("t", FilterOperator.GT, 66),
				new Filter({path: "g", operator: FilterOperator.Any, variable: "id2", condition: new Filter("f", FilterOperator.NE, "hello")})
			], true)
		});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				oListBinding.filter([oMultiFilter3]);
			},
			this.getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataListBinding (Unit tests)");

	//*********************************************************************************************
	QUnit.test("getAllCurrentContexts: Return correct contexts", function (assert) {
		var aAllCurrentContexts,
			oBinding = {
				// eslint-disable-next-line no-sparse-arrays
				aKeys : ["foo(bar)", /* empty */, "foo(baz)"],
				oModel : {
					getContext : function () {}
				}
			},
			oModelMock = this.mock(oBinding.oModel);

		oModelMock.expects("getContext").withExactArgs("/foo(bar)").returns("~context(bar)");
		oModelMock.expects("getContext").withExactArgs("/foo(baz)").returns("~context(baz)");

		// code under test
		aAllCurrentContexts = ODataListBinding.prototype.getAllCurrentContexts.call(oBinding);

		assert.strictEqual(aAllCurrentContexts.length, 2);
		assert.deepEqual(aAllCurrentContexts, ["~context(bar)", "~context(baz)"]);
	});
});