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
], function (ManagedObject, ChangeReason, ContextBinding, Cache, _Context, Helper,
		ODataContextBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataContextBinding", {
			metadata : {
				properties : {
					text : "string"
				},
				aggregations : {
					child : {
						multiple : false,
						type : "test.sap.ui.model.odata.v4.ODataContextBinding"
					}
				}
			}
		});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		},

		/**
		 * Initializes the control's text property asynchronously. Waits for the bound context
		 * to be present and passes the context binding to the resolve handler.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @param {string} [sPath="/EntitySet('foo')/child"]
		 *   Some path
		 * @param {sap.ui.model.Context} [oContext]
		 *   Some context
		 * @returns {Promise}
		 *   a promise to be resolved when the control's bound context has been initialized.
		 *   The resolve function passes the context binding as parameter.
		 */
		createContextBinding : function (assert, sPath, oContext) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel});

			sPath = sPath || "/EntitySet('foo')/child";
			return new Promise(function (fnResolve, fnReject) {
				var oBinding;

				oControl.setBindingContext(oContext);
				oControl.bindObject(sPath);
				oBinding = oControl.getObjectBinding();
				assert.strictEqual(oBinding.getBoundContext(), null,
					"synchronous: no bound context yet");
				oBinding.attachChange(function () {
					if (!oContext) {
						assert.strictEqual(oBinding.getBoundContext().getPath(), sPath,
							"after initialize");
					}
					fnResolve(oBinding);
				});
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: unchanged", function (assert) {
		return this.createContextBinding(assert).then(function (oBinding) {
			var bGotChangeEvent = false;

			oBinding.attachChange(function () {
				bGotChangeEvent = true;
			});

			// code under test
			oBinding.checkUpdate(true).then(function () {
				assert.ok(bGotChangeEvent, "got change event as expected");
			});
		});
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
			oContext = oModel.bindContext("SO_2_BP");

		assert.throws(function () {
			oContext.setContext("/SalesOrders(ID='1')");
		}, new Error("Nested context bindings are not supported"));
	});

	//*********************************************************************************************
	//TODO support nested context bindings
	QUnit.skip("ManagedObject.bindObject on child (relative), then on parent", function (assert) {
		var oBinding,
			oChild = new TestControl(),
			done = assert.async(),
			oModel = new ODataModel("/service/"),
			oParent = new TestControl({models : oModel, child : oChild});

		// This should not trigger anything yet
		oChild.bindObject("child");

		oBinding = oChild.getObjectBinding();
		oBinding.attachChange(function () {
			assert.strictEqual(oBinding.getBoundContext().getPath(),
				"/EntitySet('foo')/child");

			done();
		});

		// This creates and initializes a context binding at the parent. The change handler of the
		// context binding calls setContext at the child's context binding which completes the path
		// and triggers a checkUpdate. This then fires a change event at the child's context
		// binding.
		oParent.bindObject("/EntitySet('foo')");
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
				this.oSandbox.mock(Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);
			} else {
				this.oSandbox.mock(Cache).expects("createSingle").never();
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

		oHelperMock = this.mock(Helper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(oModel.mUriParameters, mParameters, ["$expand", "$select"])
			.returns(mQueryOptions);
		this.mock(Cache).expects("createSingle")
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

		this.oSandbox.mock(Cache).expects("createSingle").returns(oCache);

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

		this.oSandbox.mock(Cache).expects("createSingle").never();

		oBinding = oModel.bindContext("TEAM_2_EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		this.oSandbox.mock(oModel.oRequestor).expects("request")
			.returns(Promise.resolve({"ID" : "1"}));
		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange");

		// trigger read before refresh
		oPromise = oBinding.requestValue("ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});
		oBinding.refresh(true);
		return oPromise;
	});
	// TODO check behavior if request for refresh fails (e.g. if data is already deleted)
	// TODO events dataRequested, dataReceived
	// TODO bSuspended? In v2 it is ignored (check with core)

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding", function (assert) {
		var that = this;

		return this.createContextBinding(assert).then(function (oBinding) {
			var oPromise = {};

			that.oSandbox.mock(oBinding.oCache).expects("read")
				.withArgs("", "bar")
				.callsArg(2)
				.returns(oPromise);
			that.oSandbox.mock(oBinding.getModel()).expects("dataRequested")
				.withExactArgs("", sinon.match.typeOf("function"));

			assert.strictEqual(oBinding.requestValue("bar"), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: relative binding", function (assert) {
		var that = this;

		return this.createContextBinding(assert).then(function (oBinding) {
			var oContext = oBinding.getBoundContext(),
				oContextMock = that.oSandbox.mock(oContext);

			return that.createContextBinding(assert, "navigation", oContext)
				.then(function (oNestedBinding) {
					var oPromise = {};

					oContextMock.expects("requestValue")
						.withExactArgs("navigation/bar")
						.returns(oPromise);

					assert.strictEqual(oNestedBinding.requestValue("bar"), oPromise);

					oContextMock.expects("requestValue")
						.withExactArgs("navigation")
						.returns(oPromise);

					assert.strictEqual(oNestedBinding.requestValue(""), oPromise);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContextBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () {
			oContextBinding.checkUpdate(false);
		}, new Error("Unsupported operation: ODataContextBinding#checkUpdate, "
				+ "bForceUpdate must be true"));

		assert.throws(function () { //TODO implement
			oContextBinding.refresh(false);
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
			mEventParameters = {},
			oModel = new ODataModel("/service/"),
			oReturn = {};

		this.oSandbox.mock(ContextBinding.prototype).expects("attachEvent")
			.withExactArgs("change", mEventParameters).returns(oReturn);

		oContextBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () {
			oContextBinding.attachEvent("dataReceived");
		}, new Error("Unsupported event 'dataReceived': ODataContextBinding#attachEvent"));

		assert.throws(function () {
			oContextBinding.attachEvent("dataRequested");
		}, new Error("Unsupported event 'dataRequested': ODataContextBinding#attachEvent"));

		assert.strictEqual(oContextBinding.attachEvent("change", mEventParameters), oReturn);
	});
});
