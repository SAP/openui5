/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/ContentDetailsEdit.controller",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/core/routing/Router",
	"sap/ui/core/UIComponent"
], function (ContentDetailsEdit, LRepConnector, DataUtils, Router, UIComponent){
	"use strict";

	var oController;

	QUnit.module("ContentDetailsEdit", {
		beforeEach: function () {
			oController = new ContentDetailsEdit();
		}
	});

	QUnit.test("sets all parameters when a route matched for this page", function (assert) {
		var sLayer = "VENDOR";
		var sNamespace = "hi/there/";
		var sFileName = "helloWorld";
		var sFileType = "json";
		var oData = {};
		var oRouteParameters = {
			getParameter: function () {
				return {
					layer: sLayer,
					namespace: sNamespace,
					fileName: sFileName,
					fileType: sFileType
				};
			}
		};
		var oSelectedContentModel = new sap.ui.model.json.JSONModel();
		oController.oSelectedContentModel = oSelectedContentModel;

		this.stub(oController, "getView").returns({
			getContent: function () {
				return [{
					setBusy: function (busy) {
					}
				}];
			}
		});

		var oSubbedLRepConGetContent = this.stub(LRepConnector, "getContent").returns(Promise.resolve(oData));
		var oSubbedFormatData = this.stub(DataUtils, "formatData");
		var oSubbedSetData = this.stub(oSelectedContentModel, "setData");
		return oController._onRouteMatched(oRouteParameters).then(function(){
			assert.equal(oSubbedLRepConGetContent.callCount, 2, "then the Lrep getcontent called twice");
			assert.equal(oSubbedLRepConGetContent.getCall(0).args[0], sLayer, "first call has correct layer");
			assert.equal(oSubbedLRepConGetContent.getCall(0).args[1], sNamespace + sFileName + "." + sFileType, "first call has correct suffix");
			assert.equal(oSubbedLRepConGetContent.getCall(1).args[0], sLayer, "second call has correct layer");
			assert.equal(oSubbedLRepConGetContent.getCall(1).args[1], sNamespace + sFileName + "." + sFileType, "second call has correct suffix");
			assert.equal(oSubbedLRepConGetContent.getCall(1).args[2], true, "second call includes correct third param");
			assert.ok(oSubbedFormatData.calledOnce, "then format data called one");
			assert.ok(oSubbedSetData.calledOnce, "and setData to model called");
		});
	});

	QUnit.test("on LRep content received", function(assert) {
		var oModelData = {
				fileType : "json"
			},
			oData = {},
			oPage = {
				setBusy : function (busy){}
			},
			sContentSuffix = "pathtothefile",
			oStubbedFormatData = this.stub(DataUtils, "formatData"),
			oStubbedGetContent = this.stub(LRepConnector, "getContent").returns(Promise.resolve()),
			oStubbedSetBusy = this.stub(oPage, "setBusy");
		oController.oSelectedContentModel = {
			setData : function(){}
		};

		return oController._onContentReceived(oModelData, oPage, sContentSuffix, oData).then(
			function (){
				assert.ok(oStubbedGetContent.calledOnce, "then request for metadata is sent");
				assert.ok(oStubbedFormatData.calledOnce, "then received data is formatted");
				assert.equal(oStubbedFormatData.getCall(0).args[0], oData, "with correct data");
				assert.equal(oStubbedFormatData.getCall(0).args[1], oModelData.fileType, "and correct file type");
				assert.equal(oStubbedSetBusy.getCall(0).args[0], false, "and release busy display mode of current page");
			}
		);
	});

	QUnit.test("when save button is clicked", function (assert) {
		this.stub(oController, "getView").returns({
			getModel: function () {
				return {
					getData: function () {
						return {
							fileName : "fileName",
							fileType : "fileType",
							namespace : "namespace",
							data : "content",
							metadata : [{
								name : "layer",
								value : "VENDOR"
							}]
						};
					}
				};
			}
		});
		var oStubbedNavTo = this.stub(oController, "_navToDisplayMode");
		var oStubbedLrepConSaveFile = this.stub(LRepConnector, "saveFile").returns(Promise.resolve());

		return oController.onSave().then(function(){
			assert.ok(oStubbedLrepConSaveFile.calledOnce, "then call Lrep connector for save file");
			assert.equal(oStubbedLrepConSaveFile.getCall(0).args[0], "VENDOR", "with correct layer");
			assert.equal(oStubbedLrepConSaveFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedLrepConSaveFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedLrepConSaveFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedLrepConSaveFile.getCall(0).args[4], "content", "with correct fileType");
			assert.ok(oStubbedNavTo.calledOnce, "then navigation to display mode is triggered");
		});
	});

	QUnit.test("when cancel button is clicked", function (assert) {
		var oStubbedNavTo = this.stub(oController, "_navToDisplayMode");

		oController.onCancel();

		assert.ok(oStubbedNavTo.calledOnce, "then navigation to display mode is triggered");
	});

	QUnit.test("when navigate to display mode is triggered", function (assert) {
		var oRouter = new Router();
		this.stub(oController, "getView").returns({
			getModel: function () {
				return {
					getData: function () {
						return {
							layer : "VENDOR",
							fileName : "fileName",
							fileType : "fileType",
							namespace : "namespace"
						};
					}
				};
			}
		});
		var oStubbedGetRouterFor = this.stub(UIComponent, "getRouterFor").returns(oRouter);
		var oStubbedNavTo = this.stub(oRouter, "navTo");

		oController._navToDisplayMode();

		assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
		assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
		assert.equal(oStubbedNavTo.getCall(0).args[0], "ContentDetailsFlip", "with correct target");
		assert.equal(oStubbedNavTo.getCall(0).args[1].layer, "VENDOR", "with correct layer");
		assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "namespace", "with correct namespace");
		assert.equal(oStubbedNavTo.getCall(0).args[1].fileName, "fileName", "with correct filename");
		assert.equal(oStubbedNavTo.getCall(0).args[1].fileType, "fileType", "with correct filetype");
	});
});
