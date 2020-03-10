/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ODataListBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataListBinding (ODataListBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[
	{transitionMessagesOnly : true, headers : {"sap-messages" : "transientOnly"}},
	{transitionMessagesOnly : false, headers : undefined}
].forEach(function (oFixture, i) {
	QUnit.test("loadData calls read w/ parameters refresh, headers, " + i, function (assert) {
		var oBinding,
			oContext = {},
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			},
			bRefresh = "{boolean} bRefresh";

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", sinon.match.same(oContext))
			.returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs();

		oBinding = new ODataListBinding(oModel, "path", oContext);

		this.mock(oModel).expects("resolve").withExactArgs("path", sinon.match.same(oContext))
			.returns("~path");
		oBinding.bSkipDataEvents = true;
		oBinding.bRefresh = bRefresh;
		oBinding.bTransitionMessagesOnly = oFixture.transitionMessagesOnly;

		this.mock(oModel).expects("read").withExactArgs("path", {
				headers : oFixture.headers,
				canonicalRequest : undefined,
				context : sinon.match.same(oContext),
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : bRefresh,
				urlParameters : ["~custom"]
			})
			.returns();

		// code under test
		oBinding.loadData();
	});
});

	//*********************************************************************************************
[
	{parameters : undefined, expected : false},
	{parameters : {}, expected : false},
	{parameters : {foo : "bar"}, expected : false},
	{parameters : {transitionMessagesOnly : false}, expected : false},
	{parameters : {transitionMessagesOnly : 0}, expected : false},
	{parameters : {transitionMessagesOnly : true}, expected : true},
	{parameters : {transitionMessagesOnly : {}}, expected : true}
].forEach(function (oFixture, i) {
	QUnit.test("constructor: parameter transitionMessagesOnly, " + i, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.bTransitionMessagesOnly, oFixture.expected);
	});
});

	//*********************************************************************************************
[{ // no data
	oIn : {aData : [], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 100, startIndex : 0}
}, { // data at the beginning
	oIn : {aData : [{iLength : 10, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 90, startIndex : 10}
}, { // data at the end
	oIn : {aData : [{iLength : 10, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 90, startIndex : 0}
}, { // data at the beginning and at the end
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 10, iStart : 90}],
		iLength : 100,
		iStart : 0,
		iThreshold : 0
	},
	oOut : {length : 80, startIndex : 10}
}, { // data in middle of the requested range
	oIn : {aData : [{iLength : 10, iStart : 30}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 100, startIndex : 0}
}, { // no data with threshold
	oIn : {aData : [], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 150, startIndex : 0}
}, { // data at the beginning with threshold
	oIn : {aData : [{iLength : 10, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 140, startIndex : 10}
}, { // data at the end of the requested range with threshold
	oIn : {aData : [{iLength : 10, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 150, startIndex : 0}
}, { // data at the end (requested range including threshold)
	oIn : {aData : [{iLength : 60, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 90, startIndex : 0}
}, { // data at the beginning and in the middle of the requested range with threshold
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 10, iStart : 90}],
		iLength : 100,
		iStart : 0,
		iThreshold : 50
	},
	oOut : {length : 140, startIndex : 10}
}, { // data at the beginning and at the end with threshold
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 20, iStart : 130}],
		iLength : 100,
		iStart : 0,
		iThreshold : 50
	},
	oOut : {length : 120, startIndex : 10}
}, { // prepend complete threshold
	oIn : {aData : [], iLength : 30, iStart : 80, iThreshold : 50},
	oOut : {length : 130, startIndex : 30}
}, { // prepend complete threshold start with 0
	oIn : {aData : [], iLength : 30, iStart : 40, iThreshold : 50},
	oOut : {length : 120, startIndex : 0}
}, { // read at most to final length
	oIn : {aData : [], iFinalLength : 80, iLength : 30, iStart : 20, iThreshold : 50},
	oOut : {length : 80, startIndex : 0}
}, { // read at least threshold data
	oIn : {aData : [{iLength : 120, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 50, startIndex : 120}
}, { // read at least threshold data start > threshold
	oIn : {aData : [{iLength : 60, iStart : 70}], iLength : 20, iStart : 70, iThreshold : 50},
	oOut : {length : 120, startIndex : 20}
}, { // only few entries missing at the beginning and the end
	oIn : {aData : [{iLength : 100, iStart : 30}], iLength : 20, iStart : 70, iThreshold : 50},
	oOut : {length : 120, startIndex : 20}
}, { // all data available
	oIn : {aData : [{iLength : 100, iStart : 0}], iLength : 20, iStart : 0, iThreshold : 50},
	oOut : {length : 0, startIndex : 70}
}, { // extend length because it is less than threshold but close the gap only
	oIn : {
		aData : [{iLength : 70, iStart : 0}, {iLength : 100, iStart : 90}],
		iLength : 20,
		iStart : 20,
		iThreshold : 50
	},
	oOut : {length : 20, startIndex : 70}
}, { // extend length because it is less than threshold; final length ignored
	oIn : {
		aData : [{iLength : 70, iStart : 0}],
		iFinalLength : 80,
		iLength : 20,
		iStart : 20,
		iThreshold : 50
	},
	oOut : {length : 50, startIndex : 70}
}].forEach(function (oFixture, i) {
	QUnit.test("calculateSection: #" + i, function (assert) {
		var oBinding = {
				aKeys : [],
				bLengthFinal : !!oFixture.oIn.iFinalLength,
				iLength : oFixture.oIn.iFinalLength
			},
			oResult;

		oFixture.oIn.aData.forEach(function (oAvailableData) {
			var i = oAvailableData.iStart,
				n = i + oAvailableData.iLength;

			for (; i < n; i += 1) {
				oBinding.aKeys[i] = "key" + i;
			}
		});

		// code under test
		oResult = ODataListBinding.prototype.calculateSection.call(oBinding, oFixture.oIn.iStart,
			oFixture.oIn.iLength, oFixture.oIn.iThreshold);

		assert.deepEqual(oResult, oFixture.oOut);
	});
});
});