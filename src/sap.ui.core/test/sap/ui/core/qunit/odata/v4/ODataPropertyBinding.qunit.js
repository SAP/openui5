/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils"
], function (jQuery, Log, ManagedObject, SyncPromise, BindingMode, ChangeReason, BaseContext,
		PropertyBinding, TypeString, Context, asODataBinding, ODataModel, ODataPropertyBinding,
		_Cache, _Helper, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		sServiceUrl = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
		TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
			metadata : {
				properties : {
					text : "string"
				}
			},
			// @see sap.ui.model.DataState and sap.ui.base.ManagedObject#_bindProperty
			refreshDataState : function () {}
		});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataPropertyBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.mock(this.oModel.oRequestor).expects("request").never();
		},

		afterEach : function () {
			return TestUtils.awaitRendering();
		},

		/**
		 * Creates a Sinon mock for a cache object with read and refresh method.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getPropertyCacheMock : function () {
			var oCache = {
					fetchValue : function () {},
					setActive : function () {},
					update : function () {}
			};

			this.mock(_Cache).expects("createProperty").returns(oCache);
			return this.mock(oCache);
		},

		/**
		 * Creates a test control bound to a v4.ODataModel. Initializes the control's text property
		 * asynchronously. Waits for the value to be present and passes the property binding for
		 * "text" to the resolve handler.
		 *
		 * @param {object} assert
		 *   the QUnit assert methods
		 * @param {number} [iNoOfRequests=1]
		 *   the number of expected calls to fetchValue
		 * @param {Error} [oError]
		 *   optional error with which fetchValue rejects in the second call
		 * @returns {Promise}
		 *   a promise to be resolved with the text binding as soon as the control's text property
		 *   has been initialized
		 */
		createTextBinding : function (assert, iNoOfRequests, oError) {
			var oControl = new TestControl({models : this.oModel}),
				that = this;

			return new Promise(function (fnResolve, fnReject) {
				var oBinding,
					oContextBindingMock,
					fnFetchValue;

				function changeHandler(oEvent) {
					assert.strictEqual(oControl.getText(), "value", "initialized");
					assert.strictEqual(oBinding.vValue, "value",
						"vValue contains the value and can be used to mock a checkUpdateInternal");
					assert.strictEqual(oBinding.bInitial, false);
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
					assert.strictEqual(fnFetchValue.args[0][1], oBinding,
						"The binding passed itself to fetchValue");
					oBinding.detachChange(changeHandler);
					fnResolve(oBinding);
				}

				oControl.bindObject("/EntitySet('foo')");
				oContextBindingMock = that.mock(oControl.getObjectBinding());
				fnFetchValue = oContextBindingMock.expects("fetchValue");
				fnFetchValue.exactly(iNoOfRequests || 1)
					.withExactArgs("/EntitySet('foo')/property", sinon.match.object, undefined)
					.returns(Promise.resolve("value"));
				if (oError) {
					oContextBindingMock.expects("fetchValue")
						.withExactArgs("/EntitySet('foo')/property", sinon.match.object, undefined)
						.returns(Promise.reject(oError));
				}
				oControl.bindProperty("text", {
					path : "property",
					type : new TypeString()
				});

				assert.strictEqual(oControl.getText(), undefined, "synchronous: no value yet");
				oBinding = oControl.getBinding("text");
				oBinding.attachChange(changeHandler);
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.oModel.bindProperty("ID"),
			oMixin = {};

		asODataBinding(oMixin);

		assert.notStrictEqual(oBinding["destroy"], oMixin["destroy"],
			"override destroy");
		assert.notStrictEqual(oBinding["resetInvalidDataState"], oMixin["resetInvalidDataState"],
			"override resetInvalidDataState");
		Object.keys(oMixin).forEach(function (sKey) {
			if (sKey !== "destroy" && sKey !== "resetInvalidDataState") {
				assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("bindProperty, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = sPath[0] === "/",
				oBinding,
				oBindingSpy = this.spy(asODataBinding, "call"),
				oCache = {},
				oContext = Context.create(this.oModel, null, "/EMPLOYEES(ID='42')"),
				oExpectation = this.mock(this.oModel).expects("bindingCreated");

			if (bAbsolute) {
				this.mock(_Cache).expects("createProperty")
					.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1),
						{"sap-client" : "111"})
					.returns(oCache);
			} else {
				this.mock(_Cache).expects("createProperty").never();
			}
			this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
				.withExactArgs(sinon.match.same(oContext))
				.callThrough();

			// code under test
			oBinding = this.oModel.bindProperty(sPath, oContext);

			assert.ok(oBinding instanceof ODataPropertyBinding);
			sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
			assert.strictEqual(oBinding.getModel(), this.oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCachePromise"), true);
			assert.strictEqual(oBinding.oCachePromise.getResult(), bAbsolute ? oCache : null);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("oCheckUpdateCallToken"), true);
			assert.strictEqual(oBinding.oCheckUpdateCallToken, undefined);
			assert.ok(oBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with relative path and !v4.Context", function (assert) {
		var oBinding,
			oContext = {getPath : function () {return "/EMPLOYEES(ID='1')";}},
			oExpectation = this.mock(this.oModel).expects("bindingCreated"),
			sPath = "Name";

		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext));

		//code under test
		oBinding = this.oModel.bindProperty(sPath, oContext);

		sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oModelMock = this.mock(this.oModel),
			mParameters = {"custom" : "foo"},
			mQueryOptions = {};

		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), false).returns(mQueryOptions);
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(null);

		// code under test
		oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oModelMock.expects("buildQueryOptions").throws(oError);

		// code under test
		assert.throws(function () {
			this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
		}, oError);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindProperty: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindProperty(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty: empty path is valid for base context", function (assert) {
		var oBaseContext = this.oModel.createBindingContext("/ProductList('HT-1000')/Name");

		// code under test
		this.oModel.bindProperty("", oBaseContext);
	});

	//*********************************************************************************************
	[{
		sInit : "base", sTarget : undefined
	}, {
		sInit : "base", sTarget : "base"
	}, {
		sInit : "base", sTarget : "v4"
	}, {
		sInit : "v4", sTarget : "base"
	}, {
		sInit : undefined, sTarget : "base"
	}].forEach(function (oFixture) {
		QUnit.test("change context:" + oFixture.sInit + "->" + oFixture.sTarget, function (assert) {
			var oBinding,
				oModel = this.oModel,
				oCache = {
					oRequestor : oModel.oRequestor,
					setActive : function () {}
				},
				oCacheMock = this.mock(_Cache),
				oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')"),
				oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')");

			function createContext(sType, sPath) {
				if (sType === "base") {
					oCacheMock.expects("createProperty")
						.withExactArgs(sinon.match.same(oModel.oRequestor),
							sPath.slice(1) + "/Name", {"sap-client" : "111"})
						.returns(oCache);
					return oModel.createBindingContext(sPath);
				}
				if (sType === "v4") {
					return Context.create(oModel, null/*oBinding*/, sPath);
				}

				return undefined;
			}

			//Create Initial Binding
			oBinding = oModel.bindProperty("Name", oInitialContext);

			if (oFixture.sInit === "base") {
				assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
				this.mock(oCache).expects("setActive").withExactArgs(false);
			} else {
				assert.strictEqual(oBinding.oCachePromise.getResult(), null);
			}
			if (oFixture.sTarget) {
				this.mock(oBinding).expects("checkUpdateInternal")
					.withExactArgs(false, "context");
			}
			this.mock(oBinding).expects("deregisterChange").withExactArgs();

			//code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCachePromise.getResult(),
				oFixture.sTarget === "base" ? oCache : null);

			// code under test
			// #deregisterChange is not called again, if #setContext is called with the same context
			oBinding.setContext(oTargetContext);
		});
	});
	//TODO cache promise is NOT always fulfilled

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdateInternal(" + bForceUpdate + "): unchanged", function (assert) {
			var that = this;

			return this.createTextBinding(assert, 2).then(function (oBinding) {
				var bGotChangeEvent = false;

				oBinding.attachChange(function () {
					bGotChangeEvent = true;
				});
				that.mock(that.oModel.getMetaModel()).expects("getMetaContext").never();
				// checkDataState is called independently of bForceUpdate
				that.mock(oBinding).expects("checkDataState").withExactArgs();

				// code under test
				oBinding.checkUpdateInternal(bForceUpdate).then(function () {
					assert.strictEqual(bGotChangeEvent, bForceUpdate,
						"got change event as expected");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(true): no change event for virtual context", function (assert) {
		var oVirtualContext = Context.create(this.oModel, {/*list binding*/}, "/...",
				Context.VIRTUAL),
			oBinding = this.oModel.bindProperty("relative", oVirtualContext);

		// Note: it is important that automatic type determination runs as soon as possible
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(SyncPromise.resolve());
		oBinding.attachChange(function () {
			assert.ok(false, "no change event for virtual context");
		});

		// code under test
		return oBinding.checkUpdateInternal(true);
	});

	//*********************************************************************************************
	// If the initialization is deferred, e.g. because the V2 adapter waits for the metadata, it
	// happens that the binding already has a context, but sReducedPath is still unset. So we must
	// check this before the context access, too.
	// See $count in the OPA for Sales Order TP100 V2.
	QUnit.test("checkUpdateInternal: deferred initialization", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataPropertyBinding.prototype),
			oContext = Context.create(this.oModel, {/*list binding*/}, "/...", 0),
			oPromise = SyncPromise.resolve(Promise.resolve()),
			oType = {getName : function () {}};

		oBindingMock.expects("fetchCache").withExactArgs(undefined).returns(oPromise);
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(SyncPromise.resolve(oType));
		this.mock(oContext).expects("fetchValue").never();

		// code under test
		oBinding = this.oModel.bindProperty("relative");

		this.mock(oBinding).expects("deregisterChange");
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.returns(oPromise); // this would actually set sReducedPath later

		// code under test
		oBinding.setContext(oContext);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(true): provide value synchronously", function (assert) {
		var oContext = Context.create(this.oModel, {/*list binding*/}, "/...", 0),
			oBinding = this.oModel.bindProperty("relative", oContext),
			oPromise,
			oType = {
				formatValue : function () {},
				getName : function () {}
			};

		this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", oBinding)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative")
			.returns(SyncPromise.resolve(oType));
		this.mock(oType).expects("formatValue").withExactArgs("foo", undefined).returns("*foo*");

		// code under test
		oPromise = oBinding.checkUpdateInternal(true);

		assert.strictEqual(oBinding.getValue(), "foo");
		assert.strictEqual(oBinding.getExternalValue(), "*foo*");
		assert.strictEqual(oBinding.getType(), oType);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(true): type not yet available", function (assert) {
		var oContext = Context.create(this.oModel, {/*list binding*/}, "/...", 0),
			oBinding = this.oModel.bindProperty("relative", oContext);

		this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", oBinding)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(new SyncPromise(function () {})); // does not resolve

		// code under test
		oBinding.checkUpdateInternal(true);

		assert.strictEqual(oBinding.getValue(), "foo");
		assert.strictEqual(oBinding.getType(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal with object value, success", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
			sPath = "nonPrimitive",
			oBinding = this.oModel.bindProperty(sPath, oContext),
			vValue = {/* non-primitive */},
			vValueClone = {};

		oBinding.setBindingMode(BindingMode.OneTime);
		oBinding.setType(null, "any");
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
			.returns(SyncPromise.resolve(vValue));
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(vValue))
			.returns(vValueClone);

		// code under test
		return oBinding.checkUpdateInternal().then(function () {
			assert.strictEqual(oBinding.getValue(), vValueClone);
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal with action advertisement object value, success",
			function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
			sPath = "#name.space.Advertisement",
			oBinding = this.oModel.bindProperty(sPath, oContext),
			vValue = {/* non-primitive */},
			vValueClone = {};

		// Note: we do not require BindingMode.OneTime for action advertisements
		oBinding.setType(null, "any");
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
			.returns(SyncPromise.resolve(vValue));
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(vValue))
			.returns(vValueClone);

		// code under test
		return oBinding.checkUpdateInternal().then(function () {
			assert.strictEqual(oBinding.getValue(), vValueClone);
		});
	});

	//*********************************************************************************************
	[{ // must be type "any"
		internalType : "int",
		mode : BindingMode.OneTime,
		path : "nonPrimitive"
	}, { // must be relative
		internalType : "any",
		mode : BindingMode.OneTime,
		path : "/EntitySet('bar')/nonPrimitive"
	}, { // must have mode OneTime
		internalType : "any",
		mode : BindingMode.OneWay,
		path : "nonPrimitive"
	}, { // must have mode OneTime
		internalType : "any",
		mode : BindingMode.TwoWay,
		path : "nonPrimitive"
	}, { // must have mode OneTime, also for the case "branch into metadata via ##"
		internalType : "any",
		mode : BindingMode.OneWay,
		path : "##@SAP_Common.Label"
	}].forEach(function (oFixture, i) {
		QUnit.test("checkUpdateInternal with object value, error, " + i, function (assert) {
			var bAbsolute = oFixture.path[0] === "/",
				oCacheMock = bAbsolute && this.getPropertyCacheMock(),
				oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
				oBinding = this.oModel.bindProperty(oFixture.path, oContext),
				oGroupLock = {},
				oMetaContext = {},
				sResolvedPath = this.oModel.resolve(oFixture.path, oContext),
				vValue = {/* non-primitive */};

			oBinding.setBindingMode(oFixture.mode);
			oBinding.setType(null, oFixture.internalType);
			if (bAbsolute) {
				this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");
				this.mock(oBinding).expects("lockGroup").withExactArgs("$auto").returns(oGroupLock);
				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func,
						sinon.match.same(oBinding))
					.returns(SyncPromise.resolve(vValue));
			} else if (oFixture.path.startsWith("##")) { // meta binding
				this.mock(this.oModel.getMetaModel()).expects("getMetaContext")
					.withExactArgs("/EntitySet('foo')")
					.returns(oMetaContext);
				this.mock(this.oModel.getMetaModel()).expects("fetchObject")
					.withExactArgs("@SAP_Common.Label", sinon.match.same(oMetaContext))
					.returns(SyncPromise.resolve(vValue));
			} else {
				this.mock(oContext).expects("fetchValue")
					.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
					.returns(SyncPromise.resolve(vValue));
			}
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.exactly(oFixture.internalType !== "any" ? 1 : 0)
				.withExactArgs(sResolvedPath)
				.returns(SyncPromise.resolve());
			this.oLogMock.expects("error")
				.withExactArgs("Accessed value is not primitive",
					sResolvedPath, sClassName);

			// code under test
			return oBinding.checkUpdateInternal().then(function () {
				assert.strictEqual(oBinding.getValue(), undefined);
			});
		});
	});

	//*********************************************************************************************
	[false, undefined, null, 42, "foo"].forEach(function (vValue) {
		var sTitle = "checkUpdateInternal: no clone with primitive value: " + vValue;

		QUnit.test(sTitle, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
				sPath = "primitive",
				oBinding = this.oModel.bindProperty(sPath, oContext);

			oBinding.setType(null, "any");
			this.mock(oContext).expects("fetchValue")
				.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
				.returns(SyncPromise.resolve(vValue));
			this.mock(_Helper).expects("publicClone").never();

			// code under test
			return oBinding.checkUpdateInternal().then(function () {
				assert.strictEqual(oBinding.getValue(), vValue);
			});
		});
	});

	//*********************************************************************************************
	// Unit test for scenario in
	// ODataModel.integration.qunit, @sap.ui.table.Table with VisibleRowCountMode='Auto'
	QUnit.test("checkUpdateInternal(true): later call resets this.oContext", function (assert) {
		var oParentBinding = {
				fetchIfChildCanUseCache : function () {
					return SyncPromise.resolve(Promise.resolve(true));
				}
			},
			oModel = new ODataModel({
				autoExpandSelect : true,
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			oContext = Context.create(oModel, oParentBinding, "/..."),
			oBinding = oModel.bindProperty("relative", oContext),
			oPromise0,
			oPromise1;

		this.mock(oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(SyncPromise.resolve());
		// checkDataState is called only once even if checkUpdateInternal is called twice
		this.mock(oBinding).expects("checkDataState").withExactArgs();

		// code under test
		oPromise0 = oBinding.checkUpdateInternal(true);

		oBinding.oContext = null; // binding context reset in the meantime

		// code under test - second call to checkUpdateInternal must not fail
		oPromise1 = oBinding.checkUpdateInternal(true);

		return Promise.all([oPromise0, oPromise1]);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): unresolved path after setContext", function (assert) {
		var done = assert.async(),
			fnChangeHandler = function () {
				assert.strictEqual(this.getValue(), undefined, "value after context reset");
				done();
			},
			that = this;

		this.createTextBinding(assert).then(function (oBinding) {
			that.mock(oBinding).expects("deregisterChange").withExactArgs();
			assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
			oBinding.attachChange(fnChangeHandler, oBinding);
			oBinding.setContext(); // reset context triggers checkUpdate
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): read error", function (assert) {
		var oError = new Error("Expected failure");

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EntitySet('foo')/property", sClassName,
			sinon.match.same(oError));

		return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			var bChangeReceived = false;

			assert.strictEqual(oBinding.getValue(), "value",
				"value is set before failing read");
			oBinding.attachChange(function () {
				bChangeReceived = true;
			});

			// code under test
			oBinding.checkUpdateInternal(false).then(function () {
				assert.strictEqual(oBinding.getValue(), undefined,
					"read error resets the value");
				assert.ok(bChangeReceived, "Value changed -> expecting change event");
			}, function () {
				assert.ok(false, "unexpected failure");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): read error with force update", function (assert) {
		var done = assert.async(),
			oError = new Error("Expected failure");

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EntitySet('foo')/property", sClassName,
			sinon.match.same(oError));

		this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			oBinding.attachChange(function () {
				done();
			});

			// code under test
			oBinding.checkUpdateInternal(true);
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): cancelled read", function (assert) {
		var oError = {canceled : true},
			that = this;

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EntitySet('foo')/property", sClassName,
			sinon.match.same(oError));

		return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			oBinding.bInitial = "foo";
			that.mock(oBinding).expects("_fireChange").never();

			// code under test
			return oBinding.checkUpdateInternal(true).then(function () {
				assert.strictEqual(oBinding.bInitial, "foo", "bInitial unchanged");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): absolute with sGroupId", function (assert) {
		var oBinding,
			oCacheMock = this.getPropertyCacheMock(),
			oGroupLock = {};

		oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");
		oBinding.setType(null, "any"); // avoid fetchUI5Type()
		this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func, oBinding)
			.returns(SyncPromise.resolve());

		// code under test
		return oBinding.checkUpdateInternal(false, undefined, "group");
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): relative with sGroupId", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/Me"),
			oBinding = this.oModel.bindProperty("property", oContext);

		oBinding.setType(null, "any"); // avoid fetchUI5Type()
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, oBinding)
			.returns(SyncPromise.resolve());

		// code under test
		return oBinding.checkUpdateInternal(false, undefined, "group");
	});

	//*********************************************************************************************
	["foo", false, undefined].forEach(function (vValue) {
		QUnit.test("checkUpdateInternal(): with vValue parameter: " + vValue, function (assert) {
			var oBinding = this.oModel.bindProperty("/absolute"),
				oPromise,
				oType = {getName : function () {}},
				done = assert.async();

			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.withExactArgs("/absolute")
				.returns(SyncPromise.resolve(oType));
			oBinding.vValue = ""; // simulate a read
			oBinding.attachChange(function () {
				assert.strictEqual(oBinding.getType(), oType);
				assert.strictEqual(oBinding.getValue(), vValue);
				done();
			});
			this.mock(oBinding.oCachePromise).expects("then").never();

			// code under test
			oPromise = oBinding.checkUpdateInternal(undefined, undefined, undefined, vValue);

			assert.ok(oPromise.isFulfilled());
			assert.strictEqual(oBinding.getValue(), vValue);
		});
	});

	//*********************************************************************************************
	[{
		contextPath : "/Artists('42')",
		path : "Name##@SAP_Common.Label"
	}, {
		contextPath : undefined,
		path : "/Artists('42')/Name##@SAP_Common.Label"
	}, {
		contextPath : "/Irrelevant",
		path : "/Artists('42')/Name##@SAP_Common.Label"
	}, {
		baseContext : true,
		contextPath : "/Artists('42')",
		path : "Name##@SAP_Common.Label"
	}, {
		contextPath : "/Artists('42')",
		path : "##/@SAP_Common.Label"
	}, {
		contextPath : "/Irrelevant",
		path : "/Artists('42')/Name##@SAP_Common.Label",
		virtualContext : true
	}].forEach(function (oFixture, i) {
		QUnit.test("checkUpdateInternal, meta path, resolved, " + i, function (assert) {
			var oBinding,
				bChangeFired,
				oContext,
				oMetaContext = {},
				vValue = oFixture.virtualContext ? undefined : "Artist label";

			if (oFixture.contextPath) {
				oContext = oFixture.baseContext
					? new BaseContext(this.oModel, oFixture.contextPath)
					: Context.create(this.oModel, {/*oParentBinding*/}, oFixture.contextPath,
						oFixture.virtualContext && Context.VIRTUAL);
			}

			this.mock(_Cache).expects("createProperty").never();

			// code under test
			oBinding = this.oModel.bindProperty(oFixture.path, oContext);

			this.mock(this.oModel.getMetaModel()).expects("getMetaContext")
				.withExactArgs(oFixture.path.startsWith("##/")
					? "/Artists('42')"
					: "/Artists('42')/Name")
				.returns(oMetaContext);
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs(oFixture.path.startsWith("##/")
					? "./@SAP_Common.Label"
					: "@SAP_Common.Label",
					sinon.match.same(oMetaContext))
				.returns(SyncPromise.resolve(vValue));
			if (oContext && !oFixture.baseContext) {
				this.mock(oContext).expects("fetchValue").never();
			}
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
			this.mock(oBinding).expects("fireDataRequested").never();
			this.mock(oBinding).expects("fireDataReceived").never();
			oBinding.attachChange(function () {
				bChangeFired = true;
			});

			// code under test
			return oBinding.checkUpdateInternal(oFixture.virtualContext).then(function () {
				assert.strictEqual(oBinding.getValue(), vValue);
				assert.ok(bChangeFired, "change event");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal, meta path, unresolved", function (assert) {
		var oBinding = this.oModel.bindProperty("Name##@SAP_Common.Label", null);

		this.mock(this.oModel.getMetaModel()).expects("getMetaContext").never();
		this.mock(this.oModel.getMetaModel()).expects("fetchObject").never();
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
		this.mock(oBinding).expects("fireDataRequested").never();
		this.mock(oBinding).expects("fireDataReceived").never();


		// code under test
		return oBinding.checkUpdateInternal().then(function () {
			assert.strictEqual(oBinding.getValue(), undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal, meta path, targetType any", function (assert) {
		var oBinding,
			bChangeFired,
			oMetaContext = {},
			oValue = {};

		this.mock(_Cache).expects("createProperty").never();

		// code under test
		oBinding = this.oModel.bindProperty("/Artists##@Capabilities.InsertRestrictions", null);

		oBinding.setBindingMode(BindingMode.OneTime);
		oBinding.setType(undefined, "any");
		this.mock(this.oModel.getMetaModel()).expects("getMetaContext")
			.withExactArgs("/Artists")
			.returns(oMetaContext);
		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("@Capabilities.InsertRestrictions", sinon.match.same(oMetaContext))
			.returns(SyncPromise.resolve(oValue));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
		this.mock(oBinding).expects("fireDataRequested").never();
		this.mock(oBinding).expects("fireDataReceived").never();
		oBinding.attachChange(function () {
			assert.notOk(bChangeFired, "exactly one change event");
			bChangeFired = true;
		});

		// code under test
		return oBinding.checkUpdateInternal().then(function () {
			assert.strictEqual(oBinding.getValue(), oValue);
			assert.ok(bChangeFired, "change event");
		});
	});

	//*********************************************************************************************
	QUnit.test("isMeta", function (assert) {
		assert.strictEqual(this.oModel.bindProperty("foo", null).isMeta(), false);
		assert.strictEqual(this.oModel.bindProperty("foo#bar", null).isMeta(), false,
			"action advertisement");
		assert.strictEqual(this.oModel.bindProperty("foo##bar", null).isMeta(), true);
	});

	//*********************************************************************************************
	QUnit.test("ManagedObject.bindProperty w/ relative path, then bindObject", function (assert) {
		var oCacheMock = this.mock(_Cache),
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
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {"sap-client" : "111"}, false,
				sinon.match.func)
			.returns({
				fetchValue : function (sGroupId, sPath) {
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
		var oContext = Context.create(this.oModel, null, "/EntitySet('bar')"),
			oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");

		this.mock(oContext).expects("fetchValue").never(); // due to absolute path

		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");

		this.mock(oBinding).expects("deregisterChange").never();
		oBinding.setContext(null);
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("ManagedObject.bindProperty: type and value, path " + sPath, function (assert) {
			var that = this;

			return new Promise(function (finishTest) {
				var bAbsolute = sPath[0] === "/",
					oValue = "foo",
					oCache = {
						fetchValue : function (oGroupLock, sReadPath, fnDataRequested) {
							return Promise.resolve().then(function () {
								fnDataRequested();
							}).then(function () {
								return oValue;
							});
						}
					},
					oCacheMock = that.mock(_Cache),
					oContextBindingMock,
					sContextPath = "/EMPLOYEES(ID='42')",
					iDataReceivedCount = 0,
					iDataRequestedCount = 0,
					oControl = new TestControl({models : that.oModel}),
					sResolvedPath,
					oType = new TypeString();

				// (don't) create parent cache, it won't be used
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(that.oModel.oRequestor), sContextPath.slice(1),
						{"sap-client" : "111"}, false, sinon.match.func);
				oControl.bindObject(sContextPath);

				oContextBindingMock = that.mock(oControl.getObjectBinding());
				if (bAbsolute) { // absolute path: use cache on binding
					sResolvedPath = sPath;
					oContextBindingMock.expects("fetchValue").never();
					oCacheMock.expects("createProperty")
						.withExactArgs(sinon.match.same(that.oModel.oRequestor),
							sResolvedPath.slice(1), {"sap-client" : "111"})
						.returns(oCache);
				} else {
					sResolvedPath = sContextPath + "/" + sPath;
					oContextBindingMock.expects("fetchValue")
						.withExactArgs(sContextPath + "/" + sPath, sinon.match.object, undefined)
						.returns(Promise.resolve(oValue));
				}
				that.mock(that.oModel.getMetaModel()).expects("fetchUI5Type")
					.withExactArgs(sResolvedPath)
					.returns(SyncPromise.resolve(oType));
				that.mock(oType).expects("formatValue").withExactArgs(oValue, "string");

				//code under test
				oControl.bindProperty("text", {path : sPath, events : {
					change : function () {
						var oBinding = oControl.getBinding("text");

						assert.strictEqual(oBinding.getType(), oType);
						assert.strictEqual(oBinding.getValue(), oValue);
						if (!bAbsolute) {
							assert.strictEqual(iDataRequestedCount, 0);
							finishTest();
						}
					},
					dataRequested : function (oEvent) {
						assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"),
							"dataRequested - correct source");
						iDataRequestedCount += 1;
					},
					dataReceived : function (oEvent) {
						var oBinding = oControl.getBinding("text");

						assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"),
							"dataReceived - correct source");
						assert.deepEqual(oEvent.getParameter("data"), {});
						assert.strictEqual(iDataRequestedCount, 1);
						assert.strictEqual(oBinding.getType(), oType);
						assert.strictEqual(oBinding.getValue(), oValue);
						iDataReceivedCount += 1;
						finishTest();
					}
				}});

				assert.strictEqual(iDataRequestedCount, 0, "dataRequested not (yet) fired");
				assert.strictEqual(iDataReceivedCount, 0, "dataReceived not (yet) fired");
			});
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
					fetchValue : function (sGroupId, sPath, fnDataRequested) {
						fnDataRequested();
						return Promise.resolve(oValue);
					}
				},
				oCacheMock = this.mock(_Cache),
				oControl = new TestControl({models : this.oModel}),
				fnDone,
				oDataReceivedPromise = new Promise(function (resolve, reject) {
					fnDone = resolve;
				}),
				sPath = "/path",
				oRawType = {
					formatValue : function (vValue) { return vValue; },
					getName : function () { return "foo"; }
				},
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdateInternal");

			oCacheMock.expects("createProperty").returns(oCache);
			this.mock(ODataPropertyBinding.prototype).expects("isMeta").withExactArgs()
				.returns(false);
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.withExactArgs(sPath)
				.returns(SyncPromise.resolve(oRawType));
			this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
				sClassName);

			//code under test
			oControl.bindProperty("text", {path : sPath, events : {
				dataReceived : function (oEvent) {
					var oBinding = oControl.getBinding("text");

					assert.strictEqual(oBinding.getType(), oRawType);
					assert.strictEqual(oBinding.getValue(), undefined);
					assert.deepEqual(oEvent.getParameter("data"), {});
					assert.strictEqual(oEvent.getParameter("error"), undefined, "no read error");
					fnDone();
				}
			}});

			oBinding = oControl.getBinding("text");
			return Promise.all([
				oDataReceivedPromise,
				oSpy.returnValues[0].then(function () {
					assert.strictEqual(oBinding.getType(), oRawType);
					assert.strictEqual(oBinding.getValue(), undefined);
				})
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("dataReceived with error", function (assert) {
		var oError = new Error("Expected read failure"),
			oCache = {
				fetchValue : function (sGroupId, sPath, fnDataRequested) {
					fnDataRequested();
					return Promise.reject(oError);
				}
			},
			done = assert.async(),
			oControl = new TestControl({models : this.oModel});

		this.mock(_Cache).expects("createProperty").returns(oCache);
		this.mock(this.oModel).expects("reportError").withExactArgs(
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
			oCacheMock = this.getPropertyCacheMock(),
			bChangeReceived = false,
			done = assert.async(),
			sPath = "/EMPLOYEES(ID='1')/Name";

		// initial read and after refresh
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("foo"));
		// force non-primitive error
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve({}));

		this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
			sClassName);

		oBinding = this.oModel.bindProperty(sPath);
		oBinding.attachChange(function () {
			bChangeReceived = true;
		});
		oBinding.setType(new TypeString());
		assert.ok(!bChangeReceived, "No Change event while initial");

		oBinding.checkUpdateInternal(false).then(function () {
			assert.strictEqual(oBinding.getValue(), "foo");
			oBinding.checkUpdateInternal(false).then(function () {
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

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

		//code under test
		oControl.bindProperty("text", {
			path : sPath,
			type : new TypeString()
		});

		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "foo");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: targetType : 'any'", function (assert) {
		var oControl = new TestControl({models : this.oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			done = assert.async();

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

		//code under test
		oControl.bindProperty("text", {
			path : sPath,
			targetType : "any"
		});

		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "foo");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("automaticTypes: formatter set by app", function (assert) {
		var oBinding,
			oControl = new TestControl({models : this.oModel}),
			sPath = "/EMPLOYEES(ID='42')/Name",
			oType = new TypeString(),
			done = assert.async();

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs(sPath)
			.returns(SyncPromise.resolve(oType));
		this.mock(oType).expects("formatValue")
			.withExactArgs("foo", "string")
			.returns("*foo*");

		oControl.bindProperty("text", {
			path : sPath,
			formatter : function (sValue) {
				return "~" + sValue + "~";
			}
		});
		oBinding = oControl.getBinding("text");
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
					done = assert.async(),
					oCacheMock = this.getPropertyCacheMock(),
					oControl = new TestControl({models : this.oModel}),
					sPath = "/EMPLOYEES(ID='42')/Name",
					oRawType = {
						formatValue : function (vValue) { return vValue; },
						getName : function () { return "foo"; }
					};

				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.object, undefined, sinon.match.func,
						sinon.match.object)
					.returns(SyncPromise.resolve("foo"));
				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.object, undefined, sinon.match.func,
						sinon.match.object)
					.returns(SyncPromise.resolve("update")); // 2nd read gets an update

				this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").twice()
					.withExactArgs(sPath) // always requested only once
					.returns(SyncPromise.resolve(oRawType));

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
	QUnit.test("forbidden", function (assert) {
		var oBinding = this.oModel.bindProperty("Name");

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));

		assert.throws(function () {
			oBinding.resume();
		}, new Error("Unsupported operation: resume"));

		assert.throws(function () {
			oBinding.suspend();
		}, new Error("Unsupported operation: suspend"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oBinding,
			oBindingMock = this.mock(PropertyBinding.prototype),
			mEventParameters = {},
			oReturn = {};

		oBinding = this.oModel.bindProperty("Name");

		["AggregatedDataStateChange", "change", "dataReceived", "dataRequested", "DataStateChange"]
		.forEach(function (sEvent) {
			oBindingMock.expects("attachEvent")
				.withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);

			assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});

		assert.throws(function () {
			oBinding.attachEvent("unsupportedEvent");
		}, new Error("Unsupported event 'unsupportedEvent': v4.ODataPropertyBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("expression binding", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oModel = new ODataModel({
				serviceUrl : "/service/",
				synchronizationMode : "None"
			}),
			oPromise = Promise.resolve("value"),
			oTestControl = new TestControl({
				text : "{= !${path:'@odata.etag',type:'sap.ui.model.odata.type.String'} }",
				models : oModel
			});

		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {}, false, sinon.match.func)
			.returns({
				fetchValue : function (sGroupId, sPath) {
					return oPromise;
				}
			});

		oTestControl.bindObject("/EntitySet('foo')");
		assert.strictEqual(oTestControl.getText(), "true");

		return oPromise;
	});

	//*********************************************************************************************
	["/absolute", "relative"].forEach(function (sPath) {
		QUnit.test("$$groupId - sPath: " + sPath, function (assert) {
			var oBinding,
				oContext = this.oModel.createBindingContext("/absolute"),
				oModelMock = this.mock(this.oModel);

			oModelMock.expects("getGroupId").withExactArgs().returns("baz");
			oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

			// code under test
			oBinding = this.oModel.bindProperty(sPath, oContext, {$$groupId : "foo"});
			assert.strictEqual(oBinding.getGroupId(), "foo");
			assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

			// code under test
			oBinding = this.oModel.bindProperty(sPath, oContext, {});
			assert.strictEqual(oBinding.getGroupId(), "baz");
			assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");
		});
	});

	//*********************************************************************************************
	QUnit.test("$$noPatch", function (assert) {
		var oBinding = this.oModel.bindProperty("/foo");

		// code under test
		assert.strictEqual(oBinding.bNoPatch, undefined);

		oBinding = this.oModel.bindProperty("/foo", undefined, {$$noPatch : true});

		// code under test
		assert.strictEqual(oBinding.bNoPatch, true);
	});

	//*********************************************************************************************
	[undefined, "$direct"].forEach(function (sGroupId) {
		QUnit.test("initialize, binding group ID " + sGroupId , function (assert) {
			var oBinding = this.oModel.bindProperty("/absolute", undefined, {$$groupId : sGroupId}),
				sExpectedGroupId = sGroupId,
				oGroupLock = {},
				oReadPromise = SyncPromise.resolve(),
				oTypePromise = SyncPromise.resolve(new TypeString());

			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.returns(oTypePromise);
			if (!sGroupId) {
				this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");
				sExpectedGroupId = "$auto";
			}
			this.mock(oBinding).expects("lockGroup").withExactArgs(sExpectedGroupId)
				.returns(oGroupLock);
			this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
				.withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func,
					sinon.match.object)
				.callsArg(2)
				.returns(oReadPromise);

			oBinding.initialize();

			return Promise.all([oTypePromise, oReadPromise]);
		});
	});

	//*********************************************************************************************
	QUnit.test("onChange", function (assert) {
		var oBinding = this.oModel.bindProperty("/absolute"),
			vValue = "foo";

		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(undefined, undefined, undefined, vValue);

		// code under test
		oBinding.onChange(vValue);
	});

	//*********************************************************************************************
	QUnit.test("setValue (absolute binding): forbidden", function (assert) {
		var oControl,
			done = assert.async(),
			that = this;

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});

		// Wait until control received value from service before calling setText
		oControl.getBinding("text").attachChange(function (oEvent) {
			that.mock(oControl.getBinding("text").oCachePromise.getResult())
				.expects("update").never();
			// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
			that.mock(that.oModel).expects("reportError")
				.withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName,
					sinon.match({message : "Cannot set value on this binding as it is not relative"
						+ " to a sap.ui.model.odata.v4.Context"}));

			// code under test
			oControl.setText("foo");

			assert.strictEqual(oControl.getText(), "HT-1000's Name",
				"control change is rolled back");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("setValue (binding with V2 context): forbidden", function (assert) {
		var oControl,
			done = assert.async(),
			that = this;

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : 'Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oControl.setBindingContext(this.oModel.createBindingContext("/ProductList('HT-1000')"));

		// Wait until control received value from service before calling setText
		oControl.getBinding("text").attachChange(function (oEvent) {
			that.mock(oControl.getBinding("text").oCachePromise.getResult())
				.expects("update").never();
			// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
			that.mock(that.oModel).expects("reportError")
				.withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName,
					sinon.match({message : "Cannot set value on this binding as it is not relative"
						+ " to a sap.ui.model.odata.v4.Context"}));

			// code under test
			oControl.setText("foo");

			assert.strictEqual(oControl.getText(), "HT-1000's Name",
				"control change is rolled back");
			done();
		});
	});

	//*********************************************************************************************
	//TODO enable this test again and restore the productive code from #1539070/1
	QUnit.skip("setValue (absolute binding) via control or API", function (assert) {
		var oControl,
			oModel = new ODataModel({serviceUrl: "/", synchronizationMode : "None"}),
			oPropertyBinding,
			oPropertyBindingCacheMock,
			fnRead = this.getPropertyCacheMock().expects("read");

		fnRead.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.callsArg(2).returns(SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : oModel,
			text : "{parameters : {'$$groupId' : 'groupId', '$$updateGroupId' : 'updateGroupId'}"
				+ ", path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oPropertyBinding = oControl.getBinding("text");
		oPropertyBindingCacheMock = this.mock(oPropertyBinding.oCachePromise.getResult());
		oPropertyBindingCacheMock.expects("update")
			.withExactArgs("updateGroupId", "Name", "foo", "ProductList('HT-1000')")
			.returns(Promise.resolve());

		assert.strictEqual(fnRead.args[0][3], oPropertyBinding,
			"binding passed itself as listener");

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
	[{}, Function].forEach(function (vValue) {
		QUnit.test("setValue: Not a primitive value: " + vValue, function (assert) {
			var oError = new Error("Not a primitive value"),
				oPropertyBinding = this.oModel.bindProperty("/absolute"),
				oModelMock = this.mock(this.oModel);

			oPropertyBinding.vValue = "fromServer"; // simulate a read

			oModelMock.expects("reportError")
				.withExactArgs("Failed to update path /absolute", sClassName,
					sinon.match({message : oError.message}));
			// Note: w/o oContext, we cannot *test* that doSetProperty is never called
			this.mock(this.oModel.oMetaModel).expects("fetchUpdateData").never();
			this.mock(oPropertyBinding).expects("withCache").never();

			// code under test
			assert.throws(function () {
				oPropertyBinding.setValue(vValue);
			}, oError);

			assert.strictEqual(oPropertyBinding.getValue(), "fromServer");
		});
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

		this.mock(oPropertyBinding.oCache).expects("update")
			.withExactArgs("$direct", "Name", "foo", "ProductList('0')")
			.returns(oPromise);
		this.oLogMock.expects("error").withExactArgs(sMessage, oError.stack, sClassName);

		// code under test
		oPropertyBinding.setValue("foo");

		assert.strictEqual(oPropertyBinding.getValue(), "foo", "keep user input");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
[{
	updateGroupId : undefined,
	value : "foo"
}, {
	updateGroupId : "up",
	value : null
}].forEach(function (oFixture) {
	var sTitle = "setValue (relative binding) via control, updateGroupId=" + oFixture.updateGroupId;

	QUnit.test(sTitle, function (assert) {
		var oParentBinding = this.oModel.bindContext("/BusinessPartnerList('0100000000')"),
			oContext = oParentBinding.getBoundContext(),
			oBinding = this.oModel.bindProperty("Address/City", oContext),
			oGroupLock = {};

		oBinding.vValue = ""; // simulate a read - intentionally use a falsy value

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel).expects("checkGroupId")
			.withExactArgs(oFixture.updateGroupId);
		if (oFixture.updateGroupId) {
			this.mock(oBinding).expects("lockGroup")
				.withExactArgs(oFixture.updateGroupId, true, true)
				.returns(oGroupLock);
		} else {
			this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("update");
			this.mock(oBinding).expects("lockGroup").withExactArgs("update", true, true)
				.returns(oGroupLock);
		}
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("Address/City", sinon.match.same(oFixture.value),
				sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.setValue(oFixture.value, oFixture.updateGroupId);
	});
});

	//*********************************************************************************************
	QUnit.test("setValue with $$noPatch", function (assert) {
		var oParentBinding = this.oModel.bindContext("/ProductList('HT-1000')"),
			oContext = oParentBinding.getBoundContext(),
			oContextMock = this.mock(oContext),
			oBinding = this.oModel.bindProperty("Name", oContext, {$$noPatch : true}),
			oGroupIdNoPatchError = new Error("Must not specify a group ID (group) with $$noPatch"),
			oIntentionallyFailedError = new Error("This call intentionally failed"),
			oModelMock = this.mock(this.oModel),
			oUpdatePromise = SyncPromise.reject(oIntentionallyFailedError);

		oBinding.vValue = ""; // simulate a read - intentionally use a falsy value

		oModelMock.expects("lockGroup").never();
		this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
		oContextMock.expects("doSetProperty").withExactArgs("Name", "foo", null)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.setValue("foo");

		oContextMock.expects("doSetProperty").withExactArgs("Name", "bar", null)
			.returns(oUpdatePromise);
		oModelMock.expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oIntentionallyFailedError));

		// code under test
		oBinding.setValue("bar");

		oModelMock.expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match({message : oGroupIdNoPatchError.message}));

		// code under test
		assert.throws(function () {
			oBinding.setValue("baz", "group");
		}, oGroupIdNoPatchError);
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): error handling", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
			oGroupLock = {unlock : function () {}},
			oPropertyBinding = this.oModel.bindProperty("Name", oContext),
			oUpdatePromise = Promise.reject(oError);

		oPropertyBinding.vValue = "fromServer"; // simulate a read

		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(oPropertyBinding).expects("lockGroup").withExactArgs("up", true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("Name", "foo", sinon.match.same(oGroupLock))
			.returns(oUpdatePromise);
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oError));

		// code under test
		oPropertyBinding.setValue("foo", "up");

		return oUpdatePromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): unset", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oError = new Error("Must not change a property before it has been read"),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		assert.strictEqual(oPropertyBinding.vValue, undefined);
		this.mock(oContext).expects("doSetProperty").never();
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName,
				sinon.match({message : oError.message}));

		// code under test
		assert.throws(function () {
			oPropertyBinding.setValue("foo");
		}, oError);

		assert.strictEqual(oPropertyBinding.vValue, undefined);
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): unchanged", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		oPropertyBinding.vValue = "foo";
		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("doSetProperty").never();

		// code under test
		oPropertyBinding.setValue("foo");
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

		this.mock(oDateTimeOffset).expects("setV4");
		this.mock(oSomeType).expects("setV4").never();

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
	QUnit.test("refreshInternal", function (assert) {
		var oBinding = this.oModel.bindProperty("NAME"),
			oBindingMock = this.mock(oBinding),
			oCheckUpdatePromise = {},
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES/42");

		oBindingMock.expects("isRootBindingSuspended").twice().withExactArgs().returns(false);
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").thrice()
			.withExactArgs(oContext);
		oBindingMock.expects("checkUpdateInternal").withExactArgs(false, ChangeReason.Context)
			.resolves();
		oBinding.setContext(oContext);

		oBindingMock.expects("checkUpdateInternal")
			.withExactArgs(false, ChangeReason.Refresh, "myGroup")
			.returns(oCheckUpdatePromise);

		// code under test
		assert.strictEqual(oBinding.refreshInternal("", "myGroup", true), oCheckUpdatePromise);

		// code under test
		assert.strictEqual(oBinding.refreshInternal("", "myGroup", false).getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: suspended", function (assert) {
		var oBinding = this.oModel.bindProperty("NAME"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(true);
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("checkUpdateInternal").never();

		// code under test
		assert.strictEqual(oBinding.refreshInternal("myGroup", true).isFulfilled(), true);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("Name");

		oPropertyBinding.oCheckUpdateCallToken = {};
		oPropertyBinding.vValue = "foo";
		this.mock(oPropertyBinding).expects("deregisterChange").withExactArgs();
		this.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oPropertyBinding));
		this.mock(asODataBinding.prototype).expects("destroy").on(oPropertyBinding).withExactArgs();
		this.mock(PropertyBinding.prototype).expects("destroy").on(oPropertyBinding);

		// code under test
		oPropertyBinding.destroy();

		assert.strictEqual(oPropertyBinding.oCheckUpdateCallToken, undefined);
		assert.strictEqual(oPropertyBinding.vValue, undefined);
		assert.strictEqual(oPropertyBinding.mQueryOptions, undefined);
	});

	//*********************************************************************************************
["getValueListType", "requestValueListType"].forEach(function (sFunctionName) {
	QUnit.test(sFunctionName + ": forward", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
			oPropertyBinding = this.oModel.bindProperty("Category", oContext),
			vResult = {};

		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oPropertyBinding.sPath, oContext)
			.returns("~");
		this.mock(this.oModel.getMetaModel()).expects(sFunctionName)
			.withExactArgs("~").returns(vResult);

		// code under test
		assert.strictEqual(oPropertyBinding[sFunctionName](), vResult);
	});
});

	//*********************************************************************************************
	QUnit.test("requestValueListInfo : forward", function (assert) {
		var bAutoExpandSelect = {/*true or false*/},
			oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
			oPropertyBinding = this.oModel.bindProperty("Category", oContext),
			vResult = {};

		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oPropertyBinding.sPath, oContext)
			.returns("~");
		this.mock(this.oModel.getMetaModel()).expects("requestValueListInfo")
			.withExactArgs("~", sinon.match.same(bAutoExpandSelect)).returns(vResult);

		// code under test
		assert.strictEqual(oPropertyBinding.requestValueListInfo(bAutoExpandSelect), vResult);
	});

	//*********************************************************************************************
[
	"getValueListType", "requestValueListType", "requestValueListInfo"
].forEach(function (sFunctionName) {
	QUnit.test(sFunctionName + ": unresolved", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("Category");

		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oPropertyBinding.sPath, undefined)
			.returns(undefined);
		assert.throws(function () {
			oPropertyBinding[sFunctionName]();
		}, new Error(oPropertyBinding + " is not resolved yet"));
	});
});

	//*********************************************************************************************
	QUnit.test("doFetchQueryOptions", function (assert) {
		var oBinding = this.oModel.bindProperty("path", undefined, {custom : "foo"}),
			oPromise;

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);

		// code under test
		assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), {custom : "foo"});

		oBinding = this.oModel.bindProperty("path", undefined, {custom : "foo"});
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		// code under test
		oPromise = oBinding.doFetchQueryOptions();

		assert.deepEqual(oPromise.getResult(), {});
	});

	//*********************************************************************************************
	QUnit.test("doCreateCache", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/Name"),
			oCache = {},
			mCacheQueryOptions = {};

		this.mock(_Cache).expects("createProperty")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES('1')/Name",
				sinon.match.same(mCacheQueryOptions))
			.returns(oCache);

		// code under test
		assert.strictEqual(oBinding.doCreateCache("EMPLOYEES('1')/Name", mCacheQueryOptions),
			oCache);
	});
	//TODO discuss change in behavior for relative bindings:
	//   $$groupId, custom query option now leads to own
	//   cache for property binding -> adapt jsdoc for ODPB ctor, ODModel#bindProperty (remove Note: ...)

	//*********************************************************************************************
	QUnit.test("resetInvalidDataState", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_fireChange").never();

		// code under test
		oBinding.resetInvalidDataState();

		oBinding.getDataState().setInvalidValue("foo");
		oBindingMock.expects("_fireChange").withExactArgs({reason: ChangeReason.Change});

		// code under test
		oBinding.resetInvalidDataState();
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oMock,
			oOtherBinding = {
				doDeregisterChangeListener : function () {}
			},
			sPath = "foo";

		oMock = this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.deregisterChange();

		this.mock(oOtherBinding).expects("doDeregisterChangeListener")
			.withExactArgs(sPath, sinon.match.same(oBinding));

		// code under test - check that the function passed to withCache works as expected
		oMock.firstCall.args[0](null, sPath, oOtherBinding);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: withCache rejects sync", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oError = new Error("fail intentionally");

		this.mock(oBinding).expects("withCache").returns(SyncPromise.reject(oError));
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Error in deregisterChange", sClassName, sinon.match.same(oError));

		// code under test
		oBinding.deregisterChange();
	});

	//*********************************************************************************************
	QUnit.test("visitSideEffects", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test: nothing happens
		oBinding.visitSideEffects();
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCheckUpdate) {
		QUnit.test("resumeInternal: bCheckUpdate=" + bCheckUpdate, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
				oBinding = this.oModel.bindProperty("Category", oContext),
				oBindingMock = this.mock(oBinding),
				sResumeChangeReason = {/*change or refresh*/};

			oBinding.sResumeChangeReason = sResumeChangeReason;
			oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
			oBindingMock.expects("checkUpdateInternal").exactly(bCheckUpdate ? 1 : 0)
				.withExactArgs(false, sinon.match.same(sResumeChangeReason));

			// code under test
			oBinding.resumeInternal(bCheckUpdate);

			assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
		});
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			aDependentBindings;

		// code under test
		aDependentBindings = oBinding.getDependentBindings();

		assert.deepEqual(aDependentBindings, []);
		assert.strictEqual(oBinding.getDependentBindings(), aDependentBindings,
			"share empty array");

		assert.throws(function () {
			aDependentBindings.push("foo");
		});

	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInDependents", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), false);
	});

	//*********************************************************************************************
	QUnit.test("resetChangesInDependents", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test
		oBinding.resetChangesInDependents();
	});

	//*********************************************************************************************
	QUnit.test("getResumePromise", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test
		assert.strictEqual(oBinding.getResumePromise(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("adjustPredicate", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')");
	});

	//*********************************************************************************************
	QUnit.test("requestValue", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oPromise;

		this.mock(oBinding).expects("checkUpdateInternal")
			.returns(SyncPromise.resolve(Promise.resolve()));
		this.mock(oBinding).expects("getValue").returns("42");

		// code under test
		oPromise = oBinding.requestValue();

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (vValue) {
			assert.strictEqual(vValue, "42");
		});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		//*****************************************************************************************
		QUnit.test("PATCH an entity", function (assert) {
			var oModel = new ODataModel({
					serviceUrl : TestUtils.proxy(sServiceUrl),
					synchronizationMode : "None"
				}),
				oControl = new TestControl({
					models : oModel,
					objectBindings : "/BusinessPartnerList('0100000000')",
					text : "{path : 'PhoneNumber', type : 'sap.ui.model.odata.type.String'}"
				}),
				oBinding = oControl.getBinding("text");

			return new Promise(function (resolve) {
				//TODO cannot use "dataReceived" because oControl.getText() === undefined then...
				oBinding.attachEventOnce("change", function () {
					var sPhoneNumber = oControl.getText().indexOf("/") < 0
							? "06227/34567"
							: "0622734567";

					// code under test
					oControl.setText(sPhoneNumber);

					// Wait for #setValue to finish (then the response has been processed). The
					// assertion is only that no error/warning logs happen.
					resolve();
				});
			});
		});
	}
});
// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
