/*global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Change",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/variants/VariantController"
], function(LrepConnector, FakeLrepConnector, Cache, Change, ChangePersistence, VariantController) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var oFakeLrepConnector = new FakeLrepConnector("Dummy path");

	QUnit.module("Given an instance of FakeLrepConnector", {
		beforeEach : function(assert) {
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when create change which is variant and send it to LrepConnector", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				return oFakeLrepConnector.create(oFakeVariantResponse, "testChangeList", true).then(function(result){
					assert.deepEqual(result.response, oFakeVariantResponse , "then an exact payload was returned.");
					assert.equal(result.status, 'success' , "successfully.");
					done();
				});
		 });
	});

	QUnit.test("when calling 'getVariants' of the VariantController", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpectedVariants = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants;
				var aVariants = oVariantController.getVariants("variantManagementOrdersTable");
				assert.deepEqual(aExpectedVariants, aVariants, "then the variants of a given variantManagmentId are returned");
				done();
		 });
	});

	QUnit.test("when calling 'getVariants' of the VariantController with an invalid variantManagementId", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aVariants =  oVariantController.getVariants("invalidVariantManagementId");
					assert.equal(aVariants.length, 0, "then an empty array is returned");
					done();
		 });
	});

	QUnit.test("when calling 'getVariantChanges' of the VariantController", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpectedDefChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
				var aExpectedChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[1].changes;
				var aDefChanges = oVariantController.getVariantChanges("variantManagementOrdersTable");
				var aChanges = oVariantController.getVariantChanges("variantManagementOrdersTable", "variant1");
				assert.deepEqual(aExpectedDefChanges, aDefChanges, "then the changes of the default variant are returned");
				assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
				done();
		 });
	});


	QUnit.test("when calling 'loadVariantChanges' of the VariantController without changes in variant", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpChanges1 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
				var aExpChanges2 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
				var aExpectedChanges = aExpChanges1.concat(aExpChanges2);
				var aChanges = oVariantController.loadDefaultChanges();
				assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
				done();
		 });
	});

	QUnit.test("when calling 'getChangesForComponent' of the ChangePersistence", function(assert) {
		var done = assert.async();
		jQuery.getJSON( "./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
			var aExpectedChanges0 = oFakeVariantResponse.changes.changes;
			var aExpectedChanges1 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
			var aExpectedChanges2 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
			var aExpectedChanges = aExpectedChanges0.concat(aExpectedChanges1).concat(aExpectedChanges2).map(function(oChangeContent){
				return new Change(oChangeContent);
			});

			var oComponent = {
					name: "MyComponent",
					appVersion: "1.2.3",
				getId : function() {return "RTADemoAppMD";}
			};
			var oChangePersistence = new ChangePersistence(oComponent);

			var mPropertyBag = {viewId: "view1--view2"};
			return oChangePersistence.getChangesForComponent(oComponent, mPropertyBag).then(function(aChanges) {
				assert.deepEqual(aChanges, aExpectedChanges, "the variant changes are available together with the ");
				done();
			});
		 });
	});

});
