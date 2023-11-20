/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/m/DisplayListItem",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/StandardListItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataModel",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService"
], function(Log, each, extend, DisplayListItem, List, Panel, StandardListItem, Filter,
	FilterOperator, FilterProcessor, FilterType, Sorter, CountMode, OperationMode, ODataModel,
	fakeService) {
	"use strict";

	var oModel;
	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sURI = "/proxy/http/" + sURI.replace("http://","");

	var oLogChecker = {
		init: function(){
			this.iLastLog = Log.getLogEntries().length;
		},

		getLogs: function(){
			return Log.getLogEntries().slice(this.iLastLog);
		}
	};

	function initModel(bJSON) {
		return new ODataModel(sURI, {
			json: bJSON,
			useBatch: true
		});
	}

	// Request security token to avoid later HEAD requests
	initModel().refreshSecurityToken();

	QUnit.module("v2.ODataListBinding", {
		beforeEach : function() {
			oModel = initModel(false);
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("ListBinding applyFilter with previous resetData", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories");
			var handler = function() {
				oBinding.resetData();
				oBinding.applyFilter();
				assert.ok(true, "Filter does not cause an exception");
				done(); // resume normal testing
			};
			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("ListBinding applyFilter creates combinedFilters", function(assert){
		var done = assert.async();
		var oCombineFilterSpy = sinon.spy(FilterProcessor, "combineFilters");


		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories");
			var handler = function() {
				oBinding.applyFilter();
				assert.ok(true, "Filter does not cause an exception");
				// combineFilters is called the first time when the binding gets initialized
				assert.equal(oCombineFilterSpy.callCount, 2, "FilterProcessor.combineFilters should be called a second time after applyFilter.");
				done();
			};
			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
		});
	});

	QUnit.test("ListBinding getLength, getContexts", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories");
			var handler = function() {
				assert.equal(oBinding.getPath(), "/Categories", "ListBinding path");
				assert.ok(oBinding.getModel() == oModel, "ListBinding model");
				assert.equal(oBinding.getLength(), 8, "length of items");
				each(oBinding.getContexts(), function(i, context){
					assert.equal(context.getPath(), "/Categories(" + (i + 1) + ")", "ListBinding context");
				});
				oBinding.detachChange(handler);
				done(); // resume normal testing
			};
			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("ListBinding: Length calculation no count", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: CountMode.None} );
			var handler = function() {
				assert.equal(oBinding.getPath(), "/Categories", "ListBinding path");
				assert.ok(oBinding.getModel() == oModel, "ListBinding model");
				assert.equal(oBinding.getLength(), 16, "length of items");
				assert.equal(oBinding.isLengthFinal(), false, "length not final");
				oBinding.detachChange(handler);
				oBinding.attachChange(function() {
					assert.equal(oBinding.getLength(), 8, "length of items");
					assert.equal(oBinding.isLengthFinal(), true, "length final");
					done(); // resume normal testing
				});
				oBinding.getContexts(8,8);
			};
			oBinding.attachRefresh(function() {
				oBinding.getContexts(0,8);
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("Sorted ListBinding, property of previously excluded category changes => change should be detected & sorting re-applied", function(assert){
		var done = assert.async();
		var getContextPaths = function(oBinding) {
			return oBinding.getContexts().map(function(oContext) {
				return oContext.getPath();
			});
		};
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories", null, [], [], {
				operationMode: "Client"
			});

			var filterChangeHandler = function() {
				assert.equal(oBinding.getLength(), 8, "length of items");

				var aPaths = getContextPaths(oBinding);
				assert.deepEqual(aPaths, [
					"/Categories(2)",
					"/Categories(3)",
					"/Categories(4)",
					"/Categories(5)",
					"/Categories(6)",
					"/Categories(7)",
					"/Categories(1)",
					"/Categories(8)"], "After modification sort order is different");

				oBinding.detachChange(filterChangeHandler);
				done(); // resume normal testing
			};

			var handler = function() {
				oBinding.detachChange(handler);

				oBinding.sort([new Sorter("CategoryName", false)]);


				var aPaths = getContextPaths(oBinding);
				assert.deepEqual(aPaths, [
					"/Categories(1)",
					"/Categories(2)",
					"/Categories(3)",
					"/Categories(4)",
					"/Categories(5)",
					"/Categories(6)",
					"/Categories(7)",
					"/Categories(8)"], "Sorted by Name");
				// Sorted in order
				oBinding.attachChange(filterChangeHandler);
				oBinding.getModel().setProperty("/Categories(1)/CategoryName", "Seafood");
				// Now items should be ordered differently
			};



			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("Filtered ListBinding, property of previously excluded category changes => change should be detected & filter re-applied", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories", null, [], [], {
				operationMode: "Client"
			});

			var filterChangeHandler = function() {
				assert.equal(oBinding.getLength(), 2, "length of items");
				assert.equal(oBinding.getContexts()[0].getPath(), "/Categories(1)", "ListBinding context");
				assert.equal(oBinding.getContexts()[1].getPath(), "/Categories(8)", "ListBinding context");

				oBinding.detachChange(filterChangeHandler);
				done(); // resume normal testing
			};

			var handler = function() {
				oBinding.detachChange(handler);

				oBinding.filter([new Filter({
					path: "CategoryName",
					operator: "EQ",
					value1: "Seafood"
				})]);

				// Only Categories(8) matches
				oBinding.attachChange(filterChangeHandler);
				oBinding.getModel().setProperty("/Categories(1)/CategoryName", "Seafood");
				// Now Categories(8) and Categories(0) match
			};



			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("Filtered ListBinding, property of previously included category changes => change should be detected & filter re-applied", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			var oBinding = oModel.bindList("/Categories", null, [], [], {
				operationMode: "Client"
			});
			var handler = function() {
				oBinding.detachChange(handler);
				oBinding.filter([new Filter({
					path: "CategoryName",
					operator: "EQ",
					value1: "Seafood"
				})]);
				// Only Categories(8) matches

				oBinding.attachChange(filterChangeHandler);
				oBinding.getModel().setProperty("/Categories(8)/CategoryName", "Other");
				// Now nothing matches
			};

			var filterChangeHandler = function() {
				assert.equal(oBinding.getLength(), 0, "length of items");

				oBinding.detachChange(filterChangeHandler);
				done(); // resume normal testing
			};

			oBinding.attachRefresh(function() {
				oBinding.getContexts();
			});
			oBinding.attachChange(handler);
			oBinding.initialize();
			// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		});
	});

	QUnit.test("Filtered Expanded ListBinding, property of previously included category changes => change should be detected & filter re-applied", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			oModel.createBindingContext("/Categories(7)", {
				expand: "Products"
			}, function (oContext) {
				var oBinding = oModel.bindList("Products", oContext, [], [], {
					operationMode: "Client"
				});
				var handler = function() {
					oBinding.detachChange(handler);

					oBinding.filter([new Filter({
						path: "ProductName",
						operator: "EQ",
						value1: "Tofu"
					})]);
					// Only Products(14) matches

					oBinding.attachChange(filterChangeHandler);

					oBinding.getModel().setProperty("/Products(14)/ProductName", "Other");
					// Now nothing matches
				};

				var filterChangeHandler = function() {
					assert.equal(oBinding.getLength(), 0, "length of items");

					oBinding.detachChange(filterChangeHandler);
					done(); // resume normal testing
				};

				oBinding.attachRefresh(function() {
					oBinding.getContexts();
				});
				oBinding.attachChange(handler);
				oBinding.initialize();
				// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
			});
		});

	});

	QUnit.test("Filtered Expanded ListBinding, property of previously excluded category changes => change should be detected & filter re-applied", function(assert){
		var done = assert.async();
		oModel.metadataLoaded().then(function(){
			oModel.createBindingContext("/Categories(7)", {
				expand: "Products"
			}, function (oContext) {
				var oBinding = oModel.bindList("Products", oContext, [], [], {
					operationMode: "Client"
				});
				var handler = function() {
					oBinding.detachChange(handler);
					oBinding.filter([new Filter({
						path: "ProductName",
						operator: "EQ",
						value1: "Tofu"
					})]);
					// Only Products(14) matches

					oBinding.attachChange(filterChangeHandler);
					oBinding.getModel().setProperty("/Products(7)/ProductName", "Tofu");
					// Now Products(14) and Products(7) match
				};

				var filterChangeHandler = function() {
					assert.equal(oBinding.getLength(), 2, "length of items");
					assert.equal(oBinding.getContexts()[0].getPath(), "/Products(7)", "ListBinding context");
					assert.equal(oBinding.getContexts()[1].getPath(), "/Products(14)", "ListBinding context");

					oBinding.detachChange(filterChangeHandler);
					done(); // resume normal testing
				};

				oBinding.attachRefresh(function() {
					oBinding.getContexts();
				});
				oBinding.attachChange(handler);
				oBinding.initialize();
				// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
			});
		});
	});

	QUnit.test("ListBinding getCurrentContexts", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories");

		var handler = function() {
			oBinding.getContexts(0, 5);
			var aCurrentContexts = oBinding.getCurrentContexts();

			assert.equal(aCurrentContexts.length, 5, "amount of items in current contexts");
			aCurrentContexts.forEach(function(context, i) {
				assert.equal(context.getPath(), "/Categories(" + (i + 1) + ")", "ListBinding context");
			});
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
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

	QUnit.test("ListBinding relative with context and expanded list", function(assert){
		var done = assert.async();
		var oModel = initModel(false);
		var oBinding = oModel.bindList("Supplier/Products");
		var iCount = 0;

		// Requests:
		// /Products(3)?$expand=Supplier/Products
		// /Products(7)?$expand=Supplier/Products
		// /Products(7)/Supplier/Products

		var changeHandler = function() {
			iCount++;

			// trigger data requests
			oBinding.getContexts();

			if (iCount === 1) {
				assert.equal(oBinding.getLength(), 0, "0 entries retrieved (/Products(7))");
			} else if (iCount === 2) {
				assert.equal(oBinding.getLength(), 3, "3 entries retrieved (/Products(3))");
				oBinding.detachChange(changeHandler);
				done();
			}
		};

		oBinding.attachChange(changeHandler);
		oBinding.initialize();

		// /Products(7)/Supplier --> null
		oModel.createBindingContext("/Products(7)", undefined, {expand: "Supplier/Products"}, function(oContext7null) {

			// /Products(3)/Supplier/Products --> [3,2,1]
			oModel.createBindingContext("/Products(3)", undefined, {expand: "Supplier/Products"}, function(oContext3) {
				oBinding.setContext(oContext7null);
				oBinding.setContext(oContext3);
			});
		});
	});

	QUnit.test("ListBinding relative with context and client-side filters", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("Products");
		var iCount = 0;

		var changeHandler = function() {
			iCount++;
			var oContext;
			if (iCount == 1) {
				// expanded entries will be filtered on the client
				assert.equal(oBinding.getPath(), "Products", "ListBinding path");
				assert.ok(oBinding.getModel() == oModel, "ListBinding model");
				assert.equal(oBinding.getLength(), 1, "length of items after filtering");
				oContext = oBinding.getContexts(0, 1)[0];
				assert.equal(oContext.getProperty("ProductName"), "Uncle Bob's Organic Dried Pears");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				oBinding.setContext(null);
			} else if (iCount == 2) {
				assert.equal(oBinding.getLength(), 0, "length of items");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				oContext = oModel.createBindingContext("/Categories(7)", undefined, {expand: "Products"});
				oBinding.setContext(oContext);
			} else if (iCount == 3) {
				assert.equal(oBinding.getLength(), 1, "length of items after filtering");
				oContext = oBinding.getContexts(0, 1)[0];
				assert.equal(oContext.getProperty("ProductName"), "Uncle Bob's Organic Dried Pears");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				// Modify binding so a change can be detected, although data returned by the server is the same
				oBinding.aExpandRefs = [];
				oBinding.aLastContexts = [];
				oModel.createBindingContext("/Categories(7)", undefined, {expand: "Products"}, function() {}, true);
			} else {
				assert.equal(oBinding.getLength(), 1, "length of items after filtering");
				oContext = oBinding.getContexts(0, 1)[0];
				assert.equal(oContext.getProperty("ProductName"), "Uncle Bob's Organic Dried Pears");
				assert.equal(oBinding.isLengthFinal(), true, "isLengthFinal");
				oBinding.detachChange(changeHandler);
				done(); // resume normal testing
			}
		};

		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.attachChange(changeHandler);
		oModel.metadataLoaded().then(function() {
			oBinding.initialize();
			oBinding.filter(new Filter("ProductName", "Contains", "Uncle"));
			oModel.createBindingContext("/Categories(7)", undefined, {expand: "Products"}, function(oContext) {
				oBinding.setContext(oContext);
			});
		});
	});

	QUnit.test("ListBinding relative with context and refresh is needed", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("Products");
		var iCount = 0;

		function changeHandler() {
			if (iCount === 0) {
				var aContexts = oBinding.getContexts();
				assert.equal(aContexts.length, 5, "List contains entries");
				assert.equal(aContexts[0].getProperty("ProductName"), "Uncle Bob's Organic Dried Pears", "Product name is available now");
				done();
			} else {
				assert.ok(false, "Must not change a third time.");
			}
			iCount++;
		}

		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.attachChange(changeHandler);
		oModel.metadataLoaded().then(function() {
			oBinding.initialize();
			oModel.createBindingContext("/Categories(7)", undefined, {expand: "Products", select: "Products/ProductID"}, function(oContext) {
				oBinding.setContext(oContext);
			});
		});
	});


	QUnit.test("ListBinding sort", function(assert){
		var done = assert.async();
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
			oBinding.detachChange(handler2);
			oBinding.sort(null);
			oBinding.attachChange(handler3);
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

			oBinding.detachChange(handler1);
			// ascending again
			var oSorter = new Sorter("CategoryName", false);
			oBinding.sort(oSorter);
			oBinding.attachChange(handler2);

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

		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler0);
	});

	QUnit.test("ListBinding clientside sort", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories", null, null, null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding before sort");

			oBinding.detachChange(handler);
			// descending
			var oSorter = new Sorter("CategoryName", true);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Beverages", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Condiments", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Confections", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Dairy Products", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Grains/Cereals", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Meat/Poultry", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Produce", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Seafood", "ListBinding after sort");

			// ascending again
			oSorter = new Sorter("CategoryName", false);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding after 2nd sort");

			oBinding.sort(null);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Condiments", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Confections", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Dairy Products", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Grains/Cereals", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Meat/Poultry", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Produce", "ListBinding before sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "ListBinding before sort");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside sort on Edm.Decimal", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("UnitPrice"), null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding after initial sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding after initial sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding after initial sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding after initial sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding after initial sort");

			oBinding.detachChange(handler);
			// descending
			var oSorter = new Sorter("UnitPrice", true);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "97.0000", "ListBinding after sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "81.0000", "ListBinding after sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "62.5000", "ListBinding after sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "40.0000", "ListBinding after sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "39.0000", "ListBinding after sort");

			// ascending again
			oSorter = new Sorter("UnitPrice", false);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding after 2nd sort");

			oBinding.sort(null);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "18.0000", "ListBinding unsorted");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "19.0000", "ListBinding unsorted");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding unsorted");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "22.0000", "ListBinding unsorted");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "21.3500", "ListBinding unsorted");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside sort with null values", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("ReorderLevel"), null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[0]), null, "ListBinding after initial sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[1]), 0, "ListBinding after initial sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[2]), 0, "ListBinding after initial sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[3]), 0, "ListBinding after initial sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[4]), 0, "ListBinding after initial sort");

			oBinding.detachChange(handler);
			// descending
			var oSorter = new Sorter("ReorderLevel", true);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[0]), 30, "ListBinding after sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[1]), 25, "ListBinding after sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[2]), 25, "ListBinding after sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[3]), 10, "ListBinding after sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[4]), 10, "ListBinding after sort");

			// ascending again
			oSorter = new Sorter("ReorderLevel", false);
			oBinding.sort(oSorter);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[0]), null, "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[1]), 0, "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[2]), 0, "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[3]), 0, "ListBinding after 2nd sort");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[4]), 0, "ListBinding after 2nd sort");

			oBinding.sort(null);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[0]), 10, "ListBinding unsorted");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[1]), null, "ListBinding unsorted");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[2]), 25, "ListBinding unsorted");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[3]), 0, "ListBinding unsorted");
			assert.equal(oModel.getProperty("ReorderLevel", aContexts[4]), 0, "ListBinding unsorted");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside sort before data is available", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories", null, null, null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			oBinding.detachChange(handler);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);

			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Beverages", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[6]), "Condiments", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[5]), "Confections", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[4]), "Dairy Products", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[3]), "Grains/Cereals", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[2]), "Meat/Poultry", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[1]), "Produce", "ListBinding after sort");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Seafood", "ListBinding after sort");
			assert.equal(oEvent.getParameter("reason"), "sort", "Change reason is 'sort'.");
			done();
		};

		oModel.metadataLoaded().then(function () {
			oBinding.initialize();

			// sort in client mode, before data is available
			var oSorter = new Sorter("CategoryName", true);
			oBinding.sort(oSorter);

			oBinding.attachChange(handler);
			oBinding.getContexts();
		});

	});

	//error cases
	QUnit.test("ListBinding Client Mode - Error in Initial Request", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/CategoriesError", null, null, null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			oBinding.detachChange(handler);
			assert.ok(oBinding.bDataAvailable);
			assert.ok(Array.isArray(oBinding.aAllKeys) && oBinding.aAllKeys.length === 0, "AllKeys Array was correctly set to an empty array after an error from the GET request.");
			done();
		};

		oModel.metadataLoaded().then(function () {
			oBinding.initialize();

			// sort in client mode, before data is available
			oBinding.attachChange(handler);
			oBinding.getContexts();
		});

	});

	QUnit.test("ListBinding Client Mode - Error - bind single entity to list", function(assert){
		var done = assert.async();
		oLogChecker.init();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});

		//invalid Binding to empty path
		var oListBinding = oModel.bindList("", null, null,  null, {
			operationMode: OperationMode.Client
		});
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for entity with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var iCalls = 0;
		var aExpandRefs;
		var listhandler = function(oEvent) {

			iCalls++;
			assert.equal(oEvent.sId, "change");

			if (iCalls === 1) {
				var aContexts = oListBinding.getContexts();
				assert.equal(aContexts.length, 0, "1 entry contained");
				aExpandRefs = extend({}, oListBinding.aExpandRefs);
			} else if (iCalls === 2) {
				var aNewExpandRefs = extend({}, oListBinding.aExpandRefs);
				assert.deepEqual(aNewExpandRefs, aExpandRefs, "must not be modified");
				oListBinding.detachChange(listhandler);

				var aFiltered = oLogChecker.getLogs().filter(function(oLogEntry){
					return oLogEntry.message === "List Binding is not bound against a list for /Categories(1)";
				});
				assert.ok(aFiltered.length > 0, "there should be type errors since it's a single entity within the list");

				done();
			}
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding Client Mode - value list", function(assert){
		var done = assert.async();
		oLogChecker.init();
		var oSpy = sinon.spy(oModel, "_request");
		oModel.oMetadata.mEntitySets = undefined;
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});

		var oAddRes = oModel.addAnnotationUrl("$metadata?sap-value-list=Test");
			assert.ok(!oModel.oMetadata.mEntitySets, "entity set cache should be invalidated");
			//invalid Binding to empty path
			var oListBinding = oModel.bindList("Products", null, null,  null, {
				operationMode: OperationMode.Client
			});
			var handler = function() {

				oAddRes.then(function() {
					assert.ok(oSpy.calledOnce, "Request sent for entity with expand");
					oSpy.reset();
					//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
					setTimeout(function() {
						oListBinding.initialize();
						oBinding.detachChange(handler);
						oListBinding.attachRefresh(function() {oListBinding.getContexts();});
						oListBinding.attachChange(listhandler);
						oListBinding.setContext(oBinding.getBoundContext());
					}, 0);
				});
			};
			var listhandler = function(oEvent) {
				assert.ok(oModel.oMetadata.mEntitySets, "entity set cache should be filled");
				assert.equal(Object.keys(oModel.oMetadata.mEntitySets).length, 26, "entity set should contain 5 entries");

				assert.equal(oEvent.sId, "change");

				var aContexts = oListBinding.getContexts();
				assert.equal(aContexts.length, 12, "12 entries contained");
				oListBinding.detachChange(listhandler);
				done();
			};
			oBinding.attachChange(handler);

	});

	QUnit.test("ListBinding expand", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories", null, null, null, {expand: "Products"});
		var handler = function() { // delay the following test
			var aContexts = oBinding.getContexts(),
				oContext = aContexts[0];
			assert.equal(oContext.getPath(), "/Categories(1)", "Context path");
			assert.ok(Array.isArray(oContext.getProperty("Products")), "Products loaded");
			done(); // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding filter", function(assert){
		var done = assert.async();
		var oFilter, oFilter2, oBinding;
		var handler = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "EQ filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "EQ filtered content");

			oBinding.detachChange(handler);
			// NE, contains
			oFilter = new Filter("CategoryName", FilterOperator.EQ, "Condiments");
			var oFilter2 = new Filter("CategoryName", FilterOperator.Contains, "ons");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler1);
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
			oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ngs");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler3);
		};
		var handler3 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "startsWith, endsWith filtered content");

			oBinding.detachChange(handler3);
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
			oBinding.attachChange(handler4);
		};
		var handler4 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 3, "normal Filter");
			oBinding.detachChange(handler4);
			done();
		};

		oBinding = oModel.bindList("/Categories");
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");

		var fnFilter = function() {
			oBinding.detachRefresh(fnFilter);
			oBinding.attachRefresh(function() {oBinding.getContexts();});
			oBinding.filter([oFilter]);
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(fnFilter);
	});

	QUnit.test("ListBinding filter aborted", function(assert){
		var done = assert.async();
		var oRequestedSpy, oReceivedSpy;

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8, "EQ unfiltered content length");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "EQ unfiltered content");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "EQ unfiltered content");
			oBinding.detachChange(handler);
			setTimeout(handler2, 0);
		};
		var handler2 = function() {
			// data requested and data received should only be called once
			assert.ok(oRequestedSpy.calledOnce, "fireDataRequested has only be called once");
			assert.ok(oReceivedSpy.calledOnce, "fireDataReceived has only be called once");
			oRequestedSpy.restore();
			oReceivedSpy.restore();
			done();
		};
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None"});
		oRequestedSpy = sinon.spy(oBinding, "fireDataRequested");
		oReceivedSpy = sinon.spy(oBinding, "fireDataReceived");
		oBinding.initialize();
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
		var fnSent = function() {
			oModel.detachRequestSent(fnSent);
			oBinding.filter([]);
		};
		oModel.attachRequestSent(fnSent);
		oBinding.filter([oFilter]);
	});

	QUnit.test("ListBinding filter aborted due to sort", function(assert){
		var done = assert.async();
		var oRequestedSpy, oReceivedSpy;

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 8, "EQ unfiltered content length");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "EQ unfiltered content");
			assert.equal(oModel.getProperty("CategoryName", aContexts[7]), "Seafood", "EQ unfiltered content");
			oBinding.detachChange(handler);
			setTimeout(handler2, 0);
		};
		var handler2 = function() {
			// data requested and data received should only be called once
			assert.ok(oRequestedSpy.calledOnce, "fireDataRequested has only be called once");
			assert.ok(oReceivedSpy.calledOnce, "fireDataReceived has only be called once");
			oRequestedSpy.restore();
			oReceivedSpy.restore();
			done();
		};
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None"});
		oRequestedSpy = sinon.spy(oBinding, "fireDataRequested");
		oReceivedSpy = sinon.spy(oBinding, "fireDataReceived");
		oBinding.initialize();

		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
		oBinding.filter([]);
		oBinding.sort([]);
	});

	QUnit.test("ListBinding sort after filter", function(assert){
		var done = assert.async();
		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts(0, 1);
			assert.equal(aContexts.length, 1, "EQ context length");
			assert.equal(oBinding.getLength(), 8, "EQ $count length");
			assert.equal(oBinding.isLengthFinal(), true, "length is final");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "EQ unfiltered content");

			oBinding.detachChange(handler);
			done();
		};
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "Request"});
		oBinding.initialize();
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages"),
			oSorter = new Sorter("CategoryName");
		oBinding.attachRefresh(function() {
			oBinding.getContexts(0, 1);
		});
		oBinding.attachChange(handler);
		var fnSent = function() {
			oModel.detachRequestSent(fnSent);
			oBinding.filter();
			oBinding.sort(oSorter);
		};
		oModel.attachRequestSent(fnSent);
		oBinding.filter([oFilter]);
	});

	QUnit.test("ListBinding filter multiple times", function(assert){
		var done = assert.async();
		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oEvent.oSource.getContexts();
			assert.equal(aContexts.length, 1, "filtered content length 1");
			assert.equal(oModel.getProperty("CategoryName", aContexts[0]), "Beverages", "EQ unfiltered content");
			assert.equal(oBinding.getLength(), 1, "Binding length should be 1");
			oBinding.detachChange(handler);
			fakeService.setResponseDelay(10);
			done();
		};

		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None"});
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
		var oFilter2 = new Filter("CategoryName", FilterOperator.EQ, "Condiments");
		var oFilter3 = new Filter("CategoryName", FilterOperator.Contains, "ons");

		oModel.metadataLoaded().then(function() {
			oBinding.bUseExtendedChangeDetection = true;
			oBinding.initialize();
			oBinding.attachChange(handler);
			fakeService.setResponseDelay(250);
			setTimeout(function() {
				oBinding.getContexts();
				oBinding.filter([oFilter2,oFilter3]);
				oBinding.getContexts();
			},150);
			setTimeout(function() {
				oBinding.filter([oFilter2,oFilter3]);
				oBinding.getContexts();
				oBinding.getContexts();
			},250);
			setTimeout(function() {
				oBinding.filter([oFilter]);
				oBinding.getContexts();
			},450);
		});
	});

	QUnit.module("Clientmode Filtering", {
		beforeEach : function() {
			oModel = initModel(false);
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("ListBinding clientside filter", function(assert){
		var done = assert.async();

		var oBinding = oModel.bindList("/Categories", null, null, null, {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent) {
			// contexts should be now loaded
			var aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 1, "EQ filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "EQ filtered content");

			oBinding.detachChange(handler);
			// NE, contains
			var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Condiments");
			var oFilter2 = new Filter("CategoryName", FilterOperator.Contains, "ons");
			oBinding.filter([oFilter, oFilter2]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 2, "NE, contains, filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "EQ, Contains, filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Confections", "EQ, Contains, filtered content");

			// between
			oFilter = new Filter("CategoryName", FilterOperator.BT, "Beverages","D");
			oBinding.filter([oFilter]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 3, "between filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[2]), "Confections", "between filtered content");

			// not between
			oFilter = new Filter("CategoryName", FilterOperator.NB, "Beverages","D");
			oBinding.filter([oFilter]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 5, "not between filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Dairy Products", "not between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Grains/Cereals", "not between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[2]), "Meat/Poultry", "not between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[3]), "Produce", "not between filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[4]), "Seafood", "not between filtered content");

			// startsWith, endsWith
			oFilter = new Filter("CategoryName", FilterOperator.StartsWith, "C");
			oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ngs");
			oBinding.filter([oFilter, oFilter2]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 1, "startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "startsWith, endsWith filtered content");


			// not startsWith, endsWith
			oFilter = new Filter("CategoryName", FilterOperator.NotStartsWith, "C");
			oFilter2 = new Filter("CategoryName", FilterOperator.NotEndsWith, "ts");
			oBinding.filter([oFilter, oFilter2]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 7, "not startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Confections", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[2]), "Dairy Products", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[3]), "Grains/Cereals", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[4]), "Meat/Poultry", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[5]), "Produce", "not startsWith, endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[6]), "Seafood", "not startsWith, endsWith filtered content");


			// not startsWith AND not endsWith
			var oAndFilter1 = new Filter([oFilter, oFilter2], true);
			oBinding.filter(oAndFilter1);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 5, "not startsWith and not endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName", aFilteredContexts[0]), "Beverages", "not startsWith and not endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName", aFilteredContexts[1]), "Grains/Cereals", "not startsWith and not endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName", aFilteredContexts[2]), "Meat/Poultry", "not startsWith and not endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName", aFilteredContexts[3]), "Produce", "not startsWith and not endsWith filtered content");
			assert.equal(oModel.getProperty("CategoryName", aFilteredContexts[4]), "Seafood", "not startsWith and not endsWith filtered content");

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

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 3, "normal Filter");

			done();
		};
		//check EQ
		var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
		oBinding.filter([oFilter]);

		oBinding.attachChange(handler);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
	});

	QUnit.test("ListBinding clientside filter on Edm.Decimal", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("UnitPrice"), [new Filter("UnitPrice", "EQ", "10.0000")], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 1);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "10.0000", "ListBinding after initial filter");

			oBinding.detachChange(handler);
			// LT
			var oFilter = new Filter("UnitPrice", "LT", "17.4500");
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,4);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding after LT filter");

			// GE
			oFilter = new Filter("UnitPrice", "GE", "39.0000");
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 5);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "39.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "40.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "62.5000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "81.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "97.0000", "ListBinding after GE filter");

			oBinding.filter([], FilterType.Application);
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding unfiltered");

			// GT
			oFilter = new Filter("UnitPrice", "BT", "35.0000", "82.000");
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 5);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "38.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "39.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "40.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "62.5000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "81.0000", "ListBinding after BT filter");

			oBinding.filter([], FilterType.Application);
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter on Edm.Decimal with number value", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("UnitPrice"), [new Filter("UnitPrice", "EQ", "10.0000")], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 1);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "10.0000", "ListBinding after initial filter");

			oBinding.detachChange(handler);

			// EQ
			var oFilter = new Filter("UnitPrice", "EQ", 15.5);
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,1);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "15.5000", "ListBinding after EQ filter");

			// LT
			oFilter = new Filter("UnitPrice", "LT", 17.45);
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,4);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding after LT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding after LT filter");

			// GE
			oFilter = new Filter("UnitPrice", "GE", 39);
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 5);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "39.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "40.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "62.5000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "81.0000", "ListBinding after GE filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "97.0000", "ListBinding after GE filter");

			oBinding.filter([], FilterType.Application);
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding unfiltered");

			// GT
			oFilter = new Filter("UnitPrice", "BT", 35, 82);
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 5);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "38.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "39.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "40.0000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "62.5000", "ListBinding after BT filter");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "81.0000", "ListBinding after BT filter");

			oBinding.filter([], FilterType.Application);
			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("UnitPrice", aContexts[0]), "6.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[1]), "9.2000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[2]), "10.0000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[3]), "15.5000", "ListBinding unfiltered");
			assert.equal(oModel.getProperty("UnitPrice", aContexts[4]), "17.4500", "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter on Edm.Int32", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("ProductID"), [new Filter("ProductID", "EQ", 1)], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 1);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding after initial filter");

			oBinding.detachChange(handler);

			// EQ
			var oFilter = new Filter("ProductID", "EQ", 3);
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,1);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 3, "ListBinding after LT filter");

			// LT
			var oFilter = new Filter("ProductID", "LT", 5);
			oBinding.filter([oFilter], FilterType.Application);

			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,4);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[1]), 2, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[2]), 3, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[3]), 4, "ListBinding after LT filter");

			// Reset
			oBinding.filter([], FilterType.Application);
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[1]), 2, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[2]), 3, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[3]), 4, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[4]), 5, "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter on Edm.Int32 with string value", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Products", null, new Sorter("ProductID"), [new Filter("ProductID", "EQ", 1)], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 1);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding after initial filter");

			oBinding.detachChange(handler);

			// EQ
			var oFilter = new Filter("ProductID", "EQ", "3");
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,1);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 3, "ListBinding after LT filter");

			// LT
			oFilter = new Filter("ProductID", "LT", "5");
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length,4);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[1]), 2, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[2]), 3, "ListBinding after LT filter");
			assert.equal(oModel.getProperty("ProductID", aContexts[3]), 4, "ListBinding after LT filter");

			// Reset
			oBinding.filter([], FilterType.Application);
			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 20);
			assert.equal(oModel.getProperty("ProductID", aContexts[0]), 1, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[1]), 2, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[2]), 3, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[3]), 4, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("ProductID", aContexts[4]), 5, "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter on Edm.Single", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Invoices", null, new Sorter("Discount"), [new Filter("Discount", "EQ", 0.05)], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 2);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0.05, "ListBinding after initial filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0.05, "ListBinding after intital filter");

			oBinding.detachChange(handler);

			// EQ
			var oFilter = new Filter("Discount", "EQ", 0);
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 6);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[2]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[3]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[4]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[5]), 0, "ListBinding after EQ filter");

			// GT
			oFilter = new Filter("Discount", "GT", 0);
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 2);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0.05, "ListBinding after GT filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0.05, "ListBinding after GT filter");

			// Reset
			oBinding.filter([], FilterType.Application);
			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[2]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[3]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[4]), 0, "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter on Edm.Single with string value", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Invoices", null, new Sorter("Discount"), [new Filter("Discount", "EQ", 0.05)], {
			operationMode: OperationMode.Client
		});

		var handler = function(oEvent){
			// contexts should be now loaded
			var aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 2);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0.05, "ListBinding after initial filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0.05, "ListBinding after initial filter");

			oBinding.detachChange(handler);

			// EQ
			var oFilter = new Filter("Discount", "EQ", "0");
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 6);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[2]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[3]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[4]), 0, "ListBinding after EQ filter");
			assert.equal(oModel.getProperty("Discount", aContexts[5]), 0, "ListBinding after EQ filter");

			// GT
			oFilter = new Filter("Discount", "GT", "0");
			oBinding.filter([oFilter], FilterType.Application);

			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 2);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0.05, "ListBinding after GT filter");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0.05, "ListBinding after GT filter");

			// Reset
			oBinding.filter([], FilterType.Application);
			aContexts = oBinding.getContexts();
			assert.equal(aContexts.length, 8);
			assert.equal(oModel.getProperty("Discount", aContexts[0]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[1]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[2]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[3]), 0, "ListBinding unfiltered");
			assert.equal(oModel.getProperty("Discount", aContexts[4]), 0, "ListBinding unfiltered");

			done();
		};
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding clientside filter before data is available", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories", null, null, null, {
			operationMode: OperationMode.Client
		});

		var handler = function (oEvent) {
			oBinding.detachChange(handler);

			// contexts should be now loaded
			var aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 1, "EQ filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "EQ filtered content");

			assert.equal(oEvent.getParameter("reason"), "filter", "Change reason is 'filter'.");

			done();
		};

		oModel.metadataLoaded().then(function () {
			oBinding.initialize();
			//check EQ
			var oFilter = new Filter("CategoryName", FilterOperator.EQ, "Beverages");
			oBinding.filter([oFilter]);

			oBinding.attachChange(handler);
			oBinding.getContexts();
		});

	});

	QUnit.module("Servermode Filtering JSON", {
		beforeEach : function() {
			oModel = initModel(true);
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
		}
	});


	QUnit.test("ListBinding sorting with expanded list", function(assert){
		var done = assert.async();
		oModel.read("/Categories(1)", {urlParameters: {"$expand":"Products"}, success: function() {

			var oListBinding = oModel.bindList("/Categories(1)/Products", null, new Sorter("UnitPrice"));

			oListBinding.initialize();
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 12, "12 entry contained");


			var aData = aContexts.map(function(oContext) {
				return {
					name: oContext.getProperty("ProductName"),
					value: oContext.getProperty("UnitPrice")
				};
			});

			var aDataSorted = aData.slice();
			aDataSorted.sort(function(a, b) {
				var iFa = parseFloat(a.value);
				var iFb = parseFloat(b.value);
				if (iFa < iFb) {
					return -1;
				} else if (iFa > iFb) {
					return 1;
				}
				return 0;
			});

			assert.deepEqual(aData, aDataSorted, "Data must be sorted using price");

			done();
		}});

	});


	QUnit.test("ListBinding serverside filter - NotStartsWith", function(assert){
		var done = assert.async();
		var oListBinding = oModel.bindList("/Categories", null, null, new Filter("CategoryName", "NotStartsWith", "C"), {
			select: "CategoryName"
		});
		oListBinding.attachRefresh(function() {
			var listhandler = function() {
				oListBinding.detachChange(listhandler);
				var aContexts = oListBinding.getContexts();

				var iIndex = 0;
				assert.equal(aContexts.length, 6, "6 entry contained");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Beverages");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Dairy Products");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Grains/Cereals");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Meat/Poultry");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Produce");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Seafood");
				assert.equal(aContexts.length, iIndex, "6 entry contained");
				done();
			};
			oListBinding.attachChange(listhandler);
			oListBinding.getContexts();
		});
		oListBinding.initialize();
	});


	QUnit.test("ListBinding serverside filter - NotEndsWith", function(assert){
		var done = assert.async();
		var oListBinding = oModel.bindList("/Categories", null, null, new Filter("CategoryName", "NotEndsWith", "s"), {
			select: "CategoryName"
		});
		oListBinding.attachRefresh(function() {
			var listhandler = function() {
				oListBinding.detachChange(listhandler);
				var aContexts = oListBinding.getContexts();

				var iIndex = 0;
				assert.equal(aContexts.length, 3, "3 entry contained");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Meat/Poultry");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Produce");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Seafood");
				assert.equal(aContexts.length, iIndex, "3 entry contained");
				done();
			};
			oListBinding.attachChange(listhandler);
			oListBinding.getContexts();
		});
		oListBinding.initialize();
	});


	QUnit.test("ListBinding serverside filter - NotContains", function(assert){
		var done = assert.async();
		var oListBinding = oModel.bindList("/Categories", null, null, new Filter("CategoryName", "NotContains", "ry"), {
			select: "CategoryName"
		});
		oListBinding.attachRefresh(function() {
			var listhandler = function() {
				oListBinding.detachChange(listhandler);
				var aContexts = oListBinding.getContexts();

				var iIndex = 0;
				assert.equal(aContexts.length, 6, "6 entry contained");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Beverages");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Condiments");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Confections");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Grains/Cereals");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Produce");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Seafood");
				assert.equal(aContexts.length, iIndex, "6 entry contained");
				done();
			};
			oListBinding.attachChange(listhandler);
			oListBinding.getContexts();
		});
		oListBinding.initialize();
	});

	QUnit.test("ListBinding serverside filter - NotBetween", function(assert){
		var done = assert.async();
		var oListBinding = oModel.bindList("/Categories", null, null, new Filter("CategoryName", "NB", "C", "M"), {
			select: "CategoryName"
		});
		oListBinding.attachRefresh(function() {
			var listhandler = function() {
				oListBinding.detachChange(listhandler);
				var aContexts = oListBinding.getContexts();

				var iIndex = 0;
				assert.equal(aContexts.length, 4, "4 entry contained");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Beverages");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Meat/Poultry");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Produce");
				assert.equal(aContexts[iIndex++].getProperty("CategoryName"), "Seafood");
				assert.equal(aContexts.length, iIndex, "4 entry contained");
				done();
			};
			oListBinding.attachChange(listhandler);
			oListBinding.getContexts();
		});
		oListBinding.initialize();
	});

	QUnit.module("Servermode Filtering XML", {
		beforeEach : function() {
			oModel = initModel(false);
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("ListBinding on expanded data, operationmode Default, initial filter", function(assert){
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});
		var oListBinding = oModel.bindList("Products", null, null,  new Filter("ProductName", "EQ", "Chai"));
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for enttiy with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var listhandler = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 1, "1 entry contained");
			assert.notOk(oSpy.called, "Binding expanded list with filter must not send a request");
			oListBinding.detachChange(listhandler);
			done();
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding on expanded data, operationmode Default, late filter", function(assert){
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});
		var oListBinding = oModel.bindList("Products");
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for enttiy with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler1);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var listhandler1 = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 12, "12 entries contained");
			assert.notOk(oSpy.called, "Binding expanded list must not send a request");
			oListBinding.detachChange(listhandler1);
			oListBinding.attachChange(listhandler2);
			oListBinding.filter(new Filter("ProductName", "EQ", "Chai"));
		};
		var listhandler2 = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 1, "1 entry contained");
			assert.notOk(oSpy.called, "Filtering expanded list must not send a request");
			oListBinding.detachChange(listhandler2);
			done();
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding on expanded data, operationmode Server, initial filter", function(assert){
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});
		var oListBinding = oModel.bindList("Products", null, null,  new Filter("ProductName", "EQ", "Chai"), {operationMode: "Server"});
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for enttiy with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var listhandler = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 1, "1 entry contained");
			assert.ok(oSpy.calledOnce, "Filtering expanded list sent request to the server");
			oListBinding.detachChange(listhandler);
			done();
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding on expanded data, operationmode Server, late filter", function(assert){
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});
		var oListBinding = oModel.bindList("Products", null, null, null, {operationMode: "Server"});
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for enttiy with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler1);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var listhandler1 = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 12, "12 entries contained");
			assert.notOk(oSpy.called, "Binding expanded list must not send a request");
			oListBinding.detachChange(listhandler1);
			oListBinding.attachChange(listhandler2);
			oListBinding.filter(new Filter("ProductName", "EQ", "Chai"));
		};
		var listhandler2 = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 1, "1 entry contained");
			assert.ok(oSpy.calledOnce, "Filtering expanded list sent request to the server");
			oListBinding.detachChange(listhandler2);
			done();
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("ListBinding on expanded data, operationmode Default, custom parameter", function(assert){
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_request");
		var oBinding = oModel.bindContext("/Categories(1)", null, {expand: "Products"});
		var oListBinding = oModel.bindList("Products", null, null, null, {custom:{search: "Test"}});
		var handler = function() {
			assert.ok(oSpy.calledOnce, "Request sent for enttiy with expand");
			oSpy.reset();
			//Timeout needed to avoid checkUpdate of context binding request to update the listbinding
			setTimeout(function() {
				oListBinding.initialize();
				oBinding.detachChange(handler);
				oListBinding.attachRefresh(function() {oListBinding.getContexts();});
				oListBinding.attachChange(listhandler);
				oListBinding.setContext(oBinding.getBoundContext());
			}, 0);
		};
		var listhandler = function() {
			var aContexts = oListBinding.getContexts();
			assert.equal(aContexts.length, 12, "12 entries contained");
			assert.ok(oSpy.calledOnce, "Second request sent because custom parameter prevents usage of expand data");
			oSpy.reset();
			oListBinding.detachChange(listhandler);
			done();
		};
		oBinding.attachChange(handler);
	});



	QUnit.test("ListBinding Diff", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories");
		var handler = function(oEvent) {
			assert.ok(!oBinding.getContexts(0, 2).diff,"No diff if binding was initial");
			assert.ok(oBinding.getContexts(0, 2).diff.length == 0,"Diff with length 0");
			assert.deepEqual(oBinding.getContexts(0, 8).diff, [
				{ index: 2, type: "insert" },
				{ index: 3, type: "insert" },
				{ index: 4, type: "insert" },
				{ index: 5, type: "insert" },
				{ index: 6, type: "insert" },
				{ index: 7, type: "insert" }
			], "6 insertions");
			assert.deepEqual(oBinding.getContexts(2, 4).diff, [
				{ index: 0, type: "delete" },
				{ index: 0, type: "delete" },
				{ index: 4, type: "delete" },
				{ index: 4, type: "delete" }
			], "4 deletes");
			assert.deepEqual(oBinding.getContexts(4, 4).diff, [
				{ index: 0, type: "delete" },
				{ index: 0, type: "delete" },
				{ index: 2, type: "insert" },
				{ index: 3, type: "insert" }
			], "2 deletes & 2 inserts");
			var aContexts = oBinding.getCurrentContexts();
			oModel.getProperty(aContexts[0].getPath()).CategoryName = "Other";
			assert.deepEqual(oBinding.getContexts(4, 4).diff, [
				{ index: 0, type: "delete" },
			    { index: 0, type: "insert" }
			], "Property change causes delete and insert");
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};
		oBinding.attachChange(handler);
		oBinding.enableExtendedChangeDetection(true);
		oBinding.attachRefresh(function() {
			oBinding.getContexts(0, 8);
		});
	});

	QUnit.test("ListBinding Diff with key", function(assert){
		var done = assert.async();
		var oBinding = oModel.bindList("/Categories");
		var handler = function(oEvent) {
			assert.ok(!oBinding.getContexts(0, 2).diff,"No diff if binding was initial");
			assert.ok(oBinding.getContexts(0, 2).diff.length == 0,"Diff with length 0");
			assert.deepEqual(oBinding.getContexts(0, 8).diff, [
				{ index: 2, type: "insert" },
				{ index: 3, type: "insert" },
				{ index: 4, type: "insert" },
				{ index: 5, type: "insert" },
				{ index: 6, type: "insert" },
				{ index: 7, type: "insert" }
			], "6 insertions");
			assert.deepEqual(oBinding.getContexts(2, 4).diff, [
				{ index: 0, type: "delete" },
				{ index: 0, type: "delete" },
				{ index: 4, type: "delete" },
				{ index: 4, type: "delete" }
			], "4 deletes");
			assert.deepEqual(oBinding.getContexts(4, 4).diff, [
				{ index: 0, type: "delete" },
				{ index: 0, type: "delete" },
				{ index: 2, type: "insert" },
				{ index: 3, type: "insert" }
			], "2 deletes & 2 inserts");
			var aContexts = oBinding.getCurrentContexts();
			aContexts[0].getObject().CategoryName = "Other";
			assert.ok(oBinding.getContexts(4, 4).diff.length == 0, "No diff for property change");
			oBinding.detachChange(handler);
			done(); // resume normal testing
		};
		oBinding.attachChange(handler);
		oBinding.enableExtendedChangeDetection(false);
		oBinding.attachRefresh(function() {
			oBinding.getContexts(0, 8);
		});
	});

	QUnit.test("Event order", function(assert){
		var done = assert.async();
		assert.expect(4);
		var oList = new List();
		var oItem = new DisplayListItem();

		var bChanged = false, bDataRequested = false, bDataReceived = false;

		var fnChange = function(oEvent) {
			bChanged = true;
			assert.ok(bDataRequested && !bDataReceived,"change fired");
		};

		var fnDataRequested = function() {
			bDataRequested = true;
			assert.ok(!bDataReceived && !bChanged,"dataRequested fired");
		};

		var fnDataReceived = function() {
			bDataReceived = true;
			assert.ok(bChanged && bDataRequested,"dataReceived fired");
			done();
		};
		var fnChangeHandler = function() {
			assert.equal(oList.getItems().length, 8, "items created");
		};

		oList.bindAggregation("items", {path:"/Categories", template: oItem, events:{change:fnChange, dataRequested:fnDataRequested, dataReceived:fnDataReceived}});
		oList.setModel(oModel);
		oList.getBinding("items").attachChange(fnChangeHandler);
	});

	QUnit.test("Error Case: Service returns partial data, Binding should keep data, length final", function(assert){
		var done = assert.async();
		var handler = function() {
			oBinding.detachChange(handler);

			// check necessary prerequisites
			assert.equal(oBinding.getPath(), "/Orders", "ListBinding path");
			assert.equal(oBinding.bFaultTolerant, true, "Binding should run in faultTolerant mode");
			assert.equal(oBinding.sCountMode, CountMode.InlineRepeat, "Binding should use CountMode.InlineRepeat");

			// actual assertations against the behavior in the error case when the service could not collect all
			// data from its data-sources
			assert.equal(oBinding.aKeys.length, 2, "Loaded data count");
			assert.equal(oBinding.iLength, 3, "Service says there are still entities to load");
			assert.equal(oBinding.bLengthFinal, true, "Length should be final as provided by the service");

			oBinding.attachChange(handler2);
			oBinding.getContexts(2, 1, 0);
		};

		var handler2 = function() {
			oBinding.detachChange(handler);

			assert.equal(oBinding.aKeys.length, 2, "Loaded data count is still smaller than expected (somethings missing)");
			assert.equal(oBinding.iLength, 2, "Length is now set to the correct value, because result was empty...");
			assert.equal(oBinding.bLengthFinal, true, "...and the length should be final now.");

			done(); // resume normal testing
		};

		var oBinding = oModel.bindList(
			"/Orders",
			null,
			null,
			[new Filter("ShipCity", "EQ", "TEST_FAULT_TOLERANCE")],
			{
				//parameters
				faultTolerant: true,
				countMode: CountMode.InlineRepeat
			}
		);

		oBinding.attachChange(handler);

		oBinding.attachRefresh(function() {
			oBinding.getContexts(0, 2, 0);
		});
	});

	QUnit.test("Inline Count mode - service returns no data & 0 count: Count should be updated irrespective of startIndex", function(assert) {
		var done = assert.async();
		var oModel = initModel(true);
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "Inline", custom:{search: "foo"}});
		var oSpy = sinon.spy(oBinding, "loadData");
		var handler = function() {
			oBinding.detachChange(handler);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered to load data");
			oSpy.reset();
			assert.equal(oBinding.getLength(), 0, "Current length is 0");
			assert.equal(oBinding.isLengthFinal(), true, "Length is final");
			done();
		};

		oBinding.attachChange(handler);
		oBinding.attachRefresh(function() {
			oBinding.getContexts(1, 5); //Get rows starting from 1, top 5 (startIndex !=0)
		});
		oBinding.initialize();
	});

	QUnit.test("Export to file URL", function(assert){
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
		var sUrl = oBinding.getDownloadUrl("csv");
		assert.equal(sUrl, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=csv", "Download URL for csv correctly constructed.");
		sUrl = oBinding.getDownloadUrl("xlsx");
		assert.equal(sUrl, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=xlsx", "Download URL for excel correctly constructed.");
	});
	QUnit.test("Suspend/Resume", function(assert) {
		var done = assert.async();
		var oModel = initModel(false);
		var oBinding = oModel.bindList("/Categories");
		var oSpy = sinon.spy(oBinding, "loadData");
		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.attachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered to load data");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			oBinding.suspend();
			oBinding.refresh(true);
		};
		var handler2 = function() {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered for refresh(true)");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			oBinding.refresh();
			setTimeout(handler4, 50);
		};
		var handler3 = function() {
			assert.ok(false, "Must not be called");
		};
		var handler4 = function() {
			oBinding.detachChange(handler3);
			oBinding.attachChange(handler5);
			assert.equal(oSpy.callCount, 0, "refresh() didn't trigger a request");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			oBinding.resume();
		};
		var handler5 = function() {
			oBinding.detachChange(handler5);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered after resume");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			done();
		};
		oBinding.attachChange(handler1);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.initialize();
	});

	QUnit.test("Suspend/Resume with sort", function(assert) {
		var done = assert.async();
		var oModel = initModel(false);
		var oBinding = oModel.bindList("/Categories");
		var oSpy = sinon.spy(oBinding, "loadData");
		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.attachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered to load data");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			oBinding.suspend();
			oBinding.sort(new Sorter("CategoryName"));
		};
		var handler2 = function() {
			oBinding.detachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered for sorting");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			assert.equal(oBinding.getContexts()[0].getProperty("CategoryName"), "Beverages", "Categories are sorted");
			oBinding.resume();
			setTimeout(handler3, 50);
		};
		var handler3 = function() {
			assert.equal(oSpy.callCount, 0, "No request was sent after resume");
			oSpy.reset();
			done();
		};
		oBinding.attachChange(handler1);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.initialize();
	});

	QUnit.test("Suspend/Resume with filter", function(assert) {
		var done = assert.async();
		var oModel = initModel(false);
		var oBinding = oModel.bindList("/Categories");
		var oSpy = sinon.spy(oBinding, "loadData");
		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.attachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered to load data");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 8, "Current context length is 8");
			oBinding.suspend();
			oBinding.filter(new Filter("CategoryName", "EQ", "Beverages"));
		};
		var handler2 = function() {
			oBinding.detachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered for filtering");
			oSpy.reset();
			assert.equal(oBinding.getContexts().length, 1, "Current context length is 1");
			oBinding.resume();
			setTimeout(handler3, 50);
		};
		var handler3 = function() {
			assert.equal(oSpy.callCount, 0, "No request was sent after resume");
			oSpy.reset();
			done();
		};
		oBinding.attachChange(handler1);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.initialize();
	});

	QUnit.test("Suspend/Resume with autorefresh", function(assert) {
		var done = assert.async();
		var oModel = initModel(false);
		var oBinding = oModel.bindList("/Categories");
		var oSpy = sinon.spy(oBinding, "loadData");
		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.attachChange(handler2);
			assert.equal(oSpy.callCount, 1, "1 Request has been triggered to load data");
			oSpy.reset();
			oBinding.getContexts();
			assert.equal(oBinding.getCurrentContexts().length, 8, "Current context length is 8");
			oBinding.suspend();
			oModel.remove("/Categories(1)", {groupId: "changes"});
			oModel.submitChanges({groupId: "changes", success: handler3});
		};
		var handler2 = function() {
			assert.ok(false, "Change handler must not be triggered by autorefresh");
		};
		var handler3 = function() {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler4);
			assert.equal(oSpy.callCount, 0, "No request was triggered for autorefresh");
			oSpy.reset();
			assert.equal(oBinding.getCurrentContexts().length, 8, "Current context length is 8");
			oBinding.resume();
		};
		var handler4 = function() {
			oBinding.detachChange(handler4);
			assert.equal(oSpy.callCount, 1, "Resume did refresh the binding");
			oSpy.reset();
			done();
		};
		oBinding.attachChange(handler1);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
		oBinding.initialize();
	});

	QUnit.test("ListBinding filter with empty data", function(assert){
		var done = assert.async();
		var oFilter, oFilter2;
		oModel.metadataLoaded().then(function(){
			var handler = function(oEvent){
				// contexts should be now loaded
				var oBinding = oEvent.oSource;
				assert.ok(oBinding.isLengthFinal(), "Length should be final");
				var aFilteredContexts = oBinding.getContexts();
				assert.equal(aFilteredContexts.length, 2, "filtered content length");
				assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "EQ, Contains, filtered content");
				assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Confections", "EQ, Contains, filtered content");

				oBinding.detachChange(handler);
				oFilter = new Filter("CategoryName", FilterOperator.EQ, "NONEXISTING");
				oBinding.filter([oFilter]);
				oBinding.attachChange(handler1);
			};
			var handler1 = function(oEvent){
				var oBinding = oEvent.oSource;
				assert.ok(oBinding.isLengthFinal(), "Length should be final");
				var aFilteredContexts = oBinding.getContexts();
				assert.equal(aFilteredContexts.length, 0, "NE, contains, filtered content length");
				oBinding.detachChange(handler1);
				done();
			};

			var oBinding = oModel.bindList("/Categories");

			var fnFilter = function() {
				oBinding.detachRefresh(fnFilter);
				oBinding.attachRefresh(function() {oBinding.getContexts();});
				oFilter = new Filter("CategoryName", FilterOperator.EQ, "Condiments");
				oFilter2 = new Filter("CategoryName", FilterOperator.Contains, "ons");
				oBinding.filter([oFilter, oFilter2]);
			};
			oBinding.attachChange(handler);
			oBinding.attachRefresh(fnFilter);
			oBinding.initialize();
		});

	});

	QUnit.module("Unsupported Filters", {
		beforeEach : function() {
			this.oModel = initModel(false);
		},

		afterEach : function() {
			this.oModel = undefined;
		},

		getErrorWithMessage: function(sFilter) {
			return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
		}
	});

	QUnit.test("constructor - Any/All are rejected", function(assert) {
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

		// "Any" at last position fails
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
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any,variable: "id4", condition: new Filter()});

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



	var oSpySubmitBatchRequest;

	QUnit.module("ODataModelV2 requests", {
		beforeEach: function() {
			this.aRegisteredControls = [];
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			this.aRegisteredControls.forEach(function(oControl) {
				if (oControl.destroy) {
					oControl.destroy();
				}
			});
			if (oSpySubmitBatchRequest) {
				oSpySubmitBatchRequest.restore();
			}
		}
	});

	/**
	 * creates a panel with a list with the following bindings
	 * <code>/Products(1)/Supplier/Products</code>
	 * @param mParametersForBinding {object} parameters which get passed to the bindings
	 * @param mParamatersForModel {object} parameters which get passed to the model
	 * @param fnCompleted {function} gets called once the batch request is completed
	 * @param oTestContext {object} test context
	 * @param sFnRequestCompleted {string} request completed function name of the model
	 */
	function executeRequests(mParametersForBinding, mParamatersForModel, fnCompleted, oTestContext, sFnRequestCompleted) {

		oModel = new ODataModel(sURI, mParamatersForModel);
		oSpySubmitBatchRequest = sinon.spy(oModel, "_submitBatchRequest");

		var oPanel = new Panel();
		oTestContext.aRegisteredControls.push(oPanel);
		var oList = new List();
		oTestContext.aRegisteredControls.push(oList);
		oPanel.setModel(oModel);
		oPanel.addContent(oList);


		if (!sFnRequestCompleted) {
			sFnRequestCompleted = "attachBatchRequestCompleted";
		}
		oModel[sFnRequestCompleted](null, function() {
			fnCompleted(oList, oTestContext, arguments);
		});


		oPanel.bindElement({path: "/Products(1)", parameters: mParametersForBinding});

		oList.bindElement({path: "Supplier", parameters: mParametersForBinding});
		oList.bindItems({path: "Products", template: new StandardListItem({title: "{ProductName}"}), parameters: mParametersForBinding});


		return oPanel;
	}

	/**
	 * Checks the content of the grouped batch request
	 * @param oList
	 * @param assert
	 * @param iCallIndex
	 * @param aExpectedRequests
	 * @param sMessage
	 */
	var checkSingleBatchRequestContent = function(oList, assert, iCallIndex, aExpectedRequests, sMessage) {

		iCallIndex = iCallIndex || 0;
		sMessage = sMessage || ("" + (iCallIndex) + " batch requests are expected");

		assert.equal(iCallIndex + 1, oSpySubmitBatchRequest.callCount, sMessage);

		var aRequests = oSpySubmitBatchRequest.args[iCallIndex][1];
		var aRequestUris = aRequests.map(function(oRequest){
			return oRequest.request.requestUri;
		});
		assert.equal(aRequests.length, aExpectedRequests.length, "multiple requests within one batch should be performed." +
			" Actual: " + JSON.stringify(aRequestUris) + " Expected: " + JSON.stringify(aExpectedRequests));


		aExpectedRequests.forEach(function(sExpectedRequest, iIndex) {
			assert.ok(aRequests[iIndex], "Expected: '" + sExpectedRequest + "'");
			assert.equal(aRequests[iIndex].request.requestUri, sExpectedRequest, "request " + (iIndex + 1) + " retrieves '" + sExpectedRequest + "'");
			assert.equal(aRequests[iIndex].response.statusCode, "200", "response should succeed");
		});

		assert.equal(oList.getItems().length, 3, "The list should contain 3 items");

	};

	/**
	 * Checks the contents of each batch request
	 * @param oList
	 * @param assert
	 * @param iCallIndex
	 * @param aExpectedRequests
	 * @param sMessage
	 */
	var checkMultipleBatchRequestsContent = function(oList, assert, iCallIndex, aExpectedRequests, sMessage) {
		var iNumber = aExpectedRequests.length;
		iCallIndex = iCallIndex || iNumber;
		sMessage = sMessage || ("" + (iCallIndex) + " batch requests are expected");

		assert.equal(iCallIndex, oSpySubmitBatchRequest.callCount, sMessage);

		aExpectedRequests.forEach(function(aExpectedRequest, iIndex) {
			if (!Array.isArray(aExpectedRequest)) {
				aExpectedRequest = [aExpectedRequest];
			}

			var oBatchRequest1 = oSpySubmitBatchRequest.args[iCallIndex - (iNumber) + iIndex][1];
			var aRequestUris = oBatchRequest1.map(function(oRequest){
				return oRequest.request.requestUri;
			});
			assert.equal(oBatchRequest1.length, aExpectedRequest.length, "" + (iIndex + 1) + ". batch should contain " + aExpectedRequest.length + " request. " +
				"Actual: " + JSON.stringify(aRequestUris) + " Expected: " + JSON.stringify(aExpectedRequest));
			aExpectedRequest.forEach(function(sExpectedRequest, iIndex) {
				assert.ok(oBatchRequest1[iIndex], "Expected: '" + sExpectedRequest + "'");
				assert.equal(oBatchRequest1[iIndex].request.requestUri, sExpectedRequest, "request " + (iIndex + 1) + " retrieves '" + sExpectedRequest + "'");
				assert.equal(oBatchRequest1[iIndex].response.statusCode, "200", "response should succeed");
			});

		});

		assert.equal(oList.getItems().length, 3, "The list should contain 3 items");

	};

	/* Sync */

	QUnit.test("Batch: ListBinding - create/use preliminary Context", function(assert) {
		var done = assert.async();
		var fnCompleted = function(oList) {
			checkSingleBatchRequestContent(oList, assert, 0, [
				"Products(1)",
				"Products(1)/Supplier",
				"Products(1)/Supplier/Products/$count",
				"Products(1)/Supplier/Products?$skip=0&$top=100"
			]);
			done();
		};
		executeRequests({createPreliminaryContext: true, usePreliminaryContext: true}, {preliminaryContext: true}, fnCompleted, this);

	});

	QUnit.test("Batch: ListBinding - create/use preliminary context with existing element context", function(assert) {
		var done = assert.async();
		var oPanel = new Panel();
		var oList = new List();

		oModel = new ODataModel(sURI, {
			useBatch: true
		});

		oPanel.setModel(oModel);
		oPanel.addContent(oList);

		oModel.read("/Products(1)", {
			success: function() {
				oPanel.bindElement({
					path:"/Products(1)",
					parameters: {
						createPreliminaryContext: true
					}
				});

				// check if element context exists and if it is not set to preliminary
				if (oPanel.getElementBinding().getBoundContext()) {
					var oContext = oPanel.getElementBinding().getBoundContext();
					assert.notOk(oContext.isPreliminary(), "ElementContext should not be preliminary");
				}

				oModel.attachBatchRequestCompleted(function(oEvent) {
					var aRequests = oEvent.getParameter("requests");
					assert.equal(aRequests.length, 1, "Only one batch request should be completed.");
					done();
				});
			}
		});
	});

	QUnit.test("Batch: ListBinding - create/use preliminary context and propagate context to another Binding", function(assert) {
		var done = assert.async();
		var oPanel = new Panel();
		var oList = new List();
		var oList2 = new List();

		oModel = new ODataModel(sURI, {
			useBatch: true,
			preliminaryContext: true
		});

		oPanel.setModel(oModel);

		oPanel.addContent(oList2);
		oPanel.addContent(oList);

		oModel.read("/Categories(7)", {
			urlParameters: {
				$expand: "Products"
			},
			success: function() {
				oPanel.bindElement({
					path:"/Categories(7)"
				});

				oList2.bindElement({
					path:"/Products(7)"
				});

				oList.bindElement({
					path:"Products",
					parameters: {
						select: "ProductID"
					}
				});
				//check async for preliminary flag as the event is fired async
				oModel.metadataLoaded().then(function() {
					assert.equal(oPanel.getBindingContext(), oList.getElementBinding().getContext(), "Context should be the same and was propagated.");
					assert.ok(oList.getBindingContext().isPreliminary(), "ElementContext should be preliminary.");

					oModel.attachBatchRequestCompleted(function(oEvent) {
						var aRequests = oEvent.getParameter("requests");
						assert.equal(aRequests.length, 1, "Only one batch request should be completed.");
						done();
					});
				});
			}
		});
	});

	QUnit.test("Batch: ListBinding - create preliminary context for non existing entity", function(assert) {
		var done = assert.async();

		//the change event should be called exactly twice as the preliminary context is created for a non-existing entity
		var i = 0;
		var fnCompleted = function(event) {
			assert.ok(event.oSource);
			i++;
			if (i === 2) {
				done();
			}
		};

		oModel = new ODataModel(sURI, {});

		var oPanel = new Panel();
		this.aRegisteredControls.push(oPanel);
		oPanel.setModel(oModel);

		oPanel.bindElement({path: "/Products(121231)", events: {change: fnCompleted}, parameters: {createPreliminaryContext: true}});
	});

	QUnit.test("Batch: ListBinding - create/use preliminary Context (parameter variant 1)", function(assert) {
		var done = assert.async();
		var fnCompleted = function(oList) {
			checkSingleBatchRequestContent(oList, assert, 0, [
				"Products(1)",
				"Products(1)/Supplier",
				"Products(1)/Supplier/Products/$count",
				"Products(1)/Supplier/Products?$skip=0&$top=100"
			]);
			done();
		};
		executeRequests({}, {preliminaryContext: true}, fnCompleted, this);

	});

	QUnit.test("Batch: ListBinding - create/use preliminary Context with Refreshs", function(assert) {
		var done = assert.async();
		var oPanelBinding, oListBinding, oListItemsBinding;

		var iCurrentRun = -1;
		assert.expect(36);
		var fnCompleted = function(oList) {

			iCurrentRun++;
			switch (iCurrentRun) {
				case 0:
					oPanelBinding.refresh();
					//4 requests INITIAL
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)",
						"Products(1)/Supplier",
						"Products(1)/Supplier/Products/$count",
						"Products(1)/Supplier/Products?$skip=0&$top=100"
					], "INITIAL");
					break;
				case 1:
					oListBinding.refresh();
					//1 request AFTER PANEL REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)"
					], "AFTER PANEL REFRESH");
					break;
				case 2:
					oListItemsBinding.refresh();
					//1 request AFTER LIST REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)/Supplier"
					], "AFTER LIST REFRESH");
					break;
				case 3:
					//2 requests AFTER LIST ITEMS REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Suppliers(1)/Products/$count",
						"Suppliers(1)/Products?$skip=0&$top=100"
					], "AFTER LIST ITEMS REFRESH");
					done();
					break;
				default:
					break;
			}
		};
		var oPanel = executeRequests({createPreliminaryContext: true, usePreliminaryContext: true}, {}, fnCompleted, this);

		oPanelBinding = oPanel.getObjectBinding();
		var oList = oPanel.getContent()[0];
		oListBinding = oList.getObjectBinding();
		oListItemsBinding = oList.getBinding("items");
	});


	QUnit.test("Batch: ListBinding - create/use preliminary Context with forced Refreshs", function(assert) {
		var done = assert.async();
		var oPanelBinding, oListBinding, oListItemsBinding;

		var iCurrentRun = -1;
		assert.expect(51);
		var fnCompleted = function(oList) {

			iCurrentRun++;
			switch (iCurrentRun) {
				case 0:
					oPanelBinding.refresh(true);
					//4 requests INITIAL
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)",
						"Products(1)/Supplier",
						"Products(1)/Supplier/Products/$count",
						"Products(1)/Supplier/Products?$skip=0&$top=100"
					], "INITIAL 4 requests expected after load");
					break;
				case 1:
					oListBinding.refresh(true);
					//4 requests AFTER PANEL REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)",
						"Products(1)/Supplier",
						"Suppliers(1)/Products/$count",
						"Suppliers(1)/Products?$skip=0&$top=100"
					], "AFTER FORCED PANEL REFRESH 4 requests expected");
					break;
				case 2:
					oListItemsBinding.refresh(true);
					//3 requests AFTER LIST REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Products(1)/Supplier",
						"Suppliers(1)/Products/$count",
						"Suppliers(1)/Products?$skip=0&$top=100"
					], "AFTER FORCED LIST REFRESH 3 requests expected");
					break;
				case 3:
					//2 requests AFTER LIST ITEMS REFRESH
					checkSingleBatchRequestContent(oList, assert, iCurrentRun, [
						"Suppliers(1)/Products/$count",
						"Suppliers(1)/Products?$skip=0&$top=100"
					], "AFTER FORCED LIST ITEMS REFRESH 2 requests expected");
					done();
					break;
				default:
					break;
			}

		};
		var oPanel = executeRequests({createPreliminaryContext: true, usePreliminaryContext: true}, {}, fnCompleted, this);

		oPanelBinding = oPanel.getObjectBinding();
		oListBinding = oPanel.getContent()[0].getObjectBinding();
		oListItemsBinding = oPanel.getContent()[0].getBinding("items");
	});

	/* Async */


	QUnit.test("Batch: ListBinding - not create/use preliminary Context", function(assert) {
		var iRequests = 0;
		var done = assert.async();
		var fnCompleted = function(oList) {
			iRequests++;
			if (iRequests === 3) {
				checkMultipleBatchRequestsContent(oList, assert, 0, [
					["Products(1)"],
					["Products(1)/Supplier"],
					["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
				]);
				done();
			}
		};
		executeRequests({createPreliminaryContext: false, usePreliminaryContext: false}, {preliminaryContext: false}, fnCompleted, this);

	});

	QUnit.test("Batch: ListBinding - not create/use preliminary Context (parameter variant 1)", function(assert) {
		var iRequests = 0;
		var done = assert.async();
		var fnCompleted = function(oList) {
			iRequests++;
			if (iRequests === 3) {
				checkMultipleBatchRequestsContent(oList, assert, 0, [
					["Products(1)"],
					["Products(1)/Supplier"],
					["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
				]);
				done();
			}
		};
		executeRequests({usePreliminaryContext: true}, {preliminaryContext: false}, fnCompleted, this);

	});


	QUnit.test("Batch: ListBinding - not create/use preliminary Context with Refreshs", function(assert) {
		var oObjectBinding, oListBinding, oListItemsBinding;
		var done = assert.async();
		var firstRun = 3;
		var secondRun = firstRun + 1;
		var thirdRun = secondRun + 1;
		var fourthRun = thirdRun + 1;

		assert.expect(38);

		var iRequests = 0;
		var fnCompleted = function(oList) {

			iRequests++;

			switch (iRequests) {
				case firstRun:
					oObjectBinding.refresh();
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)"],
						["Products(1)/Supplier"],
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					]);
					break;
				case secondRun:
					oListBinding.refresh();
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)"]
					]);
					break;
				case thirdRun:
					oListItemsBinding.refresh();
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)/Supplier"]
					]);
					break;
				case fourthRun:
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					]);
					done();
					break;
				default:
					break;
			}


		};
		var oPanel = executeRequests({createPreliminaryContext: false, usePreliminaryContext: true}, {}, fnCompleted, this);
		oObjectBinding = oPanel.getObjectBinding();
		oListBinding = oPanel.getContent()[0].getObjectBinding();
		oListItemsBinding = oPanel.getContent()[0].getBinding("items");

	});


	QUnit.test("Batch: ListBinding - not create/use preliminary Context with forced Refreshs", function(assert) {
		var oPanelBinding, oListBinding, oListItemsBinding;
		var done = assert.async();

		assert.expect(56);

		var firstRun = 3;
		var secondRun = firstRun + 3;
		var thirdRun = secondRun + 2;
		var fourthRun = thirdRun + 1;

		var iRequests = 0;
		var fnCompleted = function(oList) {

			iRequests++;

			switch (iRequests) {
				case firstRun:
					oPanelBinding.refresh(true);
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)"],
						["Products(1)/Supplier"],
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					], "INITIAL 4 requests expected after load");
					break;
				case secondRun:
					oListBinding.refresh(true);
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)"],
						["Products(1)/Supplier"],
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					], "AFTER FORCED PANEL REFRESH 4 requests expected");
					break;
				case thirdRun:
					oListItemsBinding.refresh(true);
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Products(1)/Supplier"],
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					], "AFTER FORCED LIST REFRESH 3 requests expected");
					break;
				case fourthRun:
					checkMultipleBatchRequestsContent(oList, assert, iRequests, [
						["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
					], "AFTER FORCED LIST ITEMS REFRESH 2 requests expected");
					done();
					break;
				default:
					break;
			}

		};
		var oPanel = executeRequests({createPreliminaryContext: false, usePreliminaryContext: true}, {}, fnCompleted, this);
		oPanelBinding = oPanel.getObjectBinding();
		oListBinding = oPanel.getContent()[0].getObjectBinding();
		oListItemsBinding = oPanel.getContent()[0].getBinding("items");

	});


	QUnit.test("Batch: ListBinding default - not create/use preliminary Context", function(assert) {
		var iRequests = 0;
		var done = assert.async();
		var fnCompleted = function(oList) {
			iRequests++;
			if (iRequests === 3) {
				checkMultipleBatchRequestsContent(oList, assert, 0, [
					["Products(1)"],
					["Products(1)/Supplier"],
					["Suppliers(1)/Products/$count", "Suppliers(1)/Products?$skip=0&$top=100"]
				]);
				done();
			}
		};
		executeRequests({}, {}, fnCompleted, this);

	});

	/* Non-Batch */

	QUnit.test("Non-batch: ListBinding - create/use preliminary Context", function(assert) {
		var iRequests = 0;
		var done = assert.async();

		var mExpectedRequests = [
			"/Products(1)",
			"/Products(1)/Supplier",
			"/Products(1)/Supplier/Products/$count",
			"/Products(1)/Supplier/Products?$skip=0&$top=100"
		];


		var fnCompleted = function(oList, oTestContext, oArguments) {

			var mParams = oArguments["0"].mParameters;
			var url = mParams.url;
			assert.equal(mParams.response.statusCode, 200);
			var expectedRequest = mExpectedRequests[iRequests];
			assert.equal(url.indexOf(expectedRequest), url.length - expectedRequest.length);

			iRequests++;
			if (iRequests === mExpectedRequests.length) {
				done();
			}
		};
		executeRequests({createPreliminaryContext: true, usePreliminaryContext: true}, {
			useBatch: false,
			json: false
		}, fnCompleted, this, "attachRequestCompleted");

	});

	QUnit.test("Non-batch: ListBinding - not create/use preliminary Context", function(assert) {
		var iRequests = 0;
		var done = assert.async();

		var mExpectedRequests = [
			"/Products(1)",
			"/Products(1)/Supplier",
			"/Suppliers(1)/Products/$count",
			"/Suppliers(1)/Products?$skip=0&$top=100"
		];


		var fnCompleted = function(oList, oTestContext, oArguments) {

			var mParams = oArguments["0"].mParameters;
			var url = mParams.url;
			assert.equal(mParams.response.statusCode, 200, "response code for " + url + " should be OK");
			var expectedRequest = mExpectedRequests[iRequests];
			assert.equal(url.substring(url.length - expectedRequest.length), expectedRequest);

			iRequests++;
			if (iRequests === mExpectedRequests.length) {
				done();
			}
		};
		executeRequests({createPreliminaryContext: false, usePreliminaryContext: true}, {
			useBatch: false,
			json: false
		}, fnCompleted, this, "attachRequestCompleted");

	});

	QUnit.module("Listbinding skip/top", {
		beforeEach: function() {
			this.aRegisteredControls = [];
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			this.aRegisteredControls.forEach(function(oControl) {
				if (oControl.destroy) {
					oControl.destroy();
				}
			});
			if (oSpySubmitBatchRequest) {
				oSpySubmitBatchRequest.restore();
			}
		}
	});


	QUnit.test("Non-batch: ListBinding - skip/top - default", function(assert) {
		var done = assert.async();

		//var oModel = new sap.ui.model.odata.v2.ODataModel(sURI, {json: true, useBatch: false});
		oModel = initModel();
		oModel.setUseBatch(false);
		oModel.metadataLoaded().then(function() {
			var oBinding = oModel.bindList("/Customers", null, null, null, {});

			var fnHandler1 = function() {
				// retrieve 20 entries (skip=0 top=60)
				oBinding.detachChange(fnHandler1);
				assert.equal(oBinding.getPath(), "/Customers", "ListBinding path");
				assert.equal(oBinding.getLength(), 91, "length of items");
				assert.equal(oBinding.aKeys.length, 20);
				oBinding.attachChange(fnHandler2);
				oBinding.getContexts(0, 10, 50);
			};

			var fnHandler2 = function() {
				// retrieve 20 entries (skip=20 top=40)
				oBinding.detachChange(fnHandler2);
				assert.equal(oBinding.getLength(), 91, "length of items");
				assert.equal(oBinding.aKeys.length, 40);
				oBinding.getContexts(0, 10, 50);
				done();
			};

			oBinding.attachRefresh(function() {
				oBinding.attachChange(fnHandler1);
				oBinding.getContexts(0, 10, 50);
			});

			oBinding.initialize();
		});
	});

	QUnit.test("Non-batch: ListBinding - skip/top - negative threshold is available", function(assert) {
		var done = assert.async();

		//var oModel = new sap.ui.model.odata.v2.ODataModel(sURI, {json: true, useBatch: false});
		oModel = initModel();
		oModel.setUseBatch(false);
		oModel.metadataLoaded().then(function() {
			var oBinding = oModel.bindList("/Customers", null, null, null, {});

			var fnHandler1 = function() {
				// retrieve 20 entries (skip=0 top=60)
				oBinding.detachChange(fnHandler1);
				assert.equal(oBinding.getPath(), "/Customers", "ListBinding path");
				assert.equal(oBinding.getLength(), 91, "length of items");
				assert.equal(oBinding.aKeys.length, 20);
				oBinding.attachChange(fnHandler2);
				oBinding.getContexts(0, 10, 50);
			};

			var fnHandler2 = function() {
				// retrieve 20 entries (skip=20 top=40)
				oBinding.detachChange(fnHandler2);
				assert.equal(oBinding.getLength(), 91, "length of items");
				assert.equal(oBinding.aKeys.length, 40);
				oBinding.getContexts(0, 10, 50);
				done();
			};

			oBinding.attachRefresh(function() {
				oBinding.attachChange(fnHandler1);
				oBinding.getContexts(0, 10, 50);
			});

			oBinding.initialize();
		});
	});
});