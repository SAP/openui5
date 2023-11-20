/*global OData, QUnit, sinon*/
sap.ui.define([
	"sap/base/Log",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/Context",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/List",
	"sap/m/DisplayListItem",
	"sap/ui/thirdparty/datajs" // only used via window.OData
], function(
	Log,
	fakeService,
	_ODataMetaModelUtils,
	ODataMetaModel,
	ODataModel,
	CountMode,
	Filter,
	FilterOperator,
	Sorter,
	Context,
	Label,
	Panel,
	List,
	ListItem
) {
	"use strict";

	//add divs for control tests
	var oTarget1 = document.createElement("div");
	oTarget1.id = "target1";
	document.body.appendChild(oTarget1);
	var oTarget2 = document.createElement("div");
	oTarget2.id = "target2";
	document.body.appendChild(oTarget2);

	// time to wait for server responses
	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sURI = "/proxy/http/" + sURI.replace("http://","");

	var oLabel = new Label("myLabel");
	var oPanel = new Panel();
	oPanel.addContent(oLabel);
	oPanel.placeAt("target1");

	function removeSharedServicedata(sURI){
		var sServiceURI = sURI.replace(/\/$/, "");
		if (ODataModel.mServiceData && ODataModel.mServiceData[sServiceURI]){
			delete ODataModel.mServiceData[sServiceURI];
		}
	}

	/**
	 * Removes all shared Metadata
	 */
	function cleanServiceDataCache() {
		ODataModel.mServiceData = {};
	}


	function initModel() {
		var sURI;
		if (typeof arguments[0] === 'string') {
			sURI = arguments[0];
		} else {
			sURI = arguments[0].serviceUrl;
		}

		removeSharedServicedata(sURI);

		// create arguments array with leading "null" value so that it can be passed to the apply function
		var aArgs = [null].concat(Array.prototype.slice.call(arguments, 0));

		// create factory function by calling "bind" with the provided arguments
		var Factory = ODataModel.bind.apply(ODataModel, aArgs);

		// the factory will create the model with the arguments above
		var oModel = new Factory();
		return oModel;
	}


	var bChanged = false, bDataRequested = false, bDataReceived = false;

	var fnChange = function(assert, oEvent) {
		bChanged = true;
		assert.ok(bDataRequested && !bDataReceived,"change fired");
	};

	var fnDataRequested = function(assert, oEvent) {
		bDataRequested = true;
		assert.ok(!bDataReceived && !bChanged,"dataRequested fired");
	};

	var fnDataReceived = function(assert, oEvent) {
		bDataReceived = true;
		assert.ok(bChanged && bDataRequested,"dataRecieved fired");
	};

	// assertion methods for the next 3 constructor tests
	function assertCommonArguments(assert, oModel) {
		assert.equal(oModel.sServiceUrl, sURI.substr(0, sURI.length - 1), 'serviceUrl');
		assert.equal(oModel.bJSON, true, 'json');
		assert.equal(oModel.sUser, 'user', 'user');
		assert.equal(oModel.sPassword, 'pa$$w0rd', 'password');
		assert.deepEqual(oModel.mCustomHeaders, { foo: 'bar' }, 'headers');
		assert.equal(oModel.bTokenHandling, false, 'tokenHandling');
		assert.equal(oModel.bWithCredentials, true, 'withCredentials');
		assert.equal(oModel.bLoadMetadataAsync, true, 'loadMetadataAsync');
	}
	function assertLegacyArguments(assert, oModel) {
		// expect default values as they can't be set with as legacy arguments
		assert.equal(oModel.bLoadAnnotationsJoined, true, 'loadAnnotationsJoined');
		assert.deepEqual(oModel.aUrlParams, [], 'serviceUrlParams');
		assert.equal(oModel.oServiceData.oMetadata.sUrl, sURI + '$metadata', 'metadataUrlParams');
		assert.equal(oModel.sDefaultCountMode, 'Both', 'defaultCountMode');
		assert.deepEqual(oModel.oServiceData.oMetadata.mNamespaces, {
			sap:"http://www.sap.com/Protocols/SAPData",
			m:"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
			"":"http://schemas.microsoft.com/ado/2007/06/edmx"
		}, 'metadataNamespaces');
	}
	function assertObjectArguments(assert, oModel) {
		// can only be set with parameters object => expect different values
		assert.equal(oModel.bLoadAnnotationsJoined, false, 'loadAnnotationsJoined');
		assert.deepEqual(oModel.aUrlParams, [ 'foo=bar' ], 'serviceUrlParams');
		assert.equal(oModel.oServiceData.oMetadata.sUrl, sURI + '$metadata?bar=foo', 'metadataUrlParams');
		assert.equal(oModel.sDefaultCountMode, 'None', 'defaultCountMode');
		assert.deepEqual(oModel.oServiceData.oMetadata.mNamespaces, { 'foo': 'bar' }, 'metadataNamespaces');
	}

	QUnit.test("constructor: legacy arguments", function(assert) {
		var oModel = initModel(
			sURI,           /* sServiceUrl */
			true,           /* bJSON */
			"user",         /* sUser */
			"pa$$w0rd",     /* sPassword */
			{ foo: "bar" }, /* mHeaders */
			false,          /* bTokenHandling */
			true,           /* bWithCredentials */
			true            /* bLoadMetadataAsync */
		);

		assertCommonArguments(assert, oModel);
		assertLegacyArguments(assert, oModel);

		oModel.destroy();
	});
	QUnit.test("constructor: parameters in 2nd argument", function(assert) {
		var oModel = initModel(sURI /* sServiceUrl */, {
			json: true,
			user: "user",
			password: "pa$$w0rd",
			headers: { foo: "bar" },
			tokenHandling: false,
			withCredentials: true,
			loadMetadataAsync: true,
			annotationURI: [ 'foo', 'bar' ],
			loadAnnotationsJoined: false,
			serviceUrlParams: { 'foo': 'bar' },
			metadataUrlParams: { 'bar': 'foo' },
			defaultCountMode: CountMode.None,
			metadataNamespaces: { 'foo': 'bar' }
		});

		assertCommonArguments(assert, oModel);
		assertObjectArguments(assert, oModel);

		oModel.destroy();
	});
	QUnit.test("constructor: parameters in 1st argument", function(assert) {
		var oModel = initModel({
			serviceUrl: sURI,
			json: true,
			user: "user",
			password: "pa$$w0rd",
			headers: { foo: "bar" },
			tokenHandling: false,
			withCredentials: true,
			loadMetadataAsync: true,
			annotationURI: [ 'foo', 'bar' ],
			loadAnnotationsJoined: false,
			serviceUrlParams: { 'foo': 'bar' },
			metadataUrlParams: { 'bar': 'foo' },
			defaultCountMode: CountMode.None,
			metadataNamespaces: { 'foo': 'bar' }
		});

		assertCommonArguments(assert, oModel);
		assertObjectArguments(assert, oModel);

		oModel.destroy();
	});

	QUnit.test("test oDataModel - oMetadata shared across models", function(assert){
		var done = assert.async();
		var mOptions = {
				json : true,
				loadMetadataAsync: true
			};
		var oModel = initModel(sURI, mOptions);
		var oModel2 = {};

		oModel.oMetadata.attachLoaded(function() {
			Log.debug("test 1 - metadata loaded is fired on metadata onload of model1");
		});

		oModel.attachMetadataLoaded(function(){
			assert.ok(oModel.getServiceMetadata() != null, "First model: Service metadata is available");
			oModel.destroy();
			oModel2 = new ODataModel(sURI, mOptions);

			var bFiredAtMetadata = false;

			new Promise(function(fnResolve, fnReject) {

				oModel2.oMetadata.attachLoaded(function() {
					Log.debug("test 2 - metadata loaded is fired on metadata");
					bFiredAtMetadata = true;
				});
				// attach again and wait for the metadataloaded event at the model itself,
				//fail if event is fired at the metadata object
				oModel2.attachMetadataLoaded(function() {
					Log.debug("metadata loaded is fired");
					assert.ok(oModel2.getServiceMetadata() != null, "Second model: Service metadata is available");
					if (!bFiredAtMetadata) {
						fnResolve();
					} else {
						fnReject();
					}
				});

			}).then(function(){
				assert.ok(true, 'Metadata loaded fired at model only');
			}, function(e){
				Log.debug("metadata promise failed");
				assert.ok(false, 'Metadata loaded fired at metadata object');
			}).finally(done);

		});
	});

	QUnit.test("test _isReloadNeeded() - __list check", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false),
			bReloadNeeded;

		oModel._loadData("Employees", null, function () {
			assert.equal(oModel.getProperty("/Employees(2)/FirstName"), "Andrew", "Fetching initial data from absolute path");

			//check if reload needed --> true
			bReloadNeeded = oModel._isReloadNeeded("/Employees(2)", oModel.getObject("/Employees(2)"), {expand: "Employees1/Employees1/Employees1"});
			assert.equal(bReloadNeeded, true, "First reload needed for 3 levels of expand");

			//create context for 3 levels of expand
			oModel.createBindingContext("/Employees(2)", null, {expand: "Employees1/Employees1/Employees1"}, function (oContext){
				//reload should not be needed anymore --> false
				bReloadNeeded = oModel._isReloadNeeded("/Employees(2)", oModel.getObject("/Employees(2)"), {expand: "Employees1/Employees1/Employees1"});
				assert.equal(bReloadNeeded, false, "Second reload should not be needed");

				done(); //resume normal testing
			});

		});
	});

	QUnit.test("test _isReloadNeeded() - __ref check", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false),
			bReloadNeeded;

		//Test another case with internal __ref properties instead of __list
		oModel._loadData("Products", null, function () {
			assert.equal(oModel.getProperty("/Products(1)/ProductName"), "Chai", "fetching initial data from absolute path.");

			//check if reload needed --> true
			bReloadNeeded = oModel._isReloadNeeded("/Products(1)", oModel.getObject("/Products(1)"), {expand: "Category/Products/Supplier"});
			assert.equal(bReloadNeeded, true, "First reload needed for 3 levels of expand");

			oModel.createBindingContext("/Products(1)", null, {expand: "Category/Products/Supplier"}, function (oContext){
				//reload should not be needed anymore --> false
				bReloadNeeded = oModel._isReloadNeeded("/Products(1)", oModel.getObject("/Products(1)"), {expand: "Category/Products/Supplier"});
				assert.equal(bReloadNeeded, false, "Second reload should not be needed");

				done(); //resume normal testing
			});

		});

	});

	QUnit.test("test oDataModel _loadData XML",function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false);
		oModel._loadData("Categories", null, function(){
			performTest(assert, oModel);
			done();
		});
	});

	QUnit.test("test oDataModel _loadData JSON",function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true);
		oModel._loadData("Categories", {horst:true}, function(){
			performTest(assert, oModel);
			done();
		});
	});

	function performTest(assert, oModel){
		assert.equal(oModel.getProperty("/Categories(1)/CategoryName"), "Beverages", "absolute path without context");
		oModel.createBindingContext("/Categories(1)", null, function(newContext){
			assert.equal(newContext.getProperty("CategoryName"), "Beverages", "relative path with context");
			var iLength = 0;
			var categories = oModel.getProperty("/");
			for (var category in categories){
				iLength++;
				assert.equal(categories[category].CategoryID, iLength);
			}
			assert.equal(iLength, 8);
		});
	}

	QUnit.test("test bindList", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories");
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test bindList inlinecount", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "Inline" });
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test bindList no count", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {countMode: "None" });
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "CategoryName available");
			assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "Description available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "CategoryID available");
			assert.equal(oBinding.getLength(), 8, "Eigth categories available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" });
		var handler = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with create binding context", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" });
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");

			oModel.createBindingContext("/Categories(1)", null, function(oContext){
				// rest data should be there now
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").Description, "Soft drinks, coffees, teas, beers, and ales", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});

			oBinding.detachChange(handler1);

		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select with create binding context select", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true, "Categories");
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" });
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
			assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").CategoryID, undefined, "other property not available");
			assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");

			oModel.createBindingContext("/Categories(1)", null, {select : "CategoryID" }, function(oContext){
				// rest select data should be there now
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").Description, undefined, "other property not available");
				assert.equal(oModel.getProperty("/Categories(1)").Picture, undefined, "other property not available");
				done();          // resume normal testing
			});

			oBinding.detachChange(handler1);

		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test expand", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, true, "Products");
		sap.ui.getCore().setModel(oModel);

		var oFilter = new Filter("ProductName", "EQ", "Chai");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {expand : "Category" });
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(1)").ProductName, "Chai", "test property");
			assert.equal(oModel.getProperty("/Products(1)/Category").CategoryName, "Beverages", "test expand property");
			oBinding.detachChange(handler1);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test expand with create binding context", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, true, "Products");
		sap.ui.getCore().setModel(oModel);

		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter]);
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category"), undefined, "test expand property not there");

			oModel.createBindingContext("/Products(2)", null, {expand : "Category" }, function(oContext){
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});
			oBinding.detachChange(handler1);
		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test select expand with create binding context", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, true, "Products");
		sap.ui.getCore().setModel(oModel);

		var oFilter = new Filter("ProductName", "EQ", "Chang");
		var oBinding = oModel.bindList("/Products", null, null, [oFilter], {select : "Category,ProductName", expand : "Category" });
		var handler1 = function() { // delay the following test
			assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
			assert.equal(oModel.getProperty("/Products(2)").ProductID, undefined, "test property");
			assert.equal(oModel.getProperty("/Products(2)/Category").CategoryName, "Beverages", "test expand property");

			oModel.createBindingContext("/Products(2)", null, {select : "Category, ProductID", expand : "Category" }, function(oContext){
				// rest expand data should be there now
				assert.equal(oModel.getProperty("/Products(2)").ProductName, "Chang", "test property");
				assert.equal(oModel.getProperty("/Products(2)").ProductID, 2, "test property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryName, "Beverages", "test select property");
				assert.equal(oModel.getProperty("/Categories(1)").CategoryID, 1, "test select property");
				done();          // resume normal testing
			});
			oBinding.detachChange(handler1);

		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("test getProperty on label", function(assert){
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oModel._loadData("Categories", null, function(){
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "text value from model");
			oLabel.unbindProperty("text");
			done();
		});
	});

	QUnit.test("test double load update", function(assert){
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oModel._loadData("Categories", null, function(){
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "new text value from model");
			oLabel.unbindProperty("text");
			oModel._loadData("Regions", null, function(){
				assert.equal(oLabel.getText(),"", "default value");
				oLabel.bindProperty("text", "/Regions(2)/RegionID");
				assert.equal(oLabel.getText(), "2", "2nd new text value from model");
				oLabel.unbindProperty("text");
				done();
			});
		});
	});

	QUnit.test("test remove data", function(assert){
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oModel._loadData("Categories", null, function(){
			assert.equal(oLabel.getText(),"testText", "old text value");
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "Condiments", "text value from model");
			oModel.removeData();
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			assert.equal(oLabel.getText(), "", "text value from model");
			oLabel.unbindProperty("text");
			done();
		});
	});

	QUnit.test("test create binding context", function(assert){
		var done = assert.async();
		oLabel.setText("testText");
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oModel._loadData("Categories", null, function(){
			oLabel.bindProperty("text", "/Categories(2)/CategoryName");
			oModel.createBindingContext("/Categories(2)", null, function(oContext){
				assert.equal(oContext.getPath(), "/Categories(2)","new Context");
				oModel.createBindingContext("", oContext, function(oContext2){
					assert.equal(oContext2.getPath(), "/Categories(2)","new Context");
					oModel.createBindingContext("/Products(2)", null, function(oContext3){
						assert.equal(oContext3.getPath(), "/Products(2)","new Context");
						done();
					});
				});
			});
		});
	});

	QUnit.test("test bindElement", function(assert){
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
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

	QUnit.test("test bindElement 2", function(assert){
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
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

	QUnit.test("test bindElement - set ParentContext null", function(assert){
		assert.expect(5);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
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

	QUnit.test("test bindElement 3", function(assert){
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oLabel.bindElement("Category");
		var oTestContext = oModel.getContext("/Products(2)");
		oLabel.setBindingContext(oTestContext);
		assert.ok(oLabel.getBindingContext() == null, "Context should be null until the data from bindElement is loaded");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.unbindElement();
			oLabel.setBindingContext();
			done();
		};
		oLabel.getElementBinding().attachChange(fnHandler);
	});

	QUnit.test("test bindElement 4", function(assert){
		assert.expect(2);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oLabel.bindElement("/Categories(2)");
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
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

	QUnit.test("test bindElement 5 - change parentContext", function(assert){
		assert.expect(3);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oLabel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.getElementBinding().attachChange(fnHandler2);
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

	QUnit.test("test bindElement 6 - change parentContext with propagation", function(assert){
		assert.expect(3);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		var oTestContext = oModel.getContext("/Products(2)");
		oPanel.setBindingContext(oTestContext);
		oLabel.bindElement("Category");
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
		var fnHandler = function() {
			assert.equal(oLabel.getBindingContext().getPath(), "/Categories(2)", "context must be set in change handler");
			oLabel.getElementBinding().detachChange(fnHandler);
			oLabel.getElementBinding().attachChange(fnHandler2);
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

	QUnit.test("test data events for bindElement", function(assert){
		assert.expect(3);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		var fnRequestedHandler = function() {
			assert.equal(true, true, "Data requested event was fired");
		};
		var fnRecievedHandler = function() {
			assert.equal(true, true, "Data received event was fired");
			oLabel.unbindElement();
			done();
		};
		oLabel.bindElement({
			path: "/Categories(2)",
			events: {
				dataRequested: fnRequestedHandler,
				dataReceived: fnRecievedHandler
			}
		});
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
	});

	QUnit.test("test data events for bindElement 204", function(assert){
		assert.expect(3);
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		var oTestContext = oModel.getContext("/Test");
		oLabel.setBindingContext(oTestContext);
		var fnRequestedHandler = function() {
			assert.equal(true, true, "Data requested event was fired");
		};
		var fnRecievedHandler = function() {
			assert.equal(true, true, "Data received event was fired");
			oLabel.unbindElement();
			done();
		};
		oLabel.bindElement({
			path: "/Employees(2)/Employee1",
			events: {
				dataRequested: fnRequestedHandler,
				dataReceived: fnRecievedHandler
			}
		});
		assert.ok(oLabel.getBindingContext() == oTestContext, "bindElement must not reset context");
	});

	var oLB = new List("myLb");
	var oItemTemplate = new ListItem();
	oLB.placeAt("target2");

	QUnit.test("test model bindAggregation on Listbox", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		sap.ui.getCore().setModel(oModel);
		oItemTemplate.bindProperty("label", "CategoryName").bindProperty("value", "Description");
		var oBinding = oLB.bindAggregation("items", "/Categories", oItemTemplate).getBinding('items');

		var handler = function() {
			var listItems = oLB.getItems();
			assert.equal(listItems.length, 8, "length of items");
			assert.equal(listItems[0].getLabel(), "Beverages", "category 1 name");
			assert.equal(listItems[7].getValue(), "Seaweed and fish", "category 8 description");
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
	});

	QUnit.test("test model bindAggregation on Listbox events", function(assert){
		assert.expect(1);
		var done = assert.async();

		oItemTemplate.bindProperty("label", "CategoryName").bindProperty("value", "Description");
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

	QUnit.test("PropertyBinding getValue", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		oModel._loadData("Categories", null, function(){
			var oBinding = oModel.bindProperty("/Categories(2)/CategoryName");
			assert.equal(oBinding.getValue(), "Condiments", "text value from model");
			done();
		});
	});

	QUnit.test("createBindingContext expand", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oContext.getPath(), "/Products(1)", "Context path");
			assert.ok(oContext.getProperty("Category"), "Category loaded");
			done();          // resume normal testing
		});
	});

	QUnit.test("test Context.getPath/getObject", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oContext.getPath("Category"), "/Products(1)/Category", "Expanded entity path");
			assert.equal(oContext.getObject("Category").CategoryID, 1, "Expanded entity object");
			done();          // resume normal testing
		});
	});

	QUnit.test("test getKey", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		oModel.createBindingContext("/Products(1)", null, {expand: "Category"}, function(oContext) { // delay the following test
			assert.equal(oModel.getKey(oContext), "Products(1)", "Context key");
			assert.equal(oModel.getKey(oContext.getObject("Category")), "Categories(1)", "Expanded entity key");
			assert.equal(oModel.getKey(oContext), "Products(1)", "Context key");
			done();          // resume normal testing
		});
	});

	QUnit.test("test getKey decoded", function(assert){

		var oModel = initModel(sURI, false, "Categories"),
			oObject = {
			__metadata: {
				uri: "http://some.host/service/Customers('%2F%3F''%2B')"
			}
		};
		assert.equal(oModel.getKey(oObject), "Customers('%2F%3F''%2B')", "Get customers key encoded");
		assert.equal(oModel.getKey(oObject, true), "Customers('/?''+')", "Get customers key decoded");
	});

	QUnit.test("test createKey", function(assert){

		var oModel = initModel(sURI, false, "Categories");
		assert.equal(oModel.createKey("Products", {ProductID: 1}), "Products(1)", "Created product key");
		assert.equal(oModel.createKey("Order_Details", {OrderID: 1, ProductID :2}), "Order_Details(OrderID=1,ProductID=2)", "Created key with multiple key properties");
		assert.equal(oModel.createKey("Customers", {CustomerID: "/?'+"}), "Customers('%2F%3F''%2B')", "Created customers key encoded");
		assert.equal(oModel.createKey("Customers", {CustomerID: "/?'+"}, true), "Customers('/?''+')", "Created customers key decoded");
	});

	QUnit.test("metadata check", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
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
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get entity type check", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
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
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get entity type check with context", function(assert){
		var done = assert.async();

		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("Products", new Context(oModel, "/Categories(7)"));
		var handler = function() { // delay the following test
			var oResult = oBinding.oEntityType;
			assert.equal(oResult.name, "Product", "entity type name check");
			oResult = {};
			oBinding.detachChange(handler);
			done();          // resume normal testing
		};
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("metadata get property metadata", function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, false, "Categories");
		var oBinding = oModel.bindList("/Categories");
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
		oBinding.attachChange(handler);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		oBinding.getContexts();
	});

	QUnit.test("Custom Header test", function(assert){
		var oModel = initModel(sURI, true);
		oModel.setHeaders({"myCustomHeader1" : "value1", "myCustomHeader2" : "4.555"});

		var spy = sinon.spy(OData.defaultHttpClient, "request");
		oModel.read("/Categories", null, null, false); // sync call

		assert.equal(spy.callCount, 1, "spy read count");
		assert.ok(spy.calledOnce, "spy called once");
		assert.equal(spy.args[0][0].headers['myCustomHeader1'], "value1", "spy check custom header");
		assert.equal(spy.args[0][0].headers['myCustomHeader2'], "4.555", "spy check custom header");

		// override headers
		oModel.setHeaders({"myCustomHeader1" : "666", "TesT": "new Header", "MyCustomHeader2" : "blubb"});
		oModel.read("/Categories", null, null, false); // sync call

		assert.equal(spy.callCount, 2, "spy read count");
		assert.equal(spy.args[1][0].headers['myCustomHeader1'], "666", "spy check custom header");
		assert.equal(spy.args[1][0].headers['MyCustomHeader2'], "blubb", "spy check custom header");
		assert.equal(spy.args[1][0].headers['TesT'], "new Header", "spy check custom header");

		var aHeaders = oModel.getHeaders();
		assert.equal(aHeaders['myCustomHeader1'], "666", "model check custom header");
		assert.equal(aHeaders['MyCustomHeader2'], "blubb", "model check custom header");
		assert.equal(aHeaders['TesT'], "new Header", "model check custom header");

	});

	QUnit.test("async metadata request check", function(assert){
		var done = assert.async();
		removeSharedServicedata(sURI);
		var oModel = new ODataModel(sURI, {
			json: true,
			loadMetadataAsync: true
		});

		var handler = function() {
			assert.ok(true, "Metadata callback handler called");
			oModel.detachMetadataLoaded(handler);
			assert.ok(oModel.getServiceMetadata(), "get metadata check");
			done();
		};
		oModel.attachMetadataLoaded(handler);
	});


	QUnit.test("async metadata request check with bindings", function(assert){
		var done = assert.async();
		cleanServiceDataCache();
		var oModel = new ODataModel(sURI, {
			json: true,
			loadMetadataAsync: true
		});


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
			oBinding.attachChange(handler2);
			oBinding.attachRefresh(handler2);
		};
		oModel.attachMetadataLoaded(handler);

	});

	QUnit.test("async metadata request check with bindings die zwote", function(assert){
		var done = assert.async();
		cleanServiceDataCache();
		var oModel = new ODataModel(sURI, {
			json: true,
			loadMetadataAsync: true
		});

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

	QUnit.test("async test createEntity", function(assert){
		var done = assert.async();

		cleanServiceDataCache();

		var oModel = new ODataModel(sURI, {
			json: true,
			loadMetadataAsync: true
		});

		var oBinding = oModel.bindList("/Categories");
		var handler = function() { // delay the following test
			var oContext = oModel.createEntry("Categories",{CategoryID:99,CategoryName:"Food",Description:"Food Desc"});
			assert.ok(oContext, "context check");
			var oEntry = oModel.getProperty("", oContext);
			assert.ok(oEntry, "entry check");

			assert.equal(oEntry.CategoryName, "Food", "category name check");
			assert.equal(oEntry.CategoryID, 99, "category ID check");
			assert.equal(oEntry.Description, "Food Desc", "category ID check");
			assert.ok(oEntry._bCreate, "check create flag");

			assert.ok(oModel.oRequestQueue[oContext.getPath().substr(1)], "queue check");
			assert.ok(oModel.mContexts[oContext.getPath()], "context check");
			assert.equal(oModel.oData[oContext.getPath().substr(1)].CategoryName, "Food", "data check");
			oModel.deleteCreatedEntry(oContext);
			assert.equal(oModel.oRequestQueue[oContext.getPath().substr(1)], undefined, "queue check");
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
			assert.ok(oEntry._bCreate, "check create flag");

			done();
		};
		oBinding.attachChange(handler);
		oBinding.attachRefresh(handler);
	});

	QUnit.test("Event order: bindElement", function(assert){
		var done = assert.async();
		assert.expect(4);
		var oModel = initModel(sURI, true, "Categories");
		oLabel = new Label("myLabel2");
		oLabel.setModel(oModel);
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived: fnDataReceived.bind(null, assert)}});
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

	QUnit.test("Event order: bindElement (setModel after binding)", function(assert){
		var done = assert.async();
		assert.expect(4);
		var oModel = initModel(sURI, true, "Categories");
		oLabel = new Label("myLabel3");
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived:fnDataReceived.bind(null, assert)}});
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

	QUnit.test("Event order: bindElement (already bound)", function(assert){
		var done = assert.async();
		assert.expect(6);
		cleanServiceDataCache();
		var oModel1 = initModel(sURI, true, "Categories");
		oLabel = new Label("myLabel4");
		oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived:fnDataReceived.bind(null, assert)}});
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
			oLabel.bindElement( {path:"/Categories(1)", events:{change:fnChange2, dataRequested:fnDataRequested, dataReceived:fnDataReceived}});
		};
		oLabel.setModel(oModel1);
		oLabel.getElementBinding().attachDataReceived(handler);
	});

	QUnit.test("test ODataModel destroy cancel async metadata", function(assert){
		cleanServiceDataCache();
		// spy on odata request function
		var spy = sinon.spy(OData, "request");
		removeSharedServicedata(sURI);
		var oModel = new ODataModel(sURI, { json: true, loadMetadataAsync: true });
		oModel.attachMetadataLoaded(this, function(oEvent) {
			assert.ok(false, "Metadata should not be loaded");
		});
		sap.ui.getCore().setModel(oModel);

		oModel.destroy();
		assert.ok(oModel.bDestroyed, "Model should be destroyed");

		assert.equal(spy.callCount, 1, "number of requests");
		assert.ok(spy.getCall(0).returnValue.bSuppressErrorHandlerCall, "should be true");
		spy.restore();
	});

	QUnit.test("test ODataModel destroy cancel load data", function(assert){
		var oModel = initModel(sURI, true, "Categories");
		//var oModel = new ODataModel(sURI, { json: true, loadMetadataAsync: false });
		sap.ui.getCore().setModel(oModel);

		var oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" });
		var handler1 = function() { // delay the following test
			assert.ok(false, "Data should not be loaded");
			oBinding.detachChange(handler1);
		};
		oBinding.attachChange(handler1);
		// fire first loading...getContexts might be empty the first time...then when data is loaded the handler will be called
		// spy on odata request function
		var spy = sinon.spy(OData, "request");
		oBinding.getContexts();

		oModel.destroy();
		assert.ok(oModel.bDestroyed, "Model should be destroyed");

		assert.equal(spy.callCount, 1, "number of requests");
		assert.ok(spy.getCall(0).returnValue.bSuppressErrorHandlerCall, "should be true");

		// fire new request
		oBinding = oModel.bindList("/Categories", null, null, null, {select : "CategoryName" });
		oBinding.getContexts();
		assert.equal(spy.callCount, 1, "number of requests");
		assert.ok(spy.getCall(0).returnValue.bSuppressErrorHandlerCall, "should be true");
		oBinding.detachChange(handler1);
		spy.restore();
	});

	QUnit.module("ODataModel.read", {
		beforeEach: function() {
			this.oModel = initModel(sURI, true);
		},
		afterEach: function() {
			this.oModel.destroy();
			delete this.oModel;
		}
	});

	QUnit.test("old syntax", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", null, null, true, function(oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "Categories", "request uri does not have parameters");
			done();
		}, function() {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("old syntax with url parameters (string)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", null, "$skip=0&$top=8", true, function(oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=8", "request uri contains custom parameters");
			done();
		}, function() {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("old syntax with url parameters (array)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", null, [ "$skip=0", "$top=8" ], true, function(oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=8", "request uri contains custom parameters");
			done();
		}, function() {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("old syntax with url parameters (object)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", null, { "horst": true }, true, function(oData, oResponse) {
			assert.ok(true, "success handler called");
			assert.equal(oResponse.requestUri, sURI + "Categories?horst=true", "request uri contains custom parameters");
			done();
		}, function() {
			assert.ok(false, "error handler shouldn't be called");
			done();
		});
	});

	QUnit.test("new syntax url parameters (string)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", {
			urlParameters: "$skip=0&$top=8",
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=8", "request uri contains custom parameters");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("new syntax url parameters (array)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", {
			urlParameters: [ "$skip=0", "$top=8" ],
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?$skip=0&$top=8", "request uri contains custom parameters");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("new syntax url parameters (object)", function(assert) {
		var done = assert.async();
		this.oModel.read("/Categories", {
			urlParameters: { "horst": true },
			success: function(oData, oResponse) {
				assert.ok(true, "success handler called");
				assert.equal(oResponse.requestUri, sURI + "Categories?horst=true", "request uri contains custom parameters");
				done();
			},
			error: function() {
				assert.ok(false, "error handler shouldn't be called");
				done();
			}
		});
	});

	QUnit.test("new syntax with sorter and url parameters", function(assert) {
		var done = assert.async();
		var aSorters = [
			"should be ignored",
			new Sorter("CategoryName", true),
			{ foo: "bar" },
			false
		];

		this.oModel.read("/Categories", {
			urlParameters: "$skip=0&$top=8",
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
		var aFilters = [
			new Filter("CategoryName", FilterOperator.EQ, "Beverages")
		];

		this.oModel.read("/Categories", {
			urlParameters: "$skip=0&$top=1",
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

	QUnit.test("test metadata loading: sap-value-list",function(assert){
		var done = assert.async();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.oMetadata.loaded().then(function(){
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations(), "annotations not loaded");
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
	QUnit.test("test metadata loading: sap-value-list",function(assert){
		var done = assert.async();
		cleanServiceDataCache();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.oMetadata.loaded().then(function(){
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations(), "annotations not loaded");
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

	QUnit.test("test metadata loading (relative metadataUrl): sap-value-list",function(assert){
		var done = assert.async();
		cleanServiceDataCache();
		var oModel = initModel(sURI, {skipMetadataAnnotationParsing: true, useBatch : true, metadataUrlParams: {"sap-value-list": "none"}});
		oModel.oMetadata.loaded().then(function(){
			assert.ok(oModel.getServiceMetadata(), "metadata loaded");
			assert.ok(!oModel.getServiceAnnotations(), "annotations not loaded");
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

	QUnit.module("CSRF Token handling", {
		beforeEach: function() {
			this.oModel = initModel(sURI, true);
			fakeService.updateCsrfToken();
		},
		afterEach: function() {
			this.oModel.destroy();
			cleanServiceDataCache();
			fakeService.deleteCsrfToken();
		}
	});

	QUnit.test("No token request for GET requests", function(assert) {
		var done = assert.async();
		this.oModel.oMetadata.loaded().then(function() {
			var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
			this.oModel.read("/Categories(1)", {
				success: function() {
					assert.ok(!refreshSpy.called, "No security token needed for GET requests");
					done();
				}
			});
		}.bind(this));
	});

	QUnit.test("Token request for GET request inside batch", function(assert) {
		var done = assert.async();
		this.oModel.setUseBatch(true);
		this.oModel.oMetadata.loaded().then(function() {
			var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
			this.oModel.read("/Categories(1)", {
				success: function() {
					assert.ok(refreshSpy.calledOnce, "Token requested for GET inside batch");
					done();
				}
			});
		}.bind(this));
	});

[false, true].forEach(function (bUseBatch) {
	var sTitle = "_loadData: No x-csrf-token in GET requests, bUseBatch=" + bUseBatch;

	QUnit.test(sTitle, function(assert) {
		var done = assert.async();

		this.oModel.setUseBatch(bUseBatch);
		this.oModel.oMetadata.loaded().then(function() {
			var oRequestSpy = sinon.spy(OData, "request");

			this.oModel.refreshSecurityToken();
			this.oModel._loadData("/Categories", {},
				function /*fnSuccess*/ () {
					var oRequest = bUseBatch
							? oRequestSpy.args[1][0].data.__batchRequests[0]
							: oRequestSpy.args[1][0];

					assert.ok(oRequestSpy.calledTwice); // token request and GET/$batch
					assert.strictEqual(oRequest.method, "GET");
					assert.strictEqual(oRequest.requestUri, bUseBatch
						? "Categories"
						: "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories");
					assert.strictEqual(oRequest.headers["x-csrf-token"], undefined);
					oRequestSpy.restore();
					done();
				}
			);
		}.bind(this));
	});
});

[false, true].forEach(function (bUseBatch) {
	var sTitle = "_loadData: x-csrf-token in GET requests if token handling is disabled, bUseBatch="
			+ bUseBatch;

	QUnit.test(sTitle, function(assert) {
		var done = assert.async();

		this.oModel.setUseBatch(bUseBatch);
		this.oModel.setTokenHandlingEnabled(false);
		fakeService.setCsrfToken("foo");
		this.oModel.setHeaders({"x-csrf-token" : "foo"});
		this.oModel.oMetadata.loaded().then(function() {
			var oRequestSpy = sinon.spy(OData, "request");

			this.oModel._loadData("/Categories", {},
				function /*fnSuccess*/ () {
					var oRequest = bUseBatch
							? oRequestSpy.args[0][0].data.__batchRequests[0]
							: oRequestSpy.args[0][0];

					assert.ok(oRequestSpy.calledOnce); // only GET/$batch request
					assert.strictEqual(oRequest.method, "GET");
					assert.strictEqual(oRequest.requestUri, bUseBatch
						? "Categories"
						: "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories");
					assert.strictEqual(oRequest.headers["x-csrf-token"], "foo");
					oRequestSpy.restore();
					done();
				}
			);
		}.bind(this));
	});
});

	QUnit.test("Token request for POST requests", function(assert) {
		var done = assert.async();
		this.oModel.oMetadata.loaded().then(function() {
			var refreshSpy = sinon.spy(this.oModel, "refreshSecurityToken");
			this.oModel.create("/Categories(1)", {}, {
				success: function() {
					assert.ok(refreshSpy.calledOnce, "Token requested for POST request");
					this.oModel.create("/Categories(1)", {}, {
						success: function() {
							assert.ok(refreshSpy.calledOnce, "No additional token request");
							done();
						}
					});
				}.bind(this)
			});
		}.bind(this));
	});

	QUnit.test("Token request, automatic resubmit", function(assert) {
		var done = assert.async();
		this.oModel.oMetadata.loaded().then(function() {
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
							done();
						}
					});
				}.bind(this)
			});
		}.bind(this));
	});

	QUnit.module("Metamodel binding", {
		beforeEach: function() {
			this.oModel = initModel(sURI, false);
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
			oPropertyBinding.attachChange(function(){});
			oPropertyBinding.initialize();
			oListBinding = this.oModel.bindList("Products", oContext);
			oListBinding.attachChange(function(){});
			oListBinding.initialize();

			// createBindingContext callback is executed before checkUpdate, so wait for RequestCompleted
			this.oModel.attachRequestCompleted(function() {
				propertySpy = sinon.spy(oPropertyBinding, "checkUpdate");
				listSpy = sinon.spy(oListBinding, "checkUpdate");

				oMetaBindingRelative = this.oModel.bindProperty("##name", oContext);
				oMetaBindingRelative.attachChange(function(){});
				oMetaBindingRelative.initialize();
				metaRelativeSpy = sinon.spy(oMetaBindingRelative, "checkUpdate");

				oMetaBindingAbsolute = this.oModel.bindProperty("/Categories(7)/##name");
				oMetaBindingAbsolute.attachChange(function(){});
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

	//*********************************************************************************************
	QUnit.test("getMetaModel: new meta model - successfully loaded", function (assert) {
		var oData = {foo : 'bar'},
			oMetaModel,
			oModel = {
				oAnnotations : undefined,
				oMetadata : {
					getServiceMetadata : function () {},
					isLoaded : function () {}
				},
				oMetaModel : undefined,
				bMetaModelLoaded : "~bMetaModelLoaded",
				annotationsLoaded : function () {},
				checkUpdate : function () {}
			};

		// called in ODataMetaModel constructor
		this.mock(oModel).expects("annotationsLoaded").withExactArgs().returns(Promise.resolve());
		// called in ODataMetaModel constructor; result is used to create a JSONModel
		this.mock(oModel.oMetadata).expects("getServiceMetadata").withExactArgs().returns(oData);

		// code under test
		oMetaModel = ODataModel.prototype.getMetaModel.call(oModel);

		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oModel.oMetaModel, oMetaModel);
		assert.strictEqual(oModel.bMetaModelLoaded, "~bMetaModelLoaded",
			"bMetaModelLoaded is unchanged until the meta model is loaded");

		// called in ODataMetaModel constructor
		this.mock(_ODataMetaModelUtils).expects("merge")
			.withExactArgs({}, oData, sinon.match.same(oMetaModel), undefined);

		this.mock(oModel).expects("checkUpdate").withExactArgs(false, false, null, true)
			.callsFake(function () {
				assert.strictEqual(oModel.bMetaModelLoaded, true,
					"checkUpdate called after the meta model is loaded");
			});

		return oMetaModel.loaded().then(function () {
			assert.strictEqual(oModel.bMetaModelLoaded, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaModel: meta model already available", function (assert) {
		var oModel = {oMetaModel : "~oMetaModel"};

		// code under test
		assert.strictEqual(ODataModel.prototype.getMetaModel.call(oModel), "~oMetaModel");
	});


	QUnit.module("Annotation Loading", {
		beforeEach: function() {},
		afterEach: function() {}
	});


	QUnit.test("Synchronous loading: Annotation Events", function(assert) {
		var done = assert.async();
		assert.expect(6);

		new Promise(function(fnResolve, fnReject) {
			var bAnnotationsFailed = false;

			var oModel = new ODataModel(sURI, {
				skipMetadataAnnotationParsing: true,
				annotationURI: "/invalid/annotation/url"
			});

			oModel.attachMetadataLoaded(function() {
				assert.ok(bAnnotationsFailed, "Annotations failed event was fired before metadata loaded event");
				assert.ok(true, "Metadata loaded successfully");


				oModel.destroy();
				fnResolve();
			});

			oModel.attachMetadataFailed(function() {
				assert.ok(false, "Metadata should have been loaded");
			});

			oModel.attachAnnotationsLoaded(function() {
				assert.ok(false, "Annotations should have failed");
			});

			oModel.attachAnnotationsFailed(function() {
				assert.ok(true, "Annotations failed and event was fired asynchronously");
				bAnnotationsFailed = true;
			});

		}).then(function() {
			var bAnnotationsLoaded = false;

			var oModel = new ODataModel(sURI, {
				skipMetadataAnnotationParsing: true,
				annotationURI: "test-resources/sap/ui/core/qunit/odata/data/annotations01.xml"
			});


			oModel.attachMetadataLoaded(function() {
				assert.ok(bAnnotationsLoaded, "Annotations loaded event was fired before metadata loaded event");
				assert.ok(true, "Metadata loaded successfully");


				oModel.destroy();
				done();
			});

			oModel.attachMetadataFailed(function() {
				assert.ok(false, "Metadata should have been loaded");
			});

			oModel.attachAnnotationsLoaded(function() {
				assert.ok(true, "Annotations loaded event was fired asynchronously");
				bAnnotationsLoaded = true;
			});

			oModel.attachAnnotationsFailed(function() {
				assert.ok(false, "Annotations should have loaded");
			});

		});


	});

	//*********************************************************************************************
[{
	metadataLoaded : false
}, {
	annotationsLoaded : false,
	metadataLoaded : true
}].forEach(function (oFixture, i) {
	QUnit.test("annotationsLoaded: not yet loaded, #" + i, function (assert) {
		var oModel = {
				oAnnotations : {isLoaded : function () {}},
				pAnnotationsLoaded : "~pAnnotationsLoaded",
				oMetadata : {isLoaded : function () {}}
			};

		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs()
			.returns(oFixture.metadataLoaded);
		this.mock(oModel.oAnnotations).expects("isLoaded").withExactArgs()
			.exactly(oFixture.metadataLoaded ? 1 : 0)
			.returns(oFixture.annotationsLoaded);

		// code under test
		assert.strictEqual(ODataModel.prototype.annotationsLoaded.call(oModel),
			"~pAnnotationsLoaded");
	});
});

//*********************************************************************************************
[{isLoaded : function () {}}, undefined].forEach(function (oAnnotations) {
	QUnit.test("annotationsLoaded: already loaded, with annotations: " + (!!oAnnotations),
			function (assert) {
		var oModel = {
				oAnnotations : oAnnotations,
				oMetadata : {isLoaded : function () {}}
			};

		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		if (oAnnotations) {
			this.mock(oAnnotations).expects("isLoaded").withExactArgs().returns(true);
		}

		// code under test
		assert.strictEqual(ODataModel.prototype.annotationsLoaded.call(oModel), null);
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
			variable: "id3",
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

		// legacy syntax - multi filter
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

		// legacy syntax - multi filter
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
		oFilter2 = new Filter({path: "y", operator: FilterOperator.Any, variable: "id2", condition: new Filter("z", FilterOperator.EQ, 110)});

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
});