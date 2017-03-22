sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector"
], function (LRepConnector){
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("LayerContentMaster", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	});

	QUnit.test("gives an empty suffix on a request for all layers", function(assert) {
		var sCalculatedLayerSuffix = LRepConnector._getLayerSuffix("All");
		assert.equal(sCalculatedLayerSuffix, "", "the layer suffix is empty");
	});

	QUnit.test("gives a specific suffix if a request for a layer is prepared", function(assert) {
		var sCalculatedLayerSuffix = LRepConnector._getLayerSuffix("VENDOR");
		assert.equal(sCalculatedLayerSuffix, "?sLayer=VENDOR", "the layer suffix should point to the VENDOR layer");
	});

	QUnit.test("the context suffix should start with '?' if no layer suffix is present", function(assert) {
		var sLayerSuffix = "";
		var sCalculatedContextSuffix = LRepConnector._getContextSuffix(sLayerSuffix, undefined, undefined);
		assert.equal(sCalculatedContextSuffix[0], "?", "the suffix should start with ?");
	});

	QUnit.test("the context suffix should start with '&' if a layer Suffix is presented", function(assert) {
		var sLayerSuffix = "?sLayer=VENDOR";
		var sCalculatedContextSuffix = LRepConnector._getContextSuffix(sLayerSuffix, undefined, undefined);
		assert.equal(sCalculatedContextSuffix[0], "&", "the suffix should start with &");
	});

	QUnit.test("sending a GET request and getting a success answer leads to the resolving of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("success", oData);
		var oStubbedResolve = sandbox.stub();
		var oStubbedReject = sandbox.stub();

		LRepConnector._sendContentRequest("someURL", oStubbedResolve, oStubbedReject);

		assert.ok(oStubbedResolve.calledOnce, "the promise resolve was called once");
		assert.equal(oStubbedResolve.getCall(0).args[0], oData, "the promise resolve was called with the data returned");
		assert.equal(oStubbedReject.callCount, 0, "the promise rejection was never called");
	});

	QUnit.test("sending a GET request and getting a erroneous answer leads to the rejection of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("error", oData);
		var oStubbedResolve = sandbox.stub();
		var oStubbedReject = sandbox.stub();
		var oErrorReportingStub = sandbox.stub(LRepConnector, "_reportError");

		LRepConnector._sendContentRequest("someURL", oStubbedResolve, oStubbedReject);

		assert.ok(oStubbedReject.calledOnce, "the promise reject was called once");
		assert.ok(oErrorReportingStub.calledOnce, "the error will be displayed (passed to the ErrorUtils");
		assert.equal(oStubbedResolve.callCount, 0, "the promise resolve was never called");
	});

	QUnit.test("sending a GET request for a file content will leads to a correct data type of ajax request and the resolving of the promise", function(assert) {
		var oData = {"some": "data"};
		var oStubbedAjaxRequest =  sandbox.stub(jQuery, "ajax").yieldsTo("success", oData);
		var oStubbedResolve = sandbox.stub();
		var oStubbedReject = sandbox.stub();

		LRepConnector._sendContentRequest("someURL", oStubbedResolve, oStubbedReject, true);

		assert.equal(oStubbedAjaxRequest.getCall(0).args[0].dataType, "text", "the ajax request with correct options is called");
		assert.ok(oStubbedResolve.calledOnce, "the promise resolve was called once");
		assert.equal(oStubbedResolve.getCall(0).args[0], oData, "the promise resolve was called with the data returned");
		assert.equal(oStubbedReject.callCount, 0, "the promise rejection was never called");
	});

	QUnit.test("sending a PUT request and getting a success answer leads to the resolving of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("success", oData);
		var oStubbedResolve = sandbox.stub();
		var ostubbedReject = sandbox.stub();

		LRepConnector._sendPutRequest("aToken", "someURL", "{some : 'Data'}", oStubbedResolve, ostubbedReject);

		assert.ok(oStubbedResolve.calledOnce, "the promise resolve was called once");
		assert.equal(ostubbedReject.callCount, 0, "the promise rejection was never called");
	});

	QUnit.test("sending a PUT request and getting a erroneous answer leads to the rejection of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("error", oData);
		var oStubbedResolve = sandbox.stub();
		var ostubbedReject = sandbox.stub();
		var oErrorReportingStub = sandbox.stub(LRepConnector, "_reportError");

		LRepConnector._sendPutRequest("aToken", "someURL", "{some : 'Data'}", oStubbedResolve, ostubbedReject);

		assert.ok(ostubbedReject.calledOnce, "the promise resolve was called once");
		assert.ok(oErrorReportingStub.calledOnce, "the error will be displayed (passed to the ErrorUtils");
		assert.equal(oStubbedResolve.callCount, 0, "the promise rejection was never called");
	});
	QUnit.test("sending a DELETE request and getting a success answer leads to the resolving of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("success", oData);
		var oStubbedResolve = sandbox.stub();
		var ostubbedReject = sandbox.stub();

		LRepConnector._sendDeletionRequest("aToken", "someURL", oStubbedResolve, ostubbedReject);

		assert.ok(oStubbedResolve.calledOnce, "the promise resolve was called once");
		assert.equal(ostubbedReject.callCount, 0, "the promise rejection was never called");
	});

	QUnit.test("sending a DELETE request and getting a erroneous answer leads to the rejection of the promise", function(assert) {
		var oData = {"some": "data"};
		sandbox.stub(jQuery, "ajax").yieldsTo("error", oData);
		var oStubbedResolve = sandbox.stub();
		var ostubbedReject = sandbox.stub();
		var oErrorReportingStub = sandbox.stub(LRepConnector, "_reportError");

		LRepConnector._sendDeletionRequest("aToken", "someURL", oStubbedResolve, ostubbedReject);

		assert.ok(ostubbedReject.calledOnce, "the promise resolve was called once");
		assert.ok(oErrorReportingStub.calledOnce, "the error will be displayed (passed to the ErrorUtils");
		assert.equal(oStubbedResolve.callCount, 0, "the promise rejection was never called");
	});
});

