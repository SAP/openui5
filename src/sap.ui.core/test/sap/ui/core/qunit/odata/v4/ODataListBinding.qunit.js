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
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding"
], function (jQuery, ManagedObject, Binding, ChangeReason, Filter, FilterOperator, FilterType,
		ListBinding, Model, Sorter, OperationMode, Context, _Cache, _Helper, _SyncPromise,
		ODataListBinding, ODataModel, asODataParentBinding) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-new: 0, no-warning-comments: 0 */
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
	 * Creates the data for _Cache.read.
	 *
	 * @param {number} iLength
	 *   array length
	 * @param {number} [iStart=0]
	 *   start index
	 * @param {boolean} [bDrillDown]
	 *   simulate drill-down, i.e. resolve with unwrapped array
	 * @param {number} [iCount]
	 *   the  value for "$count", remains unset if undefined
	 * @return {object}
	 *   the data
	 */
	function createData(iLength, iStart, bDrillDown, iCount) {
		var oData = {value : []},
			i;

		if (iCount !== undefined) {
			oData.value.$count = iCount;
		}
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
	 * @param {number} [iCount]
	 *   the  value for "$count", remains unset if undefined
	 * @return {SyncPromise}
	 *   the promise which is fulfilled as specified
	 */
	function createResult(iLength, iStart, bDrillDown, iCount) {
		return _SyncPromise.resolve(
			Promise.resolve(createData(iLength, iStart, bDrillDown, iCount))
		);
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
	 * @param {number} [iCount]
	 *   the  value for "$count", remains unset if undefined
	 * @return {SyncPromise}
	 *   the promise which is fulfilled as specified
	 */
	function createSyncResult(iLength, iStart, bDrillDown, iCount) {
		return _SyncPromise.resolve(createData(iLength, iStart, bDrillDown, iCount));
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
					hasPendingChangesForPath : function () { return false; },
					read : function () {},
					toString : function () { return "/service/EMPLOYEES"; }
				};

			this.oSandbox.mock(_Cache).expects("create").returns(oCache);
			return this.oSandbox.mock(oCache);
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oMixin = {};

		asODataParentBinding(oMixin);

		Object.keys(oMixin).forEach(function (sKey) {
			assert.strictEqual(oBinding[sKey], oMixin[sKey]);
		});
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
		assert.ok(oBinding.hasOwnProperty("oCachePromise"));
		assert.ok(oBinding.hasOwnProperty("sChangeReason"));
		assert.ok(oBinding.hasOwnProperty("aFilters"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("oHeaderContext"));
		assert.ok(oBinding.hasOwnProperty("sOperationMode"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sRefreshGroupId"));
		assert.ok(oBinding.hasOwnProperty("aSorters"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oBinding,
			oContext = {},
			aFilters = [],
			vFilters = {},
			oHelperMock = this.mock(_Helper),
			oODataListBindingMock = this.mock(ODataListBinding.prototype),
			mParameters = {
				$filter : "foo"
			},
			mParametersClone = {},
			aSorters = [],
			vSorters = {};

		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vFilters)).returns(aFilters);
		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vSorters)).returns(aSorters);
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(mParameters))
			.returns(mParametersClone);
		oODataListBindingMock.expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));
		oODataListBindingMock.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// code under test
		oBinding = new ODataListBinding(this.oModel, "/EMPLOYEES", oContext, vSorters, vFilters,
			mParameters);

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, []);
		assert.strictEqual(oBinding.oDiff, undefined);
		assert.deepEqual(oBinding.aFilters, []);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		assert.deepEqual(oBinding.aPreviousData, []);
		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		assert.strictEqual(oBinding.aSorters, aSorters);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAutoExpandSelect) {
		QUnit.test("c'tor: AddVirtualContext = " + bAutoExpandSelect, function (assert) {
			var oBinding;

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;

			// code under test
			oBinding = this.oModel.bindList("/EMPLOYEES");

			assert.strictEqual(oBinding.sChangeReason,
				bAutoExpandSelect ? "AddVirtualContext" : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from c'tor", function (assert) {
		var mBindingParameters = {
				$$groupId : "foo",
				$$operationMode : OperationMode.Server,
				$$updateGroupId : "update foo"
			},
			sGroupId = "foo",
			oModelMock = this.mock(this.oModel),
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			sOperationMode = "Server",
			mParameters = {
				$$groupId : "foo",
				$$operationMode : OperationMode.Server,
				$$updateGroupId : "update foo",
				$filter : "bar"
			},
			mQueryOptions = {
				$filter : "bar"
			},
			sUpdateGroupId = "update foo";

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters),
				["$$groupId", "$$operationMode", "$$updateGroupId"])
			.returns(mBindingParameters);
		oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true)
			.returns(mQueryOptions);
		this.mock(oBinding).expects("reset").withExactArgs(undefined);

		//Stub is needed to test, if mCacheByContext is set to undefined before fetchCache is called
		oBinding.mCacheByContext = {
				"/Products" : {}
		};
		this.stub(oBinding, "fetchCache", function () {
			assert.strictEqual(oBinding.mCacheByContext, undefined, "mCacheByContext");
		});

		//code under test
		oBinding.applyParameters(mParameters);

		assert.strictEqual(oBinding.sOperationMode, sOperationMode, "sOperationMode");
		assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
		assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
		assert.deepEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from c'tor - error case", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Server}),
			sOperationMode = oBinding.sOperationMode;

		//code under test
		assert.throws(function () {
			oBinding.applyParameters(); //c'tor called without mParameters but vSorters is set
		}, new Error("Unsupported operation mode: undefined"));
		assert.strictEqual(oBinding.sOperationMode, sOperationMode, "sOperationMode not changed");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from changeParameters", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS"),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext),
			oModelMock = this.mock(this.oModel),
			mParameters = {
				$filter : "bar"
			},
			mQueryOptions = {
				$filter : "bar"
			};

		oBinding.mCacheByContext = {}; //mCacheByContext must be reset before fetchCache
		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters),
				["$$groupId", "$$operationMode", "$$updateGroupId"])
			.returns({$$operationMode : OperationMode.Server});
		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Change);

		//code under test
		oBinding.applyParameters(mParameters, ChangeReason.Change);

		assert.strictEqual(oBinding.mCacheByContext, undefined);
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oV4Context = {
				fetchCanonicalPath : function () {},
				getPath : function () {return "/TEAMS(Team_ID='TEAM01')";},
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
			that.mock(oBinding.oCachePromise.getResult()).expects("read").returns(createResult(1));

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
	QUnit.test("reset with header context", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oCountBinding1 = this.oModel.bindProperty("$count", oBinding.getHeaderContext()),
			oCountBinding2 = this.oModel.bindProperty("$count", oBinding.getHeaderContext());

		this.mock(oCountBinding1).expects("checkUpdate").withExactArgs();
		this.mock(oCountBinding2).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.reset(ChangeReason.Change);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bUseExtendedChangeDetection) {
		QUnit.test("refresh event is always followed by a change event; E.C.D.: "
				+ bUseExtendedChangeDetection, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				aDiffResult = bUseExtendedChangeDetection ?  [] : undefined;

			if (bUseExtendedChangeDetection) {
				oBinding.enableExtendedChangeDetection(false);
			}
			this.mock(oBinding.oCachePromise.getResult()).expects("read")
				.exactly(bUseExtendedChangeDetection ? 1 : 2)
				.returns(createSyncResult(1));
			this.mock(oBinding).expects("getDiff")
				.exactly(bUseExtendedChangeDetection ? 1 : 0)
				.withExactArgs(sinon.match.array, 0)
				.returns(aDiffResult);

			// Promise used instead of assert.async() because else Sinon restores the mocks
			// immediately after the test function returns, but change event is fired asynchronously
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
							bUseExtendedChangeDetection ? aDiffResult : undefined);
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
			oModelMock = this.mock(this.oModel),
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
		oModelMock.expects("buildQueryOptions").thrice()
			.withExactArgs(mParameters, true)
			.returns(mQueryOptions);
		this.mock(ODataListBinding.prototype).expects("getOrderby").twice()
			.withExactArgs(mQueryOptions.$orderby)
			.returns(mQueryOptions.$orderby);
		this.mock(_Cache).expects("create").twice()
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				{"$orderby" : "bar", "sap-client" : "111"}, false)
			.returns({});
		this.spy(ODataListBinding.prototype, "reset");

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", oV4Context, undefined, undefined,
			mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oV4Context);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly(undefined));
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
		assert.deepEqual(oBinding.mParameters, mParameters);
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

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined, "no cache");
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);

		//error for invalid parameters
		oModelMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			// code under test
			this.oModel.bindList("/EMPLOYEES", null, undefined, undefined, mParameters);
		}, oError);
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
	});

	//*********************************************************************************************
	QUnit.test("bindList with filters", function (assert) {
		var oBinding,
			oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
			aFilters = [oFilter],
			oHelperMock = this.mock(_Helper),
			mQueryParameters = {
				$$operationMode : OperationMode.Server,
				$filter : "bar"
			};

		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter)).returns(aFilters);
		oHelperMock.expects("toArray").withExactArgs(undefined).returns([]);
		this.mock(ODataListBinding.prototype).expects("fetchFilter")
			.withExactArgs(undefined, mQueryParameters.$filter)
			.returns(_SyncPromise.resolve());

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, oFilter,
			mQueryParameters);

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
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
	});

	//*********************************************************************************************
	[false, true].forEach(function (bExtendedChangeDetection) {
		QUnit.test("getContexts: synchronous response, bExtendedChangeDetection="
				+ bExtendedChangeDetection, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$$groupId : "groupId"
				}),
				aContexts,
				oData = {value : [{}, {}, {}]},
				aDiff = [/*some diff*/],
				that = this;

			this.mock(oBinding.oCachePromise.getResult()).expects("read")
				.withExactArgs(0, 3, "groupId", sinon.match.func)
				.returns(_SyncPromise.resolve(oData));
			if (bExtendedChangeDetection) {
				oBinding.enableExtendedChangeDetection(false);
				this.mock(oBinding).expects("getDiff")
					.withExactArgs(sinon.match.same(oData.value), 0)
					.returns(aDiff);
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
					oCacheMock = that.mock(oBinding.oCachePromise.getResult()),
					aContexts,
					oData = {value : [{}, {}, {}]},
					aDiff = [/*some diff*/];

				oCacheMock.expects("read")
					.withExactArgs(0, 3, "groupId", sinon.match.func)
					.callsArg(3)
					.returns(_SyncPromise.resolve(Promise.resolve(oData)));
				if (bExtendedChangeDetection) {
					oBinding.enableExtendedChangeDetection(false);
					that.mock(oBinding).expects("getDiff")
						.withExactArgs(sinon.match.same(oData.value), 0)
						.returns(aDiff);
				}

				oBinding.attachChange(function () {
					if (!bExtendedChangeDetection) {
						// expect a second read which is responded synchronously
						oCacheMock.expects("read")
							.withExactArgs(0, 3, "groupId", sinon.match.func)
							.returns(_SyncPromise.resolve(oData));
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
	QUnit.test("getContexts: virtual context", function (assert) {
		var oAddPrerenderingTaskSpy,
			oParentContext = Context.create(this.oModel, {}, "/TEAMS('4711')"),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oParentContext),
			bChangeFired,
			aContexts,
			oResetSpy,
			sResolvedPath = "/TEAMS('4711')/TEAM_2_EMPLOYEES",
			oVirtualContext = {};

		oBinding.sChangeReason = "AddVirtualContext";
		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oParentContext))
			.returns(sResolvedPath);
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				sResolvedPath + "/-2", -2)
			.returns(oVirtualContext);
		oAddPrerenderingTaskSpy = this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func, true);
		oResetSpy = this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Refresh);
		oBinding.attachEventOnce("change", function (oEvent) {
			bChangeFired = true;
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
			assert.strictEqual(oBinding.sChangeReason, "RemoveVirtualContext");
			assert.strictEqual(oResetSpy.callCount, 0, "not yet!");

			// code under test
			aContexts = oBinding.getContexts(0, 5);

			assert.deepEqual(aContexts, []);
			assert.strictEqual(oBinding.sChangeReason, undefined);
		});

		// code under test
		aContexts = oBinding.getContexts(0, 5);

		assert.deepEqual(aContexts, [oVirtualContext]);
		assert.strictEqual(aContexts[0], oVirtualContext);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.notOk(bChangeFired, "not yet!");


		return Promise.resolve().then(function () {
			// call 1st call's 1st arg
			oAddPrerenderingTaskSpy.args[0][0]();
			assert.ok(bChangeFired);
		});
	});

	//*********************************************************************************************
	[{$count : 10}, {$count : undefined}].forEach(function (oFixture) {
		QUnit.test("getLength: $count=" + oFixture.$count, function(assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
				oContext,
				oData,
				iExpectedLength = oFixture.$count || 13;

			oData = {
				value : [{}, {}, {}]
			};
			oData.value.$count = oFixture.$count;
			oCacheMock.expects("read")
				.withExactArgs(0, 3, "$auto", sinon.match.func)
				.returns(_SyncPromise.resolve(oData));
			oBinding.getContexts(0, 3);

			// code under test
			assert.strictEqual(oBinding.getLength(), iExpectedLength);

			oCacheMock.expects("create").returns(Promise.resolve({}));
			oContext = oBinding.create();

			// code under test
			assert.strictEqual(oBinding.getLength(), iExpectedLength + 1, "with transient row");

			return oContext.created().then(function () {
				// code under test
				assert.strictEqual(oBinding.getLength(),
					// TODO if length is not final expected length is increased by 1, is that OK?
					iExpectedLength + (oFixture.$count ? 2 : 1),
					"after successful POST");

				oCacheMock.expects("_delete").callsArgWith(3, -1).returns(Promise.resolve());
				return oBinding._delete("$direct", "EMPLOYEES('42')", oContext).then(function () {
					// code under test
					assert.strictEqual(oBinding.getLength(), iExpectedLength,
						"after successful DELETE");
				});
			});
		});
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindList: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindList(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList: empty path is valid for base context", function (assert) {
		var oBaseContext = this.oModel.createBindingContext("/BusinessPartnerList");

		// code under test
		this.oModel.bindList("", oBaseContext);
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
				.withExactArgs(iStartIndex, iLength, "$direct", sinon.match.func)
				.callsArg(3)
				.returns(oPromise);
			oCacheMock.expects("read")
				.withExactArgs(iStartIndex, iLength, "$direct", sinon.match.func)
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

			assert.strictEqual(oBinding.oCachePromise.getResult(), undefined, "no own cache");
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
			oCache = {},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		this.stub(ODataListBinding.prototype, "fetchCache", function (oContext0) {
			// fetchCache is called once from applyParameters before oBinding.oContext is set
			if (oContext0) {
				assert.strictEqual(oContext0, oContext);
			}
			this.oCachePromise = _SyncPromise.resolve(oContext0 ? oCache : undefined);
		});
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
			{$select : "ID"});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
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
			oPromise = _SyncPromise.resolve();

		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oPromise);

		// code under test
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.deepEqual(oBinding.getContexts(), []);
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path without parameters", function (assert) {
		var oBinding = this.oModel.bindList("Suppliers"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(this.oModel, {}, "/bar"),
			oHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers");

		oBindingMock.expects("reset").twice().withExactArgs();
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/bar/Suppliers")
			.returns(oHeaderContext);
		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/bar/Suppliers");
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		oBindingMock.expects("_fireChange").twice()
			.withExactArgs({reason : ChangeReason.Context});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getHeaderContext(), oHeaderContext);

		oBindingMock.expects("fetchCache").withExactArgs(null);

		// code under test
		oBinding.setContext(null);

		assert.strictEqual(oBinding.getHeaderContext(), null);

		this.mock(oHeaderContext).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("preserve headerContext when ManagedObject temporarily removes context",
		function (assert) {
		var oBinding = this.oModel.bindList("Suppliers"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(this.oModel, {}, "/bar"),
			oHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers");

		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/bar/Suppliers")
			.returns(oHeaderContext);
		oBindingMock.expects("fetchCache").withExactArgs(null);
		oBindingMock.expects("fetchCache").twice().withExactArgs(sinon.match.same(oContext));
		oBinding.setContext(oContext);
		assert.strictEqual(oBinding.getHeaderContext(), oHeaderContext);
		this.mock(oBinding.getHeaderContext()).expects("destroy").never();

		// code under test
		oBinding.setContext(null);
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getHeaderContext(), oHeaderContext);
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
						.withExactArgs(iStart, iLength, "$auto", sinon.match.func)
						.callsArg(3)
						.returns(createResult(iLength, iStart));
				}
				oCacheMock.expects("read")
					.withExactArgs(iStart, iLength, "$auto", sinon.match.func)
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
				oPromise = _SyncPromise.resolve(Promise.reject(oError)), // async!
				sResolvedPath = bRelative
					? "/service/EMPLOYEES(1)/TEAM_2_EMPLOYEES"
					: "/service/EMPLOYEES";

			if (bRelative) {
				oContextMock = this.mock(oContext);
				// Note: must be async, else no "change" event is fired!
				oContextMock.expects("fetchValue").returns(createResult(2, 0, true));
				oContextMock.expects("fetchValue").returns(oPromise);
			} else {
				oCacheMock = this.getCacheMock();
				oCacheMock.expects("read").callsArg(3).returns(createResult(2));
				oCacheMock.expects("read").callsArg(3).returns(oPromise);
			}
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to get contexts for " + sResolvedPath
				+ " with start index 1 and length 2", sClassName,
				sinon.match.same(oError));

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
				.withExactArgs(oFixture.start, 30, "$direct", sinon.match.func)
				.callsArg(3)
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
			.withExactArgs(iReadStart, 175, "$direct", sinon.match.func)
			.callsArg(3)
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
				.withExactArgs(110, 15, "$direct", sinon.match.func)
				.returns(createSyncResult(15, 110));

			// code under test
			oBinding.getContexts(110, 15);

			expectDebug(120, 15, -15);
			// default negative threshold to 0
			oBindingMock.expects("getReadRange")
				.withExactArgs(120, 15, 0)
				.returns({start : 120, length : 15});
			oCacheMock.expects("read")
				.withExactArgs(120, 15, "$direct", sinon.match.func)
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
				oReadPromise = createResult(15);

			oCacheMock.expects("read")
				.withExactArgs(20, 30, "$auto", sinon.match.func)
				.callsArg(3)
				.returns(oReadPromise);

			assert.deepEqual(oBinding.getCurrentContexts(), []);
			oBinding.getContexts(20, 30); // creates cache

			return oReadPromise.then(function () {
				assert.deepEqual(oBinding.getCurrentContexts(),
					oBinding.aContexts.slice(20, 35));
				assert.strictEqual(oBinding.isLengthFinal(), true);
				assert.strictEqual(oBinding.getLength(), 35);

				oReadPromise = createResult(oFixture.result);
				oCacheMock.expects("read")
					.withExactArgs(oFixture.start, 30, "$auto", sinon.match.func)
					.callsArg(3)
					.returns(oReadPromise);

				getContexts(assert, oBinding, oFixture.start, 30, oFixture.curr);

				return oReadPromise;
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
			.withExactArgs(20, 30, "$auto", sinon.match.func)
			.callsArg(3)
			.returns(oReadPromise1);
		// 2. read and get [0..30) -> length still 60
		oCacheMock.expects("read")
			.withExactArgs(0, 30, "$auto", sinon.match.func)
			.callsArg(3)
			.returns(oReadPromise2);
		// 3. read [50..80) get no entries -> length is now final 50
		oCacheMock.expects("read")
			.withExactArgs(50, 30, "$auto", sinon.match.func)
			.callsArg(3)
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
	QUnit.test("refreshInternal: relative with own cache", function (assert) {
		var oBinding,
			oCache0 = {},
			oCache1 = {},
			oCache = oCache0,
			oContext = Context.create(this.oModel, {}, "/TEAMS('1')"),
			that = this;

		this.stub(ODataListBinding.prototype, "fetchCache", function (oContext0) {
			// fetchCache is called once from applyParameters before oBinding.oContext is set
			if (oContext0) {
				assert.strictEqual(oContext0, oContext);
			}
			this.oCachePromise = _SyncPromise.resolve(oContext0 ? oCache : undefined);
		});
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$groupId : "group"});

		oCache = oCache1;
		that.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
		that.mock(that.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding), true)
			.returns([]);
		oBinding.mCacheByContext = {}; // would have been set by fetchCache

		//code under test
		oBinding.refreshInternal("myGroup");

		assert.strictEqual(oBinding.mCacheByContext, undefined);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache1);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: dependent bindings", function (assert) {
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
		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oReadPromise);
		// change event during getContexts
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		oBinding.getContexts(0, 10);

		return oReadPromise.then(function () {
			that.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
			that.mock(that.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oBinding), true)
				.returns([oChild0]);
			that.mock(oChild0).expects("refreshInternal").withExactArgs("myGroup", false);

			//code under test
			oBinding.refreshInternal("myGroup");
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts fires dataRequested and dataReceived events", function (assert) {
		var that = this;

		return new Promise(function (finishTest) {
			var oBinding = that.oModel.bindList("/EMPLOYEES");

			that.stub(oBinding.oCachePromise.getResult(), "read", function (iIndex, iLength,
					sGroupId, fnDataRequested) {
				return _SyncPromise.resolve().then(function () {
					that.mock(oBinding).expects("fireDataRequested").withExactArgs();
					fnDataRequested();
					that.mock(oBinding).expects("_fireChange")
						.withExactArgs({reason : "change"});
					return Promise.resolve(createData(10));
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
	[false, true].forEach(function (bCanceled) {
		QUnit.test("getContexts - error handling for dataRequested/dataReceived, canceled="
				+ bCanceled, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				oError = new Error("Expected Error"),
				oReadPromise = _SyncPromise.reject(oError);

			if (bCanceled) {
				oError.canceled = true;
			}
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to get contexts for /service/EMPLOYEES with start index 0 and length 3",
				sClassName, sinon.match.same(oError));
			this.mock(oBinding.oCachePromise.getResult()).expects("read").callsArg(3)
				.returns(oReadPromise);
			this.mock(oBinding).expects("fireDataReceived")
				.withExactArgs(bCanceled ? undefined : {error : oError});

			oBinding.getContexts(0, 3);
			return oReadPromise.catch(function () {
				assert.deepEqual(oBinding.getCurrentContexts(), [undefined, undefined, undefined]);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts - concurrent call with read errors", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			iDataReceivedEvents = 0,
			oError = new Error(),
			oModelMock = this.mock(this.oModel),
			oReadResult = _SyncPromise.reject(oError);

		return new Promise(function (resolve) {
			oModelMock.expects("reportError").twice()
				.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 0"
					+ " and length 10", sClassName, sinon.match.same(oError));

			oCacheMock.expects("read").callsArg(3).returns(oReadResult);
			oCacheMock.expects("read").returns(oReadResult);

			oBinding.attachDataReceived(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("error"), oError);
				iDataReceivedEvents += 1;
				resolve();
			});

			// code under test: call getContexts twice concurrently
			oBinding.getContexts(0, 10);
			oBinding.getContexts(0, 10);
		}).then(function () {
			// wait for "reportError" which is called asynchronously after the data received event
			assert.strictEqual(iDataReceivedEvents, 1);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oListener = {},
			oPromise,
			oReadResult = {};

		this.mock(_Helper).expects("buildPath").withExactArgs(42, "bar").returns("~");
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(undefined, "~", undefined, sinon.match.same(oListener))
			.returns(_SyncPromise.resolve(oReadResult));

		oPromise = oBinding.fetchValue("bar", oListener, 42);
		assert.ok(oPromise.isFulfilled());
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});
	//TODO support dataRequested/dataReceived event in fetchValue:
	//     share implementation with ODataContextBinding?

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
				.withExactArgs(oFixture.rel, undefined, 42).returns(_SyncPromise.resolve(oResult));

			assert.strictEqual(oBinding.fetchAbsoluteValue(oFixture.abs).getResult(), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding, relative path", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/foo"),
			oListener = {},
			oResult = {};

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
		this.mock(_Helper).expects("buildPath").withExactArgs("TEAM_2_EMPLOYEES", 42, "bar")
			.returns("~");
		this.mock(oContext).expects("fetchValue").withExactArgs("~", sinon.match.same(oListener))
			.returns(_SyncPromise.resolve(oResult));

		assert.strictEqual(oBinding.fetchValue("bar", oListener, 42).getResult(), oResult);
	});
	//TODO provide iStart, iLength parameter to fetchValue to support paging on nested list

	//*********************************************************************************************
	["/TEAMS/1", "/TEAMS/1/TEAM_2_EMPLOYEES/2"].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding: " + sPath, function (assert) {
			var oBinding,
				oContext = Context.create(this.oModel, undefined, "/TEAMS/1"),
				oResult = {};

			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
			this.mock(oContext).expects("fetchAbsoluteValue")
				.withExactArgs(sPath).returns(_SyncPromise.resolve(oResult));

			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath).getResult(), oResult);
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
			var oBinding,
				oContext = Context.create(this.oModel, undefined, "/SalesOrderList('1')"),
				oResult = {};

			this.stub(ODataListBinding.prototype, "fetchCache", function (oContext0) {
				// fetchCache is called once from applyParameters before oBinding.oContext is set
				if (oContext0) {
					assert.strictEqual(oContext0, oContext);
				}
				this.oCachePromise = _SyncPromise.resolve(oContext0 ? {} : undefined);
			});
			oBinding = this.oModel.bindList("SO_2_SOITEM", undefined, undefined, undefined,
				{$$groupId : "group"});
			this.mock(oBinding).expects("fetchValue").never();

			// code under test
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath).getResult(), undefined);

			oBinding.setContext(oContext);
			this.mock(oContext).expects("fetchAbsoluteValue").withExactArgs(sPath)
				.returns(_SyncPromise.resolve(oResult));

			// code under test
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath).getResult(), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchAbsoluteValue: relative binding w/ cache, absolute path", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, undefined, "/SalesOrderList('1')"),
			oResult = {};

		this.stub(ODataListBinding.prototype, "fetchCache", function (oContext0) {
			// fetchCache is called once from applyParameters before oBinding.oContext is set
			if (oContext0) {
				assert.strictEqual(oContext0, oContext);
			}
			this.oCachePromise = _SyncPromise.resolve(oContext0 ? {} : undefined);
		});
		oBinding = this.oModel.bindList("SO_2_SOITEM", oContext, undefined, undefined,
			{$$groupId : "group"});

		this.mock(oBinding).expects("fetchValue")
			.withExactArgs("bar", undefined, 2).returns(oResult);

		// code under test
		assert.strictEqual(
			oBinding.fetchAbsoluteValue("/SalesOrderList('1')/SO_2_SOITEM/2/bar").getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: absolute binding", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			oListener = {};

		this.mock(_Helper).expects("buildPath").withExactArgs(1, "foo").returns("~");
		this.mock(oBinding.oCachePromise.getResult()).expects("deregisterChange")
			.withExactArgs("~", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener, 1);
	});
	// TODO deregisterChange from a property binding may arrive after the binding changed or
	//      activated its cache when a relative binding with cache changed its parent
	//      context. Find a better way to deal with these registrations.

	//*********************************************************************************************
	QUnit.test("deregisterChange: cache is not yet available", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			oCache = {
				deregisterChange : function () {}
			};

		// simulate pending cache creation
		oBinding.oCachePromise = _SyncPromise.resolve(Promise.resolve(oCache));
		this.mock(oCache).expects("deregisterChange").never();

		oBinding.deregisterChange("foo", {});

		return oBinding.oCachePromise.then();
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
	QUnit.test("forbidden", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.getDistinctValues();
		}, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));

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
			.withExactArgs("change", sinon.match.same(mEventParameters)).returns(oReturn);

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
			oBinding = this.oModel.bindList("/EMPLOYEES"),
			oModelMock = this.mock(this.oModel),
			mParameters = {},
			oPrototypeMock;

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowed)
			.returns({$$groupId : "foo", $$operationMode : "Server", $$updateGroupId : "bar"});
		// code under test
		oBinding.applyParameters(mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowed)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding.applyParameters(mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, undefined);
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowed)
			.returns({});
		// code under test
		oBinding.applyParameters(mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters also called for relative binding
		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowed)
			.returns({$$groupId : "foo", $$operationMode : "Server", $$updateGroupId : "bar"});
		oPrototypeMock = this.mock(ODataListBinding.prototype);
		oPrototypeMock.expects("applyParameters").withExactArgs(mParameters); // called by c'tor
		oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS");
		oPrototypeMock.restore();
		// code under test
		oBinding.applyParameters(mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
	});

	//*********************************************************************************************
	QUnit.test("getContexts uses group ID from binding parameter", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "myGroup"});

		this.mock(oBinding.oCachePromise.getResult()).expects("read")
			.withExactArgs(0, 10, "myGroup", sinon.match.func)
			.returns(createResult(0));

		oBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("getContexts uses refresh group ID", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "$direct"});

		this.mock(oBinding.oCachePromise.getResult()).expects("read")
			.withExactArgs(0, 10, "myGroup", sinon.match.func)
			.returns(createResult(0));
		oBinding.sRefreshGroupId = "myGroup";

		oBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: data received handler throws error", function (assert) {
		var that = this;
		return new Promise(function (resolve) {
			var oBinding = that.oModel.bindList("/EMPLOYEES"),
				oExpectedError = new Error("Expected"),
				oReadPromise = createResult(0);

			that.mock(oBinding.oCachePromise.getResult()).expects("read")
				.withExactArgs(0, 10, "$auto", sinon.match.func)
				.callsArg(3).returns(oReadPromise);
			// check that error in data received handler is logged
			that.mock(that.oModel).expects("reportError")
				.withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 0"
					+ " and length 10", sClassName, sinon.match.same(oExpectedError));
			oBinding.attachDataReceived(function () {
				resolve();
				throw oExpectedError;
			});

			// code under test
			oBinding.getContexts(0, 10);
		}).then(function () {
			// wait for "reportError" which is called asynchronously after the data received event
		});
	});

	//*********************************************************************************************
	QUnit.test("sync getCurrentContexts while reading", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oReadPromise1 = createResult(10);

		oCacheMock.expects("read")
			.withExactArgs(0, 10, "$auto", sinon.match.func)
			.callsArg(3).returns(oReadPromise1);

		oBinding.getContexts(0, 10);

		return oReadPromise1.then(function () {
			var oReadPromise2 = createResult(0);

			oCacheMock.expects("read")
				.withExactArgs(10, 5, "$auto", sinon.match.func)
				.callsArg(3).returns(oReadPromise2);

			oBinding.getContexts(10, 5);

			oCacheMock.expects("read")
				.withExactArgs(0, 5, "$auto", sinon.match.func)
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
				oModel = oFixture.oModel || this.oModel,
				oContext = Context.create(oModel, /*oBinding*/{}, "/TEAMS", 1);

			this.stub(ODataListBinding.prototype, "fetchCache", function (oContext0) {
				// fetchCache is called once from applyParameters before oBinding.oContext is set
				if (oContext0) {
					assert.strictEqual(oContext0, oContext);
				}
				this.oCachePromise = _SyncPromise.resolve(oContext0 ? {} : undefined);
			});
			oBinding = oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
				oFixture.mParameters);

			oBinding.mCacheByContext = {"/TEAMS('1')" : {}, "/TEAMS('42')" : {}};
			this.mock(oBinding).expects("hasPendingChanges").returns(false);
			this.spy(_Helper, "toArray");
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

		this.stub(ODataListBinding.prototype, "fetchCache", function () {
			this.oCachePromise = _SyncPromise.resolve({});
		});
		oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$operationMode : OperationMode.Server});
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));
	});

	//*********************************************************************************************
	[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
		QUnit.test("filter: FilterType=" + sFilterType, function (assert) {
			var oBinding,
				oBindingMock = this.mock(ODataListBinding.prototype),
				oContext = Context.create(this.oModel, undefined, "/TEAMS"),
				oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
				aFilters = [oFilter],
				sStaticFilter = "Age gt 18";


			this.stub(ODataListBinding.prototype, "fetchCache", function () {
				this.oCachePromise = _SyncPromise.resolve({});
			});
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
					{$$operationMode : OperationMode.Server});

			oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$filter : sStaticFilter,
				$$operationMode : OperationMode.Server
			});

			oBindingMock.expects("hasPendingChanges").withExactArgs().returns(false);
			this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oFilter))
				.returns(aFilters);
			oBindingMock.expects("reset").on(oBinding).withExactArgs(ChangeReason.Filter);

			// Code under test
			assert.strictEqual(oBinding.filter(oFilter, sFilterType), oBinding, "chaining");

			if (sFilterType === FilterType.Control) {
				assert.strictEqual(oBinding.aFilters, aFilters);
				assert.deepEqual(oBinding.aApplicationFilters, []);
			} else {
				assert.strictEqual(oBinding.aApplicationFilters, aFilters);
				assert.deepEqual(oBinding.aFilters, []);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("filter: resets map of caches by context", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$operationMode : OperationMode.Server
			});

		oBinding.mCacheByContext = {};

		this.mock(oBinding).expects("fetchCache").withExactArgs(undefined);

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

		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();

		// code under test
		oBinding.destroy();

		oBinding = this.oModel.bindList("relative");
		oBinding.setContext(oContext);
		oBinding.aContexts = [oBindingContext];
		oBinding.aContexts[-1] = oTransientBindingContext;
		oBindingContextMock.expects("destroy").withExactArgs();
		oTransientBindingContextMock.expects("destroy").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		this.mock(oBinding.getHeaderContext()).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oCachePromise, undefined);

		oBinding = this.oModel.bindList("/absolute", oContext);
		oBinding.aContexts = [oBindingContext];
		oBinding.aContexts[-1] = oTransientBindingContext;
		oBindingContextMock.expects("destroy").withExactArgs();
		oTransientBindingContextMock.expects("destroy").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		this.mock(oBinding.getHeaderContext()).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("setContext while getContexts() is pending, relative", function (assert) {
		var oBinding = this.oModel.bindList("Equipments", undefined, undefined, undefined,
				{"force own cache" : true}),
				oBindingMock = this.mock(oBinding),
			oContext1 = Context.create(this.oModel, {}, "/Employees('1')"),
			oContext2 = Context.create(this.oModel, {}, "/Employees('2')"),
			oReadPromise = _SyncPromise.resolve(Promise.resolve());

		this.stub(oContext1, "getGroupId");
		this.stub(oContext1, "fetchCanonicalPath").returns(_SyncPromise.resolve("Employees('1')"));
		this.stub(oContext2, "fetchCanonicalPath").returns(_SyncPromise.resolve("Employees('2')"));
		oBinding.setContext(oContext1);
		this.mock(oBinding.oCachePromise.getResult()).expects("read")
			.withExactArgs(0, 5, "$auto", sinon.match.func)
			.callsArg(3)
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
				oBinding,
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

			this.stub(ODataListBinding.prototype, "fetchCache", function () {
				this.oCachePromise = _SyncPromise.resolve(oTargetCache);
			});
			oBinding = oModel.bindList("Equipments", oInitialContext);

			// code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCachePromise.getResult(), oTargetCache);
		});
	});

	//*********************************************************************************************
	QUnit.test("setContext while getContexts() is pending, absolute", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/Employees('1')"),
			oBinding = this.oModel.bindList("/Teams"),
			oResult = {value : [{}]},
			oReadPromise = _SyncPromise.resolve(Promise.resolve(oResult));

		this.mock(oBinding.oCachePromise.getResult()).expects("read")
			.withExactArgs(0, 5, "$auto", sinon.match.func)
			.callsArg(3)
			.returns(oReadPromise);
		//TODO:
		// this.mock(oBinding).expects("createContexts").withExactArgs(sinon.match.same(oResult));
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

		// Promise used instead of assert.async() because else Sinon restores the mocks
		// immediately after the test function returns, but "getDiff" is called later.
		return new Promise(function (resolve, reject) {
			var oBinding,
				oCacheMock = that.getCacheMock(),
				aContexts,
				oData = {value : [{}, {}, {}]},
				aDiffResult = [/*some diff*/],
				oRange = {start : 0, length : 3};

			oBinding = that.oModel.bindList("/EMPLOYEES");
			oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
			that.mock(oBinding).expects("getReadRange")
				.withExactArgs(0, 3, 0)
				.returns(oRange);
			oCacheMock.expects("read")
				.withExactArgs(0, 3, "$auto", sinon.match.func)
				.callsArg(3)
				.returns(_SyncPromise.resolve(Promise.resolve(oData)));
			that.mock(oBinding).expects("getDiff")
				.withExactArgs(sinon.match.same(oData.value), 0)
				.returns(aDiffResult);

			oBinding.attachChange(function (oEvent) {
				assert.strictEqual(oBinding.oDiff.aDiff, aDiffResult);

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
		var aContexts,
			aData = createData(10, 0, true, 10), // Note: oRange is ignored here!
			oParentContext = Context.create(this.oModel, {}, "/TEAMS('4711')"),
			oBinding = this.oModel.bindList("EMPLOYEES", oParentContext),
			oRange = {start : 3, length : 2};

		this.mock(oBinding).expects("getReadRange")
			.withExactArgs(oRange.start, oRange.length, 0)
			.returns(oRange);
		this.mock(oParentContext).expects("fetchValue").withExactArgs("EMPLOYEES")
			.returns(_SyncPromise.resolve(aData));

		// code under test
		aContexts = oBinding.getContexts(oRange.start, oRange.length);

		assert.strictEqual(aContexts.length, 2);
		assert.strictEqual(oBinding.getLength(), 10);
		aContexts.forEach(function(oContext, i) {
			assert.strictEqual(oContext.getIndex(), i + oRange.start);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts() calls fetchValue() returning undefined data", function (assert) {
		var aContexts,
			oParentContext = Context.create(this.oModel, {}, "/TEAMS('4711')"),
			oBinding = this.oModel.bindList("EMPLOYEES", oParentContext),
			oRange = {start : 3, length : 2};

		this.mock(oBinding).expects("getReadRange")
			.withExactArgs(oRange.start, oRange.length, 0)
			.returns(oRange);
		this.mock(oParentContext).expects("fetchValue").withExactArgs("EMPLOYEES")
			.returns(_SyncPromise.resolve());

		// code under test
		aContexts = oBinding.getContexts(oRange.start, oRange.length);

		assert.strictEqual(oBinding.getLength(), 10, "added 10 because length is unknown");
		assert.strictEqual(aContexts.length, 0);
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
	//TODO change signature of createContexts() to pass just oResult.value as 2nd argument, no 3rd

	//*********************************************************************************************
	QUnit.test("createContexts, paging: less data than requested", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", {}/*oContext*/);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 10, "Initial estimated length is 10");

		// code under test: set length and length final flag
		// Note: short reads are handled by _Cache and set $count!
		oBinding.createContexts({start : 20, length : 30}, 29, 20 + 29);

		assert.strictEqual(oBinding.bLengthFinal, true,
			"some controls use bLengthFinal instead of isLengthFinal()");
		assert.strictEqual(oBinding.getLength(), 49);

		// code under test: delete obsolete contexts
		oBinding.createContexts({start : 20, length : 30}, 17, 20 + 17);

		assert.strictEqual(oBinding.isLengthFinal(), true);
		assert.strictEqual(oBinding.getLength(), 37);
		assert.strictEqual(oBinding.aContexts.length, 37);

		// code under test: reset upper boundary
//TODO cannot happen with our _Cache; _Cache doesn't read more than final length elements
		oBinding.createContexts({start : 20, length : 30}, 30);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, Infinity);

		// code under test: no data for some other page is not a change
		assert.strictEqual(oBinding.createContexts({start : 10000, length : 30}, 0), false);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, 10000);
//TODO iMaxLength must be set if iResultLength > 0 || iResultLength === 0 && oRange.start === 0;
// or oRange.start is just after the last known good;
//TODO it can only shrink if iResultLength === 0

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
				oBinding.createContexts({start : 4, length : 10}, 2, 6);
				assert.strictEqual(oBinding.getLength(), 6);
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
				assert.strictEqual(oBinding.getLength(), 5);
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
		oBinding.iMaxLength = 42;
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
		assert.strictEqual(oBinding.iMaxLength, 41, "iMaxLength has been reduced");
	});

	//*********************************************************************************************
	QUnit.test("create: cancel callback", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", null, null, null,
				{$$updateGroupId : "update"}),
			oContext,
			oExpectation,
			oInitialData = {};

		oExpectation = this.mock(oBinding.oCachePromise.getResult()).expects("create")
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
				oContext;

			if (oFixture.bRelative) {
				oBinding = this.oModel.bindList("EMPLOYEES", oBindingContext);
			} else {
				oBinding = this.oModel.bindList("/EMPLOYEES");
			}
			oCacheMock = this.mock(oBinding.oCachePromise.getResult());
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
			oBinding.iMaxLength = 42;

			// code under test
			oContext = oBinding.create(oFixture.oInitialData);

			assert.strictEqual(oContext.getModel(), this.oModel);
			assert.strictEqual(oContext.getBinding(), oBinding);
			assert.strictEqual(oContext.getPath(), "/EMPLOYEES/-1");
			assert.strictEqual(oContext.getIndex(), 0, "view coordinates!");
			assert.strictEqual(oContext.isTransient(), true);
			assert.strictEqual(oBinding.iMaxLength, 42, "transient contexts are not counted");
			assert.strictEqual(oBinding.aContexts[-1], oContext, "Transient context");
			assert.ok(bChangeFired, "Change event fired");

			oCacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

			// code under test
			oBinding.hasPendingChanges();

			assert.throws(function () {
				// code under test
				oBinding.create();
			}, new Error("Must not create twice"));

			if (oFixture.bRelative) {
				assert.throws(function () {
					// code under test
					oBinding.setContext({}/*some different context*/);
				}, new Error("setContext on relative binding is forbidden if created entity " +
				"exists: sap.ui.model.odata.v4.ODataListBinding: /|EMPLOYEES"));
			}
			assert.throws(function () {
				// code under test
				oBinding.create();
			}, new Error("Must not create twice"));

			return oContext.created().then(function () {
				assert.strictEqual(oContext.isTransient(), false);
				assert.strictEqual(oBinding.iMaxLength, 43, "persisted contexts are counted");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("create: relative binding", function (assert) {
		var oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS/1", 1),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext),
			oInitialData = {},
			oExpectation;

		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/TEAMS('02')", "TEAM_2_EMPLOYEES")
			.returns("/TEAMS('02')/TEAM_2_EMPLOYEES");
		this.mock(oContext).expects("fetchCanonicalPath")
			.withExactArgs()
			.returns(_SyncPromise.resolve("/TEAMS('02')"));
		this.mock(oBinding).expects("getUpdateGroupId").returns("updateGroup");
		oExpectation = this.mock(oBinding).expects("createInCache")
			.withExactArgs("updateGroup", /*vPostPath*/sinon.match.object, "",
				sinon.match.same(oInitialData), sinon.match.func)
			.returns(_SyncPromise.resolve());

		// code under test
		oContext = oBinding.create(oInitialData);

		return oContext.created().then(function () {
			assert.strictEqual(oExpectation.args[0][1].getResult(), "TEAMS('02')/TEAM_2_EMPLOYEES");
			assert.throws(function () {
				// code under test
				oBinding.setContext({}/*some different context*/);
			}, new Error("setContext on relative binding is forbidden if created entity " +
				"exists: sap.ui.model.odata.v4.ODataListBinding: /TEAMS/1[1]|TEAM_2_EMPLOYEES"));
		});
	});

	//*********************************************************************************************
	QUnit.test("create: relative binding not yet resolved", function (assert) {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES");

		//code under test
		assert.throws(function () {
			oBinding.create();
		}, new Error("Binding is not yet resolved: " + oBinding.toString()));
	});

	//*********************************************************************************************
	QUnit.test("getContexts after create", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$updateGroupId : "update"
			}),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oContext,
			aContexts;

		oBinding.createContexts({length : 3, start : 0}, 3);

		this.mock(oBinding.oCachePromise.getResult()).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", undefined, sinon.match.func, sinon.match.func)
			.returns(Promise.resolve());
		oContext = oBinding.create();

		oCacheMock.expects("read")
			.withExactArgs(-1, 1, "$auto", sinon.match.func)
			.returns(_SyncPromise.resolve({value : [{}]}));

		// code under test
		aContexts = oBinding.getContexts(0, 1);

		assert.strictEqual(aContexts.length, 1);
		assert.strictEqual(aContexts[0], oContext);
		assert.deepEqual(aContexts, oBinding.getCurrentContexts());

		oCacheMock.expects("read")
			.withExactArgs(-1, 3, "$auto", sinon.match.func)
			.returns(_SyncPromise.resolve({value : [{}, {}, {}]}));

		// code under test
		aContexts = oBinding.getContexts(0, 3);
		assert.strictEqual(aContexts.length, 3);
		assert.strictEqual(aContexts[0], oContext);
		assert.strictEqual(aContexts[1].getPath(), "/EMPLOYEES/0");
		assert.strictEqual(aContexts[2].getPath(), "/EMPLOYEES/1");
		assert.deepEqual(aContexts, oBinding.getCurrentContexts());

		oCacheMock.expects("read")
			.withExactArgs(0, 2, "$auto", sinon.match.func)
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
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oContext,
			aContexts,
			aDiffResult = [/*some diff*/],
			oResult = {value : [{}, {}, {}]};

		oBinding.enableExtendedChangeDetection(false);
		oBinding.createContexts({length : 3, start : 0}, 3);

		this.mock(oBinding.oCachePromise.getResult()).expects("create")
			.withExactArgs("update", "EMPLOYEES", "", undefined, sinon.match.func, sinon.match.func)
			.returns(Promise.resolve());
		oContext = oBinding.create();

		oCacheMock.expects("read")
			.withExactArgs(-1, 3, "$auto", sinon.match.func)
			.returns(_SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("getDiff")
			.withExactArgs(sinon.match.same(oResult.value), -1)
			.returns(aDiffResult);

		// code under test
		aContexts = oBinding.getContexts(0, 3);
		assert.strictEqual(aContexts.length, 3);
		assert.strictEqual(aContexts[0], oContext);
		assert.strictEqual(aContexts[1].getPath(), "/EMPLOYEES/0");
		assert.strictEqual(aContexts[2].getPath(), "/EMPLOYEES/1");
		assert.strictEqual(aContexts.diff, aDiffResult);
	});

	//*********************************************************************************************
	QUnit.test("delete transient entity", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts({length : 4, start : 0}, 3, 3);

		// remove request mock, all operations on client
		oBinding.oCachePromise.getResult().oRequestor.request.restore();

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
	QUnit.test("getDiff, result is shorter", function (assert) {
		var aPreviousData = ["/EMPLOYEES/0/EMPLOYEE_2_EQUIPMENTS/0",
			"/EMPLOYEES/0/EMPLOYEE_2_EQUIPMENTS/1"],
			oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS",
					Context.create(this.oModel, {}, "/EMPLOYEES/0")),
			aDiff = [/*some diff*/],
			aDiffResult,
			aNewData = ["/EMPLOYEES/0/EMPLOYEE_2_EQUIPMENTS/0"],
			aResult = ["/EMPLOYEES/0/EMPLOYEE_2_EQUIPMENTS/0"];

		oBinding.enableExtendedChangeDetection(false);
		oBinding.createContexts({start : 0, length : 2}, 2);

		oBinding.aPreviousData = aPreviousData.slice();

		this.mock(jQuery.sap).expects("arraySymbolDiff")
			.withExactArgs(aPreviousData, aNewData)
			.returns(aDiff);

		// code under test
		aDiffResult = oBinding.getDiff(aResult, 0);

		assert.deepEqual(oBinding.aPreviousData, ["/EMPLOYEES/0/EMPLOYEE_2_EQUIPMENTS/0"]);
		assert.deepEqual(aDiffResult, aDiff);
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
				oMetaContext = {},
				oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
				oHelperMock = this.mock(_Helper),
				oPropertyMetadata = {$Type : "Edm.String"};

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
			oMetaModelMock.expects("getMetaContext")
				.withExactArgs(oBinding.sPath).returns(oMetaContext);
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("SupplierName", sinon.match.same(oMetaContext))
				.returns(_SyncPromise.resolve(oPropertyMetadata));
			oHelperMock.expects("formatLiteral").withExactArgs("SAP", "Edm.String")
				.returns("'SAP'");
			if (oFixture.op === FilterOperator.BT) {
				oHelperMock.expects("formatLiteral").withExactArgs("XYZ", "Edm.String")
					.returns("'XYZ'");
			}
			oBinding.aApplicationFilters = [new Filter("SupplierName", oFixture.op, "SAP", "XYZ")];

			assert.strictEqual(oBinding.fetchFilter().getResult(), oFixture.result);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("fetchFilter: dynamic and static filters, "
				+ (bRelative ? "relative" : "absolute") + " binding", function (assert) {
			var oBinding = this.oModel.bindList(bRelative ? "BP_2_SO" : "/SalesOrderList"),
				oContext = Context.create(this.oModel, {}, "/BusinessPartnerList"),
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
			oBinding.aApplicationFilters = [new Filter("BuyerName", FilterOperator.EQ, "SAP"),
				new Filter("GrossAmount", FilterOperator.LE, 12345)];

			assert.strictEqual(
				oBinding.fetchFilter(oContext, "GrossAmount ge 1000").getResult(),
				"(BuyerName eq 'SAP' and GrossAmount le 12345) and (GrossAmount ge 1000)");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: static filter only", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList");

		assert.strictEqual(
			oBinding.fetchFilter(undefined, "GrossAmount ge 1000").getResult(),
			"GrossAmount ge 1000");
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error invalid operator", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
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
		oBinding.aApplicationFilters = [new Filter("BuyerName", "invalid", "SAP")];

		return oBinding.fetchFilter().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Unsupported operator: invalid");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error no metadata for filter path", function (assert) {
		var oBinding = this.oModel.bindList("/SalesOrderList"),
			sPath = "/SalesOrderList/BuyerName",
			oMetaContext = {
				getPath : function () { return sPath; }
			};

		this.mock(oBinding.oModel.oMetaModel).expects("getMetaContext")
			.withExactArgs(oBinding.sPath).returns(oMetaContext);
		this.mock(oBinding.oModel.oMetaModel).expects("fetchObject")
			.withExactArgs("BuyerName", sinon.match.same(oMetaContext))
			.returns(_SyncPromise.resolve());
		oBinding.aApplicationFilters = [new Filter("BuyerName", FilterOperator.EQ, "SAP")];

		return oBinding.fetchFilter().then(function () {
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
			oBinding.aApplicationFilters = aFilters;

			return oBinding.fetchFilter().then(function (sFilterValue) {
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
		oBinding.aApplicationFilters = aFilters;

		oFilterPromise = oBinding.fetchFilter();

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
	[FilterOperator.All, FilterOperator.Any].forEach(function (sFilterOperator) {
		[{
			description : "no nesting",
			expectedResult : "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1 eq 'value1')",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter("v0/p1", FilterOperator.EQ, "value1"),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}, {
			description : "nested any/all filters",
			expectedResult : "p0/" + sFilterOperator.toLowerCase() + "(v0:"
				+ "v0/p1/" + sFilterOperator.toLowerCase() + "(v1:v1/p2 eq 'value2'))",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p2" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					condition : new Filter("v1/p2", FilterOperator.EQ, "value2"),
					operator : sFilterOperator,
					path : "v0/p1",
					variable : "v1"
				}),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}, {
			description : "nested multi-filter",
			expectedResult : "p0/" + sFilterOperator.toLowerCase()
				+ "(v0:v0/p1 eq 'value1' and v0/p2 eq 'value2')",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Edm.String",
				"p0/p2" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters: [
						new Filter("v0/p1", FilterOperator.EQ, "value1"),
						new Filter("v0/p2", FilterOperator.EQ, "value2")
					],
					and: true
				}),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}, {
			description : "nested multi-filter containing an 'any' filter",
			expectedResult : "p0/" + sFilterOperator.toLowerCase()
			+ "(v0:v0/p1/any(v1:v1/p2 lt 'value1') or v0/p3 eq 'value2')",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p2" : "Edm.String",
				"p0/p3" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters: [
						new Filter({
							condition : new Filter("v1/p2", FilterOperator.LT, "value1"),
							operator : FilterOperator.Any,
							path : "v0/p1",
							variable : "v1"
						}),
						new Filter("v0/p3", FilterOperator.EQ, "value2")
					]
				}),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}, {
			description : "multi filters using same lambda variable",
			expectedResult : "p0/" + sFilterOperator.toLowerCase()
				+ "(v0:v0/p1/any(v1:v1/p3 lt 'value1') or v0/p2/any(v1:v1/p4 gt \'value2\'))",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p3" : "Edm.String",
				"p0/p2" : "Type2",
				"p0/p2/p4" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters: [
						new Filter({
							condition : new Filter("v1/p3", FilterOperator.LT, "value1"),
							operator : FilterOperator.Any,
							path : "v0/p1",
							variable : "v1"
						}),
						new Filter({
							condition : new Filter("v1/p4", FilterOperator.GT, "value2"),
							operator : FilterOperator.Any,
							path : "v0/p2",
							variable : "v1"
						})
					]
				}),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}, {
			description : "nested filter overwrites outer lambda variable",
			expectedResult : "p0/" + sFilterOperator.toLowerCase()
				+ "(v0:v0/p1/" + sFilterOperator.toLowerCase() + "(v0:v0/p2 lt 'value1'))",
			fetchObjects : {
				"p0" : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p2" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					condition : new Filter("v0/p2", FilterOperator.LT, "value1"),
					operator : sFilterOperator,
					path : "v0/p1",
					variable : "v0"
				}),
				operator : sFilterOperator,
				path : "p0",
				variable : "v0"
			})
		}].forEach(function (oFixture) {
			QUnit.test("fetchFilter: " + sFilterOperator + " - " + oFixture.description,
					function (assert) {
				var oBinding = this.oModel.bindList("/Set"),
					aFetchObjectKeys = Object.keys(oFixture.fetchObjects),
					oMetaModelMock = this.mock(oBinding.oModel.oMetaModel);

				oBinding.aApplicationFilters = [oFixture.filter];
				oMetaModelMock.expects("getMetaContext")
					.exactly(aFetchObjectKeys.length)
					.withExactArgs(oBinding.sPath)
					.returns("~");

				aFetchObjectKeys.forEach(function (sFetchObjectPath) {
					oMetaModelMock.expects("fetchObject")
						.withExactArgs(sFetchObjectPath, "~")
						.returns(Promise.resolve({
							$Type : oFixture.fetchObjects[sFetchObjectPath]
						}));
				});

				// code under test
				return oBinding.fetchFilter().then(function (sFilterValue) {
					assert.strictEqual(sFilterValue, oFixture.expectedResult);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: any - without predicate", function (assert) {
		var oBinding = this.oModel.bindList("/Set"),
			oFilter = new Filter({
				operator : FilterOperator.Any,
				path : "p0"
			}),
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel);

		oBinding.aApplicationFilters = [oFilter];
		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("p0", "~").returns(Promise.resolve({
			$Type : "Type0"
		}));

		// code under test
		return oBinding.fetchFilter().then(function (sFilterValue) {
			assert.strictEqual(sFilterValue, "p0/any()");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: application and control filter", function (assert) {
		var oBinding = this.oModel.bindList("/Set"),
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.String"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").twice().withExactArgs(oBinding.sPath)
			.returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("p0.0", "~").returns(oPromise);
		oMetaModelMock.expects("fetchObject").withExactArgs("p1.0", "~").returns(oPromise);
		oBinding.aApplicationFilters = [new Filter("p0.0", FilterOperator.EQ, "v0.0")];
		oBinding.aFilters = [new Filter("p1.0", FilterOperator.EQ, "v1.0")];

		return oBinding.fetchFilter(undefined, "p2.0 eq 'v2.0'").then(function (sFilterValue) {
			assert.strictEqual(sFilterValue,
				"(p0.0 eq 'v0.0') and (p1.0 eq 'v1.0') and (p2.0 eq 'v2.0')");
		});
	});

	//*********************************************************************************************
	QUnit.skip("fetchFilter: filter with encoded path", function (assert) {
		// TODO encode in the filter or not?
		var oBinding = this.oModel.bindList("/Set"),
			oMetaModelMock = this.mock(oBinding.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.Decimal"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("fetchObject").withExactArgs("AmountIn€", "~").returns(oPromise);
		oBinding.aApplicationFilters = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")];

		return oBinding.fetchFilter().then(function (sFilterValue) {
			assert.strictEqual(sFilterValue, "AmountIn€ gt 1000");
		});
	});

	//*********************************************************************************************
	QUnit.test("getOrderby", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			sOrderby = "bar desc";


		assert.strictEqual(oBinding.getOrderby(), "", "empty sorters");
		assert.strictEqual(oBinding.getOrderby(sOrderby), sOrderby);

		oBinding.aSorters = [new Sorter("foo")];

		assert.strictEqual(oBinding.getOrderby(), "foo", "array of sorters");
		assert.strictEqual(oBinding.getOrderby(sOrderby), "foo," + sOrderby);

		oBinding.aSorters = [new Sorter("foo"), new Sorter("bar", true)];

		assert.strictEqual(oBinding.getOrderby(), "foo,bar desc");
		assert.strictEqual(oBinding.getOrderby(sOrderby), "foo,bar desc," + sOrderby);

		oBinding.aSorters = ["foo"];
		assert.throws(function () {
			oBinding.getOrderby();
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

	//*********************************************************************************************
	QUnit.test("getDiff: extendedChangeDetection without bDetectUpdates", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext0 = { getPath : function () {}},
			oContext1 = { getPath : function () {}},
			aContextPaths = ["/-1", "/0", "/1"],
			aDiff = [/*content does not matter*/],
			aDiffResult,
			oMock = this.mock(jQuery.sap),
			aPreviousData = [],
			oTransientContext = { getPath : function () {}};


		oBinding.enableExtendedChangeDetection();
		oBinding.aPreviousData = aPreviousData;
		oBinding.aContexts = [oContext0, oContext1];
		oBinding.aContexts[-1] = oTransientContext;
		this.mock(oTransientContext).expects("getPath").returns("/-1");
		this.mock(oContext0).expects("getPath").returns("/0");
		this.mock(oContext1).expects("getPath").returns("/1");
		oMock.expects("arraySymbolDiff")
			.withExactArgs(sinon.match.same(aPreviousData), aContextPaths)
			.returns(aDiff);

		// code under test
		aDiffResult = oBinding.getDiff([{}, {}, {}], -1);

		assert.strictEqual(aDiffResult, aDiff);
		assert.deepEqual(oBinding.aPreviousData, aContextPaths);
	});

	//*********************************************************************************************
	QUnit.test("getDiff: extendedChangeDetection with bDetectUpdates", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			aData = [{}, {}],
			aDiff = [],
			aDiffResult,
			oJSONMock = this.mock(JSON),
			aPreviousData = [];

		oBinding.enableExtendedChangeDetection(true);
		oBinding.aPreviousData = aPreviousData;
		oJSONMock.expects("stringify").withExactArgs(sinon.match.same(aData[0])).returns("d0");
		oJSONMock.expects("stringify").withExactArgs(sinon.match.same(aData[1])).returns("d1");
		this.mock(jQuery.sap).expects("arraySymbolDiff")
			.withExactArgs(sinon.match.same(aPreviousData), ["d0", "d1"])
			.returns(aDiff);

		// code under test
		aDiffResult = oBinding.getDiff(aData, 0);

		assert.strictEqual(aDiffResult, aDiff);
		assert.deepEqual(oBinding.aPreviousData, ["d0", "d1"]);
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: relative w/o initial mParameters", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined, "noCache");

		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve("/TEAMS('42')/TEAM_2_EMPLOYEES"));

		// code under test;
		oBinding.changeParameters({$filter : "bar"});

		assert.ok(oBinding.oCachePromise.getResult() !== undefined,
			"Binding gets cache after changeParamters");
	});

	//*********************************************************************************************
	QUnit.test("doFetchQueryOptions", function (assert) {
		var aApplicationFilters = [],
			aSorters = [],
			oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oBinding,
			oBindingMock,
			mQueryOptions = {};

		this.stub(ODataListBinding.prototype, "fetchCache", function () {
			this.oCachePromise = _SyncPromise.resolve();
		});
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext, aSorters, aApplicationFilters,
			{"$filter" : "staticFilter", "$orderby" : "staticSorter"});
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("getOrderby").withExactArgs("staticSorter")
			.returns("resolvedOrderby");
		oBindingMock.expects("fetchFilter")
			.withExactArgs(sinon.match.same(oContext), "staticFilter")
			.returns(_SyncPromise.resolve("resolvedFilter"));
		oBindingMock.expects("mergeQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.mQueryOptions), "resolvedOrderby",
				"resolvedFilter")
			.returns(mQueryOptions);

		// code under test
		assert.strictEqual(oBinding.doFetchQueryOptions(oContext).getResult(), mQueryOptions);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bAutoExpandSelect, i) {
		QUnit.test("doCreateCache - binding with parameters, " + i, function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$$operationMode : OperationMode.Server}),
				oCache = {},
				mCacheQueryOptions = {};

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;

			this.mock(oBinding).expects("getQueryOptionsForPath").never();
			this.mock(_Cache).expects("create")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
					sinon.match.same(mCacheQueryOptions), bAutoExpandSelect)
				.returns(oCache);

			// code under test
			assert.strictEqual(oBinding.doCreateCache("EMPLOYEES", mCacheQueryOptions), oCache);
		});
	});

	//*********************************************************************************************
	[{ // no filter or sort in inherited query options
		mDynamicQueryOptionsWithModelOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc"
		},
		mInheritedQueryOptions : {
			$select : "ID,Name,Age"
		},
		mExpectedQueryOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc",
			$select : "ID,Name,Age"
		}
	}, { // no filter or sort in dynamic query options
		mDynamicQueryOptionsWithModelOptions : {
			"sap-client" : "111"
		},
		mInheritedQueryOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc",
			$select : "ID,Name,Age"
		},
		mExpectedQueryOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc",
			"sap-client" : "111",
			$select : "ID,Name,Age"
		}
	}, { // filter and sort in both dynamic and inherited query options
		mDynamicQueryOptionsWithModelOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc",
			"sap-client" : "111"
		},
		mInheritedQueryOptions : {
			$expand : {
				"EQUIPMENT" : {
					$select : "Category"
				}
			},
			$filter : "Age gt 20",
			$orderby : "Name desc",
			$select : "ID,Name,Age"
		},
		mExpectedQueryOptions : {
			$expand : {
				"EQUIPMENT" : {
					$select : "Category"
				}
			},
			$filter : "(Age lt 60) and (Age gt 20)",
			$orderby : "Name asc,Name desc",
			"sap-client" : "111",
			$select : "ID,Name,Age"
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("doCreateCache - inherit query options - Test " + i, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES"),
			oCache = {};

			this.mock(oBinding).expects("getQueryOptionsForPath")
				.withExactArgs("", sinon.match.same(oContext))
				.returns(oFixture.mInheritedQueryOptions);
			this.mock(_Cache).expects("create")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor),
					"/TEAMS('4711')/TEAM_2_EMPLOYEES", oFixture.mExpectedQueryOptions, false)
				.returns(oCache);

			// code under test
			assert.strictEqual(oBinding.doCreateCache("/TEAMS('4711')/TEAM_2_EMPLOYEES",
					oFixture.mDynamicQueryOptionsWithModelOptions, oContext),
				oCache);
		});
	});

	//*********************************************************************************************
	QUnit.test("header context created in c'tor ", function (assert) {
		var oBinding;

		// code under text
		oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.deepEqual(oBinding.getHeaderContext(),
			Context.create(this.oModel, oBinding, "/EMPLOYEES"),
			"Header contexts created in c'tor");

		// code under test
		oBinding = this.oModel.bindList("EMPLOYEES");

		assert.ok(oBinding.getHeaderContext() === null);
	});

	//*********************************************************************************************
	QUnit.test("getHeaderContext", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oHeaderContext;

		// code under test
		oHeaderContext = oBinding.getHeaderContext();

		assert.strictEqual(oHeaderContext.getBinding(), oBinding);
		assert.strictEqual(oHeaderContext.getPath(), "/EMPLOYEES");

		oBinding = this.oModel.bindList("EMPLOYEES");

		// code under test
		assert.ok(oBinding.getHeaderContext() === null);

		oBinding.setContext(oContext);
		oHeaderContext = oBinding.getHeaderContext();

		assert.strictEqual(oHeaderContext.getBinding(), oBinding);
		assert.strictEqual(oHeaderContext.getPath(), "/TEAMS/EMPLOYEES");
		// TODO How do dependent bindings learn of the changed context?
	});
});

//TODO integration: 2 entity sets with same $expand, but different $select
//TODO support suspend/resume
//TODO Provide "array" methods that can deal with -1 index (splice, forEach, length) and use it
//     instead of if {} else {} code fragments
//TODO extended change detection:
//     Wir sollten auch dafür sorgen, dass die Antwort auf diesen "change"-Event dann keinen Diff enthält. So macht es v2, und das haben wir letzte Woche erst richtig verstanden.
