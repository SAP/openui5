/*global QUnit*/
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/Filter",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataModel",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService"
], function(Filter, FilterOperator, ODataFilter, OperationMode, ODataModel, fakeService) {
	"use strict";

	var oModel;

	function initModel() {
		var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";

		return new ODataModel("/proxy/http/" + sURI.replace("http://",""), {
			json: false,
			useBatch: true
		});
	}

	// Request security token to avoid later HEAD requests
	initModel().refreshSecurityToken();

	QUnit.module("sap.ui.model.odata.v2.ODataListBinding with sap.ui.model.odata.Filter", {
		beforeEach : function() {
			oModel = initModel();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("ListBinding ODataFilter", function(assert){
		var done = assert.async();
		var oFilter, oFilter2, oBinding;
		var handler = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "startsWith, endsWith filtered content length");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "startsWith, endsWith filtered content");

			oBinding.detachChange(handler);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.LE, value1: "Z"}, {operator:FilterOperator.GE, value1: "A"}, {operator:FilterOperator.NE, value1: "Beverages"}]);
			oBinding.filter([oFilter]);
			oBinding.attachChange(handler1);
		};
		var handler1 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 7, "ODataFilter, ANDed");
			assert.ok(oModel.getProperty("CategoryName",aFilteredContexts[0]) != "Beverages" && oModel.getProperty("CategoryName",aFilteredContexts[0]) == "Condiments", "ODataFilter, ANDed");

			oBinding.detachChange(handler1);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			oBinding.filter([oFilter]);
			oBinding.attachChange(handler2);
		};
		var handler2 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "ODataFilter, ORed");

			oBinding.detachChange(handler2);
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ings");
			oBinding.filter([oFilter, oFilter2]);
			oBinding.attachChange(handler3);
		};
		var handler3 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "ODataFilter + normal Filter");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "ODataFilter + normal Filter");

			oBinding.detachChange(handler3);
			done();
		};

		oBinding = oModel.bindList("/Categories");
		//check EQ
		oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Beverages"}]);

		var fnFilter = function() {
			oBinding.detachRefresh(fnFilter);
			oBinding.attachRefresh(function() {oBinding.getContexts();});
			oBinding.filter([oFilter]);
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(fnFilter);
	});

	QUnit.test("ListBinding clientside ODataFilter", function(assert){
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
			// ANDed filters
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.LE, value1: "Z"}, {operator:FilterOperator.GE, value1: "A"}, {operator:FilterOperator.NE, value1: "Beverages"}]);
			oBinding.filter([oFilter]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 7, "ODataFilter, ANDed");
			assert.ok(oModel.getProperty("CategoryName",aFilteredContexts[0]) != "Beverages" && oModel.getProperty("CategoryName",aFilteredContexts[0]) == "Condiments", "ODataFilter, ANDed");

			// ORed filters
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			oBinding.filter([oFilter]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 2, "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "ODataFilter, ORed");

			// ORed + ANDed filters
			oFilter = new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Condiments"}, {operator:FilterOperator.EQ, value1: "Beverages"}], false);
			var oFilter2 = new Filter("Description", FilterOperator.EndsWith, "ings");
			oBinding.filter([oFilter, oFilter2]);

			aFilteredContexts = oBinding.getContexts();
			assert.equal(aFilteredContexts.length, 1, "ODataFilter + normal Filter");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "ODataFilter + normal Filter");
			done();
		};
		//check EQ
		var oFilter =  new ODataFilter("CategoryName", [{operator:FilterOperator.EQ, value1: "Beverages"}]);
		oBinding.filter([oFilter]);

		oBinding.attachChange(handler);
		oBinding.attachRefresh(function() {
			oBinding.getContexts();
		});
	});

	QUnit.test("ListBinding filter (ODataFilter.convert)", function(assert){
		var done = assert.async();
		var oFilter, oFilter2;
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
			oFilter2 = new ODataFilter("Description", [{operator: FilterOperator.EndsWith, value1: "ngs"}]);
			oBinding.filter([oFilter.convert(), oFilter2.convert()]);
			oBinding.attachChange(handler3);
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
		};
		var handler4 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 7, "ODataFilter, ANDed");
			assert.ok(oModel.getProperty("CategoryName",aFilteredContexts[0]) != "Beverages" && oModel.getProperty("CategoryName",aFilteredContexts[0]) == "Condiments", "ODataFilter, ANDed");

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
		};
		var handler5 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 2, "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Beverages", "ODataFilter, ORed");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[1]), "Condiments", "ODataFilter, ORed");

			oBinding.detachChange(handler5);
			oFilter = new ODataFilter("CategoryName", [{
				operator:FilterOperator.EQ, value1: "Condiments"
			}, {
				operator:FilterOperator.EQ, value1: "Beverages"
			}], false);
			oFilter2 = new ODataFilter("Description", [{
				operator: FilterOperator.EndsWith,
				value1: "ings"
			}]);
			oBinding.filter([oFilter.convert(), oFilter2.convert()]);
			oBinding.attachChange(handler6);
		};
		var handler6 = function(oEvent){
			// contexts should be now loaded
			var aFilteredContexts = oEvent.oSource.getContexts();
			assert.equal(aFilteredContexts.length, 1, "ODataFilter + normal Filter");
			assert.equal(oModel.getProperty("CategoryName",aFilteredContexts[0]), "Condiments", "ODataFilter + normal Filter");

			oBinding.detachChange(handler6);
			done();
		};
		var oBinding = oModel.bindList("/Categories");
		//check EQ
		var oFilter = new ODataFilter("CategoryName", [{
			operator: FilterOperator.EQ,
			value1: "Beverages"
		}]);
		var fnFilter = function() {
			oBinding.detachRefresh(fnFilter);
			oBinding.attachRefresh(function() {oBinding.getContexts();});
			oBinding.filter(oFilter.convert());
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(fnFilter);
	});
});
