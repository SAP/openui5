/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/_Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding"
], function (ManagedObject, BindingMode, ChangeReason, PropertyBinding, TypeString, _Context,
		_ODataHelper, _Cache, ODataModel, ODataPropertyBinding) {
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

			this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);
			return this.oSandbox.mock(oCache);
		},

		/**
		 * Creates a test control bound to a v4.ODataModel. Initializes the control's text property
		 * asynchronously. Waits for the value to be present and passes the property binding for
		 * "text" to the resolve handler.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @param {number} [iNoOfRequests=1]
		 *   the number of expected calls to requestValue
		 * @param {Error} [oError]
		 *   optional error with which requestValue rejects in the second call
		 * @returns {Promise}
		 *   a promise to be resolved when the control's text property has been initialized. The
		 *   resolve function passes the text binding as parameter.
		 */
		createTextBinding : function (assert, iNoOfRequests, oError) {
			var oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel}),
				that = this;

			return new Promise(function (fnResolve, fnReject) {
				var oBinding,
					fnChangeHandler = function (oEvent) {
						assert.strictEqual(oControl.getText(), "value", "initialized");
						assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
						oBinding.detachChange(fnChangeHandler);
						fnResolve(oBinding);
					},
					oContextBindingMock;

				oControl.bindObject("/EntitySet('foo')");
				oContextBindingMock = that.oSandbox.mock(oControl.getObjectBinding());
				oContextBindingMock.expects("requestValue")
					.exactly(iNoOfRequests || 1)
					.withExactArgs("property", /*sPath*/undefined)
					.returns(Promise.resolve("value"));
				if (oError) {
					oContextBindingMock.expects("requestValue")
						.withExactArgs("property", /*sPath*/undefined)
						.returns(Promise.reject(oError));
				}
				oControl.bindProperty("text", {
					path : "property",
					type : new TypeString()
				});

				assert.strictEqual(oControl.getText(), /*sPath*/undefined,
					"synchronous: no value yet");
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
				oContext = _Context.create(oModel, null, "/EMPLOYEES(ID='42')");

			if (bAbsolute) {
				this.mock(_Cache).expects("createSingle")
					.withExactArgs(sinon.match.same(oModel.oRequestor), sPath.slice(1), {}, true)
					.returns(oCache);
			} else {
				this.mock(_Cache).expects("createSingle").never();
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

		oHelperMock = this.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(oModel.mUriParameters, mParameters)
			.returns(mQueryOptions);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES(ID='1')/Name",
				sinon.match.same(mQueryOptions), true);

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
	["", "/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindProperty: invalid path: " + sPath, function (assert) {
			var oModel = new ODataModel("/service/");

			assert.throws(function () {
				oModel.bindProperty(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdate(" + bForceUpdate + "): unchanged", function (assert) {
			return this.createTextBinding(assert, 2).then(function (oBinding) {
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
		var oError = new Error("Expected failure");

		return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			var bChangeReceived = false;

			assert.strictEqual(oBinding.getValue(), "value",
				"value is set before failing read");
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
		var oError = new Error("Expected failure");

		return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			var done = assert.async();

			oBinding.attachChange(function () {
				done();
			});

			// code under test
			oBinding.checkUpdate(true);
		});
	});

	//*********************************************************************************************
	QUnit.test("ManagedObject.bindProperty w/ relative path, then bindObject", function (assert) {
		var oCacheMock = this.oSandbox.mock(_Cache),
			done = assert.async(),
			oModel = new ODataModel("/service/"),
			oControl = new TestControl({models : oModel});

		oCacheMock.expects("createSingle").never();

		//code under test
		oControl.bindProperty("text",{
			path : "property",
			type : new TypeString()
		});

		oControl.getBinding("text").attachChange(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Context);
			assert.strictEqual(oControl.getText(), "value");
			done();
		});
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {})
			.returns({
				read : function (sGroupId, sPath) {
					assert.strictEqual(sPath, "property");
					return Promise.resolve("value");
				}
			});

		// This creates and initializes a context binding at the control. The change handler of the
		// context binding calls setContext at the property's binding which completes the path and
		// triggers a checkUpdate (resulting in the read). This then fires a change event at the
		// property binding.
		oControl.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	QUnit.test("setContext on binding with absolute path", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContext = _Context.create(oModel, null, "/EntitySet('bar')"),
			oBinding = oModel.bindProperty("/EntitySet('foo')/property");

		this.oSandbox.mock(oContext).expects("requestValue").never(); // due to absolute path

		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("ManagedObject.bindProperty: type and value, path " + sPath, function (assert) {
			var bAbsolute = sPath[0] === "/",
				oValue = "foo",
				fnResolveRead,
				oReadPromise = new Promise(function (fnResolve) {fnResolveRead = fnResolve;}),
				oCache = {
					read : function (sGroupId, sReadPath, fnDataRequested) {
						fnDataRequested();
						// read returns an unresolved Promise to be resolved by submitBatch;
						// otherwise this Promise would be resolved before the rendering and
						// dataReceived would be fired before dataRequested
						return oReadPromise;
					}
				},
				oCacheMock = this.oSandbox.mock(_Cache),
				oContextBindingMock,
				sContextPath = "/EMPLOYEES(ID='42')",
				iDataReceivedCount = 0,
				iDataRequestedCount = 0,
				done = assert.async(),
				oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel}),
				sResolvedPath,
				oType = new TypeString();

			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor), sContextPath.slice(1), {});
			oControl.bindObject(sContextPath);
			oContextBindingMock = this.oSandbox.mock(oControl.getObjectBinding());
			if (bAbsolute) { // absolute path: use cache on binding
				sResolvedPath = sPath;
				oContextBindingMock.expects("requestValue").never();
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(oModel.oRequestor), sResolvedPath.slice(1), {},
						true)
					.returns(oCache);
				this.oSandbox.stub(oModel.oRequestor, "submitBatch", function () {
					// submitBatch resolves the promise of the read
					fnResolveRead(oValue);
				});
			} else {
				sResolvedPath = sContextPath + "/" + sPath;
				oContextBindingMock.expects("requestValue")
					.withExactArgs(sPath, /*iIndex*/undefined)
					.returns(Promise.resolve(oValue));
			}
			this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
				.withExactArgs(sResolvedPath)
				.returns(Promise.resolve(oType));
			this.oSandbox.mock(oType).expects("formatValue").withExactArgs(oValue, "string");

			//code under test
			oControl.bindProperty("text", {path : sPath, events : {
				change : function () {
					var oBinding = oControl.getBinding("text");

					assert.strictEqual(oBinding.getType(), oType);
					assert.strictEqual(oBinding.getValue(), oValue);
					if (!bAbsolute) {
						assert.strictEqual(iDataRequestedCount, 0);
						done();
					}
				},
				dataRequested : function (oEvent) {
					assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"),
						"dataRequested - correct source");
					iDataRequestedCount++;
				},
				dataReceived : function (oEvent) {
					var oBinding = oControl.getBinding("text");

					assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"),
						"dataReceived - correct source");
					assert.strictEqual(iDataRequestedCount, 1);
					assert.strictEqual(oBinding.getType(), oType);
					assert.strictEqual(oBinding.getValue(), oValue);
					iDataReceivedCount++;
					done();
				}
			}});

			assert.strictEqual(iDataRequestedCount, 0, "dataRequested not (yet) fired");
			assert.strictEqual(iDataReceivedCount, 0, "dataReceived not (yet) fired");
		});
	});

	//*********************************************************************************************
	[
		{}, // complex structural property
		[] // collection
		//TODO Geo types, see 7.1 Primitive Value,
		// e.g. {"type" : "point", "coordinates" : [142.1, 64.1]}
	].forEach(function (oValue) {
		QUnit.test("bindProperty with non-primitive " + JSON.stringify(oValue), function (assert) {
			var oBinding,
				oCache = {
					read : function (sGroupId, sPath, fnDataRequested) {
						fnDataRequested();
						return Promise.resolve(oValue);
					}
				},
				oCacheMock = this.oSandbox.mock(_Cache),
				done = assert.async(),
				oModel = new ODataModel("/service/"),
				oControl = new TestControl({models : oModel}),
				sPath = "/path",
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdate"),
				oTypeError = new Error("Unsupported EDM type...");

			oCacheMock.expects("createSingle").returns(oCache);
			this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
				.withExactArgs(sPath)
				.returns(Promise.reject(oTypeError));
			this.oLogMock.expects("warning").withExactArgs(oTypeError.message, sPath,
				"sap.ui.model.odata.v4.ODataPropertyBinding");
			this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
				"sap.ui.model.odata.v4.ODataPropertyBinding");

			//code under test
			oControl.bindProperty("text", {path : sPath, events : {
				dataReceived : function (oEvent) {
					var oBinding = oControl.getBinding("text");
					assert.strictEqual(oBinding.getType(), undefined);
					assert.strictEqual(oBinding.getValue(), undefined);
					assert.strictEqual(oEvent.getParameter("error"), undefined, "no read error");
					done();
				}
			}});

			oBinding = oControl.getBinding("text");
			return oSpy.returnValues[0].then(function () {
				assert.strictEqual(oBinding.getType(), undefined);
				assert.strictEqual(oBinding.getValue(), undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("dataReceived with error", function (assert) {
		var oError = new Error("Expected read failure"),
			oCache = {
				read : function (sGroupId, sPath, fnDataRequested) {
					fnDataRequested();
					return Promise.reject(oError);
				}
			},
			done = assert.async(),
			oModel = new ODataModel("/service/"),
			oControl = new TestControl({models : oModel});

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);
		this.oLogMock.expects("error").withExactArgs("Failed to read path /path", oError,
			"sap.ui.model.odata.v4.ODataPropertyBinding");

		//code under test
		oControl.bindProperty("text", {path : "/path", type : new sap.ui.model.type.String(),
			events : {
				dataReceived : function (oEvent) {
					assert.strictEqual(oEvent.getParameter("error"), oError, "expected error");
					done();
				}
			}
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
		oCacheMock.expects("read").returns(Promise.resolve("foo"));
		// force non-primitive error
		oCacheMock.expects("read").returns(Promise.resolve({}));

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

		this.getCacheMock().expects("read").returns(Promise.resolve("foo"));
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

		this.getCacheMock().expects("read").returns(Promise.resolve("foo"));
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

				oCacheMock.expects("read").returns(Promise.resolve("foo"));
				oCacheMock.expects("read")
					.returns(Promise.resolve("update")); // 2nd read gets an update
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
		oCacheMock.expects("read").returns(Promise.resolve("foo"));
		oCacheMock.expects("refresh");
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type")
			.withExactArgs(sPath)
			.returns(Promise.resolve(new TypeString()));

		oBinding = oModel.bindProperty(sPath);

		// refresh triggers change
		oBinding.attachChange(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
			done();
		});

		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oCacheMock = this.getCacheMock(),
			iChangedCount = 0,
			iDataReceivedCount = 0,
			done = assert.async(),
			oError = new Error(),
			oModel = new ODataModel("/service/?sap-client=111"),
			oBinding,
			sPath = "/EMPLOYEES(ID='1')/Name";

		oError.canceled = true; // simulate canceled cache read
		// initial read and after refresh
		oCacheMock.expects("read").callsArg(2).returns(Promise.reject(oError));
		oCacheMock.expects("read").callsArg(2).returns(Promise.resolve("foo"));
		oCacheMock.expects("refresh");
		this.oSandbox.mock(oModel.getMetaModel()).expects("requestUI5Type").twice()
			.withExactArgs(sPath)
			.returns(Promise.resolve(new TypeString()));

		oBinding = oModel.bindProperty(sPath);

		// dataReceived is expected twice w/o error, even for the cancelled request
		oBinding.attachDataReceived(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("error"), undefined, "no error");
			iDataReceivedCount++;
			if (iDataReceivedCount === 2) {
				assert.strictEqual(iChangedCount, 1, "only refresh fires change");
				done();
			}
		});

		oBinding.attachChange(function () {
			iChangedCount++;
		});

		// trigger read before refresh
		oBinding.checkUpdate(false);
		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oModel = new ODataModel("/service/?sap-client=111"),
			oBinding = oModel.bindProperty("Name");

		// no cache for relative bindings
		this.oSandbox.mock(_Cache).expects("createSingle").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("binding Mode", function (assert) {
		var oMock = this.oSandbox.mock(PropertyBinding.prototype),
			oModel = new ODataModel("/service/"),
			oPropertyBinding = oModel.bindProperty("Name"),
			oReturn = {};

		oMock.expects("setBindingMode").withExactArgs(BindingMode.OneTime).returns(oReturn);
		oMock.expects("setBindingMode").withExactArgs(BindingMode.OneWay, "foo");

		assert.strictEqual(oPropertyBinding.setBindingMode(BindingMode.OneTime), oReturn);
		oPropertyBinding.setBindingMode(BindingMode.OneWay, "foo");
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = new ODataModel("/service/"),
			oPropertyBinding = oModel.bindProperty("Name");

		assert.throws(function () { //TODO implement
			oPropertyBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#isInitial"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.refresh(false);
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () {
			oPropertyBinding.refresh("foo"/*truthy*/);
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () { //TODO implement
			oPropertyBinding.refresh(true, "");
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#refresh, "
				+ "sGroupId parameter must not be set"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.resume();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#resume"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.setBindingMode(BindingMode.TwoWay);
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#setBindingMode, "
				+ "sBindingMode must not be TwoWay"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.setValue();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#setValue"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.suspend();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#suspend"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var mEventParameters = {},
			oMock = this.oSandbox.mock(PropertyBinding.prototype),
			oModel = new ODataModel("/service/"),
			oPropertyBinding,
			oReturn = {};

		oMock.expects("attachEvent").withExactArgs("change", mEventParameters).returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataReceived", mEventParameters)
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataRequested", mEventParameters)
			.returns(oReturn);

		oPropertyBinding = oModel.bindProperty("Name");

		assert.strictEqual(oPropertyBinding.attachEvent("change", mEventParameters), oReturn);
		assert.strictEqual(oPropertyBinding.attachEvent("dataReceived", mEventParameters),
			oReturn);
		assert.strictEqual(oPropertyBinding.attachEvent("dataRequested", mEventParameters),
			oReturn);

		assert.throws(function () {
			oPropertyBinding.attachDataStateChange();
		}, new Error("Unsupported event 'DataStateChange': v4.ODataPropertyBinding#attachEvent"));

		assert.throws(function () {
			oPropertyBinding.attachAggregatedDataStateChange();
		}, new Error("Unsupported event 'AggregatedDataStateChange': "
				+ "v4.ODataPropertyBinding#attachEvent"));
	});

	// TODO bSuspended? In v2 it is ignored (check with core)
	// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.

});
