/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/_Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ContextBinding, _Cache, _Context, _ODataHelper,
		ODataContextBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();

			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel("/service/?sap-client=111");
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oContext = {},
			oBoundContext = {},
			oBinding = this.oModel.bindContext("foo", oContext);

		this.mock(this.oModel).expects("resolve").withExactArgs("foo", sinon.match.same(oContext))
			.returns("/absolute");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		this.mock(_Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/absolute")
			.returns(oBoundContext);

		assert.strictEqual(oBinding.initialize(), undefined, "no chaining");
		assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oBinding = this.oModel.bindContext("foo");

		this.mock(this.oModel).expects("resolve")
			.returns(undefined /*relative path, no context*/);
		this.mock(oBinding).expects("_fireChange").never();

		oBinding.initialize();
	});

	//*********************************************************************************************
	//TODO support nested context bindings
	QUnit.skip("setContext, change event", function (assert) {
		var oContext = {},
			oBinding = this.oModel.bindContext("foo");

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		oBinding.setContext(oContext);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindContext: invalid path: " + sPath, function (assert) {
			var oModel = new ODataModel("/service/");

			assert.throws(function () {
				oModel.bindContext(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("relative path", function (assert) {
		var oModel = new ODataModel("/service/"),
			oBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () {
			oBinding.setContext("/SalesOrders(ID='1')");
		}, new Error("Nested context bindings are not supported"));
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oModel = new ODataModel("/service/"),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		oBinding.setContext(_Context.create(oModel, null, "/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')", "TEAM_2_EMPLOYEES(ID='1')", ""].forEach(function (sPath) {
		QUnit.test("bindContext, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = jQuery.sap.startsWith(sPath, "/"),
				oModel = new ODataModel("/service/?sap-client=111"),
				oCache = {},
				oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
				oBinding;

			if (bAbsolute) {
				this.oSandbox.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);
			} else {
				this.oSandbox.mock(_Cache).expects("createSingle").never();
			}

			oBinding = oModel.bindContext(sPath, oContext);

			assert.ok(oBinding instanceof ODataContextBinding);
			assert.strictEqual(oBinding.getModel(), oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindContext with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oHelperMock,
			oModel = new ODataModel("/service/?sap-client=111"),
			mParameters = {"$expand" : "foo", "$select" : "bar", "custom" : "baz"},
			mQueryOptions = {};

		oHelperMock = this.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(oModel.mUriParameters, mParameters, ["$expand", "$select"])
			.returns(mQueryOptions);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES(ID='1')",
				sinon.match.same(mQueryOptions));

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			oModel.bindContext("EMPLOYEE_2_TEAM(Team_Id='4711')", null, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path", function (assert) {
		var oCache = {
				refresh : function () {}
			},
			oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oBinding;

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oCache).expects("refresh");
		this.oSandbox.mock(oBinding).expects("_fireChange");

		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oBinding;

		this.oSandbox.mock(_Cache).expects("createSingle").never();

		oBinding = oModel.bindContext("TEAM_2_EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			bGotDataReceived = false,
			oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		this.oSandbox.mock(oModel.oRequestor).expects("request")
			.returns(Promise.resolve({"ID" : "1"}));
		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange");

		oBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("error"), undefined);
			bGotDataReceived = true;
		});

		// trigger read before refresh
		oPromise = oBinding.requestValue("ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
			assert.ok(bGotDataReceived);
		});
		oBinding.refresh(true);
		return oPromise;
	});
	// TODO bSuspended? In v2 it is ignored (check with core)

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (success)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oCacheMock = this.oSandbox.mock(oBinding.oCache),
			iDataReceivedCount = 0,
			iDataRequestedCount = 0,
			oModel = oBinding.getModel(),
			fnResolveRead,
			oReadPromise = new Promise(function (fnResolve) {fnResolveRead = fnResolve;});

		oBinding.attachDataRequested(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oBinding, "dataRequested - correct source");
			iDataRequestedCount++;
		});

		oBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oBinding, "dataReceived - correct source");
			assert.strictEqual(iDataRequestedCount, 1, "dataRequested fired");
			iDataReceivedCount++;
		});

		// read returns an unresolved Promise to be resolved by submitBatch; otherwise this
		// Promise would be resolved before the rendering and dataReceived would be fired
		// before dataRequested
		oCacheMock.expects("read").withArgs("", "bar")
			.callsArg(2)
			.returns(oReadPromise);
		this.oSandbox.stub(oModel.oRequestor, "submitBatch", function () {
			// submitBatch resolves the promise of the read
			fnResolveRead("value");
		});

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
			assert.strictEqual(iDataReceivedCount, 1, "dataReceived fired");

			// the second time the cache has the value and returns a resolved promise
			oCacheMock.expects("read").withArgs("", "bar")
				.returns(Promise.resolve("value"));

			return oBinding.requestValue("bar").then(function (vValue) {
				assert.strictEqual(vValue, "value");
				assert.strictEqual(iDataRequestedCount, 1, "dataReceived not fired again");
				assert.strictEqual(iDataReceivedCount, 1, "dataReceived not fired again");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			iDataReceivedCount = 0,
			oExpectedError = new Error("Expected read failure");

		oBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getSource(), oBinding, "dataReceived - correct source");
			assert.strictEqual(oEvent.getParameter("error"), oExpectedError, "expected error");
			iDataReceivedCount++;
		});

		this.oSandbox.mock(oBinding.oCache).expects("read").withArgs("", "bar")
			.callsArg(2)
			.returns(Promise.reject(oExpectedError));
		this.oLogMock.expects("error").withExactArgs("Failed to read path /absolute",
			oExpectedError, "sap.ui.model.odata.v4.ODataContextBinding");

		return oBinding.requestValue("bar").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
			assert.strictEqual(iDataReceivedCount, 1);
		});
	});


	//*********************************************************************************************
	QUnit.test("requestValue: relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oNestedBinding,
			oPromise = {};

		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.oSandbox.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("requestValue").withExactArgs("navigation/bar").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue("bar"), oPromise);

		oContextMock.expects("requestValue").withExactArgs("navigation").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue(""), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContextBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () { //TODO implement
			oContextBinding.refresh(false);
		}, new Error("Unsupported operation: ODataContextBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () {
			oContextBinding.refresh("foo"/*truthy*/);
		}, new Error("Unsupported operation: ODataContextBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () { //TODO implement
			oContextBinding.refresh(true, "");
		}, new Error("Unsupported operation: ODataContextBinding#refresh, "
				+ "sGroupId parameter must not be set"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oContextBinding,
			oContextBindingMock = this.oSandbox.mock(ContextBinding.prototype),
			mEventParameters = {},
			oModel = new ODataModel("/service/"),
			oReturn = {};

		oContextBinding = oModel.bindContext("SO_2_BP");

		["change", "dataRequested", "dataReceived"].forEach(function (sEvent) {
			oContextBindingMock.expects("attachEvent")
			.withExactArgs(sEvent, mEventParameters).returns(oReturn);

			assert.strictEqual(oContextBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});
	});
});
