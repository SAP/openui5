/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ContextBinding"
], function (Log, ContextBinding) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.ContextBinding", {
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
	QUnit.test("getInterface().getBoundContext()", function (assert) {
		var oContextBinding = new ContextBinding({/*oModel*/}, "/"),
			oInterface = oContextBinding.getInterface();

		this.mock(oContextBinding).expects("getBoundContext")
			.withExactArgs()
			.returns("boundContext");

		// code under test
		assert.strictEqual(oInterface.getBoundContext(), "boundContext");
	});
});