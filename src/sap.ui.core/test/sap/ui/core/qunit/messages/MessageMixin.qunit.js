sap.ui.define([
	"sap/base/Log",
	"sap/m/Input",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageMixin",
	"sap/ui/model/json/JSONModel"
], function (Log, Input, Messaging, Message, MessageMixin, JSONModel) {
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

	QUnit.test("MessageModel update must not refresh endless", function(assert) {
		const done = assert.async(),
			oInput1 = new Input({
				value: "{/value}"
			}),
			oInput2 = new Input({
				value: "{/value}"
			}),
			oModel = new JSONModel({value:"test"}),
			oMessage1 = new Message({
				message: "teste message1",
				processor: oModel,
				target: "/value"
			});
		let iChangeCount = 0;

		oInput1.setModel(oModel);
		oInput2.setModel(oModel);

		Messaging.addMessages([oMessage1]);
		const oMessageBinding = Messaging.getMessageModel().bindList("/");

		function fnChange() {
			assert.equal(oMessage1.getControlIds().length, 2, "Both control ids added to message");
			iChangeCount++;
			//enforce Message update
			oInput1.setModel(null);
			oInput1.setModel(oModel);
			setTimeout(function() {
				assert.equal(iChangeCount, 1, "Change event must only be called once");
				oMessageBinding.detachChange(fnChange);
				oInput1.destroy();
				oInput2.destroy();
				oModel.destroy();
				done();
			});
		}
		oMessageBinding.attachChange(fnChange);
	});
});