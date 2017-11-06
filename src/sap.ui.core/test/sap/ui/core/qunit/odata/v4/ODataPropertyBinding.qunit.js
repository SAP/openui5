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
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, BindingMode, ChangeReason, PropertyBinding, TypeString,
		Context, _Cache, _Helper, _SyncPromise, asODataBinding, ODataModel, ODataPropertyBinding,
		TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$groupId"],
		sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
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
		getSingleCacheMock : function () {
			var oCache = {
					fetchValue : function () {},
					setActive : function () {},
					update : function () {}
				};

			this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);
			return this.oSandbox.mock(oCache);
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

			this.oSandbox.mock(_Cache).expects("createProperty").returns(oCache);
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
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
					assert.strictEqual(fnFetchValue.args[0][1], oBinding,
						"The binding passed itself to fetchValue");
					oBinding.detachChange(changeHandler);
					fnResolve(oBinding);
				}

				oControl.bindObject("/EntitySet('foo')");
				oContextBindingMock = that.oSandbox.mock(oControl.getObjectBinding());
				fnFetchValue = oContextBindingMock.expects("fetchValue");
				fnFetchValue.exactly(iNoOfRequests || 1)
					.withExactArgs("/EntitySet('foo')/property", sinon.match.object)
					.returns(Promise.resolve("value"));
				if (oError) {
					oContextBindingMock.expects("fetchValue")
						.withExactArgs("/EntitySet('foo')/property", sinon.match.object)
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
		delete oMixin.resetInvalidDataState; // because it is overridden

		Object.keys(oMixin).forEach(function (sKey) {
			assert.strictEqual(oBinding[sKey], oMixin[sKey]);
		});
	});

	//*********************************************************************************************
	QUnit.test("c'tor initializes oCachePromise", function (assert) {
		var oBinding,
			oContext = {};
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext));

		oBinding = new ODataPropertyBinding(this.oModel, "Name", oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name"),
			oContext = {
				toString : function () {return "/EMPLOYEES(ID='1')";},
				getPath : function () {return "/EMPLOYEES(ID='1')";}
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
				oContext = Context.create(this.oModel, null, "/EMPLOYEES(ID='42')"),
				oCreatedBinding;

			if (bAbsolute) {
				this.oSandbox.mock(_Cache).expects("createProperty")
					.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1),
						{"sap-client" : "111"})
					.returns(oCache);
			} else {
				this.oSandbox.mock(_Cache).expects("createProperty").never();
			}
			this.oSandbox.stub(this.oModel, "bindingCreated", function (oBinding) {
				oCreatedBinding = oBinding;
			});

			oBinding = this.oModel.bindProperty(sPath, oContext);

			assert.ok(oBinding instanceof ODataPropertyBinding);
			assert.strictEqual(oCreatedBinding, oBinding, "bindingCreated() has been called");
			assert.strictEqual(oBinding.getModel(), this.oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCachePromise"), true);
			assert.strictEqual(oBinding.oCachePromise.getResult(), bAbsolute ? oCache : undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("oCheckUpdateCallToken"), true);
			assert.strictEqual(oBinding.oCheckUpdateCallToken, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sPathWithFetchTypeError"), true);
			assert.strictEqual(oBinding.sPathWithFetchTypeError, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindProperty with relative path and !v4.Context", function (assert) {
		var oBinding,
			oCachePromise = _SyncPromise.resolve(),
			oContext = {getPath : function () {return "/EMPLOYEES(ID='1')";}},
			oCreatedBinding,
			sPath = "Name";

		this.stub(ODataPropertyBinding.prototype, "fetchCache", function (oContext0) {
			assert.strictEqual(oContext0, oContext);
			this.oCachePromise = oCachePromise;
		});
		this.oSandbox.stub(this.oModel, "bindingCreated", function (oBinding) {
			oCreatedBinding = oBinding;
		});

		//code under test
		oBinding = this.oModel.bindProperty(sPath, oContext);

		assert.strictEqual(oCreatedBinding, oBinding, "bindingCreated() has been called");
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), sPath);
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.oCachePromise, oCachePromise);
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
		this.stub(ODataPropertyBinding.prototype, "fetchCache", function (oContext) {
			assert.strictEqual(oContext, null);
			this.oCachePromise = _SyncPromise.resolve();
		});

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
				assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
			}
			if (oFixture.sTarget) {
				this.mock(oBinding).expects("checkUpdate")
					.withExactArgs(false, "context");
			}
			if (oFixture.sInit === "v4") {
				this.mock(oInitialContext).expects("deregisterChange")
					.withExactArgs(oBinding.getPath(), sinon.match.same(oBinding));
			}

			//code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCachePromise.getResult(),
				oFixture.sTarget === "base" ? oCache : undefined);
		});
	});
	//TODO cache promise is NOT always fulfilled

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
	QUnit.test("checkUpdate(true): no change event for virtual context", function (assert) {
		var oVirtualContext = Context.create(this.oModel, {/*list binding*/}, "/...", -2),
			oBinding = this.oModel.bindProperty("relative", oVirtualContext);

		// Note: it is important that automatic type determination runs as soon as possible
		this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs("/.../relative")
			.returns(_SyncPromise.resolve());
		oBinding.attachChange(function () {
			assert.ok(false, "no change event for virtual context");
		});

		// code under test
		return oBinding.checkUpdate(true);
	});

	//*********************************************************************************************
	// Unit test for scenario in
	// ODataModel.integration.qunit, @sap.ui.table.Table with VisibleRowCountMode='Auto'
	QUnit.test("checkUpdate(true): later checkUpdate call resets this.oContext", function (assert) {
		var oParentBinding = {
				fetchIfChildCanUseCache : function () {
					return _SyncPromise.resolve(Promise.resolve(true));
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
			.returns(_SyncPromise.resolve());

		// code under test
		oPromise0 = oBinding.checkUpdate(true);

		oBinding.oContext = null; // binding context reset in the meantime

		// code under test
		oPromise1 = oBinding.checkUpdate(true); // second call to checkUpdate must not fail

		return Promise.all([oPromise0, oPromise1]);
	});

	//*********************************************************************************************
	// Unit test for scenario in
	// ODataModel.integration.qunit, @Relative object binding
	// fetchUI5Type is either sync or async for *both* the wrong and correct context, fetchValue
	// is async for both: we hence just need to vary the test regarding metadata availability
	[true, false].forEach(function (bMetadataAsync, i) {
		QUnit.test("checkUpdate: two calls, first one with invalid path, " + i, function (assert) {
			var iChange = 0,
				oCheckUpdateSpy,
				oCurrentType,
				oFetchValueError = new Error("Resource not found for segment 'SupplierIdentifier'"),
				vCurrentValue,
				oModel = new ODataModel({
					serviceUrl : "/service/?sap-client=111",
					synchronizationMode : "None"
				}),
				oMetaModelMock = this.mock(oModel.getMetaModel()),
				oParent = {
					deregisterChange : function () {},
					fetchValue : function () {}
				},
				oParentMock = this.mock(oParent),
				oType = {
					getName : function () {}
				},
				oTypeError = new Error("Cannot read property '$ui5.type' of undefined"),
				oCorrectContext = Context.create(oModel, oParent,
					"/Equipments(1)/EQUIPMENT_2_PRODUCT"),
				oWrongContext = Context.create(oModel, oParent, "/Equipments(1)"),
				oBinding = oModel.bindProperty("SupplierIdentifier", oWrongContext);

			// ManagedObject initializes the property binding with the wrong context which
			// does not yet contain the element binding
			oMetaModelMock.expects("fetchUI5Type")
				.withExactArgs("/Equipments(1)/SupplierIdentifier")
				.returns(bMetadataAsync
					? Promise.reject(oTypeError) : _SyncPromise.reject(oTypeError));
			this.oLogMock.expects("warning")
				.withExactArgs(oTypeError.message, "/Equipments(1)/SupplierIdentifier", sClassName);
			oParentMock.expects("fetchValue")
				.withExactArgs("/Equipments(1)/SupplierIdentifier", sinon.match.same(oBinding))
				.returns(Promise.reject(oFetchValueError));
			this.mock(oModel).expects("reportError")
				.withExactArgs("Failed to read path /Equipments(1)/SupplierIdentifier", sClassName,
					oFetchValueError);
			// On element binding creation, ManagedObject updates the property binding with the
			// correct context
			oMetaModelMock.expects("fetchUI5Type")
				.withExactArgs("/Equipments(1)/EQUIPMENT_2_PRODUCT/SupplierIdentifier")
				.returns(bMetadataAsync ? Promise.resolve(oType) : _SyncPromise.resolve(oType));
			oParentMock.expects("fetchValue")
				.withExactArgs("/Equipments(1)/EQUIPMENT_2_PRODUCT/SupplierIdentifier",
					sinon.match.same(oBinding))
				.returns(Promise.resolve(42));
			oBinding.attachChange(function (oEvent) {
				var sExpectedReason = iChange ? ChangeReason.Context : ChangeReason.Change;

				assert.strictEqual(oEvent.mParameters.reason, sExpectedReason, sExpectedReason);
				oCurrentType = oBinding.oType;
				vCurrentValue = oBinding.vValue;
				iChange += 1;
			});

			oCheckUpdateSpy = this.spy(oBinding, "checkUpdate");

			oBinding.sInternalType = "internalType"; // set in ManagedObject#_bindProperty

			// code under test
			oBinding.initialize();

			// code under test
			oBinding.setContext(oCorrectContext);

			// wait for promises from all checkUpdate calls
			return Promise.all(oCheckUpdateSpy.returnValues).then(function () {
				assert.strictEqual(iChange, 2);
				assert.strictEqual(oCurrentType, oType, "final type");
				assert.strictEqual(vCurrentValue, 42, "final value");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): unresolved path after setContext", function (assert) {
		var done = assert.async(),
			fnChangeHandler = function () {
				done();
			},
			that = this;

		this.createTextBinding(assert).then(function (oBinding) {
			that.oSandbox.mock(oBinding.oContext).expects("deregisterChange")
				.withExactArgs("property", sinon.match.same(oBinding));
			assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
			oBinding.attachChange(fnChangeHandler);
			oBinding.setContext(); // reset context triggers checkUpdate
			assert.strictEqual(oBinding.getValue(), undefined, "value after context reset");
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): read error", function (assert) {
		var oError = new Error("Expected failure");

		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
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

		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EntitySet('foo')/property", sClassName,
			sinon.match.same(oError));

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
	QUnit.test("checkUpdate(): cancelled read", function (assert) {
		var oError = {canceled : true},
			that = this;

		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EntitySet('foo')/property", sClassName,
			sinon.match.same(oError));

		return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
			oBinding.bInitial = "foo";
			that.mock(oBinding).expects("_fireChange").never();

			// code under test
			return oBinding.checkUpdate(true).then(function () {
				assert.strictEqual(oBinding.bInitial, "foo", "bInitial unchanged");
			});
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
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {"sap-client" : "111"}, false)
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

		this.oSandbox.mock(oContext).expects("fetchValue").never(); // due to absolute path

		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");

		this.mock(oContext).expects("deregisterChange").never();
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
						fetchValue : function (sGroupId, sReadPath, fnDataRequested) {
							return Promise.resolve().then(function () {
								fnDataRequested();
							}).then(function () {
								return oValue;
							});
						}
					},
					oCacheMock = that.oSandbox.mock(_Cache),
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
						{"sap-client" : "111"}, false);
				oControl.bindObject(sContextPath);

				oContextBindingMock = that.oSandbox.mock(oControl.getObjectBinding());
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
						.withExactArgs(sContextPath + "/" + sPath, sinon.match.object)
						.returns(Promise.resolve(oValue));
				}
				that.oSandbox.mock(that.oModel.getMetaModel()).expects("fetchUI5Type")
					.withExactArgs(sResolvedPath)
					.returns(_SyncPromise.resolve(oType));
				that.oSandbox.mock(oType).expects("formatValue").withExactArgs(oValue, "string");

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
				oCacheMock = this.oSandbox.mock(_Cache),
				done = assert.async(),
				oControl = new TestControl({models : this.oModel}),
				sPath = "/path",
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdate"),
				oTypeError = new Error("Unsupported EDM type...");

			oCacheMock.expects("createProperty").returns(oCache);
			this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.withExactArgs(sPath)
				.returns(_SyncPromise.reject(oTypeError));
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
				fetchValue : function (sGroupId, sPath, fnDataRequested) {
					fnDataRequested();
					return Promise.reject(oError);
				}
			},
			done = assert.async(),
			oControl = new TestControl({models : this.oModel});

		this.oSandbox.mock(_Cache).expects("createProperty").returns(oCache);
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
			oCacheMock = this.getPropertyCacheMock(),
			bChangeReceived = false,
			done = assert.async(),
			sPath = "/EMPLOYEES(ID='1')/Name";

		// initial read and after refresh
		oCacheMock.expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("foo"));
		// force non-primitive error
		oCacheMock.expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve({}));

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

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("foo"));
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

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
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("foo"));
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();

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
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("foo"));
		this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
			.withExactArgs(sPath)
			.returns(_SyncPromise.resolve(oType));
		this.oSandbox.mock(oType).expects("formatValue")
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
					oError = new Error("failed type"),
					done = assert.async(),
					oCacheMock = this.getPropertyCacheMock(),
					oControl = new TestControl({models : this.oModel}),
					sPath = "/EMPLOYEES(ID='42')/Name";

				oCacheMock.expects("fetchValue")
					.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
					.returns(_SyncPromise.resolve("foo"));
				oCacheMock.expects("fetchValue")
					.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
					.returns(_SyncPromise.resolve("update")); // 2nd read gets an update
				this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
					.withExactArgs(sPath) // always requested only once
					.returns(_SyncPromise.reject(oError)); // UI5 type not found
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
	QUnit.test("forbidden", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("Name");

		assert.throws(function () {
			oPropertyBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var mParams = {},
			oMock = this.oSandbox.mock(PropertyBinding.prototype),
			oPropertyBinding,
			oReturn = {};

		oMock.expects("attachEvent")
			.withExactArgs("AggregatedDataStateChange", sinon.match.same(mParams))
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("change", sinon.match.same(mParams))
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataReceived", sinon.match.same(mParams))
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("dataRequested", sinon.match.same(mParams))
			.returns(oReturn);
		oMock.expects("attachEvent").withExactArgs("DataStateChange", sinon.match.same(mParams))
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
		assert.strictEqual(oPropertyBinding.attachEvent("DataStateChange", mParams),
			oReturn);

		assert.throws(function () {
			oPropertyBinding.attachEvent("unsupportedEvent");
		}, new Error("Unsupported event 'unsupportedEvent': v4.ODataPropertyBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("expression binding", function (assert) {
		var oCacheMock = this.oSandbox.mock(_Cache),
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
			.withExactArgs(sinon.match.object, "EntitySet('foo')", {}, false)
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
				oModelMock = this.mock(this.oModel),
				mParameters = {};

			oModelMock.expects("getGroupId").withExactArgs().returns("baz");
			oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

			oModelMock.expects("buildBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
				.returns({$$groupId : "foo"});
			// code under test
			oBinding = this.oModel.bindProperty(sPath, oContext, mParameters);
			assert.strictEqual(oBinding.getGroupId(), "foo");
			assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

			oModelMock.expects("buildBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
				.returns({});
			// code under test
			oBinding = this.oModel.bindProperty(sPath, oContext, mParameters);
			assert.strictEqual(oBinding.getGroupId(), "baz");
			assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");
		});
	});

	//*********************************************************************************************
	[undefined, "$direct"].forEach(function (sGroupId) {
		QUnit.test("getGroupId, binding group ID " + sGroupId , function (assert) {
			var oBinding = this.oModel.bindProperty("/absolute", undefined, {$$groupId : sGroupId}),
				oReadPromise = _SyncPromise.resolve(),
				oTypePromise = _SyncPromise.resolve(new TypeString());

			this.oSandbox.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.returns(oTypePromise);
			this.oSandbox.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
				.withExactArgs(sGroupId || "$auto", undefined, sinon.match.func, sinon.match.object)
				.callsArg(2)
				.returns(oReadPromise);

			oBinding.initialize();

			return Promise.all([oTypePromise, oReadPromise]);
		});
	});

	//*********************************************************************************************
	QUnit.test("onChange", function (assert) {
		var oBinding = this.oModel.bindProperty("/absolute");

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.onChange("foo");
		assert.strictEqual(oBinding.getValue(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("setValue (absolute binding): forbidden", function (assert) {
		var oControl;

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		this.oSandbox.mock(oControl.getBinding("text").oCachePromise.getResult())
			.expects("update").never();
		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.oLogMock.expects("error").withExactArgs(
			"Cannot set value on this binding", "/ProductList('HT-1000')/Name", sClassName);

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oControl.getText(), "HT-1000's Name", "control change is rolled back");
	});

	//*********************************************************************************************
	QUnit.test("setValue (binding with cache): forbidden", function (assert) {
		var oControl;

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : 'Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oControl.setBindingContext(this.oModel.createBindingContext("/ProductList('HT-1000')"));

		this.oSandbox.mock(oControl.getBinding("text").oCachePromise.getResult())
			.expects("update").never();
		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.oLogMock.expects("error").withExactArgs(
			"Cannot set value on this binding", "/ProductList('HT-1000')/Name", sClassName);

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oControl.getText(), "HT-1000's Name", "control change is rolled back");
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
			.callsArg(2).returns(_SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : oModel,
			text : "{parameters : {'$$groupId' : 'groupId', '$$updateGroupId' : 'updateGroupId'}"
				+ ", path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oPropertyBinding = oControl.getBinding("text");
		oPropertyBindingCacheMock = this.oSandbox.mock(oPropertyBinding.oCachePromise.getResult());
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
		var oBindingMock,
			oCacheMock = this.getSingleCacheMock(),
			oModel = new ODataModel({
				groupId : "$direct",
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			oModelMock = this.mock(oModel),
			oMetaModelMock = this.mock(oModel.oMetaModel),
			oControl = new TestControl({
				models : oModel,
				objectBindings : "/BusinessPartnerList('0100000000')"
			}),
			oParentBinding = oControl.getObjectBinding(),
			oContext = oParentBinding.getBoundContext(),
			oParentBindingMock = this.oSandbox.mock(oParentBinding);

		oCacheMock.expects("fetchValue")
			.withExactArgs("$direct", "Address/City", sinon.match.func, sinon.match.object)
			.returns(_SyncPromise.resolve("Heidelberg")); // text property of control
		oControl.applySettings({
			text : "{path : 'Address/City', type : 'sap.ui.model.odata.type.String'}"
		});
		oBindingMock = this.mock(oControl.getBinding("text"));
		oModelMock.expects("checkGroupId").withExactArgs(undefined);
		oMetaModelMock.expects("fetchUpdateData")
			.withExactArgs("Address/City", sinon.match.same(oContext))
			.returns(_SyncPromise.resolve({
				editUrl : "/BusinessPartnerList('0100000000')",
				entityPath : "/BusinessPartnerList/0", // not realistic, but different to editUrl
				propertyPath : "Address/City"
			}));
		oParentBindingMock.expects("updateValue").withExactArgs(undefined, "Address/City", "foo",
				sinon.match.func, "/BusinessPartnerList('0100000000')", "/BusinessPartnerList/0",
				"Unit")
			.returns(Promise.resolve());
		oBindingMock.expects("getUnitOrCurrencyPath")
			.withExactArgs("Address/City")
			.returns("Unit"); // the "Unit" property associated with Address/City

		// code under test
		oControl.setText("foo");

		oModelMock.expects("checkGroupId").withExactArgs("up");
		oMetaModelMock.expects("fetchUpdateData")
			.withExactArgs("Address/City", sinon.match.same(oContext))
			.returns(_SyncPromise.resolve({
				editUrl : "/BusinessPartnerList('0100000000')",
				entityPath : "/BusinessPartnerList/0", // not realistic, but different to editUrl
				propertyPath : "Address/City"
			}));
		oParentBindingMock.expects("updateValue").withExactArgs("up", "Address/City", null,
				sinon.match.func, "/BusinessPartnerList('0100000000')", "/BusinessPartnerList/0",
				"Unit")
			.returns(Promise.resolve());
		oBindingMock.expects("getUnitOrCurrencyPath")
			.withExactArgs("Address/City")
			.returns("Unit");

		// code under test
		oControl.getBinding("text").setValue(null, "up");
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): error handling", function (assert) {
		var oParentBinding = {
				updateValue : function () {}
			},
			oContext = Context.create(this.oModel, oParentBinding, "/ProductList('HT-1000')"),
			sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oPromise = Promise.resolve(),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		this.oSandbox.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(_SyncPromise.resolve({
				editUrl : "/ProductList('HT-1000')",
				entityPath : "/ProductList/0", // not realistic, but different to editUrl
				propertyPath : "Name"
			}));
		this.oSandbox.mock(oParentBinding).expects("updateValue")
			.withExactArgs(undefined, "Name", "foo", sinon.match.func, "/ProductList('HT-1000')",
				"/ProductList/0", undefined)
			.callsArgWith(3, oError)
			.returns(oPromise);
		this.mock(oPropertyBinding).expects("getUnitOrCurrencyPath").returns(undefined);
		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oError));

		// code under test
		oPropertyBinding.setValue("foo");

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): fetchUpdataData fails", function (assert) {
		var oContext = Context.create(this.oModel, null, "/ProductList('HT-1000')"),
			sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oPromise = Promise.reject(oError),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		this.oSandbox.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(_SyncPromise.resolve(Promise.reject(oError)));
		this.oSandbox.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oError));

		// code under test
		oPropertyBinding.setValue("foo");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): canceled", function (assert) {
		var oParentBinding = {
				updateValue : function () {}
			},
			oContext = Context.create(this.oModel, oParentBinding, "/ProductList('HT-1000')"),
			oError = new Error(),
			oPromise = Promise.reject(oError),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		oError.canceled = true;

		this.oSandbox.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(_SyncPromise.resolve({
				editUrl : "/ProductList('HT-1000')",
				entityPath : "/ProductList/0", // not realistic, but different to editUrl
				propertyPath : "Name"
			}));
		this.oSandbox.mock(oParentBinding).expects("updateValue")
			.withExactArgs(undefined, "Name", "foo", sinon.match.func, "/ProductList('HT-1000')",
				"/ProductList/0", undefined)
			.returns(oPromise);
		this.mock(oPropertyBinding).expects("getUnitOrCurrencyPath").returns(undefined);
		this.oSandbox.mock(this.oModel).expects("reportError").never();

		// code under test
		oPropertyBinding.setValue("foo");

		return oPromise.catch(function () {});
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
	QUnit.test("hasPendingChanges: absolute binding", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("/absolute"),
			oResult = {};

		this.oSandbox.mock(oPropertyBinding.oCachePromise.getResult())
			.expects("hasPendingChangesForPath").withExactArgs("").returns(oResult);

		assert.strictEqual(oPropertyBinding.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges: relative binding resolved", function (assert) {
		var oContext = {
				hasPendingChangesForPath : function () {}
			},
			oPropertyBinding,
			oResult = {};

		this.stub(ODataPropertyBinding.prototype, "fetchCache", function (oContext0) {
			assert.strictEqual(oContext0, oContext);
			this.oCachePromise = _SyncPromise.resolve();
		});
		oPropertyBinding = this.oModel.bindProperty("Name", oContext);
		this.oSandbox.mock(oContext).expects("hasPendingChangesForPath").withExactArgs("Name")
			.returns(oResult);

		assert.strictEqual(oPropertyBinding.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges: relative binding unresolved", function (assert) {
		assert.strictEqual(this.oModel.bindProperty("PRODUCT_2_BP").hasPendingChanges(), false);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal", function (assert) {
		var oBinding = this.oModel.bindProperty("NAME"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES/42");

		this.stub(ODataPropertyBinding.prototype, "fetchCache", function (oContext0) {
			assert.strictEqual(oContext0, oContext);
			this.oCachePromise = _SyncPromise.resolve();
		});
		oBindingMock.expects("checkUpdate").withExactArgs(false, ChangeReason.Context);
		oBinding.setContext(oContext);

		oBindingMock.expects("checkUpdate").withExactArgs(true, ChangeReason.Refresh, "myGroup");

		// code under test
		oBinding.refreshInternal("myGroup", true);

		// code under test
		oBinding.refreshInternal("myGroup", false);

		assert.strictEqual(ODataPropertyBinding.prototype.fetchCache.callCount, 3);
	});

	//*********************************************************************************************
	QUnit.test("destroy: absolute binding", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("/absolute");

		this.oSandbox.mock(oPropertyBinding.oCachePromise.getResult()).expects("deregisterChange")
			.withExactArgs(undefined, sinon.match.same(oPropertyBinding));
		this.oSandbox.mock(PropertyBinding.prototype).expects("destroy").on(oPropertyBinding)
			.withExactArgs("foo", 42);
		this.oSandbox.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oPropertyBinding));

		// code under test
		oPropertyBinding.destroy("foo", 42);

		assert.strictEqual(oPropertyBinding.oCachePromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroy: relative binding resolved", function (assert) {
		var oContext = {
				deregisterChange : function () {},
				getPath : function () {return "Name";}
			},
			oPromise = Promise.resolve(),
			oPropertyBinding;

		this.stub(ODataPropertyBinding.prototype, "fetchCache", function (oContext0) {
			assert.strictEqual(oContext0, oContext);
			// we might become asynchronous due to auto $expand/$select reading $metadata
			this.oCachePromise = _SyncPromise.resolve(oPromise);
		});
		oPropertyBinding = this.oModel.bindProperty("Name", oContext);
		this.oSandbox.mock(oContext).expects("deregisterChange")
			.withExactArgs("Name", sinon.match.same(oPropertyBinding));
		this.oSandbox.mock(PropertyBinding.prototype).expects("destroy").on(oPropertyBinding);
		this.oSandbox.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oPropertyBinding));

		// code under test
		oPropertyBinding.destroy();

		assert.strictEqual(oPropertyBinding.oCachePromise, undefined);
		assert.strictEqual(oPropertyBinding.oContext, undefined);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("destroy: relative binding unresolved", function (assert) {
		var oPropertyBinding = this.oModel.bindProperty("PRODUCT_2_BP");

		this.oSandbox.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oPropertyBinding));

		// code under test
		oPropertyBinding.destroy();
	});

	//*********************************************************************************************
	[
		"getValueListType", "requestValueListType", "requestValueListInfo"
	].forEach(function (sFunctionName) {
		QUnit.test(sFunctionName + ": forward", function(assert) {
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

		QUnit.test(sFunctionName + ": unresolved", function(assert) {
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
		var oBinding = this.oModel.bindProperty("foo"),
			oPromise;

		// code under test
		oPromise = oBinding.doFetchQueryOptions();

		assert.deepEqual(oPromise.getResult(), {});

		// code under test
		assert.strictEqual(oBinding.doFetchQueryOptions(), oPromise,
			"all bindings share the same promise");
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
	[{
		mAnnotations : {},
		sExpectedPath : undefined,
		sPathInEntity : "Quantity"
	}, {
		mAnnotations : {
			"@Org.OData.Measures.V1.Unit" : {$Path : "QuantityUnit"}
		},
		sExpectedPath : "QuantityUnit",
		sPathInEntity : "Quantity"
	}, {
		mAnnotations : {
			"@Org.OData.Measures.V1.ISOCurrency" : {$Path : "CurrencyCode"}
		},
		sExpectedPath : "CurrencyCode",
		sPathInEntity : "GrossAmount"
	}, {
		mAnnotations : {
			"@Org.OData.Measures.V1.Unit" : {$Path : "WeightUnit"}
		},
		sExpectedPath : "WeightUnit",
		sPathInEntity : "ProductInfo/WeightMeasure"
	}].forEach(function (oFixture, i) {
		QUnit.test("getUnitOrCurrencyPath, " + i, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/SalesOrderList('42')"),
				oBinding = this.oModel.bindProperty("SO_2_SOITEM('10')/" + oFixture.sPathInEntity,
					oContext),
				oMetaContext = {},
				oMetaModelMock = this.mock(oBinding.oModel.oMetaModel);

			oMetaModelMock.expects("getMetaContext")
				.withExactArgs("/SalesOrderList('42')/SO_2_SOITEM('10')/" + oFixture.sPathInEntity)
				.returns(oMetaContext);
			oMetaModelMock.expects("getObject")
				.withExactArgs("@", sinon.match.same(oMetaContext))
				.returns(oFixture.mAnnotations);

			// code under test
			assert.strictEqual(oBinding.getUnitOrCurrencyPath(oFixture.sPathInEntity),
				oFixture.sExpectedPath);
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

					// Wait for ODataParentBinding#updateValue to finish (then the response has
					// been processed). The assertion is only that no error/warning logs happen.
					resolve();
				});
			});
		});
	}
});
// TODO read in initialize and refresh? This forces checkUpdate to use getProperty.
