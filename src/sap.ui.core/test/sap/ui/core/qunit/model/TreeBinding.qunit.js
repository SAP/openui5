/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Filter",
	"sap/ui/model/TreeBinding"
], function (Log, Filter, TreeBinding) {
	"use strict";
	/*global QUnit, sinon */

	//*********************************************************************************************
	QUnit.module("sap.ui.model.TreeBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("getCount: default", function (assert) {
		// code under test
		assert.strictEqual(TreeBinding.prototype.getCount.call(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor, application filters", function (assert) {
		const aApplicationFilters = ["~filter"];
		let oBinding;
		const oFilterMock = this.mock(Filter);
		oFilterMock.expects("checkFilterNone").withExactArgs(sinon.match.same(aApplicationFilters));

		// code under test
		oBinding = new TreeBinding("~oModel", "~sPath", "~oContext", aApplicationFilters);

		assert.strictEqual(oBinding.aApplicationFilters, aApplicationFilters, "filter: any array is kept as is");

		const oFilter = new Filter({path: "~filterPath", test : function () {}});
		oFilterMock.expects("checkFilterNone").withExactArgs(sinon.match.same(oFilter));

		// code under test
		oBinding = new TreeBinding("~oModel", "~sPath", "~oContext", oFilter);

		assert.deepEqual(oBinding.aApplicationFilters, [oFilter], "filter: single Filter is put into array");

		oFilterMock.expects("checkFilterNone").withExactArgs("~noFilter");

		// code under test
		oBinding = new TreeBinding("~oModel", "~sPath", "~oContext", "~noFilter");

		assert.deepEqual(oBinding.aApplicationFilters, [], "filter: non-Filter object");

		const oError = new Error("~Filter.NONE error");
		oFilterMock.expects("checkFilterNone").withExactArgs("~invalidFilter").throws(oError);

		// code under test
		assert.throws(() => {
			oBinding = new TreeBinding("~oModel", "~sPath", "~oContext", "~invalidFilter");
		}, oError);
	});
});