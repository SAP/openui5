/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/Log",
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/Context",
	"sap/m/Label"
], function(
		Log,
	fakeService,
	ODataModel,
	Context,
	Label
) {
	"use strict";
	//add divs for control tests
	var oTarget1 = document.createElement("div");
	oTarget1.id = "target1";
	document.body.appendChild(oTarget1);
	var oTarget2 = document.createElement("div");
	oTarget2.id = "target2";
	document.body.appendChild(oTarget2);

	var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sURI = "/proxy/http/" + sURI.replace("http://","");
	var oLabel = new Label("myLabel");
	oLabel.placeAt("target1");

	function initModel(sURI, bJSON){
		var oModel = new ODataModel(sURI, bJSON);
		return oModel;
	}

	QUnit.test("test oDataModel - oMetadata shared across models", function(assert){
		var done = assert.async();
		assert.expect(1);
		var clock = sinon.clock.create();
		var mOptions = {
				json : true,
				loadMetadataAsync: true
			};
		var oModel = new ODataModel(sURI, mOptions);
		var oModel2 = {};

		oModel.oMetadata.attachLoaded(function() {
			Log.debug("test 1 - metadata loaded is fired on metadata onload of model1");
		});

		oModel.attachMetadataLoaded(function(){
			oModel2 = new ODataModel(sURI, mOptions);

			var bFiredAtMetadata = false;

			var pMetadata = new Promise(function(fnResolve, fnReject) {

				oModel2.oMetadata.attachLoaded(function() {
					Log.debug("test 2 - metadata loaded is fired on metadata");
					bFiredAtMetadata = true;
				});
				// attach again and wait for the metadataloaded event at the model itself,
				//fail if event is fired at the metadata object
				oModel2.attachMetadataLoaded(function() {
					Log.debug("metadata loaded is fired");
					if (!bFiredAtMetadata) {
						fnResolve();
					} else {
						fnReject();
					}
				});

			});

			clock.tick(1);

			pMetadata.then(function(e){
				assert.ok(true, 'Metadata loaded fired at model only');
			}, function(e){
				Log.debug("metadata promise failed");
				assert.ok(false, 'Metadata loaded fired at metadata object');
			}).finally(done);

		});
		clock.tick(1);
	});

	QUnit.test("metadata check", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(7);
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
		clock.tick(1);
	});

	QUnit.test("metadata get entity type check", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(11);
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
		clock.tick(1);
	});

	QUnit.test("metadata get entity type check with context", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(1);
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
		clock.tick(1);
	});

	QUnit.test("metadata get property metadata", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(6);
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
		clock.tick(1);
	});


	QUnit.test("async metadata request check", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(2);
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
		clock.tick(30);
	});


	QUnit.test("async metadata request check with bindings", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(9);
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
			oBinding.initialize();
		};
		oModel.attachMetadataLoaded(handler);
		clock.tick(30);
	});

	QUnit.test("async metadata request check with bindings die zwote", function(assert){
		var done = assert.async();
		var clock = sinon.clock.create();
		assert.expect(7);
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
		oBinding.initialize();
		clock.tick(30);
	});
});