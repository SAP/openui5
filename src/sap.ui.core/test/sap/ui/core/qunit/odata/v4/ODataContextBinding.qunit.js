/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, Cache, Helper, ODataContextBinding, ODataModel) {
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
		 * Note: This function mocks the model and holds the mock in this.oModelMock.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @returns {Promise}
		 *   a promise to be resolved when the control's bound context has been initialized.
		 *   The resolve function passes the context binding as parameter.
		 */
		createContextBinding : function (assert) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel});

			this.oModelMock = this.oSandbox.mock(oModel);
			this.oModelMock.expects("read").never();
			return new Promise(function (fnResolve, fnReject) {
				var oBinding;

				oControl.bindObject("/EntitySet('foo')/child");
				oBinding = oControl.getObjectBinding();
				assert.strictEqual(oBinding.getBoundContext(), null,
					"synchronous: no bound context yet");
				oBinding.attachChange(function () {
					assert.strictEqual(oBinding.getBoundContext().getPath(),
						"/EntitySet('foo')/child;root=0", "after initialize");
					fnResolve(oBinding);
				});
			});
		}
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdate(" + bForceUpdate + "): unchanged", function (assert) {
			return this.createContextBinding(assert).then(function (oBinding) {
				var bGotChangeEvent = false;

				oBinding.attachChange(function () {
					bGotChangeEvent = true;
				});

				// code under test
				oBinding.checkUpdate(bForceUpdate).then(function () {
					assert.strictEqual(bGotChangeEvent, bForceUpdate,
						"got change event as expected");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("relative path", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContext = oModel.bindContext("SO_2_BP");
		assert.throws(function () {
			oContext.setContext("/SalesOrders(ID='1')")
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
			oModelMock = this.oSandbox.mock(oModel),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oModel.getContext("/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')", "TEAM_2_EMPLOYEES(ID='1')", ""].forEach(function (sPath) {
		QUnit.test("bindContext, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = jQuery.sap.startsWith(sPath, "/"),
				oModel = new ODataModel("/service/?sap-client=111"),
				oCache = {},
				oContext = oModel.getContext("/TEAMS('TEAM_01')"),
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
			assert.strictEqual(oBinding.getPath(), bAbsolute ? sPath + ";root=0" : sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("readValue fulfill", function (assert) {
		var oBinding,
			oCache = {
				read : function () {},
				toString : function () { return "/service/EMPLOYEES(ID='1')?sap-client=111"; }
			},
			oCacheMock = this.oSandbox.mock(oCache),
			oModel = new ODataModel("/service/?sap-client=111"),
			oResult = {
				AGE : 32,
				Name : "Frederic Fall",
				LOCATION : {
					COUNTRY : "Germany"
				},
				NullValue : null
			};

		oCacheMock.expects("read").exactly(6).returns(Promise.resolve(oResult));
		this.oSandbox.mock(Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES(ID='1')", {
				"sap-client" : "111"
			})
			.returns(oCache);

		this.oLogMock.expects("warning").withExactArgs(
			"Failed to read value for /service/EMPLOYEES(ID='1')"
				+ "?sap-client=111 and path Foo/COUNTRY: "
				+ "Invalid segment COUNTRY",
			null,
			"sap.ui.model.odata.v4.ODataContextBinding");

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')");
		return Promise.all([
			oBinding.readValue("Name"),
			oBinding.readValue("LOCATION/COUNTRY"),
			oBinding.readValue("Foo/COUNTRY"),
			oBinding.readValue("NullValue"),
			oBinding.readValue("", true),
			oBinding.readValue("Name", true)
		]).then(function (aData) {
			assert.strictEqual(aData[0], "Frederic Fall");
			assert.strictEqual(aData[1], "Germany");
			assert.strictEqual(aData[2], undefined, "Foo/COUNTRY");
			assert.strictEqual(aData[3], null);
			assert.strictEqual(aData[4], oResult);
			assert.strictEqual(aData[5], "Frederic Fall");
		});
	});

	//*********************************************************************************************
	QUnit.test("readValue reject", function (assert) {
		var oBinding,
			oCache = {
				read : function () {},
				toString : function () { return "/service/EMPLOYEES(ID='1')?sap-client=111"; }
			},
			sMessage = "Accessed value is not primitive",
			oErrorRead = new Error("Cache read error"),
			oCacheMock = this.oSandbox.mock(oCache),
			oModel = new ODataModel("/service/?sap-client=111"),
			oResult = {
				AGE : 32,
				Name : "Frederic Fall",
				LOCATION : {
					COUNTRY : "Germany"
				},
				NullValue : null
			};

		oCacheMock.expects("read").returns(Promise.resolve(oResult));
		this.oSandbox.mock(Cache).expects("createSingle").returns(oCache);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value for /service/EMPLOYEES(ID='1')?sap-client=111"
				+ " and path LOCATION",
				// custom matcher because mobile Safari adds line and column properties to Error
				sinon.match(function (oError) {
					return oError instanceof Error && oError.message === sMessage;
				}), "sap.ui.model.odata.v4.ODataContextBinding");

		oCacheMock.expects("read").returns(Promise.reject(oErrorRead));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value for /service/EMPLOYEES(ID='1')?sap-client=111"
				+ " and path Name",
				oErrorRead, "sap.ui.model.odata.v4.ODataContextBinding");

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')");
		return Promise.all([
			oBinding.readValue("LOCATION", false).then(
				function () {
					assert.ok(false, "Unexpected success");
				},
				function (oError0) {
					assert.strictEqual(oError0.message, sMessage);
				}
			),
			oBinding.readValue("Name").then(
				function () {
					assert.ok(false, "Unexpected success");
				},
				function (oError0) {
					assert.strictEqual(oError0, oErrorRead);
				}
			)
		]);
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
			oContext = oModel.getContext("/TEAMS('TEAM_01')"),
			oBinding;

		this.oSandbox.mock(Cache).expects("createSingle").returns(oCache);

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oCache).expects("refresh");
		this.oSandbox.mock(oBinding).expects("_fireChange");

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Falsy values for bForceUpdate are not supported"));
		assert.throws(function () {
			oBinding.refresh(false);
		}, new Error("Falsy values for bForceUpdate are not supported"));

		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oModel = new ODataModel("/service/?sap-client=111"),
			oContext = oModel.getContext("/TEAMS('TEAM_01')"),
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
			oContext = oModel.getContext("/TEAMS('TEAM_01')"),
			oPromise;

		this.oSandbox.mock(oModel.oRequestor).expects("request")
			.returns(Promise.resolve({value : {"ID" : "1"}}));
		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange");

		// trigger read before refresh
		oPromise = oBinding.readValue("ID").then(function () {
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
});
