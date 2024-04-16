/*global QUnit, sinon */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/Messaging",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/model/FormatException",
	"sap/ui/model/Model",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/message/MessageModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/TestUtils"
], function(
	future,
	Log,
	coreLibrary,
	ControlMessageProcessor,
	Message,
	MessageType,
	Messaging,
	UIAreaRegistry,
	FormatException,
	Model,
	JSONModel,
	MessageModel,
	TypeInteger,
	TypeString,
	Input,
	Label,
	ODataMessageParser,
	createAndAppendDiv,
	TestUtils
) {
	"use strict";

	// create content div
	createAndAppendDiv("content");

	// shortcuts for enums from the sap.ui.core namespace
	var ValueState = coreLibrary.ValueState;

	var oModel;
	var oInput1, oInput2, oInput3, oInput4, oLabel1, oLabel2, oString, oInteger, oNrFormat, oStreet, oZip, oNr;
	var oControlProcessor;

	var oFakeMsgProcessor = {
		_getFunctionImportMetadata: function(){},
		_getReducedPath : function (sPath) {
			return sPath;
		},
		resolve: function(){},
		_isCollection: function(){return false;}
	};

	function createControls() {
		// create some control for testing
		oInput1 = new Input({value:"{path:'/form/firstname'}"});
		oInput2 = new Input({value:"{/form/lastname}"});
		oInput3 = new Input({value:"{path:'/form/firstname'}"});
		oInput4 = new Input({value:"{path:'/form/firstname'}"});

		oLabel1 = new Label({text: "First name"});
		oLabel1.setLabelFor(oInput1);

		oLabel2 = new Label({text: "Forename"});
		oLabel2.setLabelFor(oInput1);

		oString = new TypeString(null,{maxLength: 5});
		oInteger = new TypeInteger();
		oNrFormat = function(oValue) {
			if (typeof oValue === 'string') {
				throw new FormatException("Error");
			} else {
				return oValue;
			}
		};

		oZip = new Input({value:{path:'/form/zip', type: oInteger}});
		oStreet = new Input({value:{path:'/form/street', type: oString}});
		oNr = new Input({value:{path:'/form/nr', formatter: oNrFormat}});

		oInput1.placeAt("content");
		oInput2.placeAt("content");
		oInput3.placeAt("content");
		oInput4.placeAt("content");
		oZip.placeAt("content");
		oStreet.placeAt("content");
		oNr.placeAt("content");
	}

	function destroyControls() {
		oInput1.destroy();
		oInput2.destroy();
		oInput3.destroy();
		oInput4.destroy();
		oLabel1.destroy();
		oLabel2.destroy();
		oZip.destroy();
		oStreet.destroy();
		oNr.destroy();
	}

	function spyDataState(oControl, fnTest) {
		if (oControl.refreshDataState) {
			var fnRefresh = oControl.refreshDataState;
			oControl.refreshDataState = function(sName, oDataState) {
				Input.prototype.refreshDataState.apply(oControl, arguments);
				fnTest(sName, oDataState);
				oControl.refreshDataState = fnRefresh;
			};
		}
	}

	function spyPropagateMessages(oControl, fnTest) {
		if (oControl.propagateMessages) {
			var fnPropagate = oControl.propagateMessages;
			oControl.propagateMessages = function(sProp, aMessages) {
				fnTest(sProp, aMessages);
				oControl.propagateMessages = fnPropagate;
			};
		}
	}

	var createMessage = function(sText, sTarget, sType) {
		return new Message({
			target: sTarget || '/form/firstname',
			message: sText || "test message",
			processor: oModel,
			type: sType || MessageType.Error
		});
	};

	var createControlMessage = function(sText, sTarget, sType) {
		return new Message({
			target: sTarget || '/form/firstname',
			message: sText || "test message",
			processor: oControlProcessor,
			type: sType || MessageType.Error
		});
	};

	var initModel = function() {
		oModel = new JSONModel();
		var oData = {
			form: {
				firstname: "Fritz",
				lastname: "Heiner",
				street: "im",
				nr: 1,
				zip: "12345"
			}
		};
		oModel.setData(oData);
		createControls();
		UIAreaRegistry.get("content").setModel(oModel);
	};

	QUnit.module("Messaging", {
		beforeEach : function() {
			initModel();
			oControlProcessor = new ControlMessageProcessor();

			this.dataStateChanged = function(oBinding) {
				return new Promise((resolve, reject) => {
					function onDataStateChanged() {
						oBinding.detachAggregatedDataStateChange(onDataStateChanged);
						resolve(oBinding.getDataState().getChanges());
					}
					oBinding.attachAggregatedDataStateChange(onDataStateChanged);
				});
			};
		},

		afterEach : function() {
			destroyControls();
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("instanziation", function(assert) {
		var oMessageModel = Messaging.getMessageModel();
		assert.ok(oMessageModel instanceof MessageModel, 'MessageModel created');
		assert.equal(oMessageModel.getObject('/').length, 0, 'No Messages');
	});

	/**
	 * @deprecated
	 */
	QUnit.test("addMessage: propagateMessages not implemented (future=false)", function(assert) {
		future.active = false;
		const WarningLogSpy = sinon.spy(Log, "warning");
		const oTestInput = new Input("TESTID", {value:""});
		const oMessage = createControlMessage("TEST", oTestInput.getId() + "/value");
		const expectedMessage = "[FUTURE FATAL] Message for Element sap.m.Input#TESTID, Property value received. Control sap.m.Input does not support messaging without using data binding.";
		Messaging.addMessages(oMessage);
		assert.equal(WarningLogSpy.callCount, 1, "Warning logged");
		assert.equal(WarningLogSpy.getCall(0).args[0], expectedMessage, "Not Implemented text logged logged");
		future.active = undefined;
		Messaging.removeAllMessages();
		oTestInput.destroy();
	});

	QUnit.test("addMessage: propagateMessages not implemented (future=true)", function(assert) {
		future.active = true;
		const oTestInput = new Input("TESTID", {value:""});
		const oMessage = createControlMessage("TEST", oTestInput.getId() + "/value");
		const expectedMessage = "Message for Element sap.m.Input#TESTID, Property value received. Control sap.m.Input does not support messaging without using data binding.";
		assert.throws(() => {
			Messaging.addMessages(oMessage);
		}, new Error(expectedMessage));
		assert.throws(() => {
			Messaging.removeAllMessages();
		}, new Error(expectedMessage));
		oTestInput.destroy();
		future.active = undefined;
	});

	QUnit.test("addMessage", function(assert) {
		var done = assert.async();
		var oMessageModel = Messaging.getMessageModel();
		var oMessage = createMessage();
		spyDataState(oInput1, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 1, 'Message propagated to control');
				assert.ok(oInput1.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
				assert.ok(oInput1.getValueStateText() === 'test message', 'Input: ValueStateText set correctly');
				done();
			}
		);

		Messaging.addMessages(oMessage);
		assert.ok(Array.isArray(oMessageModel.getObject('/')), 'Message added to Model');
		assert.ok(oMessageModel.getObject('/').length === 1, 'MessageModel holds one Message');
		assert.ok(oMessageModel.getObject('/')[0] === oMessage, 'MessageModel: message instance ok');
	});

	QUnit.test("removeMessage", async function(assert) {
		const oMessageModel = Messaging.getMessageModel();
		const oMessage = createMessage();
		const oBinding = oInput1.getBinding("value");

		Messaging.addMessages(oMessage);
		await this.dataStateChanged(oBinding);

		Messaging.removeMessages(oMessage);
		assert.ok(oMessageModel.getObject('/').length == 0, 'No Messages in Model');
		await this.dataStateChanged(oBinding);

		const aMessages = oBinding.getDataState().getMessages();

		assert.ok(!aMessages || aMessages.length == 0, 'Message propagated to control - remove');
		assert.ok(oInput1.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oInput1.getValueStateText() === '', 'Input: ValueStateText set correctly');
	});

	QUnit.test("removeAllMessages", async function(assert) {
		const oMessageModel = Messaging.getMessageModel();
		const oMessage = createMessage('mt1','/form/lastname');
		const oMessage2 = createMessage('mt2');
		const oMessage3 = createMessage('mt3');

		Messaging.addMessages([oMessage,oMessage2,oMessage3]);
		assert.ok(Array.isArray(oMessageModel.getObject('/')), 'Message added to Model');
		assert.ok(oMessageModel.getObject('/').length === 3, 'MessageModel holds three Message');
		assert.equal(oMessageModel.getObject('/')[0].message,'mt1', 'MessageModel: message1 instance ok');
		assert.equal(oMessageModel.getObject('/')[1].message,'mt2', 'MessageModel: message2 instance ok');
		assert.equal(oMessageModel.getObject('/')[2].message,'mt3', 'MessageModel: message3 instance ok');

		const oBinding1 = oInput1.getBinding("value");
		const oBinding2 = oInput2.getBinding("value");
		const oDataState1 = oBinding1.getDataState();
		const oDataState2 = oBinding2.getDataState();

		await Promise.all([this.dataStateChanged(oBinding1), this.dataStateChanged(oBinding2)]);

		assert.ok(oDataState1.getMessages().length == 2, 'Message propagated to control - 2');
		assert.ok(oInput1.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.ok(oInput1.getValueStateText() === 'mt2', 'Input: ValueStateText set correctly');

		assert.ok(oDataState2.getMessages().length == 1, 'Message propagated to control - 1');
		assert.ok(oInput2.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.ok(oInput2.getValueStateText() === 'mt1', 'Input: ValueStateText set correctly');

		Messaging.removeAllMessages();
		await Promise.all([this.dataStateChanged(oBinding1), this.dataStateChanged(oBinding2)]);

		assert.ok(!oDataState1.getMessages() || oDataState1.getMessages().length == 0, 'Message propagated to control - remove');
		assert.ok(oInput1.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oInput1.getValueStateText() === '', 'Input: ValueStateText set correctly');

		assert.ok(!oDataState2.getMessages() || oDataState2.getMessages().length == 0, 'Message propagated to control - remove');
		assert.ok(oInput2.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oInput2.getValueStateText() === '', 'Input: ValueStateText set correctly');
	});

	QUnit.test("parseError", async function(assert) {
		const oBinding = oZip.getBinding("value");
		const oDataState = oBinding.getDataState();
		Messaging.registerObject(oZip, true);

		TestUtils.withNormalizedMessages(() => {
			oZip.setValue('bbb');
		});
		await this.dataStateChanged(oBinding);
		assert.ok(oDataState.getMessages().length == 1, 'ParseError Message propagated to control');
		assert.ok(oZip.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.equal(oZip.getValueStateText(), "EnterInt", 'Input: ValueStateText set correctly');

		oZip.setValue('123');
		await this.dataStateChanged(oBinding);

		assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
		assert.ok(oZip.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oZip.getValueStateText() === '', 'Input: ValueStateText set correctly');
		Messaging.unregisterObject(oZip);
	});

	QUnit.test("validationError", async function(assert) {
		const oBinding = oStreet.getBinding("value");
		const oDataState = oBinding.getDataState();
		Messaging.registerObject(oStreet, true);

		TestUtils.withNormalizedMessages(() => {
			oStreet.setValue('am Busche');
		});
		await this.dataStateChanged(oBinding);
		assert.ok(oDataState.getMessages().length == 1, 'Validation Message propagated to control');
		assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');

		oStreet.setValue('Busch');
		await this.dataStateChanged(oBinding);

		assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
		assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');
		Messaging.unregisterObject(oStreet);
	});

	QUnit.test("validationError - multiple input", async function(assert) {
		const oBinding = oStreet.getBinding("value");
		Messaging.registerObject(oStreet, true);

		TestUtils.withNormalizedMessages(() => {
			oStreet.setValue('am Busche');
		});
		await this.dataStateChanged(oBinding);
		assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');

		oStreet.setValue('Busch');
		await this.dataStateChanged(oBinding);
		assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');

		TestUtils.withNormalizedMessages(() => {
			oStreet.setValue('am Busche');
		});
		await this.dataStateChanged(oBinding);
		assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
		assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');

		oStreet.setValue('Busch');
		await this.dataStateChanged(oBinding);
		assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
		assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');
		Messaging.unregisterObject(oStreet);
	});

	QUnit.test("AdditionalText property on message for different labels", function(assert) {
		var done = assert.async();
		var oMessage = createMessage();

		spyDataState(oInput1, function(sName, oDataState) {
			var aMessages = oDataState.getMessages();
			assert.ok(aMessages[0].additionalText, "AdditionalText was added.");
			// InputBase takes
			assert.equal(aMessages[0].additionalText, "First name", "AdditionalText is set correctly.");
			done();
		});

		Messaging.addMessages(oMessage);
	});

	QUnit.test("AdditionalText property on message for more than one input field", function(assert) {
		var done = assert.async();
		var oMessage = createMessage();

		// third input field for the same property "firstname", this label is taken
		var oLabel3 = new Label({text: "Nickname"});
		oLabel3.setLabelFor(oInput3);

		spyDataState(oInput3, function(sName, oDataState) {
			var aMessages = oDataState.getMessages();
			assert.ok(aMessages[0].additionalText, "AdditionalText was added.");
			assert.equal(aMessages[0].additionalText, "Nickname", "AdditionalText is set correctly.");

			oLabel3.destroy();
			done();
		});

		Messaging.addMessages(oMessage);
	});

	QUnit.test("multiple addMessage with type 'Information' and 'Error'", function(assert) {
		var done = assert.async();

		var oMessageError = createMessage();
		var oMessageInfo = createMessage(undefined, undefined, "Information");

		// third input field for the same property "firstname", this label is taken
		var oLabel4 = new Label({text: "Nickname"});
		oLabel4.setLabelFor(oInput4);

		spyDataState(oInput4, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 2, 'Message propagated to control: 2');
				assert.ok(oInput1.getValueState() === ValueState.Error, 'Input: ValueState set correctly to Error, Information is ignored');

				oLabel4.destroy();
				done();
			}
		);

		// adding an Information type message should not break anymore
		Messaging.addMessages(oMessageInfo);
		Messaging.addMessages(oMessageError);
	});


	// Check mapping message type to value state
	Object.keys(MessageType).forEach(function(key){

		var sCheckedType = MessageType[key];
		QUnit.test("single addMessage with type '" + sCheckedType + "'", function(assert) {
			var done = assert.async();

			var oMessage = createMessage(undefined, undefined, sCheckedType);

			// third input field for the same property "firstname", this label is taken
			var oLabel4 = new Label({text: "Nickname"});
			oLabel4.setLabelFor(oInput4);

			spyDataState(oInput4, function(sName, oDataState) {
					assert.ok(oDataState.getMessages().length == 1, 'Message propagated to control: 1');
					assert.ok(oInput1.getValueState() === ValueState[sCheckedType], 'Input: ValueState is ' + ValueState[sCheckedType]);
					oLabel4.destroy();
					done();
				}
			);

			// adding an Information type message should not break anymore
			Messaging.addMessages(oMessage);
		});
	});

	QUnit.test("Control Message target", function(assert) {
		var done = assert.async();
		var oTestInput = new Input({value:""});
		oTestInput.placeAt("content");
		var sControlId = oTestInput.getId();
		var oMessage = createControlMessage("TEST", sControlId + "/value");

		spyPropagateMessages(oTestInput, function(sProp, aMessages) {
			assert.ok(aMessages[0], "Message was added.");
			// InputBase takes
			assert.equal(aMessages[0].message, "TEST", "Message text is set correctly.");
			oTestInput.destroy();
			done();
		});

		Messaging.addMessages(oMessage);
	});

	QUnit.test("Update when adding control id and removing control id", function(assert) {
		var count = 0;
		var done = assert.async();
		Messaging.removeAllMessages();
		var oTestInput = new Input({value:"{/}"});
		oTestInput.placeAt("content");
		var sControlId = oTestInput.getId();
		var oMessage = createControlMessage("TEST", "/" + sControlId + "/value");

		var oBinding = Messaging.getMessageModel().bindProperty("/0/controlIds");
		var fnChange = function(oEvent) {
			count++;
			if (count === 1) {
				assert.equal(oBinding.getValue().length, 0);
			} else if (count === 2) {
				assert.equal(oBinding.getValue().length, 1);
			} else if (count === 3) {
				assert.equal(oBinding.getValue().length, 0);
				done();
			}
		};
		Messaging.addMessages(oMessage);
		oBinding.attachChange(fnChange);
		oBinding.checkUpdate();
		oMessage.addControlId("/" + sControlId + "/value");
		oBinding.checkUpdate();
		oMessage.removeControlId("/" + sControlId + "/value");
		oBinding.checkUpdate();
	});

	QUnit.test("Control Id", function(assert) {
		var done = assert.async();
		var oTestInput = new Input({value:""});
		oTestInput.placeAt("content");
		var sControlId = oTestInput.getId();
		var oMessage = createControlMessage("TEST", "/" + sControlId + "/value");

		spyPropagateMessages(oTestInput, function(sProp, aMessages) {
			assert.ok(aMessages[0], "Message was added.");
			// InputBase takes
			assert.equal(aMessages[0].message, "TEST", "Message text is set correctly.");
			oTestInput.destroy();
			done();
		});

		Messaging.addMessages(oMessage);
	});



	QUnit.test("Message parsing: Not filtering duplicates with messages in response header", function(assert){
		var aMessages,
			oOdataMessageParser = new ODataMessageParser("fakeService", oFakeMsgProcessor),
			oResponse = {
				headers: {
					"sap-message" : '{' +
						'"code": "ABC",' +
						'"message": "This is a duplicate message.",' +
						'"target": "",' +
						'"details": [{' +
							'"code": "ABC",' +
							'"message": "This is non duplicate message."' +
							'}, {' +
							'"code": "ABC",' +
							'"message": "This is a duplicate message."' +
							'}]' +
						'}'
				}
			};

		oOdataMessageParser.setProcessor({resolve : function(){}});
		aMessages = oOdataMessageParser._parseHeader(oResponse,
			{url: "myurl", request : {headers : {}}, response: oResponse});
		assert.equal(aMessages.length, 3, "Duplicate messages is ignored.");

	});

	QUnit.test("Message parsing: Filter out duplicates with messages in response body", function(assert){
		var aMessages,
			oOdataMessageParser = new ODataMessageParser("fakeService", oFakeMsgProcessor),
			oResponse = {
				body: '\
<?xml version="1.0" encoding="utf-8"?>\
<error xmlns="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
	<code>ABC</code>\
	<message xml:lang="en">I am a duplicate.</message>\
	<innererror>\
		<transactionid>55025622675C2E69E10000000A4450F0</transactionid>\
		<timestamp>20150318080838.2106030</timestamp>\
		<errordetails>\
			<errordetail>\
				<code>ABC2</code>\
				<message>I am not a duplicate.</message>\
			</errordetail>\
			<errordetail>\
				<code>ABC</code>\
				<message>I am a duplicate.</message>\
			</errordetail>\
		</errordetails>\
	</innererror>\
</error>',
				headers : {
					"content-type": "text/xml"
				}
			};

		oOdataMessageParser.setProcessor({resolve : function(){}});
		aMessages = oOdataMessageParser._parseBody(oResponse,
			{url: "myurl", request : {headers : {}}, response: oResponse});
		assert.equal(aMessages.length, 2, "Duplicate messages is ignored.");
	});


	QUnit.module("Bugfixes", {
		beforeEach() {
			this.dataStateChanged = function(oBinding) {
				return new Promise((resolve, reject) => {
					function onDataStateChanged() {
						oBinding.detachAggregatedDataStateChange(onDataStateChanged);
						resolve(oBinding.getDataState().getChanges());
					}
					oBinding.attachAggregatedDataStateChange(onDataStateChanged);
				});
			};
		}
	});

	QUnit.test("Messaging: Message sorting", async function(assert) {
		assert.expect(3);
		const aCorrectOrder = [ MessageType.Error, MessageType.Error, MessageType.Warning, MessageType.Success, MessageType.Information ];

		const oModel = new JSONModel();
		const oInput = new Input({
			value: "{/test}"
		});
		oInput.setModel(oModel);
		Messaging.registerObject(oInput);

		const oBinding = oInput.getBinding("value");
		const aMessages = [ new Message({
			type: MessageType.Information,
			id: "test-info",
			processor: oModel,
			target: "/test"
		}), new Message({
			type: MessageType.Warning,
			id: "test-warning",
			processor: oModel,
			target: "/test"
		}), new Message({
			type: MessageType.Error,
			id: "test-error1",
			processor: oModel,
			target: "/test"
		}), new Message({
			type: MessageType.Success,
			id: "test-success",
			processor: oModel,
			target: "/test"
		}), new Message({
			type: MessageType.Error,
			id: "test-error2",
			processor: oModel,
			target: "/test"
		})];

		// CHeck direct call to private method
		let aMessageCopy = aMessages.slice(0);
		const oModelSpy = this.spy(oModel, "setMessages");
		Messaging.addMessages(aMessageCopy);
		aMessageCopy = oModelSpy.getCall(0).args[0]["/test"];
		const aNewOrder = aMessageCopy.map(function(oM) { return oM.type; });
		assert.deepEqual(aNewOrder, aCorrectOrder, "Sorted messages are in the correct order (Highest severity first)");
		oModelSpy.restore();

		Messaging.removeAllMessages();
		let bCorrectOrder = false;
		oInput.refreshDataState = function(sName, oDataState) {
			const aPropagatedMessages = oDataState.getMessages();
			const aNewOrder = aPropagatedMessages.map(function(oM) { return oM.type; });

			bCorrectOrder = JSON.stringify(aNewOrder) == JSON.stringify(aCorrectOrder);
		};

		Messaging.addMessages(aMessages);
		assert.ok(!bCorrectOrder, "Messages have not been propagated synchronously");

		await this.dataStateChanged(oBinding);

		assert.ok(bCorrectOrder, "Messages have been propagated asynchronously and are correctly sorted");
		Messaging.removeMessages(aMessages);
		oInput.destroy();
	});

	QUnit.test("Message: Change Message Processor", async function(assert) {
		assert.expect(4);

		const oModel = new JSONModel();
		const oInput = new Input("inputField01", {
			value: "{/test}"
		});

		spyPropagateMessages(oInput, () => {});

		oInput.setModel(oModel);
		Messaging.registerObject(oInput);

		Messaging.addMessages(new Message({
			type: MessageType.Information,
			id: "test-info",
			processor: oModel,
			target: "/test"
		}));

		const oBinding = oInput.getBinding("value");
		await this.dataStateChanged(oBinding);

		let aMessages = oInput.getBinding("value").getDataState().getMessages();
		assert.equal(aMessages.length, 1, "The message was propagated through the binding");
		assert.ok(aMessages[0].getMessageProcessor() instanceof Model, "The message is processed by a model");

		const oMessage = aMessages[0];
		Messaging.removeMessages(oMessage);
		oMessage.setMessageProcessor(new ControlMessageProcessor());
		oMessage.setTargets(["inputField01/test"]);
		Messaging.addMessages(oMessage);

		await this.dataStateChanged(oBinding);

		aMessages = oInput.getBinding("value").getDataState().getMessages();
		assert.equal(aMessages.length, 0, "The message was not propagated through the binding");
		assert.ok(oMessage.getMessageProcessor() instanceof ControlMessageProcessor, "The message is processed by the ControlMessageProcessor");

		oInput.destroy();
		Messaging.removeMessages(oMessage);

	});

});
