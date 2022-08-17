/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageManager"
], function(Configuration, Message, MessageManager) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap/ui/core/message/MessageManager", {
		beforeEach : function () {
			// avoid attaching to validation events on UI5 core
			this.stub(Configuration, "getHandleValidation").returns(false);
			this.oMessageManager = new MessageManager();
		}
	});

	var oProcessor = {getId : function () { return "id"; }},
		oProcessorOther = {getId : function () { return "otherId"; }},
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
	after : {},
	remove : oMessage0
}, { // message manager has just the to be deleted message for the target
	before : {id : {target0 : [oMessage0], target1 : [oMessage1]}},
	after : {id : {target1 : [oMessage1]}},
	remove : oMessage0
}, { // message manager has more than the to be deleted message for the target
	before : {id : {target0 : [oMessage0, oMessage0a]}},
	after : {id : {target0 : [oMessage0a]}},
	remove : oMessage0
}, { // delete multi-target message from more than one target entry in the message manager
	before : {id : {target0 : [oMessage0, oMessageMulti], target1 : [oMessageMulti]}},
	after : {id : {target0 : [oMessage0]}},
	remove : oMessageMulti
}, { // delete unbound message
	before : {id : {undefined : [oMessageUnbound]}},
	after : {id : {}},
	remove : oMessageUnbound
}].forEach(function (oFixture, i) {
	QUnit.test("_removeMessage, " + i, function (assert) {
		if (oFixture.before) {
			this.oMessageManager.mMessages = oFixture.before;
		} else {
			assert.deepEqual(this.oMessageManager.mMessages, {});
		}

		// code under test
		this.oMessageManager._removeMessage(oFixture.remove);

		assert.deepEqual(this.oMessageManager.mMessages, oFixture.after);
	});
});

	//*********************************************************************************************
[{ // initial message manager having no messages
	add : oMessage0,
	before : {},
	after : {id : {target0 : [oMessage0]}}
}, { // message manager already has entry for processor
	add : oMessage0a,
	before : {id : {target0 : [oMessage0]}},
	after : {id : {target0 : [oMessage0, oMessage0a]}}
}, { // initial message manager having no messages, import multi-target message
	add : oMessageMulti,
	before : {},
	after : {id : {target0 : [oMessageMulti], target1 : [oMessageMulti]}}
}, { // initial message manager having no messages, import unbound message
	add : oMessageUnbound,
	before : {},
	after : {id : {undefined : [oMessageUnbound]}}
}].forEach(function (oFixture, i) {
	QUnit.test("_importMessage, " + i, function (assert) {
		this.oMessageManager.mMessages = oFixture.before;

		// code under test
		this.oMessageManager._importMessage(oFixture.add);

		assert.deepEqual(this.oMessageManager.mMessages, oFixture.after);
	});
});

	//*********************************************************************************************
	QUnit.test("_updateMessageModel", function (assert) {
		var oMessageManagerMock = this.mock(this.oMessageManager),
			oMessageModel = {setData : function () {}};

		oMessageManagerMock.expects("getMessageModel").returns(oMessageModel);
		oMessageManagerMock.expects("_pushMessages").withExactArgs("mProcessors");
		this.mock(oMessageModel).expects("setData")
			.withExactArgs([oMessageUnbound, oMessage0, oMessage0a, oMessageMulti, oMessage1,
				oMessageOtherProcessor]);
		this.oMessageManager.mMessages = {
			id : {
				undefined : [oMessageUnbound],
				target0 : [oMessage0, oMessage0a, oMessageMulti],
				target1 : [oMessage1, oMessageMulti]
			},
			otherId : {
				targetOther : [oMessageOtherProcessor]
			}
		};

		// code under test
		this.oMessageManager._updateMessageModel("mProcessors");
	});
});
