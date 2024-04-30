/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
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
	"sap/ui/model/odata/v4/lib/_Parser"
], function (Log, SyncPromise, Binding, ChangeReason, Filter, FilterOperator, FilterProcessor,
		FilterType, ListBinding, Sorter, OperationMode, Context, ODataListBinding, ODataModel,
		asODataParentBinding, _AggregationCache, _AggregationHelper, _Cache, _GroupLock, _Helper,
		_Parser) {
	/*eslint no-sparse-arrays: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$aggregation", "$$canonicalPath", "$$clearSelectionOnFilter",
			"$$getKeepAliveContext", "$$groupId", "$$operationMode", "$$ownRequest",
			"$$patchWithoutSideEffects", "$$sharedRequest", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		oContextPrototype = Object.getPrototypeOf(Context.create(null, null, "/foo")),
		oParentBinding = {
			isRootBindingSuspended : function () { return false; },
			getUpdateGroupId : function () { return "update"; }
		},
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
	 *   the value for "$count", remains unset if undefined
	 * @param {boolean} [bKeyPredicates]
	 *   add a property "@$ui5._/predicate" with a key predicate
	 * @returns {object}
	 *   the data
	 */
	// eslint-disable-next-line default-param-last
	function createData(iLength, iStart = 0, bDrillDown, iCount, bKeyPredicates) {
		var oData = {value : []},
			i;

		if (iCount !== undefined) {
			oData.value.$count = iCount;
		}
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

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// create ODataModel
			this.oModel = new ODataModel({serviceUrl : "/service/?sap-client=111"});
			this.oModel.setSizeLimit(3);
			// ensure that the requestor does not invoke requests
			this.mock(this.oModel.oRequestor).expects("request").never();
			// avoid that the cache requests actual metadata for faked responses
			this.mock(this.oModel.oRequestor.oModelInterface).expects("fetchMetadata").atLeast(0)
				.returns(SyncPromise.resolve());

			// in case "request" is restored, this catches accidental requests
			this.mock(_Helper).expects("createError").never();
		},

		/**
		 * Calls <code>this.oModel.bindList</code> using the given arguments, but avoids creating
		 * the prerendering task to unlock the read group lock.
		 *
		 * @returns {sap.ui.model.odata.v4.ODataListBinding} The list binding
		 */
		bindList : function () {
			try {
				this.stub(this.oModel, "addPrerenderingTask");
				return this.oModel.bindList.apply(this.oModel, arguments);
			} finally {
				this.oModel.addPrerenderingTask.restore();
			}
		},

		/**
		 * Creates a sinon mock for a cache object with read and refresh methods.
		 * @returns {object}
		 *   a Sinon mock for the created cache object
		 */
		getCacheMock : function () {
			var oCache = {
					getPendingRequestsPromise : function () {},
					isDeletingInOtherGroup : function () {},
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
			aOverriddenFunctions = ["adjustPredicate", "destroy", "getDependentBindings",
				"getGeneration", "hasPendingChangesForPath", "isUnchangedParameter",
				"prepareDeepCreate", "updateAfterCreate"];

		asODataParentBinding(oMixin);

		aOverriddenFunctions.forEach(function (sFunction) {
			assert.notStrictEqual(oBinding[sFunction], oMixin[sFunction], "overwrite " + sFunction);
		});
		Object.keys(oMixin).forEach(function (sKey) {
			if (!aOverriddenFunctions.includes(sKey)) {
				assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function () {
		var oBinding,
			oExpectation = this.mock(this.oModel).expects("bindingCreated")
				.withExactArgs(sinon.match.object);

		this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataListBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		oBinding = this.bindList("/EMPLOYEES");

		sinon.assert.calledOnceWithExactly(oExpectation, sinon.match.same(oBinding));
	});

	//*********************************************************************************************
	QUnit.test("constructor: lock when creating with base context", function () {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')");

		this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataListBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		// code under test
		this.bindList("TEAM_2_EMPLOYEES", oContext);
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var fnParentBindingSpy = this.spy(asODataParentBinding, "call"),
			oBinding = this.bindList("/EMPLOYEES");

		assert.strictEqual(oBinding.iActiveContexts, 0);
		assert.ok(oBinding.hasOwnProperty("aApplicationFilters"));
		assert.ok(oBinding.hasOwnProperty("sChangeReason"));
		assert.ok(oBinding.hasOwnProperty("aContexts"));
		assert.strictEqual(oBinding.iCreatedContexts, 0);
		assert.ok(oBinding.hasOwnProperty("iCurrentBegin"));
		assert.ok(oBinding.hasOwnProperty("iCurrentEnd"));
		assert.strictEqual(oBinding.iDeletedContexts, 0);
		assert.ok(oBinding.hasOwnProperty("oDiff"));
		assert.ok(oBinding.hasOwnProperty("aFilters"));
		assert.ok(oBinding.hasOwnProperty("bFirstCreateAtEnd"));
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
		assert.ok(oBinding.hasOwnProperty("bRefreshKeptElements"));
		assert.ok(oBinding.hasOwnProperty("bResetViaSideEffects"));
		assert.ok(oBinding.hasOwnProperty("sResumeAction"));
		assert.ok(oBinding.hasOwnProperty("aSorters"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.ok(fnParentBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
[undefined, "AddVirtualContext"].forEach(function (sChangeReason) {
	var sTitle = "initialize: resolved, suspended; sChangeReason = " + sChangeReason;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("n/a");

		oBinding.sChangeReason = sChangeReason;
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("_fireChange").never();
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sChangeReason, sChangeReason);
		assert.strictEqual(oBinding.sResumeChangeReason,
			sChangeReason ? ChangeReason.Change : ChangeReason.Refresh);
	});
});

	//*********************************************************************************************
	QUnit.test("initialize: resolved, refresh", function (assert) {
		var oBinding = this.bindList("n/a");

		oBinding.sChangeReason = undefined;
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Refresh});

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sChangeReason, ChangeReason.Refresh);
	});

	//*********************************************************************************************
	QUnit.test("initialize: resolved, with change reason", function (assert) {
		var oBinding = this.bindList("n/a");

		oBinding.sChangeReason = "AddVirtualContext";
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireChange").withExactArgs({
			detailedReason : "AddVirtualContext",
			reason : ChangeReason.Change
		});

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sChangeReason, "AddVirtualContext");
	});

	//*********************************************************************************************
	QUnit.test("initialize: unresolved", function (assert) {
		var oBinding = this.bindList("/n/a"),
			sChangeReason = {};

		oBinding.sChangeReason = sChangeReason;
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.initialize();

		assert.strictEqual(oBinding.sChangeReason, sChangeReason);
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oBinding,
			oContext = {},
			oCreateMock,
			aFilters = [],
			vFilters = {},
			oHeaderContext = {},
			oHelperMock = this.mock(_Helper),
			oODataListBindingMock = this.mock(ODataListBinding.prototype),
			mParameters = {/*see clone below for actual content*/},
			mParametersClone = {
				$$groupId : "group",
				$$operationMode : OperationMode.Server,
				$$sharedRequest : "sharedRequest",
				$$updateGroupId : "update group"
			},
			aSorters = [],
			vSorters = {};

		oCreateMock = this.mock(Context).expects("createNewContext")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.object, "/EMPLOYEES")
			.returns(oHeaderContext);
		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vFilters)).returns(aFilters);
		oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vSorters)).returns(aSorters);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters))
			.returns(mParametersClone);
		oODataListBindingMock.expects("checkBindingParameters")
			.withExactArgs(sinon.match.same(mParametersClone), aAllowedBindingParameters);
		oODataListBindingMock.expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));
		oODataListBindingMock.expects("setContext").withExactArgs(sinon.match.same(oContext));

		this.oModel.bSharedRequests = true; // must not win

		// code under test
		oBinding = new ODataListBinding(this.oModel, "/EMPLOYEES", oContext, vSorters, vFilters,
			mParameters);

		assert.strictEqual(oCreateMock.args[0][1], oBinding);

		assert.strictEqual(oBinding.aApplicationFilters, aFilters);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.strictEqual(oBinding.oDiff, undefined);
		assert.deepEqual(oBinding.aFilters, []);
		assert.strictEqual(oBinding.sGroupId, "group");
		assert.strictEqual(oBinding.bHasAnalyticalInfo, false);
		assert.deepEqual(oBinding.getHeaderContext(), oHeaderContext);
		assert.strictEqual(oBinding.sOperationMode, OperationMode.Server);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		assert.deepEqual(oBinding.aPreviousData, null);
		assert.strictEqual(oBinding.bRefreshKeptElements, false);
		assert.strictEqual(oBinding.bSharedRequest, "sharedRequest");
		assert.strictEqual(oBinding.aSorters, aSorters);
		assert.strictEqual(oBinding.sUpdateGroupId, "update group");
	});

	//*********************************************************************************************
	QUnit.test("constructor: $$sharedRequest from model", function (assert) {
		var oBinding,
			bSharedRequests = {/*false,true*/};

		this.oModel.bSharedRequests = bSharedRequests;

		// code under test
		oBinding = new ODataListBinding(this.oModel, "/EMPLOYEES");

		assert.strictEqual(oBinding.bSharedRequest, bSharedRequests);
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
	QUnit.test("c'tor: no AddVirtualContext w/ $$aggregation", function (assert) {
		var oBinding,
			mClonedParameters = {},
			mParameters = {/*$$aggregation : {aggregate : {"n/a" : {}}}*/};

		this.oModel.bAutoExpandSelect = true;
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters))
			.returns(mClonedParameters);
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(mClonedParameters)).returns(true);
		// avoid 2nd call to _Helper.clone
		this.mock(ODataListBinding.prototype).expects("applyParameters");

		// code under test
		oBinding = this.bindList("/EMPLOYEES", null, [], [], mParameters);

		assert.strictEqual(oBinding.sChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("c'tor: error cases", function (assert) {
		assert.throws(function () {
			// code under test
			this.bindList("/EMPLOYEES", undefined, new Sorter("ID"));
		}, new Error("Unsupported operation mode: undefined"));

		assert.throws(() => {
			this.bindList("/EMPLOYEES", undefined, undefined, Filter.NONE, {$$aggregation : {}});
		}, new Error("Cannot combine Filter.NONE with $$aggregation"));
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
	QUnit.test("setAggregation: Filter.NONE", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES", undefined, undefined, Filter.NONE,
			{$$operationMode : OperationMode.Server});

		assert.throws(function () {
			// code under test
			oBinding.setAggregation({});
		}, new Error("Cannot combine Filter.NONE with $$aggregation"));
	});

	//*********************************************************************************************
[0, 1, 2].forEach(function (i) {
	[0, 1, 2].forEach(function (j) {
	QUnit.test("setAggregation: " + i + " <-> " + j, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			mExpectedNewParameters = {
				$$groupId : "foo",
				$filter : "bar",
				custom : "baz"
			},
			oNewAggregation = [
				undefined,
				{group : {dimension : {}}},
				{hierarchyQualifier : "X"}
			][j],
			mParameters = {
				$$groupId : "foo",
				$filter : "bar",
				custom : "baz"
			};

		if (i !== 0) {
			mParameters.$$aggregation = [
				,
				{aggregate : {"n/a" : {}}},
				{hierarchyQualifier : "U"}
			][i];
		}
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters = mParameters;
		if (oNewAggregation !== undefined) {
			mExpectedNewParameters.$$aggregation = "~oNewAggregation~cloned~";
		}
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(false);
		this.mock(oBinding).expects("getKeepAlivePredicates").exactly(i === j ? 0 : 1)
			.withExactArgs().returns(["('0')"]);
		this.mock(oBinding).expects("resetKeepAlive").never();
		this.mock(_Helper).expects("clone")
			.exactly(i === j && oNewAggregation !== undefined ? 1 : 0)
			.withExactArgs(sinon.match.same(oNewAggregation))
			.returns("~oNewAggregation~cloned~");
		// idea: #setAggregation(o) is like #changeParameters({$$aggregation : o})
		this.mock(oBinding).expects("applyParameters").exactly(i === j ? 1 : 0)
			.withExactArgs(mExpectedNewParameters, "");

		if (i === j) {
			// code under test
			oBinding.setAggregation(oNewAggregation);
		} else {
			assert.throws(function () {
				// code under test
				oBinding.setAggregation(oNewAggregation);
			}, new Error("Cannot set $$aggregation due to a kept-alive context"));
		}
	});
	});
});

	//*********************************************************************************************
	QUnit.test("setAggregation: null", function () {
		var oBinding = this.bindList("/EMPLOYEES");

		// Note: this is an artefact due to undefined !== null
		this.mock(oBinding).expects("getKeepAlivePredicates").withExactArgs().returns([]);
		this.mock(oBinding).expects("resetKeepAlive").never();
		this.mock(_Helper).expects("clone").withExactArgs(null).returns(null);
		// idea: #setAggregation(o) is like #changeParameters({$$aggregation : o})
		this.mock(oBinding).expects("applyParameters").withExactArgs({
				$$aggregation : null // Note: this will (later) fail!
			}, "");

		// code under test
		oBinding.setAggregation(null);
	});

	//*********************************************************************************************
[undefined, {group : {dimension : {}}}].forEach(function (oAggregation, i) {
	QUnit.test("setAggregation: applyParameters fails, #" + i, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$aggregation : {aggregate : {"n/a" : {}}},
				$$groupId : "foo",
				$filter : "bar",
				custom : "baz"
			}),
			oError = new Error("This call intentionally failed"),
			mExpectedParameters = {
				$$groupId : "foo",
				$filter : "bar",
				custom : "baz"
			},
			sOldValue = JSON.stringify(oBinding.mParameters.$$aggregation);

		if (oAggregation) {
			mExpectedParameters.$$aggregation = "~oAggregation~cloned~";
		}
		this.mock(oBinding).expects("getKeepAlivePredicates").exactly(oAggregation ? 0 : 1)
			.withExactArgs().returns([]);
		this.mock(oBinding).expects("resetKeepAlive").never();
		this.mock(_Helper).expects("clone").exactly(oAggregation ? 1 : 0)
			.withExactArgs(sinon.match.same(oAggregation))
			.returns("~oAggregation~cloned~");
		// idea: #setAggregation(o) is like #changeParameters({$$aggregation : o})
		this.mock(oBinding).expects("applyParameters").withExactArgs(mExpectedParameters, "")
			.throws(oError);

		assert.throws(function () {
			// code under test
			oBinding.setAggregation(oAggregation);
		}, oError);

		assert.strictEqual(JSON.stringify(oBinding.mParameters.$$aggregation), sOldValue,
			"old value unchanged");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bVerbose) {
	QUnit.test("getAggregation: basics, bVerbose=" + bVerbose, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oExpectation,
			fnReplacer;

		oBinding.mParameters.$$aggregation = "~aggregation~";
		oExpectation = this.mock(_Helper).expects("clone")
			.withExactArgs("~aggregation~", sinon.match.func).returns("~clone~");

		// code under test
		assert.strictEqual(oBinding.getAggregation(bVerbose), "~clone~");

		fnReplacer = oExpectation.getCall(0).args[1];

		// Check:
		//   - sKey[0] === "$" => fnReplacer(sKey, vValue) === undefined for each vValue
		//   - sKey[0] !== "$" => fnReplacer(sKey, vValue) === vValue for each vValue
		// code under test
		assert.strictEqual(fnReplacer("$foo", undefined), undefined);
		assert.strictEqual(fnReplacer("$foo", null), undefined);
		assert.strictEqual(fnReplacer("$foo", ""), undefined);
		assert.strictEqual(fnReplacer("$foo", 42), undefined);
		assert.strictEqual(fnReplacer("u$a", undefined), undefined);
		assert.strictEqual(fnReplacer("u$a", null), null);
		assert.strictEqual(fnReplacer("u$a", ""), "");
		assert.strictEqual(fnReplacer("u$a", 42), 42);
		assert.strictEqual(fnReplacer("$DistanceFromRoot", "~DistanceFromRoot~"),
			bVerbose ? "~DistanceFromRoot~" : undefined);
		assert.strictEqual(fnReplacer("$DrillState", "~DrillState~"),
			bVerbose ? "~DrillState~" : undefined);
		assert.strictEqual(fnReplacer("$NodeProperty", "NodeId"), bVerbose ? "NodeId" : undefined);
		["$fetchMetadata", "$path", "$LimitedDescendantCountProperty"]
			.forEach(function (sName) {
				assert.strictEqual(fnReplacer(sName, 42), undefined);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("getAggregation: example", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		// internal data structure, not valid for #setAggregation!
		oBinding.mParameters.$$aggregation = {
			$path : "n/a", // private decorations must be dropped!
			aggregate : {
				$bar : "n/a", // not a valid OData identifier!
				foo : {
					$decoration : "n/a", // private decorations must be dropped!
					grandTotal : true,
					max : false,
					min : true,
					name : "~name~",
					subtotals : false,
					unit : "~unit~",
					with : "~width~"
				}
			},
			"grandTotal like 1.84" : true,
			grandTotalAtBottomOnly : false,
			group : {
				$bar : "n/a", // not a valid OData identifier!
				bar : { // Note: nice to know, but $ inside array should not happen
					additionally : ["~additionally~", "$additionally"]
				}
			},
			groupLevels : ["baz"],
			search : "~search~",
			subtotalsAtBottomOnly : true
		};

		// code under test
		assert.deepEqual(oBinding.getAggregation(), {
			aggregate : {
				foo : {
					grandTotal : true,
					max : false,
					min : true,
					name : "~name~",
					subtotals : false,
					unit : "~unit~",
					with : "~width~"
				}
			},
			"grandTotal like 1.84" : true,
			grandTotalAtBottomOnly : false,
			group : {
				bar : {
					additionally : ["~additionally~", "$additionally"]
				}
			},
			groupLevels : ["baz"],
			search : "~search~",
			subtotalsAtBottomOnly : true
		});
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: simulate call from c'tor", function (assert) {
		var oAggregation = {},
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"), // already calls applyParameters!
			oExpectation,
			oModelMock = this.mock(this.oModel),
			mParameters = {
				$$aggregation : oAggregation,
				$filter : "bar"
			};

		assert.strictEqual(oBinding.mParameters.$$aggregation, undefined, "initial value");

		this.oModel.bAutoExpandSelect = "~autoExpandSelect~";
		oBinding.mCacheByResourcePath = {
			"/Products" : {}
		};
		oBinding.oHeaderContext = undefined; // not yet...
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs(sinon.match.same(oAggregation), "~autoExpandSelect~",
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation)).returns({$apply : sApply});
		oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true)
			.returns({$filter : "bar"});
		oExpectation = this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("fetchCache").callsFake(function () {
			assert.ok(oBinding.hasOwnProperty("oQueryOptionsPromise"));
			assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
			// test if #removeCachesAndMessages is called before #fetchCache
			assert.ok(oExpectation.called);
		});
		this.mock(oBinding).expects("reset").withExactArgs(undefined);

		// code under test
		oBinding.applyParameters(mParameters);

		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply,
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$aggregation & $apply", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			// Note: this is the same, no matter if both are supplied to c'tor or $apply is added
			// later via #changeParameters
			oBinding.applyParameters({$$aggregation : {}, $apply : ""});
		}, new Error("Cannot combine $$aggregation and $apply"));
		assert.notOk("$apply" in oBinding.mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$getKeepAliveContext & $apply", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			// Note: this is the same, no matter if both are supplied to c'tor or $apply is added
			// later via #changeParameters
			oBinding.applyParameters({$apply : "", $$getKeepAliveContext : true});
		}, new Error("Cannot combine $$getKeepAliveContext and $apply"));
		assert.notOk("$apply" in oBinding.mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: validateAggregationAndSetPath fails", function (assert) {
		var oAggregation = {},
			oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error("This call intentionally failed");

		oBinding.mParameters.$$aggregation = oAggregation;
		oBinding.mQueryOptions = {$apply : "A.P.P.L.E."};
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs({"n/a" : "unsupported content here"}, false,
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES")
			.throws(oError);
		this.mock(_AggregationHelper).expects("buildApply").never();

		assert.throws(function () {
			// code under test
			oBinding.applyParameters({$$aggregation : {"n/a" : "unsupported content here"}});
		}, oError);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "unchanged");
		assert.deepEqual(oBinding.mQueryOptions, {$apply : "A.P.P.L.E."}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: buildQueryOptions fails", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error("This call intentionally failed"),
			mParameters = {"sap-*" : "not allowed"};

		this.mock(oBinding.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true)
			.throws(oError);

		assert.throws(function () {
			// code under test
			oBinding.applyParameters(mParameters);
		}, oError);
		assert.deepEqual(oBinding.mParameters, {}, "unchanged");
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuspended) {
	var iCallCount = bSuspended ? 0 : 1;

	//*********************************************************************************************
[
	["foo"],
	["$filter"],
	["$orderby"],
	["$filter", "$orderby"],
	["$filter", "$orderby", "foo"]
].forEach(function (aChangedParameters) {
	[false, true].forEach(function (bAggregation) {
	const sTitle = "applyParameters: call from changeParameters, "
		+ JSON.stringify(aChangedParameters) + ", w/ $$aggregation: " + bAggregation;
	QUnit.test(sTitle, function (assert) {
		var oAggregation = {},
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create(this.oModel, oParentBinding, "/TEAMS")),
			oModelMock = this.mock(this.oModel),
			mParameters = {
				$$operationMode : OperationMode.Server,
				$filter : "bar"
			},
			bSideEffectsRefresh = !aChangedParameters.includes("foo");

		oBinding.mParameters = {$$clearSelectionOnFilter : true};
		if (bAggregation) {
			mParameters.$$aggregation = oAggregation;
		}
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath").never();
		this.mock(_AggregationHelper).expects("buildApply").exactly(bAggregation ? 1 : 0)
			.withExactArgs(sinon.match.same(oAggregation)).returns({$apply : sApply});
		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({$filter : "bar"});
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
		this.mock(oBinding).expects("setResetViaSideEffects").withExactArgs(bSideEffectsRefresh);
		this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
			.withExactArgs(ChangeReason.Change);
		this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount)
			.withExactArgs("");
		this.mock(oBinding).expects("fetchCache").exactly(iCallCount)
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Change);
		this.mock(oBinding.oHeaderContext).expects("setSelected")
			.exactly(!bSuspended && aChangedParameters.includes("$filter") ? 1 : 0);
		this.mock(oBinding.oHeaderContext).expects("checkUpdate").exactly(iCallCount)
			.withExactArgs();

		// code under test
		oBinding.applyParameters(mParameters, ChangeReason.Change, aChangedParameters);

		assert.deepEqual(oBinding.mQueryOptions, bAggregation
			? {$apply : sApply, $filter : "bar"}
			: {$filter : "bar"});
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation,
			bAggregation ? oAggregation : undefined, "$$aggregation");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("applyParameters: with change in $apply, " + bSuspended, function (assert) {
		var oAggregation = {},
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"),
			mParameters = {
				$$aggregation : oAggregation,
				$filter : "bar"
			};

		oBinding.mQueryOptions.$apply = "old $apply";
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs(sinon.match.same(oAggregation), false,
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation)).returns({$apply : sApply});
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({$filter : "bar"});
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
		this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
			.withExactArgs(ChangeReason.Filter);
		this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount)
			.withExactArgs("");
		this.mock(oBinding).expects("fetchCache").exactly(iCallCount)
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);

		// code under test - simulate call from setAggregation
		oBinding.applyParameters(mParameters, "");

		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply,
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $apply is dropped, " + bSuspended, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			mParameters = {
				$filter : "bar"
			};

		oBinding.mQueryOptions.$apply = "old $apply";
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath").never();
		this.mock(_AggregationHelper).expects("buildApply").never();
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({$filter : "bar"});
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
		this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
			.withExactArgs(ChangeReason.Filter);
		this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount)
			.withExactArgs("");
		this.mock(oBinding).expects("fetchCache").exactly(iCallCount)
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);

		// code under test - simulate call from setAggregation
		oBinding.applyParameters(mParameters, "");

		assert.deepEqual(oBinding.mQueryOptions, {
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$aggregation not unchanged, " + bSuspended, function (assert) {
		var oAggregation = {
				// aggregate : {GrossAmount : {subtotals : true}},
				// groupLevels : ["LifecycleStatus"]
			},
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"),
			mParameters = {
				$$aggregation : oAggregation,
				$filter : "bar"
			};

		oBinding.mQueryOptions.$apply = sApply; // no change in $apply
		oBinding.mParameters.$$aggregation = {
			// aggregate : {GrossAmount : {}},
			// groupLevels : ["LifecycleStatus"]
		};
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs(sinon.match.same(oAggregation), false,
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation)).returns({$apply : sApply});
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({$filter : "bar"});
		this.mock(oBinding).expects("isUnchangedParameter")
			.withExactArgs("$$aggregation", sinon.match.same(oBinding.mParameters.$$aggregation))
			.returns(false);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
		this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
			.withExactArgs(ChangeReason.Filter);
		this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount)
			.withExactArgs("");
		this.mock(oBinding).expects("fetchCache").exactly(iCallCount)
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);

		// code under test - simulate call from setAggregation
		oBinding.applyParameters(mParameters, "");

		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply,
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: from updateAnalyticalInfo, " + bSuspended, function (assert) {
		var oAggregation = {
				// aggregate : {GrossAmount : {subtotals : true}},
				// groupLevels : ["LifecycleStatus"]
			},
			sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"),
			mParameters = {
				$$aggregation : oAggregation
			};

		oBinding.bHasAnalyticalInfo = true;
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs(sinon.match.same(oAggregation), false,
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation)).returns({$apply : sApply});
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({});
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
		this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
			.withExactArgs(ChangeReason.Change);
		this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount)
			.withExactArgs("");
		this.mock(oBinding).expects("fetchCache").exactly(iCallCount)
			.withExactArgs(sinon.match.same(oBinding.oContext));
		this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Change);

		// code under test - simulate call from setAggregation
		oBinding.applyParameters(mParameters, "");

		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
	});
});

	//*********************************************************************************************
[{
	iDeepEqualCallCount : 1,
	oNewAggregation : {},
	oOldAggregation : {}
}, {
	iDeepEqualCallCount : 0,
	oNewAggregation : undefined,
	oOldAggregation : {}
}, {
	iDeepEqualCallCount : 0,
	oNewAggregation : {},
	oOldAggregation : undefined
}, {
	iDeepEqualCallCount : 0,
	oNewAggregation : undefined,
	oOldAggregation : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("applyParameters: no change in $apply, " + i, function (assert) {
		var sApply = "A.P.P.L.E.",
			oBinding = this.bindList("/EMPLOYEES"),
			mParameters = {
				$$aggregation : oFixture.oNewAggregation,
				$filter : "bar"
			};

		oBinding.mParameters.$$aggregation = oFixture.oOldAggregation;
		oBinding.mQueryOptions.$apply = sApply;
		this.mock(_AggregationHelper).expects("validateAggregationAndSetPath")
			.withExactArgs(sinon.match.same(oFixture.oNewAggregation), false,
				sinon.match.same(this.oModel.oInterface.fetchMetadata), "/EMPLOYEES");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oFixture.oNewAggregation)).returns({$apply : sApply});
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns({$filter : "bar"});
		this.mock(oBinding).expects("isUnchangedParameter").exactly(oFixture.iDeepEqualCallCount)
			.withExactArgs("$$aggregation", sinon.match.same(oFixture.oOldAggregation))
			.returns(true);
		this.mock(oBinding).expects("isRootBindingSuspended").never();
		this.mock(oBinding).expects("setResumeChangeReason").never();
		this.mock(oBinding).expects("removeCachesAndMessages").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("reset").never();

		// code under test - simulate call from setAggregation
		oBinding.applyParameters(mParameters, "");

		assert.deepEqual(oBinding.mQueryOptions, {
			$apply : sApply,
			$filter : "bar"
		}, "mQueryOptions");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mParameters.$$aggregation, oFixture.oNewAggregation);
	});
});

	//*********************************************************************************************
	QUnit.test("applyParameters: reset selection", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oBindingMock = this.mock(oBinding);
		const oContextMock = this.mock(oBinding.oHeaderContext);

		oContextMock.expects("setSelected").never();
		delete oBinding.mParameters; // call from constructor

		// code under test - no reset
		oBinding.applyParameters({});

		oBinding.mParameters = {};

		// code under test - no reset
		oBinding.applyParameters({});

		oBinding.mParameters = {$$clearSelectionOnFilter : true};

		const oSetSelectedExpectation = oContextMock.expects("setSelected").withExactArgs(false);
		const oRemoveCacheExpectation = oBindingMock.expects("removeCachesAndMessages")
			.withExactArgs("");

		// code under test
		oBinding.applyParameters({$$clearSelectionOnFilter : true}, undefined, ["$filter"]);

		assert.ok(oSetSelectedExpectation.calledBefore(oRemoveCacheExpectation));

		oContextMock.expects("setSelected").exactly(2).withExactArgs(false);
		oBindingMock.expects("removeCachesAndMessages").exactly(2).withExactArgs("");

		// code under test
		oBinding.applyParameters({$$clearSelectionOnFilter : true}, undefined, ["$search"]);

		oBinding.mParameters = {$$aggregation : {search : "foo"}, $$clearSelectionOnFilter : true};

		// code under test
		oBinding.applyParameters({$$aggregation : {search : "bar"}});
	});

	//*********************************************************************************************
[undefined, false, true].forEach(function (bDrop) {
	[false, true].forEach(function (bKeepTransient) {
	QUnit.test("reset, bDrop=" + bDrop + ", bKeepTransient=" + bKeepTransient, function (assert) {
		var oBinding,
			oCreatedContext1 = { // "created persisted" from "inline creation row"
				getPath : function () { return "/EMPLOYEES('1')"; },
				isInactive : function () { return false; },
				isTransient : function () { return false; },
				iIndex : -1
			},
			oCreatedContext2 = { // ordinary "created persisted" => not kept!
				getPath : function () { return "/EMPLOYEES('2')"; },
				isInactive : function () { return undefined; },
				isTransient : function () { return false; },
				iIndex : -3
			},
			aPreviousContexts,
			oTransientContext1 = {
				getPath : function () { return "/EMPLOYEES($uid=id-1-23)"; },
				isInactive : function () { return undefined; },
				isTransient : function () { return true; },
				iIndex : -2
			},
			oTransientContext2 = {
				getPath : function () { return "/EMPLOYEES($uid=id-1-24)"; },
				isInactive : function () { return undefined; },
				isTransient : function () { return true; },
				iIndex : -4
			};

		// code under test: reset called from ODLB constructor
		oBinding = this.bindList("/EMPLOYEES");

		oBinding.createContexts(0, [{}, {}]);
		oBinding.createContexts(3, [{}]);
		aPreviousContexts = oBinding.aContexts.slice();
		oBinding.aContexts.unshift(oCreatedContext1);
		oBinding.aContexts.unshift(oTransientContext1);
		oBinding.aContexts.unshift(oCreatedContext2);
		oBinding.aContexts.unshift(oTransientContext2);
		// set members which should be reset to arbitrary values
		oBinding.iCurrentBegin = 10;
		oBinding.iCurrentEnd = 19;
		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 42;
		oBinding.iActiveContexts = 3; // let's assume one transient context is inactive
		oBinding.iCreatedContexts = 4;
		oBinding.bFirstCreateAtEnd = "~bFirstCreateAtEnd~";

		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs()
			.returns(bKeepTransient ? "other" : "myGroup");
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.reset(undefined, bDrop, "myGroup");

		assert.strictEqual(oBinding.iCurrentBegin, 0);
		assert.strictEqual(oBinding.iCurrentEnd, 0);
		assert.strictEqual(oBinding.isLengthFinal(), false);
		assert.strictEqual(oBinding.iMaxLength, Infinity);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/0"], aPreviousContexts[0]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/1"], aPreviousContexts[1]);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/3"], aPreviousContexts[3]);

		if (bDrop === false) {
			assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length,
				bKeepTransient ? 4 : 6);
			assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('2')"],
				oCreatedContext2);
			if (!bKeepTransient) {
				assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-23)"],
					oTransientContext1);
				assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-24)"],
					oTransientContext2);
			}
			assert.strictEqual(oCreatedContext1.iIndex, -1);
			assert.strictEqual(oCreatedContext2.iIndex, -3, "unchanged");
			assert.strictEqual(oTransientContext1.iIndex, -2);
			assert.strictEqual(oTransientContext2.iIndex, bKeepTransient ? -3 : -4);
			assert.deepEqual(oBinding.aContexts, bKeepTransient
				? [oTransientContext2, oTransientContext1, oCreatedContext1]
				: [oCreatedContext1]);
			assert.strictEqual(oBinding.iActiveContexts, bKeepTransient ? 2 : 0);
			assert.strictEqual(oBinding.iCreatedContexts, bKeepTransient ? 3 : 1);
			assert.strictEqual(oBinding.bFirstCreateAtEnd, "~bFirstCreateAtEnd~");
			return;
		}

		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, bDrop ? 7 : 5);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('1')"], oCreatedContext1);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('2')"], oCreatedContext2);
		if (bDrop) {
			assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-23)"],
				oTransientContext1);
			assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-24)"],
				oTransientContext2);
		} else {
			assert.strictEqual(oTransientContext1.iIndex, -1);
			assert.strictEqual(oTransientContext2.iIndex, -2);
		}
		assert.deepEqual(oBinding.aContexts, bDrop ? [] : [oTransientContext2, oTransientContext1]);
		assert.strictEqual(oBinding.iActiveContexts, bDrop ? 0 : 1);
		assert.strictEqual(oBinding.iCreatedContexts, bDrop ? 0 : 2);
		assert.strictEqual(oBinding.bFirstCreateAtEnd, bDrop ? undefined : "~bFirstCreateAtEnd~");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("reset with change reason", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			sChangeReason = {};

		this.mock(oBinding).expects("getUpdateGroupId").never();
		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason : sinon.match.same(sChangeReason)});

		// code under test
		oBinding.reset(sChangeReason);

		assert.strictEqual(oBinding.sChangeReason, sChangeReason);
	});

	//*********************************************************************************************
	QUnit.test("reset on initial binding with change reason 'Change'", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("getUpdateGroupId").never();
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.reset(ChangeReason.Change);

		assert.strictEqual(oBinding.sChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("reset with change reason, unresolved binding", function (assert) {
		var oBinding = this.bindList("EMPLOYEES");

		oBinding.sChangeReason = "~sChangeReason~";
		this.mock(oBinding).expects("getUpdateGroupId").never();
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		oBinding.reset("n/a");

		assert.strictEqual(oBinding.sChangeReason, "~sChangeReason~");
	});

	//*********************************************************************************************
	QUnit.test("reset not initial binding with change reason 'Change'", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.iCurrentEnd = 42;

		this.mock(oBinding).expects("getUpdateGroupId").never();
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.reset(ChangeReason.Change);

		assert.strictEqual(oBinding.sChangeReason, ChangeReason.Change);
	});

	//*********************************************************************************************
	QUnit.test("bindList with OData query options", function (assert) {
		var oBaseContext = {getPath : function () { return "/"; }},
			oBinding,
			oCacheMock = this.mock(_Cache),
			oError = new Error("Unsupported ..."),
			oModelMock = this.mock(this.oModel),
			mParameters = {
				$apply : "filter(Amount gt 3)",
				$expand : "foo",
				$orderby : "bar",
				$search : '"foo bar" AND NOT foobar',
				$select : "bar",
				custom : "baz"
			},
			mQueryOptions = {$orderby : "bar"},
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
				{$orderby : "bar", "sap-client" : "111"}, false, undefined, false)
			.returns({});
		this.mock(ODataListBinding.prototype).expects("restoreCreated").withExactArgs();
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
		assert.deepEqual(oBinding.aPreviousData, null);

		oCacheMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES",
				{$orderby : "bar", "sap-client" : "111"}, false, "EMPLOYEES", false)
			.returns({});

		// code under test
		oBinding = this.bindList("EMPLOYEES", oBaseContext, undefined, undefined, mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oBaseContext);
		assert.strictEqual(oBinding.getPath(), "EMPLOYEES");
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly(undefined, true));
		assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.deepEqual(oBinding.oDiff, undefined);
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		assert.deepEqual(oBinding.aPreviousData, null);

		// code under test
		oBinding = this.bindList("EMPLOYEE_2_TEAM", undefined, undefined, undefined, mParameters);

		assert.strictEqual(oBinding.oCachePromise.getResult(), null, "no cache");
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.deepEqual(oBinding.mParameters, mParameters);
		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
		assert.ok(ODataListBinding.prototype.reset.calledWithExactly(undefined, true));
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
			this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined,
				{$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
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
			this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42),
				{$$operationMode : OperationMode.Client});
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42));
		}, new Error("Unsupported operation mode: undefined"));
	});

	//*********************************************************************************************
[
	{hasSent : true},
	{hasSent : false, isAbsolute : true},
	{hasSent : false, isBelowCreated : false},
	{hasSent : false, isBelowCreated : true, elements : undefined},
	{hasSent : false, isBelowCreated : true, elements : []}
].forEach(function (oFixture) {
	QUnit.test("fetchData: w/ cache " + JSON.stringify(oFixture), function (assert) {
		var oBinding,
			oCache = {
				getCreatedElements : function () { return []; },
				hasSentRequest : function () {},
				read : function () {},
				setPersistedCollection : function () {}
			},
			oContext = {
				getAndRemoveCollection : function () {},
				getPath : function () { return "/TEAMS"; }
			},
			oData = {},
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			oPromise,
			oReadMock,
			oSetCollectionMock,
			that = this;

		oBinding = this.bindList("TEAM_2_EMPLOYEES");
		this.mock(ODataListBinding.prototype).expects("fetchCache").callsFake(function () {
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		});
		oBinding.setContext(oContext);

		this.mock(oCache).expects("hasSentRequest").withExactArgs().returns(oFixture.hasSent);
		this.mock(oBinding).expects("isRelative").exactly(oFixture.hasSent ? 0 : 1)
			.withExactArgs().returns(!oFixture.isAbsolute);
		this.mock(ODataListBinding).expects("isBelowCreated")
			.exactly(oFixture.hasSent || oFixture.isAbsolute ? 0 : 1)
			.withExactArgs(sinon.match.same(oContext)).returns(oFixture.isBelowCreated);
		this.mock(oContext).expects("getAndRemoveCollection")
			.exactly("elements" in oFixture ? 1 : 0)
			.withExactArgs("TEAM_2_EMPLOYEES")
			.returns(oFixture.elements);
		oSetCollectionMock = this.mock(oCache).expects("setPersistedCollection")
			.exactly(oFixture.elements ? 1 : 0)
			.withExactArgs(sinon.match.same(oFixture.elements));
		oReadMock = this.mock(oCache).expects("read")
			.withExactArgs(1, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				that.mock(oBinding).expects("assertSameCache")
					.withExactArgs(sinon.match.same(oCache));
				return oData;
			})));

		// code under test
		oPromise = oBinding.fetchData(1, 2, 3, oGroupLock, fnDataRequested);

		oBinding.sChangeReason = "sChangeReason";
		oBinding.bHasPathReductionToParent = true;
		this.oModel.bAutoExpandSelect = true;
		this.mock(oBinding).expects("checkSuspended").never();

		assert.strictEqual(oBinding.sChangeReason, "sChangeReason");

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oData);
			if (oFixture.elements) {
				assert.ok(oSetCollectionMock.calledBefore(oReadMock));
			}
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bHasData) {
	QUnit.test("fetchData: w/o cache, data=" + bHasData, function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			aData = [{id : 0}, {id : 1}, {id : 2}, {id : 3}, {id : 4}, {id : 5}],
			fnDataRequested = {/*function*/},
			oGroupLock = {unlock : function () {}};

		aData.$count = 42;
		this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
		this.mock(oBinding).expects("fetchCache").callsFake(function () {
			this.oCache = undefined;
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(null));
			this.sReducedPath = "/reduced/path";
		});
		this.mock(oBinding).expects("restoreCreated").withExactArgs();
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
	QUnit.test("fetchData: context lost, cache=" + bHasCache, function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			oPromise;

		oBindingMock.expects("checkSuspended").withExactArgs(true);
		oBindingMock.expects("fetchCache").callsFake(function () {
			this.oCache = undefined;
			this.oCachePromise = SyncPromise.resolve(Promise.resolve(bHasCache ? {} : null));
			this.sReducedPath = "/reduced/path";
		});
		oBindingMock.expects("restoreCreated").withExactArgs();
		oBinding.setContext(oContext);
		this.mock(oContext).expects("fetchValue").never();

		// code under test
		oPromise = oBinding.fetchData(3, 2, 0);

		oBindingMock.expects("checkSuspended").withExactArgs(true);
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
		[false, true].forEach(function (bReadGroupLock) {
	const sTitle = "fetchContexts: async=" + bAsync + ", groupLock=" + bGroupLock
		+ ", readGroupLock=" + bReadGroupLock;
	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			bPending = true,
			oPromise,
			oReadGroupLock = bReadGroupLock ? "~oReadGroupLock~" : undefined,
			oResult = {value : []};

		oBinding.oReadGroupLock = oReadGroupLock;
		this.mock(oBinding).expects("lockGroup").exactly(bGroupLock || bReadGroupLock ? 0 : 1)
			.withExactArgs().returns("~oGroupLock~");
		this.mock(oBinding).expects("fetchData")
			.withExactArgs(1, 2, 3,
				!bGroupLock && bReadGroupLock ? "~oReadGroupLock~" : "~oGroupLock~",
				"~fnDataRequested~")
			.returns(SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("createContexts")
			.withExactArgs(1, sinon.match.same(oResult.value))
			.returns(SyncPromise.resolve("~bChanged~"));

		// code under test
		oPromise = oBinding.fetchContexts(1, 2, 3, bGroupLock ? "~oGroupLock~" : undefined, bAsync,
				"~fnDataRequested~")
			.then(function (bResult) {
				assert.strictEqual(bResult, "~bChanged~");
				bPending = false;
			});
		this.mock(oBinding).expects("checkSuspended").never();
		oBinding.setContext({}); // must not change anything, the binding is absolute

		assert.strictEqual(bPending, bAsync);
		assert.strictEqual(oBinding.oReadGroupLock, bGroupLock ? oReadGroupLock : undefined);

		return oPromise;
	});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bFirstCreateAtEnd) {
	QUnit.test("fetchContexts: created, atEnd=" + bFirstCreateAtEnd, function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			bChanged = {/*boolean*/},
			fnDataRequested = {/*function*/},
			oGroupLock = {},
			iReadStart = bFirstCreateAtEnd ? 3 : 1,
			oResult = {value : {}};

		oBinding.bFirstCreateAtEnd = bFirstCreateAtEnd;
		oBinding.iCreatedContexts = 2;
		this.mock(oBinding).expects("fetchData")
			.withExactArgs(iReadStart, 2, 3, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(oResult));
		this.mock(oBinding).expects("createContexts")
			.withExactArgs(iReadStart, sinon.match.same(oResult.value))
			.returns(SyncPromise.resolve(bChanged));

		// code under test
		return oBinding.fetchContexts(1, 2, 3, oGroupLock, false, fnDataRequested);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchContexts: fetchData returns undefined", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')")),
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

		oBinding.oReadGroupLock = undefined;
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
	QUnit.test("fetchContexts: binding already destroyed", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oPromise;

		this.mock(oBinding).expects("fetchData")
			.withExactArgs(1, 2, 3, "~oGroupLock~", "~fnDataRequested~")
			.returns(SyncPromise.resolve({}));
		this.mock(oBinding).expects("createContexts").never();

		// code under test
		oPromise = oBinding.fetchContexts(1, 2, 3, "~oGroupLock~", true, "~fnDataRequested~");

		oBinding.destroy();

		return oPromise.then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.message, "Binding already destroyed");
			assert.strictEqual(oError.canceled, true);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bChanged) {
	[undefined, "groupId"].forEach(function (sGroupId) {
	QUnit.test("requestContexts: changed=" + bChanged + ", group=" + sGroupId, function (assert) {
		var oBinding = this.bindList("n/a"),
			aContexts = [],
			oGroupLock = sGroupId && "~oGroupLock~",
			oPromise;

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("lockGroup").exactly(sGroupId ? 1 : 0)
			.withExactArgs(sGroupId, true).returns(oGroupLock);
		this.mock(oBinding).expects("fetchContexts").withExactArgs(1, 2, 0, oGroupLock)
			.returns(SyncPromise.resolve(Promise.resolve(bChanged)));
		this.mock(oBinding).expects("_fireChange").exactly(bChanged ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(1, 2)
			.returns(aContexts);

		// code under test
		oPromise = oBinding.requestContexts(1, 2, sGroupId).then(function (aResults) {
			assert.strictEqual(aResults, aContexts);
		});

		assert.ok(oPromise instanceof Promise);
		return oPromise;
	});
	});
});

	//*********************************************************************************************
	QUnit.test("requestContexts: parameter defaults", function (assert) {
		var oBinding = this.bindList("n/a"),
			aContexts = [];

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(undefined);
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, this.oModel.iSizeLimit, 0, undefined)
			.returns(SyncPromise.resolve(Promise.resolve(false)));
		this.mock(oBinding).expects("_fireChange").never();
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
			oError = new Error();

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(undefined);
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(1, 2, 0, undefined)
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
		var oBinding = this.bindList("unresolved");

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
		this.mock(oBinding).expects("fetchContexts").never();

		assert.throws(function () {
			oBinding.requestContexts();
		}, new Error("Unresolved binding: unresolved"));
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: suspended", function (assert) {
		var oBinding = this.bindList("n/a"),
			oError = new Error();

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
		this.mock(oBinding).expects("fetchContexts").never();

		assert.throws(function () {
			oBinding.requestContexts();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("requestContexts: invalid group ID", function (assert) {
		var oBinding = this.bindList("n/a"),
			oError = new Error();

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("$invalid").throws(oError);
		this.mock(oBinding).expects("fetchContexts").never();

		assert.throws(function () {
			oBinding.requestContexts(0, 10, "$invalid");
		}, oError);
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[false, true].forEach(function (bChanged) {
		[undefined, true].forEach(function (bKeepCurrent) {
			var sTitle = "getContexts: async=" + bAsync + ", changed=" + bChanged
					+ ", bKeepCurrent=" + bKeepCurrent;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("n/a"),
			aContexts = [],
			oFetchContextsPromise = bAsync
				? SyncPromise.resolve(Promise.resolve(bChanged))
				: SyncPromise.resolve(bChanged),
			iMaximumPrefetchSize = bKeepCurrent ? 0 : 100,
			aResults;

		oBinding.oReadGroupLock = "~oReadGroupLock~";
		oBinding.iCurrentBegin = 2;
		oBinding.iCurrentEnd = 7;
		this.oLogMock.expects("debug")
			.withExactArgs(oBinding + "#getContexts(5, 10, " + iMaximumPrefetchSize + ")",
				undefined, sClassName);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("getDiff").never();
		this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(5, 10, iMaximumPrefetchSize, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("resolveRefreshPromise")
			.withExactArgs(sinon.match.same(oFetchContextsPromise))
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("getContextsInViewOrder")
			.withExactArgs(5, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("_fireChange")
			.exactly(bAsync && bChanged ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		aResults = oBinding.getContexts(5, 10, iMaximumPrefetchSize, bKeepCurrent);

		assert.strictEqual(oBinding.oReadGroupLock, "~oReadGroupLock~");
		assert.strictEqual(aResults, aContexts);
		assert.strictEqual(oBinding.iCurrentBegin, bKeepCurrent ? 2 : 5);
		assert.strictEqual(oBinding.iCurrentEnd, bKeepCurrent ? 7 : 15);

		return oFetchContextsPromise;
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: unresolved", function (assert) {
		var oBinding = this.bindList("n/a"),
			aContexts;

		oBinding.aPreviousData = [{}];
		oBinding.bUseExtendedChangeDetection = true; // BCP: 2180095696
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
		this.mock(oBinding).expects("fetchContexts").never();

		// code under test
		aContexts = oBinding.getContexts();

		assert.deepEqual(aContexts, []);
		assert.deepEqual(oBinding.aPreviousData, null);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: dataRequested/dataReceived", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				// expect this when fetchContexts is finished
				oBindingMock.expects("fireDataReceived")
					.withExactArgs({data : {}}, "~bPreventBubbling~");

				return false;
			});

		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		oBindingMock.expects("fireDataRequested").never(); // expect it later
		oBindingMock.expects("fireDataReceived").never(); // expect it later
		oBindingMock.expects("isRefreshWithoutBubbling").withExactArgs()
			.returns("~bPreventBubbling~");

		// code under test
		oBinding.getContexts(0, 10, 100);

		oBindingMock.expects("fireDataRequested").withExactArgs("~bPreventBubbling~");

		// code under test
		oFetchContextsCall.args[0][5]();

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
	QUnit.test("getContexts: default values", function () {
		var oBinding = this.bindList("n/a"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("fetchContexts")
			.withExactArgs(0, this.oModel.iSizeLimit, 0, undefined, false, sinon.match.func)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.getContexts();

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
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
			.withExactArgs(0, 10, 100, undefined, /*bAsync=*/true, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : sChangeReason});

		// code under test
		oBinding.getContexts(0, 10, 100);

		assert.strictEqual(oBinding.sChangeReason, undefined);

		return oFetchContextsPromise;
	});

	//*********************************************************************************************
[false, /*see strictEqual below*/"true"].forEach(function (bUseExtendedChangeDetection) {
	[/*destroyed early*/undefined, false, /*destroyed late*/0, true].forEach(function (bSuspend) {
		var sTitle = "getContexts: AddVirtualContext, suspend:" + bSuspend
				+ ", use extended change detection:" + bUseExtendedChangeDetection;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			aContexts,
			oModelMock = this.mock(this.oModel),
			oAddTask0,
			oAddTask1,
			oVirtualContext = {getPath : function () {}};

		oBinding.bUseExtendedChangeDetection = bUseExtendedChangeDetection;
		oBinding.sChangeReason = "AddVirtualContext";
		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oAddTask0 = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func, true);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"/~/" + Context.VIRTUAL, Context.VIRTUAL)
			.returns(oVirtualContext);
		this.mock(oVirtualContext).expects("getPath").withExactArgs().returns("/virtual/context");
		oBindingMock.expects("fetchContexts").never();
		oBindingMock.expects("_fireChange").never();
		if (bSuspend !== false) {
			oBindingMock.expects("reset").never();
		}

		// code under test
		aContexts = oBinding.getContexts(0, 10, bUseExtendedChangeDetection ? undefined : 100);

		assert.strictEqual(oBinding.sChangeReason, undefined);
		assert.strictEqual(aContexts.length, 1);
		assert.strictEqual(aContexts[0], oVirtualContext);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/virtual/context"], oVirtualContext);
		assert.deepEqual(Object.keys(oBinding.mPreviousContextsByPath), ["/virtual/context"]);

		// clean up to avoid trouble with ODLB#destroyPreviousContexts
		delete oBinding.mPreviousContextsByPath["/virtual/context"];

		// prerendering task
		if (bSuspend === undefined) { // destroy early
			oBinding.destroy(); // Note: #getContexts must now be avoided!
			oBindingMock.expects("isRootBindingSuspended").never();
			oBindingMock.expects("getContexts").never();
		} else {
			oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspend);
			if (!bSuspend) {
				oBindingMock.expects("getContexts").on(oBinding)
					.withExactArgs(0, 10, bUseExtendedChangeDetection ? undefined : 100)
					.callsFake(function () {
						assert.strictEqual(this.bUseExtendedChangeDetection, false);
					});
			} else {
				oBindingMock.expects("getContexts").never();
			}
		}
		oAddTask1 = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func);

		// code under test - call the 1st prerendering task
		oAddTask0.args[0][0]();

		assert.strictEqual(oBinding.bUseExtendedChangeDetection, bUseExtendedChangeDetection);

		if (bSuspend === 0) { // destroy late
			oBinding.destroy(); // Note: we can simply continue to run the code below
		}
		oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspend);
		if (!bSuspend) {
			oBindingMock.expects("_fireChange").withExactArgs({
					detailedReason : "RemoveVirtualContext",
					reason : ChangeReason.Change
				}).callsFake(function () {
					assert.strictEqual(oBinding.sChangeReason, "RemoveVirtualContext");
				});
			oBindingMock.expects("reset").withExactArgs(ChangeReason.Refresh);
		}

		// code under test - call the 2nd prerendering task
		oAddTask1.args[0][0]();
	});
	});
});

	//*********************************************************************************************
	// Note: This happens for a list binding below another list binding during autoExpandSelect
	QUnit.test("getContexts: below a virtual context", function (assert) {
		var oContext = Context.create({/*oModel*/}, oParentBinding,
				"/TEAMS('1')/" + Context.VIRTUAL, Context.VIRTUAL),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("fetchContexts").never();
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		assert.deepEqual(oBinding.getContexts(0, 10, 100), []);
	});

	//*********************************************************************************************
	QUnit.test("getContexts: RemoveVirtualContext", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			aContexts;

		oBinding.sChangeReason = "RemoveVirtualContext";
		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
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
	{bCanceled : false, bDataRequested : true},
	{bCanceled : false, bDataRequested : true, bDestroyed : true}
].forEach(function (oFixture) {
	var sTitle = "getContexts: error in fetchContexts, " + JSON.stringify(oFixture);

	QUnit.test(sTitle, function () {
		var oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oError = {canceled : oFixture.bCanceled},
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve().then(function () {
				if (oFixture.bDestroyed) {
					oBinding.destroy();
				}
				throw oError;
			}));

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/~");
		this.mock(oBinding).expects("isRefreshWithoutBubbling").withExactArgs()
			.returns("~bPreventBubbling~");
		oFetchContextsCall = this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.getContexts(0, 10, 100);

		this.mock(oBinding).expects("fireDataReceived").exactly(oFixture.bDataRequested ? 1 : 0)
			.withExactArgs(oFixture.bCanceled ? {data : {}} : {error : sinon.match.same(oError)},
				"~bPreventBubbling~");

		// code under test - dataRequested/dataReceived
		if (oFixture.bDataRequested) {
			oFetchContextsCall.args[0][5]();
		}

		return oFetchContextsPromise.catch(function () { /* avoid "Uncaught (in promise)"*/ });
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: error in dataRequested", function () {
		var oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				// call fnDataRequested within the promise
				oFetchContextsCall.args[0][5]();

				return false;
			});

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		oBindingMock.expects("fireDataRequested").withExactArgs(null).throws(oError);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10",
				sClassName, sinon.match.same(oError));

		// code under test
		oBinding.getContexts(0, 10, 100);

		return oFetchContextsPromise.catch(function () { /* avoid "Uncaught (in promise)"*/ });
	});

	//*********************************************************************************************
	QUnit.test("getContexts: error in dataReceived", function () {
		var oContext = Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			oFetchContextsCall,
			oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(false));

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oFetchContextsCall = oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 100, undefined, false, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}}, null)
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
	{bChanged : false, aDiff : []},
	{bChanged : false, aDiff : null}
].forEach(function (oFixture) {
	QUnit.test("getContexts: E.C.D, no diff yet, " + JSON.stringify(oFixture), function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')")),
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
		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("fetchContexts")
			.withExactArgs(0, 10, 0, undefined, true, sinon.match.func)
			.returns(oFetchContextsPromise);
		this.mock(oBinding).expects("_fireChange")
			.exactly(oFixture.bChanged || oFixture.aDiff?.length ? 1 : 0)
			.withExactArgs({reason : sChangeReason});

		// code under test
		aContexts = oBinding.getContexts(0, 10);

		assert.strictEqual(aContexts.dataRequested, true);

		return oFetchContextsPromise.then(function () {
			if (oFixture.bChanged || oFixture.aDiff?.length) {
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
				Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')")),
			aContexts = [],
			aDiff = [],
			aResults;

		oBinding.enableExtendedChangeDetection();
		oBinding.oDiff = {
			aDiff : aDiff,
			iLength : 10
		};
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
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
				Context.create({/*oModel*/}, oParentBinding, "/TEAMS('1')"));

		oBinding.enableExtendedChangeDetection();
		oBinding.oDiff = {
			aDiff : [],
			iLength : 10
		};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
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

		oBinding.bFirstCreateAtEnd = true;
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
	QUnit.test("bindList: empty path is valid for base context", function () {
		var oBaseContext = this.oModel.createBindingContext("/BusinessPartnerList");

		// code under test
		this.bindList("", oBaseContext);
	});

	//*********************************************************************************************
	QUnit.test("reset context for nested list binding with its own cache", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			oCache = {},
			oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 1);

		oBindingMock.expects("checkSuspended").withExactArgs(true);
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
		oBindingMock.expects("restoreCreated").withExactArgs();
		oBinding = this.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
			{$select : "ID"});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
	});

	//*********************************************************************************************
[ // The first test requests the virtual context, all others don't
	{aggregation : false, autoExpandSelect : true, backLink : true, newContext : true},
	{aggregation : false, autoExpandSelect : false, backLink : true, newContext : true},
	{aggregation : false, autoExpandSelect : true, backLink : false, newContext : true},
	{aggregation : false, autoExpandSelect : true, backLink : true, newContext : false},
	{aggregation : true, autoExpandSelect : true, backLink : true, newContext : true}
].forEach(function (oFixture, i) {
	QUnit.test("setContext: relative path, " + JSON.stringify(oFixture), function (assert) {
		var oAggregation = {},
			oBinding = this.bindList("Suppliers", Context.create(this.oModel, oParentBinding,
				"/foo")),
			oBindingMock = this.mock(oBinding),
			oBindingSetContextCall,
			oContext = oFixture.newContext
				? Context.create(this.oModel, oParentBinding, "/bar")
				: undefined,
			sExpectedChangeReason = i === 0 ? "AddVirtualContext" : "sChangeReason",
			oFetchCacheCall,
			oNewHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers"),
			oOldHeaderContext = oBinding.getHeaderContext(),
			oResetKeepAliveCall,
			oRestoreCreatedCall;

		this.oModel.bAutoExpandSelect = oFixture.autoExpandSelect;
		if (oFixture.aggregation) {
			oBinding.mParameters.$$aggregation = oAggregation;
		}
		oBinding.mCanUseCachePromiseByChildPath = "~mCanUseCachePromiseByChildPath~";
		oBinding.sChangeReason = "sChangeReason";
		oBinding.bHasPathReductionToParent = oFixture.backLink;

		// code under test - nothing must happen
		oBinding.setContext(oBinding.oContext);

		assert.strictEqual(oBinding.sChangeReason, "sChangeReason");
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});

		oBindingMock.expects("checkSuspended").withExactArgs(true);
		oBindingMock.expects("reset").withExactArgs(undefined, true);
		oResetKeepAliveCall = oBindingMock.expects("resetKeepAlive").withExactArgs();
		oFetchCacheCall = oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext));
		oRestoreCreatedCall = oBindingMock.expects("restoreCreated").withExactArgs()
			.exactly(oFixture.newContext ? 1 : 0);
		this.mock(this.oModel).expects("resolve").exactly(oFixture.newContext ? 1 : 0)
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/bar/Suppliers");
		this.mock(oOldHeaderContext).expects("setSelected").exactly(oFixture.newContext ? 1 : 0)
			.withExactArgs(false);
		this.mock(Context).expects("create").exactly(oFixture.newContext ? 1 : 0)
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/bar/Suppliers")
			.returns(oNewHeaderContext);
		this.mock(_AggregationHelper).expects("setPath").exactly(oFixture.aggregation ? 1 : 0)
			.withExactArgs(sinon.match.same(oAggregation), "/bar/Suppliers");
		oBindingSetContextCall = this.mock(Binding.prototype).expects("setContext").on(oBinding)
			.withExactArgs(sinon.match.same(oContext), {detailedReason : sExpectedChangeReason});

		// code under test
		oBinding.setContext(oContext);

		assert.ok(oFetchCacheCall.calledAfter(oResetKeepAliveCall));
		assert.strictEqual(oBinding.sChangeReason, sExpectedChangeReason);
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath,
			i === 0 ? {} : "~mCanUseCachePromiseByChildPath~");
		if (oFixture.newContext) {
			assert.deepEqual(oBinding.mPreviousContextsByPath, {
				"/foo/Suppliers" : oOldHeaderContext
			});
			assert.ok(oRestoreCreatedCall.calledAfter(oFetchCacheCall));
			assert.ok(oRestoreCreatedCall.calledBefore(oBindingSetContextCall));
		} else {
			assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		}

		// mock needed because Binding.prototype.setContext is mocked!
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		assert.strictEqual(oBinding.getHeaderContext(),
			oFixture.newContext ? oNewHeaderContext : oOldHeaderContext);
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: implicit suspend", function (assert) {
		var oBinding = this.bindList("Suppliers"),
			oContext = {
				getBinding : function () {}
			},
			oParentBinding = {
				isRootBindingSuspended : function () {}
			};

		this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
		this.mock(oBinding).expects("reset").withExactArgs(undefined, true);
		this.mock(oBinding).expects("resetKeepAlive").withExactArgs();
		this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		this.mock(oBinding).expects("restoreCreated").withExactArgs();
		this.mock(this.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/resolved/path");
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/resolved/path")
			.returns("~headerContext~");
		this.mock(oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(Binding.prototype).expects("setContext").never();
		this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Context);

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oContext, oContext);
	});

	//*********************************************************************************************
	QUnit.test("preserve headerContext when ManagedObject temporarily removes context",
		function (assert) {
		var oBinding = this.bindList("Suppliers"),
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(this.oModel, oParentBinding, "/bar"),
			oHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers");

		oBindingMock.expects("checkSuspended").withExactArgs(true).thrice();
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
	QUnit.test("getCurrentContexts: iCurrentEnd limits", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.iCreatedContexts = 1;
		oBinding.iCurrentBegin = 1;
		oBinding.iCurrentEnd = 2;
		oBinding.iMaxLength = 3;

		this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(1, 1)
			.returns(["~oContext~"]);

		// code under test
		assert.deepEqual(oBinding.getCurrentContexts(), ["~oContext~"]);
	});

	//*********************************************************************************************
	QUnit.test("getCurrentContexts: iMaxLength + iCreatedContexts limits", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.iCreatedContexts = 2;
		oBinding.iCurrentBegin = 1;
		oBinding.iCurrentEnd = 7;
		oBinding.iMaxLength = 4;

		this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(1, 5)
			.returns(["~oContext~"]);

		// code under test
		assert.deepEqual(oBinding.getCurrentContexts(), ["~oContext~", undefined, undefined,
			undefined, undefined]);
	});

	//*********************************************************************************************
	QUnit.test("getCurrentContexts: special case Infinity", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.iCreatedContexts = 1;
		oBinding.iCurrentBegin = 0;
		oBinding.iCurrentEnd = Infinity;
		oBinding.iMaxLength = Infinity;

		this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, Infinity)
			.returns(["~oContext~"]);

		// code under test (BCP: 2280015704)
		assert.deepEqual(oBinding.getCurrentContexts(), ["~oContext~"]);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: relative binding with base context", function (assert) {
		var oBinding = this.bindList("TEAMS", this.oModel.createBindingContext("/"), undefined,
				undefined, {$$groupId : "group"});

		assert.strictEqual(oBinding.iCurrentEnd, 0);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", true);
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("createRefreshPromise").never(); // iCurrentEnd === 0
		this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Refresh, undefined, "myGroup");

		// code under test
		return oBinding.refreshInternal("", "myGroup");
	});

	//*********************************************************************************************
[
	{success : true},
	{success : true, refreshKeptElementsFails : true},
	{success : false}
].forEach(function (oFixture) {
	var sTitle = "refreshInternal: relative with own cache, success=" + oFixture.success
			+ ", refreshKeptElements fails = " + oFixture.refreshKeptElementsFails;

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			oContext = Context.create(this.oModel, oParentBinding, "/TEAMS('1')"),
			oError = new Error(),
			oHeaderContextCheckUpdatePromise = SyncPromise.resolve(Promise.resolve({})),
			sPath = {/*TEAMS('1')*/},
			oRefreshKeptElementsPromise = oFixture.refreshKeptElementsFails
				? SyncPromise.reject(oError)
				: SyncPromise.resolve(),
			oRefreshResult;

		// fetchCache is called once from applyParameters before oBinding.oContext is set
		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
		});
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				this.oCache = {
					getResourcePath : function () {
						return "TEAMS('1')/TEAM_2_EMPLOYEES";
					},
					// no #restore here, e.g. _AggregationCache
					setActive : function () {}
				};
				this.oCachePromise = SyncPromise.resolve(this.oCache);
			});
		oBindingMock.expects("restoreCreated").withExactArgs();
		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$groupId : "group"});
		oBindingMock.verify();
		oBinding.iCurrentEnd = 1;

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
		this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs(sinon.match.same(sPath));
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, /*bKeepQueryOptions*/true, undefined);
		this.mock(oBinding).expects("refreshKeptElements").withExactArgs("myGroup", undefined)
			.returns(oRefreshKeptElementsPromise);
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs(undefined).callThrough();
		this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Refresh, undefined, "myGroup");
		this.mock(oBinding.oHeaderContext).expects("checkUpdateInternal")
			.exactly(oFixture.success && !oFixture.refreshKeptElementsFails ? 1 : 0)
			.withExactArgs()
			.returns(oHeaderContextCheckUpdatePromise);

		// code under test
		oRefreshResult = oBinding.refreshInternal(sPath, "myGroup");
		// simulate getContexts
		oBinding.resolveRefreshPromise(
			oFixture.success ? Promise.resolve() : Promise.reject(oError));

		return oRefreshResult.then(function (oResult) {
			assert.ok(oFixture.success);
			assert.notOk(oFixture.refreshKeptElementsFails);
			assert.strictEqual(oResult, oHeaderContextCheckUpdatePromise.getResult());
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.ok(!oFixture.success || oFixture.refreshKeptElementsFails);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[false, true].forEach(function (bKeepCacheOnError) {
		[false, true].forEach(function (bRelative) {
			[false, true].forEach(function (bRestore) {
			var sTitle = "refreshInternal: bAsync=" + bAsync
				+ ", bKeepCacheOnError=" + bKeepCacheOnError
				+ ", bRelative=" + bRelative + ", cache can be restored: " + bRestore;

			if (bRestore && !bKeepCacheOnError) {
				return;
			}

	QUnit.test(sTitle, function (assert) {
		var oContext = bRelative
				? Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')")
				: undefined,
			oBinding = this.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES", oContext,
				null, null, {$$ownRequest : true}),
			oCache = oBinding.oCachePromise.getResult(),
			oCacheMock = this.mock(oCache),
			iNoOfCalls = bAsync ? 2 : 1,
			oDependentBinding = {
				getContext : function () {
					return {
						isEffectivelyKeptAlive : function () { return false; }
					};
				},
				refreshInternal : function () {}
			},
			oError = new Error(),
			aCreatedContexts,
			aPromises = [],
			oReadPromise = Promise.reject(oError),
			that = this,
			i;

		function getPath(i) {
			return "/EMPLOYEES/" + i;
		}

		oBinding.iActiveContexts = 40;
		oBinding.iCreatedContexts = 42;
		oBinding.iCurrentEnd = 1;
		oBinding.aContexts = [];
		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES/99" : 99 // not parked by #reset
		};
		for (i = 0; i < oBinding.iCreatedContexts; i += 1) {
			oBinding.aContexts[i] = { // dummy for a created context
				// for simplicity, ignore bRelative here
				getPath : getPath.bind(null, i)
			};
		}
		aCreatedContexts = oBinding.aContexts.slice();
		oBinding.aContexts.push("n/a"); // dummy for a non-created
		this.mock(oBinding).expects("isRootBindingSuspended").exactly(iNoOfCalls).returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise
					= Promise.resolve(bRelative ? oCache.getResourcePath() : "n/a");

			that.mock(oBinding).expects("fetchResourcePath").exactly(iCallCount)
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				oCacheMock.expects("restore").exactly(bRestore ? 1 : 0).withExactArgs(true);
				oCacheMock.expects("restore").withExactArgs(false); // free memory
				oCacheMock.expects("setActive").exactly(bRestore ? 0 : iCallCount)
					.withExactArgs(true);
				that.mock(oBinding).expects("_fireChange").exactly(iCallCount)
					.withExactArgs({reason : ChangeReason.Change})
					.callsFake(function () {
						if (bKeepCacheOnError) {
							assert.strictEqual(oBinding.oCache, oCache);
							assert.strictEqual(oBinding.iActiveContexts, 40);
							assert.strictEqual(oBinding.iCreatedContexts, 42);
							assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
							assert.strictEqual(oBinding.aContexts.length, 42);
							aCreatedContexts.forEach(function (oCreatedContext, i) {
								assert.strictEqual(oBinding.aContexts[i], oCreatedContext);
								assert.strictEqual(oCreatedContext.iIndex, i - 42);
							});
						} else {
							assert.notStrictEqual(oBinding.oCache, oCache);
							assert.strictEqual(oBinding.iActiveContexts, 0);
							assert.strictEqual(oBinding.iCreatedContexts, 0);
							assert.notStrictEqual(oBinding.oCachePromise.getResult(), oCache);
							assert.deepEqual(oBinding.aContexts, ["a", "b", "c"], "unchanged");
						}
						assert.deepEqual(oBinding.mPreviousContextsByPath, {
							"/EMPLOYEES/99" : 99
						});
						assert.strictEqual(oBinding.bRefreshKeptElements, false, "unchanged");
					});
			});
		});
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, true,
				bKeepCacheOnError ? "myGroup" : undefined)
			.callsFake(function () {
				if (!bRestore) { // simulate creation of new cache
					oBinding.oCache = {
						refreshKeptElements : function () {} // don't care
					};
					oBinding.oCachePromise = SyncPromise.resolve(oBinding.oCache);
				}
			});
		this.mock(oBinding).expects("refreshKeptElements")
			.withExactArgs("myGroup", bKeepCacheOnError)
			.returns(SyncPromise.resolve());
		this.mock(oBinding).expects("reset").exactly(iNoOfCalls)
			.withExactArgs(ChangeReason.Refresh, bKeepCacheOnError ? false : undefined, "myGroup")
			.callsFake(function () {
				oBinding.iActiveContexts = 0;
				oBinding.iCreatedContexts = 0;
				oBinding.aContexts = ["a", "b", "c"];
				if (bKeepCacheOnError) {
					for (i = 0; i < oBinding.iCreatedContexts; i += 1) {
						oBinding.mPreviousContextsByPath[getPath(i)] = i;
					}
				}
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
			oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError).then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
			}));
		if (bAsync) { //TODO in the sync case, the wrong cache would be restored :-(
			aPromises.push(
				// code under test
				oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError).then(function () {
					assert.ok(false);
				}, function (oReturnedError) {
					assert.strictEqual(oReturnedError, oError);
				}));
			oBinding.oCachePromise.then(function () {
				// simulate #getContexts call async to "Refresh" event
				oBinding.resolveRefreshPromise(oReadPromise);
			});
		}

		return Promise.all(aPromises);
	});
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
		var oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, null, null,
				{$$ownRequest : true}),
			oError = new Error(),
			bIsRoot = "false,true",
			oNewCache = {refreshKeptElements : function () {}},
			oOldCache = oBinding.oCachePromise.getResult(),
			oRefreshPromise = Promise.reject(oError),
			oYetAnotherError = new Error(),
			that = this;

		oBinding.iCurrentEnd = 1;
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(bIsRoot);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("path");
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, /*bKeepQueryOptions*/true, "myGroup")
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oBinding).expects("refreshKeptElements").withExactArgs("myGroup", true)
			.returns(SyncPromise.resolve());
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs(true)
			.returns(oRefreshPromise);
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh, false, "myGroup");
		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([]);
		this.mock(oBinding.oHeaderContext).expects("checkUpdateInternal").never();
		oRefreshPromise.catch(function () {
			var oResourcePathPromise = Promise.resolve("n/a");

			that.mock(oBinding).expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(bFetchResourcePathFails
					? SyncPromise.reject(oYetAnotherError)
					: SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oOldCache).expects("setActive").never();
				that.mock(oOldCache).expects("restore").withExactArgs(false); // free memory
				that.mock(oBinding).expects("_fireChange").never();
			});
		});

		// code under test
		return oBinding.refreshInternal("path", "myGroup", /*_bCheckUpdate*/false, true)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError,
					bFetchResourcePathFails ? oYetAnotherError : oError);
				assert.strictEqual(oBinding.oCache, oNewCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
				assert.strictEqual(oBinding.bRefreshKeptElements, false, "unchanged");
			});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: bKeepCacheOnError & canceled", function (assert) {
		var oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')"),
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, null, null,
				{$$ownRequest : true}),
			oCache = oBinding.oCache,
			oError = new Error(),
			oNewCache = {refreshKeptElements : function () {}};

		oError.canceled = true;
		oBinding.iCurrentEnd = 1;
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		this.mock(oBinding).expects("isRoot").withExactArgs().returns("bIsRoot");
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", "bIsRoot");
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("path");
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, /*bKeepQueryOptions*/true, "myGroup")
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oBinding).expects("refreshKeptElements").withExactArgs("myGroup", true)
			.returns(SyncPromise.resolve());
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs(true).rejects(oError);
		this.mock(oBinding).expects("fetchResourcePath").never();
		this.mock(oCache).expects("restore").withExactArgs(false); // free memory
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh, false, "myGroup");
		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([]);
		this.mock(oBinding.oHeaderContext).expects("checkUpdate").never();

		// code under test
		return oBinding.refreshInternal("path", "myGroup", /*_bCheckUpdate*/false, true)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
				assert.strictEqual(oBinding.oCache, oNewCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
				assert.strictEqual(oBinding.bRefreshKeptElements, false, "unchanged");
			});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: relative without own cache", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES",
				Context.create(this.oModel, oParentBinding, "/TEAMS('1')"));

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
		this.mock(oBinding).expects("removeCachesAndMessages").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("createRefreshPromise").never();
		this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Refresh, /*bDrop*/true, "myGroup");

		// code under test (as called from #requestRefresh)
		assert.ok(oBinding.refreshInternal("", "myGroup", /*_bCheckUpdate*/true).isFulfilled());
	});

//*********************************************************************************************
[false, true].forEach(function (bSuspended) {
	[false, true].forEach(function (bShared) {
		var sTitle = "refreshInternal: dependent bindings, suspended=" + bSuspended
				+ ", shared=" + bShared;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
					{$$groupId : "myGroup"}),
				oChild0 = {
					getContext : getNonKeptContext,
					refreshInternal : function () {}
				},
				oChild0Refreshed = false,
				oChild1 = {
					getContext : getKeptContext,
					hasPendingChanges : function () { return false; },
					refreshInternal : function () {}
				},
				oChild1Refreshed = false,
				oChild2 = {
					getContext : getNonKeptContext,
					refreshInternal : function () {}
				},
				oChild2Refreshed = false,
				oChild3 = {
					getContext : getNonKeptContext,
					refreshInternal : function () {}
				},
				oChild3RefreshedIfSuspended = false,
				oChild4 = {
					getContext : getKeptContext,
					hasPendingChanges : function () { return true; },
					refreshInternal : function () {}
				},
				oRefreshResult,
				sResourcePathPrefix = "foo";

			function getKeptContext() {
				return {
					isEffectivelyKeptAlive : function () { return true; }
				};
			}

			function getNonKeptContext() {
				return {
					isEffectivelyKeptAlive : function () { return false; }
				};
			}

			oBinding.bSharedRequest = bShared;
			this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs()
				.returns(bSuspended);
			this.mock(oBinding).expects("refreshSuspended").exactly(bSuspended && !bShared ? 1 : 0)
				.withExactArgs("myGroup");
			this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
				.withExactArgs("myGroup", true);
			this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1)
				.withExactArgs(ChangeReason.Refresh, undefined, "myGroup")
				.callsFake(function () {
					// BCP: 002075129400006474012021 reset may result in a destroyed child binding
					oChild3.bIsBeingDestroyed = true;
				});
			this.mock(oBinding).expects("getDependentBindings").withExactArgs()
				.returns([oChild0, oChild1, oChild2, oChild3, oChild4]);
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
			this.mock(oChild3).expects("refreshInternal").exactly(bSuspended ? 1 : 0)
				.withExactArgs(sResourcePathPrefix, "myGroup", false, undefined)
				.returns(new Promise(function (resolve) {
					setTimeout(function () {
						oChild3RefreshedIfSuspended = true;
						resolve();
					});
				}));
			this.mock(oChild4).expects("refreshInternal").never();

			// code under test
			oRefreshResult = oBinding.refreshInternal(sResourcePathPrefix, "myGroup");
			if (bSuspended) {
				assert.strictEqual(oBinding.bRefreshKeptElements, !bShared);
				assert.strictEqual(oBinding.sResumeAction, bShared ? "resetCache" : undefined);
			} else {
				oBinding.resolveRefreshPromise(Promise.resolve()); // simulate getContexts
			}
			assert.ok(oRefreshResult.isPending());
			return oRefreshResult.then(function () {
				assert.strictEqual(oChild0Refreshed, true);
				assert.strictEqual(oChild1Refreshed, true);
				assert.strictEqual(oChild2Refreshed, true);
				assert.strictEqual(oChild3RefreshedIfSuspended, bSuspended);
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: shared cache", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, null, null, {$$sharedRequest : true});

		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", true);
		this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs("~sResourcePathPrefix~");
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs()
			.returns(Promise.reject("~oError~"));
		this.mock(oBinding.oCache).expects("reset").withExactArgs([]);
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("refreshKeptElements").never();

		// code under test
		return oBinding.refreshInternal("~sResourcePathPrefix~", "myGroup").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bFail) {
	[undefined, 2, -1].forEach(function (iIndex) {
		var sTitle = "refreshKeptElements: fail = " + bFail + ", index = " + iIndex;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/TEAMS"),
			oError = new Error(),
			oKeptContext = {resetKeepAlive : function () {}},
			oNewCache = {refreshKeptElements : function () {}},
			oRefreshKeptElementsCall,
			that = this;

		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oNewCache));
		oBinding.aContexts = [,, oKeptContext];
		oBinding.mPreviousContextsByPath = {
			"/resolved/path('42')" : oKeptContext
		};
		this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup").returns("~groupLock~");
		oRefreshKeptElementsCall = this.mock(oNewCache).expects("refreshKeptElements")
			.withExactArgs("~groupLock~", sinon.match.func, false, "~bIgnorePendingChanges~")
			.returns(bFail
				? SyncPromise.reject(oError)
				: SyncPromise.resolve("~result~"));
		this.mock(oBinding.getModel()).expects("reportError").exactly(bFail ? 1 : 0)
			.withExactArgs("Failed to refresh kept-alive elements", sClassName,
				sinon.match.same(oError));

		// code under test
		return oBinding.refreshKeptElements("myGroup", "~bIgnorePendingChanges~")
				.then(function (vResult) {
			var iCallCount = iIndex >= 0 ? 0 : 1;

			assert.strictEqual(vResult, "~result~");
			assert.notOk(bFail);

			that.mock(oBinding).expects("getResolvedPath").exactly(iCallCount)
				.withExactArgs().returns("/resolved/path");
			that.mock(oKeptContext).expects("resetKeepAlive").withExactArgs();
			that.mock(oBinding).expects("removeCreated").exactly(1 - iCallCount)
				.withExactArgs(sinon.match.same(oKeptContext));

			// code under test
			oRefreshKeptElementsCall.firstCall.args[1]("('42')", iIndex);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.ok(bFail);
		});
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
[false, true].forEach(function (bCached) {
	QUnit.test("fetchValue: relative binding, bCached = " + bCached, function (assert) {
		var oContext = Context.create(this.oModel, oParentBinding, "/foo"),
			oListener = {},
			sPath = "/foo/42/bar",
			oResult = {},
			oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);

		if (bCached) {
			// never resolved, must be ignored
			oBinding.oCachePromise = new SyncPromise(function () {});
		}
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		// code under test
		assert.strictEqual(oBinding.fetchValue(sPath, oListener, bCached).getResult(), oResult);
	});
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
			oContext = Context.create(this.oModel, oParentBinding, "/SalesOrderList('1')"),
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
		oBindingMock.expects("restoreCreated").withExactArgs();
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
	QUnit.test("fetchValue: oCachePromise still pending", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = oBinding.oCachePromise.getResult(),
			sPath = "/EMPLOYEES/42/bar",
			oReadResult = {};

		oBinding.oCache = undefined;
		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "42/bar", undefined, null)
			.returns(SyncPromise.resolve(oReadResult));

		// code under test
		return oBinding.fetchValue(sPath, null, true).then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: oCachePromise became pending again", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = oBinding.oCachePromise.getResult(),
			sPath = "/EMPLOYEES/42/bar",
			oReadResult = {};

		oBinding.oCachePromise = new SyncPromise(function () {}); // never resolved, must be ignored
		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "42/bar", undefined, null)
			.returns(SyncPromise.resolve(oReadResult));

		// code under test
		assert.strictEqual(oBinding.fetchValue(sPath, null, true).getResult(), oReadResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: !bCached, wait for oCachePromise again", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = oBinding.oCachePromise.getResult(),
			oGroupLock = {},
			sPath = "/EMPLOYEES/42/bar",
			oReadResult = {};

		oBinding.oCache = {/*do not use!*/};
		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		oBinding.oReadGroupLock = undefined; // not interested in the initial case
		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
		this.mock(oBinding).expects("lockGroup").withExactArgs().returns(oGroupLock);
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "42/bar", undefined, undefined)
			.returns(SyncPromise.resolve(oReadResult));

		// code under test
		return oBinding.fetchValue(sPath).then(function (oResult) {
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			oBinding.getDistinctValues();
		}, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));

		assert.throws(function () {
			oBinding.getContexts(0, 10, 100, true);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, must not use both"
				+ " iMaximumPrefetchSize and bKeepCurrent"));

		oBinding.enableExtendedChangeDetection();
		assert.throws(function () { //TODO implement?
			oBinding.getContexts(0, 42, 0);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, iMaximumPrefetchSize"
				+ " must not be set if extended change detection is enabled"));

		assert.throws(function () {
			oBinding.getContexts(42);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, iStart must be 0"
			+ " if extended change detection is enabled, but is 42"));

		assert.throws(function () {
			oBinding.getContexts(0, 10, undefined, true);
		}, new Error("Unsupported operation: v4.ODataListBinding#getContexts, must not use"
			+ " bKeepCurrent if extended change detection is enabled"));
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
			"createActivate",
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
				serviceUrl : "/service/?sap-client=111"
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
					oHelperMock = this.mock(_Helper),
					oModel = oFixture.oModel || this.oModel,
					oContext = Context.createNewContext(oModel, oParentBinding, "/TEAMS", 1),
					aSorters = [];

				oBinding = oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined,
					oFixture.mParameters);
				oBinding.setContext(oContext);
				assert.ok(oBinding.oQueryOptionsPromise);

				this.mock(oBinding).expects("checkTransient").withExactArgs();
				this.mock(oBinding).expects("checkSuspended").never();
				this.mock(oBinding).expects("hasPendingChanges").returns(false);
				oHelperMock.expects("toArray")
					.withExactArgs(sinon.match.same(oFixture.vSorters))
					.returns(aSorters);
				oHelperMock.expects("deepEqual")
					.withExactArgs(sinon.match.same(aSorters), sinon.match.same(oBinding.aSorters))
					.returns(false);
				this.mock(oBinding).expects("isRootBindingSuspended").returns(bSuspended);
				this.mock(oBinding).expects("setResetViaSideEffects").withExactArgs(true);
				this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
					.withExactArgs(ChangeReason.Sort);
				this.mock(oBinding).expects("getGroupId").exactly(bSuspended ? 0 : 1)
					.withExactArgs().returns("group");
				this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
					.withExactArgs("group", true);
				this.mock(oBinding).expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1)
					.withExactArgs("");
				this.mock(oBinding).expects("fetchCache").exactly(bSuspended ? 0 : 1)
					.withExactArgs(sinon.match.same(oContext))
					.callsFake(function () {
						assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
						this.oCache = {};
						this.oCachePromise = SyncPromise.resolve(this.oCache);
					});
				this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1)
					.withExactArgs(ChangeReason.Sort);
				this.mock(oBinding.oHeaderContext).expects("checkUpdate")
					.exactly(bSuspended ? 0 : 1).withExactArgs();

				// code under test
				assert.strictEqual(oBinding.sort(oFixture.vSorters), oBinding, "chaining");

				assert.strictEqual(oBinding.aSorters, aSorters);
				assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("sort: unresolved binding", function () {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", null, null, null,
				{$$operationMode : OperationMode.Server});

		oBinding.aSorters.push("~initial sorters~");

		// code under test
		oBinding.sort();
	});

	//*********************************************************************************************
	QUnit.test("sort: errors", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext;

		// code under test
		assert.throws(function () {
			oBinding.sort([]);
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.bindList("/EMPLOYEES", null, null, null,
			{$$operationMode : OperationMode.Server});
		oBinding.aSorters.push("~initial sorters~");
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));

		this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1)
			.callsFake(function () {
				this.oCache = {};
				this.oCachePromise = SyncPromise.resolve(this.oCache);
			});
		this.mock(ODataListBinding.prototype).expects("restoreCreated").atLeast(1).withExactArgs();
		oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 1);
		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined,
			{$$operationMode : OperationMode.Server});

		oBinding.aSorters.push("~initial sorters~");
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);

		// code under test
		assert.throws(function () {
			oBinding.sort();
		}, new Error("Cannot sort due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("sort: same sorters skips processing", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataListBinding.prototype),
			oQueryOptionsPromise,
			oSorter = new Sorter("foo"),
			aSorters = [oSorter];

		oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
			$$operationMode : OperationMode.Server
		});
		oQueryOptionsPromise = oBinding.oQueryOptionsPromise;
		assert.ok(oQueryOptionsPromise);

		oBinding.aSorters.push(oSorter);

		this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oSorter))
			.returns(aSorters);
		this.mock(_Helper).expects("deepEqual").withExactArgs(sinon.match.same(aSorters),
				sinon.match.same(oBinding.aSorters))
			.returns(true);

		oBindingMock.expects("hasPendingChanges").never();
		oBindingMock.expects("isRootBindingSuspended").never();
		oBindingMock.expects("createReadGroupLock").never();
		oBindingMock.expects("removeCachesAndMessages").never();
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("reset").never();

		// code under test
		assert.strictEqual(oBinding.sort(oSorter), oBinding);

		assert.strictEqual(oBinding.oQueryOptionsPromise, oQueryOptionsPromise, "unchanged");
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
					oHelperMock = this.mock(_Helper),
					sStaticFilter = "Age gt 18";

				oBindingMock.expects("checkSuspended").never();

				oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
					$filter : sStaticFilter,
					$$clearSelectionOnFilter : true,
					$$operationMode : OperationMode.Server
				});
				assert.ok(oBinding.oQueryOptionsPromise);

				oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter))
					.returns(aFilters);
				oBindingMock.expects("checkTransient").withExactArgs();
				this.mock(Filter).expects("checkFilterNone")
					.withExactArgs(sinon.match.same(aFilters));
				oHelperMock.expects("deepEqual").exactly(sFilterType === FilterType.Control ? 1 : 0)
					.withExactArgs(sinon.match.same(aFilters), sinon.match.same(oBinding.aFilters))
					.returns(false);
				oHelperMock.expects("deepEqual").exactly(sFilterType === FilterType.Control ? 0 : 1)
					.withExactArgs(sinon.match.same(aFilters),
						sinon.match.same(oBinding.aApplicationFilters))
					.returns(false);
				oBindingMock.expects("hasPendingChanges").withExactArgs(true).returns(false);
				oBindingMock.expects("setResetViaSideEffects").withExactArgs(true);
				oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
				oBindingMock.expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0)
					.withExactArgs(ChangeReason.Filter);
				oBindingMock.expects("getGroupId").exactly(bSuspended ? 0 : 1)
					.withExactArgs().returns("groupId");
				const oSetSelectedExpectation = this.mock(oBinding.oHeaderContext)
					.expects("setSelected").exactly(bSuspended ? 0 : 1).withExactArgs(false);
				oBindingMock.expects("createReadGroupLock").exactly(bSuspended ? 0 : 1)
					.withExactArgs("groupId", true);
				const oRemoveCacheExpectation = oBindingMock.expects("removeCachesAndMessages")
					.exactly(bSuspended ? 0 : 1).withExactArgs("");
				oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1)
					.withExactArgs(sinon.match.same(oBinding.oContext))
					.callsFake(function () {
						assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
					});
				oBindingMock.expects("reset").exactly(bSuspended ? 0 : 1)
					.withExactArgs(ChangeReason.Filter);
				this.mock(oBinding.oHeaderContext).expects("checkUpdate")
					.exactly(bSuspended ? 0 : 1).withExactArgs();

				// code under test
				assert.strictEqual(oBinding.filter(oFilter, sFilterType), oBinding, "chaining");

				if (!bSuspended) {
					assert.ok(oSetSelectedExpectation.calledBefore(oRemoveCacheExpectation));
				}

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
	[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
		var sTitle = "filter: same filters skips processing; FilterType=" + sFilterType;

		QUnit.test(sTitle, function (assert) {
			var oBinding,
				oBindingMock = this.mock(ODataListBinding.prototype),
				oHelperMock = this.mock(_Helper),
				aFilters = ["~filter~"];

			oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$operationMode : OperationMode.Server
			});

			if (sFilterType === FilterType.Control) {
				oBinding.aFilters.push("~filter~");
			} else {
				oBinding.aApplicationFilters.push("~filter~");
			}

			this.mock(oBinding).expects("checkTransient").withExactArgs();
			oHelperMock.expects("toArray").withExactArgs(sinon.match.same("~filter~"))
				.returns(aFilters);
			this.mock(Filter).expects("checkFilterNone").withExactArgs(sinon.match.same(aFilters));
			oHelperMock.expects("deepEqual").withExactArgs(sinon.match.same(aFilters),
					sinon.match.same(sFilterType === FilterType.Control
						? oBinding.aFilters : oBinding.aApplicationFilters))
				.returns(true);

			oBindingMock.expects("hasPendingChanges").never();
			oBindingMock.expects("reset").never();

			// code under test
			assert.strictEqual(oBinding.filter("~filter~", sFilterType), oBinding, "chaining");
		});
	});

	//*********************************************************************************************
	QUnit.test("filter: BCP: 2280148151", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, [/*vSorters*/], [/*vFilters*/], {
				$$operationMode : OperationMode.Server
			});

		oBinding.aFilters.push("~filter~");
		this.mock(oBinding).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("groupId", true);
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("fetchCache").withExactArgs(null);
		this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Filter);

		// code under test
		oBinding.filter([], FilterType.Control);

		assert.deepEqual(oBinding.aFilters, [], "control filters removed");
	});

	//*********************************************************************************************
	QUnit.test("filter: removes caches and messages", function () {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
			$$operationMode : OperationMode.Server
		});

		oBinding.aApplicationFilters.push("~filter~");

		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("fetchCache").withExactArgs(undefined);

		// Code under test
		oBinding.filter(/*no filter*/);
	});

	//*********************************************************************************************
	QUnit.test("filter: unresolved binding", function () {
		var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", null, null, null,
				{$$operationMode : OperationMode.Server});

		oBinding.aApplicationFilters.push("~filter~");

		// code under test
		oBinding.filter();
	});

	//*********************************************************************************************
	QUnit.test("filter: check errors", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.aApplicationFilters.push("~filter~");

		// code under test
		assert.throws(function () {
			oBinding.filter();
		}, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));

		oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{$$operationMode : OperationMode.Server, $$aggregation : {}});

		// code under test
		assert.throws(function () {
			oBinding.filter(Filter.NONE);
		}, new Error("Cannot combine Filter.NONE with $$aggregation"));

		oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{$$operationMode : OperationMode.Server});

		this.mock(_Helper).expects("toArray").withExactArgs(undefined).returns([]);
		this.mock(_Helper).expects("deepEqual")
			.withExactArgs([], sinon.match.same(oBinding.aApplicationFilters))
			.returns(false);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);

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
		oBinding.oQueryOptionsPromise = "~oQueryOptionsPromise~";
		this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oBinding.oDiff = [/*some diff*/];

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.aApplicationFilters, undefined);
		assert.strictEqual(oBinding.aContexts, undefined);
		assert.strictEqual(oBinding.oDiff, undefined);
		assert.strictEqual(oBinding.aFilters, undefined);
		//TODO does not work with ODataModel.integration "suspend/resume"
		// assert.strictEqual(oBinding.mParameters, undefined);
		assert.strictEqual(oBinding.mPreviousContextsByPath, undefined);
		assert.strictEqual(oBinding.aPreviousData, undefined);
		assert.strictEqual(oBinding.mQueryOptions, undefined);
		assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
		assert.strictEqual(oBinding.aSorters, undefined);

		assert.throws(function () {
			// code under test: must not destroy twice (fails somehow)
			oBinding.destroy();
		});

		oBinding = this.bindList("relative", Context.create(this.oModel, oParentBinding, "/foo"));
		assert.ok(oBinding.oQueryOptionsPromise);
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
		assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroyPreviousContexts: all", function (assert) {
		var oBinding = this.bindList("relative"),
			oContext1 = {
				isTransient : function () {},
				destroy : function () {}
			},
			oContext2 = {
				isTransient : function () {},
				destroy : function () {}
			},
			oContext3 = {
				isTransient : function () {},
				destroy : function () {}
			};

		oBinding.mPreviousContextsByPath = {p1 : oContext1, p2 : oContext2, p3 : oContext3};
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("destroy").withExactArgs();
		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext2).expects("destroy").withExactArgs();
		this.mock(oContext3).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext3).expects("destroy").withExactArgs();

		// code under test
		oBinding.destroyPreviousContexts();

		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
	});

	//*********************************************************************************************
	QUnit.test("destroyPreviousContexts: selection", function (assert) {
		var oBinding = this.bindList("relative"),
			oContext1 = { // no flag
				destroy : function () {},
				isEffectivelyKeptAlive : function () {},
				isTransient : function () {}
			},
			oContext2 = { // keepAlive
				iIndex : 2,
				isEffectivelyKeptAlive : function () {}
			},
			oContext3 = { // delete pending
				oDeletePromise : new SyncPromise(function () {}),
				isEffectivelyKeptAlive : function () {}
			},
			oContext4 = { // deleted
				oDeletePromise : SyncPromise.resolve(),
				destroy : function () {},
				isEffectivelyKeptAlive : function () {},
				isTransient : function () {}
			},
			oContext5 = { // transient
				isEffectivelyKeptAlive : function () {},
				isTransient : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			p1 : oContext1,
			p2 : oContext2,
			p3 : oContext3,
			p4 : oContext4,
			p5 : oContext5,
			p6 : "~oContext6~" // not in selection
		};
		this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("destroy").withExactArgs();
		this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext3).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext4).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext4).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext4).expects("destroy").withExactArgs();
		this.mock(oContext5).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext5).expects("isTransient").withExactArgs().returns(true);

		// code under test
		oBinding.destroyPreviousContexts(["p1", "p2", "p3", "p4", "p5", "p7"]);

		assert.deepEqual(oBinding.mPreviousContextsByPath,
			{p2 : oContext2, p3 : oContext3, p6 : "~oContext6~"});
		assert.strictEqual(oContext2.iIndex, undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroyPreviousContexts: cache & hidden context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext1 = {
				iIndex : undefined,
				destroy : function () {},
				isEffectivelyKeptAlive : function () {},
				isTransient : function () {}
			},
			oContext2 = {
				iIndex : 0,
				destroy : function () {},
				isEffectivelyKeptAlive : function () {},
				isTransient : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			p1 : oContext1,
			p2 : oContext2,
			p3 : "~oContext3~"
		};
		this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("destroy").withExactArgs();
		this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext2).expects("destroy").withExactArgs();
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("p1", "/EMPLOYEES").returns("relative/path");
		this.mock(oBinding.oCache).expects("removeKeptElement").withExactArgs("relative/path");

		// code under test
		oBinding.destroyPreviousContexts(["p1", "p2"]);

		assert.deepEqual(oBinding.mPreviousContextsByPath, {p3 : "~oContext3~"});
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
	QUnit.test("destroyPreviousContextsLater", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oModelMock = this.mock(this.oModel),
			aPaths = ["path"],
			oTaskExpectation;

		// mock early to catch even the function created using bind()
		oBindingMock.expects("destroyPreviousContexts").never();
		oModelMock.expects("addPrerenderingTask").never();

		// code under test
		oBinding.destroyPreviousContextsLater([]);

		oTaskExpectation = oModelMock.expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func);

		// code under test
		oBinding.destroyPreviousContextsLater(aPaths);

		oBindingMock.expects("destroyPreviousContexts")
			.on(oBinding).withExactArgs(sinon.match.same(aPaths));

		// code under test - callback function
		oTaskExpectation.args[0][0]();
	});

	//*********************************************************************************************
	QUnit.test("removeCreated", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext0 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				SyncPromise.resolve(Promise.resolve())),
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2,
				SyncPromise.resolve()), // let's assume this is created, persisted, kept-alive
			oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-25)", -3,
				SyncPromise.resolve(Promise.resolve()), /*bInactive*/true),
			oContext3 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-26)", -4,
				SyncPromise.resolve(Promise.resolve()));

		// simulate 4 created entities
		oBinding.aContexts.unshift(oContext3, oContext2, oContext1, oContext0);
		oBinding.iActiveContexts = 3;
		oBinding.iCreatedContexts = 4;
		assert.strictEqual(oBinding.getLength(), 14, "length");
		this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oBinding).expects("destroyLater").withExactArgs(sinon.match.same(oContext2));

		// code under test
		oBinding.removeCreated(oContext1);
		oBinding.removeCreated(oContext2);

		assert.strictEqual(oBinding.getLength(), 12);
		assert.strictEqual(oBinding.iActiveContexts, 2);
		assert.strictEqual(oBinding.iCreatedContexts, 2);
		assert.strictEqual(oBinding.aContexts[0], oContext3);
		assert.strictEqual(oContext3.getIndex(), 0);
		assert.strictEqual(oBinding.aContexts[1], oContext0);
		assert.strictEqual(oContext0.getIndex(), 1);

		return Promise.all([
			oContext0.created(),
			oContext1.created(),
			oContext2.created(),
			oContext3.created()
		]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bIsEffectivelyKeptAlive) {
	QUnit.test(`removeCreated: $$aggregation, ${bIsEffectivelyKeptAlive}`, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$aggregation : {}}), // Note: no hierarchyQualifier!
			oContext = {
				// no getModelIndex, isInactive
				isEffectivelyKeptAlive : mustBeMocked
			};

		oBinding.iActiveContexts = "~iActiveContexts~";
		oBinding.iCreatedContexts = "~iCreatedContexts~";
		oBinding.bFirstCreateAtEnd = "~bFirstCreateAtEnd~";
		oBinding.aContexts
			= [{iIndex : "#0"}, {iIndex : "#1"}, oContext, {iIndex : 3},, {iIndex : 5}];
		oBinding.iMaxLength = 43;
		this.mock(oContext).expects("isEffectivelyKeptAlive").withExactArgs()
			.returns(bIsEffectivelyKeptAlive);
		this.mock(oBinding).expects("destroyLater").exactly(bIsEffectivelyKeptAlive ? 0 : 1)
			.withExactArgs(sinon.match.same(oContext));

		// code under test
		oBinding.removeCreated(oContext);

		assert.strictEqual(oBinding.iActiveContexts, "~iActiveContexts~");
		assert.strictEqual(oBinding.iCreatedContexts, "~iCreatedContexts~");
		assert.strictEqual(oBinding.bFirstCreateAtEnd, "~bFirstCreateAtEnd~");
		assert.deepEqual(oBinding.aContexts,
			[{iIndex : "#0"}, {iIndex : "#1"}, {iIndex : 2},, {iIndex : 4}]);
		assert.strictEqual(oBinding.iMaxLength, 42);
	});
});

	//*********************************************************************************************
[0, 1].forEach(function (iCurrentEnd) {
	var sTitle = "destroyLater: iCurrentEnd=" + iCurrentEnd;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2,
				SyncPromise.resolve());

		oBinding.iCurrentEnd = iCurrentEnd;
		this.mock(oContext).expects("destroy").exactly(iCurrentEnd ? 0 : 1)
			.withExactArgs();

		// code under test
		oBinding.destroyLater(oContext);

		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-24)"],
			iCurrentEnd ? oContext : undefined);
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
					return Context.create(oModel, oParentBinding, sPath);
				}

				return undefined;
			}

			this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1)
				.callsFake(function () {
					this.oCache = oTargetCache;
					this.oCachePromise = SyncPromise.resolve(oTargetCache);
				});
			this.mock(ODataListBinding.prototype).expects("restoreCreated").atLeast(1)
				.withExactArgs();
			oBinding = oModel.bindList("Equipments", oInitialContext);
			this.mock(oBinding).expects("checkSuspended").withExactArgs(true);

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
					aContexts = [
						{setSelected : mustBeMocked},
						{setSelected : mustBeMocked},
						{setSelected : mustBeMocked}
					],
					oContextMock = this.mock(Context),
					i,
					sPath,
					aResults = [
						{setSelected : mustBeMocked},
						{setSelected : mustBeMocked},
						{setSelected : mustBeMocked}
					],
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
				this.mock(oBinding).expects("getResolvedPath").twice().withExactArgs()
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
					this.mock(aContexts[i - iStart]).expects("setSelected")
						.withExactArgs("~selected~");
				}
				this.mock(oBinding.oHeaderContext).expects("isSelected").exactly(aContexts.length)
					.withExactArgs().returns("~selected~");

				// code under test
				assert.strictEqual(oBinding.createContexts(iStart, aResults), true);

				for (i = iStart; i < iStart + aResults.length; i += 1) {
					assert.strictEqual(oBinding.aContexts[i], aContexts[i - iStart]);
				}

				// code under test : no second change event
				assert.strictEqual(oBinding.createContexts(iStart, aResults), false);
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCreated) {
		var sTitle = "createContexts, paging: less data than requested; w/ created: " + bCreated;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES", {/*oContext*/}),
				iCreatedContexts = bCreated ? 2 : 0,
				i,
				aResults;

			function result(iLength, iCount) {
				// only active created contexts add to $count
				iCount &&= iCount + (bCreated ? 1 : 0);
				return createData(iLength, 0, true, iCount);
			}

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 0, "Initial estimated length is 0");
			assert.strictEqual(oBinding.iMaxLength, Infinity);

			if (bCreated) {
				// simulate an active (poss. persisted) and an inactive created entity
				oBinding.aContexts.unshift({});
				oBinding.aContexts.unshift({});
				oBinding.iActiveContexts = 1;
				oBinding.iCreatedContexts = 2;
			}

			// code under test: set length and length final flag
			// Note: short reads are handled by _Cache and set $count!
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, result(29, 20 + 29)),
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
				oBinding.createContexts(20 + iCreatedContexts, result(17, 20 + 17)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 37);

			// code under test
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, result(17)),
				false,
				"do not modify upper boundary if same data is read (no short read)");

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 37);

			// code under test: reset upper boundary
//TODO cannot happen with our _Cache; _Cache doesn't read more than final length elements
			assert.strictEqual(
				oBinding.createContexts(20 + iCreatedContexts, result(30)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), false);
			assert.strictEqual(oBinding.getLength(), 60 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, Infinity);

			// code under test: no data for some other page is not a change
			assert.strictEqual(
				oBinding.createContexts(10000 + iCreatedContexts, result(0)),
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
				oBinding.createContexts(50 + iCreatedContexts, result(0)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 50 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 50);

			// code under test
			assert.strictEqual(
				oBinding.createContexts(30 + iCreatedContexts, result(0)),
				true);

			assert.strictEqual(oBinding.isLengthFinal(), true);
			assert.strictEqual(oBinding.getLength(), 30 + iCreatedContexts);
			assert.strictEqual(oBinding.aContexts.length, 30 + iCreatedContexts);
			assert.strictEqual(oBinding.iMaxLength, 30);

			// code under test: preparation for following test for server-side paging: create a gap
			assert.strictEqual(
				oBinding.createContexts(100 + iCreatedContexts, result(20)),
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
				oBinding.createContexts(0 + iCreatedContexts, aResults),
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
			oContext3 = {setSelected : mustBeMocked},
			oContextMock = this.mock(Context);

		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES/0" : {},
			"/EMPLOYEES/1" : oContext1,
			"/EMPLOYEES/2" : oContext2
		};
		this.mock(oContext1).expects("checkUpdate").withExactArgs();
		this.mock(oContext2).expects("checkUpdate").withExactArgs();
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES/3", 3)
			.returns(oContext3);
		this.mock(oBinding.oHeaderContext).expects("isSelected")
			.withExactArgs().returns("~selected~");
		this.mock(oContext3).expects("setSelected").withExactArgs("~selected~");
		this.mock(this.oModel).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func).callsArg(0);
		this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs(["/EMPLOYEES/0"]);

		// code under test
		oBinding.createContexts(1, [{}, {}, {}]);

		assert.strictEqual(oBinding.aContexts[1], oContext1);
		assert.strictEqual(oBinding.aContexts[2], oContext2);
		assert.strictEqual(oBinding.aContexts[3], oContext3);
	});

	//*********************************************************************************************
	QUnit.test("createContexts w/ keyPredicates, reuse previous contexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", {/*oContext*/}),
			oBindingMock = this.mock(oBinding),
			oContext0 = {},
			oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES('B')", 99),
			oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES('C')", 1),
			oContext3 = {},
			oContext4 = {getPath : mustBeMocked},
			oContextMock = this.mock(Context);

		// must be mocked here, so that later bind grabs the mock
		oBindingMock.expects("destroyPreviousContexts").never();
		assert.deepEqual(oBinding.aContexts, [], "binding is reset");
		oBinding.iCreatedContexts = 2; // reset might keep some
		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('A')" : oContext0,
			"/EMPLOYEES('B')" : oContext1,
			"/EMPLOYEES('D')" : oContext3
		};
		this.mock(oContext1).expects("destroy").never();
		this.mock(oContext1).expects("checkUpdate").withExactArgs();
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES('C')", 1)
			.returns(oContext2);
		this.mock(oContext4).expects("getPath").withExactArgs().returns("/EMPLOYEES('E')");
		oBindingMock.expects("destroyPreviousContextsLater")
			.withExactArgs(["/EMPLOYEES('A')", "/EMPLOYEES('D')"]);

		// code under test
		oBinding.createContexts(2, [{
			"@$ui5._" : {predicate : "('B')"}
		}, {
			"@$ui5._" : {predicate : "('C')"}
		}, {
			"@$ui5._" : {context : oContext4, predicate : "('E')"}
		}]);

		assert.strictEqual(oBinding.aContexts[2], oContext1);
		assert.strictEqual(oBinding.aContexts[3], oContext2);
		assert.strictEqual(oBinding.aContexts[4], oContext4);
		assert.strictEqual(oContext1.getModelIndex(), 2);
		assert.strictEqual(oContext2.getModelIndex(), 3);
		assert.strictEqual(oContext1.iIndex, 0);
		assert.strictEqual(oContext2.iIndex, 1);
		assert.strictEqual(oContext4.iIndex, 2);
		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 2);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('A')"], oContext0);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('D')"], oContext3);
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
		oBinding.createContexts(1, aResults);

		assert.deepEqual(oBinding.aContexts, []);
		assert.strictEqual(oBinding.bLengthFinal, true);
		assert.strictEqual(oBinding.iMaxLength, 1);
	});

	//*********************************************************************************************
	QUnit.test("createContexts: do not reuse a created context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", -1,
				SyncPromise.resolve()),
			oNewContext = {setSelected : mustBeMocked};

		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('1')" : oCreatedContext
		};

		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES('1')", 0)
			.returns(oNewContext);
		this.mock(oBinding.oHeaderContext).expects("isSelected")
			.withExactArgs().returns("~selected~");
		this.mock(oNewContext).expects("setSelected").withExactArgs("~selected~");
		this.mock(this.oModel).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func).callsArg(0);
		this.mock(oCreatedContext).expects("destroy").withExactArgs();

		oBinding.createContexts(0, [{
			"@$ui5._" : {predicate : "('1')"}
		}]);

		assert.strictEqual(oBinding.aContexts[0], oNewContext);
	});

	//*********************************************************************************************
	QUnit.test("createContexts: reuse a created context if kept alive", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", -1,
				SyncPromise.resolve());

		oCreatedContext.setKeepAlive(true);
		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('1')" : oCreatedContext
		};
		this.mock(Context).expects("create").never();
		this.mock(oBinding).expects("destroyPreviousContextsLater").withExactArgs([]);
		this.mock(oCreatedContext).expects("destroy").never();
		this.mock(oCreatedContext).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.createContexts(0, [{
			"@$ui5._" : {context : "n/a", predicate : "('1')"}
		}]);

		assert.strictEqual(oBinding.aContexts[0], oCreatedContext);
		assert.strictEqual(oCreatedContext.getModelIndex(), 0);
	});

	//*********************************************************************************************
	QUnit.test("createContexts: reuse a created context in a RH", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		const oCreatedContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", 42,
			SyncPromise.resolve());
		const oCreatedContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES('2')", 43,
			SyncPromise.resolve());

		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('1')" : oCreatedContext1,
			"/EMPLOYEES('2')" : oCreatedContext2
		};
		this.mock(Context).expects("create").never();
		this.mock(oBinding).expects("destroyPreviousContextsLater").withExactArgs([]);
		this.mock(oCreatedContext1).expects("destroy").never();
		this.mock(oCreatedContext1).expects("setPersisted").never();
		this.mock(oCreatedContext1).expects("checkUpdate").withExactArgs();
		this.mock(oCreatedContext2).expects("destroy").never();
		this.mock(oCreatedContext2).expects("setPersisted").withExactArgs();
		this.mock(oCreatedContext2).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.createContexts(0, [{
			"@$ui5._" : {context : "n/a", predicate : "('1')"},
			"@$ui5.context.isTransient" : false
		}, {
			"@$ui5._" : {context : "n/a", predicate : "('2')"}
		}]);

		assert.strictEqual(oBinding.aContexts[0], oCreatedContext1);
		assert.strictEqual(oBinding.aContexts[1], oCreatedContext2);
		assert.strictEqual(oCreatedContext1.getModelIndex(), 0);
		assert.strictEqual(oCreatedContext2.getModelIndex(), 1);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSame) {
	const sTitle = `createContexts: reuse created from 'context' annotation, same : ${bSame}`;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", -1,
				SyncPromise.resolve()),
			oNewContext = bSame ? oCreatedContext : {
				getPath : mustBeMocked
			};

		oBinding.mPreviousContextsByPath = {
			"/EMPLOYEES('1')" : oCreatedContext
		};

		this.mock(Context).expects("create").never();
		this.mock(oCreatedContext).expects("checkUpdate").never();
		this.mock(oCreatedContext).expects("destroy").never();
		this.mock(oNewContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
		this.mock(oBinding).expects("destroyPreviousContextsLater")
			.withExactArgs(bSame ? [] : ["/EMPLOYEES('1')"]);

		// code under test
		oBinding.createContexts(42, [{
			"@$ui5._" : {context : oNewContext, predicate : "('1')"}
		}]);

		assert.strictEqual(oBinding.aContexts[42], oNewContext);
		assert.strictEqual(oNewContext.iIndex, 42);
		assert.deepEqual(oBinding.mPreviousContextsByPath, bSame
			? {} // removed
			: {"/EMPLOYEES('1')" : oCreatedContext}); // unchanged
	});
});

	//*********************************************************************************************
// undefined -> the reinsertion callback is not called because the binding already has another cache
[undefined, false, true].forEach(function (bSuccess) {
	[false, true].forEach(function (bCreated) { // the deleted context is created-persisted
		[undefined, false, true].forEach(function (bExpanded) { // undefined -> no hierarchy
			[false, true].forEach(function (bExpandFailure) {
				const sTitle = "delete: success=" + bSuccess + ", created=" + bCreated
					+ ", expanded=" + bExpanded + ", expandFailure=" + bExpandFailure;
				if (bCreated && bExpanded || bExpandFailure && (bSuccess || !bExpanded)) {
					return;
				}

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES"),
				oBindingMock = this.mock(oBinding),
				oContext1,
				oContext1Mock,
				sContext1Path,
				aData = createData(5, 0, true, undefined, true),
				aData2 = aData.slice(4, 5),
				oDeleteCall,
				fnResolve,
				fnReject,
				oDeleteFromCachePromise = new Promise(function (resolve, reject) {
					fnResolve = resolve;
					fnReject = reject;
				}),
				oETagEntity = {},
				aPreviousContexts,
				oPromise,
				fnUndelete = sinon.spy(),
				that = this;

			if (bExpanded !== undefined) {
				oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
			}
			oBinding.createContexts(0, aData.slice(0, 3));
			aData2.$count = 5; // non-empty short read adds $count
			oBinding.createContexts(4, aData2);
			// aContexts now is [0, 1, 2, undefined, 4]
			oBinding.iDeletedContexts = 3;
			oContext1 = oBinding.aContexts[1];
			oContext1Mock = this.mock(oContext1);
			sContext1Path = oContext1.getPath();
			if (bCreated) { // fake a created context: it needs a negative index
				oContext1.iIndex = -1;
			}
			oContext1Mock.expects("getModelIndex").withExactArgs().returns(42);
			// also called from sinon.match.same() via toString()
			oContext1Mock.expects("isDeleted").atLeast(1).withExactArgs().returns(false);
			oContext1Mock.expects("isExpanded").withExactArgs().returns(bExpanded);
			oBindingMock.expects("collapse").exactly(bExpanded ? 1 : 0)
				.withExactArgs(sinon.match.same(oContext1), true);
			oBindingMock.expects("destroyPreviousContexts").never();
			oContext1Mock.expects("resetKeepAlive").never();
			oDeleteCall = oContext1Mock.expects("doDelete")
				.withExactArgs("myGroup", "EMPLOYEES('1')", "42", sinon.match.same(oETagEntity),
					sinon.match.same(oBinding), sinon.match.func)
				.callsFake(function () {
					// Although delete works with existing cache data and the cache immediately
					// calls back, it is yet possibly asynchronous (oCachePromise, fetchValue).
					// So we add a created context here, and the index becomes 2, although we
					// started with index 1.
					oBinding.aContexts.unshift({
						getModelIndex : function () { return 0; } // called below, by ourselves
					}); // [-1, 0, 1, 2, undefined, 4]
					oBinding.iCreatedContexts = 1;
					oBinding.iActiveContexts = 1;
					aPreviousContexts = oBinding.aContexts.slice();
					assert.strictEqual(oBinding.getLength(), 6);

					arguments[5](2, -1); // now call the callback with the adjusted index

					assert.notOk(fnUndelete.called);

					// expectations for then
					oContext1Mock.expects("resetKeepAlive").exactly(bSuccess ? 1 : 0)
						.withExactArgs();
					oBindingMock.expects("destroyPreviousContextsLater").exactly(bSuccess ? 1 : 0)
						.withExactArgs([sContext1Path]);
					// expectations for catch
					oBindingMock.expects("expand").exactly(!bSuccess && bExpanded ? 1 : 0)
						.withExactArgs(sinon.match.same(oContext1), true)
						.returns(bExpandFailure
							? SyncPromise.reject("~oExpandError~")
							: SyncPromise.resolve());
					oBindingMock.expects("_fireChange").exactly(bSuccess || bExpandFailure ? 0 : 1)
						.withExactArgs({reason : ChangeReason.Add});

					return oDeleteFromCachePromise;
				});
			oBinding.aContexts.forEach(function (oContext) {
				that.mock(oContext).expects("destroy").never();
			});
			oBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Remove})
				.callsFake(function () {
					// aContexts : [-1, 0, 1, 2, undefined, 4] -> [-1, 0, 2, undefined, 4]
					assert.strictEqual(oBinding.getLength(), 5);
					assert.strictEqual(oBinding.aContexts.length, 5);
					assert.strictEqual(oBinding.iCreatedContexts, bCreated ? 0 : 1);
					assert.strictEqual(oBinding.iActiveContexts, bCreated ? 0 : 1);
					assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
					assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
					assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[3]);
					assert.notOk(3 in oBinding.aContexts);
					assert.strictEqual(oBinding.aContexts[4], aPreviousContexts[5]);
					assert.strictEqual(
						oBinding.mPreviousContextsByPath[oContext1.getPath()],
						oContext1);
					assert.strictEqual(oContext1.iIndex, undefined);
					oBinding.aContexts.forEach(function (oContext, i) {
						assert.strictEqual(oContext.getModelIndex(), i);
					});

					// This assures that the change event must come before deleteFromCache finished
					if (bSuccess) {
						fnResolve();
					} else {
						if (bSuccess === false) {
							oDeleteCall.args[0][5](2, 1); // call the callback for the re-insertion

							// aContexts : [-1, 0, 2, undefined, 4] -> [-1, 0, 1, 2, undefined, 4]
							assert.strictEqual(oBinding.getLength(), 6);
							assert.strictEqual(oBinding.aContexts.length, 6);
							assert.strictEqual(oBinding.iCreatedContexts, 1);
							assert.strictEqual(oBinding.iActiveContexts, 1);
							assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
							assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
							assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[2]);
							assert.strictEqual(oBinding.aContexts[3], aPreviousContexts[3]);
							assert.notOk(4 in oBinding.aContexts);
							assert.strictEqual(oBinding.aContexts[5], aPreviousContexts[5]);
							assert.notOk(oContext1.getPath() in oBinding.mPreviousContextsByPath);
							oBinding.aContexts.forEach(function (oContext, i) {
								assert.strictEqual(oContext.iIndex + oBinding.iCreatedContexts, i);
							});
							sinon.assert.calledOnceWithExactly(fnUndelete);
						}

						fnReject("~oError~");
					}
				});

			// code under test
			oPromise = oBinding.delete("myGroup", "EMPLOYEES('1')", oContext1, oETagEntity,
				"~bDoNotRequestCount~", fnUndelete);

			assert.strictEqual(oBinding.iDeletedContexts, 4);

			return oPromise.then(function () {
				assert.ok(bSuccess && !bExpandFailure);
				assert.strictEqual(oBinding.iDeletedContexts, 3);
				assert.strictEqual(oContext1.iIndex, Context.VIRTUAL);
			}, function (oError) {
				assert.ok(!bSuccess || bExpandFailure);
				if (bExpandFailure) {
					assert.strictEqual(oError, "~oExpandError~");
				} else {
					assert.strictEqual(oError, "~oError~");
					assert.strictEqual(oBinding.iDeletedContexts, 3);
					sinon.assert.calledWithExactly(fnUndelete); // might be called twice
				}
			});
		});
			});
		});
	});
});
	//TODO check the row of a pending update with higher index

	//*********************************************************************************************
	QUnit.test("delete: deleted context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = {
				oDeletePromise : "~oDeletePromise~",
				getModelIndex : function () {}, // result does not matter
				iIndex : 1,
				isDeleted : mustBeMocked
			};

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(true);

		assert.strictEqual(
			// code under test
			oBinding.delete("myGroup", "EMPLOYEES('1')", oContext),
			"~oDeletePromise~"
		);
	});

	//*********************************************************************************************
[
	{lengthFinal : false},
	{lengthFinal : true, error : true},
	{lengthFinal : true, noGroup : true},
	{lengthFinal : true, noGroup : true, newMaxLength : 42},
	{lengthFinal : true, apiGroup : false, newMaxLength : 42},
	{lengthFinal : true, apiGroup : true, newMaxLength : 41}
].forEach(function (oFixture) {
	var sTitle = "delete: kept-alive context not in the collection: " + JSON.stringify(oFixture);

	// we assume 42 entities matching the filter plus 2 created entities
	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oBindingResetCall,
			oCacheResetCall,
			aContexts = [{iIndex : -2}, {iIndex : -1}, {iIndex : 0}, {iIndex : 1}],
			oCountPromise = Promise.resolve(oFixture.newMaxLength + 1),
			oDeleteFromCacheExpectation,
			bFireChange = oFixture.newMaxLength === 41,
			oGroupLock = oFixture.noGroup
				? null
				: {
					getGroupId : function () {},
					getUnlockedCopy : function () {}
				},
			oHelperMock = this.mock(_Helper),
			oKeptAliveContext = {
				iIndex : undefined,
				created : function () { return undefined; },
				doDelete : mustBeMocked,
				getPath : function () { return "~contextPath~"; },
				isDeleted : mustBeMocked,
				isExpanded : mustBeMocked,
				resetKeepAlive : mustBeMocked
			},
			iOldMaxLength = oFixture.lengthFinal ? 42 : Infinity,
			oPromise,
			fnUndelete = sinon.spy(),
			that = this;

		// simulate an active and an inactive created entity
		oBinding.aContexts = aContexts;
		oBinding.iActiveContexts = 1;
		oBinding.iCreatedContexts = 2;
		oBinding.bLengthFinal = oFixture.lengthFinal;
		oBinding.iMaxLength = iOldMaxLength;
		oBinding.mPreviousContextsByPath = {
			"~contextPath~" : oKeptAliveContext
		};

		this.mock(oKeptAliveContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oKeptAliveContext).expects("isExpanded").withExactArgs().returns(false);
		oBindingMock.expects("destroyPreviousContexts").never();
		oHelperMock.expects("getRelativePath")
			.withExactArgs("~contextPath~", "/EMPLOYEES").returns("~predicate~");
		oDeleteFromCacheExpectation = this.mock(oKeptAliveContext).expects("doDelete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')", "~predicate~",
				"oETagEntity", sinon.match.same(oBinding), sinon.match.func)
			.returns(oCountPromise.then(function () {
				if (oFixture.error) {
					that.mock(oBinding).expects("getKeepAlivePredicates").withExactArgs()
						.returns("~predicates~");
					oCacheResetCall = that.mock(oBinding.oCache).expects("reset")
						.withExactArgs("~predicates~");
					oBindingResetCall = oBindingMock.expects("reset")
						.withExactArgs(ChangeReason.Change);
					throw "~oError~";
				}
				that.mock(oKeptAliveContext).expects("resetKeepAlive").withExactArgs();
				oBindingMock.expects("destroyPreviousContextsLater")
					.withExactArgs(["~contextPath~"]);
			}));

		// code under test
		oPromise = oBinding.delete(oGroupLock, "EMPLOYEES('1')", oKeptAliveContext, "oETagEntity",
			oFixture.error || !oFixture.newMaxLength, fnUndelete);

		if (oGroupLock) {
			this.mock(oGroupLock).expects("getGroupId").exactly(oFixture.newMaxLength ? 1 : 0)
				.withExactArgs().returns("group");
			this.mock(this.oModel).expects("isApiGroup").exactly(oFixture.newMaxLength ? 1 : 0)
				.withExactArgs("group").returns(oFixture.apiGroup);
			this.mock(oGroupLock).expects("getUnlockedCopy")
				.exactly(oFixture.apiGroup === false ? 1 : 0)
				.withExactArgs().returns("~groupLock~");
		}
		oBindingMock.expects("lockGroup")
			.exactly((!oGroupLock || oFixture.apiGroup) && oFixture.newMaxLength ? 1 : 0)
			.withExactArgs("$auto").returns("~groupLock~");
		this.mock(oBinding.oCache).expects("requestCount").exactly(oFixture.newMaxLength ? 1 : 0)
			.withExactArgs("~groupLock~")
			.returns(oCountPromise);
		oBindingMock.expects("_fireChange").exactly(bFireChange ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Remove})
			.callsFake(function () {
				assert.strictEqual(oBinding.iMaxLength, 41);
			});

		// code under test - callback
		oDeleteFromCacheExpectation.args[0][5](undefined, -1);

		assert.notOk(fnUndelete.called);

		if (oFixture.error) {
			// code under test - callback for reinsertion
			oDeleteFromCacheExpectation.args[0][5](undefined, 1);

			sinon.assert.calledOnceWithExactly(fnUndelete);
		}
		return oPromise.then(function () {
			assert.deepEqual(oBinding.aContexts, aContexts);
			assert.strictEqual(oBinding.iMaxLength, oFixture.newMaxLength || iOldMaxLength);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");

			assert.ok(oBindingResetCall.calledAfter(oCacheResetCall));
		});
	});
});

	//*********************************************************************************************
	QUnit.test("create: callbacks and eventing", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext0,
			oContext1,
			oCreateInCacheExpectation,
			oCreateInCachePromise0 = Promise.resolve({}),
			oCreateInCachePromise1 = Promise.resolve({}),
			oCreatePathPromise = SyncPromise.resolve("~"),
			oError = {},
			oGroupLock0 = {},
			oGroupLock1 = {},
			oLockGroupExpectation,
			oPromise,
			oRemoveCreatedExpectation,
			oSetSelectedExpectation,
			that = this;

		oBindingMock.expects("getUpdateGroupId").withExactArgs().returns("~update~");
		oLockGroupExpectation = oBindingMock.expects("lockGroup")
			.withExactArgs("~update~", true, true, sinon.match.func)
			.returns(oGroupLock0);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oCreateInCacheExpectation = oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise),
				"/EMPLOYEES", sinon.match(rTransientPredicate), {}, false, sinon.match.func,
				sinon.match.func)
			.returns(SyncPromise.resolve(oCreateInCachePromise0));
		oCreateInCachePromise0.then(function () {
			that.mock(oContext0).expects("updateAfterCreate").withExactArgs(true, "$auto");
		});
		this.mock(oContextPrototype).expects("fetchValue").twice().withExactArgs().resolves({});

		// code under test (create first entity, skip refresh)
		oContext0 = oBinding.create(null, true);

		assert.strictEqual(oBinding.iCreatedContexts, 1);
		assert.strictEqual(oBinding.iActiveContexts, 1);
		assert.strictEqual(oBinding.aContexts[0], oContext0);
		assert.strictEqual(oContext0.getIndex(), 0);
		assert.strictEqual(oContext0.iIndex, -1);

		oBindingMock.expects("getUpdateGroupId").withExactArgs().returns("~update~");
		oBindingMock.expects("lockGroup")
			.withExactArgs("~update~", true, true, sinon.match.func)
			.returns(oGroupLock1);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock1), sinon.match.same(oCreatePathPromise),
				"/EMPLOYEES", sinon.match(rTransientPredicate), {}, false, sinon.match.func,
				sinon.match.func)
			.returns(SyncPromise.resolve(oCreateInCachePromise1));
		oCreateInCachePromise1.then(function () {
			that.mock(oContext1).expects("updateAfterCreate").withExactArgs(true, "$auto");
		});

		// code under test (create second entity, skip refresh)
		oContext1 = oBinding.create(null, true);

		assert.strictEqual(oBinding.iCreatedContexts, 2);
		assert.strictEqual(oBinding.iActiveContexts, 2);
		assert.strictEqual(oBinding.aContexts[0], oContext1);
		assert.strictEqual(oContext1.getIndex(), 0);
		assert.strictEqual(oContext1.iIndex, -2);

		assert.strictEqual(oBinding.aContexts[1], oContext0);
		assert.strictEqual(oContext0.getIndex(), 1);
		assert.strictEqual(oContext0.iIndex, -1);

		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createSent", {context : sinon.match.same(oContext0)});

		// code under test
		oCreateInCacheExpectation.args[0][7](); // call fnSubmitCallback

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("POST on '~' failed; will be repeated automatically", sClassName,
				sinon.match.same(oError));
		oBindingMock.expects("fireEvent").on(oBinding)
			.withExactArgs("createCompleted",
				{context : sinon.match.same(oContext0), success : false});

		// code under test - call fnErrorCallback
		oCreateInCacheExpectation.args[0][6](oError);

		oSetSelectedExpectation = this.mock(oContext0).expects("doSetSelected")
			.withExactArgs(false);
		oRemoveCreatedExpectation = oBindingMock.expects("removeCreated")
			.withExactArgs(sinon.match.same(oContext0));

		// code under test - call fnCancelCallback to simulate cancellation
		oPromise = oLockGroupExpectation.args[0][3]();

		assert.ok(oSetSelectedExpectation.calledBefore(oRemoveCreatedExpectation));

		// expect the event to be fired asynchronously
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});

		oBinding.aContexts = [];
		oBindingMock.expects("destroyPreviousContextsLater").withExactArgs([oContext0.getPath()]);

		// code under test - call fnCancelCallback to simulate cancellation
		// artificial scenario - oContext0 is not in aContexts. this can only happen in relative
		// bindings where the parent context was changed via #setContext.
		assert.strictEqual(oLockGroupExpectation.args[0][3](), undefined);

		assert.strictEqual(oBinding.mPreviousContextsByPath[oContext0.getPath()], oContext0);

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
		sTitle : "create: absolute"
	}, {
		sGroupId : "$auto",
		sTitle : "create: absolute, with initial data"
	}, {
		sGroupId : "deferred",
		bRelative : true,
		sTitle : "create: relative with base context"
	}, {
		sGroupId : "$direct",
		sTitle : "create: absolute with groupId=$direct"
	}, {
		sGroupId : "$auto",
		bInactive : true,
		sTitle : "create: inactive, with $auto groupId"
	}, {
		sGroupId : "deferred",
		bInactive : true,
		sTitle : "create: inactive, with deferred groupId"
	}].forEach(function (oFixture) {
		QUnit.test(oFixture.sTitle, function (assert) {
			var oBinding,
				oBindingContext = this.oModel.createBindingContext("/"),
				oBindingMock,
				iChangeFired = 0,
				oContextMock = this.mock(oContextPrototype),
				aContexts = [],
				iCreateNo = 0,
				aCreatedElements = ["~element0~", "~element1~"],
				oCreatePathPromise = {},
				aCreatePromises = [
					SyncPromise.resolve(Promise.resolve(aCreatedElements[0])),
					SyncPromise.resolve(Promise.resolve(aCreatedElements[1]))
				],
				oHelperMock = this.mock(_Helper),
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
				assert.strictEqual(oCreatedContext.isInactive(), oFixture.bInactive);
				assert.strictEqual(oCreatedContext.isTransient(), true);
				assert.strictEqual(oBinding.iMaxLength, 42, "transient contexts are not counted");
				assert.strictEqual(oBinding.aContexts[0], oCreatedContext, "Transient context");
				assert.strictEqual(iChangeFired, iCreateNo + 1, "Change event fired");
			}

			function expect() {
				var oGroupLock = {},
					iCurrentCreateNo = iCreateNo;

				oBindingMock.expects("checkSuspended").withExactArgs();
				oHelperMock.expects("isDataAggregation")
					.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
				oBindingMock.expects("getGroupId")
					.returns(oFixture.sGroupId || "$auto");
				oModelMock.expects("isApiGroup")
					.withExactArgs(oFixture.sGroupId || "$auto")
					.returns(oFixture.sGroupId === "deferred");
				oBindingMock.expects("getUpdateGroupId").withExactArgs().returns(oFixture.sGroupId);
				oBindingMock.expects("lockGroup")
					.withExactArgs(oFixture.bInactive
							? "$inactive." + oFixture.sGroupId
							: oFixture.sGroupId,
						true, true, sinon.match.func)
					.returns(oGroupLock);
				oBindingMock.expects("fetchResourcePath").withExactArgs()
					.returns(oCreatePathPromise);
				oBindingMock.expects("createInCache")
					.withExactArgs(sinon.match.same(oGroupLock),
						sinon.match.same(oCreatePathPromise), "/EMPLOYEES",
						sinon.match(rTransientPredicate), {}, false, sinon.match.func,
						sinon.match.func)
					.returns(aCreatePromises[iCurrentCreateNo]);
				oContextMock.expects("fetchValue").withExactArgs().resolves({});

				aCreatePromises[iCurrentCreateNo].then(function () {
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(aCreatedElements[iCurrentCreateNo]),
							"predicate")
						.returns("~predicate~");
					oBindingMock.expects("adjustPredicate")
						.withExactArgs(sinon.match(rTransientPredicate), "~predicate~",
							sinon.match.same(aContexts[iCurrentCreateNo]));
					oBindingMock.expects("fireEvent")
						.withExactArgs("createCompleted", {
							context : sinon.match.same(aContexts[iCurrentCreateNo]),
							success : true
						});
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(aCreatedElements[iCurrentCreateNo]),
							"deepCreate")
						.returns(false);
					oBindingMock.expects("lockGroup")
						.withExactArgs(oFixture.sGroupId === "$direct" ? "$direct" : "$auto")
						.returns(oGroupLock);
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
			aContexts.push(
				oBinding.create(null, false, false, oFixture.bInactive, oFixture.bTransient));

			checkCreatedContext();

			// code under test
			oBinding.hasPendingChanges();

			iCreateNo += 1;
			expect();

			// code under test: 2nd create
			aContexts.push(
				oBinding.create(null, false, false, oFixture.bInactive, oFixture.bTransient));

			checkCreatedContext();
			assert.strictEqual(aContexts[0].getIndex(), 1);

			return Promise.all([aContexts[0].created(), aContexts[1].created()]).then(function () {
				assert.strictEqual(aContexts[0].isTransient(), false);
				assert.strictEqual(aContexts[1].isTransient(), false);
				if (!oFixture.bTransient) {
					assert.ok(aRefreshSingleFinished[0]);
					assert.ok(aRefreshSingleFinished[1]);
				}
				assert.strictEqual(oBinding.iCreatedContexts, 2);
				assert.strictEqual(oBinding.iMaxLength, 42, "persisted contexts are not counted");
			});
		});
	});

	//*********************************************************************************************
	[
		{bSkipRefresh : true, bDeepCreate : false},
		{bSkipRefresh : false, bDeepCreate : false, bRefreshSingle : true},
		{bSkipRefresh : false, bDeepCreate : true}
	].forEach(function (oFixture) {
		QUnit.test("create: " + JSON.stringify(oFixture), function () {
			var oBinding = this.bindList("/EMPLOYEES"),
				oBindingMock = this.mock(oBinding),
				oContext,
				oCreatedEntity = {},
				oCreatePathPromise = {},
				oCreatePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)),
				oGroupLock0 = {},
				oGroupLock1 = {},
				oHelperMock = this.mock(_Helper),
				sPredicate = "(ID=42)",
				oRefreshedEntity = {},
				that = this;

			oBindingMock.expects("getUpdateGroupId").withExactArgs().returns("~update~");
			oHelperMock.expects("publicClone").withExactArgs("~oInitialData~", true)
				.returns("~publicClone~");
			oBindingMock.expects("lockGroup")
				.withExactArgs("~update~", true, true, sinon.match.func)
				.returns(oGroupLock0);
			oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
			oBindingMock.expects("createInCache")
				.withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise),
					"/EMPLOYEES", sinon.match(rTransientPredicate), "~publicClone~", false,
					sinon.match.func, sinon.match.func)
				.returns(oCreatePromise);
			this.mock(oContextPrototype).expects("fetchValue").withExactArgs().resolves({});
			oCreatePromise.then(function () {
				oHelperMock.expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "predicate")
					.returns(sPredicate);
				oBindingMock.expects("fireEvent")
					.withExactArgs("createCompleted", {
						context : sinon.match.same(oContext),
						success : true
					});
				oHelperMock.expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "deepCreate")
					.returns(oFixture.bDeepCreate);
				oHelperMock.expects("deletePrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "deepCreate");
				that.mock(oContext).expects("updateAfterCreate")
					.exactly(oFixture.bRefreshSingle ? 0 : 1)
					.withExactArgs(oFixture.bSkipRefresh, "$auto");
				oBindingMock.expects("lockGroup").withExactArgs("$auto")
					.exactly(oFixture.bRefreshSingle ? 1 : 0)
					.returns(oGroupLock1);
				oBindingMock.expects("refreshSingle")
					.withExactArgs(sinon.match(function (oContext0) {
						return oContext0 === oContext
							&& oContext0.getPath() === "/EMPLOYEES(ID=42)";
					}), sinon.match.same(oGroupLock1))
				.exactly(oFixture.bRefreshSingle ? 1 : 0)
					.returns(SyncPromise.resolve(oRefreshedEntity));
			});

			// code under test
			oContext = oBinding.create("~oInitialData~", oFixture.bSkipRefresh);

			return oContext.created();
		});
	});

	//*********************************************************************************************
	[undefined, "('bar')"].forEach(function (sPredicate) {
		var sTitle = "create: relative binding, predicate: " + sPredicate;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("TEAM_2_EMPLOYEES",
					Context.create(this.oModel, oParentBinding, "/TEAMS/1", 1)),
				oBindingMock = this.mock(oBinding),
				aCacheResult = [{}, {}, {"@$ui5._" : {predicate : "('foo')"}}, {}],
				oContext,
				oContext2 = Context.create(this.oModel, oParentBinding, "/TEAMS/2", 2),
				aContexts,
				oContextMock = this.mock(oContextPrototype),
				oCreatedEntity = {},
				oCreateGroupLock = {},
				oCreateInCachePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)),
				oCreatePathPromise = {},
				oFetchDataGroupLock = {unlock : function () {}},
				oHelperMock = this.mock(_Helper),
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
			oHelperMock.expects("isDataAggregation")
				.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
			oBindingMock.expects("getUpdateGroupId").withExactArgs().returns("~update~");
			oBindingMock.expects("lockGroup")
				.withExactArgs("~update~", true, true, sinon.match.func)
				.returns(oCreateGroupLock);
			oBindingMock.expects("createInCache")
				.withExactArgs(sinon.match.same(oCreateGroupLock),
					sinon.match.same(oCreatePathPromise), "/TEAMS/1/TEAM_2_EMPLOYEES",
					sinon.match(rTransientPredicate), {}, false, sinon.match.func,
					sinon.match.func)
				.returns(oCreateInCachePromise);
			oCreateInCachePromise.then(function () {
				oHelperMock.expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "predicate")
					.returns(sPredicate);
				oBindingMock.expects("adjustPredicate").exactly(sPredicate ? 1 : 0)
					.withExactArgs(sinon.match(rTransientPredicate), sPredicate,
						sinon.match.same(oContext));
				that.mock(that.oModel).expects("checkMessages").exactly(sPredicate ? 1 : 0)
					.withExactArgs();
				oHelperMock.expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oCreatedEntity), "deepCreate")
					.returns(false);
				oBindingMock.expects("getGroupId").withExactArgs().returns("$auto");
				oBindingMock.expects("lockGroup").withExactArgs("$auto").returns(oRefreshGroupLock);
				oBindingMock.expects("refreshSingle")
					.withExactArgs(sinon.match.same(oContext), sinon.match.same(oRefreshGroupLock))
					.returns(oRefreshPromise);
			});
			oContextMock.expects("fetchValue").withExactArgs().resolves({});

			// code under test
			oContext = oBinding.create();

			aCacheResult.unshift({/*transient element*/});
			oBindingMock.expects("lockGroup").withExactArgs().returns(oFetchDataGroupLock);
			this.mock(oFetchDataGroupLock).expects("unlock").withExactArgs();
			oContextMock.expects("fetchValue")
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

			return oContext.created().then(function () {
				oBindingMock.expects("checkSuspended").withExactArgs(true);
				oBindingMock.expects("reset").withExactArgs(undefined, true);
				oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext2));
				oBindingMock.expects("restoreCreated").withExactArgs();

				oBinding.setContext(oContext2);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("create: relative binding not yet resolved", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES");

		// code under test
		assert.throws(function () {
			oBinding.create();
		}, new Error("Binding is unresolved: " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("create: bAtEnd & suspended", function (assert) {
		var oBinding = this.bindList("/TEAMS"),
			oError = new Error("suspended");

		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
		this.mock(_Helper).expects("isDataAggregation").never();

		// code under test
		assert.throws(function () {
			oBinding.create();
		}, oError);

		assert.strictEqual(oBinding.bFirstCreateAtEnd, undefined);
	});

	//*********************************************************************************************
	QUnit.test("create: missing $$ownRequest", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES", {
				getPath : function () { return "/TEAMS('1')"; }
			});

		this.mock(oBinding).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("$auto");

		assert.throws(function () {
			// code under test
			oBinding.create({}, false, false, true);
		}, new Error("Missing $$ownRequest at " + oBinding));

		assert.strictEqual(oBinding.bFirstCreateAtEnd, undefined);
	});

	//*********************************************************************************************
	QUnit.test("create: inactive row in transient binding", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES", {
				getPath : function () { return "/TEAMS('1')"; }
			});

		this.mock(oBinding).expects("isTransient").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDeepCreate").withExactArgs();

		assert.throws(function () {
			// code under test
			oBinding.create({}, false, false, /*bInactive*/true);
		}, new Error("Must not create an inactive context in a deep create: " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("create: $$aggregation", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(true);

		assert.throws(function () {
			// code under test
			oBinding.create();
		}, new Error("Cannot create in " + oBinding + " when using data aggregation"));
	});

	//*********************************************************************************************
	QUnit.test("create: failure", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext,
			oCreatePathPromise = {},
			oError = new Error(),
			oCreatePromise = SyncPromise.resolve(Promise.reject(oError)),
			oGroupLock = {unlock : function () {}};

		oBindingMock.expects("getUpdateGroupId").withExactArgs().returns("~update~");
		oBindingMock.expects("lockGroup").withExactArgs("~update~", true, true, sinon.match.func)
			.returns(oGroupLock);
		oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
		oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oCreatePathPromise),
				"/EMPLOYEES", sinon.match(rTransientPredicate), {}, false, sinon.match.func,
				sinon.match.func)
			.returns(oCreatePromise);
		this.mock(oContextPrototype).expects("fetchValue").withExactArgs().resolves({});

		oBindingMock.expects("refreshSingle").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		oContext = oBinding.create();

		return oContext.created().then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bTransient) {
	[ // [first call, second call]
		[false, false],
		[true, true],
		[false, true],
		[true, false], // not allowed
		[undefined, true],
		[true, undefined] // not allowed
	].forEach(function (aAtEnd) {
		var sTitle = "create: position: " + (aAtEnd[1] ? "END" : "START") + "_OF_"
			+ (aAtEnd[0] ? "END" : "START") + ", bTransient=" + bTransient;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindList("/EMPLOYEES"),
				oBindingMock = this.mock(oBinding),
				oContext0,
				oContext1,
				oContextMock = this.mock(Context),
				oError = new Error(),
				oCreateInCachePromise0 = SyncPromise.resolve(bTransient
					? Promise.reject(oError)
					: Promise.resolve({})),
				oCreateInCachePromise1 = SyncPromise.resolve(bTransient
					? Promise.reject(oError)
					: Promise.resolve({})),
				oCreatePathMatcher = sinon.match(function (oPromise) {
					return oPromise.getResult() === "EMPLOYEES";
				}),
				oElement0 = {},
				oElement1 = {},
				oGroupLock = {unlock : function () {}},
				oHelperMock = this.mock(_Helper),
				oModelMock = this.mock(this.oModel),
				oNewContext0 = {
					created : function () {},
					fetchValue : function () {},
					getPath : function () {},
					setSelected : mustBeMocked,
					updateAfterCreate : function () {}
				},
				oNewContext1 = {
					created : function () {},
					fetchValue : function () {},
					getPath : function () {},
					setSelected : mustBeMocked,
					updateAfterCreate : function () {}
				},
				bNotAllowed = aAtEnd[0] && !aAtEnd[1],
				fnReporter0 = sinon.spy(),
				fnReporter1 = sinon.spy();

			oBinding.oContext = "~oParentContext~";
			oBinding.aContexts.push("~oContext~");
			oBinding.bLengthFinal = true;
			oBinding.iMaxLength = 0;
			oBindingMock.expects("getUpdateGroupId").twice()
				.withExactArgs().returns("~update~");
			oBindingMock.expects("isTransient").atLeast(3).withExactArgs().returns(bTransient);
			oBindingMock.expects("checkDeepCreate").exactly(bTransient ? 2 : 0).withExactArgs();
			oBindingMock.expects("lockGroup").exactly(bNotAllowed ? 1 : 2)
				.withExactArgs("~update~", true, true, sinon.match.func)
				.returns(oGroupLock);
			oBindingMock.expects("createInCache")
				.withExactArgs(sinon.match.same(oGroupLock), oCreatePathMatcher, "/EMPLOYEES",
					sinon.match(rTransientPredicate), {},
					sinon.match(function (bAtEndOfCreated) {
						return bAtEndOfCreated === (oBinding.bFirstCreateAtEnd !== !!aAtEnd[0]);
					}), sinon.match.func, sinon.match.func)
				.returns(oCreateInCachePromise0);
			oContextMock.expects("create")
				.withExactArgs(sinon.match.same(oBinding.oModel),
					sinon.match.same(oBinding), sinon.match.string, -oBinding.iCreatedContexts - 1,
					sinon.match.instanceOf(SyncPromise), undefined)
				.callsFake(function () {
					oNewContext0.oCreatedPromise = Promise.resolve(arguments[4]);
					return oNewContext0;
				});
			this.mock(oBinding.oHeaderContext).expects("isSelected").exactly(bNotAllowed ? 1 : 2)
				.withExactArgs().returns("~selected~");
			this.mock(oNewContext0).expects("setSelected").withExactArgs("~selected~");
			this.mock(oNewContext0).expects("created").exactly(bTransient ? 1 : 0)
				.withExactArgs()
				.callsFake(function () {
					return oNewContext0.oCreatedPromise;
				});
			oModelMock.expects("getReporter").exactly(bTransient ? 1 : 0)
				.withExactArgs().returns(fnReporter0);
			this.mock(oNewContext0).expects("fetchValue").withExactArgs().resolves(oElement0);
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oElement0), "context",
					sinon.match.same(oNewContext0));
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oElement0), "firstCreateAtEnd",
					sinon.match(function (bArgs) {
						return oBinding.bFirstCreateAtEnd === bArgs;
					}));
			this.mock(oNewContext0).expects("updateAfterCreate").exactly(bTransient ? 0 : 1)
				.withExactArgs(true, "$auto");

			// code under test
			oContext0 = oBinding.create(undefined, true, aAtEnd[0]);

			assert.strictEqual(oContext0, oNewContext0);
			assert.strictEqual(oBinding.bFirstCreateAtEnd, !!aAtEnd[0]);
			assert.strictEqual(oBinding.iActiveContexts, 1);

			if (bNotAllowed) {
				assert.throws(function () {
					// code under test
					oBinding.create(undefined, true, aAtEnd[1]);
				}, new Error("Cannot create at the start after creation at end"));

				assert.strictEqual(oBinding.iActiveContexts, 1); // unchanged
			} else {
				oBindingMock.expects("createInCache")
					.withExactArgs(sinon.match.same(oGroupLock),
						oCreatePathMatcher, "/EMPLOYEES",
						sinon.match(rTransientPredicate), {},
						sinon.match(function (bAtEndOfCreated) {
							return bAtEndOfCreated
								=== (oBinding.bFirstCreateAtEnd !== !!aAtEnd[1]);
						}), sinon.match.func, sinon.match.func)
					.returns(oCreateInCachePromise1);
				oContextMock.expects("create")
					.withExactArgs(sinon.match.same(oBinding.oModel),
						sinon.match.same(oBinding), sinon.match.string,
						-oBinding.iCreatedContexts - 1, sinon.match.instanceOf(SyncPromise),
						undefined)
					.callsFake(function () {
						oNewContext1.oCreatedPromise = Promise.resolve(arguments[4]);
						return oNewContext1;
					});
				this.mock(oNewContext1).expects("setSelected").withExactArgs("~selected~");
				this.mock(oNewContext1).expects("created").exactly(bTransient ? 1 : 0)
					.withExactArgs()
					.callsFake(function () {
						return oNewContext1.oCreatedPromise;
					});
				oModelMock.expects("getReporter").exactly(bTransient ? 1 : 0)
					.withExactArgs().returns(fnReporter1);
				this.mock(oNewContext1).expects("fetchValue").withExactArgs().resolves(oElement1);
				oHelperMock.expects("setPrivateAnnotation")
					.withExactArgs(sinon.match.same(oElement1), "context",
						sinon.match.same(oNewContext1));
				oHelperMock.expects("setPrivateAnnotation")
					.withExactArgs(sinon.match.same(oElement1), "firstCreateAtEnd",
						sinon.match(function (bArgs) {
							return oBinding.bFirstCreateAtEnd === bArgs;
						}));
				this.mock(oNewContext1).expects("updateAfterCreate")
					.exactly(bTransient ? 0 : 1)
					.withExactArgs(true, "$auto");

				// code under test
				oContext1 = oBinding.create(undefined, true, aAtEnd[1]);

				assert.strictEqual(oContext1, oNewContext1);

				assert.strictEqual(oBinding.iCreatedContexts, 2);

				if (aAtEnd[0] === aAtEnd[1]) { // START_OF_START, END_OF_END
					assert.deepEqual(oBinding.aContexts[0], oContext1);
					assert.deepEqual(oBinding.aContexts[1], oContext0);
				} else { // END_OF_START (fresh element is inserted at end of created, recalc index)
					assert.deepEqual(oBinding.aContexts[0], oContext0);
					assert.deepEqual(oBinding.aContexts[1], oContext1);
					assert.deepEqual(oBinding.aContexts[0].iIndex, -2);
					assert.deepEqual(oBinding.aContexts[1].iIndex, -1);
				}
				assert.deepEqual(oBinding.aContexts[2], "~oContext~");
			}

			return Promise.all([
				oCreateInCachePromise0.catch(function () {}),
				oCreateInCachePromise1.catch(function () {})
			]).then(function () {
				if (bTransient) {
					sinon.assert.calledOnceWithExactly(fnReporter0, sinon.match.same(oError));
					if (!bNotAllowed) {
						sinon.assert.calledOnceWithExactly(fnReporter1, sinon.match.same(oError));
					}
				}
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("create: fetchValue returns undefined", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext,
			oCreatePathMatcher = sinon.match(function (oPromise) {
				return oPromise.getResult() === "EMPLOYEES";
			}),
			oGroupLock = {unlock : function () {}},
			oNewContext = {
				created : function () {},
				fetchValue : function () {},
				getPath : function () { return ""; },
				setSelected : mustBeMocked,
				refreshDependentBindings : function () {}
			};

		oBindingMock.expects("getUpdateGroupId")
			.withExactArgs().returns("~update~");
		oBindingMock.expects("lockGroup")
			.withExactArgs("~update~", true, true, sinon.match.func)
			.returns(oGroupLock);
		oBindingMock.expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock), oCreatePathMatcher, "/EMPLOYEES",
				sinon.match(rTransientPredicate), {}, false, sinon.match.func, sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve({})));
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel),
				sinon.match.same(oBinding), sinon.match.string, -oBinding.iCreatedContexts - 1,
				sinon.match.instanceOf(SyncPromise), undefined)
			.returns(oNewContext);
		this.mock(oBinding.oHeaderContext).expects("isSelected")
			.withExactArgs().returns("~selected~");
		this.mock(oNewContext).expects("setSelected").withExactArgs("~selected~");
		this.mock(oNewContext).expects("fetchValue").withExactArgs().resolves(undefined);
		this.mock(_Helper).expects("setPrivateAnnotation").never();

		// code under test
		oContext = oBinding.create(undefined, true, false);

		return oContext.created();
	});

	//*********************************************************************************************
	QUnit.test("create: bAtEnd without $count", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext,
			sError = "Must know the final length to create at the end. Consider setting $count";

		this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();

		assert.throws(function () {
			// code under test
			oBinding.create(undefined, true, true);
		}, new Error(sError));

		oBinding.createContexts(3, createData(3, 0, true)); // simulate a read

		assert.throws(function () {
			// code under test
			oBinding.create(undefined, true, true);
		}, new Error(sError));

		oBinding.createContexts(6, createData(1, 3, true, 1)); // simulate a short read
		this.mock(oBinding).expects("createInCache")
			.returns(SyncPromise.resolve(Promise.resolve({})));
		this.mock(oContextPrototype).expects("fetchValue").withExactArgs().resolves({});

		// code under test
		oContext = oBinding.create(undefined, true, true);

		oBinding = this.bindList("TEAM_2_EMPLOYEES",
			Context.create(this.oModel, oParentBinding, "/TEAMS('42')"));
		this.mock(oBinding).expects("checkSuspended").withExactArgs();

		assert.throws(function () {
			// code under test
			oBinding.create(undefined, true, true);
		}, new Error(sError));

		oBinding = this.bindList("TEAM_2_EMPLOYEES",
			this.oModel.createBindingContext("/TEAMS('42')"));
		this.mock(oBinding).expects("checkSuspended").withExactArgs();

		assert.throws(function () {
			// code under test
			oBinding.create(undefined, true, true);
		}, new Error(sError));

		return oContext.created();
	});

	//*********************************************************************************************
	QUnit.test("create: bAtEnd with $count, but before read", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, null, null, {$count : true}),
			oContext0,
			oContext1,
			oContext2;

		this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
		this.mock(oBinding).expects("createInCache").thrice()
			.returns(SyncPromise.resolve(Promise.resolve({})));
		this.mock(oContextPrototype).expects("fetchValue").thrice().withExactArgs().resolves({});

		// code under test
		oContext0 = oBinding.create(undefined, true, true);
		oContext1 = oBinding.create(undefined, true, true);
		oContext2 = oBinding.create(undefined, true, true);

		assert.strictEqual(oBinding.getModelIndex(0), 2);
		assert.strictEqual(oBinding.getModelIndex(1), 1);
		assert.strictEqual(oBinding.getModelIndex(2), 0);

		return Promise.all([
			oContext0.created(),
			oContext1.created(),
			oContext2.created()
		]);
	});

	//*********************************************************************************************
	QUnit.test("create: recursive hierarchy, restrictions not met", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};

		assert.throws(function () {
			// code under test
			oBinding.create();
		}, new Error("Missing bSkipRefresh"));

		assert.throws(function () {
			// code under test
			oBinding.create(null, true, false);
		}, new Error("Only the parameters oInitialData and bSkipRefresh are supported"));

		assert.throws(function () {
			// code under test
			oBinding.create(null, true, undefined, undefined);
		}, new Error("Only the parameters oInitialData and bSkipRefresh are supported"));

		assert.throws(function () {
			// code under test
			oBinding.create({"@$ui5.node.parent" : oBinding.getHeaderContext()}, true);
		}, new Error("Invalid parent context: /EMPLOYEES"));

		const oParentContext = {
				isExpanded : mustBeMocked,
				toString : function () { return "~toString~"; } // cannot be mocked?
			};
		this.mock(oParentContext).expects("isExpanded").withExactArgs().returns(false);
		oBinding.aContexts.push(oParentContext);

		assert.throws(function () {
			// code under test
			oBinding.create({"@$ui5.node.parent" : oParentContext}, true);
		}, new Error("Unsupported collapsed parent: ~toString~"));
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bExpanded) {
	QUnit.test("create: recursive hierarchy, parent expanded : " + bExpanded, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		oBinding.iMaxLength = 42;
		this.mock(oBinding).expects("fetchResourcePath").withExactArgs()
			.returns("~oCreatePathPromise~");
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs()
			.returns("~sGroupId~");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs()
			.returns("~sResolvedPath~");
		this.mock(_Helper).expects("uid").withExactArgs().returns("id-1-23");
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
		this.mock(oBinding).expects("isTransient").twice().withExactArgs().returns(false);
		this.mock(oBinding).expects("checkDeepCreate").never();
		this.mock(oBinding).expects("isRelative").never();
		const oParentContext = {
				getCanonicalPath : mustBeMocked,
				isExpanded : mustBeMocked
			};
		oBinding.aContexts.push("0", "1", oParentContext, {iIndex : 3}, undefined, {iIndex : 5});
		const oInitialData = {"@$ui5.node.parent" : oParentContext};
		const oEntityData = {};
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(oInitialData), true).returns(oEntityData);
		this.mock(oParentContext).expects("getCanonicalPath").withExactArgs()
			.returns("/canonical/path");
		this.mock(oParentContext).expects("isExpanded").withExactArgs().returns(bExpanded);
		this.mock(oBinding).expects("lockGroup")
			.withExactArgs("~sGroupId~", true, true, sinon.match.func).returns("~oGroupLock~");
		this.mock(oBinding).expects("createInCache")
			.withExactArgs("~oGroupLock~", "~oCreatePathPromise~", "~sResolvedPath~",
				sinon.match(rTransientPredicate),
				sinon.match.same(oEntityData)
					.and(sinon.match({"@$ui5.node.parent" : "canonical/path"})),
				false, sinon.match.func, sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve("~oCreatedEntity~")));
		const oContext = {fetchValue : mustBeMocked, setSelected : mustBeMocked};
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"~sResolvedPath~($uid=id-1-23)", /*iChildIndex*/3,
				sinon.match.instanceOf(SyncPromise), undefined)
			.returns(oContext);
		this.mock(oBinding.oHeaderContext).expects("isSelected")
			.withExactArgs().returns("~selected~");
		this.mock(oContext).expects("setSelected").withExactArgs("~selected~");
		this.mock(oContext).expects("fetchValue").withExactArgs()
			.returns(SyncPromise.resolve()); //TODO
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Add});

		// code under test
		assert.strictEqual(oBinding.create(oInitialData, true), oContext);

		assert.strictEqual(oBinding.iActiveContexts, 0, "unchanged");
		assert.strictEqual(oBinding.iCreatedContexts, 0, "unchanged");
		assert.strictEqual(oBinding.bFirstCreateAtEnd, false);
		assert.strictEqual(oBinding.iMaxLength, 43);
		assert.deepEqual(oBinding.aContexts,
			["0", "1", oParentContext, oContext, {iIndex : 4}, undefined, {iIndex : 6}]);
	});
});

	//*********************************************************************************************
[undefined, {"@$ui5.node.parent" : null}].forEach(function (oInitialData, i) {
	QUnit.test("create: recursive hierarchy, root #" + i, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {expandTo : 2, hierarchyQualifier : "X"};
		oBinding.iMaxLength = 42;
		this.mock(oBinding).expects("fetchResourcePath").withExactArgs()
			.returns("~oCreatePathPromise~");
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs()
			.returns("~sGroupId~");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs()
			.returns("~sResolvedPath~");
		this.mock(_Helper).expects("uid").withExactArgs().returns("id-1-23");
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
		this.mock(oBinding).expects("isTransient").twice().withExactArgs().returns(false);
		this.mock(oBinding).expects("checkDeepCreate").never();
		this.mock(oBinding).expects("isRelative").never();
		oBinding.aContexts.push({iIndex : 0}, undefined, {iIndex : 2});
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(oInitialData), true).returns("~oEntityData~");
		this.mock(oBinding).expects("lockGroup")
			.withExactArgs("~sGroupId~", true, true, sinon.match.func).returns("~oGroupLock~");
		this.mock(oBinding).expects("createInCache")
			.withExactArgs("~oGroupLock~", "~oCreatePathPromise~", "~sResolvedPath~",
				sinon.match(rTransientPredicate), "~oEntityData~",
				false, sinon.match.func, sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve("~oCreatedEntity~")));
		const oContext = {fetchValue : mustBeMocked, setSelected : mustBeMocked};
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"~sResolvedPath~($uid=id-1-23)", /*iChildIndex*/0,
				sinon.match.instanceOf(SyncPromise), undefined)
			.returns(oContext);
		this.mock(oBinding.oHeaderContext).expects("isSelected")
			.withExactArgs().returns("~selected~");
		this.mock(oContext).expects("setSelected").withExactArgs("~selected~");
		this.mock(oContext).expects("fetchValue").withExactArgs()
			.returns(SyncPromise.resolve()); //TODO
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Add});

		// code under test
		assert.strictEqual(oBinding.create(oInitialData, true), oContext);

		assert.strictEqual(oBinding.iActiveContexts, 0, "unchanged");
		assert.strictEqual(oBinding.iCreatedContexts, 0, "unchanged");
		assert.strictEqual(oBinding.bFirstCreateAtEnd, false);
		assert.strictEqual(oBinding.iMaxLength, 43);
		assert.deepEqual(oBinding.aContexts,
			[oContext, {iIndex : 1}, undefined, {iIndex : 3}]);
	});
});

	//*********************************************************************************************
	QUnit.test("create and delete with bAtEnd varying", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext1,
			oContext2,
			oExpectation,
			oGroupLock = {getGroupId : function () { return "$auto"; }};

		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 0;
		oExpectation = oBindingMock.expects("lockGroup").atLeast(1).returns({});
		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
		this.mock(oContextPrototype).expects("fetchValue").atLeast(1).withExactArgs().resolves({});
		oBindingMock.expects("refreshSingle").atLeast(1).returns(SyncPromise.resolve());

		// code under test
		oBinding.create(undefined, false, /*bAtEnd*/true);

		// code under test - cancel the creation (via the group lock from the create)
		oExpectation.args[0][3]();

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oContext1 = oBinding.create(undefined, false, /*bAtEnd*/false);

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test - create a second entity without bAtEnd
		oContext2 = oBinding.create(undefined);

		this.mock(oContext1).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oContext1).expects("doDelete")
			.callsArgWith(5, 0, -1) // the callback removing the context
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.delete(oGroupLock, "~", oContext1);

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oBinding.create(undefined, false, /*bAtEnd*/true);

		this.mock(oContext2).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oContext2).expects("doDelete")
			.callsArgWith(5, 0, -1) // the callback removing the context
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.delete(oGroupLock, "~", oContext2);

		oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

		// code under test
		oBinding.create(undefined);
	});

	//*********************************************************************************************
	QUnit.test("create at the start after creation at end, delete in between", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oContext1,
			oContext2,
			oDeletePromise,
			oGroupLock = {getGroupId : function () { return "$auto"; }};

		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 0;
		this.mock(oContextPrototype).expects("fetchValue").atLeast(1).withExactArgs().resolves({});
		oBindingMock.expects("refreshSingle").atLeast(1).returns(SyncPromise.resolve());

		oBindingMock.expects("createInCache").twice().returns(SyncPromise.resolve({}));

		// code under test
		oContext1 = oBinding.create(undefined, false, /*bAtEnd*/true);
		oContext2 = oBinding.create(undefined, false, /*bAtEnd*/true);

		this.mock(oContext1).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oContext1).expects("doDelete")
			.withArgs(sinon.match.same(oGroupLock), "~1")
			.callsArgWith(5, 0, -1) // the callback removing the context
			.returns(SyncPromise.resolve(Promise.resolve()));
		this.mock(oContext2).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oContext2).expects("doDelete")
			.withArgs(null, "~2")
			.callsArgWith(5, 0, -1) // the callback removing the context
			.returns(SyncPromise.resolve(Promise)); // finish immediately

		// code under test
		oDeletePromise = oBinding.delete(oGroupLock, "~1", oContext1);
		oBinding.delete(null, "~2", oContext2);

		assert.throws(function () {
			// code under test - as long as a reinsertion is possible, bAtEnd must not be changed
			oBinding.create(undefined, false, /*bAtEnd*/false);
		}, new Error("Cannot create at the start after creation at end"));

		return oDeletePromise.then(function () {
			oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));

			// code under test
			oBinding.create(undefined, false, /*bAtEnd*/false);
		});
	});

	//*********************************************************************************************
	QUnit.test("delete transient entity", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			fnDeleteFromCache = oBinding.deleteFromCache,
			oContext;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, createData(3, 0, true, 3));

		// remove request mock, all operations on client
		oBinding.oCachePromise.getResult().oRequestor.request.restore();

		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Add});
		oBindingMock.expects("getUpdateGroupId").returns("update");

		oContext = oBinding.create();
		assert.strictEqual(oBinding.iCreatedContexts, 1);
		assert.strictEqual(oBinding.getLength(), 4);

		// avoid "Uncaught (in promise)"
		oContext.created().catch(function (oError) {
			assert.ok(oError.canceled, "create promise rejected with 'canceled'");
		});
		this.mock(oContext).expects("doSetSelected").withExactArgs(false);
		this.mock(oBinding).expects("removeCreated").withExactArgs(sinon.match.same(oContext))
			.callThrough();
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
	QUnit.test("getEntryKey", function (assert) {
		var oContext = {
				getPath : function () {
					return "/some/path";
				}
			};

		// code under test
		// Note: not really an instance method
		assert.strictEqual(ODataListBinding.prototype.getEntryKey(oContext), "/some/path");
	});

	//*********************************************************************************************
	QUnit.test("getEntryData", function (assert) {
		var oContext = {
				getValue : function () {
					return "~oValue~";
				}
			};

		this.mock(_Helper).expects("publicClone")
			.withExactArgs("~oValue~", false, true).returns("~oClone~");

		// code under test
		// Note: not really an instance method
		assert.strictEqual(ODataListBinding.prototype.getEntryData(oContext), "~oClone~");
	});

	//*********************************************************************************************
[false, true].forEach((bHasPreviousData) => {
	QUnit.test(`getDiff: w/ previous data = ${bHasPreviousData}`, function (assert) {
		var oBinding = this.bindList("EMPLOYEE_2_EQUIPMENTS",
				Context.create(this.oModel, oParentBinding, "/EMPLOYEES/0")),
			oBindingMock = this.mock(oBinding),
			aContexts = [{}, {}],
			aDiff = [],
			aPreviousData = [];

		oBinding.aPreviousData = bHasPreviousData ? aPreviousData : null;
		oBindingMock.expects("getContextsInViewOrder")
			.withExactArgs(0, 50).returns(aContexts);
		oBindingMock.expects("getContextData").withExactArgs(sinon.match.same(aContexts[0]))
			.returns("~data~0");
		oBindingMock.expects("getContextData").withExactArgs(sinon.match.same(aContexts[1]))
			.returns("~data~1");
		oBindingMock.expects("diffData").exactly(bHasPreviousData ? 1 : 0)
			.withExactArgs(sinon.match.same(aPreviousData), ["~data~0", "~data~1"])
			.returns(aDiff);

		// code under test
		assert.strictEqual(oBinding.getDiff(50), bHasPreviousData ? aDiff : null);

		assert.deepEqual(oBinding.aPreviousData, ["~data~0", "~data~1"]);
	});
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
					sResolvedPath
						= bRelative ? "/BusinessPartnerList('42')/BP_2_SO" : "/SalesOrderList";

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
	QUnit.test("fetchFilter: Filter.NONE", function (assert) {
		const oBinding = this.bindList("/SalesOrderList");

		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs(sinon.match.same(oBinding.aFilters),
				sinon.match.same(oBinding.aApplicationFilters))
			.returns(Filter.NONE);

		assert.deepEqual(
			oBinding.fetchFilter("~oContext~", "~sStaticFilter~").getResult(),
			["false"]);
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
			filters : [{p : "path0", v : "foo"}, "path1", {p : "path0", v : "bar"}],
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
				p0 : "Type0",
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
				p0 : "Type0",
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
				p0 : "Type0",
				"p0/p1" : "Edm.String",
				"p0/p2" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters : [
						new Filter("v0/p1", FilterOperator.EQ, "value1"),
						new Filter("v0/p2", FilterOperator.EQ, "value2")
					],
					and : true
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
				p0 : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p2" : "Edm.String",
				"p0/p3" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters : [
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
				p0 : "Type0",
				"p0/p1" : "Type1",
				"p0/p1/p3" : "Edm.String",
				"p0/p2" : "Type2",
				"p0/p2/p4" : "Edm.String"
			},
			filter : new Filter({
				condition : new Filter({
					filters : [
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
				p0 : "Type0",
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
		filters : ["p1=v1", {or : ["p1=v2", "p1=v3"]}],
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
		new Filter("b", FilterOperator.EQ, "before")
	],
	staticFilter : "c eq 47",
	result : ["(a eq 1 or a eq 2) and (c eq 47)", "b eq 'before'"]
}, {
	split : [new Filter("a", FilterOperator.GT, 42), new Filter("b", FilterOperator.EQ, "before")],
	result : ["a gt 42", "b eq 'before'"]
}].forEach(function (oFixture, i) {
	QUnit.test("fetchFilter: list binding aggregates data " + i, function (assert) {
		var oAggregation = {},
			oBinding = this.bindList("Set"),
			oContext = {},
			oFilter = {/*any filter*/},
			oMetaModelMock = this.mock(this.oModel.oMetaModel);

		oBinding.mParameters.$$aggregation = oAggregation;

		this.mock(FilterProcessor).expects("combineFilters").returns(oFilter);
		this.mock(_AggregationHelper).expects("splitFilter")
			.withExactArgs(sinon.match.same(oFilter), sinon.match.same(oAggregation))
			.returns(oFixture.split);
		this.mock(this.oModel).expects("resolve").withExactArgs("Set", sinon.match.same(oContext))
			.returns("~");
		oMetaModelMock.expects("getMetaContext").withExactArgs("~").returns("oMetaContext");
		oMetaModelMock.expects("resolve").withExactArgs("a", "oMetaContext").atLeast(0)
			.returns("/resolved/a");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/a").atLeast(0)
			.returns(Promise.resolve({$Type : "Edm.Decimal"}));
		oMetaModelMock.expects("resolve").withExactArgs("b", "oMetaContext").atLeast(0)
			.returns("/resolved/b");
		oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/b").atLeast(0)
			.returns(Promise.resolve({$Type : "Edm.String"}));

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
[false, true].forEach(function (bChanged) {
	QUnit.test("doFetchOrGetQueryOptions: meta path changed = " + bChanged, function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
			oContext = {
				getPath : function () {}
			},
			mMergedQueryOptions = {},
			mResolvedQueryOptions = {$filter : "staticFilter", $orderby : "staticSorter"},
			oQueryOptionsPromise;

		assert.strictEqual(oBinding.oQueryOptionsPromise, undefined);
		if (bChanged) {
			oBinding.oQueryOptionsPromise = {$metaPath : "/different/path"};
		}
		this.mock(oContext).expects("getPath").twice().withExactArgs().returns("/TEAMS('0')");
		this.mock(_Helper).expects("getMetaPath").twice().withExactArgs("/TEAMS('0')")
			.returns("/TEAMS");
		this.mock(oBinding).expects("fetchResolvedQueryOptions")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve(mResolvedQueryOptions));
		this.mock(oBinding).expects("fetchFilter")
			.withExactArgs(sinon.match.same(oContext), "staticFilter")
			.returns(SyncPromise.resolve("resolvedFilter"));
		this.mock(oBinding).expects("getOrderby").withExactArgs("staticSorter")
			.returns("resolvedOrderby");
		this.mock(_Helper).expects("mergeQueryOptions")
			.withExactArgs(sinon.match.same(mResolvedQueryOptions), "resolvedOrderby",
				"resolvedFilter")
			.returns(mMergedQueryOptions);

		// code under test
		oQueryOptionsPromise = oBinding.doFetchOrGetQueryOptions(oContext);

		assert.strictEqual(oBinding.oQueryOptionsPromise, oQueryOptionsPromise);
		assert.strictEqual(oQueryOptionsPromise.getResult(), mMergedQueryOptions);
		assert.strictEqual(oQueryOptionsPromise.$metaPath, "/TEAMS");

		// code under test (promise exists, meta path unchanged)
		assert.strictEqual(oBinding.doFetchOrGetQueryOptions(oContext), oQueryOptionsPromise);

		assert.strictEqual(oBinding.oQueryOptionsPromise, oQueryOptionsPromise);
		assert.strictEqual(oQueryOptionsPromise.$metaPath, "/TEAMS");
	});
});

	//*********************************************************************************************
	QUnit.test("doCreateCache w/ old cache", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oOldCache = {
				$deepResourcePath : "deep/resource/path",
				getResourcePath : function () {},
				reset : function () {},
				// no resetOutOfPlace
				setQueryOptions : function () {}
			},
			aPredicates = ["('0')", "('2')"];

		oBinding.mParameters.$$aggregation = "~$$aggregation~";
		this.mock(oOldCache).expects("getResourcePath").withExactArgs().returns("resource/path");
		this.mock(oBinding).expects("getKeepAlivePredicates").withExactArgs()
			.returns(aPredicates);
		this.mock(oBinding).expects("isGrouped").withExactArgs().returns("~isGrouped~");
		this.mock(oBinding).expects("getGroupId").never();
		this.mock(oOldCache).expects("reset")
			.withExactArgs(sinon.match.same(aPredicates), "myGroup", "~queryOptions~",
				"~$$aggregation~", "~isGrouped~");
		this.mock(_AggregationCache).expects("create").never();

		assert.strictEqual(
			// code under test
			oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~",
				"deep/resource/path", "myGroup", oOldCache),
			oOldCache);
	});

	//*********************************************************************************************
["iCreatedContexts", "iDeletedContexts"].forEach(function (sProperty) {
	QUnit.test("doCreateCache w/ old cache, " + sProperty, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oOldCache = {
				$deepResourcePath : "deep/resource/path",
				getResourcePath : function () {},
				reset : function () {},
				// no resetOutOfPlace
				setQueryOptions : function () {}
			};

		oBinding[sProperty] = 1;
		oBinding.bResetViaSideEffects = true;
		this.mock(oOldCache).expects("getResourcePath").withExactArgs().returns("resource/path");
		this.mock(oBinding).expects("isGrouped").withExactArgs().returns("~isGrouped~");
		this.mock(oOldCache).expects("reset")
			.withExactArgs([], "myGroup", "~queryOptions~", undefined, "~isGrouped~");
		this.mock(_AggregationCache).expects("create").never();

		assert.strictEqual(
			// code under test
			oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~",
				"deep/resource/path", "myGroup", oOldCache),
			oOldCache);
		assert.strictEqual(oBinding.bResetViaSideEffects, undefined);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bResetViaSideEffects) {
	[false, true].forEach(function (bAggregationCache) {
	const sTitle = "doCreateCache w/ old cache, recursive hierarchy, aggregation cache: "
		+ bAggregationCache + ", reset via side effects: " + bResetViaSideEffects;
	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "foo"};
		const oOldCache = {
			$deepResourcePath : "deep/resource/path",
			getResourcePath : mustBeMocked,
			reset : mustBeMocked,
			resetOutOfPlace : mustBeMocked
		};

		oBinding.bResetViaSideEffects = bResetViaSideEffects;

		if (bAggregationCache) {
			Object.setPrototypeOf(oOldCache, _AggregationCache.prototype);
		}
		this.mock(oOldCache).expects("getResourcePath").withExactArgs().returns("resource/path");
		this.mock(oBinding).expects("getKeepAlivePredicates").withExactArgs().returns([]);
		this.mock(oBinding).expects("isGrouped").withExactArgs().returns("~isGrouped~");
		this.mock(oBinding).expects("getGroupId")
			.exactly((bAggregationCache && bResetViaSideEffects) ? 1 : 0)
			.returns("resetGroup");
		this.mock(oOldCache).expects("resetOutOfPlace")
			.exactly((bAggregationCache && bResetViaSideEffects) ? 1 : 0);
		this.mock(oOldCache).expects("reset").exactly(bAggregationCache ? 1 : 0)
			.withExactArgs([], bAggregationCache && bResetViaSideEffects ? "resetGroup" : undefined,
				"~queryOptions~", sinon.match.same(oBinding.mParameters.$$aggregation),
				"~isGrouped~");
		this.mock(oBinding).expects("inheritQueryOptions").exactly(bAggregationCache ? 0 : 1)
			.withExactArgs("~queryOptions~", "~context~")
			.returns("~mInheritedQueryOptions~");
		this.mock(_AggregationCache).expects("create").exactly(bAggregationCache ? 0 : 1)
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "resource/path",
				"deep/resource/path", "~mInheritedQueryOptions~",
				sinon.match.same(oBinding.mParameters.$$aggregation),
				this.oModel.bAutoExpandSelect, false, "~isGrouped~")
			.returns("~oNewCache~");

		assert.strictEqual(
			// code under test
			oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~",
				"deep/resource/path", undefined, oOldCache),
			bAggregationCache ? oOldCache : "~oNewCache~");
		assert.strictEqual(oBinding.bResetViaSideEffects, undefined);
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bWithOld) {
	[false, true].forEach(function (bFromModel) {
		[false, true].forEach(function (bShared) {
			[false, true].forEach(function (bAggregation) {
				var sTitle = (bWithOld
						? "doCreateCache w/ old cache, but w/o kept-alive elements"
						: "doCreateCache w/o old cache")
					+ ", bFromModel=" + bFromModel
					+ ", bShared=" + bShared
					+ ", bAggregation=" + bAggregation;

				if (bAggregation && (!bFromModel || bShared)) {
					return;
				}

	QUnit.test(sTitle, function (assert) {
		var oAggregationCache = {
				addKeptElement : mustBeMocked
			},
			oAggregationCacheMock = this.mock(oAggregationCache),
			oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding),
			oCache = { // #setLateQueryOptions must not be called
				getValue : mustBeMocked,
				registerChangeListener : function () {},
				setActive : mustBeMocked
			},
			oCacheMock = this.mock(oCache),
			oGetExpectation,
			oMoveExpectation,
			oOldCache = {
				$deepResourcePath : "deep/resource/path",
				getResourcePath : function () {}
				// #getLateQueryOptions, #reset, #setQueryOptions must no be called
			};

		this.oModel.bAutoExpandSelect = "~autoExpandSelect~";
		oBinding.bSharedRequest = bShared;
		if (bAggregation) {
			oBinding.mParameters.$$aggregation = {/*hierarchyQualifier : "X"*/};
		}
		if (bWithOld) {
			this.mock(oOldCache).expects("getResourcePath").withExactArgs()
				.returns("resource/path");
			oBindingMock.expects("getKeepAlivePredicates").withExactArgs().returns([]);
		}
		oBindingMock.expects("inheritQueryOptions")
			.withExactArgs("~queryOptions~", "~context~").returns("~mergedQueryOptions~");
		oMoveExpectation = oBindingMock.expects("getCacheAndMoveKeepAliveContexts")
			.withExactArgs("resource/path", "~mergedQueryOptions~")
			.returns(bFromModel ? oCache : undefined);
		if (bFromModel && bAggregation) {
			oGetExpectation = oBindingMock.expects("getKeepAlivePredicates").withExactArgs()
				.returns(["(1)", "(3)"]);
			oCacheMock.expects("getValue").withExactArgs("(1)").returns("~1~");
			oCacheMock.expects("getValue").withExactArgs("(3)").returns("~3~");
			oCacheMock.expects("setActive").withExactArgs(false);
			oAggregationCacheMock.expects("addKeptElement").withExactArgs("~1~");
			oAggregationCacheMock.expects("addKeptElement").withExactArgs("~3~");
		}
		oBindingMock.expects("isGrouped").exactly(bFromModel && !bAggregation ? 0 : 1)
			.withExactArgs().returns("~isGrouped~");
		this.mock(_AggregationCache).expects("create").exactly(bFromModel && !bAggregation ? 0 : 1)
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "resource/path",
				"deep/resource/path", "~mergedQueryOptions~",
				sinon.match.same(oBinding.mParameters.$$aggregation), "~autoExpandSelect~", bShared,
				"~isGrouped~")
			.returns(bAggregation ? oAggregationCache : oCache);
		oCacheMock.expects("registerChangeListener").exactly(bShared ? 1 : 0)
			.withExactArgs("", sinon.match.same(oBinding));

		assert.strictEqual(
			// code under test
			oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~",
				"deep/resource/path", undefined, bWithOld ? oOldCache : undefined),
			bAggregation ? oAggregationCache : oCache);
		if (oGetExpectation) {
			assert.ok(oMoveExpectation.calledBefore(oGetExpectation));
		}
	});
			});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bDeep) {
	var sTitle = "doCreateCache w/ old cache, but wrong " + (bDeep ? "deep " : "")
			+ "resource path";

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {
				registerChangeListener : function () {}
			},
			oOldCache = {
				$deepResourcePath : bDeep ? "W.R.O.N.G." : "deep/resource/path",
				getResourcePath : function () {}
			};

		this.oModel.bAutoExpandSelect = "~autoExpandSelect~";
		oBinding.bSharedRequest = "~sharedRequest~";
		this.mock(oOldCache).expects("getResourcePath").atMost(1).withExactArgs()
			.returns(bDeep ? "resource/path" : "W.R.O.N.G.");
		this.mock(oBinding).expects("getKeepAlivePredicates").never();
		this.mock(oBinding).expects("inheritQueryOptions")
			.withExactArgs("~queryOptions~", "~context~").returns("~mergedQueryOptions~");
		this.mock(oBinding).expects("isGrouped").withExactArgs().returns("~isGrouped~");
		this.mock(_AggregationCache).expects("create")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "resource/path",
				"deep/resource/path", "~mergedQueryOptions~",
				sinon.match.same(oBinding.mParameters.$$aggregation), "~autoExpandSelect~",
				"~sharedRequest~", "~isGrouped~")
			.returns(oCache);

		assert.strictEqual(
			// code under test
			oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~",
				"deep/resource/path", undefined, oOldCache),
			oCache);
	});
});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsFromParameters", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		// code under test
		assert.strictEqual(oBinding.getQueryOptionsFromParameters(), oBinding.mQueryOptions);
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
		mInheritedQueryOptions : {},
		mExpectedQueryOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc"
		}
	}, { // no filter or sort in dynamic query options
		mDynamicQueryOptionsWithModelOptions : {},
		mInheritedQueryOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc"
		},
		mExpectedQueryOptions : {}
	}, { // filter and sort in both dynamic and inherited query options
		mDynamicQueryOptionsWithModelOptions : {
			$filter : "Age lt 60",
			$orderby : "Name asc"
		},
		mInheritedQueryOptions : {
			$filter : "Age gt 20",
			$orderby : "Name desc"
		},
		mExpectedQueryOptions : {
			$filter : "(Age lt 60) and (Age gt 20)",
			$orderby : "Name asc,Name desc"
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("inheritQueryOptions: Test " + i, function (assert) {
			var oBinding = this.bindList("TEAM_2_EMPLOYEES"),
				oContext = {},
				mQueryOptions = {};

			this.mock(oBinding).expects("getQueryOptionsForPath")
				.withExactArgs("", sinon.match.same(oContext))
				.returns(oFixture.mInheritedQueryOptions);
			this.mock(_Helper).expects("merge")
				.withExactArgs({}, sinon.match.same(oFixture.mInheritedQueryOptions),
					oFixture.mExpectedQueryOptions)
				.returns(mQueryOptions);

			// code under test
			assert.strictEqual(oBinding.inheritQueryOptions(
					oFixture.mDynamicQueryOptionsWithModelOptions, oContext),
				mQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("getHeaderContext: created in c'tor", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isResolved").withExactArgs().returns(true);

		// code under test
		assert.ok(oBinding.getHeaderContext());

		oBindingMock.expects("isResolved").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.getHeaderContext(), null);
	});
	//TODO How do dependent bindings learn of the changed context?

	//*********************************************************************************************
	QUnit.test("getHeaderContext: setContext", function (assert) {
		var oBinding = this.bindList("EMPLOYEES"),
			oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 0);

		assert.strictEqual(oBinding.getHeaderContext(), null);
		this.mock(oBinding).expects("checkSuspended").withExactArgs(true);

		// code under test
		oBinding.setContext(oContext);

		assert.deepEqual(oBinding.getHeaderContext(),
			Context.create(this.oModel, oBinding, "/TEAMS/EMPLOYEES"));
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
				},
				search : "covfefe"
			};

		oBinding.mParameters.$$aggregation = {search : "covfefe"};
		this.mock(oBinding).expects("setAggregation").withExactArgs(oTransformedAggregation);

		// code under test
		assert.strictEqual(oBinding.updateAnalyticalInfo(aAggregation), undefined);

		assert.strictEqual(JSON.stringify(aAggregation), sAggregation, "unchanged");

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
			},
			search : undefined
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
			},
			search : undefined
		}
	}, {
		aAggregation : [{
			as : "AvgSalesAmount",
			max : true,
			min : true,
			name : "SalesAmount",
			total : false,
			with : "average"
		}],
		oTransformedAggregation : {
			aggregate : {
				AvgSalesAmount : {
					max : true,
					min : true,
					name : "SalesAmount",
					with : "average"
				}
			},
			group : {},
			search : undefined
		}
	}].forEach(function (oFixture, i) {
		[false, true].forEach(function (bHasMeasureRangePromiseAfterResume) {
			var sTitle = "updateAnalyticalInfo: min/max: " + i
					+ ", has measure range promise after resume: "
					+ bHasMeasureRangePromiseAfterResume;

			QUnit.test(sTitle, function (assert) {
				var sAggregation = JSON.stringify(oFixture.aAggregation),
					oBinding = this.bindList("/EMPLOYEES"),
					mMeasureRange = {},
					oNewCache = {getMeasureRangePromise : function () {}},
					oResult,
					oSetAggregationExpectation;

				oSetAggregationExpectation = this.mock(oBinding).expects("setAggregation")
					.withExactArgs(oFixture.oTransformedAggregation)
					.callsFake(function () {
						assert.strictEqual(oBinding.bHasAnalyticalInfo, true);
					});
				this.mock(oBinding).expects("getRootBindingResumePromise").withExactArgs()
					.callsFake(function () {
						assert.ok(oSetAggregationExpectation.called,
							"setAggregation called before");
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
				assert.ok(oResult.measureRangePromise instanceof Promise);

				return oResult.measureRangePromise.then(function (mMeasureRange0) {
					assert.strictEqual(mMeasureRange0,
						bHasMeasureRangePromiseAfterResume ? mMeasureRange : undefined);
				});
			});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bSameCache) {
	QUnit.test("refreshSingle: bSameCache=" + bSameCache, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {
				refreshSingle : function () {}
			},
			bContextUpdated = false,
			oContext,
			bDependentsRefreshed = false,
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oPromise,
			oRefreshDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			oRefreshSingleExpectation,
			oRefreshSinglePromise = SyncPromise.resolve(Promise.resolve({})),
			oRootBinding = {
				assertSameCache : function () {},
				getGroupId : function () {}
			},
			that = this;

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, createData(3, 0, true, 3));

		oContext = oBinding.aContexts[2];
		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oCache);

		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func)
			.callsArgWith(0, oCache, "path/in/cache", oRootBinding);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
		this.mock(oContext).expects("isKeepAlive").withExactArgs().returns("~keep~alive~");
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
		this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES")
			.returns("~key~predicate~");
		this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
		oRefreshSingleExpectation = this.mock(oCache).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42, "~key~predicate~",
				"~keep~alive~", "~bWithMessages~", sinon.match.func)
			.returns(oRefreshSinglePromise);
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oContext).expects("refreshDependentBindings")
			.withExactArgs("EMPLOYEES('2')", "groupId", false, "~bKeepCacheOnError~")
			.returns(oRefreshDependentsPromise);
		oRefreshSinglePromise.then(function () {
			var oCanceledError = new Error();

			// these must only be called when the cache's refreshSingle is finished
			that.mock(oBinding).expects("fireDataReceived").withExactArgs({data : {}});
			that.mock(oRootBinding).expects("assertSameCache")
				.withExactArgs(sinon.match.same(oCache))
				.callsFake(function () {
					if (!bSameCache) {
						oCanceledError.canceled = true;
						throw oCanceledError;
					}
				});
			that.mock(oContext).expects("checkUpdateInternal").exactly(bSameCache ? 1 : 0)
				.withExactArgs()
				.returns(new SyncPromise(function (resolve) {
					setTimeout(function () {
						bContextUpdated = true;
						resolve();
					});
				}));
			that.mock(oGroupLock).expects("unlock").exactly(bSameCache ? 0 : 1).withExactArgs(true);
			that.mock(oBinding.oModel).expects("reportError").exactly(bSameCache ? 0 : 1)
				.withExactArgs("Failed to refresh entity: " + oContext, sClassName,
					sinon.match.same(oCanceledError));
		});

		// code under test
		oPromise = oBinding.refreshSingle(oContext, oGroupLock, undefined, "~bKeepCacheOnError~",
			"~bWithMessages~");

		assert.strictEqual(oPromise.isFulfilled(), false);

		this.mock(oBinding).expects("fireDataRequested").withExactArgs();

		// code under test - callback fires data requested event
		oRefreshSingleExpectation.firstCall.args[6]();

		return oPromise.then(function () {
			assert.strictEqual(bContextUpdated, bSameCache);
			assert.strictEqual(bDependentsRefreshed, true);
		});
	});
});
	//TODO: within #refreshSingle
	// Eliminate checkUpdate and call refreshInternal with bCheckUpdate=true
	// Find a way to use _Helper.updateExisting in _Cache.refreshSingle to do the
	// notification for the changeListeners, currently it would fail because the lookup
	// for the changeListener fails because of different paths (index versus key predicate)

	//*********************************************************************************************
[true, false].forEach(function (bStillAlive) {
	[true, false].forEach(function (bOnRemoveCalled) {
		[true, false].forEach(function (bCreated) {
			var sTitle = "refreshSingle with allow remove: " + bOnRemoveCalled + ", created: "
				+ bCreated + ", still alive: " + bStillAlive;

			if (bStillAlive && !bOnRemoveCalled) {
				return;
			}

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindList("/EMPLOYEES"),
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
					oRemoveCreatedExpectation,
					oResetKeepAliveExpectation,
					oRootBinding = {
						assertSameCache : function () {},
						getGroupId : function () {}
					},
					that = this;

				// initialize with 6 contexts, bLengthFinal===true and bKeyPredicates===true
				// [-2, -1, 0, 1, 2, undefined, 4, 5]
				oBinding.createContexts(0, createData(3, 0, true, 3, true));
				oBinding.createContexts(4, createData(2, 4, true, 6, true));
				assert.strictEqual(oBinding.iMaxLength, 6);
				// simulate create (but w/o #created promise, @see #doReplaceWith)
				oBinding.aContexts.unshift(
					Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2),
					Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1));
				oBinding.iCreatedContexts = 2;

				oContext = oBinding.aContexts[iIndex];
				oContextMock = this.mock(oContext);
				oBinding.oCache = oCache;
				oBinding.oCachePromise = SyncPromise.resolve(oCache);

				oCacheRequestPromise = SyncPromise.resolve(Promise.resolve().then(function () {
					// fnOnRemove Test
					if (bOnRemoveCalled) {
						oContextMock.expects("getModelIndex").withExactArgs().callThrough();
						oResetKeepAliveExpectation = oContextMock.expects("resetKeepAlive")
							.exactly(bCreated && !bStillAlive ? 1 : 0).withExactArgs(); //TODO order
						oRemoveCreatedExpectation = that.mock(oBinding).expects("removeCreated")
							.exactly(bCreated ? 1 : 0).withExactArgs(sinon.match.same(oContext));
						oContextMock.expects("destroy").exactly(bCreated || bStillAlive ? 0 : 1)
							.withExactArgs();
						that.mock(oBinding).expects("_fireChange")
							.withExactArgs({reason : ChangeReason.Remove});
						if (!bStillAlive) {
							oContextMock.expects("refreshDependentBindings").never();
						}

						// code under test
						oExpectation.firstCall.args[6](bStillAlive);

						if (bCreated) { // removeCreated adjusted aContexts
							if (!bStillAlive) {
								assert.ok(oResetKeepAliveExpectation
									.calledBefore(oRemoveCreatedExpectation));
							}
						} else {
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
						}
					}
					if (!bOnRemoveCalled || bStillAlive) {
						that.mock(oGroupLock).expects("getGroupId").returns("resultingGroupId");
						oContextMock.expects("refreshDependentBindings")
							.withExactArgs("EMPLOYEES('2')", "resultingGroupId", false, undefined)
							.returns(oRefreshDependentsPromise);
					}
				}));

				oContextMock.expects("getPath").returns("/EMPLOYEES('2')");
				this.mock(oBinding).expects("withCache")
					.withExactArgs(sinon.match.func)
					.callsArgWith(0, oCache, "path/in/cache", oRootBinding);
				oContextMock.expects("getModelIndex").withExactArgs().returns(42);
				this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
					.returns("/EMPLOYEES");
				this.mock(_Helper).expects("getRelativePath")
					.withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES")
					.returns("~key~predicate~");
				oExpectation = this.mock(oCache).expects("refreshSingleWithRemove")
					.withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42,
						"~key~predicate~", false, sinon.match.func, sinon.match.func)
					.callsArg(5) //fireDataRequested
					.returns(oCacheRequestPromise);
				this.mock(oBinding).expects("fireDataRequested").withExactArgs();
				this.mock(oBinding).expects("fireDataReceived").withExactArgs({data : {}});
				oContextMock.expects("checkUpdateInternal")
					.exactly(bOnRemoveCalled && !bStillAlive ? 0 : 1).withExactArgs()
					.returns(new SyncPromise(function (resolve) {
						setTimeout(function () {
							bContextUpdated = true;
							resolve();
						});
					}));

				// code under test
				return oBinding.refreshSingle(oContext, oGroupLock, true).then(function () {
					assert.strictEqual(bContextUpdated, !bOnRemoveCalled || bStillAlive);
					assert.strictEqual(bDependentsRefreshed, !bOnRemoveCalled || bStillAlive);
					assert.deepEqual(Object.keys(oBinding.mPreviousContextsByPath),
						bOnRemoveCalled && bStillAlive ? ["/EMPLOYEES('2')"] : []);
				});
			});
		});
	});
});

	//*********************************************************************************************
[
	{index : undefined, stillAlive : false},
	/*{index : undefined, stillAlive : true*} combination is never called*/
	{index : 1, stillAlive : false},
	{index : 1, stillAlive : true}
].forEach(function (oFixture) {
	var sTitle = "refreshSingle with allow remove on a kept-alive context, index = "
		+ oFixture.index + ", stillAlive = " + oFixture.stillAlive;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {
				refreshSingleWithRemove : function () {}
			},
			oCacheRequestPromise,
			oContext = {
				checkUpdateInternal : function () {},
				created : function () { return false; },
				destroy : function () {},
				getModelIndex : function () { return oFixture.index; },
				getPath : function () { return "~context~path~"; },
				isEffectivelyKeptAlive : function () { return true; },
				refreshDependentBindings : function () {}
			},
			oExpectation,
			oGroupLock = {getGroupId : function () {}},
			oRootBinding = {
				assertSameCache : function () {},
				getGroupId : function () {}
			},
			that = this;

		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oCache);

		// simulate current state
		oBinding.aContexts = [{}];
		if (oFixture.index) {
			oBinding.aContexts[oFixture.index] = oContext;
		} else {
			oBinding.mPreviousContextsByPath = {"~context~path~" : oContext};
		}
		oBinding.iMaxLength = 42;

		oCacheRequestPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
			// fnOnRemove Test
			that.mock(oContext).expects("destroy").exactly(oFixture.stillAlive ? 0 : 1)
				.withExactArgs();
			that.mock(oBinding).expects("_fireChange").exactly(oFixture.index ? 1 : 0)
				.withExactArgs({reason : ChangeReason.Remove});

			// code under test
			oExpectation.firstCall.args[6](oFixture.stillAlive);

			assert.strictEqual(oBinding.aContexts.length, 1);
			assert.notOk(1 in oBinding.aContexts);
			assert.strictEqual(oBinding.iMaxLength, oFixture.index ? 41 : 42);

			if (oFixture.stillAlive) {
				assert.strictEqual(oBinding.mPreviousContextsByPath["~context~path~"], oContext);
			} else {
				assert.notOk("~context~path~" in oBinding.mPreviousContextsByPath);
			}
		});

		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func)
			.callsArgWith(0, oCache, "path/in/cache", oRootBinding);
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
			.returns("~header~context~path~");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("~context~path~", "~header~context~path~")
			.returns("~key~predicate~");
		oExpectation = this.mock(oCache).expects("refreshSingleWithRemove")
			.withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", oFixture.index,
				"~key~predicate~", true, sinon.match.func, sinon.match.func)
			.callsArg(5) //fireDataRequested
			.returns(oCacheRequestPromise);
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		this.mock(oBinding).expects("fireDataReceived").withExactArgs({data : {}});

		this.mock(oContext).expects("checkUpdateInternal").exactly(oFixture.stillAlive ? 1 : 0)
			.withExactArgs().resolves();
		this.mock(oGroupLock).expects("getGroupId").exactly(oFixture.stillAlive ? 1 : 0)
			.withExactArgs().returns("groupId");
		this.mock(oContext).expects("refreshDependentBindings").exactly(oFixture.stillAlive ? 1 : 0)
			.withExactArgs("context~path~", "groupId", false, undefined).resolves();

		// code under test
		return oBinding.refreshSingle(oContext, oGroupLock, true);
	});
});

	//*********************************************************************************************
	QUnit.test("refreshSingle, no fireDataReceived if no fireDataRequested", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {
				refreshSingle : function () {}
			},
			oContext,
			oGroupLock = {getGroupId : function () {}};

		// initialize with 3 contexts and bLengthFinal===true
		oBinding.createContexts(0, createData(3, 0, true, 3));

		oContext = oBinding.aContexts[2];
		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oCache);

		this.mock(oBinding).expects("fireDataRequested").never();
		this.mock(oBinding).expects("fireDataReceived").never();

		this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
		// use 0 as an edge case here!
		this.mock(oContext).expects("getModelIndex").withExactArgs().returns(0);
		this.mock(oContext).expects("isKeepAlive").withExactArgs().returns("~keep~alive~");
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES")
			.returns("~key~predicate~");
		this.mock(oCache).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oGroupLock), "", 0, "~key~predicate~", "~keep~alive~",
				undefined, sinon.match.func)
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
				oCache = {refreshSingle : function () {}},
				oContext = {
					getModelIndex : function () {},
					getPath : function () { return "/EMPLOYEES('1')"; },
					isKeepAlive : function () { return "~keep~alive~"; },
					refreshDependentBindings : function () {},
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

			this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
				.returns("/EMPLOYEES");
			this.mock(_Helper).expects("getRelativePath")
				.withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES")
				.returns("~key~predicate~");
			this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
			oExpectation = this.mock(oCache).expects("refreshSingle")
				.withExactArgs(sinon.match.same(oGroupLock), "", 42, "~key~predicate~",
					"~keep~alive~", undefined, sinon.match.func)
				.returns(Promise.reject(oError));
			if (bDataRequested) {
				oExpectation.callsArg(6);
			}
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			this.mock(oContext).expects("refreshDependentBindings")
				.withExactArgs("EMPLOYEES('1')", "groupId", false, "~bKeepCacheOnError~")
				.resolves();
			this.mock(oBinding).expects("fireDataRequested")
				.exactly(bDataRequested ? 1 : 0)
				.withExactArgs();
			this.mock(oBinding).expects("fireDataReceived")
				.exactly(bDataRequested ? 1 : 0)
				.withExactArgs(bDataRequested ? {error : oError} : 0);
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);
			this.mock(this.oModel).expects("reportError")
				.withExactArgs("Failed to refresh entity: Foo", sClassName,
					sinon.match.same(oError));

			// code under test
			return oBinding.refreshSingle(oContext, oGroupLock, false, "~bKeepCacheOnError~")
				.then(function () {
					assert.ok(false);
				}, function (oError0) {
					assert.strictEqual(oError0, oError);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingle: negative model index", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = {
				getModelIndex : function () { return -1; },
				getPath : function () { return "/EMPLOYEES('1')"; },
				isKeepAlive : function () { return "n/a"; },
				toString : function () { return "Foo"; }
			};

		this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func)
			.callsFake(function (fnProcessor) {
				return new SyncPromise(function () {
					fnProcessor(/*oCache*/null, /*sPath*/"n/a", /*oBinding*/null);
				});
			});
		this.mock(oBinding).expects("fireDataRequested").never();
		this.mock(oBinding).expects("fireDataReceived").never();
		this.mock(this.oModel).expects("reportError").never();

		// code under test
		return oBinding.refreshSingle(oContext, "n/a", true)
			.then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0.message,
					"Cannot refresh. Hint: Side-effects refresh in parallel? Foo");
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
	QUnit.test("refreshSingle: bAllowRemoval && bWithMessages", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = {
				getPath : function () { return "n/a"; }
			};

		assert.throws(function () {
			// code under test
			oBinding.refreshSingle(oContext, /*oGroupLock*/null, /*bAllowRemoval*/true,
				/*bKeepCacheOnError*/false, /*bWithMessages*/true);
		}, new Error("Unsupported: bAllowRemoval && bWithMessages"));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bInitial) {
		QUnit.test("resumeInternal: initial=" + bInitial, function (assert) {
			var sChangeReason = {/*Filter,Sort,Refresh,Change*/},
				oContext = Context.create(this.oModel, oParentBinding, "/TEAMS"),
				oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext),
				oBindingMock = this.mock(oBinding),
				oDependent0 = {
					oContext : {
						isEffectivelyKeptAlive : function () {}
					},
					resumeInternal : function () {}
				},
				oDependent1 = {
					oContext : {
						isEffectivelyKeptAlive : function () {}
					},
					resumeInternal : function () {}
				},
				oFetchCacheExpectation,
				oFireExpectation,
				oGetDependentBindingsExpectation,
				oHeaderContextCheckUpdateExpectation,
				oResetExpectation;

			oBinding.bSharedRequest = true; // this must not have an influence
			oBinding.sChangeReason = bInitial ? "AddVirtualContext" : undefined;
			oBinding.sResumeChangeReason = sChangeReason;
			oBindingMock.expects("removeCachesAndMessages").withExactArgs("");
			oResetExpectation = oBindingMock.expects("reset").withExactArgs();
			oFetchCacheExpectation = oBindingMock.expects("fetchCache")
				.withExactArgs(sinon.match.same(oContext), true);
			oBindingMock.expects("refreshKeptElements").never();
			oGetDependentBindingsExpectation = oBindingMock.expects("getDependentBindings")
				.withExactArgs()
				.returns([oDependent0, oDependent1]);
			this.mock(oDependent0.oContext).expects("isEffectivelyKeptAlive").withExactArgs()
				.returns(false);
			this.mock(oDependent0).expects("resumeInternal").withExactArgs(false, true);
			this.mock(oDependent1.oContext).expects("isEffectivelyKeptAlive").withExactArgs()
				.returns(true);
			this.mock(oDependent1).expects("resumeInternal").withExactArgs(false, false);
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
			oHeaderContextCheckUpdateExpectation = this.mock(oBinding.oHeaderContext)
				.expects("checkUpdate").withExactArgs();

			// code under test
			oBinding.resumeInternal(true/*ignored*/);

			assert.strictEqual(oBinding.sResumeChangeReason, undefined);
			assert.ok(oFetchCacheExpectation.calledAfter(oResetExpectation));
			assert.ok(oGetDependentBindingsExpectation.calledAfter(oFetchCacheExpectation));
			assert.ok(oFireExpectation.calledAfter(oGetDependentBindingsExpectation));
			assert.ok(oHeaderContextCheckUpdateExpectation.calledAfter(oFireExpectation));
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
[false, true].forEach(function (bAutoExpandSelect) {
	var sTitle = "resumeInternal: initial binding, bAutoExpandSelect = " + bAutoExpandSelect;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding);

		oBinding.sResumeChangeReason = "~sResumeChangeReason~";
		if (bAutoExpandSelect) {
			oBinding.sChangeReason = "AddVirtualContext";
			oBindingMock.expects("_fireChange").withExactArgs({
				detailedReason : "AddVirtualContext",
				reason : "~sResumeChangeReason~"
			});
		} else {
			oBindingMock.expects("_fireRefresh").withExactArgs({reason : "~sResumeChangeReason~"});
		}

		// code under test
		oBinding.resumeInternal();

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("resumeInternal: no sResumeChangeReason", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oDependent0 = {resumeInternal : function () {}},
			oDependent1 = {resumeInternal : function () {}};

		oBinding.sResumeChangeReason = undefined;

		this.mock(oBinding).expects("removeCachesAndMessages").never();
		this.mock(oBinding).expects("reset").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("refreshKeptElements").never();
		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("resumeInternal").withExactArgs(true, false);
		this.mock(oDependent1).expects("resumeInternal").withExactArgs(true, false);
		this.mock(oBinding).expects("_fireRefresh").never();
		this.mock(oBinding).expects("removeReadGroupLock").withExactArgs();

		// code under test
		oBinding.resumeInternal(true/*ignored*/);
	});

	//*********************************************************************************************
[false, true].forEach(function (bRefreshKeptElements) {
	var sTitle = "resumeInternal: no sResumeChangeReason but parent has"
			+ "; bRefreshKeptElements=" + bRefreshKeptElements;

	QUnit.test(sTitle, function (assert) {
		var oContext = {},
			oBinding = this.bindList("/EMPLOYEES", oContext);

		oBinding.sResumeChangeReason = undefined;
		oBinding.bRefreshKeptElements = bRefreshKeptElements;
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("reset").withExactArgs();
		this.mock(oBinding).expects("getGroupId").exactly(bRefreshKeptElements ? 1 : 0)
			.returns("myGroup");
		this.mock(oBinding).expects("refreshKeptElements").exactly(bRefreshKeptElements ? 1 : 0)
			.withExactArgs("myGroup")
			.returns(SyncPromise.resolve());
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false);
		this.mock(oBinding).expects("_fireRefresh").never();
		this.mock(oBinding).expects("removeReadGroupLock").withExactArgs();

		// code under test
		oBinding.resumeInternal(true/*ignored*/, true);

		assert.strictEqual(oBinding.bRefreshKeptElements, false);
	});
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
		oBinding.resumeInternal(true/*ignored*/);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: shared cache, after refresh", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, null, null, {$$sharedRequest : true});

		oBinding.sResumeAction = "resetCache";
		this.mock(oBinding).expects("getDependentBindings").never();
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding.oCache).expects("reset").withExactArgs([]);
		this.mock(oBinding).expects("onChange").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("refreshKeptElements").never();

		// code under test
		oBinding.resumeInternal(true/*ignored*/);

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: shared cache, after onChange", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", null, null, null, {$$sharedRequest : true});

		oBinding.sResumeAction = "onChange";
		this.mock(oBinding).expects("getDependentBindings").never();
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding.oCache).expects("reset").never();
		this.mock(oBinding).expects("onChange").withExactArgs();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("refreshKeptElements").never();

		// code under test
		oBinding.resumeInternal(true/*ignored*/);

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: reset selection", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.sResumeChangeReason = ChangeReason.Filter;
		oBinding.mParameters = {$$clearSelectionOnFilter : true};

		const oSetSelectedExpectation = this.mock(oBinding.oHeaderContext).expects("setSelected")
			.withExactArgs(false);
		const oRemoveCacheExpectation = this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs("");

		// code under test
		oBinding.resumeInternal();

		assert.ok(oSetSelectedExpectation.calledBefore(oRemoveCacheExpectation));

		oBinding.mParameters = {};

		// code under test - no reset
		oBinding.resumeInternal();
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings", function (assert) {
		var oActiveBinding = {
				oContext : {
					getPath : function () { return "/FOO('1')/active"; },
					isEffectivelyKeptAlive : function () { return false; }
				}
			},
			oBinding = this.oModel.bindList("/FOO"),
			oInactiveBinding = {
				oContext : {
					getPath : function () { return "/FOO('1')/inactive"; },
					isEffectivelyKeptAlive : function () { return false; }
				}
			},
			oKeptBinding = {
				oContext : {
					getPath : function () { return "/kept"; },
					isEffectivelyKeptAlive : function () { return true; }
				}
			},
			aDependentBindings = [oActiveBinding, oInactiveBinding, oKeptBinding];

		// simulate inactive binding
		oBinding.mPreviousContextsByPath["/FOO('1')/inactive"] = {};
		// simulate binding form a kept-alive context
		oBinding.mPreviousContextsByPath["kept"] = {};

		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns(aDependentBindings);

		// code under test
		assert.deepEqual(oBinding.getDependentBindings(), [oActiveBinding, oKeptBinding]);
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

[false, true].forEach(function (bRecursiveHierarchy) { //******************************************
	function bindList(that, sPath, oContext) { // eslint-disable-line consistent-this
		var oListBinding = that.bindList(sPath, oContext);

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		if (bRecursiveHierarchy) {
			oListBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		}

		return oListBinding;
	}

	//*********************************************************************************************
[false, true].forEach(function (bHeader) {
	QUnit.test("requestSideEffects: refresh needed, refresh fails, " + bHeader, function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set"),
			oContext = bHeader ? oBinding.getHeaderContext() : undefined,
			oError = new Error(),
			sGroupId = "group";

		oBinding.iCurrentEnd = 42;
		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").withExactArgs(sGroupId).returns(false);
		oCacheMock.expects("getPendingRequestsPromise").withExactArgs().returns(null);

		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
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
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oContext = {},
			oBinding = bindList(this, "/Set"),
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {};

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").never();
		oCacheMock.expects("getPendingRequestsPromise").withExactArgs().returns(null);
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock),
				/*bAllowRemoval*/false, /*bKeepCacheOnError*/true, /*bWithMessages*/true)
			.rejects(oError);

		// code under test
		return oBinding.requestSideEffects(sGroupId, ["n/a", ""], oContext).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHeader) {
	QUnit.test("requestSideEffects: deleting in other group, " + bHeader, function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set"),
			oContext = bHeader ? oBinding.getHeaderContext() : undefined;

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").withExactArgs("group").returns(true);
		oCacheMock.expects("getPendingRequestsPromise").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshSingle").never();

		// code under test
		assert.throws(function () {
			oBinding.requestSideEffects("group", ["n/a", ""], oContext);
		}, new Error("Must not request side effects when there is a pending delete in a different "
			+ "batch group"));
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: wait for getPendingRequestsPromise()", function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set"),
			fnResolve,
			oPendingRequestsPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			oPromise;

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").never();
		oCacheMock.expects("getPendingRequestsPromise").twice().withExactArgs()
			.returns(oPendingRequestsPromise);

		// code under test
		oPromise = oBinding.requestSideEffects("group", ["A"], "~oContext~");

		assert.strictEqual(oPromise.isPending(), true);

		this.mock(oBinding).expects("requestSideEffects")
			.withExactArgs("group", ["A"], "~oContext~").returns("~result~");

		// code under test
		fnResolve();

		return oPromise.then(function (vResult) {
			assert.strictEqual(vResult, "~result~");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: call refreshInternal for relative binding", function (assert) {
		var oBinding = bindList(this, "relative", this.oModel.createBindingContext("/")),
			oContext = oBinding.getHeaderContext(),
			oResult = {};

		oBinding.iCurrentEnd = 42;
		this.mock(oBinding).expects("refreshSingle").never();
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", false, true)
			.resolves(oResult);

		// code under test
		return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
			assert.strictEqual(oResult0, oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: call refreshSingle for relative binding", function (assert) {
		var oBinding = bindList(this, "relative", this.oModel.createBindingContext("/")),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"),
			oGroupLock = {},
			oResult = {};

		this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
		this.mock(oBinding).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock),
				/*bAllowRemoval*/false, /*bKeepCacheOnError*/true, /*bWithMessages*/true)
			.resolves(oResult);
		this.mock(oBinding).expects("refreshInternal").never();

		// code under test
		return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
			assert.strictEqual(oResult0, oResult);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHeader) {
	[false, true].forEach(function (bRecursionRejects) {
		[false, true].forEach(function (bHasCache) {
			var sTitle = "requestSideEffects: efficient request possible, header=" + bHeader
					+ ", reject=" + bRecursionRejects + ", has cache=" + bHasCache;

	QUnit.test(sTitle, function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set"),
			oCanceledError = new Error(),
			oContext = bHeader ? oBinding.getHeaderContext() : "~oContext~",
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {},
			oModelMock = this.mock(this.oModel),
			aPaths = ["A"],
			oPromise = SyncPromise.resolve(),
			oResult,
			that = this;

		function expectVisitAndRefresh(aPromises) {
			that.mock(oBinding).expects("visitSideEffects").withExactArgs(sGroupId,
					sinon.match.same(aPaths), bHeader ? undefined : oContext, aPromises)
				.callsFake(function (_sGroupId, _aPaths, _oContext, aPromises) {
					aPromises.push(Promise.resolve());
					aPromises.push(Promise.reject(oCanceledError));
					if (bRecursionRejects) {
						aPromises.push(Promise.reject(oError));
					}
				});
			that.mock(oBinding).expects("refreshDependentListBindingsWithoutCache")
				.exactly(bRecursionRejects ? 0 : 1).withExactArgs().resolves("~");
		}

		oCanceledError.canceled = true;
		oBinding.iCurrentEnd = 6;

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").exactly(bHeader && bHasCache ? 1 : 0)
			.withExactArgs(sGroupId).returns(false);
		oCacheMock.expects("getPendingRequestsPromise").exactly(bHasCache ? 1 : 0).withExactArgs()
			.returns(null);
		this.mock(oBinding).expects("keepOnlyVisibleContexts").exactly(bHeader ? 1 : 0)
			.withExactArgs().returns("~aContexts~");
		this.mock(_Helper).expects("getPredicates")
			.withExactArgs(bHeader ? "~aContexts~" : [oContext]).returns("~aPredicates~");
		this.mock(oBinding).expects("lockGroup").exactly(bHasCache ? 1 : 0)
			.withExactArgs(sGroupId).returns(oGroupLock);
		oCacheMock.expects("requestSideEffects").exactly(bHasCache ? 1 : 0)
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), "~aPredicates~",
				!bHeader, !bHeader)
			.callsFake(function (_oGroupLock, _aPaths) {
				expectVisitAndRefresh([oPromise]);

				return oPromise;
			});
		if (!bHasCache) {
			oBinding.oCache = undefined; // not yet there
			expectVisitAndRefresh([]);
		}
		oModelMock.expects("reportError")
			.withExactArgs("Failed to request side effects", sClassName,
				sinon.match.same(oCanceledError));
		oModelMock.expects("reportError").exactly(bRecursionRejects ? 1 : 0)
			.withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oError));
		this.mock(oBinding).expects("refreshInternal").never();

		// code under test
		oResult = oBinding.requestSideEffects(sGroupId, aPaths, oContext);

		assert.ok(oResult.isPending(), "instanceof SyncPromise");

		return oResult.then(function (vValue) {
				assert.notOk(bRecursionRejects);
				assert.strictEqual(vValue, "~",
					"refreshDependentListBindingsWithoutCache finished");
			}, function (oError0) {
				assert.ok(bRecursionRejects);
				assert.strictEqual(oError0, oError);
			});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: fallback to refresh", function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set"),
			oError = new Error(),
			sGroupId = "group";

		oBinding.iCurrentEnd = 8;
		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").withExactArgs(sGroupId).returns(false);
		oCacheMock.expects("getPendingRequestsPromise").withExactArgs().returns(null);
		this.mock(oBinding).expects("keepOnlyVisibleContexts").withExactArgs()
			.returns("~aContexts~");
		this.mock(_Helper).expects("getPredicates").withExactArgs("~aContexts~")
			.returns(null); // no key predicates
		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, false, true)
			.rejects(oError);

		// code under test
		return oBinding.requestSideEffects(sGroupId, ["A"]).then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});
	// Note: although a list binding's oCachePromise may become pending again due to late properties
	// being added, there is no need to wait for them to arrive. We can just request the current
	// side effects now and the late property will fetch its own value later on.

	//*********************************************************************************************
	QUnit.test("requestSideEffects: no data read => no refresh", function (assert) {
		var oCacheMock = this.getCacheMock(), // must be called before creating the binding
			oBinding = bindList(this, "/Set");

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(false);
		this.mock(_AggregationHelper).expects("isAffected").never();
		oCacheMock.expects("isDeletingInOtherGroup").withExactArgs("group").returns(false);
		oCacheMock.expects("getPendingRequestsPromise").withExactArgs().returns(null);
		this.mock(oBinding).expects("lockGroup").never();
		oCacheMock.expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshInternal").never();

		assert.strictEqual(
			// code under test
			oBinding.requestSideEffects("group", ["n/a", ""]),
			SyncPromise.resolve()
		);
	});
}); // END of forEach: bRecursiveHierarchy ********************************************************

	//*********************************************************************************************
[false, true].forEach(function (bRefresh) {
	[false, true].forEach(function (bHeaderContext) {
		var sTitle = "requestSideEffects: $$aggregation, refresh=" + bRefresh + ", headerContext="
				+ bHeaderContext;

		QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/Set"),
			oContext = bHeaderContext ? oBinding.getHeaderContext() : undefined,
			aFilters = [],
			aPaths = [],
			oPromise,
			oRefreshPromise = {};

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(true);
		this.mock(oBinding.oCache).expects("requestSideEffects").never();
		this.mock(oBinding.aFilters).expects("concat").withExactArgs(oBinding.aApplicationFilters)
			.returns(aFilters);
		this.mock(_AggregationHelper).expects("isAffected")
			.withExactArgs(sinon.match.same(oBinding.mParameters.$$aggregation),
				sinon.match.same(aFilters), sinon.match.same(aPaths))
			.returns(bRefresh);
		this.mock(oBinding).expects("refreshInternal").exactly(bRefresh ? 1 : 0)
			.withExactArgs("", "group", false, true)
			.returns(oRefreshPromise);

		// code under test
		oPromise = oBinding.requestSideEffects("group", aPaths, oContext);

		if (bRefresh) {
			assert.strictEqual(oPromise, oRefreshPromise);
		} else {
			assert.strictEqual(oPromise, SyncPromise.resolve());
		}
	});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects with $$aggregation and row context", function (assert) {
		var oBinding = this.bindList("/Set");

		this.mock(_Helper).expects("isDataAggregation").withExactArgs(oBinding.mParameters)
			.returns(true);
		this.mock(oBinding.oCache).expects("requestSideEffects").never();
		this.mock(oBinding).expects("refreshInternal").never();
		this.mock(_AggregationHelper).expects("isAffected").never();

		assert.throws(function () {
			// code under test
			oBinding.requestSideEffects("group", [/*aPaths*/], {/*oContext*/});
		}, new Error("Must not request side effects when using data aggregation"));
	});

	//*********************************************************************************************
	QUnit.test("keepOnlyVisibleContexts", function (assert) {
		var oBinding = this.bindList("/Set"),
			oCreatedContext0 = { // in
				getProperty : function () {}
			},
			oCreatedContext1 = { // out
				getProperty : function () {}
			},
			oCreatedContext2 = { // in
				getProperty : function () {}
			},
			oContext0 = {getProperty : mustBeMocked}, // in
			oContext1 = {getProperty : mustBeMocked}, // in
			oPreviousContext0 = { // in
				isEffectivelyKeptAlive : function () {},
				getProperty : mustBeMocked
			},
			oPreviousContext1 = { // out
				isEffectivelyKeptAlive : function () {}
			},
			oPreviousContext2 = { // in
				isEffectivelyKeptAlive : function () {},
				getProperty : mustBeMocked
			},
			aResult;

		oBinding.aContexts = [oCreatedContext0, oCreatedContext1, oCreatedContext2,
			oContext0, oContext1];
		oBinding.iCreatedContexts = 3;
		oBinding.iCurrentBegin = 2;
		oBinding.iCurrentEnd = 7;
		oBinding.mPreviousContextsByPath = {
			foo : oPreviousContext0,
			bar : oPreviousContext1,
			baz : oPreviousContext2
		};
		this.mock(oBinding).expects("getCurrentContexts").withExactArgs()
			.returns([oCreatedContext2, oContext0, oContext1, undefined]);
		this.mock(oPreviousContext0).expects("isEffectivelyKeptAlive").withExactArgs()
			.returns(true);
		this.mock(oPreviousContext1).expects("isEffectivelyKeptAlive").withExactArgs()
			.returns(false);
		this.mock(oPreviousContext2).expects("isEffectivelyKeptAlive").withExactArgs()
			.returns(true);
		this.mock(oCreatedContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oCreatedContext1).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oCreatedContext2).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oPreviousContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oPreviousContext2).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oContext1).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(false);
		this.mock(oBinding).expects("destroyLater").never();

		// code under test
		aResult = oBinding.keepOnlyVisibleContexts();

		assert.deepEqual(aResult, [
			oCreatedContext0,
			oCreatedContext2,
			oContext0,
			oContext1,
			oPreviousContext0,
			oPreviousContext2
		]);
		assert.strictEqual(aResult[0], oCreatedContext0);
		assert.strictEqual(aResult[1], oCreatedContext2);
		assert.strictEqual(aResult[2], oContext0);
		assert.strictEqual(aResult[3], oContext1);
		assert.strictEqual(aResult[4], oPreviousContext0);
		assert.strictEqual(aResult[5], oPreviousContext2);
		assert.deepEqual(oBinding.aContexts,
			[oCreatedContext0, oCreatedContext1, oCreatedContext2, oContext0, oContext1],
			"unchanged");
	});

	//*********************************************************************************************
[false, true].forEach((bTransient) => {
	[false, true].forEach(function (bContext6Created) {
		var sTitle = "keepOnlyVisibleContexts: destroy others, unless created; transient: "
				+ bTransient + "; oContext6 is created: " + bContext6Created;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding),
			oCreatedContext0 = { // out
				getProperty : function () {},
				iIndex : -1
			},
			oContext0 = {iIndex : 0, created : mustBeMocked}, // to be destroyed
			oContext1 = { // NOT to be destroyed
				iIndex : 1,
				created : mustBeMocked,
				getProperty : mustBeMocked
			},
			oContext2 = {iIndex : 2, created : mustBeMocked}, // to be destroyed
			oContext3 = { // in
				iIndex : 3,
				getProperty : mustBeMocked
			},
			oContext4 = { // in
				iIndex : 4,
				getProperty : mustBeMocked
			},
			oContext5 = {iIndex : 5, created : mustBeMocked}, // to be destroyed
			oContext6 = { // NOT to be destroyed if bContext6Created
				iIndex : 6,
				created : mustBeMocked,
				getProperty : mustBeMocked
			},
			oContext7 = {iIndex : 7, created : mustBeMocked}, // to be destroyed
			oContext8 = {iIndex : 8, created : mustBeMocked}, // to be destroyed
			oContext9 = {iIndex : 9, created : mustBeMocked}, // to be destroyed
			aResult;

		oBinding.aContexts = [oCreatedContext0, oContext0, oContext1, oContext2, oContext3,
			oContext4, oContext5, oContext6, oContext7, oContext8, oContext9];
		oBinding.iCreatedContexts = 1;
		oBinding.iCurrentBegin = 4;
		oBinding.iCurrentEnd = 6;
		oBindingMock.expects("getCurrentContexts").withExactArgs().returns([oContext3, oContext4]);
		this.mock(oCreatedContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oContext0).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext1).expects("created").withExactArgs().returns(Promise.resolve());
		this.mock(oContext2).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext5).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext6).expects("created").withExactArgs()
			.returns(bContext6Created ? Promise.resolve() : undefined);
		this.mock(oContext7).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext8).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext9).expects("created").withExactArgs().returns(undefined);
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext0));
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext2));
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext5));
		oBindingMock.expects("destroyLater").on(oBinding).exactly(bContext6Created ? 0 : 1)
			.withArgs(sinon.match.same(oContext6));
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext7));
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext8));
		oBindingMock.expects("destroyLater").on(oBinding).withArgs(sinon.match.same(oContext9));
		this.mock(oContext1).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(bTransient);
		this.mock(oContext3).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(bTransient);
		this.mock(oContext4).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(bTransient);
		this.mock(oContext6).expects("getProperty").exactly(bContext6Created ? 1 : 0)
			.withExactArgs("@$ui5.context.isTransient").returns(bTransient);

		// code under test
		aResult = oBinding.keepOnlyVisibleContexts();

		if (bTransient) { // transient ones cannot be requested
			assert.deepEqual(aResult, []);
		} else {
			assert.deepEqual(aResult, bContext6Created
			? [oContext3, oContext4, oContext1, oContext6]
			: [oContext3, oContext4, oContext1]);
			assert.strictEqual(aResult[0], oContext3);
			assert.strictEqual(aResult[1], oContext4);
			assert.strictEqual(aResult[2], oContext1);
			assert.strictEqual(aResult[3], bContext6Created ? oContext6 : undefined);
		}
		assert.deepEqual(oBinding.aContexts, bContext6Created
			? [oCreatedContext0,, oContext1,, oContext3, oContext4,, oContext6]
			: [oCreatedContext0,, oContext1,, oContext3, oContext4]);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("keepOnlyVisibleContexts: only created are visible", function (assert) {
		var oBinding = this.bindList("/Set"),
			oCreatedContext0 = { // out
				getProperty : function () {},
				iIndex : -3
			},
			oCreatedContext1 = { // out
				getProperty : function () {},
				iIndex : -2
			},
			oCreatedContext2 = { // out
				getProperty : function () {},
				iIndex : -1
			},
			aResult;

		oBinding.aContexts = [oCreatedContext0, oCreatedContext1, oCreatedContext2];
		oBinding.iCreatedContexts = 3;
		oBinding.iCurrentBegin = 0;
		oBinding.iCurrentEnd = 2;
		this.mock(oBinding).expects("getCurrentContexts").withExactArgs()
			.returns([oCreatedContext0, oCreatedContext1]);
		this.mock(oCreatedContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oCreatedContext1).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oCreatedContext2).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oBinding).expects("destroyLater").never();

		// code under test
		aResult = oBinding.keepOnlyVisibleContexts();

		assert.deepEqual(aResult, []);
		assert.deepEqual(oBinding.aContexts,
			[oCreatedContext0, oCreatedContext1, oCreatedContext2]);
	});

	//*********************************************************************************************
	QUnit.test("keepOnlyVisibleContexts: do not set length to NaN", function (assert) {
		var oBinding = this.bindList("/Set"),
			oContext0 = { // out
				getProperty : function () {}
			},
			oContext1 = { // out
				created : mustBeMocked,
				getProperty : function () {}
			};

		oBinding.aContexts = [oContext0, oContext1];
		oBinding.iCreatedContexts = 0;
		oBinding.iCurrentBegin = 0;
		oBinding.iCurrentEnd = 1;
		this.mock(oBinding).expects("getCurrentContexts").withExactArgs().returns([oContext0]);
		this.mock(oContext1).expects("created").withExactArgs().returns(undefined);
		this.mock(oContext0).expects("getProperty")
			.withExactArgs("@$ui5.context.isTransient").returns(true);
		this.mock(oBinding).expects("destroyLater").on(oBinding)
			.withArgs(sinon.match.same(oContext1));

		// code under test
		assert.deepEqual(oBinding.keepOnlyVisibleContexts(), []);

		assert.deepEqual(oBinding.aContexts, [oContext0]);
	});

	//*********************************************************************************************
[true, false].forEach(function (bAllowRequest) {
	const sTitle = "fetchOrGetParent: given node is a root node, bAllowRequest = " + bAllowRequest;

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = {iIndex : 23};
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};
		oBinding.aContexts[23] = oNode;
		oBinding.oCache = {getParentIndex : mustBeMocked};

		this.mock(oBinding.oCache).expects("getParentIndex").withExactArgs(23)
			.returns(-1);

		// code under test
		assert.strictEqual(oBinding.fetchOrGetParent(oNode, bAllowRequest), null);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchOrGetParent: Missing recursive hierarchy", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			oBinding.fetchOrGetParent();
		}, new Error("Missing recursive hierarchy"));

		oBinding.mParameters = {$$aggregation : {}};

		assert.throws(function () {
			// code under test
			oBinding.fetchOrGetParent();
		}, new Error("Missing recursive hierarchy"));
	});

	//*********************************************************************************************
	QUnit.test("fetchOrGetParent: not part of a recursive hierachy", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 23);
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};

		assert.throws(function () {
			// code under test
			oBinding.fetchOrGetParent(oNode);
		}, new Error("Not currently part of a recursive hierarchy: " + oNode));
	});

	//*********************************************************************************************
[true, false].forEach(function (bParentFound) {
	const sTitle = "fetchOrGetParent: request not allowed, bParentFound = " + bParentFound;

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = {iIndex : 42};
		oBinding.aContexts[23] = "~oParentContext~";
		oBinding.aContexts[42] = oNode;
		oBinding.oCache = {getParentIndex : mustBeMocked};

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};

		this.mock(oBinding.oCache).expects("getParentIndex").withExactArgs(42)
			.returns(bParentFound ? 23 : undefined);

		// code under test
		assert.strictEqual(
			oBinding.fetchOrGetParent(oNode),
			bParentFound ? "~oParentContext~" : undefined
		);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchOrGetParent: index of parent is known", async function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = {iIndex : 42};
		oBinding.aContexts[42] = oNode;
		oBinding.oCache = {getParentIndex : mustBeMocked};

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};

		this.mock(oBinding.oCache).expects("getParentIndex").withExactArgs(42)
			.returns("~iParentIndex~");
		this.mock(oBinding).expects("requestContexts").withExactArgs("~iParentIndex~", 1)
			.resolves(["~oParentContext~"]);

		// code under test
		const oPromise = oBinding.fetchOrGetParent(oNode, true);
		assert.ok(oPromise instanceof Promise);
		assert.strictEqual(await oPromise, "~oParentContext~");
	});

	//*********************************************************************************************
	QUnit.test("fetchOrGetParent: index of parent is not known", async function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = {iIndex : 42};
		oBinding.aContexts[42] = oNode;
		oBinding.oCache = {
			fetchParentIndex : mustBeMocked,
			getParentIndex : mustBeMocked
		};

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};

		this.mock(oBinding.oCache).expects("getParentIndex").withExactArgs(42)
			.returns(undefined);
		this.mock(oBinding).expects("lockGroup").withExactArgs().returns("~oGroupLock~");
		this.mock(oBinding.oCache).expects("fetchParentIndex").withExactArgs(42, "~oGroupLock~")
			.returns(SyncPromise.resolve("~iParentIndex~"));
		this.mock(oBinding).expects("requestContexts").withExactArgs("~iParentIndex~", 1)
			.resolves(["~oParentContext~"]);

		// code under test
		assert.strictEqual(await oBinding.fetchOrGetParent(oNode, true), "~oParentContext~");
	});

	//*********************************************************************************************
	QUnit.test("fetchOrGetParent: requestContexts rejects", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oNode = {iIndex : 42};
		oBinding.aContexts[42] = oNode;
		oBinding.oCache = {getParentIndex : mustBeMocked};

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far
		oBinding.mParameters = {
			$$aggregation : {
				expandTo : 1,
				hierarchyQualifier : "X"
			}
		};

		this.mock(oBinding.oCache).expects("getParentIndex").withExactArgs(42)
			.returns("~iParentIndex~");
		const oError = new Error();
		this.mock(oBinding).expects("requestContexts").withExactArgs("~iParentIndex~", 1)
			.rejects(oError);

		// code under test
		return oBinding.fetchOrGetParent(oNode, true)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
			});
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

		oBinding.bLengthFinal = true;
		oBinding.iCreatedContexts = 1;

		// code under test
		assert.strictEqual(oBinding.getModelIndex(5), 5);
		assert.strictEqual(oBinding.getModelIndex(42), 42);

		oBinding.bFirstCreateAtEnd = true;

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
	QUnit.test("attachCreateActivate/detachCreateActivate", function (assert) {
		var oBinding = this.bindList("/Set");

		this.mock(oBinding).expects("attachEvent")
			.withExactArgs("createActivate", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.attachCreateActivate("~function~", "~listener~"), oBinding);

		this.mock(oBinding).expects("detachEvent")
			.withExactArgs("createActivate", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.detachCreateActivate("~function~", "~listener~"), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("attachCreateCompleted/detachCreateCompleted", function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("attachEvent")
			.withExactArgs("createCompleted", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.attachCreateCompleted("~function~", "~listener~"), oBinding);

		oBindingMock.expects("detachEvent")
			.withExactArgs("createCompleted", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.detachCreateCompleted("~function~", "~listener~"), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("attachCreateSent/detachCreateSent", function (assert) {
		var oBinding = this.bindList("/Set"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("attachEvent")
			.withExactArgs("createSent", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.attachCreateSent("~function~", "~listener~"), oBinding);

		oBindingMock.expects("detachEvent")
			.withExactArgs("createSent", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.detachCreateSent("~function~", "~listener~"), oBinding);
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
[
	{mCacheQueryOptions : {}, sContextPath : "/SalesOrderList($uid=1)"},
	{mCacheQueryOptions : undefined, sContextPath : "/SalesOrderList($uid=1)"},
	{mCacheQueryOptions : {}, sContextPath : "/SalesOrderList('42')", bFetch : true}
].forEach(function (oFixture) {
	QUnit.test("adjustPredicate " + JSON.stringify(oFixture), function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oBindingMock = this.mock(oBinding),
			sContextPath = oFixture.sContextPath,
			oContext = Context.create({/*oModel*/}, oParentBinding, sContextPath),
			oContext1 = {adjustPredicate : function () {}},
			oContext2 = {adjustPredicate : function () {}},
			oExpectation1,
			oExpectation2;

		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		oBinding.setContext(oContext);
		oBinding.aPreviousData = [sContextPath + "/SO_2_SOITEM($uid=2)"];
		oBinding.aContexts = [,, oContext1, oContext2]; // sparse array
		oBinding.mCacheQueryOptions = oFixture.mCacheQueryOptions;
		this.mock(asODataParentBinding.prototype).expects("adjustPredicate").on(oBinding)
			.withExactArgs("($uid=1)", "('42')");
		oBindingMock.expects("fetchCache").exactly(oFixture.bFetch ? 1 : 0)
			.withExactArgs(sinon.match.same(oContext), true);
		this.mock(oBinding.oHeaderContext).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')");
		oExpectation1 = this.mock(oContext1).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')", sinon.match.func);
		oExpectation2 = this.mock(oContext2).expects("adjustPredicate")
			.withExactArgs("($uid=1)", "('42')", sinon.match.func);

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')");
		oExpectation1.args[0][2](sContextPath + "/SO_2_SOITEM($uid=2)",
			"/SalesOrderList('42')/SO_2_SOITEM($uid=2)");
		oExpectation2.args[0][2](sContextPath + "/SO_2_SOITEM($uid=3)",
			"/SalesOrderList('42')/SO_2_SOITEM($uid=3)");

		assert.deepEqual(oBinding.aPreviousData, ["/SalesOrderList('42')/SO_2_SOITEM($uid=2)"]);
		assert.notOk(oBinding.aPreviousData.hasOwnProperty("-1"));
	});
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
	QUnit.test("hasPendingChangesForPath: iActiveContexts", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.oCache = undefined;
		oBinding.iActiveContexts = 0;
		oBinding.iCreatedContexts = 2;
		this.mock(asODataParentBinding.prototype).expects("hasPendingChangesForPath").never();

		// code under test
		assert.notOk(oBinding.hasPendingChangesForPath());

		oBinding.iActiveContexts = 1;

		// code under test
		assert.ok(oBinding.hasPendingChangesForPath());
		assert.notOk(oBinding.hasPendingChangesForPath("", true));
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: returns undefined", function (assert) {
		// code under test
		assert.strictEqual(this.bindList("/EMPLOYEES").doSetProperty(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl", function (assert) {
		var oBinding = this.bindList("n/a"),
			oCache = {
				getDownloadUrl : function () {}
			},
			oExpectation,
			oPromise = {};

		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(oBinding).expects("isResolved").returns(true);
		this.mock(oBinding).expects("hasFilterNone").returns(false);
		oExpectation = this.mock(oBinding).expects("withCache").returns(oPromise);

		// code under test
		assert.strictEqual(oBinding.fetchDownloadUrl(), oPromise);

		this.mock(oCache).expects("getDownloadUrl")
			.withExactArgs("~path~", sinon.match.same(this.oModel.mUriParameters))
			.returns("~url~");

		// code under test - callback function
		assert.strictEqual(oExpectation.args[0][0](oCache, "~path~"), "~url~");
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl: Filter.NONE", function (assert) {
		const oBinding = this.bindList("n/a");

		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(oBinding).expects("isResolved").returns(true);
		this.mock(oBinding).expects("hasFilterNone").returns(true);

		// code under test
		assert.strictEqual(oBinding.fetchDownloadUrl().getResult(), null);
	});

	//*********************************************************************************************
	QUnit.test("fetchDownloadUrl: unresolved", function (assert) {
		var oBinding = this.bindList("n/a");

		this.mock(oBinding).expects("isResolved").returns(false);

		assert.throws(function () {
			oBinding.fetchDownloadUrl();
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
		var oBinding = this.bindList("/EMPLOYEES"),
			oPromise = SyncPromise.resolve(Promise.resolve("/service/resource?query"));

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(oPromise);

		assert.throws(function () {
			// code under test
			oBinding.getDownloadUrl();
		}, new Error("Result pending"));

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: error", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error("Failure");

		this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs()
			.returns(SyncPromise.reject(oError));

		assert.throws(function () {
			// code under test
			oBinding.getDownloadUrl();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: header context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive(oBinding.getHeaderContext());
		}, new Error("Unsupported header context " + oBinding.getHeaderContext()));
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: $$aggregation", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$aggregation : {}}); // Note: no hierarchyQualifier!

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive();
		}, new Error("Unsupported $$aggregation at " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: $$aggregation w/ hierarchyQualifier", function () {
		var oBinding = this.bindList("/EMPLOYEES");

		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};

		// code under test (look, Ma - no error!)
		oBinding.checkKeepAlive();
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: $$sharedRequest", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
				{$$sharedRequest : true});

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive();
		}, new Error("Unsupported $$sharedRequest at " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: sharedRequests from model", function (assert) {
		var oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				sharedRequests : true
			}),
			oBinding = oModel.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive();
		}, new Error("Unsupported $$sharedRequest at " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: relative", function (assert) {
		var oBinding,
			oParentContext = Context.createNewContext({/*oModel*/}, oParentBinding, "/TEAMS('1')");

		oBinding = this.bindList("TEAM_2_EMPLOYEES", oParentContext);

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive();
		}, new Error("Missing $$ownRequest at " + oBinding));

		oBinding = this.bindList("TEAM_2_EMPLOYEES", oParentContext, undefined, undefined,
			{$$ownRequest : true});

		// code under test
		oBinding.checkKeepAlive();
	});

	//*********************************************************************************************
	QUnit.test("checkKeepAlive: pending changes", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = {
				hasPendingChanges : function () {},
				getIndex : function () {},
				isDeleted : function () {},
				isKeepAlive : function () {},
				toString : function () { return "foo"; }
			},
			oContextMock = this.mock(oContext);

		oContextMock.expects("getIndex").withExactArgs().returns(undefined);
		oContextMock.expects("isKeepAlive").withExactArgs().returns(true);
		oContextMock.expects("isDeleted").withExactArgs().returns(false);
		oContextMock.expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oBinding.checkKeepAlive(oContext, false);
		}, new Error("Not allowed due to pending changes: foo"));

		oContextMock.expects("getIndex").withExactArgs().returns(undefined);
		oContextMock.expects("isKeepAlive").withExactArgs().returns(true);
		oContextMock.expects("isDeleted").withExactArgs().returns(true);

		// code under test
		oBinding.checkKeepAlive(oContext, false);

		oContextMock.expects("getIndex").withExactArgs().returns(undefined);
		oContextMock.expects("isKeepAlive").withExactArgs().returns(false);

		// code under test
		oBinding.checkKeepAlive(oContext, false);

		oContextMock.expects("getIndex").withExactArgs().returns(42);

		// code under test
		oBinding.checkKeepAlive(oContext, false);

		// code under test
		oBinding.checkKeepAlive(oContext, true);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	[false, true].forEach(function (bDataRequested) {
		// iCount=0 means collapse before expand has finished
		// iCount=-1 means unified cache
		[-1, 0, 3].forEach(function (iCount) {
			[false, true].forEach((bSilent) => {
				var sTitle = "expand: success=" + bSuccess + ", data requested=" + bDataRequested
						+ ", count=" + iCount + ", silent=" + bSilent;

	if (!bSuccess && iCount === 0 || bDataRequested && iCount < 0) {
		return; // ignore useless combinations
	}

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext = {
				getModelIndex : function () {},
				getPath : function () {},
				toString : function () { return "~context~"; }
			},
			oChangeCall,
			oDataReceivedCall,
			oError = new Error(),
			oExpectation,
			oGapCall,
			oGroupLock = {},
			oPromise,
			that = this;

		oBinding.oCache = { // simulate an aggregation cache
			expand : function () {}
		};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("lockGroup").withExactArgs().returns(oGroupLock);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~contextpath~");
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
			.returns("~bindingpath~");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("~contextpath~", "~bindingpath~").returns("~cachepath~");

		oExpectation = this.mock(oBinding.oCache).expects("expand")
			.withExactArgs(sinon.match.same(oGroupLock), "~cachepath~", sinon.match.func)
			.returns(Promise.resolve().then(function () {
				if (bSuccess) {
					that.mock(oContext).expects("getModelIndex").exactly(iCount > 0 ? 1 : 0)
						.withExactArgs().returns("~iModelIndex~");
					oGapCall = that.mock(oBinding).expects("insertGap").exactly(iCount > 0 ? 1 : 0)
						.withExactArgs("~iModelIndex~", iCount);
					oChangeCall = that.mock(oBinding).expects("_fireChange")
						.exactly(iCount > 0 && !bSilent ? 1 : 0)
						.withExactArgs({reason : ChangeReason.Change});
					that.mock(oBinding).expects("getGroupId")
						.exactly(iCount < 0 ? 1 : 0)
						.withExactArgs().returns("~group~");
					that.mock(oBinding).expects("requestSideEffects")
						.exactly(iCount < 0 ? 1 : 0)
						.withExactArgs("~group~", [""])
						.resolves("~requestSideEffects~");
					oDataReceivedCall = that.mock(oBinding).expects("fireDataReceived")
						.exactly(bDataRequested ? 1 : 0).withExactArgs({});

					return iCount;
				}
				that.mock(oBinding).expects("fireDataReceived").exactly(bDataRequested ? 1 : 0)
					.withExactArgs({error : sinon.match.same(oError)});

				throw oError;
			}));

		// code under test
		oPromise = oBinding.expand(oContext, bSilent).then(function (vResult) {
			assert.ok(bSuccess);
			if (bDataRequested && iCount) {
				if (bSilent) {
					sinon.assert.callOrder(oGapCall, oDataReceivedCall);
				} else {
					sinon.assert.callOrder(oGapCall, oChangeCall, oDataReceivedCall);
				}
			}
			if (iCount < 0) {
				assert.strictEqual(vResult, "~requestSideEffects~");
			}
		}, function (oResult) {
			assert.notOk(bSuccess);
			assert.strictEqual(oResult, oError);
		});

		that.mock(oBinding).expects("fireDataRequested").exactly(bDataRequested ? 1 : 0)
			.withExactArgs();
		if (bDataRequested) {
			oExpectation.args[0][2]();
		}

		return oPromise;
	});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("insertGap", function (assert) {
		const _ = undefined;
		const oBinding = this.bindList("/EMPLOYEES");
		oBinding.createContexts(0, createData(2, 0, true, 5));
		oBinding.createContexts(3, createData(2, 3, true, 5));

		assert.strictEqual(oBinding.getLength(), 5);
		assert.strictEqual(oBinding.aContexts.length, 5);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.getPath()),
			["/EMPLOYEES/0", "/EMPLOYEES/1", _, "/EMPLOYEES/3", "/EMPLOYEES/4"]);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.iIndex),
			[0, 1, _, 3, 4]);
		assert.notOk(2 in oBinding.aContexts, "2");

		// code under test
		oBinding.insertGap(1, 3);

		assert.strictEqual(oBinding.getLength(), 5 + 3);
		assert.strictEqual(oBinding.aContexts.length, 5 + 3);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.getPath()),
			["/EMPLOYEES/0", "/EMPLOYEES/1", _, _, _, _, "/EMPLOYEES/3", "/EMPLOYEES/4"]);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.iIndex),
			[0, 1, _, _, _, _, 6, 7]);
		assert.notOk(2 in oBinding.aContexts, "2");
		assert.notOk(3 in oBinding.aContexts, "3");
		assert.notOk(4 in oBinding.aContexts, "4");
		assert.notOk(5 in oBinding.aContexts, "5");

		// code under test
		oBinding.insertGap(7, 2);

		assert.strictEqual(oBinding.getLength(), 5 + 3 + 2);
		assert.strictEqual(oBinding.aContexts.length, 5 + 3 + 2);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.getPath()),
			["/EMPLOYEES/0", "/EMPLOYEES/1", _, _, _, _, "/EMPLOYEES/3", "/EMPLOYEES/4", _, _]);
		assert.deepEqual(oBinding.aContexts.map((oContext) => oContext?.iIndex),
			[0, 1, _, _, _, _, 6, 7, _, _]);

		assert.throws(function () {
			// code under test
			oBinding.insertGap(10, 0);
		}, new Error("Array index out of bounds: 10"));
	});

	//*********************************************************************************************
[0, 3].forEach((iCount) => {
	[false, true].forEach((bSilent) => {
		[false, true].forEach((bCountGiven) => {
			const sTitle = `collapse: iCount = ${iCount}, bSilent = ${bSilent}`
				+ `, bCountGiven = ${bCountGiven}`;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCollapseExpectation,
			oContext = {
				getModelIndex : function () {},
				getPath : function () {}
			},
			aContextsBefore,
			oFireChangeExpectation,
			i;

		// create a context dummy object with index i
		function createContextDummy(i) {
			return {
				iIndex : i,
				created : function () { // every odd context looks "created"
					return i % 2 ? Promise.resolve() : undefined;
				},
				getPath : function () {
					return "/EMPLOYEES/" + i;
				}
			};
		}

		oBinding.oCache = { // simulate an aggregation cache
			collapse : function () {}
		};
		for (i = 0; i < 8; i += 1) {
			// with gap at 6
			oBinding.aContexts.push(i === 6 ? undefined : createContextDummy(i));
		}
		oBinding.iMaxLength = 8;
		aContextsBefore = oBinding.aContexts.slice();
		assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		this.mock(oContext).expects("getModelIndex").exactly(iCount ? 1 : 0).withExactArgs()
			.returns(1);
		this.mock(oContext).expects("getPath").exactly(bCountGiven ? 0 : 1).withExactArgs()
			.returns("~contextpath~");
		this.mock(oBinding.oHeaderContext).expects("getPath").exactly(bCountGiven ? 0 : 1)
			.withExactArgs().returns("~bindingpath~");
		this.mock(_Helper).expects("getRelativePath").exactly(bCountGiven ? 0 : 1)
			.withExactArgs("~contextpath~", "~bindingpath~").returns("~cachepath~");
		oCollapseExpectation = this.mock(oBinding.oCache).expects("collapse")
			.exactly(bCountGiven ? 0 : 1).withExactArgs("~cachepath~").returns(iCount);
		oFireChangeExpectation = this.mock(oBinding).expects("_fireChange")
			.exactly(iCount && !bSilent ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.collapse(oContext, bSilent, bCountGiven ? iCount : undefined);

		if (iCount) {
			if (!bSilent && !bCountGiven) {
				sinon.assert.callOrder(oCollapseExpectation, oFireChangeExpectation);
			}
			assert.strictEqual(oBinding.aContexts[0], aContextsBefore[0], "0");
			assert.strictEqual(oBinding.aContexts[1], aContextsBefore[1], "1");
			assert.strictEqual(oBinding.aContexts[2], aContextsBefore[5], "2");
			assert.strictEqual(oBinding.aContexts[4], aContextsBefore[7], "4");
			assert.strictEqual(oBinding.aContexts.length, 5);
			assert.strictEqual(oBinding.iMaxLength, 5);
			oBinding.aContexts.forEach(function (oContext, iIndex) {
				if (iIndex !== 3) { // 6 - iCount
					assert.strictEqual(oContext.iIndex, iIndex);
				}
			});
			assert.deepEqual(oBinding.mPreviousContextsByPath, {
				"/EMPLOYEES/2" : aContextsBefore[2],
				// "/EMPLOYEES/3" : aContextsBefore[3], // "created" not inserted here!
				"/EMPLOYEES/4" : aContextsBefore[4]
			});
		} else {
			assert.strictEqual(oBinding.iMaxLength, 8);
			assert.strictEqual(oBinding.aContexts.length, 8);
			oBinding.aContexts.forEach(function (oContext, iIndex) {
				if (iIndex !== 6) {
					assert.strictEqual(oContext.iIndex, iIndex);
					assert.strictEqual(oContext.getPath(), "/EMPLOYEES/" + iIndex);
				}
			});
			assert.deepEqual(oBinding.mPreviousContextsByPath, {});
		}
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("resetKeepAlive", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext1 = {
				resetKeepAlive : function () {}
			},
			oContext2 = {
				resetKeepAlive : function () {}
			},
			oContext3 = {
				resetKeepAlive : function () {}
			},
			oContext4 = {
				resetKeepAlive : function () {}
			};

		oBinding.aContexts = [oContext1, oContext2];
		oBinding.mPreviousContextsByPath = {
			foo : oContext3,
			bar : oContext4
		};
		this.mock(oContext1).expects("resetKeepAlive").withExactArgs();
		this.mock(oContext2).expects("resetKeepAlive").withExactArgs();
		this.mock(oContext3).expects("resetKeepAlive").withExactArgs();
		this.mock(oContext4).expects("resetKeepAlive").withExactArgs();

		// code under test
		oBinding.resetKeepAlive();
	});

	//*********************************************************************************************
	QUnit.test("_checkDataStateMessages", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oDataState = {
				setModelMessages : function () {}
			};

		this.mock(this.oModel).expects("getMessagesByPath")
			.withExactArgs("/resolved/path", true)
			.returns("aMessages");
		this.mock(oDataState).expects("setModelMessages").withExactArgs("aMessages");

		// code under test
		oBinding._checkDataStateMessages(oDataState, "/resolved/path");

		// code under test - no resolved path
		oBinding._checkDataStateMessages(oDataState);
	});

	//*********************************************************************************************
	QUnit.test("requestFilterForMessages, (with unresolved binding)", function (assert) {
		var oBinding = this.bindList("TEAM_2_EMPLOYEES");

		this.mock(oBinding).expects("checkTransient");

		// code under test
		return oBinding.requestFilterForMessages().then(function (oFilter) {
			assert.strictEqual(oFilter, null);
		});
	});

	//*********************************************************************************************
[{
	messages : [], predicates : []
}, {
	messages : [{
		getTargets : function () { return ["/TEAMS('1')/foo"]; }
	}, {
		getTargets : function () { return ["/TEAMS('1')/bar"]; }
	}, {
		getTargets : function () { return ["/TEAMS"]; }
	}],
	predicates : ["('1')"]
}, {
	messages : [{
		getTargets : function () { return ["/TEAMS('1')/foo", "/TEAMS('1')/bar"]; }
	}, {
		getTargets : function () { return ["/TEAMS('2')/bar"]; }
	}, {
		getTargets : function () { return ["/TEAMS($uid='xyz')"]; }
	}],
	predicates : ["('1')", "('2')"]
}, {
	callbackReturns : true,
	messages : [{
		getTargets : function () { return ["/TEAMS('1')/foo"]; }
	}, {
		getTargets : function () { return ["/TEAMS('2')/bar"]; }
	}],
	predicates : ["('1')", "('2')"]
}, {
	callbackReturns : false,
	messages : [{
		getTargets : function () { return ["/TEAMS('1')/foo"]; }
	}, {
		getTargets : function () { return ["/TEAMS('2')/bar"]; }
	}],
	predicates : []
}, {
	callbackReturns : true,
	messages : [{
		getTargets : function () { return ["/TEAMS($uid=id-1-23)/foo"]; }
	}, {
		getTargets : function () { return ["/TEAMS($uid=id-1-42)/bar"]; }
	}],
	predicates : []
}].forEach(function (oFixture) {
	var sTitle = "requestFilterForMessages; messages: " + oFixture.messages.length
		+ " predicates: " + oFixture.predicates
		+ " callbackReturns: " + oFixture.callbackReturns;

	QUnit.test(sTitle, function (assert) {
		var fnCallback,
			oBinding = this.bindList("/TEAMS"),
			aFilters = [],
			oListBindingMock = this.mock(ODataListBinding),
			that = this;

		aFilters = oFixture.predicates.map(function () {
			return new Filter("does", "NOT", "matter");
		});

		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
			.returns("/TEAMS");
		this.mock(oBinding).expects("checkTransient");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS").returns("~meta~path~");
		this.mock(this.oModel.oMetaModel).expects("requestObject").withExactArgs("~meta~path~/")
			.callsFake(function () {
				that.mock(that.oModel).expects("getMessagesByPath")
					.withExactArgs("/TEAMS", true).returns(oFixture.messages);
				if (oFixture.predicates.length === 0) {
					oListBindingMock.expects("getFilterForPredicate").never();
				} else {
					oFixture.predicates.forEach(function (sPredicate, i) {
						oListBindingMock.expects("getFilterForPredicate")
							.withExactArgs(sPredicate, "~entity~type~",
								sinon.match.same(that.oModel.oMetaModel), "~meta~path~")
							.returns(aFilters[i]);
					});
				}
				return Promise.resolve("~entity~type~");
			});

		if (oFixture.callbackReturns !== undefined) {
			fnCallback = sinon.spy(function () { return oFixture.callbackReturns; });
		}

		// code under test
		return oBinding.requestFilterForMessages(fnCallback).then(function (oFilter) {
			if (oFixture.predicates.length === 0) {
				assert.strictEqual(
					oFilter,
					oFixture.callbackReturns ? Filter.NONE : null);

				return;
			}
			if (oFixture.predicates.length === 1) {
				assert.strictEqual(oFilter, aFilters[0]);

				return;
			}
			assert.strictEqual(oFilter.aFilters.length, oFixture.predicates.length);
			assert.notOk(oFilter.bAnd);
			oFixture.predicates.forEach(function (_sPredicate, i) {
				assert.strictEqual(oFilter.aFilters[i], aFilters[i]);
			});
			if (fnCallback) {
				oFixture.messages.forEach(function (oMessage) {
					assert.ok(fnCallback.calledWithExactly(oMessage));
				});
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getGeneration", function (assert) {
		var oBinding = this.bindList("/TEAMS"),
			oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')");

		this.mock(oBinding.oHeaderContext).expects("getGeneration").withExactArgs(true)
			.returns(42);

		// code under test
		assert.strictEqual(oBinding.getGeneration(), 42);

		oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);
		this.mock(asODataParentBinding.prototype).expects("getGeneration").on(oBinding)
			.withExactArgs().returns(34);

		// code under test
		assert.strictEqual(oBinding.getGeneration(), 34);
	});

	//*********************************************************************************************
	QUnit.test("isUnchangedParameter", function (assert) {
		var oAggregation = {aggregate : {"n/a" : {}}},
			oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
				$$aggregation : oAggregation,
				$$groupId : "n_a",
				$filter : "n/a",
				custom : "n/a"
			}),
			oHelperMock = this.mock(_Helper),
			oParentBindingPrototypeMock = this.mock(asODataParentBinding.prototype);

		oParentBindingPrototypeMock.expects("isUnchangedParameter").on(oBinding)
			.withExactArgs("$$groupId", "foo").returns("~result0~");

		// code under test
		assert.strictEqual(oBinding.isUnchangedParameter("$$groupId", "foo"), "~result0~");

		oParentBindingPrototypeMock.expects("isUnchangedParameter").on(oBinding)
			.withExactArgs("$filter", "bar").returns("~result1~");

		// code under test
		assert.strictEqual(oBinding.isUnchangedParameter("$filter", "bar"), "~result1~");

		oParentBindingPrototypeMock.expects("isUnchangedParameter").on(oBinding)
			.withExactArgs("custom", "baz").returns("~result2~");

		// code under test
		assert.strictEqual(oBinding.isUnchangedParameter("custom", "baz"), "~result2~");

		oHelperMock.expects("clone").withExactArgs("~vOtherValue~").returns("~otherClone~");
		this.mock(_AggregationHelper).expects("buildApply").withExactArgs("~otherClone~");
		oHelperMock.expects("cloneNo$")
			// BEWARE: this is a clone of oAggregation after c'tor ran!
			.withExactArgs(sinon.match.same(oBinding.mParameters.$$aggregation))
			.returns("~myCloneNo$~");
		oHelperMock.expects("cloneNo$").withExactArgs("~otherClone~").returns("~otherCloneNo$~");
		oHelperMock.expects("deepEqual").withExactArgs("~myCloneNo$~", "~otherCloneNo$~")
			.returns("~result3~");

		// code under test
		assert.strictEqual(oBinding.isUnchangedParameter("$$aggregation", "~vOtherValue~"),
			"~result3~");
	});

	//*********************************************************************************************
	QUnit.test("getFilterForPredicate (one key property)", function (assert) {
		var oEntityType = {
				$Key : ["key"]
			},
			oFilter,
			oMetaModel = {
				getObject : function () {}
			};

		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("('value')")
			.returns({"" : "'value'"});
		this.mock(oMetaModel).expects("getObject").withExactArgs("~meta~path~/key/$Type")
			.returns("type");
		this.mock(window).expects("decodeURIComponent").withExactArgs("'value'")
			.returns("decoded value");
		this.mock(_Helper).expects("parseLiteral").withExactArgs("decoded value", "type", "key")
			.returns("parsed value");

		// code under test
		oFilter = ODataListBinding.getFilterForPredicate("('value')", oEntityType, oMetaModel,
			"~meta~path~");

		assert.ok(oFilter instanceof Filter);
		assert.deepEqual(oFilter, new Filter("key", FilterOperator.EQ, "parsed value"));
	});

	//*********************************************************************************************
	QUnit.test("getFilterForPredicate (more key properties, aliases)", function (assert) {
		var oEntityType = {
				$Key : ["key1", "key2", {alias : "key3/p"}]
			},
			oFilter,
			oHelperMock = this.mock(_Helper),
			oMetaModel = {
				getObject : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel);

		this.mock(_Parser).expects("parseKeyPredicate")
			.withExactArgs("(key1='42',key2=43,alias='44')")
			.returns({key1 : "'42'", key2 : "43", alias : "'44'"});
		oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key1/$Type")
			.returns("type1");
		oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key2/$Type")
			.returns("type2");
		oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key3/p/$Type")
			.returns("type3");
		oHelperMock.expects("parseLiteral").withExactArgs("'42'", "type1", "key1")
			.returns("42");
		oHelperMock.expects("parseLiteral").withExactArgs("43", "type2", "key2")
			.returns(43);
		oHelperMock.expects("parseLiteral").withExactArgs("'44'", "type3", "key3/p")
			.returns("44");

		// code under test
		oFilter = ODataListBinding.getFilterForPredicate("(key1='42',key2=43,alias='44')",
			oEntityType, oMetaModel, "~meta~path~");

		assert.ok(oFilter instanceof Filter);
		assert.deepEqual(oFilter, new Filter({
			and : true,
			filters : [
				new Filter("key1", FilterOperator.EQ, "42"),
				new Filter("key2", FilterOperator.EQ, 43),
				new Filter("key3/p", FilterOperator.EQ, "44")
			]
		}));
	});

	//*********************************************************************************************
	QUnit.test("getCount", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("getHeaderContext").withExactArgs().returns(oBinding.oHeaderContext);
		this.mock(oBinding.oHeaderContext).expects("getProperty").withExactArgs("$count")
			.returns(42);

		// code under test
		assert.strictEqual(oBinding.getCount(), 42);

		oBindingMock.expects("getHeaderContext").withExactArgs().returns(null);

		// code under test
		assert.strictEqual(oBinding.getCount(), undefined);
	});

	//*********************************************************************************************
[undefined, 0, 42].forEach(function (iIndex) {
	var bKeepAlive = iIndex === 42,
		sTitle = "doReplaceWith: existing Context, bKeepAlive = " + bKeepAlive + ", index = "
			+ iIndex;

	QUnit.test(sTitle, function (assert) {
		var oAddKeptElementExpectation,
			oBinding = this.bindList("/EMPLOYEES"),
			oDoReplaceWithExpectation,
			oElement = {},
			oExistingContext = {}, // no #setKeepAlive
			oOldContext = {
				iIndex : iIndex,
				getModelIndex : function () { return iIndex; },
				getPath : function () {},
				isKeepAlive : function () {}
			},
			sPredicate = "('1')";

		oBinding.mPreviousContextsByPath["~header~context~path~('1')"] = oExistingContext;
		this.mock(oOldContext).expects("getPath").exactly(bKeepAlive ? 1 : 0).withExactArgs()
			.returns("~old~context~path~");
		this.mock(oOldContext).expects("isKeepAlive").withExactArgs().returns(bKeepAlive);
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
			.returns("~header~context~path~");
		this.mock(Context).expects("create").never();
		oAddKeptElementExpectation = this.mock(oBinding.oCache).expects("addKeptElement")
			.exactly(iIndex === undefined ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement));
		oDoReplaceWithExpectation = this.mock(oBinding.oCache).expects("doReplaceWith")
			.exactly(iIndex === undefined ? 0 : 1)
			.withExactArgs(iIndex, sinon.match.same(oElement));
		this.mock(oBinding).expects("destroyLater").exactly(bKeepAlive ? 0 : 1)
			.withExactArgs(sinon.match.same(oOldContext));
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change})
			.callsFake(function () {
				if (iIndex === undefined) {
					assert.ok(oAddKeptElementExpectation.called);
				} else {
					assert.ok(oDoReplaceWithExpectation.called);
				}
				assert.strictEqual(oExistingContext.iIndex, iIndex);
				assert.strictEqual(oOldContext.iIndex, undefined);
				assert.strictEqual(oBinding.aContexts.indexOf(oExistingContext),
					iIndex === undefined ? -1 : iIndex);

				assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length,
					iIndex === undefined || bKeepAlive ? 1 : 0);
				assert.strictEqual(oBinding.mPreviousContextsByPath["~old~context~path~"],
					bKeepAlive ? oOldContext : undefined);
				assert.strictEqual(oBinding.mPreviousContextsByPath["~header~context~path~('1')"],
					iIndex === undefined ? oExistingContext : undefined);
			});

		assert.strictEqual(
			// code under test
			oBinding.doReplaceWith(oOldContext, oElement, sPredicate),
			oExistingContext
		);
	});
});

	//*********************************************************************************************
	QUnit.test("doReplaceWith: unexpected index", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oOldContext = {
				getModelIndex : function () {}, // result does not matter
				isKeepAlive : function () {} // result does not matter
			};

		oBinding.mPreviousContextsByPath["/EMPLOYEES('1')"] = {
			iIndex : 0,
			toString : function () { return "~toString~"; }
		}; // no #setKeepAlive
		this.mock(Context).expects("create").never();
		this.mock(oBinding.oCache).expects("doReplaceWith").never();
		this.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			// code under test
			oBinding.doReplaceWith(oOldContext, {}, "('1')");
		}, new Error("Unexpected index: ~toString~"));
	});

	//*********************************************************************************************
[undefined, -1, 0, 42].forEach(function (iIndex) {
	[false, true].forEach(function (bHasOnBeforeDestroy) {
		var bKeepAlive = iIndex === 42,
			sTitle = "doReplaceWith: new Context, bKeepAlive = " + bKeepAlive
				+ ", bHasOnBeforeDestroy = " + bHasOnBeforeDestroy + ", index = " + iIndex;

		if (!bKeepAlive && bHasOnBeforeDestroy) {
			return;
		}

	QUnit.test(sTitle, function (assert) {
		var oAddKeptElementExpectation,
			oBinding = this.bindList("/EMPLOYEES"),
			oDoReplaceWithExpectation,
			oElement = {},
			iModelIndex = iIndex < 0 ? 17 : iIndex,
			oNewContext = {
				setKeepAlive : function () {}
			},
			oOldContext = {
				iIndex : iIndex,
				fnOnBeforeDestroy : bHasOnBeforeDestroy ? sinon.spy() : undefined,
				getModelIndex : function () {},
				getPath : function () {},
				isKeepAlive : function () {}
			},
			sPredicate = "('1')",
			oSetKeepAliveExpectation;

		this.mock(oOldContext).expects("getModelIndex").withExactArgs().returns(iModelIndex);
		this.mock(oOldContext).expects("getPath").exactly(bKeepAlive ? 1 : 0).withExactArgs()
			.returns("~old~context~path~");
		this.mock(oOldContext).expects("isKeepAlive").withExactArgs().returns(bKeepAlive);
		this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs()
			.returns("~header~context~path~");
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"~header~context~path~('1')", iIndex)
			.returns(oNewContext);
		oAddKeptElementExpectation = this.mock(oBinding.oCache).expects("addKeptElement")
			.exactly(iIndex === undefined ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement));
		oDoReplaceWithExpectation = this.mock(oBinding.oCache).expects("doReplaceWith")
			.exactly(iIndex === undefined ? 0 : 1)
			.withExactArgs(iModelIndex, sinon.match.same(oElement));
		oSetKeepAliveExpectation = this.mock(oNewContext).expects("setKeepAlive")
			.exactly(bKeepAlive ? 1 : 0)
			.withExactArgs(true, bHasOnBeforeDestroy ? sinon.match.func : undefined);
		this.mock(oBinding).expects("destroyLater").exactly(bKeepAlive ? 0 : 1)
			.withExactArgs(sinon.match.same(oOldContext));
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change})
			.callsFake(function () {
				if (iIndex === undefined) {
					assert.ok(oAddKeptElementExpectation.called);
				} else {
					assert.ok(oDoReplaceWithExpectation.called);
				}
				if (bKeepAlive) {
					assert.ok(oSetKeepAliveExpectation.called);
					assert.ok(oSetKeepAliveExpectation.calledAfter(oDoReplaceWithExpectation));
				}
				assert.strictEqual(oOldContext.iIndex, undefined);
				assert.strictEqual(oBinding.aContexts.indexOf(oNewContext),
					iIndex === undefined ? -1 : iModelIndex);
				assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length,
					iIndex === undefined || bKeepAlive ? 1 : 0);
				assert.strictEqual(oBinding.mPreviousContextsByPath["~old~context~path~"],
					bKeepAlive ? oOldContext : undefined);
				assert.strictEqual(oBinding.mPreviousContextsByPath["~header~context~path~('1')"],
					iIndex === undefined ? oNewContext : undefined);
			});

		assert.strictEqual(
			// code under test
			oBinding.doReplaceWith(oOldContext, oElement, sPredicate),
			oNewContext
		);

		if (bHasOnBeforeDestroy) {
			assert.notOk(oOldContext.fnOnBeforeDestroy.called);

			// code under test
			oSetKeepAliveExpectation.args[0][1]();

			assert.ok(
				oOldContext.fnOnBeforeDestroy.calledOnceWithExactly(sinon.match.same(oNewContext)));
		}
	});
	});
});

	//*********************************************************************************************
	QUnit.test("doReplaceWith: copy the copy", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCacheMock = this.mock(oBinding.oCache),
			oContextMock = this.mock(Context),
			oElement1 = {},
			oElement2 = {},
			oNewContext1 = {
				iIndex : 42,
				getModelIndex : function () { return 42; },
				getPath : function () {
					return "/EMPLOYEES('1')";
				},
				setKeepAlive : function () {}
			},
			oNewContext2 = {
				setKeepAlive : function () {}
			},
			oOldContext = {
				iIndex : 42,
				fnOnBeforeDestroy : sinon.spy(),
				getModelIndex : function () { return 42; },
				getPath : function () {
					return "/EMPLOYEES('0')";
				},
				isKeepAlive : function () {
					return true;
				}
			},
			sPredicate1 = "('1')",
			sPredicate2 = "('2')",
			oSetKeepAliveExpectation1,
			oSetKeepAliveExpectation2;

		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES('1')", 42)
			.returns(oNewContext1);
		oCacheMock.expects("doReplaceWith").withExactArgs(42, sinon.match.same(oElement1));
		oSetKeepAliveExpectation1 = this.mock(oNewContext1).expects("setKeepAlive")
			.withExactArgs(true, sinon.match.func)
			.callsFake(function (_bKeepAlive, fnOnBeforeDestroy1) {
				this.isKeepAlive = function () {
					return true;
				};
				this.fnOnBeforeDestroy = fnOnBeforeDestroy1;
			});
		// ignore call to #_fireChange (no listeners)

		assert.strictEqual(
			// code under test
			oBinding.doReplaceWith(oOldContext, oElement1, sPredicate1),
			oNewContext1
		);

		assert.notOk(oOldContext.fnOnBeforeDestroy.called);

		// code under test
		oSetKeepAliveExpectation1.args[0][1]();

		assert.ok(
			oOldContext.fnOnBeforeDestroy.calledOnceWithExactly(sinon.match.same(oNewContext1)));

		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding),
				"/EMPLOYEES('2')", 42)
			.returns(oNewContext2);
		oCacheMock.expects("doReplaceWith").withExactArgs(42, sinon.match.same(oElement2));
		oSetKeepAliveExpectation2 = this.mock(oNewContext2).expects("setKeepAlive")
			.withExactArgs(true, sinon.match.func);

		assert.strictEqual(
			// code under test
			oBinding.doReplaceWith(oNewContext1, oElement2, sPredicate2),
			oNewContext2
		);

		// code under test
		oSetKeepAliveExpectation2.args[0][1]();

		assert.ok(oOldContext.fnOnBeforeDestroy.calledTwice);
		assert.ok(oOldContext.fnOnBeforeDestroy.secondCall.calledWithExactly(
			sinon.match.same(oNewContext2)));
		assert.notStrictEqual(oOldContext.fnOnBeforeDestroy.args[1][0], oNewContext1);
		assert.strictEqual(oOldContext.fnOnBeforeDestroy.args[1][0], oNewContext2);
	});

	//*********************************************************************************************
	QUnit.test("doReplaceWith: same instance", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oOldContext = {
				getModelIndex : function () {}, // result does not matter
				isKeepAlive : function () {} // result does not matter
			};

		oBinding.mPreviousContextsByPath["/EMPLOYEES('1')"] = oOldContext;
		this.mock(Context).expects("create").never();
		this.mock(oBinding.oCache).expects("doReplaceWith").never();
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		assert.strictEqual(oBinding.doReplaceWith(oOldContext, {}, "('1')"), oOldContext);
	});

	//*********************************************************************************************
	QUnit.test("fireCreateActivate", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oBindingMock = this.mock(oBinding);

		oBinding.iActiveContexts = 40;

		oBindingMock.expects("fireEvent")
			.withExactArgs("createActivate", {context : "~oContext~"}, true)
			.returns(false);

		// code under test
		oBinding.fireCreateActivate("~oContext~");

		assert.strictEqual(oBinding.iActiveContexts, 40);

		oBindingMock.expects("fireEvent")
			.withExactArgs("createActivate", {context : "~oContext~"}, true)
			.returns(true);

		// code under test
		oBinding.fireCreateActivate("~oContext~");

		assert.strictEqual(oBinding.iActiveContexts, 41);
	});

	//*********************************************************************************************
[false, true].forEach(function (bFireChange) {
	QUnit.test("getAllCurrentContexts: bFireChange = " + bFireChange, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		const oCache = {
			getAllElements : function () {}
		};

		this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func, "", true)
			.callsArgWith(0, oCache, "path/to/cache");
		this.mock(oCache).expects("getAllElements").withExactArgs("path/to/cache")
			.returns("~aElements~");
		this.mock(oBinding).expects("createContexts").withExactArgs(0, "~aElements~")
			.returns(bFireChange);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change})
			.exactly(bFireChange ? 1 : 0);

		this.mock(oBinding).expects("_getAllExistingContexts").withExactArgs()
			.returns("~aContexts~");

		// code under test
		assert.deepEqual(oBinding.getAllCurrentContexts(), "~aContexts~");
	});
});

	//*********************************************************************************************
	QUnit.test("getAllCurrentContexts: currently no cache", function (assert) {
		const oBinding = this.bindList("relativePath");

		this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func, "", true);
		this.mock(oBinding).expects("createContexts").never();
		this.mock(oBinding).expects("_fireChange").never();
		this.mock(oBinding).expects("_getAllExistingContexts").withExactArgs()
			.returns("~aResults~");

		// code under test
		const aContexts = oBinding.getAllCurrentContexts();

		assert.strictEqual(aContexts, "~aResults~");
	});

	//*********************************************************************************************
	QUnit.test("_getAllExistingContexts", function (assert) {
		const oBinding = this.bindList("relativePath");

		delete oBinding.aContexts; // call from constructor

		// code under test
		assert.deepEqual(oBinding._getAllExistingContexts(), []);

		oBinding.aContexts = [/*empty*/, undefined, "~oTransientContext~"];
		const oKeptContext0 = {isEffectivelyKeptAlive : function () {}};
		const oKeptContext1 = {isEffectivelyKeptAlive : function () {}};
		const oNotKeptContext = {isEffectivelyKeptAlive : function () {}}; // BCP 2270081950:
		// there is a point in time when contexts with keepAlive=false are present in
		// mPreviousContextsByPath which need be filtered out.

		oBinding.mPreviousContextsByPath = {
			"~sPath1~" : oKeptContext0,
			"~sPath2~" : oKeptContext1,
			"~sPath3~" : oNotKeptContext
		};

		this.mock(oKeptContext0).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oKeptContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oNotKeptContext).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);

		// code under test
		const aContexts = oBinding._getAllExistingContexts();

		assert.strictEqual(aContexts.length, 3);
		assert.strictEqual(aContexts[0], "~oTransientContext~");
		assert.strictEqual(aContexts[1], oKeptContext0);
		assert.strictEqual(aContexts[2], oKeptContext1);
	});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: existing context", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oContext;

		oBinding.createContexts(3, createData(3, 3, true, 6, true)); // simulate a read
		oContext = oBinding.aContexts[4];
		oContext.fnOnBeforeDestroy = "~fnOnBeforeDestroy~";
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs();
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("~sGroupId~");
		this.mock(oContext).expects("setKeepAlive")
			.withExactArgs(true, "~fnOnBeforeDestroy~", "~bRequestMessages~");

		assert.strictEqual(
			// code under test
			oBinding.getKeepAliveContext("/EMPLOYEES('4')", "~bRequestMessages~", "~sGroupId~"),
			oContext);
	});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: kept-alive context not in the list", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			sPath = "/EMPLOYEES('4')",
			oContext = Context.create(this.oModel, oBinding, sPath);

		oBinding.mPreviousContextsByPath[sPath] = oContext;
		oContext.fnOnBeforeDestroy = "~fnOnBeforeDestroy~";
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs();
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("~sGroupId~");
		this.mock(oContext).expects("setKeepAlive")
			.withExactArgs(true, "~fnOnBeforeDestroy~", "~bRequestMessages~");

		assert.strictEqual(
			// code under test
			oBinding.getKeepAliveContext(sPath, "~bRequestMessages~", "~sGroupId~"),
			oContext);
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	[undefined, "group"].forEach(function (sGroupId) {
		var sTitle = "getKeepAliveContext: create context, async=" + bAsync + ", group=" + sGroupId;

	// The test always fails in requestProperty to check that the reporter is attached correctly
	QUnit.test(sTitle, function (assert) {
		var done = assert.async(),
			oAddKeptElementExpectation,
			oParentContext = this.oModel.createBindingContext("/"),
			oBinding = this.bindList("EMPLOYEES", oParentContext),
			oCache = {
				addKeptElement : function () {}
			},
			oContext = {
				requestProperty : function () {},
				setKeepAlive : function () {}
			},
			oError = new Error(),
			oGroupExpectation,
			oHelperMock = this.mock(_Helper),
			sPath = "/EMPLOYEES('4')",
			oPredicateExpectation,
			oSetKeepAliveExpectation,
			oType = {
				$Key : ["a", {b : "c/d"}, "e", {f : "g/h"}]
			};

		oBinding.oCachePromise = bAsync ? Promise.resolve(oCache) : SyncPromise.resolve(oCache);
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs();
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		oHelperMock.expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/EMPLOYEES");
		oHelperMock.expects("getPredicateIndex").withExactArgs(sPath).returns(10);
		this.mock(Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), sPath)
			.returns(oContext);
		oSetKeepAliveExpectation = this.mock(oContext).expects("setKeepAlive")
			.withExactArgs(true, undefined, "~bRequestMessages~");
		oHelperMock.expects("getMetaPath").withExactArgs("/EMPLOYEES").returns("/meta/path");
		this.mock(this.oModel.getMetaModel()).expects("requestObject")
			.withExactArgs("/meta/path/").resolves(oType);
		oPredicateExpectation = oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs({}, "predicate", "('4')");
		oAddKeptElementExpectation = this.mock(oCache).expects("addKeptElement").withExactArgs({});
		oGroupExpectation = oHelperMock.expects("setPrivateAnnotation").exactly(sGroupId ? 1 : 0)
			.withExactArgs({}, "groupId", sGroupId);
		this.mock(oContext).expects("requestProperty").withExactArgs(["a", "c/d", "e", "g/h"])
			.callsFake(function () {
				assert.ok(oSetKeepAliveExpectation.called);
				assert.ok(oPredicateExpectation.called);
				assert.ok(oAddKeptElementExpectation.called);
				assert.ok(oPredicateExpectation.calledBefore(oAddKeptElementExpectation));
				assert.strictEqual(oPredicateExpectation.args[0][0],
					oAddKeptElementExpectation.args[0][0], "same empty object");
				if (sGroupId) { // Note: order not important for this call
					assert.ok(oGroupExpectation.called);
					assert.strictEqual(oGroupExpectation.args[0][0],
						oAddKeptElementExpectation.args[0][0], "same empty object");
				}
				return Promise.reject(oError);
			});
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(function (oError0) {
			assert.strictEqual(oError0, oError);
			done();
		});

		assert.strictEqual(
			// code under test
			oBinding.getKeepAliveContext(sPath, "~bRequestMessages~", sGroupId),
			oContext);
		assert.strictEqual(oBinding.mPreviousContextsByPath[sPath], oContext);
		assert.ok(oSetKeepAliveExpectation.called);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: unresolved", function (assert) {
		var oBinding = this.bindList("EMPLOYEES");

		this.mock(oBinding).expects("checkKeepAlive").withExactArgs();
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(undefined);

		assert.throws(function () {
			// code under test
			oBinding.getKeepAliveContext("/EMPLOYEES('1')");
		}, new Error("Binding is unresolved: " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: missing path", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oError = new Error();

		this.mock(_Helper).expects("getPredicateIndex").withExactArgs(undefined).throws(oError);

		assert.throws(function () {
			// code under test
			oBinding.getKeepAliveContext();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: not a valid context path", function (assert) {
		var oParentContext = this.oModel.createBindingContext("/"),
			oBinding = this.bindList("EMPLOYEES", oParentContext),
			sPath = "/TEAMS('1')";

		this.mock(_Helper).expects("getPredicateIndex").withExactArgs(sPath).returns(6);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/EMPLOYEES");
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs();
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(undefined);

		assert.throws(function () {
			// code under test
			oBinding.getKeepAliveContext(sPath);
		}, new Error(oBinding + ": Not a valid context path: " + sPath));
	});

	//*********************************************************************************************
	QUnit.test("getCacheAndMoveKeepAliveContexts", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
				{$$getKeepAliveContext : true}),
			oCache = {
				setQueryOptions : function () {}
			},
			oContext1 = {},
			oContext2 = {},
			oTemporaryBinding = {
				destroy : function () {},
				oCache : oCache,
				mLateQueryOptions : "~mLateQueryOptions~",
				mParameters : {},
				mPreviousContextsByPath : {
					"/path(1)" : oContext1,
					"/path(2)" : oContext2
				}
			};

		this.mock(this.oModel).expects("releaseKeepAliveBinding").withExactArgs("/path")
			.returns(oTemporaryBinding);
		this.mock(_Helper).expects("clone").withExactArgs("~mQueryOptions~")
			.returns("~mQueryOptionsClone~");
		this.mock(_Helper).expects("aggregateExpandSelect")
			.withExactArgs("~mQueryOptionsClone~", "~mLateQueryOptions~");
		this.mock(oCache).expects("setQueryOptions").withExactArgs("~mQueryOptions~");
		this.mock(oTemporaryBinding).expects("destroy").withExactArgs().callsFake(function () {
			assert.deepEqual(oTemporaryBinding.mPreviousContextsByPath, {});
			assert.strictEqual(oTemporaryBinding.oCache, null);
			assert.strictEqual(oTemporaryBinding.oCachePromise.getResult(), null);
		});

		// code under test
		assert.strictEqual(oBinding.getCacheAndMoveKeepAliveContexts("path", "~mQueryOptions~"),
			oCache);

		assert.strictEqual(oBinding.mLateQueryOptions, "~mQueryOptionsClone~");
		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 2);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/path(1)"], oContext1);
		assert.strictEqual(oBinding.mPreviousContextsByPath["/path(2)"], oContext2);
		assert.strictEqual(oContext1.oBinding, oBinding);
		assert.strictEqual(oContext2.oBinding, oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getCacheAndMoveKeepAliveContexts: no binding", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
				{$$getKeepAliveContext : true});

		oBinding.mLateQueryOptions = "~mLateQueryOptions~";
		this.mock(this.oModel).expects("releaseKeepAliveBinding").withExactArgs("/path")
			.returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getCacheAndMoveKeepAliveContexts("path"), undefined);

		assert.strictEqual(oBinding.mLateQueryOptions, "~mLateQueryOptions~");
		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 0);
	});

	//*********************************************************************************************
	QUnit.test("getCacheAndMoveKeepAliveContexts: unmarked", function (assert) {
		var oBinding = this.bindList("/path");

		oBinding.mLateQueryOptions = "~mLateQueryOptions~";
		this.mock(this.oModel).expects("releaseKeepAliveBinding").never();

		// code under test
		assert.strictEqual(oBinding.getCacheAndMoveKeepAliveContexts("path"), undefined);

		assert.strictEqual(oBinding.mLateQueryOptions, "~mLateQueryOptions~");
		assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 0);
	});

	//*********************************************************************************************
["foo", "bar", "$$patchWithoutSideEffects", "$$updateGroupId"].forEach(function (sParameter) {
	QUnit.test("getCacheAndMoveKeepAliveContexts: mismatch in" + sParameter, function (assert) {
		var oBinding = this.bindList("/path"),
			oTemporaryBinding = {};

		this.mock(this.oModel).expects("releaseKeepAliveBinding").twice().withExactArgs("/path")
			.returns(oTemporaryBinding);

		assert.throws(function () {
			oBinding.mParameters = {$$getKeepAliveContext : true, $count : true};
			oTemporaryBinding.mParameters = {};
			oTemporaryBinding.mParameters[sParameter] = "~";

			// code under test
			oBinding.getCacheAndMoveKeepAliveContexts("path");
		}, new Error(oBinding + ": parameter does not match getKeepAliveContext: " + sParameter));

		assert.throws(function () {
			oBinding.mParameters = {$$getKeepAliveContext : true, $count : true};
			oBinding.mParameters[sParameter] = "~";
			oTemporaryBinding.mParameters = {};

			// code under test
			oBinding.getCacheAndMoveKeepAliveContexts("path");
		}, new Error(oBinding + ": parameter does not match getKeepAliveContext: " + sParameter));
	});
});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: no $$getKeepAliveContext", function (assert) {
		var oBinding = this.bindList("/path");

		this.mock(oBinding).expects("getResolvedPath").never();
		this.mock(oBinding).expects("isRootBindingSuspended").never();

		// code under test
		assert.notOk(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: wrong path", function (assert) {
		var oBinding = this.bindList("/other/path", undefined, undefined, undefined,
			{$$getKeepAliveContext : true});

		oBinding.aContexts = [{}];
		oBinding.mPreviousContextsByPath["/other/path(1)"] = {};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/other/path");
		this.mock(oBinding).expects("isRootBindingSuspended").never();

		// code under test
		assert.notOk(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: not suspended", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
			{$$getKeepAliveContext : true});

		oBinding.aContexts = [{}];
		oBinding.mPreviousContextsByPath["/path(1)"] = {};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);

		// code under test
		assert.ok(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: suspended, no contexts", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
			{$$getKeepAliveContext : true});

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);

		// code under test
		assert.notOk(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: suspended, context in aContexts", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
			{$$getKeepAliveContext : true});

		oBinding.aContexts = [{}];
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);

		// code under test
		assert.ok(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isKeepAliveBindingFor: suspended, kept-alive context", function (assert) {
		var oBinding = this.bindList("/path", undefined, undefined, undefined,
			{$$getKeepAliveContext : true});

		oBinding.mPreviousContextsByPath["/path(1)"] = {};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);

		// code under test
		assert.ok(oBinding.isKeepAliveBindingFor("/path"));
	});

	//*********************************************************************************************
	QUnit.test("isFirstCreateAtEnd", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		// code under test
		assert.strictEqual(oBinding.isFirstCreateAtEnd(), undefined);

		oBinding.bFirstCreateAtEnd = "~foo~";

		// code under test
		assert.strictEqual(oBinding.isFirstCreateAtEnd(), "~foo~");
	});

	//*********************************************************************************************
	QUnit.test("isAncestorOf: Missing recursive hierarchy", function (assert) {
		const oBinding1 = this.bindList("/EMPLOYEES");
		assert.throws(function () {
			// code under test
			oBinding1.isAncestorOf();
		}, new Error("Missing recursive hierarchy"));

		const oBinding2 = this.bindList("/EMPLOYEES", undefined, undefined, undefined,
			{$$aggregation : {}}); // Note: no hierarchyQualifier!
		assert.throws(function () {
			// code under test
			oBinding2.isAncestorOf();
		}, new Error("Missing recursive hierarchy"));
	});

	//*********************************************************************************************
[0, 1].forEach((iIndex) => {
	const sTitle = `isAncestorOf: Not currently part of a recursive hierarchy; iIndex = ${iIndex}`;

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters = {$$aggregation : {hierarchyQualifier : "X"}};
		const oAncestor = {
			iIndex : iIndex, // 1 is correct
			toString : () => "~oAncestor~"
		};
		oBinding.aContexts[1] = oAncestor;
		const oDescendant = {
			iIndex : 42, // 42 always wrong
			toString : () => "~oDescendant~"
		};

		assert.throws(function () {
			// code under test
			oBinding.isAncestorOf(oAncestor, oDescendant);
		}, new Error("Not currently part of a recursive hierarchy: "
			 + (iIndex ? "~oDescendant~" : "~oAncestor~")));
	});
});

	//*********************************************************************************************
	QUnit.test("isAncestorOf", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters = {$$aggregation : {hierarchyQualifier : "X"}};
		const oAncestor = {iIndex : 23};
		oBinding.aContexts[23] = oAncestor;
		const oDescendant = {iIndex : 42};
		oBinding.aContexts[42] = oDescendant;
		oBinding.oCache = {
			isAncestorOf : mustBeMocked
		};
		this.mock(oBinding.oCache).expects("isAncestorOf").withExactArgs(23, 42)
			.returns("~result~");

		// code under test
		assert.strictEqual(oBinding.isAncestorOf(oAncestor, oDescendant), "~result~");

		// code under test (shortcut)
		assert.strictEqual(oBinding.isAncestorOf(oAncestor, null), false);
	});

	//*********************************************************************************************
	QUnit.test("restoreCreated", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {
				getCreatedElements : function () {}
			},
			oElement0 = {},
			oElement1 = {"@$ui5.context.isInactive" : false},
			oElement2 = {"@$ui5.context.isInactive" : true},
			oHelperMock = this.mock(_Helper);

		this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func)
			.callsArgWith(0, oCache, "path/in/cache").returns(SyncPromise.resolve());
		this.mock(this.oModel).expects("getReporter").withExactArgs();
		this.mock(oCache).expects("getCreatedElements").withExactArgs("path/in/cache")
			.returns([oElement0, oElement1, oElement2]);

		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement0, "context").returns("~context0~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement1, "context").returns("~context1~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement2, "context").returns("~context1~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement0, "firstCreateAtEnd").returns(false);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement1, "firstCreateAtEnd").returns(false);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(oElement2, "firstCreateAtEnd").returns(false);

		// code under test
		oBinding.restoreCreated();

		assert.strictEqual(oBinding.aContexts.length, 3);
		assert.strictEqual(oBinding.bFirstCreateAtEnd, false);
		assert.strictEqual(oBinding.iCreatedContexts, 3);
		assert.strictEqual(oBinding.iActiveContexts, 2);
	});

	//*********************************************************************************************
	QUnit.test("restoreCreated: nothing to do", function () {
		var oBinding = this.bindList("/EMPLOYEES"),
			oCache = {}; // no getCreatedElements

		oBinding.aContexts = [{}]; // non-empty
		this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func)
			.callsArgWith(0, oCache, "path/in/cache").returns(SyncPromise.resolve());
		this.mock(this.oModel).expects("getReporter").withExactArgs();

		// code under test
		oBinding.restoreCreated();
	});

	//*********************************************************************************************
[false, true].forEach(function (bMatch) {
	QUnit.test("findContextForCanonicalPath: aContexts, match=" + bMatch, function (assert) {
		var oBinding = this.bindList("/TEAM('1')/TEAM_2_EMPLOYEES"),
			oContext1 = {
				fetchCanonicalPath : function () {}
			},
			oContext2 = {
				fetchCanonicalPath : function () {}
			},
			oContext3 = {
				fetchCanonicalPath : function () {}
			};

		oBinding.aContexts = [oContext1, undefined, oContext2, oContext3];
		this.mock(oContext1).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oContext2).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('2')"));
		this.mock(oContext3).expects("fetchCanonicalPath").exactly(bMatch ? 0 : 1).withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('3')"));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath(bMatch ? "/EMPLOYEES('2')" : "/EMPLOYEES('99')"),
			bMatch ? oContext2 : undefined);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bMatch) {
	var sTitle = "findContextForCanonicalPath: mPreviousContextsByPath, match=" + bMatch;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindList("/TEAM('1')/TEAM_2_EMPLOYEES"),
			oContext1 = {
				fetchCanonicalPath : function () {},
				isEffectivelyKeptAlive : function () {}
			},
			oContext2 = {
				fetchCanonicalPath : function () {},
				isEffectivelyKeptAlive : function () {}
			},
			oContext3 = {
				fetchCanonicalPath : function () {},
				isEffectivelyKeptAlive : function () {}
			},
			oContext4 = {
				isEffectivelyKeptAlive : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			"/TEAM('1')/TEAM_2_EMPLOYEES('1')" : oContext1,
			"/TEAM('2')/TEAM_2_EMPLOYEES('2')" : oContext4,
			"/TEAM('1')/TEAM_2_EMPLOYEES('2')" : oContext2
		};
		oBinding.aContexts = [oContext3];
		this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext1).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oContext4).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext2).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('2')"));
		this.mock(oContext3).expects("fetchCanonicalPath").exactly(bMatch ? 0 : 1).withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('3')"));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath(bMatch ? "/EMPLOYEES('2')" : "/EMPLOYEES('99')"),
			bMatch ? oContext2 : undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: fetchCanonicalPath fails", function (assert) {
		var oBinding = this.bindList("/TEAM('1')/TEAM_2_EMPLOYEES"),
			oContext1 = {
				fetchCanonicalPath : function () {}
			};

		oBinding.aContexts = [oContext1];
		this.mock(oContext1).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject(new Error()));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/EMPLOYEES('2')"),
			undefined);
	});

	//*********************************************************************************************
[false, true].forEach((bIsExpanded) => {
	[1, 4].forEach((iCount) => {
		[false, true].forEach((bMakeRoot) => {
			[23, 42, 101, 999].forEach((iNewIndex) => {
				const sTitle = `move: expanded=${bIsExpanded}, child nodes added=${iCount},
 make root=${bMakeRoot}, new index=${iNewIndex}`;

				if (bMakeRoot && iCount > 1) {
					return;
				}

	QUnit.test(sTitle, function (assert) {
		const oChildContext = {
			getCanonicalPath : mustBeMocked,
			getModelIndex : mustBeMocked
		};
		this.mock(oChildContext).expects("getCanonicalPath").withExactArgs().returns("/~child~");
		const oParentContext = bMakeRoot ? null : {
			getCanonicalPath : mustBeMocked,
			getModelIndex : mustBeMocked
		};
		if (oParentContext) {
			this.mock(oParentContext).expects("getCanonicalPath").withExactArgs()
				.returns("/~parent~");
		}
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("~group~");
		this.mock(oBinding).expects("lockGroup").withExactArgs("~group~", true, true)
			.returns("~oGroupLock~");
		const oCache = {
			move : mustBeMocked
		};
		oBinding.oCache = oCache;
		this.mock(oCache).expects("move").withExactArgs("~oGroupLock~", "~child~",
				bMakeRoot ? null : "~parent~", undefined, undefined)
			.returns({promise : new SyncPromise((resolve) => {
				setTimeout(() => {
					if (oParentContext) {
						this.mock(oParentContext).expects("getModelIndex")
							.exactly(iCount > 1 ? 1 : 0).withExactArgs().returns("~iParentIndex~");
					}
					this.mock(oBinding).expects("insertGap").exactly(iCount > 1 ? 1 : 0)
						.withExactArgs("~iParentIndex~", iCount - 1);
					this.mock(oBinding).expects("collapse").exactly(bIsExpanded ? 1 : 0)
						.withExactArgs(sinon.match.same(oChildContext), true, "~iCollapseCount~");
					for (let i = 0; i < 100; i += 1) {
						if (i % 5) {
							oBinding.aContexts[i] = {iIndex : i};
						} // else: leave some gaps ;-)
					}
					const iOldIndex = iNewIndex === 42 ? 23 : 42; // "the other one"
					this.mock(oChildContext).expects("getModelIndex").withExactArgs()
						.returns(iOldIndex);
					oBinding.aContexts[iOldIndex] = oChildContext;
					this.mock(oBinding).expects("expand").exactly(bIsExpanded ? 1 : 0)
						.withExactArgs(sinon.match.same(oChildContext))
						.returns(SyncPromise.resolve());
					this.mock(oBinding).expects("_fireChange").exactly(bIsExpanded ? 0 : 1)
						.withExactArgs({reason : ChangeReason.Change});

					resolve([iCount, iNewIndex, bIsExpanded ? "~iCollapseCount~" : undefined]);
				}, 0);
			}), refresh : false});

		// code under test
		const oSyncPromise = oBinding.move(oChildContext, bMakeRoot ? null : oParentContext);

		assert.strictEqual(oSyncPromise.isPending(), true);

		return oSyncPromise.then(function (vResult) {
			assert.strictEqual(vResult, undefined, "without a defined result");
			assert.strictEqual(oBinding.aContexts[iNewIndex], oChildContext);
			assert.strictEqual(oChildContext.iIndex, iNewIndex);
			for (let i = 0; i < 100; i += 1) {
				if (oBinding.aContexts[i]) {
					assert.strictEqual(oBinding.aContexts[i].iIndex, i, `iIndex @ ${i}`);
				}
			}
		});
	});
			});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach((bMakeRoot) => {
	[undefined, null, {}].forEach((oSiblingContext) => {
		const sTitle = `move: refresh; make root=${bMakeRoot}, with sibling=${oSiblingContext}`;

	QUnit.test(sTitle, async function (assert) {
		const oChildContext = {
			getCanonicalPath : mustBeMocked,
			getPath : mustBeMocked
		};
		this.mock(oChildContext).expects("getCanonicalPath").withExactArgs().returns("/~child~");
		const bHasSibling = oSiblingContext !== undefined;
		this.mock(oChildContext).expects("getPath").exactly(bHasSibling ? 1 : 0)
			.withExactArgs().returns("/~childNonCanonical~");
		const oParentContext = bMakeRoot ? null : {
			getCanonicalPath : mustBeMocked
		};
		if (oParentContext) {
			this.mock(oParentContext).expects("getCanonicalPath").withExactArgs()
				.returns("/~parent~");
		}
		let sSiblingPath = oSiblingContext;
		if (oSiblingContext) {
			sSiblingPath = "~sibling~";
			oSiblingContext.getCanonicalPath = mustBeMocked;
			this.mock(oSiblingContext).expects("getCanonicalPath").withExactArgs()
				.returns("/~sibling~");
		}
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		this.mock(oBinding).expects("collapse").never();
		this.mock(oBinding).expects("expand").never();
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("~group~");
		this.mock(oBinding).expects("lockGroup").withExactArgs("~group~", true, true)
			.returns("~oGroupLock~");
		const oCache = {
			move : mustBeMocked
		};
		oBinding.oCache = oCache;
		const fnGetIndex = sinon.stub().returns("~index~");
		this.mock(oCache).expects("move")
			.withExactArgs("~oGroupLock~", "~child~", bMakeRoot ? null : "~parent~", sSiblingPath,
				bHasSibling ? "~childNonCanonical~" : undefined)
			.returns({promise : "A", refresh : true});
		this.mock(oBinding).expects("requestSideEffects").withExactArgs("~group~", [""])
			.returns("B");
		this.mock(SyncPromise).expects("all").withExactArgs(["A", "B"])
			.returns(SyncPromise.resolve(Promise.resolve([fnGetIndex])));
		this.mock(oBinding).expects("insertGap").never();
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		const oSyncPromise = oBinding.move(oChildContext, bMakeRoot ? null : oParentContext,
			oSiblingContext);

		assert.strictEqual(oSyncPromise.isPending(), true);
		assert.notOk(fnGetIndex.called);

		await oSyncPromise;

		assert.strictEqual(oChildContext.iIndex, "~index~");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("move: fails", function (assert) {
		const oChildContext = {
			getCanonicalPath : mustBeMocked
		};
		this.mock(oChildContext).expects("getCanonicalPath").withExactArgs().returns("/~child~");
		const oParentContext = {
			getCanonicalPath : mustBeMocked
		};
		this.mock(oParentContext).expects("getCanonicalPath").withExactArgs().returns("/~parent~");
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		this.mock(oBinding).expects("collapse").never();
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("~group~");
		this.mock(oBinding).expects("lockGroup").withExactArgs("~group~", true, true)
			.returns("~oGroupLock~");
		const oCache = {
			move : mustBeMocked
		};
		oBinding.oCache = oCache;
		this.mock(oCache).expects("move")
			.withExactArgs("~oGroupLock~", "~child~", "~parent~", undefined, undefined)
			.returns({promise : SyncPromise.reject("~error~"), refresh : false});
		this.mock(oBinding).expects("expand").never();

		// code under test
		const oSyncPromise = oBinding.move(oChildContext, oParentContext);

		assert.strictEqual(oSyncPromise.isRejected(), true);
		assert.strictEqual(oSyncPromise.getResult(), "~error~");

		oSyncPromise.caught(); // avoid "Uncaught (in promise)"
	});

	//*********************************************************************************************
	QUnit.test("move: no refresh, expand fails", function (assert) {
		const oChildContext = {
			created : mustBeMocked,
			getCanonicalPath : mustBeMocked,
			getModelIndex : mustBeMocked
		};
		const oBinding = this.bindList("/EMPLOYEES");
		// Note: autoExpandSelect at model would be required for hierarchyQualifier, but that leads
		// too far :-(
		oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("~group~");
		this.mock(oBinding).expects("lockGroup").withExactArgs("~group~", true, true)
			.returns("~oGroupLock~");
		this.mock(oChildContext).expects("getCanonicalPath").withExactArgs().returns("/~child~");
		const oCache = {
			move : mustBeMocked
		};
		oBinding.oCache = oCache;
		this.mock(oCache).expects("move")
			.withExactArgs("~oGroupLock~", "~child~", null, undefined, undefined)
			.returns({promise : SyncPromise.resolve([1, 43, "~iCollapseCount~"]), refresh : false});
		this.mock(oBinding).expects("requestSideEffects").never();
		this.mock(oBinding).expects("insertGap").never();
		this.mock(oBinding).expects("collapse")
			.withExactArgs(sinon.match.same(oChildContext), true, "~iCollapseCount~");
		this.mock(oChildContext).expects("getModelIndex").withExactArgs().returns(43);
		this.mock(oBinding).expects("expand")
			.withExactArgs(sinon.match.same(oChildContext))
			.returns(SyncPromise.reject("~error~"));
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		const oSyncPromise = oBinding.move(oChildContext, null);

		assert.strictEqual(oSyncPromise.isRejected(), true);
		assert.strictEqual(oSyncPromise.getResult(), "~error~");

		oSyncPromise.caught(); // avoid "Uncaught (in promise)"
	});

	//*********************************************************************************************
	QUnit.test("move: throws", function (assert) {
		const oBinding = this.bindList("/EMPLOYEES");

		assert.throws(function () {
			// code under test
			oBinding.move();
		}, new Error("Missing recursive hierarchy"));

		oBinding.setAggregation({group : {dimension : {}}});

		assert.throws(function () {
			// code under test
			oBinding.move();
		}, new Error("Missing recursive hierarchy"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bRefreshFails) {
	var sTitle = "onChange: " + (bRefreshFails ? ": refresh" : "checkUpdate") + " fails";

	QUnit.test(sTitle, function (assert) {
		var done = assert.async(),
			oBinding = this.bindList("/EMPLOYEES"),
			oDependent1 = {
				refreshInternal : function () {}
			},
			oDependent2 = {
				refreshInternal : function () {}
			},
			oDependentsExpectation,
			oRejectedPromise = Promise.reject("~oError~"),
			oResetExpectation;

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("refreshSuspended").never();
		oDependentsExpectation = this.mock(oBinding).expects("getDependentBindings")
			.withExactArgs().returns([oDependent1, oDependent2]);
		oResetExpectation = this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Refresh);
		this.mock(oDependent1).expects("refreshInternal").withExactArgs("").resolves();
		this.mock(oDependent2).expects("refreshInternal").withExactArgs("")
			.returns(bRefreshFails ? oRejectedPromise : Promise.resolve());
		this.mock(oBinding.oHeaderContext).expects("checkUpdateInternal")
			.exactly(bRefreshFails ? 0 : 1).withExactArgs().returns(oRejectedPromise);
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(function (oError) {
			assert.strictEqual(oError, "~oError~");
			done();
		});

		// code under test
		oBinding.onChange();

		assert.ok(oDependentsExpectation.calledBefore(oResetExpectation));

		oRejectedPromise.catch(function () {});
	});
});

	//*********************************************************************************************
	QUnit.test("onChange: refreshing", function () {
		var oBinding = this.bindList("/EMPLOYEES");

		oBinding.oRefreshPromise = "~oRefreshPromise~";
		this.mock(oBinding).expects("isRootBindingSuspended").never();
		this.mock(oBinding).expects("refreshSuspended").never();
		this.mock(oBinding).expects("getDependentBindings").never();
		this.mock(oBinding).expects("reset").never();
		this.mock(oBinding.oHeaderContext).expects("checkUpdateInternal").never();

		// code under test
		oBinding.onChange();
	});

	//*********************************************************************************************
	QUnit.test("onChange: suspended", function (assert) {
		var oBinding = this.bindList("/EMPLOYEES");

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("getDependentBindings").never();
		this.mock(oBinding).expects("reset").never();
		this.mock(oBinding.oHeaderContext).expects("checkUpdateInternal").never();

		// code under test
		oBinding.onChange();

		assert.strictEqual(oBinding.sResumeAction, "onChange");
	});

	//*********************************************************************************************
	QUnit.test("getKeepAlivePredicates", function (assert) {
		var oBinding = this.bindList("/n/a"), // absolute, but path is irrelevant
			oContext0 = {
				getPath : function () {},
				isEffectivelyKeptAlive : function () {}
			},
			oContext1 = {
				isEffectivelyKeptAlive : function () {}
			},
			oContext2 = {
				getPath : function () {},
				isEffectivelyKeptAlive : function () {}
			},
			oContext3 = {
				isEffectivelyKeptAlive : function () {}
			},
			oContext4 = {
				getPath : function () {},
				isEffectivelyKeptAlive : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			a : oContext0,
			b : oContext1,
			c : oContext2
		};
		oBinding.aContexts = [oContext3, oContext4];
		this.mock(oBinding.getHeaderContext()).expects("getPath").withExactArgs()
			.returns("/binding/path");
		this.mock(oContext0).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext3).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oContext4).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oContext0).expects("getPath").withExactArgs().returns("/binding/path('0')");
		this.mock(oContext2).expects("getPath").withExactArgs().returns("/binding/path('2')");
		this.mock(oContext4).expects("getPath").withExactArgs().returns("/binding/path('4')");

		assert.deepEqual(
			oBinding.getKeepAlivePredicates(), // code under test
			["('0')", "('2')", "('4')"]
		);
	});

	//*********************************************************************************************
	QUnit.test("getKeepAlivePredicates: unresolved", function (assert) {
		var oBinding = this.bindList("n/a"); // relative, but path is irrelevant

		// code under test
		assert.deepEqual(oBinding.getKeepAlivePredicates(), []);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasQueryOptions) {
	QUnit.test("prepareDeepCreate: queryOptions=" + bHasQueryOptions, function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oCache = {
				addTransientCollection : function () {}
			},
			oContext = {
				getPath : function () {},
				withCache : function () {}
			},
			aCollection = ["~a~", "~b~"],
			oContextMock = this.mock(Context),
			aCreatedPromises = [SyncPromise.reject("~oError~"), SyncPromise.reject("~oError~")],
			aCreatedContexts = [{
				nr : 0,
				created : function () { return aCreatedPromises[0]; }
			}, {
				nr : 1,
				created : function () { return aCreatedPromises[1]; }
			}],
			oExpectation,
			oHelperMock = this.mock(_Helper),
			oModelMock = this.mock(this.oModel),
			mQueryOptions = bHasQueryOptions ? {$select : "~select~"} : undefined,
			aReporters = [sinon.spy(), sinon.spy()],
			that = this;

		this.oModel.bAutoExpandSelect = true;
		this.mock(oContext).expects("getPath")
			.withExactArgs().returns("/SalesOrderList($uid=1)");
		this.mock(ODataListBinding).expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oContext)).returns(false);
		oExpectation = this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "SO_2_SOITEM");

		// code under test
		assert.strictEqual(oBinding.prepareDeepCreate(oContext, mQueryOptions), true);

		this.mock(oCache).expects("addTransientCollection")
			.withExactArgs("path/in/cache", bHasQueryOptions ? "~select~" : undefined)
			.returns(aCollection);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");
		aCollection.forEach(function (oEntity, i) {
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(oEntity, "transientPredicate").returns("~predicate~" + i);
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(oEntity, "promise").returns("~promise~" + i);
			oContextMock.expects("create")
				.withExactArgs(sinon.match.same(that.oModel), sinon.match.same(oBinding),
					"/resolved/path~predicate~" + i, i - 2, "~promise~" + i, false, true)
				.returns(aCreatedContexts[i]);
			oModelMock.expects("getReporter").withExactArgs().returns(aReporters[i]);
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(oEntity, "context", sinon.match.same(aCreatedContexts[i]));
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(oEntity, "firstCreateAtEnd", false);
			oHelperMock.expects("deletePrivateAnnotation").withExactArgs(oEntity, "promise");
		});

		// code under test - callback
		oExpectation.args[0][0](oCache, "path/in/cache");

		assert.strictEqual(oBinding.mCacheQueryOptions, mQueryOptions);
		assert.deepEqual(oBinding.aContexts, aCreatedContexts);
		assert.strictEqual(oBinding.iCreatedContexts, 2);
		assert.strictEqual(oBinding.iActiveContexts, 2);
		assert.strictEqual(oBinding.bFirstCreateAtEnd, false);
		sinon.assert.calledOnceWithExactly(aReporters[0], "~oError~");
		sinon.assert.calledOnceWithExactly(aReporters[1], "~oError~");
	});
});

	//*********************************************************************************************
	QUnit.test("prepareDeepCreate: transient context, but no autoExpandSelect", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oContext = {
				getPath : function () {}
			};

		this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList($uid=1)");

		// code under test
		assert.strictEqual(oBinding.prepareDeepCreate(oContext, "~mQueryOptions~"), true);

		assert.strictEqual(oBinding.mCacheQueryOptions, "~mQueryOptions~");
	});

	//*********************************************************************************************
	QUnit.test("prepareDeepCreate: below aggregation", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oContext = {
				getPath : mustBeMocked
			};

		this.oModel.bAutoExpandSelect = true;
		this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList($uid=1)");
		this.mock(ODataListBinding).expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oContext)).returns(true);

		// code under test
		assert.strictEqual(oBinding.prepareDeepCreate(oContext, "~mQueryOptions~"), true);

		assert.strictEqual(oBinding.mCacheQueryOptions, "~mQueryOptions~");
	});

	//*********************************************************************************************
	QUnit.test("prepareDeepCreate: nothing to do", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oContext = {
				getPath : function () {}
			};

		// code under test - absolute or unresolved
		assert.strictEqual(oBinding.prepareDeepCreate(undefined, "~mQueryOptions~"), false);

		// code under test - virtual context
		assert.strictEqual(
			oBinding.prepareDeepCreate({iIndex : Context.VIRTUAL}, "~mQueryOptions~"),
			true);

		this.mock(oContext).expects("getPath").twice()
			.withExactArgs().returns("/SalesOrderList('1')");

		// code under test - context not transient, query options
		assert.strictEqual(oBinding.prepareDeepCreate(oContext, {}), false);

		// code under test - context not transient, no query options
		assert.strictEqual(oBinding.prepareDeepCreate(oContext, undefined), true);
	});

	//*********************************************************************************************
	QUnit.test("updateAfterCreate: deep create, bSkipRefresh=true", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oPromise,
			oResetExpectation,
			oUpdateExpectation;

		oBinding.iCreatedContexts = 5;
		oResetExpectation = this.mock(oBinding).expects("reset")
			.withExactArgs(ChangeReason.Change, true);
		oUpdateExpectation = this.mock(asODataParentBinding.prototype).expects("updateAfterCreate")
			.withExactArgs(true, "group")
			.returns(SyncPromise.reject("~oError~"));
		this.mock(oBinding).expects("requestSideEffects").never();

		// code under test
		oPromise = oBinding.updateAfterCreate(true, "group");

		return oPromise.then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
			assert.ok(oUpdateExpectation.calledAfter(oResetExpectation));
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bSideEffectFails) {
	QUnit.test("updateAfterCreate: deep create, bSkipRefresh=false", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oFetchContextsExpectation,
			oResetExpectation,
			oUpdateExpectation;

		oBinding.iCreatedContexts = 5;
		oResetExpectation = this.mock(oBinding).expects("reset").withExactArgs(undefined, true);
		oFetchContextsExpectation = this.mock(oBinding).expects("fetchContexts")
			.withExactArgs(0, Infinity, 0, sinon.match.same(_GroupLock.$cached))
			.callsFake(function () {
				return SyncPromise.resolve(Promise.resolve().then(function () {
					oBinding.aContexts = [{}, {}, {}]; // unrealistic, would have 5 elements
				}));
			});
		this.mock(oBinding).expects("fetchValue").withExactArgs("", null, true)
			.returns(SyncPromise.resolve("~value~"));
		this.mock(_Helper).expects("getMissingPropertyPaths")
			.withExactArgs("~value~", sinon.match.same(oBinding.mAggregatedQueryOptions))
			.returns("~aMissingProperties~");
		this.mock(oBinding).expects("requestSideEffects")
			.withExactArgs("group", "~aMissingProperties~")
			.callsFake(function () {
				assert.strictEqual(oBinding.iCurrentEnd, 3);
				return bSideEffectFails
					? SyncPromise.resolve(Promise.reject("~oError~"))
					: SyncPromise.resolve(Promise.resolve());
			});
		this.mock(oBinding).expects("_fireChange").exactly(bSideEffectFails ? 0 : 1)
			.withExactArgs({reason : ChangeReason.Change});
		oUpdateExpectation = this.mock(asODataParentBinding.prototype).expects("updateAfterCreate")
			.withExactArgs(false, "group")
			.returns(bSideEffectFails
				? SyncPromise.resolve(Promise.resolve())
				: SyncPromise.resolve(Promise.reject("~oError~")));

		// code under test
		return oBinding.updateAfterCreate(false, "group").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
			assert.ok(oUpdateExpectation.calledAfter(oResetExpectation));
			assert.ok(oFetchContextsExpectation.calledAfter(oResetExpectation));
		});
	});
});

	//*********************************************************************************************
	QUnit.test("updateAfterCreate: no deep create", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM");

		oBinding.iCreatedContexts = 0;
		this.mock(oBinding).expects("refreshInternal")
			.withExactArgs("", "group")
			.returns(SyncPromise.reject("~oError~"));

		// code under test
		return oBinding.updateAfterCreate("~bSkipRefresh~", "group").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});

	//*********************************************************************************************
	QUnit.test("isBelowCreated", function (assert) {
		var oBinding = {
				getContext : function () {},
				isRelative : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext = {
				getBinding : function () {},
				isTransient : function () {}
			},
			oContextMock = this.mock(oContext),
			oListBindingMock = this.mock(ODataListBinding);

		assert.notOk(ODataListBinding.isBelowCreated(undefined), "no context");

		assert.notOk(ODataListBinding.isBelowCreated({}), "base context");

		oContextMock.expects("isTransient").withExactArgs().returns(false);

		assert.ok(ODataListBinding.isBelowCreated(oContext), "created-persisted context");

		oContextMock.expects("isTransient").withExactArgs().returns(undefined);
		oContextMock.expects("getBinding").withExactArgs().returns(undefined);

		assert.notOk(ODataListBinding.isBelowCreated(oContext), "unresolved standard context");

		oContextMock.expects("isTransient").withExactArgs().returns(undefined);
		oContextMock.expects("getBinding").withExactArgs().returns(oBinding);
		oBindingMock.expects("isRelative").withExactArgs().returns(false);

		assert.notOk(ODataListBinding.isBelowCreated(oContext), "context at absolute binding");

		oListBindingMock.expects("isBelowCreated").withExactArgs(sinon.match.same(oContext))
			.callThrough(); // initial call
		oContextMock.expects("isTransient").withExactArgs().returns(true);
		oContextMock.expects("getBinding").withExactArgs().returns(oBinding);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		oBindingMock.expects("getContext").withExactArgs().returns("~oParentContext~");
		oListBindingMock.expects("isBelowCreated").withExactArgs("~oParentContext~").returns("~");

		assert.strictEqual(ODataListBinding.isBelowCreated(oContext), "~",
			"nested transient context");
	});

	//*********************************************************************************************
	QUnit.test("checkDeepCreate", function (assert) {
		var oBinding = this.bindList("SO_2_SOITEM"),
			oListBindingMock = this.mock(ODataListBinding);

		assert.throws(function () {
			// code under test
			oBinding.checkDeepCreate();
		}, new Error("Deep create is only supported with autoExpandSelect"));

		this.oModel.bAutoExpandSelect = true;
		oBinding.oContext = {isTransient : function () { return true; }};
		oListBindingMock.expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oBinding.oContext)).returns(false);

		// code under test
		oBinding.checkDeepCreate();

		oListBindingMock.expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oBinding.oContext)).returns(true);

		assert.throws(function () {
			// code under test
			oBinding.checkDeepCreate();
		}, new Error("Deep create is not supported with data aggregation"));

		oBinding.oContext = {isTransient : function () { return false; }};
		oListBindingMock.expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oBinding.oContext)).returns(false);

		assert.throws(function () {
			// code under test
			oBinding.checkDeepCreate();
		}, new Error("Unexpected ODataContextBinding in deep create"));

		oBinding = this.bindList("SO_2_SOITEM/SOITEM_2_SCHDL");
		oBinding.oContext = {isTransient : function () { return true; }};
		oListBindingMock.expects("isBelowAggregation")
			.withExactArgs(sinon.match.same(oBinding.oContext)).returns(false);

		assert.throws(function () {
			// code under test
			oBinding.checkDeepCreate();
		}, new Error("Invalid path 'SO_2_SOITEM/SOITEM_2_SCHDL' in deep create"));
	});

	//*********************************************************************************************
	QUnit.test("hasFilterNone", function (assert) {
		const oBinding = this.bindList("/SalesOrderList", undefined, undefined, undefined, {
			$$operationMode : OperationMode.Server
		});

		// code under test
		assert.strictEqual(oBinding.hasFilterNone(), false);

		oBinding.filter(Filter.NONE);

		// code under test
		assert.strictEqual(oBinding.hasFilterNone(), true);

		oBinding.filter(); // clear application filter
		oBinding.filter(Filter.NONE, FilterType.Control);

		// code under test
		assert.strictEqual(oBinding.hasFilterNone(), true);
	});

	//*********************************************************************************************
	QUnit.test("onKeepAliveChanged: remove from cache", function () {
		var oBinding = this.bindList("/SalesOrderList"),
			oContext = {
				isDeleted : function () {},
				isEffectivelyKeptAlive : function () {},
				getPath : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			"/SalesOrderList('1')" : "~" // would actually be the context
		};
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").twice()
			.withExactArgs().returns("/SalesOrderList('1')");
		this.mock(oContext).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
		this.mock(oBinding).expects("destroyPreviousContextsLater")
			.withExactArgs(["/SalesOrderList('1')"]);

		// code under test
		oBinding.onKeepAliveChanged(oContext);
	});

	//*********************************************************************************************
	QUnit.test("onKeepAliveChanged: deleted", function () {
		var oBinding = this.bindList("/SalesOrderList"),
			oContext = {
				isDeleted : function () {}
			};

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(true);
		this.mock(oBinding).expects("destroyPreviousContextsLater").never();

		// code under test
		oBinding.onKeepAliveChanged(oContext);
	});

	//*********************************************************************************************
	QUnit.test("onKeepAliveChanged: in the binding's collection", function () {
		var oBinding = this.bindList("/SalesOrderList"),
			oContext = {
				isDeleted : function () {},
				getPath : function () {}
			};

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList('1')");
		this.mock(oBinding).expects("destroyPreviousContextsLater").never();

		// code under test
		oBinding.onKeepAliveChanged(oContext);
	});

	//*********************************************************************************************
	QUnit.test("onKeepAliveChanged: effectively kept alive", function () {
		var oBinding = this.bindList("/SalesOrderList"),
			oContext = {
				isDeleted : function () {},
				isEffectivelyKeptAlive : function () {},
				getPath : function () {}
			};

		oBinding.mPreviousContextsByPath = {
			"/SalesOrderList('1')" : oContext
		};
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList('1')");
		this.mock(oContext).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
		this.mock(oBinding).expects("destroyPreviousContextsLater").never();

		// code under test
		oBinding.onKeepAliveChanged(oContext);
	});

	//*********************************************************************************************
	QUnit.test("isBelowAggregation", function (assert) {
		assert.strictEqual(ODataListBinding.isBelowAggregation(), false);

		assert.strictEqual(ODataListBinding.isBelowAggregation({/*base context*/}), false);

		let oContext = {getBinding : mustBeMocked};
		const oContextBinding = {};
		this.mock(oContext).expects("getBinding").withExactArgs().returns(oContextBinding);
		assert.strictEqual(ODataListBinding.isBelowAggregation(oContext), false);

		oContext = {getBinding : mustBeMocked};
		const oListBinding = {getAggregation : mustBeMocked};
		const oListBindingMock = this.mock(oListBinding);
		this.mock(oContext).expects("getBinding").twice().withExactArgs().returns(oListBinding);
		oListBindingMock.expects("getAggregation").withExactArgs().returns(undefined);
		assert.strictEqual(ODataListBinding.isBelowAggregation(oContext), false);

		oListBindingMock.expects("getAggregation").withExactArgs().returns({});
		assert.strictEqual(ODataListBinding.isBelowAggregation(oContext), true);
	});

	//*********************************************************************************************
	QUnit.test("setResetViaSideEffects ", function (assert) {
		const oBinding = this.bindList("/SalesOrderList");

		assert.strictEqual(oBinding.bResetViaSideEffects, undefined);

		// code under test
		oBinding.setResetViaSideEffects(true);
		assert.strictEqual(oBinding.bResetViaSideEffects, true);

		// code under test
		oBinding.setResetViaSideEffects(false);
		assert.strictEqual(oBinding.bResetViaSideEffects, false);

		// code under test
		oBinding.setResetViaSideEffects(true);
		assert.strictEqual(oBinding.bResetViaSideEffects, false, "true must not win over false");
	});
});

//TODO integration: 2 entity sets with same $expand, but different $select
//TODO extended change detection:
//     Wir sollten auch dafür sorgen, dass die Antwort auf diesen "change"-Event dann keinen Diff
//     enthält. So macht es v2, und das haben wir letzte Woche erst richtig verstanden.
