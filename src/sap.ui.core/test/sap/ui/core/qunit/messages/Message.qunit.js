/*global QUnit */
sap.ui.define([
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageProcessor'
], function(Message, MessageProcessor) {
	"use strict";

	QUnit.module("sap/ui/core/message/Message");


	QUnit.test("Create message without any parameter - Check default values", function(assert) {

		// Arrange
		var date = Date.now();

		// Act
		var oMessage = new Message();

		// Assert
		assert.ok(oMessage, "Object successfully created");
		assert.ok(oMessage instanceof Message, "Object has expected Data Type");
		assert.deepEqual(oMessage.persistent, false, "Property 'persistent' has expected value");
		assert.deepEqual(oMessage.technical, false, "Property 'technical' has expected value");
		assert.ok(typeof oMessage.date === "number", "Property 'date' has expected Data Type");
		assert.ok(oMessage.date >= date, "Property 'date' has expected value");
		assert.ok(oMessage.type === sap.ui.core.MessageType.None, "Property 'type' has expected value");
	});


	QUnit.test("Create message with all properties", function(assert) {

		// Arrange
		var mParameters = {
			id: "Test id",
			message: "Test message",
			description: "Test description",
			type: sap.ui.core.MessageType.Error,
			date: new Date(),
			additionalText: "test",
			code: 123,
			target: "123",
			persistent: true,
			technical: true,
			descriptionUrl: "http://description.de",
			references: {
				"test": 123
			},
			processor: new MessageProcessor(),
			validation: true,
			controlIds: []
		};

		// Act
		var oMessage = new Message(mParameters);

		// Assert
		var oMessageValues = {};
		for (var i in oMessage){
			if (typeof oMessage[i] !== 'function'){
				oMessageValues[i] = oMessage[i];
			}
		}
		assert.ok(oMessage, "Object successfully created.");
		assert.ok(oMessage instanceof Message, "Object has expected Data Type.");
		assert.deepEqual(oMessageValues, mParameters, "Properties set correctly.");
	});
});