/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/LayerContentMaster.controller",
	"sap/ui/fl/Layer",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/Router",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	LayerContentMaster,
	Layer,
	UIComponent,
	Router,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oController;
	var oRouter;

	QUnit.module("LayerContentMaster", {
		beforeEach: function() {
			oController = new LayerContentMaster();
			oRouter = new Router();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("on LRep content received", function(assert) {
			var oPage = {
				setBusy : function () {}
			};
			var oData = {};
			var oStubbedFilterList = sandbox.stub(oController, "filterListByQuery");
			var oStubbedSetBusy = sandbox.stub(oPage, "setBusy");
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						setData : function () {}
					};
				}
			});
			sandbox.stub(oController, "byId").returns({
				setValue : function() {}
			});

			oController._onContentReceived(oPage, oData);

			assert.equal(oStubbedSetBusy.getCall(0).args[0], false, "then set page busy to false");
			assert.equal(oStubbedFilterList.getCall(0).args[0], "", "then clear the filter view");
		});

		QUnit.test("navigates into a folder", function(assert) {
			var sLayer = Layer.USER;
			var oModel = new sap.ui.model.json.JSONModel([
				{
					name: "someFile",
					filetype: "json"
				},
				{
					name: "someFolder",
					filetype: ""
				}
			]);
			var eSelectionEvent = {
				getSource: function () {
					return {
						getBindingContextPath: function () {
							return "/1";
						}
					};
				}
			};
			oController.sLayer = sLayer;
			oController.sNamespace = "1stLevel/2ndLevel/";
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return oModel;
				}
			});
			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

			oController.onContentSelected(eSelectionEvent);
			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedNavTo.calledOnce, "then navigation is trigger");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "navigation to same page is called");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, sLayer, "navigation within the same layer is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "1stLevel%2F2ndLevel%2FsomeFolder%2F", "the navigation dives into the folder mentioned as the source of the event");
		});

		QUnit.test("navigates to the details of a file", function(assert) {
			var sLayer = Layer.USER;
			var oModel = new sap.ui.model.json.JSONModel([
				{
					name: "someFile",
					fileType: "json"
				},
				{
					name: "someFolder",
					fileType: ""
				}
			]);
			var oSelectionEvent = {
				getSource: function () {
					return {
						getBindingContextPath: function () {
							return "/0";
						}
					};
				}
			};
			oController.sLayer = sLayer;
			oController.sNamespace = "1stLevel/2ndLevel/";
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return oModel;
				}
			});
			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

			oController.onContentSelected(oSelectionEvent);

			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "ContentDetails", "navigation to same page is called");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, sLayer, "navigation within the same layer is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "1stLevel%2F2ndLevel%2F", "the navigation stays within the same folder");
			assert.equal(oStubbedNavTo.getCall(0).args[1].fileName, "someFile", "the navigation is triggered for the selected file");
			assert.equal(oStubbedNavTo.getCall(0).args[1].fileType, "json", "the navigation is triggered with the file type of the selected file");
		});

		QUnit.test("navs back to layers if the namespace is already root", function(assert) {
			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

			oController.navBack();

			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedNavTo.calledWith("Layers"), "navigation to the layers is called");
		});

		QUnit.test("navs back one level within the namespace if the namespace is not root", function(assert) {
			var sLayer = Layer.USER;
			oController.sLayer = sLayer;
			oController.sNamespace = "1stLevel/2ndLevel/";

			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

			oController.navBack();

			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedNavTo.calledOnce, "navigation was triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "navigation to same page is called");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, sLayer, "navigation within the same sLayer is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "1stLevel%2F", "one level above the previous is the destination of the navigation");
		});

		QUnit.test("when a namespace is too long", function(assert) {
			oController.sNamespace = "path1/path2/path3/path4";
			oController.sLayer = "VENDOR";

			assert.equal(oController._shortenNamespace(), "[VENDOR] .../path3", "then it is shortened correctly");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});