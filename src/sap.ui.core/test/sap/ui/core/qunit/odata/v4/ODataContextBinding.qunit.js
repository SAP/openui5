/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, Cache, ODataContextBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataContextBinding", {
			metadata: {
				properties: {
					text: "string"
				},
				aggregations: {
					child: {multiple: false, type: "test.sap.ui.model.odata.v4.ODataContextBinding"}
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
				oControl = new TestControl({models: oModel});

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
	//TODO support nested context bindings
	QUnit.skip("ManagedObject.bindObject on child (relative), then on parent", function (assert) {
		var oBinding,
			oChild = new TestControl(),
			done = assert.async(),
			oModel = new ODataModel("/service/"),
			oParent = new TestControl({models: oModel, child: oChild});

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
				mParameters = {"$expand" : "foo"},
				oBinding;

			if (bAbsolute) {
				this.oSandbox.mock(Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor),
					oModel.sServiceUrl + sPath.slice(1), {
					"sap-client" : "111"
				})
				.returns(oCache);
			} else {
				this.oSandbox.mock(Cache).expects("createSingle").never();
			}

			oBinding = oModel.bindContext(sPath, oContext, mParameters);

			assert.ok(oBinding instanceof ODataContextBinding);
			assert.strictEqual(oBinding.getModel(), oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), bAbsolute ? sPath + ";root=0" : sPath);
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);

			//TODO assert.deepEqual(oBinding.mParameters, mParameters);
			//TODO assert.strictEqual(oBinding.sExpand, mParameters["$expand"]);
		});
	});

	//*********************************************************************************************
	QUnit.test("readValue fulfill", function (assert) {
		var oBinding,
			oCache = {
				read: function () {}
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
			.withExactArgs(sinon.match.same(oModel.oRequestor), "/service/EMPLOYEES(ID='1')", {
				"sap-client" : "111"
			})
			.returns(oCache);

		this.oLogMock.expects("warning").withExactArgs(
			"Failed to read value for /service/EMPLOYEES(ID='1') and path Foo/COUNTRY: "
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
				read: function () {}
			},
			sMessage = "Accessed value is not primitive",
			oErrorObjectAccess = new Error(sMessage),
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
			.withExactArgs("Failed to read value for /service/EMPLOYEES(ID='1') and path LOCATION",
				oErrorObjectAccess, "sap.ui.model.odata.v4.ODataContextBinding");

		oCacheMock.expects("read").returns(Promise.reject(oErrorRead));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read value for /service/EMPLOYEES(ID='1') and path Name",
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
	// TODO events dataRequested, dataReceived
	// TODO bSuspended? In v2 it is ignored (check with core)
});
