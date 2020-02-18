/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils"
], function (jQuery, Log, ManagedObject, SyncPromise, ChangeReason, Filter, FilterOperator,
		FilterProcessor, FilterType, ListBinding, Sorter, OperationMode, Context, ODataListBinding,
		ODataModel, asODataParentBinding, _AggregationCache, _AggregationHelper, _Cache, _GroupLock,
		_Helper, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-new: 0, no-warning-comments: 0, no-sparse-arrays: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$aggregation", "$$canonicalPath", "$$groupId",
			"$$operationMode", "$$ownRequest", "$$patchWithoutSideEffects", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		rTransientPredicate = /^\(\$uid=.+\)$/;

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
	 * @param {boolean} [bKeyPredicates]
	 *   add a property "@$ui5._/predicate" with a key predicate
	 * @return {object}
	 *   the data
	 */
	function createData(iLength, iStart, bDrillDown, iCount, bKeyPredicates) {
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
			if (bKeyPredicates) {
				_Helper.setPrivateAnnotation(oData.value[i], "predicate",
					"('" + (iStart + i) + "')");
			}
		}
		return bDrillDown ? oData.value : oData;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oModel.setSizeLimit(3);
			// ensure that the requestor does not trigger requests
			this.mock(this.oModel.oRequestor).expects("request").never();
			// avoid that the cache requests actual metadata for faked responses
			this.mock(this.oModel.oRequestor.oModelInterface).expects("fetchMetadata").atLeast(0)
				.returns(SyncPromise.resolve());

			// in case "request" is restored, this catches accidental requests
			this.mock(_Helper).expects("createError").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		},

		/**
		 * Calls <code>this.oModel.bindList</code> using the given arguments, but avoids creating
		 * the prerendering task to unlock the read group lock.
		 *
		 * @returns {sap.ui.model.odata.v4.ODataListBinding} The list binding
		 */
		bindList : function () {
			try {
				this.stub(sap.ui.getCore(), "addPrerenderingTask");
				return this.oModel.bindList.apply(this.oModel, arguments);
			} finally {
				sap.ui.getCore().addPrerenderingTask.restore();
			}
		},

		/**
		 * Creates a sinon mock for a cache object with read and refresh methods.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getCacheMock : function () {
			var oCache = {
					read : function () {},
					requestSideEffects : function () {},
					toString : function () { return "/service/EMPLOYEES"; }
				};

			this.mock(_Cache).expects("create").returns(oCache);
			return this.mock(oCache);
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.bindList("EMPLOYEES"),
			oMixin = {},
			aOverriddenFunctions = ["destroy", "getDependentBindings", "hasPendingChangesForPath"];

		asODataParentBinding(oMixin);

		aOverriddenFunctions.forEach(function (sFunction) {
			assert.notStrictEqual(oBinding[sFunction], oMixin[sFunction], "overwrite " + sFunction);
		});
		Object.keys(oMixin).forEach(function (sKey) {
			if (aOverriddenFunctions.indexOf(sKey) < 0) {
				assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function (assert) {
		var oBinding,
			oExpectation = this.mock(this.oModel).expects("bindingCreated")
				.withExactArgs(sinon.match.object);

		this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataListBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		oBinding = this.bindList("/EMPLOYEES");

		sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
	});

	//*********************************************************************************************
	QUnit.test("constructor: lock when creating with base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')");

		this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataListBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		// code under test
		this.bindList("TEAM_2_EMPLOYEES", oContext);
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var oParentBindingSpy = this.spy(asODataParentBinding, "call"),
			oBinding = this.bindList("/EMPLOYEES");

		assert.ok(oBinding.hasOwnProperty("oAggregation"));
		assert.ok(oBinding.hasOwnProperty("aApplicationFilters"));
		assert.ok(oBinding.hasOwnProperty("bCreatedAtEnd"));
		assert.ok(oBinding.hasOwnProperty("sChangeReason"));
		assert.ok(oBinding.hasOwnProperty("aContexts"));
		assert.ok(oBinding.hasOwnProperty("iCreatedContexts"));
		assert.ok(oBinding.hasOwnProperty("iCurrentBegin"));
		assert.ok(oBinding.hasOwnProperty("iCurrentEnd"));
		assert.ok(oBinding.hasOwnProperty("oDiff"));
		assert.ok(oBinding.hasOwnProperty("aFilters"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("bHasAnalyticalInfo"));
		assert.ok(oBinding.hasOwnProperty("oHeaderContext"));
		assert.ok(oBinding.hasOwnProperty("bLengthFinal"));
		assert.ok(oBinding.hasOwnProperty("iMaxLength"));
		assert.ok(oBinding.hasOwnProperty("sOperationMode"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("mParameters"));
		assert.ok(oBinding.hasOwnProperty("mPreviousContextsByPath"));
		assert.ok(oBinding.hasOwnProperty("aPreviousData"));
		assert.ok(oBinding.hasOwnProperty("aSorters"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.ok(oParentBindingSpy.calledOnceWithExactly(oBinding));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("initialize: absolute, suspended = " + bSuspended, function (assert) {
			var oBinding = this.bindList("/absolute"),
				oBindingMock = this.mock(oBinding),
				sChangeReason = {};

			oBindingMock.expects("getRootBinding").withExactArgs().returns(oBinding);
			oBindingMock.expects("isSuspended").withExactArgs().returns(bSuspended);

			oBinding.sChangeReason = sChangeReason;
			oBindingMock.expects("_fireRefresh")
				.exactly(bSuspended ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Refresh});

			// code under test
			oBinding.initialize();

			assert.strictEqual(oBinding.sChangeReason,
				bSuspended ? sChangeReason : ChangeReason.Refresh);
		});
	});

	//*********************************************************************************************
	QUnit.test("initialize: relative, unresolved", function (assert) {
		var oBinding = this.bindList("relative"),
			sChangeReason = {};

		oBinding.sChangeReason = sChangeReason;
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sChangeReason, sChangeReason);
	});

	//*********************************************************************************************
	QUnit.test("initialize: absolute, with change reason", function (assert) {
		var oBinding;

		this.oModel.bAutoExpandSelect = true;
		// mock fetchCache as cache creation becomes async otherwise
		this.mock(ODataListBinding.prototype).expects("fetchCache").withExactArgs(undefined);
		oBinding = this.bindList("/absolute");

		this.mock(oBinding).expects("_fireChange").withExactArgs({
			detailedReason : "AddVirtualContext",
			reason : ChangeReason.Change
		});

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("initialize: relative, resolved, bSuspended = " + bSuspended, function (assert) {
			var sChangeReason = {},
				oContext = Context.create(this.oModel, {}, "/EMPLOYEES"),
				oBinding = this.bindList("relative", oContext),
				oBindingMock = this.mock(oBinding),
				oRootBinding = {isSuspended : function () {}};

			oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
			this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(bSuspended);
			oBindingMock.expects("_fireRefresh")
				.exactly(bSuspended ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Refresh});
			oBinding.sChangeReason = sChangeReason;

			// code under test
			oBinding.initialize();

			assert.strictEqual(oBinding.sChangeReason,
				bSuspended ? sChangeReason : ChangeReason.Refresh);
		});
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

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.sChangeReason, undefined);
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
			oBinding = this.bindList("/EMPLOYEES");

			assert.strictEqual(oBinding.sChangeReason,
				bAutoExpandSelect ? "AddVirtualContext" : undefined);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("setAggregation: bSuspended=" + bSuspended, function (assert) {
			var oAggregation = {},
				oAggregationCloned = {},
				sApply = "A.P.P.L.E.",
				oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
					{$$aggregation : {}}),
				mQueryOptions = oBinding.mQueryOptions;

			oBinding.oContext = {}; // simulate ODLB#setContext
			this.mock(oBinding).expects("checkSuspended").never();
			this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(oAggregation))
				.returns(oAggregationCloned);
			this.mock(_AggregationHelper).expects("buildApply")
				.withExactArgs(sinon.match.same(oAggregationCloned))
				.returns({$apply : sApply});
			this.mock(oBinding).expects("isRootBindingSuspended")
				.withExactArgs().returns(bSuspended);
			this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
				.withExactArgs(ChangeReason.Change);
			this.mock(oBinding).expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1)
				.withExactArgs("");
			this.mock(oBinding).expects("fetchCache").exactly(bSuspended ? 0 : 1)
				.withExactArgs(sinon.match.same(oBinding.oContext));
			this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1)
				.withExactArgs(ChangeReason.Change);

			// code under test
			oBinding.setAggregation(oAggregation);

			assert.strictEqual(oBinding.mQueryOptions.$apply, sApply, "$apply has changed");
			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "object itself is the same");
			assert.strictEqual(oBinding.oAggregation, oAggregationCloned, "$$aggregation");
		});
	});
	//TODO allow oBinding.setAggregation(); to remove aggregation and "free" $apply?!
	//TODO prevent "change" event in case nothing has really changed

	//*********************************************************************************************
	QUnit.test("setAggregation: Cannot override existing $apply", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$apply : "groupby()"});

		assert.throws(function () {
			// code under test
			oBinding.setAggregation({});
		}, new Error("Cannot override existing $apply : 'groupby()'"));
	});

	//*********************************************************************************************
	QUnit.test("setAggregation: pending changes", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oBinding.setAggregation({});
		}, new Error("Cannot set $$aggregation due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from c'tor", function (assert) {
		var oAggregation = {},
			oAggregationCloned = {},
			sApply = "A.P.P.L.E.",
			oExpectation,
			sGroupId = "foo",
			oModelMock = this.mock(this.oModel),
			oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			mParameters = {
				$$aggregation : oAggregation,
				$$groupId : "foo",
				$$operationMode : OperationMode.Server,
				$$updateGroupId : "update foo",
				$filter : "bar"
			};

		assert.strictEqual(oBinding.oAggregation, null, "initial value");

		oBindingMock.expects("checkBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
		oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true)
			.returns({$filter : "bar"});
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(oAggregation))
			.returns(oAggregationCloned);
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregationCloned))
			.returns({$apply : sApply});
		oBinding.mCacheByResourcePath = {
			"/Products" : {}
		};
		oExpectation = oBindingMock.expects("removeCachesAndMessages").withExactArgs("");
		oBindingMock.expects("fetchCache").callsFake(function () {
			// test if #removeCachesAndMessages is called before #fetchCache
			assert.ok(oExpectation.called);
		});
		oBindingMock.expects("reset").withExactArgs(undefined);

		//code under test
		oBinding.applyParameters(mParameters);

		assert.strictEqual(oBinding.sOperationMode, "Server", "sOperationMode");
		assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
		assert.strictEqual(oBinding.sUpdateGroupId, "update foo", "sUpdateGroupId");
		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply,
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.oAggregation, oAggregationCloned, "$$aggregation");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from c'tor - error case", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Server}),
			sOperationMode = oBinding.sOperationMode;

		assert.throws(function () {
			//code under test
			//c'tor called without mParameters but vSorters is set
			oBinding.applyParameters({});
		}, new Error("Unsupported operation mode: undefined"));
		assert.strictEqual(oBinding.sOperationMode, sOperationMode, "sOperationMode not changed");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$aggregation & $apply", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			//code under test
			// Note: this is the same, no matter if both are supplied to c'tor or $apply is added
			// later via #changeParameters
			oBinding.applyParameters({$$aggregation : {}, $apply : ""});
		}, new Error("Cannot combine $$aggregation and $apply"));
	});
	//TODO do we care that $apply is stored already before throwing?

	//*********************************************************************************************
	QUnit.test("applyParameters: buildApply fails", function (assert) {
		var oAggregation = {},
			oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error("This call intentionally failed");

		oBinding.oAggregation = oAggregation;
		this.mock(_AggregationHelper).expects("buildApply").throws(oError);

		assert.throws(function () {
			//code under test
			oBinding.applyParameters({$$aggregation : {}});
		}, oError);
		assert.strictEqual(oBinding.oAggregation, oAggregation, "unchanged");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("applyParameters: call from changeParameters, " + bSuspended, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS"),
				oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
				oBindingMock = this.mock(oBinding),
				oModelMock = this.mock(this.oModel),
				mParameters = {
					$$operationMode : OperationMode.Server,
					$filter : "bar"
				},
				mQueryOptions = {
					$filter : "bar"
				};

			oBindingMock.expects("checkBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
			oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
			oBindingMock.expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
				.withExactArgs(ChangeReason.Change);
			oBindingMock.expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1)
				.withExactArgs("");
			oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1)
				.withExactArgs(sinon.match.same(oBinding.oContext));
			oBindingMock.expects("reset").exactly(bSuspended ? 0 : 1)
				.withExactArgs(ChangeReason.Change);

			//code under test
			oBinding.applyParameters(mParameters, ChangeReason.Change);
		});
	});

	//*********************************************************************************************
	QUnit.test("reset", function (assert) {
		var oBinding,
			oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				Promise.resolve()),
			aPreviousContexts;

		// code under test: reset called from ODLB constructor
		oBinding = this.bindList("/EMPLOYEES");

		// set members which should be reset to arbitrary values
		oBinding.createContexts(0, 2, [{}, {}]);
		oBinding.createContexts(3, 1, [{}]);
		aPreviousContexts = oBinding.aContexts.slice();
		oBinding.aContexts.unshift(oCreatedContext);
		oBinding.iCurrentBegin = 10;
		oBinding.iCurrentEnd = 19;
		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 42;
		oBinding.iCreatedContexts = 1;

		this.mock(oBinding).expects("_fireRefresh").never();
		this.mock(oCreatedContext).expects("destroy").never();

		// code under test
		oBinding.reset();

		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 4);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/0"], aPreviousContexts[0]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/1"], aPreviousContexts[1]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/3"], aPreviousContexts[3]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-23)"],
			oCreatedContext);
		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.iCurrentBegin, 0);
		assert.strictEqual(oBinding.iCurrentEnd, 0);
		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.iMaxLength, Infinity);
		assert.strictEqual(oBinding.iCreatedContexts, 0);
		assert.strictEqual(oBinding.bCreatedAtEnd, undefined);
	});

	//*********************************************************************************************
	QUnit.test("reset with change reason", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			sChangeReason = {};

		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason : sinon.match.same(sChangeReason)});

		// code under test
		oBinding.reset(sChangeReason);

		assert.strictEqual(oBinding.sChangeReason, sChangeReason);
	});

	//*********************************************************************************************
	QUnit.test("reset on initial binding with change reason 'Change'", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.reset(ChangeReason.Change);

		assert.strictEqual(oBinding.sChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("reset not initial binding with change reason 'Change'", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.iCurrentEnd = 42;

		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.reset(ChangeReason.Change);

		assert.strictEqual(oBinding.sChangeReason, ChangeReason.Change);
	});

	//*********************************************************************************************
	QUnit.test("reset with header context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCountBinding1 = this.oModel.bindProperty("$count", oBinding.getHeaderContext()),
			oCountBinding2 = this.oModel.bindProperty("$count", oBinding.getHeaderContext());

		this.mock(oCountBinding1).expects("checkUpdate").withExactArgs();
		this.mock(oCountBinding2).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.reset(ChangeReason.Change);
	});

	//*********************************************************************************************
	QUnit.test("bindList with OData query options", function (assert) {
		var oBinding,
			oBaseContext = {getPath : function () {return "/";}},
			oCacheMock = this.mock(_Cache),
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
		oCacheMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				{"$orderby" : "bar", "sap-client" : "111"}, false, undefined)
			.returns({});
		this.spy(ODataListBinding.prototype, "reset");

		// code under test
		oBinding = this.bindList("/EMPLOYEES", oV4Context, undefined, undefined, mParameters);

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

		oCacheMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				{"$orderby" : "bar", "sap-client" : "111"}, false, "EMPLOYEES")
			.returns({});

		// code under test
		oBinding = this.bindList("EMPLOYEES", oBaseContext, undefined, undefined, mParameters);

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
		oBinding = this.bindList("EMPLOYEE_2_TEAM", undefined, undefined, undefined, mParameters);

		assert.strictEqual(oBinding.oCachePromise.getResult(), null, "no cache");
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
			this.bindList("/EMPLOYEES", null, undefined, undefined, mParameters);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("bindList with sorters - error cases", function (assert) {
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
				$$operationMode : OperationMode.Auto});
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, new Sorter("ID"));
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
			.returns(SyncPromise.resolve());

		// code under test
		oBinding = this.bindList("/EMPLOYEES", undefined, undefined, oFilter, mQueryParameters);

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
	});

	//*********************************************************************************************
	QUnit.test("bindList with filters - error cases", function (assert) {
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
				$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
				$$operationMode : OperationMode.Auto});
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42));
		}, new Error("Unsupported operation mode: undefined"));
	});

	//*********************************************************************************************
	QUnit.test("fetchData: w/ cache", function (assert) {
		var oBinding,
			oCache = {read : function () {}},
			oData = {},
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			oPromise;

		this.mock(ODataListBinding.prototype).expects("fetchCache").callsFake(function () {
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		});
		oBinding = this.bindList("/EMPLOYEES");
		this.mock(oCache).expects("read")
			.withExactArgs(1, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(Promise.resolve(oData)));

		// code under test
		oPromise = oBinding.fetchData(1, 2, 3, oGroupLock, fnDataRequested);

		oBinding.setContext({}); // must have no effect on absolute bindings
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oData);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasData) {
	QUnit.test("fetchData: w/o cache, data=" + bHasData, function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			aData = [{id : 0}, {id : 1}, {id : 2}, {id : 3}, {id : 4}, {id : 5}],
			fnDataRequested = {/*function*/},
			oGroupLock = {unlock : function () {}};

		aData.$count = 42;
		this.mock(oBinding).expects("fetchCache").callsFake(function () {
			this.oCache = undefined;
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(null));
			this.sReducedPath = "/reduced/path";
		});
		oBinding.setContext(oContext);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("/reduced/path")
			.returns(SyncPromise.resolve(Promise.resolve(bHasData ? aData : undefined)));

		// code under test
		return oBinding.fetchData(3, 2, 99, oGroupLock, fnDataRequested).then(function (oResult) {
			assert.deepEqual(oResult, {value : bHasData ? [{id : 3}, {id : 4}] : []});
			if (bHasData) {
				assert.strictEqual(oResult.value.$count, 42);
			}
		});
	});
});

	//*********************************************************************************************
	// This tests simulates the data access for a virtual context which may be removed from the
	// binding while fetchData still is waiting for the cache
[false, true].forEach(function (bHasCache) {
	QUnit.test("fetchData: context lost", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			oPromise;

		oBindingMock.expects("fetchCache").callsFake(function () {
			this.oCache = undefined;
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(bHasCache ? {} : null));
			this.sReducedPath = "/reduced/path";
		});
		oBinding.setContext(oContext);
		this.mock(oContext).expects("fetchValue").never();

		// code under test
		oPromise = oBinding.fetchData(3, 2, 0);

		oBindingMock.expects("fetchCache").callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
			this.sReducedPath = undefined;
		});
		oBinding.setContext(null);

		return oPromise.then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[false, true].forEach(function (bGroupLock) {

	QUnit.test("fetchContexts: async=" + bAsync + ", groupLock=" + bGroupLock, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			bChanged = {/*boolean*/},
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			bPending = true,
			oPromise,
			oResult = {value : {}};

		this.mock(oBinding).expects("lockGroup").exactly(bGroupLock ? 0 : 1)
			.withExactArgs().returns(oGroupLock);
		this.mock(oBinding).expects("fetchData")
			.withExactArgs(1, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("createContexts")
			.withExactArgs(1, 2, sinon.match.same(oResult.value))
			.returns(SyncPromise.resolve(bChanged));

		// code under test
		oPromise = oBinding.fetchContexts(1, 2, 3, bGroupLock ? oGroupLock : undefined, bAsync,
				fnDataRequested)
			.then(function (bResult) {
				assert.strictEqual(bResult, bChanged);
				bPending = false;
			});
		oBinding.setContext({}); // must not change anything, the binding is absolute

		assert.strictEqual(bPending, bAsync);

		return oPromise;
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bCreatedAtEnd) {
	QUnit.test("fetchContexts: created, atEnd=" + bCreatedAtEnd, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			bChanged = {/*boolean*/},
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			iReadStart = bCreatedAtEnd ? 3 : 1,
			oResult = {value : {}};

		oBinding.bCreatedAtEnd = bCreatedAtEnd;
		oBinding.iCreatedContexts = 2;
		this.mock(oBinding).expects("fetchData")
			.withExactArgs(iReadStart, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("createContexts")
			.withExactArgs(iReadStart, 2, sinon.match.same(oResult.value))
			.returns(SyncPromise.resolve(bChanged));

		// code under test
		return oBinding.fetchContexts(1, 2, 3, oGroupLock, false, fnDataRequested);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchContexts: fetchData returns undefined", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')")),
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			oPromise;

		this.mock(oBinding).expects("fetchData")
			.withExactArgs(1, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(Promise.resolve(undefined)));
		this.mock(oBinding).expects("createContexts").never();

		// code under test
		oPromise = oBinding.fetchContexts(1, 2, 3, oGroupLock, false, fnDataRequested);

		return oPromise.then(function (bChanged) {
			assert.notOk(bChanged);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasGroupLock) {
	QUnit.test("fetchContexts: read failure, groupLock=" + bHasGroupLock, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			fnDataRequested = {/*function*/},
			oError = new Error(),
			oGroupLock = {unlock : function () {}};

		this.mock(oBinding).expects("lockGroup").exactly(bHasGroupLock ? 0 : 1)
			.withExactArgs().returns(oGroupLock);
		this.mock(oBinding).expects("fetchData")
			.withExactArgs(1, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(Promise.reject(oError)));
		this.mock(oBinding).expects("createContexts").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		return oBinding.fetchContexts(1, 2, 3, bHasGroupLock ? oGroupLock : undefined, false,
				fnDataRequested)
			.then(function () {
				assert.ok(false);
			}, function (oResult) {
				assert.strictEqual(oResult, oError);
			});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bChanged) {
	QUnit.test("requestContexts: changed=" + bChanged, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			aContexts = [],
			oGroupLock = {},
			oPromise;

		this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
		this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true).returns(oGroupLock);
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(bChanged)));
		this.mock(oBinding).expects("_fireChange").exactly(bChanged ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(1, 2)
			.returns(aContexts);

		// code under test
		oPromise = oBinding.requestContexts(1, 2, "groupId").then(function (aResults) {
			assert.strictEqual(aResults, aContexts);
		});

		assert.ok(oPromise instanceof Promise);
		return oPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("requestContexts: parameter defaults", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			aContexts = [],
			oGroupLock = {};

		this.mock(oBinding).expects("lockGroup").withExactArgs(undefined, true).returns(oGroupLock);
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, this.oModel.iSizeLimit, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(false)));
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(0, this.oModel.iSizeLimit)
			.returns(aContexts);

		// code under test
		return oBinding.requestContexts().then(function (aResults) {
			assert.strictEqual(aResults, aContexts);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: error in fetchContexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error(),
			oGroupLock = {};

		this.mock(oBinding).expects("lockGroup").withExactArgs(undefined, true).returns(oGroupLock);
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.reject(oError)));
		this.mock(oBinding).expects("_fireChange").never();
		this.mock(oBinding).expects("getContextsInViewOrder").never();
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to get contexts for /service/EMPLOYEES with start index 1 and length 2",
			sClassName, sinon.match.same(oError));

		// code under test
		return oBinding.requestContexts(1, 2).then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: unresolved", function (assert) {
		var oBinding = this.bindList("relative");

		this.mock(oBinding).expects("fetchContexts").never();

		assert.throws(function () {
			oBinding.requestContexts();
		}, new Error("Unresolved binding: relative"));
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: suspended", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error();

		this.mock(oBinding).expects("fetchContexts").never();
		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);

		assert.throws(function () {
			oBinding.requestContexts();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: invalid group ID", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error();

		this.mock(oBinding).expects("fetchContexts").never();
		this.mock(this.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.requestContexts(0, 10, "$invalid");
		}, oError);
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[false, true].forEach(function (bChanged) {

	QUnit.test("getContexts: async=" + bAsync + ", changed=" + bChanged, function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')")),
			aContexts = [],
			oFetchContextsPromise = bAsync
									? SyncPromise.resolve(Promise.resolve(bChanged))
									: SyncPromise.resolve(bChanged),
			aResults;

		oBinding.oReadGroupLock = undefined;
		oBinding.iCurrentBegin = 0;
		oBinding.iCurrentEnd = 0;
		this.oLogMock.expects("debug")
			.withExactArgs(oBinding + "#getContexts(5, 10, 100)", undefined, sClassName);
		this.mock(oBinding).expects("checkSuspended");
		this.mock(oBinding).expects("getDiff").never();
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(5, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("resolveRefreshPromise")
			.withExactArgs(sinon.match.same(oFetchContextsPromise));
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(5, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("_fireChange")
			.exactly(bAsync && bChanged ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		aResults = oBinding.getContexts(5, 10, 100);

		assert.strictEqual(aResults, aContexts);
		assert.strictEqual(oBinding.iCurrentBegin, 5);
		assert.strictEqual(oBinding.iCurrentEnd, 15);

		return oFetchContextsPromise;
	});

	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: unresolved", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			aContexts;

		oBinding.aPreviousData = [{}];
		this.mock(oBinding).expects("checkSuspended");
		this.mock(oBinding).expects("fetchContexts").never();

		// code under test
		aContexts = oBinding.getContexts(0, 10);

		assert.deepEqual(aContexts, []);
		assert.deepEqual(oBinding.aPreviousData, []);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: dataRequested/dataReceived", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				// expect this when fetchContexts is finished
				oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});

				return false;
			});

		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, sinon.match.object, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		oBindingMock.expects("fireDataRequested").never(); // expect it later
		oBindingMock.expects("fireDataReceived").never(); // expect it later

		// code under test
		oBinding.getContexts(0, 10, 100);

		oBindingMock.expects("fireDataRequested").withExactArgs();

		// code under test
		oFetchContextsCall.args[0][5]();

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
	QUnit.test("getContexts: default values", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')")),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("checkSuspended").twice();
		oBindingMock.expects("fetchContexts")
			.withExactArgs(0, this.oModel.iSizeLimit, 0, undefined, false, sinon.match.func)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.getContexts();

		oBindingMock.expects("fetchContexts")
			.withExactArgs(1, 2, 0, undefined, false, sinon.match.func)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.getContexts(1, 2, -42);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: after refresh", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(true)),
			sChangeReason = {/*ChangeReason*/};

		oBinding.sChangeReason = sChangeReason;
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, 10, 100, sinon.match.object, /*bAsync=*/true, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : sChangeReason});

		// code under test
		oBinding.getContexts(0, 10, 100);

		assert.strictEqual(oBinding.sChangeReason, undefined);

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
	QUnit.test("getContexts: read group lock", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(false)),
			oReadGroupLock = {/*GroupLock*/};

		oBinding.oReadGroupLock = oReadGroupLock;
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, 10, 100, sinon.match.same(oReadGroupLock), false, sinon.match.func)
			.returns(oFetchContextsPromise);

		// code under test
		oBinding.getContexts(0, 10, 100);

		assert.strictEqual(oBinding.oReadGroupLock, undefined);

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuspend) {
	QUnit.test("getContexts: AddVirtualContext, suspend = " + bSuspend, function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			aContexts,
			oTaskCall,
			oVirtualContext = {destroy : function () {}};

		oBinding.sChangeReason = "AddVirtualContext";
		oBindingMock.expects("checkSuspended");
		oTaskCall = this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func, true);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"/~/" + Context.VIRTUAL, Context.VIRTUAL)
			.returns(oVirtualContext);
		oBindingMock.expects("fetchContexts").never();
		oBindingMock.expects("_fireChange").never();

		// code under test
		aContexts = oBinding.getContexts(0, 10, 100);

		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.strictEqual(aContexts.length, 1);
		assert.strictEqual(aContexts[0], oVirtualContext);

		// prerendering task
		oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspend);
		if (bSuspend) {
			oBindingMock.expects("_fireChange").never();
			oBindingMock.expects("reset").never();
		} else {
			oBindingMock.expects("_fireChange").withExactArgs({
				detailedReason : "RemoveVirtualContext",
				reason : ChangeReason.Change
			});
			oBindingMock.expects("reset").withExactArgs(ChangeReason.Refresh);
		}
		this.mock(oVirtualContext).expects("destroy").withExactArgs();

		// code under test - call the prerendering task
		oTaskCall.args[0][0]();

		assert.strictEqual(oBinding.sChangeReason, bSuspend ? undefined : "RemoveVirtualContext");
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: RemoveVirtualContext", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			aContexts;

		oBinding.sChangeReason = "RemoveVirtualContext";
		oBindingMock.expects("checkSuspended");
		oBindingMock.expects("fetchContexts").never();
		oBindingMock.expects("_fireChange").never();

		// code under test
		aContexts = oBinding.getContexts(0, 10, 100);

		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(aContexts, []);
	});

	//*********************************************************************************************
[
	{bCanceled : true, bDataRequested : true},
	{bCanceled : false, bDataRequested : false},
	{bCanceled : false, bDataRequested : true}
].forEach(function (oFixture) {
	var sTitle = "getContexts: error in fetchContexts, dataRequested=" + oFixture.bDataRequested
			+ ", canceled=" + oFixture.bCanceled;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oError = {canceled : oFixture.bCanceled},
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.reject(oError));

		this.mock(oBinding).expects("checkSuspended");
		oFetchContextsCall = this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.getContexts(0, 10, 100);

		this.mock(oBinding).expects("fireDataReceived").exactly(oFixture.bDataRequested ? 1 : 0)
			.withExactArgs(oFixture.bCanceled ? {data : {}} : {error : sinon.match.same(oError)});

		// code under test - dataRequested/dataReceived
		if (oFixture.bDataRequested) {
			oFetchContextsCall.args[0][5]();
		}

		return oFetchContextsPromise.catch(function () {/* avoid "Uncaught (in promise)"*/});
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: error in dataRequested", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				// call fnDataRequested within the promise
				oFetchContextsCall.args[0][5]();

				return false;
			});

		oBindingMock.expects("checkSuspended");
		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		oBindingMock.expects("fireDataRequested").withExactArgs().throws(oError);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.getContexts(0, 10, 100);

		return oFetchContextsPromise.catch(function () {/* avoid "Uncaught (in promise)"*/});
	});

	//*********************************************************************************************
	QUnit.test("getContexts: error in dataReceived", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(false));

		oBindingMock.expects("checkSuspended");
		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}})
			.throws(oError);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.getContexts(0, 10, 100);

		// code under test - dataRequested/dataReceived
		oFetchContextsCall.args[0][5]();

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
[
	{bChanged : true, aDiff : [{}]},
	{bChanged : false, aDiff : [{}]},
	{bChanged : false, aDiff : []}
].forEach(function (oFixture) {
	QUnit.test("getContexts: E.C.D, no diff yet, " + JSON.stringify(oFixture), function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')")),
			oBindingMock = this.mock(oBinding),
			sChangeReason = {/*string*/},
			aContexts,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				oBindingMock.expects("getDiff").withExactArgs(10).returns(oFixture.aDiff);
				return oFixture.bChanged;
			});

		oBinding.enableExtendedChangeDetection();
		oBinding.sChangeReason = sChangeReason;

		oBindingMock.expects("getDiff").never();
		oBindingMock.expects("checkSuspended");
		oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 0, undefined, true, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("_fireChange")
			.exactly(oFixture.bChanged || oFixture.aDiff.length ? 1 : 0)
			.withExactArgs({reason : sChangeReason});

		// code under test
		aContexts = oBinding.getContexts(0, 10);

		assert.strictEqual(aContexts.dataRequested, true);

		return oFetchContextsPromise.then(function () {
			if (oFixture.bChanged || oFixture.aDiff.length) {
				assert.deepEqual(oBinding.oDiff, {
					aDiff : oFixture.aDiff,
					iLength : 10
				});
				assert.strictEqual(oBinding.oDiff.aDiff, oFixture.aDiff);
			} else {
				assert.strictEqual(oBinding.oDiff, undefined);
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: E.C.D, with diff", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')")),
			aContexts = [],
			aDiff = [],
			aResults;

		oBinding.enableExtendedChangeDetection();
		oBinding.oDiff = {
			aDiff : aDiff,
			iLength : 10
		};

		this.mock(oBinding).expects("checkSuspended");
		this.mock(oBinding).expects("getDiff").never();
		this.mock(oBinding).expects("fetchContexts").never();
		this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, 10)
			.returns(aContexts);

		// code under test
		aResults = oBinding.getContexts(0, 10);

		assert.strictEqual(aResults, aContexts);
		assert.strictEqual(aContexts.dataRequested, false);
		assert.strictEqual(aContexts.diff, aDiff);
		assert.strictEqual(oBinding.oDiff, undefined);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: E.C.D, with diff, length mismatch", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/TEAMS('1')"));

		oBinding.enableExtendedChangeDetection();
		oBinding.oDiff = {
			aDiff : [],
			iLength : 10
		};

		this.mock(oBinding).expects("checkSuspended");
		this.mock(oBinding).expects("getDiff").never();
		this.mock(oBinding).expects("fetchContexts").never();
		this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, 20);

		// code under test
		assert.throws(function () {
			oBinding.getContexts(0, 20);
		}, new Error("Extended change detection protocol violation: Expected "
			+ "getContexts(0,10), but got getContexts(0,20)"));
	});

	//*********************************************************************************************
	QUnit.test("getContextsInViewOrder: create at start", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			aContexts = [],
			aResults;

		this.mock(oBinding.aContexts).expects("slice").withExactArgs(2, 5).returns(aContexts);

		// code under test
		aResults = oBinding.getContextsInViewOrder(2, 3);

		assert.strictEqual(aResults, aContexts);
	});

	//*********************************************************************************************
	QUnit.test("getContextsInViewOrder: create at end", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			aResults;

		// assuming 3 created entities (with index 0, 1 and 2)
		// view order 3 4 5 2 1 0
		oBindingMock.expects("getLength").withExactArgs().returns(6);
		oBindingMock.expects("getModelIndex").withExactArgs(3).returns(0);
		oBindingMock.expects("getModelIndex").withExactArgs(4).returns(1);
		oBindingMock.expects("getModelIndex").withExactArgs(5).returns(2);

		oBinding.bCreatedAtEnd = true;
		oBinding.aContexts = [{}, {}, {}, {}, {}, {}];

		// code under test
		aResults = oBinding.getContextsInViewOrder(3, 10);

		assert.strictEqual(aResults.length, 3);
		assert.strictEqual(aResults[0], oBinding.aContexts[0]);
		assert.strictEqual(aResults[1], oBinding.aContexts[1]);
		assert.strictEqual(aResults[2], oBinding.aContexts[2]);

		oBindingMock.expects("getLength").withExactArgs().returns(6);
		oBindingMock.expects("getModelIndex").withExactArgs(1).returns(4);
		oBindingMock.expects("getModelIndex").withExactArgs(2).returns(3);

		// code under test
		aResults = oBinding.getContextsInViewOrder(1, 2);

		assert.strictEqual(aResults.length, 2);
		assert.strictEqual(aResults[0], oBinding.aContexts[4]);
		assert.strictEqual(aResults[1], oBinding.aContexts[3]);
	});

	//*********************************************************************************************
	QUnit.test("getLength", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.strictEqual(oBinding.getLength(), 0);

		oBinding.aContexts = [{}, {}, {}, {}];
		assert.strictEqual(oBinding.getLength(), 14);

		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 20;
		assert.strictEqual(oBinding.getLength(), 20);

		oBinding.iCreatedContexts = 2;
		assert.strictEqual(oBinding.getLength(), 22);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindList: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.bindList(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList: empty path is valid for base context", function (assert) {
		var oBaseContext = this.oModel.createBindingContext("/BusinessPartnerList");

		// code under test
		this.bindList("", oBaseContext);
	});

	//*********************************************************************************************
	QUnit.test("reset context for nested list binding with its own cache", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			oCache = {},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		// fetchCache is called once from applyParameters before oBinding.oContext is set
		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
		});
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).atLeast(1)
			.callsFake(function () {
				this.oCache = oCache;
				this.oCachePromise = SyncPromise.resolve(oCache);
			});
		oBinding = this.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
			{$select : "ID"});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path without parameters", function (assert) {
		var oBinding = this.bindList("Suppliers"),
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
	QUnit.test("setContext: relative path with transient entities", function (assert) {
		var oBinding = this.bindList("Bar", Context.create(this.oModel, {}, "/Foo('42')")),
			oContext0 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-23)", -1,
				Promise.resolve()),
			oContext1 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-24)", -2,
				Promise.resolve()),
			oContext2 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-25)", -3,
				Promise.resolve());

		// simulate multi create, some contexts are still transient
		oBinding.aContexts.unshift(oContext2, oContext1, oContext0);
		oBinding.iCreatedContexts = 3;

		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext0).expects("isTransient").withExactArgs().never();

		assert.throws(function () {
			// code under test
			oBinding.setContext({/*some different context*/});
		}, new Error("setContext on relative binding is forbidden if a transient entity "
			+ "exists: sap.ui.model.odata.v4.ODataListBinding: /Foo('42')|Bar"));
	});

	//*********************************************************************************************
	QUnit.test("preserve headerContext when ManagedObject temporarily removes context",
		function (assert) {
		var oBinding = this.bindList("Suppliers"),
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
	QUnit.test("getCurrentContexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.aContexts.unshift({/*created*/});
		oBinding.iCreatedContexts += 1;
		oBinding.iCurrentBegin = 1;
		oBinding.iCurrentEnd = 11;
		oBinding.iMaxLength = 10;

		// code under test
		assert.strictEqual(oBinding.getCurrentContexts().length, 10);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: relative binding with base context", function (assert) {
		var oBinding;

		oBinding = this.bindList("TEAMS", this.oModel.createBindingContext("/"), undefined,
			undefined, {$$groupId : "group"});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", true);
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs();

		//code under test
		return oBinding.refreshInternal("", "myGroup", false);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	QUnit.test("refreshInternal: relative with own cache, success=" + bSuccess, function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			oCache0 = {
				setActive : function () {}
			},
			oCache1 = {},
			oCache = oCache0,
			oContext = Context.create(this.oModel, {}, "/TEAMS('1')"),
			oError = new Error(),
			sPath = {/*TEAMS('1')*/},
			oRefreshResult;

		// fetchCache is called once from applyParameters before oBinding.oContext is set
		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
		});
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).atLeast(1)
			.callsFake(function () {
				this.oCache = oCache;
				this.oCachePromise = SyncPromise.resolve(oCache);
			});
		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$groupId : "group"});

		oCache = oCache1;
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
		this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs(sinon.match.same(sPath));
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs().callThrough();
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);

		//code under test
		oRefreshResult = oBinding.refreshInternal(sPath, "myGroup", false);
		// simulate getContexts
		oBinding.resolveRefreshPromise(bSuccess || Promise.reject(oError));

		return oRefreshResult.then(function () {
			assert.ok(bSuccess);
			assert.strictEqual(oBinding.oCachePromise.getResult(), oCache1);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[false, true].forEach(function (bKeepCacheOnError) {
		[false, true].forEach(function (bRelative) {
			var sTitle = "refreshInternal: bAsync=" + bAsync
				+ ", bKeepCacheOnError=" + bKeepCacheOnError
				+ ", bRelative=" + bRelative;

	QUnit.test(sTitle, function (assert) {
		var oContext = bRelative ? Context.create(this.oModel, {}, "/TEAMS('42')") : undefined,
			oBinding = this.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES", oContext,
				null, null, {$$ownRequest : true}),
			oCache = oBinding.oCachePromise.getResult(),
			iNoOfCalls = bAsync ? 2 : 1,
			oDependentBinding = {
				refreshInternal : function () {}
			},
			oError = new Error(),
			aPromises = [],
			oReadPromise = Promise.reject(oError),
			that = this;

		this.mock(oBinding).expects("isRootBindingSuspended").exactly(iNoOfCalls).returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise = Promise.resolve(bRelative ? oCache.$resourcePath : "n/a");

			if (bRelative) {
				assert.ok(oCache.$resourcePath);
			} else {
				assert.notOk("$resourcePath" in oCache);
			}
			that.mock(oBinding).expects("fetchResourcePath").exactly(iCallCount)
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oCache).expects("setActive").exactly(iCallCount).withExactArgs(true);
				that.mock(oBinding).expects("_fireChange").exactly(iCallCount)
					.withExactArgs({reason : ChangeReason.Change})
					.callsFake(function () {
						if (bKeepCacheOnError) {
							assert.strictEqual(oBinding.oCache, oCache);
							assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
						} else {
							assert.notStrictEqual(oBinding.oCachePromise.getResult(), oCache);
						}
					});
			});
		});
		this.mock(oBinding).expects("reset").exactly(iNoOfCalls).callsFake(function () {
			if (!bAsync) {
				// simulate #getContexts call sync to "Refresh" event
				oBinding.resolveRefreshPromise(oReadPromise);
			}
		});
		this.mock(oBinding).expects("getDependentBindings").exactly(iNoOfCalls).withExactArgs()
			.returns([oDependentBinding]);
		this.mock(oDependentBinding).expects("refreshInternal").exactly(iNoOfCalls)
			.withExactArgs("", "myGroup", false, bKeepCacheOnError)
			.resolves();

		aPromises.push(
			// code under test
			oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
			}));
		if (bAsync) { //TODO in the sync case, the wrong cache would be restored :-(
			aPromises.push(
				// code under test
				oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError)
				.then(function () {
					assert.ok(false);
				}, function (oReturnedError) {
					assert.strictEqual(oReturnedError, oError);
				}));
			// simulate #getContexts call async to "Refresh" event
			oBinding.resolveRefreshPromise(oReadPromise);
		}

		return Promise.all(aPromises);
	});

		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bFetchResourcePathFails) {
	var sTitle = "refreshInternal: bAsync=false, bKeepCacheOnError=true, GET fails"
		+ ", parent context has changed in the meantime, fetchResourcePath fails="
		+ bFetchResourcePathFails;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, null, null,
				{$$ownRequest : true}),
			oError = new Error(),
			bIsRoot = "false,true",
			oNewCache = {},
			oOldCache = oBinding.oCachePromise.getResult(),
			oRefreshPromise = Promise.reject(oError),
			oYetAnotherError = new Error(),
			that = this;

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(bIsRoot);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("path");
		this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs()
			.returns(oRefreshPromise);
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([]);
		oRefreshPromise.catch(function () {
			var oResourcePathPromise = Promise.resolve("n/a");

			that.mock(oBinding).expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(bFetchResourcePathFails
					? SyncPromise.reject(oYetAnotherError)
					: SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oOldCache).expects("setActive").never();
				that.mock(oBinding).expects("_fireChange").never();
			});
		});

		// code under test
		return oBinding.refreshInternal("path", "myGroup", /*bCheckUpdate (ignored)*/false, true)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError,
					bFetchResourcePathFails ? oYetAnotherError : oError);
				assert.strictEqual(oBinding.oCache, oNewCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: relative without own cache", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create(this.oModel, {}, "/TEAMS('1')"));

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
		this.mock(oBinding).expects("removeCachesAndMessages").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("createRefreshPromise").never();
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);

		//code under test
		assert.ok(oBinding.refreshInternal("", "myGroup").isFulfilled());
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		var sTitle = "refreshInternal: dependent bindings, suspended=" + bSuspended;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
					{$$groupId : "myGroup"}),
				oChild0 = {refreshInternal : function () {}},
				oChild0Refreshed = false,
				oChild1 = {refreshInternal : function () {}},
				oChild1Refreshed = false,
				oChild2 = {refreshInternal : function () {}},
				oChild2Refreshed = false,
				oRefreshResult,
				sResourcePathPrefix = "foo";

			this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs()
				.returns(bSuspended);
			this.mock(oBinding).expects("refreshSuspended").exactly(bSuspended ? 1 : 0)
				.withExactArgs("myGroup");
			this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
				.withExactArgs("myGroup", true);
			this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1)
				.withExactArgs(ChangeReason.Refresh);
			this.mock(oBinding).expects("getDependentBindings").withExactArgs()
				.returns([oChild0, oChild1, oChild2]);
			this.mock(oChild0).expects("refreshInternal")
				.withExactArgs(sResourcePathPrefix, "myGroup", false, undefined)
				.returns(new Promise(function (resolve) {
					setTimeout(function () {
						oChild0Refreshed = true;
						resolve();
					});
				}));
			this.mock(oChild1).expects("refreshInternal")
				.withExactArgs(sResourcePathPrefix, "myGroup", false, undefined)
				.returns(new Promise(function (resolve) {
					setTimeout(function () {
						oChild1Refreshed = true;
						resolve();
					});
				}));
			this.mock(oChild2).expects("refreshInternal")
				.withExactArgs(sResourcePathPrefix, "myGroup", false, undefined)
				.returns(new Promise(function (resolve) {
					setTimeout(function () {
						oChild2Refreshed = true;
						resolve();
					});
				}));

			//code under test
			oRefreshResult = oBinding.refreshInternal(sResourcePathPrefix, "myGroup", false);
			if (!bSuspended) {
				oBinding.resolveRefreshPromise(); // simulate getContexts
			}
			assert.ok(oRefreshResult.isPending());
			return oRefreshResult.then(function () {
				assert.strictEqual(oChild0Refreshed, true);
				assert.strictEqual(oChild1Refreshed, true);
				assert.strictEqual(oChild2Refreshed, true);
			});
		});
	});

	//********************************************************************************************
[
	{bCached : false, oGroupLock : {}},
	{bCached : true, oGroupLock : _GroupLock.$cached}
].forEach(function (oFixture) {
	QUnit.test("fetchValue: absolute binding, bCached=" + oFixture.bCached, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oListener = {},
			oPromise,
			oReadResult = {};

		this.mock(oBinding).expects("lockGroup").exactly(oFixture.bCached ? 0 : 1)
			.withExactArgs().returns(oFixture.oGroupLock);
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/EMPLOYEES/42/bar").returns("42/bar");
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(sinon.match.same(oFixture.oGroupLock), "42/bar", undefined,
				sinon.match.same(oListener))
			.returns(SyncPromise.resolve(oReadResult));

		// code under test
		oPromise = oBinding.fetchValue("/EMPLOYEES/42/bar", oListener, oFixture.bCached);

		assert.ok(oPromise.isFulfilled());
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding", function (assert) {
		var oBinding,
			bCached = {/*false,true*/},
			oContext = Context.create(this.oModel, {}, "/foo"),
			oListener = {},
			sPath = "/foo/42/bar",
			oResult = {};

		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		// code under test
		assert.strictEqual(oBinding.fetchValue(sPath, oListener, bCached).getResult(), oResult);
	});
	//TODO provide iStart, iLength parameter to fetchValue to support paging on nested list

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding, unresolved", function (assert) {
		this.bindList("TEAM_2_EMPLOYEES").fetchValue("bar", {}).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/ cache, absolute path, mismatch", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			bCached = {/*false,true*/},
			oContext = Context.create(this.oModel, undefined, "/SalesOrderList('1')"),
			oGroupLock = {unlock : function () {}},
			oListener = {},
			sPath = "/SalesOrderList('1')/ID",
			oResult = {};

		// fetchCache is called once from applyParameters before oBinding.oContext is set
		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
		});
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).atLeast(1)
			.callsFake(function () {
				this.oCache = {};
				this.oCachePromise = SyncPromise.resolve(this.oCache);
			});
		oBinding = this.bindList("SO_2_SOITEM", oContext, undefined, undefined,
			{$$groupId : "group"});

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
		this.mock(oGroupLock).expects("unlock").never();
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(oResult);

		// code under test
		assert.strictEqual(oBinding.fetchValue(sPath, oListener, bCached).getResult(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.getDistinctValues();
		}, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));

		oBinding.enableExtendedChangeDetection();
		assert.throws(function () { //TODO implement?
			oBinding.getContexts(0, 42, 0);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, third"
				+ " parameter must not be set if extended change detection is enabled"));

		assert.throws(function () {
			oBinding.getContexts(42);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, first parameter "
			+ "must be 0 if extended change detection is enabled, but is 42"));
	});
	//TODO errors on _fireFilter(mArguments) and below in Wiki

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ListBinding.prototype),
			mEventParameters = {},
			oReturn = {};

		oBinding = this.bindList("/EMPLOYEES");

		[
			"AggregatedDataStateChange",
			"change",
			"createCompleted",
			"createSent",
			"dataReceived",
			"dataRequested",
			"DataStateChange",
			"patchCompleted",
			"patchSent",
			"refresh"
		].forEach(function (sEvent) {
			oBindingMock.expects("attachEvent")
				.withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);

			assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});

		["filter", "sort", "unsupportedEvent"].forEach(function (sEvent) {
			assert.throws(function () {
				oBinding.attachEvent(sEvent);
			}, new Error("Unsupported event '" + sEvent + "': v4.ODataListBinding#attachEvent"));
		});
	});

	//*********************************************************************************************
	QUnit.test("$$groupId, $$updateGroupId, $$operationMode", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oModelMock = this.mock(this.oModel),
			oPrototypeMock;

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		// code under test
		oBinding.applyParameters({
			$$groupId : "foo",
			$$operationMode : "Server",
			$$updateGroupId : "bar"
		});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		// code under test
		oBinding.applyParameters({
			$$groupId : "foo"
		});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, undefined);
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// code under test
		oBinding.applyParameters({});
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// checkBindingParameters also called for relative binding
		oPrototypeMock = this.mock(ODataListBinding.prototype);
		oPrototypeMock.expects("applyParameters").withExactArgs({}); // called by c'tor
		oBinding = this.oModel.bindList("EMPLOYEE_2_EQUIPMENTS");
		oPrototypeMock.restore();
		// code under test
		oBinding.applyParameters({
			$$groupId : "foo",
			$$operationMode : "Server",
			$$updateGroupId : "bar"
		});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.sOperationMode, "Server");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
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
		[false, true].forEach(function (bSuspended) {
			var sTitle = "bSuspended=" + bSuspended + ", vSorters = "
				+ JSON.stringify(oFixture.vSorters) + " and mParameters = "
				+ JSON.stringify(oFixture.mParameters);

			QUnit.test("sort: " + sTitle, function (assert) {
				var oBinding,
					oModel = oFixture.oModel || this.oModel,
					oContext = Context.create(oModel, {/*oBinding*/}, "/TEAMS", 1),
					aSorters = [];

				oBinding = oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
					oFixture.mParameters);
				oBinding.setContext(oContext);

				this.mock(oBinding).expects("checkSuspended").never();
				this.mock(oBinding).expects("hasPendingChanges").returns(false);
				this.mock(_Helper).expects("toArray")
					.withExactArgs(sinon.match.same(oFixture.vSorters))
					.returns(aSorters);
				this.mock(oBinding).expects("isRootBindingSuspended").returns(bSuspended);
				this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
					.withExactArgs(ChangeReason.Sort);
				this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1)
					.withExactArgs(ChangeReason.Sort);
				this.mock(oBinding).expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1)
					.withExactArgs("");
				this.mock(oBinding).expects("getGroupId").exactly(bSuspended ? 0 : 1)
					.withExactArgs().returns("group");
				this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
					.withExactArgs("group", true);
				this.mock(oBinding).expects("fetchCache").exactly(bSuspended ? 0 : 1)
					.withExactArgs(sinon.match.same(oContext))
					.callsFake(function () {
						this.oCache = {};
						this.oCachePromise = SyncPromise.resolve(this.oCache);
					});

				// code under test
				assert.strictEqual(oBinding.sort(oFixture.vSorters), oBinding, "chaining");

				assert.strictEqual(oBinding.aSorters, aSorters);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("sort: errors", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext;

		assert.throws(function () {
			oBinding.sort([]);
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.bindList("/EMPLOYEES", null, null, null,
			{$$operationMode : OperationMode.Server});
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));

		this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1)
			.callsFake(function () {
				this.oCache = {};
				this.oCachePromise = SyncPromise.resolve(this.oCache);
			});
		oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);
		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$operationMode : OperationMode.Server});
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));
	});

	//*********************************************************************************************
	[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
		[false, true].forEach(function (bSuspended) {
			var sTitle = "filter: FilterType=" + sFilterType + ", suspended=" + bSuspended;

			QUnit.test(sTitle, function (assert) {
				var oBinding,
					oBindingMock = this.mock(ODataListBinding.prototype),
					oFilter = new Filter("Name", FilterOperator.Contains, "foo"),
					aFilters = [oFilter],
					sStaticFilter = "Age gt 18";

				oBindingMock.expects("checkSuspended").never();

				oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$filter : sStaticFilter,
					$$operationMode : OperationMode.Server
				});

				this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oFilter))
					.returns(aFilters);
				oBindingMock.expects("hasPendingChanges").withExactArgs().returns(false);
				oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
				oBindingMock.expects("getGroupId").exactly(bSuspended ? 0 : 1)
					.withExactArgs().returns("groupId");
				oBindingMock.expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
					.withExactArgs("groupId", true);
				oBindingMock.expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1)
					.withExactArgs("");
				oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1)
					.withExactArgs(sinon.match.same(oBinding.oContext));
				oBindingMock.expects("reset").exactly(bSuspended ? 0 : 1)
					.withExactArgs(ChangeReason.Filter);
				oBindingMock.expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
					.withExactArgs(ChangeReason.Filter);

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
	});

	//*********************************************************************************************
	QUnit.test("filter: removes caches and messages", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$operationMode : OperationMode.Server
			});

		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("fetchCache").withExactArgs(undefined);

		// Code under test
		oBinding.filter(/*no filter*/);
	});

	//*********************************************************************************************
	QUnit.test("filter: check errors", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.filter();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{ $$operationMode : OperationMode.Server });

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oBinding.filter();
		}, new Error("Cannot filter due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding,
			oBindingContext = {destroy : function () {}},
			oBindingContextMock = this.mock(oBindingContext),
			oBindingMock = this.mock(ListBinding.prototype),
			oModelMock = this.mock(this.oModel),
			oParentBindingPrototypeMock = this.mock(asODataParentBinding.prototype),
			oTransientBindingContext = {destroy : function () {}},
			oTransientBindingContextMock = this.mock(oTransientBindingContext);

		oBinding = this.bindList("relative"); // unresolved
		this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oBinding.oDiff = [/*some diff*/];

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oAggregation, undefined);
		assert.strictEqual(oBinding.aApplicationFilters, undefined);
		assert.strictEqual(oBinding.aContexts, undefined);
		assert.strictEqual(oBinding.oDiff, undefined);
		assert.strictEqual(oBinding.aFilters, undefined);
		//TODO does not work with ODataModel.integration "suspend/resume"
//		assert.strictEqual(oBinding.mParameters, undefined);
		assert.strictEqual(oBinding.mPreviousContextsByPath, undefined);
		assert.strictEqual(oBinding.aPreviousData, undefined);
		assert.strictEqual(oBinding.mQueryOptions, undefined);
		assert.strictEqual(oBinding.aSorters, undefined);

		assert.throws(function () {
			// code under test: must not destroy twice (fails somehow)
			oBinding.destroy();
		});

		oBinding = this.bindList("relative", Context.create(this.oModel, {}, "/foo"));
		oBinding.aContexts = [oBindingContext];
		oBinding.aContexts.unshift(oTransientBindingContext);
		oBindingContextMock.expects("destroy").withExactArgs();
		oTransientBindingContextMock.expects("destroy").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		this.mock(oBinding.getHeaderContext()).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oDiff, undefined);
		assert.strictEqual(oBinding.oHeaderContext, undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroyPreviousContexts", function (assert) {
		var oBinding = this.bindList("relative"),
			oContext1 = {destroy : function () {}},
			oContext2 = {destroy : function () {}};

		oBinding.mPreviousContextsByPath = {p1 : oContext1, p2 : oContext2};
		this.mock(oContext1).expects("destroy").withExactArgs();
		this.mock(oContext2).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroyPreviousContexts();

		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
	});

	//*********************************************************************************************
	QUnit.test("destroyPreviousContexts: binding already destroyed", function (assert) {
		var oBinding = this.bindList("relative");

		oBinding.destroy();

		// code under test - simulate a pre-rendering task after the binding was destroyed
		oBinding.destroyPreviousContexts();

		assert.strictEqual(oBinding.mPreviousContextsByPath, undefined);
	});

	//*********************************************************************************************
[
	{bDestroyLater : false, bHasRead : true},
	{bDestroyLater : true, bHasRead : false},
	{bDestroyLater : true, bHasRead : true}
].forEach(function (oFixture) {
	QUnit.test("destroyCreated: " + JSON.stringify(oFixture), function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext0 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				Promise.resolve()),
			oContext0FromServer,
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2,
				Promise.resolve()),
			oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-25)", -3,
				Promise.resolve()),
			oContext3 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-26)", -4,
				Promise.resolve()),
			aData = [{}];

		if (oFixture.bHasRead) {
			// simulate 1 entity read from server
			oBinding.createContexts(0, 1, aData);
			oContext0FromServer = oBinding.aContexts[0];
			oBinding.iCurrentEnd = 1;
		}
		// simulate 4 created entities
		oBinding.aContexts.unshift(oContext3, oContext2, oContext1, oContext0);
		oBinding.iCreatedContexts = 4;

		if (oFixture.bHasRead) {
			// check some preconditions
			assert.strictEqual(oBinding.aContexts[4], oContext0FromServer);
			assert.strictEqual(oContext0FromServer.getIndex(), 4);
			assert.strictEqual(oContext0FromServer.iIndex, 0, "Server index as expected");
		}
		assert.strictEqual(oBinding.getLength(), oFixture.bHasRead ? 15 : 14, "length");

		this.mock(oContext1).expects("destroy")
			.exactly(oFixture.bDestroyLater && oFixture.bHasRead ? 0 : 1)
			.withExactArgs();

		// code under test
		oBinding.destroyCreated(oContext1, oFixture.bDestroyLater);

		assert.strictEqual(oBinding.getLength(), oFixture.bHasRead ? 14 : 13);
		assert.strictEqual(oBinding.iCreatedContexts, 3);
		assert.strictEqual(oBinding.aContexts[0], oContext3);
		assert.strictEqual(oContext3.getIndex(), 0);
		assert.strictEqual(oBinding.aContexts[1], oContext2);
		assert.strictEqual(oContext2.getIndex(), 1);
		assert.strictEqual(oBinding.aContexts[2], oContext0);
		assert.strictEqual(oContext0.getIndex(), 2);
		assert.strictEqual(oBinding.aContexts[3], oContext0FromServer);
		if (oFixture.bHasRead) {
			assert.strictEqual(oContext0FromServer.getIndex(), 3);
		}
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-24)"],
			oFixture.bDestroyLater && oFixture.bHasRead ? oContext1 : undefined);
	});
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

			this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1)
				.callsFake(function () {
					this.oCache = oTargetCache;
					this.oCachePromise = SyncPromise.resolve(oTargetCache);
				});
			oBinding = oModel.bindList("Equipments", oInitialContext);

			// code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oCachePromise.getResult(), oTargetCache);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCreated) {
		[false, true].forEach(function (bUsePredicates) {
			var sTitle = "createContexts, bCreated = " + bCreated
					+ ", bUsePredicates = " + bUsePredicates;

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindList("/EMPLOYEES", {/*oContext*/}),
					aContexts = [{}, {}, {}],
					oContextMock = this.mock(Context),
					i,
					sPath,
					aResults = [{}, {}, {}],
					iServerIndex,
					iStart = 2;

				if (bUsePredicates) {
					aResults.forEach(function (vValue, i) {
						_Helper.setPrivateAnnotation(vValue, "predicate", "('" + i + "')");
					});
				}
				if (bCreated) {
					oBinding.aContexts.unshift({/*created*/});
					oBinding.iCreatedContexts += 1;
				}
				this.mock(this.oModel).expects("resolve").twice()
					.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
					.returns("~resolved~");
				for (i = iStart; i < iStart + aResults.length; i += 1) {
					iServerIndex = bCreated ? i - 1 : i;
					sPath = "~resolved~" + (bUsePredicates
						? _Helper.getPrivateAnnotation(aResults[i - iStart], "predicate")
						: "/" + iServerIndex);
					oContextMock.expects("create")
						.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
							sPath, iServerIndex)
						.returns(aContexts[i - iStart]);
				}

				// code under test
				assert.strictEqual(oBinding.createContexts(iStart, 3, aResults), true);

				for (i = iStart; i < iStart + aResults.length; i += 1) {
					assert.strictEqual(oBinding.aContexts[i], aContexts[i - iStart]);
				}

				// code under test : no second change event
				assert.strictEqual(oBinding.createContexts(iStart, 3, aResults), false);
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCreated) {
		var sTitle = "createContexts, paging: less data than requested; w/ created: " + bCreated;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES", {/*oContext*/}),
				iCreatedContexts = bCreated ? 1 : 0,
				i,
				aResults;

			function result(iLength, iCount) {
				iCount = iCount && iCount + (bCreated ? 1 : 0);
				return createData(iLength, 0, true, iCount);
			}

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 0, "Initial estimated length is 0");
			assert.strictEqual(oBinding.iMaxLength, Infinity);

			if (bCreated) {
				// simulate created entity which may be transient or already persisted
				oBinding.aContexts.unshift({});
				oBinding.iCreatedContexts = 1;
			}

			// code under test: set length and length final flag
			// Note: short reads are handled by _Cache and set $count!
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, 30, result(29, 20 + 29)),
				true);

			assert.strictEqual(oBinding.bLengthFinal, true,
				"some controls use bLengthFinal instead of isLengthFinal()");
			assert.strictEqual(oBinding.getLength(), 49 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 49 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 49);

			for (i = 37; i < 49; i += 1) {
				this.mock(oBinding.aContexts[i + iCreatedContexts]).expects("destroy")
					.withExactArgs();
			}
			// code under test: delete obsolete contexts
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, 30, result(17, 20 + 17)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 37);

			// code under test
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, 17, result(17)),
				false,
				"do not modify upper boundary if same data is read (no short read)");

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 37);

			// code under test: reset upper boundary
//TODO cannot happen with our _Cache; _Cache doesn't read more than final length elements
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, 30, result(30)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 60 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, Infinity);

			// code under test: no data for some other page is not a change
			assert.strictEqual(
				oBinding.createContexts(10000 + iCreatedContexts, 30, result(0)),
				false);

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 60 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 10000);
//TODO iMaxLength must be set if iResultLength > 0 || iResultLength === 0 && oRange.start === 0;
// or oRange.start is just after the last known good;
//TODO it can only shrink if iResultLength === 0

			// code under test: no data for *next* page is a change (bLengthFinal changes)
			assert.strictEqual(
				oBinding.createContexts(50 + iCreatedContexts, 30, result(0)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 50 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 50);

			// code under test
			assert.strictEqual(
				oBinding.createContexts(30 + iCreatedContexts, 20, result(0)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 30 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 30 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 30);

			// code under test: preparation for following test for server-side paging: create a gap
			assert.strictEqual(
				oBinding.createContexts(100 + iCreatedContexts, 20, result(20)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 120 + iCreatedContexts + 10);
			assert.strictEqual(oBinding.aContexts.length, 120 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, Infinity);

			aResults = result(140);
			for (i = 50; i < 100; i += 1) {
				delete aResults[i];
			}

			// code under test: gap is not read completely
			assert.strictEqual(
				oBinding.createContexts(0 + iCreatedContexts, 160, aResults),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 140 + iCreatedContexts + 10);
			assert.strictEqual(oBinding.aContexts.length, 140 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, Infinity);
		});
	});

	//*********************************************************************************************
	QUnit.test("createContexts, reuse previous contexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", {/*oContext*/}),
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES/1", 1),
			oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES/2", 2),
			oContext3 = {},
			oContextMock = this.mock(Context),
			mPreviousContextsByPath = {
				"/EMPLOYEES/0" : {},
				"/EMPLOYEES/1" : oContext1,
				"/EMPLOYEES/2" : oContext2
			};

		oBinding.mPreviousContextsByPath = mPreviousContextsByPath;
		this.mock(oContext1).expects("checkUpdate").withExactArgs();
		this.mock(oContext2).expects("checkUpdate").withExactArgs();
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES/3", 3)
			.returns(oContext3);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func).callsArg(0);
		this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs();

		// code under test
		oBinding.createContexts(1, 3, [{}, {}, {}]);

		assert.strictEqual(oBinding.aContexts[1], oContext1);
		assert.strictEqual(oBinding.aContexts[2], oContext2);
		assert.strictEqual(oBinding.aContexts[3], oContext3);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCreated) {
		var sTitle = "createContexts w/ keyPredicates, reuse previous contexts, bCreated="
				+ bCreated;

		QUnit.test(sTitle, function (assert) {
			var oBinding,
				oContext1,
				oContext2,
				oContext3,
				oContextMock = this.mock(Context),
				mPreviousContextsByPath,
				iStart = bCreated ? 2 : 1;

			oBinding = this.bindList("/EMPLOYEES", {/*oContext*/});
			if (bCreated) {
				oBinding.aContexts.unshift({/*created*/});
				oBinding.iCreatedContexts += 1;
			}
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", 1);
			oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				{/*oPromise*/}); // transient context
			oContext3 = Context.create(this.oModel, oBinding, "/EMPLOYEES('3')", 3);
			mPreviousContextsByPath = {
				"/EMPLOYEES('0')" : {destroy : function () {}},
				"/EMPLOYEES('1')" : oContext1,
				"/EMPLOYEES($uid=id-1-23)" : oContext2
			};

			oBinding.mPreviousContextsByPath = mPreviousContextsByPath;
			this.mock(oContext1).expects("destroy").never();
			this.mock(oContext2).expects("destroy").never();
			this.mock(oContext2).expects("isTransient").withExactArgs().returns(true);
			this.mock(oContext1).expects("checkUpdate").withExactArgs();
			this.mock(oContext2).expects("checkUpdate").withExactArgs();
			oContextMock.expects("create")
				.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
					"/EMPLOYEES('3')", 3)
				.returns(oContext3);
			this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func).callsArg(0);
			this.mock(mPreviousContextsByPath["/EMPLOYEES('0')"]).expects("destroy")
				.withExactArgs();

			// code under test
			oBinding.createContexts(iStart, 3, [{
				"@$ui5._" : {"predicate" : "('1')"}
			}, {
				"@$ui5._" : {"transientPredicate" : "($uid=id-1-23)"}
			}, {
				"@$ui5._" : {"predicate" : "('3')"}
			}]);

			assert.strictEqual(oBinding.aContexts[iStart], oContext1);
			assert.strictEqual(oBinding.aContexts[iStart + 1], oContext2);
			assert.strictEqual(oBinding.aContexts[iStart + 2], oContext3);
			assert.strictEqual(oBinding.aContexts[iStart].getModelIndex(), iStart);
			assert.strictEqual(oBinding.aContexts[iStart + 1].getModelIndex(), iStart + 1);
			assert.strictEqual(oBinding.aContexts[iStart + 2].getModelIndex(), iStart + 2);
			assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		});
	});

	//*********************************************************************************************
	QUnit.test("createContexts, no prerendering task if no previous contexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", {});

		this.mock(sap.ui.getCore()).expects("addPrerenderingTask").never();

		// code under test
		oBinding.createContexts(1, 1, 0);
	});

	//*********************************************************************************************
	QUnit.test("createContexts: shrink contexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", {}),
			oContext = {
				destroy : function () {}
			},
			aResults = [];

		aResults.$count = 1;
		oBinding.aContexts = [, , oContext];

		this.mock(oContext).expects("destroy").withExactArgs();

		// code under test
		oBinding.createContexts(1, 1, aResults);

		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.bLengthFinal, true);
		assert.strictEqual(oBinding.iMaxLength, 1);
	});

	//*********************************************************************************************
	QUnit.test("createContexts: do not reuse a created context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", -1,
				{/*createdPromise*/}),
			oNewContext = {};

		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('1')" : oCreatedContext
		};

		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES('1')", 0)
			.returns(oNewContext);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func).callsArg(0);
		this.mock(oCreatedContext).expects("destroy").withExactArgs();

		oBinding.createContexts(0, 1, [{
			"@$ui5._" : {"predicate" : "('1')"}
		}]);

		assert.strictEqual(oBinding.aContexts[0], oNewContext);
	});

	//*********************************************************************************************
	QUnit.test("enableExtendedChangeDetection", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
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
	[false, true].forEach(function (bKeyPredicates) {
		QUnit.test("_delete: success, use key predicates: " + bKeyPredicates, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES"),
				oCreatedContext = {
					destroy : function () {},
					getModelIndex : function () { return 0; }
				},
				aData = createData(6, 0, true, undefined, bKeyPredicates),
				aData2 = aData.slice(4, 6),
				oETagEntity = {},
				aPreviousContexts,
				that = this;

			// [-1, 0, 1, 2, undefined, 4, 5]
			oBinding.createContexts(0, 3, aData.slice(0, 3));
			aData2.$count = 6; // non-empty short read adds $count
			oBinding.createContexts(4, 10, aData2);
			oBinding.aContexts.unshift(oCreatedContext);
			oBinding.iCreatedContexts = 1;
			aPreviousContexts = oBinding.aContexts.slice();
			aData.unshift({/*created*/});
			// We assume that we start deleting index 3, but when the response arrives, it has
			// been moved to index 2.
			aData.splice(2, 1); // [-1, 0, 2, 3, 4, 5]

			assert.strictEqual(oBinding.getLength(), 7);
			this.mock(oBinding).expects("deleteFromCache")
				.withExactArgs("myGroup", "EMPLOYEES('2')", "2", sinon.match.same(oETagEntity),
					sinon.match.func)
				.callsArgWith(4, 2, aData)
				.resolves();
			oBinding.aContexts.forEach(function (oContext) {
				// #destroy would only be called for created context
				that.mock(oContext).expects("destroy").never();
			});
			if (!bKeyPredicates) {
				this.mock(oBinding.aContexts[2]).expects("checkUpdate").withExactArgs();
				this.mock(oBinding.aContexts[5]).expects("checkUpdate").withExactArgs();
			}
			this.mock(oBinding).expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Remove});

			// code under test
			return oBinding._delete("myGroup", "EMPLOYEES('2')", oBinding.aContexts[3],
					oETagEntity)
				.then(function () {
					assert.strictEqual(oBinding.iCreatedContexts, 1);
					assert.strictEqual(oBinding.getLength(), 6);
					assert.strictEqual(oBinding.aContexts.length, 6);
					assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
					assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
					assert.notOk(3 in oBinding.aContexts);
					oBinding.aContexts.forEach(function (oContext, i) {
						assert.strictEqual(oContext.getModelIndex(), i);
					});
					if (bKeyPredicates) {
						assert.strictEqual(
							oBinding.mPreviousContextsByPath[aPreviousContexts[2].getPath()],
							aPreviousContexts[2]);
						assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[3]);
						assert.strictEqual(oBinding.aContexts[4], aPreviousContexts[5]);
						assert.strictEqual(oBinding.aContexts[5], aPreviousContexts[6]);
					} else {
						assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[2]);
						assert.strictEqual(
							oBinding.mPreviousContextsByPath[aPreviousContexts[3].getPath()],
							aPreviousContexts[3]);
						assert.strictEqual(oBinding.aContexts[4].getPath(), "/EMPLOYEES/3");
						assert.strictEqual(oBinding.aContexts[5], aPreviousContexts[5]);
						assert.strictEqual(
							oBinding.mPreviousContextsByPath[aPreviousContexts[6].getPath()],
							aPreviousContexts[6]);
					}
				});
		});
	});
	//TODO check the row of a pending update with higher index

	//*********************************************************************************************
	QUnit.test("_delete: transient context that has been persisted", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext0 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				Promise.resolve()),
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2,
				Promise.resolve()),
			oETagEntity = {};

		// simulate created entities which are already persisted
		oBinding.aContexts.unshift(oContext1, oContext0);
		oBinding.iCreatedContexts = 2;
		oBinding.iMaxLength = 42;

		oBindingMock.expects("deleteFromCache")
			.withExactArgs("myGroup", "EMPLOYEES('1')", "-1"/*TODO transientPredicate*/,
				sinon.match.same(oETagEntity), sinon.match.func)
			.callsArgWith(4)
			.resolves();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});
		this.stub(oContext0, "toString"); // called by SinonJS, would call #isTransient
		this.mock(oBinding).expects("destroyCreated")
			.withExactArgs(sinon.match.same(oContext0), true);

		// code under test
		return oBinding._delete("myGroup", "EMPLOYEES('1')", oContext0, oETagEntity)
			.then(function () {
				assert.strictEqual(oBinding.iMaxLength, 42, "iMaxLength has not been reduced");
			});
	});

	//*********************************************************************************************
	QUnit.test("create: callbacks and eventing", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, null, null, {$$updateGroupId : "update"}),
			oBindingMock = this.mock(oBinding),
			oContext0,
			oContext1,
			oCreateInCacheExpectation,
			oCreatePathPromise = SyncPromise.resolve("~"),
			oError = {},
			oInitialData0 = {},
			oInitialData1 = {},
			oGroupLock0 = {},
			oGroupLock1 = {},
			oLockGroupExpectation,
			oPromise;

		oLockGroupExpectation = oBindingMock.expects("lockGroup")
			.withExactArgs("update", true, true, sinon.match.func)
			.returns(oGroupLock0);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oCreateInCacheExpectation = oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise), "",
				sinon.match(rTransientPredicate), sinon.match.same(oInitialData0), sinon.match.func,
				sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve({})));

		// code under test (create first entity, skip refresh)
		oContext0 = oBinding.create(oInitialData0, true);

		assert.strictEqual(oBinding.iCreatedContexts, 1);
		assert.strictEqual(oBinding.aContexts[0], oContext0);
		assert.strictEqual(oContext0.getIndex(), 0);
		assert.strictEqual(oContext0.iIndex, -1);

		oBindingMock.expects("lockGroup")
			.withExactArgs("update", true, true, sinon.match.func)
			.returns(oGroupLock1);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock1), sinon.match.same(oCreatePathPromise), "",
				sinon.match(rTransientPredicate), sinon.match.same(oInitialData1), sinon.match.func,
				sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve({})));

		// code under test (create second entity, skip refresh)
		oContext1 = oBinding.create(oInitialData1, true);

		assert.strictEqual(oBinding.iCreatedContexts, 2);
		assert.strictEqual(oBinding.aContexts[0], oContext1);
		assert.strictEqual(oContext1.getIndex(), 0);
		assert.strictEqual(oContext1.iIndex, -2);

		assert.strictEqual(oBinding.aContexts[1], oContext0);
		assert.strictEqual(oContext0.getIndex(), 1);
		assert.strictEqual(oContext0.iIndex, -1);

		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createSent", {context : sinon.match.same(oContext0)});

		// code under test
		oCreateInCacheExpectation.args[0][6](); // call fnSubmitCallback

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("POST on '~' failed; will be repeated automatically", sClassName,
				sinon.match.same(oError));
		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createCompleted",
				{context : sinon.match.same(oContext0), success : false});

		// code under test - call fnErrorCallback
		oCreateInCacheExpectation.args[0][5](oError);

		oBindingMock.expects("destroyCreated").withExactArgs(sinon.match.same(oContext0), true);

		// code under test - call fnCancelCallback to simulate cancellation
		oPromise = oLockGroupExpectation.args[0][3]();

		// expect the event to be fired asynchronously
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});

		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createCompleted",
				{context : sinon.match.same(oContext0), success : true});
		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createCompleted",
				{context : sinon.match.same(oContext1), success : true});

		return SyncPromise.all([
			oPromise,
			oContext0.created(),
			oContext1.created()
		]);
	});

	//*********************************************************************************************
	[{
		sGroupId : "$auto",
		sTitle : "create: absolute",
		sUpdateGroupId : "update"
	}, {
		sGroupId : "$auto",
		oInitialData : {},
		sTitle : "create: absolute, with initial data",
		sUpdateGroupId : "$direct"
	}, {
		sGroupId : "deferred",
		bRelative : true,
		sTitle : "create: relative with base context",
		sUpdateGroupId : "$auto"
	}, {
		sGroupId : "$direct",
		sTitle : "create: absolute with groupId=$direct",
		sUpdateGroupId : "$auto"
	}].forEach(function (oFixture) {
		QUnit.test(oFixture.sTitle, function (assert) {
			var oBinding,
				oBindingContext = this.oModel.createBindingContext("/"),
				oBindingMock,
				iChangeFired = 0,
				aContexts = [],
				iCreateNo = 0,
				oCreatePathPromise = {},
				aCreatePromises = [
					SyncPromise.resolve(Promise.resolve({})),
					SyncPromise.resolve(Promise.resolve({}))
				],
				oModelMock = this.mock(this.oModel),
				aRefreshSingleFinished = [false, false],
				aRefreshSinglePromises = [
					new Promise(function (resolve) {
						// ensure that it is finished after all Promises
						setTimeout(resolve.bind(null, {}), 0);
					}),
					new Promise(function (resolve) {
						// ensure that it is finished after all Promises
						setTimeout(resolve.bind(null, {}), 0);
					})
				],
				that = this;

			function checkCreatedContext() {
				var oCreatedContext = aContexts[iCreateNo];

				assert.strictEqual(oCreatedContext.getModel(), that.oModel);
				assert.strictEqual(oCreatedContext.getBinding(), oBinding);
				assert.ok(/^\/EMPLOYEES\(\$uid=.+\)$/, "path with uid");
				assert.strictEqual(oCreatedContext.getModelIndex(), 0);
				assert.strictEqual(oCreatedContext.isTransient(), true);
				assert.strictEqual(oBinding.iMaxLength, 42, "transient contexts are not counted");
				assert.strictEqual(oBinding.aContexts[0], oCreatedContext, "Transient context");
				assert.strictEqual(iChangeFired, iCreateNo + 1, "Change event fired");
			}

			function expect() {
				var oGroupLock = {},
					iCurrentCreateNo = iCreateNo;

				oBindingMock.expects("checkSuspended").withExactArgs();
				oBindingMock.expects("getGroupId").returns(oFixture.sGroupId || "$auto");
				oModelMock.expects("isDirectGroup")
					.returns(oFixture.sGroupId === "$direct");
				oModelMock.expects("isAutoGroup")
					.exactly(oFixture.sGroupId === "$direct" ? 0 : 1)
					.returns(oFixture.sGroupId === "$auto");
				oBindingMock.expects("getUpdateGroupId").returns(oFixture.sUpdateGroupId);
				oBindingMock.expects("lockGroup")
					.withExactArgs(oFixture.sUpdateGroupId, true, true, sinon.match.func)
					.returns(oGroupLock);
				oBindingMock.expects("fetchResourcePath").withExactArgs()
					.returns(oCreatePathPromise);
				oBindingMock.expects("createInCache")
					.withExactArgs(sinon.match.same(oGroupLock),
						sinon.match.same(oCreatePathPromise), "", sinon.match(rTransientPredicate),
						sinon.match.same(oFixture.oInitialData), sinon.match.func,
						sinon.match.func)
					.returns(aCreatePromises[iCurrentCreateNo]);

				aCreatePromises[iCurrentCreateNo].then(function () {
					oBindingMock.expects("lockGroup")
						.withExactArgs(oFixture.sGroupId === "$direct" ? "$direct" : "$auto")
						.returns(oGroupLock);
					oBindingMock.expects("fireEvent")
						.withExactArgs("createCompleted", {
							context : sinon.match.same(aContexts[iCurrentCreateNo]),
							success : true
						});
					oBindingMock.expects("refreshSingle")
						.withExactArgs(sinon.match.same(aContexts[iCurrentCreateNo]),
							sinon.match.same(oGroupLock))
						.returns(aRefreshSinglePromises[iCurrentCreateNo]);
				});
				aRefreshSinglePromises[iCurrentCreateNo].then(function () {
					aRefreshSingleFinished[iCurrentCreateNo] = true;
				});
			}

			if (oFixture.bRelative) {
				oBinding = this.bindList("EMPLOYEES", oBindingContext);
			} else {
				oBinding = this.bindList("/EMPLOYEES");
			}
			oBindingMock = this.mock(oBinding);
			expect();
			oBinding.attachEvent("change", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Add);
				assert.strictEqual(oBinding.iCreatedContexts, iCreateNo + 1);
				assert.ok(oBinding.aContexts[0].isTransient(), "transient context exists");
				iChangeFired += 1;
			});
			oBinding.iMaxLength = 42;
			oBindingMock.expects("refreshSingle").never();

			// code under test
			aContexts.push(oBinding.create(oFixture.oInitialData));

			checkCreatedContext();

			// code under test
			oBinding.hasPendingChanges();

			iCreateNo += 1;
			expect();

			// code under test: 2nd create
			aContexts.push(oBinding.create(oFixture.oInitialData));

			checkCreatedContext();
			assert.strictEqual(aContexts[0].getIndex(), 1);

			if (oFixture.bRelative) {
				assert.throws(function () {
					// code under test
					oBinding.setContext({}/*some different context*/);
				}, new Error("setContext on relative binding is forbidden if a transient entity "
					+ "exists: sap.ui.model.odata.v4.ODataListBinding: /|EMPLOYEES"));
			}

			return Promise.all([aContexts[0].created(), aContexts[1].created()]).then(function () {
				assert.strictEqual(aContexts[0].isTransient(), false);
				assert.ok(aRefreshSingleFinished[0]);
				assert.strictEqual(aContexts[1].isTransient(), false);
				assert.ok(aRefreshSingleFinished[1]);
				assert.strictEqual(oBinding.iCreatedContexts, 2);
				assert.strictEqual(oBinding.iMaxLength, 42, "persisted contexts are not counted");
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSkipRefresh) {
		QUnit.test("create: bSkipRefresh " + bSkipRefresh, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES"),
				oBindingMock = this.mock(oBinding),
				oContext,
				oCreatedEntity = {},
				oCreatePathPromise = {},
				oCreatePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)),
				oGroupLock0 = {},
				oGroupLock1 = {},
				oInitialData = {},
				sPredicate = "(ID=42)",
				oRefreshedEntity = {},
				that = this;

			oBindingMock.expects("lockGroup").withExactArgs("$auto", true, true,  sinon.match.func)
				.returns(oGroupLock0);
			oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
			oBindingMock.expects("createInCache")
				.withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise),
					"", sinon.match(rTransientPredicate), sinon.match.same(oInitialData),
					sinon.match.func, sinon.match.func)
				.returns(oCreatePromise);
			oCreatePromise.then(function () {
				that.mock(_Helper).expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "predicate")
					.returns(sPredicate);
				oBindingMock.expects("fireEvent")
					.withExactArgs("createCompleted", {
						context : sinon.match.same(oContext),
						success : true
					});
				oBindingMock.expects("lockGroup").withExactArgs("$auto")
					.exactly(bSkipRefresh ? 0 : 1)
					.returns(oGroupLock1);
				oBindingMock.expects("refreshSingle")
					.withExactArgs(sinon.match(function (oContext0) {
						return oContext0 === oContext
							&& oContext0.getPath() === "/EMPLOYEES(ID=42)";
					}), sinon.match.same(oGroupLock1))
					.exactly(bSkipRefresh ? 0 : 1)
					.returns(SyncPromise.resolve(oRefreshedEntity));
			});

			// code under test
			oContext = oBinding.create(oInitialData, bSkipRefresh);

			return oContext.created();
		});
	});

	//*********************************************************************************************
	[{
		sPredicate : "('bar')"
	}, {
		oInitialData : {},
		sPredicate : "('bar')"
	}, {
		oInitialData : {},
		bGetPredicate : true
	}, {
		oInitialData : {"@$ui5.keepTransientPath" : true}
	}].forEach(function (oFixture) {
		var sTitle = "create: relative binding, initial data: "
				+ JSON.stringify(oFixture.oInitialData) + ", predicate: " + oFixture.sPredicate;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("TEAM_2_EMPLOYEES",
					Context.create(this.oModel, /*oBinding*/ {}, "/TEAMS/1", 1)),
				oBindingMock = this.mock(oBinding),
				aCacheResult = [{}, {}, {"@$ui5._" : {"predicate" : "('foo')"}}, {}],
				oContext,
				oContext2 = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS/2", 2),
				aContexts,
				oCreatedEntity = {},
				oCreateGroupLock = {},
				oCreateInCachePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)),
				oCreatePathPromise = {},
				oFetchDataGroupLock = {unlock : function () {}},
				oRefreshGroupLock = {},
				oRefreshPromise = oCreateInCachePromise.then(function () {
					return SyncPromise.resolve(Promise.resolve());
				}),
				that = this;

			oBinding.enableExtendedChangeDetection();
			oBindingMock.expects("fetchResourcePath")
				.withExactArgs()
				.returns(oCreatePathPromise);
			oBindingMock.expects("checkSuspended").withExactArgs().twice();
			oBindingMock.expects("getUpdateGroupId").returns("updateGroup");
			oBindingMock.expects("lockGroup")
				.withExactArgs("updateGroup", true, true, sinon.match.func)
				.returns(oCreateGroupLock);
			oBindingMock.expects("createInCache")
				.withExactArgs(sinon.match.same(oCreateGroupLock),
					sinon.match.same(oCreatePathPromise), "", sinon.match(rTransientPredicate),
					sinon.match.same(oFixture.oInitialData), sinon.match.func, sinon.match.func)
				.returns(oCreateInCachePromise);
			oCreateInCachePromise.then(function (oEntityCreated) {
				that.mock(_Helper).expects("getPrivateAnnotation")
					.exactly(oFixture.sPredicate || oFixture.bGetPredicate ? 1 : 0)
					.withExactArgs(sinon.match.same(oCreatedEntity), "predicate")
					.returns(oFixture.sPredicate);
				oBindingMock.expects("adjustPredicate").exactly(oFixture.sPredicate ? 1 : 0)
					.withExactArgs(sinon.match(rTransientPredicate), oFixture.sPredicate,
						sinon.match.same(oContext));
				that.mock(that.oModel).expects("checkMessages").exactly(oFixture.sPredicate ? 1 : 0)
					.withExactArgs();
				oBindingMock.expects("getGroupId").withExactArgs().returns("$auto");
				oBindingMock.expects("lockGroup").withExactArgs("$auto").returns(oRefreshGroupLock);
				oBindingMock.expects("refreshSingle")
					.withExactArgs(sinon.match.same(oContext), sinon.match.same(oRefreshGroupLock))
					.returns(oRefreshPromise);
			});

			// code under test
			oContext = oBinding.create(oFixture.oInitialData);

			aCacheResult.unshift({/*transient element*/});
			oBindingMock.expects("lockGroup").withExactArgs().returns(oFetchDataGroupLock);
			this.mock(oFetchDataGroupLock).expects("unlock").withExactArgs();
			this.mock(oBinding.oContext).expects("fetchValue")
				.withExactArgs("/TEAMS/1/TEAM_2_EMPLOYEES")
				.returns(SyncPromise.resolve(aCacheResult));

			// code under test - ensure that getContexts delivers the created context correctly
			aContexts = oBinding.getContexts(0, 4);

			assert.strictEqual(aContexts.length, 4);
			assert.strictEqual(aContexts[0], oContext);
			assert.strictEqual(aContexts[1].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES/0");
			assert.strictEqual(aContexts[2].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES/1");
			assert.strictEqual(aContexts[3].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES('foo')");
			assert.strictEqual(oBinding.aPreviousData.length, 4);
			assert.ok(
				/\/TEAMS\/1\/TEAM_2_EMPLOYEES\(\$uid=id-[-0-9]+\)/.test(oBinding.aPreviousData[0]),
				oBinding.aPreviousData[0]);
			assert.strictEqual(oBinding.aPreviousData[1], "/TEAMS/1/TEAM_2_EMPLOYEES/0");
			assert.strictEqual(oBinding.aPreviousData[2], "/TEAMS/1/TEAM_2_EMPLOYEES/1");
			assert.strictEqual(oBinding.aPreviousData[3], "/TEAMS/1/TEAM_2_EMPLOYEES('foo')");

			assert.throws(function () {
				// code under test
				oBinding.setContext(oContext2);
			}, new Error("setContext on relative binding is forbidden if a transient entity "
				+ "exists: sap.ui.model.odata.v4.ODataListBinding: /TEAMS/1[1]|TEAM_2_EMPLOYEES"));

			return oContext.created().then(function () {
				that.mock(oBinding).expects("reset").withExactArgs();
				that.mock(oBinding).expects("fetchCache")
					.withExactArgs(sinon.match.same(oContext2));

				oBinding.setContext(oContext2);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("create: relative binding not yet resolved", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES");

		//code under test
		assert.throws(function () {
			oBinding.create();
		}, new Error("Binding is not yet resolved: " + oBinding.toString()));
	});

	//*********************************************************************************************
	QUnit.test("create: failure", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext,
			oCreatePathPromise = {},
			oError = new Error(),
			oCreatePromise = SyncPromise.resolve(Promise.reject(oError)),
			oGroupLock = {unlock : function () {}},
			oInitialData = {};

		oBindingMock.expects("getUpdateGroupId").returns("update");
		oBindingMock.expects("lockGroup").withExactArgs("update", true, true, sinon.match.func)
			.returns(oGroupLock);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oCreatePathPromise), "",
				sinon.match(rTransientPredicate), sinon.match.same(oInitialData), sinon.match.func,
				sinon.match.func)
			.returns(oCreatePromise);

		oBindingMock.expects("refreshSingle").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		oContext = oBinding.create(oInitialData);

		return oContext.created().then(function () {
			assert.ok(false);
		},function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	[ // [first successful call, second failing call]
		[false, true],
		[true, false],
		[undefined, true],
		[true, undefined]
	].forEach(function (aAtEnd, i) {
		QUnit.test("create: bAtEnd #" + i, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$count : true,
					$$updateGroupId : "update"
				}),
				oGroupLock = {};

			this.mock(oBinding).expects("lockGroup")
				.withExactArgs("update", true, true, sinon.match.func)
				.returns(oGroupLock);
			this.mock(oBinding.oCachePromise.getResult()).expects("create")
				.withExactArgs(sinon.match.same(oGroupLock), sinon.match(function (oPromise) {
						return oPromise.getResult() === "EMPLOYEES";
					}), "", sinon.match(rTransientPredicate), undefined, sinon.match.func,
					sinon.match.func)
				.returns(SyncPromise.resolve({}));

			// code under test
			oBinding.create(undefined, true, aAtEnd[0]);

			assert.strictEqual(oBinding.bCreatedAtEnd, !!aAtEnd[0]);

			assert.throws(function () {
				oBinding.create(undefined, true, aAtEnd[1]);
			}, new Error("Creating entities at the start and at the end is not supported."));
		});
	});

	//*********************************************************************************************
	QUnit.test("create: bAtEnd without $count", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		// code under test
		assert.throws(function () {
			oBinding.create(undefined, true, true);
		}, new Error("Must set $count to create at the end"));

		oBinding = this.bindList("TEAM_2_EMPLOYEES",
			Context.create(this.oModel, {/*oBinding*/}, "/TEAMS('42')"));

		// code under test
		assert.throws(function () {
			oBinding.create(undefined, true, true);
		}, new Error("Must set $count to create at the end"));

		oBinding = this.bindList("TEAM_2_EMPLOYEES",
			this.oModel.createBindingContext("/TEAMS('42')"));

		// code under test
		assert.throws(function () {
			oBinding.create(undefined, true, true);
		}, new Error("Must set $count to create at the end"));
	});

	//*********************************************************************************************
	QUnit.test("create and delete with bAtEnd varying", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$count : true,
				$$updateGroupId : "update"
			}),
			oBindingMock = this.mock(oBinding),
			oContext1,
			oContext2,
			oExpectation;

		oExpectation = oBindingMock.expects("lockGroup").atLeast(1).returns({});
		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oBinding.create(undefined, true, true);

		// code under test - cancel the creation (via the group lock from the create)
		oExpectation.args[0][3]();

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oContext1 = oBinding.create(undefined, true, false);

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test - create a second entity without bAtEnd
		oContext2 = oBinding.create(undefined, true);

		oBindingMock.expects("deleteFromCache")
			.callsArgWith(4, 0) // the cancel callback
			.returns(SyncPromise.resolve());

		// code under test
		oBinding._delete({}, "~", oContext1);

		assert.throws(function () {
			// code under test
			oBinding.create(undefined, true, true);
		}, new Error("Creating entities at the start and at the end is not supported."));

		oBindingMock.expects("deleteFromCache")
			.callsArgWith(4, 0) // the cancel callback
			.returns(SyncPromise.resolve());

		// code under test
		oBinding._delete({}, "~", oContext2);

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oBinding.create(undefined, true, true);

		oBinding.reset();

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oBinding.create(undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("delete transient entity", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			fnDeleteFromCache = oBinding.deleteFromCache,
			oContext;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, 4, createData(3, 0, true, 3));

		// remove request mock, all operations on client
		oBinding.oCachePromise.getResult().oRequestor.request.restore();

		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Add});
		oBindingMock.expects("getUpdateGroupId").returns("update");

		oContext = oBinding.create();
		assert.strictEqual(oBinding.iCreatedContexts, 1);
		assert.strictEqual(oBinding.getLength(), 4);

		// avoid "pause on uncaught exception"
		oContext.created().catch(function (oError) {
			assert.ok(oError.canceled, "create promise rejected with 'canceled'");
		});
		this.mock(oBinding).expects("destroyCreated")
			.withExactArgs(sinon.match.same(oContext), true).callThrough();
		oBindingMock.expects("deleteFromCache").callsFake(function () {
			return fnDeleteFromCache.apply(this, arguments).then(function () {
				// the change must only be fired when deleteFromCache is finished
				// otherwise we run into trouble with extended change detection
				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Remove})
					.callsFake(function () {
						assert.strictEqual(oBinding.iCreatedContexts, 0, "No transient context");
						assert.strictEqual(oBinding.getLength(), 3);
					});
			});
		});

		// code under test
		return oContext.delete("$direct");
	});

	//*********************************************************************************************
	QUnit.test("getDiff, bDetectUpdates=false", function (assert) {
		var oBinding = this.bindList("EMPLOYEE_2_EQUIPMENTS",
				Context.create(this.oModel, {}, "/EMPLOYEES/0")),
			oContext0 = {
				getPath : function () {}
			},
			oContext1 = {
				getPath : function () {}
			},
			aContexts = [oContext0, oContext1],
			aDiff = [],
			aPreviousData = [],
			aResult;

		oBinding.aPreviousData = aPreviousData;
		oBinding.bDetectUpdates = false;
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(0, 50).returns(aContexts);
		this.mock(oContext0).expects("getPath").withExactArgs().returns("~path~0");
		this.mock(oContext1).expects("getPath").withExactArgs().returns("~path~1");
		this.mock(oBinding).expects("diffData")
			.withExactArgs(sinon.match.same(aPreviousData), ["~path~0", "~path~1"])
			.returns(aDiff);

		// code under test
		aResult = oBinding.getDiff(50);

		assert.strictEqual(aResult, aDiff);
		assert.deepEqual(oBinding.aPreviousData, ["~path~0", "~path~1"]);
	});

	//*********************************************************************************************
	QUnit.test("getDiff, bDetectUpdates=true", function (assert) {
		var oBinding = this.bindList("EMPLOYEE_2_EQUIPMENTS",
			Context.create(this.oModel, {}, "/EMPLOYEES/0")),
			oContext0 = {
				getValue : function () {}
			},
			oContext1 = {
				getValue : function () {}
			},
			aContexts = [oContext0, oContext1],
			aDiff = [],
			oJSONMock = this.mock(JSON),
			aPreviousData = [],
			aResult;

		oBinding.aPreviousData = aPreviousData;
		oBinding.bDetectUpdates = true;
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(0, 50).returns(aContexts);
		this.mock(oContext0).expects("getValue").withExactArgs().returns("~value~0");
		oJSONMock.expects("stringify").withExactArgs("~value~0").returns("~json~0");
		this.mock(oContext1).expects("getValue").withExactArgs().returns("~value~1");
		oJSONMock.expects("stringify").withExactArgs("~value~1").returns("~json~1");
		this.mock(oBinding).expects("diffData")
			.withExactArgs(sinon.match.same(aPreviousData), ["~json~0", "~json~1"])
			.returns(aDiff);

		// code under test
		aResult = oBinding.getDiff(50);

		assert.strictEqual(aResult, aDiff);
		assert.deepEqual(oBinding.aPreviousData, ["~json~0", "~json~1"]);
	});

	//*********************************************************************************************
	[
		{op : FilterOperator.BT, result : "SupplierName ge 'SAP' and SupplierName le 'XYZ'"},
		{op : FilterOperator.NB, result : "SupplierName lt 'SAP' or SupplierName gt 'XYZ'"},
		{op : FilterOperator.EQ, result : "SupplierName eq 'SAP'"},
		{op : FilterOperator.GE, result : "SupplierName ge 'SAP'"},
		{op : FilterOperator.GT, result : "SupplierName gt 'SAP'"},
		{op : FilterOperator.LE, result : "SupplierName le 'SAP'"},
		{op : FilterOperator.LT, result : "SupplierName lt 'SAP'"},
		{op : FilterOperator.NE, result : "SupplierName ne 'SAP'"},
		{op : FilterOperator.Contains, result : "contains(SupplierName,'SAP')"},
		{op : FilterOperator.NotContains, result : "not contains(SupplierName,'SAP')"},
		{op : FilterOperator.EndsWith, result : "endswith(SupplierName,'SAP')"},
		{op : FilterOperator.NotEndsWith, result : "not endswith(SupplierName,'SAP')"},
		{op : FilterOperator.StartsWith, result : "startswith(SupplierName,'SAP')"},
		{op : FilterOperator.NotStartsWith, result : "not startswith(SupplierName,'SAP')"},
		{caseSensitive : false, op : FilterOperator.BT,
			result : "tolower(SupplierName) ge tolower('SAP') and "
				+ "tolower(SupplierName) le tolower('XYZ')"},
		{caseSensitive : false, op : FilterOperator.NB,
			result : "tolower(SupplierName) lt tolower('SAP') or "
				+ "tolower(SupplierName) gt tolower('XYZ')"},
		{caseSensitive : false, op : FilterOperator.EQ,
			result : "tolower(SupplierName) eq tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.GE,
			result : "tolower(SupplierName) ge tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.GT,
			result : "tolower(SupplierName) gt tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.LE,
			result : "tolower(SupplierName) le tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.LT,
			result : "tolower(SupplierName) lt tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.NE,
			result : "tolower(SupplierName) ne tolower('SAP')"},
		{caseSensitive : false, op : FilterOperator.Contains,
			result : "contains(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : false, op : FilterOperator.NotContains,
			result : "not contains(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : false, op : FilterOperator.EndsWith,
			result : "endswith(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : false, op : FilterOperator.NotEndsWith,
			result : "not endswith(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : false, op : FilterOperator.StartsWith,
			result : "startswith(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : false, op : FilterOperator.NotStartsWith,
			result : "not startswith(tolower(SupplierName),tolower('SAP'))"},
		{caseSensitive : true, op : FilterOperator.EQ, result : "SupplierName eq 'SAP'"},
		{caseSensitive : false, op : FilterOperator.EQ,
			result : "SupplierName eq 'SAP'",
			type : "Edm.Foo"}
	].forEach(function (oFixture) {
		QUnit.test("fetchFilter: " + oFixture.op + " --> " + oFixture.result, function (assert) {
			var oBinding = this.bindList("/SalesOrderList('4711')/SO_2_ITEMS"),
				oHelperMock = this.mock(_Helper),
				oMetaContext = {},
				oMetaModelMock = this.mock(this.oModel.oMetaModel),
				sType = oFixture.type || "Edm.String",
				oPropertyMetadata = {$Type : sType};

			this.mock(this.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
			oMetaModelMock.expects("resolve")
				.withExactArgs("SupplierName", sinon.match.same(oMetaContext))
				.returns("/resolved/path");
			oMetaModelMock.expects("getMetaContext")
				.withExactArgs(oBinding.sPath).returns(oMetaContext);
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/resolved/path")
				.returns(SyncPromise.resolve(oPropertyMetadata));
			oHelperMock.expects("formatLiteral").withExactArgs("SAP", sType)
				.returns("'SAP'");
			if (oFixture.op === FilterOperator.BT || oFixture.op === FilterOperator.NB) {
				oHelperMock.expects("formatLiteral").withExactArgs("XYZ", sType)
					.returns("'XYZ'");
			}
			oBinding.aApplicationFilters = [new Filter({
				caseSensitive : oFixture.caseSensitive !== undefined
					? oFixture.caseSensitive
					: true,
				operator : oFixture.op,
				path : "SupplierName",
				value1 : "SAP",
				value2 : "XYZ"
			})];

			// code under test
			assert.deepEqual(oBinding.fetchFilter().getResult(), [oFixture.result, undefined]);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		[false, true].forEach(function (bAnd) {
			QUnit.test("fetchFilter: dynamic '" + (bAnd ? "and" : "or") + "' and static filters, "
					+ (bRelative ? "relative" : "absolute") + " binding", function (assert) {
				var oBinding = this.bindList(bRelative ? "BP_2_SO" : "/SalesOrderList"),
					oContext = Context.create(this.oModel, {}, "/BusinessPartnerList"),
					oHelperMock = this.mock(_Helper),
					oMetaModelMock = this.mock(this.oModel.oMetaModel),
					sResolvedPath =
						bRelative ? "/BusinessPartnerList('42')/BP_2_SO" : "/SalesOrderList";

				this.mock(this.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
					.returns(sResolvedPath);
				oMetaModelMock.expects("getMetaContext")
					.withExactArgs(sResolvedPath).returns("~");
				oMetaModelMock.expects("resolve")
					.withExactArgs("SO_2_BP/CompanyName", "~")
					.returns("/resolved/path1");
				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/resolved/path1")
					.returns(SyncPromise.resolve({$Type : "Edm.String"}));
				oMetaModelMock.expects("resolve")
					.withExactArgs("GrossAmount", "~")
					.returns("/resolved/path2");
				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/resolved/path2")
					.returns(SyncPromise.resolve({$Type : "Edm.Decimal"}));
				oHelperMock.expects("formatLiteral").withExactArgs("SAP", "Edm.String")
					.returns("'SAP'");
				oHelperMock.expects("formatLiteral").withExactArgs(12345, "Edm.Decimal")
					.returns(12345);
				oBinding.aApplicationFilters = [
					new Filter({
						filters : [
							new Filter("SO_2_BP/CompanyName", FilterOperator.EQ, "SAP"),
							new Filter("GrossAmount", FilterOperator.LE, 12345)
						],
						and : bAnd
					})
				];

				assert.deepEqual(
					oBinding.fetchFilter(oContext, "GrossAmount ge 1000").getResult(),
					[(bAnd
						? "SO_2_BP/CompanyName eq 'SAP' and GrossAmount le 12345"
						: "(SO_2_BP/CompanyName eq 'SAP' or GrossAmount le 12345)"
					) + " and (GrossAmount ge 1000)", undefined]
				);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: static filter only", function (assert) {
		var oBinding = this.bindList("/SalesOrderList");

		assert.deepEqual(
			oBinding.fetchFilter(undefined, "GrossAmount ge 1000").getResult(),
			["GrossAmount ge 1000"]);
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error invalid operator", function (assert) {
		var oBinding = this.bindList("/SalesOrderList"),
			oPropertyMetadata = {$Type : "Edm.String"};

		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
		this.mock(this.oModel.oMetaModel).expects("getMetaContext")
			.withExactArgs(oBinding.sPath).returns("~");
		this.mock(this.oModel.oMetaModel).expects("resolve")
			.withExactArgs("SO_2_BP/CompanyName", "~")
			.returns("/resolved/path");
		this.mock(this.oModel.oMetaModel).expects("fetchObject")
			.withExactArgs("/resolved/path")
			.returns(SyncPromise.resolve(oPropertyMetadata));
		this.mock(_Helper).expects("formatLiteral").withExactArgs("SAP", "Edm.String")
			.returns("'SAP'");
		oBinding.aApplicationFilters = [new Filter("SO_2_BP/CompanyName", "invalid", "SAP")];

		return oBinding.fetchFilter().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Unsupported operator: invalid");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: error no metadata for filter path", function (assert) {
		var oBinding = this.bindList("/SalesOrderList"),
			sPath = "/SalesOrderList/SO_2_BP/CompanyName",
			oMetaContext = {
				getPath : function () { return sPath; }
			};

		this.mock(this.oModel.oMetaModel).expects("getMetaContext")
			.withExactArgs(oBinding.sPath).returns(oMetaContext);
		this.mock(this.oModel.oMetaModel).expects("resolve")
			.withExactArgs("SO_2_BP/CompanyName", sinon.match.same(oMetaContext))
			.returns("/resolved/path");
		this.mock(this.oModel.oMetaModel).expects("fetchObject")
			.withExactArgs("/resolved/path")
			.returns(SyncPromise.resolve());
		oBinding.aApplicationFilters = [new Filter("SO_2_BP/CompanyName", FilterOperator.EQ,
			"SAP")];

		return oBinding.fetchFilter().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Type cannot be determined, no metadata for path: "
				+ "/resolved/path");
		});
	});

	//*********************************************************************************************
	[
		{filters : [], result : undefined},
		{filters : ["path0", "path1"], result : "path0 eq path0Value and path1 eq path1Value"},
		{ // "grouping": or conjunction for filters with same path
			filters : [{ p : "path0", v : "foo" }, "path1", { p : "path0", v : "bar" }],
			result : "(path0 eq foo or path0 eq bar) and path1 eq path1Value"
		}
	].forEach(function (oFixture) {
		QUnit.test("fetchFilter: flat filter '" + oFixture.result + "'", function (assert) {
			var oBinding = this.bindList("/SalesOrderList"),
				aFilters = [],
				oHelperMock = this.mock(_Helper),
				oMetaModelMock = this.mock(this.oModel.oMetaModel),
				oPropertyMetadata = {$Type : "Edm.Type"};

			// call getMetaContext only if there are filters
			oMetaModelMock.expects("getMetaContext").exactly(oFixture.filters.length ? 1 : 0)
				.withExactArgs(oBinding.sPath).returns("~");
			oFixture.filters.forEach(function (vFilter) {
				var sPath,
					sValue;

				if (typeof vFilter === "string") { // single filter: path only
					sPath = vFilter; sValue = sPath + "Value";
				} else { // single filter: path and value
					sPath = vFilter.p; sValue = vFilter.v;
				}

				aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue));
				oMetaModelMock.expects("resolve")
					.withExactArgs(sPath, "~")
					.returns("/resolved/path");
				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/resolved/path")
					.returns(SyncPromise.resolve(oPropertyMetadata));
				oHelperMock.expects("formatLiteral").withExactArgs(sValue, "Edm.Type")
					.returns(sValue);
			});
			oBinding.aApplicationFilters = aFilters;

			return oBinding.fetchFilter().then(function (aFilterValues) {
				assert.strictEqual(aFilterValues[0], oFixture.result);
				assert.strictEqual(aFilterValues[1], undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: hierarchical filter", function (assert) {
		var oBinding = this.bindList("/Set"),
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
				new Filter("p3.0", FilterOperator.EQ, "v3.0"),
				new Filter("p3.1", FilterOperator.NB, "v3.1", "v3.1")
			],
			oMetaModelMock = this.mock(this.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.String"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");

		oMetaModelMock.expects("resolve").withExactArgs("p0.0", "~").returns("/resolved/p0.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p0.0").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p1.0", "~").returns("/resolved/p1.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.0").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p1.1", "~").returns("/resolved/p1.1");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.1").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p2.0", "~").returns("/resolved/p2.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.0").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p2.1", "~").returns("/resolved/p2.1");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.1").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p2.2", "~").returns("/resolved/p2.2");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.2").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p3.0", "~").returns("/resolved/p3.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p3.0").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p3.1", "~").returns("/resolved/p3.1");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p3.1").returns(oPromise);
		oBinding.aApplicationFilters = aFilters;

		oFilterPromise = oBinding.fetchFilter();

		assert.strictEqual(oFilterPromise.isFulfilled(), false);
		return oFilterPromise.then(function (sFilterValue) {
			assert.deepEqual(sFilterValue,
				["p0.0 eq 'v0.0'"
				+ " and (p1.0 eq 'v1.0' or p1.1 eq 'v1.1')"
				+ " and p2.0 eq 'v2.0' and p2.1 eq 'v2.1' and p2.2 eq 'v2.2'"
				+ " and p3.0 eq 'v3.0'"
				+ " and (p3.1 lt 'v3.1' or p3.1 gt 'v3.1')", undefined]
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
				var oBinding = this.bindList("/Set"),
					aFetchObjectKeys = Object.keys(oFixture.fetchObjects),
					oMetaModelMock = this.mock(this.oModel.oMetaModel);

				oBinding.aApplicationFilters = [oFixture.filter];
				oMetaModelMock.expects("getMetaContext")
					.withExactArgs(oBinding.sPath)
					.returns("~");

				aFetchObjectKeys.forEach(function (sObjectPath) {
					oMetaModelMock.expects("resolve")
						.withExactArgs(sObjectPath, "~")
						.returns("/resolved/path");
					oMetaModelMock.expects("fetchObject")
						.withExactArgs("/resolved/path")
						.returns(SyncPromise.resolve({
							$Type : oFixture.fetchObjects[sObjectPath]
						}));
				});

				// code under test
				return oBinding.fetchFilter().then(function (aFilterValues) {
					assert.deepEqual(aFilterValues, [oFixture.expectedResult, undefined]);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: any - without predicate", function (assert) {
		var oBinding = this.bindList("/Set"),
			oFilter = new Filter({
				operator : FilterOperator.Any,
				path : "p0"
			}),
			oMetaModelMock = this.mock(this.oModel.oMetaModel);

		oBinding.aApplicationFilters = [oFilter];
		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("resolve").withExactArgs("p0", "~").returns("/resolved/path");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path")
			.returns(SyncPromise.resolve({
				$Type : "Type0"
			}));

		// code under test
		return oBinding.fetchFilter().then(function (aFilterValues) {
			assert.deepEqual(aFilterValues, ["p0/any()", undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchFilter: application and control filter", function (assert) {
		var oBinding = this.bindList("/Set"),
			oMetaModelMock = this.mock(this.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.String"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("resolve").withExactArgs("p0.0", "~").returns("/resolved/p0.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p0.0").returns(oPromise);

		oMetaModelMock.expects("resolve").withExactArgs("p1.0", "~").returns("/resolved/p1.0");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.0").returns(oPromise);

		oBinding.aFilters = [new Filter("p0.0", FilterOperator.EQ, "v0.0")];
		oBinding.aApplicationFilters = [new Filter("p1.0", FilterOperator.EQ, "v1.0")];

		return oBinding.fetchFilter(undefined, "p2.0 eq 'v2.0'").then(function (sFilterValue) {
			assert.deepEqual(sFilterValue,
				["p0.0 eq 'v0.0' and p1.0 eq 'v1.0' and (p2.0 eq 'v2.0')", undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.skip("fetchFilter: filter with encoded path", function (assert) {
		//TODO encode in the filter or not?
		var oBinding = this.bindList("/Set"),
			oMetaModelMock = this.mock(this.oModel.oMetaModel),
			oPropertyMetadata = {$Type : "Edm.Decimal"},
			oPromise = Promise.resolve(oPropertyMetadata);

		oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
		oMetaModelMock.expects("resolve").withExactArgs("AmountIn€", "~").returns("/resolved/path");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(oPromise);
		oBinding.aApplicationFilters = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")];

		return oBinding.fetchFilter().then(function (aFilterValues) {
			assert.deepEqual(aFilterValues, ["AmountIn€ gt 1000", undefined]);
		});
	});

	//*********************************************************************************************
	// "a=b" -> new Filter("a", FilterOperator.EQ, "b")
	// {and : [a, b]} -> new Filter({filters: [a, b], and : true})
	// {or : [a, b]} -> new Filter({filters: [a, b]})
	[{
		filters : ["p1=v1"],
		result : "p1 eq 'v1'"
	}, {
		filters : ["p1=v1", "p1=v2"],
		result : "p1 eq 'v1' or p1 eq 'v2'"
	}, {
		filters : ["p1=v1", "p2=v2"],
		result : "p1 eq 'v1' and p2 eq 'v2'"
	}, {
		filters : ["p1=v1", "p2=v2", "p1=v3"],
		result : "(p1 eq 'v1' or p1 eq 'v3') and p2 eq 'v2'"
	}, {
		filters : [{or : ["p1=v1", "p1=v2"]}],
		result : "p1 eq 'v1' or p1 eq 'v2'"
	}, {
		filters : [{and : ["p1=v1", "p1=v2"]}],
		result : "p1 eq 'v1' and p1 eq 'v2'"
	}, {
		filters : [{or : ["p1=v1", "p1=v2", "p2=v3"]}],
		result : "p1 eq 'v1' or p1 eq 'v2' or p2 eq 'v3'"
	}, {
		filters : [{and : ["p1=v1", "p1=v2", "p2=v3"]}],
		result : "p1 eq 'v1' and p1 eq 'v2' and p2 eq 'v3'"
	}, {
		filters : ["p1=v1", {or: ["p1=v2", "p1=v3"]}],
		result : "p1 eq 'v1' and (p1 eq 'v2' or p1 eq 'v3')"
	}, {
		filters : ["p1=v1", {and : ["p1=v2", "p1=v3"]}],
		result : "p1 eq 'v1' and p1 eq 'v2' and p1 eq 'v3'"
	}, {
		filters : ["p1=v1", {or : ["p1=v2", "p2=v3"]}],
		result : "p1 eq 'v1' and (p1 eq 'v2' or p2 eq 'v3')"
	}, {
		filters : ["p1=v1", {and : ["p1=v2"]}],
		result : "p1 eq 'v1' and p1 eq 'v2'"
	}].forEach(function (oFixture, i) {
		QUnit.test("filter #" + i + ": " + JSON.stringify(oFixture.filters), function (assert) {
			var oBinding = this.bindList("/Set"),
				oMetaModelMock = this.mock(this.oModel.oMetaModel),
				oPropertyMetadata = {$Type : "Edm.String"},
				oPromise = Promise.resolve(oPropertyMetadata);

			function buildFilters(aNodes) {
				return aNodes.map(function (vNode) {
					var aParts;
					if (typeof vNode === "string") {
						aParts = vNode.split("=");
						return new Filter(aParts[0], FilterOperator.EQ, aParts[1]);
					}
					if (vNode.and) {
						return new Filter({filters : buildFilters(vNode.and), and : true});
					}
					return new Filter({filters : buildFilters(vNode.or)});
				});
			}

			oMetaModelMock.expects("fetchObject").atLeast(0).returns(oPromise);
			oBinding.aApplicationFilters = buildFilters(oFixture.filters);

			// code under test
			return oBinding.fetchFilter().then(function (aFilterValues) {
				assert.deepEqual(aFilterValues, [oFixture.result, undefined]);
			});
		});
	});

	//*********************************************************************************************
[{
	split : [new Filter("a", FilterOperator.GT, 42), undefined],
	result : ["a gt 42", undefined]
}, {
	split : [undefined, new Filter("b", FilterOperator.EQ, "before")],
	result : [undefined, "b eq 'before'"]
}, {
	split : [undefined, new Filter("b", FilterOperator.EQ, "before")],
	staticFilter : "c eq 47",
	result : ["c eq 47", "b eq 'before'"]
}, {
	split : [
		new Filter(
			[new Filter("a", FilterOperator.EQ, 1), new Filter("a", FilterOperator.EQ, 2)], false
		),
		new Filter("b", FilterOperator.EQ, "before")],
	staticFilter : "c eq 47",
	result : ["(a eq 1 or a eq 2) and (c eq 47)", "b eq 'before'"]
}, {
	split : [new Filter("a", FilterOperator.GT, 42), new Filter("b", FilterOperator.EQ, "before")],
	result : ["a gt 42", "b eq 'before'"]
}].forEach(function (oFixture, i) {
	QUnit.test("fetchFilter:  list binding aggregates data " + i, function (assert) {
		var oBinding = this.bindList("Set"),
			oContext = {},
			oFilter = {/*any filter*/},
			oMetaModelMock = this.mock(this.oModel.oMetaModel);

		oBinding.oAggregation = {};

		this.mock(FilterProcessor).expects("combineFilters").returns(oFilter);
		this.mock(_AggregationHelper).expects("splitFilter")
			.withExactArgs(sinon.match.same(oFilter), sinon.match.same(oBinding.oAggregation))
			.returns(oFixture.split);
		this.mock(this.oModel).expects("resolve").withExactArgs("Set", sinon.match.same(oContext))
			.returns("~");
		oMetaModelMock.expects("getMetaContext").withExactArgs("~").returns("oMetaContext");
		oMetaModelMock.expects("resolve").withExactArgs("a", "oMetaContext").atLeast(0)
			.returns("/resolved/a");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/a").atLeast(0)
			.returns(Promise.resolve({$Type: "Edm.Decimal"}));
		oMetaModelMock.expects("resolve").withExactArgs("b", "oMetaContext").atLeast(0)
			.returns("/resolved/b");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/b").atLeast(0)
			.returns(Promise.resolve({$Type: "Edm.String"}));

		// code under test
		return oBinding.fetchFilter(oContext, oFixture.staticFilter).then(function (aFilterValues) {
			assert.deepEqual(aFilterValues, oFixture.result);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getOrderby", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
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
	QUnit.test("changeParameters: relative w/o initial mParameters", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), null, "noCache");

		this.mock(oBinding).expects("checkSuspended").never();
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding).expects("getGroupId").returns("$auto");
		this.mock(oBinding).expects("isRootBindingSuspended").returns(false);

		// code under test;
		oBinding.changeParameters({$filter : "bar"});

		assert.ok(oBinding.oCachePromise.getResult() !== null,
			"Binding gets cache after changeParameters");
	});

	//*********************************************************************************************
	QUnit.test("doFetchQueryOptions", function (assert) {
		var aApplicationFilters = [],
			aSorters = [],
			oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oBinding,
			oBindingMock,
			mQueryOptions = {};

		this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1)
			.callsFake(function () {
				this.oCache = null;
				this.oCachePromise = SyncPromise.resolve(null);
			});
		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, aSorters, aApplicationFilters,
			{"$filter" : "staticFilter", "$orderby" : "staticSorter"});
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("getOrderby").withExactArgs("staticSorter")
			.returns("resolvedOrderby");
		oBindingMock.expects("fetchFilter")
			.withExactArgs(sinon.match.same(oContext), "staticFilter")
			.returns(SyncPromise.resolve("resolvedFilter"));
		this.mock(_Helper).expects("mergeQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.mQueryOptions), "resolvedOrderby",
				"resolvedFilter")
			.returns(mQueryOptions);

		// code under test
		assert.strictEqual(oBinding.doFetchQueryOptions(oContext).getResult(), mQueryOptions);
	});

	//*********************************************************************************************
[
	{},
	{$$filterBeforeAggregate : "foo", $apply : "bar"}
].forEach(function (mMergedQueryOptions, i) {
	QUnit.test("doCreateCache: Cache._CollectionCache " + i, function (assert) {
		var oAggregation = {
				group : {
					Dimension : {}
				}
			},
			bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindList("TEAM_2_EMPLOYEES", null, null, null, {
				$$aggregation : oAggregation
			}),
			oCache = {},
			oContext = {},
			sDeepResourcePath = "deep/resource/path",
			mQueryOptions = {},
			sResourcePath = "EMPLOYEES('42')/TEAM_2_EMPLOYEES";

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;

		this.mock(oBinding).expects("inheritQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(oContext))
			.returns(mMergedQueryOptions);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mMergedQueryOptions), sinon.match.same(bAutoExpandSelect),
				sDeepResourcePath)
			.returns(oCache);

		// code under test
		assert.strictEqual(
			oBinding.doCreateCache(sResourcePath, mQueryOptions, oContext, sDeepResourcePath),
			oCache);

		if (i > 1) {
			assert.deepEqual(mMergedQueryOptions, {$apply : "filter(foo)/bar"});
		}
	});
});

	//*********************************************************************************************
	[{
		group : {
			Dimension : {}
		},
		groupLevels : ["Dimension"]
	}, {
		aggregate : {
			Measure : {min : true}
		},
		group : {}
	}, {
		aggregate : {
			Measure : {max : true}
		},
		group : {}
	}, {
		aggregate : {
			Measure : {grandTotal : true}
		},
		group : {}
	}].forEach(function (oAggregation, i) {
		QUnit.test("doCreateCache: AggregationCache: " + i, function (assert) {
			var oBinding = this.bindList("TEAM_2_EMPLOYEES", null, null, null, {
					$$aggregation : oAggregation
				}),
				oCache = {},
				oContext = {},
				mMergedQueryOptions = {},
				sResourcePath = "EMPLOYEES('42')/TEAM_2_EMPLOYEES",
				mQueryOptions = {};

			this.mock(oBinding).expects("inheritQueryOptions")
				.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(oContext))
				.returns(mMergedQueryOptions);
			this.mock(_AggregationCache).expects("create")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
					sinon.match.same(oBinding.oAggregation), sinon.match.same(mMergedQueryOptions))
				.returns(oCache);

			// code under test
			assert.strictEqual(oBinding.doCreateCache(sResourcePath, mQueryOptions, oContext),
				oCache);
		});
	});

	//*********************************************************************************************
	QUnit.test("inheritQueryOptions - binding with parameters", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$operationMode : OperationMode.Server}),
			mQueryOptions = {};

		this.mock(oBinding).expects("getQueryOptionsForPath").never();

		// code under test
		assert.strictEqual(oBinding.inheritQueryOptions(mQueryOptions), mQueryOptions);
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
		QUnit.test("inheritQueryOptions: Test " + i, function (assert) {
			var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
				oContext = {};

			this.mock(oBinding).expects("getQueryOptionsForPath")
				.withExactArgs("", sinon.match.same(oContext))
				.returns(oFixture.mInheritedQueryOptions);

			// code under test
			assert.deepEqual(oBinding.inheritQueryOptions(
					oFixture.mDynamicQueryOptionsWithModelOptions, oContext),
				oFixture.mExpectedQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("header context created in c'tor ", function (assert) {
		var oBinding;

		// code under text
		oBinding = this.bindList("/EMPLOYEES");

		assert.deepEqual(oBinding.getHeaderContext(),
			Context.create(this.oModel, oBinding, "/EMPLOYEES"),
			"Header contexts created in c'tor");

		// code under test
		oBinding = this.bindList("EMPLOYEES");

		assert.ok(oBinding.getHeaderContext() === null);
	});

	//*********************************************************************************************
	QUnit.test("getHeaderContext", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = Context.create(this.oModel, {}, "/TEAMS", 0),
			oHeaderContext;

		// code under test
		oHeaderContext = oBinding.getHeaderContext();

		assert.strictEqual(oHeaderContext.getBinding(), oBinding);
		assert.strictEqual(oHeaderContext.getPath(), "/EMPLOYEES");

		oBinding = this.bindList("EMPLOYEES");

		// code under test
		assert.ok(oBinding.getHeaderContext() === null);

		oBinding.setContext(oContext);
		oHeaderContext = oBinding.getHeaderContext();

		assert.strictEqual(oHeaderContext.getBinding(), oBinding);
		assert.strictEqual(oHeaderContext.getPath(), "/TEAMS/EMPLOYEES");
		//TODO How do dependent bindings learn of the changed context?
	});

	//*********************************************************************************************
	QUnit.test("BCP: 1770275040 Error occurs in table growing", function (assert) {
		var done = assert.async(),
			oBinding,
			bChangeFired = false,
			aContexts,
			oData = createData(50);

		oBinding = this.bindList("/EMPLOYEES");

		this.oModel.oRequestor.request.restore();
		this.mock(this.oModel.oRequestor).expects("request")
			// exact _GroupLock instance not of interest
			.withArgs("GET", "EMPLOYEES?sap-client=111&$skip=0&$top=50")
			.resolves(oData);

		oBinding.bUseExtendedChangeDetection = true;
		oBinding.attachEvent("change", function (oEvent) {
			assert.strictEqual(bChangeFired, false);
			bChangeFired = true;
			assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
			setTimeout(function () {
				assert.strictEqual(oBinding.oDiff, undefined, "no 2nd change event, no diff!");
				done();
			}, 0);
		});

		aContexts = oBinding.getContexts(0, 50);
		assert.strictEqual(aContexts.length, 0);
		assert.strictEqual(aContexts.dataRequested, true);
		assert.deepEqual(aContexts.diff, []);

		// code under test
		aContexts = oBinding.getContexts(0, 50);
		assert.strictEqual(aContexts.length, 0);
		assert.strictEqual(aContexts.dataRequested, true);
		assert.deepEqual(aContexts.diff, []);
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: invalid input", function (assert) {
		var aAggregation = [{
				grouped : false,
				name : "BothDimensionAndMeasure",
				total : false
			}],
			oBinding = this.bindList("/EMPLOYEES");

		this.mock(_AggregationHelper).expects("buildApply").never();
		this.mock(oBinding).expects("changeParameters").never();

		assert.throws(function () {
			// code under test
			oBinding.updateAnalyticalInfo(aAggregation);
		}, new Error("Both dimension and measure: BothDimensionAndMeasure"));
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: inResult and visible; destroy twice", function (assert) {
		var aAggregation = [{
				grouped : false,
				inResult : true,
				name : "BillToParty"
			}, {
				name : "UnitProperty"
			}, {
				name : "GrossAmountInTransactionCurrency",
				total : false
			}, {
				grouped : false,
				name : "TransactionCurrency",
				visible : true
			}, {
				grouped : false,
				inResult : false,
				name : "IgnoreThisDimension",
				visible : false
			}],
			sAggregation = JSON.stringify(aAggregation),
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"),
			oTransformedAggregation = {
				aggregate : {
					GrossAmountInTransactionCurrency : {}
				},
				group : {
					BillToParty : {},
					TransactionCurrency : {},
					// Note: property which was neither dimension nor measure
					UnitProperty : {}
				}
			};

		this.mock(_AggregationHelper).expects("buildApply").withExactArgs(oTransformedAggregation)
			.returns({$apply : sApply});
		this.mock(oBinding).expects("changeParameters").withExactArgs({$apply : sApply});

		// code under test
		assert.strictEqual(oBinding.updateAnalyticalInfo(aAggregation), undefined);

		assert.strictEqual(JSON.stringify(aAggregation), sAggregation, "unchanged");
		assert.deepEqual(oBinding.oAggregation, oTransformedAggregation);

		this.mock(this.oModel).expects("bindingDestroyed")
			.withExactArgs(sinon.match.same(oBinding));
		this.mock(ListBinding.prototype).expects("destroy").on(oBinding).withExactArgs();

		// code under test
		oBinding.destroy();

		// code under test
		oBinding.destroy();
	});

	//*********************************************************************************************
	[{
		aAggregation : [{
			min : true,
			name : "GrossAmount",
			total : false
		}, {
			grouped : false,
			name : "Currency",
			visible : true
		}],
		oTransformedAggregation : {
			aggregate : {
				GrossAmount : {min : true}
			},
			group : {
				Currency : {}
			}
		}
	}, {
		aAggregation : [{
			max : true,
			name : "GrossAmount",
			total : false
		}, {
			grouped : false,
			name : "Currency",
			visible : true
		}],
		oTransformedAggregation : {
			aggregate : {
				GrossAmount : {max : true}
			},
			group : {
				Currency : {}
			}
		}
	}, {
		aAggregation : [{
			as : "AvgSalesAmount",
			max : true,
			min : true,
			name : "SalesAmount",
			total : false,
			"with" : "average"
		}],
		oTransformedAggregation : {
			aggregate : {
				AvgSalesAmount : {
					max : true,
					min : true,
					name : "SalesAmount",
					"with" : "average"
				}
			},
			group : {}
		}
	}].forEach(function (oFixture, i) {
		[false, true].forEach(function (bHasMeasureRangePromiseAfterResume) {
			var sTitle = "updateAnalyticalInfo: min/max: " + i
					+ ", has measure range promise after resume: "
					+ bHasMeasureRangePromiseAfterResume;

			QUnit.test(sTitle, function (assert) {
				var sAggregation = JSON.stringify(oFixture.aAggregation),
					sApply = "A.P.P.L.E.",
					oBinding = this.bindList("/EMPLOYEES"),
					oChangeParametersExpectation,
					mMeasureRange = {},
					oNewCache = {getMeasureRangePromise : function () {}},
					oResult;

				this.mock(_AggregationHelper).expects("buildApply")
					.withExactArgs(oFixture.oTransformedAggregation)
					.returns({$apply : sApply});
				oChangeParametersExpectation = this.mock(oBinding).expects("changeParameters")
					.withExactArgs({$apply : sApply});
				this.mock(oBinding).expects("getRootBindingResumePromise").withExactArgs()
					.callsFake(function () {
						assert.ok(oChangeParametersExpectation.called,
							"changeParameters called before");
						oBinding.oCache = oNewCache;
						oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
						return SyncPromise.resolve();
					});
				this.mock(oNewCache).expects("getMeasureRangePromise").withExactArgs()
					.returns(bHasMeasureRangePromiseAfterResume
						? Promise.resolve(mMeasureRange)
						: undefined);

				// code under test
				oResult = oBinding.updateAnalyticalInfo(oFixture.aAggregation);

				assert.strictEqual(JSON.stringify(oFixture.aAggregation), sAggregation,
					"unchanged");
				assert.deepEqual(oBinding.oAggregation, oFixture.oTransformedAggregation);
				assert.ok(oResult.measureRangePromise instanceof Promise);

				return oResult.measureRangePromise.then(function (mMeasureRange0) {
					assert.strictEqual(mMeasureRange0,
						bHasMeasureRangePromiseAfterResume ? mMeasureRange : undefined);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingle", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oCache = {
				refreshSingle : function () {}
			},
			bContextUpdated = false,
			oContext,
			bDependentsRefreshed = false,
			oEntity = {},
			oGroupLock = {getGroupId : function () {}},
			oPromise,
			oRefreshDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			oRefreshSingleExpectation,
			oRefreshSinglePromise = SyncPromise.resolve(Promise.resolve(oEntity)),
			oRootBinding = {getGroupId : function () {}},
			that = this;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, 4, createData(3, 0, true, 3));

		oContext = oBinding.aContexts[2];
		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oCache);

		oBindingMock.expects("withCache")
			.withExactArgs(sinon.match.func)
			.callsArgWith(0, oCache, "path/in/cache", oRootBinding);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
		this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
		oRefreshSingleExpectation = this.mock(oCache).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42, sinon.match.func)
			.returns(oRefreshSinglePromise);
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		oBindingMock.expects("refreshDependentBindings")
			.withExactArgs("EMPLOYEES('2')", "groupId")
			.returns(oRefreshDependentsPromise);
		oRefreshSinglePromise.then(function () {
			// checkUpdate must only be called when the cache's refreshSingle is finished
			that.mock(oContext).expects("checkUpdate").withExactArgs()
				.returns(new SyncPromise(function (resolve) {
					setTimeout(function () {
						bContextUpdated = true;
						resolve();
					});
				}));
		});

		// code under test
		oPromise = oBinding.refreshSingle(oContext, oGroupLock)
			.then(function (oRefreshedEntity) {
				assert.strictEqual(oRefreshedEntity, oEntity,
					"promise resolves with entity returned from server");
				assert.strictEqual(bContextUpdated, true);
				assert.strictEqual(bDependentsRefreshed, true);
			});

		assert.strictEqual(oPromise.isFulfilled(), false);

		oBindingMock.expects("fireDataRequested").withExactArgs();

		// code under test - callback fires data requested event
		oRefreshSingleExpectation.firstCall.args[3]();

		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});

		return oPromise;
	});
	//TODO: within #refreshSingle
	// Eliminate checkUpdate and call refreshInternal with bCheckUpdate=true
	// Find a way to use _Helper.updateExisting in _Cache.refreshSingle to do the
	// notification for the changeListeners, currently it would fail because the lookup
	// for the changeListener fails because of different paths (index versus key predicate)

	//*********************************************************************************************
	[true, false].forEach(function (bOnRemoveCalled) {
		[true, false].forEach(function (bCreated) {
			var sTitle = "refreshSingle with allow remove: " + bOnRemoveCalled + ", created: "
				+ bCreated;

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindList("/EMPLOYEES"),
					oBindingMock = this.mock(oBinding),
					oCache = {
						refreshSingleWithRemove : function () {}
					},
					oCacheRequestPromise,
					oContext,
					oContextMock,
					bContextUpdated = false,
					bDependentsRefreshed = false,
					oExpectation,
					oGroupLock = {getGroupId : function () {}},
					iIndex = bCreated ? 1 : 3,
					oRefreshDependentsPromise = new SyncPromise(function (resolve) {
						setTimeout(function () {
							bDependentsRefreshed = true;
							resolve();
						});
					}),
					oRootBinding = {getGroupId : function () {}},
					that = this;

				// initialize with 6 contexts, bLengthFinal===true and bKeyPredicates===true
				// [-2, -1, 0, 1, 2, undefined, 4, 5]
				oBinding.createContexts(0, 3, createData(3, 0, true, 3, true));
				oBinding.createContexts(4, 10, createData(2, 4, true, 6, true));
				assert.strictEqual(oBinding.iMaxLength, 6);
				// simulate create
				oBinding.aContexts.unshift(
					Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2,
						Promise.resolve()),
					Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
						Promise.resolve()));
				oBinding.iCreatedContexts = 2;

				oContext = oBinding.aContexts[iIndex];
				oContextMock = this.mock(oContext);
				oBinding.oCache = oCache;
				oBinding.oCachePromise = SyncPromise.resolve(oCache);

				oCacheRequestPromise = SyncPromise.resolve(Promise.resolve().then(function () {
					// fnOnRemove Test
					if (bOnRemoveCalled) {
						oContextMock.expects("getModelIndex").exactly(bCreated ? 0 : 1)
							.withExactArgs().callThrough();
						oBindingMock.expects("destroyCreated").exactly(bCreated ? 1 : 0)
							.withExactArgs(sinon.match.same(oContext));
						oContextMock.expects("destroy").exactly(bCreated ? 0 : 1)
							.withExactArgs();
						oBindingMock.expects("_fireChange")
							.withExactArgs({reason : ChangeReason.Remove});
						that.mock(that.oModel).expects("getDependentBindings").never();

						// code under test
						oExpectation.firstCall.args[4](iIndex);

						if (!bCreated) {
							assert.strictEqual(oBinding.aContexts.length, 7);
							assert.notOk(4 in oBinding.aContexts);
							assert.strictEqual(oBinding.aContexts[0].iIndex, -2);
							assert.strictEqual(oBinding.aContexts[1].iIndex, -1);
							assert.strictEqual(oBinding.aContexts[2].iIndex, 0);
							assert.strictEqual(oBinding.aContexts[3].iIndex, 1);
							assert.strictEqual(oBinding.aContexts[5].iIndex, 3);
							assert.strictEqual(oBinding.aContexts[6].iIndex, 4);
							assert.strictEqual(oBinding.iCreatedContexts, 2);
							assert.strictEqual(oBinding.iMaxLength, 5);
						} // else destroyCreated adjusted aContexts
					} else {
						that.mock(oGroupLock).expects("getGroupId").returns("resultingGroupId");
						oBindingMock.expects("refreshDependentBindings")
							.withExactArgs("EMPLOYEES('2')", "resultingGroupId")
							.returns(oRefreshDependentsPromise);
					}
				}));

				oContextMock.expects("getPath").returns("/EMPLOYEES('2')");
				oBindingMock.expects("withCache")
					.withExactArgs(sinon.match.func)
					.callsArgWith(0, oCache, "path/in/cache", oRootBinding);
				oContextMock.expects("getModelIndex").withExactArgs().returns(42);
				oExpectation = this.mock(oCache).expects("refreshSingleWithRemove")
					.withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42,
						sinon.match.func, sinon.match.func)
					.callsArg(3) //fireDataRequested
					.returns(oCacheRequestPromise);
				oBindingMock.expects("fireDataRequested").withExactArgs();
				oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});
				oContextMock.expects("checkUpdate")
					.exactly(bOnRemoveCalled ? 0 : 1)
					.withExactArgs()
					.returns(new SyncPromise(function (resolve) {
						setTimeout(function () {
							bContextUpdated = true;
							resolve();
						});
					}));

				// code under test
				return oBinding.refreshSingle(oContext, oGroupLock, true).then(function () {
					assert.strictEqual(bContextUpdated, !bOnRemoveCalled);
					assert.strictEqual(bDependentsRefreshed, !bOnRemoveCalled);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingle, no fireDataReceived if no fireDataRequested", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oCache = {
				refreshSingle : function () {}
			},
			oContext,
			oGroupLock = {getGroupId : function () {}};

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, 4, createData(3, 0, true, 3));

		oContext = oBinding.aContexts[2];
		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oCache);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();

		this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
		this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
		this.mock(oCache).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oGroupLock), "", 42, sinon.match.func)
			.returns(SyncPromise.resolve({/*refreshed entity*/}));
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");

		// code under test
		oBinding.refreshSingle(oContext, oGroupLock);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bDataRequested) {
		QUnit.test("refreshSingle, error handling: dataRequested already fired: " + bDataRequested,
				function (assert) {
			var oBinding = this.bindList("/EMPLOYEES"),
				oBindingMock = this.mock(oBinding),
				oCache = {refreshSingle : function () {}},
				oContext = {
					getModelIndex : function () {},
					getPath : function () { return "/EMPLOYEES('1')"; },
					toString : function () { return "Foo"; }
				},
				oError = new Error(),
				oExpectation,
				oGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				};

			oBinding.oCache = oCache;
			oBinding.oCachePromise = SyncPromise.resolve(oCache);

			oBindingMock.expects("fireDataRequested")
				.exactly(bDataRequested ? 1 : 0)
				.withExactArgs();
			oBindingMock.expects("fireDataReceived")
				.exactly(bDataRequested ? 1 : 0)
				.withExactArgs(bDataRequested ? {error : oError} : 0);
			this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
			oExpectation = this.mock(oCache).expects("refreshSingle")
				.withExactArgs(sinon.match.same(oGroupLock), "", 42, sinon.match.func)
				.returns(Promise.reject(oError));
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			if (bDataRequested) {
				oExpectation.callsArg(3);
			}
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);
			this.mock(this.oModel).expects("reportError")
				.withExactArgs("Failed to refresh entity: Foo", sClassName,
					sinon.match.same(oError));

			// code under test
			return oBinding.refreshSingle(oContext, oGroupLock);
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingle: forbidden header context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oHeaderContext = oBinding.getHeaderContext();

		assert.throws(function () {
			// code under test
			oBinding.refreshSingle(oHeaderContext);
		}, new Error("Unsupported header context: " + oHeaderContext));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bInitial) {
		QUnit.test("resumeInternal: initial=" + bInitial, function (assert) {
			var sChangeReason = {/*Filter,Sort,Refresh,Change*/},
				oContext = Context.create(this.oModel, {}, "/TEAMS"),
				oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
				oBindingMock = this.mock(oBinding),
				oDependent0 = {resumeInternal : function () {}},
				oDependent1 = {resumeInternal : function () {}},
				oDependent2 = {checkUpdate : function () {}},
				oDependent3 = {checkUpdate : function () {}},
				oFetchCacheExpectation,
				oFireExpectation,
				oGetDependentBindingsExpectation1,
				oGetDependentBindingsExpectation2,
				oResetExpectation;

			oBinding.sChangeReason = bInitial ? "AddVirtualContext" : undefined;
			oBinding.sResumeChangeReason = sChangeReason;
			oBindingMock.expects("removeCachesAndMessages").withExactArgs("");
			oResetExpectation = oBindingMock.expects("reset").withExactArgs();
			oFetchCacheExpectation = oBindingMock.expects("fetchCache")
				.withExactArgs(sinon.match.same(oContext));
			oGetDependentBindingsExpectation1 = oBindingMock.expects("getDependentBindings")
				.withExactArgs()
				.returns([oDependent0, oDependent1]);
			this.mock(oDependent0).expects("resumeInternal").withExactArgs(false);
			this.mock(oDependent1).expects("resumeInternal").withExactArgs(false);
			if (bInitial) {
				oFireExpectation = oBindingMock.expects("_fireChange")
					.withExactArgs({
						detailedReason : "AddVirtualContext",
						reason : sinon.match.same(sChangeReason)
					});
			} else {
				oFireExpectation = oBindingMock.expects("_fireRefresh")
					.withExactArgs({reason : sinon.match.same(sChangeReason)});
			}
			oGetDependentBindingsExpectation2 = this.mock(this.oModel)
				.expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oBinding.oHeaderContext))
				.returns([oDependent2, oDependent3]);
			this.mock(oDependent2).expects("checkUpdate").withExactArgs();
			this.mock(oDependent3).expects("checkUpdate").withExactArgs();

			// code under test
			oBinding.resumeInternal();

			assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
			assert.ok(oResetExpectation.calledAfter(oGetDependentBindingsExpectation1));
			assert.ok(oFetchCacheExpectation.calledAfter(oResetExpectation));
			assert.ok(oFireExpectation.calledAfter(oFetchCacheExpectation));
			assert.ok(oGetDependentBindingsExpectation2.calledAfter(oFireExpectation));
		});
	});
	//TODO This is very similar to ODCB#resumeInternal; both should be refactored to
	//  ODParentBinding#resumeInternal. Differences
	// (a) bCheckUpdate parameter: dependent bindings of a list binding must not call checkUpdate on
	//     dependent bindings while context bindings have to; analogous to #refreshInternal.
	// (b) the "header context" of the list binding must update it's dependent bindings only after
	//     _fireChange leading to a new request, see ODLB#reset.
	// We need to have integration tests first for both differences.

	//*********************************************************************************************
	QUnit.test("resumeInternal: initial binding", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.suspend();

		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.resume();
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: suspend in change event of resume", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.sResumeChangeReason = ChangeReason.Filter;
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Filter})
			.callsFake(function () {
				// simulate a suspend and a sort
				oBinding.sResumeChangeReason = ChangeReason.Sort;
			});

		// code under test
		oBinding.resumeInternal();

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings", function (assert) {
		var oActiveBinding = {
				oContext : {
					getPath : function () { return "/FOO('1')/active"; }
				}
			},
			oBinding = this.oModel.bindList("/FOO"),
			oInactiveBinding = {
				oContext : {
					getPath : function () { return "/FOO('1')/inactive"; }
				}
			},
			aDependentBindings = [oActiveBinding, oInactiveBinding];

		// simulate inactive binding
		oBinding.mPreviousContextsByPath["/FOO('1')/inactive"] = {};

		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns(aDependentBindings);

		// code under test
		assert.deepEqual(oBinding.getDependentBindings(), [oActiveBinding]);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bWithStaticFilter) {
		QUnit.test("getFilterInfo with static filter: " + bWithStaticFilter, function (assert) {
			var aApplicationFilter = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")],
				oAST = {},
				oBinding = this.bindList("/Set"),
				oCombinedFilter = {
					getAST : function () {}
				},
				aControlFilter = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")],
				oExpectedFilterInfo = {
					left : {},
					op : "&&",
					right : {
						expression : "someFilterExpression",
						syntax : "OData 4.0",
						type : "Custom"
					},
					type : "Logical"
				},
				bIncludeOrigin = {/*true or false*/},
				oResultAST;

			oBinding.aApplicationFilters = aApplicationFilter;
			oBinding.aFilters = aControlFilter;
			if (bWithStaticFilter) {
				oBinding.mQueryOptions.$filter = "someFilterExpression";
			}
			this.mock(FilterProcessor).expects("combineFilters")
				.withExactArgs(sinon.match.same(aControlFilter),
					sinon.match.same(aApplicationFilter))
				.returns(oCombinedFilter);
			this.mock(oCombinedFilter).expects("getAST")
				.withExactArgs(sinon.match.same(bIncludeOrigin))
				.returns(oAST);

			// code under test
			oResultAST = oBinding.getFilterInfo(bIncludeOrigin);

			if (bWithStaticFilter) {
				assert.deepEqual(oResultAST, oExpectedFilterInfo);
			} else {
				assert.strictEqual(oResultAST, oAST);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("getFilterInfo: no filters", function (assert) {
		var aApplicationFilter = [],
			oBinding = this.bindList("/Set"),
			aControlFilter = [],
			bIncludeOrigin = {/*true or false*/};

		oBinding.aApplicationFilters = aApplicationFilter;
		oBinding.aFilters = aControlFilter;
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs(sinon.match.same(aControlFilter), sinon.match.same(aApplicationFilter))
			.returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getFilterInfo(bIncludeOrigin), null);
	});

	//*********************************************************************************************
	QUnit.test("getFilterInfo: with only static filter", function (assert) {
		var aApplicationFilter = [],
			oBinding = this.bindList("/Set"),
			aControlFilter = [],
			sODataVersion = "foo",
			oExpectedFilterInfo = {
				expression : "someFilterExpression",
				syntax : "OData " + sODataVersion,
				type : "Custom"
			},
			bIncludeOrigin = {/*true or false*/};

		oBinding.aApplicationFilters = aApplicationFilter;
		oBinding.aFilters = aControlFilter;
		oBinding.mQueryOptions.$filter = "someFilterExpression";
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs(sinon.match.same(aControlFilter), sinon.match.same(aApplicationFilter))
			.returns(undefined);
		this.mock(this.oModel).expects("getODataVersion")
			.returns(sODataVersion);

		// code under test
		assert.deepEqual(oBinding.getFilterInfo(bIncludeOrigin),
			oExpectedFilterInfo);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHeader) {
	QUnit.test("requestSideEffects: refresh needed, refresh fails, " + bHeader, function (assert) {
		var oCacheMock = this.getCacheMock(),
			oBinding = this.bindList("/Set"),
			oContext = bHeader ? oBinding.getHeaderContext() : undefined,
			oError = new Error(),
			sGroupId = "group";

		oBinding.aContexts.push({isTransient : function () {}});
		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding.aContexts[0]).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, false, true)
			.rejects(oError);

		// code under test
		return oBinding.requestSideEffects(sGroupId, ["n/a", ""], oContext).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: refreshSingle needed, refreshSingle fails", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oContext = {},
			oBinding = this.bindList("/Set"),
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {};

		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock), false)
			.rejects(oError);

		// code under test
		return oBinding.requestSideEffects(sGroupId, ["n/a", ""], oContext).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: call refreshInternal for relative binding", function (assert) {
		var oBinding = this.bindList("relative"),
			oContext = oBinding.getHeaderContext(),
			oResult = {};

		oBinding.aContexts.push({isTransient : function () {}});
		oBinding.aContexts.push({isTransient : function () {}});
		this.mock(oBinding).expects("refreshSingle").never();
		this.mock(oBinding.aContexts[0]).expects("isTransient").withExactArgs().returns(true);
		this.mock(oBinding.aContexts[1]).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", false, true)
			.resolves(oResult);

		// code under test
		return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
			assert.strictEqual(oResult0, oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: call refreshSingle for relative binding", function (assert) {
		var oBinding = this.bindList("relative"),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"),
			oGroupLock = {},
			oResult = {};

		this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
		this.mock(oBinding).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock), false)
			.resolves(oResult);
		this.mock(oBinding).expects("refreshInternal").never();

		// code under test
		return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
			assert.strictEqual(oResult0, oResult);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHeader) {
	QUnit.test("requestSideEffects: efficient request possible, " + bHeader, function (assert) {
		var oCacheMock = this.getCacheMock(),
			oBinding = this.bindList("/Set"),
			oContext = bHeader
				? oBinding.getHeaderContext()
				: { getModelIndex : function () { return 42; } },
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {},
			aPaths = ["A"],
			oPromise = SyncPromise.resolve(),
			oResult,
			that = this;

		oBinding.iCurrentBegin = 3;
		oBinding.iCurrentEnd = 10;

		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		oCacheMock.expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {},
				bHeader ? 3 : 42,
				bHeader ? 7 : undefined)
			.callsFake(function (oGroupLock, aPaths, mNavigationPropertyPaths) {
				that.mock(oBinding).expects("visitSideEffects").withExactArgs(sGroupId,
						sinon.match.same(aPaths), bHeader ? undefined : sinon.match.same(oContext),
						sinon.match.same(mNavigationPropertyPaths), [oPromise])
					.callsFake(function (sGroupId, aPaths, oContext, mNavigationPropertyPaths,
							aPromises) {
						aPromises.push(Promise.reject(oError));
					});
				return oPromise;
			});
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oError));
		this.mock(oBinding).expects("refreshInternal").never();

		// code under test
		oResult = oBinding.requestSideEffects(sGroupId, aPaths, oContext);

		assert.ok(oResult.isPending(), "instanceof SyncPromise");

		return oResult.then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: fallback to refresh", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oBinding = this.bindList("/Set"),
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {},
			aPaths = ["A"];

		oBinding.aContexts.push({isTransient : function () {}});
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		oCacheMock.expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {}, 0, 0)
			.returns(null); // "Missing key property"
		this.mock(oBinding.aContexts[0]).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, false, true)
			.rejects(oError);

		// code under test
		return oBinding.requestSideEffects(sGroupId, aPaths).then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});
	// Note: although a list binding's oCachePromise may become pending again due to late properties
	// being added, there is no need to wait for them to arrive. We can just request the current
	// side effects now and the late property will fetch its own value later on.

	//*********************************************************************************************
	QUnit.test("requestSideEffects: all contexts transient => no refresh", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oBinding = this.bindList("/Set"),
			j;

		for (j = 0; j < 2; j += 1) {
			oBinding.aContexts.push({isTransient : function () {} });
			this.mock(oBinding.aContexts[j]).expects("isTransient").withExactArgs().returns(true);
		}
		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshInternal").never();

		// code under test
		return oBinding.requestSideEffects("group", ["n/a", ""]);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: no contexts => do refresh", function (assert) {
		var oCacheMock = this.getCacheMock(),
			oBinding = this.bindList("/Set");

		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", false, true);

		// code under test
		return oBinding.requestSideEffects("group", ["n/a", ""]);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions: with system query options", function (assert) {
		var oBinding = this.bindList("/Set");

		assert.throws(function () {
			// code under test
			oBinding.getQueryOptions(/*bWithSystemQueryOptions*/true);
		}, new Error("Unsupported parameter value: bWithSystemQueryOptions: true"));
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions: without system query options", function (assert) {
		var oBinding = this.bindList("/Set", undefined, undefined, undefined, {
				$select : "a,b,c",
				custom : "query option"
			});

		// code under test
		assert.deepEqual(oBinding.getQueryOptions(/*bWithSystemQueryOptions*/),
				{custom : "query option"});
	});

	//*********************************************************************************************
	QUnit.test("getModelIndex", function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("getLength").atLeast(0).withExactArgs().returns(10);

		// code under test
		assert.strictEqual(oBinding.getModelIndex(5), 5);
		assert.strictEqual(oBinding.getModelIndex(42), 42);

		oBinding.iCreatedContexts = 1;

		// code under test
		assert.strictEqual(oBinding.getModelIndex(5), 5);
		assert.strictEqual(oBinding.getModelIndex(42), 42);

		oBinding.bCreatedAtEnd = true;

		// code under test
		assert.strictEqual(oBinding.getModelIndex(2), 3);
		assert.strictEqual(oBinding.getModelIndex(5), 6);
		assert.strictEqual(oBinding.getModelIndex(9), 0);

		oBinding.iCreatedContexts = 2;

		// code under test
		assert.strictEqual(oBinding.getModelIndex(2), 4);
		assert.strictEqual(oBinding.getModelIndex(5), 7);
		assert.strictEqual(oBinding.getModelIndex(8), 1);
		assert.strictEqual(oBinding.getModelIndex(9), 0);

		oBinding.iCreatedContexts = 0;

		// code under test
		assert.strictEqual(oBinding.getModelIndex(0), 0);
	});

	//*********************************************************************************************
	QUnit.test("attachCreateCompleted/detachCreateCompleted", function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding),
			fnFunction = {},
			oListener = {};

		oBindingMock.expects("attachEvent")
			.withExactArgs("createCompleted", sinon.match.same(fnFunction),
				sinon.match.same(oListener));

		// code under test
		oBinding.attachCreateCompleted(fnFunction, oListener);

		oBindingMock.expects("detachEvent")
			.withExactArgs("createCompleted", sinon.match.same(fnFunction),
				sinon.match.same(oListener));

		// code under test
		oBinding.detachCreateCompleted(fnFunction, oListener);
	});

	//*********************************************************************************************
	QUnit.test("attachCreateSent/detachCreateSent", function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding),
			fnFunction = {},
			oListener = {};

		oBindingMock.expects("attachEvent")
			.withExactArgs("createSent", sinon.match.same(fnFunction), sinon.match.same(oListener));

		// code under test
		oBinding.attachCreateSent(fnFunction, oListener);

		oBindingMock.expects("detachEvent")
			.withExactArgs("createSent", sinon.match.same(fnFunction), sinon.match.same(oListener));

		// code under test
		oBinding.detachCreateSent(fnFunction, oListener);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasPath, i) {
	QUnit.test("adjustPredicate: single context #" + i, function (assert) {
		var oBinding = this.bindList("/SalesOrderList"),
			oContext = {adjustPredicate : function () {}},
			oExpectation;

		oBinding.aPreviousData = bHasPath
			? ["foo", "/SalesOrderList($uid=1)", "bar"]
			: ["foo", "bar"];
		oExpectation = this.mock(oContext).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')", sinon.match.func);

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')", oContext);
		oExpectation.args[0][2]("/SalesOrderList($uid=1)", "/SalesOrderList('42')");

		assert.deepEqual(oBinding.aPreviousData, bHasPath
			? ["foo", "/SalesOrderList('42')", "bar"]
			: ["foo", "bar"]);
		assert.notOk(oBinding.aPreviousData.hasOwnProperty("-1"));
	});
});

	//*********************************************************************************************
	QUnit.test("adjustPredicate", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/SalesOrderList($uid=1)")),
			oContext1 = {adjustPredicate : function () {}},
			oContext2 = {adjustPredicate : function () {}},
			oExpectation1,
			oExpectation2;

		oBinding.aPreviousData = ["/SalesOrderList($uid=1)/SO_2_SOITEM($uid=2)"];
		oBinding.aContexts = [,, oContext1, oContext2]; // sparse array
		this.mock(oBinding.oHeaderContext).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')");
		oExpectation1 = this.mock(oContext1).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')", sinon.match.func);
		oExpectation2 = this.mock(oContext2).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')", sinon.match.func);

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')");
		oExpectation1.args[0][2]("/SalesOrderList($uid=1)/SO_2_SOITEM($uid=2)",
			"/SalesOrderList('42')/SO_2_SOITEM($uid=2)");
		oExpectation2.args[0][2]("/SalesOrderList($uid=1)/SO_2_SOITEM($uid=3)",
			"/SalesOrderList('42')/SO_2_SOITEM($uid=3)");

		assert.deepEqual(oBinding.aPreviousData, ["/SalesOrderList('42')/SO_2_SOITEM($uid=2)"]);
		assert.notOk(oBinding.aPreviousData.hasOwnProperty("-1"));
	});

	//*********************************************************************************************
[{}, null].forEach(function (oCache, i) {
	QUnit.test("hasPendingChangesForPath: calls super, #" + i, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			sPath = {/*string*/},
			bResult = {/*boolean*/};

		oBinding.oCache = oCache;

		this.mock(asODataParentBinding.prototype).expects("hasPendingChangesForPath")
			.on(oBinding)
			.withExactArgs(sinon.match.same(sPath))
			.returns(bResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), bResult);
	});
});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: iCreatedContexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.oCache = undefined;
		oBinding.iCreatedContexts = 0;
		this.mock(asODataParentBinding.prototype).expects("hasPendingChangesForPath").never();

		// code under test
		assert.notOk(oBinding.hasPendingChangesForPath());

		oBinding.iCreatedContexts = 1;

		// code under test
		assert.ok(oBinding.hasPendingChangesForPath());
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: returns undefined", function (assert) {
		// code under test
		assert.strictEqual(this.bindList("/EMPLOYEES").doSetProperty(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl: empty meta path", function (assert) {
		var oBinding = this.bindList("/resource/path"),
			oCache = {
				sMetaPath : "meta/path",
				mQueryOptions : {},
				sResourcePath : "resource/path"
			},
			oExpectation,
			oPromise = {};

		oExpectation = this.mock(oBinding).expects("withCache").returns(oPromise);

		// code under test
		assert.strictEqual(oBinding.fetchDownloadUrl(), oPromise);

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("").returns("");
		this.mock(this.oModel.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions))
			.returns("?query");

		// code under test - callback function
		assert.strictEqual(oExpectation.args[0][0](oCache, ""),
			"/service/resource/path?query");
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl: non-empty meta path", function (assert) {
		var oBinding = this.bindList("relative/path",
				Context.create({/*oModel*/}, {/*oBinding*/}, "/resource/path")),
			oCache = {
				sMetaPath : "meta/path",
				mQueryOptions : {},
				sResourcePath : "resource/path"
			},
			oExpectation,
			oHelperMock = this.mock(_Helper),
			oPromise = {},
			mQueryOptions = {},
			mQueryOptionsForPath = {};

		oExpectation = this.mock(oBinding).expects("withCache").returns(oPromise);

		// code under test
		assert.strictEqual(oBinding.fetchDownloadUrl(), oPromise);

		oHelperMock.expects("getMetaPath")
			.withExactArgs("relative/path").returns("relative/metapath");
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "relative/path")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mQueryOptionsForPath))
			.returns(mQueryOptions);
		oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, "relative/path")
			.returns("resource/path/relative/path");
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath, "relative/metapath")
			.returns("meta/path/relative/metapath");
		this.mock(this.oModel.oRequestor).expects("buildQueryString")
			.withExactArgs("meta/path/relative/metapath", sinon.match.same(mQueryOptions))
			.returns("?query");

		// code under test - callback function
		assert.strictEqual(oExpectation.args[0][0](oCache, "relative/path"),
			"/service/resource/path/relative/path?query");
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl: unresolved", function (assert) {
		assert.throws(function () {
			this.bindList("TEAM_2_EMPLOYEES").fetchDownloadUrl();
		}, new Error("Binding is unresolved"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	QUnit.test("requestDownloadUrl: success=" + bSuccess, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error(),
			oPromise;

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(SyncPromise.resolve(
				bSuccess ? Promise.resolve("/service/resource?query") : Promise.reject(oError)
			));

		oPromise = oBinding.requestDownloadUrl();

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (sResult) {
			assert.ok(bSuccess);
			assert.strictEqual(sResult, "/service/resource?query");
		}, function (oResult) {
			assert.notOk(bSuccess);
			assert.strictEqual(oResult, oError);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: success", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(SyncPromise.resolve("/service/resource?query"));

		assert.strictEqual(oBinding.getDownloadUrl(), "/service/resource?query");
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: result pending", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(SyncPromise.resolve(Promise.resolve("/service/resource?query")));

		assert.throws(function () {
			return oBinding.getDownloadUrl();
		}, new Error("Result pending"));
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: error", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error("Failure");

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(SyncPromise.reject(oError));

		assert.throws(function () {
			return oBinding.getDownloadUrl();
		}, oError);
	});
});

//TODO integration: 2 entity sets with same $expand, but different $select
//TODO extended change detection:
//     Wir sollten auch dafür sorgen, dass die Antwort auf diesen "change"-Event dann keinen Diff enthält. So macht es v2, und das haben wir letzte Woche erst richtig verstanden.
