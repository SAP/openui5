/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/FilterProcessor"
], function (Log, ClientListBinding, FilterProcessor) {
	/*global QUnit, sinon*/
	"use strict";

	var MyClientListBinding = ClientListBinding.extend("MyClientListBinding", {
			constructor : function () {
				ClientListBinding.apply(this, arguments);
			}
		});

	MyClientListBinding.prototype.update = function () {};

	//*********************************************************************************************
	QUnit.module("sap.ui.model.ClientListBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//**********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oBinding,
			aFilters = [],
			oModel = {
				checkFilter : function () {}
			};

		this.mock(oModel).expects("checkFilter").withExactArgs(sinon.match.same(aFilters));
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs([], sinon.match.same(aFilters))
			.returns("~combinedFilters");
		this.mock(MyClientListBinding.prototype).expects("update").withExactArgs();

		// code under test
		oBinding = new MyClientListBinding(oModel, "/path", /*oContext*/undefined,
			/*aSorters*/undefined, aFilters);

		assert.deepEqual(oBinding.mNormalizeCache, {});
		assert.strictEqual(oBinding.oCombinedFilter, "~combinedFilters");
		assert.strictEqual(oBinding.bIgnoreSuspend, false);
		assert.ok(oBinding.hasOwnProperty("aLastContextData"));
		assert.strictEqual(oBinding.aLastContextData, undefined);
		assert.ok(oBinding.hasOwnProperty("aLastContexts"));
		assert.strictEqual(oBinding.aLastContexts, undefined);
		assert.ok(oBinding.hasOwnProperty("iLastEndIndex"));
		assert.strictEqual(oBinding.iLastEndIndex, undefined);
		assert.ok(oBinding.hasOwnProperty("iLastLength"));
		assert.strictEqual(oBinding.iLastLength, undefined);
		assert.ok(oBinding.hasOwnProperty("iLastStartIndex"));
		assert.strictEqual(oBinding.iLastStartIndex, undefined);
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: ECD with last contexts", function (assert) {
		var oBinding = {bUseExtendedChangeDetection : true, aLastContexts : "~aLastContexts"};

		// code under test
		assert.strictEqual(
			ClientListBinding.prototype.getCurrentContexts.call(oBinding),
			"~aLastContexts");
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: ECD without last contexts", function (assert) {
		var oBinding = {bUseExtendedChangeDetection : true};

		// code under test
		assert.deepEqual(ClientListBinding.prototype.getCurrentContexts.call(oBinding), []);
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: no ECD", function (assert) {
		var oBinding = {
				bUseExtendedChangeDetection : false,
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				getContexts : function () {}
			};

		this.mock(oBinding).expects("getContexts")
			.withExactArgs("~iLastStartIndex", "~iLastLength")
			.returns("~aContexts");

		// code under test
		assert.strictEqual(
			ClientListBinding.prototype.getCurrentContexts.call(oBinding),
			"~aContexts");
	});

	//**********************************************************************************************
	QUnit.test("getContexts: throws error of _updateLastStartAndLength", function (assert) {
		var oBinding = {
				_updateLastStartAndLength : function () {}
			},
			oError = new Error("foo");

		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs("~iStartIndex", "~iLength", "~iMaximumPrefetchSize", "~bKeepCurrent")
			.throws(oError);

		assert.throws(function () {
			// code under test
			ClientListBinding.prototype.getContexts.call(oBinding, "~iStartIndex", "~iLength",
				"~iMaximumPrefetchSize", "~bKeepCurrent");
		}, oError);
	});

	//**********************************************************************************************
	QUnit.test("getContexts: bKeepCurrent=true, no ECD", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				_updateLastStartAndLength : function () {},
				_getContexts : function () {}
			};

		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(7, 5, "~iMaximumPrefetchSize", true);
		this.mock(oBinding).expects("_getContexts").withExactArgs(7, 5).returns("~aContexts");

		// code under test
		assert.strictEqual(
			ClientListBinding.prototype.getContexts.call(oBinding, 7, 5, "~iMaximumPrefetchSize",
				true),
			"~aContexts");

		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
		assert.strictEqual(oBinding.aLastContexts, undefined);
		assert.strictEqual(oBinding.aLastContextData, undefined);
	});

	//**********************************************************************************************
	QUnit.test("getContexts: defaulting start and length, no ECD", function (assert) {
		var oBinding = {
				iLength : "~iLength",
				oModel : {iSizeLimit : "iSizeLimit"},
				_updateLastStartAndLength : function () {},
				_getContexts : function () {}
			};

		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(undefined, undefined, undefined, undefined);
		this.mock(Math).expects("min").withExactArgs("~iLength", "iSizeLimit").returns("~length");
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, "~length")
			.returns("~aContexts");

		// code under test
		assert.strictEqual(
			ClientListBinding.prototype.getContexts.call(oBinding),
			"~aContexts");
	});

	//**********************************************************************************************
[
	{isDiffCalled : false},
	{aLastContextData : "~aLastContextData", isDiffCalled : false},
	{
		aLastContextData : "~aLastContextData",
		iLastEndIndex : 1,
		iLastLength : 1,
		iLastStartIndex : 0,
		isDiffCalled : false
	},
	{iLastEndIndex : 20, iLastLength : 5, iLastStartIndex : 15, isDiffCalled : false},
	{
		aLastContextData : "~aLastContextData",
		iLastEndIndex : 20,
		iLastLength : 5,
		iLastStartIndex : 15,
		isDiffCalled : true
	}
].forEach(function (oFixture, i) {
	QUnit.test("getContexts: with ECD, #" + i, function (assert) {
		var oBinding = {
				aLastContextData : oFixture.aLastContextData,
				iLastEndIndex : oFixture.iLastEndIndex,
				iLastLength : oFixture.iLastLength,
				iLastStartIndex : oFixture.iLastStartIndex,
				bUseExtendedChangeDetection : true,
				_updateLastStartAndLength : function () {},
				_getContexts : function () {},
				diffData : function () {},
				getContextData : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aContexts = ["~context3", "~context4"],
			aResult;

		oBindingMock.expects("_updateLastStartAndLength")
			.withExactArgs(3, 2, "~iMaximumPrefetchSize", undefined)
			.callsFake(function () {
				// simulate call to ensure that last end index is compute before last start and
				// last length are updated
				this.iLastLength = 2;
				this.iLastStartIndex = 3;
			});
		oBindingMock.expects("_getContexts").withExactArgs(3, 2).returns(aContexts);
		oBindingMock.expects("getContextData").withExactArgs("~context3").returns("~data3");
		oBindingMock.expects("getContextData").withExactArgs("~context4").returns("~data4");
		oBindingMock.expects("diffData")
			.withExactArgs(oFixture.aLastContextData, ["~data3", "~data4"])
			.exactly(oFixture.isDiffCalled ? 1 : 0)
			.returns("~diff");

		// code under test
		aResult = ClientListBinding.prototype.getContexts.call(oBinding, 3, 2,
			"~iMaximumPrefetchSize"/*, bKeepCurrent === true is not supporte*/);

		assert.strictEqual(aResult, aContexts);
		assert.notStrictEqual(oBinding.aLastContexts, aContexts);
		assert.strictEqual(oBinding.iLastEndIndex, 5);
		assert.deepEqual(oBinding.aLastContexts, aContexts);
		assert.deepEqual(oBinding.aLastContextData, ["~data3", "~data4"]);
		assert.strictEqual(aResult.diff, oFixture.isDiffCalled ? "~diff" : undefined);
	});
});

	//**********************************************************************************************
	QUnit.test("getContexts: cancel ECD as computation of context data failed", function (assert) {
		var oBinding = {
				aLastContextData : "~aLastContextData",
				aLastContexts : "~aLastContexts",
				iLastLength : 5,
				iLastStartIndex : 15,
				bUseExtendedChangeDetection : true,
				_updateLastStartAndLength : function () {},
				_getContexts : function () {},
				diffData : function () {},
				getContextData : function () {},
				getMetadata : function () {},
				getResolvedPath : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aContexts = ["~context3", "~context4"],
			oError = new Error("foo"),
			oMetadata = {getName : function () {}},
			aResult;

		oBindingMock.expects("_updateLastStartAndLength")
			.withExactArgs(3, 2, "~maxPrefetchSize", undefined);
		oBindingMock.expects("_getContexts").withExactArgs(3, 2).returns(aContexts);
		oBindingMock.expects("getContextData").withExactArgs("~context3").returns("~data3");
		oBindingMock.expects("getContextData")
			.withExactArgs("~context4")
			.throws(oError);
		oBindingMock.expects("diffData").never();
		oBindingMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		this.mock(oMetadata).expects("getName").withExactArgs().returns("~classname");
		this.oLogMock.expects("warning")
			.withExactArgs("Disabled extended change detection for binding path '~resolvedPath';"
					+ " context data could not be serialized",
				sinon.match.same(oError), "~classname");
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");

		// code under test
		aResult = ClientListBinding.prototype.getContexts.call(oBinding, 3, 2, "~maxPrefetchSize");

		assert.strictEqual(aResult, aContexts);
		assert.deepEqual(oBinding.aLastContextData, undefined);
		assert.deepEqual(oBinding.aLastContexts, undefined);
		assert.strictEqual(oBinding.bUseExtendedChangeDetection, false);
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: bKeepCurrent = false", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				bUseExtendedChangeDetection : true
			};

		// code under test
		ClientListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			"~iMaximumPrefetchSize", /*bKeepCurrent*/false);

		assert.strictEqual(oBinding.iLastLength, "~length");
		assert.strictEqual(oBinding.iLastStartIndex, "~start");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: keep last start and last length", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				_checkKeepCurrentSupported : function () {}
			};

		this.mock(oBinding).expects("_checkKeepCurrentSupported")
			.withExactArgs("~iMaximumPrefetchSize");

		// code under test
		ClientListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			"~iMaximumPrefetchSize", /*bKeepCurrent*/true);

		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: throws error of _checkKeepCurrentSupported",
			function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				_checkKeepCurrentSupported : function () {}
			},
			oError = new Error("Foo");

		this.mock(oBinding).expects("_checkKeepCurrentSupported")
			.withExactArgs("~iMaximumPrefetchSize")
			.throws(oError);

		// code under test
		assert.throws(function () {
			ClientListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start",
				"~length", "~iMaximumPrefetchSize", /*bKeepCurrent*/true);
		}, oError);

		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
	});
});