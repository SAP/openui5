/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/_Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, BindingMode, ChangeReason, PropertyBinding, TypeString,
		_Context, _ODataHelper, _Cache, _Helper, ODataModel, ODataPropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		sServiceUrl = "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/",
		TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
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

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oSandbox.mock(this.oModel.oRequestor).expects("request").never();
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
					refresh : function () {},
					update : function () {}
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
		 *   a promise to be resolved with the text binding as soon as the control's text property
		 *   has been initialized
		 */
		createTextBinding : function (assert, iNoOfRequests, oError) {
			var oControl = new TestControl({models : this.oModel}),
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
	QUnit.test("toString", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name"),
			oContext = {
				toString: function () {return "/EMPLOYEES(ID='1')";}
			};

		assert.strictEqual(oBinding.toString(), sClassName + ": /EMPLOYEES(ID='1')/Name",
			"absolute");

		oBinding = this.oModel.bindProperty("Name");
		assert.strictEqual(oBinding.toString(), sClassName + ": undefined|Name",
			"relative, unresolved");

		oBinding = this.oModel.bindProperty("Name", oContext);

		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /EMPLOYEES(ID='1')|Name", "relative, resolved");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("bindProperty, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = sPath[0] === "/",
				oBinding,
				oCache = {},
				oContext = _Context.create(this.oModel, null, "/EMPLOYEES(ID='42')");

			if (bAbsolute) {
				this.oSandbox.mock(_Cache).expects("createSingle")
					.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1),
						{"sap-client" : "111"}, true)
					.returns(oCache);
			} else {
				this.oSandbox.mock(_Cache).expects("createSingle").never();
			}

			oBinding = this.oModel.bindProperty(sPath, oContext);

			assert.ok(oBinding instanceof ODataPropertyBinding);
			assert.strictEqual(oBinding.getModel(), this.oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oHelperMock = this.oSandbox.mock(_ODataHelper),
			mParameters = {"custom" : "foo"},
			mQueryOptions = {};

		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(this.oModel.mUriParameters, mParameters)
			.returns(mQueryOptions);
		this.oSandbox.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES(ID='1')/Name",
				sinon.match.same(mQueryOptions), true);

		oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			this.oModel.bindProperty("Name", null, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));
	});

	//*********************************************************************************************
	["", "/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindProperty: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindProperty(sPath);
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
			oControl = new TestControl({models : this.oModel});

		oCacheMock.expects("createSingle").never();

		//code under test
		oControl.bindProperty("text", {
			path : "property",
			type : new TypeString()
		});

		oControl.getBinding("text").attachChange(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Context);
			assert.strictEqual(oControl.getText(), "value");
			done();
		});
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {"sap-client" : "111"})
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
		var oContext = _Context.create(this.oModel, null, "/EntitySet('bar')"),
			oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");

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
				oControl = new TestControl({models : this.oModel}),
				sResolvedPath,
				oType = new TypeString();

			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sContextPath.slice(1),
					{"sap-client" : "111"});
			oControl.bindObject(sContextPath);
			oContextBindingMock = this.oSandbox.mock(oControl.getObjectBinding());
			if (bAbsolute) { // absolute path: use cache on binding
				sResolvedPath = sPath;
				oContextBindingMock.expects("requestValue").never();
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResolvedPath.slice(1),
						{"sap-client" : "111"}, true)
					.returns(oCache);
				this.oSandbox.stub(this.oModel.oRequestor, "submitBatch", function () {
					// submitBatch resolves the promise of the read
					fnResolveRead(oValue);
					return Promise.resolve();
				});
			} else {
				sResolvedPath = sContextPath + "/" + sPath;
				oContextBindingMock.expects("requestValue")
					.withExactArgs(sPath, /*iIndex*/undefined)
					.returns(Promise.resolve(oValue));
			}
			this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type")
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
				oControl = new TestControl({models : this.oModel}),
				sPath = "/path",
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdate"),
				oTypeError = new Error("Unsupported EDM type...");

			oCacheMock.expects("createSingle").returns(oCache);
			this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type")
				.withExactArgs(sPath)
				.returns(Promise.reject(oTypeError));
			this.oLogMock.expects("warning").withExactArgs(oTypeError.message, sPath, sClassName);
			this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
				sClassName);

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
			oControl = new TestControl({models : this.oModel});

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);
		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /path", sClassName, sinon.match.same(oError));

		//code under test
		oControl.bindProperty("text", {path : "/path", type : new TypeString(),
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
			sPath = "/EMPLOYEES(ID='1')/Name";

		// initial read and after refresh
		oCacheMock.expects("read").returns(Promise.resolve("foo"));
		// force non-primitive error
		oCacheMock.expects("read").returns(Promise.resolve({}));

		this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
			sClassName);


		oBinding = this.oModel.bindProperty(sPath);
		oBinding.attachChange(function () {
			bChangeReceived = true;
		});
		oBinding.setType(new TypeString());
		assert.ok(!bChangeReceived, "No Change event while initial");

		oBinding.checkUpdate(false).then(function () {
			assert.strictEqual(oBinding.getValue(), "foo");
			oBinding.checkUpdate(false).then(function () {
				assert.strictEqual(oBinding.getValue(), undefined, "Value reset");
				assert.ok(bChangeReceived, "Change event received");
				done();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: type already set by app", function (assert) {
		var oControl = new TestControl({models : this.oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			done = assert.async();

		this.getCacheMock().expects("read").returns(Promise.resolve("foo"));
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type").never();

		//code under test
		oControl.bindProperty("text", {
			path : sPath,
			type : new TypeString()
		});

		var oBinding = oControl.getBinding("text");
		oBinding.attachChange(function () {
			assert.strictEqual(oControl.getText(), "foo");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: formatter set by app", function (assert) {
		var oControl = new TestControl({models : this.oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			oType = new TypeString(),
			done = assert.async();

		this.getCacheMock().expects("read").returns(Promise.resolve("foo"));
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type")
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
					oCacheMock = this.getCacheMock(),
					oControl = new TestControl({models : this.oModel}),
					sPath = "/EMPLOYEES(ID='42')/Name";

				oCacheMock.expects("read").returns(Promise.resolve("foo"));
				oCacheMock.expects("read")
					.returns(Promise.resolve("update")); // 2nd read gets an update
				this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type")
					.withExactArgs(sPath) // always requested only once
					.returns(Promise.reject(oError)); // UI5 type not found
				this.oLogMock.expects("warning")
					.withExactArgs("failed type", sPath, sClassName);

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
			oError = new Error(),
			oBinding,
			oHelperMock = this.oSandbox.mock(_ODataHelper),
			sPath = "/EMPLOYEES(ID='1')/Name",
			oReadPromise = Promise.resolve("foo"),
			oTypePromise = Promise.resolve(new TypeString());

		// initial read and after refresh
		oCacheMock.expects("read").withExactArgs("$direct", undefined, sinon.match.func)
			.returns(oReadPromise);
		oCacheMock.expects("refresh").twice();
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type").twice()
			.withExactArgs(sPath)
			.returns(oTypePromise);

		oBinding = this.oModel.bindProperty(sPath, undefined, {$$groupId : "$direct"});

		this.oSandbox.mock(oBinding).expects("_fireChange").twice()
			.withExactArgs({reason: ChangeReason.Refresh});
		oHelperMock.expects("checkGroupId").withExactArgs(undefined);

		// code under test
		oBinding.refresh();

		oCacheMock.expects("read").withExactArgs("myGroup", undefined, sinon.match.func)
			.returns(oReadPromise);
		oHelperMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oBinding.refresh("myGroup");

		oHelperMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oBinding.refresh("$Invalid");
		}, oError);

		return Promise.all([oReadPromise, oTypePromise]);
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oCacheMock = this.getCacheMock(),
			iChangedCount = 0,
			iDataReceivedCount = 0,
			done = assert.async(),
			oError = new Error(),
			oBinding,
			sPath = "/EMPLOYEES(ID='1')/Name";

		oError.canceled = true; // simulate canceled cache read
		// initial read and after refresh
		oCacheMock.expects("read").callsArg(2).returns(Promise.reject(oError));
		oCacheMock.expects("read").callsArg(2).returns(Promise.resolve("foo"));
		oCacheMock.expects("refresh");
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type").twice()
			.withExactArgs(sPath)
			.returns(Promise.resolve(new TypeString()));

		oBinding = this.oModel.bindProperty(sPath);

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
		oBinding.refresh();
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oBinding = this.oModel.bindProperty("Name");

		// no cache for relative bindings
		this.oSandbox.mock(_Cache).expects("createSingle").never();

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("Name");

		assert.throws(function () { //TODO implement
			oPropertyBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#isInitial"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.resume();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#resume"));

		assert.throws(function () { //TODO implement
			oPropertyBinding.suspend();
		}, new Error("Unsupported operation: v4.ODataPropertyBinding#suspend"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var mParams = {},
			oMock = this.oSandbox.mock(PropertyBinding.prototype),
			oPropertyBinding,
			oReturn = {};

		oMock.expects("attachEvent").withExactArgs("AggregatedDataStateChange", mParams)
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("change", mParams)
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataReceived", mParams)
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataRequested", mParams)
			.returns(oReturn);

		oPropertyBinding = this.oModel.bindProperty("Name");

		assert.strictEqual(oPropertyBinding.attachEvent("AggregatedDataStateChange", mParams),
			oReturn);
		assert.strictEqual(oPropertyBinding.attachEvent("change", mParams),
			oReturn);
		assert.strictEqual(oPropertyBinding.attachEvent("dataReceived", mParams),
			oReturn);
		assert.strictEqual(oPropertyBinding.attachEvent("dataRequested", mParams),
			oReturn);

		assert.throws(function () {
			oPropertyBinding.attachDataStateChange();
		}, new Error("Unsupported event 'DataStateChange': v4.ODataPropertyBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("$$groupId, $$updateGroupId", function (assert) {
		var oBinding,
			oHelperMock = this.oSandbox.mock(_ODataHelper),
			oModel = new ODataModel({
				serviceUrl : "/service/",
				synchronizationMode : "None"
			}),
			oModelMock = this.oSandbox.mock(oModel),
			mParameters = {};

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});
		// code under test
		oBinding = oModel.bindProperty("/absolute", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding = oModel.bindProperty("/absolute", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters).returns({});
		// code under test
		oBinding = oModel.bindProperty("/absolute", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters not called for relative binding
		oBinding = this.oModel.bindProperty("relative");
	});

	//*********************************************************************************************
	[undefined, "$direct"].forEach(function (sGroupId) {
		QUnit.test("getGroupId, binding group ID " + sGroupId , function (assert) {
			var oBinding = this.oModel.bindProperty("/absolute", undefined, {$$groupId : sGroupId}),
				oReadPromise = Promise.resolve(),
				oTypePromise = Promise.resolve(new TypeString());

			this.oSandbox.mock(this.oModel.getMetaModel()).expects("requestUI5Type")
				.returns(oTypePromise);
			this.oSandbox.mock(oBinding.oCache).expects("read")
				.withExactArgs(sGroupId || "$auto", undefined, sinon.match.func)
				.callsArg(2)
				.returns(oReadPromise);
			this.oSandbox.mock(this.oModel).expects("addedRequestToGroup")
				.withExactArgs(sGroupId || "$auto", sinon.match.func)
				.callsArg(1);

			oBinding.initialize();

			return Promise.all([oTypePromise, oReadPromise]);
		});
	});

	//*********************************************************************************************
	QUnit.test("setValue (absolute binding): forbidden", function (assert) {
		var oControl;

		this.getCacheMock().expects("read").returns(Promise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup").never();
		this.oSandbox.mock(oControl.getBinding("text").oCache).expects("update").never();
		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.oLogMock.expects("error").withExactArgs(
			"Cannot set value on absolute binding", "/ProductList('HT-1000')/Name", sClassName);

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oControl.getText(), undefined, "control change is rolled back");
	});

	//*********************************************************************************************
	//TODO enable this test again and restore the productive code from #1539070/1
	QUnit.skip("setValue (absolute binding) via control or API", function (assert) {
		var oControl,
			oModel = new ODataModel({serviceUrl: "/", synchronizationMode : "None"}),
			oModelMock = this.oSandbox.mock(oModel),
			oPropertyBinding,
			oPropertyBindingCacheMock;

		oModelMock.expects("addedRequestToGroup").withExactArgs("groupId", sinon.match.func);
		this.getCacheMock().expects("read").callsArg(2).returns(Promise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : oModel,
			text : "{parameters : {'$$groupId' : 'groupId', '$$updateGroupId' : 'updateGroupId'}"
				+ ", path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oPropertyBinding = oControl.getBinding("text");
		oPropertyBindingCacheMock = this.oSandbox.mock(oPropertyBinding.oCache);
		oModelMock.expects("addedRequestToGroup").twice().withExactArgs("updateGroupId");
		oPropertyBindingCacheMock.expects("update")
			.withExactArgs("updateGroupId", "Name", "foo", "ProductList('HT-1000')")
			.returns(Promise.resolve());

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oPropertyBinding.getValue(), "foo");

		// code under test
		oPropertyBinding.setValue("foo"); // must not trigger a 2nd PATCH

		// set a different value via API
		oPropertyBindingCacheMock.expects("update")
			.withExactArgs("updateGroupId", "Name", "bar", "ProductList('HT-1000')")
			.returns(Promise.resolve());

		// code under test
		oPropertyBinding.setValue("bar");

		assert.strictEqual(oControl.getText(), "bar");
	});
	//TODO "DataRequested" event? probably not ("GET" only), not done by v2 AFAIK
	//TODO {"If-Match" : sEtag} - a request for a single property does not return an "@odata.etag"
	//     annotation, but an "etag(?)" header which is not supported by _Cache so far
	//TODO for PATCH we need the edit URL (for single property we can't determine the canonical URL
	//     because the path need not contain the key properties e.g.
	//     /EMPLOYEES('2')/EMPLOYEE_2_MANAGER/TEAM_ID) --> accept limitation for now
	//TODO if the backend returns a different value we should take care
	//TODO PUT of primitive property versus PATCH of entity (with select *), what is better?
	//     --> PATCH with header "Prefer: return=minimal" followed by
	//         GET with appropriate $expand/$select
	//TODO error handling, both technical HTTP errors as well as business logic errors

	//*********************************************************************************************
	QUnit.test("setValue: Not a primitive value", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("/absolute");

		// code under test
		assert.throws(function () {
			oPropertyBinding.setValue({});
		}, new Error("Not a primitive value"));

		// code under test
		assert.throws(function () {
			oPropertyBinding.setValue(Function);
		}, new Error("Not a primitive value"));
	});

	//*********************************************************************************************
	//TODO enable this test again and restore the productive code from #1539070/1
	QUnit.skip("setValue (absolute binding): error handling", function (assert) {
		var sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oModel = new ODataModel({
				groupId : "$direct",
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			oPromise = Promise.reject(oError),
			oPropertyBinding = oModel.bindProperty("/ProductList('0')/Name");

		this.oSandbox.mock(oModel).expects("addedRequestToGroup").withExactArgs("$direct");
		this.oSandbox.mock(oPropertyBinding.oCache).expects("update")
			.withExactArgs("$direct", "Name", "foo", "ProductList('0')")
			.returns(oPromise);
		this.oLogMock.expects("error").withExactArgs(sMessage, oError.stack, sClassName);

		// code under test
		oPropertyBinding.setValue("foo");

		assert.strictEqual(oPropertyBinding.getValue(), "foo", "keep user input");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding) via control", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oHelperMock = this.oSandbox.mock(_ODataHelper),
			oModel = new ODataModel({
				groupId : "$direct",
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			oControl = new TestControl({
				models : oModel,
				objectBindings : "/SalesOrderList('0500000000')"
			}),
			oContextMock = this.oSandbox.mock(oControl.getObjectBinding().getBoundContext());

		this.oSandbox.mock(oModel).expects("addedRequestToGroup").never();
		oCacheMock.expects("read").withExactArgs("$direct", "Note", sinon.match.func)
			.returns(Promise.resolve("Some note")); // text property of control
		oControl.applySettings({
			text : "{path : 'Note', type : 'sap.ui.model.odata.type.String'}"
		});
		oHelperMock.expects("checkGroupId").withExactArgs(undefined);
		oContextMock.expects("updateValue").withExactArgs(undefined, "Note", "foo")
			.returns(Promise.resolve());

		// code under test
		oControl.setText("foo");

		oHelperMock.expects("checkGroupId").withExactArgs("up");
		oContextMock.expects("updateValue").withExactArgs("up", "Note", "bar")
			.returns(Promise.resolve());

		// code under test
		oControl.getBinding("text").setValue("bar", "up");
	});
	//TODO relative path which is not simply a property name (Address/Street)?

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): error handling", function (assert) {
		var oContext = {
				getPath : function () { return "/ProductList('HT-1000')"; },
				updateValue : function () {}
			},
			sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oPromise = Promise.reject(oError),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		this.oSandbox.mock(oContext).expects("updateValue").withExactArgs(undefined, "Name", "foo")
			.returns(oPromise);
		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oError));

		// code under test
		oPropertyBinding.setValue("foo");

		assert.strictEqual(oPropertyBinding.getValue(), "foo", "keep user input");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding w/o context) via control", function (assert) {
		var oControl = new TestControl({
				models : this.oModel,
				text : "{path : 'Note', type : 'sap.ui.model.odata.type.String'}"
			});

		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.oLogMock.expects("warning").withExactArgs(
			"Cannot set value on relative binding without context", "Note", sClassName);

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oControl.getText(), undefined, "control change is rolled back");
	});

	//*********************************************************************************************
	QUnit.test("setType: calls setV4 automatically", function (assert) {
		var oDateTimeOffset = {
				getName : function () { return "sap.ui.model.odata.type.DateTimeOffset"; },
				setV4 : function () {}
			},
			oSomeType = {
				getName : function () { return "it.s.not.me"; },
				setV4 : function () {}
			},
			oPropertyBinding = this.oModel.bindProperty("/absolute");

		this.oSandbox.mock(oDateTimeOffset).expects("setV4");
		this.oSandbox.mock(oSomeType).expects("setV4").never();

		// code under test
		oPropertyBinding.setType(null);
		oPropertyBinding.setType(oDateTimeOffset);
		oPropertyBinding.setType(oSomeType);
	});

	//*********************************************************************************************
	QUnit.test("setType: change events", function (assert) {
		return this.createTextBinding(assert).then(function (oBinding) {
			var sChangeReason,
				oSomeType = {
					getName : function () { return "foo"; },
					formatValue : function (vValue) { return vValue; }
				};

			oBinding.attachChange(function (oEvent) {
				sChangeReason = oEvent.getParameter("reason");
				assert.strictEqual(oBinding.getType(), oSomeType);
			});

			// code under test
			oBinding.setType(oSomeType);

			assert.strictEqual(sChangeReason, ChangeReason.Change);

			sChangeReason = undefined;

			// code under test
			oBinding.setType(oSomeType);

			assert.strictEqual(sChangeReason, undefined, "no event for same type");
		});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		//*****************************************************************************************
		QUnit.test("PATCH an entity", function (assert) {
			var done = assert.async(),
				oModel = new ODataModel({
					serviceUrl : TestUtils.proxy(sServiceUrl),
					synchronizationMode : "None"
				}),
				oControl = new TestControl({
					models : oModel,
					objectBindings : "/BusinessPartnerList('0100000000')",
					text : "{path : 'PhoneNumber', type : 'sap.ui.model.odata.type.String'}"
				});

				//TODO cannot use "dataReceived" because oControl.getText() === undefined then...
				oControl.getBinding("text").attachEventOnce("change", function () {
					var sPhoneNumber = oControl.getText().indexOf("/") < 0
						? "06227/34567"
						: "0622734567";

					// code under test
					oControl.setText(sPhoneNumber);

					done();
				});
		});
	}
});
// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
