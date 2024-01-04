
/*global OData, QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	"sap/m/Button",
	"sap/m/DisplayListItem",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientModel",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/thirdparty/jquery",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService"
], function(Log, encodeURL, each, isEmptyObject, isPlainObject, Button, ListItem, HBox, Input,
		Label, List, Panel, Text, Messaging, Message, XMLView, ChangeReason, ClientModel, Context, Filter,
		FilterOperator, Sorter, JSONModel, MessageScope, ODataUtils, ODataModel, Column, Table,
		jQuery, fakeService) {
	"use strict";

	//some view
	var sView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">\
			<List id="myList" items="{path: \'/Categories\', suspended: true}">\
				<InputListItem>\
					<content>\
						<Input value="{path: \'CategoryName\', suspended: true}"/>\
					</content>\
				</InputListItem>\
			</List>\
		</mvc:View>';

	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sURI = "/proxy/http/" + sURI.replace("http://","");

	var oLabel = new Label("myLabel");
	var oPanel = new Panel();
	oPanel.addContent(oLabel);

	var oPanel2 = new Panel();
	var oTable = new Table({ // create Table UI
		columns : [
			new Column({
				label: new Label({text:"Product Name"}),
				template: new Input({value: "{ProductName}"})
			})
		]
	});
	oTable.bindRows("Products");
	oPanel2.addContent(oTable);

	/**
	 * Removes all shared Metadata
	 */
	function cleanSharedData() {
		ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}


	function initModel(sURI, mParameters, bRemoveMetadata) {
		if (!mParameters) {
			mParameters = {};
		}

		mParameters.useBatch = mParameters.useBatch === true;
		bRemoveMetadata = bRemoveMetadata !== false;

		if (bRemoveMetadata) {
			cleanSharedData();
		}
		var oModel = new ODataModel(sURI, mParameters);
		return oModel;
	}

	var bChanged = false, bDataRequested = false, bDataReceived = false;

	var fnChange = function(assert, oEvent) {
		bChanged = true;
		assert.ok(bDataRequested && !bDataReceived, "change fired");
	};

	var fnDataRequested = function(assert, oEvent) {
		bDataRequested = true;
		assert.ok(!bDataReceived && !bChanged, "dataRequested fired");
	};

	var fnDataReceived = function(assert, oEvent) {
		bDataReceived = true;
		assert.ok(bChanged && bDataRequested, "dataRecieved fired");
	};

	QUnit.module("Model warmup");

	QUnit.test("metadata loading from warmupUrl", function(assert) {
		var done = assert.async();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {warmupUrl:"test-resources/sap/ui/core/qunit/odata/v2/data/warmup.xml"}, true);

		oModel.metadataLoaded().then(function() {
			var oEntityType = oModel.oMetadata._getEntityTypeByName("Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "NorthwindModel", "EntityType definition has correct namespace!");
			oEntityType = oModel.oMetadata._getEntityTypeByName("NorthwindModel.Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "NorthwindModel", "EntityType definition has correct namespace!");
			spy.restore();
			//timeout needed as requests are triggered async by a Promise
			setTimeout(function() {
				assert.equal(spy.callCount, 1, "only metadata loaded, data requests ignored!");
				done();
			},0);
		});
		oModel.attachMetadataLoaded(function() {
			var oEntityType = oModel.oMetadata._getEntityTypeByName("Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "NorthwindModel", "EntityType definition has correct namespace!");
			oEntityType = oModel.oMetadata._getEntityTypeByName("NorthwindModel.Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "NorthwindModel", "EntityType definition has correct namespace!");
		});
		oModel.annotationsLoaded().then(function(oAnnotations) {
			assert.ok(typeof oAnnotations == 'object', "annotations loaded");
			assert.ok(oAnnotations.annotations.EntityContainer, "annotations loaded");
		});

		oModel.read("Products");
		oModel.remove("Products(1)");
		oModel.update("Products(1)", {});
		oModel.create("Products(1)", {});
	});

	QUnit.module("v2.OdataModel");

	QUnit.test("test metadata and 'complex' namespace - 'some.name.space'", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {metadataUrlParams:{"test-namespace": true}}, true);
		oModel.metadataLoaded().then(function() {
			var oEntityType = oModel.oMetadata._getEntityTypeByName("Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "North.wind.Model", "EntityType definition has correct namespace!");
			oEntityType = oModel.oMetadata._getEntityTypeByName("North.wind.Model.Category");
			assert.ok(oEntityType, "EntityType definition found!");
			assert.equal(oEntityType.namespace, "North.wind.Model", "EntityType definition has correct namespace!");
			done();
		});
	});

	QUnit.test("test oDataModel - oMetadata shared across models", function(assert) {
		var done = assert.async();
		var mOptions = {
				json : true,
				loadMetadataAsync: true,
				useBatch: false
			};
		var oModel = initModel(sURI, mOptions);
		var oModel2 = {};

		oModel.oMetadata.attachLoaded(function() {
			Log.debug("test 1 - metadata loaded is fired on metadata onload of model1");
		});

		oModel.attachMetadataLoaded(function() {
			assert.ok(oModel.getServiceMetadata() != null, "First model: Service metadata is available");
			oModel.destroy();
			oModel2 = initModel(sURI, mOptions, false);

			var bFiredAtMetadata = false;

			oModel2.oMetadata.attachLoaded(function() {
				assert.ok(false,'metadata loaded is fired on metadata');
				bFiredAtMetadata = true;
			});

			// attach again and wait for the metadataloaded event at the model itself,
			//fail if event is fired at the metadata object
			oModel2.attachMetadataLoaded(function() {
				Log.debug("metadata loaded is fired");
				assert.ok(oModel2.getServiceMetadata() != null, "Second model: Service metadata is available");
				if (!bFiredAtMetadata) {
					assert.ok(true, 'Metadata loaded fired at model only');
				} else {
					assert.ok(false, 'Metadata loaded fired at metadata object');
				}
				done();
			});
		});
	});

	QUnit.test("metadata failed handling", function(assert) {
		assert.expect(3);

		var done = assert.async();
		var mOptions = {
				json : true,
				loadMetadataAsync: true,
				useBatch:false
			};
		var oModel = initModel("/DOESNOTEXIST", mOptions);
		var handleFailed = function() {
			assert.ok(!oModel.getServiceMetadata(), "Metadata failed correctly");
			assert.ok(oModel.oMetadata.isFailed(), "Failed on metadata object has been set correctly");
			var oModel2 = initModel("/DOESNOTEXIST", mOptions);
			oModel2.attachMetadataFailed(function() {
				assert.ok(!oModel2.getServiceMetadata(), "Metadata on second model failed correctly");
				done();
			});
			oModel.detachMetadataFailed(handleFailed);
		};
		oModel.attachMetadataFailed(handleFailed);
	});

	QUnit.test("test oDataModel _loadData XML",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.read("/Categories", {success: function() {
			performTest(oModel, assert);
			done();
		}});
	});

	QUnit.test("test oDataModel _loadData JSON",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		oModel.read("/Categories", {success: function() {
			performTest(oModel, assert);
			done();
		}});
	});

	function performTest(oModel, assert) {
		assert.equal(oModel.getProperty("/Categories(1)/CategoryName"), "Beverages", "absolute path without context");
		oModel.createBindingContext("/Categories(1)", null, function(newContext) {
			assert.equal(newContext.getProperty("CategoryName"), "Beverages", "relative path with context");
			var iLength = 0;
			var categories = oModel.getProperty("/");
			for (var category in categories) {
				iLength++;
				assert.equal(categories[category].CategoryID, iLength);
			}
			assert.equal(iLength, 8);
		});
	}

	QUnit.test("getMessagesByEntity", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI);

		var oMessage = new  Message({
			message: "test1",
			severity: "error",
			persistent: true,
			processor: oModel
		});

		var oMessage2 = new  Message({
			message: "test2",
			severity: "error",
			persistent: false,
			processor: oModel
		});

		assert.strictEqual(oModel.getMessageScope(), MessageScope.RequestedObjects,
			"Initial message scope is: RequestedObjects");

		Messaging.registerMessageProcessor(oModel);
		oModel.metadataLoaded().then(function() {
			var oContext = oModel.createEntry("/Products");
			oMessage.setTargets([oContext.getPath()]);
			oMessage2.setTargets([oContext.getPath()]);
			Messaging.addMessages([oMessage, oMessage2]);
			assert.equal(oModel.getMessagesByEntity(oContext.getPath()).length, 2, "all messages returned");
			assert.equal(oModel.getMessagesByEntity(oContext.getPath(), true).length, 1, "messages that are not persitent returned");
			Messaging.unregisterMessageProcessor(oModel);
			done();
		});
	});

	QUnit.test("test bindList", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories").initialize();
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test bindList inlinecount", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "Inline" }).initialize();
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test bindList no count", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None" }).initialize();
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" }).initialize();
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with create binding context", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");

			oModel.createBindingContext("/Categories(1)", null, function(oContext) {
				// rest data should be there now
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});

			oBinding.detachChange(handler1);

		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with create binding context select", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");

			oModel.createBindingContext("/Categories(1)", null, {select : "CategoryID" }, function(oContext) {
				// rest select data should be there now
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
				assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
				done();          // resume normal testing
			});

			oBinding.detachChange(handler1);

		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test create binding context with optional parameters", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		oModel.metadataLoaded().then(function() {
			// old behavior with passing null context
			oModel.createBindingContext("/Categories(1)", null, {select : "CategoryID" }, function(oContext) {
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
				assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
				oModel.removeData();
				// no context
				oModel.createBindingContext("/Categories(1)", {select : "CategoryID" }, function(oContext) {
					assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
					assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
					assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
					oModel.removeData();
					// with context
					oModel.createBindingContext("Category", oModel.getContext("/Products(1)"), {select : "CategoryID" }, function(oContext) {
						assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
						assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
						assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
						oModel.removeData();
						// with context no parameters
						oModel.createBindingContext("Category", oModel.getContext("/Products(1)"), function(oContext) {
							assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "property available");
							assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "property available");
							assert.equal(oModel.getProperty("/Categories(1)").Picture, "", "property available");
							oModel.removeData();
							// only callback function
							oModel.createBindingContext("/Categories(1)", function(oContext) {
								assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "property available");
								assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "property available");
								assert.equal(oModel.getProperty("/Categories(1)").Picture, "", "property available");
								done(); // resume normal testing
							}, true);
						}, true);
					}, true);
				}, true);
			});

		});
	});

	QUnit.test("test expand", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oFilter = new Filter("ProductName", "EQ", "Chai");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(1)").ProductName, "Chai", "test property");
			assert.equal(oModel.getProperty("/Products(1)/Category").CategoryName, "Beverages", "test expand property");
			oBinding.detachChange(handler1);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test expand with create binding context", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI);
		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter]).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category"), undefined, "test expand property not there");

			oModel.createBindingContext("/Products(2)", null, {expand : "Category" }, function(oContext) {
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});
			oBinding.detachChange(handler1);
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select expand with create binding context", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI);
		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {select : "Category,ProductName", expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category").CategoryName, "Beverages", "test expand property");

			oModel.createBindingContext("/Products(2)", null, {select : "Category, ProductID", expand : "Category" }, function(oContext) {
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Products(2)").ProductID, 2, "test property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});
			oBinding.detachChange(handler1);

		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with nav props and expand with create binding context and data already loaded: isreloadneeded = false", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI);
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {select : "Category/CategoryName,ProductName", expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category").CategoryName, "Beverages", "test expand property");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "test property should not be there");
			assert.equal(spy.callCount, 2, "count and get request should be send");
			// do same again
			oModel.createBindingContext("/Products(2)", null, {select : "Category/CategoryName,ProductName", expand : "Category" }, function(oContext) {
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property should not be there");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "test property should not be there");
				assert.equal(spy.callCount, 2, "no additional request should be sent!!!");
				OData.defaultHttpClient.request.restore();
				done();
			});
			oBinding.detachChange(handler1);

		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with nav props and expand with context binding and data already loaded: isreloadneeded = false", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI);
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {select : "Category/CategoryName,ProductName", expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category").CategoryName, "Beverages", "test expand property");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "test property should not be there");
			assert.equal(spy.callCount, 2, "count and get request should be send");
			// do same again
			var oContextBinding = oModel.bindContext("/Products(2)", null, {select : "Category/CategoryName,ProductName", expand : "Category" });
			oContextBinding.attachChange(function(oContext) {
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property should not be there");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "test property should not be there");
				assert.equal(spy.callCount, 2, "no additional request should be sent!!!");
				OData.defaultHttpClient.request.restore();
				done();
			});
			oContextBinding.initialize();
			oBinding.detachChange(handler1);

		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test isreloadneeded - only product loaded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - only productname selected", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {select: "ProductName"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(!oContext, "Reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(!oContext, "Reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - category expanded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - productname selected, category expanded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(!oContext, "Reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(!oContext, "Reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - productname and categoryname selected, category expanded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(!oContext, "Reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(!oContext, "Reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - category expanded, but null", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(4)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(4)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(4)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(4)", null, {expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(4)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(4)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(oContext instanceof Context, "No reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - supplier expanded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Supplier"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier", select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for unselected supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products"});
			assert.ok(!oContext, "Reload needed for supplier/products expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products", select: "Supplier/*"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products", select: "Supplier/Products"});
			assert.ok(!oContext, "Reload needed for supplier/products expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - supplier/products expanded", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Supplier/Products"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier", select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for unselected supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier/products expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products", select: "Supplier/*"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Supplier/Products", select: "Supplier/Products"});
			assert.ok(oContext instanceof Context, "No reload needed for supplier/products expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - invalidate", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oModel.invalidate();

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(!oContext, "Reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(!oContext, "Reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(!oContext, "Reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - invalidateEntry", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oModel.invalidateEntry("Categories(2)");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test isreloadneeded - invalidateEntityType", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.equal(spy.callCount, 1, "get request should be send");

			oModel.invalidateEntityType("NorthwindModel.Category");

			oContext = oModel.createBindingContext("/Products(3)", null, {});
			assert.ok(oContext instanceof Context, "No reload needed for full entity");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "*"});
			assert.ok(oContext instanceof Context, "No reload needed for all properties");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName"});
			assert.ok(oContext instanceof Context, "No reload needed for property select");

			oContext = oModel.createBindingContext("/Products(3)", null, {expand: "Category"});
			assert.ok(!oContext, "Reload needed for category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property select and category expand");

			oContext = oModel.createBindingContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
			assert.ok(!oContext, "Reload needed for property, expand property select and category expand");

			OData.defaultHttpClient.request.restore();
			done();
		});
	});


	QUnit.test("test invalidate", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {expand: "Category"});
		oBinding.attachChange(function(oContext) {
			var oProduct = oModel.getProperty("/Products(3)"),
				oCategory = oModel.getProperty("/Categories(2)");
			assert.equal(spy.callCount, 1, "get request should be send");
			oContext = oBinding.getBoundContext();

			oModel.invalidate();
			assert.ok(oProduct.__metadata.invalid, "Invalid flag set on Product");
			assert.ok(oCategory.__metadata.invalid, "Invalid flag set on Category");
			delete oProduct.__metadata.invalid;
			delete oCategory.__metadata.invalid;

			oModel.invalidate(function() { return true; });
			assert.ok(oProduct.__metadata.invalid, "Invalid flag set on Product");
			assert.ok(oCategory.__metadata.invalid, "Invalid flag set on Category");
			delete oProduct.__metadata.invalid;
			delete oCategory.__metadata.invalid;

			oModel.invalidate(function() { return false; });
			assert.ok(!oProduct.__metadata.invalid, "No invalid flag set on Product");
			assert.ok(!oCategory.__metadata.invalid, "No invalid flag set on Category");
			delete oProduct.__metadata.invalid;
			delete oCategory.__metadata.invalid;

			oModel.invalidate(function(sKey) {
				return sKey.indexOf("Products") === 0;
			});
			assert.ok(oProduct.__metadata.invalid, "Invalid flag set on Product");
			assert.ok(!oCategory.__metadata.invalid, "No invalid flag set on Category");
			delete oProduct.__metadata.invalid;
			delete oCategory.__metadata.invalid;

			oModel.invalidate(function(sKey, oEntry) {
				return oEntry.__metadata.type === "NorthwindModel.Category";
			});
			assert.ok(!oProduct.__metadata.invalid, "No invalid flag set on Product");
			assert.ok(oCategory.__metadata.invalid, "Invalid flag set on Category");
			delete oProduct.__metadata.invalid;
			delete oCategory.__metadata.invalid;

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test invalidateEntry", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {});
		oBinding.attachChange(function(oContext) {
			var oEntry = oModel.getProperty("/Products(3)");
			assert.equal(spy.callCount, 1, "get request should be send");
			oContext = oBinding.getBoundContext();

			oModel.invalidateEntry("Products(3)");
			assert.ok(oEntry.__metadata.invalid, "Invalid flag set by key");
			delete oEntry.__metadata.invalid;

			oModel.invalidateEntry("/Products(3)");
			assert.ok(oEntry.__metadata.invalid, "Invalid flag set by path");
			delete oEntry.__metadata.invalid;

			oModel.invalidateEntry(oContext);
			assert.ok(oEntry.__metadata.invalid, "Invalid flag set by context");
			delete oEntry.__metadata.invalid;

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test invalidateEntityType", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oBinding = oModel.bindContext("/Products(3)", null, {});
		oBinding.attachChange(function(oContext) {
			var oEntry = oModel.getProperty("/Products(3)");
			assert.equal(spy.callCount, 1, "get request should be send");
			oContext = oBinding.getBoundContext();

			oModel.invalidateEntityType("NorthwindModel.Product");
			assert.ok(oEntry.__metadata.invalid, "Invalid flag set on entry with given entity type");
			delete oEntry.__metadata.invalid;

			oModel.invalidateEntityType("NorthwindModel.Category");
			assert.ok(!oEntry.__metadata.invalid, "Invalid flag not set on entry with different entity type");
			delete oEntry.__metadata.invalid;

			OData.defaultHttpClient.request.restore();
			done();
		});
	});

	QUnit.test("test getProperty on label", function(assert) {
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oModel.read("/Categories", {success: function() {
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "text value from model");
			oLabel.unbindProperty("text");
			done();
		}});
	});

	QUnit.test("test getProperty with expand and bIncludeExpandEntries true and false", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oFilter = new Filter("ProductName", "EQ", "Chai");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.oData["Products(1)"].Category.__ref, "Categories(1)", "test property data with refs directly.");
			assert.equal(oModel.getProperty("/Products(1)").Category.__ref, "Categories(1)", "test get property with expanded property...default: epanded property should be there");
			assert.equal(oModel.getProperty("/Products(1)", null, false).Category.__ref, "Categories(1)", "test removeReferences get property bIncludeExpandEntries = false");
			assert.equal(oModel.getProperty("/Products(1)", null, true).Category.CategoryID, 1, "test get property bIncludeExpandEntries = true");
			assert.equal(oModel.getProperty("/Products(1)", null, true).Category.CategoryName, "Beverages", "test get property bIncludeExpandEntries = true");
			oBinding.detachChange(handler1);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test getObject", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var oBinding = oModel.bindContext("/Products(3)", null, {});
		oBinding.attachChange(function(oContext) {
			assert.ok(oModel.oData["Products(3)"] !== oModel.getObject("/Products(3)"), "test object copy via getObject");
			assert.ok(oModel.oData["Products(3)"] === oModel.getProperty("/Products(3)"), "test object copy via getProperty");

			var oValue = oModel.getObject("/Products(3)", {select : "ProductName, ProductID"});
			assert.equal(oValue.ProductName, "Aniseed Syrup", "test getObject with select param");
			assert.equal(oValue.ProductID, 3, "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('Category'), "test getObject with select param");

			done();
		});
	});

	QUnit.test("test getObject with property/meta path", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.getMetaModel();
		var oBinding = oModel.bindContext("/Products(3)", null, {});
		oBinding.attachChange(function(oContext) {

			assert.equal(oModel.getObject("/Products(3)/ProductName"), "Aniseed Syrup", "getObject returns property values correctly");
			assert.equal(oModel.getObject("/Products(3)/##name"), "Product", "getObject returns meta path results correctly");

			done();
		});
	});

	QUnit.test("test getObject with/without select/expand", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		var oFilter = new Filter("ProductName", "EQ", "Chai");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {expand : "Category" }).initialize();
		var handler1 = function() { // delay the following test
			assert.equal(oModel.oData["Products(1)"].Category.__ref, "Categories(1)", "test property data with refs directly.");
			assert.equal(oModel.getObject("/Products(1)").Category.__ref, "Categories(1)", "getobject data with refs directly.");

			var oValue = oModel.getObject("/Products(1)", {select : "ProductName"});
			assert.equal(oValue.ProductName, "Chai", "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('Category'), "test getObject with select param");

			oValue = oModel.getObject("/Products(1)", {expand : "Category"});
			assert.equal(oValue.ProductName, "Chai", "test getObject with expand param");
			assert.equal(oValue.Category.CategoryID, 1, "test getObject with expand param");
			assert.equal(oValue.Category.CategoryName, "Beverages", "test getObject with expand param");

			oValue = oModel.getObject("/Products(1)", {select: "ProductName, Category, Category/CategoryName", expand : "Category"});
			assert.equal(oValue.ProductName, "Chai", "test getObject with select and expand param");
			assert.ok(!oValue.hasOwnProperty('ProductID'), "test getObject with select and expand param");
			assert.equal(oValue.Category.CategoryID, 1, "test getObject with select and expand param");
			assert.equal(oValue.Category.CategoryName, "Beverages", "test getObject with select and expand param");

			oBinding.detachChange(handler1);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test getObject with not all data available", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var oBinding = oModel.bindContext("/Products(3)", null, {select: "ProductName,Category/CategoryName", expand: "Category"});
		oBinding.attachChange(function(oContext) {
			assert.ok(oModel.oData["Products(3)"] !== oModel.getObject("/Products(3)"), "test object copy via getObject");
			assert.ok(oModel.oData["Products(3)"] === oModel.getProperty("/Products(3)"), "test object copy via getProperty");

			var oValue = oModel.getObject("/Products(3)");
			assert.equal(oValue.ProductName, "Aniseed Syrup", "test getObject with no param");
			assert.ok(!oValue.hasOwnProperty('ProductID'), "test getObject with no param");
			assert.equal(oValue.Category.__ref, "Categories(2)", "test getObject with no param contains __ref");

			var oValue = oModel.getObject("/Products(3)", {expand:"Category"});
			assert.equal(oValue, undefined, "test getObject with expand param");

			var oValue = oModel.getObject("/Products(3)", {select: "ProductName,ProductID", expand:"Category"});
			assert.equal(oValue, undefined, "test getObject with expand and select param");

			var oValue = oModel.getObject("/Products(3)", {select: "ProductName,ProductID,Category", expand:"Category,Supplier"});
			assert.equal(oValue, undefined, "test getObject with expand and select param");

			done();
		});
	});

	QUnit.test("test getObject with expand and 1..n nav prop", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		var oBinding = oModel.bindContext("/Categories(7)", null, {expand: "Products"});
		oBinding.attachChange(function(oContext) {
			assert.ok(oModel.oData["Categories(7)"] !== oModel.getObject("/Categories(7)"), "test object copy via getObject");
			assert.ok(oModel.oData["Categories(7)"] === oModel.getProperty("/Categories(7)"), "test object copy via getProperty");

			var oValue = oModel.getObject("/Categories(7)");
			assert.equal(oValue.CategoryName, "Produce", "test getObject with no param");
			assert.equal(oValue.CategoryID, 7, "test getObject with no param");
			assert.ok(Array.isArray(oValue.Products.__list), "test getObject with no param contains __list");

			var oValue = oModel.getObject("/Categories(7)", {select: "CategoryName"});
			assert.equal(oValue.CategoryName, "Produce", "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('CategoryID'), "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('Products'), "test getObject with select param");

			var oValue = oModel.getObject("/Categories(7)", {expand: "Products"});
			assert.equal(oValue.CategoryName, "Produce", "test getObject with expand param");
			assert.equal(oValue.CategoryID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductName, "Uncle Bob's Organic Dried Pears", "test getObject with expand param");

			var oValue = oModel.getObject("/Categories(7)", {select: "CategoryName", expand: "Products"});
			assert.equal(oValue.CategoryName, "Produce", "test getObject with select and expand param");
			assert.ok(!oValue.hasOwnProperty('CategoryID'), "test getObject with select and expand param");
			assert.ok(!oValue.hasOwnProperty('Products'), "test getObject with select and expand param");
			done();
		});
	});

	QUnit.test("test getObject with multiple nested expands", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: true});
		var oBinding = oModel.bindContext("/Suppliers(7)", null, {select: "*,Products/*,Products/Supplier/*,Products/Category/CategoryID,Products/Category/CategoryName",
			expand: "Products,Products/Supplier,Products/Category"});
		oBinding.attachChange(function(oContext) {
			assert.ok(oModel.oData["Suppliers(7)"] !== oModel.getObject("/Suppliers(7)"), "test object copy via getObject");
			assert.ok(oModel.oData["Suppliers(7)"] === oModel.getProperty("/Suppliers(7)"), "test object copy via getProperty");

			var oValue = oModel.getObject("/Suppliers(7)");
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with no param");
			assert.equal(oValue.SupplierID, 7, "test getObject with no param");
			assert.ok(Array.isArray(oValue.Products.__list), "test getObject with no param contains __list");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "ContactName"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('SupplierID'), "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('Products'), "test getObject with select param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "*"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with no param");
			assert.equal(oValue.SupplierID, 7, "test getObject with no param");
			var sDeferred = oValue.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with no param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "*", expand: "Products"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with no param");
			assert.equal(oValue.SupplierID, 7, "test getObject with no param");
			var sDeferred = oValue.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with no param");

			var oValue = oModel.getObject("/Suppliers(7)", {expand:"Products"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Products(16)/Supplier"), "test getObject with expand param");
			var sDeferred = oValue.Products[0].Category.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Products(16)/Category"), "test getObject with expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {expand:"Products,Products/Supplier,Products/Category"});
			assert.equal(oValue, undefined, "test getObject with expand returns undefined for incomplete data");

			// should be same result as one getObject earlier because we return everything if it is included in expand
			var oValue = oModel.getObject("/Suppliers(7)", {select: "*,Products/*,Products/Supplier/*,Products/Category/CategoryID,Products/Category/CategoryName", expand:"Products,Products/Supplier,Products/Category"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.ContactName, "Ian Devling", "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with expand param");
			assert.equal(oValue.Products[0].Category.CategoryName, "Confections", "test getObject with expand param");
			assert.equal(oValue.Products[0].Category.CategoryID, 3, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with expand param");
			assert.ok(!oValue.Products[0].Category.hasOwnProperty('Description'), "test getObject with expand param");

			done();
		});
	});

	QUnit.test("test getObject with complex cases with select and expand", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: true});
		var oBinding = oModel.bindContext("/Suppliers(7)", null, {
			expand: "Products,Products/Supplier,Products/Category"});
		oBinding.attachChange(function(oContext) {
			assert.ok(oModel.oData["Suppliers(7)"] !== oModel.getObject("/Suppliers(7)"), "test object copy via getObject");
			assert.ok(oModel.oData["Suppliers(7)"] === oModel.getProperty("/Suppliers(7)"), "test object copy via getProperty");

			var oValue = oModel.getObject("/Suppliers(7)");
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with no param");
			assert.equal(oValue.SupplierID, 7, "test getObject with no param");
			assert.ok(Array.isArray(oValue.Products.__list), "test getObject with no param contains __list");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "ContactName"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('SupplierID'), "test getObject with select param");
			assert.ok(!oValue.hasOwnProperty('Products'), "test getObject with select param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "*"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with no param");
			assert.equal(oValue.SupplierID, 7, "test getObject with no param");
			var sDeferred = oValue.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with no param");

			var oValue = oModel.getObject("/Suppliers(7)", {expand:"Products"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Products(16)/Supplier"), "test getObject with expand param");
			var sDeferred = oValue.Products[0].Category.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Products(16)/Category"), "test getObject with expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {expand:"Products,Products/Supplier,Products/Category"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.ContactName, "Ian Devling", "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with expand param");
			assert.equal(oValue.Products[0].Category.CategoryName, "Confections", "test getObject with expand param");
			assert.equal(oValue.Products[0].Category.CategoryID, 3, "test getObject with expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with expand param");
			assert.equal(oValue.Products[0].Category.Description, "Desserts, candies, and sweet breads", "test getObject with expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "Products/*", expand:"Products,Products/Supplier"});
			assert.ok(!oValue.hasOwnProperty('SupplierID'), "test getObject with select and expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with select and expand param");
			var sDeferred = oValue.Products[0].Supplier.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Products(16)/Supplier"), "test getObject with select and expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "SupplierID, Products", expand:"Products,Products/Supplier,Products/Category"});
			assert.equal(oValue.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.ContactName, "Ian Devling", "test getObject with select and expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.CategoryName, "Confections", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.CategoryID, 3, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with select and expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.Description, "Desserts, candies, and sweet breads", "test getObject with select and expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "SupplierID, Products/ProductName", expand:"Products,Products/Supplier,Products/Category"});
			assert.equal(oValue.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.ok(!oValue.Products[0].hasOwnProperty('ProductID'), "test getObject with select and expand param");
			assert.ok(!oValue.Products[0].hasOwnProperty('Supplier'), "test getObject with select and expand param");
			assert.ok(!oValue.Products[0].hasOwnProperty('Category'), "test getObject with select and expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {expand:"Products/Supplier,Products/Category"});
			assert.equal(oValue.ContactName, "Ian Devling", "test getObject with expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.ContactName, "Ian Devling", "test getObject with select and expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.CategoryName, "Confections", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.CategoryID, 3, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Supplier.SupplierID, 7, "test getObject with select and expand param");
			var sDeferred = oValue.Products[0].Supplier.Products.__deferred.uri;
			assert.ok(sDeferred.endsWith("/Suppliers(7)/Products"), "test getObject with select and expand param");
			assert.equal(oValue.Products[0].Category.Description, "Desserts, candies, and sweet breads", "test getObject with select and expand param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "SupplierID, Products/ProductName", expand:"Products"});
			assert.ok(!oValue.hasOwnProperty('ContactName'), "test getObject with select and expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.ok(!oValue.Products[0].hasOwnProperty('ProductID'), "test getObject with select and expand param");
			assert.ok(!oValue.Products[0].hasOwnProperty('Category'), "test getObject with select and param");
			assert.ok(!oValue.Products[0].hasOwnProperty('Supplier'), "test getObject with select and param");

			var oValue = oModel.getObject("/Suppliers(7)", {select: "SupplierID, Products/ProductName, Products", expand:"Products"});
			assert.ok(!oValue.hasOwnProperty('ContactName'), "test getObject with select and expand param");
			assert.equal(oValue.SupplierID, 7, "test getObject with select and expand param");
			assert.equal(oValue.Products.length, 5, "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductName, "Pavlova", "test getObject with select and expand param");
			assert.equal(oValue.Products[0].ProductID, 16, "test getObject with select and expand param");

			done();
		});
	});

	QUnit.test("test submitChanges success", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.read("/Products(3)", {
			groupId: "changes"
		});
		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(true, "Success handler has been called");
				assert.ok(typeof oData === "object", "Response data is passed to success handler");
				done();
			},
			error: function(oError) {
				assert.ok(false, "Error handler must not be called");
			}
		});
	});

	QUnit.test("test submitChanges error", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.read("/Batch500", {
			groupId: "changes"
		});
		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(false, "Success handler must not be called");
			},
			error: function(oError) {
				assert.ok(true, "Error handler has been called");
				assert.ok(typeof oError === "object", "Response data is passed to error handler");
				done();
			}
		});
	});

	QUnit.test("test submitChanges abort", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.read("/Products(3)", {
			groupId: "changes"
		});
		var oHandle = oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(false, "Success handler must not be called");
			},
			error: function(oError) {
				assert.ok(true, "Error handler has been called");
				assert.ok(typeof oError === "object", "Response data is passed to error handler");
				assert.equal(oError.statusCode, 0, "Status code of aborted request is 0");
				done();
			}
		});
		oHandle.abort();
	});

	QUnit.test("test submitChanges abort after sent", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.read("/Products(3)", {
			groupId: "changes"
		});
		var oHandle = oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(false, "Success handler must not be called");
			},
			error: function(oError) {
				assert.ok(true, "Error handler has been called");
				assert.ok(typeof oError === "object", "Response data is passed to error handler");
				assert.equal(oError.statusCode, 0, "Status code of aborted request is 0");
				done();
			}
		});
		oModel.attachBatchRequestSent(function() {
			oHandle.abort();
		});
	});

	QUnit.test("test submitChanges without changes or requests", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(true, "Success handler has been called");
				assert.ok(typeof oData === "object", "Response data is passed to success handler");
				done();
			},
			error: function(oError) {
				assert.ok(false, "Error handler must not be called");
			}
		});
	});

	QUnit.test("test submitChanges with error on inner request", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		oModel.read("/Fail500", {
			groupId: "changes"
		});
		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(true, "Success handler has been called");
				assert.ok(typeof oData === "object", "Response data is passed to success handler");
				done();
			},
			error: function(oError) {
				assert.ok(false, "Error handler must not be called");
			}
		});
	});

	QUnit.test("test submitChanges with abort on inner request", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		var oHandle = oModel.read("/Products(3)", {
			groupId: "changes"
		});
		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(true, "Success handler has been called");
				assert.ok(typeof oData === "object", "Response data is passed to success handler");
				done();
			},
			error: function(oError) {
				assert.ok(false, "Error handler must not be called");
			}
		});
		oHandle.abort();
	});

	QUnit.test("test submitChanges with abort on inner request after sent", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json: false});
		oModel.setUseBatch(true);

		var oHandle = oModel.read("/Products(3)", {
			groupId: "changes"
		});
		oModel.submitChanges({
			groupId: "changes",
			success: function(oData) {
				assert.ok(true, "Success handler has been called");
				assert.ok(typeof oData === "object", "Response data is passed to success handler");
				done();
			},
			error: function(oError) {
				assert.ok(false, "Error handler must not be called");
			}
		});
		oModel.attachBatchRequestSent(function() {
			oHandle.abort();
		});
	});

	QUnit.test("test double load update", function(assert) {
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oModel.read("/Categories", {success: function() {
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "new text value from model");
			oLabel.unbindProperty("text");
			oModel.read("/Regions", {success: function() {
				assert.equal(oLabel.getText(),"", "default value");
				oLabel.bindProperty("text", "/Regions(2)/RegionID");
				assert.equal(oLabel.getText(), "2", "2nd new text value from model");
				oLabel.unbindProperty("text");
				done();
			}});
		}});
	});

	QUnit.test("test remove data", function(assert) {
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oModel.read("/Categories", {success: function() {
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "text value from model");
			oModel.removeData();
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "", "text value from model");
			oLabel.unbindProperty("text");
			done();
		}});
	});

	QUnit.test("test create binding context", function(assert) {
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, {json:false});

		oModel.read("/Categories", {success: function() {
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			oModel.createBindingContext("/Categories(2)", null, function(oContext) {
				assert.equal(oContext.getPath(), "/Categories(2)","new Context");
				oModel.createBindingContext("", oContext, function(oContext2) {
					assert.equal(oContext2.getPath(), "/Categories(2)","new Context");
					oModel.createBindingContext("/Products(2)", null, function(oContext3) {
						assert.equal(oContext3.getPath(), "/Products(2)","new Context");
						done();
					});
				});
			});
		}});
	});

	QUnit.test("test create binding context with broken service", function(assert) {
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, {metadataUrlParams: {"broken":true}, json:true});

		oModel
			.attachMetadataLoaded(function() {
				assert.ok(false, "As service is broken, this should not happen!");
			})
			.attachMetadataFailed(function() {
				oModel.createBindingContext("/Categories(5)", null, function(oContext) {
					assert.ok(false, "As service is broken, this should not happen!");
				});
				assert.ok(true, "Metadata loading failed - no binding creation should happen");
				done();
			});
	});

	QUnit.test("test bindElement: relative with path '' ", function(assert) {
		assert.expect(1);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oPanel.setModel(oModel);
		oPanel.addContent(oLabel);
		oPanel.bindElement("/Products(3)");
		oLabel.setModel(oModel);
		oLabel.bindElement({path:"", parameters: {expand:"Category"}});
		var fnHandler = function() {
			assert.ok(!oModel.oData["Products(3)"][''], "no empty property created");
			oLabel.getElementBinding().detachDataReceived(fnHandler);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			oPanel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachDataReceived(fnHandler);
	});

	QUnit.test("test bindElement", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("/Categories(2)");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement 2", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement - set ParentContext null", function(assert) {
		assert.expect(5);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.getElementBinding().attachChange(fnHandler2);
			oLabel.setBindingContext();
		};
		var fnHandler2 = function() {
			assert.ok(!oLabel.getBindingContext(), "no bindingContext");
			assert.ok(!oLabel.getElementBinding().getBoundContext(), "element context must be reset");
			assert.ok(!oLabel.getElementBinding().getBoundContext(), "parent context must be reset");
			oLabel.getElementBinding().detachChange(fnHandler2);
			oLabel.setBindingContext();
			oLabel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement 3", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oModel.metadataLoaded().then(function() {
			oLabel.bindElement("Category");
			var oTestContext = oModel.getContext("/Products(2)");
			oLabel.setBindingContext(oTestContext);
			assert.ok(oLabel.getBindingContext() == null, "Context should be null until the data from bindElement is loaded");
			var fnHandler = function() {
				assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
				oLabel.getElementBinding().detachChange(fnHandler);
				oLabel.setBindingContext();
				oLabel.unbindElement();
				done();
			};
			oLabel.getElementBinding().attachChange(fnHandler);
		});
	});

	QUnit.test("test bindElement 4", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oLabel.bindElement("/Categories(2)");
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.setBindingContext();
			oLabel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});
	QUnit.test("test bindElement 5 - change parentContext", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oModel.attachRequestSent(fnHandler2);
			oTestContext = oModel.getContext("/Products(1)");
			oLabel.setBindingContext(oTestContext);
		};
		var fnHandler2 = function(oEvent) {
			var sUrl =  oEvent.getParameter("url");
			assert.ok(sUrl.indexOf('Products(1)/Category') > -1, "Parent context should be Products(1)");
			oLabel.getElementBinding().detachChange(fnHandler2);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement 6 - change parentContext with propagation", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oPanel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oModel.attachRequestSent(fnHandler2);
			oTestContext = oModel.getContext("/Products(1)");
			oPanel.setBindingContext(oTestContext);
		};
		var fnHandler2 = function(oEvent) {
			var sUrl =  oEvent.getParameter("url");
			assert.ok(sUrl.indexOf('Products(1)/Category') > -1, "Parent context should be Products(1)");
			oLabel.getElementBinding().detachChange(fnHandler2);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement 7 - checkUpdate", function(assert) {
		assert.expect(2);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		oModel.read("/Categories(2)");
		oModel.read("/Categories(7)");
		oModel.metadataLoaded().then(function() {
			oModel.createBindingContext("/Products(2)", function(oContext) {
				oLabel.setBindingContext(oContext);
				oLabel.bindElement("Category");
				oLabel.getElementBinding().attachChange(fnHandler);
			});
		});
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.getElementBinding().attachChange(fnHandler2);
			var oProduct = oModel.getProperty("/Products(2)");
			var oCategory = oModel.getProperty("/Categories(7)");
			oProduct.Category = oCategory;
			oModel._importData(oProduct, {}, {}, "/Products(2)", "/Products(2)");
			oModel.checkUpdate();
		};
		var fnHandler2 = function(oEvent) {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(7)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler2);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
	});

	QUnit.test("test bindElement 8 - parent context and model exist initially", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		var oPanel, oBox, oText;
		var fnHandler = function() {
			assert.equal(oText.getBindingContext().getPath(), "/Categories(2)", "Context is set after change");
			oBox.getObjectBinding().detachChange(fnHandler);
			oBox.getObjectBinding().attachChange(fnHandler2);
			oModel.createBindingContext("/Products(3)", function(oContext) {
				oPanel.setBindingContext(oContext);
			});
		};
		var fnHandler2 = function() {
			assert.ok(oText.getBindingContext() === null, "Binding context on text must be null after parent context change");
			oBox.getObjectBinding().detachChange(fnHandler2);
			oBox.getObjectBinding().attachChange(fnHandler3);
		};
		var fnHandler3 = function() {
			assert.equal(oText.getBindingContext().getPath(), "/Categories(7)", "Context is set after change");
			oBox.getObjectBinding().detachChange(fnHandler3);
			done();
		};
		oModel.createBindingContext("/Products(2)", function(oContext) {
			oPanel = new Panel({
				models: oModel,
				bindingContexts: oContext,
				content: [
					new HBox({
						objectBindings: {path: "Category"},
						items: [
							new Text({
								text: "{Name}"
							})
						]
					})
				]
			});
			oBox = oPanel.getContent()[0];
			oText = oBox.getItems()[0];
			assert.ok(oText.getBindingContext() === null, "Binding context on text must be null");
			oBox.getObjectBinding().attachChange(fnHandler);
		});
	});

	QUnit.test("test getBindingContext", function(assert) {
		assert.expect(4);
		var done = assert.async();
		cleanSharedData();
		var oODataModel = initModel(sURI, {json:false});
		var oJSONModel = new JSONModel();
		oPanel.setModel(oODataModel);
		var oTestContextOData = oODataModel.getContext("/Products(2)");
		var oTestContextJSON = oJSONModel.getContext("/");
		oPanel.setBindingContext(oTestContextJSON);
		assert.ok(!oPanel.getBindingContext(), "Model is type OData, Context is type JSON so no context should be returned");
		oPanel.setBindingContext(oTestContextOData);
		assert.ok(oPanel.getBindingContext(), "Context and model are the same type. Context returned");
		oLabel.setModel(oODataModel);
		oLabel.bindElement("Category");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oPanel.setBindingContext(oTestContextJSON);
			assert.ok(!oPanel.getBindingContext(), "Model is type OData, Context is type JSON so no context should be returned");
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test data events for bindElement", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("/Categories(2)");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		//Currently no event fired on bind element
		var fnRequestedHandler = function() {
			assert.equal(true, true, "Data requested event was fired");
		};
		var fnRecievedHandler = function() {
			assert.equal(true, true, "Data received event was fired");
			oLabel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachDataRequested(fnRequestedHandler);
		oLabel.getElementBinding().attachDataReceived(fnRecievedHandler);
	});

	QUnit.test("test data events for bindElement 204", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, false, "Categories");
		oLabel.setModel(oModel);
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("/Employees(2)/Employee1");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		//Currently no event fired on bind element
		var fnRequestedHandler = function() {
			assert.equal(true, true, "Data requested event was fired");
		};
		var fnRecievedHandler = function() {
			assert.equal(true, true, "Data received event was fired");
			oLabel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachDataRequested(fnRequestedHandler);
		oLabel.getElementBinding().attachDataReceived(fnRecievedHandler);
	});

	QUnit.test("test refresh(true) - dependent Listbindings should reload data", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oPanel2.setModel(oModel);
		oPanel2.bindElement("/Categories(7)");
		var spy = sinon.spy(OData.defaultHttpClient, "request");

		var oHandler = function() {
			assert.equal(spy.callCount, 3, "element binding as well as Table should load data");
			oTable.getBinding("rows").detachDataReceived(oHandler);
			oPanel2.getElementBinding().attachDataReceived(oHandler2);
			oPanel2.getElementBinding().refresh();
		};

		var oHandler2 = function() {
			assert.equal(spy.callCount, 4, "dependent bindings should not refresh");
			oPanel2.getElementBinding().detachDataReceived(oHandler2);
			oTable.getBinding("rows").attachDataReceived(oHandler3);
			oPanel2.getElementBinding().refresh(true);
		};

		var oHandler3 = function() {
			assert.equal(spy.callCount, 7, "element binding as well as Table should refetch data");
			OData.defaultHttpClient.request.restore();
			done();
		};

		oTable.getBinding("rows").attachDataReceived(oHandler);
	});

	QUnit.test("test refresh(true) - dependent Objectbindings should reload data", function(assert) {
		assert.expect(3);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oPanel.setModel(oModel);
		oPanel.bindElement("/Products(2)");
		oPanel.addContent(oPanel2);
		oPanel2.setModel(oModel);
		oPanel2.bindElement("Category");

		var spy = sinon.spy(OData.defaultHttpClient, "request");

		var oHandler = function() {
			assert.equal(spy.callCount, 4, "both element bindings as well as Table should load data");
			oTable.getBinding("rows").detachDataReceived(oHandler);
			oPanel.getElementBinding().attachDataReceived(oHandler2);
			oPanel.getElementBinding().refresh();
		};

		var oHandler2 = function() {
			assert.equal(spy.callCount, 5, "dependent bindings should not refresh");
			oPanel.getElementBinding().detachDataReceived(oHandler2);
			oTable.getBinding("rows").attachDataReceived(oHandler3);
			oPanel.getElementBinding().refresh(true);
		};

		var oHandler3 = function() {
			assert.equal(spy.callCount, 9, "element binding as well as Table should refetch data");
			oPanel.removeContent(oPanel2);
			oTable.getBinding("rows").detachDataReceived(oHandler3);
			OData.defaultHttpClient.request.restore();
			done();
		};

		oTable.getBinding("rows").attachDataReceived(oHandler);
	});

	QUnit.test("test bindElement with groupId", function(assert) {
		assert.expect(2);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["test"]);
		oLabel.setModel(oModel);
		oLabel.bindElement("/Categories(2)", {groupId:"test"});
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.setBindingContext();
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.unbindElement();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);

		oModel.metadataLoaded().then(function() {
			oLabel.getElementBinding().refresh();
			setTimeout(function() {
				assert.ok(oModel.mDeferredRequests['test'].requests.length === 1, "request deferred");
				oModel.submitChanges("test");
			}, 0);
		});
	});

	var oLB = new List("myLb");
	var oItemTemplate = new ListItem();

	QUnit.test("test model bindAggregation on Listbox", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oLB.setModel(oModel);
		oItemTemplate.bindProperty("value", "CategoryName").bindProperty("label", "Description");
		var oBinding = oLB.bindAggregation("items", "/Categories", oItemTemplate).getBinding('items');

		var handler = function() {
			var listItems = oLB.getItems();
			assert.equal(listItems.length, 8, "length of items");
			assert.equal(listItems[0].getValue(), "Beverages", "category 1 name");
			assert.equal(listItems[7].getLabel(), "Seaweed and fish", "category 8 description");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("test model bindAggregation on Listbox events", function(assert) {
		assert.expect(2);
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false});
		oLB.setModel(oModel);
		oItemTemplate.bindProperty("value", "CategoryName").bindProperty("label", "Description");
		var oBinding = oLB.bindAggregation("items", "/Categories", oItemTemplate).getBinding('items');

		//Currently no event fired on bind element
		var fnRequestedHandler = function() {
			assert.equal(true, true, "Data requested event was fired");
		};
		var fnRecievedHandler = function() {
			assert.equal(true, true, "Data received event was fired");
			done();
		};
		oBinding.attachDataRequested(fnRequestedHandler);
		oBinding.attachDataReceived(fnRecievedHandler);
	});

	QUnit.test("PropertyBinding getValue", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.read("/Categories", {success: function() {
			var oBinding = oModel.bindProperty("/Categories(2)/CategoryName");
			assert.equal(oBinding.getValue(), "Condiments", "text value from model");
			done();
		}});
	});

	QUnit.test("createBindingContext expand", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oContext.getPath(), "/Products(1)", "Context path");
			assert.ok(oContext.getProperty("Category"), "Category loaded");
			done();          // resume normal testing
		});
	});

	QUnit.test("test Context.getPath/getObject", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oContext.getPath("Category"), "/Products(1)/Category", "Expanded entity path");
			assert.equal(oContext.getObject("Category").CategoryID, 1, "Expanded entity object");
			done();          // resume normal testing
		});
	});

	QUnit.test("test getKey", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oModel.getKey(oContext), "Products(1)", "Context key");
			assert.equal(oModel.getKey(oContext.getObject("Category")), "Categories(1)", "Expanded entity key");
			done();          // resume normal testing
		});
	});

	QUnit.test("test createKey", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		oModel.attachMetadataLoaded(function() {
			assert.equal(oModel.createKey("Products", {ProductID: 1}), "Products(1)", "Created product key");
			assert.equal(oModel.createKey("Order_Details", {OrderID: 1, ProductID :2}), "Order_Details(OrderID=1,ProductID=2)", "Expanded entity key");
			assert.equal(oModel.createKey("Customers", {CustomerID: "abc123"}), "Customers('abc123')", "String entity key");
			assert.equal(oModel.createKey("Customers", {CustomerID: "abc:/123"}), "Customers('abc%3A%2F123')", "String entity key with encoding");
			done();
		});
	});

	QUnit.test("PropertyBinding suspend/resume with control value change", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});

		oModel.attachRequestCompleted(this, function() {
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			oBinding.attachChange(function() {
				assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
				assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
				assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "Condiments", "model value");
				assert.equal(oInput.getValue(), "Condiments", "input field returns value");
				oInput.destroy();
				done();
			});
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			oBinding.suspend();
			oInput.setValue("Condis");
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "Condiments", "model value");

			oBinding.resume();
		});
		oModel.read("/Categories");
	});

	QUnit.test("PropertyBinding suspend/resume with model value change", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});

		oModel.attachRequestCompleted(this, function() {
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			oBinding.attachChange(function() {
				assert.equal(oBinding.getValue(), "blubb", "Property Binding returns value");
				assert.equal(oBinding.oValue, "blubb", "Property Binding internal value");
				assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");
				assert.equal(oInput.getValue(), "blubb", "input field returns value");
				oInput.destroy();
				done();
			});
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			oBinding.suspend();
			oModel.setProperty(oBinding.getPath(), "blubb", oBinding.getContext());
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");

			oBinding.resume();
		});
		oModel.read("/Categories");
	});

	QUnit.test("PropertyBinding suspend/resume with control and model value change", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});

		oModel.attachRequestCompleted(this, function() {
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			oBinding.attachChange(function() {
				assert.equal(oBinding.getValue(), "blubb", "Property Binding returns value");
				assert.equal(oBinding.oValue, "blubb", "Property Binding internal value");
				assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");
				assert.equal(oInput.getValue(), "blubb", "input field returns value");
				oInput.destroy();
				done();
			});
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			oBinding.suspend();
			oInput.setValue("Condis");
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "Condiments", "model value");
			oBinding.setValue("test");
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "Condiments", "model value");
			oModel.setProperty(oBinding.getPath(), "blubb", oBinding.getContext());
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");

			oBinding.resume();
		});
		oModel.read("/Categories");
	});

	QUnit.test("PropertyBinding suspend/resume with model and control value change", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});

		oModel.attachRequestCompleted(this, function() {
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			oBinding.attachChange(function() {
				assert.equal(oBinding.getValue(), "blubb", "Property Binding returns value");
				assert.equal(oBinding.oValue, "blubb", "Property Binding internal value");
				assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");
				assert.equal(oInput.getValue(), "blubb", "input field returns value");
				oInput.destroy();
				done();
			});
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			oBinding.suspend();
			oModel.setProperty(oBinding.getPath(), "blubb", oBinding.getContext());
			assert.equal(oInput.getValue(), "Condiments", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");
			oInput.setValue("Condis");
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");
			oBinding.setValue("test");
			assert.equal(oInput.getValue(), "Condis", "input field returns value");
			assert.equal(oBinding.getValue(), "Condiments", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Condiments", "Property Binding internal value");
			assert.equal(oModel.getProperty("/Categories(2)/CategoryName"), "blubb", "model value");

			oBinding.resume();
		});
		oModel.read("/Categories");
	});

	QUnit.test("Declarative property and list binding with suspend",function(assert) {
		var done = assert.async();

		return XMLView.create({definition: sView}).then(function(oView) {
			var oBinding, handler1, handler2,
				oModel = initModel(sURI, {json:false});

			oView.setModel(oModel);
			oBinding = oView.byId('myList').getBinding('items');
			handler1 = function () {
				var oItem = oView.byId('myList').getItems()[0],
					oPropBinding = oItem.getContent()[0].getBinding('value');

				assert.ok(!oBinding.isSuspended(), "suspended flag should be false");
				assert.ok(oPropBinding.isSuspended(), "suspended flag should be true");
				oBinding.detachChange(handler1);
				oView.destroy();
				done(); // resume normal testing
			};
			handler2 = function () {
				assert.ok(!oBinding.isSuspended(), "suspended flag should be false");
				oBinding.detachChange(handler2);
			};
			oBinding.attachChange(this,handler1);
			oBinding.attachRefresh(this,handler2);
				assert.ok(oBinding.isSuspended(), "suspended flag should be true");
				oBinding.resume();
		});
	});

	QUnit.test("propertyChange event", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);

		oModel.attachRequestCompleted(this, function() {
			oModel.attachPropertyChange(this, function(oEvent) {
				var sPath = oEvent.getParameter('path');
				var oContext = oEvent.getParameter('context');
				var oValue = oEvent.getParameter('value');
				var sReason = oEvent.getParameter('reason');
				assert.equal(sPath, "/Categories(2)/CategoryName", "path check!");
				assert.equal(oContext, undefined, "context check!");
				assert.equal(oValue, "blubb", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
				oInput.destroy();
				done();
			});
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			// should not trigger event
			oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
			// should trigger event
			oInput.setValue("blubb");
		});
		oModel.read("/Categories");
	});

	QUnit.test("propertyChange event relative", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{CategoryName}"
		});
		oInput.setModel(oModel);

		oModel.attachRequestCompleted(this, function() {
			oModel.attachPropertyChange(this, function(oEvent) {
				var sPath = oEvent.getParameter('path');
				var oContext = oEvent.getParameter('context');
				var oValue = oEvent.getParameter('value');
				var sReason = oEvent.getParameter('reason');
				assert.equal(sPath, "CategoryName", "path check!");
				assert.equal(oContext.getPath(), "/Categories(2)", "context check!");
				assert.equal(oValue, "blubb", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
				oInput.destroy();
				done();
			});
			oInput.bindObject("/Categories(2)");
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			// should not trigger event
			oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
			// should trigger event
			oInput.setValue("blubb");
		});
		oModel.read("/Categories");
	});

	QUnit.test("propertyChange event reset", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new Input({
			value: "{/Categories(2)/CategoryName}"
		});
		oInput.setModel(oModel);
		var iCount = 0;
		oModel.attachRequestCompleted(this, function() {
			oModel.attachPropertyChange(this, function(oEvent) {
				iCount++;
				var sPath = oEvent.getParameter('path');
				var oContext = oEvent.getParameter('context');
				var oValue = oEvent.getParameter('value');
				var sReason = oEvent.getParameter('reason');
				if (iCount === 1) {
					assert.equal(sPath, "/Categories(2)/CategoryName", "path check!");
					assert.equal(oContext, undefined, "context check!");
					assert.equal(oValue, "blubb", "property value check!");
					assert.equal(sReason, ChangeReason.Binding, "property reason check!");
					oInput.setValue("Condiments");

				} else if (iCount === 2) {
					assert.equal(sPath, "/Categories(2)/CategoryName", "path check!");
					assert.equal(oContext, undefined, "context check!");
					assert.equal(oValue, "Condiments", "property value check!");
					assert.equal(sReason, ChangeReason.Binding, "property reason check!");
				}
			});
			var oBinding = oInput.getBinding("value");
			assert.ok(oBinding !== undefined, "binding check");
			assert.equal(oBinding.getValue(), "Condiments", "property name check!");
			oInput.setValue("blubb");
			oInput.destroy();
			done();
		});
		oModel.read("/Categories");
	});

	QUnit.test("test setProperty on property with referential constraint",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = {
				"Suppliers(0)" : {
					Name : "Supplier One",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : 12345
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Suppliers(1)" : {
					Name : "Supplier Two",
					Address : {
						City: "Chicago",
						Street: "120th",
						Plz : 23456
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					SupplierID: 0,
					CategoryID: 0,
					Supplier : {
						__ref: "Suppliers(0)"
					},
					Category : {
						__deferred: "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)/Category"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};

			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier One", "Supplier Name is returned correctly");
			oModel.setProperty("/Products(0)/SupplierID", 1);
			assert.equal(oModel.getProperty("/Products(0)").Supplier.__ref, "Suppliers(1)", "Nav property is updated after changing SupplierID");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier Two", "Supplier Name is resolved after changing SupplierID");
			assert.equal(oModel.hasPendingChanges(), true, "Has pending changes is true");

			oModel.setProperty("/Products(0)/SupplierID", 0);
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier One", "Supplier Name is returned correctly");
			assert.equal(oModel.hasPendingChanges(), false, "Has pending changes is false, after setting property to old value");

			oModel.setProperty("/Products(0)/SupplierID", null);
			assert.equal(oModel.getProperty("/Products(0)").Supplier.__ref, null, "Supplier is set to null");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), undefined, "Supplier Name is returned correctly");
			assert.equal(oModel.hasPendingChanges(), true, "Has pending changes is true, after setting property to null");

			oModel.setProperty("/Products(0)/CategoryID", 1);
			assert.equal(oModel.getProperty("/Products(0)").Category.__ref, undefined, "Nav property is not updated if deferred");

			done();
		});
	});

	QUnit.test("test setProperty on property with referential constraint, submitChanges",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = {
				"Suppliers(0)" : {
					Name : "Supplier One",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : 12345
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Suppliers(1)" : {
					Name : "Supplier Two",
					Address : {
						City: "Chicago",
						Street: "120th",
						Plz : 23456
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					SupplierID: 0,
					CategoryID: 0,
					Supplier : {
						__ref: "Suppliers(0)"
					},
					Category : {
						__deferred: "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)/Category"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};

			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier One", "Supplier Name is returned correctly");
			oModel.setProperty("/Products(0)/SupplierID", 1);
			assert.equal(oModel.getProperty("/Products(0)").Supplier.__ref, "Suppliers(1)", "Nav property is updated after changing SupplierID");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier Two", "Supplier Name is resolved after changing SupplierID");
			assert.equal(oModel.hasPendingChanges(), true, "Has pending changes is true");

			oModel.submitChanges({
				success: function() {
					assert.equal(oModel.hasPendingChanges(), false, "No more pending changes, after submitting data");
					assert.equal(oModel.oData["Products(0)"].Supplier.__ref, "Suppliers(1)", "Nav property is updated in original entry");
					done();
				}
			});

		});
	});

	QUnit.test("test setProperty on property with referential constraint, resetChanges",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = {
				"Suppliers(0)" : {
					Name : "Supplier One",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : 12345
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Suppliers(1)" : {
					Name : "Supplier Two",
					Address : {
						City: "Chicago",
						Street: "120th",
						Plz : 23456
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					SupplierID: 0,
					CategoryID: 0,
					Supplier : {
						__ref: "Suppliers(0)"
					},
					Category : {
						__deferred: "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)/Category"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};

			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier One", "Supplier Name is returned correctly");
			oModel.setProperty("/Products(0)/SupplierID", 1);
			assert.equal(oModel.getProperty("/Products(0)").Supplier.__ref, "Suppliers(1)", "Nav property is updated after changing SupplierID");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier Two", "Supplier Name is resolved after changing SupplierID");
			assert.equal(oModel.hasPendingChanges(), true, "Has pending changes is true");

			oModel.resetChanges();

			assert.equal(oModel.hasPendingChanges(), false, "No more pending changes, after import of same property");
			assert.equal(oModel.getProperty("/Products(0)").Supplier.__ref, "Suppliers(0)", "Nav property is updated after resetChanges");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Supplier One", "Supplier Name is returned correctly");

			done();
		});
	});

	QUnit.test("test setProperty on complex Types (internal)",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : {
							code: 1,
							number: 22234
						}
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Name", "blabla");
			assert.equal(oModel.getProperty("/Suppliers(0)/Name"), "blabla", "set Property name check");
			oModel.setProperty("/Suppliers(0)/temp", "temp");
			assert.equal(oModel.getProperty("/Suppliers(0)/temp"), "temp", "set Property create nonexistent property");
			oModel.setProperty("/Suppliers(0)/Address/Street", "150th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "150th", "set Property modify complex type property check");
			oModel.setProperty("/Suppliers(0)/Address/notExist", "1337");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/notExist"), "1337", "set Property create new property in complex type");
			oModel.setProperty("/Suppliers(0)/Address/Plz/code", 3);
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/code"), 3, "set Property modify complex type in complex type property check");
			oModel.setProperty("/Suppliers(0)/Address/Plz/notExist2", "337");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/notExist2"), "337", "set Property create new property in complex type");
			oModel.setProperty("/Suppliers(0)/Address/", {
				City: "Berlin",
				Street: "Dorfgasse",
				Plz : {
					code: 4,
					number: 12345
				}
			});
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/City"), "Berlin", "set Property with complete complex type data structure");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "Dorfgasse", "set Property with complete complex type data structure");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/code"), 4, "set Property with complete complex type data structure");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/number"), 12345, "set Property with complete complex type data structure");
			var iCount = 0;
			each(oModel.getProperty("/Suppliers(0)/Address"), function(i, oValue) {
				iCount++;
			});
			assert.equal(iCount, 3, "number of properties in complex type");
			iCount = 0;
			each(oModel.getProperty("/Suppliers(0)/Address/Plz"), function(i, oValue) {
				iCount++;
			});
			assert.equal(iCount, 2, "number of properties in sub complex type");

			oModel.setProperty("/Products(0)/Supplier/Name", "Juergen");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Name"), "Juergen", "set Property on expanded nav property");
			oModel.setProperty("/Products(0)/Supplier/Address/Street", "GatterStreet");
			assert.equal(oModel.getProperty("/Products(0)/Supplier/Address/Street"), "GatterStreet", "set Property on expanded nav property with complex type");

			done();
		});
	});
	QUnit.test("test setProperty/getProperty on complex Types (internal)",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : "88888"
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Address/Street", "150th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "150th", "set Property modify complex type property check");
			var oComplextType = oModel.getProperty("/Suppliers(0)/Address");
			assert.ok(isPlainObject(oComplextType), "get complext as object");
			assert.equal(oComplextType.City, "Boston", "complex obj type property check");
			assert.equal(oComplextType.Street, "150th", "complex obj type property check");
			assert.equal(oComplextType.Plz, "88888", "complex obj type property check");
			done();
		});
	});

	QUnit.test("test setProperty on complex Types (internal): setting same value",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : "88888"
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Address/Street", "140th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "140th", "set Property: complex type not updated");
			assert.ok(!oModel.hasPendingChanges(), "No pending changes");
			done();
		});
	});

	QUnit.test("test setProperty on complex Types 2 (internal): change value, then setting same value",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : "88888"
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Address/Street", "150th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "150th", "set Property: complex type updated");
			assert.ok(oModel.hasPendingChanges(), "Has pending changes");
			oModel.setProperty("/Suppliers(0)/Address/Street", "150th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "150th", "set Property: complex type updated");
			assert.ok(oModel.hasPendingChanges(), "Has pending changes");
			oModel.setProperty("/Suppliers(0)/Address/Street", "140th");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Street"), "140th", "set Property: complex type updated");
			assert.ok(!oModel.hasPendingChanges(), "No pending changes");
			done();
		});
	});

	QUnit.test("test setProperty on complex Types 3 (internal): setting same value",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : {
							part1: "1",
							part2: "2"
						}
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Address/Plz/part1", "1");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/part1"), "1", "set Property: complex type not updated");
			assert.ok(!oModel.hasPendingChanges(), "No pending changes");
			done();
		});
	});

	QUnit.test("test setProperty on complex Types 4 (internal): change value, then setting same value",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {useBatch : true});
		oModel.attachMetadataLoaded(function() {
			// create dummy testdata
			oModel.oData = { "Suppliers(0)" : {
					Name : "xy",
					Address : {
						City: "Boston",
						Street: "140th",
						Plz : {
							part1: "1",
							part2: "2"
						}
					},
					Products : {
						__deferred: "Uri"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Suppliers(0)",
						type : "ODataDemo.Supplier"
					}
				},
				"Products(0)" : {
					Name :"Beef",
					Supplier : {
						__ref: "Suppliers(0)"
					},
					"__metadata":{
						uri : "http://test:8080/services.odata.org/V3/OData/OData.svc/Products(0)",
						type : "ODataDemo.Product"
					}
				}
			};
			oModel.setProperty("/Suppliers(0)/Address/Plz/part1", "2");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/part1"), "2", "set Property: complex type updated");
			assert.ok(oModel.hasPendingChanges(), "Has pending changes");
			oModel.setProperty("/Suppliers(0)/Address/Plz/part1", "2");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/part1"), "2", "set Property: complex type updated");
			assert.ok(oModel.hasPendingChanges(), "Has pending changes");
			oModel.setProperty("/Suppliers(0)/Address/Plz/part1", "1");
			assert.equal(oModel.getProperty("/Suppliers(0)/Address/Plz/part1"), "1", "set Property: complex type updated");
			assert.ok(!oModel.hasPendingChanges(), "No pending changes");
			done();
		});
	});

	QUnit.test("createEntry with complex types which have namespace with . characters", function(assert) {
		const oModel = initModel(sURI, {metadataUrlParams: {test: "complex"}});
		return oModel.metadataLoaded().then(function() {
			const oContext = oModel.createEntry("BusinessPartnerSet");
			assert.ok(oContext, "context should be created");
			assert.ok(oContext.getObject(), "Entity has been created");
			// properties of complex type can be accessed
			assert.strictEqual(oContext.getObject("Address"), undefined);
			assert.strictEqual(oContext.getObject("Address/City"), undefined);
			oModel.setProperty("Address/City", "Walldorf", oContext);
			assert.strictEqual(oContext.getObject("Address/City"), "Walldorf");
			oModel.destroy();
		});
	});

	QUnit.test("metadata check", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories").initialize();
		var handler = function() { // delay the following test
			assert.ok(oBinding.oEntityType, "entity type binding check");
			assert.equal(oBinding.oEntityType.name, "Category", "entity type name check");
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/Categories");
			assert.ok(oEntityType, "get entity type check");
			assert.equal(oEntityType.name, "Category", "entity type name check");
			var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "CategoryName");
			assert.ok(oPropMeta, "property type check");
			assert.equal(oPropMeta.name, "CategoryName", "entity type property check");
			assert.equal(oPropMeta.type, "Edm.String", "entity type property check");

			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get entity type check", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories").initialize();
		var handler = function() { // delay the following test
			var oResult = oModel.oMetadata._getEntityTypeByPath("/Categories");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories(1)");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories(1)/Products");
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products(3)");
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories(1)/CategoryName");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products/ProductName");
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products/Category");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories(1)/Products(1)/Category");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products/Supplier");
			assert.equal(oResult.name, "Supplier", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products/Category/Supplier/Products");
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oResult = oModel.oMetadata._getEntityTypeByPath("/Categories/Products(4)/Category/Supplier('4')/Products/Category(1)");
			assert.equal(oResult.name, "Category", "entity type name check");
			oResult = {};
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get entity type check with context", function(assert) {
		var done = assert.async();

		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("Products", new Context(oModel, "/Categories(7)")).initialize();
		var handler = function() { // delay the following test
			var oResult = oBinding.oEntityType;
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get property metadata", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {json:false});
		var oBinding = oModel.bindList("/Categories").initialize();
		var handler = function() { // delay the following test
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/Categories");
			var oResult = oModel.oMetadata._getPropertyMetadata(oEntityType, "CategoryName");
			assert.equal(oResult.name, "CategoryName", "Property type name check");
			assert.equal(oResult.type, "Edm.String", "Property type name check");

			// check nav property
			oResult = oModel.oMetadata._getPropertyMetadata(oEntityType, "/Products/ProductName/");
			assert.equal(oResult.name, "ProductName", "Nav Property type name check");
			assert.equal(oResult.type, "Edm.String", "Nav Property type name check");

			oResult = oModel.oMetadata._getPropertyMetadata(oEntityType, "Products/ProductName");
			assert.equal(oResult.name, "ProductName", "Nav Property type name check");
			assert.equal(oResult.type, "Edm.String", "Nav Property type name check");

			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachRefresh(function() {oBinding.getContexts();});
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("Custom Header test", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {headers: {"myCustomHeader1" : "value1", "myCustomHeader2" : "4.555"}});

		oModel.metadataLoaded().then(function() {
			assert.equal(spy.args[0][0].headers['myCustomHeader1'], "value1", "spy check custom header");
			assert.equal(spy.args[0][0].headers['myCustomHeader2'], "4.555", "spy check custom header");
			oModel.setHeaders({"myCustomHeader1" : "value1", "myCustomHeader2" : "4.555"});
			oModel.read("/Categories", {
				success: function() {
					assert.equal(spy.args[1][0].headers['myCustomHeader1'], "value1", "spy check custom header");
					assert.equal(spy.args[1][0].headers['myCustomHeader2'], "4.555", "spy check custom header");
				}
			});

			// override headers
			oModel.setHeaders({"myCustomHeader1" : "666", "TesT": "new Header", "MyCustomHeader2" : "blubb"});
			oModel.read("/Categories(1)", {
				success: function() {
					assert.equal(spy.args[2][0].headers['myCustomHeader1'], "666", "spy check custom header");
					assert.equal(spy.args[2][0].headers['MyCustomHeader2'], "blubb", "spy check custom header");
					assert.equal(spy.args[2][0].headers['TesT'], "new Header", "spy check custom header");
					assert.equal(spy.callCount, 3, "spy read count");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
			var aHeaders = oModel.getHeaders();
			assert.equal(aHeaders['myCustomHeader1'], "666", "model check custom header");
			assert.equal(aHeaders['MyCustomHeader2'], "blubb", "model check custom header");
			assert.equal(aHeaders['TesT'], "new Header", "model check custom header");
		});
	});

	QUnit.test("header content-type test for GET JSON", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI);

		oModel.metadataLoaded().then(function() {

			oModel.read("/Categories", {
				success: function() {
					assert.equal(spy.args[1][0].headers['Accept'], "application/json", "spy check header");
					assert.equal(spy.args[1][0].headers['Content-Type'], undefined, "there should be no content type header for GET requests");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
		});
	});

	QUnit.test("header content-type test for POST JSON", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {tokenHandling: false});

		oModel.metadataLoaded().then(function() {

			oModel.create("/Categories", {}, {
				success: function() {
					assert.equal(spy.args[1][0].headers['Accept'], "application/json", "spy check header");
					assert.equal(spy.args[1][0].headers['Content-Type'], "application/json", "there should be a content type header for POST requests");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
		});
	});


	QUnit.test("header content-type test for GET xml", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {json :false});

		oModel.metadataLoaded().then(function() {

			oModel.read("/Categories", {
				success: function() {
					assert.equal(spy.args[1][0].headers['Accept'], "application/atom+xml,application/atomsvc+xml,application/xml", "spy check header");
					assert.equal(spy.args[1][0].headers['Content-Type'], undefined, "there should be no content type header for GET requests");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
		});
	});

	QUnit.test("header content-type test for POST xml", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {json :false, tokenHandling: false});

		oModel.metadataLoaded().then(function() {

			oModel.create("/Categories", {}, {
				success: function() {
					assert.equal(spy.args[1][0].headers['Accept'], "application/atom+xml,application/atomsvc+xml,application/xml", "spy check header");
					assert.equal(spy.args[1][0].headers['Content-Type'], "application/atom+xml", "there should be a content type header for POST requests");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
		});
	});

	QUnit.test("custom header content-type for media entities", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {json: true, tokenHandling: false});

		oModel.metadataLoaded().then(function() {
			oModel.create("/Categories", "some text", {
				headers: {
					"Content-Type": "text/plain"
				},
				success: function() {
					assert.equal(spy.args[1][0].headers['Accept'], "application/json", "spy check header");
					assert.equal(spy.args[1][0].headers['Content-Type'], "text/plain", "there should be a content type header for POST requests");
					OData.defaultHttpClient.request.restore();
					done();
				}
			});
		});
	});

	QUnit.test("async metadata request check", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		}, true);

		var handler = function() {
			assert.ok(true, "Metadata callback handler called");
			oModel.detachMetadataLoaded(handler);
			assert.ok(oModel.getServiceMetadata(), "get metadata check");
			done();
		};
		oModel.attachMetadataLoaded(handler);
	});


	QUnit.test("async metadata request check with bindings", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			loadMetadataAsync: true,
			useBatch: false
		}, true);

		var handler = function() {
			assert.ok(true, "Metadata callback handler called");
			oModel.detachMetadataLoaded(handler); // handler is undefined at this point. This always causes the assertion inside to fail.
			assert.ok(oModel.getServiceMetadata(), "get metadata check");
			var oBinding = oModel.bindList("/Categories");
			var handler2 = function() { // delay the following test
				assert.ok(oBinding.oEntityType, "entity type binding check");
				assert.equal(oBinding.oEntityType.name, "Category", "entity type name check");
				var oEntityType = oModel.oMetadata._getEntityTypeByPath("/Categories");
				assert.ok(oEntityType, "get entity type check");
				assert.equal(oEntityType.name, "Category", "entity type name check");
				var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "CategoryName");
				assert.ok(oPropMeta, "property type check");
				assert.equal(oPropMeta.name, "CategoryName", "entity type property check");
				assert.equal(oPropMeta.type, "Edm.String", "entity type property check");

				oBinding.detachChange(handler2);
				done();          // resume normal testing
			};
			oBinding.attachRefresh(handler2);
			oBinding.initialize();
		};
		oModel.attachMetadataLoaded(handler);

	});

	QUnit.test("async metadata request check with bindings die zwote", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			loadMetadataAsync: true,
			useBatch: false
		}, true);

		// when metadata loaded a refresh is called which will trigger the data loading
		// if not yet happened
		var oBinding = oModel.bindList("/Categories");
		var handler = function() { // delay the following test
			assert.ok(oBinding.oEntityType, "entity type binding check");
			assert.equal(oBinding.oEntityType.name, "Category", "entity type name check");
			var oEntityType = oModel.oMetadata._getEntityTypeByPath("/Categories");
			assert.ok(oEntityType, "get entity type check");
			assert.equal(oEntityType.name, "Category", "entity type name check");
			var oPropMeta = oModel.oMetadata._getPropertyMetadata(oEntityType, "CategoryName");
			assert.ok(oPropMeta, "property type check");
			assert.equal(oPropMeta.name, "CategoryName", "entity type property check");
			assert.equal(oPropMeta.type, "Edm.String", "entity type property check");

			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(handler);
	});

	QUnit.test("async test createEntity", function(assert) {
		var done = assert.async();
		assert.expect(18);
		var oSpy;
		var oModel = initModel(sURI, {
			json: true,
			loadMetadataAsync: true,
			useBatch: false,
			refreshAfterChange: false
		}, true);

		var oBinding = oModel.bindList("/Categories");
		oModel.setDeferredGroups(["myId"]);
		var handler = function() { // delay the following test
			// detach so that checkUpdate called from v2.Context#delete does not again call this handler
			oBinding.detachChange(handler);
			oBinding.detachRefresh(handler);
			var oProperties = {CategoryID:99,CategoryName:"Food",Description:"Food Desc", undefProp:undefined};
			var oContext = oModel.createEntry("Categories",{properties: oProperties, batchGroupId : "myId"});
			assert.ok(oContext, "context check");
			var oEntry = oModel.getProperty("", oContext);
			assert.ok(oEntry, "entry check");
			assert.ok(oEntry.hasOwnProperty("undefProp"), "undefined property check");
			assert.ok(oEntry.hasOwnProperty("CategoryID"), "CategoryID property check");
			assert.notDeepEqual(oEntry, oProperties, "object should be cloned and therefore not deep equal");

			assert.equal(oEntry.CategoryName, "Food", "category name check");
			assert.equal(oEntry.CategoryID, 99, "category ID check");
			assert.equal(oEntry.Description, "Food Desc", "category ID check");
			assert.ok(oModel.mContexts[oContext.getPath()], "context check");
			assert.equal(oModel.oData[oContext.getPath().substr(1)].CategoryName, "Food", "data check");

			oContext.delete();
			assert.equal(oModel.oData[oContext.getPath().substr(1)], undefined, "data check");
			assert.equal(oModel.mContexts[oContext.getPath()], undefined, "context check");

			// check default values
			oContext = oModel.createEntry("Categories");
			assert.ok(oContext, "context check");
			oEntry = oModel.getProperty("", oContext);
			assert.ok(oEntry, "entry check");

			assert.equal(oEntry.CategoryName, undefined, "category name check");
			assert.equal(oEntry.CategoryID, undefined, "category ID check");
			assert.equal(oEntry.Description, undefined, "category ID check");
			oSpy = sinon.spy(oModel, "_submitBatchRequest");
			oModel.submitChanges();
			setTimeout(function() {
				assert.equal(oSpy.callCount, 0, "No request sent");
				oSpy.restore();
				oModel.destroy();
				done();
			}, 0);
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(handler);
	});

	var aRequestEvents = [
			"RequestSent", "RequestFailed", "RequestCompleted",
			"BatchRequestSent", "BatchRequestFailed", "BatchRequestCompleted"
		];
	function attachRequestEvents(oModel, oInfo, assert, iBatchRequestSentCount, iBatchRequestCompletedCount, iBatchRequestFailedCount) {
		var fnHandler = function(oEvent) {
			var sId = oEvent.getId();
			if (!oInfo[sId]) {
				oInfo[sId] = 0;
			}
			oInfo[sId]++;
			// Check for correct event parameters
			var mParameters = oEvent.getParameters();
			switch (sId) {
				case "batchRequestSent":
					assert.ok(mParameters.requests, sId + " contains requests");
					if (iBatchRequestSentCount !== undefined) {
						assert.equal(mParameters.requests.length, iBatchRequestSentCount, "Event should contain " + iBatchRequestSentCount + " requests");
					}
					// fall through
				case "requestSent":
					assert.ok(mParameters.url, sId + " contains url");
					assert.ok(mParameters.method, sId + " contains method");
					assert.ok(mParameters.headers, sId + " contains headers");
					break;
				case "batchRequestFailed":
					assert.ok(mParameters.requests, sId + " contains requests");
					if (iBatchRequestFailedCount !== undefined) {
						assert.equal(mParameters.requests.length, iBatchRequestFailedCount, "Event should contain " + iBatchRequestFailedCount + " requests");
					}
					// fall through
				case "requestFailed":
					assert.ok(mParameters.url, sId + " contains url");
					assert.ok(mParameters.method, sId + " contains method");
					assert.ok(mParameters.headers, sId + " contains headers");
					assert.ok(mParameters.response, sId + " contains response");
					assert.ok(mParameters.response.statusCode !== undefined, sId + " contains response.statusCode");
					assert.ok(mParameters.response.headers, sId + " contains response.headers");
					assert.ok(mParameters.response.responseText !== undefined, sId + " contains response.responseText");
					break;
				case "batchRequestCompleted":
					assert.ok(mParameters.requests, sId + " contains requests");
					if (iBatchRequestCompletedCount !== undefined) {
						assert.equal(mParameters.requests.length, iBatchRequestCompletedCount, "Event should contain " + iBatchRequestCompletedCount + " requests");
					}
					// fall through
				case "requestCompleted":
					assert.ok(mParameters.url, sId + " contains url");
					assert.ok(mParameters.method, sId + " contains method");
					assert.ok(mParameters.headers, sId + " contains headers");
					assert.ok(mParameters.response, sId + " contains response");
					assert.ok(mParameters.response.statusCode !== undefined, sId + " contains response.statusCode");
					assert.ok(mParameters.response.headers, sId + " contains response.headers");
					assert.ok(mParameters.response.responseText !== undefined, sId + " contains response.responseText");
					assert.ok(mParameters.success !== undefined, sId + " contains success");
					break;
			}
		};
		each(aRequestEvents, function(i, sEvent) {
			oInfo[sEvent.charAt(0).toLowerCase() + sEvent.substr(1)] = 0;
			oModel["attach" + sEvent](fnHandler);
		});
		return fnHandler;
	}

	function detachRequestEvents(oModel, fnHandler) {
		each(aRequestEvents, function(i, sEvent) {
			oModel["detach" + sEvent](fnHandler);
		});
	}

	QUnit.test("async test sequentializeRequests - single", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: false,
			sequentializeRequests: true
		});
		var iCount = 0,
			iRequestCount = 0,
			iParallelCount = 0;
		window.fakeRequested = function() {
			iRequestCount++;
			iParallelCount++;
			if (iParallelCount > 1) {
				assert.ok(false, "Must not send requests in parallel");
			}
		};
		window.fakeResponded = function() {
			iParallelCount--;
		};
		oModel.read("/Categories(1)");
		oModel.read("/Categories(3)");
		oModel.read("/Categories(9999)");
		oModel.attachRequestCompleted(function() {
			iCount++;
			if (iCount == 3) {
				setTimeout(function() {
					assert.equal(iRequestCount, 3, "Three HTTP requests have been sent");
					assert.ok("Three requests have been completed successfully");
					delete window.fakeRequested;
					delete window.fakeResponsed;
					oModel.destroy();
					done();
				}, 0);
			}
		});
	});

	QUnit.test("async test sequentializeRequests - batch", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true,
			tokenHandling: false,
			sequentializeRequests: true
		});
		var iCount = 0,
			iRequestCount = 0,
			iParallelCount = 0;
		window.fakeRequested = function() {
			iRequestCount++;
			iParallelCount++;
			if (iParallelCount > 1) {
				assert.ok(false, "Must not send requests in parallel");
			}
		};
		window.fakeResponded = function() {
			iParallelCount--;
		};
		oModel.setDeferredGroups(["1", "2"]);
		oModel.read("/Categories(1)", {groupId: "1"});
		oModel.read("/Categories(9999)", {groupId: "1"});
		oModel.read("/Categories(3)", {groupId: "2"});
		oModel.read("/Products(2)", {groupId: "2"});
		oModel.submitChanges({groupId: "1"});
		oModel.submitChanges({groupId: "2"});

		oModel.attachRequestCompleted(function() {
			iCount++;
			if (iCount == 4) {
				setTimeout(function() {
					assert.equal(iRequestCount, 2, "Two HTTP requests have been sent");
					assert.ok("Four requests have been completed successfully");
					delete window.fakeRequested;
					delete window.fakeResponsed;
					oModel.destroy();
					done();
				}, 0);
			}
		});
	});

	QUnit.test("async test request events - single", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});
		var oInfo = {
			success: 0,
			error: 0
		},
		iCount = 0;
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
		oModel.read("/Categories(9999)", {success: fnSuccess, error: fnError});
		oModel.attachRequestCompleted(function() {
			iCount++;
			if (iCount == 3) {
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 3, "Three requests sent");
					assert.equal(oInfo.requestFailed, 1, "One request failed");
					assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
					assert.equal(oInfo.success, 2, "Two success callbacks called");
					assert.equal(oInfo.error, 1, "One error callback called");
					assert.equal(oInfo.batchRequestSent, 0, "No batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 0, "No batch requests completed");
					done();
				}, 0);
			}
		});
	});

	QUnit.test("async test request events - batch", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
			success: 0,
			error: 0
		};
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
		oModel.read("/Categories(9999)", {success: fnSuccess, error: fnError});
		oModel.attachBatchRequestCompleted(function() {
			setTimeout(function() {
				assert.equal(oInfo.requestSent, 3, "Three requests sent");
				assert.equal(oInfo.requestFailed, 1, "One request failed");
				assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
				assert.equal(oInfo.success, 2, "Two success callbacks called");
				assert.equal(oInfo.error, 1, "One error callback called");
				assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
				assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
				assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
				done();
			}, 0);
		});

	});

	QUnit.test("async test request events - batch with one changeset", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
			success: 0,
			error: 0
		};
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.remove("/Categories(3)", {success: fnSuccess, error: fnError});
		oModel.remove("/Products(2)", {success: fnSuccess, error: fnError});
		oModel.attachBatchRequestCompleted(function() {
			setTimeout(function() {
				assert.equal(oInfo.requestSent, 3, "Three requests sent");
				assert.equal(oInfo.requestFailed, 0, "No request failed");
				assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
				assert.equal(oInfo.success, 3, "Three success callbacks called");
				assert.equal(oInfo.error, 0, "None error callback called");
				assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
				assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
				assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
				done();
			}, 0);
		});
	});

	QUnit.test("async test request events - batch with two changeset", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
			success: 0,
			error: 0
		};
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.remove("/Categories(3)", {changeSetId: 1, success: fnSuccess, error: fnError});
		oModel.remove("/Categories(4)", {changeSetId: 1, success: fnSuccess, error: fnError});
		oModel.remove("/Products(2)", {changeSetId: 2, success: fnSuccess, error: fnError});
		oModel.remove("/Products(3)", {changeSetId: 2, success: fnSuccess, error: fnError});
		oModel.attachBatchRequestCompleted(function() {
			setTimeout(function() {
				assert.equal(oInfo.requestSent, 5, "Five requests sent");
				assert.equal(oInfo.requestFailed, 0, "No request failed");
				assert.equal(oInfo.requestCompleted, 5, "Five requests completed");
				assert.equal(oInfo.success, 5, "Five success callbacks called");
				assert.equal(oInfo.error, 0, "None error callback called");
				assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
				assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
				assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
				done();
			}, 0);
		});
	});

	QUnit.test("async test request events - batch with two changeset, one failing", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
			success: 0,
			error: 0
		};
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.remove("/Categories(3)", {changeSetId: 1, success: fnSuccess, error: fnError});
		oModel.remove("/Categories(4)", {changeSetId: 1, success: fnSuccess, error: fnError});
		oModel.remove("/Products(2)", {changeSetId: 2, success: fnSuccess, error: fnError});
		oModel.remove("/Fail500(2)", {changeSetId: 2, success: fnSuccess, error: fnError});
		oModel.attachBatchRequestCompleted(function() {
			setTimeout(function() {
				assert.equal(oInfo.requestSent, 5, "Five requests sent");
				assert.equal(oInfo.requestFailed, 2, "Two request failed");
				assert.equal(oInfo.requestCompleted, 5, "Five requests completed");
				assert.equal(oInfo.success, 3, "Three success callbacks called");
				assert.equal(oInfo.error, 2, "Two error callbacks called");
				assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
				assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
				assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
				done();
			}, 0);
		});
	});

	QUnit.test("async test request events - batch fail", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
			success: 0,
			error: 0
		};
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
		oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
		oModel.read("/Batch500(9999)", {success: fnSuccess, error: fnError});
		oModel.attachBatchRequestCompleted(function() {
			setTimeout(function() {
				assert.equal(oInfo.requestSent, 3, "Three requests sent");
				assert.equal(oInfo.requestFailed, 3, "Three request failed");
				assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
				assert.equal(oInfo.success, 0, "None success callbacks called");
				assert.equal(oInfo.error, 3, "Three error callbacks called");
				assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
				assert.equal(oInfo.batchRequestFailed, 1, "One batch requests failed");
				assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
				done();
			}, 0);
		});
	});

	QUnit.test("async test request events - aborted requests single", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});
		var oInfo = {
			success: 0,
			error: 0
		}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
			oModel.read("/Categories(4)", {success: fnSuccess, error: fnError});
			oRequest1.abort();
			oRequest2.abort();
			oModel.attachRequestCompleted(function() {
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 0, "No batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 0, "No batch requests completed");
					done();
				}, 0);
			});
		});
	});

		QUnit.test("async test request events - aborted same requests single", function(assert) {
			var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest1.abort();
			oRequest2.abort();
			oModel.attachRequestCompleted(function() {
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 0, "No batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 0, "No batch requests completed");
					done();
				}, 0);
			});
		});
	});


	QUnit.test("async test request events - aborted requests single after sent", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2,
			iCount = 0;
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
			oModel.read("/Categories(4)", {success: fnSuccess, error: fnError});
			oModel.attachRequestSent(function() {
				iCount++;
				if (iCount == 3) {
					oRequest1.abort();
					oRequest2.abort();
				}
			});
			oModel.attachRequestCompleted(function() {
				iCount++;
				if (iCount == 6) {
					setTimeout(function() {
						assert.equal(oInfo.requestSent, 3, "Three requests sent");
						assert.equal(oInfo.requestFailed, 0, "No request failed");
						assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
						assert.equal(oInfo.success, 1, "One success callbacks called");
						assert.equal(oInfo.error, 2, "Two error callbacks called");
						assert.equal(oInfo.batchRequestSent, 0, "No batch requests sent");
						assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
						assert.equal(oInfo.batchRequestCompleted, 0, "No batch requests completed");
						done();
					}, 0);
				}
			});
		});

	});

	QUnit.test("async test request events - aborted same requests single after sent", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2,
			iCount = 0;
		attachRequestEvents(oModel, oInfo, assert);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oModel.attachRequestSent(function() {
				iCount++;
				if (iCount == 3) {
					oRequest1.abort();
					oRequest2.abort();
				}
			});
			oModel.attachRequestCompleted(function() {
				iCount++;
				if (iCount == 6) {
					setTimeout(function() {
						assert.equal(oInfo.requestSent, 3, "Three requests sent");
						assert.equal(oInfo.requestFailed, 0, "No request failed");
						assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
						assert.equal(oInfo.success, 1, "One success callbacks called");
						assert.equal(oInfo.error, 2, "Two error callbacks called");
						assert.equal(oInfo.batchRequestSent, 0, "No batch requests sent");
						assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
						assert.equal(oInfo.batchRequestCompleted, 0, "No batch requests completed");
						done();
					}, 0);
				}
			});
		});

	});


	QUnit.test("async test request events - aborted requests batch", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 1, 1, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
						oModel.read("/Categories(4)", {success: fnSuccess, error: fnError});
			oRequest1.abort();
			oRequest2.abort();
			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 1, "1 requests");
				assert.equal(oRequests[0].url, "Categories(4)", "request url check");
				assert.ok(oRequests[0].success, "request success check");

				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
		});
	});

		QUnit.test("async test request events - aborted same requests batch", function(assert) {
			var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 1, 1, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
						oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest1.abort();
			oRequest2.abort();
			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 1, "1 requests");
				assert.equal(oRequests[0].url, "Categories(1)", "request url check");
				assert.ok(oEvent.mParameters.success, "request success check");
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
		});
	});

	QUnit.test("async test request events - aborted requests batch after sent", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 3, 3, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError});
						oModel.read("/Categories(4)", {success: fnSuccess, error: fnError});
			oModel.attachBatchRequestSent(function() {
				oRequest1.abort();
				oRequest2.abort();
			});
			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 3, "3 requests");
				assert.equal(oRequests[0].url, "Categories(1)", "request url check");
				assert.ok(!oRequests[0].success, "request success check");
				assert.equal(oRequests[0].response.statusCode, "0", "request aborted");
				assert.equal(oRequests[0].response.statusText, "abort", "request aborted");

				setTimeout(function() {
					assert.equal(oInfo.requestSent, 3, "Three requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
		});

	});

	QUnit.test("async test request events - aborted same requests batch after sent", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 1, 1, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oRequest2 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
						oModel.read("/Categories(1)", {success: fnSuccess, error: fnError});
			oModel.attachBatchRequestSent(function() {
				oRequest1.abort();
				oRequest2.abort();
			});
			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 1, "1 requests");
				assert.equal(oRequests[0].url, "Categories(1)", "request url check");
				assert.ok(!oRequests[0].success, "request success check");
				assert.equal(oRequests[0].response.statusCode, "0", "request aborted");
				assert.equal(oRequests[0].response.statusText, "abort", "request aborted");

				setTimeout(function() {
					assert.equal(oInfo.requestSent, 3, "Three requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
		});

	});

	QUnit.test("async test request events - aborted deferred requests batch", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 1, 1, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oModel.setDeferredGroups(["myId"]);
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});
						oModel.read("/Categories(4)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});
			oRequest1.abort();
			oRequest2.abort();

			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 1, "1 requests");
				assert.equal(oRequests[0].url, "Categories(4)", "request url check");
				assert.ok(oRequests[0].success, "request success check");

				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
			oModel.submitChanges();
		});

	});

	QUnit.test("async test request events - aborted deferred requests batch after sent", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {
				success: 0,
				error: 0
			}, oRequest1, oRequest2;
		attachRequestEvents(oModel, oInfo, assert, 3, 3, 0);
		function fnSuccess() { oInfo.success++; }
		function fnError() { oInfo.error++; }
		oModel.attachMetadataLoaded(function() {
			oModel.setDeferredGroups(["myId"]);
			oRequest1 = oModel.read("/Categories(1)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});
			oRequest2 = oModel.read("/Categories(3)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});
			oModel.read("/Categories(4)", {success: fnSuccess, error: fnError, batchGroupId : "myId"});

			oModel.attachBatchRequestSent(function() {
				oRequest1.abort();
				oRequest2.abort();
			});
			oModel.attachBatchRequestCompleted(function(oEvent) {
				var oRequests = oEvent.getParameter('requests');
				assert.equal(oRequests.length, 3, "3 requests");
				assert.equal(oRequests[0].url, "Categories(1)", "request url check");
				assert.ok(!oRequests[0].success, "request success check");
				assert.equal(oRequests[0].response.statusCode, "0", "request aborted");
				assert.equal(oRequests[0].response.statusText, "abort", "request aborted");
				assert.equal(oRequests[1].url, "Categories(3)", "request url check");
				assert.ok(!oRequests[1].success, "request success check");
				assert.equal(oRequests[1].response.statusCode, "0", "request aborted");
				assert.equal(oRequests[1].response.statusText, "abort", "request aborted");
				assert.equal(oRequests[2].url, "Categories(4)", "request url check");
				assert.ok(oRequests[2].success, "request success check");

				setTimeout(function() {
					assert.equal(oInfo.requestSent, 3, "Three requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 3, "Three requests completed");
					assert.equal(oInfo.success, 1, "One success callbacks called");
					assert.equal(oInfo.error, 2, "Two error callbacks called");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			});
			oModel.submitChanges();
		});

	});

	QUnit.test("async test request events - auto refresh element binding", function(assert) {
		var done = assert.async();
		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {}, oBinding, oCount = 0, fnHandler;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindContext("/Categories(1)");
		oBinding.attachChange(function() {});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.update("/Categories(1)", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.test("async test request events - don't auto refresh element binding when deleting", function(assert) {
		var done = assert.async();
		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {}, oBinding, oCount = 0, fnHandler;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindContext("/Categories(1)");
		oBinding.attachChange(function() {});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.remove("/Categories(1)", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.test("async test request events - auto refresh list binding", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {}, oBinding, fnHandler, oCount = 0;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindList("/Invoices", null, null, null, {countMode: "None"});
		oBinding.attachChange(function() {});
		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.update("/Invoices(CustomerName='Alfreds%20Futterkiste',Discount=0f,OrderID=10702,ProductID=3,ProductName='Aniseed%20Syrup',Quantity=6,Salesperson='Margaret%20Peacock',ShipperName='Speedy%20Express',UnitPrice=10.0000M)", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.test("async test request events - auto refresh list binding for nav property create", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: false,
			useBatch: true
		});
		var oInfo = {}, oBinding, fnHandler, oCount = 0;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None"});
		oBinding.attachChange(function() {});
		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.create("/Products(1)/Category", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.test("async test request events - auto refresh list binding for nav property update", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: false,
			useBatch: true
		});
		var oInfo = {}, oBinding, fnHandler, oCount = 0;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None"});
		oBinding.attachChange(function() {});
		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.initialize();
		oModel.read("/Products(3)", {urlParameters: {$expand: "Category"}});
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.update("/Products(3)/Category", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.test("async test request events - auto refresh list binding also when deleting", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oInfo = {}, oBinding, fnHandler, oCount = 0;
		fnHandler = attachRequestEvents(oModel, oInfo, assert);
		oBinding = oModel.bindList("/Invoices", null, null, null, {countMode: "None"});
		oBinding.attachChange(function() {});
		oBinding.attachRefresh(function() {
			this.getContexts();
		});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function() {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 1, "One requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 1, "One requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					detachRequestEvents(oModel, fnHandler);
					oInfo = {};
					fnHandler = attachRequestEvents(oModel, oInfo, assert);
					oModel.remove("/Invoices(CustomerName='Alfreds%20Futterkiste',Discount=0f,OrderID=10702,ProductID=3,ProductName='Aniseed%20Syrup',Quantity=6,Salesperson='Margaret%20Peacock',ShipperName='Speedy%20Express',UnitPrice=10.0000M)", {});
				}, 0);
			} else if (oCount == 2) { // Data updated and refreshed
				setTimeout(function() {
					assert.equal(oInfo.requestSent, 2, "Two requests sent");
					assert.equal(oInfo.requestFailed, 0, "No request failed");
					assert.equal(oInfo.requestCompleted, 2, "Two requests completed");
					assert.equal(oInfo.batchRequestSent, 1, "One batch requests sent");
					assert.equal(oInfo.batchRequestFailed, 0, "No batch requests failed");
					assert.equal(oInfo.batchRequestCompleted, 1, "One batch requests completed");
					done();
				}, 0);
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});
	QUnit.test("Event order (single request): bindElement - batch fails", function(assert) {
		var done = assert.async();
		assert.expect(3);
		cleanSharedData();
		var oModel = initModel(sURI);
		oModel.setUseBatch(true);
		oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			oLabel.unbindElement();
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			done(); // resume normal testing
		};
		oLabel.bindElement( {path:"/Categories(1)", parameters: {custom: {Batch500:"fail"}}, events:{change:fnChange.bind(null,assert), dataRequested:fnDataRequested.bind(null,assert), dataReceived: handler}});
	});

	QUnit.test("Event order (batch request): bindElement - batch fails --> refresh", function(assert) {
		var done = assert.async();
		assert.expect(5);
		cleanSharedData();
		var oModel = initModel(sURI);
		oModel.setUseBatch(true);
		oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			oLabel.getElementBinding().detachDataReceived(handler);
			oLabel.getElementBinding().attachDataReceived(function() {
				assert.ok(true, "DataReceived fired");
				oLabel.unbindElement();
				bChanged = false;
				bDataRequested = false;
				bDataReceived = false;
				done(); // resume normal testing
			});
			oLabel.getElementBinding().refresh();
		};
		oLabel.bindElement( {path:"/Categories(1)", parameters: {custom: {Batch500:"fail"}}, events:{change:fnChange.bind(null,assert), dataRequested:fnDataRequested.bind(null,assert), dataReceived: handler}});
	});

	QUnit.test("Event order: bindElement", function(assert) {
		var done = assert.async();
		assert.expect(4);
		cleanSharedData();
		var oModel = initModel(sURI);
		oLabel = new Label("myLabel2");
		oLabel.setModel(oModel);
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null,assert), dataRequested:fnDataRequested.bind(null,assert), dataReceived: fnDataReceived.bind(null,assert)}});
		var handler = function(oEvent) {
			assert.ok(oLabel.getElementBinding(), "ContextBinding created");
			oLabel.unbindElement();
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			done(); // resume normal testing
		};
		oLabel.getElementBinding().attachDataReceived(handler);
	});

	QUnit.test("Event order: bindElement (setModel after binding)", function(assert) {
		var done = assert.async();
		assert.expect(4);
		cleanSharedData();
		var oModel = initModel(sURI);
		oLabel = new Label("myLabel3");
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null,assert), dataRequested:fnDataRequested.bind(null,assert), dataReceived:fnDataReceived.bind(null,assert)}});
		var handler = function(oEvent) {
			assert.ok(oLabel.getElementBinding(), "ContextBinding created");
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			done(); // resume normal testing
		};
		oLabel.setModel(oModel);
		oLabel.getElementBinding().attachDataReceived(handler);
	});

	QUnit.test("Event order: bindElement (already bound)", function(assert) {
		var done = assert.async();
		assert.expect(6);
		cleanSharedData();
		var oModel1 = initModel(sURI);
		oLabel = new Label("myLabel4");
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null,assert), dataRequested:fnDataRequested.bind(null,assert), dataReceived:fnDataReceived.bind(null,assert)}});
		var handler = function(oEvent) {
			assert.ok(oLabel.getElementBinding(), "ContextBinding created");
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			var fnChange2 = function(oEvent) {
				bChanged = true;
				assert.ok(!bDataRequested && !bDataReceived,"change fired");
				assert.ok(oLabel.getElementBinding(), "ContextBinding created");
				oLabel.unbindElement();
				bChanged = false;
				bDataRequested = false;
				bDataReceived = false;
				done(); // resume normal testing
			};
			oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange2, dataRequested:fnDataRequested.bind(null,assert), dataReceived:fnDataReceived.bind(null,assert)}});
		};
		oLabel.setModel(oModel1);
		oLabel.getElementBinding().attachDataReceived(handler);
	});

	QUnit.test("ContextBinding: Unresolved bindings must fire change with null context", function(assert) {
		var done = assert.async();
		assert.expect(2);
		cleanSharedData();
		var oModel = initModel(sURI);
		var handler = function(oEvent) {
			assert.ok(true, "Change event fired for unresolved binding");
			assert.equal(oBinding.getBoundContext(), null, "Bound context is null");
			done(); // resume normal testing
		};
		var oBinding = oModel.bindContext("Category");
		oBinding.attachChange(handler);
		oBinding.initialize();
	});

	QUnit.test("read with zero Response", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI);
		var fnSuccess = function(oData) {
			assert.ok(true, "zero data loaded");
			assert.ok(oData === 0, "zero data loaded");
			done();
		};
		oModel.read("/ZeroTest(1)", { success: fnSuccess});
	});

	QUnit.test("test ODataModel destroy cancel async metadata", function(assert) {
		cleanSharedData();
		// spy on odata request function
		var spy = this.spy(OData, "request");
		var oModel = initModel(sURI, {json: true, loadMetadataAsync: true, useBatch: false }, true);
		oModel.attachMetadataLoaded(this, function(oEvent) {
			assert.ok(false, "Metadata should not be loaded");
		});
		oModel.destroy();
		assert.ok(oModel.bDestroyed, "Model should be destroyed");

		assert.equal(spy.callCount, 1, "number of requests");
		assert.ok(spy.getCall(0).returnValue.bSuppressErrorHandlerCall, "should be true");
		OData.request.restore();

	});

	QUnit.test("test ODataModel destroy", function(assert) {
		cleanSharedData();
		// spy on odata request function
		var oModel = initModel(sURI, {json: true, loadMetadataAsync: true, useBatch: false }, true);

		/* var oMetaModel = */ oModel.getMetaModel();
		assert.ok(oModel.oMetaModel, "Metamodel instance created");
		assert.ok(oModel.oAnnotations, "ODataAnnotations instance created");
		assert.ok(oModel.oMetadata, "ODataMetadata instance created");
		oModel.destroy();
		assert.ok(oModel.bDestroyed, "Model should be destroyed");
		assert.ok(!oModel.oMetaModel, "Metamodel instance destroyed");
		assert.ok(!oModel.oAnnotations, "ODataAnnotations instance destroyed");
		assert.ok(!oModel.oMetadata, "ODataMetadata instance destroyed");
	});

	QUnit.test("test metadata url parameters: no parameters", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI);
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata","no metadata url parameters");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: service url parameters", function(assert) {
		var done = assert.async();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI + '?test=x');
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?test=x","parameters of service url attached");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: metadataUrlParameters", function(assert) {
		var done = assert.async();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI, {metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-language=en&test2=xx","metadataUrlParams attached");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: serviceUrl + metadataUrlParameters", function(assert) {
		var done = assert.async();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI + '?test=x', {metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?test=x&sap-language=en&test2=xx","parameters of service url and metadataUrlParams attached");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: no parameters", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI, {serviceUrlParams: {"hubel":"dubel"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata","no metadata url parameters");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: service url parameters", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI + '?test=x', {serviceUrlParams: {"hubel":"dubel"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?test=x","parameters of service url attached");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: metadataUrlParameters", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI, {serviceUrlParams: {"hubel":"dubel"}, metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-language=en&test2=xx","metadataUrlParams attached");
			OData.request.restore();
			done();
		});
	});
	QUnit.test("test metadata url parameters: serviceUrl + metadataUrlParameters", function(assert) {
		var done = assert.async();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI + '?test=x', {serviceUrlParams: {"hubel":"dubel"}, metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?test=x&sap-language=en&test2=xx","parameters of service url and metadataUrlParams attached");
			OData.request.restore();
			done();
		});
	});

	QUnit.test("test service url parameters: serviceUrlParams", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI + '?test=x', {json: false, serviceUrlParams: {"hubel":"dubel"}, metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?test=x&sap-language=en&test2=xx","parameters of service url and metadataUrlParams attached");
			OData.request.restore();
			spy = sinon.spy(OData, "request");
			oModel.read("/Categories", {success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?test=x&hubel=dubel", "request uri with parameters");
				OData.request.restore();
				done();
			}, error: function() {
				assert.ok(false, "error handler shouldn't be called");
			}});
		});
	});

	QUnit.test("test service url parameters: serviceUrlParams", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData, "request");
		var oModel = initModel(sURI, {json: false, serviceUrlParams: {"hubel":"dubel"}, metadataUrlParams: {"sap-language":"en", "test2":"xx"}});
		oModel.attachMetadataLoaded(function() {
			assert.equal(spy.args[0][0].requestUri,"/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-language=en&test2=xx","parameters of service url and metadataUrlParams attached");
			OData.request.restore();
			spy = sinon.spy(OData, "request");
			oModel.read("/Categories", {success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?hubel=dubel", "request uri with parameters");
				OData.request.restore();
				done();
			}, error: function() {
				assert.ok(false, "error handler shouldn't be called");
			}});
		});
	});

	QUnit.module("ODataModel.read", {
		beforeEach: function() {
			this.oModel = initModel(sURI, {json:false});
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("ODataModel.resolve: Don't resolve canonical with FunctionImports", function (assert) {
		var done = assert.async();
		var that = this;
		this.oModel.bCanonicalRequests = true;
		this.oModel = initModel(sURI, {
			json:true,
			canonicalRequest: true
		});

		return that.oModel.metadataLoaded()
			.then(function() {
				that.oModel.read("/AuthorizationCheck", {
					urlParameters: {
						"name": "'ReportDefinitionPropertiesSet'"
					},
					success: function() {
						assert.ok(that.oModel.oMetadata._getEntityTypeByPath("/AuthorizationCheck").isFunction, "EntityType is FunctionImport");
						assert.deepEqual(that.oModel.mPathCache, {
							"/AuthorizationCheck": {
								"canonicalPath": "/Products(1)"
							}
						}, "mPathCache should be filled correctly");

						that.oModel.read("/AuthorizationCheck", {
							urlParameters: {
								"name": "'SchemaEntryPointInfoSet'"
							},
							success: function() {
								assert.deepEqual(that.oModel.mPathCache, {
									"/AuthorizationCheck": {
										"canonicalPath": "/Products(2)"
									}
								}, "mPathCache should be filled correctly");

								that.oModel.read("/AuthorizationCheck", {
									urlParameters: {
										"name": "'ReportDefinitionPropertiesSet'"
									},
									success: function() {
										assert.deepEqual(that.oModel.mPathCache, {
											"/AuthorizationCheck": {
												"canonicalPath": "/Products(1)"
											}
										}, "mPathCache should be filled correctly");

										that.oModel.resolve("/AuthorizationCheck", undefined, true);
										done();
									}
								});
							}
						});
					}
				});
			});
	});

	QUnit.test("syntax with url parameters as map", function(assert) {
		var done = assert.async();
		var that = this;
		that.oModel.read("/Categories", {urlParameters: { "horst": true }, json: true, success: function(oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "Categories?horst=true", "request uri contains custom parameters");
			done();
		}, error: function() {
			assert.ok(false, "error handler shouldn't be called");
			done();
		}});
	});

	QUnit.test("syntax with sorter and url parameters", function(assert) {
		var done = assert.async();
		var that = this;
		var aSorters = [
			"should be ignored",
			new Sorter("CategoryName", true),
			{ foo: "bar" },
			false
		];
		that.oModel.read("/Categories", {
			urlParameters: {"$skip": "0","$top":"8"},
			sorters: aSorters,
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=8&$orderby=CategoryName%20desc", "request uri contains custom parameters and sorter");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("new syntax with filter and url parameters", function(assert) {
		var done = assert.async();
		var that = this;
		var aFilters = [
			new Filter("CategoryName", FilterOperator.EQ, "Beverages")
		];
		that.oModel.read("/Categories", {
			urlParameters: {"$skip": "0","$top":"1"},
			filters: aFilters,
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=1&$filter=CategoryName%20eq%20%27Beverages%27", "request uri contains custom parameters and filter");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("new caseSensitive filter syntax", function(assert) {
		var done = assert.async();
		var that = this;
		var aFilters = [
			new Filter({
				path: "CategoryName",
				operator: FilterOperator.EQ,
				value1: "Beverages",
				caseSensitive: false
			})
		];
		that.oModel.read("/Categories", {
			filters: aFilters,
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?$filter=toupper(CategoryName)%20eq%20%27BEVERAGES%27", "request uri contains toupper filter");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("test metadata loading: sap-value-list",function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.metadataLoaded().then(function() {
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations() || isEmptyObject(oModel.getServiceAnnotations()), "annotations not loaded");
			assert.ok(!oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Annotation EntityType not yet loaded");
			assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
			oModel.addAnnotationUrl(sURI + "$metadata?sap-value-list=all").then(function(oParams) {
				assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
				assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
				assert.ok(oModel.getServiceAnnotations(), "annotations loaded");
				assert.ok(oParams.entitySets, "array of entitySets returned");
				assert.ok(oParams.entitySets.length === 1, "1 entitySet added");
				assert.ok(typeof oParams.entitySets[0] == "object", "entitySet metadata object exists");
				assert.ok(oParams.entitySets[0].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
				assert.ok(oParams.entitySets[0].name === "VL_CH_ANLA", "entitySetName ok");
				done();
			});
		});
	});
	QUnit.test("test metadata loading: sap-value-list",function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.metadataLoaded().then(function() {
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations() || isEmptyObject(oModel.getServiceAnnotations()), "annotations not loaded");
			assert.ok(!oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Annotation EntityType not yet loaded");
			assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
			oModel.addAnnotationUrl([sURI + "$metadata?sap-value-list=Test", sURI + "$metadata?sap-value-list=Test2"]).then(function(oParams) {
				assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
				assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
				assert.ok(oModel.getServiceAnnotations(), "annotations loaded");
				assert.ok(oParams.entitySets, "array of entitySets returned");
				assert.ok(oParams.entitySets.length === 2, "2 entitySet added");
				assert.ok(typeof oParams.entitySets[0] == "object", "entitySet metadata object exists");
				assert.ok(oParams.entitySets[0].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
				assert.ok(oParams.entitySets[0].name === "VL_CH_ANLA", "entitySetName ok");
				assert.ok(typeof oParams.entitySets[1] == "object", "entitySet metadata object exists");
				assert.ok(oParams.entitySets[1].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
				assert.ok(oParams.entitySets[1].name === "VL_CH_ANLA", "entitySetName ok");
				done();
			});
		});
	});

	QUnit.test("test metadata loading: sap-value-list - double entityTypes",function(assert) {
		var done = assert.async();
		cleanSharedData();
		var iEntitySetCount, iEntityTypeCount, iAnnotationCount;

		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.metadataLoaded().then(function() {
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations() || isEmptyObject(oModel.getServiceAnnotations()), "annotations not loaded");
			assert.ok(!oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Annotation EntityType not yet loaded");
			assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
			oModel.addAnnotationUrl([sURI + "$metadata?sap-value-list=Test", sURI + "$metadata?sap-value-list=Test2"]).then(function(oParams) {
				assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
				assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
				assert.ok(oModel.getServiceAnnotations(), "annotations loaded");
				assert.ok(oParams.entitySets, "array of entitySets returned");
				assert.ok(oParams.entitySets.length === 2, "2 entitySet added");
				assert.ok(typeof oParams.entitySets[0] == "object", "entitySet metadata object exists");
				assert.ok(oParams.entitySets[0].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
				assert.ok(oParams.entitySets[0].name === "VL_CH_ANLA", "entitySetName ok");
				assert.ok(typeof oParams.entitySets[1] == "object", "entitySet metadata object exists");
				assert.ok(oParams.entitySets[1].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
				assert.ok(oParams.entitySets[1].name === "VL_CH_ANLA", "entitySetName ok");
				iEntitySetCount = oModel.getServiceMetadata().dataServices.schema[0].entityContainer[0].entitySet.length;
				iEntityTypeCount = oModel.getServiceMetadata().dataServices.schema[0].entityType.length;
				iAnnotationCount = oModel.getServiceMetadata().dataServices.schema[0].annotations.length;
			}).then(function() {
				oModel.addAnnotationUrl([sURI + "$metadata?sap-value-list=Test3"]).then(function(oParams) {
					assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
					assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
					assert.ok(oModel.getServiceAnnotations(), "annotations loaded");
					assert.ok(oParams.entitySets, "array of entitySets returned");
					assert.ok(oParams.entitySets.length === 1, "1 entitySet added");
					assert.ok(typeof oParams.entitySets[0] == "object", "entitySet metadata object exists");
					assert.ok(oParams.entitySets[0].entityType === "ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA", "entityType ok");
					assert.ok(oParams.entitySets[0].name === "VL_CH_ANLA", "entitySetName ok");
					assert.ok(iEntitySetCount == oModel.getServiceMetadata().dataServices.schema[0].entityContainer[0].entitySet.length,"no EntitySet added");
					assert.ok(iEntityTypeCount == oModel.getServiceMetadata().dataServices.schema[0].entityType.length,"no EntityType added");
					assert.ok(iAnnotationCount < oModel.getServiceMetadata().dataServices.schema[0].annotations.length,"annotations added");
					done();
				});
			});
		});
	});

	QUnit.test("test metadata loading (relative metadataUrl): sap-value-list",function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.metadataLoaded().then(function() {
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations() || isEmptyObject(oModel.getServiceAnnotations()), "annotations not loaded");
			assert.ok(!oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Annotation EntityType not yet loaded");
			assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
			oModel.addAnnotationUrl("$metadata?sap-value-list=all").then(function() {
				assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
				assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
				assert.ok(oModel.getServiceAnnotations(), "annotations loaded");
				done();
			});
		});
	});

	QUnit.test("async test media entity update check metadata", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});
		var oBinding, oCount = 0;
		oBinding = oModel.bindContext("/Categories(10)");
		oBinding.attachChange(function() {});
		oBinding.initialize();
		oModel.attachBatchRequestCompleted(function(oData) {
			oCount++;
			if (oCount == 1) { // Data loaded initially
				oModel.setProperty("/Categories(10)/CategoryName","Test");
				oModel.submitChanges();
			} else if (oCount == 2) { // Data updated and refreshed
				var oPayload = spy.args[3][0].data.__batchRequests[0].__changeRequests[0].data;
				assert.equal(oPayload.__metadata.content_type, "application/octet-stream", "check media entity property");
				assert.equal(oPayload.__metadata.media_src, "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(10)/Attachment/$value", "check media entity property");
				assert.equal(oPayload.__metadata.edit_media, undefined, "check media entity property");
				OData.defaultHttpClient.request.restore();
				oModel.destroy();
				done();
			} else {
				assert.ok(false, "More than two batch requests sent!");
			}
		});
	});

	QUnit.module("CSRF Token handling", {
		beforeEach: function() {
			window.odataFakeServiceData.forbidHeadRequest = false;
			window.odataFakeServiceData.csrfRequests = [];
			window.odataFakeServiceData.requests = [];
			this.oModel = initModel(sURI, {useBatch: true});
			fakeService.updateCsrfToken();
		},
		afterEach: function() {
			this.oModel.destroy();
			cleanSharedData();
			delete this.oModel;
			fakeService.deleteCsrfToken();
		}
	});

	QUnit.test("No token request for GET requests", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(false);
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.read("/Categories(1)", {
			success: function() {
				assert.ok(!refreshSpy.called, "No security token needed for GET requests");
				done();
			}
		});
	});

	QUnit.test("No token included in GET requests", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(false);
		this.oModel.read("/Categories(1)", {
			success: function() {
				assert.equal(window.odataFakeServiceData.requests.length, 0, "No request with token sent");
				done();
			}
		});
	});

	QUnit.test("No token included in GET requests after POST", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(false);
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				this.oModel.read("/Categories(1)", {
					success: function() {
						assert.equal(window.odataFakeServiceData.requests.length, 1, "Only one request with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token only included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request for GET request inside batch", function(assert) {
		var done = assert.async();
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.read("/Categories(1)", {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for GET inside batch");
				assert.equal(window.odataFakeServiceData.requests.length, 1, "Only one request with token sent");
				assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token only included for POST request");
		done();
			}
		});
	});

	QUnit.test("Token request for GET requests (read access logging set)", function(assert) {
		var done = assert.async();

		var oModel = new ODataModel(sURI, {
			tokenHandlingForGet: true,
			useBatch: false
		});

		var fnRequestHandlerSpy = sinon.spy(oModel, "_request");

		oModel.oMetadata.loaded().then(function() {
			oModel.read("/Categories(1)", {
				success: function() {
					assert.ok(fnRequestHandlerSpy.getCall(1).args[0].method === "GET", "GET Request send");
					assert.ok(fnRequestHandlerSpy.getCall(1).args[0].headers["x-csrf-token"], "CSRF token set");
					done();
				}
			});
		});
	});

	QUnit.test("Token request for GET requests (tokenHandlingForGet = false)", function(assert) {
		var done = assert.async();

		var oModel = new ODataModel(sURI, {
			useBatch: false
		});

		var fnRequestHandlerSpy = sinon.spy(oModel, "_request");

		oModel.oMetadata.loaded().then(function() {
			oModel.read("/Categories(1)", {
				success: function() {
					assert.ok(fnRequestHandlerSpy.getCall(0).args[0].method === "GET", "GET Request send");
					assert.ok(!fnRequestHandlerSpy.getCall(0).args[0].headers["x-csrf-token"], "CSRF token not set");
					done();
				}
			});
		});
	});

	QUnit.test("Token request for POST requests", function(assert) {
		var done = assert.async();

		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.ok(refreshSpy.calledOnce, "No additional token request");
						assert.equal(window.odataFakeServiceData.requests.length, 2, "Two requests with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request, automatic resubmit", function(assert) {
		var done = assert.async();
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken"),
			resetSpy = sinon.spy(this.oModel, "resetSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				fakeService.updateCsrfToken();
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.ok(resetSpy.calledOnce, "Token was reset, as it was invalid");
						assert.ok(refreshSpy.calledTwice, "Token was fetched again after update");
						assert.equal(window.odataFakeServiceData.requests.length, 3, "Three requests with token sent (one retry)");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[2], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request, manual refresh", function(assert) {
		var done = assert.async();
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken"),
			resetSpy = sinon.spy(this.oModel, "resetSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				fakeService.updateCsrfToken();
				this.oModel.refreshSecurityToken();
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.ok(!resetSpy.called, "No reset, as token was explicitly refreshed before");
						assert.ok(refreshSpy.calledTwice, "Token was fetched in explicit refresh call");
						assert.equal(window.odataFakeServiceData.requests.length, 2, "Two requests with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request using HEAD method", function(assert) {
		var done = assert.async();
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.equal(window.odataFakeServiceData.csrfRequests.length, 1, "Only one CSRF Request sent");
				assert.equal(window.odataFakeServiceData.csrfRequests[0], "HEAD", "CSRF-Token requested using HEAD method");

				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.equal(window.odataFakeServiceData.csrfRequests.length, 1, "Only one CSRF request replied to");
						assert.ok(refreshSpy.calledOnce, "No additional token request");
						assert.equal(window.odataFakeServiceData.requests.length, 2, "Two requests with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request trying HEAD, then fallback to GET method", function(assert) {
		var done = assert.async();
		window.odataFakeServiceData.forbidHeadRequest = true;
		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.equal(window.odataFakeServiceData.csrfRequests.length, 2, "Two CSRF requests sent");
				assert.equal(window.odataFakeServiceData.csrfRequests[0], "HEAD", "CSRF-Token requested using HEAD method");
				assert.equal(window.odataFakeServiceData.csrfRequests[1], "GET", "CSRF-Token requested using GET method");

				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.equal(window.odataFakeServiceData.csrfRequests.length, 2, "Two CSRF requests replied to");
						assert.ok(refreshSpy.calledOnce, "No additional token request");
						assert.equal(window.odataFakeServiceData.requests.length, 2, "Two requests with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request using only GET method", function(assert) {
		var done = assert.async();
		// Replace model with model that should not use HEAD
		this.oModel.destroy();
		this.oModel = initModel(sURI, {
			json: true,
			disableHeadRequestForToken: true
		});
		fakeService.updateCsrfToken();

		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.equal(window.odataFakeServiceData.csrfRequests.length, 1, "One CSRF requests sent");
				assert.equal(window.odataFakeServiceData.csrfRequests[0], "GET", "CSRF-Token requested using GET method");

				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.equal(window.odataFakeServiceData.csrfRequests.length, 1, "One CSRF requests replied to");
						assert.ok(refreshSpy.calledOnce, "No additional token request");
						assert.equal(window.odataFakeServiceData.requests.length, 2, "Two requests with token sent");
						assert.equal(window.odataFakeServiceData.requests[0], "POST", "Token included for POST request");
						assert.equal(window.odataFakeServiceData.requests[1], "POST", "Token included for POST request");
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request for different services on the same server", function(assert) {
		var done = assert.async(),
			sURI1 = "http://server/service1/",
			sURI2 =  "http://server/service2/";

		fakeService.setBaseUrl(sURI1);
		this.oModel.destroy();
		this.oModel = initModel(sURI1, {
			json: true
		});

		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");

				fakeService.setBaseUrl(sURI2);
				this.oModel.destroy();
				this.oModel = initModel(sURI2, {
					json: true
				}, false);
				refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");

				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.ok(!refreshSpy.called, "No additional token request");
						fakeService.resetBaseUrl();
						done();
					}
				});
			}.bind(this)
		});
	});

	QUnit.test("Token request for different services on different servers", function(assert) {
		var done = assert.async(),
			sURI1 = "http://server1/service/",
			sURI2 =  "http://server2/service/";

		fakeService.setBaseUrl(sURI1);
		this.oModel.destroy();
		this.oModel = initModel(sURI1, {
			json: true
		});

		var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
		this.oModel.create("/Categories(1)", {}, {
			success: function() {
				assert.ok(refreshSpy.calledOnce, "Token requested for POST request");

				fakeService.setBaseUrl(sURI2);
				this.oModel.destroy();
				this.oModel = initModel(sURI2, {
					json: true
				}, false);
				refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");

				this.oModel.create("/Categories(1)", {}, {
					success: function() {
						assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
						fakeService.resetBaseUrl();
						done();
					}
				});
			}.bind(this)
		});
	});

[true, "foo"].forEach(function (bEarlyTokenRequest) {
	QUnit.test("Early request for security token: " + bEarlyTokenRequest, function (assert) {
		this.mock(ODataModel.prototype).expects("securityTokenAvailable").withExactArgs();

		// code under test
		new ODataModel(sURI, {earlyTokenRequest : bEarlyTokenRequest});
	});
});

[false, undefined, "", null, 0].forEach(function (bEarlyTokenRequest) {
	QUnit.test("No early request for security token: " + bEarlyTokenRequest, function (assert) {
		this.mock(ODataModel.prototype).expects("securityTokenAvailable").never();

		// code under test
		new ODataModel(sURI, {earlyTokenRequest : bEarlyTokenRequest});
	});
});

	QUnit.test("No early request for security token without parameters", function (assert) {
		this.mock(ODataModel.prototype).expects("securityTokenAvailable").never();

		// code under test
		new ODataModel(sURI);
	});

[true, "foo"].forEach(function (bPersistTechnicalMessages) {
	QUnit.test("Persist technical messages: " + bPersistTechnicalMessages, function (assert) {
		// code under test
		var oModel = new ODataModel(sURI, {persistTechnicalMessages : bPersistTechnicalMessages});

		assert.strictEqual(oModel.bPersistTechnicalMessages, true);
	});
});

[false, "", null, 0].forEach(function (bPersistTechnicalMessages) {
	QUnit.test("Persist technical messages: " + bPersistTechnicalMessages, function (assert) {
		// code under test
		var oModel = new ODataModel(sURI, {persistTechnicalMessages : bPersistTechnicalMessages});

		assert.strictEqual(oModel.bPersistTechnicalMessages, false);
	});
});

	QUnit.test("Persist technical messages: no parameter", function (assert) {
		// code under test
		var oModel = new ODataModel(sURI);

		assert.strictEqual(oModel.bPersistTechnicalMessages, undefined);
	});

	QUnit.module("Soft State Header Support");

	QUnit.test("Soft State Support for CSRF-, Single- and Batchrequests", function(assert) {
		assert.expect(9);
		var done = assert.async();
		var spy = sinon.spy(OData.defaultHttpClient, "request");
		var sPath = "/Categories";
		this.oModel = new ODataModel(sURI);
		this.oModel.securityTokenAvailable().then(function() {
			assert.equal(spy.getCall(0).args[0].headers["sap-contextid-accept"], "header", "Metadaten Request: Soft State Acceptance header was set.");
			assert.equal(spy.getCall(1).args[0].headers["sap-contextid-accept"], "header", "CSRF Request: Soft State Acceptance header was set.");
			var sCurrentContextSessionId = this.oModel.sSessionContextId;
			assert.ok(this.oModel.sSessionContextId,"CSRF Request: Soft State Context ID in response was set in Model.");
			this.oModel.read(sPath, {
				success: function() {
					assert.equal(spy.getCall(2).args[0].headers["sap-contextid-accept"], "header", "Batch Request: Soft State Acceptance header was set.");
					assert.equal(spy.getCall(2).args[0].headers["sap-contextid"], sCurrentContextSessionId, "Batch Request: Soft State Context ID header was set.");
					sCurrentContextSessionId = spy.getCall(2).args[1].arguments[0]["headers"]["sap-contextid"];
					this.oModel.setUseBatch(false);
					this.oModel.read(sPath, {
						success: function() {
							assert.equal(this.oModel.sSessionContextId,sCurrentContextSessionId, "Batch Request: Soft State Context ID in response was set in Model.");
							assert.equal(spy.getCall(3).args[0].headers["sap-contextid-accept"], "header", "Single Request: Soft State Acceptance header was set.");
							assert.equal(spy.getCall(3).args[0].headers["sap-contextid"], sCurrentContextSessionId, "Single Request: Soft State Context ID header was set.");
							sCurrentContextSessionId = spy.getCall(3).args[1].arguments[0]["headers"]["sap-contextid"];
							this.oModel.read(sPath, {
								success: function() {
									assert.equal(this.oModel.sSessionContextId, sCurrentContextSessionId, "Single Request: Soft State Context ID in response was set in Model.");
									OData.defaultHttpClient.request.restore();
									this.oModel.destroy();
									delete this.oModel;
									done();
								}.bind(this)
							});
						}.bind(this)
					});
				}.bind(this)
			});
		}.bind(this));
	});

	QUnit.module("Metamodel binding", {
		beforeEach: function() {
			this.oModel = initModel(sURI, {json: false});
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("Entityset metadata w/o context", function(assert) {
		var done = assert.async();
		this.oModel.getMetaModel().loaded().then(function() {
			assert.equal(this.oModel.getProperty("/Categories(1)/##name"), "Category");
			assert.equal(this.oModel.getProperty("/Categories(1)/##property/0/name"), "CategoryID");
			assert.equal(this.oModel.getProperty("/Categories(1)/CategoryID/##type"), "Edm.Int32");
			assert.equal(this.oModel.getProperty("/Categories(1)/Products(0)/##name"), "Product");
			assert.equal(this.oModel.getProperty("/Categories(1)/Products(0)/ProductID/##type"), "Edm.Int32");
			done();
		}.bind(this));
	});

	QUnit.test("Entityset metadata w/ context", function(assert) {
		var done = assert.async();
		this.oModel.getMetaModel().loaded().then(function() {
			var oContext = this.oModel.getContext("/Categories(1)");
			assert.equal(this.oModel.getProperty("##name", oContext), "Category");
			assert.equal(this.oModel.getProperty("##property/0/name", oContext), "CategoryID");
			assert.equal(this.oModel.getProperty("CategoryID/##type", oContext), "Edm.Int32");
			assert.equal(this.oModel.getProperty("Products(0)/##name", oContext), "Product");
			assert.equal(this.oModel.getProperty("Products(0)/ProductID/##type", oContext), "Edm.Int32");
			done();
		}.bind(this));
	});

	QUnit.test("Metamodel binding refresh after metamodel load", function(assert) {
		var done = assert.async();
		var oPropertyBinding, oListBinding, oMetaBindingRelative, oMetaBindingAbsolute,
			propertySpy, listSpy, metaRelativeSpy, metaAbsoluteSpy;

		this.oModel.createBindingContext("/Categories(7)", null, {expand: "Products"}, function(oContext) {
			oPropertyBinding = this.oModel.bindProperty("CategoryName", oContext);
			oPropertyBinding.attachChange(function() {});
			oPropertyBinding.initialize();
			oListBinding = this.oModel.bindList("Products", oContext);
			oListBinding.attachChange(function() {});
			oListBinding.initialize();

			// createBindingContext callback is executed before checkUpdate, so wait for RequestCompleted
			this.oModel.attachRequestCompleted(function() {
				propertySpy = sinon.spy(oPropertyBinding, "checkUpdate");
				listSpy = sinon.spy(oListBinding, "checkUpdate");

				oMetaBindingRelative = this.oModel.bindProperty("##name", oContext);
				oMetaBindingRelative.attachChange(function() {});
				oMetaBindingRelative.initialize();
				metaRelativeSpy = sinon.spy(oMetaBindingRelative, "checkUpdate");

				oMetaBindingAbsolute = this.oModel.bindProperty("/Categories(7)/##name");
				oMetaBindingAbsolute.attachChange(function() {});
				oMetaBindingAbsolute.initialize();
				metaAbsoluteSpy = sinon.spy(oMetaBindingAbsolute, "checkUpdate");

				// Metamodel bindings trigger the creation of the metamodel, so we can wait for loaded() here
				this.oModel.getMetaModel().loaded().then(function() {
					assert.ok(!propertySpy.called, "Property binding checkUpdate not called");
					assert.equal(oPropertyBinding.getValue(), "Produce", "Property value returns correct value");
					assert.ok(!listSpy.called, "List binding checkUpdate not called");
					assert.equal(oListBinding.getContexts().length, 5, "List binding returns right amount of contexts");
					assert.ok(metaRelativeSpy.calledOnce, "Relative metamodel binding checkUpdate called once");
					assert.equal(oMetaBindingRelative.getValue(), "Category", "Relative metamodel binding returns correct value");
					assert.ok(metaAbsoluteSpy.calledOnce, "Absolute metamodel binding checkUpdate called once");
					assert.equal(oMetaBindingAbsolute.getValue(), "Category", "Absolute metamodel binding returns correct value");
					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Model: Function import", {
		beforeEach: function() {
			this.oModel = initModel(sURI);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("BindList with function import", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(true);
		this.oModel.metadataLoaded().then(function() {
			var oListBinding = this.oModel.bindList("/GetProductsByRating");
			oListBinding.attachChange(function() {});
			var oLogSpy = sinon.spy(Log, "error");
			oListBinding.initialize();
			assert.deepEqual(oLogSpy.getCalls(), [], "There should be no error logged, since the function import returns an entitySet");
			oLogSpy.restore();
			done();

		}.bind(this));
	});

	QUnit.test("Check context path of created entry and function import", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(true);
		var that = this;

		// create entry (context)
		this.oModel.metadataLoaded().then(function() {

			return new Promise(function(resolve, reject) {

				var oContext = that.oModel.createEntry("/Products", {properties: {Name: 'test', ID: '1000'}, urlParameters: {'create': "id_1000"}});

				that.oModel.submitChanges({
					success: function() {
						assert.deepEqual("/Products(1000)", oContext.getPath());
						assert.ok(oContext === that.oModel.getContext(oContext.getPath()), "Context must be the same");
						resolve(oContext);
					},
					error: function(oError) {
						reject("There should be no error " + oError);
					}
				});
			});

		// perform callFunction
		}).then(function(oContext) {
			var oHandle = that.oModel.callFunction("/DisableProduct", {
				groupId: "changes",
				method: "POST",
				urlParameters: {"id": "1000"}
			});

			oHandle.contextCreated().then(function(oContextCallFunction) {

				that.oModel.submitChanges({
					success: function() {
						assert.deepEqual("/Products(1000)", oContext.getPath());
						assert.ok(oContext === that.oModel.getContext(oContext.getPath()), "Context must be the same");
						// The context for the function import is still the same; it is not deleted
						assert.strictEqual(oContextCallFunction,
							that.oModel.getContext(oContextCallFunction.getPath()));
						assert.ok(oContext !== oContextCallFunction);
						done();
					},
					error: function(oError) {
						assert.fail("There should be no error " + oError);
						done(oError);
					}
				});
			}, function(oError) {
				assert.fail("There should be no error " + oError);
				done(oError);
			});
		});
	});

	QUnit.module("Model: createEntry", {
		beforeEach: function() {
			this.oModel = initModel(sURI);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("Check context path of created entry", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(true);
		this.oModel.metadataLoaded().then(function() {
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test', ID: '1000'}, urlParameters: {'create': "id_1000"}});

			this.oModel.submitChanges({
				success: function() {
					assert.deepEqual("/Products(1000)", oContext.getPath());
					assert.ok(oContext === this.oModel.getContext(oContext.getPath()), "Context must be the same");
					assert.deepEqual(oContext, this.oModel.getContext(oContext.getPath()));
					done();
				}.bind(this),
				error: function() {
					assert.fail("There should be no error");
					done();
				}
			});

		}.bind(this));
	});


	QUnit.test("check logs for created entry", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			var oLogSpy = sinon.spy(Log, "warning");
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}});
			assert.equal(oLogSpy.callCount, 0, "There should be no warning log initially");

			this.oModel.setProperty('Name', "test2", oContext);
			assert.equal(oLogSpy.callCount, 0, "There should be no warning log after setProperty");

			this.oModel.attachRequestCompleted(function() {
				assert.ok(oContext, "should be present");
				assert.equal(oLogSpy.callCount, 0, "There should be no warning log during createEntry call");
				oLogSpy.restore();
				done();
			});

			this.oModel.submitChanges();
		}.bind(this));
	});


	QUnit.test("set same value again", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}, urlParameters: {'Fail500': true}});
			var oProduct = this.oModel.getProperty('', oContext);
			this.oModel.setProperty("Name", "test", oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(oProduct.__metadata.created, "Product flagged as created");
			assert.ok(this.oModel.hasPendingChanges(), "Model should still have pending changes");
			done();
		}.bind(this));
	});
	QUnit.test("submit again after error", function(assert) {
		var spy = sinon.spy(this.oModel, "_submitRequest");
		var done = assert.async();
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}, urlParameters: {'Fail500': true}});
			var oProduct = this.oModel.getProperty('', oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(oProduct.__metadata.created, "Product flagged as created");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(!oInfo.getParameter('success'), "request should fail");
				assert.ok(oInfo.getParameter('method') == 'POST', 'method should be POST');
				assert.ok(spy.args[0][0].created, "request flagged as created");
                assert.notOk(spy.args[0][0].data.__metadata.uri, "create request: generated uri must not be part of __metadata");
			};
			var fnFailed = function(oInfo) {
				that.oModel.detachRequestFailed(fnFailed);
				assert.ok(true, "request failed");
				var oProduct = that.oModel.getProperty('', oContext);
				assert.ok(oProduct, "Product still exists");
				assert.ok(oProduct.__metadata.created, "Product still flagged as created");
				assert.ok(oInfo.getParameter('method') == 'POST', 'method should be POST');
				that.oModel.attachRequestFailed(function(oInfo) {
					that.oModel.detachRequestFailed(fnFailed);
					assert.ok(true, "request failed");
					var oProduct = that.oModel.getProperty('', oContext);
					assert.ok(oProduct, "Product still exists");
					assert.ok(oProduct.__metadata.created, "Product still flagged as created");
					assert.ok(spy.args[0][0].created, "request flagged as created");
					assert.ok(oInfo.getParameter('method') == 'POST', 'method should be POST');
					that.oModel._submitRequest.restore();
					done();
				});
				that.oModel.attachRequestCompleted(function(oInfo) {
					that.oModel.detachRequestCompleted(fnCompl);
					assert.ok(!oInfo.getParameter('success'), "request should fail");
					assert.ok(oInfo.getParameter('method') == 'POST', 'method should be POST');
				});

				that.oModel.submitChanges();
			};
			this.oModel.attachRequestFailed(fnFailed);
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});
	QUnit.test("submit:check header & url params", function(assert) {
		var done = assert.async();
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}, headers: {'test-header': 'test-header-value'}, urlParameters: {'Fail500': true, 'test-param':'test-param-value'}});
			var oProduct = this.oModel.getProperty('', oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(oProduct.__metadata.created, "Product flagged as created");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(!oInfo.getParameter('success'), "request should fail");
				assert.ok(oInfo.getParameter('headers')['test-header'], 'header set correctly');
				assert.ok(oInfo.getParameter('headers')['test-header'] === 'test-header-value', 'header value set correctly');
				assert.ok(oInfo.getParameter('url').indexOf('&test-param=test-param-value') > -1, 'url param set correctly');
			};
			var fnFailed = function(oInfo) {
				that.oModel.detachRequestFailed(fnFailed);
				assert.ok(true, "request failed");
				var oProduct = that.oModel.getProperty('', oContext);
				assert.ok(oProduct, "Product still exists");
				assert.ok(oProduct.__metadata.created, "Product still flagged as created");
				assert.ok(oInfo.getParameter('headers')['test-header'], 'header set correctly');
				assert.ok(oInfo.getParameter('headers')['test-header'] === 'test-header-value', 'header value set correctly');
				assert.ok(oInfo.getParameter('url').indexOf('&test-param=test-param-value') > -1, 'url param set correctly');
				that.oModel.attachRequestFailed(function(oInfo) {
					that.oModel.detachRequestFailed(fnFailed);
					assert.ok(true, "request failed");
					var oProduct = that.oModel.getProperty('', oContext);
					assert.ok(oProduct, "Product still exists");
					assert.ok(oProduct.__metadata.created, "Product still flagged as created");
						assert.ok(oInfo.getParameter('headers')['test-header'], 'header set correctly');
					assert.ok(oInfo.getParameter('headers')['test-header'] === 'test-header-value', 'header value set correctly');
					assert.ok(oInfo.getParameter('url').indexOf('&test-param=test-param-value') > -1, 'url param set correctly');
					done();
				});
				that.oModel.attachRequestCompleted(function(oInfo) {
					that.oModel.detachRequestCompleted(fnCompl);
					assert.ok(!oInfo.getParameter('success'), "request should fail");
					assert.ok(oInfo.getParameter('headers')['test-header'], 'header set correctly');
					assert.ok(oInfo.getParameter('headers')['test-header'] === 'test-header-value', 'header value set correctly');
					assert.ok(oInfo.getParameter('url').indexOf('&test-param=test-param-value') > -1, 'url param set correctly');
				});

				that.oModel.submitChanges();
			};
			this.oModel.attachRequestFailed(fnFailed);
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});

	/**
	 * Calling a non existing function import should neither result in success nor in error handler since there has no request been created.
	 */
	QUnit.test("callFunction:non existing", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			var oRequestHandle = this.oModel.callFunction("/UpdateProductsNonExisting", {method: "POST", success: function() {
					assert.ok(false, "no request should be created, therefore it can neither succeed nor fail");
					done();
				}, error: function() {
					assert.ok(false, "no request should be created, therefore it can neither succeed nor fail");
					done();
				}});
			assert.ok(oRequestHandle, "Request Handle should be created");
			oRequestHandle.contextCreated().then(function() {
				assert.ok(false, "no request should be created, therefore it can neither succeed nor fail");
				done();
			}, function() {
				assert.ok(true, "Should reject");
				done();
			});
		}.bind(this));
	});

	QUnit.test("callFunction:check eTag", function(assert) {
		var done = assert.async();
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnSent = function(oInfo) {
				that.oModel.detachRequestCompleted(fnSent);
				assert.equal(oInfo.getParameter('headers')['If-Match'], 'myEtag', 'header for eTag set correctly');
				done();
			};
			this.oModel.attachRequestSent(fnSent);
			this.oModel.callFunction("/UpdateProducts", {method: "PUT", eTag: "myEtag"});
			this.oModel.submitChanges();
		}.bind(this));
	});

	QUnit.test("submit:check eTag - forceUpdate", function(assert) {
		var done = assert.async();
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnReadCompleted = function() {
				that.oModel.detachRequestCompleted(fnReadCompleted);
				that.oModel.detachRequestFailed(fnReadFailed);
				//set some etag
				that.oModel.setProperty("/Categories(1)/__metadata/etag", "testETag");
				var oCategory = that.oModel.getProperty("/Categories(1)");
				assert.ok(oCategory.__metadata.etag === "testETag", "eTag set correctly");
				//change data
				that.oModel.setProperty("/Categories(1)/CategoryName", "TestETag");
				var fnCompl = function(oInfo) {
					that.oModel.detachRequestCompleted(fnCompl);
				/*	assert.ok(!oInfo.getParameter('success'), "request should fail");
					assert.ok(oInfo.getParameter('headers')['If-Match'] === 'testEtag', 'header for eTag set correctly');*/
				};

				var fnFailed = function(oInfo) {
					that.oModel.detachRequestFailed(fnFailed);
					assert.ok(true, "request failed");
					assert.ok(oInfo.getParameter('headers')['If-Match'] === 'testETag', 'header for eTag set correctly');
					assert.ok(oInfo.getParameter('response').statusCode === 412, 'status code = 412');
					var sKey = that.oModel.getKey(oInfo.getParameter('url'));
					assert.ok(sKey === "Categories(1)");
					that.oModel.forceEntityUpdate(sKey);
					var oCategory = that.oModel.getProperty("/Categories(1)");
					assert.ok(oCategory.__metadata.etag === '*', "eTag set to *");

					that.oModel.attachRequestFailed(function(oInfo) {
						that.oModel.detachRequestFailed(fnFailed);
						assert.ok(false, "request should be succesful");
					});

					that.oModel.attachRequestCompleted(function(oInfo) {
						that.oModel.detachRequestCompleted(fnCompl);
						assert.ok(oInfo.getParameter('success'), "request successful");
						assert.ok(oInfo.getParameter('response').statusCode === 204, 'status code = 204');
						assert.ok(oInfo.getParameter('headers')['If-Match'] === '*', 'header for eTag set correctly');
						done();
					});
					that.oModel.submitChanges();
				};
				that.oModel.attachRequestFailed(fnFailed);
				that.oModel.attachRequestCompleted(fnCompl);
				that.oModel.submitChanges();
			};
			var fnReadFailed = function() {
				assert.ok(false, "Read of Category should not fail");
			};
			this.oModel.read("/Categories(1)", {error: function() {assert.ok(false,"reading Category 1 failed");}});
			that.oModel.attachRequestCompleted(fnReadCompleted);
			that.oModel.attachRequestFailed(fnReadFailed);
		}.bind(this));
	});

	QUnit.test("submit:check success", function(assert) {
		var done = assert.async();
		assert.expect( 6 );
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
				assert.ok(true, "success handler called");
			};
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}, success: fnSuccess});
			var oProduct = this.oModel.getProperty('', oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(oProduct.__metadata.created, "Product flagged as created");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(oInfo.getParameter('success'), "request success");
				var oProduct =  oContext.getObject();
				assert.ok(oProduct, "Product still exists");
				assert.ok(!oProduct.__metadata.created, "Product not flagged as created");
				done();
			};
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});
	QUnit.test("submit:check erro handler", function(assert) {
		var done = assert.async();
		assert.expect( 12 );
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnError = function() {
				assert.ok(true, "error handler called");
			};
			var oContext = this.oModel.createEntry("/Products", {properties: {Name: 'test'}, error: fnError, urlParameters: {'Fail500': true, 'test-param':'test-param-value'}});
			var oProduct = this.oModel.getProperty('', oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(oProduct.__metadata.created, "Product flagged as created");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(!oInfo.getParameter('success'), "request should fail");
			};
			var fnFailed = function(oInfo) {
				that.oModel.detachRequestFailed(fnFailed);
				assert.ok(true, "request failed");
				var oProduct = that.oModel.getProperty('', oContext);
				assert.ok(oProduct, "Product still exists");
				assert.ok(oProduct.__metadata.created, "Product still flagged as created");
				that.oModel.attachRequestFailed(function(oInfo) {
					that.oModel.detachRequestFailed(fnFailed);
					assert.ok(true, "request failed");
					var oProduct = that.oModel.getProperty('', oContext);
					assert.ok(oProduct, "Product still exists");
					assert.ok(oProduct.__metadata.created, "Product still flagged as created");
					done();
				});
				that.oModel.attachRequestCompleted(function(oInfo) {
					that.oModel.detachRequestCompleted(fnCompl);
					assert.ok(!oInfo.getParameter('success'), "request should fail");
				});

				that.oModel.submitChanges();
			};
			this.oModel.attachRequestFailed(fnFailed);
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});
	QUnit.test("create on NavProp", function(assert) {
		var done = assert.async();
		assert.expect( 8 );
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
				assert.ok(true, "success handler called");
			};
			var oContext = this.oModel.createEntry("/Products(0)/Supplier", {properties: {Name: 'test'}, success: fnSuccess});
			var oSupplier = this.oModel.getProperty('', oContext);
			assert.ok(oSupplier, "Supplier created");
			assert.ok(oSupplier.__metadata.created, "Supplier flagged as created");
			assert.ok(oSupplier.__metadata.created.key == "Products(0)/Supplier", "POST key ok");
			assert.ok(oContext.getPath().startsWith("/Suppliers("), "Data cache ok");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(oInfo.getParameter('success'), "request success");
				var oSupplier = oContext.getObject();
				assert.ok(oSupplier, "Supplier still exists");
				assert.ok(!oSupplier.__metadata.created, "Supplier not flagged as created");
				done();
			};
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});
	QUnit.test("submit:check success - no pending changes", function(assert) {
		var done = assert.async();
		assert.expect(9);
		var that = this;
		this.oModel.setUseBatch(true);
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function(oData) {
				assert.ok(true, "success handler called");
				var oProduct = oContext.getObject();
				assert.ok(oProduct, "Product still exists");
				assert.ok(!that.oModel.oData[oContext.getPath().slice(1)].__metadata.created,
					"Product not flagged as created");
				done();
			};
			var fnError = function() {
				assert.ok(true, "error handler called");
				//hack the model so next request would be ok
				delete that.oModel.oData[oContext.getPath().slice(1)].__metadata.created.urlParameters;
				delete that.oModel.mChangedEntities[oContext.getPath().slice(1)].__metadata.created.urlParameters;
				that.oModel.setProperty('Name', "test2", oContext);
				that.oModel.submitChanges();
			};
			var oContext = this.oModel.createEntry("/Products", {urlParameters: {'Fail500': true}, properties: {Name: 'test'}, success: fnSuccess, error:fnError});
			var oProduct = this.oModel.getProperty('', oContext);
			assert.ok(oProduct, "Product created");
			assert.ok(that.oModel.oData[oContext.getPath().slice(1)].__metadata.created,
				"Product flagged as created");
			var fnCompl = function(oInfo) {
				that.oModel.detachRequestCompleted(fnCompl);
				assert.ok(!oInfo.getParameter('success'), "request error");
				var oProduct =  oContext.getObject();
				assert.ok(oProduct, "Product still exists");
				assert.ok(that.oModel.oData[oContext.getPath().slice(1)].__metadata.created,
					"Product still flagged as created");
			};
			this.oModel.attachRequestCompleted(fnCompl);
			this.oModel.submitChanges();
		}.bind(this));
	});

	QUnit.test("createEntry and relative bindings", function(assert) {
		var done = assert.async();
		assert.expect(2);
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
				assert.ok(false, "success handler must not be called");
			};
			var oCreatedContext = this.oModel.createEntry("/Products", {
				properties: {Name: 'test'},
				success: fnSuccess
			});
			var oContextBinding = this.oModel.bindContext("Supplier", oCreatedContext);
			oContextBinding.attachChange(function() {
				assert.ok(true, "ContextBinding change must be fired");
				assert.equal(oContextBinding.getBoundContext(), null, "Bound context must be null");
			});
			oContextBinding.initialize();
			var oListBinding = this.oModel.bindList("Items", oCreatedContext);
			oListBinding.attachChange(function() {
				assert.ok(false, "ListBinding change must not be fired");
			});
			oListBinding.attachRefresh(function() {
				oListBinding.getContexts(0,10);
				assert.ok(false, "ListBinding refresh must not be fired");
			});
			oListBinding.initialize();
			this.oModel.attachRequestSent(function() {
				assert.ok(false, "No requests must be sent");
			});
			setTimeout(function() {
				done();
			}, 0);
		}.bind(this));
	});

	QUnit.test("createEntry and relative bindings (setContext)", function(assert) {
		var done = assert.async();
		assert.expect(2);
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
				assert.ok(false, "success handler must not be called");
			};
			var oCreatedContext = this.oModel.createEntry("/Products", {
				properties: {Name: 'test'},
				success: fnSuccess
			});
			var oContextBinding = this.oModel.bindContext("Supplier");
			oContextBinding.attachChange(function() {
				assert.ok(true, "ContextBinding change must be fired");
				assert.equal(oContextBinding.getBoundContext(), null, "Bound context must be null");
			});
			oContextBinding.initialize();
			oContextBinding.setContext(oCreatedContext);
			var oListBinding = this.oModel.bindList("Items");
			oListBinding.attachChange(function() {
				assert.ok(false, "ListBinding change must not be fired");
			});
			oListBinding.attachRefresh(function() {
				oListBinding.getContexts(0,10);
				assert.ok(false, "ListBinding refresh must not be fired");
			});
			oListBinding.initialize();
			oListBinding.setContext(oCreatedContext);
			this.oModel.attachRequestSent(function() {
				assert.ok(false, "No requests must be sent");
			});
			setTimeout(function() {
				done();
			}, 0);
		}.bind(this));
	});

	QUnit.test("createEntry and absolute bindings", function(assert) {
		var done = assert.async();
		assert.expect(7);
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
				assert.ok(false, "success handler must not be called");
			};
			var oCreatedContext = this.oModel.createEntry("/Products", {
				properties: {Name: 'test'},
				success: fnSuccess
			});
			var oContextBinding = this.oModel.bindContext("/Categories(1)", oCreatedContext);
			oContextBinding.attachChange(function() {
				assert.ok(true, "ContextBinding change must be fired");
			});
			oContextBinding.initialize();
			var oListBinding = this.oModel.bindList("/Products", oCreatedContext);
			oListBinding.attachChange(function() {
				assert.ok(true, "ListBinding change must be fired");
				done();
			});
			oListBinding.attachRefresh(function() {
				oListBinding.getContexts(0,10);
				assert.ok(true, "ListBinding refresh must be fired");
			});
			oListBinding.initialize();
			this.oModel.attachRequestSent(function() {
				assert.ok(true, "Requests must be triggered");
			});
		}.bind(this));
	});

	QUnit.test("createEntry and bindElement", function(assert) {
		var done = assert.async();
		assert.expect(1);
		var that = this;
		this.oModel.metadataLoaded().then(function() {
			var fnSuccess = function() {
					assert.ok(false, "success handler must not be called");
				},
				fnRequestSent = function() {
					assert.ok(false, "no request must be triggered");
				};

			var oCreatedContext = this.oModel.createEntry("/Products", {
				success: fnSuccess
			});
			var oContextBinding = this.oModel.bindContext(oCreatedContext.getPath());
			oContextBinding.attachChange(function() {
				assert.ok(true, "ContextBinding change must be fired");
			});
			this.oModel.attachRequestSent(fnRequestSent);
			oContextBinding.initialize();
			setTimeout(function() {
				that.oModel.detachRequestSent(fnRequestSent);
				done();
			}, 0);
		}.bind(this));
	});

	QUnit.module("Model: SAML");

	QUnit.test("SAML redirect - without batch", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: false
		});

		oModel.read("/SAML200", {
			success: function() {
				assert.ok(false, "Success handler must not be called in case of SAML redirect");
				done();
			},
			error: function(oError) {
				assert.ok(oError.statusCode, 200, "SAML redirect has a 200 response code");
				assert.ok(oError.headers["com.sap.cloud.security.login"], "SAML login header is contained in response");
				done();
			}
		});
	});

	QUnit.test("SAML redirect - with batch", function(assert) {
		var done = assert.async();

		cleanSharedData();

		var oModel = initModel(sURI, {
			json: true,
			useBatch: true
		});

		oModel.read("/SAML200", {
			success: function() {
				assert.ok(false, "Success handler must not be called in case of SAML redirect");
				done();
			},
			error: function(oError) {
				assert.ok(oError.statusCode, 200, "SAML redirect has a 200 response code");
				assert.ok(oError.headers["com.sap.cloud.security.login"], "SAML login header is contained in response");
				done();
			}
		});
	});

	QUnit.module("Model: includeExpandEntries");

	QUnit.test("test getProperty with includeExpandEntries __ref", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false, useBatch: true});
		oModel.read("/Products(7)", { urlParameters: {"$expand" : "Category"}, success: function() {
			var oDeepEntry = oModel.getProperty("/Products(7)");
			assert.ok(oDeepEntry.Category.__ref, "check ref");
			assert.equal(oDeepEntry.Category.__ref, "Categories(7)", "check ref value");

			oDeepEntry = oModel.getProperty("/Products(7)", null, true);
			assert.equal(oDeepEntry.Category.CategoryID, 7, "check id");

			oDeepEntry = oModel.getProperty("/Products(7)");
			assert.ok(oDeepEntry.Category.__ref, "check ref");
			assert.equal(oDeepEntry.Category.__ref, "Categories(7)", "check ref value");

			done();
		}});
	});

	QUnit.test("test getProperty with includeExpandEntries __list", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false, useBatch: true});
		oModel.read("/Categories(7)", { urlParameters: {"$expand" : "Products"}, success: function() {
			var oDeepEntry = oModel.getProperty("/Categories(7)");
			assert.ok(oDeepEntry.Products.__list, "check list");
			assert.equal(oDeepEntry.Products.__list[0], "Products(7)", "check list value");

			oDeepEntry = oModel.getProperty("/Categories(7)", null, true);
			assert.equal(oDeepEntry.Products.results.length, 5, "check length");
			assert.equal(oDeepEntry.Products.results[0].CategoryID, oDeepEntry.CategoryID, "check category id");
			assert.equal(oDeepEntry.Products.results[0].ProductID, 7, "check product id");

			var oDeepEntry = oModel.getProperty("/Categories(7)");
			assert.ok(oDeepEntry.Products.__list, "check list");
			assert.equal(oDeepEntry.Products.__list[0], "Products(7)", "check list value");

			done();
		}});
	});

	QUnit.test("test getProperty with includeExpandEntries and cyclic dependencies", function(assert) {
		var done = assert.async();
		cleanSharedData();
		var oModel = initModel(sURI, {json:false, useBatch: true});
		oModel.read("/Products(7)", { urlParameters: {"$expand" : "Category"}, success: function() {
			oModel.read("/Categories(7)", { urlParameters: {"$expand" : "Products"}, success: function() {

				var oDeepEntry = oModel.getProperty("/Products(7)");
				assert.ok(oDeepEntry.Category.__ref, "check ref");
				assert.equal(oDeepEntry.Category.__ref, "Categories(7)", "check ref value");

				oDeepEntry = oModel.getProperty("/Products(7)", null, true);
				assert.equal(oDeepEntry.Category.Products.results[0].ProductID, oDeepEntry.ProductID, "check same id");
				assert.equal(oDeepEntry.Category.Products.results[0].Category, oDeepEntry.Category, "check cycle");

				oDeepEntry = oModel.getProperty("/Products(7)");
				assert.ok(oDeepEntry.Category.__ref, "check ref");
				assert.equal(oDeepEntry.Category.__ref, "Categories(7)", "check ref value");

				var oDeepEntry = oModel.getProperty("/Categories(7)");
				assert.ok(oDeepEntry.Products.__list, "check list");
				assert.equal(oDeepEntry.Products.__list[0], "Products(7)", "check list value");

				oDeepEntry = oModel.getProperty("/Categories(7)", null, true);
				assert.equal(oDeepEntry.Products.results[0].CategoryID, oDeepEntry.CategoryID, "check same id");
				assert.equal(oDeepEntry.Products.results[0].Category.Products.results[0], oDeepEntry.Products.results[0], "check cycle");

				var oDeepEntry = oModel.getProperty("/Categories(7)");
				assert.ok(oDeepEntry.Products.__list, "check list");
				assert.equal(oDeepEntry.Products.__list[0], "Products(7)", "check list value");

				done();
			}});
		}});
	});

	QUnit.module("Model: Response headers");

	QUnit.test("Bindable response headers in metadata", function(assert) {
		var done = assert.async();
		assert.expect(4);

		var oModelBatch = initModel(sURI, {json:false, useBatch: true, bindableResponseHeaders: ["age", "cache-control"]});
		oModelBatch.setUseBatch(true);

		var oButton = new Text({
			text: {
				path: "/Products(1)/__metadata/headers/age"
			}
		});
		oButton.setModel(oModelBatch);


		var oModelSingle = initModel(sURI, {json:false, useBatch: false, bindableResponseHeaders: ["age", "cache-control"]});
		oModelSingle.setUseBatch(false);

		var oButton2 = new Button({
			text: {
				parts: [ { path: "__metadata/headers/age" }, { path: "__metadata/headers/invalid" } ]
			}
		});
		oButton2.bindElement("/Products(1)");
		oButton2.setModel(oModelSingle);

		function readProduct() {
			return new Promise(function(fnResolve, fnReject) {

				var singleDone = false, batchDone = false;
				function checkDone(sWhich) {
					if (sWhich === "batch") {
						batchDone = true;
					}
					if (sWhich === "single") {
						singleDone = true;
					}

					if (batchDone && singleDone) {
						fnResolve();
					}
				}

				oModelBatch.read("/Products(1)", {
					success: checkDone.bind(this, "batch")
				});
				oModelSingle.read("/Products(1)", {
					success: checkDone.bind(this, "single")
				});
			});
		}


		readProduct().then(function() {
			assert.equal(oButton.getText(), "oh so very old", "Text correctly set from first response header");
			assert.equal(oButton2.getText(), "oh so very old ", "Text correctly set from first response header");

			return readProduct();
		}).then(function() {
			assert.equal(oButton.getText(), "oh so very old", "Text correctly set from second response header");
			assert.equal(oButton2.getText(), "oh so very old ", "Text correctly set from second response header");

			oModelSingle.destroy();
			oModelBatch.destroy();
			done();
		});

	});


	QUnit.test("Header normalization and lastModified in metadataLoaded-promise", function(assert) {
		var done = assert.async();
		assert.expect(5);

		var oModel = initModel(sURI, {
			json: false,
			useBatch: false
		});
		oModel.setUseBatch(false);

		function read(sPath) {
			return new Promise(function(fnResolve, fnReject) {
				oModel.read(sPath, {
					success: function(oData, oResponse) {
						fnResolve(oResponse.headers);
					},
					error: function(oError) {
						fnResolve(oError.headers);
					}
				});
			});
		}

		oModel.metadataLoaded().then(function(mData) {
			assert.equal(mData.lastModified, "Tue, 15 Nov 1994 12:45:26 GMT", "Metadata loaded promise contains lastModified property");

			return read("/SpecialHeaders");
		}).then(function(mHeaders) {
			assert.equal(mHeaders["Last-Modified"], "morgen frueh", "Standard header is normalized and contains correct value");
			assert.equal(mHeaders["X-CuStOm-HeAdEr"], "case-sensitive", "Special header is not normalized and contains correct value");

			return read("/SpecialHeadersError");
		}).then(function(mHeaders) {
			assert.equal(mHeaders["Last-Modified"], "morgen frueh", "Standard header is normalized and contains correct value");
			assert.equal(mHeaders["X-CuStOm-HeAdEr"], "case-sensitive", "Special header is not normalized and contains correct value");

			oModel.destroy();
			done();
		});

	});

	QUnit.test("ListBinding: Custom params", function(assert) {
		var done = assert.async();
		assert.expect(4);

		var oModel = initModel(sURI);
		oModel.metadataLoaded().then(function() {
			var spy = sinon.spy(oModel, "createCustomParams");
			oModel.createBindingContext("/Categories(1)", null, {custom: {"test":undefined}}, function() {
				assert.equal(spy.callCount, 1 , "custom Params created");
				assert.equal(spy.returnValues[0], "test" , "params created correctly");
				oModel.createBindingContext("/Categories(1)", null, {custom: {"hubel": "dubel","test":undefined}}, function() {
					assert.equal(spy.callCount, 2 , "custom Params created");
					assert.equal(spy.returnValues[1], "hubel=dubel&test" , "params created correctly");
					oModel.createCustomParams.restore();
					done();
				}, true);
			});
		});
	});

	QUnit.test("ListBinding: Custom params (null parameter)", function(assert) {
		var done = assert.async();
		assert.expect(4);

		var oModel = initModel(sURI);
		oModel.metadataLoaded().then(function() {
			var spy = sinon.spy(oModel, "createCustomParams");
			oModel.createBindingContext("/Categories(1)", null, {custom: {"test":undefined}}, function() {
				assert.equal(spy.callCount, 1 , "custom Params created");
				assert.equal(spy.returnValues[0], "test" , "params created correctly");
				oModel.createBindingContext("/Categories(1)", null, {custom: {"hubel": "dubel","test":null}}, function() {
					assert.equal(spy.callCount, 2 , "custom Params created");
					assert.equal(spy.returnValues[1], "hubel=dubel&test" , "params created correctly");
					oModel.createCustomParams.restore();
					done();
				}, true);
			});
		});
	});

	QUnit.test("ListBinding: Custom params ('empty' string parameter)", function(assert) {
		var done = assert.async();
		assert.expect(4);

		var oModel = initModel(sURI);
		oModel.metadataLoaded().then(function() {
			var spy = sinon.spy(oModel, "createCustomParams");
			oModel.createBindingContext("/Categories(1)", null, {custom: {"test":''}}, function() {
				assert.equal(spy.callCount, 1 , "custom Params created");
				assert.equal(spy.returnValues[0], "test=" , "params created correctly");
				oModel.createBindingContext("/Categories(1)", null, {custom: {"hubel": "dubel","test":''}}, function() {
					assert.equal(spy.callCount, 2 , "custom Params created");
					assert.equal(spy.returnValues[1], "hubel=dubel&test=" , "params created correctly");
					oModel.createCustomParams.restore();
					done();
				}, true);
			});
		});
	});

	QUnit.module("Model: Key normalization");

	QUnit.test("Normalize key", function(assert) {
		assert.equal(ODataUtils._normalizeKey("Entity(123M)"), "Entity(123m)", "Number types normalized, single key");
		assert.equal(ODataUtils._normalizeKey("Entity(a=123M,b=123F,c=123L,d=123D)"), "Entity(a=123m,b=123f,c=123l,d=123d)", "Number types normalized, mutiple keys");
		assert.equal(ODataUtils._normalizeKey("Entity(':/?')"), "Entity('%3A%2F%3F')", "String encoding normalized, single key");
		assert.equal(ODataUtils._normalizeKey("Entity(a=':/?',b='test',c=':/?',d='test')"), "Entity(a='%3A%2F%3F',b='test',c='%3A%2F%3F',d='test')", "String encoding normalized, multiple keys");
		assert.equal(ODataUtils._normalizeKey("Entity(a='test',b=123F,c=':::',e=123D)"), "Entity(a='test',b=123f,c='%3A%3A%3A',e=123d)", "Number types and strings normalized, mixed keys");
		assert.equal(ODataUtils._normalizeKey("Entity('Entity(a=123M,b=123F,c=123L,d=123D)')"), "Entity('Entity(a%3D123M%2Cb%3D123F%2Cc%3D123L%2Cd%3D123D)')", "Number inside string not normalized");
		assert.equal(ODataUtils._normalizeKey("Entity('%2FTEST%2FTEST')"), "Entity('%2FTEST%2FTEST')", "No double encoding");
		assert.equal(ODataUtils._normalizeKey("Entity('%2FTEST%2FTEST=123M')"), "Entity('%2FTEST%2FTEST%3D123M')", "No double encoding");
		assert.equal(ODataUtils._normalizeKey("Entity(%2FTEST%2FTEST=123M)"), "Entity(%2FTEST%2FTEST=123m)", "No double encoding");
		assert.equal(ODataUtils._normalizeKey("Entity(X'AFFE')"), "Entity(binary'AFFE')", "Binary normalized");
	});

	QUnit.test("Normalize key, model access", function(assert) {
		var done = assert.async();
		var oModel = initModel(sURI);
		oModel.read("/Current_Product_Lists", {
			success: function() {
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=1,ProductName='Chai')"), "Entity is returned");
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=3,ProductName='Aniseed%20Syrup')"), "Entity is returned");
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=61,ProductName='Sirop%20d''%C3%A9rable')"), "Entity is returned");
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=75,ProductName='Rh%C3%B6nbr%C3%A4u%20Klosterbier')"), "Entity is returned");

				assert.ok(oModel.getObject("/" + oModel.createKey("Current_Product_Lists", {ProductID: 75, ProductName: "Rhönbräu Klosterbier"})), "Entity is returned, createKey");
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=75,ProductName='" + encodeURIComponent("Rhönbräu Klosterbier") + "')"), "Entity is returned, custom encoding");
				assert.ok(oModel.getObject("/Current_Product_Lists(ProductID=75,ProductName='" + encodeURL("Rhönbräu Klosterbier") + "')"), "Entity is returned, custom encoding");

				assert.equal(oModel.getProperty("/Current_Product_Lists(ProductID=1,ProductName='Chai')/ProductName"), "Chai", "Property is returned");
				assert.equal(oModel.getProperty("/Current_Product_Lists(ProductID=3,ProductName='Aniseed%20Syrup')/ProductName"), "Aniseed Syrup", "Property is returned");
				assert.equal(oModel.getProperty("/Current_Product_Lists(ProductID=61,ProductName='Sirop%20d''%C3%A9rable')/ProductName"), "Sirop d'érable", "Property is returned");
				assert.equal(oModel.getProperty("/Current_Product_Lists(ProductID=75,ProductName='Rh%C3%B6nbr%C3%A4u%20Klosterbier')/ProductName"), "Rhönbräu Klosterbier", "Property is returned");
				done();
			}
		});
	});

	QUnit.module("Unsupported Filter Operators", {
		beforeEach: function() {
			var mOptions = {
				json : true,
				loadMetadataAsync: true,
				useBatch: false
			};
			this.oModel = initModel(sURI, mOptions);
		},
		afterEach: function() {
			this.oModel.destroy();
		},

		getErrorWithMessage: function(sFilter) {
			return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
		}
	});

	QUnit.module("Unsupported Filter Operators", {
		beforeEach: function() {
			this.oModel = new ClientModel();
		},

		getErrorWithMessage: function(sFilter) {
			return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
		}
	});

	QUnit.test("Empty Arguments", function(assert) {
		this.oModel.checkFilter();
		assert.ok(true, "No arguments lead to a positive result");

		this.oModel.checkFilter([]);
		assert.ok(true, "Empty array lead to a positive result");
	});

	QUnit.test("Simple Filters - Supported are OK", function(assert) {
		// comma separated syntax
		var oSupported = new Filter("x", FilterOperator.NE, "Foo");
		this.oModel.checkFilter(oSupported);
		assert.ok(true, "Valid operators are supported");

		// object syntax
		var oSupported2 = new Filter({
			path: "y",
			operator: FilterOperator.NE,
			value1: "FooBar"
		});
		this.oModel.checkFilter(oSupported2);
		assert.ok(true, "Valid operators are supported");

		// local fnTest - comma separated (should be ignored)
		var oSupported3 = new Filter("z", function() {});
		this.oModel.checkFilter(oSupported3);
		assert.ok(true, true, "local fnTest is ignored (comma separated syntax)");

		// local fnTest - object syntax (should be ignored)
		var oSupported4 = new Filter({
			path: "z",
			test: function() {}
		});
		this.oModel.checkFilter(oSupported4);
		assert.ok(true, "local fnTest is ignored (object syntax)");
	});

	QUnit.test("Simple Filters - Unsupported are not OK - Incorrect lambda operator", function(assert) {
		// Any
		var oUnsupported3 = new Filter({
			path: "x",
			operator: FilterOperator.Any,
			variable: "id1",
			condition: new Filter()
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oUnsupported3);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.Any),
			"Invalid operators are not supported (object syntax)"
		);

		// All
		var oUnsupported4 = new Filter({
			path: "y",
			operator: FilterOperator.All,
			variable: "id2",
			condition: new Filter()
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oUnsupported4);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators are not supported (object syntax)"
		);
	});

	QUnit.test("Simple Filters - Unsupported are not OK - Correct lambda operator", function(assert) {
		// Any
		var oUnsupported3 = new Filter({
			path: "x",
			operator: FilterOperator.Any,
			variable: "id3",
			condition: new Filter("snytax", FilterOperator.GT, 200)
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oUnsupported3);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.Any),
			"Invalid operators are not supported (object syntax)"
		);

		// All
		var oUnsupported4 = new Filter({
			path: "y",
			operator: FilterOperator.All,
			variable: "id4",
			condition: new Filter("snytax", FilterOperator.NE, 66)
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oUnsupported4);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators are not supported (object syntax)"
		);
	});

	QUnit.test("Multi Filters (Simple) - Supported are OK", function(assert) {
		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");

		// Comma separated syntax
		var oMultiFilter2 = new Filter([oFilter1, oFilter2], false);
		this.oModel.checkFilter(oMultiFilter2);
		assert.ok(true, "Valid operators in multi-filter are supported (comma separated syntax)");

		// Object Syntax
		var oMultiFilter = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});

		this.oModel.checkFilter(oMultiFilter);
		assert.ok(true, "Valid operators in multi-filter are supported (object syntax)");
	});

	QUnit.test("Multi Filters (Simple) - Unsupported are not OK - incorrect lambda operator", function(assert) {
		// All
		var oFilter1 = new Filter({path: "x", operator: FilterOperator.All, variable: "id1", condition: new Filter()});
		var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");

		// Object Syntax
		var oMultiFilter = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (object syntax)"
		);

		// Object Syntax
		oMultiFilter = new Filter({
			filters: [oFilter1, oFilter2],
			and: false
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (object syntax)"
		);

		// Comma separated syntax
		var oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter2);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (comma separated syntax)"
		);

		// any
		oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		oFilter2 = new Filter({path: "y", operator: FilterOperator.Any, variable: "id2", condition: new Filter()});

		// Comma separated syntax
		oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter2);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.Any),
			"Invalid operators in multi-filter are unsupported (comma separated syntax)"
		);
	});

	QUnit.test("Multi Filters (Simple) - Unsupported are not OK - correct lambda operator", function(assert) {
		// All
		var oFilter1 = new Filter({path: "x", operator: FilterOperator.All, variable: "id1", condition: new Filter("z", FilterOperator.EQ, 100)});
		var oFilter2 = new Filter("y", FilterOperator.GT, new Filter("z", FilterOperator.NE, 77));

		// Object Syntax
		var oMultiFilter = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (object syntax)"
		);

		// Object Syntax
		oMultiFilter = new Filter({
			filters: [oFilter1, oFilter2],
			and: false
		});
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (object syntax)"
		);

		// Comma separated syntax
		var oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter2);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported (comma separated syntax)"
		);

		// any
		oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		oFilter2 = new Filter({path: "y", operator: FilterOperator.Any, variable: "id3", condition: new Filter("z", FilterOperator.EQ, 110)});

		// Comma separated syntax
		oMultiFilter2 = new Filter([oFilter1, oFilter2], true);

		assert.throws(
			function() {
				this.oModel.checkFilter(oMultiFilter2);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.Any),
			"Invalid operators in multi-filter are unsupported (comma separated syntax)"
		);
	});

	QUnit.test("Multi Filters (Complex) - Supported are OK", function(assert) {
		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter([oMultiFilter2, oFilter4]);

		this.oModel.checkFilter(oMultiFilter3);
		assert.ok(true, "Valid operators in multi-filter are supported");
	});

	QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function(assert) {
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
				this.oModel.checkFilter(oMultiFilter3);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported"
		);
	});

	QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function(assert) {
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
				this.oModel.checkFilter(oMultiFilter3);
			}.bind(this),
			this.getErrorWithMessage(FilterOperator.All),
			"Invalid operators in multi-filter are unsupported"
		);
	});

	QUnit.module("ODataModel metadata/annotation caching", {
		beforeEach: function() {
			this.oModel = initModel(sURI);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("Check default: caching disabled", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(!this.oModel.oMetadata.bUseCache, "caching disabled");
				done();
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(!this.oModel.oAnnotations.bUseCache, "caching disabled");
			}.bind(this));
	});

	QUnit.test("Check default: caching enabled context-token", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {metadataUrlParams:{"sap-context-token": "test-token"}});
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(this.oModel.oMetadata.sCacheKey, "caching enabled");
				assert.equal(this.oModel.oMetadata.sCacheKey, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-context-token=test-token", "cacheKey set");
				done();
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(this.oModel.oAnnotations.sCacheKey, "caching not enabled");
				assert.equal(this.oModel.oAnnotations.sCacheKey, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-context-token=test-token#annotations", "cacheKey set");
			}.bind(this));
	});

	QUnit.test("Check default: caching disabled context-token + non cachable url", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {
			metadataUrlParams:{"sap-context-token": "test-token"},
			annotationURI: "someAnnotation.xml"
		});
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(!this.oModel.oMetadata.sCacheKey, "caching disabled");
				done();
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(!this.oModel.oAnnotations.sCacheKey, "caching disabled");
			}.bind(this));
	});

	QUnit.test("Check default: caching enabled context-token + cachable url", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {
			metadataUrlParams:{"sap-context-token": "test-token"},
			annotationURI: "/test/~201801171629~/someAnnotation.xml"
		});
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(this.oModel.oMetadata.sCacheKey, "caching enabled");
				assert.equal(this.oModel.oMetadata.sCacheKey, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-context-token=test-token", "cacheKey set");
				done();
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(this.oModel.oAnnotations.sCacheKey, "caching enabled");
				assert.equal(this.oModel.oAnnotations.sCacheKey, "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/$metadata?sap-context-token=test-token#annotations_/test/~201801171629~/someAnnotation.xml#annotations", "cacheKey set");
			}.bind(this));
	});

	QUnit.test("Check default: caching disabled context-token + cachable url", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {
			annotationURI: "/test/~201801171629~/someAnnotation.xml"
		});
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(!this.oModel.oMetadata.sCacheKey, "caching disabled");
				done();
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(!this.oModel.oAnnotations.sCacheKey, "caching disabled");
			}.bind(this));
	});

	QUnit.test("Annotation error: no cache", function(assert) {
		assert.expect(6);
		var done = assert.async();
		var oSpy = sinon.spy(jQuery, "ajax");
		this.oModel = initModel(sURI, {
			metadataUrlParams:{"sap-context-token": "test-token"},
			annotationURI: "/error/~201801171629~/someAnnotation.xml"
		});
		this.oModel.metadataLoaded()
			.then(function(oMetadata) {
				assert.ok(this.oModel.oMetadata.sCacheKey, "caching enabled");
				this.oModel2 = initModel(sURI, {
					metadataUrlParams:{"sap-context-token": "test-token"},
					annotationURI: "/error/~201801171629~/someAnnotation.xml"
				});
				this.oModel2.metadataLoaded()
					.then(function(oMetadata) {
						assert.ok(this.oModel2.oMetadata.sCacheKey, "caching enabled");
						oSpy.restore();
						done();
					}.bind(this));
				this.oModel2.annotationsLoaded()
					.then(function(oAnnotations) {
						assert.ok(this.oModel2.oAnnotations.sCacheKey, "caching enabled");
						assert.equal(oSpy.callCount, 2, "Annotation request triggered");
					}.bind(this));
			}.bind(this));
		this.oModel.annotationsLoaded()
			.then(function(oAnnotations) {
				assert.ok(this.oModel.oAnnotations.sCacheKey, "caching enabled");
				assert.equal(oSpy.callCount, 1, "Annotation request triggered");
		}.bind(this));
	});

	QUnit.module("sap-cancel-on-close header handling", {
		beforeEach: function() {
			this.spy = sinon.spy(OData.defaultHttpClient, "request");
		},
		afterEach: function() {
			this.spy.restore();
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("Default behavior - dynamic", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI);
		this.oModel.read("/Categories");
		this.oModel.attachRequestCompleted(function(oRequest) {
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");
			done();
		});
	});

	QUnit.test("Default behavior - dynamic - batch", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {useBatch: true});

		var firstRead = function(oRequest) {
			this.oModel.detachBatchRequestCompleted(firstRead);
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on batch request.");
			assert.equal(oRequest.getParameter("requests")[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");

			this.oModel.read("/Categories(1)");
			this.oModel.remove("/Categories(1)");
			this.oModel.attachBatchRequestCompleted(function(oRequest) {
				var aRequests = oRequest.getParameter("requests");
				assert.equal(oRequest.getParameter('headers')["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on batch request.");
				assert.equal(aRequests[0].headers["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on single request.");
				assert.equal(aRequests[1].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");
				done();
			});
		}.bind(this);

		this.oModel.attachMetadataLoaded(this, function() {
			assert.strictEqual(this.spy.getCalls()[1].args[0].method, "HEAD", "Security token request found.");
			assert.equal(this.spy.getCalls()[1].args[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on security token request.");
		}.bind(this));
		this.oModel.read("/Categories");
		this.oModel.attachBatchRequestCompleted(firstRead);
	});

	QUnit.test("Set to true via Model contructor parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {headers: {"sap-cancel-on-close": true}});
		this.oModel.refreshSecurityToken(function() {
			assert.strictEqual(this.spy.getCalls()[1].args[0].method, "HEAD", "Security token request found.");
			assert.equal(this.spy.getCalls()[1].args[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on security token request.");
		}.bind(this));
		this.oModel.read("/Categories");
		this.oModel.attachRequestCompleted(function(oRequest) {
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");
			done();
		});
	});


	QUnit.test("Set to false via Model contructor parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {headers: {"sap-cancel-on-close": false}});
		this.oModel.refreshSecurityToken(function() {
			assert.strictEqual(this.spy.getCalls()[1].args[0].method, "HEAD", "Security token request found.");
			assert.equal(this.spy.getCalls()[1].args[0].headers["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on security token request.");
		}.bind(this));
		this.oModel.read("/Categories");
		this.oModel.attachRequestCompleted(function(oRequest) {
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on single request.");
			done();
		});
	});

	QUnit.test("Set to true via setHeader API parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI);
		this.oModel.setHeaders({"sap-cancel-on-close": true});
		this.oModel.refreshSecurityToken(function() {
			assert.strictEqual(this.spy.getCalls()[1].args[0].method, "HEAD", "Security token request found.");
			assert.equal(this.spy.getCalls()[1].args[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on security token request.");
		}.bind(this));
		this.oModel.read("/Categories");
		this.oModel.attachRequestCompleted(function(oRequest) {
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");
			done();
		});
	});


	QUnit.test("Set to false via setHeader API parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI);
		this.oModel.setHeaders({"sap-cancel-on-close": false});
		this.oModel.refreshSecurityToken(function() {
			assert.strictEqual(this.spy.getCalls()[1].args[0].method, "HEAD", "Security token request found.");
			assert.equal(this.spy.getCalls()[1].args[0].headers["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on security token request.");
		}.bind(this));
		this.oModel.read("/Categories");
		this.oModel.attachRequestCompleted(function(oRequest) {
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on single request.");
			done();
		});
	});


	QUnit.test("Set to true via read API parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI);
		this.oModel.read("/Categories", {headers: {"sap-cancel-on-close": true}});
		this.oModel.attachRequestCompleted(function(oRequest) {
				assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on single request.");
				this.oModel.refreshSecurityToken(function() {
					assert.strictEqual(this.spy.getCalls()[2].args[0].method, "HEAD", "Security token request found.");
					assert.equal(this.spy.getCalls()[2].args[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on security token request.");
					done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Set to false via read API parameter", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI);
		this.oModel.read("/Categories", {headers: {"sap-cancel-on-close": false}});
		this.oModel.attachRequestCompleted(function(oRequest) {
				assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], false, "sap-cancel-on-close header was set correctly on single request.");
				this.oModel.refreshSecurityToken(function() {
					assert.strictEqual(this.spy.getCalls()[2].args[0].method, "HEAD", "Security token request found.");
					assert.equal(this.spy.getCalls()[2].args[0].headers["sap-cancel-on-close"], true, "sap-cancel-on-close header was set correctly on security token request.");
					done();
				}.bind(this));
			}.bind(this));
	});


	QUnit.test("Check setter priority", function(assert) {
		var done = assert.async();
		this.oModel = initModel(sURI, {headers: {"sap-cancel-on-close": true}});
		this.oModel.setHeaders({"sap-cancel-on-close": false});

		var fnFirstRead = function(oRequest) {
			this.oModel.detachRequestCompleted(fnFirstRead);
			assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], false, "Set header API overrides constructor parameter.");

			var fnSecondRead = function(oRequest) {
				this.oModel.detachRequestCompleted(fnSecondRead);
				assert.equal(oRequest.getParameter("headers")["sap-cancel-on-close"], true, "API parameter is of highest prio.");
				done();
			}.bind(this);

			this.oModel.attachRequestCompleted(fnSecondRead);

			this.oModel.read("/Categories", {headers: {"sap-cancel-on-close": true}});

		}.bind(this);

		this.oModel.attachRequestCompleted(fnFirstRead);
		this.oModel.read("/Categories");
	});

	QUnit.module("Persist transient Entities", {
		beforeEach: function() {
			this.oModel = initModel(sURI);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("test ODataModel contextBinding - initialize", function(assert) {
		var done = assert.async();
		assert.expect();
		this.oModel.metadataLoaded().then(function() {
			var oCreatedContext = this.oModel.createEntry("/Products");
			var oContextBinding = this.oModel.bindContext("Supplier", oCreatedContext);
			assert.ok(oContextBinding.bInitial, "Should be initial.");
			oContextBinding.initialize();
			assert.notOk(oContextBinding.bInitial, "Should NOT be initial anymore.");
			done();
		}.bind(this));
	});

	QUnit.test("test ODataModel contextBinding - createEntry and persist the new entry", function(assert) {
		var done = assert.async();
		assert.expect(5);
		this.oModel.metadataLoaded().then(function() {
			var oCreatedContext = this.oModel.createEntry("/Products", {
				urlParameters: {"create": "id_1000"}
			});
			var oContextBinding = this.oModel.bindContext("Supplier", oCreatedContext);
			var fnAttachChangeHandler = function(oEvent) {
				assert.equal(oEvent.oSource.oElementContext, null, "ElementContext should be null.");
				oContextBinding.detachChange(fnAttachChangeHandler);
			};
			oContextBinding.attachChange(fnAttachChangeHandler);
			oContextBinding.initialize();

			oContextBinding.attachChange(this, function(oEvent) {
				assert.notOk(oContextBinding.getContext().isUpdated());
				assert.strictEqual(oEvent.oSource, oContextBinding, "ContextBinding should be available.");
				assert.notEqual(oEvent.oSource.oElementContext, null, "ElementContext should be available.");
				assert.equal(oEvent.oSource.oElementContext.getPath(), "/Suppliers(1)", "Check path.");
				done();
			});

			this.oModel.submitChanges();
		}.bind(this));
	});

	QUnit.test("test ODataModel contextBinding - createEntry and persist the new entry with error", function(assert) {
		var done = assert.async();
		assert.expect(1);
		this.oModel.metadataLoaded().then(function() {
			var oCreatedContext = this.oModel.createEntry("/Products", {
				urlParameters: {"create": "id_error"}
			});
			var oContextBinding = this.oModel.bindContext("Supplier", oCreatedContext);
			var fnAttachChangeHandler = function(oEvent) {
				assert.strictEqual(oEvent.oSource.oElementContext, null, "ElementContext should be null.");
				oContextBinding.detachChange(fnAttachChangeHandler);

				// Attach another handler for a possible unwanted change event
				oContextBinding.attachChange(function() {
					assert.ok(false, "Another change event should not be fired.");
				});
			};

			oContextBinding.attachChange(fnAttachChangeHandler);
			oContextBinding.initialize();

			this.oModel.attachRequestFailed(function() {
				// Waiting for possible change events (checkUpdate)
				setTimeout(function() {
					done();
				}, 0);
			});

			this.oModel.submitChanges();
		}.bind(this));
	});

	QUnit.test("Result property in entity", function(assert) {
		var done = assert.async();
		assert.expect(2);
		this.oModel = new ODataModel(sURI, {metadataUrlParams: {"result-property":true}});
		this.oModel.metadataLoaded().then(function() {

			function fnSuccess() {
				var oCategory = this.oModel.getObject("/Categories(20)");
				assert.ok(oCategory.results, "result property exists");
				assert.strictEqual(oCategory.results, "test", "result property imported correctly");
				done();
			}
			this.oModel.read("/Categories(20)", {
				success: fnSuccess.bind(this)
			});
		}.bind(this));
	});

	QUnit.module("Preliminary Context", {
		beforeEach: function() {
			this.oModel = initModel(sURI);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("2 object bindings to the same entity: both preliminary", function(assert) {
		var done = assert.async();
		var iCount = 0;
		assert.expect(2);
		this.oModel = new ODataModel(sURI, {"preliminaryContext":true});

		var oInput = new Input({models: this.oModel, value:"{CategoryName}"});
		var oInput2 = new Input({models: this.oModel, value:"{CategoryName}"});

		this.oModel.metadataLoaded().then(function() {
			function fnChange() {
				//first run should be the preliminary context, second one should set the values
				if (iCount === 1) {
					assert.equal(oInput.getValue(), "Beverages", "Context propagated and value set correctly");
					assert.equal(oInput2.getValue(), "Beverages", "Context propagated and value set correctly");
					oInput.destroy();
					oInput2.destroy();
					done();
				}
				iCount++;
			}
			oInput.bindElement("/Categories(20)");
			oInput2.bindElement("/Categories(20)");
			oInput2.getElementBinding().attachChange(fnChange);
		});
	});

	QUnit.test("2 object bindings to the same entity: one preliminary", function(assert) {
		var done = assert.async();
		var iCount = 0;
		assert.expect(2);
		this.oModel = new ODataModel(sURI);

		var oInput = new Input({models: this.oModel, value:"{CategoryName}"});
		var oInput2 = new Input({models: this.oModel, value:"{CategoryName}"});

		this.oModel.metadataLoaded().then(function() {
			function fnChange() {
				//first run should be the preliminary context, second one should set the values
				if (iCount === 1) {
					assert.equal(oInput.getValue(), "Beverages", "Context propagated and value set correctly");
					assert.equal(oInput2.getValue(), "Beverages", "Context propagated and value set correctly");
					oInput.destroy();
					oInput2.destroy();
					done();
				}
				iCount++;
			}
			oInput.bindElement({
				path: "/Categories(20)",
				parameters: {
					createPreliminaryContext: false
				}
			});
			oInput2.bindElement({
				path: "/Categories(20)",
				parameters: {
					createPreliminaryContext: true
				}
			});
			oInput2.getElementBinding().attachChange(fnChange);
		});
	});
});