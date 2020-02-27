/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/ContentDetails.controller",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/Layer",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/Router",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/m/Dialog"
], function (
	ContentDetails,
	LRepConnector,
	Layer,
	UIComponent,
	Router,
	DataUtils,
	jQuery,
	sinon,
	Dialog
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oController;

	QUnit.module("ContentDetails", {
		beforeEach: function () {
			oController = new ContentDetails();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sets all parameters when a route matched for this page", function (assert) {
			var sLayer = Layer.VENDOR;
			var sNamespace = "hi/there/";
			var sFileName = "helloWorld";
			var sFileType = "json";
			var oSelectedContentModel = new sap.ui.model.json.JSONModel();
			oController.oSelectedContentModel = oSelectedContentModel;

			sandbox.stub(oController, "getView").returns({
				getContent: function () {
					return [{
						setBusy: function () {}
					}];
				},
				createId: function () {
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

			var oStubbedGetContent = sandbox.stub(LRepConnector, "getContent").returns(Promise.resolve());
			var oStubbedOnContentReceived = sandbox.stub(oController, "_onContentReceived").returns(Promise.resolve());
			return oController._onRouteMatched(routeParameters).then(function() {
				assert.ok(oStubbedGetContent.calledOnce, "then a request for getting lrep data is sent");
				assert.equal(oStubbedGetContent.getCall(0).args[0], sLayer, "with correct layer");
				assert.equal(oStubbedGetContent.getCall(0).args[1], sNamespace + sFileName + "." + sFileType, "and with correct suffix");
				assert.ok(oStubbedOnContentReceived.calledOnce, "and correct handler function for received data is called");
			});
		});

		QUnit.test("on LRep content received", function(assert) {
			var oModelData = {
				fileType : "json"
			};
			var oData = {};
			var oPage = {
				setBusy : function () {}
			};
			var sContentSuffix = "pathtothefile";
			var oStubbedFormatData = sandbox.stub(DataUtils, "formatData");
			var oStubbedReceivedMetadata = sandbox.stub(oController, "_onContentMetadataReceived");
			var oStubbedGetContent = sandbox.stub(LRepConnector, "getContent").returns(Promise.resolve());

			return oController._onContentReceived(oModelData, oPage, sContentSuffix, oData).then(
				function () {
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
			sandbox.stub(oController, "getView").returns({
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
			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");

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

			var oStubbedGetRouterFor = sandbox.stub(UIComponent, "getRouterFor").returns(oRouter);
			var oStubbedNavTo = sandbox.stub(oRouter, "navTo");
			var oStubbedLrepConDeleteFile = sandbox.stub(LRepConnector, "deleteFile").returns(Promise.resolve());

			return oController._deleteFile(Layer.VENDOR, "namespace", "fileName", "fileType", "transportId", "All").then(function() {
				assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
				assert.ok(oStubbedLrepConDeleteFile.calledOnce, "then call Lrep connector for deleting file");
				assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
				assert.equal(oStubbedNavTo.getCall(0).args[0], "LayerContentMaster", "with correct target");
				assert.equal(oStubbedNavTo.getCall(0).args[1].layer, "All", "with correct layer");
				assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "namespace", "with correct namespace");
			});
		});

		QUnit.test("when _selectTransportAndDeleteFile is called with USER layer", function (assert) {
			sandbox.stub(oController, "getView").returns({
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
									value : Layer.USER
								}]
							};
						}
					};
				}
			});
			var oStubbedDeleteFile = sandbox.stub(oController, "_deleteFile").returns(Promise.resolve());
			oController._selectTransportAndDeleteFile();
			assert.ok(oStubbedDeleteFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedDeleteFile.getCall(0).args[0], Layer.USER, "with correct layer");
			assert.equal(oStubbedDeleteFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedDeleteFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedDeleteFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedDeleteFile.getCall(0).args[4], undefined, "with correct transportId");
		});

		QUnit.test("when _selectTransportAndDeleteFile is called with LOAD layer", function (assert) {
			sandbox.stub(oController, "getView").returns({
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
									value : "LOAD"
								}]
							};
						}
					};
				}
			});
			var oStubbedDeleteFile = sandbox.stub(oController, "_deleteFile").returns(Promise.resolve());
			oController._selectTransportAndDeleteFile();
			assert.ok(oStubbedDeleteFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedDeleteFile.getCall(0).args[0], "LOAD", "with correct layer");
			assert.equal(oStubbedDeleteFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedDeleteFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedDeleteFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedDeleteFile.getCall(0).args[4], undefined, "with correct transportId");
		});

		QUnit.test("when _selectTransportAndDeleteFile is called with ATO_NOTIFICATION content", function (assert) {
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						getData: function () {
							return {
								data: "{packageName: \"$TMP\"}",
								fileName : "fileName",
								fileType : "fileType",
								namespace : "namespace",
								layer : "All",
								metadata : [{
									name : "layer",
									value : Layer.CUSTOMER
								}, {
									name : "transportId",
									value : "ATO_NOTIFICATION"
								}]
							};
						}
					};
				}
			});
			var oStubbedDeleteFile = sandbox.stub(oController, "_deleteFile").returns(Promise.resolve());
			oController._selectTransportAndDeleteFile();
			assert.ok(oStubbedDeleteFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedDeleteFile.getCall(0).args[0], Layer.CUSTOMER, "with correct layer");
			assert.equal(oStubbedDeleteFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedDeleteFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedDeleteFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedDeleteFile.getCall(0).args[4], "ATO_NOTIFICATION", "with correct transportId");
		});

		QUnit.test("when _selectTransportAndDeleteFile is called with local object in VENDOR layer", function (assert) {
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						getData: function () {
							return {
								data: "{packageName: \"\"}",
								fileName : "fileName",
								fileType : "fileType",
								namespace : "namespace",
								layer : "All",
								metadata : [{
									name : "layer",
									value : Layer.VENDOR
								}]
							};
						}
					};
				}
			});
			var oStubbedDeleteFile = sandbox.stub(oController, "_deleteFile").returns(Promise.resolve());
			oController._selectTransportAndDeleteFile();
			assert.ok(oStubbedDeleteFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedDeleteFile.getCall(0).args[0], Layer.VENDOR, "with correct layer");
			assert.equal(oStubbedDeleteFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedDeleteFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedDeleteFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedDeleteFile.getCall(0).args[4], undefined, "with correct transportId");
		});

		QUnit.test("when _selectTransportAndDeleteFile is called with transported content", function (assert) {
			var oStubbedGetView = sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						getData: function () {
							return {
								data: "{packageName: \"package\"}",
								fileName : "fileName",
								fileType : "fileType",
								namespace : "namespace",
								layer : "All",
								metadata : [{
									name : "layer",
									value : Layer.VENDOR
								}, {
									name : "transportId",
									value : "transportId"
								}]
							};
						}
					};
				},
				addDependent: function() {}
			});
			var oStubbedOpenDialog = sandbox.stub(Dialog.prototype, 'open').returns("dummy");

			oController._selectTransportAndDeleteFile();

			assert.equal(oStubbedGetView.callCount, 2, "then getView is called twice, first to get selected data, second to attach transport dialog");
			assert.ok(oStubbedOpenDialog.calledOnce, "The transport Dialog is opened");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});