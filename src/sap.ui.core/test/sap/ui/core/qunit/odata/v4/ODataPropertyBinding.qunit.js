/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, TypeString, Cache, Helper, ODataPropertyBinding,
		ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
			metadata : {
				properties : {
					text : "string"
				}
			}
		});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataPropertyBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		},

		/**
		 * Creates a Sinon mock for a cache object with read and refresh method.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getCacheMock : function () {
			var oCache = {
					read : function () {},
					refresh : function () {}
				};

			this.oSandbox.mock(Cache).expects("createSingle").returns(oCache);
			return this.oSandbox.mock(oCache);
		},

		/**
		 * Creates a test control bound to a v4.ODataModel. Initializes the control's text property
		 * asynchronously. Waits for the value to be present and passes the property binding for
		 * "text" to the resolve handler.
		 *
		 * Note: This function mocks the model and holds the mock in this.oModelMock.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @returns {Promise}
		 *   a promise to be resolved when the control's text property has been initialized. The
		 *   resolve function passes the text binding as parameter.
		 */
		createTextBinding : function (assert) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel});

			this.oModelMock = this.oSandbox.mock(oModel);
			this.oModelMock.expects("read").withExactArgs("/EntitySet('foo')/property")
				.returns(Promise.resolve({value : "value"}));

			return new Promise(function (fnResolve, fnReject) {
				var oBinding,
					fnChangeHandler = function () {
						assert.strictEqual(oControl.getText(), "value", "initialized");
						oBinding.detachChange(fnChangeHandler);
						fnResolve(oBinding);
					};

				oControl.bindProperty("text", {
					path : "property",
					type : new TypeString()
				});
				oControl.setBindingContext(oModel.getContext("/EntitySet('foo')"));

				assert.strictEqual(oControl.getText(), undefined, "synchronous: no value yet");
				oBinding = oControl.getBinding("text");
				oBinding.attachChange(fnChangeHandler);
			});
		}
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("bindProperty, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = sPath[0] === "/",
				oBinding,
				oCache = {},
				oModel = new ODataModel("/service/"),
				oContext = oModel.getContext("/EMPLOYEES(ID='42')");

			if (bAbsolute) {
				this.mock(Cache).expects("createSingle").withExactArgs(
						sinon.match.same(oModel.oRequestor), sPath.slice(1), {}
					).returns(oCache);
			} else {
				this.mock(Cache).expects("createSingle").never();
			}

			oBinding = oModel.bindProperty(sPath, oContext);

			assert.ok(oBinding instanceof ODataPropertyBinding);
			assert.strictEqual(oBinding.getModel(), oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oHelperMock,
			oModel = new ODataModel("/service/?sap-client=111"),
			mParameters = {"custom" : "foo"},
			mQueryOptions = {};

		oHelperMock = this.mock(Helper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(oModel.mUriParameters, mParameters)
			.returns(mQueryOptions);
		this.mock(Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES(ID='1')/Name",
				sinon.match.same(mQueryOptions));

		oBinding = oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			oModel.bindProperty("Name", null, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdate(" + bForceUpdate + "): unchanged", function (assert) {
			var that = this;

			return this.createTextBinding(assert).then(function (oBinding) {
				var bGotChangeEvent = false;

				that.oModelMock.expects("read")
					.withExactArgs("/EntitySet('foo')/property")
					.returns(Promise.resolve({value : "value"}));
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
	QUnit.test("checkUpdate(): unresolved path after setContext", function (assert) {
		var done = assert.async(),
			fnChangeHandler = function () {
				done();
			};
		this.createTextBinding(assert).then(function (oBinding) {
			assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
			oBinding.attachChange(fnChangeHandler);
			oBinding.setContext(); // reset context triggers checkUpdate
			assert.strictEqual(oBinding.getValue(), undefined, "value after context reset");
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): read error", function (assert) {
		var that = this;

		return this.createTextBinding(assert).then(function (oBinding) {
			var bChangeReceived = false,
				oError = new Error("Expected failure"),
				sPath = "/EntitySet('foo')/property";

			assert.strictEqual(oBinding.getValue(), "value",
				"value is set before failing read");
			that.oModelMock.expects("read").withExactArgs(sPath)
				.returns(Promise.reject(oError));
			that.oLogMock.expects("error").withExactArgs("Failed to read path " + sPath, oError,
				"sap.ui.model.odata.v4.ODataPropertyBinding");
			oBinding.attachChange(function () {
				bChangeReceived = true;
			});

			// code under test
			oBinding.checkUpdate(false).then(function () {
				assert.strictEqual(oBinding.getValue(), undefined,
					"read error resets the value");
				assert.ok(bChangeReceived, "Value changed -> expecting change event");
			}, function () {
				assert.ok(false, "unexpected failure");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): read error with force update", function (assert) {
		var that = this;

		return this.createTextBinding(assert).then(function (oBinding) {
			var done = assert.async(),
				oError = new Error("Expected failure"),
				sPath = "/EntitySet('foo')/property";

			that.oModelMock.expects("read").withExactArgs(sPath)
				.returns(Promise.reject(oError));
			that.oLogMock.expects("error").withExactArgs("Failed to read path " + sPath, oError,
				"sap.ui.model.odata.v4.ODataPropertyBinding");
			oBinding.attachChange(function () {
				done();
			});

			// code under test
			oBinding.checkUpdate(true);
		});
	});

	//*********************************************************************************************
	QUnit.test("ManagedObject.bindProperty w/ relative path, then bindObject", function (assert) {
		var done = assert.async(),
			oModel = new ODataModel("/service/"),
			oModelMock = this.oSandbox.mock(oModel),
			oControl = new TestControl({models : oModel});

		oModelMock.expects("read").never();
		oControl.bindProperty("text",{
			path : "property",
			type : new TypeString()
		});
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "value");
			done();
		});

		oModelMock.expects("read").withExactArgs("/EntitySet('foo');root=0/property")
			.returns(Promise.resolve({value : "value"}));

		// This creates and initializes a context binding at the control. The change handler of the
		// context binding calls setContext at the property's binding which completes the path and
		// triggers a checkUpdate (resulting in the read). This then fires a change event at the
		// property binding.
		oControl.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	QUnit.test("setContext on binding with absolute path", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContext = oModel.getContext("/EntitySet('bar')"),
			oModelMock = this.oSandbox.mock(oModel),
			oBinding = oModel.bindProperty("/EntitySet('foo')/property");

		oModelMock.expects("read").never(); // no read expected due to absolute path

		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("ManagedObject.bindProperty: type and value, path " + sPath, function (assert) {
			var bAbsolute = sPath[0] === "/",
				oBinding,
				oCache = {
					read : function () {}
				},
				oCacheMock = this.oSandbox.mock(Cache),
				oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel}),
				sContextPath = "/EMPLOYEES(ID='42')",
				sResolvedPath,
				oType = new TypeString(),
				oValue = "foo",
				done = assert.async();

			if (bAbsolute) { // absolute path: use cache on binding
				sResolvedPath = sPath;
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(oModel.oRequestor), sResolvedPath.slice(1), {})
					.returns(oCache);
				this.oSandbox.mock(oCache).expects("read")
					.returns(Promise.resolve({value : oValue}));
			} else { //TODO use dependent cache for relative path; as of now perform read via model
				sResolvedPath = sContextPath + ";root=0/" + sPath;
				this.oSandbox.mock(oModel).expects("read")
					.withExactArgs(sResolvedPath)
					.returns(Promise.resolve({value : oValue}));
			}
			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor), sContextPath.slice(1), {});
			this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
				.withExactArgs(sResolvedPath)
				.returns(Promise.resolve(oType));
			this.oSandbox.mock(oType).expects("formatValue").withExactArgs(oValue, "string");

			//code under test
			oControl.bindProperty("text", sPath);
			oControl.bindObject(sContextPath);

			oBinding = oControl.getBinding("text");
			oBinding.attachChange(function () {
				assert.strictEqual(oBinding.getType(), oType);
				assert.strictEqual(oBinding.getValue(), oValue);
				done();
			});
		});
	});

	//*********************************************************************************************
	[
		{value : {}}, // complex structural property
		{value : []}, // collection
		{Name : "Frederic Fall", Age : 32} //single entity
		//TODO Geo types, see 7.1 Primitive Value, e.g. {"type": "point","coordinates":[142.1,64.1]}
		//TODO ? {Name: "...", value: "foo", "@odata.context": "$metadata#EntityWithValue/$entity"}
	].forEach(function (oValue) {
		QUnit.test("bindProperty with non-primitive " + JSON.stringify(oValue), function (assert) {
			var oBinding,
				oCache = {
					read : function () {}
				},
				oCacheMock = this.oSandbox.mock(Cache),
				oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel}),
				sPath = "/path",
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdate"),
				oTypeError = new Error("Unsupported EDM type...");

			oCacheMock.expects("createSingle").returns(oCache);
			this.oSandbox.mock(oCache).expects("read")
				.returns(Promise.resolve(oValue));
			this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
				.withExactArgs(sPath)
				.returns(Promise.reject(oTypeError));
			this.oLogMock.expects("warning").withExactArgs(oTypeError.message, sPath,
				"sap.ui.model.odata.v4.ODataPropertyBinding");
			this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
				"sap.ui.model.odata.v4.ODataPropertyBinding");

			//code under test
			oControl.bindProperty("text", sPath);

			oBinding = oControl.getBinding("text");
			return oSpy.returnValues[0].then(function () {
				assert.strictEqual(oBinding.getType(), undefined);
				assert.strictEqual(oBinding.getValue(), undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with non-primitive resets value", function (assert) {
		var oBinding,
			oCacheMock = this.getCacheMock(),
			bChangeReceived = false,
			done = assert.async(),
			oModel = new ODataModel("/service/?sap-client=111"),
			sPath = "/EMPLOYEES(ID='1')/Name";

		// initial read and after refresh
		oCacheMock.expects("read").returns(Promise.resolve({value : "foo"}));
		// force non-primitive error
		oCacheMock.expects("read").returns(Promise.resolve({value : {}}));

		this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
			"sap.ui.model.odata.v4.ODataPropertyBinding");


		oBinding = oModel.bindProperty(sPath);
		oBinding.setType(new TypeString());

		oBinding.checkUpdate(false).then(function () {
			assert.strictEqual(oBinding.getValue(), "foo");
			oBinding.attachChange(function () {
				bChangeReceived = true;
			});
			oBinding.checkUpdate(false).then(function () {
				assert.strictEqual(oBinding.getValue(), undefined, "Value reset");
				assert.ok(bChangeReceived, "Change event received");
				done();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: type already set by app", function (assert) {
		var oModel = new ODataModel("/service/"),
			oControl = new TestControl({models : oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			done = assert.async();

		this.getCacheMock().expects("read").returns(Promise.resolve({value : "foo"}));
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type").never();

		//code under test
		oControl.bindProperty("text", {
			path : sPath,
			type : new sap.ui.model.type.String()
		});

		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oControl.getText(), "foo");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: formatter set by app", function (assert) {
		var oModel = new ODataModel("/service/"),
			oControl = new TestControl({models : oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			oType = new TypeString(),
			done = assert.async();

		this.getCacheMock().expects("read").returns(Promise.resolve({value : "foo"}));
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
			.withExactArgs(sPath)
			.returns(Promise.resolve(oType));
		this.oSandbox.mock(oType).expects("formatValue")
			.withExactArgs("foo", "string")
			.returns("*foo*");

		oControl.bindProperty("text", {
			path : sPath,
			formatter : function (sValue) {
				return "~" + sValue + "~";
			}
		});
		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oBinding.getType(), oType);
			assert.strictEqual(oControl.getText(), "~*foo*~");
			done();
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("automaticTypes: failed type, bForceUpdate = " + bForceUpdate,
			function (assert) {
				var oBinding,
					oError = new Error("failed type"),
					done = assert.async(),
					oModel = new ODataModel("/service/"),
					oCacheMock = this.getCacheMock(),
					oControl = new TestControl({models : oModel}),
					sPath = "/EMPLOYEES(ID='42')/Name";

				oCacheMock.expects("read").returns(Promise.resolve({value : "foo"}));
				oCacheMock.expects("read")
					.returns(Promise.resolve({value : "update"})); // 2nd read gets an update
				this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
					.withExactArgs(sPath) // always requested only once
					.returns(Promise.reject(oError)); // UI5 type not found
				this.oLogMock.expects("warning")
					.withExactArgs("failed type", sPath,
						"sap.ui.model.odata.v4.ODataPropertyBinding");

				function onChange() {
					oBinding.detachChange(onChange);
					oBinding.attachChange(done);
					setTimeout(function () {
						// only with force update, failed type is requested again
						oBinding.checkUpdate(bForceUpdate);
					}, 0);
				}

				// initially, type is requested
				oControl.bindProperty("text", sPath);
				oBinding = oControl.getBinding("text");
				oBinding.attachChange(onChange);
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path", function (assert) {
		var oCacheMock = this.getCacheMock(),
			done = assert.async(),
			oModel = new ODataModel("/service/?sap-client=111"),
			oBinding,
			sPath = "/EMPLOYEES(ID='1')/Name";

		// initial read and after refresh
		oCacheMock.expects("read").returns(Promise.resolve({value : "foo"}));
		oCacheMock.expects("refresh");
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
			.withExactArgs(sPath)
			.returns(Promise.resolve(new TypeString()));

		oBinding = oModel.bindProperty(sPath);

		// refresh triggers change
		oBinding.attachChange(function () {
			done();
		});

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Falsy values for bForceUpdate are not supported"));
		assert.throws(function () {
			oBinding.refresh(false);
		}, new Error("Falsy values for bForceUpdate are not supported"));
		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oCacheMock = this.getCacheMock(),
			done = assert.async(),
			oError = new Error(),
			oModel = new ODataModel("/service/?sap-client=111"),
			oBinding,
			sPath = "/EMPLOYEES(ID='1')/Name";

		oError.canceled = true; // simulate canceled cache read
		// initial read and after refresh
		oCacheMock.expects("read").returns(Promise.reject(oError));
		oCacheMock.expects("read").returns(Promise.resolve({value : "foo"}));
		oCacheMock.expects("refresh");
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type").twice()
			.withExactArgs(sPath)
			.returns(Promise.resolve(new TypeString()));

		oBinding = oModel.bindProperty(sPath);

		// only refresh fires change
		oBinding.attachChange(function () {
			// log mock checks there is no console error from canceling processing of read
			// and if change handler is called a second time test fails with error:
			// Called the callback returned from 'assert.async' more than once
			done();
		});
		// trigger read before refresh
		oBinding.checkUpdate(false);
		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oModel = new ODataModel("/service/?sap-client=111"),
			oBinding = oModel.bindProperty("Name");

		// no Cache for relative bindings
		this.oSandbox.mock(Cache).expects("createSingle").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});
	// TODO bSuspended? In v2 it is ignored (check with core)
	// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.

});
