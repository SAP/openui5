/*!
 * ${copyright}
 */
sap.ui.define([
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
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, ManagedObject, SyncPromise, BindingMode, ChangeReason, BaseContext,
		PropertyBinding, TypeString, Context, asODataBinding, ODataModel, ODataPropertyBinding,
		_Cache, _Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
			metadata : {
				properties : {
					text : "string"
				}
			},
			// @see sap.ui.model.DataState and sap.ui.base.ManagedObject#_bindProperty
			refreshDataState : function () {}
		});

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataPropertyBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({serviceUrl : "/service/?sap-client=111"});
			this.mock(this.oModel.oRequestor).expects("request").never();
		},

		/**
		 * Creates a cache object with read and refresh method.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getPropertyCache : function () {
			var oCache = {
					fetchValue : function () {},
					setActive : function () {},
					update : function () {}
			};

			this.mock(_Cache).expects("createProperty").returns(oCache);
			return oCache;
		},

		/**
		 * Creates a Sinon mock for a cache object with read and refresh method.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getPropertyCacheMock : function () {
			return this.mock(this.getPropertyCache());
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

			return new Promise(function (fnResolve) {
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
				fnBindingSpy = this.spy(asODataBinding, "call"),
				oCache = {},
				oContext = Context.create(this.oModel, null, "/EMPLOYEES(ID='42')"),
				oExpectation = this.mock(this.oModel).expects("bindingCreated")
					.withExactArgs(sinon.match.object);

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
			assert.strictEqual(oExpectation.args[0][0], oBinding);
			assert.strictEqual(oBinding.getModel(), this.oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCachePromise"), true);
			assert.strictEqual(oBinding.oCachePromise.getResult(), bAbsolute ? oCache : null);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("oCheckUpdateCallToken"), true);
			assert.strictEqual(oBinding.oCheckUpdateCallToken, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("bHasDeclaredType"), true);
			assert.strictEqual(oBinding.bHasDeclaredType, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("mScope"), true);
			assert.strictEqual(oBinding.mScope, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("vValue"), true);
			assert.strictEqual(oBinding.vValue, undefined);
			assert.ok(fnBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with relative path and !v4.Context", function (assert) {
		var oBinding,
			oContext = {getPath : function () { return "/EMPLOYEES(ID='1')"; }},
			oExpectation = this.mock(this.oModel).expects("bindingCreated")
				.withExactArgs(sinon.match.object),
			sPath = "Name";

		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				assert.strictEqual(this.oContext, oContext);
			});

		//code under test
		oBinding = this.oModel.bindProperty(sPath, oContext);

		assert.strictEqual(oExpectation.args[0][0], oBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with parameters", function (assert) {
		var oBinding,
			mClonedParameters = {custom : "foo", scope : "bar"},
			oError = new Error("Unsupported ..."),
			oModelMock = this.mock(this.oModel),
			mParameters = {custom : "foo", scope : "bar"};

		this.mock(_Helper).expects("clone").twice().withExactArgs(sinon.match.same(mParameters))
			.returns(mClonedParameters);
		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mClonedParameters), false).returns("~mQueryOptions~");
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(null);

		// code under test
		oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");
		assert.strictEqual(oBinding.mQueryOptions, "~mQueryOptions~");

		// error for invalid parameters
		oModelMock.expects("buildQueryOptions").throws(oError);

		// code under test
		assert.throws(function () {
			this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with scope", function (assert) {
		var oBinding,
			mClonedParameters = {custom : "foo"},
			oModelMock = this.mock(this.oModel),
			mParameters = {custom : "foo", scope : {}};

		this.mock(_Helper).expects("clone").withExactArgs({custom : "foo"})
			.returns(mClonedParameters);
		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mClonedParameters), false)
			.returns("~mQueryOptions~");
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(null);

		// code under test
		oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");
		assert.strictEqual(oBinding.mScope, mParameters.scope);
		assert.deepEqual(mParameters, {custom : "foo", scope : {}});
		assert.strictEqual(oBinding.mQueryOptions, "~mQueryOptions~");
	});

	//*********************************************************************************************
["$count", "/SalesOrderList/$count"].forEach(function (sPath) {
	QUnit.test("bindProperty with system query options: " + sPath, function (assert) {
		var oBinding,
			mClonedParameters = {},
			oContext = {},
			mParameters = {
				$apply : "A.P.P.L.E.",
				$filter : "GrossAmount gt 123",
				$search : "covfefe"
			},
			mQueryOptions = {};

		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters))
			.returns(mClonedParameters);
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mClonedParameters), true).returns(mQueryOptions);
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext));

		// code under test
		oBinding = this.oModel.bindProperty(sPath, oContext, mParameters);

		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
	});
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
	QUnit.test("bindProperty: empty path is valid for base context", function () {
		var oBaseContext = this.oModel.createBindingContext("/ProductList('HT-1000')/Name");

		// code under test
		this.oModel.bindProperty("", oBaseContext);
	});

	//*********************************************************************************************
	QUnit.test("bindProperty: client-side annotation", function (assert) {
		// code under test
		const oBinding = this.oModel.bindProperty("@$ui5.context.isSelected",
			this.oModel.createBindingContext("/n/a"));

		assert.strictEqual(oBinding.bNoPatch, true);
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
				oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')", true),
				sInitialReducedPath = oInitialContext ? "/EMPLOYEES(ID='1')/Name" : undefined,
				oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')");

			function createContext(sType, sPath, bFetchCache) {
				if (sType === "base") {
					oCacheMock.expects("createProperty").exactly(bFetchCache ? 1 : 0)
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
			assert.strictEqual(oBinding.sReducedPath, sInitialReducedPath);
			if (oFixture.sInit === "base") {
				assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
			} else {
				assert.strictEqual(oBinding.oCachePromise.getResult(), null);
			}
			this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
			this.mock(oBinding).expects("deregisterChangeListener").withExactArgs();
			this.mock(oBinding).expects("fetchCache")
				.withExactArgs(sinon.match.same(oTargetContext));
			this.mock(oBinding).expects("checkUpdateInternal")
				.withExactArgs(/*bInitial*/true, "context").returns(SyncPromise.resolve());

			//code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.sReducedPath,
				oTargetContext ? undefined : sInitialReducedPath);

			// code under test
			// #deregisterChangeListener is not called again if #setContext is called with the same
			// context
			oBinding.setContext(oTargetContext);
		});
	});
	//TODO cache promise is NOT always fulfilled

	//*********************************************************************************************
	QUnit.test("doSetType", function () {
		const oBinding = this.oModel.bindProperty("Name");
		oBinding.sInternalType = "~sInternalType~";

		this.mock(PropertyBinding.prototype).expects("setType").on(oBinding)
			.withExactArgs("~type~", "~sInternalType~");

		// code under test
		oBinding.doSetType("~type~");
	});

	//*********************************************************************************************
["A", "B"].forEach(function (sResolvedMetaPath) {
	[false, true].forEach(function (bHasDeclaredType) {
		var sTitle = "setContext: reset type, " + sResolvedMetaPath
			+ ", bHasDeclaredType=" + bHasDeclaredType;

	QUnit.test(sTitle, function (assert) {
		var oInitialContext = Context.create(this.oModel, null/*oBinding*/, "/EMPLOYEES('1')"),
			oBinding = this.oModel.bindProperty("Name", oInitialContext),
			oHelperMock = this.mock(_Helper),
			oType = new TypeString();

		oBinding.sReducedPath = "~reduced~";
		oBinding.setType(oType);
		oBinding.bHasDeclaredType = bHasDeclaredType;
		this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
		this.mock(oBinding).expects("deregisterChangeListener").withExactArgs();
		this.mock(this.oModel).expects("resolve").exactly(bHasDeclaredType ? 0 : 1)
			.withExactArgs("Name", "~oTargetContext~").returns("/TEAMS('1')");
		oHelperMock.expects("getMetaPath").exactly(bHasDeclaredType ? 0 : 1)
			.withExactArgs("/TEAMS('1')").returns(sResolvedMetaPath);
		oHelperMock.expects("getMetaPath").exactly(bHasDeclaredType ? 0 : 1)
			.withExactArgs("~reduced~").returns("A");
		this.mock(oBinding).expects("doSetType")
			.exactly(bHasDeclaredType || sResolvedMetaPath === "A" ? 0 : 1)
			.withExactArgs(undefined)
			.callThrough();
		this.mock(oBinding).expects("fetchCache").withExactArgs("~oTargetContext~");
		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(/*bInitial*/true, "context").returns(SyncPromise.resolve());

		// code under test
		oBinding.setContext("~oTargetContext~");

		assert.strictEqual(oBinding.getType(),
			bHasDeclaredType || sResolvedMetaPath === "A" ? oType : undefined);
		assert.strictEqual(oBinding.sReducedPath, undefined);
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bHasMessages) {
	var sTitle = "checkUpdateInternal(undefined) consider data state control messages"
		+ ", bHasMessages = " + bHasMessages;

	QUnit.test(sTitle, function () {
		var oContext = Context.create(this.oModel, {/*list binding*/}, "/..."),
			oBinding = this.oModel.bindProperty("relative", oContext),
			oDataState = {getControlMessages : function () {}};

		oBinding.vValue = 42; // internal value in the model

		this.mock(oBinding).expects("getDataState").withExactArgs()
			.returns(oDataState);
		this.mock(oDataState).expects("getControlMessages").withExactArgs()
			.returns(bHasMessages ? ["invalid data state"] : []);
		// Note: it is important that automatic type determination runs as soon as possible
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(SyncPromise.resolve("~UI5Type~"));
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("/.../relative", sinon.match.same(oBinding))
			.returns(SyncPromise.resolve(42)); // no change
		this.mock(oBinding).expects("doSetType").withExactArgs("~UI5Type~");
		this.mock(oBinding).expects("_fireChange").exactly(bHasMessages ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});
		// checkDataState is called independently of bForceUpdate
		this.mock(oBinding).expects("checkDataState").withExactArgs();

		// code under test
		return oBinding.checkUpdateInternal(undefined);
	});
});

	//*********************************************************************************************
	[false, true].forEach(function (bForceUpdate) {
		QUnit.test("checkUpdateInternal(" + bForceUpdate + "): unchanged", function (assert) {
			var that = this;

			return this.createTextBinding(assert, 3).then(function (oBinding) {
				var bGotChangeEvent = false;

				oBinding.attachChange(function () {
					bGotChangeEvent = true;
				});
				that.mock(that.oModel.getMetaModel()).expects("getMetaContext").never();
				// checkDataState is called independently of bForceUpdate
				that.mock(oBinding).expects("checkDataState").withExactArgs();

				return Promise.all([
					// code under test
					oBinding.checkUpdateInternal(bForceUpdate),
					// code under test
					oBinding.checkUpdateInternal() // must not override previous bForceUpdate
				]).then(function () {
					assert.strictEqual(bGotChangeEvent, bForceUpdate,
						"got change event as expected");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(true): no change event for virtual context", function (assert) {
		var oVirtualContext = Context.create(this.oModel, {/*list binding*/},
				"/.../" + Context.VIRTUAL, Context.VIRTUAL),
			oBinding = this.oModel.bindProperty("relative", oVirtualContext);

		oBinding.sReducedPath = "~reduced~";
		// Note: automatic type determination not yet needed
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
		oBinding.attachChange(function () {
			assert.ok(false, "no change event for virtual context");
		});

		// code under test
		return oBinding.checkUpdateInternal(true);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(true): no change event in virtual row", function (assert) {
		// a Context dependent to a virtual context
		var oVirtualContext = Context.create(this.oModel, {/*list binding*/},
				"/EMPLOYEES/" + Context.VIRTUAL + "/EMPLOYEE_2_MANAGER"),
			oBinding = this.oModel.bindProperty("relative", oVirtualContext),
			sResolvedPath = "/EMPLOYEES/" + Context.VIRTUAL + "/EMPLOYEE_2_MANAGER/relative";

		// Note: automatic type determination not yet needed
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
		// The parent virtual context ensures that there is no cache access
		this.mock(oVirtualContext).expects("fetchValue").withExactArgs(sResolvedPath, oBinding)
			.returns(SyncPromise.resolve());
		oBinding.attachChange(function () {
			assert.ok(false, "no change event for virtual context");
		});

		// code under test
		return oBinding.checkUpdateInternal(true);
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

		oBinding.sInternalType = "~sInternalType~";
		this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", oBinding)
			.returns(SyncPromise.resolve("foo"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative")
			.returns(SyncPromise.resolve(oType));
		this.mock(oBinding).expects("doSetType").twice().withExactArgs(sinon.match.same(oType))
			.callThrough();
		this.mock(oType).expects("formatValue").withExactArgs("foo", "~sInternalType~")
			.returns("*foo*");
		this.mock(oBinding).expects("setType").never();

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
			.returns(new SyncPromise(function () {})); // does not resolve!

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

		oBinding.sReducedPath = "~reduced~";
		oBinding.setBindingMode(BindingMode.OneTime);
		oBinding.setType(null, "any");
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
			.returns(SyncPromise.resolve(vValue));
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(vValue))
			.returns(vValueClone);
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

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

		oBinding.sReducedPath = "~reduced~";
		// Note: we do not require BindingMode.OneTime for action advertisements
		oBinding.setType(null, "any");
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
			.returns(SyncPromise.resolve(vValue));
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(vValue))
			.returns(vValueClone);
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

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
				oCache = bAbsolute && this.getPropertyCache(),
				oCacheMock = oCache && this.mock(oCache),
				oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
				oBinding = this.oModel.bindProperty(oFixture.path, oContext),
				oGroupLock = {},
				oMetaContext = {},
				sResolvedPath = this.oModel.resolve(oFixture.path, oContext),
				vValue = {/* non-primitive */},
				that = this;

			oBinding.sReducedPath = "~reduced~";
			oBinding.setBindingMode(oFixture.mode);
			oBinding.setType(null, oFixture.internalType);
			if (bAbsolute) {
				this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");
				this.mock(oBinding).expects("lockGroup").withExactArgs("$auto").returns(oGroupLock);
				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func,
						sinon.match.same(oBinding))
					.returns(SyncPromise.resolve(Promise.resolve().then(function () {
						that.mock(oBinding).expects("assertSameCache")
							.withExactArgs(sinon.match.same(oCache));
						return vValue;
					})));
			} else if (oFixture.path.startsWith("##")) { // meta binding
				this.mock(this.oModel.getMetaModel()).expects("getMetaContext")
					.withExactArgs("/EntitySet('foo')")
					.returns(oMetaContext);
				this.mock(this.oModel.getMetaModel()).expects("fetchObject")
					.withExactArgs("@SAP_Common.Label", sinon.match.same(oMetaContext), undefined)
					.returns(SyncPromise.resolve(vValue));
			} else {
				this.mock(oContext).expects("fetchValue")
					.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
					.returns(SyncPromise.resolve(vValue));
			}
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.exactly(oFixture.internalType !== "any" ? 1 : 0)
				.withExactArgs("~reduced~")
				.returns(SyncPromise.resolve("~UI5Type~"));
			this.oLogMock.expects("error")
				.withExactArgs("Accessed value is not primitive",
					sResolvedPath, sClassName);
			this.mock(oBinding).expects("doSetType")
				.withExactArgs(oFixture.internalType !== "any" ? "~UI5Type~" : null);

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

			oBinding.sReducedPath = "~reduced~";
			oBinding.setType(null, "any");
			this.mock(oContext).expects("fetchValue")
				.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
				.returns(SyncPromise.resolve(vValue));
			this.mock(_Helper).expects("publicClone").never();
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

			// code under test
			return oBinding.checkUpdateInternal().then(function () {
				assert.strictEqual(oBinding.getValue(), vValue);
			});
		});
	});

	//*********************************************************************************************
	// Unit test for scenario in
	// ODataModel.integration.qunit, @sap.ui.table.Table with VisibleRowCountMode='Auto'
	QUnit.test("checkUpdateInternal(true): later call resets this.oContext", function () {
		var oParentBinding = {
				fetchIfChildCanUseCache : function () {
					return SyncPromise.resolve(Promise.resolve(true));
				}
			},
			oModel = new ODataModel({
				autoExpandSelect : true,
				serviceUrl : "/service/?sap-client=111"
			}),
			oContext = Context.create(oModel, oParentBinding, "/..."),
			oBinding = oModel.bindProperty("relative", oContext),
			oPromise0,
			oPromise1;

		this.mock(oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(SyncPromise.resolve("~UI5Type~"));
		this.mock(oBinding).expects("doSetType").withExactArgs(undefined);
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
			that.mock(oBinding).expects("checkSuspended").withExactArgs(true);
			that.mock(oBinding).expects("deregisterChangeListener").withExactArgs();
			that.mock(oBinding).expects("fetchCache").withExactArgs(undefined);
			that.mock(oBinding).expects("checkUpdateInternal")
				.withExactArgs(undefined, ChangeReason.Context)
				.callThrough();
			that.mock(that.oModel.getMetaModel()).expects("fetchUI5Type").never();
			assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
			oBinding.attachChange(fnChangeHandler, oBinding);

			// code under test
			oBinding.setContext(); // reset context invokes checkUpdate
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
			return oBinding.checkUpdateInternal(false).then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
				assert.strictEqual(oBinding.getValue(), undefined,
					"read error resets the value");
				assert.ok(bChangeReceived, "Value changed -> expecting change event");
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
			return oBinding.checkUpdateInternal(true).then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
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
	QUnit.test("checkUpdateInternal(): absolute with sGroupId", function () {
		var oBinding,
			oCacheMock = this.getPropertyCacheMock(),
			oGroupLock = {};

		oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");
		oBinding.setType(null, "any"); // avoid fetchUI5Type()
		this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func, oBinding)
			.returns(SyncPromise.resolve());
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

		// code under test
		return oBinding.checkUpdateInternal(false, undefined, "group");
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): relative with sGroupId", function () {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/Me"),
			oBinding = this.oModel.bindProperty("property", oContext);

		oBinding.sReducedPath = "~reduced~";
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("~reduced~")
			.returns(SyncPromise.resolve("~UI5Type~"));
		this.mock(oBinding).expects("doSetType").withExactArgs("~UI5Type~");
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, oBinding)
			.returns(SyncPromise.resolve());

		// code under test
		return oBinding.checkUpdateInternal(false, undefined, "group");
	});

	//*********************************************************************************************
	["foo", false, null].forEach(function (vValue) {
		QUnit.test("checkUpdateInternal(): with vValue parameter: " + vValue, function (assert) {
			var oBinding = this.oModel.bindProperty("/absolute"),
				oPromise,
				done = assert.async();

			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.withExactArgs("/absolute")
				.returns(SyncPromise.resolve("~UI5Type~"));
			this.mock(oBinding).expects("doSetType").withExactArgs("~UI5Type~").callThrough();
			oBinding.vValue = ""; // simulate a read
			oBinding.attachChange(function () {
				assert.strictEqual(oBinding.getType(), "~UI5Type~");
				assert.strictEqual(oBinding.getValue(), vValue);
				done();
			});
			this.mock(oBinding.oCachePromise).expects("then").never();

			// code under test
			oPromise = oBinding.checkUpdateInternal(undefined, undefined, undefined, false, vValue);

			assert.ok(oPromise.isFulfilled());
			assert.strictEqual(oBinding.getValue(), vValue);

			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal(): with vValue parameter: undefined", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
			oBinding = this.oModel.bindProperty("property/path", oContext);

		oBinding.sReducedPath = "~reduced~";
		oBinding.setType(null, "any");
		oBinding.vValue = ""; // simulate a read
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding))
			.returns(SyncPromise.resolve("~value~"));
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change})
			.callsFake(function () {
				assert.strictEqual(oBinding.getValue(), "~value~");
			});

		// code under test
		return oBinding.checkUpdateInternal(undefined, undefined, undefined, false, undefined)
			.then(function () {
				assert.strictEqual(oBinding.getValue(), "~value~");
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
	}, {
		contextPath : "/Irrelevant",
		path : "/Artists('42')/Name##@SAP_Common.Label",
		scope : {},
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
			oBinding = this.oModel.bindProperty(oFixture.path, oContext,
				oFixture.scope ? {scope : oFixture.scope} : undefined);

			this.mock(this.oModel.getMetaModel()).expects("getMetaContext")
				.withExactArgs(oFixture.path.startsWith("##/")
					? "/Artists('42')"
					: "/Artists('42')/Name")
				.returns(oMetaContext);
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs(oFixture.path.startsWith("##/")
					? "./@SAP_Common.Label"
					: "@SAP_Common.Label",
					sinon.match.same(oMetaContext),
					oFixture.scope ? {scope : sinon.match.same(oFixture.scope)} : undefined)
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
			.withExactArgs("@Capabilities.InsertRestrictions", sinon.match.same(oMetaContext),
				undefined)
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
				false, undefined)
			.returns({
				fetchValue : function (_sGroupId, sPath) {
					assert.strictEqual(sPath, "property");
					return Promise.resolve("value");
				}
			});

		// This creates and initializes a context binding at the control. The change handler of the
		// context binding calls setContext at the property's binding which completes the path and
		// invokes a checkUpdate (resulting in the read). This then fires a change event at the
		// property binding.
		oControl.bindObject("/EntitySet('foo')");
	});

	//*********************************************************************************************
	QUnit.test("setContext on binding with absolute path", function (assert) {
		var oBinding = this.oModel.bindProperty("/EntitySet('foo')/property"),
			oContext = {};

		oBinding.sResumeChangeReason = ChangeReason.Change; // simulate initially suspended binding
		this.mock(oBinding).expects("checkSuspended").never();
		this.mock(oBinding).expects("deregisterChangeListener").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("checkUpdateInternal").never();

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");
		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("ManagedObject.bindProperty: type and value, path " + sPath, function (assert) {
			var that = this;

			return new Promise(function (finishTest) {
				var bAbsolute = sPath[0] === "/",
					oValue = "foo",
					oCache = {
						fetchValue : function (_oGroupLock, _sReadPath, fnDataRequested) {
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
						{"sap-client" : "111"}, false, false, undefined);
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
					fetchValue : function (_sGroupId, _sPath, fnDataRequested) {
						fnDataRequested();
						return Promise.resolve(oValue);
					}
				},
				oCacheMock = this.mock(_Cache),
				oControl = new TestControl({models : this.oModel}),
				fnDone,
				oDataReceivedPromise = new Promise(function (resolve) {
					fnDone = resolve;
				}),
				sPath = "/path",
				oRawType = {
					formatValue : function (vValue) { return vValue; },
					getName : function () { return "foo"; }
				},
				fnSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdateInternal");

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
				fnSpy.returnValues[0].then(function () {
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
				fetchValue : function (_sGroupId, _sPath, fnDataRequested) {
					fnDataRequested();
					return Promise.reject(oError);
				}
			},
			oControl = new TestControl({models : this.oModel}),
			done = assert.async();

		this.mock(_Cache).expects("createProperty").returns(oCache);
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to read path /path", sClassName, sinon.match.same(oError))
			.callsFake(function (_sLogMessage, _sReportingClassName, oError) {
				oError.$reported = true; // important for #getReporter
			});

		//code under test
		oControl.bindProperty("text", {
			path : "/path",
			type : new TypeString(),
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

		return oBinding.checkUpdateInternal(false).then(function () {
			assert.strictEqual(oBinding.getValue(), "foo");
			return oBinding.checkUpdateInternal(false).then(function () {
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
		QUnit.test("automaticTypes: bForceUpdate = " + bForceUpdate,
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

				this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
					.withExactArgs(sPath)
					.returns(SyncPromise.resolve(oRawType));

				function onChange() {
					oBinding.detachChange(onChange);
					oBinding.attachChange(done);
					setTimeout(function () {
						oBinding.checkUpdateInternal(bForceUpdate);
						//TODO return promise from above?!
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
[false, true].forEach(function (bSuccess) {
	QUnit.test("dataRequested/dataReceived: success=" + bSuccess, function (assert) {
		var oBinding = this.oModel.bindProperty("/EntitySet('foo')/Name");

		oBinding.sReducedPath = "~reduced~";
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("n/a");
		this.mock(this.oModel.oMetaModel).expects("fetchUI5Type").withExactArgs("~reduced~")
			.resolves("~UI5Type~");
		this.mock(oBinding).expects("lockGroup").withExactArgs("groupId").returns("~oGroupLock~");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs("~bPreventBubbling~");
		this.mock(oBinding.oCache).expects("fetchValue")
			.withExactArgs("~oGroupLock~", undefined, sinon.match.func, sinon.match.same(oBinding))
			.callsFake(function () {
				arguments[2](); // code under test
				return bSuccess ? Promise.resolve("~vValue~") : Promise.reject("~oError~");
			});
		this.mock(this.oModel).expects("reportError").exactly(bSuccess ? 0 : 1);
		this.mock(oBinding).expects("_fireChange").exactly(bSuccess ? 1 : 0)
			.withExactArgs({reason : "~reason~"});
		this.mock(oBinding).expects("checkDataState");
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs(bSuccess ? {data : {}} : {error : "~oError~"}, "~bPreventBubbling~")
			.callsFake(function () {
				if (bSuccess) {
					assert.strictEqual(oBinding.getValue(), "~vValue~");
				}
			});

		// code under test
		return oBinding.checkUpdateInternal(false, "~reason~", "groupId", "~bPreventBubbling~")
			.then(function () {
				assert.strictEqual(oBinding.getValue(), "~vValue~");
				assert.strictEqual(oBinding.getType(), "~UI5Type~");
			}, function (oError) {
				assert.strictEqual(oError, "~oError~");
				assert.strictEqual(oBinding.getType(), "~UI5Type~");
			});
	});
});

	//*********************************************************************************************
	QUnit.test("expression binding", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oModel = new ODataModel({serviceUrl : "/service/"}),
			oPromise = Promise.resolve("value"),
			oTestControl = new TestControl({
				text : "{= !${path:'@odata.etag',type:'sap.ui.model.odata.type.String'} }",
				models : oModel
			});

		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {}, false, false, undefined)
			.returns({
				fetchValue : function () {
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
	QUnit.test("$$ignoreMessages", function (assert) {
		var oPropertyBindingMock = this.mock(PropertyBinding.prototype),
			oBinding;

		oPropertyBindingMock.expects("setIgnoreMessages").never();

		// code under test
		oBinding = this.oModel.bindProperty("/foo");

		assert.strictEqual(oBinding.getIgnoreMessages(), undefined);

		oPropertyBindingMock.expects("setIgnoreMessages").withExactArgs(true).callThrough();

		// code under test
		oBinding = this.oModel.bindProperty("/foo", undefined, {$$ignoreMessages : true});

		assert.strictEqual(oBinding.getIgnoreMessages(), true);

		oPropertyBindingMock.expects("setIgnoreMessages").withExactArgs(false).callThrough();

		// code under test
		oBinding = this.oModel.bindProperty("/foo", undefined, {$$ignoreMessages : false});

		assert.strictEqual(oBinding.getIgnoreMessages(), false);
	});

	//*********************************************************************************************
	QUnit.test("supportsIgnoreMessages", function (assert) {
		// code under test
		assert.strictEqual(ODataPropertyBinding.prototype.supportsIgnoreMessages(), true);
	});

	//*********************************************************************************************
	QUnit.test("$$noPatch", function (assert) {
		var oBinding = this.oModel.bindProperty("/foo");

		// code under test
		assert.strictEqual(oBinding.bNoPatch, false);

		oBinding = this.oModel.bindProperty("/foo", undefined, {$$noPatch : true});

		// code under test
		assert.strictEqual(oBinding.bNoPatch, true);
	});

	//*********************************************************************************************
	[undefined, "$direct"].forEach(function (sGroupId) {
		QUnit.test("checkUpdateInternal, binding group ID " + sGroupId, function () {
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

			// code under test
			return oBinding.checkUpdateInternal();
		});
	});

	//*********************************************************************************************
	QUnit.test("initialize", function (assert) {
		var oBinding = this.oModel.bindProperty("/absolute");

		this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oBinding);
		this.mock(oBinding).expects("isSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("checkUpdate").withExactArgs(true);

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("initialize: unresolved", function (assert) {
		var oBinding = this.oModel.bindProperty("relative");

		this.mock(oBinding).expects("getRootBinding").never();
		this.mock(oBinding).expects("checkUpdate").never();

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("initialize: suspended", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"),
			oBinding = this.oModel.bindProperty("relative", oContext),
			oRootBinding = {
				isSuspended : function () {}
			};

		this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkUpdate").never();

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
	});

	//*********************************************************************************************
[false, true].forEach(function (bForceUpdate) {
	QUnit.test("onChange", function () {
		var oBinding = this.oModel.bindProperty("/absolute");

		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(bForceUpdate, undefined, undefined, false, "~vValue~")
			.returns(SyncPromise.resolve());
		this.mock(this.oModel).expects("getReporter").withExactArgs()
			.returns(function () { throw new Error(); });

		// code under test
		oBinding.onChange("~vValue~", bForceUpdate);
	});
});

	//*********************************************************************************************
	QUnit.test("onChange: checkUpdateInternal fails", function () {
		var oBinding = this.oModel.bindProperty("/absolute"),
			oError = new Error("This call intentionally failed"),
			fnReporter = sinon.spy();

		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(undefined, undefined, undefined, false, "~vValue~")
			.returns(SyncPromise.reject(oError));
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oBinding.onChange("~vValue~");

		sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
		oControl.getBinding("text").attachChange(function () {
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
		oControl.getBinding("text").attachChange(function () {
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
			oModel = new ODataModel({serviceUrl : "/"}),
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
		oPropertyBinding.setValue("foo"); // must not invoke a 2nd PATCH

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
	//     /EMPLOYEES('2')/EMPLOYEE_2_MANAGER/TEAM_ID) --> accept restriction for now
	//TODO if the back end returns a different value we should take care
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
			this.mock(this.oModel).expects("hasListeners").never();
			this.mock(this.oModel).expects("firePropertyChange").never();

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
				serviceUrl : "/service/?sap-client=111"
			}),
			oPromise = Promise.reject(oError),
			oPropertyBinding = oModel.bindProperty("/ProductList('0')/Name");

		this.mock(oPropertyBinding.oCache).expects("update")
			.withExactArgs("$direct", "Name", "foo", "ProductList('0')")
			.returns(oPromise);
		this.mock(this.oModel).expects("hasListeners").never();
		this.mock(this.oModel).expects("firePropertyChange").never();
		this.oLogMock.expects("error").withExactArgs(sMessage, oError.stack, sClassName);

		// code under test
		oPropertyBinding.setValue("foo");

		assert.strictEqual(oPropertyBinding.getValue(), "foo", "keep user input");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
["foo", null].forEach(function (vValue) {
	[false, true].forEach(function (bHasListeners) {
		var sTitle = "setValue (relative binding) via control, value : " + vValue
			+ "; 'propertyChange' has listeners: " + bHasListeners;

	QUnit.test(sTitle, function () {
		var oParentBinding = this.oModel.bindContext("/BusinessPartnerList('0100000000')"),
			oContext = oParentBinding.getBoundContext(),
			oBinding = this.oModel.bindProperty("Address/City", oContext),
			oGroupLock = {};

		oBinding.vValue = ""; // simulate a read - intentionally use a falsy value

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("up");
		this.mock(this.oModel).expects("hasListeners").withExactArgs("propertyChange")
			.returns(bHasListeners);
		this.mock(this.oModel).expects("firePropertyChange").exactly(bHasListeners ? 1 : 0)
			.withExactArgs({
				context : oContext,
				path : "Address/City",
				promise : sinon.match.instanceOf(Promise),
				reason : ChangeReason.Binding,
				resolvedPath : "/BusinessPartnerList('0100000000')/Address/City",
				value : vValue
			});
		this.mock(oBinding).expects("lockGroup").withExactArgs("up", true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("Address/City", sinon.match.same(vValue), sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve()));

		// code under test
		oBinding.setValue(vValue, "up");
	});
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

		// Note: do NOT simulate a read
		oModelMock.expects("lockGroup").never();
		this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
		oContextMock.expects("doSetProperty").withExactArgs("Name", "foo", null)
			.returns(SyncPromise.resolve());
		oModelMock.expects("hasListeners").withExactArgs("propertyChange").returns(true);
		oModelMock.expects("firePropertyChange")
			.withExactArgs({
				context : oContext,
				path : "Name",
				promise : undefined, // we're not async here
				reason : ChangeReason.Binding,
				resolvedPath : "/ProductList('HT-1000')/Name",
				value : "foo"
			});

		// code under test
		oBinding.setValue("foo");

		oContextMock.expects("doSetProperty").withExactArgs("Name", "bar", null)
			.returns(oUpdatePromise);
		oModelMock.expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oIntentionallyFailedError));
		oModelMock.expects("hasListeners").never(); // no event in case of sync failure
		oModelMock.expects("firePropertyChange").never();

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
	QUnit.test("setValue (relative binding): error handling", function () {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
			oGroupLock = {unlock : function () {}},
			oPropertyBinding = this.oModel.bindProperty("Name", oContext),
			oRejectedPromise = Promise.reject(oError),
			oUpdatePromise = SyncPromise.resolve(oRejectedPromise);

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
		this.mock(this.oModel).expects("hasListeners").withExactArgs("propertyChange")
			.returns(true);
		this.mock(this.oModel).expects("firePropertyChange")
			.withExactArgs({
				context : oContext,
				path : "Name",
				promise : sinon.match.same(oRejectedPromise),
				reason : ChangeReason.Binding,
				resolvedPath : "/ProductList('HT-1000')/Name",
				value : "foo"
			});

		// code under test
		oPropertyBinding.setValue("foo", "up");
		// must still report the correct path (setContext avoided due to side effects)
		oPropertyBinding.oContext = null;

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
		this.mock(this.oModel).expects("hasListeners").never();
		this.mock(this.oModel).expects("firePropertyChange").never();
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
	QUnit.test("setValue (relative binding): unchanged", function () {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		oPropertyBinding.vValue = "foo";
		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("doSetProperty").never();
		this.mock(this.oModel).expects("hasListeners").never();
		this.mock(this.oModel).expects("firePropertyChange").never();

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

		assert.strictEqual(oPropertyBinding.bHasDeclaredType, undefined);
		this.mock(oDateTimeOffset).expects("setV4");
		this.mock(oSomeType).expects("setV4").never();

		// code under test
		oPropertyBinding.setType(null);

		assert.strictEqual(oPropertyBinding.bHasDeclaredType, false);

		// code under test
		oPropertyBinding.setType(oDateTimeOffset);

		assert.strictEqual(oPropertyBinding.bHasDeclaredType, true);

		// code under test
		oPropertyBinding.setType(oSomeType);

		assert.strictEqual(oPropertyBinding.bHasDeclaredType, true);

		// code under test
		oPropertyBinding.setType(null);

		assert.strictEqual(oPropertyBinding.bHasDeclaredType, false);
	});

	//*********************************************************************************************
	QUnit.test("setType: change events", function (assert) {
		return this.createTextBinding(assert).then((oBinding) => {
			var sChangeReason,
				oSomeType = {
					getName : function () { return "foo"; },
					formatValue : function (vValue) { return vValue; }
				};

			oBinding.attachChange(function (oEvent) {
				sChangeReason = oEvent.getParameter("reason");
				assert.strictEqual(oBinding.getType(), oSomeType);
			});
			this.mock(PropertyBinding.prototype).expects("setType").twice().on(oBinding)
				.withExactArgs(sinon.match.same(oSomeType), "~sInternalType~").callThrough();

			// code under test
			oBinding.setType(oSomeType, "~sInternalType~");

			assert.strictEqual(sChangeReason, ChangeReason.Change);

			sChangeReason = undefined;

			// code under test
			oBinding.setType(oSomeType, "~sInternalType~");

			assert.strictEqual(sChangeReason, undefined, "no event for same type");
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bCheckUpdate) {
	QUnit.test("refreshInternal: bCheckUpdate = " + bCheckUpdate, function (assert) {
		var oBinding = this.oModel.bindProperty("NAME"),
			oCheckUpdatePromise = {},
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES/42"),
			that = this;

		oBinding.oContext = oContext; // avoid #setContext, it calls too many other methods
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding.oCachePromise).expects("then").callsFake(function (fnThen) {
			that.mock(oBinding).expects("fetchCache")
				.withExactArgs(oContext, false, /*bKeepQueryOptions*/true, "~bKeepCacheOnError~");
			that.mock(oBinding).expects("checkUpdateInternal")
				.exactly(bCheckUpdate ? 1 : 0)
				.withExactArgs(undefined, ChangeReason.Refresh, "myGroup", "~bKeepCacheOnError~")
				.returns(oCheckUpdatePromise);
			return Promise.resolve().then(fnThen);
		});

		// code under test
		return oBinding.refreshInternal("", "myGroup", bCheckUpdate, "~bKeepCacheOnError~")
			.then(function (vResult) {
				assert.strictEqual(vResult, bCheckUpdate ? oCheckUpdatePromise : undefined);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: suspended", function (assert) {
		var oBinding = this.oModel.bindProperty("NAME"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(true);
		oBindingMock.expects("refreshSuspended").withExactArgs("myGroup");
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("checkUpdateInternal").never();

		// code under test
		assert.strictEqual(oBinding.refreshInternal("", "myGroup", true).isFulfilled(), true);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: singleton property", function () {
		var oBinding = this.oModel.bindProperty("/Singleton/Property"),
			that = this;

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding.oCachePromise).expects("then").callsFake(function (fnThen) {
			that.mock(oBinding.oCache).expects("reset").withExactArgs();
			that.mock(oBinding).expects("fetchCache").never();
			that.mock(oBinding).expects("checkUpdateInternal").never();
			return Promise.resolve().then(fnThen);
		});

		// code under test
		return oBinding.refreshInternal("n/a", "myGroup", false, "n/a");
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("Name");

		oPropertyBinding.oCheckUpdateCallToken = {};
		oPropertyBinding.vValue = "foo";
		this.mock(oPropertyBinding).expects("deregisterChangeListener").withExactArgs();
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

		this.mock(oPropertyBinding).expects("getResolvedPath").withExactArgs().returns("~");
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

		this.mock(oPropertyBinding).expects("getResolvedPath").withExactArgs().returns("~");
		this.mock(this.oModel.getMetaModel()).expects("requestValueListInfo")
			.withExactArgs("~", sinon.match.same(bAutoExpandSelect), sinon.match.same(oContext))
			.returns(vResult);

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
		}, new Error(oPropertyBinding + " is unresolved"));
	});
});

	//*********************************************************************************************
	QUnit.test("doFetchOrGetQueryOptions", function (assert) {
		var oBinding = this.oModel.bindProperty("path", undefined, {custom : "foo"});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);

		// code under test
		assert.deepEqual(oBinding.doFetchOrGetQueryOptions(), {custom : "foo"});

		oBinding = this.oModel.bindProperty("path", undefined, {custom : "foo"});
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(oBinding.doFetchOrGetQueryOptions(), undefined);
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
	//   cache for property binding
	//   -> adapt jsdoc for ODPB ctor, ODModel#bindProperty (remove Note: ...)

	//*********************************************************************************************
	QUnit.test("resetInvalidDataState", function () {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_fireChange").never();

		// code under test
		oBinding.resetInvalidDataState();

		oBinding.getDataState().setInvalidValue("foo");
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.resetInvalidDataState();
	});

	//*********************************************************************************************
[false, true].forEach(function (bRelative) {
	[false, true].forEach(function (bHasContext) {
		[false, true].forEach(function (bHasMethod) {
		const sTitle = `deregisterChangeListener: relative=${bRelative}, w/ context=${bHasContext},
			w/ method=${bHasMethod}`;

	QUnit.test(sTitle, function () {
		const oBinding = this.oModel.bindProperty((bRelative ? "" : "/") + "EMPLOYEES('1')/AGE");
		if (bRelative && bHasContext) {
			oBinding.oContext = {};
			if (bHasMethod) {
				oBinding.oContext.deregisterChangeListener = mustBeMocked;
				this.mock(oBinding.oContext).expects("deregisterChangeListener").twice()
					.withExactArgs(sinon.match.same(oBinding)).returns(false);
			}
		}
		oBinding.sReducedPath = "/reduced/path";
		this.mock(oBinding).expects("doDeregisterChangeListener")
			.withExactArgs("/reduced/path", sinon.match.same(oBinding));

		// code under test
		oBinding.deregisterChangeListener();

		oBinding.sReducedPath = undefined;

		// code under test - no further doDeregisterChangeListener
		oBinding.deregisterChangeListener();
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("deregisterChangeListener: ask context; answers true", function () {
		const oBinding = this.oModel.bindProperty("EMPLOYEES('1')/AGE");
		oBinding.oContext = {deregisterChangeListener : mustBeMocked};
		oBinding.sReducedPath = "/reduced/path";

		this.mock(oBinding.oContext).expects("deregisterChangeListener")
			.withExactArgs(sinon.match.same(oBinding)).returns(true);

		// code under test
		oBinding.deregisterChangeListener();
	});

	//*********************************************************************************************
	QUnit.test("visitSideEffects", function () {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		// code under test: nothing happens
		oBinding.visitSideEffects();
	});

	//*********************************************************************************************
[
	{checkUpdate : false, parentHasChanges : {/*true or false*/}},
	{checkUpdate : true, parentHasChanges : false},
	{checkUpdate : true, parentHasChanges : true}
].forEach(function (oFixture) {
	var sTitle = "resumeInternal: bCheckUpdate=" + oFixture.checkUpdate + " parentHasChanges ="
		+ oFixture.parentHasChanges;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
			oBinding = this.oModel.bindProperty("Category", oContext),
			bForceUpdate = oFixture.parentHasChanges ? undefined : false,
			sResumeChangeReason = {/*change or refresh*/};

		oBinding.sResumeChangeReason = sResumeChangeReason;
		this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		this.mock(oBinding).expects("checkUpdateInternal").exactly(oFixture.checkUpdate ? 1 : 0)
			.withExactArgs(bForceUpdate, sinon.match.same(sResumeChangeReason))
			.callsFake(function () {
				assert.strictEqual(oBinding.sResumeChangeReason, undefined);
				return SyncPromise.resolve();
			});
		this.mock(this.oModel).expects("getReporter").exactly(oFixture.checkUpdate ? 1 : 0)
			.withExactArgs().returns(function () { throw new Error(); });

		// code under test
		oBinding.resumeInternal(oFixture.checkUpdate, oFixture.parentHasChanges);
	});
});

	//*********************************************************************************************
	QUnit.test("resumeInternal: checkUpdateInternal fails", function () {
		var oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
			oBinding = this.oModel.bindProperty("Category", oContext),
			oError = new Error("This call intentionally failed"),
			fnReporter = sinon.spy();

		this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		this.mock(oBinding).expects("checkUpdateInternal") // don't care about args
			.returns(SyncPromise.reject(oError));
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oBinding.resumeInternal(true);

		sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
	QUnit.test("resetChangesInDependents", function () {
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
	QUnit.test("requestValue", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oPromise;

		this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(false)
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
	QUnit.test("onDelete", function () {
		this.oModel.bindProperty("/EMPLOYEES('1')/AGE").onDelete();
	});

	//*********************************************************************************************
	QUnit.test("updateAfterCreate", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");

		this.mock(oBinding).expects("checkUpdateInternal").withExactArgs().returns("~oPromise~");

		// code under test
		assert.strictEqual(oBinding.updateAfterCreate(), "~oPromise~");
	});
});
// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
