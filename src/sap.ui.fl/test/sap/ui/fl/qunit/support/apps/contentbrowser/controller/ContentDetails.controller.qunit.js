/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/ContentDetails.controller",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/Router",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils"
], function (ContentDetails, LRepConnector, UIComponent, Router, DataUtils){
	"use strict";

	var oController;

	QUnit.module("ContentDetails", {
		beforeEach: function () {
			oController = new ContentDetails();
		}
	});

	QUnit.test("sets all parameters when a route matched for this page", function (assert) {
		var sLayer = "VENDOR";
		var sNamespace = "hi/there/";
		var sFileName = "helloWorld";
		var sFileType = "json";
		var oSelectedContentModel = new sap.ui.model.json.JSONModel();
		oController.oSelectedContentModel = oSelectedContentModel;

		sinon.stub(oController, "getView").returns({
			getContent: function () {
				return [{
					setBusy: function (busy) {}
				}];
			},
			createId: function (iconId) {
				return "iconId";
			}
		});

		var routeParameters = {
			getParameter: function () {
				return {
					layer: sLayer,
					namespace: sNamespace,
					fileName: sFileName,
					fileType: sFileType
				};
			}
		};

		var oStubbedGetContent = this.stub(LRepConnector, "getContent").returns(Promise.resolve());
		var oStubbedOnContentReceived = this.stub(oController, "_onContentReceived").returns(Promise.resolve());
		return oController._onRouteMatched(routeParameters).then(function(){
			assert.ok(oStubbedGetContent.calledOnce, "then a request for getting lrep data is sent");
			assert.equal(oStubbedGetContent.getCall(0).args[0], sLayer, "with correct layer");
			assert.equal(oStubbedGetContent.getCall(0).args[1], sNamespace + sFileName + "." + sFileType, "and with correct suffix");
			assert.ok(oStubbedOnContentReceived.calledOnce, "and correct handler function for received data is called");
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
		oStubbedReceivedMetadata = this.stub(oController, "_onContentMetadataReceived"),
		oStubbedGetContent = this.stub(LRepConnector, "getContent").returns(Promise.resolve());

		return oController._onContentReceived(oModelData, oPage, sContentSuffix, oData).then(
			function (){
				assert.ok(oStubbedFormatData.calledOnce, "then received data is formatted");
				assert.equal(oStubbedFormatData.getCall(0).args[0], oData, "with correct data");
				assert.equal(oStubbedFormatData.getCall(0).args[1], oModelData.fileType, "and correct file type");
				assert.ok(oStubbedGetContent.calledOnce, "then request for metadata is sent");
				assert.ok(oStubbedReceivedMetadata.calledOnce, "then handler function for received metadata is called");
			}
		);
	});

	QUnit.test("when Edit button clicked", function (assert) {
		var oRouter = new Router();
		this.stub(oController, "getView").returns({
			getModel: function () {
				return {
					getData: function () {
						return {
							layer : "layer",
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

		oController.onEditClicked();

		assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
		assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
		assert.equal(oStubbedNavTo.getCall(0).args[0], "ContentDetailsEdit", "with correct target");
		assert.equal(oStubbedNavTo.getCall(0).args[1].layer, "layer", "with correct layer");
		assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "namespace", "with correct namespace");
		assert.equal(oStubbedNavTo.getCall(0).args[1].fileName, "fileName", "with correct filename");
		assert.equal(oStubbedNavTo.getCall(0).args[1].fileType, "fileType", "with correct filetype");
	});

	QUnit.test("when _deleteFile is called", function (assert) {
		var oRouter = new Router();
		this.stub(oController, "getView").returns({
			getModel: function () {
				return {
					getData: function () {
						return {
							fileName : "fileName",
							fileType : "fileType",
							namespace : "namespace",
							layer : "All",
							metadata : [{
								name : "layer",
								value : "VENDOR"
							}]
						};
					}
				};
			}
		});
		var oStubbedGetRouterFor = this.stub(UIComponent, "getRouterFor").returns(oRouter);
		var oStubbedNavTo = this.stub(oRouter, "navTo");
		var oStubbedLrepConDeleteFile = this.stub(LRepConnector, "deleteFile").returns(Promise.resolve());

		return oController._deleteFile().then(function(){
			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedLrepConDeleteFile.calledOnce, "then call Lrep connector for deleting file");
			assert.equal(oStubbedLrepConDeleteFile.getCall(0).args[0], "VENDOR", "with correct layer");
			assert.equal(oStubbedLrepConDeleteFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedLrepConDeleteFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedLrepConDeleteFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "with correct target");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, "All", "with correct layer");
			assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "namespace", "with correct namespace");
		});
	});
});