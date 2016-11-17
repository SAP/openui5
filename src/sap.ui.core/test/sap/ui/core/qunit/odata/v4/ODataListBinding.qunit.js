/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Model",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (jQuery, ManagedObject, Binding, ChangeReason, Filter, FilterOperator, FilterType,
		ListBinding, Model, Sorter, OperationMode, _ODataHelper, _Cache, _Helper, _SyncPromise,
		Context, ODataListBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataListBinding", {
			metadata : {
				aggregations : {
					items : {multiple : true, type : "test.sap.ui.model.odata.v4.ODataListBinding"}
				}
			}
		});

	/**
	 * Creates the data for createResult and createSyncResult.
	 *
	 * @param {number} iLength
	 *   array length
	 * @param {number} [iStart=0]
	 *   start index
	 * @param {boolean} [bDrillDown]
	 *   simulate drill-down, i.e. resolve with unwrapped array
	 * @return {object}
	 *   the data
	 */
	function createData(iLength, iStart, bDrillDown) {
		var oData = {value : []},
			i;

		iStart = iStart || 0;
		for (i = 0; i < iLength; i += 1) {
			oData.value[i] = {
				Name : "Name " + (iStart + i),
				LOCATION : {
					COUNTRY : "COUNTRY " + (iStart + i)
				},
				NullValue : null
			};
		}
		return bDrillDown ? oData.value : oData;
	}

	/**
	 * Creates a promise as mock for _Cache.read which is fulfilled asynchronously with a result of
	 * the given length.
	 * iStart determines the start index for the records contained in the result.
	 *
	 * @param {number} iLength
	 *   array length
	 * @param {number} [iStart=0]
	 *   start index
	 * @param {boolean} [bDrillDown]
	 *   simulate drill-down, i.e. resolve with unwrapped array
	 * @return {SyncPromise}
	 *   the promise which is fulfilled as specified
	 */
	function createResult(iLength, iStart, bDrillDown) {
		return _SyncPromise.resolve(Promise.resolve(createData(iLength, iStart, bDrillDown)));
	}

	/**
	 * Creates a promise as mock for _Cache.read which is fulfilled synchronously with a result of
	 * the given length (assuming that the data have already been requested before).
	 * iStart determines the start index for the records contained in the result.
	 *
	 * @param {number} iLength
	 *   array length
	 * @param {number} [iStart=0]
	 *   start index
	 * @param {boolean} [bDrillDown]
	 *   simulate drill-down, i.e. resolve with unwrapped array
	 * @return {SyncPromise}
	 *   the promise which is fulfilled as specified
	 */
	function createSyncResult(iLength, iStart, bDrillDown) {
		return _SyncPromise.resolve(createData(iLength, iStart, bDrillDown));
	}

	/**
	 * Calls getContexts and getCurrentContexts and checks whether both return the right
	 * contexts
	 *
	 * @param {object} assert QUnit's assert object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding the list binding to test with
	 * @param {number} iStart the start index
	 * @param {number} iLength the length
	 * @param {number} [iResultLength=iLength]
	 *   the expected length of the array returned by getCurrentContexts
	 */
	function getContexts(assert, oBinding, iStart, iLength, iResultLength) {
		var aContexts = oBinding.getContexts(iStart, iLength),
			aCurrentContexts = oBinding.getCurrentContexts(),
			i;

		if (iResultLength === undefined) {
			iResultLength = iLength;
		}
		assert.strictEqual(aCurrentContexts.length, iResultLength, "Current contexts length");
		assert.deepEqual(aCurrentContexts.slice(0, aContexts.length), aContexts, "contexts");
		for (i = aContexts.length; i < iResultLength; i++) {
			assert.strictEqual(aCurrentContexts[i], undefined);
		}
	}

	/**
	 * Simulates a context object.
	 *
	 * @param {number} bCreated
	 *   Whether the context has been created
	 * @returns {object}
	 *   An object with a mock function <code>created</code>
	 */
	function getContextMock(bCreated) {
		return {
			created : function () {
				return bCreated ? Promise.resolve() : undefined;
			}
		};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();

			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oModel.setSizeLimit(3);
			this.oSandbox.mock(this.oModel.oRequestor).expects("request").never();
			// in case "request" is restored, this catches accidental requests
			this.oSandbox.mock(_Helper).expects("createError").never();
		},
		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		},

		/**
		 * Creates a sinon mock for a cache object with read and refresh methods.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getCacheMock : function () {
			var oCache = {
					hasPendingChanges : function () { return false; },
					read : function () {},
					toString : function () { return "/service/EMPLOYEES"; }
				};

			this.oSandbox.mock(_Cache).expects("create").returns(oCache);
			return this.oSandbox.mock(oCache);
		}
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function (assert) {
		var oBinding,
			oCreatedBinding;

		this.stub(this.oModel, "bindingCreated", function (oBinding) {
			oCreatedBinding = oBinding;
		});

		oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.strictEqual(oCreatedBinding, oBinding, "bindingCreated() has been called");
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.ok(oBinding.hasOwnProperty("aApplicationFilters"));
		assert.ok(oBinding.hasOwnProperty("oCache"));
		assert.ok(oBinding.hasOwnProperty("sChangeReason"));
		assert.ok(oBinding.hasOwnProperty("aFilters"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("sOperationMode"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sRefreshGroupId"));
		assert.ok(oBinding.hasOwnProperty("aSorters"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oV4Context = {
				fetchCanonicalPath : function () {},
				toString : function () {return "/TEAMS(Team_ID='TEAM01')";}
			},
			oBaseContext = {
				getPath : function () {return "/TEAMS(Team_ID='TEAM01')";},
				toString : function () {return "/TEAMS(Team_ID='TEAM01')";}
			};

		assert.strictEqual(oBinding.toString(), sClassName + ": /EMPLOYEES", "absolute");

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES");

		assert.strictEqual(oBinding.toString(), sClassName + ": undefined|TEAM_2_EMPLOYEES",
			"relative, unresolved");

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oV4Context);

		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /TEAMS(Team_ID='TEAM01')|TEAM_2_EMPLOYEES", "relative, resolved");

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oBaseContext);

		assert.strictEqual(oBinding.toString(), sClassName
				+ ": /TEAMS(Team_ID='TEAM01')|TEAM_2_EMPLOYEES", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("reset", function (assert) {
		var oBinding,
			aPreviousContexts;

		// code under test: reset called from ODLB constructor
		oBinding = this.oModel.bindList("/EMPLOYEES");

		aPreviousContexts = oBinding.aContexts;
		// set members which should be reset to arbitrary values
		oBinding.createContexts({start : 0, length : 2}, 2);
		oBinding.createContexts({start : 3, length : 1}, 1);
		oBinding.iCurrentBegin = 10; oBinding.iCurrentEnd = 19;
		oBinding.iMaxLength = 42;
		oBinding.bLengthFinal = true;

		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.reset();

		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 3);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/0"], aPreviousContexts[0]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/1"], aPreviousContexts[1]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/3"], aPreviousContexts[3]);
		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.iMaxLength, Infinity);
		assert.strictEqual(oBinding.iCurrentBegin, 0);
		assert.strictEqual(oBinding.iCurrentEnd, 0);
		assert.strictEqual(oBinding.isLengthFinal(), false);
	});

	//*********************************************************************************************
	QUnit.test("reset with change reason", function (assert) {
		var done = assert.async(),
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			that = this;

		oBinding.attachRefresh(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);
			that.mock(oBinding.oCache).expects("read").returns(createResult(1));

			oBinding.attachChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);
				done();
			});

			oBinding.getContexts(0, 1);
		});

		// code under test
		oBinding.reset(ChangeReason.Sort);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bUseExtendedChangeDetection) {
		QUnit.test("refresh event is always followed by a change event; E.C.D.: "
				+ bUseExtendedChangeDetection, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				oDiff = bUseExtendedChangeDetection
					? {aDiff : [], iLength : 1, iStart : 0}
					: undefined;

			if (bUseExtendedChangeDetection) {
				oBinding.enableExtendedChangeDetection(false);
			}
			this.mock(oBinding.oCache).expects("read")
				.exactly(bUseExtendedChangeDetection ? 1 : 2)
				.returns(createSyncResult(1));
			this.mock(oBinding).expects("fetchDiff")
				.exactly(bUseExtendedChangeDetection ? 1 : 2)
				.withExactArgs(sinon.match.array, 0, 1)
				.returns(_SyncPromise.resolve(oDiff));

			// Promise used instead of assert.async() because else Sinon restores the mocks
			// immediately after the test function returns, but "fetchDiff" is called later.
			return new Promise(function (resolve, reject) {
				oBinding.attachRefresh(function (oEvent) {
					var aContexts;

					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);

					// code under test
					aContexts = oBinding.getContexts(0, 1);

					// preliminary result, "change" event is pending
					assert.deepEqual(aContexts, []); //TODO is this good w/o E.C.D.?
					assert.strictEqual(aContexts.dataRequested,
						bUseExtendedChangeDetection ? true : undefined);
					assert.deepEqual(aContexts.diff,
						bUseExtendedChangeDetection ? [] : undefined);

					// "change" must be fired async!
					oBinding.attachChange(function (oEvent) {
						assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);

						// code under test
						aContexts = oBinding.getContexts(0, 1);

						// real result
						assert.strictEqual(aContexts.length, 1);
						assert.strictEqual(aContexts.dataRequested,
							bUseExtendedChangeDetection ? false : undefined);
						assert.strictEqual(aContexts.diff,
							bUseExtendedChangeDetection ? oDiff.aDiff : undefined);
						resolve();
					});
				});

				oBinding.reset(ChangeReason.Sort);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList with OData query options", function (assert) {
		var oBinding,
			oBaseContext = {getPath : function () {return "/";}},
			oError = new Error("Unsupported ..."),
			oHelperMock = this.mock(_ODataHelper),
			mParameters = {
				"$apply" : "filter(Amount gt 3)",
				"$expand" : "foo",
				"$orderby" : "bar",
				"$search" : '"foo bar" AND NOT foobar',
				"$select" : "bar",
				"custom" : "baz"
			},
			mQueryOptions = {"$orderby" : "bar"},
			oV4Context = {getBinding : function () {}};

		// absolute binding and binding with base context result in the same cache
		oHelperMock.expects("buildQueryOptions").thrice()
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mParameters), true)
			.returns(mQueryOptions);
		this.mock(ODataListBinding.prototype).expects("buildOrderbyOption").twice()
			.withExactArgs([], mQueryOptions.$orderby)
			.returns(mQueryOptions.$orderby);
		this.mock(_Cache).expects("create").twice()
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				sinon.match.same(mQueryOptions))
			.returns({});
		this.spy(ODataListBinding.prototype, "reset");

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", oV4Context, undefined, undefined,
			mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oV4Context);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES");
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(oBinding.oDiff, undefined);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		assert.deepEqual(oBinding.aPreviousData, []);

		// code under test
		oBinding = this.oModel.bindList("EMPLOYEES", oBaseContext, undefined, undefined,
			mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oBaseContext);
		assert.strictEqual(oBinding.getPath(), "EMPLOYEES");
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(oBinding.oDiff, undefined);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		assert.deepEqual(oBinding.aPreviousData, []);

		// code under test
		oBinding = this.oModel.bindList("EMPLOYEE_2_TEAM", undefined, undefined, undefined,
			mParameters);

		assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache property is set");
		assert.strictEqual(oBinding.oCache, undefined, "oCache property is undefined");
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			// code under test
			this.oModel.bindList("/EMPLOYEES", null, undefined, undefined, mParameters);
		}, oError);
	});

	//*********************************************************************************************
	[{
		aSorters : [new Sorter("foo", true, true)],
		buildOrderbyResult : "foo desc",
		buildQueryOptionResult : {},
		createParameters : {$orderby : "foo desc"},
		grouped : true,
		mParameters : {$$operationMode : OperationMode.Server}
	}, {
		aSorters : [new Sorter("foo", true, true)],
		buildOrderbyResult : "foo desc,bar",
		buildQueryOptionResult : {$orderby : "bar"},
		createParameters : {$orderby : "foo desc,bar"},
		grouped : true,
		mParameters : {$$operationMode : OperationMode.Server, $orderby : "bar"}
	}, {
		aSorters : undefined,
		buildOrderbyResult : "bar",
		buildQueryOptionResult : {$orderby : "bar"},
		createParameters : {$orderby : "bar"},
		grouped : false,
		mParameters : {$$operationMode : OperationMode.Server, $orderby : "bar"}
	}, {
		aSorters : [new Sorter("foo", true)],
		buildOrderbyResult : "foo desc",
		buildQueryOptionResult : {},
		createParameters : {$orderby : "foo desc"},
		grouped : false,
		oModel : new ODataModel({
			operationMode : OperationMode.Server,
			serviceUrl : "/service/?sap-client=111",
			synchronizationMode : "None"
		}),
		mParameters : {}
	}].forEach(function (oFixture) {
		QUnit.test("bindList with sorters: " + oFixture.buildOrderbyResult, function (assert) {
			var oBinding,
				mExpectedQueryOptions = JSON.parse(JSON.stringify(oFixture.buildQueryOptionResult)),
				oHelperMock = this.mock(_ODataHelper),
				oModel = oFixture.oModel || this.oModel;

			this.spy(_Helper, "toArray");
			this.spy(ODataListBinding.prototype, "mergeQueryOptions");
			oHelperMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(oModel.mUriParameters),
					sinon.match.same(oFixture.mParameters), true)
				.returns(oFixture.buildQueryOptionResult);
			this.mock(ODataListBinding.prototype).expects("buildOrderbyOption")
				.withExactArgs(oFixture.aSorters ? sinon.match.same(oFixture.aSorters) : [],
					oFixture.mParameters.$orderby)
				.returns(oFixture.buildOrderbyResult);
			this.mock(_Cache).expects("create")
				.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES",
					oFixture.createParameters);

			// code under test
			oBinding = oModel.bindList("/EMPLOYEES", undefined, oFixture.aSorters, undefined,
				oFixture.mParameters);

			assert.deepEqual(oBinding.aSorters, oFixture.aSorters || [], "Sorters are updated");
			assert.strictEqual(oBinding.isGrouped(), oFixture.grouped, "grouping");
			assert.deepEqual(oBinding.mQueryOptions, mExpectedQueryOptions,
				"Query options are not modified by dynamic sorters");
			assert.ok(_Helper.toArray.calledWithExactly(oFixture.aSorters));
			sinon.assert.calledWithExactly(oBinding.mergeQueryOptions, oBinding.mQueryOptions,
				oFixture.buildOrderbyResult, "");
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList with sorters - error cases", function (assert) {
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Auto});
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, new Sorter("ID"));
		}, new Error("Unsupported operation mode: undefined"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, []);
		}, new Error("Unsupported operation mode: undefined"));
	});

	//*********************************************************************************************
	QUnit.test("bindList with filters", function (assert) {
		var oBinding,
			oCacheProxy = {},
			oExpectation,
			mExpectedbuildQueryOptions = {},
			oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
			aFilters = [oFilter],
			oHelperMock = this.mock(_Helper),
			mQueryParameters = {
				$$operationMode : OperationMode.Server
			};

		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter)).returns(aFilters);
		oHelperMock.expects("toArray").withExactArgs(undefined).returns([]);
		this.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mQueryParameters), true)
			.returns(mExpectedbuildQueryOptions);
		this.mock(ODataListBinding.prototype).expects("buildOrderbyOption").never();
		this.mock(_Cache).expects("create").never();
		oExpectation = this.mock(ODataListBinding.prototype).expects("makeCache");
		oExpectation.withExactArgs().returns(oCacheProxy);

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, oFilter,
			mQueryParameters);

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.mQueryOptions, mExpectedbuildQueryOptions);
		sinon.assert.calledOn(oExpectation, oBinding);
		assert.strictEqual(oBinding.oCache, oCacheProxy);
	});

	//*********************************************************************************************
	QUnit.test("bindList with filters - error cases", function (assert) {
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
				$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
				$$operationMode : OperationMode.Auto});
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42));
		}, new Error("Unsupported operation mode: undefined"));
		assert.throws(function () {
			this.oModel.bindList("/EMPLOYEES", undefined, undefined, []);
		}, new Error("Unsupported operation mode: undefined"));
	});

	//*********************************************************************************************
	QUnit.test("bindList without OData query options", function (assert) {
		var oBinding,
			oContext = {},
			mQueryOptions = {};

		this.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters), undefined, true)
			.returns(mQueryOptions);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				sinon.match.same(mQueryOptions));

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", oContext);

		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.strictEqual(oBinding.mParameters, undefined);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bExtendedChangeDetection) {
		QUnit.test("getContexts: synchronous response, bExtendedChangeDetection="
				+ bExtendedChangeDetection, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$$groupId : "groupId"
				}),
				aContexts,
				aData = [{}, {}, {}],
				aDiff = [/*some diff*/],
				that = this;

			this.mock(oBinding.oCache).expects("read")
				.withExactArgs(0, 3, "groupId", undefined, sinon.match.func)
				.returns(_SyncPromise.resolve(aData));
			if (bExtendedChangeDetection) {
				oBinding.enableExtendedChangeDetection(false);
				this.mock(oBinding).expects("fetchDiff")
					.withExactArgs(aData, 0, 3)
					.returns(_SyncPromise.resolve({aDiff : aDiff, iLength : 3, iStart : 0}));
			}
			that.mock(oBinding).expects("_fireChange").never();

			// code under test
			aContexts = oBinding.getContexts(0, 3);

			assert.strictEqual(aContexts.length, 3);
			aContexts.forEach(function (oContext, i) {
				assert.strictEqual(oContext.getModel(), that.oModel);
				assert.strictEqual(oContext.getBinding(), oBinding);
				assert.strictEqual(oContext.getPath(), "/EMPLOYEES/" + i);
				assert.strictEqual(oContext.getIndex(), i);
			});
			if (bExtendedChangeDetection) {
				assert.strictEqual(aContexts.dataRequested, false);
				assert.strictEqual(aContexts.diff, aDiff);
			}
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bExtendedChangeDetection) {
		QUnit.test("getContexts: asynchronous response, bExtendedChangeDetection="
				+ bExtendedChangeDetection, function (assert) {
			var that = this;

			return new Promise(function (resolve, reject) {
				var oBinding = that.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
						$$groupId : "groupId"
					}),
					oCacheMock = that.mock(oBinding.oCache),
					aContexts,
					aData = [{}, {}, {}],
					aDiff = [/*some diff*/];

				oCacheMock.expects("read")
					.withExactArgs(0, 3, "groupId", undefined, sinon.match.func)
					.callsArg(4)
					.returns(Promise.resolve(aData));
				if (bExtendedChangeDetection) {
					oBinding.enableExtendedChangeDetection(false);
					that.mock(oBinding).expects("fetchDiff")
						.withExactArgs(aData, 0, 3)
						.returns(Promise.resolve({aDiff : aDiff, iLength : 3, iStart : 0}));
				}

				oBinding.attachChange(function () {
					if (!bExtendedChangeDetection) {
						// expect a second read which is responded synchronously
						oCacheMock.expects("read")
							.withExactArgs(0, 3, "groupId", undefined, sinon.match.func)
							.returns(_SyncPromise.resolve(aData));
					}
					that.mock(oBinding).expects("_fireChange").never();

					// code under test
					aContexts = oBinding.getContexts(0, 3);

					assert.strictEqual(aContexts.length, 3);
					aContexts.forEach(function (oContext, i) {
						assert.strictEqual(oContext.getModel(), that.oModel);
						assert.strictEqual(oContext.getBinding(), oBinding);
						assert.strictEqual(oContext.getPath(), "/EMPLOYEES/" + i);
						assert.strictEqual(oContext.getIndex(), i);
					});
					if (bExtendedChangeDetection) {
						assert.strictEqual(aContexts.dataRequested, false);
						assert.strictEqual(aContexts.diff, aDiff);
					}

					resolve();
				});

				// code under test
				aContexts = oBinding.getContexts(0, 3);

				assert.deepEqual(aContexts, []);
				if (bExtendedChangeDetection) {
					assert.strictEqual(aContexts.dataRequested, true);
					assert.deepEqual(aContexts.diff, []);
				}
			});
		});
	});

	//*********************************************************************************************
	["", "/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindList: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindList(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	// fixture with range for aggregation binding info (default {}) and
	//              number of entities (default is length requested to read)
	[
		{range : {}},
		{range : {startIndex : 1, length : 3}},
		{range : {startIndex : 1, length : 3}, entityCount : 2}
	].forEach(function (oFixture) {
		QUnit.test("getContexts satisfies contract of ManagedObject#bindAggregation "
			+ JSON.stringify(oFixture),
		function (assert) {
			var oCacheMock = this.getCacheMock(),
				oControl = new TestControl({models : this.oModel}),
				oRange = oFixture.range || {},
				iLength = oRange.length || this.oModel.iSizeLimit,
				iEntityCount = oFixture.entityCount || iLength,
				iStartIndex = oRange.startIndex || 0,
				oPromise = createResult(iEntityCount);

			// check that given spy is called with exact arguments
			function checkCall(oSpy) {
				assert.ok(
					oSpy.calledWithExactly.apply(oSpy, Array.prototype.slice.call(arguments, 1)),
					oSpy.printf("%n call %C"));
			}

			// change event handler for initial read for list binding
			function onChange() {
				var aChildControls = oControl.getItems(),
					sExpectedPath,
					i;

				assert.strictEqual(aChildControls.length, iEntityCount, "# child controls");
				for (i = 0; i < iEntityCount; i += 1) {
					sExpectedPath = "/EMPLOYEES/" + (i + iStartIndex);
					assert.strictEqual(aChildControls[i].getBindingContext().getPath(),
						sExpectedPath, "child control binding path: " + sExpectedPath);
				}
			}

			oCacheMock.expects("read")
				.withExactArgs(iStartIndex, iLength, "$direct", undefined, sinon.match.func)
				.callsArg(4)
				.returns(oPromise);
			oCacheMock.expects("read")
				.withExactArgs(iStartIndex, iLength, "$direct", undefined, sinon.match.func)
				.returns(createSyncResult(iEntityCount));

			// spies to check and document calls to model and binding methods from ManagedObject
			this.spy(this.oModel, "bindList");
			this.spy(ODataListBinding.prototype, "initialize");
			this.spy(ODataListBinding.prototype, "getContexts");

			// code under test
			oControl.bindAggregation("items", jQuery.extend({
				parameters : {$$groupId : "$direct"}, //TODO test with application group 'groupId'
				path : "/EMPLOYEES",
				template : new TestControl()
			}, oRange));

			// check v4.ODataModel APIs are called as expected from ManagedObject
			checkCall(this.oModel.bindList, "/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "$direct"});
			checkCall(ODataListBinding.prototype.initialize);
			checkCall(ODataListBinding.prototype.getContexts, oRange.startIndex, oRange.length);

			oControl.getBinding("items").attachChange(onChange);
			assert.deepEqual(oControl.getItems(), [], "initial synchronous result");

			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("nested listbinding", function (assert) {
		var oBinding,
			oControl = new TestControl({models : this.oModel}),
			sPath = "TEAM_2_EMPLOYEES",
			oRange = {startIndex : 1, length : 3},
			oPromise = createSyncResult(oRange.length, 0, true);

		// change event handler for initial read for list binding
		function onChange() {
			var aChildControls = oControl.getItems(),
				aOriginalContexts = oBinding.aContexts,
				i;

			assert.strictEqual(oBinding.oCache, undefined, "no own cache");
			assert.strictEqual(aChildControls.length, 3, "# child controls");
			for (i = 0; i < 3; i += 1) {
				assert.strictEqual(aChildControls[i].getBindingContext().getPath(),
					"/TEAMS('4711')/" + sPath + "/" + (i + oRange.startIndex));
			}

			// code under test (same context)
			oBinding.setContext(oBinding.getContext());

			assert.strictEqual(oBinding.aContexts, aOriginalContexts);
			assert.strictEqual(ODataListBinding.prototype.reset.callCount, 2, "no more reset");

			// code under test (clear context)
			oBinding.setContext();
			assert.strictEqual(ODataListBinding.prototype.reset.callCount, 3,
				"reset after changing the context");

			assert.ok(ODataListBinding.prototype.reset.alwaysCalledWithExactly());
		}

		this.mock(ODataListBinding.prototype).expects("getGroupId").never();
		oControl.bindObject("/TEAMS('4711')");
		this.mock(oControl.getObjectBinding()).expects("fetchValue").atLeast(1)
			.withExactArgs(sPath, undefined, undefined)
			.returns(oPromise);
		this.spy(ODataListBinding.prototype, "reset");

		// code under test
		oControl.bindAggregation("items", jQuery.extend({
				path : sPath,
				template : new TestControl()
			}, oRange));

		oBinding = oControl.getBinding("items");
		oBinding.attachEventOnce("change", onChange);
		assert.strictEqual(ODataListBinding.prototype.reset.callCount, 2,
			"2x reset constructor and setContext");

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("reset context for nested list binding with its own cache", function (assert) {
		var oBinding,
			oCacheProxy = {
				deregisterChange : function () {}
			},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
			{$select : "ID"});
		this.mock(oBinding).expects("makeCache").withExactArgs(sinon.match.same(oContext))
			.returns(oCacheProxy);

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCache, oCacheProxy);
	});

	//*********************************************************************************************
	QUnit.test("nested listbinding (context not yet set)", function (assert) {
		var oControl = new TestControl({models : this.oModel}),
			oRange = {startIndex : 1, length : 3};

		// change event handler for initial read for list binding
		function onChange() {
			assert.ok(false, "unexpected event called");
		}

		// code under test
		oControl.bindAggregation("items", jQuery.extend({
				path : "TEAM_2_EMPLOYEES",
				template : new TestControl()
			}, oRange));

		oControl.getBinding("items").attachChange(onChange);
		assert.deepEqual(oControl.getBinding("items").getContexts(), [],
			"list binding contexts not set");
	});

	//*********************************************************************************************
	QUnit.test("nested listbinding (deferred association)", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/TEAMS('4711')"),
			oPromise = Promise.resolve(); //TODO not realistic!

		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oPromise);

		// code under test
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.deepEqual(oBinding.getContexts(), []);
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/bar");

		oBinding = this.oModel.bindList("foo", oContext);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		assert.strictEqual(oBinding.initialize(), undefined, "no chaining");
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oBinding = this.oModel.bindList("Suppliers");

		this.mock(oBinding).expects("_fireChange").never();

		oBinding.initialize();
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path without parameters", function (assert) {
		var oBinding = this.oModel.bindList("Suppliers"),
			oContext = Context.create(this.oModel, {}, "/bar");

		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context});
		this.mock(_ODataHelper).expects("createCache").never();

		oBinding.setContext(oContext);
	});

	//*********************************************************************************************
	QUnit.test("getContexts called directly provides contexts as return value and in change event",
		function (assert) {
		var done = assert.async(),
			oCacheMock = this.getCacheMock(), // this is used in bindList
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext = {},
			iSizeLimit = this.oModel.iSizeLimit,
			iRangeIndex = 0,
			// fixture with array of ranges for getContexts calls with
			//   start, length - determine the range
			//   sync - array with flags which indexes are to return a context synchronously to
			//     simulate previous calls to getContexts
			oFixture  = [
				{sync : []},
				// completely new contexts
				{start : iSizeLimit, length : 1, sync : []},
				// partially new contexts
				{start : iSizeLimit, length : 2, sync : [true]},
				// completely existing contexts
				{start : iSizeLimit, length : 2, sync : [true, true]}
			];

		// call getContexts for current range; considers previously accessed indexes
		// only if used to check synchronous return value of getContexts.
		function checkContexts(bSync) {
			var aContexts,
				i,
				iLength = oFixture[iRangeIndex].length || iSizeLimit,
				sMessage,
				iStart = oFixture[iRangeIndex].start || 0,
				oPromise;

			if (bSync) {
				// during the last iteration there is only a sync request, otherwise an async one
				// followed by a sync one
				if (iRangeIndex < oFixture.length - 1) {
					oCacheMock.expects("read")
						.withExactArgs(iStart, iLength, "$auto", undefined, sinon.match.func)
						.callsArg(4)
						.returns(createResult(iLength, iStart));
				}
				oCacheMock.expects("read")
					.withExactArgs(iStart, iLength, "$auto", undefined, sinon.match.func)
					.returns(createSyncResult(iLength, iStart));
			}

			// code under test, must not ruin aContexts
			oBinding.setContext(oContext);
			assert.strictEqual(oBinding.oContext, oContext);

			// code under test, read synchronously with previous range
			aContexts = oBinding.getContexts(iStart, iLength);

			assert.strictEqual(aContexts.dataRequested, undefined);

			for (i = 0; i < iLength; i += 1) {
				sMessage = (bSync ? "Synchronous" : "Asynchronous") + " result"
					+ "/EMPLOYEES/" + (iStart + i) + ", getContexts("
					+ iStart + "," + iLength + ")";
				if (bSync && !oFixture[iRangeIndex].sync[i]) {
					assert.strictEqual(aContexts[i], undefined, sMessage);
				} else {
					assert.strictEqual(aContexts[i].getPath(),
						"/EMPLOYEES/" + (iStart + i),
						sMessage);
					//check delegation of fetchValue from context
					oPromise = {}; // a fresh new object each turn around
					oBindingMock.expects("fetchValue")
						.withExactArgs("foo/bar/" + i, undefined, iStart + i)
						.returns(oPromise);

					assert.strictEqual(aContexts[i].fetchValue("foo/bar/" + i), oPromise);
				}
			}
		}

		// change event handler for list binding
		function onChange() {
			checkContexts();
			iRangeIndex += 1;
			checkContexts(true);
			// only the last range in the fixture triggers no change event
			if (iRangeIndex === oFixture.length - 1) {
				done();
			}
		}

		checkContexts(true);
		oBinding.attachChange(onChange);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("getContexts sends no change event on failure of _Cache#read and logs error, "
				+ "path is relative: " + bRelative, function (assert) {
			var oBinding,
				oCacheMock,
				oContext = Context.create(this.oModel, {}, "/EMPLOYEES(1)"),
				oContextMock,
				oError = new Error("Intentionally failed"),
				oPromise = Promise.reject(oError),
				sResolvedPath = bRelative
					? "/service/EMPLOYEES(1)/TEAM_2_EMPLOYEES"
					: "/service/EMPLOYEES";

			if (bRelative) {
				oContextMock = this.mock(oContext);
				// Note: must be async, else no "change" event is fired!
				oContextMock.expects("fetchValue").returns(createResult(2, 0, true));
				oContextMock.expects("fetchValue").returns(oPromise);
				// no error logged by ODataListBinding; parent context logged the error already
			} else {
				oCacheMock = this.getCacheMock();
				oCacheMock.expects("read").callsArg(4).returns(createResult(2));
				oCacheMock.expects("read").callsArg(4).returns(oPromise);
				this.mock(this.oModel).expects("reportError").withExactArgs(
					"Failed to get contexts for " + sResolvedPath
					+ " with start index 1 and length 2", sClassName,
					sinon.match.same(oError));
			}

			oBinding = this.oModel.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
					oContext);
			oBinding.attachChange(function () {
				// code under test
				var aContexts = oBinding.getContexts(1, 2); // failing read

				assert.strictEqual(aContexts.length, 1, "contexts from first read still exist");
			});
			oBinding.getContexts(0, 2); // successful read

			return oPromise.catch(function () {
				assert.ok(true);
			});
			//TODO implement faultTolerant setting on list binding which keeps existing contexts?
		});
	});

	//*********************************************************************************************
	[
		{start : 0, result : 0, isFinal : true, length : 0, text : "no data"},
		{start : 20, result : 29, isFinal : true, length : 49, text : "less data than requested"},
		{start : 20, result : 0, isFinal : false, length : 10, changeEvent : false,
			text : "no data for given start > 0"},
		{start : 20, result : 30, isFinal : false, length : 60, text : "maybe more data"}
	].forEach(function (oFixture) {
		QUnit.test("paging: " + oFixture.text, function (assert) {
			var oBinding,
				oContext = {
					fetchValue : function () {
						assert.ok(false, "context must be ignored for absolute bindings");
					}
				},
				oPromise = createResult(oFixture.result);

			this.getCacheMock().expects("read")
				.withExactArgs(oFixture.start, 30, "$direct", undefined, sinon.match.func)
				.callsArg(4)
				.returns(oPromise);
			oBinding = this.oModel.bindList("/EMPLOYEES", oContext, undefined, undefined,
				{$$groupId : "$direct"});
			this.mock(oBinding).expects("_fireChange")
				.exactly(oFixture.changeEvent === false ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Change});

			assert.strictEqual(oBinding.isLengthFinal(), false, "Length is not yet final");
			assert.strictEqual(oBinding.getLength(), 10, "Initial estimated length is 10");

			getContexts(assert, oBinding, oFixture.start, 30);

			// attach then handler after ODataListBinding attached its then handler to be
			// able to check length and isLengthFinal
			return oPromise.then(function () {
				// if there are less entries returned than requested then final length is known
				assert.strictEqual(oBinding.isLengthFinal(), oFixture.isFinal);
				assert.strictEqual(oBinding.getLength(), oFixture.length);
				assert.deepEqual(oBinding.getCurrentContexts(),
					oBinding.aContexts.slice(oFixture.start, oFixture.length));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("threshold", function (assert) {
		var oBinding,
			oBindingMock,
			oCacheMock = this.getCacheMock(),
			oPromise,
			iReadLength = 135,
			iReadStart = 40,
			that = this;

		function expectDebug(iStart, iLength, iMaximumPrefetchSize) {
			that.oLogMock.expects("debug")
				.withExactArgs(oBinding + "#getContexts(" + iStart + ", "
						+ iLength + ", " + iMaximumPrefetchSize + ")",
					undefined, "sap.ui.model.odata.v4.ODataListBinding");
		}

		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{$$groupId : "$direct"});
		oBindingMock = this.mock(oBinding);

		expectDebug(100, 15, 60);
		oBindingMock.expects("getReadRange")
			.withExactArgs(100, 15, 60)
			.returns({start : iReadStart, length : 175});

		oPromise = createResult(iReadLength, iReadStart);
		oCacheMock.expects("read")
			.withExactArgs(iReadStart, 175, "$direct", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oPromise);

		// code under test
		oBinding.getContexts(100, 15, 60);

		return oPromise.then(function () {
			var i,n;

			// check that data is inserted at right place
			for (i = 0; i < iReadStart; i++) {
				assert.strictEqual(oBinding.aContexts[i], undefined, "Expected context: " + i);
			}
			for (i = iReadStart, n = iReadStart + iReadLength; i < n; i++) {
				assert.strictEqual(oBinding.aContexts[i].getIndex(), i,
					"Expected context: " + i);
			}
			assert.strictEqual(oBinding.aContexts[n], undefined, "Expected context: " + n);

			expectDebug(110, 15);
			// default threshold to 0
			oBindingMock.expects("getReadRange")
				.withExactArgs(110, 15, 0)
				.returns({start : 110, length : 15});
			oCacheMock.expects("read")
				.withExactArgs(110, 15, "$direct", undefined, sinon.match.func)
				.returns(createSyncResult(15, 110));

			// code under test
			oBinding.getContexts(110, 15);

			expectDebug(120, 15, -15);
			// default negative threshold to 0
			oBindingMock.expects("getReadRange")
				.withExactArgs(120, 15, 0)
				.returns({start : 120, length : 15});
			oCacheMock.expects("read")
				.withExactArgs(120, 15, "$direct", undefined, sinon.match.func)
				.returns(createSyncResult(15, 120));

			// code under test
			oBinding.getContexts(120, 15, -15);
		});
	});

	//*********************************************************************************************
	[
		{start : 15, result : 3, isFinal : true, curr : 20, len : 18, text : "less than before"},
		{start : 0, result : 30, isFinal : true, curr : 30, len : 35, text : "full read before"},
		{start : 18, result : 30, isFinal : false, curr : 17, len : 58, text : "full read after"},
		{start : 10, result : 0, isFinal : true, curr : 25, len : 10, text : "empty read before"}
	].forEach(function (oFixture) {
		QUnit.test("paging: adjust final length: " + oFixture.text, function (assert) {
			var oCacheMock = this.getCacheMock(), // this is used in bindList
				oBinding = this.oModel.bindList("/EMPLOYEES"),
				i, n,
				oReadPromise1 = createResult(15),
				oReadPromise2 = Promise.resolve(createResult(oFixture.result));

			oCacheMock.expects("read")
				.withExactArgs(20, 30, "$auto", undefined, sinon.match.func)
				.callsArg(4)
				.returns(oReadPromise1);
			oCacheMock.expects("read")
				.withExactArgs(oFixture.start, 30, "$auto", undefined, sinon.match.func)
				.callsArg(4)
				.returns(oReadPromise2);

			assert.deepEqual(oBinding.getCurrentContexts(), []);
			oBinding.getContexts(20, 30); // creates cache

			return oReadPromise1.then(function () {
				assert.deepEqual(oBinding.getCurrentContexts(), oBinding.aContexts.slice(20, 35));
				assert.strictEqual(oBinding.isLengthFinal(), true);
				assert.strictEqual(oBinding.getLength(), 35);

				getContexts(assert, oBinding, oFixture.start, 30, oFixture.curr);

				return oReadPromise2;
			}).then(function () {
				assert.deepEqual(oBinding.getCurrentContexts(),
					oBinding.aContexts.slice(oFixture.start, oFixture.start + oFixture.result));
				assert.strictEqual(oBinding.isLengthFinal(), oFixture.isFinal, "final");
				assert.strictEqual(oBinding.getLength(), oFixture.len);
				assert.strictEqual(oBinding.aContexts.length,
					oFixture.len - (oFixture.isFinal ? 0 : 10), "Context array length");
				for (i = oFixture.start, n = oFixture.start + oFixture.result; i < n; i++) {
					assert.strictEqual(oBinding.aContexts[i].sPath,
						"/EMPLOYEES/" + i, "check content");
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("paging: full read before length; length at boundary", function (assert) {
		var oCacheMock = this.getCacheMock(), // this is used in bindList
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			oReadPromise1 = createResult(30),
			oReadPromise2 = createResult(30),
			oReadPromise3 = createResult(0);

		// 1. read and get [20..50) -> estimated length 60
		oCacheMock.expects("read")
			.withExactArgs(20, 30, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise1);
		// 2. read and get [0..30) -> length still 60
		oCacheMock.expects("read")
			.withExactArgs(0, 30, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise2);
		// 3. read [50..80) get no entries -> length is now final 50
		oCacheMock.expects("read")
			.withExactArgs(50, 30, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise3);

		oBinding.getContexts(20, 30);

		return oReadPromise1.then(function () {
			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 60);

			oBinding.getContexts(0, 30); // read more data from beginning

			return oReadPromise2;
		}).then(function () {
			assert.strictEqual(oBinding.isLengthFinal(), false, "still not final");
			assert.strictEqual(oBinding.getLength(), 60, "length not reduced");

			oBinding.getContexts(50, 30); // no more data; length at paging boundary

			return oReadPromise3;
		}).then(function () {
			assert.strictEqual(oBinding.isLengthFinal(), true, "now final");
			assert.strictEqual(oBinding.getLength(), 50, "length at boundary");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("refresh: " + (bRelative ? "relative, base context" : "absolute"),
				function (assert) {
			var oBinding = this.oModel.bindList(bRelative ? "EMPLOYEES" : "/EMPLOYEES");

			if (bRelative){
				oBinding.setContext(this.oModel.createBindingContext("/"));
			}

			this.oSandbox.mock(_ODataHelper).expects("isRefreshable")
				.withExactArgs(oBinding).returns(true);
			this.mock(oBinding).expects("hasPendingChanges").returns(false);
			this.mock(oBinding).expects("refreshInternal").withExactArgs("myGroup");

			// code under test
			oBinding.refresh("myGroup");
		});
	});

	//*********************************************************************************************
	[{
		bRelative : false, bBaseContext : false
	}, {
		bRelative : true, bBaseContext : false
	}, {
		bRelative : true, bBaseContext : true
	}].forEach(function (oFixture) {
		QUnit.test("refreshInternal: " + (oFixture.bRelative ? "relative, " : "absolute, ")
				+ (oFixture.bBaseContext ? "base context" : "V4 context"), function (assert) {
			var oBinding,
				oBindingMock = this.mock(ODataListBinding.prototype),
				oCache = {},
				oChild0 = {
					getContext : getContextMock.bind(undefined, false),
					refreshInternal : function () {}
				},
				oChild1 = {
					getContext : getContextMock.bind(undefined, false),
					refreshInternal : function () {}
				},
				oContext;

			if (oFixture.bBaseContext) {
				oContext = this.oModel.createBindingContext("/TEAMS('TEAM_01')");
			} else {
				oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')");
			}
			if (oFixture.bRelative) {
				oBindingMock.expects("makeCache").returns(oCache);
			} else {
				this.mock(_Cache).expects("create").returns(oCache);
			}
			oBinding = this.oModel.bindList(
				oFixture.bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
				oContext, undefined, undefined, {/*mParameters*/});

			oBindingMock.expects("makeCache").on(oBinding)
				.withExactArgs(sinon.match.same(oContext))
				.returns(oCache);
			oBinding.mCacheByContext = {};

			oBindingMock.expects("reset").on(oBinding).withExactArgs(ChangeReason.Refresh);
			this.mock(this.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oBinding))
				.returns([oChild0, oChild1]);
			this.mock(oChild0).expects("refreshInternal").withExactArgs("myGroup");
			this.mock(oChild1).expects("refreshInternal").withExactArgs("myGroup");

			//code under test
			oBinding.refreshInternal("myGroup");

			assert.strictEqual(oBinding.mCacheByContext, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: no own cache", function (assert) {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oChild0 = {
				getContext : getContextMock.bind(undefined, false),
				refreshInternal : function () {}
			},
			oContext = Context.create(this.oModel, {}, "/TEAMS('1')"),
			// Note: must be async, else no "change" event is fired!
			oReadPromise = createResult(2, 0, true),
			that = this;

		oBinding.setContext(oContext);
		// change event during getContexts
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		// refresh event during refresh
		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oReadPromise);

		oBinding.getContexts(0, 10);

		return oReadPromise.then(function () {
			that.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
			that.mock(that.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oBinding))
				.returns([oChild0]);
			that.mock(oChild0).expects("refreshInternal").withExactArgs("myGroup");

			//code under test
			oBinding.refreshInternal("myGroup");
		});
	});
	// TODO: Call reset and fireRefresh on relative bindings w/o cache?

	//*********************************************************************************************
	QUnit.test("refreshInternal: dependent bindings with transient contexts", function (assert) {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oChild0 = {
				getContext : getContextMock.bind(undefined, false),
				refreshInternal : function () {}
			},
			oChild1 = {
				getContext : getContextMock.bind(undefined, true),
				refreshInternal : function () {}
			},
			oContext = Context.create(this.oModel, {}, "/TEAMS('1')"),
			// Note: must be async, else no "change" event is fired!
			oReadPromise = createResult(2, 0, true),
			that = this;

		oBinding.setContext(oContext);
		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oReadPromise);
		// change event during getContexts
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		oBinding.getContexts(0, 10);

		return oReadPromise.then(function () {
			that.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
			that.mock(that.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oBinding))
				.returns([oChild0, oChild1]);
			that.mock(oChild0).expects("refreshInternal").withExactArgs("myGroup");
			that.mock(oChild1).expects("refreshInternal").never();

			//code under test
			oBinding.refreshInternal("myGroup");
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("hasPendingChanges").returns(true);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Cannot refresh due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: invalid application group", function (assert) {
		var oBinding,
			oCache = {},
			oError = new Error();

		this.mock(_Cache).expects("create").returns(oCache);
		oBinding = this.oModel.bindList("/EMPLOYEES");
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oBinding.refresh("$Invalid");

			assert.strictEqual(oBinding.oCache, oCache);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oBinding = this.oModel.bindList("EMPLOYEES");

		this.mock(oBinding).expects("_fireRefresh").never();

		//code under test
		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("getContexts fires dataRequested and dataReceived events", function (assert) {
		var that = this;

		return new Promise(function (finishTest) {
			var oBinding = that.oModel.bindList("/EMPLOYEES");

			that.stub(oBinding.oCache, "read", function (iIndex, iLength, sGroupId, sPath,
					fnDataRequested) {
				return Promise.resolve().then(function () {
					that.mock(oBinding).expects("fireDataRequested").withExactArgs();

					fnDataRequested();
				}).then(function () {
					that.mock(oBinding).expects("_fireChange")
						.withExactArgs({reason : "change"});
					return createData(10);
				});
			});

			oBinding.attachDataReceived(function () {
				assert.strictEqual(oBinding.aContexts.length, 10, "data already processed");
				finishTest();
			});
			oBinding.getContexts(0, 10);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts - error handling for dataRequested/dataReceived", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oError = new Error("Expected Error"),
			oReadPromise = Promise.reject(oError);

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to get contexts for /service/EMPLOYEES with start index 0 and length 3",
			sClassName, sinon.match.same(oError));
		this.mock(oBinding.oCache).expects("read").callsArg(4).returns(oReadPromise);
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oError});

		oBinding.getContexts(0, 3);
		return oReadPromise.catch(function () {
			assert.deepEqual(oBinding.getCurrentContexts(), [undefined, undefined, undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts - concurrent call with read errors", function (assert) {
		var that = this;

		return new Promise(function (finishTest) {
			var oBinding = that.oModel.bindList("/EMPLOYEES"),
				oError = new Error(),
				bFireDataRequested = true,
				bGotDataReceived = false;

			that.mock(that.oModel).expects("reportError").withExactArgs(
				"Failed to get contexts for /service/EMPLOYEES with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

			that.stub(oBinding.oCache, "read", function (iIndex, iLength, sGroupId, sPath,
					fnDataRequested) {
				return Promise.resolve().then(function () {
					if (bFireDataRequested) {
						fnDataRequested();
						bFireDataRequested = false;
					}
				}).then(function () {
					throw oError;
				});
			});

			oBinding.attachDataReceived(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("error"), oError);
				assert.notOk(bGotDataReceived);
				bGotDataReceived = true;
				finishTest();
			});

			oBinding.getContexts(0, 10);
			// call it again in parallel
			oBinding.getContexts(0, 10);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oListener = {},
			oPromise,
			oReadResult = {};

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(42, 1, undefined, "bar", undefined, oListener)
			.returns(_SyncPromise.resolve(oReadResult));

		oPromise = oBinding.fetchValue("bar", oListener, 42);
		assert.ok(oPromise.isFulfilled());
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});
	//TODO support dataRequested/dataReceived event in fetchValue:
	//     common implementation used by fetchValue and getContexts?

	//*********************************************************************************************
	[{
		abs : "/EMPLOYEES/42/bar/baz",
		rel : "bar/baz"
	}, {
		abs : "/EMPLOYEES/42",
		rel : ""
	}].forEach(function (oFixture) {
		QUnit.test("fetchAbsoluteValue: absolute binding: " + oFixture.abs, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				oResult = {};

			this.mock(oBinding).expects("fetchValue")
				.withExactArgs(oFixture.rel, undefined, 42).returns(oResult);

			assert.strictEqual(oBinding.fetchAbsoluteValue(oFixture.abs), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding, relative path", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/foo"),
			oListener = {},
			oPromise = {};

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
		this.mock(_Helper).expects("buildPath").withExactArgs("TEAM_2_EMPLOYEES", 42, "bar")
			.returns("~");
		this.mock(oContext).expects("fetchValue").withExactArgs("~", sinon.match.same(oListener))
			.returns(oPromise);

		assert.strictEqual(oBinding.fetchValue("bar", oListener, 42), oPromise);
	});
	//TODO provide iStart, iLength parameter to fetchValue to support paging on nested list

	//*********************************************************************************************
	["/TEAMS/1", "/TEAMS/1/TEAM_2_EMPLOYEES/2"].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding: " + sPath, function (assert) {
			var oBinding,
				oContext = Context.create(this.oModel, undefined, "/TEAMS/1"),
				oPromise = {};

			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
			this.mock(oContext).expects("fetchAbsoluteValue")
				.withExactArgs(sPath).returns(oPromise);

			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchAbsoluteValue: relative binding, base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')"),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		// code under test, binding resolved
		assert.strictEqual(oBinding.fetchAbsoluteValue("/TEAMS('42')").getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding, unresolved", function (assert) {
		this.oModel.bindList("TEAM_2_EMPLOYEES").fetchValue("bar", {}, 42).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	[
		"/SalesOrderList('1')",
		"/SalesOrderList('1')/SO_2_SOITEM", // not from cache, because no index
		"/SalesOrderList('1')/SO_2_SOITEM_DIFF/bar"
	].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding w/ cache: " + sPath, function (assert) {
			var oBinding = this.oModel.bindList("SO_2_SOITEM", undefined, undefined, undefined, {}),
				oCacheProxy = {},
				oContext = Context.create(this.oModel, undefined, "/SalesOrderList('1')"),
				oResult = {};

			this.mock(oBinding).expects("fetchValue").never();

			// code under test
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath).getResult(), undefined);

			this.mock(oBinding).expects("makeCache").returns(oCacheProxy);
			oBinding.setContext(oContext);
			this.mock(oContext).expects("fetchAbsoluteValue").withExactArgs(sPath).returns(oResult);

			// code under test
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchAbsoluteValue: relative binding w/ cache, absolute path", function (assert) {
		var oBinding = this.oModel.bindList("SO_2_SOITEM", undefined, undefined, undefined, {}),
			oCacheProxy = {},
			oContext = Context.create(this.oModel, undefined, "/SalesOrderList('1')"),
			oResult = {};

		this.mock(oBinding).expects("makeCache").returns(oCacheProxy);
		oBinding.setContext(oContext);

		this.mock(oBinding).expects("fetchValue")
			.withExactArgs("bar", undefined, 2).returns(oResult);

		// code under test
		assert.strictEqual(oBinding.fetchAbsoluteValue("/SalesOrderList('1')/SO_2_SOITEM/2/bar"),
			oResult);
	});

	//*********************************************************************************************
	[undefined, "up"].forEach(function (sGroupId) {
		QUnit.test("updateValue: absolute binding", function (assert) {
			var oBinding = this.oModel.bindList("/SalesOrderList", null, null, null,
					{$$updateGroupId : "myUpdateGroup"}),
				sPath = "0/SO_2_SOITEM/42",
				oResult = {};

			this.mock(oBinding).expects("fireEvent").never();
			this.mock(oBinding.oCache).expects("update")
				.withExactArgs(sGroupId || "myUpdateGroup", "bar", Math.PI, "edit('URL')", sPath)
				.returns(Promise.resolve(oResult));

			// code under test
			return oBinding.updateValue(sGroupId, "bar", Math.PI, "edit('URL')", sPath)
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("updateValue: relative binding", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/foo"),
			oResult = {};

		oBinding = this.oModel.bindList("SO_2_SOITEM", oContext);
		this.mock(oBinding).expects("fireEvent").never();
		this.mock(oBinding).expects("getGroupId").never();
		this.mock(_Helper).expects("buildPath").withExactArgs("SO_2_SOITEM", "42").returns("~42~");
		this.mock(oContext).expects("updateValue")
			.withExactArgs("up", "bar", Math.PI, "edit('URL')", "~42~")
			.returns(Promise.resolve(oResult));

		// code under test
		return oBinding.updateValue("up", "bar", Math.PI, "edit('URL')", "42")
			.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: absolute binding", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			oListener = {};

		this.mock(oBinding.oCache).expects("deregisterChange")
			.withExactArgs(1, "foo", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener, 1);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding resolved", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/foo"),
			oListener = {};

		oBinding = this.oModel.bindList("SO_2_SOITEM", oContext);
		this.mock(_Helper).expects("buildPath").withExactArgs("SO_2_SOITEM", 1, "foo").returns("~");
		this.mock(oContext).expects("deregisterChange")
			.withExactArgs("~", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener, 1);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding unresolved", function (assert) {
		this.oModel.bindList("SO_2_SOITEM")
			.deregisterChange("foo", {}, 1); // nothing must happen
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oBinding = this.oModel.bindList("/BusinessPartners"),
			oResult = {};

		this.mock(_ODataHelper).expects("hasPendingChanges")
			.withExactArgs(sinon.match.same(oBinding), true)
			.returns(oResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges", function (assert) {
		var oBinding = this.oModel.bindList("/BusinessPartners");

		this.mock(_ODataHelper).expects("resetChanges")
			.withExactArgs(sinon.match.same(oBinding), true);

		// code under test
		oBinding.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.getDistinctValues();
		}, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));

		assert.throws(function () { //TODO implement
			oBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataListBinding#isInitial"));

		assert.throws(function () { //TODO implement
			oBinding.resume();
		}, new Error("Unsupported operation: v4.ODataListBinding#resume"));

		assert.throws(function () { //TODO implement
			oBinding.suspend();
		}, new Error("Unsupported operation: v4.ODataListBinding#suspend"));

		oBinding.enableExtendedChangeDetection(false);
		assert.throws(function () { //TODO implement?
			oBinding.getContexts(0, 42, 0);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, third"
				+ " parameter must not be set if extended change detection is enabled"));

		assert.throws(function () {
			oBinding.getContexts(42);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, first parameter " +
			"must be 0 if extended change detection is enabled, but is 42"));
	});
	//TODO errors on _fireFilter(mArguments) and below in Wiki

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oBinding,
			mEventParameters = {},
			oReturn = {};

		this.mock(ListBinding.prototype).expects("attachEvent")
			.withExactArgs("change", mEventParameters).returns(oReturn);

		oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.attachEvent("filter");
		}, new Error("Unsupported event 'filter': v4.ODataListBinding#attachEvent"));

		assert.throws(function () {
			oBinding.attachEvent("sort");
		}, new Error("Unsupported event 'sort': v4.ODataListBinding#attachEvent"));

		assert.strictEqual(oBinding.attachEvent("change", mEventParameters), oReturn);
	});

	//*********************************************************************************************
	QUnit.test("$$groupId, $$updateGroupId, $$operationMode", function (assert) {
		var aAllowed = ["$$groupId", "$$operationMode", "$$updateGroupId"],
			oBinding,
			oHelperMock = this.mock(_ODataHelper),
			oModelMock = this.mock(this.oModel),
			mParameters = {};

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowed)
			.returns({$$groupId : "foo", $$operationMode : "Server", $$updateGroupId : "bar"});
		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowed)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, undefined);
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowed)
			.returns({});
		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters also called for relative binding
		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowed)
			.returns({$$groupId : "foo", $$operationMode : "Server", $$updateGroupId : "bar"});
		// code under test
		oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS", undefined, undefined, undefined,
			mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: relative bindings", function (assert) {
		var oBinding = this.oModel.bindList("relative"),
			oContext = Context.create(this.oModel, {}, "/absolute");

		this.mock(this.oModel).expects("getGroupId").withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");

		oBinding.setContext(oContext);
		this.mock(oContext).expects("getGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: relative bindings with base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/absolute"),
			oBinding = this.oModel.bindList("relative", oContext);

		this.mock(this.oModel).expects("getGroupId").withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: relative bindings", function (assert) {
		var oBinding = this.oModel.bindList("relative"),
			oContext = Context.create(this.oModel, {}, "/absolute");

		this.mock(this.oModel).expects("getUpdateGroupId").withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oBinding.setContext(oContext);
		this.mock(oContext).expects("getUpdateGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: relative bindings with base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/absolute"),
			oBinding = this.oModel.bindList("relative", oContext);

		this.mock(this.oModel).expects("getUpdateGroupId").withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");
	});

	//*********************************************************************************************
	QUnit.test("getContexts uses group ID from binding parameter", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "myGroup"});

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 10, "myGroup", undefined, sinon.match.func)
			.returns(createResult(0));

		oBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("getContexts uses refresh group ID", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "$direct"});

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 10, "myGroup", undefined, sinon.match.func)
			.returns(createResult(0));
		oBinding.sRefreshGroupId = "myGroup";

		oBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: data received handler throws error", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oError = new Error("Expected"),
			oReadPromise = createResult(0);

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
			.callsArg(4).returns(oReadPromise);
		// check that error in data received handler is logged
		this.oLogMock.expects("error").withExactArgs(oError.message,
			sinon.match(function (sDetails) {
				return sDetails === oError.stack;
			}), sClassName);
		oBinding.attachDataReceived(function () {
			throw oError;
		});

		// code under test
		oBinding.getContexts(0, 10);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("sync getCurrentContexts while reading", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oCacheMock = this.mock(oBinding.oCache),
			oReadPromise1 = createResult(10);

		oCacheMock.expects("read")
			.withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
			.callsArg(4).returns(oReadPromise1);

		oBinding.getContexts(0, 10);

		return oReadPromise1.then(function () {
			var oReadPromise2 = createResult(0);

			oCacheMock.expects("read")
				.withExactArgs(10, 5, "$auto", undefined, sinon.match.func)
				.callsArg(4).returns(oReadPromise2);

			oBinding.getContexts(10, 5);

			oCacheMock.expects("read")
				.withExactArgs(0, 5, "$auto", undefined, sinon.match.func)
				.returns(createSyncResult(5));

			oBinding.getContexts(0, 5);
			return oReadPromise2.then(function () {
				assert.deepEqual(oBinding.getCurrentContexts(), oBinding.aContexts.slice(0, 5));
			});
		});
	});

	//*********************************************************************************************
	[
		{
			mParameters : {$$operationMode : OperationMode.Server},
			queryOptions : {"sap-client" : "111"},
			vSorters : undefined
		}, {
			mParameters : {$$operationMode : OperationMode.Server},
			queryOptions : {$orderby : "foo", "sap-client" : "111"},
			vSorters : new Sorter("foo")
		}, {
			mParameters : {$$operationMode : OperationMode.Server, $orderby : "bar"},
			queryOptions : {$orderby : "foo,bar", "sap-client" : "111"},
			vSorters : [new Sorter("foo")]
		}, {
			oModel : new ODataModel({
				operationMode : OperationMode.Server,
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			mParameters : {$orderby : "bar"},
			queryOptions : {$orderby : "foo,bar", "sap-client" : "111"},
			vSorters : [new Sorter("foo")]
		}
	].forEach(function (oFixture) {
		QUnit.test("sort: vSorters = " + JSON.stringify(oFixture.vSorters) + " and mParameters = "
				+ JSON.stringify(oFixture.mParameters), function (assert) {
			var oBinding,
				oCacheProxy = {},
				oModel = oFixture.oModel || this.oModel,
				oContext = Context.create(oModel, /*oBinding*/{}, "/TEAMS", 1);

			oBinding = oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
				oFixture.mParameters);

			oBinding.mCacheByContext = {"/TEAMS('1')" : {}, "/TEAMS('42')" : {}};
			this.mock(oBinding).expects("hasPendingChanges").returns(false);
			this.spy(_Helper, "toArray");
			this.mock(oBinding).expects("makeCache").twice() // from setContext and sort
				.withExactArgs(sinon.match.same(oContext)).returns(oCacheProxy);
			this.spy(oBinding, "reset");
			oBinding.setContext(oContext);

			// code under test
			assert.strictEqual(oBinding.sort(oFixture.vSorters), oBinding, "chaining");

			assert.deepEqual(oBinding.aSorters, _Helper.toArray.returnValues[0]);
			assert.ok(_Helper.toArray.calledWithExactly(oFixture.vSorters));
			assert.strictEqual(oBinding.mCacheByContext, undefined);
			assert.ok(oBinding.reset.calledWithExactly(), "from setContext");
			assert.ok(oBinding.reset.calledWithExactly(ChangeReason.Sort), "from sort");
		});
	});

	//*********************************************************************************************
	QUnit.test("sort - errors", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext;

		assert.throws(function () {
			oBinding.sort([]);
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.oModel.bindList("/EMPLOYEES", null, null, null,
			{$$operationMode : OperationMode.Server});
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));

		oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);
		//avoid cache creation
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", null, null, null,
			{$$operationMode : OperationMode.Server});
		this.mock(oBinding).expects("makeCache").returns(/*oCacheProxy*/{});
		oBinding.setContext(oContext);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
			QUnit.test("filter: FilterType=" + sFilterType + ", "
					+ (bRelative ? "relative" : "absolute") + " binding", function (assert) {
				var oBinding,
					oBindingMock = this.mock(ODataListBinding.prototype),
					oCacheProxy = {
						hasPendingChanges : function () {
							return false;
						}
					},
					oContext = Context.create(this.oModel, undefined, "/TEAMS"),
					oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
					aFilters = [oFilter],
					sPath = bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
					sStaticFilter = "Age gt 18";

				oBinding = this.oModel.bindList(sPath, undefined, undefined, undefined, {
					$filter : sStaticFilter,
					$$operationMode : OperationMode.Server
				});
				if (bRelative) {
					oBindingMock.expects("makeCache").on(oBinding)
						.withExactArgs(sinon.match.same(oContext))
						.returns(oCacheProxy);
				}
				oBinding.setContext(oContext);

				this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oFilter))
					.returns(aFilters);
				oBindingMock.expects("makeCache").on(oBinding)
					.withExactArgs(sinon.match.same(oContext))
					.returns(oCacheProxy);
				oBindingMock.expects("reset").on(oBinding).withExactArgs(ChangeReason.Filter);

				// Code under test
				assert.strictEqual(oBinding.filter(oFilter, sFilterType), oBinding, "chaining");

				assert.strictEqual(oBinding.oCache, oCacheProxy);
				if (sFilterType === FilterType.Control) {
					assert.strictEqual(oBinding.aFilters, aFilters);
					assert.deepEqual(oBinding.aApplicationFilters, []);
				} else {
					assert.strictEqual(oBinding.aApplicationFilters, aFilters);
					assert.deepEqual(oBinding.aFilters, []);
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("filter: resets map of caches by context", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$operationMode : OperationMode.Server
			});

		oBinding.mCacheByContext = {};

		this.mock(oBinding).expects("makeCache").withExactArgs(undefined);

		// Code under test
		oBinding.filter(/*no filter*/);

		assert.strictEqual(oBinding.mCacheByContext, undefined);
	});

	//*********************************************************************************************
	QUnit.test("filter: check errors", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.filter();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{ $$operationMode : OperationMode.Server });

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.filter();
		}, new Error("Cannot filter due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding = this.oModel.bindList("relative"),
			oBindingContext = {destroy : function () {}},
			oBindingContextMock = this.mock(oBindingContext),
			oBindingMock = this.mock(ListBinding.prototype),
			oContext = Context.create(this.oModel, {}, "/foo"),
			oModelMock = this.mock(this.oModel),
			oTransientBindingContext = {destroy : function () {}},
			oTransientBindingContextMock = this.mock(oTransientBindingContext);

		oBinding.setContext(oContext);
		oBinding.aContexts = [oBindingContext];
		oBinding.aContexts[-1] = oTransientBindingContext;
		oBindingContextMock.expects("destroy").withExactArgs();
		oTransientBindingContextMock.expects("destroy").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();

		oBinding.destroy();

		oBinding = this.oModel.bindList("/absolute", oContext);
		oBinding.aContexts = [oBindingContext];
		oBinding.aContexts[-1] = oTransientBindingContext;
		oBindingContextMock.expects("destroy").withExactArgs();
		oTransientBindingContextMock.expects("destroy").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();

		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("setContext while getContexts() is pending, relative", function (assert) {
		var oBinding = this.oModel.bindList("Equipments", undefined, undefined, undefined, {}),
			oBindingMock = this.mock(oBinding),
			oContext1 = Context.create(this.oModel, {}, "/Employees('1')"),
			oContext2 = Context.create(this.oModel, {}, "/Employees('2')"),
			oReadPromise = Promise.resolve();

		this.stub(oContext1, "getGroupId");
		this.stub(oContext1, "fetchCanonicalPath").returns(_SyncPromise.resolve("Employees('1')"));
		this.stub(oContext2, "fetchCanonicalPath").returns(_SyncPromise.resolve("Employees('2')"));
		oBinding.setContext(oContext1);
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 5, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}); // from setContext
		//TODO: this.mock(oBinding).expects("createContexts").never();
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change}).never();
		oBindingMock.expects("fireDataReceived").withExactArgs();

		//code under test
		oBinding.getContexts(0, 5);
		oBinding.setContext(oContext2);

		return oReadPromise; // wait
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
			var oModel = this.oModel,
				oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')"),
				oBinding  = oModel.bindList("Equipments", oInitialContext),
				oTargetCache = oFixture.sTarget ? {} : undefined,
				oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')");

			function createContext(sType, sPath) {
				if (sType === "base") {
					return oModel.createBindingContext(sPath);
				}
				if (sType === "v4") {
					return Context.create(oModel, null/*oBinding*/, sPath);
				}

				return undefined;
			}

			this.mock(oBinding).expects("makeCache")
				.withExactArgs(sinon.match.same(oTargetContext)).returns(oTargetCache);

			// code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCache, oTargetCache);
		});
	});

	//*********************************************************************************************
	QUnit.test("setContext while getContexts() is pending, absolute", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/Employees('1')"),
			oBinding = this.oModel.bindList("/Teams"),
			oResult = [{}],
			oReadPromise = Promise.resolve(oResult);

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 5, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		//TODO: this.mock(oBinding).expects("createContexts").withExactArgs(sinon.match.same(oResult));
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		this.mock(oBinding).expects("fireDataReceived").withExactArgs();

		//code under test
		oBinding.getContexts(0, 5);
		oBinding.setContext(oContext);

		return oReadPromise; // wait
	});

	//*********************************************************************************************
	QUnit.test("Extended change detection, data read from cache", function (assert) {
		var that = this;

		// Promise used instead of assert.async() because else Sinon restores the mocks immediately
		// after the test function returns, but "fetchDiff" is called later.
		return new Promise(function (resolve, reject) {
			var oBinding,
				oCacheMock = that.getCacheMock(),
				aContexts,
				aData = [{}, {}, {}],
				oDiff = {/*some diff*/},
				oRange = {start : 0, length : 3};

			oBinding = that.oModel.bindList("/EMPLOYEES");
			oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
			that.mock(oBinding).expects("getReadRange")
				.withExactArgs(0, 3, 0)
				.returns(oRange);
			oCacheMock.expects("read")
				.withExactArgs(0, 3, "$auto", undefined, sinon.match.func)
				.callsArg(4)
				.returns(Promise.resolve(aData));
			that.mock(oBinding).expects("fetchDiff")
				.withExactArgs(sinon.match.same(aData), 0, 3)
				.returns(Promise.resolve(oDiff));

			oBinding.attachChange(function (oEvent) {
				assert.strictEqual(oBinding.oDiff, oDiff);

				resolve(); // finish the test
			});

			// code under test
			aContexts = oBinding.getContexts(0, 3);

			assert.strictEqual(aContexts.dataRequested, true);
			assert.deepEqual(aContexts.diff, []);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts() calls fetchValue() and slices", function (assert) {
		var that = this;

		// Promise used instead of assert.async() because else Sinon restores the mocks immediately
		// after the test function returns, but "fetchDiff" is called later.
		// BEWARE: if test times out, mocks are NOT restored :-(
		return new Promise(function (resolve, reject) {
			var aData = createData(10, 0, true), // Note: oRange is ignored here!
				oParentContext = Context.create(that.oModel, {}, "/TEAMS('4711')"),
				oBinding = that.oModel.bindList("EMPLOYEES", oParentContext),
				oRange = {start : 3, length : 2};

			that.mock(oBinding).expects("getReadRange")
				.withExactArgs(oRange.start, oRange.length, 0)
				.returns(oRange);
			that.mock(oParentContext).expects("fetchValue").withExactArgs("EMPLOYEES")
				.returns(_SyncPromise.resolve(aData));
			that.mock(oBinding).expects("fetchDiff")
				.withExactArgs(aData.slice(oRange.start, oRange.start + oRange.length),
					oRange.start, oRange.length)
				.returns(Promise.resolve());

			oBinding.attachChange(resolve); // finish the test

			// code under test
			oBinding.getContexts(oRange.start, oRange.length);
		});
	});

	//*********************************************************************************************
	QUnit.test("Extended change detection, no data read from cache", function (assert) {
		var oBinding,
			aContexts,
			oPreviousDiff = {
				aDiff : [/*some diff*/],
				iLength : 3,
				iStart : 0
			};

		oBinding = this.oModel.bindList("/EMPLOYEES");
		oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
		oBinding.oDiff = oPreviousDiff;
		this.mock(oBinding).expects("getReadRange").never();

		// code under test
		assert.throws(function () {
			aContexts = oBinding.getContexts(0, 6);
		}, new Error("Extended change detection protocol violation: Expected getContexts(0,3), "
			+ "but got getContexts(0,6)"));
		aContexts = oBinding.getContexts(0, 3);

		assert.strictEqual(aContexts.dataRequested, false);
		assert.strictEqual(aContexts.diff, oPreviousDiff.aDiff);
		assert.strictEqual(oBinding.oDiff, undefined);
	});

	//*********************************************************************************************
	QUnit.test("Extended change detection, fetchDiff fails", function (assert) {
		var oBinding,
			oCacheMock = this.getCacheMock(),
			aContexts,
			aData = [{}, {}, {}],
			oError = new Error("Expected"),
			oDiffPromise = Promise.reject(oError),
			oRange = {start : 0, length : 3},
			oReadPromise = Promise.resolve(aData);

		oBinding = this.oModel.bindList("/EMPLOYEES");
		oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
		this.mock(oBinding).expects("getReadRange")
			.withExactArgs(0, 3, 0)
			.returns(oRange);
		oCacheMock.expects("read")
			.withExactArgs(0, 3, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		this.mock(oBinding).expects("fetchDiff")
			.withExactArgs(sinon.match.same(aData), 0, 3)
			.returns(oDiffPromise);
		this.oLogMock.expects("error").withExactArgs(oError.message,
			sinon.match(function (sDetails) {
				return sDetails === oError.stack;
			}), sClassName);

		// code under test
		aContexts = oBinding.getContexts(0, 3);

		assert.strictEqual(aContexts.dataRequested, true);
		return oReadPromise.then(function (aData) {
			return oDiffPromise.then(undefined, function () {
				// return undefined so that test succeeds
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createContexts", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", {}/*oContext*/),
			aContexts = [null, {}, {}, {}],
			oContextMock = this.mock(Context),
			i,
			iResultLength = 3,
			oRange = {start : 1, length : 3};

		this.mock(oBinding.oModel).expects("resolve").twice()
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns("~resolved~");
		for (i = oRange.start; i < oRange.start + iResultLength; i += 1) {
			oContextMock.expects("create")
				.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
					"~resolved~" + "/" + i, i)
				.returns(aContexts[i]);
		}

		// code under test
		assert.strictEqual(oBinding.createContexts(oRange, iResultLength), true);

		for (i = oRange.start; i < oRange.start + iResultLength; i += 1) {
			assert.strictEqual(oBinding.aContexts[i], aContexts[i]);
		}

		// code under test : no second change event
		assert.strictEqual(oBinding.createContexts(oRange, iResultLength), false);
	});

	//*********************************************************************************************
	QUnit.test("createContexts, paging: less data than requested", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", {}/*oContext*/);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 10, "Initial estimated length is 10");

		// code under test: set length and length final flag
		oBinding.createContexts({start : 20, length : 30}, 29);

		assert.strictEqual(oBinding.bLengthFinal, true,
			"some controls use bLengthFinal instead of isLengthFinal()");
		assert.strictEqual(oBinding.getLength(), 49);

		// code under test: delete obsolete contexts
		oBinding.createContexts({start : 20, length : 30}, 17);

		assert.strictEqual(oBinding.isLengthFinal(), true);
		assert.strictEqual(oBinding.getLength(), 37);
		assert.strictEqual(oBinding.aContexts.length, 37);

		// code under test: reset upper boundary
		oBinding.createContexts({start : 20, length : 30}, 30);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, Infinity);

		// code under test: no data for some other page is not a change
		assert.strictEqual(oBinding.createContexts({start : 10000, length : 30}, 0), false);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, 10000);

		// code under test: no data for *next* page is a change (bLengthFinal changes)
		assert.strictEqual(oBinding.createContexts({start : 50, length : 30}, 0), true);
	});

	//*********************************************************************************************
	QUnit.test("createContexts, reuse previous contexts", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", {}/*oContext*/),
			oContext1 = {checkUpdate : function () {}},
			oContext2 = {checkUpdate : function () {}},
			oContext3 = {},
			oContextMock = this.mock(Context),
			mPreviousContextsByPath = {
				"/EMPLOYEES/0" : {destroy : function () {}},
				"/EMPLOYEES/1" : oContext1,
				"/EMPLOYEES/2" : oContext2
			},
			iResultLength = 3,
			oRange = {start : 1, length : 3};

		oBinding.mPreviousContextsByPath = mPreviousContextsByPath;
		this.mock(oContext1).expects("checkUpdate").withExactArgs();
		this.mock(oContext2).expects("checkUpdate").withExactArgs();
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES/3", 3)
			.returns(oContext3);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func).callsArg(0);
		this.mock(mPreviousContextsByPath["/EMPLOYEES/0"]).expects("destroy").withExactArgs();

		// code under test
		oBinding.createContexts(oRange, iResultLength);

		assert.strictEqual(oBinding.aContexts[1], oContext1);
		assert.strictEqual(oBinding.aContexts[2], oContext2);
		assert.strictEqual(oBinding.aContexts[3], oContext3);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
	});

	//*********************************************************************************************
	QUnit.test("createContexts, no prerendering task if no previous contexts", function (assert) {
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask").never();

		// code under test
		this.oModel.bindList("/EMPLOYEES", {}).createContexts({start : 1, length : 1}, 0);
	});

	//*********************************************************************************************
	QUnit.test("enableExtendedChangeDetection", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			bDetectUpdates = true;

		assert.throws(function () {
			// code under test : disallow key
			oBinding.enableExtendedChangeDetection(bDetectUpdates, "ID");
		}, new Error("Unsupported property 'key' with value 'ID' in binding info for "
				+ "sap.ui.model.odata.v4.ODataListBinding: /EMPLOYEES"));

		this.mock(ListBinding.prototype).expects("enableExtendedChangeDetection").on(oBinding)
			.withExactArgs(bDetectUpdates)
			.returns("foo");

		// code under test
		assert.strictEqual(oBinding.enableExtendedChangeDetection(bDetectUpdates), "foo");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bUseExtendedChangeDetection) {
		QUnit.test("_delete: success, bUseExtendedChangeDetection = " + bUseExtendedChangeDetection,
			function (assert) {
				var oBinding = this.oModel.bindList("/EMPLOYEES"),
					aPreviousContexts,
					oPromise = {};

				oBinding.bUseExtendedChangeDetection = bUseExtendedChangeDetection;
				// [0, 1, 2, undefined, 4, 5]
				oBinding.createContexts({start : 0, length : 3}, 3);
				oBinding.createContexts({start : 4, length : 10}, 2);
				assert.strictEqual(oBinding.iMaxLength, 6);
				aPreviousContexts = oBinding.aContexts.slice();

				this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(false);
				// We assume that we start deleting index 2, but when the response arrives, it has
				// been moved to index 1.
				this.mock(oBinding).expects("deleteFromCache")
					.withExactArgs("myGroup", "EMPLOYEES('1')", "2", sinon.match.func)
					.callsArgWith(3, 1)
					.returns(oPromise);
				this.mock(oBinding).expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Remove});
				this.mock(oBinding.aContexts[2]).expects("destroy").never();
				this.mock(oBinding.aContexts[5]).expects("destroy").never();
				if (!bUseExtendedChangeDetection) {
					this.mock(oBinding.aContexts[1]).expects("checkUpdate").withExactArgs();
					this.mock(oBinding.aContexts[4]).expects("checkUpdate").withExactArgs();
				}

				// code under test
				assert.strictEqual(
					oBinding._delete("myGroup", "EMPLOYEES('1')", oBinding.aContexts[2]),
					oPromise);

				assert.strictEqual(oBinding.aContexts.length, 5);
				assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
				assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
				assert.notOk(2 in oBinding.aContexts);
				assert.strictEqual(oBinding.aContexts[3].getIndex(), 3);
				assert.strictEqual(oBinding.aContexts[3].getPath(), "/EMPLOYEES/3");
				assert.strictEqual(oBinding.aContexts[4], aPreviousContexts[4]);
				assert.strictEqual(oBinding.aContexts.length, 5);
				assert.strictEqual(oBinding.iMaxLength, 5);
				assert.strictEqual(oBinding.mPreviousContextsByPath[aPreviousContexts[2].getPath()],
					aPreviousContexts[2]);
				assert.strictEqual(oBinding.mPreviousContextsByPath[aPreviousContexts[5].getPath()],
					aPreviousContexts[5]);
		});
	});
	// TODO check the row of a pending update with higher index
	// TODO _delete uses previous contexts and does not create new contexts

	//*********************************************************************************************
	QUnit.test("_delete: pending changes", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext = {isTransient : function () {return false;}};

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
		this.mock(oBinding).expects("deleteFromCache").never();
		this.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding._delete("myGroup", "EMPLOYEES('1')", oContext);
		}, new Error("Cannot delete due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("_delete: transient context that has been persisted", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(this.oModel, oBinding, "/EMPLOYEES/-1", -1),
			oContextMock = this.mock(oContext),
			oExpectation;

		// simulate created entity which is already persisted
		oBinding.aContexts[-1] = oContext;
		oContextMock.expects("isTransient").returns(false);
		oBindingMock.expects("hasPendingChanges").returns(false);

		oExpectation = oBindingMock.expects("deleteFromCache")
			.withExactArgs("myGroup", "EMPLOYEES('1')", "-1", sinon.match.func);

		// code under test
		oBinding._delete("myGroup", "EMPLOYEES('1')", oContext);

		assert.strictEqual(oBinding.aContexts[-1], oContext, "Element at -1 still available");

		// test callback of deleteFromCache
		oContextMock.expects("destroy").withExactArgs();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});

		// code under test
		oExpectation.args[0][3](-1); // call fnCallback

		assert.notOk(-1 in oBinding.aContexts, "Element at -1 removed");
	});

	//*********************************************************************************************
	["$auto", undefined].forEach(function (sGroupId) {
		QUnit.test("deleteFromCache(" + sGroupId + ") : binding w/ cache", function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				fnCallback = {},
				oPromise = {};

			this.mock(oBinding).expects("getUpdateGroupId").exactly(sGroupId ? 0 : 1)
				.withExactArgs().returns("$auto");
			this.mock(oBinding.oCache).expects("_delete")
				.withExactArgs("$auto", "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					sinon.match.same(fnCallback))
				.returns(oPromise);

			assert.strictEqual(
				oBinding.deleteFromCache(sGroupId, "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					fnCallback),
				oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: binding w/o cache", function (assert) {
		var oParentBinding = {
				deleteFromCache : function () {}
			},
			fnCallback = {},
			oContext = Context.create(this.oModel, oParentBinding, "/TEAMS/42", 42),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext),
			oPromise = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "TEAM_2_EMPLOYEES", "1/EMPLOYEE_2_EQUIPMENTS/3")
			.returns("~");
		this.mock(oParentBinding).expects("deleteFromCache")
			.withExactArgs("$auto", "EQUIPMENTS('3')", "~", sinon.match.same(fnCallback))
			.returns(oPromise);

		assert.strictEqual(
			oBinding.deleteFromCache("$auto", "EQUIPMENTS('3')", "1/EMPLOYEE_2_EQUIPMENTS/3",
				fnCallback),
			oPromise);
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: illegal group ID", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			fnCallback = {};

		assert.throws(function () {
			oBinding.deleteFromCache("myGroup");
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding).expects("getUpdateGroupId").returns("myGroup");

		assert.throws(function () {
			oBinding.deleteFromCache();
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding.oCache).expects("_delete")
			.withExactArgs("$direct", "EMPLOYEES('1')", "42", sinon.match.same(fnCallback))
			.returns(Promise.resolve());

		return oBinding.deleteFromCache("$direct", "EMPLOYEES('1')", "42", fnCallback).then();
	});

	//*********************************************************************************************
	QUnit.test("create: cancel callback", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", null, null, null,
				{$$updateGroupId : "update"}),
			oContext,
			oExpectation,
			oInitialData = {};

		oExpectation = this.mock(oBinding.oCache).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", sinon.match.same(oInitialData),
				sinon.match.func, sinon.match.func)
			// we only want to observe fnCancelCallback, hence we neither resolve, nor reject
			.returns(new Promise(function () {}));

		// code under test
		oContext = oBinding.create(oInitialData);

		assert.strictEqual(oBinding.aContexts[-1], oContext, "Transient context");

		this.mock(oContext).expects("destroy").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});

		// code under test
		oExpectation.args[0][4](); // call fnCancelCallback to simulate cancellation

		assert.notOk(-1 in oBinding.aContexts);
	});

	//*********************************************************************************************
	QUnit.test("create: error callback", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oError = new Error(),
			oExpectation,
			oInitialData = {};

		this.mock(oBinding).expects("getUpdateGroupId").returns("update");

		oExpectation = this.mock(oBinding.oCache).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", sinon.match.same(oInitialData),
				/*fnCancelCallback*/sinon.match.func, /*fnErrorCallback*/sinon.match.func)
			// we only want to observe fnErrorCallback, hence we neither resolve, nor reject
			.returns(new Promise(function () {}));

		// code under test
		oBinding.create(oInitialData);

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"POST on 'EMPLOYEES' failed; will be repeated automatically",
			sClassName, sinon.match.same(oError));

		// code under test
		oExpectation.args[0][5](oError); // call fnErrorCallback to simulate error
	});

	//*********************************************************************************************
	[{
		sTitle : "create: absolute",
		sUpdateGroupId : "update"
	}, {
		oInitialData : {},
		sTitle : "create: absolute, with initial data",
		sUpdateGroupId : "$direct"
	}, {
		bRelative : true,
		sTitle : "create: relative with base context",
		sUpdateGroupId : "$auto"
	}].forEach(function (oFixture) {
		QUnit.test(oFixture.sTitle, function (assert) {
			var oBinding,
				oBindingContext = this.oModel.createBindingContext("/"),
				oCacheMock,
				bChangeFired,
				oContext,
				oExpectation;

			if (oFixture.bRelative) {
				oExpectation = this.mock(ODataListBinding.prototype).expects("makeCache")
					.withExactArgs(oBindingContext)
					.returns(_Cache.create(this.oModel.oRequestor, "EMPLOYEES", {}));
				oBinding = this.oModel.bindList("EMPLOYEES", oBindingContext);
				sinon.assert.calledOn(oExpectation, oBinding);
			} else {
				oBinding = this.oModel.bindList("/EMPLOYEES");
			}
			oCacheMock = this.mock(oBinding.oCache);
			this.mock(oBinding).expects("getUpdateGroupId").returns(oFixture.sUpdateGroupId);
			oCacheMock.expects("create")
				.withExactArgs(oFixture.sUpdateGroupId, "EMPLOYEES", "",
					sinon.match.same(oFixture.oInitialData), sinon.match.func, sinon.match.func)
				.returns(Promise.resolve());
			oBinding.attachEventOnce("change", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Add);
				assert.ok(oBinding.aContexts[-1], "transient context exists");
				bChangeFired = true;
			});

			// code under test
			oContext = oBinding.create(oFixture.oInitialData);

			assert.strictEqual(oContext.getModel(), this.oModel);
			assert.strictEqual(oContext.getBinding(), oBinding);
			assert.strictEqual(oContext.getPath(), "/EMPLOYEES/-1");
			assert.strictEqual(oContext.getIndex(), 0, "view coordinates!");
			assert.strictEqual(oContext.isTransient(), true);
			assert.strictEqual(oBinding.aContexts[-1], oContext, "Transient context");
			assert.ok(bChangeFired, "Change event fired");

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(true);

			// code under test
			oBinding.hasPendingChanges();

			assert.throws(function () {
				// code under test
				oBinding.create();
			}, new Error("Must not create twice"));

			return oContext.created().then(function () {
				assert.strictEqual(oContext.isTransient(), false);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("create: relative", function (assert) {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES");

		//code under test
		assert.throws(function () {
			oBinding.create();
		}, new Error("Create on this binding is not supported"));
	});
	// TODO allow relative binding, use createInCache to forward to the binding owning a cache

	//*********************************************************************************************
	QUnit.test("getContexts after create", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$updateGroupId : "update"
			}),
			oCacheMock = this.mock(oBinding.oCache),
			oContext,
			aContexts;

		oBinding.createContexts({length : 3, start : 0}, 3);

		this.mock(oBinding.oCache).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", undefined, sinon.match.func, sinon.match.func)
			.returns(Promise.resolve());
		oContext = oBinding.create();

		oCacheMock.expects("read")
			.withExactArgs(-1, 1, "$auto", undefined, sinon.match.func)
			.returns(_SyncPromise.resolve({value : [{}]}));

		// code under test
		aContexts = oBinding.getContexts(0, 1);

		assert.strictEqual(aContexts.length, 1);
		assert.strictEqual(aContexts[0], oContext);
		assert.deepEqual(aContexts, oBinding.getCurrentContexts());

		oCacheMock.expects("read")
			.withExactArgs(-1, 3, "$auto", undefined, sinon.match.func)
			.returns(_SyncPromise.resolve({value : [{}, {}, {}]}));

		// code under test
		aContexts = oBinding.getContexts(0, 3);
		assert.strictEqual(aContexts.length, 3);
		assert.strictEqual(aContexts[0], oContext);
		assert.strictEqual(aContexts[1].getPath(), "/EMPLOYEES/0");
		assert.strictEqual(aContexts[2].getPath(), "/EMPLOYEES/1");
		assert.deepEqual(aContexts, oBinding.getCurrentContexts());

		oCacheMock.expects("read")
			.withExactArgs(0, 2, "$auto", undefined, sinon.match.func)
			.returns(_SyncPromise.resolve({value : [{}, {}]}));

		// code under test
		aContexts = oBinding.getContexts(1, 2);
		assert.strictEqual(aContexts.length, 2);
		assert.strictEqual(aContexts[0].getPath(), "/EMPLOYEES/0");
		assert.strictEqual(aContexts[1].getPath(), "/EMPLOYEES/1");
		assert.deepEqual(aContexts, oBinding.getCurrentContexts());
	});

	//*********************************************************************************************
	QUnit.test("getContexts after create, extended change detection", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$updateGroupId : "update"
			}),
			oCacheMock = this.mock(oBinding.oCache),
			oContext,
			aContexts,
			oDiff = {aDiff : [/*some diff*/], iLength : 3},
			oResult = {value : [{}, {}, {}]};

		oBinding.enableExtendedChangeDetection(false);
		oBinding.createContexts({length : 3, start : 0}, 3);

		this.mock(oBinding.oCache).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", undefined, sinon.match.func, sinon.match.func)
			.returns(Promise.resolve());
		oContext = oBinding.create();

		oCacheMock.expects("read")
			.withExactArgs(-1, 3, "$auto", undefined, sinon.match.func)
			.returns(_SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("fetchDiff")
			.withExactArgs(oResult.value, 0, 3)
			.returns(_SyncPromise.resolve(oDiff));

		// code under test
		aContexts = oBinding.getContexts(0, 3);
		assert.strictEqual(aContexts.length, 3);
		assert.strictEqual(aContexts[0], oContext);
		assert.strictEqual(aContexts[1].getPath(), "/EMPLOYEES/0");
		assert.strictEqual(aContexts[2].getPath(), "/EMPLOYEES/1");
		assert.strictEqual(aContexts.diff, oDiff.aDiff);
	});

	//*********************************************************************************************
	QUnit.test("delete transient entity", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts({length : 4, start : 0}, 3);

		// remove request mock, all operations on client
		oBinding.oCache.oRequestor.request.restore();

		oBinding.attachEventOnce("change", function (oEvent) { // change after create
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Add, "ADD event");

			oBinding.attachEventOnce("change", function (oEvent) { // change after delete
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Remove,
					"REMOVE event");
				assert.notOk(-1 in oBinding.aContexts);
				assert.strictEqual(oBinding.getLength(), 3);
			});
		});
		this.mock(oBinding).expects("getUpdateGroupId").returns("update");

		oContext = oBinding.create();
		assert.strictEqual(oBinding.getLength(), 4);

		// avoid "pause on uncaught exception"
		oContext.created().catch(function (oError) {
			assert.ok(oError.canceled, "create promise rejected with 'canceled'");
		});
		this.mock(oContext).expects("destroy").withExactArgs();

		// code under test
		return oContext["delete"]("$direct").then(function () {
			assert.notOk(-1 in oBinding.aContexts, "No transient context");
			assert.strictEqual(oBinding.getLength(), 3);
		});
	});
	// TODO delete created entity (index -1, but not transient)

	//*********************************************************************************************
	[
		{sPath : "/Employees"}, // absolute binding
		{sPath : "TEAM_2_MANAGER"}, // relative binding without context
		{sPath : "/Employees(ID='1')", oContext : {}} // absolute binding with context (edge case)
	].forEach(function (oFixture) {
		QUnit.test("checkUpdate: absolute binding or relative binding without context"
				+ JSON.stringify(oFixture),
			function (assert) {
				var oBinding = this.oModel.bindList(oFixture.sPath, oFixture.oContext),
					oDependent0 = {checkUpdate : function () {}},
					oDependent1 = {checkUpdate : function () {}};

				this.mock(oBinding).expects("_fireChange")
					.withExactArgs({reason: ChangeReason.Change});
				this.mock(oBinding.oModel).expects("getDependentBindings")
					.withExactArgs(sinon.match.same(oBinding))
					.returns([oDependent0, oDependent1]);
				this.mock(oDependent0).expects("checkUpdate").withExactArgs();
				this.mock(oDependent1).expects("checkUpdate").withExactArgs();

				// code under test
				oBinding.checkUpdate();

				assert.throws(function () {
					// code under test
					oBinding.checkUpdate(true);
				}, new Error("Unsupported operation: v4.ODataListBinding#checkUpdate "
					+ "must not be called with parameters"));

			}
		);
	});
	//TODO fire change event only if the binding's length changed, i.e. if getContexts will provide
	//  a different result compared to the previous call

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with standard context", function (assert) {
		var oBinding = this.oModel.bindList("TEAM_2_MANAGER",
				this.oModel.createBindingContext("/TEAMS('4711')")),
			oDependent0 = {checkUpdate : function () {}},
			oDependent1 = {checkUpdate : function () {}};

		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason: ChangeReason.Change});
		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("checkUpdate").withExactArgs();
		this.mock(oDependent1).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.checkUpdate();
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with cache, parent binding data has changed",
			function (assert) {
		var oBinding,
			oCacheTeam1 = {$canonicalPath : "/TEAMS('4711')/TEAM_2_EMPLOYEES"},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1),
			oPathPromise = Promise.resolve("/TEAMS('8192')/TEAM_2_EMPLOYEES");

		this.mock(ODataListBinding.prototype).expects("makeCache").returns(oCacheTeam1);
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$select : "Name"});

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise)); // data for path "/TEAMS/1" has changed
		this.mock(oBinding).expects("refreshInternal").withExactArgs();

		// code under test
		oBinding.checkUpdate();

		return oPathPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with cache, parent binding not changed",
			function (assert) {
		var oBinding,
			sPath = "/TEAMS('4711')/TEAM_2_EMPLOYEES",
			oCacheTeam1 = {$canonicalPath : sPath},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1),
			oDependent0 = {checkUpdate : function () {}},
			oDependent1 = {checkUpdate : function () {}},
			oPathPromise = Promise.resolve(sPath);

		this.mock(ODataListBinding.prototype).expects("makeCache").returns(oCacheTeam1);
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$select : "Name"});

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise));
		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("checkUpdate").withExactArgs();
		this.mock(oDependent1).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.checkUpdate();

		return oPathPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: error handling", function (assert) {
		var oBinding,
			oCacheTeam1 = {$canonicalPath : "/TEAMS('4711')/TEAM_2_EMPLOYEES"},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1),
			oError = {},
			oPathPromise = Promise.reject(oError);

		this.mock(ODataListBinding.prototype).expects("makeCache").returns(oCacheTeam1);
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$select : "Name"});
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise));
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to update " +
					"sap.ui.model.odata.v4.ODataListBinding: /TEAMS[1]|TEAM_2_EMPLOYEES",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.checkUpdate();

		return oPathPromise.then(undefined, function () {});
	});

	//*********************************************************************************************
	[{
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server, $orderby : "GrossAmount"}
	}, {
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server, $orderby : "GrossAmount"},
		mInheritedQueryOptions : {$filter : "foo eq 'bar'", $orderby : "GrossAmount"}
	}, {
		bRelative : true,
		mQueryOptions : {$filter : "foo eq 'bar'", $$operationMode : OperationMode.Server},
		mInheritedQueryOptions : {$filter : "foo eq 'bar'", $orderby : "GrossAmount"}
	}, {
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server},
		aSorters : [{}]
	}, {
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server},
		aApplicationFilters : [{}]
	}, {
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server},
		aFilters : [{}]
	}, {
		bRelative : false,
		mQueryOptions : {$filter : "foo eq 'bar'", $$operationMode : OperationMode.Server}
	}, {
		bRelative : false,
		mQueryOptions : {$$operationMode : OperationMode.Server},
		aApplicationFilters : [{}]
	}, {
		bRelative : true,
		mQueryOptions : {$$operationMode : OperationMode.Server},
		bBaseContext : true
	}].forEach(function (oFixture) {
		QUnit.test("makeCache:" + JSON.stringify(oFixture), function (assert) {
			var sCanonicalPath = "/SalesOrderList('1')",
				sCachePath = sCanonicalPath.slice(1) + "/SO_2_SOITEMS",
				oBinding = this.oModel.bindList(
					oFixture.bRelative ? "SO_2_SOITEMS" : "/" + sCachePath,
					undefined, // oContext is not used in makeCache
					oFixture.aSorters || [],
					oFixture.aFilters || [],
					oFixture.mQueryOptions),
				oCache = {read : function () { return Promise.resolve(); }},
				oContext = oFixture.bBaseContext
					? { getPath : function () { return sCanonicalPath; } }
					: { fetchCanonicalPath : function () {} },
				bFilter = oFixture.aApplicationFilters || oFixture.aFilters,
				sFilter = bFilter ? "field eq 'value'" : undefined,
				oFilterPromise = bFilter ? Promise.resolve(sFilter) : undefined,
				mMergedQueryOptions = {},
				sOrderBy = "BuyerName,GrossAmount",
				mQueryOptions = oFixture.mInheritedQueryOptions || oFixture.mQueryOptions,
				oPathPromise = oFixture.bRelative ? Promise.resolve(sCanonicalPath) : undefined;

			if (!oFixture.bBaseContext) {
				this.mock(oContext).expects("fetchCanonicalPath")
					.exactly(oFixture.bRelative ? 1 : 0)
					.withExactArgs().returns(oPathPromise);
			}
			this.mock(_ODataHelper).expects("getQueryOptions")
				.withExactArgs(sinon.match.same(oBinding), "",
					sinon.match.same(oFixture.bRelative ? oContext : undefined))
				.returns(mQueryOptions);
			this.mock(oBinding).expects("fetchFilter")
				.withExactArgs(sinon.match.same(oFixture.bRelative ? oContext : undefined),
					sinon.match.same(oBinding.aApplicationFilters),
					sinon.match.same(oBinding.aFilters),
					mQueryOptions && mQueryOptions.$filter)
				.returns(oFilterPromise);
			this.mock(oBinding).expects("buildOrderbyOption")
				.withExactArgs(sinon.match.same(oBinding.aSorters),
						mQueryOptions && mQueryOptions.$orderby)
				.returns(sOrderBy);
			this.mock(oBinding).expects("mergeQueryOptions")
				.withExactArgs(sinon.match.same(mQueryOptions), sOrderBy, sFilter)
				.returns(mMergedQueryOptions);
			this.mock(_Helper).expects("buildPath")
				.withExactArgs(oFixture.bRelative ? sCanonicalPath : undefined, oBinding.sPath)
				.returns("/" + sCachePath);
			this.mock(_Cache).expects("create")
				.withExactArgs(sinon.match.same(oBinding.oModel.oRequestor), sCachePath,
					sinon.match.same(mMergedQueryOptions))
				.returns(oCache);

			// code under test
			assert.strictEqual(oBinding.makeCache(oContext), oBinding.oCache);

			if (oFixture.bBaseContext) {
				assert.strictEqual(oBinding.oCache, oCache);
				return undefined;
			}
			return oBinding.oCache.read().then(function () {
				assert.strictEqual(oBinding.oCache, oCache);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("makeCache, nothing to do", function (assert) {
		var oContext = {fetchCanonicalPath : function () {}},
			oBinding = this.oModel.bindList("EMPLOYEES", oContext, undefined, undefined, undefined);

		this.mock(_ODataHelper).expects("createCache").never();

		// code under test
		assert.strictEqual(oBinding.makeCache(undefined), undefined,
			"unresolved relative binding");

		oBinding.aSorters = [];
		oBinding.aApplicationFilters = [];
		oBinding.aFilters = [];

		// code under test
		assert.strictEqual(oBinding.makeCache(oContext), undefined,
			"resolved relative binding, but no sorter");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAsync) {
		QUnit.test("fetchDiff, " + (bAsync ? "a" : "") + "synchronous", function (assert) {
			var oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS",
					Context.create(this.oModel, {}, "/Employees")),
				aDiff = [/*some diff*/],
				oDiffPromise,
				aKeys = ["Category", "ID"],
				oKeyPromise = _SyncPromise.resolve(bAsync ? Promise.resolve(aKeys) : aKeys),
				oMetaContext = {},
				oMetaModel = {
					fetchObject : function () {},
					getMetaContext : function () {}
				},
				oMetaModelMock = this.mock(oMetaModel),
				aNewData = [{"Category" : "C0", "ID" : "ID0"}, {"Category" : "C2", "ID" : "ID2"}],
				aResult = [{"Category" : "C0", "ID" : "ID0", "Name" : "Name0"},
					{"Category" : "C2", "ID" : "ID2", "Name" : "Name2"}];

			oBinding.enableExtendedChangeDetection(false);
			oBinding.aPreviousData = [{"Category" : "C0", "ID" : "ID0"},
				{"Category" : "C1", "ID" : "ID1"}];

			this.mock(oBinding.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
				.returns("~");
			oMetaModelMock.expects("getMetaContext").withExactArgs("~")
				.returns(oMetaContext);
			oMetaModelMock.expects("fetchObject").withExactArgs("$Type/$Key", oMetaContext)
				.returns(oKeyPromise);
			this.mock(jQuery.sap).expects("arraySymbolDiff")
				.withExactArgs(sinon.match.same(oBinding.aPreviousData), aNewData)
				.returns(aDiff);

			// code under test
			oDiffPromise = oBinding.fetchDiff(aResult, 0, 2);

			assert.strictEqual(oDiffPromise.isFulfilled(), !bAsync);
			return oDiffPromise.then(function (oResult) {
				assert.deepEqual(oBinding.aPreviousData, aNewData);
				assert.deepEqual(oResult, {aDiff : aDiff, iLength : 2});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchDiff, no data available", function (assert) {
		var aPreviousData = [],
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			oDiffPromise;

		oBinding.enableExtendedChangeDetection(false);
		oBinding.aPreviousData = aPreviousData;

		// code under test
		oDiffPromise = oBinding.fetchDiff(undefined, 0, 100);

		assert.strictEqual(oBinding.aPreviousData, aPreviousData);
		assert.deepEqual(oDiffPromise.getResult(), {iLength : 100, aDiff : []});
	});

	//*********************************************************************************************
	QUnit.test("fetchDiff, no extended change detection", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oDiffPromise;

		// code under test
		oDiffPromise = oBinding.fetchDiff([], 23, 42);

		assert.deepEqual(oDiffPromise.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchDiff, result is shorter", function (assert) {
		var aPreviousData = [{"ID" : "ID0a"}, {"ID" : "ID1a"}],
			oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS",
					Context.create(this.oModel, {}, "/EMPLOYEES")),
			aDiff = [/*some diff*/],
			oKeyPromise = _SyncPromise.resolve(["ID"]),
			oMetaContext = {},
			oMetaModel = {
				fetchObject : function () {},
				getMetaContext : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			aNewData = [{"ID" : "ID0"}],
			aResult = [{"ID" : "ID0", "Name" : "N0"}];

		oBinding.enableExtendedChangeDetection(false);
		oBinding.aPreviousData = aPreviousData.slice();

		this.mock(oBinding.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns("~");
		oMetaModelMock.expects("getMetaContext").withExactArgs("~")
			.returns(oMetaContext);
		oMetaModelMock.expects("fetchObject").withExactArgs("$Type/$Key", oMetaContext)
			.returns(oKeyPromise);
		this.mock(jQuery.sap).expects("arraySymbolDiff")
			.withExactArgs(aPreviousData, aNewData)
			.returns(aDiff);

		// code under test
		return oBinding.fetchDiff(aResult, 0, 2).then(function (oResult) {
			assert.deepEqual(oBinding.aPreviousData, [{"ID" : "ID0"}]);
			assert.deepEqual(oResult, {aDiff : aDiff, iLength : 2});
		});
	});

	//*********************************************************************************************
	[
		{keys : ["Category", "ID", "OtherID"], logDetails : "Missing key(s): ID,OtherID"},
		{keys : undefined, logDetails : "Type for path ~ has no keys"}
	].forEach(function (oFixture) {
		QUnit.test("fetchDiff, error: keys missing", function (assert) {
			var oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS",
					Context.create(this.oModel, {}, "/EMPLOYEES")),
				oKeyPromise = Promise.resolve(oFixture.keys),
				oMetaContext = {},
				oMetaModelMock = this.mock(this.oModel.getMetaModel()),
				aResult = [{"Category" : "C1", /*"ID" : "ID1",*/"Name" : "N1"},
					{"Category" : "C2", /*"ID" : "ID2",*/"Name" : "N2"}];

			oBinding.enableExtendedChangeDetection(false);
			oBinding.aPreviousData = [{"Category" : "C0", "ID" : "ID0"},
				{"Category" : "C1a", "ID" : "ID1a"}];

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
				.returns("~");
			oMetaModelMock.expects("getMetaContext").withExactArgs("~")
				.returns(oMetaContext);
			oMetaModelMock.expects("fetchObject").withExactArgs("$Type/$Key", oMetaContext)
				.returns(oKeyPromise);
			this.oLogMock.expects("warning").withExactArgs(
					"Disable extended change detection as diff computation failed: " + oBinding,
					oFixture.logDetails, "sap.ui.model.odata.v4.ODataListBinding");

			// code under test
			return oBinding.fetchDiff(aResult, 0, 2).then(function (oResult) {
				assert.deepEqual(oBinding.aPreviousData, []);
				assert.strictEqual(oResult, undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchDiff, bDetectUpdates=true", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			aDiff = [/*some diff*/],
			oDiffPromise,
			oJSONMock = this.mock(JSON),
			aResult = [{}, {}];

		oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/true);
		oBinding.aPreviousData = ["s0 previous", "s1 previous"];

		oJSONMock.expects("stringify").withExactArgs(aResult[0]).returns("s0 new");
		oJSONMock.expects("stringify").withExactArgs(aResult[1]).returns("s1 new");
		this.mock(jQuery.sap).expects("arraySymbolDiff")
			.withExactArgs(sinon.match.same(oBinding.aPreviousData), ["s0 new", "s1 new"])
			.returns(aDiff);

		// code under test
		oDiffPromise = oBinding.fetchDiff(aResult, 0, 2);

		assert.deepEqual(oBinding.aPreviousData, ["s0 new", "s1 new"]);
		assert.deepEqual(oDiffPromise.getResult(), {aDiff : aDiff, iLength : 2});
	});

	//*********************************************************************************************
	[
		{op : FilterOperator.BT, result : "SupplierName ge 'SAP' and SupplierName le 'XYZ'"},
		{op : FilterOperator.EQ, result : "SupplierName eq 'SAP'"},
		{op : FilterOperator.GE, result : "SupplierName ge 'SAP'"},
		{op : FilterOperator.GT, result : "SupplierName gt 'SAP'"},
		{op : FilterOperator.LE, result : "SupplierName le 'SAP'"},
		{op : FilterOperator.LT, result : "SupplierName lt 'SAP'"},
		{op : FilterOperator.NE, result : "SupplierName ne 'SAP'"},
		{op : FilterOperator.Contains, result : "contains(SupplierName,'SAP')"},
		{op : FilterOperator.EndsWith, result : "endswith(SupplierName,'SAP')"},
		{op : FilterOperator.StartsWith, result : "startswith(SupplierName,'SAP')"}
	].forEach(function (oFixture) {
		QUnit.test("fetchFilter: " + oFixture.op + " --> " + oFixture.result, function (assert) {
			var oBinding = this.oModel.bindList("/SalesOrderList('4711')/SO_2_ITEMS"),
				oFilter = new Filter("SupplierName", oFixture.op, "SAP", "XYZ"),
				oMetaContext = {},
				oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
				oHelperMock = this.mock(_Helper),
				oPropertyMetadata = {$Type : "Edm.String"};

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
			oMetaModelMock.expects("getMetaContext")
				.withExactArgs(oBinding.sPath).returns(oMetaContext);
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("SupplierName", oMetaContext)
				.returns(_SyncPromise.resolve(oPropertyMetadata));
			oHelperMock.expects("formatLiteral").withExactArgs("SAP", "Edm.String")
				.returns("'SAP'");
			if (oFixture.op === FilterOperator.BT) {
				oHelperMock.expects("formatLiteral").withExactArgs("XYZ", "Edm.String")
					.returns("'XYZ'");
			}

			assert.strictEqual(
				oBinding.fetchFilter(undefined, [oFilter], [], undefined).getResult(),
				oFixture.result);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("fetchFilter: dynamic and static filters, "
				+ (bRelative ? "relative" : "absolute") + " binding", function (assert) {
			var oBinding = this.oModel.bindList(bRelative ? "BP_2_SO" : "/SalesOrderList"),
				oContext = Context.create(this.oModel, {}, "/BusinessPartnerList"),
				oFilter0 = new Filter("BuyerName", FilterOperator.EQ, "SAP"),
				oFilter1 = new Filter("GrossAmount", FilterOperator.LE, 12345),
				oHelperMock = this.mock(_Helper),
				oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
				sResolvedPath =
					bRelative ? "/BusinessPartnerList('42')/BP_2_SO" : "/SalesOrderList";

			this.mock(oBinding.oModel).expects("resolve").twice()
				.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
				.returns(sResolvedPath);
			oMetaModelMock.expects("getMetaContext").twice()
				.withExactArgs(sResolvedPath).returns("~");
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("BuyerName", "~")
				.returns(_SyncPromise.resolve({$Type : "Edm.String"}));
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("GrossAmount", "~")
				.returns(_SyncPromise.resolve({$Type : "Edm.Decimal"}));
			oHelperMock.expects("formatLiteral").withExactArgs("SAP", "Edm.String")
				.returns("'SAP'");
			oHelperMock.expects("formatLiteral").withExactArgs(12345, "Edm.Decimal")
				.returns(12345);

			assert.strictEqual(
				oBinding.fetchFilter(oContext, [oFilter0, oFilter1], [],
					"GrossAmount ge 1000").getResult(),
				"(BuyerName eq 'SAP' and GrossAmount le 12345) and (GrossAmount ge 1000)");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: static filter only", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList");

		assert.strictEqual(
			oBinding.fetchFilter(undefined, [], [], "GrossAmount ge 1000").getResult(),
			"GrossAmount ge 1000");
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error invalid operator", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			oFilter = new Filter("BuyerName", "invalid", "SAP"),
			oPropertyMetadata = {$Type : "Edm.String"};

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
		this.mock(oBinding.oModel.oMetaModel).expects("getMetaContext")
			.withExactArgs(oBinding.sPath).returns("~");
		this.mock(oBinding.oModel.oMetaModel).expects("fetchObject")
			.withExactArgs("BuyerName", "~")
			.returns(_SyncPromise.resolve(oPropertyMetadata));
		this.mock(_Helper).expects("formatLiteral").withExactArgs("SAP", "Edm.String")
			.returns("'SAP'");

		return oBinding.fetchFilter(undefined, [oFilter], [], undefined).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Unsupported operator: invalid");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error no metadata for filter path", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			oFilter = new Filter("BuyerName", FilterOperator.EQ, "SAP"),
			sPath = "/SalesOrderList/BuyerName",
			oMetaContext = {
				getPath : function () { return sPath; }
			};

		this.mock(oBinding.oModel.oMetaModel).expects("getMetaContext")
			.withExactArgs(oBinding.sPath).returns(oMetaContext);
		this.mock(oBinding.oModel.oMetaModel).expects("fetchObject")
			.withExactArgs("BuyerName", sinon.match.same(oMetaContext))
			.returns(_SyncPromise.resolve(undefined));

		return oBinding.fetchFilter(undefined, [oFilter], [], undefined).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message,
				"Type cannot be determined, no metadata for path: /SalesOrderList/BuyerName");
		});
	});

	//*********************************************************************************************
	[
		{ filters : [], result : "" },
		{ filters : ["path0", "path1"], result : "path0 eq path0Value and path1 eq path1Value" },
		{ // "grouping": or conjunction for filters with same path
			filters : [{ p : "path0", v : "foo" }, "path1", { p : "path0", v : "bar" }],
			result : "(path0 eq foo or path0 eq bar) and path1 eq path1Value"
		}
	].forEach(function (oFixture) {
		QUnit.test("fetchFilter: flat filter '" + oFixture.result + "'", function (assert) {
			var oBinding = this.oModel.bindList("/SalesOrderList"),
				aFilters = [],
				oHelperMock = this.mock(_Helper),
				oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
				mRequestObjectByPath = {},
				oPropertyMetadata = {$Type : "Edm.Type"};

			oFixture.filters.forEach(function (vFilter) {
				var sPath,
					sValue;

				if (typeof vFilter === "string") { // single filter: path only
					sPath = vFilter; sValue = sPath + "Value";
				} else { // single filter: path and value
					sPath = vFilter.p; sValue = vFilter.v;
				}

				aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue));
				if (!mRequestObjectByPath[sPath]) { // Edm type request happens only once per path
					mRequestObjectByPath[sPath] = true;
					oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath)
						.returns("~");
					oMetaModelMock.expects("fetchObject")
						.withExactArgs(sPath, "~")
						.returns(Promise.resolve(oPropertyMetadata));
				}
				oHelperMock.expects("formatLiteral").withExactArgs(sValue, "Edm.Type")
					.returns(sValue);
			});

			return oBinding.fetchFilter(undefined, aFilters, [], undefined)
				.then(function (sFilterValue) {
					assert.strictEqual(sFilterValue, oFixture.result);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: hierarchical filter", function (assert) {
		var oBinding = this.oModel.bindList("/Set"),
			oFilterPromise,
			aFilters = [
				new Filter("p0.0", FilterOperator.EQ, "v0.0"),
				new Filter({
					filters : [
						new Filter("p1.0", FilterOperator.EQ, "v1.0"),
						new Filter("p1.1", FilterOperator.EQ, "v1.1")
					]
				}),
				new Filter({
					filters : [
						new Filter("p2.0", FilterOperator.EQ, "v2.0"),
						new Filter("p2.1", FilterOperator.EQ, "v2.1"),
						new Filter("p2.2", FilterOperator.EQ, "v2.2")
					],
					and : true
				}),
				new Filter("p3.0", FilterOperator.EQ, "v3.0")
			],
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.String"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").exactly(7).withExactArgs(oBinding.sPath)
			.returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("p0.0", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p1.0", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p1.1", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p2.0", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p2.1", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p2.2", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p3.0", "~").returns(oPromise);

		oFilterPromise = oBinding.fetchFilter(undefined, aFilters, [], undefined);

		assert.strictEqual(oFilterPromise.isFulfilled(), false);
		return oFilterPromise.then(function (sFilterValue) {
			assert.strictEqual(sFilterValue,
				"p0.0 eq 'v0.0'"
				+ " and (p1.0 eq 'v1.0' or p1.1 eq 'v1.1')"
				+ " and (p2.0 eq 'v2.0' and p2.1 eq 'v2.1' and p2.2 eq 'v2.2')"
				+ " and p3.0 eq 'v3.0'"
			);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: application and control filter", function (assert) {
		var aAppFilters = [new Filter("p0.0", FilterOperator.EQ, "v0.0")],
			oBinding = this.oModel.bindList("/Set"),
			aControlFilters = [new Filter("p1.0", FilterOperator.EQ, "v1.0")],
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.String"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").twice().withExactArgs(oBinding.sPath)
			.returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("p0.0", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p1.0", "~").returns(oPromise);

		return oBinding.fetchFilter(undefined, aAppFilters, aControlFilters, "p2.0 eq 'v2.0'")
			.then(function (sFilterValue) {
				assert.strictEqual(sFilterValue,
					"(p0.0 eq 'v0.0') and (p1.0 eq 'v1.0') and (p2.0 eq 'v2.0')");
			});
	});

	//*********************************************************************************************
	QUnit.skip("fetchFilter: filter with encoded path", function (assert) {
		// TODO encode in the filter or not?
		var aAppFilters = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "10000")],
			oBinding = this.oModel.bindList("/Set"),
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.Decimal"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("AmountIn€", "~").returns(oPromise);

		return oBinding.fetchFilter(undefined, aAppFilters, [], undefined)
			.then(function (sFilterValue) {
				assert.strictEqual(sFilterValue, "AmountIn€ gt 10000");
			});
	});

	//*********************************************************************************************
	QUnit.test("buildOrderbyOption", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			sOrderby = "bar desc";

		// empty sorters
		assert.strictEqual(oBinding.buildOrderbyOption([]), "");
		// array of sorters
		assert.strictEqual(oBinding.buildOrderbyOption([new Sorter("foo")]), "foo",
			"Sorter array, no query option");
		assert.strictEqual(oBinding.buildOrderbyOption([new Sorter("foo"),
			new Sorter("bar", true)]), "foo,bar desc");

		// with system query option $orderby
		// empty sorters
		assert.strictEqual(oBinding.buildOrderbyOption([], sOrderby), sOrderby);
		// array of sorters
		assert.strictEqual(oBinding.buildOrderbyOption([new Sorter("foo")], sOrderby),
			"foo," + sOrderby, "Sorter array, with query option");
		assert.strictEqual(oBinding.buildOrderbyOption([new Sorter("foo"),
			new Sorter("baz", true)], sOrderby), "foo,baz desc," + sOrderby);

		assert.throws(function () {
			oBinding.buildOrderbyOption(["foo"]);
		}, new Error("Unsupported sorter: foo - "
			+ "sap.ui.model.odata.v4.ODataListBinding: /EMPLOYEES"));
	});

	//*********************************************************************************************
	[{ // no threshold
		range : [0, 10, 0],
		expected : {start : 0, length : 10}
	}, {
		range : [40, 10, 0],
		expected : {start : 40, length : 10}
	}, {
		current : [[40, 50]],
		range : [40, 10, 0],
		expected : {start : 40, length : 10}
	}, {
		current : [[50, 110]],
		range : [100, 20, 0],
		expected : {start : 100, length : 20}
	}, { // initial read with threshold
		range : [0, 10, 100],
		expected : {start : 0, length : 110}
	}, { // iPrefetchSize / 2 available on both sides
		current : [[0, 110]],
		range : [50, 10, 100],
		expected : {start : 50, length : 10}
	}, { // missing a row at the end
		current : [[0, 110]],
		range : [51, 10, 100],
		expected : {start : 51, length : 110}
	}, { // missing a row before the start
		current : [[100, 260]],
		range : [149, 10, 100],
		expected : {start : 49, length : 110}
	}, { // missing a row before the start, do not read beyond 0
		current : [[40, 200]],
		range : [89, 10, 100],
		expected : {start : 0, length : 99}
	}, { // missing data on both sides, do not read beyond 0
		range : [430, 10, 100],
		expected : {start : 330, length : 210}
	}, { // missing data on both sides, do not read beyond 0
		current : [[40, 100]],
		range : [89, 10, 100],
		expected : {start : 0, length : 199}
	}, { // transient context
		range : [-1, 10, 1],
		bTransient : true,
		expected : {start : -1, length : 11}
	}].forEach(function (oFixture) {
		QUnit.test("getReadRange: " + oFixture.range, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				aContexts = [],
				oResult;

			// prepare contexts array
			if (oFixture.current) {
				oFixture.current.forEach(function (aRange) {
					var i, n;

					for (i = aRange[0], n = aRange[1]; i < n; i++) {
						aContexts[i] = i;
					}
				});
			}
			if (oFixture.bTransient) {
				aContexts[-1] = -1;
			}
			oBinding.aContexts = aContexts;

			oResult = oBinding.getReadRange(oFixture.range[0], oFixture.range[1],
				oFixture.range[2]);

			assert.deepEqual(oResult, oFixture.expected);
		});
	});

	//*********************************************************************************************
	QUnit.test("mergeQueryOptions", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		[{
			mQueryOptions: undefined,
			sOrderBy : undefined,
			sFilter : undefined
		}, {
			mQueryOptions: {$orderby : "bar", $select : "Name"},
			sOrderBy : undefined,
			sFilter : undefined
		}, {
			mQueryOptions: undefined,
			sOrderBy : "foo",
			sFilter : undefined,
			oResult : {$orderby : "foo"}
		}, {
			mQueryOptions: {$orderby : "bar", $select : "Name"},
			sOrderBy : "foo,bar",
			sFilter : undefined,
			oResult : {$orderby : "foo,bar", $select : "Name"}
		}, {
			mQueryOptions: {$orderby : "bar", $select : "Name"},
			sOrderBy : "bar",
			sFilter : undefined
		}, {
			mQueryOptions: undefined,
			sOrderBy : undefined,
			sFilter : "foo",
			oResult : {$filter : "foo"}
		}, {
			mQueryOptions: {$filter : "bar", $select : "Name"},
			sOrderBy : undefined,
			sFilter : "foo,bar",
			oResult : {$filter : "foo,bar", $select : "Name"}
		}, {
			mQueryOptions: {$filter: "bar", $select : "Name"},
			sOrderBy : undefined,
			sFilter : "bar"
		}, {
			mQueryOptions: {$filter: "bar", $orderby : "foo", $select : "Name"},
			sOrderBy : "foo",
			sFilter : "bar"
		}, {
			mQueryOptions: {$filter: "foo", $orderby : "bar", $select : "Name"},
			sOrderBy : "foo,bar",
			sFilter : "bar,baz",
			oResult : {$filter : "bar,baz", $orderby : "foo,bar", $select : "Name"}
		}].forEach(function (oFixture, i) {
			var oResult = oBinding.mergeQueryOptions(oFixture.mQueryOptions,
					oFixture.sOrderBy, oFixture.sFilter);
			if ("oResult" in oFixture) {
				assert.deepEqual(oResult, oFixture.oResult, i);
			} else {
				assert.strictEqual(oResult, oFixture.mQueryOptions, i);
			}
			if (oResult) {
				assert.ok(oResult.$orderby || !("$orderby" in oResult), i + ": $orderby");
				assert.ok(oResult.$filter || !("$filter" in oResult), i + ": $filter");
			}
		});
	});
});
//TODO integration: 2 entity sets with same $expand, but different $select
//TODO support suspend/resume
//TODO Provide "array" methods that can deal with -1 index (splice, forEach, length) and use it
//     instead of if {} else {} code fragments

