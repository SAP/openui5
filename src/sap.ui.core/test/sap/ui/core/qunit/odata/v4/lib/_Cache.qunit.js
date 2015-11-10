/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (Cache, Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
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
		var oCache;

		// code under test
		oCache = new Cache();

		assert.ok(oCache instanceof Cache);
	});

	//*********************************************************************************************
	QUnit.test("read(1, 1)", function (assert) {
		var oRequestor = new Requestor("/sap/opu/local_v4/IWBEP/TEA_BUSI/"),
			sRelativePath = "Employees",
			oCache = new Cache(oRequestor, sRelativePath),
			oPromise,
			oMockResult = {"@odata.context": "$metadata#TEAMS", value : ["a", "b", "c"]};

		this.oSandbox.mock(oRequestor).expects("request")
			.withExactArgs("GET", sRelativePath)
			.returns(Promise.resolve(oMockResult));

		// code under test
		oPromise = oCache.read(1, 1);

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (aResult){
			//TODO @odata.context: "$metadata#TEAMS"
//TODO			assert.deepEqual(aResult, {value : ["b"]});
		});

	});
});
