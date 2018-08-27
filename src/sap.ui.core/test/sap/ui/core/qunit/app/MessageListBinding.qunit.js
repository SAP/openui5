/*global QUnit */
sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/message/Message"], function(JSONModel, Message) {
	"use strict";

	QUnit.module("sap/ui/model/message/MessageListBinding", {
		afterEach: function() {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},
		beforeEach: function() {
			sap.ui.getCore().getMessageManager().removeAllMessages();
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
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oModel = oMessageManager.getMessageModel();
		oMessageManager.addMessages(createMessage("mine", "rel1"));
		oMessageManager.addMessages(createMessage("two", "rel2"));
		oMessageManager.addMessages(createMessage("three", "rel3"));
		oMessageManager.addMessages(createMessage("for", "rel4"));
		oMessageManager.addMessages(createMessage("fiv", "rel5"));
		var oMessageListBinding = oModel.bindList("/");
		var aContexts = oMessageListBinding.getContexts(1, 3);
		assert.ok(aContexts);
		assert.equal(aContexts.length, 3);

	});


	QUnit.test("test MessageListBinding extended change detection", function(assert) {
		var done = assert.async();
		var oMessageManager = sap.ui.getCore().getMessageManager();
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
		assert.equal(currentContexts.length, 8, "Current contexts should contain 8 items");
		currentContexts.forEach(function(context, i) {
			assert.equal(context.getPath(), "/" + i, "ListBinding context");
		});

		oModel.getData()[3].setMessage("message12");
		oModel.getData()[5].setMessage("messa121");
		oModel.getData()[1].setDate(new Date());
		oMessageManager.addMessages(createMessage("for323", "rel4"));

		var fnContextLengthChangedHandler = function(){
			listBinding.detachChange(fnContextLengthChangedHandler);
			currentContexts = listBinding.getCurrentContexts();
			assert.equal(currentContexts.length, 9, "Current contexts should contain 9 items.");
			currentContexts.forEach(function(context, i) {
				assert.equal(context.getPath(), "/" + i, "ListBinding context");
			});
			contexts = listBinding.getContexts(0, 5);
			assert.equal(contexts.diff.length, 14, "Delta information is available");

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
});