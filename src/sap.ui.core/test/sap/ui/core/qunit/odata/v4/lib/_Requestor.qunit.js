/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Requestor", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/",
			oRequestor;

		// code under test
		oRequestor = new Requestor(sServiceUrl);

		assert.ok(oRequestor instanceof Requestor);
	});

	//*********************************************************************************************
	QUnit.test("request", function (assert) {
		var oDeferred = new jQuery.Deferred(),
			oPromise,
			oRequestor = new Requestor("/sap/opu/local_v4/IWBEP/TEA_BUSI/"),
			oResult = {};

		oDeferred.resolve(oResult);
		this.oSandbox.mock(jQuery).expects("ajax")
			.withExactArgs("/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees", {method : "GET"})
			.returns(oDeferred);

		// code under test
		oPromise = oRequestor.request("GET", "Employees");

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function(result){
				assert.strictEqual(result, oResult);
			});
	});
});
