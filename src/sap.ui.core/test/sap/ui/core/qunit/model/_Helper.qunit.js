/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/base/util/deepEqual",
	"sap/base/util/extend",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/ui/model/_Helper"
], function (Log, encodeURL, deepEqual, extend, isPlainObject, merge, _Helper) {
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
		assert.strictEqual(_Helper.encodeURL, encodeURL);
		assert.strictEqual(_Helper.extend, extend);
		assert.strictEqual(_Helper.isPlainObject, isPlainObject);
		assert.strictEqual(_Helper.merge, merge);
	});

});