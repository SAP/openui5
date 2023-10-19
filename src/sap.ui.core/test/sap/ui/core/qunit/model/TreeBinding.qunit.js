/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/TreeBinding"
], function (Log, TreeBinding) {
	"use strict";
	/*global QUnit */

	//*********************************************************************************************
	QUnit.module("sap.ui.core.model.TreeBinding", {
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
});