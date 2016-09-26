/*globals QUnit*/


(function(QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "./testComponent");
	jQuery.sap.registerModulePath("testComponentAsync", "./testComponentAsync");

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.library", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	});

	QUnit.test("has registered its xml preprocessor", function(assert) {
		var oFlexController = sap.ui.fl.FlexControllerFactory.create("testComponent.Component");
		var oPreprocessorStub = sandbox.stub(oFlexController, "processXmlView",function (oView) {
			return Promise.resolve(oView);
		});

		sap.ui.getCore().createComponent({
			name: "testComponent",
			id: "testComponent",
			"metadata": {
				"manifest": "json"
			},
			async: false
		});

		sap.ui.getCore().applyChanges();

		assert.equal(oPreprocessorStub.callCount, 0, "and was not called on a synchronous view creation");
	});
/*
	QUnit.test("has registered its xml preprocessor", function(assert) {
		var done = assert.async();
		var oFlexController = sap.ui.fl.FlexControllerFactory.create("testComponentAsync.Component");
		var oPreprocessorStub = sandbox.stub(oFlexController, "processXmlView",function (oView) {
			return Promise.resolve(oView);
		});

		var oComponent = sap.ui.getCore().createComponent({
			name: "testComponentAsync",
			id: "testComponentAsync",
			"metadata": {
				"manifest": "json"
			},
			async: true
		});



		sap.ui.getCore().applyChanges();

		oComponent.then(function (oLoadedComponent) {

			new sap.ui.core.ComponentContainer({
				component : oLoadedComponent
			}).placeAt("content");
			oLoadedComponent.byId("myView").attachAfterRendering(function() {
				assert.ok(oPreprocessorStub.calledOnce, "and was not called on an asynchronous view creation");
				done();
			});
		});
	});*/
}(QUnit));
