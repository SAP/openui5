/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Messaging",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/message/Message",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/message/MessageListBinding"
], function (Log, Messaging, UI5Date, Message, ClientListBinding, JSONModel, MessageListBinding) {
	"use strict";

	QUnit.module("sap.ui.model.message.MessageListBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		afterEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
			Messaging.removeAllMessages();
		}
	});

	var oModel = new JSONModel();
	var createMessage = function(sText, sTarget, sType) {
		return new Message({
			target: sTarget || '/form/firstname',
			message: sText || "test message",
			processor: oModel,
			type: sType || "Error"
		});
	};


	QUnit.test("test MessageListBinding", function(assert) {
		var oModel = Messaging.getMessageModel();
		Messaging.addMessages(createMessage("mine", "rel1"));
		Messaging.addMessages(createMessage("two", "rel2"));
		Messaging.addMessages(createMessage("three", "rel3"));
		Messaging.addMessages(createMessage("for", "rel4"));
		Messaging.addMessages(createMessage("fiv", "rel5"));
		var oMessageListBinding = oModel.bindList("/");
		var aContexts = oMessageListBinding.getContexts(1, 3);
		assert.ok(aContexts);
		assert.equal(aContexts.length, 3);

	});


	QUnit.test("test MessageListBinding extended change detection", function(assert) {
		var done = assert.async();
		var oMessageManager = Messaging;
		oMessageManager.addMessages(createMessage("mine", "rel1"));
		oMessageManager.addMessages(createMessage("two", "rel2"));
		oMessageManager.addMessages(createMessage("three", "rel3"));
		oMessageManager.addMessages(createMessage("for", "rel4"));
		oMessageManager.addMessages(createMessage("for2", "rel4"));
		oMessageManager.addMessages(createMessage("for3", "rel4"));
		oMessageManager.addMessages(createMessage("for13", "rel4"));
		oMessageManager.addMessages(createMessage("for23", "rel4"));

		var oModel = oMessageManager.getMessageModel();
		var listBinding = oModel.bindList("/");
		listBinding.enableExtendedChangeDetection();


		var contexts = listBinding.getContexts(0, 5);
		assert.notOk(contexts.diff, "Delta information is initially not available");
		var currentContexts = listBinding.getCurrentContexts();

		assert.equal(contexts.length, 5, "contexts should contain 5 items");
		assert.deepEqual(currentContexts, contexts);

		oModel.getData()[3].setMessage("message12");
		oModel.getData()[5].setMessage("messa121");
		oModel.getData()[1].setDate(UI5Date.getInstance());
		oMessageManager.addMessages(createMessage("for323", "rel4"));

		var fnContextLengthChangedHandler = function(){
			listBinding.detachChange(fnContextLengthChangedHandler);
			currentContexts = listBinding.getCurrentContexts();
			assert.deepEqual(currentContexts, contexts, "current contexts not changed");

			contexts = listBinding.getContexts(0, 5);
			assert.equal(contexts.diff.length, 4,
				"Delta information is available, 2x delete and 2x insert");

			oModel.getData()[3].setMessage("newContent");
			var fnMessageDataChangedHandler = function(){
				listBinding.detachChange(fnMessageDataChangedHandler);
				oModel.getData()[3].setMessage("message12");
				var fnNoChangeHandler = function(){
					assert.ok(false, "Should not be called, since nothing changed.");
				};
				listBinding.attachChange(fnNoChangeHandler);
				listBinding.checkUpdate();
				setTimeout(function(){
					listBinding.detachChange(fnNoChangeHandler);
					done();
				}, 0);
			};
			listBinding.attachChange(fnMessageDataChangedHandler);
			listBinding.checkUpdate();

		};

		listBinding.attachChange(fnContextLengthChangedHandler);
		listBinding.checkUpdate();
	});

	//**********************************************************************************************
	QUnit.test("getContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(MessageListBinding.prototype.getContexts,
			ClientListBinding.prototype.getContexts);
	});

	//**********************************************************************************************
	QUnit.test("getCurrentContexts: implemented in ClientListBinding", function (assert) {
		assert.strictEqual(MessageListBinding.prototype.getCurrentContexts,
			ClientListBinding.prototype.getCurrentContexts);
	});
});