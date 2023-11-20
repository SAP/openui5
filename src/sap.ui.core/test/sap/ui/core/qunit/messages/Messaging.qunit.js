/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/message/Message",
	"sap/ui/core/Messaging",
	"sap/ui/model/message/MessageModel"
], function(URLConfigurationProvider, Message, Messaging, MessageModel) {
	/*global QUnit sinon */
	"use strict";

	var oURLConfigurationProviderStub;
	QUnit.module("sap/ui/core/message/MessageManager", {
		beforeEach : function () {
			// avoid attaching to validation events on UI5 core
			oURLConfigurationProviderStub = sinon.stub(URLConfigurationProvider, "get");
			oURLConfigurationProviderStub.callsFake(function(sKey) {
				return sKey === "sapUiXxHandleValidation" ? false : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
		},
		afterEach: () => oURLConfigurationProviderStub.restore()
	});

	var oProcessor = {getId : function () { return "id"; }, setMessages: function() {}},
		oProcessorOther = {getId : function () { return "otherId"; }, setMessages: function() {}},
		oMessage0 = new Message({
			processor : oProcessor,
			target : "target0"
		}),
		oMessage0a = new Message({
			processor : oProcessor,
			target : "target0"
		}),
		oMessage1 = new Message({
			processor : oProcessor,
			target : "target1"
		}),
		oMessageMulti = new Message({
			processor : oProcessor,
			target : ["target0", "target1"]
		}),
		oMessageOtherProcessor = new Message({
			processor : oProcessorOther,
			target : "targetOther"
		}),
		oMessageUnbound = new Message({
			processor : oProcessor
			//target : undefined
		});

	//*********************************************************************************************
[{ // initial message manager having no messages
	before : undefined,
	after :[],
	remove : oMessage0
}, { // message manager has just the to be deleted message for the target
	before : [oMessage0, oMessage1],
	after : [oMessage1],
	remove : oMessage0
}, { // message manager has more than the to be deleted message for the target
	before : [oMessage0, oMessage0a],
	after : [oMessage0a],
	remove : oMessage0
}, { // delete multi-target message from more than one target entry in the message manager
	before : [oMessage0, oMessageMulti, oMessageMulti],
	after : [oMessage0],
	remove : oMessageMulti
}, { // delete unbound message
	before :[oMessageUnbound],
	after : [],
	remove : oMessageUnbound
}].forEach(function (oFixture, i) {
	QUnit.test("_removeMessage, " + i, function (assert) {
		Messaging.removeAllMessages();
		if (oFixture.before) {
			Messaging.addMessages(oFixture.before);
		} else {
			assert.deepEqual(Messaging.getMessageModel().getData(), []);
		}

		// code under test
		Messaging.removeMessages(oFixture.remove);

		assert.deepEqual(Messaging.getMessageModel().getData(), oFixture.after);
	});
});

	//*********************************************************************************************
[{ // initial message manager having no messages
	add : oMessage0,
	before : [],
	after : [oMessage0]
}, { // message manager already has entry for processor
	add : oMessage0a,
	before : [oMessage0],
	after : [oMessage0, oMessage0a]
}, { // initial message manager having no messages, import multi-target message
	add : oMessageMulti,
	before : [],
	after : [oMessageMulti]
}, { // initial message manager having no messages, import unbound message
	add : oMessageUnbound,
	before : [],
	after : [oMessageUnbound]
}].forEach(function (oFixture, i) {
	QUnit.test("_importMessage, " + i, function (assert) {
		Messaging.removeAllMessages();
		Messaging.addMessages(oFixture.before);

		// code under test
		Messaging.addMessages(oFixture.add);

		assert.deepEqual(Messaging.getMessageModel().getData(), oFixture.after);
	});
});

	//*********************************************************************************************
	QUnit.test("_updateMessageModel", function (assert) {
		Messaging.removeAllMessages();
		var oModelSpy = this.spy(MessageModel.prototype, "setData");
		Messaging.addMessages([
			oMessageUnbound,
			oMessage0, oMessage0a, oMessageMulti,
			oMessage1, oMessageMulti,
			oMessageOtherProcessor
		]);

		assert.deepEqual(oModelSpy.getCall(0).args[0], [
			oMessageUnbound,
			oMessage0, oMessage0a, oMessageMulti,
			oMessage1,
			oMessageOtherProcessor
		]);
		oModelSpy.restore();
	});
});
