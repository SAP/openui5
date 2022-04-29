/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/extend",
	"sap/base/util/merge",
	"sap/ui/model/_Helper"
], function (Log, deepEqual, extend, merge, _Helper) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model._Helper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("trampoline properties", function (assert) {
		assert.strictEqual(_Helper.deepEqual, deepEqual);
		assert.strictEqual(_Helper.extend, extend);
		assert.strictEqual(_Helper.merge, merge);
	});

});