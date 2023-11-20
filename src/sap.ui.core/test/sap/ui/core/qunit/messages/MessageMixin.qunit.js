sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/message/MessageMixin"
], function (Log, MessageMixin) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.core.message.MessageMixin", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("destroy", function(assert) {
		var oExpectDestroy, oExpectRemoveControlId,
			oBinding1 = {getDataState : function () {}},
			oBinding2 = {getDataState : function () {}},
			oControl = {
				mBindingInfos : {
					"~binding0" : {},
					"~binding1" : {binding : oBinding1},
					"~binding2" : {binding : oBinding2}
				},
				destroy : function () {},
				getId : function () {}
			},
			oDataState1 = {getAllMessages : function () {}},
			oDataState2 = {getAllMessages : function () {}},
			oMessage0 = {removeControlId : function () {}},
			oMessage1 = {removeControlId : function () {}},
			oMessage2 = {removeControlId : function () {}};


		oExpectDestroy = this.mock(oControl).expects("destroy")
			.on(oControl)
			.withExactArgs("~any", "~parameters");

		// apply message mixin
		MessageMixin.call(oControl);

		this.mock(oControl).expects("getId").withExactArgs().returns("~id");
		this.mock(oBinding1).expects("getDataState").withExactArgs().returns(oDataState1);
		this.mock(oDataState1).expects("getAllMessages")
			.withExactArgs()
			.returns([oMessage0, oMessage1]);
		this.mock(oMessage0).expects("removeControlId").withExactArgs("~id");
		this.mock(oMessage1).expects("removeControlId").withExactArgs("~id");
		this.mock(oBinding2).expects("getDataState").withExactArgs().returns(oDataState2);
		this.mock(oDataState2).expects("getAllMessages").withExactArgs().returns([oMessage2]);
		oExpectRemoveControlId = this.mock(oMessage2).expects("removeControlId")
			.withExactArgs("~id");

		// code under test
		oControl.destroy("~any", "~parameters");

		assert.ok(oExpectDestroy.calledAfter(oExpectRemoveControlId));
	});
});