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
	 * @return {Promise}
	 *   the promise which is fulfilled as specified
	 */
	function createResult(iLength, iStart, bDrillDown) {
		return _SyncPromise.resolve(new Promise(function (resolve, reject) {
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
			resolve(bDrillDown ? oData.value : oData);
		}));
	}

	/**
	 * Calls getContexts and getCurrentContexts and checks whether both return the right
	 * contexts
	 *
	 * @param {object} assert QUnit's assert object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oListBinding the list binding to test with
	 * @param {number} iStart the start index
	 * @param {number} iLength the length
	 * @param {number} [iResultLength=iLength]
	 *   the expected length of the array returned by getCurrentContexts
	 */
	function getContexts(assert, oListBinding, iStart, iLength, iResultLength) {
		var aContexts = oListBinding.getContexts(iStart, iLength),
			aCurrentContexts = oListBinding.getCurrentContexts(),
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
					refresh : function () {},
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
			oContext = {
				toString : function () {return "/TEAMS(Team_ID='TEAM01')";}
			};

		assert.strictEqual(oBinding.toString(), sClassName + ": /EMPLOYEES", "absolute");

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES");

		assert.strictEqual(oBinding.toString(), sClassName + ": undefined|TEAM_2_EMPLOYEES",
			"relative, unresolved");

		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /TEAMS(Team_ID='TEAM01')|TEAM_2_EMPLOYEES", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("reset", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		// set members which should be reset to arbitrary values
		oBinding.aContexts = [{}];
		oBinding.iCurrentBegin = 10; oBinding.iCurrentEnd = 19;
		oBinding.iMaxLength = 42;
		oBinding.bLengthFinal = true;

		// code under test
		oBinding.reset();

		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.iMaxLength, Infinity);
		assert.strictEqual(oBinding.iCurrentBegin, 0);
		assert.strictEqual(oBinding.iCurrentEnd, 0);
		assert.strictEqual(oBinding.isLengthFinal(), false);
	});

	//*********************************************************************************************
	QUnit.test("bindList with OData query options", function (assert) {
		var oBinding,
			oContext = {},
			oError = new Error("Unsupported ..."),
			oHelperMock,
			mParameters = {"$expand" : "foo", "$orderby" : "bar", "$select" : "bar",
				"custom" : "baz"},
			mQueryOptions = {"$orderby" : "bar"};

		oHelperMock = this.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mParameters), ["$expand", "$filter", "$orderby", "$select"])
			.returns(mQueryOptions);
		oHelperMock.expects("buildOrderbyOption")
			.withExactArgs([], mQueryOptions.$orderby)
			.returns(mQueryOptions.$orderby);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				sinon.match.same(mQueryOptions));
		this.spy(ODataListBinding.prototype, "reset");

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", oContext, undefined, undefined, mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES");
		assert.strictEqual(oBinding.mParameters, undefined);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(oBinding.aDiff, []);
		assert.deepEqual(oBinding.aPreviousData, []);

		//no call to buildOrderbyOption for binding with relative path
		oHelperMock.expects("buildOrderbyOption").never();

		// code under test
		oBinding = this.oModel.bindList("EMPLOYEE_2_TEAM");

		assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache property is set");
		assert.strictEqual(oBinding.oCache, undefined, "oCache property is undefined");
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
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

			this.spy(_ODataHelper, "toArray");
			this.spy(_ODataHelper, "mergeQueryOptions");
			oHelperMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(oModel.mUriParameters),
					sinon.match.same(oFixture.mParameters),
					["$expand", "$filter", "$orderby", "$select"])
				.returns(oFixture.buildQueryOptionResult);
			oHelperMock.expects("buildOrderbyOption")
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
			assert.ok(_ODataHelper.toArray.calledWithExactly(oFixture.aSorters));
			assert.ok(_ODataHelper.mergeQueryOptions.calledWithExactly(oBinding.mQueryOptions,
				oFixture.buildOrderbyResult), "mergeQueryOptions called");
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
			oBindingForCreateListCacheProxy,
			oCacheProxy = {},
			mExpectedbuildQueryOptions = {},
			oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
			aFilters = [oFilter],
			oHelperMock = this.mock(_ODataHelper),
			mQueryParameters = {
				$$operationMode : OperationMode.Server
			};

		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter)).returns(aFilters);
		oHelperMock.expects("toArray").withExactArgs(undefined).returns([]);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mQueryParameters),
				["$expand", "$filter", "$orderby", "$select"])
			.returns(mExpectedbuildQueryOptions);
		oHelperMock.expects("buildOrderbyOption").never();
		this.mock(_Cache).expects("create").never();
		// no mock because oBinding is unknown in advance, even when the stub is called
		this.stub(_ODataHelper, "createListCacheProxy", function (_oBinding, oContext) {
			oBindingForCreateListCacheProxy = _oBinding;
			assert.strictEqual(oContext, undefined);
			return oCacheProxy;
		});

		// code under test
		oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, oFilter,
			mQueryParameters);

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.mQueryOptions, mExpectedbuildQueryOptions);
		assert.strictEqual(oBinding.oCache, oCacheProxy);
		assert.strictEqual(oBindingForCreateListCacheProxy, oBinding);
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
		var oContext = {},
			mQueryOptions = {};

		this.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				undefined, ["$expand", "$filter", "$orderby", "$select"])
			.returns(mQueryOptions);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				sinon.match.same(mQueryOptions));

		// code under test
		this.oModel.bindList("/EMPLOYEES", oContext);
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
			oPromise = createResult(oRange.length, 0, true);

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
		this.mock(oControl.getObjectBinding()).expects("fetchValue")
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
		this.mock(_ODataHelper).expects("createListCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.same(oContext))
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
			oPromise = Promise.resolve();

		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oPromise);

		// code under test
		oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.deepEqual(oBinding.getContexts(), []);
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/bar"),
			oListBinding;

		oListBinding = this.oModel.bindList("foo", oContext);
		this.mock(oListBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		assert.strictEqual(oListBinding.initialize(), undefined, "no chaining");
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oListBinding = this.oModel.bindList("Suppliers");

		this.mock(oListBinding).expects("_fireChange").never();

		oListBinding.initialize();
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path without parameters", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/bar"),
			oListBinding = this.oModel.bindList("Suppliers");

		this.mock(oListBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context});
		this.mock(_ODataHelper).expects("createCacheProxy").never();

		oListBinding.setContext(oContext);
	});

	//*********************************************************************************************
	QUnit.test("getContexts called directly provides contexts as return value and in change event",
		function (assert) {
		var done = assert.async(),
			oCacheMock = this.getCacheMock(),
			oContext = {},
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oListBindingMock = this.mock(oListBinding),
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

			if (bSync && iRangeIndex < oFixture.length - 1) {
				oCacheMock.expects("read")
					.withExactArgs(iStart, iLength, "$auto", undefined, sinon.match.func)
					.callsArg(4)
					.returns(createResult(iLength));
			}

			// code under test, must not ruin aContexts
			oListBinding.setContext(oContext);
			assert.strictEqual(oListBinding.oContext, oContext);

			// code under test, read synchronously with previous range
			aContexts = oListBinding.getContexts(iStart, iLength);

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
					oListBindingMock.expects("fetchValue")
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
		oListBinding.attachChange(onChange);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("getContexts sends no change event on failure of _Cache#read and logs error, "
				+ "path is relative: " + bRelative, function (assert) {
			var oCacheMock,
				oContext = Context.create(this.oModel, {}, "/EMPLOYEES(1)"),
				oContextMock,
				oError = new Error("Intentionally failed"),
				oListBinding,
				oPromise = Promise.reject(oError),
				sResolvedPath = bRelative
					? "/service/EMPLOYEES(1)/TEAM_2_EMPLOYEES"
					: "/service/EMPLOYEES";

			if (bRelative) {
				oContextMock = this.mock(oContext);
				oContextMock.expects("fetchValue").returns(createResult(2));
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

			oListBinding = this.oModel.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
					oContext);
			oListBinding.attachChange(function () {
				// code under test
				var aContexts = oListBinding.getContexts(1, 2); // failing read

				assert.strictEqual(aContexts.length, 1, "contexts from first read still exist");
			});
			oListBinding.getContexts(0, 2); // successful read

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
			var oContext = {
					fetchValue : function () {
						assert.ok(false, "context must be ignored for absolute bindings");
					}
				},
				oListBinding,
				oPromise = createResult(oFixture.result);

			this.getCacheMock().expects("read")
				.withExactArgs(oFixture.start, 30, "$direct", undefined, sinon.match.func)
				.callsArg(4)
				.returns(oPromise);
			oListBinding = this.oModel.bindList("/EMPLOYEES", oContext, undefined, undefined,
				{$$groupId : "$direct"});
			this.mock(oListBinding).expects("_fireChange")
				.exactly(oFixture.changeEvent === false ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Change});

			assert.strictEqual(oListBinding.isLengthFinal(), false, "Length is not yet final");
			assert.strictEqual(oListBinding.getLength(), 10, "Initial estimated length is 10");

			getContexts(assert, oListBinding, oFixture.start, 30);

			// attach then handler after ODataListBinding attached its then handler to be
			// able to check length and isLengthFinal
			return oPromise.then(function () {
				// if there are less entries returned than requested then final length is known
				assert.strictEqual(oListBinding.isLengthFinal(), oFixture.isFinal);
				assert.strictEqual(oListBinding.getLength(), oFixture.length);
				assert.deepEqual(oListBinding.getCurrentContexts(),
					oListBinding.aContexts.slice(oFixture.start, oFixture.length));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("threshold", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oDataHelperMock = this.mock(_ODataHelper),
			oListBinding,
			oPromise,
			iReadLength = 135,
			iReadStart = 40;

		oListBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{$$groupId : "$direct"});


		oDataHelperMock.expects("getReadRange")
			.withExactArgs(sinon.match.same(oListBinding.aContexts), 100, 15, 60, Infinity)
			.returns({start : iReadStart, length : iReadLength});

		oPromise = createResult(iReadLength);
		oCacheMock.expects("read")
			.withExactArgs(iReadStart, iReadLength, "$direct", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oPromise);

		// code under test
		oListBinding.getContexts(100, 15, 60);

		return oPromise.then(function () {
			var i,n;

			// check that data is inserted at right place
			for (i = 0; i < iReadStart; i++) {
				assert.strictEqual(oListBinding.aContexts[i], undefined, "Expected context: " + i);
			}
			for (i = iReadStart, n = iReadStart + iReadLength; i < n; i++) {
				assert.ok(oListBinding.aContexts[i] !== undefined, "Expected context: " + i);
			}
			assert.strictEqual(oListBinding.aContexts[n], undefined, "Expected context: " + n);

			// default threshold to 0
			oDataHelperMock.expects("getReadRange")
				.withExactArgs(sinon.match.same(oListBinding.aContexts), 100, 15, 0, Infinity)
				.returns();

			// code under test
			oListBinding.getContexts(100, 15);

			// default negative threshold to 0
			oDataHelperMock.expects("getReadRange")
				.withExactArgs(sinon.match.same(oListBinding.aContexts), 100, 15, 0, Infinity)
				.returns();

			// code under test
			oListBinding.getContexts(100, 15, -15);
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
			var oCacheMock = this.getCacheMock(),
				oListBinding = this.oModel.bindList("/EMPLOYEES"),
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

			assert.deepEqual(oListBinding.getCurrentContexts(), []);
			oListBinding.getContexts(20, 30); // creates cache

			return oReadPromise1.then(function () {
				assert.deepEqual(oListBinding.getCurrentContexts(),
					oListBinding.aContexts.slice(20, 35));
				assert.strictEqual(oListBinding.isLengthFinal(), true);
				assert.strictEqual(oListBinding.getLength(), 35);

				getContexts(assert, oListBinding, oFixture.start, 30, oFixture.curr);

				return oReadPromise2;
			}).then(function () {
				assert.deepEqual(oListBinding.getCurrentContexts(),
					oListBinding.aContexts.slice(oFixture.start, oFixture.start + oFixture.result));
				assert.strictEqual(oListBinding.isLengthFinal(), oFixture.isFinal, "final");
				assert.strictEqual(oListBinding.getLength(), oFixture.len);
				assert.strictEqual(oListBinding.aContexts.length,
					oFixture.len - (oFixture.isFinal ? 0 : 10), "Context array length");
				for (i = oFixture.start, n = oFixture.start + oFixture.result; i < n; i++) {
					assert.strictEqual(oListBinding.aContexts[i].sPath,
						"/EMPLOYEES/" + i, "check content");
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("paging: full read before length; length at boundary", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
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

		oListBinding.getContexts(20, 30);

		return oReadPromise1.then(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), false);
			assert.strictEqual(oListBinding.getLength(), 60);

			oListBinding.getContexts(0, 30); // read more data from beginning

			return oReadPromise2;
		}).then(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), false, "still not final");
			assert.strictEqual(oListBinding.getLength(), 60, "length not reduced");

			oListBinding.getContexts(50, 30); // no more data; length at paging boundary

			return oReadPromise3;
		}).then(function () {
			assert.strictEqual(oListBinding.isLengthFinal(), true, "now final");
			assert.strictEqual(oListBinding.getLength(), 50, "length at boundary");
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding).expects("refreshInternal").withExactArgs("myGroup");

		oBinding.refresh("myGroup");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		QUnit.test("refreshInternal: " + (bRelative ? "relative" : "absolute"), function (assert) {
			var oCache = {
					deregisterChange : function () {},
					refresh : function () {}
				},
				oChild1 = {refreshInternal : function () {}},
				oChild2 = {refreshInternal : function () {}},
				oChild3 = {}, // refreshInternal missing, e.g. ODataPropertyBinding
				oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
				oHelperMock = this.mock(_ODataHelper),
				oListBinding;

			if (bRelative) {
				oHelperMock.expects("createListCacheProxy").returns(oCache);
			} else {
				this.mock(_Cache).expects("create").returns(oCache);
			}

			oListBinding = this.oModel.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
				oContext, undefined, undefined, {/*mParameters*/});
			if (bRelative) {
				this.mock(oCache).expects("deregisterChange").withExactArgs();
				oHelperMock.expects("createListCacheProxy")
					.withExactArgs(sinon.match.same(oListBinding), sinon.match.same(oContext))
					.returns(oCache);
				this.mock(oCache).expects("refresh").never();
				oListBinding.mCacheByContext = {};
			} else {
				this.mock(oCache).expects("refresh");
			}

			this.mock(oListBinding).expects("reset").withExactArgs();
			this.mock(oListBinding).expects("_fireRefresh")
				.withExactArgs({reason : ChangeReason.Refresh});
			this.mock(this.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oListBinding))
				.returns([oChild1, oChild2, oChild3]);
			this.mock(oChild1).expects("refreshInternal").withExactArgs("myGroup");
			this.mock(oChild2).expects("refreshInternal").withExactArgs("myGroup");

			//code under test
			oListBinding.refreshInternal("myGroup");

			assert.strictEqual(oListBinding.mCacheByContext, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: no own cache", function (assert) {
		var oChild1 = { refreshInternal : function () {} },
			oContext = Context.create(this.oModel, {}, "/TEAMS('1')"),
			oListBinding = this.oModel.bindList("TEAM_2_EMPLOYEES"),
			oListBindingMock = this.mock(oListBinding),
			oReadPromise = createResult(9),
			that = this;

		oListBinding.setContext(oContext);
		// change event during getContexts
		oListBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		// refresh event during refresh
		oListBindingMock.expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Refresh});
		this.mock(oContext).expects("fetchValue").withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oReadPromise);

		oListBinding.getContexts(0, 10);

		return oReadPromise.then(function () {
			that.mock(that.oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oListBinding))
				.returns([oChild1]);
			that.mock(oChild1).expects("refreshInternal").withExactArgs("myGroup");

			//code under test
			oListBinding.refreshInternal("myGroup");
		});
	});
	// TODO: Call reset and fireRefresh on relative bindings w/o cache?

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES");

		this.mock(oListBinding).expects("hasPendingChanges").returns(true);

		assert.throws(function () {
			oListBinding.refresh();
		}, new Error("Cannot refresh due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: invalid application group", function (assert) {
		var oBinding,
			oCache = {
				refresh : function () {}
			},
			oError = new Error();

		this.mock(_Cache).expects("create").returns(oCache);
		oBinding = this.oModel.bindList("/EMPLOYEES");
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("$Invalid").throws(oError);
		this.mock(oCache).expects("refresh").never();

		// code under test
		assert.throws(function () {
			oBinding.refresh("$Invalid");
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
	QUnit.test("refresh cancels pending getContexts", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oError = new Error(),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oListBindingMock = this.mock(oListBinding),
			oReadPromise = Promise.reject(oError);

		// change event during getContexts
		oListBindingMock.expects("_fireChange").never();
		oListBindingMock.expects("fireDataReceived").withExactArgs();
		oError.canceled = true;
		oCacheMock.expects("read").withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
			.callsArg(4).returns(oReadPromise);
		oCacheMock.expects("refresh");

		oListBinding.getContexts(0, 10);
		oListBinding.refresh();

		return oReadPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("getContexts fires dataRequested and dataReceived events", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			fnResolveRead,
			oReadPromise,
			that = this;

		// do not move this assignment to the var declaration as this breaks Eclipse's Compare With
		oReadPromise = new Promise(function (fnResolve) {fnResolveRead = fnResolve;});
		// read returns an unresolved Promise to be resolved by submitBatch; otherwise this Promise
		// would be resolved before the rendering and dataReceived would be fired before
		// dataRequested
		this.mock(oListBinding.oCache).expects("read").callsArg(4).returns(oReadPromise);
		this.stub(this.oModel.oRequestor, "submitBatch", function () {
			var oListBindingMock = that.mock(oListBinding);

			// These events must be fired _after_ submitBatch
			oListBindingMock.expects("fireEvent")
				.withExactArgs("dataRequested", undefined);
			oListBindingMock.expects("fireEvent")
				.withExactArgs("change", {reason : "change"});
			that.stub(oListBinding, "fireDataReceived", function () {
				assert.strictEqual(oListBinding.aContexts.length, 10, "data already processed");
			});

			// submitBatch resolves the promise of the read
			fnResolveRead(createResult(10));
			return Promise.resolve();
		});

		oListBinding.getContexts(0, 10);

		return oReadPromise.then(function () {
			sinon.assert.calledOnce(oListBinding.fireDataReceived);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts - error handling for dataRequested/dataReceived", function (assert) {
		var oError = new Error("Expected Error"),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oReadPromise = Promise.reject(oError);

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to get contexts for /service/EMPLOYEES with start index 0 and length 3",
			sClassName, sinon.match.same(oError));
		this.mock(oListBinding.oCache).expects("read").callsArg(4).returns(oReadPromise);
		this.mock(oListBinding).expects("fireDataReceived")
			.withExactArgs({error : oError});

		oListBinding.getContexts(0, 3);
		return oReadPromise.catch(function () {
			assert.deepEqual(oListBinding.getCurrentContexts(), [undefined, undefined, undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.test("getContexts - concurrent call with read errors", function (assert) {
		var oCacheMock,
			oError = new Error("Expected Error"),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			fnRejectRead,
			oReadPromise = new Promise(function (fn, fnReject) {fnRejectRead = fnReject;}),
			that = this;

		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to get contexts for /service/EMPLOYEES with start index 0 and length 10",
			sClassName, sinon.match.same(oError));
		oCacheMock = this.mock(oListBinding.oCache);
		oCacheMock.expects("read").callsArg(4).returns(oReadPromise);
		oCacheMock.expects("read").returns(oReadPromise);
		this.stub(this.oModel.oRequestor, "submitBatch", function () {
			that.mock(oListBinding).expects("fireEvent")
				.withExactArgs("dataRequested", undefined);
			that.mock(oListBinding).expects("fireDataReceived")
				.withExactArgs({error : oError});

			// submitBatch resolves the promise of the read
			fnRejectRead(oError);
			return Promise.resolve();
		});

		oListBinding.getContexts(0, 10);
		// call it again in parallel
		oListBinding.getContexts(0, 10);

		return oReadPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oListener = {},
			oPromise,
			oReadResult = {};

		this.mock(oListBinding.oCache).expects("read")
			.withExactArgs(42, 1, undefined, "bar", undefined, oListener)
			.returns(_SyncPromise.resolve(oReadResult));

		oPromise = oListBinding.fetchValue("bar", oListener, 42);
		assert.ok(oPromise.isFulfilled());
		return oPromise.then( function (oResult){
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
		var oContext = Context.create(this.oModel, {}, "/foo"),
			oListBinding,
			oListener = {},
			oPromise = {};

		oListBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
		this.mock(_Helper).expects("buildPath").withExactArgs("TEAM_2_EMPLOYEES", 42, "bar")
			.returns("~");
		this.mock(oContext).expects("fetchValue").withExactArgs("~", sinon.match.same(oListener))
			.returns(oPromise);

		assert.strictEqual(oListBinding.fetchValue("bar", oListener, 42), oPromise);
	});
	//TODO provide iStart, iLength parameter to fetchValue to support paging on nested list

	//*********************************************************************************************
	["/TEAMS/1", "/TEAMS/1/TEAM_2_EMPLOYEES/2"].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding: " + sPath, function (assert) {
			var oContext = Context.create(this.oModel, undefined, "/TEAMS/1"),
				oListBinding,
				oPromise = {};

			oListBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext);
			this.mock(oContext).expects("fetchAbsoluteValue")
				.withExactArgs(sPath).returns(oPromise);

			assert.strictEqual(oListBinding.fetchAbsoluteValue(sPath), oPromise);
		});
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

			this.mock(_ODataHelper).expects("createListCacheProxy").returns(oCacheProxy);
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

		this.mock(_ODataHelper).expects("createListCacheProxy").returns(oCacheProxy);
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
			var oListBinding = this.oModel.bindList("/SalesOrderList", null, null, null,
					{$$updateGroupId : "myUpdateGroup"}),
				sPath = "0/SO_2_SOITEM/42",
				oResult = {};

			this.mock(oListBinding).expects("fireEvent").never();
			this.mock(oListBinding.oCache).expects("update")
				.withExactArgs(sGroupId || "myUpdateGroup", "bar", Math.PI, "edit('URL')", sPath)
				.returns(Promise.resolve(oResult));
			this.mock(this.oModel).expects("addedRequestToGroup")
				.withExactArgs(sGroupId || "myUpdateGroup");

			// code under test
			return oListBinding.updateValue(sGroupId, "bar", Math.PI, "edit('URL')", sPath)
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("updateValue: relative binding", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/foo"),
			oListBinding,
			oResult = {};

		oListBinding = this.oModel.bindList("SO_2_SOITEM", oContext);
		this.mock(oListBinding).expects("fireEvent").never();
		this.mock(oListBinding).expects("getGroupId").never();
		this.mock(_Helper).expects("buildPath").withExactArgs("SO_2_SOITEM", "42").returns("~42~");
		this.mock(oContext).expects("updateValue")
			.withExactArgs("up", "bar", Math.PI, "edit('URL')", "~42~")
			.returns(Promise.resolve(oResult));
		this.mock(this.oModel).expects("addedRequestToGroup").never();

		// code under test
		return oListBinding.updateValue("up", "bar", Math.PI, "edit('URL')", "42")
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
		var oContext = Context.create(this.oModel, {}, "/foo"),
			oListBinding,
			oListener = {};

		oListBinding = this.oModel.bindList("SO_2_SOITEM", oContext);
		this.mock(_Helper).expects("buildPath").withExactArgs("SO_2_SOITEM", 1, "foo").returns("~");
		this.mock(oContext).expects("deregisterChange")
			.withExactArgs("~", sinon.match.same(oListener));

		oListBinding.deregisterChange("foo", oListener, 1);
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
	QUnit.test("getContexts calls addedRequestToGroup", function (assert) {
		var oListBinding;

		this.stub(_Cache, "create", function (oRequestor, sUrl, mQueryOptions) {
			return {
				read: function (iIndex, iLength, sGroupId, sPath, fnDataRequested) {
					fnDataRequested();
					return createResult(iLength, iIndex);
				}
			};
		});
		this.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("$auto", sinon.match.func).callsArg(1);

		oListBinding = this.oModel.bindList("/EMPLOYEES");

		return oListBinding.getContexts(0, 10);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oListBinding.getDistinctValues();
		}, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));

		assert.throws(function () { //TODO implement
			oListBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataListBinding#isInitial"));

		assert.throws(function () { //TODO implement
			oListBinding.resume();
		}, new Error("Unsupported operation: v4.ODataListBinding#resume"));

		assert.throws(function () { //TODO implement
			oListBinding.suspend();
		}, new Error("Unsupported operation: v4.ODataListBinding#suspend"));
	});
	//TODO errors on _fireFilter(mArguments) and below in Wiki

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var mEventParameters = {},
			oListBinding,
			oReturn = {};

		this.mock(ListBinding.prototype).expects("attachEvent")
			.withExactArgs("change", mEventParameters).returns(oReturn);

		oListBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oListBinding.attachEvent("filter");
		}, new Error("Unsupported event 'filter': v4.ODataListBinding#attachEvent"));

		assert.throws(function () {
			oListBinding.attachEvent("sort");
		}, new Error("Unsupported event 'sort': v4.ODataListBinding#attachEvent"));

		assert.strictEqual(oListBinding.attachEvent("change", mEventParameters), oReturn);
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
	QUnit.test("getContexts uses group ID from binding parameter", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "myGroup"}),
			oReadPromise = createResult(0);

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 10, "myGroup", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		this.mock(oBinding.oModel).expects("addedRequestToGroup")
			.withExactArgs("myGroup", sinon.match.func)
			.callsArg(1);

		oBinding.getContexts(0, 10);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("getContexts uses refresh group ID", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$groupId : "$direct"}),
			oReadPromise = createResult(0);

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs(0, 10, "myGroup", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		this.mock(oBinding.oModel).expects("addedRequestToGroup")
			.withExactArgs("myGroup", sinon.match.func)
			.callsArg(1);
		oBinding.sRefreshGroupId = "myGroup";

		oBinding.getContexts(0, 10);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("getContexts: data received handler throws error", function (assert) {
		var oError = new Error("Expected"),
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oReadPromise = createResult(0);

		this.mock(oListBinding.oCache).expects("read")
			.withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
			.callsArg(4).returns(oReadPromise);
		// check that error in data received handler is logged
		this.oLogMock.expects("error").withExactArgs(oError.message,
			sinon.match(function (sDetails) {
				return sDetails === oError.stack;
			}), sClassName);
		oListBinding.attachDataReceived(function () {
			throw oError;
		});

		// code under test
		oListBinding.getContexts(0, 10);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("sync getCurrentContexts while reading", function (assert) {
		var oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oReadPromise1 = createResult(10),
			oCacheMock = this.mock(oListBinding.oCache);

		oCacheMock.expects("read")
			.withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
			.callsArg(4).returns(oReadPromise1);

		oListBinding.getContexts(0, 10);

		return oReadPromise1.then(function () {
			var oReadPromise2 = createResult(0);

			oCacheMock.expects("read")
				.withExactArgs(10, 5, "$auto", undefined, sinon.match.func)
				.callsArg(4).returns(oReadPromise2);

			oListBinding.getContexts(10, 5);

			oListBinding.getContexts(0, 5);
			return oReadPromise2.then(function () {
				assert.deepEqual(oListBinding.getCurrentContexts(),
					oListBinding.aContexts.slice(0, 5));
			});
		});
	});

	//*********************************************************************************************
	[
		{
			mParameters : {$$operationMode : OperationMode.Server},
			queryOptions : {"sap-client" : "111"},
			vSorters : undefined,
			vSortersExpected : []
		}, {
			mParameters : {$$operationMode : OperationMode.Server},
			queryOptions : {$orderby : "foo", "sap-client" : "111"},
			vSorters : new Sorter("foo"),
			vSortersExpected : [new Sorter("foo")]
		}, {
			mParameters : {$$operationMode : OperationMode.Server, $orderby : "bar"},
			queryOptions : {$orderby : "foo,bar", "sap-client" : "111"},
			vSorters : [new Sorter("foo")],
			vSortersExpected : [new Sorter("foo")]
		}, {
			oModel : new ODataModel({
				operationMode : OperationMode.Server,
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			mParameters : {$orderby : "bar"},
			queryOptions : {$orderby : "foo,bar", "sap-client" : "111"},
			vSorters : [new Sorter("foo")],
			vSortersExpected : [new Sorter("foo")]
		}
	].forEach(function (oFixture) {
		QUnit.test("sort: vSorters = " + JSON.stringify(oFixture.vSorters) + " and mParameters = "
				+ JSON.stringify(oFixture.mParameters), function (assert) {
			var oCache = { read : function () {} },
				done = assert.async(),
				oListBinding,
				oModel = oFixture.oModel || this.oModel;

			oListBinding = oModel.bindList("/EMPLOYEES", undefined, undefined, undefined,
				oFixture.mParameters);

			this.mock(_Cache).expects("create").withExactArgs(
				sinon.match.same(oModel.oRequestor), "EMPLOYEES", oFixture.queryOptions)
				.returns(oCache);
			this.mock(oCache).expects("read")
				.withExactArgs(0, 10, "$auto", undefined, sinon.match.func)
				.callsArg(4)
				.returns(createResult(10));

			this.spy(_ODataHelper, "buildOrderbyOption");
			this.spy(_ODataHelper, "mergeQueryOptions");
			this.spy(_ODataHelper, "toArray");
			this.spy(oListBinding, "reset");

			oListBinding.attachRefresh(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);
				assert.strictEqual(oListBinding.sChangeReason, ChangeReason.Sort);
				assert.ok(oListBinding.reset.calledWithExactly());

				oListBinding.getContexts(0, 10);
				// check that next change event gets change reason sort
				oListBinding.attachChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Sort);
					assert.strictEqual(oListBinding.sChangeReason, undefined);
					done();
				});
			});

			// Code under test
			assert.strictEqual(oListBinding.sort(oFixture.vSorters), oListBinding, "chaining");
			assert.deepEqual(oListBinding.aSorters, oFixture.vSortersExpected,
				"aSorters is updated after calling sort");
			assert.ok(_ODataHelper.toArray.calledWithExactly(oFixture.vSorters));
			assert.ok(_ODataHelper.buildOrderbyOption.calledWithExactly(
				_ODataHelper.toArray.returnValues[0],
				oFixture.mParameters && oFixture.mParameters.$orderby));
			assert.ok(_ODataHelper.mergeQueryOptions.calledWithExactly(oListBinding.mQueryOptions,
				oFixture.queryOptions.$orderby || ""), "mergeQueryOptions called");

		});
	});
	// TODO simplify this test

	//*********************************************************************************************
	QUnit.test("sort: relative bindings", function (assert) {
		var oModel = new ODataModel({
				operationMode : OperationMode.Server,
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			}),
			oCacheProxy = {},
			oContext = Context.create(oModel, /*oBinding*/{}, "/TEAMS", 1),
			oListBinding = oModel.bindList("EMPLOYEES", oContext),
			oSorter = new Sorter("foo"),
			aSorters = [oSorter];

		this.mock(oListBinding).expects("hasPendingChanges").returns(false);
		this.mock(_ODataHelper).expects("toArray").withExactArgs(sinon.match.same(oSorter))
			.returns(aSorters);
		this.mock(_ODataHelper).expects("createListCacheProxy")
			.withExactArgs(sinon.match.same(oListBinding), sinon.match.same(oContext))
			.returns(oCacheProxy);
		oListBinding.mCacheByContext = {"/TEAMS('1')" : {}, "/TEAMS('42')" : {}};
		this.mock(oListBinding).expects("reset").withExactArgs();
		this.mock(oListBinding).expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Sort});

		// Code under test
		assert.strictEqual(oListBinding.sort(oSorter), oListBinding, "chaining");

		assert.strictEqual(oListBinding.oCache, oCacheProxy);
		assert.strictEqual(oListBinding.mCacheByContext, undefined);
		assert.strictEqual(oListBinding.aSorters, aSorters, "store sorter");
		assert.strictEqual(oListBinding.sChangeReason, ChangeReason.Sort);
	});

	//*********************************************************************************************
	QUnit.test("sort - errors", function (assert) {
		var oContext,
			oListBinding = this.oModel.bindList("/EMPLOYEES"),
			oPathPromise = Promise.resolve("/foo");

		assert.throws(function () {
			oListBinding.sort([]);
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
		assert.throws(function () {
			oListBinding.sort();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oListBinding = this.oModel.bindList("/EMPLOYEES", null, null, null,
			{$$operationMode : OperationMode.Server});
		this.mock(oListBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oListBinding.sort();
		}, new Error("Cannot sort due to pending changes"));

		oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);
		//avoid cache creation
		this.mock(_ODataHelper).expects("createListCacheProxy").returns(/*oCacheProxy*/{});
		oListBinding = this.oModel.bindList("EMPLOYEES", oContext, null, null,
			{$$operationMode : OperationMode.Server});
		this.mock(oListBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oListBinding.sort();
		}, new Error("Cannot sort due to pending changes"));

		return oPathPromise;
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
			QUnit.test("filter: FilterType=" + sFilterType + ", "
					+ (bRelative ? "relative" : "absolute") + " binding", function (assert) {
				var oBinding,
					oCacheProxy = {
						hasPendingChanges : function () {
							return false;
						}
					},
					oContext = Context.create(this.oModel, undefined, "/TEAMS"),
					oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
					aFilters = [oFilter],
					oHelperMock = this.mock(_ODataHelper),
					sPath = bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES",
					sStaticFilter = "Age gt 18";

				oBinding = this.oModel.bindList(sPath, undefined, undefined, undefined, {
					$filter : sStaticFilter,
					$$operationMode : OperationMode.Server
				});
				if (bRelative) {
					oHelperMock.expects("createListCacheProxy")
						.withExactArgs(sinon.match.same(oBinding), sinon.match.same(oContext))
						.returns(oCacheProxy);
				}
				oBinding.setContext(oContext);

				oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter))
					.returns(aFilters);
				oHelperMock.expects("createListCacheProxy")
					.withExactArgs(sinon.match.same(oBinding), sinon.match.same(oContext))
					.returns(oCacheProxy);
				this.mock(oBinding).expects("reset").withExactArgs();
				this.mock(oBinding).expects("_fireRefresh")
					.withExactArgs({reason : ChangeReason.Filter});

				// Code under test
				assert.strictEqual(oBinding.filter(oFilter, sFilterType), oBinding, "chaining");

				assert.strictEqual(oBinding.oCache, oCacheProxy);
				assert.strictEqual(oBinding.sChangeReason, ChangeReason.Filter);
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

		this.mock(_ODataHelper).expects("createListCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), undefined);

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
			oContext = Context.create(this.oModel, {}, "/foo"),
			oListBindingMock = this.mock(ListBinding.prototype),
			oModelMock = this.mock(this.oModel);

		oBinding.setContext(oContext);
		oListBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		oBinding.destroy();

		oBinding = this.oModel.bindList("/absolute", oContext);
		oListBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("setContext while getContexts() is pending, relative", function (assert) {
		var oContext1 = Context.create(this.oModel, {}, "/Employees('1')"),
			oContext2 = Context.create(this.oModel, {}, "/Employees('2')"),
			oBinding = this.oModel.bindList("Equipments", undefined, undefined, undefined, {}),
			oBindingMock = this.mock(oBinding),
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
	QUnit.test("Extended change detection, no data read from cache", function (assert) {
		var oBinding,
			aContexts,
			aPreviousDiff = [{index: 0, type: "delete"}];

		oBinding = this.oModel.bindList("/EMPLOYEES");
		oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
		this.mock(_ODataHelper).expects("getReadRange")
			.withExactArgs(sinon.match.same(oBinding.aContexts), 0, 3, 0, Infinity)
			.returns(undefined);
		oBinding.aDiff = aPreviousDiff;

		// code under test
		aContexts = oBinding.getContexts(0, 3);

		assert.strictEqual(aContexts.dataRequested, false);
		assert.strictEqual(aContexts.diff, aPreviousDiff);
		assert.deepEqual(oBinding.aDiff, []);
	});

	//*********************************************************************************************
	QUnit.test("Extended change detection, data read from cache", function (assert) {
		var oBinding,
			oCacheMock = this.getCacheMock(),
			aContexts,
			aData = [{}, {}, {}],
			oDiffPromise = Promise.resolve([/*some diff*/]),
			oRange = {start : 0, length : 3},
			oReadPromise = Promise.resolve(aData);

		oBinding = this.oModel.bindList("/EMPLOYEES");
		oBinding.enableExtendedChangeDetection(/*bDetectUpdates*/false, /*vKey*/ undefined);
		oBinding.aDiff = [{index : 1, type : "delete"}];
		this.mock(_ODataHelper).expects("getReadRange")
			.withExactArgs(sinon.match.same(oBinding.aContexts), 0, 3, 0, Infinity)
			.returns(oRange);
		oCacheMock.expects("read")
			.withExactArgs(0, 3, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		this.mock(_ODataHelper).expects("requestDiff")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.same(aData), 0, 3)
			.returns(oDiffPromise);
		this.mock(oBinding).expects("createContexts")
			.withExactArgs(sinon.match.same(oRange), 3, ChangeReason.Change, true);

		// code under test
		aContexts = oBinding.getContexts(0, 3);

		assert.strictEqual(aContexts.dataRequested, true);
		assert.deepEqual(aContexts.diff, []);
		return oReadPromise.then(function (aData) {
			return oDiffPromise.then(function (aDiff) {
				assert.strictEqual(oBinding.aDiff, aDiff);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Extended change detection, requestDiff fails", function (assert) {
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
		this.mock(_ODataHelper).expects("getReadRange")
			.withExactArgs(sinon.match.same(oBinding.aContexts), 0, 3, 0, Infinity)
			.returns(oRange);
		oCacheMock.expects("read")
			.withExactArgs(0, 3, "$auto", undefined, sinon.match.func)
			.callsArg(4)
			.returns(oReadPromise);
		this.mock(_ODataHelper).expects("requestDiff")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.same(aData), 0, 3)
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
			sChangeReason = "Reason",
			aContexts = [null, {}, {}, {}],
			oContextMock = this.mock(Context),
			i,
			iResultLength = 3,
			oRange = {start : 1, length : 3};

		this.mock(oBinding.oModel).expects("resolve").thrice()
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns("~resolved~");
		for (i = oRange.start; i < oRange.start + iResultLength; i += 1) {
			oContextMock.expects("create")
				.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
					"~resolved~" + "/" + i, i)
				.returns(aContexts[i]);
		}
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: sChangeReason});
		this.mock(oBinding).expects("fireDataReceived").twice().withExactArgs();

		// code under test
		oBinding.createContexts(oRange, iResultLength, sChangeReason, true /*bDataRequested*/);

		for (i = oRange.start; i < oRange.start + iResultLength; i += 1) {
			assert.strictEqual(oBinding.aContexts[i], aContexts[i]);
		}

		// code under test : no second change event
		oBinding.createContexts(oRange, iResultLength, sChangeReason, true);

		// code under test : dataReceived event only if bDataRequested
		oBinding.createContexts(oRange, iResultLength, sChangeReason, false);
	});

	//*********************************************************************************************
	QUnit.test("createContexts, paging: less data than requested", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES", {}/*oContext*/);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 10, "Initial estimated length is 10");

		// code under test: set length and length final flag
		oBinding.createContexts({start : 20, length : 30}, 29, "Reason", false);

		assert.strictEqual(oBinding.bLengthFinal, true,
			"some controls use bLengthFinal instead of isLengthFinal()");
		assert.strictEqual(oBinding.getLength(), 49);

		// code under test: delete obsolete contexts
		oBinding.createContexts({start : 20, length : 30}, 17, "Reason", false);

		assert.strictEqual(oBinding.isLengthFinal(), true);
		assert.strictEqual(oBinding.getLength(), 37);
		assert.strictEqual(oBinding.aContexts.length, 37);

		// code under test: reset upper boundary
		oBinding.createContexts({start : 20, length : 30}, 30, "Reason", false);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, Infinity);

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: "Reason"});

		// code under test: no data for some other page fires no change event
		oBinding.createContexts({start : 10000, length : 30}, 0, "Reason", false);

		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.getLength(), 60);
		assert.strictEqual(oBinding.iMaxLength, 10000);

		// code under test: no data for *next* page fires change event (bLengthFinal changes)
		oBinding.createContexts({start : 50, length : 30}, 0, "Reason", false);
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
					oBinding1 = {
						checkUpdate : function () {}
					},
					oBinding4a = {
						checkUpdate : function () {}
					},
					oBinding4b = {
						checkUpdate : function () {}
					},
					oModelMock = this.mock(this.oModel),
					aPreviousContexts;

				oBinding.bUseExtendedChangeDetection = bUseExtendedChangeDetection;
				// [0, 1, 2, undefined, 4, 5]
				oBinding.createContexts({start : 0, length : 3}, 3, ChangeReason.Change, false);
				oBinding.createContexts({start : 4, length : 10}, 2, ChangeReason.Change, false);
				assert.strictEqual(oBinding.iMaxLength, 6);
				aPreviousContexts = oBinding.aContexts.slice();

				this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(false);
				this.mock(oBinding).expects("deleteFromCache")
					.withExactArgs("myGroup", "EMPLOYEES('1')", "1")
					.returns(Promise.resolve({}));
				this.mock(oBinding).expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Remove});
				this.mock(oBinding.aContexts[2]).expects("destroy");
				this.mock(oBinding.aContexts[5]).expects("destroy");
				if (!bUseExtendedChangeDetection) {
					oModelMock.expects("getDependentBindings")
						.withExactArgs(oBinding.aContexts[1])
						.returns([oBinding1]);
					this.mock(oBinding1).expects("checkUpdate").withExactArgs();
					oModelMock.expects("getDependentBindings")
						.withExactArgs(oBinding.aContexts[4])
						.returns([oBinding4a, oBinding4b]);
					this.mock(oBinding4a).expects("checkUpdate").withExactArgs();
					this.mock(oBinding4b).expects("checkUpdate").withExactArgs();
				}

				return oBinding._delete("myGroup", "EMPLOYEES('1')", oBinding.aContexts[1])
					.then(function (oResult) {
						assert.strictEqual(oResult, undefined);
						assert.strictEqual(oBinding.aContexts.length, 5);
						assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
						assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
						assert.notOk(2 in oBinding.aContexts);
						assert.strictEqual(oBinding.aContexts[3].getIndex(), 3);
						assert.strictEqual(oBinding.aContexts[3].getPath(), "/EMPLOYEES/3");
						assert.strictEqual(oBinding.aContexts[4], aPreviousContexts[4]);
						assert.strictEqual(oBinding.aContexts.length, 5);
						assert.strictEqual(oBinding.iMaxLength, 5);
						if (bUseExtendedChangeDetection) {
							assert.deepEqual(oBinding.aDiff, [{index : 1, type : "delete"}]);
						} else {
							assert.deepEqual(oBinding.aDiff, [], "unchanged");
						}
					});
			}
		);
	});
	// TODO check the row of a pending update with higher index

	//*********************************************************************************************
	QUnit.test("_delete: pending changes", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
		this.mock(oBinding).expects("deleteFromCache").never();
		this.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding._delete("myGroup", "EMPLOYEES('1')", null);
		}, new Error("Cannot delete due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("delete: failure", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES"),
			oError = new Error();

		oBinding.createContexts({start : 0, length : 3}, 3, ChangeReason.Change, false);
		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs("myGroup", "EMPLOYEES('1')", "1")
			.returns(Promise.reject(oError));

		// code under test
		return oBinding._delete("myGroup", "EMPLOYEES('1')", oBinding.aContexts[1])
			.then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	["$auto", undefined].forEach(function (sGroupId) {
		QUnit.test("deleteFromCache(" + sGroupId + ") : binding w/ cache", function (assert) {
			var oBinding = this.oModel.bindList("/EMPLOYEES"),
				oPromise = {};

			this.mock(oBinding).expects("getUpdateGroupId").exactly(sGroupId ? 0 : 1)
				.withExactArgs().returns("$auto");
			this.mock(oBinding.oCache).expects("_delete")
				.withExactArgs("$auto", "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3")
				.returns(oPromise);
			this.mock(this.oModel).expects("addedRequestToGroup").withExactArgs("$auto");

			assert.strictEqual(
				oBinding.deleteFromCache(sGroupId, "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3"),
				oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: binding w/o cache", function (assert) {
		var oParentBinding = {
				deleteFromCache : function () {}
			},
			oContext = Context.create(this.oModel, oParentBinding, "/TEAMS/42", 42),
			oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", oContext),
			oPromise = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "TEAM_2_EMPLOYEES", "1/EMPLOYEE_2_EQUIPMENTS/3")
			.returns("~");
		this.mock(oParentBinding).expects("deleteFromCache")
			.withExactArgs("$auto", "EQUIPMENTS('3')", "~")
			.returns(oPromise);

		assert.strictEqual(
			oBinding.deleteFromCache("$auto", "EQUIPMENTS('3')", "1/EMPLOYEE_2_EQUIPMENTS/3"),
			oPromise);
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: illegal group ID", function (assert) {
		var oBinding = this.oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.deleteFromCache("myGroup");
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding).expects("getUpdateGroupId").returns("myGroup");

		assert.throws(function () {
			oBinding.deleteFromCache();
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding.oCache).expects("_delete")
			.withExactArgs("$direct", "EMPLOYEES('1')", "42")
			.returns(Promise.resolve());

		return oBinding.deleteFromCache("$direct", "EMPLOYEES('1')", "42").then();
	});
});
//TODO integration: 2 entity sets with same $expand, but different $select
//TODO support suspend/resume
