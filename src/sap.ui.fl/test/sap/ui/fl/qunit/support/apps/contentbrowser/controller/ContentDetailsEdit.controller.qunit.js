/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/controller/ContentDetailsEdit.controller",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/fl/Layer",
	"sap/ui/core/routing/Router",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/m/Dialog"
], function (
	ContentDetailsEdit,
	LRepConnector,
	DataUtils,
	Layer,
	Router,
	UIComponent,
	jQuery,
	sinon,
	Dialog
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oController;

	QUnit.module("ContentDetailsEdit", {
		beforeEach: function () {
			oController = new ContentDetailsEdit();
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

			sandbox.stub(oController, "getView").returns({
				getContent: function () {
					return [{
						setBusy: function () {
						}
					}];
				}
			});

			var oSubbedLRepConGetContent = sandbox.stub(LRepConnector, "getContent").returns(Promise.resolve(oData));
			var oSubbedFormatData = sandbox.stub(DataUtils, "formatData");
			var oSubbedSetData = sandbox.stub(oSelectedContentModel, "setData");
			return oController._onRouteMatched(oRouteParameters).then(function() {
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
			};
			var oData = {};
			var oPage = {
				setBusy : function () {}
			};
			var sContentSuffix = "pathtothefile";
			var oStubbedFormatData = sandbox.stub(DataUtils, "formatData");
			var oStubbedGetContent = sandbox.stub(LRepConnector, "getContent").returns(Promise.resolve());
			var oStubbedSetBusy = sandbox.stub(oPage, "setBusy");
			oController.oSelectedContentModel = {
				setData : function() {}
			};

			return oController._onContentReceived(oModelData, oPage, sContentSuffix, oData).then(
				function () {
					assert.ok(oStubbedGetContent.calledOnce, "then request for metadata is sent");
					assert.ok(oStubbedFormatData.calledOnce, "then received data is formatted");
					assert.equal(oStubbedFormatData.getCall(0).args[0], oData, "with correct data");
					assert.equal(oStubbedFormatData.getCall(0).args[1], oModelData.fileType, "and correct file type");
					assert.equal(oStubbedSetBusy.getCall(0).args[0], false, "and release busy display mode of current page");
				}
			);
		});

		QUnit.test("when _saveFile is called", function (assert) {
			var oStubbedNavTo = sandbox.stub(oController, "_navToDisplayMode");
			var oStubbedLrepConSaveFile = sandbox.stub(LRepConnector, "saveFile").returns(Promise.resolve());
			return oController._saveFile(Layer.VENDOR, "namespace", "fileName", "fileType", "somedata", "sTransportId", "package").then(function() {
				assert.ok(oStubbedNavTo.calledOnce, "then call for get a router");
				assert.ok(oStubbedLrepConSaveFile.calledOnce, "then call Lrep connector for save file");
			});
		});

		QUnit.test("when onSave is called with USER layer", function (assert) {
			sandbox.stub(oController, "getView").returns({
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
									value : Layer.USER
								}]
							};
						}
					};
				}
			});

			var oStubbedSaveFile = sandbox.stub(oController, "_saveFile").returns(Promise.resolve());
			oController.onSave();

			assert.ok(oStubbedSaveFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedSaveFile.getCall(0).args[0], Layer.USER, "with correct layer");
			assert.equal(oStubbedSaveFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedSaveFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedSaveFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedSaveFile.getCall(0).args[4], "content", "with correct data");
			assert.equal(oStubbedSaveFile.getCall(0).args[5], undefined, "with correct transportId");
			assert.equal(oStubbedSaveFile.getCall(0).args[6], undefined, "with correct package");
		});

		QUnit.test("when onSave is called with LOAD layer", function (assert) {
			sandbox.stub(oController, "getView").returns({
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
									value : "LOAD"
								}]
							};
						}
					};
				}
			});

			var oStubbedSaveFile = sandbox.stub(oController, "_saveFile").returns(Promise.resolve());
			oController.onSave();

			assert.ok(oStubbedSaveFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedSaveFile.getCall(0).args[0], "LOAD", "with correct layer");
			assert.equal(oStubbedSaveFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedSaveFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedSaveFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.equal(oStubbedSaveFile.getCall(0).args[4], "content", "with correct data");
			assert.equal(oStubbedSaveFile.getCall(0).args[5], undefined, "with correct transportId");
			assert.equal(oStubbedSaveFile.getCall(0).args[6], undefined, "with correct package");
		});

		QUnit.test("when onSave is called with ATO_NOTIFICATION content", function (assert) {
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

			var oStubbedSaveFile = sandbox.stub(oController, "_saveFile").returns(Promise.resolve());
			oController.onSave();

			assert.ok(oStubbedSaveFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedSaveFile.getCall(0).args[0], Layer.CUSTOMER, "with correct layer");
			assert.equal(oStubbedSaveFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedSaveFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedSaveFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.deepEqual(oStubbedSaveFile.getCall(0).args[4], "{packageName: \"$TMP\"}", "with correct data");
			assert.equal(oStubbedSaveFile.getCall(0).args[5], "ATO_NOTIFICATION", "with correct transportId");
			assert.equal(oStubbedSaveFile.getCall(0).args[6], undefined, "with correct package");
		});

		QUnit.test("when onSave is called with local object in VENDOR layer", function (assert) {
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

			var oStubbedSaveFile = sandbox.stub(oController, "_saveFile").returns(Promise.resolve());
			oController.onSave();

			assert.ok(oStubbedSaveFile.calledOnce, "then call for deleting file");
			assert.equal(oStubbedSaveFile.getCall(0).args[0], Layer.VENDOR, "with correct layer");
			assert.equal(oStubbedSaveFile.getCall(0).args[1], "namespace", "with correct namespace");
			assert.equal(oStubbedSaveFile.getCall(0).args[2], "fileName", "with correct fileName");
			assert.equal(oStubbedSaveFile.getCall(0).args[3], "fileType", "with correct fileType");
			assert.deepEqual(oStubbedSaveFile.getCall(0).args[4], "{packageName: \"\"}", "with correct data");
			assert.equal(oStubbedSaveFile.getCall(0).args[5], undefined, "with correct transportId");
			assert.equal(oStubbedSaveFile.getCall(0).args[6], undefined, "with correct package");
		});

		QUnit.test("when onSave is called with transported content", function (assert) {
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

			oController.onSave();

			assert.equal(oStubbedGetView.callCount, 2, "then getView is called twice, first to get selected data, second to attach transport dialog");
			assert.ok(oStubbedOpenDialog.calledOnce, "The transport Dialog is opened");
		});

		QUnit.test("when cancel button is clicked", function (assert) {
			var oStubbedNavTo = sandbox.stub(oController, "_navToDisplayMode");

			oController.onCancel();

			assert.ok(oStubbedNavTo.calledOnce, "then navigation to display mode is triggered");
		});

		QUnit.test("when navigate to display mode is triggered", function (assert) {
			var oRouter = new Router();
			sandbox.stub(oController, "getView").returns({
				getModel: function () {
					return {
						getData: function () {
							return {
								layer : Layer.VENDOR,
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

			oController._navToDisplayMode();

			assert.ok(oStubbedGetRouterFor.calledOnce, "then call for get a router");
			assert.ok(oStubbedNavTo.calledOnce, "then navigation is triggered");
			assert.equal(oStubbedNavTo.getCall(0).args[0], "ContentDetailsFlip", "with correct target");
			assert.equal(oStubbedNavTo.getCall(0).args[1].layer, Layer.VENDOR, "with correct layer");
			assert.equal(oStubbedNavTo.getCall(0).args[1].namespace, "namespace", "with correct namespace");
			assert.equal(oStubbedNavTo.getCall(0).args[1].fileName, "fileName", "with correct filename");
			assert.equal(oStubbedNavTo.getCall(0).args[1].fileType, "fileType", "with correct filetype");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});