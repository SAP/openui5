sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/CompositeDataState"
], function (Log, CompositeDataState) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.CompositeDataState", {
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
	QUnit.test("getAllMessages", function(assert) {
		var oDataState0 = {getAllMessages : function () {}},
			oDataState1 = {getAllMessages : function () {}},
			oDataState2 = {getAllMessages : function () {}},
			oCompositeDataState = new CompositeDataState([oDataState0, oDataState1, oDataState2]);

		this.mock(oDataState0).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg0", "~msg1"]);
		this.mock(oDataState1).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg1", "~msg2"]);
		this.mock(oDataState2).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg3", "~msg0"]);

		// code under test
		assert.deepEqual(oCompositeDataState.getAllMessages(),
			["~msg0", "~msg1", "~msg2", "~msg3"]);
	});
});