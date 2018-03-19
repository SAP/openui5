/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, SyncPromise, BindingMode, ChangeReason, PropertyBinding,
		TypeString, Context, _Cache, _Helper, asODataBinding, ODataModel, ODataPropertyBinding,
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
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.mock(this.oModel.oRequestor).expects("request").never();
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

			this.mock(_Cache).expects("createSingle").returns(oCache);
			return this.mock(oCache);
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
						"vValue contains the value and can be used to mock a checkUpdate");
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
	["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
		QUnit.test("bindProperty, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = sPath[0] === "/",
				oBinding,
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

			oBinding = this.oModel.bindProperty(sPath, oContext);

			assert.ok(oBinding instanceof ODataPropertyBinding);
			sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
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
			oCachePromise = SyncPromise.resolve(),
			oContext = {getPath : function () {return "/EMPLOYEES(ID='1')";}},
			oExpectation = this.mock(this.oModel).expects("bindingCreated"),
			sPath = "Name";

		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				this.oCachePromise = oCachePromise;
			});

		//code under test
		oBinding = this.oModel.bindProperty(sPath, oContext);

		sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
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
		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(null)
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve();
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
			this.mock(oBinding).expects("deregisterChange").withExactArgs();

			//code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCachePromise.getResult(),
				oFixture.sTarget === "base" ? oCache : undefined);

			// code under test
			// #deregisterChange is not called again, if #setContext is called with the same context
			oBinding.setContext(oTargetContext);
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
			.returns(SyncPromise.resolve());
		oBinding.attachChange(function () {
			assert.ok(false, "no change event for virtual context");
		});

		// code under test
		return oBinding.checkUpdate(true);
	});

	//*********************************************************************************************
	["any", "int"].forEach(function (sType) {
		[{
			path : "/EntitySet('foo')/#com.sap.foo.AcFoo"
		}, {
			path : "#com.sap.foo.AcFoo",
			contextPath: "/EntitySet('foo')"
		}].forEach(function (oFixture) {
			QUnit.test("checkUpdate: " + (oFixture.contextPath ? "relative path" : "absolute path")
				+ ", targetType: " + sType + " - allow non primitive value for advertised actions",
				function (assert) {
					var oCacheMock = this.getPropertyCacheMock(),
						oContext = oFixture.contextPath
							? this.oModel.createBindingContext("/EntitySet('foo')")
							: undefined,
						oBinding = this.oModel.bindProperty(oFixture.path, oContext),
						sResolvedPath = this.oModel.resolve(oFixture.path, oContext),
						vValue = {};

					oBinding.setType(null, sType);
					oCacheMock.expects("fetchValue")
						.withExactArgs("$auto", undefined, sinon.match.func, oBinding)
						.returns(SyncPromise.resolve(vValue));
					if (sType !== "any") {
						this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
							.withExactArgs(sResolvedPath)
							.returns(SyncPromise.resolve());
						this.oLogMock.expects("error")
							.withExactArgs("Accessed value is not primitive",
								sResolvedPath, sClassName);
					}

					// code under test
					return oBinding.checkUpdate().then(function () {
						assert.strictEqual(oBinding.getValue(),
							sType === "any" ? vValue : undefined);
					});
				});
		});
	});

	//*********************************************************************************************
	// Unit test for scenario in
	// ODataModel.integration.qunit, @sap.ui.table.Table with VisibleRowCountMode='Auto'
	QUnit.test("checkUpdate(true): later checkUpdate call resets this.oContext", function (assert) {
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
					? Promise.reject(oTypeError) : SyncPromise.reject(oTypeError));
			this.oLogMock.expects("warning")
				.withExactArgs(oTypeError.message, "/Equipments(1)/SupplierIdentifier", sClassName);
			oParentMock.expects("fetchValue").withExactArgs("/Equipments(1)/SupplierIdentifier",
					sinon.match.same(oBinding), undefined)
				.returns(Promise.reject(oFetchValueError));
			this.mock(oModel).expects("reportError")
				.withExactArgs("Failed to read path /Equipments(1)/SupplierIdentifier", sClassName,
					oFetchValueError);
			// On element binding creation, ManagedObject updates the property binding with the
			// correct context
			oMetaModelMock.expects("fetchUI5Type")
				.withExactArgs("/Equipments(1)/EQUIPMENT_2_PRODUCT/SupplierIdentifier")
				.returns(bMetadataAsync ? Promise.resolve(oType) : SyncPromise.resolve(oType));
			oParentMock.expects("fetchValue")
				.withExactArgs("/Equipments(1)/EQUIPMENT_2_PRODUCT/SupplierIdentifier",
					sinon.match.same(oBinding), undefined)
				.returns(Promise.resolve(42));
			oBinding.attachChange(function (oEvent) {
				var sExpectedReason = iChange ? ChangeReason.Context : ChangeReason.Change;

				assert.strictEqual(oEvent.mParameters.reason, sExpectedReason, sExpectedReason);
				oCurrentType = oBinding.oType;
				vCurrentValue = oBinding.vValue;
				iChange += 1;
			});
			// avoid that deregisterChange stumbles over the parent binding mock
			this.mock(oBinding).expects("deregisterChange");

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
			that.mock(oBinding).expects("deregisterChange").withExactArgs();
			assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
			oBinding.attachChange(fnChangeHandler);
			oBinding.setContext(); // reset context triggers checkUpdate
			assert.strictEqual(oBinding.getValue(), undefined, "value after context reset");
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): read error", function (assert) {
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

		this.mock(this.oModel).expects("reportError").withExactArgs(
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

		this.mock(this.oModel).expects("reportError").withExactArgs(
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
	QUnit.test("checkUpdate(): absolute with sGroupId", function (assert) {
		var oBinding,
			oCacheMock = this.getPropertyCacheMock();

		oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");
		oBinding.setType(null, "any"); // avoid fetchUI5Type()
		oCacheMock.expects("fetchValue")
			.withExactArgs("group", undefined, sinon.match.func, oBinding)
			.returns(SyncPromise.resolve());

		// code under test
		return oBinding.checkUpdate(false, undefined, "group");
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate(): relative with sGroupId", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/Me"),
			oBinding = this.oModel.bindProperty("property", oContext);

		oBinding.setType(null, "any"); // avoid fetchUI5Type()
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("property", oBinding, "group")
			.returns(SyncPromise.resolve());

		// code under test
		return oBinding.checkUpdate(false, undefined, "group");
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
						fetchValue : function (sGroupId, sReadPath, fnDataRequested) {
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
						{"sap-client" : "111"}, false);
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
						iDataRequestedCount++;
					},
					dataReceived : function (oEvent) {
						var oBinding = oControl.getBinding("text");

						assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"),
							"dataReceived - correct source");
						assert.deepEqual(oEvent.getParameter("data"), {});
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
				oCacheMock = this.mock(_Cache),
				done = assert.async(),
				oControl = new TestControl({models : this.oModel}),
				sPath = "/path",
				oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdate"),
				oTypeError = new Error("Unsupported EDM type...");

			oCacheMock.expects("createProperty").returns(oCache);
			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.withExactArgs(sPath)
				.returns(SyncPromise.reject(oTypeError));
			this.oLogMock.expects("warning").withExactArgs(oTypeError.message, sPath, sClassName);
			this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath,
				sClassName);

			//code under test
			oControl.bindProperty("text", {path : sPath, events : {
				dataReceived : function (oEvent) {
					var oBinding = oControl.getBinding("text");
					assert.strictEqual(oBinding.getType(), undefined);
					assert.strictEqual(oBinding.getValue(), undefined);
					assert.deepEqual(oEvent.getParameter("data"), {});
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
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("foo"));
		// force non-primitive error
		oCacheMock.expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve({}));

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
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
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
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
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
					oError = new Error("failed type"),
					done = assert.async(),
					oCacheMock = this.getPropertyCacheMock(),
					oControl = new TestControl({models : this.oModel}),
					sPath = "/EMPLOYEES(ID='42')/Name";

				oCacheMock.expects("fetchValue")
					.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
					.returns(SyncPromise.resolve("foo"));
				oCacheMock.expects("fetchValue")
					.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
					.returns(SyncPromise.resolve("update")); // 2nd read gets an update
				this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
					.withExactArgs(sPath) // always requested only once
					.returns(SyncPromise.reject(oError)); // UI5 type not found
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
		var mParams = {},
			oMock = this.mock(PropertyBinding.prototype),
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
				oReadPromise = SyncPromise.resolve(),
				oTypePromise = SyncPromise.resolve(new TypeString());

			this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type")
				.returns(oTypePromise);
			this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
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
			.returns(SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : '/ProductList(\\'HT-1000\\')/Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		this.mock(oControl.getBinding("text").oCachePromise.getResult())
			.expects("update").never();
		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName,
				sinon.match({message : "Cannot set value on this binding"}));

		// code under test
		oControl.setText("foo");

		assert.strictEqual(oControl.getText(), "HT-1000's Name", "control change is rolled back");
	});

	//*********************************************************************************************
	QUnit.test("setValue (binding with V2 context): forbidden", function (assert) {
		var oControl;

		this.getPropertyCacheMock().expects("fetchValue")
			.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object)
			.returns(SyncPromise.resolve("HT-1000's Name"));
		oControl = new TestControl({
			models : this.oModel,
			text : "{path : 'Name'"
				+ ", type : 'sap.ui.model.odata.type.String'}"
		});
		oControl.setBindingContext(this.oModel.createBindingContext("/ProductList('HT-1000')"));

		this.mock(oControl.getBinding("text").oCachePromise.getResult())
			.expects("update").never();
		// Note: if setValue throws, ManagedObject#updateModelProperty does not roll back!
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName,
				sinon.match({message : "Cannot set value on this binding"}));

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
		var sTitle = "setValue (relative binding) via control, updateGroupId="
			+ oFixture.updateGroupId;
		QUnit.test(sTitle, function (assert) {
			var oParentBinding = this.oModel.bindContext("/BusinessPartnerList('0100000000')"),
				oContext = oParentBinding.getBoundContext(),
				oBinding = this.oModel.bindProperty("Address/City", oContext),
				oBindingMock = this.mock(oBinding),
				oCache = {
					update : function () {}
				},
				oCacheMock = this.mock(oCache),
				sCachePath = "~",
				oError = {},
				oParentBindingMock = this.mock(oParentBinding),
				fnUpdate,
				oUpdatePromise = {},
				fnWithCache;

			oBinding.vValue = ""; // simulate a read - intentionally use a falsy value

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(this.oModel).expects("checkGroupId").withExactArgs(oFixture.updateGroupId);
			this.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
				.withExactArgs("Address/City", sinon.match.same(oContext))
				.returns(SyncPromise.resolve({
					editUrl : "/BusinessPartnerList('0100000000')",
					entityPath : "/BusinessPartnerList/0", // unrealistic, but different to editUrl
					propertyPath : "Address/City"
				}));
			fnWithCache = oBindingMock.expects("withCache")
				.withExactArgs(sinon.match.func, "/BusinessPartnerList/0");

			// code under test
			oBinding.setValue(oFixture.value, oFixture.updateGroupId);

			// the "Unit" property associated with Address/City
			oBindingMock.expects("getUnitOrCurrencyPath").withExactArgs().returns("Unit");
			if (!oFixture.updateGroupId) {
				oParentBindingMock.expects("getUpdateGroupId").returns("up");
			}
			fnUpdate = oCacheMock.expects("update")
				.withExactArgs("up", "Address/City", oFixture.value, sinon.match.func,
					"/BusinessPartnerList('0100000000')", sCachePath, "Unit")
				.returns(oUpdatePromise);

			// code under test: call arg to withCache
			assert.strictEqual(fnWithCache.firstCall.args[0](oCache, sCachePath, oParentBinding),
				oUpdatePromise);

			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to update path /BusinessPartnerList('0100000000')/Address/City", sClassName,
				sinon.match.same(oError));

			// code under test: call arg to oCache.update
			fnUpdate.firstCall.args[3](oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): error handling", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext),
			oUpdatePromise = Promise.reject(oError);

		oPropertyBinding.vValue = "fromServer"; // simulate a read

		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(SyncPromise.resolve({
				editUrl : "/ProductList('HT-1000')",
				entityPath : "/ProductList/0", // not realistic, but different to editUrl
				propertyPath : "Name"
			}));
		this.mock(oPropertyBinding).expects("withCache")
			.withExactArgs(sinon.match.func, "/ProductList/0")
			.returns(oUpdatePromise);
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
		this.mock(this.oModel.oMetaModel).expects("fetchUpdateData").never();
		this.mock(oPropertyBinding).expects("withCache").never();
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
		this.mock(this.oModel.oMetaModel).expects("fetchUpdateData").never();
		this.mock(oPropertyBinding).expects("withCache").never();

		// code under test
		oPropertyBinding.setValue("foo");
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): fetchUpdataData fails", function (assert) {
		var oContext = Context.create(this.oModel, null, "/ProductList('HT-1000')"),
			sMessage = "This call intentionally failed",
			oError = new Error(sMessage),
			oPromise = Promise.reject(oError),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext);

		oPropertyBinding.vValue = "fromServer"; // simulate a read

		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(SyncPromise.resolve(Promise.reject(oError)));
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to update path /ProductList('HT-1000')/Name", sClassName,
			sinon.match.same(oError));

		// code under test
		oPropertyBinding.setValue("foo");

		return oPromise.catch(function () {}); // wait, but do not fail
	});

	//*********************************************************************************************
	QUnit.test("setValue (relative binding): canceled", function (assert) {
		var oContext = Context.create(this.oModel, {/*oParentBinding*/}, "/ProductList('HT-1000')"),
			oError = new Error(),
			oPropertyBinding = this.oModel.bindProperty("Name", oContext),
			oUpdatePromise = Promise.reject(oError);

		oError.canceled = true;
		oPropertyBinding.vValue = "fromServer"; // simulate a read

		this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel.oMetaModel).expects("fetchUpdateData")
			.withExactArgs("Name", sinon.match.same(oContext))
			.returns(SyncPromise.resolve({
				editUrl : "/ProductList('HT-1000')",
				entityPath : "/ProductList/0", // not realistic, but different to editUrl
				propertyPath : "Name"
			}));
		this.mock(oPropertyBinding).expects("withCache")
			.withExactArgs(sinon.match.func, "/ProductList/0")
			.returns(oUpdatePromise);
		this.mock(this.oModel).expects("reportError").never();

		// code under test
		oPropertyBinding.setValue("foo", "up");

		return oUpdatePromise.catch(function () {}); // wait, but do not fail
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
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES/42");

		this.mock(ODataPropertyBinding.prototype).expects("fetchCache").thrice()
			.withExactArgs(oContext)
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve();
			});
		oBindingMock.expects("checkUpdate").withExactArgs(false, ChangeReason.Context);
		oBinding.setContext(oContext);

		oBindingMock.expects("checkUpdate").withExactArgs(true, ChangeReason.Refresh, "myGroup");

		// code under test
		oBinding.refreshInternal("myGroup", true);

		// code under test
		oBinding.refreshInternal("myGroup", false);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oContext = {
				getPath : function () {return "Name";}
			},
			oPromise = Promise.resolve(),
			oPropertyBinding;

		this.mock(ODataPropertyBinding.prototype).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext)).callsFake(function (oContext0) {
				// we might become asynchronous due to auto $expand/$select reading $metadata
				this.oCachePromise = SyncPromise.resolve(oPromise);
			});
		oPropertyBinding = this.oModel.bindProperty("Name", oContext);
		this.mock(oPropertyBinding).expects("deregisterChange").withExactArgs();
		this.mock(PropertyBinding.prototype).expects("destroy").on(oPropertyBinding);
		this.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oPropertyBinding));

		// code under test
		oPropertyBinding.destroy();

		assert.strictEqual(oPropertyBinding.oCachePromise, undefined);
		assert.strictEqual(oPropertyBinding.oContext, undefined);

		return oPromise;
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
			assert.strictEqual(oBinding.getUnitOrCurrencyPath(), oFixture.sExpectedPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oCache = {
				deregisterChange : function () {}
			},
			oMock,
			sPath = "foo";

		oMock = this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.deregisterChange();

		// check that the function passed to withCache works as expected
		this.mock(oCache).expects("deregisterChange")
			.withExactArgs(sPath, sinon.match.same(oBinding));
		oMock.firstCall.args[0](oCache, sPath);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: withCache rejects sync", function (assert) {
		var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oError = new Error("fail intentionally");

		this.mock(oBinding).expects("withCache").returns(SyncPromise.reject(oError));
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Error in deregisterChange", sClassName, oError);

		// code under test
		oBinding.deregisterChange();
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCheckUpdate) {
		QUnit.test("resumeInternal: bCheckUpdate=" + bCheckUpdate, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/ProductList('42')"),
				oBinding = this.oModel.bindProperty("Category", oContext),
				oBindingMock = this.mock(oBinding);

			oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
			oBindingMock.expects("checkUpdate").exactly(bCheckUpdate ? 1 : 0).withExactArgs();

			// code under test
			oBinding.resumeInternal(bCheckUpdate);
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
