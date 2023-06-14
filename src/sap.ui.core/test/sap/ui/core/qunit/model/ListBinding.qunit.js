/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Filter",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Sorter"
], function (Log, Filter, ListBinding, Sorter) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.ListBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oBinding = new ListBinding("~oModel", "~sPath", "~oContext", [], [], "~mParameters");

		// test propagation to base class constructor
		assert.strictEqual(oBinding.getModel(), "~oModel");
		assert.strictEqual(oBinding.getPath(), "~sPath");
		assert.strictEqual(oBinding.getContext(), "~oContext");
		assert.strictEqual(oBinding.mParameters, "~mParameters");

		assert.deepEqual(oBinding.aFilters, []);
		assert.strictEqual(oBinding.oCombinedFilter, null);
		assert.strictEqual(oBinding.bUseExtendedChangeDetection, false);
		assert.strictEqual(oBinding.bDetectUpdates, true);
		assert.ok(oBinding.hasOwnProperty("oExtendedChangeDetectionConfig"));
		assert.strictEqual(oBinding.oExtendedChangeDetectionConfig, undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor, sorters", function (assert) {
		var aSorters = ["~sorter"],
			// code under test
			oBinding = new ListBinding("~oModel", "~sPath", "~oContext", aSorters);

		assert.strictEqual(oBinding.aSorters, aSorters, "sorter: any array is kept as is");

		var oSorter = new Sorter("~sorterPath");

		// code under test
		oBinding = new ListBinding("~oModel", "~sPath", "~oContext", oSorter);

		assert.deepEqual(oBinding.aSorters, [oSorter], "sorter: single Sorter is put into array");

		// code under test
		oBinding = new ListBinding("~oModel", "~sPath", "~oContext", "~noSorter");

		assert.deepEqual(oBinding.aSorters, [], "sorter: non-Sorter object");
	});

	//*********************************************************************************************
	QUnit.test("constructor, application filters", function (assert) {
		var aApplicationFilters = ["~filter"],
			// code under test
			oBinding = new ListBinding("~oModel", "~sPath", "~oContext", undefined, aApplicationFilters);

		assert.strictEqual(oBinding.aApplicationFilters, aApplicationFilters, "filter: any array is kept as is");

		var oFilter = new Filter({path: "~filterPath", test : function () {}});

		// code under test
		oBinding = new ListBinding("~oModel", "~sPath", "~oContext", undefined, oFilter);

		assert.deepEqual(oBinding.aApplicationFilters, [oFilter], "filter: single Filter is put into array");

		// code under test
		oBinding = new ListBinding("~oModel", "~sPath", "~oContext", undefined, "~noFilter");

		assert.deepEqual(oBinding.aApplicationFilters, [], "filter: non-Filter object");
	});

	//*********************************************************************************************
[{
	iMaximumPrefetchSize : 2,
	bUseExtendedChangeDetection : false,
	sExpectedError : "Unsupported operation: ~foo#getContexts, must not use both"
		+ " iMaximumPrefetchSize and bKeepCurrent"
} , {
	iMaximumPrefetchSize : 0,
	bUseExtendedChangeDetection : true,
	sExpectedError : "Unsupported operation: ~foo#getContexts, must not use bKeepCurrent if"
		+ " extended change detection is enabled"
}].forEach(function (oFixture, i) {
	QUnit.test("_checkKeepCurrentSupported: error cases, #" + i, function (assert) {
		var oBinding = {
				bUseExtendedChangeDetection : oFixture.bUseExtendedChangeDetection,
				getMetadata : function () {}
			},
			oMetadata = {getName : function () {}};

		this.mock(oBinding).expects("getMetadata").withExactArgs().returns(oMetadata);
		this.mock(oMetadata).expects("getName").withExactArgs().returns("~foo");

		// code under test
		assert.throws(function () {
			ListBinding.prototype._checkKeepCurrentSupported.call(oBinding,
				oFixture.iMaximumPrefetchSize);
		}, new Error(oFixture.sExpectedError));
	});
});
});