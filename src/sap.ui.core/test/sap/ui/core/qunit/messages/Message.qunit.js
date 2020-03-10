/*global QUnit */
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageProcessor'
], function(coreLibrary, Message, MessageProcessor) {
	/*eslint max-nested-callbacks: 0 */
	"use strict";

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

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
		assert.ok(oMessage.type === MessageType.None, "Property 'type' has expected value");
	});


	QUnit.test("Create message with all properties", function(assert) {

		// Arrange
		var mParameters = {
			id: "Test id",
			message: "Test message",
			description: "Test description",
			type: MessageType.Error,
			date: new Date(),
			additionalText: "test",
			code: 123,
			target: "123",
			persistent: true,
			technical: true,
			technicalDetails: {foo: 'bar'},
			descriptionUrl: "url",
			references: {
				"test": 123
			},
			processor: new MessageProcessor(),
			validation: true,
			controlIds: [],
			fullTarget: ""
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

	QUnit.test("Create message:  getTechnicalDetails", function(assert) {
		var oMessage,
			oTechnicalDetails = {foo: 'bar'};

		oMessage = new Message({technicalDetails: oTechnicalDetails});

		assert.strictEqual(oMessage.getTechnicalDetails(), oTechnicalDetails);
	});

	QUnit.test("Create message: setTechnicalDetails", function(assert) {
		var oTechnicalDetails = {foo: 'bar'},
			oTechnicalDetails2 = {bar: 'foo'},
			oMessage = new Message({technicalDetails: oTechnicalDetails});

		oMessage.setTechnicalDetails(oTechnicalDetails2);

		assert.strictEqual(oMessage.getTechnicalDetails(), oTechnicalDetails2);
	});

[
	MessageType.Error,
	MessageType.Warning,
	MessageType.Success,
	MessageType.Information,
	MessageType.None
].forEach(function (sType0, i0, aTypes) {
	var oMessage0 = new Message({type : sType0});

	QUnit.test("compare " + sType0 + " with unknown", function (assert) {
		var oMessageUnknown = new Message({type : "unknown"});

		// code under test
		assert.ok(isNaN(Message.compare(oMessage0, oMessageUnknown)));
		assert.ok(isNaN(Message.compare(oMessageUnknown, oMessage0)));
	});
	aTypes.forEach(function (sType1, i1) {
		QUnit.test("compare " + sType0 + " with " + sType1, function (assert) {
			var oMessage1 = new Message({type : sType1}),
				iResult;

			// code under test
			iResult = Message.compare(oMessage0, oMessage1);

			if (sType0 === sType1) {
				assert.strictEqual(iResult, 0);
			} else if (i0 < i1) {
				assert.ok(iResult < 0);
			} else {
				assert.ok(iResult > 0);
			}
		});
	});
});
});
